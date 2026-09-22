import { describe, expect, it } from 'vitest'
import { allowedThingTransitions, canReserveThing, thingLens, thingStatusLine } from '@/lib/thing-lifecycle'
import { majorToMinorUnits, minorUnitsToMajor } from '@/lib/price'
import { displayStarsFromHalfStars, isValidRatingHalfStars } from '@/lib/ratings'
import { normalizeSearchText } from '@/lib/search'
import { financePath, householdAppsPath, householdPath, invitePath, listDetailPath } from '@/lib/routes'
import { claimInviteInputSchema } from '@/membership-service/schemas'

describe('thing lifecycle lenses', () => {
  it('maps wish, home, and history states', () => {
    expect(thingLens('IDEA')).toBe('Wish')
    expect(thingLens('BUYING')).toBe('Wish')
    expect(thingLens('BOUGHT')).toBe('Wish')
    expect(thingLens('OWNED')).toBe('Home')
    expect(thingLens('BROKEN')).toBe('Home')
    expect(thingLens('UPGRADE_WANTED')).toBe('Home')
    expect(thingLens('GIFTED')).toBe('History')
    expect(thingLens('SOLD')).toBe('History')
  })

  it('allows the accepted Wish purchase outcomes', () => {
    expect(allowedThingTransitions('IDEA')).toEqual(['BUYING', 'BOUGHT', 'OWNED', 'GIFTED'])
    expect(allowedThingTransitions('BOUGHT')).toEqual(['OWNED', 'GIFTED'])
    expect(canReserveThing('IDEA')).toBe(true)
    expect(canReserveThing('OWNED')).toBe(false)
  })

  it('speaks one status line instead of repeating the enum', () => {
    expect(thingStatusLine({ state: 'IDEA' })).toBe('On the wish list')
    expect(thingStatusLine({ state: 'IDEA', reservedByName: 'Jordan' })).toBe(
      'Jordan is getting this',
    )
    expect(thingStatusLine({ state: 'OWNED', storageLocation: 'Kitchen' })).toBe(
      'In the house · Kitchen',
    )
    expect(thingStatusLine({ state: 'GIFTED' })).toBe('Given away')
  })
})

describe('price minor units', () => {
  it('converts USD minor units to major units and back', () => {
    expect(minorUnitsToMajor('1299', 'USD')).toBe(12.99)
    expect(majorToMinorUnits(12.99, 'USD')).toBe('1299')
  })
})

describe('ratings', () => {
  it('converts integer half-stars to displayed stars', () => {
    expect(displayStarsFromHalfStars(7)).toBe(3.5)
    expect(isValidRatingHalfStars(7)).toBe(true)
    expect(isValidRatingHalfStars(7.5)).toBe(false)
  })
})

describe('search normalization', () => {
  it('trims, collapses whitespace, and lowercases', () => {
    expect(normalizeSearchText('  Thai  Place ')).toBe('thai place')
  })
})

describe('routes', () => {
  it('builds household-scoped paths', () => {
    expect(householdPath('hh-1', 'lists')).toBe('/hh-1/lists')
    expect(householdAppsPath('hh-1')).toBe('/hh-1')
    expect(financePath('hh-1')).toBe('/hh-1/finance')
    expect(financePath('hh-1', 'activity')).toBe('/hh-1/finance/activity')
    expect(financePath('hh-1', 'budgets')).toBe('/hh-1/finance/budgets')
    expect(financePath('hh-1', 'bills')).toBe('/hh-1/finance/bills')
    expect(listDetailPath('hh-1', 'list-2')).toBe('/hh-1/lists/list-2')
    expect(invitePath('token')).toBe('/invite/token')
  })
})

describe('membership schemas', () => {
  it('accepts a claim payload', () => {
    const parsed = claimInviteInputSchema.parse({
      token: 'opaque-token',
      profile: {
        displayName: 'Jordan',
        avatarUrl: null,
        profileColor: 'violet',
      },
    })
    expect(parsed.profile.displayName).toBe('Jordan')
  })
})
