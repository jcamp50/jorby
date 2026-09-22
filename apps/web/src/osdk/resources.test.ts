import { $Actions, $Interfaces, $Objects, $Queries } from '@jorby/sdk'
import { describe, expect, it } from 'vitest'
import * as resources from './resources'

describe('OSDK consumer boundary', () => {
  it('exports exactly $Objects ∪ $Actions ∪ $Queries ∪ $Interfaces', () => {
    const expected = {
      ...$Objects,
      ...$Actions,
      ...$Queries,
      ...$Interfaces,
    }
    expect(Object.keys(resources).sort()).toEqual(Object.keys(expected).sort())
    expect(Object.keys(expected)).toHaveLength(72)
  })

  it('does not re-export namespace or metadata objects', () => {
    expect(resources).not.toHaveProperty('$Objects')
    expect(resources).not.toHaveProperty('$Actions')
    expect(resources).not.toHaveProperty('$Queries')
    expect(resources).not.toHaveProperty('$Interfaces')
    expect(resources).not.toHaveProperty('$osdkMetadata')
    expect(resources).not.toHaveProperty('$branch')
    expect(resources).not.toHaveProperty('$ontologyRid')
  })

  it('does not export removed legacy List symbols', () => {
    expect(resources).not.toHaveProperty('archiveJorbySharedList')
    expect(resources).not.toHaveProperty('completeJorbyListItem')
    expect(resources).not.toHaveProperty('reopenJorbyListItem')
    expect(resources).not.toHaveProperty('restoreJorbySharedList')
    expect(resources).not.toHaveProperty('updateJorbyListItem')
    expect(resources).not.toHaveProperty('updateJorbySharedList')
    expect(resources).not.toHaveProperty('provisionJorbyHousehold')
  })
})
