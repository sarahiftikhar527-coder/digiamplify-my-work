import rateLimit from 'express-rate-limit'

const base = { standardHeaders: true, legacyHeaders: false }

export const loginLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { success: false, message: 'Too many login attempts. Try again later.' },
})

export const apiLimiter = rateLimit({
  ...base,
  windowMs: 60 * 1000,
  limit: 300,
  message: { success: false, message: 'Too many requests. Slow down.' },
})