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
