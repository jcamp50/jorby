import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MemberMark, RatingText, ScreenHeader, Surface } from '@/components/ui/chrome'
import { placeDetailPath } from '@/lib/routes'
import { reviewSpread } from '@/prototype/model'
import { usePrototype } from '@/prototype/PrototypeProvider'

type PlaceFilter = 'all' | 'want' | 'been' | 'favorite' | 'disagree'

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

  const filters: { id: PlaceFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'want', label: 'Want to go' },
    { id: 'been', label: 'Been' },
    { id: 'favorite', label: 'Favorite' },
    { id: 'disagree', label: 'We disagree' },
  ]

  return (
    <div>
      <ScreenHeader title="Places" description="Search-to-add is mocked as seeded restaurants for now." />
      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`min-h-11 rounded-full border px-3 text-sm ${filter === item.id ? 'border-foreground bg-muted' : 'border-border'}`}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing matches this filter.</p>
      ) : (
        <ul className="space-y-3">
          {visible.map((place) => (
            <li key={place.id}>
              <Link to={placeDetailPath(householdId, place.id)}>
                <Surface>
                  <p className="font-medium">{place.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {place.visitState === 'WANT_TO_GO' ? 'Want to go' : 'Been'}
                    {place.isFavorite ? ' · Favorite' : ''} · {place.cuisine} · {place.neighborhood}
                  </p>
                </Surface>
              </Link>
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
    return <p className="text-sm text-muted-foreground">This place isn’t available.</p>
  }

  return (
    <div className="space-y-6">
      <p className="text-sm">
        <Link className="underline" to={`/${householdId}/places`}>
          Places
        </Link>
      </p>
      <ScreenHeader
        title={place.name}
        description={`${place.cuisine} · ${place.neighborhood}`}
      />
      <p className="text-sm">
        {place.visitState === 'WANT_TO_GO' ? 'Want to go' : 'Been'}
        {place.isFavorite ? ' · Favorite' : ''}
      </p>
      {place.sharedNote ? <p className="text-sm text-muted-foreground">{place.sharedNote}</p> : null}
      <section className="space-y-3">
        <h2 className="text-sm font-medium">Reviews</h2>
        {reviews.map((review) => {
          const member = members.find((item) => item.id === review.membershipId)
          return (
            <Surface key={review.membershipId} className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                {member ? <MemberMark member={member} /> : null}
                <span>{member?.displayName}</span>
                <RatingText halfStars={review.ratingHalfStars} />
              </div>
              <p className="text-sm">{review.reviewText}</p>
            </Surface>
          )
        })}
      </section>
    </div>
  )
}
