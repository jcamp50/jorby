import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { MemberMark, RatingText, ScreenHeader, Surface } from '@/components/ui/chrome'
import { watchDetailPath } from '@/lib/routes'
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
      <ScreenHeader title="Watch" description="Shared progress on shows. A missing want is not a yes." />
      <div className="mb-4 flex flex-wrap gap-2">
        {(['ALL', ...statuses] as const).map((item) => (
          <button
            key={item}
            type="button"
            className={`min-h-11 rounded-full border px-3 text-sm ${status === item ? 'border-foreground bg-muted' : 'border-border'}`}
            onClick={() => setStatus(item)}
          >
            {item === 'ALL' ? 'All' : item.replaceAll('_', ' ').toLowerCase()}
          </button>
        ))}
      </div>
      <ul className="space-y-3">
        {visible.map((entry) => (
          <li key={entry.id}>
            <Link to={watchDetailPath(householdId, entry.id)}>
              <Surface>
                <p className="font-medium">{entry.title}</p>
                <p className="text-sm text-muted-foreground">
                  {entry.year} · {entry.mediaType === 'SHOW' ? 'Show' : 'Movie'} · {entry.status.toLowerCase()}
                  {everyoneWants(entry, members.length) ? ' · Everyone wants' : ''}
                </p>
              </Surface>
            </Link>
          </li>
        ))}
      </ul>
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
    <div className="space-y-6">
      <p className="text-sm">
        <Link className="underline" to={`/${householdId}/watch`}>
          Watch
        </Link>
      </p>
      <ScreenHeader title={entry.title} description={`${entry.year} · ${entry.mediaType === 'SHOW' ? 'Show' : 'Movie'}`} />
      <p className="text-sm capitalize">{entry.status.toLowerCase()}</p>
      {entry.mediaType === 'SHOW' && entry.lastWatchedSeasonNumber ? (
        <p className="text-sm text-muted-foreground">
          Shared progress: last finished S{entry.lastWatchedSeasonNumber} E{entry.lastWatchedEpisodeNumber}
        </p>
      ) : null}
      <Button type="button" variant={wants ? 'default' : 'outline'} onClick={() => toggleWantToWatch(entry.id)}>
        {wants ? 'You want to watch this' : 'I want to watch this'}
      </Button>
      <p className="text-sm text-muted-foreground">
        {everyoneWants(entry, members.length)
          ? 'Everyone currently wants this.'
          : `${entry.wantsMembershipIds.length} of ${members.length} members want this.`}
      </p>
      <ul className="flex gap-2">
        {members.map((member) => (
          <li key={member.id} className="flex items-center gap-2 text-sm">
            <MemberMark member={member} />
            {entry.wantsMembershipIds.includes(member.id) ? `${member.displayName} wants it` : `${member.displayName} has not said yes`}
          </li>
        ))}
      </ul>
      {entry.reviews.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-medium">Reviews</h2>
          {entry.reviews.map((review) => {
            const member = members.find((item) => item.id === review.membershipId)
            return (
              <Surface key={review.membershipId}>
                <div className="flex items-center gap-2 text-sm">
                  {member ? <MemberMark member={member} /> : null}
                  <span>{member?.displayName}</span>
                  <RatingText halfStars={review.ratingHalfStars} />
                </div>
                <p className="mt-1 text-sm">{review.reviewText}</p>
              </Surface>
            )
          })}
        </section>
      ) : null}
    </div>
  )
}
