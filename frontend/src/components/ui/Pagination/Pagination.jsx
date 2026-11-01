import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onChange,
  className = '',
}) {
  if (totalPages <= 1) return null

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onChange?.(currentPage - 1)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:border-digi-red hover:text-white disabled:opacity-30"
        aria-label="Previous page"
      >
        <ChevronLeft size={15} />
      </button>

      {Array.from({ length: totalPages }, (_, index) => index + 1).map(
        (page) => (
          <button
            key={page}
            type="button"
            onClick={() => onChange?.(page)}
            className={`flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-xs transition ${
              currentPage === page
                ? 'border-digi-red bg-digi-red text-white'
                : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white'
            }`}
          >
            {page}
          </button>
        ),
      )}

      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onChange?.(currentPage + 1)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:border-digi-red hover:text-white disabled:opacity-30"
        aria-label="Next page"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  )
}