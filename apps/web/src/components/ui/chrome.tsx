import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { Member } from '@/prototype/model'

export function MemberMark({ member, className }: { member: Member; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex min-h-7 min-w-7 items-center justify-center rounded-full border border-border bg-muted text-xs font-medium',
        className,
      )}
      title={`${member.displayName} (${member.profileLabel})`}
    >
      <span className="sr-only">{member.displayName}</span>
      {member.initials}
    </span>
  )
}

export function RatingText({ halfStars }: { halfStars: number }) {
  const stars = halfStars / 2
  return <span aria-label={`${stars} out of 5 stars`}>{stars.toFixed(1)} / 5</span>
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
    <div className="mb-6 flex items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function Surface({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn('rounded-lg border border-border bg-card p-4', className)}>{children}</div>
}
