import { describe, expect, it } from 'vitest'
import { matchesSearch, searchIsActive } from '@/lib/search'

const open = { kinds: [] as string[], tags: [] as string[] }

describe('search filters', () => {
  it('stays idle until there is text, a type, or a tag', () => {
    expect(searchIsActive('  ', open)).toBe(false)
    expect(searchIsActive('', { kinds: ['Note'], tags: [] })).toBe(true)
    expect(searchIsActive('', { kinds: [], tags: ['trips'] })).toBe(true)
  })

  it('requires every selected tag and the selected type', () => {
    expect(matchesSearch('Hudson weekend trips', ['trips'], 'Note', '', { kinds: ['Note'], tags: ['Trips'] })).toBe(
      true,
    )
    expect(matchesSearch('House notes house', ['house'], 'Note', '', { kinds: ['Note'], tags: ['trips'] })).toBe(
      false,
    )
    expect(matchesSearch('Groceries', [], 'List', '', { kinds: ['Note'], tags: [] })).toBe(false)
    expect(
      matchesSearch('Hudson weekend trips', ['trips', 'house'], 'Note', 'weekend', {
        kinds: ['Note'],
        tags: ['trips', 'house'],
      }),
    ).toBe(true)
  })
})