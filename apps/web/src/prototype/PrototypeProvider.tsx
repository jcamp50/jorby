import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { actionFailed, actionOk, AppErrorCode, type ActionResult } from '@/lib/errors'
import { thingLens } from '@/lib/thing-lifecycle'
import {
  createSeedState,
  everyoneWants,
  reviewSpread,
  type ListItemRecord,
  type ListRecord,
  type NoteRecord,
  type PlaceRecord,
  type PrototypeState,
  type ThingRecord,
  type WatchRecord,
} from '@/prototype/model'

export type LoadStatus = 'loading' | 'ready' | 'error'

/**
 * Production loads through OSDK, which has real latency and real failures. The
 * prototype fakes both so loading and error states are reachable and testable.
 * Drive it with `?simulate=slow`, `?simulate=error`, or `?simulate=empty`.
 */
export type SimulationMode = 'none' | 'slow' | 'error' | 'empty'

function readSimulation(): SimulationMode {
  const value = new URLSearchParams(window.location.search).get('simulate')
  return value === 'slow' || value === 'error' || value === 'empty' ? value : 'none'
}

type Action =
  | { type: 'loaded' }
  | { type: 'loadFailed' }
  | { type: 'retry' }
  | { type: 'setCurrentMember'; membershipId: string }
  | { type: 'setItemComplete'; itemId: string; isComplete: boolean }
  | { type: 'addListItem'; listId: string; text: string }
  | {
      type: 'createList'
      name: string
      description?: string
      isPinned?: boolean
      tags?: string[]
    }
  | { type: 'createNote'; title: string; markdownBody?: string; tags?: string[] }
  | {
      type: 'createPlace'
      name: string
      neighborhood?: string
      cuisine?: string
      visitState?: PlaceRecord['visitState']
      isFavorite?: boolean
      sharedNote?: string
      tags?: string[]
      photoUrl?: string
    }
  | {
      type: 'createWatch'
      title: string
      mediaType: 'MOVIE' | 'SHOW'
      year?: number
      status?: WatchRecord['status']
      wantsIt?: boolean
      tags?: string[]
    }
  | {
      type: 'createThing'
      name: string
      lifecycleState?: ThingRecord['lifecycleState']
      priceAmount?: number
      recipientLabel?: string
      notes?: string
      tags?: string[]
      photoUrl?: string
    }
  | { type: 'saveNote'; noteId: string; title: string; markdownBody: string }
  | { type: 'toggleWantToWatch'; watchId: string }
  | { type: 'togglePlaceFavorite'; placeId: string }
  | { type: 'reserveThing'; thingId: string }
  | { type: 'releaseThing'; thingId: string }
  | { type: 'purchaseThing'; thingId: string; outcome: 'OWNED' | 'GIFTED' | 'BOUGHT' }
  | { type: 'saveThingNotes'; thingId: string; notes: string }

type State = PrototypeState & { status: LoadStatus; loadAttempt: number }

function init(): State {
  const seed = createSeedState()
  if (readSimulation() === 'empty') {
    return {
      ...seed,
      lists: [],
      items: [],
      notes: [],
      places: [],
      placeReviews: {},
      visits: [],
      watch: [],
      things: [],
      status: 'loading',
      loadAttempt: 0,
    }
  }
  return { ...seed, status: 'loading', loadAttempt: 0 }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loaded':
      return { ...state, status: 'ready' }
    case 'loadFailed':
      return { ...state, status: 'error' }
    case 'retry':
      return { ...state, status: 'loading', loadAttempt: state.loadAttempt + 1 }
    case 'setCurrentMember':
      return { ...state, currentMembershipId: action.membershipId }
    case 'setItemComplete':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.itemId ? { ...item, isComplete: action.isComplete } : item,
        ),
      }
    case 'createList': {
      const now = new Date().toISOString()
      const list: ListRecord = {
        id: `list-${crypto.randomUUID()}`,
        name: action.name.trim(),
        description: action.description?.trim() || undefined,
        isPinned: action.isPinned === true,
        tags: action.tags ?? [],
        createdAt: now,
        updatedAt: now,
        createdByMembershipId: state.currentMembershipId,
        updatedByMembershipId: state.currentMembershipId,
      }
      return { ...state, lists: [...state.lists, list] }
    }
    case 'createNote': {
      const now = new Date().toISOString()
      const note: NoteRecord = {
        id: `note-${crypto.randomUUID()}`,
        title: action.title.trim(),
        markdownBody: action.markdownBody ?? '',
        tags: action.tags ?? [],
        createdAt: now,
        updatedAt: now,
        createdByMembershipId: state.currentMembershipId,
        updatedByMembershipId: state.currentMembershipId,
      }
      return { ...state, notes: [...state.notes, note] }
    }
    case 'createPlace': {
      const now = new Date().toISOString()
      const place: PlaceRecord = {
        id: `place-${crypto.randomUUID()}`,
        name: action.name.trim(),
        neighborhood: action.neighborhood?.trim() ?? '',
        cuisine: action.cuisine?.trim() ?? '',
        visitState: action.visitState ?? 'WANT_TO_GO',
        isFavorite: action.isFavorite === true,
        sharedNote: action.sharedNote?.trim() || undefined,
        tags: action.tags ?? [],
        photoUrl: action.photoUrl,
        createdAt: now,
        updatedAt: now,
        createdByMembershipId: state.currentMembershipId,
        updatedByMembershipId: state.currentMembershipId,
      }
      return { ...state, places: [...state.places, place] }
    }
    case 'createWatch': {
      const now = new Date().toISOString()
      const entry: WatchRecord = {
        id: `watch-${crypto.randomUUID()}`,
        title: action.title.trim(),
        year: action.year ?? new Date().getFullYear(),
        mediaType: action.mediaType,
        status: action.status ?? 'WATCHLIST',
        lastWatchedSeasonNumber: null,
        lastWatchedEpisodeNumber: null,
        wantsMembershipIds: action.wantsIt === false ? [] : [state.currentMembershipId],
        reviews: [],
        tags: action.tags ?? [],
        createdAt: now,
        updatedAt: now,
        createdByMembershipId: state.currentMembershipId,
        updatedByMembershipId: state.currentMembershipId,
      }
      return { ...state, watch: [...state.watch, entry] }
    }
    case 'createThing': {
      const now = new Date().toISOString()
      const thing: ThingRecord = {
        id: `thing-${crypto.randomUUID()}`,
        name: action.name.trim(),
        lifecycleState: action.lifecycleState ?? 'IDEA',
        priceAmount: action.priceAmount,
        priceCurrency: action.priceAmount !== undefined ? 'USD' : undefined,
        recipientLabel: action.recipientLabel?.trim() || undefined,
        notes: action.notes?.trim() || undefined,
        tags: action.tags ?? [],
        photoUrl: action.photoUrl,
        reservedByMembershipId: null,
        assigneeMembershipId: null,
        createdAt: now,
        updatedAt: now,
        createdByMembershipId: state.currentMembershipId,
        updatedByMembershipId: state.currentMembershipId,
      }
      return { ...state, things: [...state.things, thing] }
    }
    case 'addListItem': {
      const now = new Date().toISOString()
      const item: ListItemRecord = {
        id: `li-${crypto.randomUUID()}`,
        listId: action.listId,
        text: action.text.trim(),
        isComplete: false,
        assigneeMembershipId: null,
        createdAt: now,
        createdByMembershipId: state.currentMembershipId,
      }
      return {
        ...state,
        items: [...state.items, item],
        lists: state.lists.map((list) =>
          list.id === action.listId
            ? { ...list, updatedAt: now, updatedByMembershipId: state.currentMembershipId }
            : list,
        ),
      }
    }
    case 'saveNote':
      return {
        ...state,
        notes: state.notes.map((note) =>
          note.id === action.noteId
            ? {
                ...note,
                title: action.title,
                markdownBody: action.markdownBody,
                updatedAt: new Date().toISOString(),
                updatedByMembershipId: state.currentMembershipId,
              }
            : note,
        ),
      }
    case 'togglePlaceFavorite':
      return {
        ...state,
        places: state.places.map((place) =>
          place.id === action.placeId
            ? {
                ...place,
                isFavorite: !place.isFavorite,
                updatedAt: new Date().toISOString(),
                updatedByMembershipId: state.currentMembershipId,
              }
            : place,
        ),
      }
    case 'toggleWantToWatch':
      return {
        ...state,
        watch: state.watch.map((entry) => {
          if (entry.id !== action.watchId) {
            return entry
          }
          const has = entry.wantsMembershipIds.includes(state.currentMembershipId)
          return {
            ...entry,
            updatedAt: new Date().toISOString(),
            updatedByMembershipId: state.currentMembershipId,
            wantsMembershipIds: has
              ? entry.wantsMembershipIds.filter((id) => id !== state.currentMembershipId)
              : [...entry.wantsMembershipIds, state.currentMembershipId],
          }
        }),
      }
    case 'reserveThing':
      return {
        ...state,
        things: state.things.map((thing) =>
          thing.id === action.thingId
            ? { ...thing, reservedByMembershipId: state.currentMembershipId }
            : thing,
        ),
      }
    case 'releaseThing':
      return {
        ...state,
        things: state.things.map((thing) =>
          thing.id === action.thingId ? { ...thing, reservedByMembershipId: null } : thing,
        ),
      }
    case 'purchaseThing':
      return {
        ...state,
        things: state.things.map((thing) =>
          thing.id === action.thingId
            ? { ...thing, lifecycleState: action.outcome, reservedByMembershipId: null }
            : thing,
        ),
      }
    case 'saveThingNotes':
      return {
        ...state,
        things: state.things.map((thing) =>
          thing.id === action.thingId
            ? {
                ...thing,
                notes: action.notes === '' ? undefined : action.notes,
                updatedAt: new Date().toISOString(),
                updatedByMembershipId: state.currentMembershipId,
              }
            : thing,
        ),
      }
    default:
      return state
  }
}

type PrototypeContextValue = PrototypeState & {
  status: LoadStatus
  retry: () => void
  currentMember: PrototypeState['members'][number]
  setCurrentMember: (membershipId: string) => void
  setItemComplete: (itemId: string, isComplete: boolean) => void
  addListItem: (listId: string, text: string) => ActionResult
  createList: (
    name: string,
    extras?: { description?: string; isPinned?: boolean; tags?: string[] },
  ) => ActionResult
  createNote: (title: string, extras?: { markdownBody?: string; tags?: string[] }) => ActionResult
  createPlace: (
    name: string,
    extras?: {
      neighborhood?: string
      cuisine?: string
      visitState?: PlaceRecord['visitState']
      isFavorite?: boolean
      sharedNote?: string
      tags?: string[]
      photoUrl?: string
    },
  ) => ActionResult
  createWatch: (
    title: string,
    extras?: {
      mediaType?: 'MOVIE' | 'SHOW'
      year?: number
      status?: WatchRecord['status']
      wantsIt?: boolean
      tags?: string[]
    },
  ) => ActionResult
  createThing: (
    name: string,
    extras?: {
      lifecycleState?: ThingRecord['lifecycleState']
      priceAmount?: number
      recipientLabel?: string
      notes?: string
      tags?: string[]
      photoUrl?: string
    },
  ) => ActionResult
  saveNote: (note: Pick<NoteRecord, 'id' | 'title' | 'markdownBody'>) => ActionResult
  toggleWantToWatch: (watchId: string) => void
  togglePlaceFavorite: (placeId: string) => void
  reserveThing: (thingId: string) => ActionResult
  releaseThing: (thingId: string) => ActionResult
  purchaseThing: (thingId: string, outcome: 'OWNED' | 'GIFTED' | 'BOUGHT') => ActionResult
  saveThingNotes: (thingId: string, notes: string) => ActionResult
  unfinishedLists: { list: PrototypeState['lists'][number]; remaining: number }[]
  weShouldPlaces: PrototypeState['places']
  watchTonight: PrototypeState['watch']
  wishThings: PrototypeState['things']
  search: (query: string) => { kind: string; id: string; title: string; hrefSuffix: string }[]
}

const PrototypeContext = createContext<PrototypeContextValue | null>(null)

export function PrototypeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, init)
  const simulation = readSimulation()

  // Mock latency only. Production reads come from @osdk/react, not an effect.
  useEffect(() => {
    const delay = simulation === 'slow' ? 2000 : 300
    const timer = setTimeout(() => {
      dispatch({ type: simulation === 'error' ? 'loadFailed' : 'loaded' })
    }, delay)
    return () => clearTimeout(timer)
  }, [simulation, state.loadAttempt])

  const value = useMemo<PrototypeContextValue>(() => {
    const currentMember =
      state.members.find((member) => member.id === state.currentMembershipId) ?? state.members[0]
    const unfinishedLists = state.lists
      .map((list) => ({
        list,
        remaining: state.items.filter((item) => item.listId === list.id && !item.isComplete).length,
      }))
      .filter((row) => row.remaining > 0)
    const weShouldPlaces = state.places.filter((place) => place.visitState === 'WANT_TO_GO')
    const watchTonight = state.watch.filter(
      (entry) => entry.status === 'WATCHLIST' && everyoneWants(entry, state.members.length),
    )
    const wishThings = state.things.filter((thing) => thingLens(thing.lifecycleState) === 'Wish')

    return {
      ...state,
      currentMember,
      retry: () => dispatch({ type: 'retry' }),
      setCurrentMember: (membershipId) => dispatch({ type: 'setCurrentMember', membershipId }),
      setItemComplete: (itemId, isComplete) =>
        dispatch({ type: 'setItemComplete', itemId, isComplete }),

      addListItem: (listId, text) => {
        if (text.trim() === '') {
          return actionFailed(AppErrorCode.VALIDATION_FAILED)
        }
        dispatch({ type: 'addListItem', listId, text })
        return actionOk
      },

      createList: (name, extras) => {
        if (name.trim() === '') {
          return actionFailed(AppErrorCode.VALIDATION_FAILED)
        }
        dispatch({
          type: 'createList',
          name,
          description: extras?.description,
          isPinned: extras?.isPinned,
          tags: extras?.tags,
        })
        return actionOk
      },

      createNote: (title, extras) => {
        if (title.trim() === '') {
          return actionFailed(AppErrorCode.VALIDATION_FAILED)
        }
        dispatch({ type: 'createNote', title, markdownBody: extras?.markdownBody, tags: extras?.tags })
        return actionOk
      },

      createPlace: (name, extras) => {
        if (name.trim() === '') {
          return actionFailed(AppErrorCode.VALIDATION_FAILED)
        }
        dispatch({
          type: 'createPlace',
          name,
          neighborhood: extras?.neighborhood,
          cuisine: extras?.cuisine,
          visitState: extras?.visitState,
          isFavorite: extras?.isFavorite,
          sharedNote: extras?.sharedNote,
          tags: extras?.tags,
          photoUrl: extras?.photoUrl,
        })
        return actionOk
      },

      createWatch: (title, extras) => {
        if (title.trim() === '') {
          return actionFailed(AppErrorCode.VALIDATION_FAILED)
        }
        dispatch({
          type: 'createWatch',
          title,
          mediaType: extras?.mediaType ?? 'MOVIE',
          year: extras?.year,
          status: extras?.status,
          wantsIt: extras?.wantsIt,
          tags: extras?.tags,
        })
        return actionOk
      },

      createThing: (name, extras) => {
        if (name.trim() === '') {
          return actionFailed(AppErrorCode.VALIDATION_FAILED)
        }
        dispatch({
          type: 'createThing',
          name,
          lifecycleState: extras?.lifecycleState,
          priceAmount: extras?.priceAmount,
          recipientLabel: extras?.recipientLabel,
          notes: extras?.notes,
          tags: extras?.tags,
          photoUrl: extras?.photoUrl,
        })
        return actionOk
      },

      saveNote: (note) => {
        if (note.title.trim() === '') {
          return actionFailed(AppErrorCode.VALIDATION_FAILED)
        }
        dispatch({
          type: 'saveNote',
          noteId: note.id,
          title: note.title,
          markdownBody: note.markdownBody,
        })
        return actionOk
      },

      toggleWantToWatch: (watchId) => dispatch({ type: 'toggleWantToWatch', watchId }),
      togglePlaceFavorite: (placeId) => dispatch({ type: 'togglePlaceFavorite', placeId }),

      reserveThing: (thingId) => {
        const thing = state.things.find((item) => item.id === thingId)
        if (!thing) {
          return actionFailed(AppErrorCode.NOT_FOUND_OR_HIDDEN)
        }
        if (thing.lifecycleState !== 'IDEA' && thing.lifecycleState !== 'BUYING') {
          return actionFailed(AppErrorCode.VALIDATION_FAILED)
        }
        if (thing.reservedByMembershipId) {
          return actionFailed(AppErrorCode.DUPLICATE)
        }
        dispatch({ type: 'reserveThing', thingId })
        return actionOk
      },

      releaseThing: (thingId) => {
        const thing = state.things.find((item) => item.id === thingId)
        if (!thing) {
          return actionFailed(AppErrorCode.NOT_FOUND_OR_HIDDEN)
        }
        // Only the reserver releases, so neither of us can quietly undo the other.
        if (thing.reservedByMembershipId !== state.currentMembershipId) {
          return actionFailed(AppErrorCode.ACCESS_DENIED)
        }
        dispatch({ type: 'releaseThing', thingId })
        return actionOk
      },

      purchaseThing: (thingId, outcome) => {
        const thing = state.things.find((item) => item.id === thingId)
        if (!thing) {
          return actionFailed(AppErrorCode.NOT_FOUND_OR_HIDDEN)
        }
        if (thingLens(thing.lifecycleState) !== 'Wish') {
          return actionFailed(AppErrorCode.VALIDATION_FAILED)
        }
        dispatch({ type: 'purchaseThing', thingId, outcome })
        return actionOk
      },

      saveThingNotes: (thingId, notes) => {
        const thing = state.things.find((item) => item.id === thingId)
        if (!thing) {
          return actionFailed(AppErrorCode.NOT_FOUND_OR_HIDDEN)
        }
        dispatch({ type: 'saveThingNotes', thingId, notes })
        return actionOk
      },

      unfinishedLists,
      weShouldPlaces,
      watchTonight,
      wishThings,
      search: (query) => {
        const q = query.trim().toLowerCase()
        if (!q) {
          return []
        }
        const hits: { kind: string; id: string; title: string; hrefSuffix: string }[] = []
        for (const list of state.lists) {
          const itemText = state.items
            .filter((item) => item.listId === list.id)
            .map((item) => item.text)
            .join(' ')
          if (`${list.name} ${list.description ?? ''} ${list.tags.join(' ')} ${itemText}`.toLowerCase().includes(q)) {
            hits.push({
              kind: 'List',
              id: list.id,
              title: list.name,
              hrefSuffix: `lists/${list.id}`,
            })
          }
        }
        for (const note of state.notes) {
          if (`${note.title} ${note.markdownBody} ${note.tags.join(' ')}`.toLowerCase().includes(q)) {
            hits.push({
              kind: 'Note',
              id: note.id,
              title: note.title,
              hrefSuffix: `notes/${note.id}`,
            })
          }
        }
        for (const place of state.places) {
          const reviews = state.placeReviews[place.id] ?? []
          const reviewText = reviews.map((review) => review.reviewText).join(' ')
          if (
            `${place.name} ${place.neighborhood} ${place.cuisine} ${place.sharedNote ?? ''} ${reviewText}`
              .toLowerCase()
              .includes(q)
          ) {
            hits.push({
              kind: 'Place',
              id: place.id,
              title: place.name,
              hrefSuffix: `places/${place.id}`,
            })
          }
        }
        for (const entry of state.watch) {
          const reviewText = entry.reviews.map((review) => review.reviewText).join(' ')
          if (`${entry.title} ${entry.tags.join(' ')} ${reviewText}`.toLowerCase().includes(q)) {
            hits.push({
              kind: 'Watch',
              id: entry.id,
              title: entry.title,
              hrefSuffix: `watch/${entry.id}`,
            })
          }
        }
        for (const thing of state.things) {
          if (
            `${thing.name} ${thing.notes ?? ''} ${thing.recipientLabel ?? ''} ${thing.tags.join(' ')}`
              .toLowerCase()
              .includes(q)
          ) {
            hits.push({
              kind: 'Thing',
              id: thing.id,
              title: thing.name,
              hrefSuffix: `things/${thing.id}`,
            })
          }
        }
        return hits
      },
    }
  }, [state])

  return <PrototypeContext.Provider value={value}>{children}</PrototypeContext.Provider>
}

export function usePrototype() {
  const value = useContext(PrototypeContext)
  if (!value) {
    throw new Error('usePrototype must be used within PrototypeProvider')
  }
  return value
}

export { reviewSpread, everyoneWants }
