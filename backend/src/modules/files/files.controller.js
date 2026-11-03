import { asyncHandler } from '../../utils/asyncHandler.js'
import {
  assertChatAttachmentAccess,
  assertProfileDocumentAccess,
  streamChatAttachment,
  streamProfileDocument,
} from './files.service.js'

export const downloadProfileDocument = asyncHandler(async (req, res) => {
  const { fileName } = req.params

  await assertProfileDocumentAccess(req.user, fileName)
  await streamProfileDocument(fileName, res)
})

export const downloadChatAttachment = asyncHandler(async (req, res) => {
  const { fileName } = req.params

  await assertChatAttachmentAccess(req.user, fileName)
  await streamChatAttachment(fileName, res)
})
