import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function RatingStars({ rating, size = 'md', showValue = true, className }) {
  const sizes = { sm: 'h-3 w-3', md: 'h-4 w-4', lg: 'h-5 w-5' }
  const full = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5

  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              sizes[size],
              i <= full
                ? 'fill-amber-400 text-amber-400'
                : i === full + 1 && hasHalf
                  ? 'fill-amber-200 text-amber-400'
                  : 'fill-stone-200 text-stone-200'
            )}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-stone-800">{rating.toFixed(1)}</span>
      )}
    </div>
  )
}
