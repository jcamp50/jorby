import { Clapperboard, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { MemberMark } from '@/components/jorby/member-mark'
import { averageStars, ReviewGroup } from '@/components/jorby/review'
import { BackLink, StickyActions } from '@/components/jorby/screen'
import { Button } from '@/components/ui/button'
import { householdPath } from '@/lib/routes'
import { suggestedByCopy } from '@/lib/watch-display'
import type { Member, MemberReview } from '@/prototype/model'

export function WatchDetailView({
  householdId,
  title,
  year,
  mediaType,
  statusLabel,
  overview,
  posterUrl,
  director,
  genres,
  cast,
  suggestedBy,
  everyoneWants,
  reviews,
  members,
  wants,
  busy,
  onToggleWant,
  sticky,
  children,
}: {
  householdId: string
  title: string
  year?: number | null
  mediaType?: string | null
  statusLabel: string
  overview?: string
  posterUrl?: string
  director?: string
  genres?: string[]
  cast?: string[]
  suggestedBy: Member[]
  everyoneWants?: boolean
  reviews: MemberReview[]
  members: Member[]
  wants?: boolean
  busy?: boolean
  onToggleWant?: () => void
  sticky?: ReactNode
  children?: ReactNode
}) {
  const kind = mediaType === 'SHOW' ? 'Show' : mediaType === 'MOVIE' ? 'Movie' : undefined
  const meta = [year, kind, ...(genres ?? [])].filter(Boolean).join(' · ')
  const suggested = suggestedByCopy(
    suggestedBy.map((member) => member.displayName),
    everyoneWants === true,
  )
  const facts: { key: string; label: string; value: string; icon: ReactNode }[] = []
  if (director) {
    facts.push({
      key: 'director',
      label: 'Director',
      value: director,
      icon: <Clapperboard className="size-4 text-muted-foreground" aria-hidden />,
    })
  }
  if (cast && cast.length > 0) {
    facts.push({
      key: 'cast',
      label: 'Cast',
      value: cast.slice(0, 5).join(', '),
      icon: <Users className="size-4 text-muted-foreground" aria-hidden />,
    })
  }

  return (
    <div>
      <BackLink to={householdPath(householdId, 'watch')} label="Watch" />
      <div className="mb-5 flex gap-4">
        <figure className="aspect-[2/3] w-[7.75rem] shrink-0 overflow-hidden rounded-2xl bg-section/30 shadow-card">
          {posterUrl ? <img src={posterUrl} alt="" className="size-full object-cover" /> : null}
        </figure>
        <div className="min-w-0 flex-1 pt-1">
          <h1 className="text-[1.75rem] leading-tight font-extrabold tracking-[-0.02em] text-balance">
            {title}
          </h1>
          {meta ? <p className="mt-1.5 text-sm text-muted-foreground text-pretty">{meta}</p> : null}
          {statusLabel ? <p className="mt-2 text-sm font-semibold">{statusLabel}</p> : null}
          {suggested && suggestedBy.length > 0 ? (
            <div className="mt-3 flex items-center gap-2">
              <span className="flex -space-x-1.5">
                {suggestedBy.map((member) => (
                  <MemberMark key={member.id} member={member} />
                ))}
              </span>
              <p className="text-sm text-muted-foreground text-pretty">{suggested}</p>
            </div>
          ) : null}
        </div>
      </div>

      {overview ? (
        <p className="mb-5 px-1 text-[0.9375rem] leading-relaxed text-pretty">{overview}</p>
      ) : null}

      {facts.length > 0 ? (
        <dl className="mb-5 space-y-3 px-1">
          {facts.map((fact) => (
            <div key={fact.key} className="flex items-start gap-3">
              <span className="mt-0.5">{fact.icon}</span>
              <dt className="sr-only">{fact.label}</dt>
              <dd className="text-sm font-medium text-pretty">{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <ReviewGroup
        reviews={reviews}
        members={members}
        average={averageStars(reviews)}
        emptyMessage="Neither of us has reviewed this yet."
      />

      {children}

      {onToggleWant || sticky ? (
        <StickyActions>
          <div className="flex flex-col gap-2">
            {onToggleWant ? (
              <Button
                type="button"
                size="lg"
                variant={wants ? 'default' : 'outline'}
                aria-pressed={wants}
                className="h-11 w-full rounded-full"
                disabled={busy}
                onClick={onToggleWant}
              >
                {wants ? 'You want to watch this' : 'I want to watch this'}
              </Button>
            ) : null}
            {sticky}
          </div>
        </StickyActions>
      ) : null}
    </div>
  )
}
