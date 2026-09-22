import {
  listDetailPath,
  noteDetailPath,
  placeDetailPath,
  thingDetailPath,
  watchDetailPath,
} from '@/lib/routes'
import {
  JorbyPlaceEntry,
  JorbySharedList,
  JorbySharedNote,
  JorbyThing,
  JorbyWatchEntry,
} from '@/osdk/resources'

const contentPaths: Record<string, (householdId: string, id: string) => string> = {
  [JorbySharedList.apiName]: listDetailPath,
  [JorbySharedNote.apiName]: noteDetailPath,
  [JorbyPlaceEntry.apiName]: placeDetailPath,
  [JorbyWatchEntry.apiName]: watchDetailPath,
  [JorbyThing.apiName]: thingDetailPath,
}

export function contentDetailPath(
  householdId: string,
  item: { $objectType: string; contentId?: string },
) {
  const id = item.contentId
  const to = contentPaths[item.$objectType]
  if (!id || !to) {
    return undefined
  }
  return to(householdId, id)
}

export function contentTypeLabel(objectType: string) {
  switch (objectType) {
    case JorbySharedList.apiName:
      return 'List'
    case JorbySharedNote.apiName:
      return 'Note'
    case JorbyPlaceEntry.apiName:
      return 'Place'
    case JorbyWatchEntry.apiName:
      return 'Watch'
    case JorbyThing.apiName:
      return 'Thing'
    default:
      return 'Item'
  }
}
