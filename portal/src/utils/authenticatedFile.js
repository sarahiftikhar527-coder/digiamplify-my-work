import { tokenStore } from '@/services/api/tokenStore'

const API_URL = (
  import.meta.env.VITE_API_URL || (typeof window !== "undefined" && window.location.hostname.includes("digiamplify.com") ? "https://api.digiamplify.com/api/v1" : "http://localhost:5000/api/v1")
).replace(/\/+$/, '')

const API_ORIGIN = (() => {
  try {
    return new URL(API_URL, window.location.origin).origin
  } catch {
    return window.location.origin
  }
})()

function isProtectedLegacyPath(pathname) {
  return (
    pathname.startsWith('/uploads/profile-documents/') ||
    pathname.startsWith('/uploads/chat/')
  )
}

function isProtectedApiPath(pathname) {
  return (
    pathname.startsWith('/api/v1/files/profile-documents/') ||
    pathname.startsWith('/api/v1/files/chat/')
  )
}

/**
 * Map legacy public upload URLs to authenticated API file endpoints.
 * @returns {string|null} Absolute fetch URL, or null if not a protected file URL.
 */
export function resolveProtectedFileFetchUrl(rawUrl) {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) return null

  const trimmed = rawUrl.trim()

  if (/^(blob:|data:|javascript:)/i.test(trimmed)) {
    return null
  }

  let pathname = trimmed

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed)
      if (parsed.origin !== API_ORIGIN) {
        return trimmed
      }
      pathname = `${parsed.pathname}${parsed.search}`
    } catch {
      return null
    }
  }

  if (!pathname.startsWith('/')) {
    return null
  }

  if (pathname.startsWith('/api/v1/files/')) {
    return `${API_ORIGIN}${pathname}`
  }

  if (pathname.startsWith('/uploads/profile-documents/')) {
    const fileName = pathname.slice('/uploads/profile-documents/'.length)
    return `${API_URL}/files/profile-documents/${encodeURIComponent(fileName)}`
  }

  if (pathname.startsWith('/uploads/chat/chat/')) {
    const fileName = pathname.slice('/uploads/chat/chat/'.length)
    return `${API_URL}/files/chat/${encodeURIComponent(fileName)}`
  }

  if (pathname.startsWith('/uploads/chat/')) {
    const fileName = pathname.slice('/uploads/chat/'.length)
    return `${API_URL}/files/chat/${encodeURIComponent(fileName)}`
  }

  if (isProtectedLegacyPath(pathname) || isProtectedApiPath(pathname)) {
    return `${API_ORIGIN}${pathname}`
  }

  return null
}

export function needsAuthenticatedFetch(rawUrl) {
  return Boolean(resolveProtectedFileFetchUrl(rawUrl))
}

export async function fetchAuthenticatedFile(rawUrl) {
  const fetchUrl = resolveProtectedFileFetchUrl(rawUrl)

  if (!fetchUrl) {
    throw new Error('This file URL cannot be loaded securely.')
  }

  const token = tokenStore.get()
  const headers = token ? { Authorization: `Bearer ${token}` } : {}

  const response = await fetch(fetchUrl, { headers, credentials: 'include' })

  if (!response.ok) {
    throw new Error(`Unable to load file (${response.status}).`)
  }

  return response.blob()
}

export async function openAuthenticatedFile(rawUrl) {
  const blob = await fetchAuthenticatedFile(rawUrl)
  const objectUrl = URL.createObjectURL(blob)
  window.open(objectUrl, '_blank', 'noopener,noreferrer')
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
}

export async function downloadAuthenticatedFile(rawUrl, fileName) {
  const blob = await fetchAuthenticatedFile(rawUrl)
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = objectUrl
  link.download = fileName || 'download'
  link.rel = 'noopener noreferrer'
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(objectUrl)
}

export async function createAuthenticatedObjectUrl(rawUrl) {
  const blob = await fetchAuthenticatedFile(rawUrl)
  return URL.createObjectURL(blob)
}
