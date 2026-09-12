import { cn } from '@/lib/utils'

const sizes = {
  sm: 'text-base',
  md: 'text-2xl',
  lg: 'text-[2.5rem] leading-none',
} as const

/**
 * The reference design's signature numeral: a raised small currency mark, a
 * large integer, and decimals one step down. Split visually only — the full
 * formatted value is what assistive technology reads.
 */
export function Amount({
  value,
  currency,
  size = 'md',
  className,
}: {
  value: number
  currency: string
  size?: keyof typeof sizes
  className?: string
}) {
  const format = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  })
  const parts = format.formatToParts(value)
  const part = (type: Intl.NumberFormatPartTypes) =>
    parts
      .filter((candidate) => candidate.type === type)
      .map((candidate) => candidate.value)
      .join('')

  const symbol = part('currency')
  const integer = parts
    .filter((candidate) => candidate.type === 'integer' || candidate.type === 'group')
    .map((candidate) => candidate.value)
    .join('')
  const decimal = part('decimal') || '.'
  const fraction = part('fraction') || '00'

  return (
    <span className={cn('font-bold tracking-tight tabular-nums', sizes[size], className)}>
      <span className="sr-only">{format.format(value)}</span>
      <span aria-hidden className="inline-flex items-baseline">
        <span className="self-start text-[0.55em] leading-[1.55]">{symbol}</span>
        {integer}
        <span className="text-[0.62em]">
          {decimal}
          {fraction}
        </span>
      </span>
    </span>
  )
}

/**
 * The non-currency focal number: counts, progress, spreads. Same visual weight
 * as Amount so screens stay consistent about what "the big number" looks like.
 */
export function Stat({
  value,
  unit,
  className,
}: {
  value: string | number
  unit?: string
  className?: string
}) {
  return (
    <span className={cn('inline-flex items-baseline gap-1', className)}>
      <span className="text-[2.5rem] leading-none font-bold tracking-tight tabular-nums">
        {value}
      </span>
      {/* Inherits colour so the same component works on a card and on a saturated hero. */}
      {unit ? <span className="text-sm font-semibold opacity-70">{unit}</span> : null}
    </span>
  )
}
