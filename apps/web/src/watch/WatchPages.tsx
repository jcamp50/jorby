import { Check, ChevronRight, Minus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MemberMark } from '@/components/jorby/member-mark'
import { Rating } from '@/components/jorby/rating'
import {
  BackLink,
  EmptyState,
  FilterChip,
  FilterRow,
  ScreenHeader,
  SectionHeading,
} from '@/components/jorby/screen'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { householdPath, watchDetailPath } from '@/lib/routes'
import { everyoneWants } from '@/prototype/model'
import { usePrototype } from '@/prototype/PrototypeProvider'

const statuses = ['WATCHLIST', 'WATCHING', 'WATCHED', 'DROPPED'] as const

export function WatchIndexPage() {
  const { householdId = '' } = useParams()
  const { watch, members } = usePrototype()
  const [status, setStatus] = useState<(typeof statuses)[number] | 'ALL'>('ALL')
  const visible = useMemo(
    () => (status === 'ALL' ? watch : watch.filter((entry) => entry.status === status)),
    [status, watch],
  )

  return (
    <div>
      <ScreenHeader
        title="Watch"
        description="Shared progress on shows. A missing want is not a yes."
      />
      <FilterRow label="Filter by status">
        {(['ALL', ...statuses] as const).map((item) => (
          <FilterChip key={item} active={status === item} onClick={() => setStatus(item)}>
            <span className="capitalize">{item === 'ALL' ? 'All' : item.toLowerCase()}</span>
          </FilterChip>
        ))}
      </FilterRow>
      {visible.length === 0 ? (
        <EmptyState>Nothing matches this filter.</EmptyState>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {visible.map((entry) => (
            <li key={entry.id}>
              <Card className="gap-0 py-0 transition-colors hover:bg-accent/40">
                <Link
                  to={watchDetailPath(householdId, entry.id)}
                  className="flex min-h-16 items-center gap-3 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-pretty">{entry.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {entry.year} · {entry.mediaType === 'SHOW' ? 'Show' : 'Movie'}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <Badge variant="secondary" className="capitalize">
                        {entry.status.toLowerCase()}
                      </Badge>
                      {everyoneWants(entry, members.length) ? <Badge>Everyone wants</Badge> : null}
                    </div>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function WatchDetailPage() {
  const { watchEntryId = '', householdId = '' } = useParams()
  const { watch, members, currentMembershipId, toggleWantToWatch } = usePrototype()
  const entry = watch.find((item) => item.id === watchEntryId)

  if (!entry) {
    return <p className="text-sm text-muted-foreground">This title isn’t available.</p>
  }

  const wants = entry.wantsMembershipIds.includes(currentMembershipId)

  return (
    <div>
      <BackLink to={householdPath(householdId, 'watch')} label="Watch" />
      <ScreenHeader
        title={entry.title}
        description={`${entry.year} · ${entry.mediaType === 'SHOW' ? 'Show' : 'Movie'}`}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Badge variant="secondary" className="capitalize">
          {entry.status.toLowerCase()}
        </Badge>
        {entry.mediaType === 'SHOW' && entry.lastWatchedSeasonNumber ? (
          <Badge variant="outline">
            Up to S{entry.lastWatchedSeasonNumber} E{entry.lastWatchedEpisodeNumber}
          </Badge>
        ) : null}
      </div>

      <Button
        type="button"
        size="lg"
        variant={wants ? 'default' : 'outline'}
        aria-pressed={wants}
        className="h-12 w-full sm:w-auto"
        onClick={() => toggleWantToWatch(entry.id)}
      >
        {wants ? 'You want to watch this' : 'I want to watch this'}
      </Button>

      <section className="mt-6">
        <SectionHeading>
          {everyoneWants(entry, members.length)
            ? 'Everyone wants this'
            : `${entry.wantsMembershipIds.length} of ${members.length} want this`}
        </SectionHeading>
        <ul className="space-y-2">
          {members.map((member) => {
            const memberWants = entry.wantsMembershipIds.includes(member.id)
            return (
              <li
                key={member.id}
                className="flex min-h-12 items-center gap-2 rounded-lg border px-4 text-sm"
              >
                <MemberMark member={member} />
                <span className="font-medium">{member.displayName}</span>
                <span className="ml-auto flex items-center gap-1.5 text-muted-foreground">
                  {memberWants ? (
                    <Check className="size-4" aria-hidden />
                  ) : (
                    <Minus className="size-4" aria-hidden />
                  )}
                  {memberWants ? 'Wants it' : 'Has not said yes'}
                </span>
              </li>
            )
          })}
        </ul>
      </section>

      {entry.reviews.length > 0 ? (
        <section className="mt-6">
          <SectionHeading>Reviews</SectionHeading>
          <div className="grid gap-3 sm:grid-cols-2">
            {entry.reviews.map((review) => {
              const member = members.find((item) => item.id === review.membershipId)
              return (
                <Card key={review.membershipId} className="gap-2 py-4">
                  <div className="flex items-center gap-2 px-4 text-sm">
                    {member ? <MemberMark member={member} /> : null}
                    <span className="font-medium">{member?.displayName}</span>
                    <Rating halfStars={review.ratingHalfStars} className="ml-auto" />
                  </div>
                  <p className="px-4 text-sm text-pretty">{review.reviewText}</p>
                </Card>
              )
            })}
          </div>
        </section>
      ) : null}
    </div>
  )
}
