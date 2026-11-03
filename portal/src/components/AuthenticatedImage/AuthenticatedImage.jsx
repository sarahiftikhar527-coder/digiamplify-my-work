import { useEffect, useState } from 'react'
import {
  createAuthenticatedObjectUrl,
  needsAuthenticatedFetch,
  resolveProtectedFileFetchUrl,
} from '@/utils/authenticatedFile'

export default function AuthenticatedImage({
  src,
  alt = '',
  className = '',
  ...rest
}) {
  const [displaySrc, setDisplaySrc] = useState('')
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let objectUrl = ''
    let cancelled = false

    async function load() {
      if (!src) {
        setDisplaySrc('')
        return
      }

      if (!needsAuthenticatedFetch(src)) {
        const absolute = resolveProtectedFileFetchUrl(src) || src
        setDisplaySrc(absolute)
        return
      }

      try {
        objectUrl = await createAuthenticatedObjectUrl(src)
        if (!cancelled) {
          setDisplaySrc(objectUrl)
          setFailed(false)
        }
      } catch {
        if (!cancelled) {
          setFailed(true)
          setDisplaySrc('')
        }
      }
    }

    load()

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [src])

  if (failed || !displaySrc) {
    return (
      <span className={`inline-flex items-center justify-center text-xs text-white/60 ${className}`}>
        Preview unavailable
      </span>
    )
  }

  return (
    <img src={displaySrc} alt={alt} className={className} {...rest} />
  )
}
