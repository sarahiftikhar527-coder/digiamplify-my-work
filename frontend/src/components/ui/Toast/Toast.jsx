import { AnimatePresence, motion } from 'framer-motion'
import { Check, Info, X } from 'lucide-react'

const icons = {
  success: Check,
  error: X,
  info: Info,
}

export default function Toast({
  message,
  type = 'success',
  onClose,
}) {
  const Icon = icons[type] || Info

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20, x: 20 }}
          className="fixed bottom-5 right-5 z-[120] flex max-w-sm items-center gap-3 rounded-lg border border-white/10 bg-[#111111] px-4 py-3 shadow-2xl"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-digi-red/10 text-digi-red">
            <Icon size={15} />
          </span>

          <p className="flex-1 text-sm text-white/80">{message}</p>

          <button
            type="button"
            onClick={onClose}
            className="text-white/30 transition hover:text-white"
            aria-label="Close notification"
          >
            <X size={15} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}