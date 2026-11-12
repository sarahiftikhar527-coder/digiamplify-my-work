import { asyncHandler } from '../../utils/asyncHandler.js'
import { ok } from '../../utils/ApiResponse.js'
import { env } from '../../config/env.js'
import * as service from './auth.service.js'

const COOKIE = 'refreshToken'

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/api/v1/auth',
}

const setCookie = (res, token) =>
  res.cookie(COOKIE, token, {
    ...cookieOptions,
    maxAge: env.REFRESH_TOKEN_EXPIRES_DAYS * 86400000,
  })

export const register = asyncHandler(async (req, res) => {
  await service.register(req.validated.body)
  ok(
    res,
    { status: 'pending' },
    'Signup request sent. You can log in after the admin approves your account.',
    201
  )
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body
  const { user, accessToken, refreshToken } = await service.login(email, password)
  setCookie(res, refreshToken)
  ok(res, { user, accessToken }, 'Logged in')
})

export const refresh = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await service.refresh(req.cookies?.[COOKIE])
  setCookie(res, refreshToken)
  ok(res, { user, accessToken })
})

export const logout = asyncHandler(async (req, res) => {
  await service.logout(req.cookies?.[COOKIE])
  res.clearCookie(COOKIE, cookieOptions)
  ok(res, null, 'Logged out')
})

export const me = asyncHandler(async (req, res) => {
  ok(res, { user: service.toPublicUser(req.user) })
})

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.validated.body
  await service.changePassword(req.user.id, currentPassword, newPassword)
  res.clearCookie(COOKIE, cookieOptions)
  ok(res, null, 'Password changed. Please login again.')
})

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await service.requestPasswordReset(req.validated.body.email)
  ok(res, null, result.message)
})

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.validated.body
  const { email } = await service.resetPassword(token, newPassword)
  res.clearCookie(COOKIE, cookieOptions)
  ok(res, { email }, 'Password updated. You can now log in with your new password.')
})