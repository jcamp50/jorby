import { describe, expect, it } from 'vitest'
import { addTag, normalizeTag, parsePrice } from './tags'

describe('create tags', () => {
  it('trims and strips a leading hash', () => {
    expect(normalizeTag('  #trips ')).toBe('trips')
  })

  it('ignores blanks and duplicates', () => {
    expect(addTag(['trips'], '  ')).toEqual(['trips'])
    expect(addTag(['trips'], 'Trips')).toEqual(['trips'])
    expect(addTag(['trips'], 'house')).toEqual(['trips', 'house'])
  })
})

describe('create price', () => {
  it('reads a dollar amount', () => {
    expect(parsePrice('$12.50')).toBe(12.5)
    expect(parsePrice('')).toBeUndefined()
    expect(parsePrice('-3')).toBeUndefined()
  })
})
