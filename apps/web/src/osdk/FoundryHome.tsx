import {
  JorbyHousehold,
  JorbyHouseholdMembership,
  JorbyListItem,
  JorbyPlaceEntry,
  JorbyPlaceReview,
  JorbySharedList,
  JorbySharedNote,
  JorbyThing,
  JorbyVisit,
  JorbyWatchEntry,
  JorbyWatchReaction,
} from '@/osdk/resources'
import { useOsdkObject, useOsdkObjects } from '@osdk/react'
import { Clapperboard, ListTodo, MapPin, Package, StickyNote } from 'lucide-react'
import { useMemo } from 'react'
import { CatalogHome } from '@/home/CatalogHome'
import { ErrorState } from '@/components/jorby/states'
import { memberFromMembership } from '@/osdk/member'
import { useMyMembership } from '@/osdk/useMyMembership'
import { AppErrorCode } from '@/lib/errors'
import {
  buildActivityFeed,
  toMillis,
  type ActivityChild,
  type ActivityParent,
} from '@/lib/activity'
import {
  householdPath,
  listDetailPath,
  noteDetailPath,
  placeDetailPath,
  thingDetailPath,
  watchDetailPath,
} from '@/lib/routes'

const activityPath = {
  lists: listDetailPath,
  notes: noteDetailPath,
  places: placeDetailPath,
  watch: watchDetailPath,
  things: thingDetailPath,
} as const

export function FoundryHome({ householdId }: { householdId: string }) {
  const me = useMyMembership(householdId)
  const { object: household, isLoading: householdLoading } = useOsdkObject(
    JorbyHousehold,
    householdId,
    Boolean(householdId),
  )
  const members = useOsdkObjects(JorbyHouseholdMembership, {
    where: {
      householdId: { $eq: householdId },
      archivedAt: { $isNull: true },
    },
    pageSize: 50,
    streamUpdates: true,
    enabled: Boolean(householdId),
  })
  const lists = useOsdkObjects(JorbySharedList, {
    where: {
      householdId: { $eq: householdId },
      archivedAt: { $isNull: true },
    },
    pageSize: 50,
    streamUpdates: true,
    enabled: Boolean(householdId),
  })
  const notes = useOsdkObjects(JorbySharedNote, {
    where: {
      householdId: { $eq: householdId },
      archivedAt: { $isNull: true },
    },
    pageSize: 50,
    streamUpdates: true,
    enabled: Boolean(householdId),
  })
  const places = useOsdkObjects(JorbyPlaceEntry, {
    where: {
      householdId: { $eq: householdId },
      archivedAt: { $isNull: true },
    },
    pageSize: 50,
    streamUpdates: true,
    enabled: Boolean(householdId),
  })
  const watch = useOsdkObjects(JorbyWatchEntry, {
    where: {
      householdId: { $eq: householdId },
      archivedAt: { $isNull: true },
    },
    pageSize: 50,
    streamUpdates: true,
    enabled: Boolean(householdId),
  })
  const things = useOsdkObjects(JorbyThing, {
    where: {
      householdId: { $eq: householdId },
      archivedAt: { $isNull: true },
    },
    pageSize: 50,
    streamUpdates: true,
    enabled: Boolean(householdId),
  })
  const items = useOsdkObjects(JorbyListItem, {
    where: {
      householdId: { $eq: householdId },
      archivedAt: { $isNull: true },
    },
    orderBy: { createdAt: 'desc' },
    pageSize: 40,
    streamUpdates: true,
    enabled: Boolean(householdId),
  })
  const placeReviews = useOsdkObjects(JorbyPlaceReview, {
    where: {
      householdId: { $eq: householdId },
      archivedAt: { $isNull: true },
    },
    orderBy: { createdAt: 'desc' },
    pageSize: 40,
    streamUpdates: true,
    enabled: Boolean(householdId),
  })
  const visits = useOsdkObjects(JorbyVisit, {
    where: {
      householdId: { $eq: householdId },
      archivedAt: { $isNull: true },
    },
    orderBy: { createdAt: 'desc' },
    pageSize: 40,
    streamUpdates: true,
    enabled: Boolean(householdId),
  })
  const reactions = useOsdkObjects(JorbyWatchReaction, {
    where: {
      householdId: { $eq: householdId },
      archivedAt: { $isNull: true },
    },
    orderBy: { updatedAt: 'desc' },
    pageSize: 40,
    streamUpdates: true,
    enabled: Boolean(householdId),
  })

  const householdMembers = useMemo(() => {
    const byId = new Map<string, ReturnType<typeof memberFromMembership>>()
    for (const membership of members.data ?? []) {
      const member = memberFromMembership(membership)
      if (membership.membershipId) {
        byId.set(membership.membershipId, member)
      }
      if (membership.foundryUserId) {
        byId.set(membership.foundryUserId, member)
      }
    }
    return byId
  }, [members.data])

  const actorName = useMemo(
    () => (id: string) => householdMembers.get(id)?.displayName ?? '',
    [householdMembers],
  )

  const activity = useMemo(() => {
    const parents: ActivityParent[] = [
      ...(lists.data ?? []).map((list) => ({
        id: list.listId,
        kind: 'lists' as const,
        title: list.name ?? 'Untitled list',
        createdAt: toMillis(list.createdAt),
        updatedAt: toMillis(list.updatedAt),
        createdById: list.createdByUserId ?? '',
        updatedById: list.updatedByUserId ?? '',
        revision: list.revision,
      })),
      ...(notes.data ?? []).map((note) => ({
        id: note.noteId,
        kind: 'notes' as const,
        title: note.title ?? 'Untitled note',
        createdAt: toMillis(note.createdAt),
        updatedAt: toMillis(note.updatedAt),
        createdById: note.createdByUserId ?? '',
        updatedById: note.updatedByUserId ?? '',
        revision: note.revision,
      })),
      ...(places.data ?? []).map((place) => ({
        id: place.placeEntryId,
        kind: 'places' as const,
        title: place.displayTitle ?? 'Untitled place',
        createdAt: toMillis(place.createdAt),
        updatedAt: toMillis(place.updatedAt),
        createdById: place.createdByUserId ?? '',
        updatedById: place.updatedByUserId ?? '',
        revision: place.revision,
        visitState: place.visitState,
      })),
      ...(watch.data ?? []).map((entry) => ({
        id: entry.watchEntryId,
        kind: 'watch' as const,
        title: entry.displayTitle ?? 'Untitled',
        createdAt: toMillis(entry.createdAt),
        updatedAt: toMillis(entry.updatedAt),
        createdById: entry.createdByUserId ?? '',
        updatedById: entry.updatedByUserId ?? '',
        revision: entry.revision,
        watchStatus: entry.status,
      })),
      ...(things.data ?? []).map((thing) => ({
        id: thing.thingId,
        kind: 'things' as const,
        title: thing.name ?? 'Untitled',
        createdAt: toMillis(thing.createdAt),
        updatedAt: toMillis(thing.updatedAt),
        createdById: thing.createdByUserId ?? '',
        updatedById: thing.updatedByUserId ?? '',
        revision: thing.revision,
        lifecycleState: thing.lifecycleState,
      })),
    ]
    const children: ActivityChild[] = []
    for (const review of placeReviews.data ?? []) {
      if (!review.placeReviewId || !review.placeEntryId) {
        continue
      }
      children.push({
        id: review.placeReviewId,
        parentId: review.placeEntryId,
        kind: 'review',
        at: toMillis(review.reviewedAt ?? review.createdAt),
        actorId: review.membershipId ?? review.createdByUserId ?? '',
      })
    }
    for (const visit of visits.data ?? []) {
      if (!visit.visitId || !visit.placeEntryId) {
        continue
      }
      children.push({
        id: visit.visitId,
        parentId: visit.placeEntryId,
        kind: 'visit',
        at: toMillis(visit.visitedOn ?? visit.createdAt),
        actorId: visit.createdByUserId ?? '',
      })
    }
    for (const reaction of reactions.data ?? []) {
      if (!reaction.watchReactionId || !reaction.watchEntryId) {
        continue
      }
      if (reaction.stage === 'REVIEWED') {
        children.push({
          id: reaction.watchReactionId,
          parentId: reaction.watchEntryId,
          kind: 'review',
          at: toMillis(reaction.reviewedAt ?? reaction.updatedAt ?? reaction.createdAt),
          actorId: reaction.membershipId ?? reaction.createdByUserId ?? '',
        })
        continue
      }
      const entry = (watch.data ?? []).find((item) => item.watchEntryId === reaction.watchEntryId)
      if (entry?.status !== 'WATCHLIST') {
        continue
      }
      children.push({
        id: reaction.watchReactionId,
        parentId: reaction.watchEntryId,
        kind: 'want',
        at: toMillis(reaction.updatedAt ?? reaction.createdAt),
        actorId: reaction.membershipId ?? reaction.createdByUserId ?? '',
      })
    }
    const events = buildActivityFeed({
      parents,
      listItems: (items.data ?? []).flatMap((item) =>
        item.listItemId && item.listId
          ? [
              {
                id: item.listItemId,
                listId: item.listId,
                text: item.text ?? '',
                createdAt: toMillis(item.createdAt),
                createdById: item.createdByUserId ?? '',
              },
            ]
          : [],
      ),
      children,
      actorName,
    })
    return events.flatMap((event) => {
      const to = activityPath[event.kind](householdId, event.parentId)
      return to
        ? [{ ...event, to, member: householdMembers.get(event.actorId) }]
        : []
    })
  }, [
    actorName,
    householdId,
    householdMembers,
    items.data,
    lists.data,
    notes.data,
    placeReviews.data,
    places.data,
    reactions.data,
    things.data,
    visits.data,
    watch.data,
  ])

  const listCount = lists.data?.length ?? 0
  const noteCount = notes.data?.length ?? 0
  const placeCount = places.data?.length ?? 0
  const watchCount = watch.data?.length ?? 0
  const thingCount = things.data?.length ?? 0
  const wantPlaces = (places.data ?? []).filter((place) => place.visitState === 'WANT_TO_GO')
  const wishThings = (things.data ?? []).filter(
    (thing) =>
      thing.lifecycleState === 'IDEA' ||
      thing.lifecycleState === 'BUYING' ||
      thing.lifecycleState === 'BOUGHT',
  )
  const watchlist = (watch.data ?? []).filter((entry) => entry.status === 'WATCHLIST')
  const activityLoading =
    lists.isLoading ||
    notes.isLoading ||
    places.isLoading ||
    watch.isLoading ||
    things.isLoading ||
    items.isLoading
  const failed =
    lists.error ||
    notes.error ||
    places.error ||
    watch.error ||
    things.error ||
    items.error ||
    members.error

  if (failed) {
    return <ErrorState code={AppErrorCode.UNKNOWN} />
  }

  return (
    <CatalogHome
      title={household?.displayName ?? (householdLoading ? 'Home' : 'Household')}
      activity={activity}
      activityLoading={activityLoading && activity.length === 0}
      youActorIds={[me.data?.membershipId, me.data?.foundryUserId].filter(
        (id): id is string => Boolean(id),
      )}
      snapshots={[
        {
          to: householdPath(householdId, 'lists'),
          icon: ListTodo,
          tone: 'lists',
          title: 'Lists',
          value: lists.isLoading && listCount === 0 ? '…' : String(listCount),
        },
        {
          to: householdPath(householdId, 'notes'),
          icon: StickyNote,
          tone: 'notes',
          title: 'Notes',
          value: notes.isLoading && noteCount === 0 ? '…' : String(noteCount),
        },
        {
          to: householdPath(householdId, 'places'),
          icon: MapPin,
          tone: 'places',
          title: 'Places',
          value: places.isLoading && placeCount === 0 ? '…' : String(placeCount),
        },
        {
          to: householdPath(householdId, 'watch'),
          icon: Clapperboard,
          tone: 'watch',
          title: 'Watch',
          value: watch.isLoading && watchCount === 0 ? '…' : String(watchCount),
        },
        {
          to: householdPath(householdId, 'things'),
          icon: Package,
          tone: 'things',
          title: 'Things',
          value: things.isLoading && thingCount === 0 ? '…' : String(thingCount),
        },
      ]}
      queued={[
        ...wantPlaces.slice(0, 3).map((place) => ({
          key: place.placeEntryId,
          to: placeDetailPath(householdId, place.placeEntryId),
          tone: 'places' as const,
          icon: MapPin,
          title: place.displayTitle ?? 'Untitled place',
          subtitle: undefined,
          tag: 'Want to go',
        })),
        ...watchlist.slice(0, 3).map((entry) => ({
          key: entry.watchEntryId,
          to: watchDetailPath(householdId, entry.watchEntryId),
          tone: 'watch' as const,
          icon: Clapperboard,
          title: entry.displayTitle ?? 'Untitled',
          subtitle: undefined,
          tag: 'Watchlist',
        })),
        ...wishThings.slice(0, 3).map((thing) => ({
          key: thing.thingId,
          to: thingDetailPath(householdId, thing.thingId),
          tone: 'things' as const,
          icon: Package,
          title: thing.name ?? 'Untitled',
          subtitle: undefined,
          tag: 'Wish',
        })),
      ]}
    />
  )
}
