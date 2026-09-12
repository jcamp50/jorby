import type { ThingLifecycleState } from '@/lib/thing-lifecycle'

export const PROTOTYPE_HOUSEHOLD_ID = 'our-home'

/** Maps to the Ontology's `profileColor`; each value selects a token pair in index.css. */
export type ProfileColor = 'clay' | 'sage' | 'indigo' | 'amber'

export type Member = {
  id: string
  displayName: string
  initials: string
  profileLabel: string
  profileColor: ProfileColor
  avatarUrl?: string | null
}

export type ListRecord = {
  id: string
  name: string
  description?: string
  isPinned: boolean
  updatedAt: string
}

export type ListItemRecord = {
  id: string
  listId: string
  text: string
  isComplete: boolean
  assigneeMembershipId: string | null
}

export type NoteRecord = {
  id: string
  title: string
  markdownBody: string
  tags: string[]
  updatedAt: string
}

export type PlaceRecord = {
  id: string
  name: string
  neighborhood: string
  cuisine: string
  visitState: 'WANT_TO_GO' | 'BEEN'
  isFavorite: boolean
  sharedNote?: string
}

export type MemberReview = {
  membershipId: string
  ratingHalfStars: number
  reviewText: string
}

export type WatchRecord = {
  id: string
  title: string
  year: number
  mediaType: 'MOVIE' | 'SHOW'
  status: 'WATCHLIST' | 'WATCHING' | 'WATCHED' | 'DROPPED'
  lastWatchedSeasonNumber: number | null
  lastWatchedEpisodeNumber: number | null
  wantsMembershipIds: string[]
  reviews: MemberReview[]
}

export type ThingRecord = {
  id: string
  name: string
  lifecycleState: ThingLifecycleState
  priceAmount?: number
  priceCurrency?: string
  recipientLabel?: string
  storageLocation?: string
  notes?: string
  reservedByMembershipId: string | null
  assigneeMembershipId: string | null
}

export type PrototypeState = {
  currentMembershipId: string
  members: Member[]
  lists: ListRecord[]
  items: ListItemRecord[]
  notes: NoteRecord[]
  places: PlaceRecord[]
  placeReviews: Record<string, MemberReview[]>
  watch: WatchRecord[]
  things: ThingRecord[]
}

export const jordan: Member = {
  id: 'mem-jordan',
  displayName: 'Jordan',
  initials: 'JO',
  profileLabel: 'Clay',
  profileColor: 'clay',
}

export const sam: Member = {
  id: 'mem-sam',
  displayName: 'Sam',
  initials: 'SA',
  profileLabel: 'Sage',
  profileColor: 'sage',
}

export function createSeedState(): PrototypeState {
  return {
    currentMembershipId: jordan.id,
    members: [jordan, sam],
    lists: [
      {
        id: 'list-groceries',
        name: 'Groceries',
        description: 'This week',
        isPinned: true,
        updatedAt: '2026-09-05T18:00:00Z',
      },
      {
        id: 'list-packing',
        name: 'Hudson packing',
        isPinned: false,
        updatedAt: '2026-09-04T12:00:00Z',
      },
      {
        id: 'list-dates',
        name: 'Date ideas',
        isPinned: false,
        updatedAt: '2026-08-20T12:00:00Z',
      },
    ],
    items: [
      { id: 'li-1', listId: 'list-groceries', text: 'Oat milk', isComplete: true, assigneeMembershipId: jordan.id },
      { id: 'li-2', listId: 'list-groceries', text: 'Lemons', isComplete: false, assigneeMembershipId: null },
      { id: 'li-3', listId: 'list-groceries', text: 'Chicken thighs', isComplete: false, assigneeMembershipId: sam.id },
      { id: 'li-4', listId: 'list-packing', text: 'Rain jackets', isComplete: false, assigneeMembershipId: null },
      { id: 'li-5', listId: 'list-packing', text: 'Board games', isComplete: false, assigneeMembershipId: jordan.id },
      { id: 'li-6', listId: 'list-dates', text: 'Jazz at Mezzrow', isComplete: false, assigneeMembershipId: null },
    ],
    notes: [
      {
        id: 'note-hudson',
        title: 'Hudson weekend',
        tags: ['trips'],
        updatedAt: '2026-09-03T15:00:00Z',
        markdownBody:
          'Train 8:42a from Moynihan.\n\nDinner Saturday at **Lil’ Deb’s Oasis** if we can get a walk-in.\n\nDo not forget the espresso kettle.',
      },
      {
        id: 'note-house',
        title: 'House notes',
        tags: ['house'],
        updatedAt: '2026-07-12T15:00:00Z',
        markdownBody: 'Wifi: jorby-guest\nTrash: Tuesday night\nThermostat: 70 overnight',
      },
    ],
    places: [
      {
        id: 'place-lilia',
        name: 'Lilia',
        neighborhood: 'Williamsburg',
        cuisine: 'Italian',
        visitState: 'BEEN',
        isFavorite: true,
        sharedNote: 'Sit at the bar if we can.',
      },
      {
        id: 'place-atoboy',
        name: 'Atoboy',
        neighborhood: 'Nomad',
        cuisine: 'Korean',
        visitState: 'WANT_TO_GO',
        isFavorite: false,
      },
      {
        id: 'place-prince',
        name: 'Prince Street Pizza',
        neighborhood: 'Nolita',
        cuisine: 'Pizza',
        visitState: 'BEEN',
        isFavorite: false,
      },
    ],
    placeReviews: {
      'place-lilia': [
        { membershipId: jordan.id, ratingHalfStars: 9, reviewText: 'Mafaldine is the move.' },
        { membershipId: sam.id, ratingHalfStars: 6, reviewText: 'Great pasta, too loud for a long sit.' },
      ],
      'place-prince': [
        { membershipId: jordan.id, ratingHalfStars: 8, reviewText: 'Pepperoni square. Always.' },
        { membershipId: sam.id, ratingHalfStars: 8, reviewText: 'Worth the line once.' },
      ],
    },
    watch: [
      {
        id: 'watch-bear',
        title: 'The Bear',
        year: 2022,
        mediaType: 'SHOW',
        status: 'WATCHING',
        lastWatchedSeasonNumber: 3,
        lastWatchedEpisodeNumber: 2,
        wantsMembershipIds: [jordan.id, sam.id],
        reviews: [],
      },
      {
        id: 'watch-past-lives',
        title: 'Past Lives',
        year: 2023,
        mediaType: 'MOVIE',
        status: 'WATCHLIST',
        lastWatchedSeasonNumber: null,
        lastWatchedEpisodeNumber: null,
        wantsMembershipIds: [jordan.id, sam.id],
        reviews: [],
      },
      {
        id: 'watch-dune',
        title: 'Dune: Part Two',
        year: 2024,
        mediaType: 'MOVIE',
        status: 'WATCHED',
        lastWatchedSeasonNumber: null,
        lastWatchedEpisodeNumber: null,
        wantsMembershipIds: [],
        reviews: [
          { membershipId: jordan.id, ratingHalfStars: 9, reviewText: 'IMAX again please.' },
          { membershipId: sam.id, ratingHalfStars: 8, reviewText: 'Huge, a little cold.' },
        ],
      },
    ],
    things: [
      {
        id: 'thing-espresso',
        name: 'Profitec Go',
        lifecycleState: 'IDEA',
        priceAmount: 899,
        priceCurrency: 'USD',
        recipientLabel: 'Us',
        reservedByMembershipId: sam.id,
        assigneeMembershipId: null,
        notes: 'Check used market first.',
      },
      {
        id: 'thing-skillet',
        name: 'Cast-iron skillet',
        lifecycleState: 'OWNED',
        storageLocation: 'Oven drawer',
        reservedByMembershipId: null,
        assigneeMembershipId: null,
      },
      {
        id: 'thing-tickets',
        name: 'Jazz tickets — Mezzrow',
        lifecycleState: 'GIFTED',
        recipientLabel: 'Sam',
        reservedByMembershipId: null,
        assigneeMembershipId: jordan.id,
      },
    ],
  }
}

export function reviewSpread(reviews: MemberReview[] | undefined): number | null {
  if (!reviews || reviews.length < 2) {
    return null
  }
  const values = reviews.map((review) => review.ratingHalfStars)
  return Math.max(...values) - Math.min(...values)
}

export function everyoneWants(entry: WatchRecord, activeMemberCount: number): boolean {
  return entry.wantsMembershipIds.length === activeMemberCount && activeMemberCount > 0
}
