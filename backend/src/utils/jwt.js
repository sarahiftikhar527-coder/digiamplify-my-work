import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { env } from '../config/env.js'

export const signAccessToken = (user) =>
  jwt.sign({ role: user.role }, env.JWT_ACCESS_SECRET, {
    subject: String(user.id),
    expiresIn: env.ACCESS_TOKEN_EXPIRES,
  })

export const verifyAccessToken = (token) =>
  jwt.verify(token, env.JWT_ACCESS_SECRET)

export const generateRefreshToken = () => crypto.randomBytes(48).toString('hex')

export const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex')