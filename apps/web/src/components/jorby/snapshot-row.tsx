import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Tile } from '@/components/jorby/tile'
import type { TileTone } from '@/components/jorby/tile'
import { cn } from '@/lib/utils'

/** Horizontal “pots” strip. Cards stay square-ish and scroll; they never wrap. */
export function SnapshotRow({
  label,
  action,
  children,
}: {
  label?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="mb-5">
      {label || action ? (
        <div className="mb-2 flex items-end justify-between gap-3 px-1">
          {label ? (
            <h2 className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              {label}
            </h2>
          ) : (
            <span />
          )}
          {action}
        </div>
      ) : null}
      <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2.5 pb-1">{children}</div>
      </div>
    </section>
  )
}

export function SnapshotCard({
  to,
  icon,
  tone,
  title,
  value,
  hint,
}: {
  to: string
  icon: LucideIcon
  tone: TileTone
  title: string
  value: ReactNode
  hint?: string
}) {
  return (
    <Link
      to={to}
      className={cn(
        'flex w-[8.75rem] shrink-0 flex-col rounded-2xl bg-card p-3 shadow-card',
        'min-h-28 transition-colors hover:bg-accent/40',
        'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
      )}
    >
      <Tile icon={icon} tone={tone} />
      <p className="mt-3 text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
        {title}
      </p>
      <p className="text-lg leading-tight font-extrabold tracking-[-0.02em] tabular-nums">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
    </Link>
  )
}
