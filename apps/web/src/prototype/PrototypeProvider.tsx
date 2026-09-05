import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react'
import { thingLens } from '@/lib/thing-lifecycle'
import {
  createSeedState,
  everyoneWants,
  reviewSpread,
  type ListItemRecord,
  type NoteRecord,
  type PrototypeState,
} from '@/prototype/model'

type Action =
  | { type: 'setCurrentMember'; membershipId: string }
  | { type: 'setItemComplete'; itemId: string; isComplete: boolean }
  | { type: 'addListItem'; listId: string; text: string }
  | { type: 'saveNote'; noteId: string; title: string; markdownBody: string }
  | { type: 'toggleWantToWatch'; watchId: string }
  | { type: 'reserveThing'; thingId: string }
  | { type: 'releaseThing'; thingId: string }
  | { type: 'purchaseThing'; thingId: string; outcome: 'OWNED' | 'GIFTED' | 'BOUGHT' }

function reducer(state: PrototypeState, action: Action): PrototypeState {
  switch (action.type) {
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
      if (!item.text) {
        return state
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
          thing.id === action.thingId && (thing.lifecycleState === 'IDEA' || thing.lifecycleState === 'BUYING')
            ? { ...thing, reservedByMembershipId: state.currentMembershipId }
            : thing,
        ),
      }
    case 'releaseThing':
      return {
        ...state,
        things: state.things.map((thing) =>
          thing.id === action.thingId && thing.reservedByMembershipId === state.currentMembershipId
            ? { ...thing, reservedByMembershipId: null }
            : thing,
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
  currentMember: PrototypeState['members'][number]
  setCurrentMember: (membershipId: string) => void
  setItemComplete: (itemId: string, isComplete: boolean) => void
  addListItem: (listId: string, text: string) => void
  saveNote: (note: Pick<NoteRecord, 'id' | 'title' | 'markdownBody'>) => void
  toggleWantToWatch: (watchId: string) => void
  reserveThing: (thingId: string) => void
  releaseThing: (thingId: string) => void
  purchaseThing: (thingId: string, outcome: 'OWNED' | 'GIFTED' | 'BOUGHT') => void
  unfinishedLists: { list: PrototypeState['lists'][number]; remaining: number }[]
  weShouldPlaces: PrototypeState['places']
  watchTonight: PrototypeState['watch']
  wishThings: PrototypeState['things']
  search: (query: string) => { kind: string; id: string; title: string; hrefSuffix: string }[]
}

const PrototypeContext = createContext<PrototypeContextValue | null>(null)

export function PrototypeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createSeedState)

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
      setCurrentMember: (membershipId) => dispatch({ type: 'setCurrentMember', membershipId }),
      setItemComplete: (itemId, isComplete) => dispatch({ type: 'setItemComplete', itemId, isComplete }),
      addListItem: (listId, text) => dispatch({ type: 'addListItem', listId, text }),
      saveNote: (note) =>
        dispatch({ type: 'saveNote', noteId: note.id, title: note.title, markdownBody: note.markdownBody }),
      toggleWantToWatch: (watchId) => dispatch({ type: 'toggleWantToWatch', watchId }),
      reserveThing: (thingId) => dispatch({ type: 'reserveThing', thingId }),
      releaseThing: (thingId) => dispatch({ type: 'releaseThing', thingId }),
      purchaseThing: (thingId, outcome) => dispatch({ type: 'purchaseThing', thingId, outcome }),
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
            hits.push({ kind: 'List', id: list.id, title: list.name, hrefSuffix: `lists/${list.id}` })
          }
        }
        for (const note of state.notes) {
          if (`${note.title} ${note.markdownBody} ${note.tags.join(' ')}`.toLowerCase().includes(q)) {
            hits.push({ kind: 'Note', id: note.id, title: note.title, hrefSuffix: `notes/${note.id}` })
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
            hits.push({ kind: 'Place', id: place.id, title: place.name, hrefSuffix: `places/${place.id}` })
          }
        }
        for (const entry of state.watch) {
          const reviewText = entry.reviews.map((review) => review.reviewText).join(' ')
          if (`${entry.title} ${reviewText}`.toLowerCase().includes(q)) {
            hits.push({ kind: 'Watch', id: entry.id, title: entry.title, hrefSuffix: `watch/${entry.id}` })
          }
        }
        for (const thing of state.things) {
          if (`${thing.name} ${thing.notes ?? ''} ${thing.recipientLabel ?? ''}`.toLowerCase().includes(q)) {
            hits.push({ kind: 'Thing', id: thing.id, title: thing.name, hrefSuffix: `things/${thing.id}` })
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
