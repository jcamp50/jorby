export function householdPath(householdId: string, section: string) {
  return `/${householdId}/${section}`
}

/** After a household is chosen: pick Jorby Home or Jorby Finance. */
export function householdAppsPath(householdId: string) {
  return `/${householdId}`
}

export function financePath(
  householdId: string,
  section: '' | 'activity' | 'budgets' | 'goals' | 'bills' = '',
) {
  return section === '' ? `/${householdId}/finance` : `/${householdId}/finance/${section}`
}

export function listDetailPath(householdId: string, listId: string) {
  return `/${householdId}/lists/${listId}`
}

export function noteDetailPath(householdId: string, noteId: string) {
  return `/${householdId}/notes/${noteId}`
}

export function placeDetailPath(householdId: string, placeEntryId: string) {
  return `/${householdId}/places/${placeEntryId}`
}

export function watchDetailPath(householdId: string, watchEntryId: string) {
  return `/${householdId}/watch/${watchEntryId}`
}

export function thingDetailPath(householdId: string, thingId: string) {
  return `/${householdId}/things/${thingId}`
}

export function invitePath(token: string) {
  return `/invite/${token}`
}
