import { Link, useParams } from 'react-router-dom'
import { MemberMark, RatingText, ScreenHeader, Surface } from '@/components/ui/chrome'
import { listDetailPath, placeDetailPath, thingDetailPath, watchDetailPath } from '@/lib/routes'
import { reviewSpread } from '@/prototype/model'
import { usePrototype } from '@/prototype/PrototypeProvider'

export function HomePage() {
  const { householdId = '' } = useParams()
  const {
    unfinishedLists,
    weShouldPlaces,
    watchTonight,
    wishThings,
    placeReviews,
    members,
  } = usePrototype()

  return (
    <div className="space-y-8">
      <ScreenHeader title="Home" description="What we should do, and what’s still open." />

      <section className="space-y-3">
        <h2 className="text-sm font-medium">We should</h2>
        <div className="grid gap-3">
          {weShouldPlaces.map((place) => (
            <Link key={place.id} to={placeDetailPath(householdId, place.id)}>
              <Surface>
                <p className="text-xs text-muted-foreground">Place · want to go</p>
                <p className="mt-1 font-medium">{place.name}</p>
                <p className="text-sm text-muted-foreground">
                  {place.cuisine} · {place.neighborhood}
                </p>
              </Surface>
            </Link>
          ))}
          {watchTonight.map((entry) => (
            <Link key={entry.id} to={watchDetailPath(householdId, entry.id)}>
              <Surface>
                <p className="text-xs text-muted-foreground">Watch · everyone wants</p>
                <p className="mt-1 font-medium">{entry.title}</p>
                <p className="text-sm text-muted-foreground">{entry.year}</p>
              </Surface>
            </Link>
          ))}
          {wishThings.map((thing) => (
            <Link key={thing.id} to={thingDetailPath(householdId, thing.id)}>
              <Surface>
                <p className="text-xs text-muted-foreground">Thing · wish</p>
                <p className="mt-1 font-medium">{thing.name}</p>
                <p className="text-sm text-muted-foreground">{thing.priceLabel ?? thing.recipientLabel}</p>
              </Surface>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium">Lists</h2>
        {unfinishedLists.map(({ list, remaining }) => (
          <Link key={list.id} to={listDetailPath(householdId, list.id)} className="block">
            <Surface>
              <p className="font-medium">{list.name}</p>
              <p className="text-sm text-muted-foreground">
                {list.isPinned ? 'Pinned · ' : ''}
                {remaining} open {remaining === 1 ? 'item' : 'items'}
              </p>
            </Surface>
          </Link>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium">We disagree</h2>
        {Object.entries(placeReviews)
          .filter(([, reviews]) => (reviewSpread(reviews) ?? 0) >= 3)
          .map(([placeId, reviews]) => {
            const spread = reviewSpread(reviews) ?? 0
            return (
              <Link key={placeId} to={placeDetailPath(householdId, placeId)} className="block">
                <Surface className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Spread of {spread / 2} stars ({spread} half-star units)
                  </p>
                  <ul className="space-y-1">
                    {reviews.map((review) => {
                      const member = members.find((item) => item.id === review.membershipId)
                      return (
                        <li key={review.membershipId} className="flex items-center gap-2 text-sm">
                          {member ? <MemberMark member={member} /> : null}
                          <span>{member?.displayName}</span>
                          <RatingText halfStars={review.ratingHalfStars} />
                        </li>
                      )
                    })}
                  </ul>
                </Surface>
              </Link>
            )
          })}
      </section>
    </div>
  )
}
