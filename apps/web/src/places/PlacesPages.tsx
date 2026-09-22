import { Heart, MapPin, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CardGroup, LinkRow, RowList } from '@/components/jorby/card-group'
import { PlaceCreate } from '@/components/jorby/create/forms'
import { averageStars } from '@/components/jorby/review'
import {
  EmptyState,
  ScreenHeader,
} from '@/components/jorby/screen'
import { SectionTabs } from '@/components/jorby/section-tabs'
import { NotFoundState } from '@/components/jorby/states'
import { Tile } from '@/components/jorby/tile'
import { Badge } from '@/components/ui/badge'
import { toastResult } from '@/lib/action-toast'
import { householdPath, placeDetailPath } from '@/lib/routes'
import { FoundryPlaceDetail, FoundryPlacesIndex } from '@/osdk/FoundryPlaces'
import { usesFoundryData } from '@/osdk/household-route'
import { PlaceDetailView } from '@/places/PlaceDetailView'
import { catalogHits, extraPlaceCatalog, reviewSpread } from '@/prototype/model'
import { usePrototype } from '@/prototype/PrototypeProvider'

type PlaceFilter = 'want' | 'been' | 'favorite'

const filters: { id: PlaceFilter; label: string }[] = [
  { id: 'want', label: 'Want to go' },
  { id: 'been', label: 'Been' },
  { id: 'favorite', label: 'Favorite' },
]

export function PlacesIndexPage() {
  const { householdId = '' } = useParams()
  if (usesFoundryData(householdId)) {
    return <FoundryPlacesIndex householdId={householdId} />
  }
  return <PrototypePlacesIndex householdId={householdId} />
}

function PrototypePlacesIndex({ householdId }: { householdId: string }) {
  const { places, placeReviews, createPlace } = usePrototype()
  const [filter, setFilter] = useState<PlaceFilter>('want')
  const [query, setQuery] = useState('')
  const hits = catalogHits(
    extraPlaceCatalog,
    query,
    places.map((place) => place.name),
  )

  const visible = useMemo(() => {
    return places.filter((place) => {
      if (filter === 'want') {
        return place.visitState === 'WANT_TO_GO'
      }
      if (filter === 'been') {
        return place.visitState === 'BEEN'
      }
      return place.isFavorite
    })
  }, [filter, places])

  return (
    <div>
      <ScreenHeader title="Places" />
      <SectionTabs
        label="Filter places"
        value={filter}
        onValueChange={(value) => setFilter(value as PlaceFilter)}
        options={filters.map((item) => ({ value: item.id, label: item.label }))}
      />
      {visible.length === 0 ? (
        <EmptyState>Nothing in {filters.find((item) => item.id === filter)?.label} yet.</EmptyState>
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
                  subtitle={[place.cuisine, place.neighborhood].filter(Boolean).join(' · ') || undefined}
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

      <PlaceCreate
        hits={hits.map((hit) => ({
          id: hit.id,
          title: hit.name,
          subtitle: `${hit.cuisine} · ${hit.neighborhood}`,
          neighborhood: hit.neighborhood,
          cuisine: hit.cuisine,
        }))}
        onQueryChange={setQuery}
        onCreate={(input) =>
          toastResult(
            createPlace(input.name, {
              neighborhood: input.neighborhood,
              cuisine: input.cuisine,
              visitState: input.visitState,
              isFavorite: input.isFavorite,
              sharedNote: input.sharedNote,
              tags: input.tags,
              photoUrl: input.photo?.previewUrl,
            }),
          )
        }
      />
    </div>
  )
}

export function PlaceDetailPage() {
  const { placeEntryId = '', householdId = '' } = useParams()
  if (usesFoundryData(householdId)) {
    return <FoundryPlaceDetail householdId={householdId} placeEntryId={placeEntryId} />
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
  const { places, placeReviews, members, togglePlaceFavorite } = usePrototype()
  const place = places.find((item) => item.id === placeEntryId)
  const reviews = place ? (placeReviews[place.id] ?? []) : []

  if (!place) {
    return <NotFoundState backTo={householdPath(householdId, 'places')} backLabel="Places" />
  }

  return (
    <PlaceDetailView
      householdId={householdId}
      name={place.name}
      cuisine={place.cuisine}
      neighborhood={place.neighborhood}
      visitState={place.visitState}
      isFavorite={place.isFavorite}
      description={place.description}
      address={place.address}
      phoneNumber={place.phoneNumber}
      websiteUrl={place.websiteUrl}
      photoUrl={
        place.photoUrl ?? `https://picsum.photos/seed/${encodeURIComponent(place.id)}/1200/900`
      }
      sharedNote={place.sharedNote}
      reviews={reviews}
      members={members}
      average={averageStars(reviews)}
      spread={reviewSpread(reviews)}
      onToggleFavorite={() => togglePlaceFavorite(place.id)}
    />
  )
}
