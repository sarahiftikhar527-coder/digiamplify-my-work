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

const pinResetWindowMs = 15 * 60 * 1000
const pinResetLimit = 5

const pinResetLimitMessage = {
  success: false,
  message: 'Too many PIN reset attempts. Try again later.',
}

export const pinForgotIpLimiter = rateLimit({
  ...base,
  windowMs: pinResetWindowMs,
  limit: pinResetLimit,
  message: pinResetLimitMessage,
})

export const pinForgotEmailLimiter = rateLimit({
  ...base,
  windowMs: pinResetWindowMs,
  limit: pinResetLimit,
  message: pinResetLimitMessage,
  keyGenerator: (req) => {
    const email = String(
      req.validated?.body?.email ?? req.body?.email ?? ''
    )
      .trim()
      .toLowerCase()

    return email ? `pin-forgot:${email}` : `pin-forgot-ip:${req.ip}`
  },
})

export const pinResetLimiter = rateLimit({
  ...base,
  windowMs: pinResetWindowMs,
  limit: pinResetLimit,
  message: pinResetLimitMessage,
})

const oneHourMs = 60 * 60 * 1000

export const contactPublicIpLimiter = rateLimit({
  ...base,
  windowMs: oneHourMs,
  limit: 5,
  message: {
    success: false,
    message: 'Too many contact requests. Try again later.',
  },
})

export const newsletterSubscribeIpLimiter = rateLimit({
  ...base,
  windowMs: pinResetWindowMs,
  limit: pinResetLimit,
  message: pinResetLimitMessage,
})

export const newsletterSubscribeEmailLimiter = rateLimit({
  ...base,
  windowMs: pinResetWindowMs,
  limit: pinResetLimit,
  message: pinResetLimitMessage,
  keyGenerator: (req) => {
    const email = String(
      req.validated?.body?.email ?? req.body?.email ?? ''
    )
      .trim()
      .toLowerCase()

    return email
      ? `newsletter-subscribe:${email}`
      : `newsletter-subscribe-ip:${req.ip}`
  },
})

export const newsletterUnsubscribeIpLimiter = rateLimit({
  ...base,
  windowMs: pinResetWindowMs,
  limit: pinResetLimit,
  message: pinResetLimitMessage,
})