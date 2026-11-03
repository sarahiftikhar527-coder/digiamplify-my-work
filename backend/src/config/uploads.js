import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** Absolute path to backend/uploads (stable regardless of process.cwd()). */
export const UPLOADS_ROOT = path.resolve(__dirname, '../../uploads')

export const PROFILE_DOCUMENTS_DIR = path.join(
  UPLOADS_ROOT,
  'profile-documents'
)

export const CHAT_ATTACHMENTS_DIR = path.join(UPLOADS_ROOT, 'chat')
