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
  ok(res, { user: req.user })
})

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.validated.body
  await service.changePassword(req.user.id, currentPassword, newPassword)
  res.clearCookie(COOKIE, cookieOptions)
  ok(res, null, 'Password changed. Please login again.')
})