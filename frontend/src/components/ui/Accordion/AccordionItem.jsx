import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'

export default function AccordionItem({
  question,
  answer,
  open = false,
  onToggle,
}) {
  return (
    <div className="py-1">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-5 py-5 text-left"
      >
        <span className="text-sm font-medium text-white">{question}</span>

        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all ${
            open
              ? 'rotate-45 border-digi-red bg-digi-red text-white'
              : 'border-white/10 text-white/60'
          }`}
        >
          <Plus size={15} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="pb-5 pr-12 text-sm leading-7 text-white/55">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}