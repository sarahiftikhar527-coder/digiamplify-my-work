import ApiError from '../../utils/ApiError.js'
import { env } from '../../config/env.js'
import User from '../../models/User.js'
import RefreshToken from '../../models/RefreshToken.js'
import { comparePassword, hashPassword } from '../../utils/password.js'
import {
  generateRefreshToken, hashToken, signAccessToken,
} from '../../utils/jwt.js'

async function issueTokens(user) {
  const refreshToken = generateRefreshToken()
  await RefreshToken.create({
    user: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_EXPIRES_DAYS * 86400000),
  })
  return { accessToken: signAccessToken(user), refreshToken }
}

export async function login(email, password) {
  const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false })
    .select('+passwordHash')

  if (!user || !(await comparePassword(password, user.passwordHash))) {
    throw new ApiError(401, 'Invalid email or password')
  }
  if (user.status !== 'active') throw new ApiError(403, 'Account is inactive')

  const tokens = await issueTokens(user)
  return { user, ...tokens }
}

export async function refresh(rawToken) {
  if (!rawToken) throw new ApiError(401, 'No refresh token')

  const doc = await RefreshToken.findOne({ tokenHash: hashToken(rawToken) })
  if (!doc) throw new ApiError(401, 'Invalid refresh token')

  // Purana (revoked) token dobara use hua to shak: us user ke saare tokens band
  if (doc.revoked) {
    await RefreshToken.updateMany({ user: doc.user }, { revoked: true })
    throw new ApiError(401, 'Refresh token reused')
  }
  if (doc.expiresAt < new Date()) throw new ApiError(401, 'Refresh token expired')

  const user = await User.findOne({ _id: doc.user, isDeleted: false, status: 'active' })
  if (!user) throw new ApiError(401, 'User not found or inactive')

  doc.revoked = true
  await doc.save()

  const tokens = await issueTokens(user)
  return { user, ...tokens }
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
  // Saari sessions band (har jagah dobara login karna paray ga)
  await RefreshToken.updateMany({ user: user.id }, { revoked: true })
}