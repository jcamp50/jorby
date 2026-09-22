import { JorbyContent } from '@/osdk/resources'
import { useOsdkObjects } from '@osdk/react'
import { Clapperboard, ListTodo, MapPin, Package, Search, StickyNote } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CardGroup, LinkRow, RowList } from '@/components/jorby/card-group'
import { EmptyState, ScreenHeader } from '@/components/jorby/screen'
import { Tile } from '@/components/jorby/tile'
import { Input } from '@/components/ui/input'
import { useDebouncedValue } from '@/lib/debounce'
import type { SectionId } from '@/lib/sections'
import { contentDetailPath, contentTypeLabel } from '@/osdk/content'
import {
  JorbyPlaceEntry,
  JorbySharedList,
  JorbySharedNote,
  JorbyThing,
  JorbyWatchEntry,
} from '@/osdk/resources'

const hitStyle: Record<string, { tone: SectionId; icon: typeof MapPin }> = {
  [JorbySharedList.apiName]: { tone: 'lists', icon: ListTodo },
  [JorbySharedNote.apiName]: { tone: 'notes', icon: StickyNote },
  [JorbyPlaceEntry.apiName]: { tone: 'places', icon: MapPin },
  [JorbyWatchEntry.apiName]: { tone: 'watch', icon: Clapperboard },
  [JorbyThing.apiName]: { tone: 'things', icon: Package },
}

export function FoundrySearch({ householdId }: { householdId: string }) {
  const [query, setQuery] = useState('')
  const term = useDebouncedValue(query.trim(), 300)
  const enabled = term.length >= 2
  const results = useOsdkObjects(JorbyContent, {
    where: {
      householdId: { $eq: householdId },
      archivedAt: { $isNull: true },
      searchText: { $containsAllTerms: term },
    },
    orderBy: { updatedAt: 'desc' },
    pageSize: 40,
    enabled,
  })
  const hits = results.data ?? []
  const grouped = useMemo(() => {
    const buckets = new Map<string, typeof hits>()
    for (const hit of hits) {
      const key = hit.$objectType
      const current = buckets.get(key) ?? []
      current.push(hit)
      buckets.set(key, current)
    }
    return buckets
  }, [hits])
  const empty = enabled && !results.isLoading && hits.length === 0

  return (
    <div>
      <ScreenHeader title="Search" />
      <div className="relative mb-5">
        <Search
          className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          className="h-13 rounded-full border-0 bg-card pl-11 shadow-card"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Lists, notes, places, watch, things"
          aria-label="Search Jorby"
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
        />
      </div>
      {empty ? <EmptyState>No matches in this household.</EmptyState> : null}
      {[...grouped.entries()].map(([type, items]) => {
        const style = hitStyle[type] ?? { tone: 'lists' as const, icon: ListTodo }
        return (
          <CardGroup key={type} label={contentTypeLabel(type)}>
            <RowList>
              {items.map((item) => {
                const to = contentDetailPath(householdId, item)
                if (!to) {
                  return null
                }
                return (
                  <LinkRow
                    key={`${type}:${item.contentId}`}
                    to={to}
                    leading={<Tile icon={style.icon} tone={style.tone} />}
                    title={item.displayTitle ?? 'Untitled'}
                    subtitle={contentTypeLabel(type)}
                  />
                )
              })}
            </RowList>
          </CardGroup>
        )
      })}
    </div>
  )
}
