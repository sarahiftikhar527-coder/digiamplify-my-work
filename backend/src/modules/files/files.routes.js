import { Router } from 'express'
import { authenticate } from '../../middlewares/auth.middleware.js'
import {
  downloadChatAttachment,
  downloadProfileDocument,
} from './files.controller.js'

const router = Router()

router.get(
  '/profile-documents/:fileName',
  authenticate,
  downloadProfileDocument
)

router.get('/chat/:fileName', authenticate, downloadChatAttachment)

export default router
