import {
  createJorbyManualPlace,
  getJorbyPlaceDetails,
  JorbyCatalogPlace,
  JorbyHousehold,
  JorbyHouseholdMembership,
  JorbyPlaceEntry,
  JorbyPlaceReview,
  JorbyVisit,
  manageJorbyPlaceReviews,
  saveJorbyProviderPlace,
  saveJorbyVisit,
  searchJorbyPlaces,
  setJorbyPlaceEntryArchived,
} from '@/osdk/resources'
import { useOsdkAction, useOsdkFunction, useOsdkObject, useOsdkObjects } from '@osdk/react'
import { Heart, MapPin } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CardGroup, LinkRow, Row, RowList } from '@/components/jorby/card-group'
import { PlaceCreate } from '@/components/jorby/create/forms'
import { averageStars } from '@/components/jorby/review'
import {
  EmptyState,
  ScreenHeader,
  StickyActions,
} from '@/components/jorby/screen'
import { SectionTabs } from '@/components/jorby/section-tabs'
import { ErrorState, NotFoundState, RefreshingBanner } from '@/components/jorby/states'
import { Tile } from '@/components/jorby/tile'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDebouncedValue } from '@/lib/debounce'
import { AppErrorCode } from '@/lib/errors'
import { householdPath, placeDetailPath } from '@/lib/routes'
import { memberFromMembership } from '@/osdk/member'
import { placeProvider, placeReviewOperation } from '@/osdk/operations'
import { mergePlaceDetails, placeDetailsFromSource, placeHitsFromQuery } from '@/osdk/provider-hits'
import { PlaceDetailView } from '@/places/PlaceDetailView'
import { useMyMembership } from '@/osdk/useMyMembership'
import { toast } from 'sonner'

type PlaceFilter = 'want' | 'been' | 'favorite'

/** The live save-visit Action takes a calendar date, not a timestamp. */
function calendarDate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const filters: { id: PlaceFilter; label: string }[] = [
  { id: 'want', label: 'Want to go' },
  { id: 'been', label: 'Been' },
  { id: 'favorite', label: 'Favorite' },
]

export function FoundryPlacesIndex({ householdId }: { householdId: string }) {
  const { object: household, isLoading: householdLoading } = useOsdkObject(
    JorbyHousehold,
    householdId,
    Boolean(householdId),
  )
  const { data, isLoading, error } = useOsdkObjects(JorbyPlaceEntry, {
    where: {
      householdId: { $eq: householdId },
      archivedAt: { $isNull: true },
    },
    orderBy: { updatedAt: 'desc' },
    pageSize: 50,
    streamUpdates: true,
    enabled: Boolean(householdId),
  })
  const createManual = useOsdkAction(createJorbyManualPlace)
  const saveProvider = useOsdkAction(saveJorbyProviderPlace)
  const [filter, setFilter] = useState<PlaceFilter>('want')
  const [search, setSearch] = useState('')
  const term = useDebouncedValue(search.trim(), 300)
  const placesQuery = useOsdkFunction(searchJorbyPlaces, {
    params: { provider: placeProvider, query: term, page: 1, pageSize: 8 },
    enabled: term.length >= 2,
  })
  const places = data ?? []
  const visible = places.filter((place) => {
    if (filter === 'want') {
      return place.visitState === 'WANT_TO_GO'
    }
    if (filter === 'been') {
      return place.visitState === 'BEEN'
    }
    return place.isFavorite === true
  })
  const hits = placeHitsFromQuery(placesQuery.data)

  async function onCreate(input: {
    name: string
    isFavorite: boolean
    providerId?: string
  }) {
    if (!household || input.name.trim() === '') {
      return false
    }
    try {
      if (input.providerId) {
        await saveProvider.applyAction({
          household,
          provider: placeProvider,
          providerPlaceId: input.providerId,
          isFavorite: input.isFavorite,
        })
      } else {
        await createManual.applyAction({
          household,
          displayTitle: input.name.trim(),
          isFavorite: input.isFavorite,
        })
      }
      return true
    } catch {
      toast.error('The place could not be created.')
      return false
    }
  }

  if (error) {
    return <ErrorState code={AppErrorCode.UNKNOWN} />
  }

  return (
    <div>
      <ScreenHeader title="Places" />
      <SectionTabs
        label="Filter places"
        value={filter}
        onValueChange={(value) => setFilter(value as PlaceFilter)}
        options={filters.map((item) => ({ value: item.id, label: item.label }))}
      />
      {isLoading && places.length === 0 ? (
        <p className="text-sm text-muted-foreground">Loading places…</p>
      ) : visible.length === 0 ? (
        <EmptyState>Nothing in {filters.find((item) => item.id === filter)?.label} yet.</EmptyState>
      ) : (
        <>
          {isLoading ? <RefreshingBanner /> : null}
          <CardGroup>
            <RowList>
              {visible.map((place) => (
                <LinkRow
                  key={place.$primaryKey}
                  to={placeDetailPath(householdId, place.placeEntryId)}
                  leading={<Tile icon={place.isFavorite === true ? Heart : MapPin} tone="places" />}
                  title={place.displayTitle ?? 'Untitled place'}
                  subtitle={place.sharedNote ?? undefined}
                  meta={
                    <>
                      <Badge variant="secondary" className="rounded-full">
                        {place.visitState === 'WANT_TO_GO' ? 'Want to go' : 'Been'}
                      </Badge>
                      {place.catalogPlaceId == null ? (
                        <Badge variant="secondary" className="rounded-full">
                          Manual
                        </Badge>
                      ) : null}
                    </>
                  }
                />
              ))}
            </RowList>
          </CardGroup>
        </>
      )}

      <PlaceCreate
        hits={hits.map((hit) => ({
          id: hit.id,
          title: hit.name,
          subtitle: hit.subtitle,
          neighborhood: hit.subtitle,
        }))}
        hitsLoading={placesQuery.isLoading}
        busy={createManual.isPending || saveProvider.isPending || householdLoading || !household}
        onQueryChange={setSearch}
        onCreate={(input) => onCreate(input)}
      />
    </div>
  )
}

export function FoundryPlaceDetail({
  householdId,
  placeEntryId,
}: {
  householdId: string
  placeEntryId: string
}) {
  const navigate = useNavigate()
  const { object: place, isLoading, error } = useOsdkObject(
    JorbyPlaceEntry,
    placeEntryId,
    Boolean(placeEntryId),
  )
  const reviewsQuery = useOsdkObjects(JorbyPlaceReview, {
    where: {
      householdId: { $eq: householdId },
      placeEntryId: { $eq: placeEntryId },
      archivedAt: { $isNull: true },
    },
    pageSize: 20,
    streamUpdates: true,
    enabled: Boolean(placeEntryId),
  })
  const visitsQuery = useOsdkObjects(JorbyVisit, {
    where: {
      householdId: { $eq: householdId },
      placeEntryId: { $eq: placeEntryId },
      archivedAt: { $isNull: true },
    },
    orderBy: { visitedOn: 'desc' },
    pageSize: 20,
    streamUpdates: true,
    enabled: Boolean(placeEntryId),
  })
  const membersQuery = useOsdkObjects(JorbyHouseholdMembership, {
    where: { householdId: { $eq: householdId } },
    pageSize: 20,
    enabled: Boolean(householdId),
  })
  const me = useMyMembership(householdId)
  const archiveEntry = useOsdkAction(setJorbyPlaceEntryArchived)
  const saveVisit = useOsdkAction(saveJorbyVisit)
  const saveReview = useOsdkAction(manageJorbyPlaceReviews)
  const catalogId = typeof place?.catalogPlaceId === 'string' ? place.catalogPlaceId : undefined
  const catalog = useOsdkObject(JorbyCatalogPlace, catalogId ?? '', Boolean(catalogId))
  const catalogProvider = catalog.object?.primaryProvider
  const catalogProviderId = catalog.object?.primaryProviderId
  const details = useOsdkFunction(getJorbyPlaceDetails, {
    params: {
      provider: catalogProvider ?? placeProvider,
      placeId: catalogProviderId ?? '',
    },
    enabled: Boolean(catalogProvider && catalogProviderId),
  })
  const [rating, setRating] = useState('8')
  const reviews = reviewsQuery.data ?? []
  const visits = visitsQuery.data ?? []
  const members = (membersQuery.data ?? []).map(memberFromMembership)
  const reviewRows = reviews.flatMap((review) =>
    review.membershipId == null || review.ratingHalfStars == null
      ? []
      : [
          {
            membershipId: review.membershipId,
            ratingHalfStars: review.ratingHalfStars,
            reviewText: review.reviewText ?? '',
          },
        ],
  )
  const average = averageStars(reviewRows)
  const busy = archiveEntry.isPending || saveVisit.isPending || saveReview.isPending

  const been = place?.visitState === 'BEEN'

  async function onArchive() {
    if (!place || place.revision == null) {
      return
    }
    try {
      await archiveEntry.applyAction({
        placeEntry: place,
        expectedRevision: place.revision,
        isArchived: true,
      })
      navigate(householdPath(householdId, 'places'), { replace: true })
    } catch {
      toast.error('The place could not be archived.')
    }
  }

  async function onVisit() {
    if (!place || place.revision == null) {
      return
    }
    try {
      await saveVisit.applyAction({
        placeEntry: place,
        expectedPlaceRevision: place.revision,
        visitedOn: calendarDate(),
      })
    } catch {
      toast.error('The visit could not be saved.')
    }
  }

  async function onReview(event: FormEvent) {
    event.preventDefault()
    if (!place || place.revision == null || !been) {
      return
    }
    const halfStars = Number(rating)
    try {
      await saveReview.applyAction({
        placeEntry: place,
        expectedPlaceRevision: place.revision,
        operation: placeReviewOperation.save,
        ratingHalfStars: halfStars,
      })
    } catch {
      toast.error('The review could not be saved.')
    }
  }

  async function onFavorite() {
    toast.error('Favorite could not be updated.')
  }

  if (error) {
    return <ErrorState code={AppErrorCode.UNKNOWN} />
  }
  if (isLoading && !place) {
    return <p className="text-sm text-muted-foreground">Loading place…</p>
  }
  if (!place || place.householdId !== householdId) {
    return <NotFoundState backTo={householdPath(householdId, 'places')} backLabel="Places" />
  }

  const meta = mergePlaceDetails(
    placeDetailsFromSource(details.data),
    placeDetailsFromSource(catalog.object),
    placeDetailsFromSource(place),
  )

  return (
    <PlaceDetailView
      householdId={householdId}
      name={place.displayTitle ?? meta.name ?? 'Untitled place'}
      cuisine={meta.cuisine}
      neighborhood={meta.neighborhood}
      visitState={place.visitState}
      isFavorite={place.isFavorite === true}
      description={meta.description}
      address={meta.address}
      phoneNumber={meta.phoneNumber}
      websiteUrl={meta.websiteUrl}
      photoUrl={meta.photoUrl}
      sharedNote={place.sharedNote ?? undefined}
      reviews={reviewRows}
      members={members}
      average={average}
      busy={busy}
      onToggleFavorite={() => {
        void onFavorite()
      }}
    >
      {visits.length > 0 ? (
        <CardGroup label="Visits">
          <RowList>
            {visits.map((visit) => (
              <Row
                key={visit.$primaryKey}
                title={visit.visitedOn ? String(visit.visitedOn) : 'Visit'}
                subtitle={visit.visitNote ?? undefined}
              />
            ))}
          </RowList>
        </CardGroup>
      ) : null}

      <div className="mb-5 flex flex-wrap gap-2">
        <Button
          type="button"
          className="h-11 rounded-full"
          disabled={busy}
          onClick={() => {
            void onVisit()
          }}
        >
          Log visit
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-full"
          disabled={busy}
          onClick={() => {
            void onArchive()
          }}
        >
          Archive
        </Button>
      </div>

      {been ? (
        <StickyActions>
          <form onSubmit={onReview} className="flex gap-2">
            <Input
              value={rating}
              onChange={(event) => setRating(event.target.value)}
              inputMode="numeric"
              aria-label="Rating in half-stars from 1 to 10"
              className="h-11 rounded-full border-0 bg-secondary"
            />
            <Button type="submit" size="lg" className="h-11 shrink-0 rounded-full" disabled={busy || !me.data}>
              Review
            </Button>
          </form>
        </StickyActions>
      ) : null}
    </PlaceDetailView>
  )
}
