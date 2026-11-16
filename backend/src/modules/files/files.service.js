
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
  extractProfileDocumentFileName,
} from '../../utils/fileUrls.js'

const ADMIN_ROLES = new Set(['admin', 'superadmin'])

/**
 * Stored upload filenames must use UUIDs followed by a safe extension.
 */
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
  xlsx:
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx:
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
}

/**
 * Validate a stored upload filename.
 */
export function sanitizeUploadFileName(fileName) {
  if (typeof fileName !== 'string') {
    throw new ApiError(400, 'Invalid file name.')
  }

  const trimmedName = fileName.trim()
  const base = path.basename(trimmedName)

  if (
    !base ||
    base !== trimmedName ||
    base.includes('..')
  ) {
    throw new ApiError(400, 'Invalid file name.')
  }

  if (!SAFE_FILE_NAME.test(base)) {
    throw new ApiError(400, 'Invalid file name.')
  }

  return base
}

/**
 * Resolve a filename safely inside its upload directory.
 */
export function resolvePathUnderRoot(rootDirectory, fileName) {
  const safeName = sanitizeUploadFileName(fileName)

  const resolvedRoot = path.resolve(rootDirectory)
  const resolvedFile = path.resolve(resolvedRoot, safeName)

  if (
    resolvedFile === resolvedRoot ||
    !resolvedFile.startsWith(`${resolvedRoot}${path.sep}`)
  ) {
    throw new ApiError(400, 'Invalid file path.')
  }

  return {
    safeName,
    absolutePath: resolvedFile,
  }
}

/**
 * Extract a file extension.
 */
export function extensionFromFileName(fileName) {
  const ext = path.extname(fileName).slice(1).toLowerCase()

  return ext || ''
}

/**
 * Determine MIME type using the stored file extension.
 */
export function mimeTypeForFileName(fileName) {
  const ext = extensionFromFileName(fileName)

  return EXTENSION_MIME[ext] || 'application/octet-stream'
}

/**
 * SVG and HTML files must never be served inline.
 */
export function shouldServeInline(fileName) {
  const ext = extensionFromFileName(fileName)

  if (ext === 'svg' || ext === 'html' || ext === 'htm') {
    return false
  }

  return INLINE_EXTENSIONS.has(ext)
}

/**
 * Build secure response headers.
 */
export function buildServeHeaders(
  fileName,
  { forceAttachment = false } = {}
) {
  const mimeType = mimeTypeForFileName(fileName)

  const inline =
    !forceAttachment && shouldServeInline(fileName)

  return {
    'Content-Type': mimeType,
    'Content-Disposition': inline
      ? `inline; filename="${encodeURIComponent(fileName)}"`
      : `attachment; filename="${encodeURIComponent(fileName)}"`,
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'private, no-cache, no-store',
  }
}

/**
 * Check whether a user has an administrator role.
 */
export function isAdminRole(role) {
  return ADMIN_ROLES.has(
    String(role || '').trim().toLowerCase()
  )
}

/**
 * Check whether a profile document references a stored filename.
 */
function profileDocumentReferencesFileName(doc, fileName) {
  const urls = [doc?.url, doc?.backUrl].filter(Boolean)

  return urls.some((url) => {
    return extractProfileDocumentFileName(url) === fileName
  })
}

/**
 * Check whether a filename belongs to a currently saved profile avatar.
 *
 * Profile avatars are stored in Prisma profile.avatarUrl or
 * user.avatarUrl, rather than in the profile documents collection.
 *
 * All authenticated users can view current profile avatars because
 * they are displayed in employee directories, chat and hierarchy views.
 */
async function isCurrentAvatarFile(fileName) {
  const profile = await prisma.profile.findFirst({
    where: {
      avatarUrl: {
        contains: fileName,
      },
    },
    select: {
      id: true,
    },
  })

  if (profile) {
    return true
  }

  const owner = await prisma.user.findFirst({
    where: {
      avatarUrl: {
        contains: fileName,
      },
    },
    select: {
      id: true,
    },
  })

  return Boolean(owner)
}

/**
 * Check access to a document or avatar uploaded in a pending
 * profile change request.
 *
 * The requesting employee and administrators can access these files.
 */
async function hasPendingRequestAccess(user, fileName) {
  const requesterId = String(user._id || user.id)

  const admin = isAdminRole(user.role)

  const pendingRequests =
    await prisma.profileChangeRequest.findMany({
      where: {
        status: 'pending',
        ...(admin ? {} : { userId: requesterId }),
      },
      select: {
        changes: true,
      },
      take: 200,
    })

  return pendingRequests.some((row) => {
    return JSON.stringify(row.changes || {}).includes(fileName)
  })
}

/**
 * Verify access to a profile document or avatar.
 *
 * Access rules:
 * 1. Current profile avatars: any authenticated user.
 * 2. Saved profile documents: owner and administrators.
 * 3. Pending profile request files: requester and administrators.
 */
export async function assertProfileDocumentAccess(user, fileName) {
  sanitizeUploadFileName(fileName)

  if (!user || !(user._id || user.id)) {
    throw new ApiError(401, 'Authentication required.')
  }

  // 1. Allow access to currently saved profile avatars.
  if (await isCurrentAvatarFile(fileName)) {
    return
  }

  // 2. Find profiles containing the requested document.
  const profiles = await Profile.find({
    $or: [
      {
        'documents.url': {
          $regex: /profile-documents/,
        },
      },
      {
        'documents.backUrl': {
          $regex: /profile-documents/,
        },
      },
    ],
  })
    .select('user documents')
    .limit(5000)

  const matchedProfile = profiles.find((entry) => {
    return (entry.documents || []).some((doc) => {
      return profileDocumentReferencesFileName(doc, fileName)
    })
  })

  if (matchedProfile) {
    const ownerId = String(matchedProfile.user)
    const requesterId = String(user._id || user.id)

    if (
      ownerId === requesterId ||
      isAdminRole(user.role)
    ) {
      return
    }

    throw new ApiError(
      403,
      'You do not have permission to access this file.'
    )
  }

  // 3. Check files attached to pending profile change requests.
  if (await hasPendingRequestAccess(user, fileName)) {
    return
  }

  throw new ApiError(404, 'File not found.')
}

/**
 * Verify access to a chat attachment.
 *
 * A chat attachment can be accessed by:
 * - Its original uploader.
 * - A current member of the conversation containing the attachment.
 *
 * Deleted messages and users who have left a conversation
 * cannot access attachments through conversation membership.
 */
export async function assertChatAttachmentAccess(user, fileName) {
  sanitizeUploadFileName(fileName)

  if (!user || !(user._id || user.id)) {
    throw new ApiError(401, 'Authentication required.')
  }

  const userId = String(user._id || user.id)

  const allowed = await prisma.chatAttachment.findFirst({
    where: {
      fileName,
      OR: [
        {
          uploaderId: userId,
        },
        {
          message: {
            deleted: false,
            conversation: {
              members: {
                some: {
                  userId,
                  leftAt: null,
                },
              },
            },
          },
        },
      ],
    },
    select: {
      originalName: true,
      mimeType: true,
    },
  })

  if (allowed) {
    return allowed
  }

  // Determine whether the attachment exists but access is forbidden.
  const referenced = await prisma.chatAttachment.findFirst({
    where: {
      fileName,
    },
    select: {
      id: true,
    },
  })

  if (!referenced) {
    throw new ApiError(404, 'File not found.')
  }

  throw new ApiError(
    403,
    'You do not have permission to access this file.'
  )
}

/**
 * Stream a profile document or avatar.
 */
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

  return res.sendFile(absolutePath)
}

/**
 * Stream a chat attachment.
 *
 * Preserve the original filename when the user downloads the file.
 */
export async function streamChatAttachment(
  fileName,
  res,
  details = null
) {
  const { absolutePath } = resolvePathUnderRoot(
    CHAT_ATTACHMENTS_DIR,
    fileName
  )

  if (!fs.existsSync(absolutePath)) {
    throw new ApiError(404, 'File not found.')
  }

  const headers = buildServeHeaders(fileName)

  if (details?.originalName) {
    const safeName = String(details.originalName)
      .replace(/[\r\n"\\]/g, '_')
      .trim()

    const disposition = shouldServeInline(fileName)
      ? 'inline'
      : 'attachment'

    headers['Content-Disposition'] =
      `${disposition}; filename*=UTF-8''${encodeURIComponent(safeName)}`
  }

  res.set(headers)

  return res.sendFile(absolutePath)
}
