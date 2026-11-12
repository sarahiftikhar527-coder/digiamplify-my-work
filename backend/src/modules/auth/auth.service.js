import crypto from 'node:crypto'
import ApiError from '../../utils/ApiError.js'
import { sendEmail } from '../../utils/mailer.js'
import { env } from '../../config/env.js'
import User from '../../models/User.js'
import Notification from '../../models/Notification.js'
import RefreshToken from '../../models/RefreshToken.js'
import { ROLES } from '../../constants/roles.js'
import { comparePassword, hashPassword } from '../../utils/password.js'
import {
  generateRefreshToken, hashToken, signAccessToken,
} from '../../utils/jwt.js'

// Account status values used by the signup approval flow.
export const USER_STATUS = Object.freeze({
  PENDING: 'pending',
  ACTIVE: 'active',
  REJECTED: 'rejected',
  INACTIVE: 'inactive',
})

// Never send hashes or reset tokens to the client.
export function toPublicUser(user) {
  if (!user) return user
  const plain = typeof user.toJSON === 'function' ? user.toJSON() : { ...user }
  delete plain.passwordHash
  delete plain.pinHash
  delete plain.pinResetTokenHash
  delete plain.pinResetExpires
  delete plain.passwordResetTokenHash
  delete plain.passwordResetExpires
  return plain
}

async function issueTokens(user) {
  const refreshToken = generateRefreshToken()
  await RefreshToken.create({
    user: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_EXPIRES_DAYS * 86400000),
  })
  return { accessToken: signAccessToken(user), refreshToken }
}

// Tells every active admin that a new signup request is waiting.
// Best effort only: a notification problem must never break the signup.
async function notifyAdminsOfSignup(name, email) {
  try {
    const admins = await User.find({
      role: ROLES.ADMIN,
      status: USER_STATUS.ACTIVE,
      isDeleted: false,
    })

    let emitToUser = null
    try {
      // Loaded lazily to avoid circular imports at startup.
      ;({ emitToUser } = await import('../../sockets/index.js'))
    } catch {
      emitToUser = null
    }

    for (const admin of admins) {
      const doc = await Notification.create({
        to: admin.id,
        type: 'employee',
        tag: 'HR & Admin',
        title: 'New signup request',
        message: `${name} (${email}) is waiting for your approval.`,
        details: 'Open Signup Approvals to approve or decline this employee.',
        link: '/admin/approvals',
        linkLabel: 'Review Request',
        read: false,
      })

      if (emitToUser) {
        try {
          emitToUser(String(admin.id), 'notification:new', doc.toJSON())
        } catch {
          // Socket server may not be running (for example in tests).
        }
      }
    }
  } catch (err) {
    console.error('Signup notification failed:', err?.message || err)
  }
}

// Public signup: creates a PENDING employee. No tokens are issued here.
export async function register({ name, email, password, pin }) {
  const cleanEmail = String(email).trim().toLowerCase()
  const cleanName = String(name).trim()

  const existing = await User.findOne({ email: cleanEmail })

  if (existing) {
    if (existing.status === USER_STATUS.PENDING) {
      throw new ApiError(409, 'A signup request for this email is already waiting for admin approval.')
    }

    // A declined employee may apply again: reuse the same record.
    const canReapply =
      existing.status === USER_STATUS.REJECTED &&
      existing.role === ROLES.EMPLOYEE &&
      !existing.isDeleted

    if (!canReapply) {
      throw new ApiError(409, 'An account with this email already exists.')
    }

    await User.findByIdAndUpdate(existing.id, {
      name: cleanName,
      passwordHash: await hashPassword(password),
      pinHash: await hashPassword(pin),
      status: USER_STATUS.PENDING,
    })
    await notifyAdminsOfSignup(cleanName, cleanEmail)
    return { status: USER_STATUS.PENDING }
  }

  await User.create({
    name: cleanName,
    email: cleanEmail,
    passwordHash: await hashPassword(password),
    pinHash: await hashPassword(pin),
    role: ROLES.EMPLOYEE,
    status: USER_STATUS.PENDING,
    isDeleted: false,
  })

  await notifyAdminsOfSignup(cleanName, cleanEmail)

  return { status: USER_STATUS.PENDING }
}

export async function login(email, password) {
  const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false })
    .select('+passwordHash')

  if (!user || !(await comparePassword(password, user.passwordHash))) {
    throw new ApiError(401, 'Invalid email or password')
  }

  // Status is checked only AFTER the password is correct.
  if (user.status === USER_STATUS.PENDING) {
    throw new ApiError(403, 'Your account is waiting for admin approval. Please try again after it is approved.')
  }
  if (user.status === USER_STATUS.REJECTED) {
    throw new ApiError(403, 'Your signup request was declined by the admin. Please contact your administrator.')
  }
  if (user.status !== USER_STATUS.ACTIVE) throw new ApiError(403, 'Account is inactive')

  const tokens = await issueTokens(user)
  return { user: toPublicUser(user), ...tokens }
}

export async function refresh(rawToken) {
  if (!rawToken) throw new ApiError(401, 'No refresh token')

  const doc = await RefreshToken.findOne({ tokenHash: hashToken(rawToken) })
  if (!doc) throw new ApiError(401, 'Invalid refresh token')

  // An old (revoked) token was used again: treat it as suspicious and revoke all tokens of that user.
  if (doc.revoked) {
    await RefreshToken.updateMany({ user: doc.user }, { revoked: true })
    throw new ApiError(401, 'Refresh token reused')
  }
  if (doc.expiresAt < new Date()) throw new ApiError(401, 'Refresh token expired')

  const user = await User.findOne({ _id: doc.user, isDeleted: false, status: USER_STATUS.ACTIVE })
  if (!user) throw new ApiError(401, 'User not found or inactive')

  doc.revoked = true
  await doc.save()

  const tokens = await issueTokens(user)
  return { user: toPublicUser(user), ...tokens }
}

export async function logout(rawToken) {
  if (!rawToken) return
  await RefreshToken.updateOne({ tokenHash: hashToken(rawToken) }, { revoked: true })
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId).select('+passwordHash')
  if (!user || !(await comparePassword(currentPassword, user.passwordHash))) {
    throw new ApiError(400, 'Current password is incorrect')
  }
  user.passwordHash = await hashPassword(newPassword)
  await user.save()
  // Revoke all sessions (the user must log in again everywhere).
  await RefreshToken.updateMany({ user: user.id }, { revoked: true })
}

/* ---------------- Forgot password ---------------- */

const FORGOT_MIN_RESPONSE_MS = 250
export const GENERIC_FORGOT_MESSAGE =
  'If an account exists for this email, a password reset link has been sent.'

const hashResetToken = (token) =>
  crypto.createHash('sha256').update(String(token)).digest('hex')

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const resetExpiryMs = () => (env.PASSWORD_RESET_EXPIRES_MINUTES || 30) * 60 * 1000

function buildResetUrl(token) {
  const base = String(env.PORTAL_URL || env.FRONTEND_URL || '').trim().replace(/\/$/, '')
  return base ? `${base}/reset-password?token=${encodeURIComponent(token)}` : ''
}

async function sendPasswordResetEmail(user, token) {
  const resetUrl = buildResetUrl(token)
  if (!resetUrl) {
    console.error('Password reset link not built: set PORTAL_URL (or FRONTEND_URL) in .env.')
    return
  }

  const minutes = env.PASSWORD_RESET_EXPIRES_MINUTES || 30

  const sent = await sendEmail({
    to: user.email,
    subject: 'Reset your DigiAmplify password',
    text:
      `Hi ${user.name || ''},\n\n` +
      `We received a request to reset your DigiAmplify password.\n\n` +
      `Open this link to choose a new password: ${resetUrl}\n\n` +
      `This link works once and expires in ${minutes} minutes. ` +
      `If you did not request this, you can ignore this email; your password will not change.`,
    html:
      `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#0b0b0b;color:#ffffff;border-radius:12px">` +
      `<h2 style="margin:0 0 12px">Reset your password</h2>` +
      `<p style="color:#cccccc;line-height:1.5">Hi ${String(user.name || '').replace(/[<>&"]/g, '')},<br/>we received a request to reset your DigiAmplify password.</p>` +
      `<p style="margin:24px 0"><a href="${resetUrl}" style="background:#c1121f;color:#ffffff;padding:12px 22px;border-radius:6px;text-decoration:none;font-weight:bold">Choose a new password</a></p>` +
      `<p style="color:#999999;font-size:13px;line-height:1.5">This link works once and expires in ${minutes} minutes. ` +
      `If you did not request this, ignore this email; your password will not change.</p></div>`,
  })

  // Local dev without an email provider: print the link so you can still test.
  if (!sent && env.NODE_ENV !== 'production') {
    console.log(`[dev] Password reset link for ${user.email}: ${resetUrl}`)
  }
}

export async function requestPasswordReset(email) {
  const startedAt = Date.now()
  const cleanEmail = String(email ?? '').trim().toLowerCase()

  const user = await User.findOne({
    email: cleanEmail,
    status: USER_STATUS.ACTIVE,
    isDeleted: false,
  }).select('+passwordResetTokenHash +passwordResetExpires')

  if (user) {
    const token = crypto.randomBytes(32).toString('hex')

    user.passwordResetTokenHash = hashResetToken(token)
    user.passwordResetExpires = new Date(Date.now() + resetExpiryMs())
    await user.save()

    void sendPasswordResetEmail(user, token).catch((err) =>
      console.error('Password reset email failed:', err?.message || err)
    )
  } else {
    hashResetToken(crypto.randomBytes(32).toString('hex'))
  }

  const elapsed = Date.now() - startedAt
  if (elapsed < FORGOT_MIN_RESPONSE_MS) await wait(FORGOT_MIN_RESPONSE_MS - elapsed)

  return { message: GENERIC_FORGOT_MESSAGE }
}

export async function resetPassword(token, newPassword) {
  const user = await User.findOne({
    passwordResetTokenHash: hashResetToken(token),
    passwordResetExpires: { $gt: new Date() },
    status: USER_STATUS.ACTIVE,
    isDeleted: false,
  }).select('+passwordResetTokenHash +passwordResetExpires +passwordHash')

  if (!user) {
    throw new ApiError(400, 'This reset link is invalid or has expired. Please request a new one.')
  }

  user.passwordHash = await hashPassword(newPassword)
  user.passwordResetTokenHash = undefined
  user.passwordResetExpires = undefined
  await user.save()

  // Sign the user out of every device.
  await RefreshToken.updateMany({ user: user.id }, { revoked: true })

  return { email: user.email }
}