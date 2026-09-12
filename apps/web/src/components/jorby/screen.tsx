import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

/**
 * The tinted gradient behind the top of every screen. Fixed rather than
 * scrolled, so the colour stays where the eye starts, and non-interactive so it
 * never intercepts a tap.
 */
export function PageWash() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[42svh] bg-gradient-to-b from-section-wash to-transparent"
    />
  )
}

export function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className={cn(
        '-ml-1 mb-3 inline-flex h-11 items-center gap-1 rounded-full bg-card/70 pr-4 pl-2.5 text-sm font-medium backdrop-blur',
        'shadow-card transition-colors hover:bg-card',
        'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
      )}
    >
      <ChevronLeft className="size-4" aria-hidden />
      {label}
    </Link>
  )
}

export function ScreenHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3 px-1">
      <div className="min-w-0">
        <h1 className="text-[1.75rem] leading-tight font-extrabold tracking-[-0.02em] text-balance">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 text-sm text-muted-foreground text-pretty">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

/** The uppercase micro-label that introduces a group. */
export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-2 px-1 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
      {children}
    </h2>
  )
}

/**
 * The one saturated element on a screen, in the current section hue. Actions
 * inside it are translucent white pills.
 */
export function HeroCard({
  eyebrow,
  children,
  className,
}: {
  eyebrow?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-5 rounded-2xl bg-section p-5 text-white shadow-float', className)}>
      {eyebrow ? (
        <p className="mb-2 text-[11px] font-semibold tracking-[0.08em] text-white/75 uppercase">
          {eyebrow}
        </p>
      ) : null}
      {children}
    </div>
  )
}

/** A translucent pill for use inside a HeroCard, where the backdrop is saturated. */
export function HeroAction({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex h-11 items-center gap-2 rounded-full bg-black/20 px-4 text-sm font-semibold text-white',
        'transition-colors hover:bg-black/30',
        'focus-visible:ring-[3px] focus-visible:ring-white/50 focus-visible:outline-none',
      )}
    >
      {children}
    </Link>
  )
}

/**
 * A screen's primary action, held above the tab bar so it stays thumb-reachable
 * with the keyboard open. Floats as its own card rather than a full-width bar,
 * to match the rest of the chrome.
 */
export function StickyActions({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-[var(--tab-bar-space)] z-10 -mx-1 mt-4 rounded-2xl bg-card/85 p-2 shadow-float backdrop-blur-xl md:bottom-2">
      {children}
    </div>
  )
}

/** The quiet "see all" link that sits beside a CardGroup label. */
export function GroupLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="-my-2 inline-flex h-11 items-center rounded-full px-2 text-sm font-semibold text-section-ink transition-colors hover:bg-card/60"
    >
      {children}
    </Link>
  )
}

/** Horizontally scrollable filter row; chips stay full-size instead of wrapping into cramped rows. */
export function FilterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      role="group"
      aria-label={label}
      className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {children}
    </div>
  )
}

export function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'inline-flex h-11 shrink-0 items-center rounded-full px-4 text-sm font-medium whitespace-nowrap transition-colors',
        'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
        active
          ? 'bg-section text-white shadow-card'
          : 'bg-card/70 text-foreground shadow-card backdrop-blur hover:bg-card',
      )}
    >
      {children}
    </button>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-2xl bg-card px-6 py-10 text-center text-sm text-muted-foreground shadow-card">
      {children}
    </p>
  )
}
