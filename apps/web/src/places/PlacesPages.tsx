import { ChevronRight, Heart } from 'lucide-react'
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
import { NotFoundState } from '@/components/jorby/states'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { householdPath, placeDetailPath } from '@/lib/routes'
import { reviewSpread } from '@/prototype/model'
import { usePrototype } from '@/prototype/PrototypeProvider'

type PlaceFilter = 'all' | 'want' | 'been' | 'favorite' | 'disagree'

const filters: { id: PlaceFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'want', label: 'Want to go' },
  { id: 'been', label: 'Been' },
  { id: 'favorite', label: 'Favorite' },
  { id: 'disagree', label: 'We disagree' },
]

export function PlacesIndexPage() {
  const { householdId = '' } = useParams()
  const { places, placeReviews } = usePrototype()
  const [filter, setFilter] = useState<PlaceFilter>('all')

  const visible = useMemo(() => {
    return places.filter((place) => {
      const reviews = placeReviews[place.id]
      if (filter === 'want') {
        return place.visitState === 'WANT_TO_GO'
      }
      if (filter === 'been') {
        return place.visitState === 'BEEN'
      }
      if (filter === 'favorite') {
        return place.isFavorite
      }
      if (filter === 'disagree') {
        return (reviewSpread(reviews) ?? 0) >= 3
      }
      return true
    })
  }, [filter, places, placeReviews])

  return (
    <div>
      <ScreenHeader
        title="Places"
        description="Search-to-add is mocked as seeded restaurants for now."
      />
      <FilterRow label="Filter places">
        {filters.map((item) => (
          <FilterChip
            key={item.id}
            active={filter === item.id}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </FilterChip>
        ))}
      </FilterRow>
      {visible.length === 0 ? (
        <EmptyState>Nothing matches this filter.</EmptyState>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {visible.map((place) => (
            <li key={place.id}>
              <Card className="gap-0 py-0 transition-colors hover:bg-accent/40">
                <Link
                  to={placeDetailPath(householdId, place.id)}
                  className="flex min-h-16 items-center gap-3 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-medium">
                      <span className="truncate">{place.name}</span>
                      {place.isFavorite ? (
                        <Heart className="size-3.5 shrink-0 fill-current" aria-label="Favorite" />
                      ) : null}
                    </p>
                    <p className="text-sm text-muted-foreground text-pretty">
                      {place.cuisine} · {place.neighborhood}
                    </p>
                    <Badge variant="secondary" className="mt-1.5">
                      {place.visitState === 'WANT_TO_GO' ? 'Want to go' : 'Been'}
                    </Badge>
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

export function PlaceDetailPage() {
  const { placeEntryId = '', householdId = '' } = useParams()
  const { places, placeReviews, members } = usePrototype()
  const place = places.find((item) => item.id === placeEntryId)
  const reviews = place ? (placeReviews[place.id] ?? []) : []

  if (!place) {
    return <NotFoundState backTo={householdPath(householdId, 'places')} backLabel="Places" />
  }

  return (
    <div>
      <BackLink to={householdPath(householdId, 'places')} label="Places" />
      <ScreenHeader title={place.name} description={`${place.cuisine} · ${place.neighborhood}`} />

      <div className="mb-6 flex flex-wrap gap-2">
        <Badge variant="secondary">
          {place.visitState === 'WANT_TO_GO' ? 'Want to go' : 'Been'}
        </Badge>
        {place.isFavorite ? <Badge variant="secondary">Favorite</Badge> : null}
      </div>

      {place.sharedNote ? (
        <p className="mb-6 text-sm text-muted-foreground text-pretty">{place.sharedNote}</p>
      ) : null}

      <section>
        <SectionHeading>Reviews</SectionHeading>
        {reviews.length === 0 ? (
          <EmptyState>Neither of us has reviewed this yet.</EmptyState>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {reviews.map((review) => {
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
        )}
      </section>
    </div>
  )
}
