import { Star } from 'lucide-react'

export default function StarRating({
  rating = 5,
  max = 5,
  size = 14,
  className = '',
}) {
  return (
    <div className={`flex items-center gap-1 ${className}`} aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }, (_, index) => {
        const filled = index < Math.round(rating)

        return (
          <Star
            key={index}
            size={size}
            fill={filled ? 'currentColor' : 'transparent'}
            className={filled ? 'text-digi-red' : 'text-white/20'}
          />
        )
      })}
    </div>
  )
}