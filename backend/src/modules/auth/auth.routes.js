import { Router } from 'express'
import { validate } from '../../middlewares/validate.middleware.js'
import { authenticate } from '../../middlewares/auth.middleware.js'
import { loginLimiter } from '../../middlewares/rateLimit.middleware.js'
import { loginSchema, changePasswordSchema } from './auth.validation.js'
import * as ctrl from './auth.controller.js'

const router = Router()

router.post('/login', loginLimiter, validate(loginSchema), ctrl.login)
router.post('/refresh', ctrl.refresh)
router.post('/logout', ctrl.logout)
router.get('/me', authenticate, ctrl.me)
router.post('/change-password', authenticate, validate(changePasswordSchema), ctrl.changePassword)

export default router