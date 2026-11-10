import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { validate } from '../../middlewares/validate.middleware.js'
import { authenticate } from '../../middlewares/auth.middleware.js'
import { loginLimiter } from '../../middlewares/rateLimit.middleware.js'
import { loginSchema, registerSchema, changePasswordSchema } from './auth.validation.js'
import * as ctrl from './auth.controller.js'

const router = Router()

// Limits spam signups: 10 requests per hour per IP.
const registerLimiter = rateLimit({
  standardHeaders: true,
  legacyHeaders: false,
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: { success: false, message: 'Too many signup attempts. Try again later.' },
})

router.post('/register', registerLimiter, validate(registerSchema), ctrl.register)
router.post('/login', loginLimiter, validate(loginSchema), ctrl.login)
router.post('/refresh', ctrl.refresh)
router.post('/logout', ctrl.logout)
router.get('/me', authenticate, ctrl.me)
router.post('/change-password', authenticate, validate(changePasswordSchema), ctrl.changePassword)

export default router