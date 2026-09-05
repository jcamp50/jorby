import { Star } from 'lucide-react'
import { displayStarsFromHalfStars, ratingTextEquivalent } from '@/lib/ratings'
import { cn } from '@/lib/utils'

export function Rating({ halfStars, className }: { halfStars: number; className?: string }) {
  const stars = displayStarsFromHalfStars(halfStars)

  return (
    <span className={cn('inline-flex items-center gap-1 text-sm tabular-nums', className)}>
      <Star className="size-3.5 fill-current" aria-hidden />
      {stars.toFixed(1)}
      <span className="sr-only">{ratingTextEquivalent(halfStars)}</span>
    </span>
  )
}
