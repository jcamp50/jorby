/** Composite Action operation names from the generated 0.20.0 parameter docs. */
export const placeReviewOperation = {
  save: 'SAVE',
} as const

export const watchProviderOperation = {
  saveProvider: 'SAVE_PROVIDER',
} as const

/** Live catalog providers. MOCK stays on deterministic tests only. */
export const placeProvider = 'GOOGLE' as const
export const mediaProvider = 'TMDB' as const

export const watchReactionOperation = {
  want: 'WANT',
  review: 'REVIEW',
} as const

export const thingLifecycleOperation = {
  setState: 'SET_STATE',
} as const

export const thingReservationOperation = {
  reserve: 'RESERVE',
  release: 'RELEASE',
} as const

export const thingDetailsOperation = {
  save: 'SAVE',
} as const
