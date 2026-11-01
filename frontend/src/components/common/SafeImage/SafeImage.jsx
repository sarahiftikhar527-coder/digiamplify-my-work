import { useState } from 'react'

export default function SafeImage({
  src,
  alt = '',
  fallback = '/favicon.svg',
  className = '',
  ...props
}) {
  const [imageSrc, setImageSrc] = useState(src)

  return (
    <img
      src={imageSrc || fallback}
      alt={alt}
      className={className}
      onError={() => {
        if (imageSrc !== fallback) {
          setImageSrc(fallback)
        }
      }}
      {...props}
    />
  )
}