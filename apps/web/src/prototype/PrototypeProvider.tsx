import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { actionFailed, actionOk, AppErrorCode, type ActionResult } from '@/lib/errors'
import { thingLens } from '@/lib/thing-lifecycle'
import {
  createSeedState,
  everyoneWants,
  reviewSpread,
  type ListItemRecord,
  type NoteRecord,
  type PrototypeState,
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
  | { type: 'saveNote'; noteId: string; title: string; markdownBody: string }
  | { type: 'toggleWantToWatch'; watchId: string }
  | { type: 'reserveThing'; thingId: string }
  | { type: 'releaseThing'; thingId: string }
  | { type: 'purchaseThing'; thingId: string; outcome: 'OWNED' | 'GIFTED' | 'BOUGHT' }

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
    case 'addListItem': {
      const item: ListItemRecord = {
        id: `li-${crypto.randomUUID()}`,
        listId: action.listId,
        text: action.text.trim(),
        isComplete: false,
        assigneeMembershipId: null,
      }
      return { ...state, items: [...state.items, item] }
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
              }
            : note,
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
  saveNote: (note: Pick<NoteRecord, 'id' | 'title' | 'markdownBody'>) => ActionResult
  toggleWantToWatch: (watchId: string) => void
  reserveThing: (thingId: string) => ActionResult
  releaseThing: (thingId: string) => ActionResult
  purchaseThing: (thingId: string, outcome: 'OWNED' | 'GIFTED' | 'BOUGHT') => ActionResult
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
          if (`${list.name} ${list.description ?? ''} ${itemText}`.toLowerCase().includes(q)) {
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
          if (`${entry.title} ${reviewText}`.toLowerCase().includes(q)) {
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
            `${thing.name} ${thing.notes ?? ''} ${thing.recipientLabel ?? ''}`
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
