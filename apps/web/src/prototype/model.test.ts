import { describe, expect, it } from 'vitest'
import { createSeedState, everyoneWants, jordan, reviewSpread, sam } from '@/prototype/model'

describe('everyone wants (D-WATCH-006)', () => {
  const base = createSeedState().watch[0]

  it('is true only when every active member has reacted', () => {
    expect(everyoneWants({ ...base, wantsMembershipIds: [jordan.id, sam.id] }, 2)).toBe(true)
    expect(everyoneWants({ ...base, wantsMembershipIds: [jordan.id] }, 2)).toBe(false)
  })

  it('treats a missing reaction as a no, not a yes', () => {
    expect(everyoneWants({ ...base, wantsMembershipIds: [] }, 2)).toBe(false)
  })

  it('is false when the household has no active members', () => {
    expect(everyoneWants({ ...base, wantsMembershipIds: [] }, 0)).toBe(false)
  })
})

describe('review spread', () => {
  it('needs two reviews before a spread exists', () => {
    expect(reviewSpread(undefined)).toBeNull()
    expect(reviewSpread([{ membershipId: jordan.id, ratingHalfStars: 9, reviewText: '' }])).toBeNull()
  })

  it('measures disagreement in half-star units', () => {
    const spread = reviewSpread([
      { membershipId: jordan.id, ratingHalfStars: 9, reviewText: '' },
      { membershipId: sam.id, ratingHalfStars: 6, reviewText: '' },
    ])
    expect(spread).toBe(3)
  })
})
