import { FileText } from 'lucide-react'
import AuthenticatedImage from '@/components/AuthenticatedImage/AuthenticatedImage'
import {
  needsAuthenticatedFetch,
  openAuthenticatedFile,
} from '@/utils/authenticatedFile'

function isImageAttachment(attachment) {
  const type =
    attachment?.type ||
    attachment?.mimeType ||
    attachment?.mimetype ||
    ''

  if (type.startsWith('image/')) return true

  const name = attachment?.name || ''
  return /\.(png|jpe?g|gif|webp|svg)$/i.test(name)
}

export default function ChatAttachment({
  attachment,
  imageClassName = 'h-24 w-24 rounded-lg object-cover',
  fileClassName = 'flex items-center gap-2 rounded-lg bg-black/30 px-2.5 py-1.5 text-[11px] text-white/80 hover:bg-black/50',
}) {
  const url = attachment?.url || attachment?.secureUrl || ''
  const name = attachment?.name || attachment?.originalName || 'Attachment'

  const open = async (event) => {
    event?.preventDefault?.()

    if (!url) return

    if (needsAuthenticatedFetch(url)) {
      await openAuthenticatedFile(url)
      return
    }

    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (!url) {
    return (
      <div className={fileClassName}>
        <FileText size={14} />
        <span className="max-w-[140px] truncate">{name}</span>
      </div>
    )
  }

  if (isImageAttachment(attachment)) {
    return (
      <button
        type="button"
        onClick={open}
        className="block overflow-hidden rounded-lg"
      >
        <AuthenticatedImage
          src={url}
          alt={name}
          className={imageClassName}
        />
      </button>
    )
  }

  return (
    <button type="button" onClick={open} className={fileClassName}>
      <FileText size={14} />
      <span className="max-w-[140px] truncate">{name}</span>
    </button>
  )
}
