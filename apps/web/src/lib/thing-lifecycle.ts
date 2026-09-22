export type ThingLifecycleState =
  | 'IDEA'
  | 'BUYING'
  | 'BOUGHT'
  | 'OWNED'
  | 'BROKEN'
  | 'UPGRADE_WANTED'
  | 'GIFTED'
  | 'SOLD'

export type ThingLens = 'Wish' | 'Home' | 'History'

export function thingLens(state: ThingLifecycleState): ThingLens {
  if (state === 'IDEA' || state === 'BUYING' || state === 'BOUGHT') {
    return 'Wish'
  }
  if (state === 'OWNED' || state === 'BROKEN' || state === 'UPGRADE_WANTED') {
    return 'Home'
  }
  return 'History'
}

const transitions: Record<ThingLifecycleState, readonly ThingLifecycleState[]> = {
  IDEA: ['BUYING', 'BOUGHT', 'OWNED', 'GIFTED'],
  BUYING: ['IDEA', 'BOUGHT', 'OWNED', 'GIFTED'],
  BOUGHT: ['OWNED', 'GIFTED'],
  OWNED: ['BROKEN', 'UPGRADE_WANTED', 'SOLD'],
  BROKEN: ['OWNED', 'UPGRADE_WANTED', 'SOLD'],
  UPGRADE_WANTED: ['OWNED', 'BROKEN', 'SOLD'],
  GIFTED: [],
  SOLD: [],
}

export function allowedThingTransitions(state: ThingLifecycleState): readonly ThingLifecycleState[] {
  return transitions[state]
}

export function canReserveThing(state: ThingLifecycleState): boolean {
  return state === 'IDEA' || state === 'BUYING'
}

export function lifecycleLabel(state: string) {
  return state.replaceAll('_', ' ').toLowerCase()
}

/** One spoken status line for Thing detail. Not a second copy of the enum. */
export function thingStatusLine({
  state,
  reservedByName,
  storageLocation,
}: {
  state: ThingLifecycleState
  reservedByName?: string
  storageLocation?: string
}): string {
  const lens = thingLens(state)
  if (lens === 'Wish') {
    if (reservedByName) {
      return `${reservedByName} is getting this`
    }
    return 'On the wish list'
  }
  if (lens === 'Home') {
    if (state === 'BROKEN') {
      return storageLocation ? `Needs a fix · ${storageLocation}` : 'Needs a fix'
    }
    if (state === 'UPGRADE_WANTED') {
      return storageLocation ? `Might replace this · ${storageLocation}` : 'Might replace this'
    }
    return storageLocation ? `In the house · ${storageLocation}` : 'In the house'
  }
  if (state === 'GIFTED') {
    return 'Given away'
  }
  return 'Sold'
}
