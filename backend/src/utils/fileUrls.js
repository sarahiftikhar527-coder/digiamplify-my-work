const PROFILE_PUBLIC_PREFIX = '/api/v1/files/profile-documents/'
const CHAT_PUBLIC_PREFIX = '/api/v1/files/chat/'

export function buildProfileDocumentUrl(fileName) {
  return `${PROFILE_PUBLIC_PREFIX}${fileName}`
}

export function buildChatAttachmentUrl(fileName) {
  return `${CHAT_PUBLIC_PREFIX}${fileName}`
}

export function buildChatAttachmentId(fileName) {
  return `chat/${fileName}`
}

/**
 * Extract stored file basename from legacy or current URL shapes.
 * @returns {string|null}
 */
export function extractProfileDocumentFileName(url) {
  if (typeof url !== 'string' || !url.trim()) return null

  const trimmed = url.trim()

  const patterns = [
    /^\/api\/v1\/files\/profile-documents\/([^/?#]+)$/i,
    /^\/uploads\/profile-documents\/([^/?#]+)$/i,
    /^https?:\/\/[^/]+\/uploads\/profile-documents\/([^/?#]+)$/i,
    /^https?:\/\/[^/]+\/api\/v1\/files\/profile-documents\/([^/?#]+)$/i,
  ]

  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match?.[1]) return decodeURIComponent(match[1])
  }

  return null
}

/**
 * @returns {{ fileName: string|null, attachmentId: string|null }}
 */
export function extractChatAttachmentFromUrl(url) {
  if (typeof url !== 'string' || !url.trim()) {
    return { fileName: null, attachmentId: null }
  }

  const trimmed = url.trim()

  const patterns = [
    /^\/api\/v1\/files\/chat\/([^/?#]+)$/i,
    /^\/uploads\/chat\/chat\/([^/?#]+)$/i,
    /^\/uploads\/chat\/([^/?#]+)$/i,
    /^https?:\/\/[^/]+\/uploads\/chat\/chat\/([^/?#]+)$/i,
    /^https?:\/\/[^/]+\/uploads\/chat\/([^/?#]+)$/i,
    /^https?:\/\/[^/]+\/api\/v1\/files\/chat\/([^/?#]+)$/i,
  ]

  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match?.[1]) {
      const fileName = decodeURIComponent(match[1])
      return { fileName, attachmentId: `chat/${fileName}` }
    }
  }

  return { fileName: null, attachmentId: null }
}

export function isAlreadyMigratedProfileUrl(url) {
  return (
    typeof url === 'string' &&
    url.startsWith(PROFILE_PUBLIC_PREFIX)
  )
}

export function isAlreadyMigratedChatUrl(url) {
  return typeof url === 'string' && url.startsWith(CHAT_PUBLIC_PREFIX)
}
