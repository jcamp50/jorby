import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MemberMark } from '@/components/jorby/member-mark'
import { Rating } from '@/components/jorby/rating'
import { EmptyState, ScreenHeader, SectionHeading } from '@/components/jorby/screen'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { listDetailPath, placeDetailPath, thingDetailPath, watchDetailPath } from '@/lib/routes'
import { reviewSpread } from '@/prototype/model'
import { usePrototype } from '@/prototype/PrototypeProvider'

function RowCard({
  to,
  eyebrow,
  title,
  detail,
  children,
}: {
  to: string
  eyebrow?: ReactNode
  title: string
  detail?: ReactNode
  children?: ReactNode
}) {
  return (
    <Card className="gap-0 py-0 transition-colors hover:bg-accent/40">
      <Link to={to} className="flex min-h-16 items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          {eyebrow ? <div className="mb-1.5">{eyebrow}</div> : null}
          <p className="font-medium text-pretty">{title}</p>
          {detail ? <p className="text-sm text-muted-foreground text-pretty">{detail}</p> : null}
          {children}
        </div>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      </Link>
    </Card>
  )
}

export function HomePage() {
  const { householdId = '' } = useParams()
  const {
    unfinishedLists,
    weShouldPlaces,
    watchTonight,
    wishThings,
    placeReviews,
    places,
    members,
  } = usePrototype()

  const disagreements = Object.entries(placeReviews).filter(
    ([, reviews]) => (reviewSpread(reviews) ?? 0) >= 3,
  )
  const weShouldCount = weShouldPlaces.length + watchTonight.length + wishThings.length

  return (
    <div className="space-y-8">
      <ScreenHeader title="Home" description="What we should do, and what’s still open." />

      <section>
        <SectionHeading>We should</SectionHeading>
        {weShouldCount === 0 ? (
          <EmptyState>Nothing queued up yet.</EmptyState>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {weShouldPlaces.map((place) => (
              <RowCard
                key={place.id}
                to={placeDetailPath(householdId, place.id)}
                eyebrow={<Badge variant="secondary">Want to go</Badge>}
                title={place.name}
                detail={`${place.cuisine} · ${place.neighborhood}`}
              />
            ))}
            {watchTonight.map((entry) => (
              <RowCard
                key={entry.id}
                to={watchDetailPath(householdId, entry.id)}
                eyebrow={<Badge variant="secondary">Everyone wants</Badge>}
                title={entry.title}
                detail={entry.year}
              />
            ))}
            {wishThings.map((thing) => (
              <RowCard
                key={thing.id}
                to={thingDetailPath(householdId, thing.id)}
                eyebrow={<Badge variant="secondary">Wish</Badge>}
                title={thing.name}
                detail={thing.priceLabel ?? thing.recipientLabel}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeading>Open lists</SectionHeading>
        {unfinishedLists.length === 0 ? (
          <EmptyState>Every list is finished.</EmptyState>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {unfinishedLists.map(({ list, remaining }) => (
              <RowCard
                key={list.id}
                to={listDetailPath(householdId, list.id)}
                title={list.name}
                detail={`${list.isPinned ? 'Pinned · ' : ''}${remaining} open ${
                  remaining === 1 ? 'item' : 'items'
                }`}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeading>We disagree</SectionHeading>
        {disagreements.length === 0 ? (
          <EmptyState>No big rating gaps right now.</EmptyState>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {disagreements.map(([placeId, reviews]) => {
              const spread = reviewSpread(reviews) ?? 0
              const place = places.find((entry) => entry.id === placeId)
              return (
                <RowCard
                  key={placeId}
                  to={placeDetailPath(householdId, placeId)}
                  title={place?.name ?? 'Place'}
                  detail={`${spread / 2} stars apart`}
                >
                  <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                    {reviews.map((review) => {
                      const member = members.find((item) => item.id === review.membershipId)
                      return (
                        <li
                          key={review.membershipId}
                          className="flex items-center gap-1.5 text-sm text-muted-foreground"
                        >
                          {member ? <MemberMark member={member} /> : null}
                          <span>{member?.displayName}</span>
                          <Rating halfStars={review.ratingHalfStars} />
                        </li>
                      )
                    })}
                  </ul>
                </RowCard>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
