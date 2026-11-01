import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Carousel({
  items = [],
  renderItem,
  visible = 1,
  gap = 16,
  className = '',
  controls = true,
}) {
  const [index, setIndex] = useState(0)

  const maxIndex = Math.max(items.length - visible, 0)

  const next = () => {
    setIndex((current) => Math.min(current + 1, maxIndex))
  }

  const previous = () => {
    setIndex((current) => Math.max(current - 1, 0))
  }

  return (
    <div className={className}>
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            gap: `${gap}px`,
            transform: `translateX(calc(-${index} * ((100% + ${gap}px) / ${visible})))`,
          }}
        >
          {items.map((item, itemIndex) => (
            <div
              key={item.id || itemIndex}
              className="shrink-0"
              style={{
                width: `calc((100% - ${
                  gap * (visible - 1)
                }px) / ${visible})`,
              }}
            >
              {renderItem(item, itemIndex)}
            </div>
          ))}
        </div>
      </div>

      {controls && items.length > visible && (
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={previous}
            disabled={index === 0}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:border-digi-red hover:text-white disabled:opacity-30"
            aria-label="Previous"
          >
            <ChevronLeft size={15} />
          </button>

          <button
            type="button"
            onClick={next}
            disabled={index === maxIndex}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:border-digi-red hover:text-white disabled:opacity-30"
            aria-label="Next"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  )
}