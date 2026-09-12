import { cn } from '@/lib/utils'

export function Meter({ value, max }: { value: number; max: number }) {
  const ratio = max <= 0 ? 0 : value / max
  const pct = Math.min(100, Math.max(0, ratio * 100))
  const over = value > max

  return (
    <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
      <div
        className={cn('h-full rounded-full', over ? 'bg-destructive' : 'bg-section')}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
