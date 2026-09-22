import { describe, expect, it } from 'vitest'
import {
  buildActivityFeed,
  formatActivityTime,
  joinItemNames,
  type ActivityInput,
} from '@/lib/activity'

const names: Record<string, string> = { jordan: 'Jordan', sam: 'Sam' }

function input(partial: Partial<ActivityInput> = {}): ActivityInput {
  return {
    parents: [],
    listItems: [],
    children: [],
    actorName: (id) => names[id] ?? '',
    ...partial,
  }
}

describe('activity copy', () => {
  it('joins item names in a spoken list', () => {
    expect(joinItemNames(['Milk'])).toBe('Milk')
    expect(joinItemNames(['Milk', 'Eggs'])).toBe('Milk and Eggs')
    expect(joinItemNames(['Milk', 'Eggs', 'Butter'])).toBe('Milk, Eggs, and Butter')
    expect(joinItemNames(['A', 'B', 'C', 'D'])).toBe('A, B, and 2 more')
  })

  it('formats relative time', () => {
    const now = Date.parse('2026-09-18T16:00:00Z')
    expect(formatActivityTime(now - 30_000, now)).toBe('Just now')
    expect(formatActivityTime(now - 3 * 60_000, now)).toBe('3m ago')
    expect(formatActivityTime(now - 5 * 60 * 60_000, now)).toBe('5h ago')
    expect(formatActivityTime(now - 26 * 60 * 60_000, now)).toBe('Yesterday')
  })
})

describe('activity feed', () => {
  it('groups list items and suppresses the parent list update', () => {
    const events = buildActivityFeed(
      input({
        parents: [
          {
            id: 'list-1',
            kind: 'lists',
            title: 'Groceries',
            createdAt: 1_000,
            updatedAt: 8_000,
            createdById: 'jordan',
            updatedById: 'jordan',
            revision: 4,
          },
        ],
        listItems: [
          { id: 'a', listId: 'list-1', text: 'Milk', createdAt: 7_000, createdById: 'jordan' },
          { id: 'b', listId: 'list-1', text: 'Eggs', createdAt: 8_000, createdById: 'jordan' },
        ],
      }),
    )
    expect(events).toHaveLength(1)
    expect(events[0].actorName).toBe('Jordan')
    expect(events[0].verb).toBe('added')
    expect(events[0].objectTitle).toBe('Groceries')
    expect(events[0].items).toEqual(['Milk', 'Eggs'])
  })

  it('uses domain verbs for create vs edit', () => {
    const events = buildActivityFeed(
      input({
        parents: [
          {
            id: 'note-1',
            kind: 'notes',
            title: 'Weekend notes',
            createdAt: 1_000,
            updatedAt: 50_000,
            createdById: 'sam',
            updatedById: 'jordan',
            revision: 3,
          },
          {
            id: 'place-1',
            kind: 'places',
            title: 'Lilia',
            createdAt: 2_000,
            updatedAt: 2_000,
            createdById: 'sam',
            updatedById: 'sam',
            revision: 1,
            visitState: 'WANT_TO_GO',
          },
        ],
      }),
    )
    expect(events.map((event) => `${event.actorName} ${event.verb} ${event.objectTitle}`)).toEqual([
      'Jordan edited Weekend notes',
      'Sam wants to go Lilia',
    ])
  })

  it('prefers a review child over a generic parent update', () => {
    const events = buildActivityFeed(
      input({
        parents: [
          {
            id: 'place-1',
            kind: 'places',
            title: 'Prince Street Pizza',
            createdAt: 1_000,
            updatedAt: 9_000,
            createdById: 'jordan',
            updatedById: 'sam',
            revision: 2,
            visitState: 'BEEN',
          },
        ],
        children: [
          { id: 'rev-1', parentId: 'place-1', kind: 'review', at: 9_000, actorId: 'sam' },
        ],
      }),
    )
    expect(events).toHaveLength(1)
    expect(events[0].verb).toBe('reviewed')
    expect(events[0].objectTitle).toBe('Prince Street Pizza')
    expect(events[0].actorName).toBe('Sam')
  })

  it('falls back to Someone when the actor is unknown', () => {
    const events = buildActivityFeed(
      input({
        parents: [
          {
            id: 'thing-1',
            kind: 'things',
            title: 'Profitec Go',
            createdAt: 1_000,
            updatedAt: 1_000,
            createdById: 'unknown',
            updatedById: 'unknown',
            revision: 1,
            lifecycleState: 'IDEA',
          },
        ],
      }),
    )
    expect(events[0].actorName).toBe('Someone')
    expect(events[0].verb).toBe('added to wishes')
    expect(events[0].objectTitle).toBe('Profitec Go')
  })
})
