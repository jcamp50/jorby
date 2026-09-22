import { Clapperboard, ListTodo, MapPin, Package, StickyNote } from 'lucide-react'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { CatalogHome } from '@/home/CatalogHome'
import {
  buildActivityFeed,
  toMillis,
  type ActivityChild,
  type ActivityParent,
} from '@/lib/activity'
import {
  householdPath,
  placeDetailPath,
  thingDetailPath,
  watchDetailPath,
  listDetailPath,
  noteDetailPath,
} from '@/lib/routes'
import { FoundryHome } from '@/osdk/FoundryHome'
import { usesFoundryData } from '@/osdk/household-route'
import { usePrototype } from '@/prototype/PrototypeProvider'

const activityPath = {
  lists: listDetailPath,
  notes: noteDetailPath,
  places: placeDetailPath,
  watch: watchDetailPath,
  things: thingDetailPath,
} as const

export function HomePage() {
  const { householdId = '' } = useParams()
  if (usesFoundryData(householdId)) {
    return <FoundryHome householdId={householdId} />
  }
  return <PrototypeHome householdId={householdId} />
}

function PrototypeHome({ householdId }: { householdId: string }) {
  const {
    lists,
    items,
    notes,
    places,
    placeReviews,
    visits,
    watch,
    things,
    members,
    currentMembershipId,
    weShouldPlaces,
    watchTonight,
    wishThings,
  } = usePrototype()

  const activity = useMemo(() => {
    const names = new Map(members.map((member) => [member.id, member.displayName]))
    const parents: ActivityParent[] = [
      ...lists.map((list) => ({
        id: list.id,
        kind: 'lists' as const,
        title: list.name,
        createdAt: toMillis(list.createdAt),
        updatedAt: toMillis(list.updatedAt),
        createdById: list.createdByMembershipId,
        updatedById: list.updatedByMembershipId,
      })),
      ...notes.map((note) => ({
        id: note.id,
        kind: 'notes' as const,
        title: note.title,
        createdAt: toMillis(note.createdAt),
        updatedAt: toMillis(note.updatedAt),
        createdById: note.createdByMembershipId,
        updatedById: note.updatedByMembershipId,
      })),
      ...places.map((place) => ({
        id: place.id,
        kind: 'places' as const,
        title: place.name,
        createdAt: toMillis(place.createdAt),
        updatedAt: toMillis(place.updatedAt),
        createdById: place.createdByMembershipId,
        updatedById: place.updatedByMembershipId,
        visitState: place.visitState,
      })),
      ...watch.map((entry) => ({
        id: entry.id,
        kind: 'watch' as const,
        title: entry.title,
        createdAt: toMillis(entry.createdAt),
        updatedAt: toMillis(entry.updatedAt),
        createdById: entry.createdByMembershipId,
        updatedById: entry.updatedByMembershipId,
        watchStatus: entry.status,
      })),
      ...things.map((thing) => ({
        id: thing.id,
        kind: 'things' as const,
        title: thing.name,
        createdAt: toMillis(thing.createdAt),
        updatedAt: toMillis(thing.updatedAt),
        createdById: thing.createdByMembershipId,
        updatedById: thing.updatedByMembershipId,
        lifecycleState: thing.lifecycleState,
      })),
    ]
    const children: ActivityChild[] = [
      ...visits.map((visit) => ({
        id: visit.id,
        parentId: visit.placeId,
        kind: 'visit' as const,
        at: toMillis(visit.createdAt),
        actorId: visit.createdByMembershipId,
      })),
      ...Object.entries(placeReviews).flatMap(([placeId, reviews]) =>
        reviews.map((review, index) => ({
          id: `${placeId}:${review.membershipId}:${index}`,
          parentId: placeId,
          kind: 'review' as const,
          at: toMillis(review.reviewedAt),
          actorId: review.membershipId,
        })),
      ),
      ...watch.flatMap((entry) => [
        ...(entry.status === 'WATCHLIST'
          ? entry.wantsMembershipIds.map((membershipId) => ({
              id: `want:${entry.id}:${membershipId}`,
              parentId: entry.id,
              kind: 'want' as const,
              at: toMillis(entry.updatedAt),
              actorId: membershipId,
            }))
          : []),
        ...entry.reviews.map((review, index) => ({
          id: `watch-review:${entry.id}:${review.membershipId}:${index}`,
          parentId: entry.id,
          kind: 'review' as const,
          at: toMillis(review.reviewedAt),
          actorId: review.membershipId,
        })),
      ]),
    ]
    return buildActivityFeed({
      parents,
      listItems: items.map((item) => ({
        id: item.id,
        listId: item.listId,
        text: item.text,
        createdAt: toMillis(item.createdAt),
        createdById: item.createdByMembershipId,
      })),
      children,
      actorName: (id) => names.get(id) ?? '',
    }).map((event) => ({
      ...event,
      to: activityPath[event.kind](householdId, event.parentId),
      member: members.find((member) => member.id === event.actorId),
    }))
  }, [
    householdId,
    items,
    lists,
    members,
    notes,
    placeReviews,
    places,
    things,
    visits,
    watch,
  ])

  return (
    <CatalogHome
      title="Our Home"
      activity={activity}
      youActorIds={currentMembershipId ? [currentMembershipId] : []}
      snapshots={[
        {
          to: householdPath(householdId, 'lists'),
          icon: ListTodo,
          tone: 'lists',
          title: 'Lists',
          value: String(lists.length),
        },
        {
          to: householdPath(householdId, 'notes'),
          icon: StickyNote,
          tone: 'notes',
          title: 'Notes',
          value: String(notes.length),
        },
        {
          to: householdPath(householdId, 'places'),
          icon: MapPin,
          tone: 'places',
          title: 'Places',
          value: String(places.length),
        },
        {
          to: householdPath(householdId, 'watch'),
          icon: Clapperboard,
          tone: 'watch',
          title: 'Watch',
          value: String(watch.length),
        },
        {
          to: householdPath(householdId, 'things'),
          icon: Package,
          tone: 'things',
          title: 'Things',
          value: String(things.length),
        },
      ]}
      queued={[
        ...weShouldPlaces.slice(0, 3).map((place) => ({
          key: place.id,
          to: placeDetailPath(householdId, place.id),
          tone: 'places' as const,
          icon: MapPin,
          title: place.name,
          tag: 'Want to go',
        })),
        ...watchTonight.slice(0, 3).map((entry) => ({
          key: entry.id,
          to: watchDetailPath(householdId, entry.id),
          tone: 'watch' as const,
          icon: Clapperboard,
          title: entry.title,
          tag: 'Watchlist',
        })),
        ...wishThings.slice(0, 3).map((thing) => ({
          key: thing.id,
          to: thingDetailPath(householdId, thing.id),
          tone: 'things' as const,
          icon: Package,
          title: thing.name,
          tag: 'Wish',
        })),
      ]}
    />
  )
}
