import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AppErrorCode, errorMessage, isRetryable } from '@/lib/errors'

// The `accent` token Skeleton defaults to is nearly invisible on a white card,
// so every placeholder bar sets its own contrast.
const BAR = 'bg-foreground/10'

/** Placeholder rows shaped like the card groups every index screen renders. */
export function CardListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-card shadow-card" aria-hidden>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex min-h-16 items-center gap-3 px-4 py-3">
          <Skeleton className={`size-10 shrink-0 rounded-xl ${BAR}`} />
          <div className="min-w-0 flex-1">
            <Skeleton className={`h-4 w-2/3 ${BAR}`} />
            <Skeleton className={`mt-2 h-3 w-1/3 ${BAR}`} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ScreenSkeleton({ rows }: { rows?: number }) {
  return (
    <div>
      <div className="mb-5 px-1" aria-hidden>
        <Skeleton className={`h-8 w-40 ${BAR}`} />
        <Skeleton className={`mt-2.5 h-4 w-64 ${BAR}`} />
      </div>
      <CardListSkeleton rows={rows} />
      {/* aria-label, not text alone: a status region takes its name from the label. */}
      <p role="status" aria-label="Loading" className="sr-only">
        Loading
      </p>
    </div>
  )
}

/** Shown while a background refresh runs over content that is already on screen. */
export function RefreshingBanner() {
  return (
    <p role="status" className="mb-3 px-1 text-sm text-muted-foreground">
      Refreshing…
    </p>
  )
}

export function ErrorState({ code, onRetry }: { code: AppErrorCode; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-2xl bg-card px-6 py-10 text-center shadow-card">
      <p className="text-sm">{errorMessage(code)}</p>
      {onRetry && isRetryable(code) ? (
        <Button type="button" variant="outline" className="mt-4 h-11 rounded-full" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  )
}

/**
 * Used for both "does not exist" and "you cannot see it", so the UI never
 * reveals that another household's record exists.
 */
export function NotFoundState({ backTo, backLabel }: { backTo: string; backLabel: string }) {
  return (
    <div className="rounded-2xl bg-card px-6 py-10 text-center shadow-card">
      <p className="text-sm">{errorMessage(AppErrorCode.NOT_FOUND_OR_HIDDEN)}</p>
      <Button asChild variant="outline" className="mt-4 h-11 rounded-full">
        <Link to={backTo}>Back to {backLabel}</Link>
      </Button>
    </div>
  )
}
