import { Heart, MapPin, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Stat } from '@/components/jorby/amount'
import { CardGroup, LinkRow, Row, RowList } from '@/components/jorby/card-group'
import { averageStars, ReviewGroup } from '@/components/jorby/review'
import {
  BackLink,
  EmptyState,
  FilterChip,
  FilterRow,
  HeroCard,
  ScreenHeader,
} from '@/components/jorby/screen'
import { NotFoundState } from '@/components/jorby/states'
import { Tile } from '@/components/jorby/tile'
import { Badge } from '@/components/ui/badge'
import { householdPath, placeDetailPath } from '@/lib/routes'
import { FoundryCatalogPending } from '@/osdk/FoundryCatalogPending'
import { usesFoundryData } from '@/osdk/household-route'
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
  if (usesFoundryData(householdId)) {
    return (
      <FoundryCatalogPending
        title="Places"
        body="Places are not in the consumer SDK yet. Provider search will stay in Foundry Functions, not the browser."
      />
    )
  }
  return <PrototypePlacesIndex householdId={householdId} />
}

function PrototypePlacesIndex({ householdId }: { householdId: string }) {
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
        <CardGroup>
          <RowList>
            {visible.map((place) => {
              const average = averageStars(placeReviews[place.id] ?? [])
              return (
                <LinkRow
                  key={place.id}
                  to={placeDetailPath(householdId, place.id)}
                  leading={<Tile icon={place.isFavorite ? Heart : MapPin} tone="places" />}
                  title={place.name}
                  subtitle={`${place.cuisine} · ${place.neighborhood}`}
                  meta={
                    <>
                      <Badge variant="secondary" className="rounded-full">
                        {place.visitState === 'WANT_TO_GO' ? 'Want to go' : 'Been'}
                      </Badge>
                      {place.isFavorite ? (
                        <Badge variant="secondary" className="rounded-full">
                          Favorite
                        </Badge>
                      ) : null}
                    </>
                  }
                  trailing={
                    average !== null ? (
                      <span className="inline-flex items-center gap-1 text-sm font-semibold tabular-nums">
                        <Star className="size-3.5 fill-current" aria-hidden />
                        {average.toFixed(1)}
                        <span className="sr-only">average stars out of 5</span>
                      </span>
                    ) : undefined
                  }
                />
              )
            })}
          </RowList>
        </CardGroup>
      )}
    </div>
  )
}

export function PlaceDetailPage() {
  const { placeEntryId = '', householdId = '' } = useParams()
  if (usesFoundryData(householdId)) {
    return (
      <FoundryCatalogPending
        title="Places"
        body="Places are not in the consumer SDK yet. Provider search will stay in Foundry Functions, not the browser."
      />
    )
  }
  return <PrototypePlaceDetail householdId={householdId} placeEntryId={placeEntryId} />
}

function PrototypePlaceDetail({
  householdId,
  placeEntryId,
}: {
  householdId: string
  placeEntryId: string
}) {
  const { places, placeReviews, members } = usePrototype()
  const place = places.find((item) => item.id === placeEntryId)
  const reviews = place ? (placeReviews[place.id] ?? []) : []

  if (!place) {
    return <NotFoundState backTo={householdPath(householdId, 'places')} backLabel="Places" />
  }

  const average = averageStars(reviews)
  const spread = reviewSpread(reviews)

  return (
    <div>
      <BackLink to={householdPath(householdId, 'places')} label="Places" />
      <ScreenHeader title={place.name} description={`${place.cuisine} · ${place.neighborhood}`} />

      <HeroCard eyebrow={average !== null ? 'Our rating' : 'Status'}>
        {average !== null ? (
          <>
            <Stat value={average.toFixed(1)} unit="of 5" />
            <p className="mt-1.5 text-[0.9375rem] font-medium text-white/85">
              {spread !== null && spread >= 3
                ? `We are ${spread / 2} stars apart on this one.`
                : 'We agree on this one.'}
            </p>
          </>
        ) : (
          <p className="text-lg font-semibold text-pretty">
            {place.visitState === 'WANT_TO_GO'
              ? 'We still want to go here.'
              : 'We have been, but neither of us has reviewed it.'}
          </p>
        )}
      </HeroCard>

      <CardGroup label="Details">
        <RowList>
          <Row
            title="Visit state"
            trailing={
              <span className="text-sm font-semibold">
                {place.visitState === 'WANT_TO_GO' ? 'Want to go' : 'Been'}
              </span>
            }
          />
          <Row
            title="Favorite"
            trailing={<span className="text-sm font-semibold">{place.isFavorite ? 'Yes' : 'No'}</span>}
          />
          {place.sharedNote ? <Row title="Our note" subtitle={place.sharedNote} wrap /> : null}
        </RowList>
      </CardGroup>

      <ReviewGroup
        reviews={reviews}
        members={members}
        emptyMessage="Neither of us has reviewed this yet."
      />
    </div>
  )
}
