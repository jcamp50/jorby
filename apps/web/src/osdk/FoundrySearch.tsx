import { useOsdkObjects } from '@osdk/react'
import { Clapperboard, ListTodo, MapPin, Package, StickyNote } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CardGroup, LinkRow, RowList } from '@/components/jorby/card-group'
import { EmptyState } from '@/components/jorby/screen'
import { Tile } from '@/components/jorby/tile'
import { useDebouncedValue } from '@/lib/debounce'
import type { SectionId } from '@/lib/sections'
import { contentDetailPath, contentTypeLabel } from '@/osdk/content'
import {
  JorbyContent,
  JorbyPlaceEntry,
  JorbySharedList,
  JorbySharedNote,
  JorbyTag,
  JorbyThing,
  JorbyWatchEntry,
} from '@/osdk/resources'
import {
  listDetailPath,
  noteDetailPath,
  placeDetailPath,
  thingDetailPath,
  watchDetailPath,
} from '@/lib/routes'
import { SearchChrome, toggleId, type SearchTypeId } from '@/search/SearchChrome'

const hitStyle: Record<string, { tone: SectionId; icon: typeof MapPin }> = {
  [JorbySharedList.apiName]: { tone: 'lists', icon: ListTodo },
  [JorbySharedNote.apiName]: { tone: 'notes', icon: StickyNote },
  [JorbyPlaceEntry.apiName]: { tone: 'places', icon: MapPin },
  [JorbyWatchEntry.apiName]: { tone: 'watch', icon: Clapperboard },
  [JorbyThing.apiName]: { tone: 'things', icon: Package },
}

const typeOrder = [
  JorbySharedList.apiName,
  JorbySharedNote.apiName,
  JorbyPlaceEntry.apiName,
  JorbyWatchEntry.apiName,
  JorbyThing.apiName,
]

type SearchHit = {
  key: string
  type: string
  title: string
  to: string
}

function contentWhere(householdId: string, term: string, tags: readonly string[]) {
  return {
    $and: [
      { householdId: { $eq: householdId } },
      { archivedAt: { $isNull: true } },
      ...(term.length >= 2 ? [{ searchText: { $containsAllTerms: term } }] : []),
      ...tags.map((tag) => ({ tagNames: { $contains: tag } })),
    ],
  }
}

export function FoundrySearch({ householdId }: { householdId: string }) {
  const [query, setQuery] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<SearchTypeId[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const term = useDebouncedValue(query.trim(), 300)
  const active = term.length >= 2 || selectedTypes.length > 0 || selectedTags.length > 0
  const narrowed = selectedTypes.length > 0
  const where = contentWhere(householdId, term, selectedTags)
  const queryOptions = { where, orderBy: { updatedAt: 'desc' as const }, pageSize: 40 }
  const tags = useOsdkObjects(JorbyTag, {
    where: { householdId: { $eq: householdId }, archivedAt: { $isNull: true } },
    pageSize: 200,
  })
  const tagChoices = useMemo(() => {
    const seen = new Map<string, string>()
    for (const tag of tags.data ?? []) {
      const id = tag.normalizedName ?? tag.name?.toLowerCase()
      const label = tag.name ?? tag.normalizedName
      if (id && label && !seen.has(id)) {
        seen.set(id, label)
      }
    }
    return [...seen.entries()]
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [tags.data])

  const everything = useOsdkObjects(JorbyContent, { ...queryOptions, enabled: active && !narrowed })
  const lists = useOsdkObjects(JorbySharedList, {
    ...queryOptions,
    enabled: active && selectedTypes.includes('lists'),
  })
  const notes = useOsdkObjects(JorbySharedNote, {
    ...queryOptions,
    enabled: active && selectedTypes.includes('notes'),
  })
  const places = useOsdkObjects(JorbyPlaceEntry, {
    ...queryOptions,
    enabled: active && selectedTypes.includes('places'),
  })
  const watch = useOsdkObjects(JorbyWatchEntry, {
    ...queryOptions,
    enabled: active && selectedTypes.includes('watch'),
  })
  const things = useOsdkObjects(JorbyThing, {
    ...queryOptions,
    enabled: active && selectedTypes.includes('things'),
  })

  const hits = useMemo(() => {
    const next: SearchHit[] = []
    if (!narrowed) {
      for (const item of everything.data ?? []) {
        const to = contentDetailPath(householdId, item)
        if (!to) {
          continue
        }
        next.push({
          key: `${item.$objectType}:${item.contentId}`,
          type: item.$objectType,
          title: item.displayTitle ?? 'Untitled',
          to,
        })
      }
      return next
    }
    for (const item of lists.data ?? []) {
      next.push({
        key: item.listId,
        type: JorbySharedList.apiName,
        title: item.name ?? 'Untitled',
        to: listDetailPath(householdId, item.listId),
      })
    }
    for (const item of notes.data ?? []) {
      next.push({
        key: item.noteId,
        type: JorbySharedNote.apiName,
        title: item.title ?? 'Untitled',
        to: noteDetailPath(householdId, item.noteId),
      })
    }
    for (const item of places.data ?? []) {
      next.push({
        key: item.placeEntryId,
        type: JorbyPlaceEntry.apiName,
        title: item.displayTitle ?? 'Untitled',
        to: placeDetailPath(householdId, item.placeEntryId),
      })
    }
    for (const item of watch.data ?? []) {
      next.push({
        key: item.watchEntryId,
        type: JorbyWatchEntry.apiName,
        title: item.displayTitle ?? 'Untitled',
        to: watchDetailPath(householdId, item.watchEntryId),
      })
    }
    for (const item of things.data ?? []) {
      next.push({
        key: item.thingId,
        type: JorbyThing.apiName,
        title: item.name ?? 'Untitled',
        to: thingDetailPath(householdId, item.thingId),
      })
    }
    return next
  }, [everything.data, householdId, lists.data, narrowed, notes.data, places.data, things.data, watch.data])

  const pending =
    (active && !narrowed && everything.isLoading) ||
    (selectedTypes.includes('lists') && lists.isLoading) ||
    (selectedTypes.includes('notes') && notes.isLoading) ||
    (selectedTypes.includes('places') && places.isLoading) ||
    (selectedTypes.includes('watch') && watch.isLoading) ||
    (selectedTypes.includes('things') && things.isLoading)
  const empty = active && !pending && hits.length === 0

  return (
    <div>
      <SearchChrome
        query={query}
        onQueryChange={setQuery}
        selectedTypes={selectedTypes}
        onToggleType={(id) => setSelectedTypes((current) => toggleId(current, id))}
        tags={tagChoices}
        selectedTags={selectedTags}
        onToggleTag={(id) => setSelectedTags((current) => toggleId(current, id))}
      />
      {empty ? <EmptyState>No matches in this household.</EmptyState> : null}
      {typeOrder.map((type) => {
        const items = hits.filter((hit) => hit.type === type)
        if (items.length === 0) {
          return null
        }
        const style = hitStyle[type] ?? { tone: 'lists' as const, icon: ListTodo }
        const label = contentTypeLabel(type)
        return (
          <CardGroup key={type} label={label}>
            <RowList>
              {items.map((item) => (
                <LinkRow
                  key={item.key}
                  to={item.to}
                  leading={<Tile icon={style.icon} tone={style.tone} />}
                  title={item.title}
                  subtitle={label}
                />
              ))}
            </RowList>
          </CardGroup>
        )
      })}
    </div>
  )
}
