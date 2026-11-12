import fs from 'fs'
import path from 'path'
import Profile from '../../models/Profile.js'
import ApiError from '../../utils/ApiError.js'
import { prisma } from '../../config/db.js'
import {
  CHAT_ATTACHMENTS_DIR,
  PROFILE_DOCUMENTS_DIR,
} from '../../config/uploads.js'
import {
  buildChatAttachmentId,
  extractProfileDocumentFileName,
} from '../../utils/fileUrls.js'

const ADMIN_ROLES = new Set(['admin', 'superadmin'])

/** Safe stored upload names: UUID + extension (chat may truncate ext to 15 chars). */
const SAFE_FILE_NAME =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.[a-z0-9.]{1,15}$/i

const INLINE_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'pdf',
])

const EXTENSION_MIME = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  pdf: 'application/pdf',
  svg: 'image/svg+xml',
  html: 'text/html',
  htm: 'text/html',
  txt: 'text/plain',
  doc: 'application/msword',
  docx:
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  csv: 'text/csv',
  zip: 'application/zip',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx:
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
}

export function sanitizeUploadFileName(fileName) {
  if (typeof fileName !== 'string') {
    throw new ApiError(400, 'Invalid file name.')
  }

  const base = path.basename(fileName.trim())

  if (!base || base !== fileName.trim() || base.includes('..')) {
    throw new ApiError(400, 'Invalid file name.')
  }

  if (!SAFE_FILE_NAME.test(base)) {
    throw new ApiError(400, 'Invalid file name.')
  }

  return base
}

export function resolvePathUnderRoot(rootDirectory, fileName) {
  const safeName = sanitizeUploadFileName(fileName)
  const resolvedRoot = path.resolve(rootDirectory)
  const resolvedFile = path.resolve(resolvedRoot, safeName)

  if (
    resolvedFile !== resolvedRoot &&
    !resolvedFile.startsWith(`${resolvedRoot}${path.sep}`)
  ) {
    throw new ApiError(400, 'Invalid file path.')
  }

  return { safeName, absolutePath: resolvedFile }
}

export function extensionFromFileName(fileName) {
  const ext = path.extname(fileName).slice(1).toLowerCase()
  return ext || ''
}

export function mimeTypeForFileName(fileName) {
  const ext = extensionFromFileName(fileName)
  return EXTENSION_MIME[ext] || 'application/octet-stream'
}

/**
 * SVG and HTML are never inline. Other types inline only if in INLINE_EXTENSIONS.
 */
export function shouldServeInline(fileName) {
  const ext = extensionFromFileName(fileName)

  if (ext === 'svg' || ext === 'html' || ext === 'htm') {
    return false
  }

  return INLINE_EXTENSIONS.has(ext)
}

export function buildServeHeaders(fileName, { forceAttachment = false } = {}) {
  const mimeType = mimeTypeForFileName(fileName)
  const inline = !forceAttachment && shouldServeInline(fileName)

  return {
    'Content-Type': mimeType,
    'Content-Disposition': inline
      ? `inline; filename="${encodeURIComponent(fileName)}"`
      : `attachment; filename="${encodeURIComponent(fileName)}"`,
    'X-Content-Type-Options': 'nosniff',
  }
}

export function isAdminRole(role) {
  return ADMIN_ROLES.has(String(role || '').trim().toLowerCase())
}

function profileDocumentReferencesFileName(doc, fileName) {
  const urls = [doc?.url, doc?.backUrl].filter(Boolean)

  return urls.some((url) => {
    const extracted = extractProfileDocumentFileName(url)
    return extracted === fileName
  })
}

/**
 * A document an employee added in a pending profile change request is not on
 * the profile yet. The employee who sent it and any admin may open it so the
 * request can be reviewed.
 */
async function hasPendingRequestAccess(user, fileName) {
  const requesterId = String(user._id || user.id)
  const admin = isAdminRole(user.role)

  const pending = await prisma.profileChangeRequest.findMany({
    where: {
      status: 'pending',
      ...(admin ? {} : { userId: requesterId }),
    },
    select: { changes: true },
    take: 200,
  })

  return pending.some((row) =>
    JSON.stringify(row.changes || {}).includes(fileName)
  )
}

export async function assertProfileDocumentAccess(user, fileName) {
  sanitizeUploadFileName(fileName)

  const profile = await Profile.findOne({
    documents: {
      $elemMatch: {
        $or: [
          { url: `/uploads/profile-documents/${fileName}` },
          { url: `/api/v1/files/profile-documents/${fileName}` },
          { backUrl: `/uploads/profile-documents/${fileName}` },
          { backUrl: `/api/v1/files/profile-documents/${fileName}` },
        ],
      },
    },
  }).select('user')

  if (!profile) {
    const candidates = await Profile.find({
      $or: [
        { 'documents.url': { $regex: /profile-documents\// } },
        { 'documents.backUrl': { $regex: /profile-documents\// } },
      ],
    })
      .select('user documents')
      .limit(500)

    const matched = candidates.find((entry) =>
      (entry.documents || []).some((doc) =>
        profileDocumentReferencesFileName(doc, fileName)
      )
    )

    if (!matched) {
      if (await hasPendingRequestAccess(user, fileName)) {
        return
      }

      throw new ApiError(404, 'File not found.')
    }

    const ownerId = String(matched.user)
    const requesterId = String(user._id || user.id)

    if (ownerId === requesterId || isAdminRole(user.role)) {
      return
    }

    throw new ApiError(403, 'You do not have permission to access this file.')
  }

  const ownerId = String(profile.user)
  const requesterId = String(user._id || user.id)

  if (ownerId === requesterId || isAdminRole(user.role)) {
    return
  }

  throw new ApiError(403, 'You do not have permission to access this file.')
}

/**
 * A chat file can be opened by:
 *  - the person who uploaded it, and
 *  - any current member of a conversation where the file was sent.
 * Returns the stored attachment details (used for the download name).
 */
export async function assertChatAttachmentAccess(user, fileName) {
  sanitizeUploadFileName(fileName)

  const userId = String(user._id || user.id)

  const allowed = await prisma.chatAttachment.findFirst({
    where: {
      fileName,
      OR: [
        { uploaderId: userId },
        {
          message: {
            deleted: false,
            conversation: {
              members: { some: { userId, leftAt: null } },
            },
          },
        },
      ],
    },
    select: { originalName: true, mimeType: true },
  })

  if (allowed) return allowed

  const referenced = await prisma.chatAttachment.findFirst({
    where: { fileName },
    select: { id: true },
  })

  if (!referenced) {
    throw new ApiError(404, 'File not found.')
  }

  throw new ApiError(403, 'You do not have permission to access this file.')
}

export async function streamProfileDocument(fileName, res) {
  const { absolutePath } = resolvePathUnderRoot(
    PROFILE_DOCUMENTS_DIR,
    fileName
  )

  if (!fs.existsSync(absolutePath)) {
    throw new ApiError(404, 'File not found.')
  }

  const headers = buildServeHeaders(fileName)
  res.set(headers)
  res.sendFile(absolutePath)
}

export async function streamChatAttachment(fileName, res, details = null) {
  const { absolutePath } = resolvePathUnderRoot(
    CHAT_ATTACHMENTS_DIR,
    fileName
  )

  if (!fs.existsSync(absolutePath)) {
    throw new ApiError(404, 'File not found.')
  }

  const headers = buildServeHeaders(fileName)

  // Show the original file name when the person saves the file.
  if (details?.originalName) {
    const safeName = encodeURIComponent(details.originalName)
    const disposition = shouldServeInline(fileName) ? 'inline' : 'attachment'

    headers['Content-Disposition'] = `${disposition}; filename*=UTF-8''${safeName}`
  }

  res.set(headers)
  res.sendFile(absolutePath)
}