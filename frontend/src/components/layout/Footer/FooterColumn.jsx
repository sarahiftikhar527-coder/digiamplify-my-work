import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function FooterColumn({
  title,
  items,
  index,
  isOpen,
  onToggle,
}) {
  return (
    <div className="w-full">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between py-4 text-left lg:cursor-default lg:py-0"
      >
        <span className="text-xs font-medium uppercase tracking-[0.08em] text-white sm:text-[13px]">
          {title}
        </span>

        <ChevronDown
          size={15}
          className={`text-white/50 transition-transform duration-300 lg:hidden ${
            isOpen ? 'rotate-180 text-digi-red' : ''
          }`}
        />
      </button>

      <div
        className={`grid overflow-hidden transition-all duration-300 ease-out lg:block ${
          isOpen
            ? 'grid-rows-[1fr] opacity-100'
            : 'grid-rows-[0fr] opacity-0 lg:opacity-100'
        }`}
      >
        <div className="min-h-0">
          <div className="flex flex-col gap-2 pb-4 lg:mt-4 lg:gap-2.5 lg:pb-0">
            {items.map((item) => {
              const label = typeof item === 'string' ? item : item.label

              const href =
                typeof item === 'string'
                  ? '#'
                  : item.slug
                    ? `/services/${item.slug}`
                    : item.href || item.to || '#'

              return (
                <Link
                  key={label}
                  to={href}
                  className="block text-[11px] leading-5 text-white/50 transition-colors duration-300 hover:text-white sm:text-xs"
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      onToggle()
                    }
                  }}
                >
                  {label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}