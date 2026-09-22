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
  tags: string[]
  createdAt: string
  updatedAt: string
  createdByMembershipId: string
  updatedByMembershipId: string
}

export type ListItemRecord = {
  id: string
  listId: string
  text: string
  isComplete: boolean
  assigneeMembershipId: string | null
  createdAt: string
  createdByMembershipId: string
}

export type NoteRecord = {
  id: string
  title: string
  markdownBody: string
  tags: string[]
  createdAt: string
  updatedAt: string
  createdByMembershipId: string
  updatedByMembershipId: string
}

export type PlaceRecord = {
  id: string
  name: string
  neighborhood: string
  cuisine: string
  visitState: 'WANT_TO_GO' | 'BEEN'
  isFavorite: boolean
  sharedNote?: string
  tags: string[]
  photoUrl?: string
  address?: string
  description?: string
  phoneNumber?: string
  websiteUrl?: string
  createdAt: string
  updatedAt: string
  createdByMembershipId: string
  updatedByMembershipId: string
}

export type MemberReview = {
  membershipId: string
  ratingHalfStars: number
  reviewText: string
  reviewedAt?: string
}

export type WatchRecord = {
  id: string
  title: string
  year: number
  mediaType: 'MOVIE' | 'SHOW'
  status: 'WATCHLIST' | 'WATCHING' | 'WATCHED' | 'DROPPED'
  lastWatchedSeasonNumber: number | null
  lastWatchedEpisodeNumber: number | null
  movieProgress?: string
  wantsMembershipIds: string[]
  reviews: MemberReview[]
  tags: string[]
  overview?: string
  posterUrl?: string
  director?: string
  genres?: string[]
  cast?: string[]
  createdAt: string
  updatedAt: string
  createdByMembershipId: string
  updatedByMembershipId: string
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
  tags: string[]
  photoUrl?: string
  reservedByMembershipId: string | null
  assigneeMembershipId: string | null
  createdAt: string
  updatedAt: string
  createdByMembershipId: string
  updatedByMembershipId: string
}

export type VisitRecord = {
  id: string
  placeId: string
  createdAt: string
  createdByMembershipId: string
}

export type PrototypeState = {
  currentMembershipId: string
  members: Member[]
  lists: ListRecord[]
  items: ListItemRecord[]
  notes: NoteRecord[]
  places: PlaceRecord[]
  placeReviews: Record<string, MemberReview[]>
  visits: VisitRecord[]
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
        tags: [],
        createdAt: '2026-09-05T12:00:00Z',
        updatedAt: '2026-09-18T14:10:00Z',
        createdByMembershipId: jordan.id,
        updatedByMembershipId: jordan.id,
      },
      {
        id: 'list-packing',
        name: 'Hudson packing',
        isPinned: false,
        tags: [],
        createdAt: '2026-09-04T12:00:00Z',
        updatedAt: '2026-09-04T12:20:00Z',
        createdByMembershipId: sam.id,
        updatedByMembershipId: jordan.id,
      },
      {
        id: 'list-dates',
        name: 'Date ideas',
        isPinned: false,
        tags: [],
        createdAt: '2026-09-15T16:00:00Z',
        updatedAt: '2026-09-15T16:05:00Z',
        createdByMembershipId: sam.id,
        updatedByMembershipId: sam.id,
      },
    ],
    items: [
      {
        id: 'li-1',
        listId: 'list-groceries',
        text: 'Oat milk',
        isComplete: true,
        assigneeMembershipId: jordan.id,
        createdAt: '2026-09-05T12:05:00Z',
        createdByMembershipId: jordan.id,
      },
      {
        id: 'li-2',
        listId: 'list-groceries',
        text: 'Lemons',
        isComplete: false,
        assigneeMembershipId: null,
        createdAt: '2026-09-18T14:08:00Z',
        createdByMembershipId: jordan.id,
      },
      {
        id: 'li-3',
        listId: 'list-groceries',
        text: 'Chicken thighs',
        isComplete: false,
        assigneeMembershipId: sam.id,
        createdAt: '2026-09-18T14:10:00Z',
        createdByMembershipId: jordan.id,
      },
      {
        id: 'li-4',
        listId: 'list-packing',
        text: 'Rain jackets',
        isComplete: false,
        assigneeMembershipId: null,
        createdAt: '2026-09-04T12:10:00Z',
        createdByMembershipId: sam.id,
      },
      {
        id: 'li-5',
        listId: 'list-packing',
        text: 'Board games',
        isComplete: false,
        assigneeMembershipId: jordan.id,
        createdAt: '2026-09-04T12:20:00Z',
        createdByMembershipId: jordan.id,
      },
      {
        id: 'li-6',
        listId: 'list-dates',
        text: 'Jazz at Mezzrow',
        isComplete: false,
        assigneeMembershipId: null,
        createdAt: '2026-09-15T16:05:00Z',
        createdByMembershipId: sam.id,
      },
    ],
    notes: [
      {
        id: 'note-hudson',
        title: 'Hudson weekend',
        tags: ['trips'],
        createdAt: '2026-08-28T15:00:00Z',
        updatedAt: '2026-09-16T19:00:00Z',
        createdByMembershipId: jordan.id,
        updatedByMembershipId: jordan.id,
        markdownBody:
          'Train 8:42a from Moynihan.\n\nDinner Saturday at **Lil’ Deb’s Oasis** if we can get a walk-in.\n\nDo not forget the espresso kettle.',
      },
      {
        id: 'note-house',
        title: 'House notes',
        tags: ['house'],
        createdAt: '2026-07-12T15:00:00Z',
        updatedAt: '2026-07-12T15:00:00Z',
        createdByMembershipId: sam.id,
        updatedByMembershipId: sam.id,
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
        tags: [],
        address: '567 Union Ave, Brooklyn, NY 11211',
        description: 'A neighborhood Italian restaurant known for handmade pasta and a busy open kitchen.',
        phoneNumber: '(718) 576-3570',
        websiteUrl: 'https://www.lilianewyork.com',
        createdAt: '2026-08-02T18:00:00Z',
        updatedAt: '2026-09-13T21:00:00Z',
        createdByMembershipId: jordan.id,
        updatedByMembershipId: sam.id,
      },
      {
        id: 'place-atoboy',
        name: 'Atoboy',
        neighborhood: 'Nomad',
        cuisine: 'Korean',
        visitState: 'WANT_TO_GO',
        isFavorite: false,
        tags: [],
        address: '43 E 28th St, New York, NY 10016',
        description: 'A Michelin-starred Korean restaurant built around sharing plates, banchan, and a short tasting-style menu.',
        phoneNumber: '(646) 476-7217',
        websiteUrl: 'https://www.atoboynyc.com',
        createdAt: '2026-09-17T18:30:00Z',
        updatedAt: '2026-09-17T18:30:00Z',
        createdByMembershipId: sam.id,
        updatedByMembershipId: sam.id,
      },
      {
        id: 'place-prince',
        name: 'Prince Street Pizza',
        neighborhood: 'Nolita',
        cuisine: 'Pizza',
        visitState: 'BEEN',
        isFavorite: false,
        tags: [],
        address: '27 Prince St, New York, NY 10012',
        description: 'A tiny slice window famous for thick square pepperoni pizza and a near-constant line.',
        phoneNumber: '(212) 966-4100',
        websiteUrl: 'https://princestreetpizzanyc.com',
        createdAt: '2026-08-10T12:00:00Z',
        updatedAt: '2026-08-10T20:00:00Z',
        createdByMembershipId: jordan.id,
        updatedByMembershipId: jordan.id,
      },
    ],
    placeReviews: {
      'place-lilia': [
        {
          membershipId: jordan.id,
          ratingHalfStars: 9,
          reviewText: 'Mafaldine is the move.',
          reviewedAt: '2026-09-11T22:00:00Z',
        },
        {
          membershipId: sam.id,
          ratingHalfStars: 6,
          reviewText: 'Great pasta, too loud for a long sit.',
          reviewedAt: '2026-09-13T21:00:00Z',
        },
      ],
      'place-prince': [
        {
          membershipId: jordan.id,
          ratingHalfStars: 8,
          reviewText: 'Pepperoni square. Always.',
          reviewedAt: '2026-08-10T20:00:00Z',
        },
        {
          membershipId: sam.id,
          ratingHalfStars: 8,
          reviewText: 'Worth the line once.',
          reviewedAt: '2026-08-10T20:30:00Z',
        },
      ],
    },
    visits: [
      {
        id: 'visit-lilia',
        placeId: 'place-lilia',
        createdAt: '2026-09-11T21:30:00Z',
        createdByMembershipId: jordan.id,
      },
    ],
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
        tags: [],
        overview:
          'A young chef returns home to run his family sandwich shop, then tries to turn it into a serious restaurant.',
        director: 'Christopher Storer',
        genres: ['Comedy', 'Drama'],
        cast: ['Jeremy Allen White', 'Ayo Edebiri', 'Ebon Moss-Bachrach'],
        createdAt: '2026-07-01T12:00:00Z',
        updatedAt: '2026-09-08T20:00:00Z',
        createdByMembershipId: jordan.id,
        updatedByMembershipId: jordan.id,
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
        tags: [],
        overview:
          'Two childhood friends are separated by a move from Korea to Canada, then meet again as adults in New York.',
        director: 'Celine Song',
        genres: ['Drama', 'Romance'],
        cast: ['Greta Lee', 'Teo Yoo', 'John Magaro'],
        createdAt: '2026-09-14T19:00:00Z',
        updatedAt: '2026-09-14T19:10:00Z',
        createdByMembershipId: jordan.id,
        updatedByMembershipId: sam.id,
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
          {
            membershipId: jordan.id,
            ratingHalfStars: 9,
            reviewText: 'IMAX again please.',
            reviewedAt: '2026-08-22T23:00:00Z',
          },
          {
            membershipId: sam.id,
            ratingHalfStars: 8,
            reviewText: 'Huge, a little cold.',
            reviewedAt: '2026-08-22T23:20:00Z',
          },
        ],
        tags: [],
        overview:
          'Paul Atreides joins the Fremen and looks for a way to change the future of Arrakis, and himself.',
        director: 'Denis Villeneuve',
        genres: ['Science Fiction', 'Adventure'],
        cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson'],
        createdAt: '2026-08-01T12:00:00Z',
        updatedAt: '2026-08-22T23:20:00Z',
        createdByMembershipId: sam.id,
        updatedByMembershipId: sam.id,
      },
      {
        id: 'watch-challengers',
        title: 'Challengers',
        year: 2024,
        mediaType: 'MOVIE',
        status: 'WATCHING',
        lastWatchedSeasonNumber: null,
        lastWatchedEpisodeNumber: null,
        movieProgress: '1:15',
        wantsMembershipIds: [sam.id],
        reviews: [],
        tags: [],
        overview:
          'A tennis prodigy turned coach looks on as her husband and a former boyfriend meet in a challenger-circuit final.',
        director: 'Luca Guadagnino',
        genres: ['Drama', 'Romance', 'Sport'],
        cast: ['Zendaya', 'Josh O’Connor', 'Mike Faist'],
        createdAt: '2026-09-18T21:00:00Z',
        updatedAt: '2026-09-20T22:00:00Z',
        createdByMembershipId: sam.id,
        updatedByMembershipId: jordan.id,
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
        tags: [],
        createdAt: '2026-09-12T15:00:00Z',
        updatedAt: '2026-09-12T15:00:00Z',
        createdByMembershipId: jordan.id,
        updatedByMembershipId: jordan.id,
      },
      {
        id: 'thing-skillet',
        name: 'Cast-iron skillet',
        lifecycleState: 'OWNED',
        storageLocation: 'Oven drawer',
        reservedByMembershipId: null,
        assigneeMembershipId: null,
        tags: [],
        createdAt: '2026-06-02T12:00:00Z',
        updatedAt: '2026-06-02T12:00:00Z',
        createdByMembershipId: sam.id,
        updatedByMembershipId: sam.id,
      },
      {
        id: 'thing-tickets',
        name: 'Jazz tickets — Mezzrow',
        lifecycleState: 'GIFTED',
        recipientLabel: 'Sam',
        reservedByMembershipId: null,
        assigneeMembershipId: jordan.id,
        tags: [],
        createdAt: '2026-08-18T12:00:00Z',
        updatedAt: '2026-08-18T12:00:00Z',
        createdByMembershipId: jordan.id,
        updatedByMembershipId: jordan.id,
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

export const extraPlaceCatalog = [
  { id: 'catalog-via-carota', name: 'Via Carota', neighborhood: 'West Village', cuisine: 'Italian' },
  { id: 'catalog-katz', name: 'Katz’s Delicatessen', neighborhood: 'Lower East Side', cuisine: 'Deli' },
  { id: 'catalog-deb', name: 'Lil’ Deb’s Oasis', neighborhood: 'Hudson', cuisine: 'American' },
] as const

export const extraWatchCatalog = [
  { id: 'catalog-brutalist', name: 'The Brutalist', year: 2024, mediaType: 'MOVIE' as const },
  { id: 'catalog-severance', name: 'Severance', year: 2022, mediaType: 'SHOW' as const },
  { id: 'catalog-challengers', name: 'Challengers', year: 2024, mediaType: 'MOVIE' as const },
] as const

export function catalogHits<T extends { name: string }>(
  catalog: readonly T[],
  query: string,
  takenNames: readonly string[],
): T[] {
  const term = query.trim().toLowerCase()
  if (term.length < 2) {
    return []
  }
  const taken = new Set(takenNames.map((name) => name.toLowerCase()))
  return catalog.filter(
    (item) => !taken.has(item.name.toLowerCase()) && item.name.toLowerCase().includes(term),
  )
}
