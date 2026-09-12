import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

/**
 * A white group floating on the section wash, optionally preceded by an
 * uppercase micro-label. Depth comes from shadow rather than a border; a border
 * plus a shadow reads as heavy.
 */
export function CardGroup({
  label,
  action,
  children,
  className,
}: {
  label?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('mb-5', className)}>
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
      <div className="overflow-hidden rounded-2xl bg-card shadow-card">{children}</div>
    </section>
  )
}

/**
 * Rows stack inside a CardGroup with hairline dividers inset from the card
 * edge. `[&>*+*]` targets the gap between siblings so no row needs to know
 * whether it is first.
 */
export function RowList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        '[&>*+*]:relative',
        '[&>*+*]:before:absolute [&>*+*]:before:inset-x-4 [&>*+*]:before:top-0 [&>*+*]:before:h-px [&>*+*]:before:bg-border',
        className,
      )}
    >
      {children}
    </div>
  )
}

type RowContentProps = {
  leading?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  trailing?: ReactNode
  meta?: ReactNode
  /** Let the subtitle run to several lines, for prose rather than metadata. */
  wrap?: boolean
}

function RowContent({ leading, title, subtitle, trailing, meta, wrap }: RowContentProps) {
  return (
    <>
      {leading}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.9375rem] leading-snug font-semibold">{title}</span>
        {subtitle ? (
          <span
            className={cn(
              'mt-0.5 block text-sm text-muted-foreground',
              wrap ? 'text-pretty' : 'truncate',
            )}
          >
            {subtitle}
          </span>
        ) : null}
        {meta ? <span className="mt-1.5 flex flex-wrap items-center gap-1.5">{meta}</span> : null}
      </span>
      {trailing ? <span className="shrink-0 text-right">{trailing}</span> : null}
    </>
  )
}

const rowBase = 'flex w-full min-h-16 items-center gap-3 px-4 py-3 text-left'

/** A row that navigates. Renders as a link so keyboard and long-press behave natively. */
export function LinkRow({
  to,
  chevron = true,
  ...content
}: RowContentProps & { to: string; chevron?: boolean }) {
  return (
    <Link
      to={to}
      className={cn(rowBase, 'transition-colors hover:bg-accent/60 active:bg-accent')}
    >
      <RowContent {...content} />
      {chevron ? (
        <ChevronRight className="size-4 shrink-0 text-muted-foreground/70" aria-hidden />
      ) : null}
    </Link>
  )
}

/** A row that is only information. Not focusable, so it stays out of the tab order. */
export function Row({ className, ...content }: RowContentProps & { className?: string }) {
  return (
    <div className={cn(rowBase, className)}>
      <RowContent {...content} />
    </div>
  )
}

/** A row that performs an action in place, such as toggling or opening a sheet. */
export function ButtonRow({
  onClick,
  chevron = false,
  disabled,
  ...content
}: RowContentProps & { onClick: () => void; chevron?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        rowBase,
        'transition-colors hover:bg-accent/60 active:bg-accent disabled:opacity-50',
      )}
    >
      <RowContent {...content} />
      {chevron ? (
        <ChevronRight className="size-4 shrink-0 text-muted-foreground/70" aria-hidden />
      ) : null}
    </button>
  )
}
