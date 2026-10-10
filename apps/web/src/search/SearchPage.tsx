import { Clapperboard, ListTodo, MapPin, Package, Search, StickyNote } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CardGroup, LinkRow, RowList } from '@/components/jorby/card-group'
import { EmptyState } from '@/components/jorby/screen'
import { Tile } from '@/components/jorby/tile'
import type { SectionId } from '@/lib/sections'
import { FoundrySearch } from '@/osdk/FoundrySearch'
import { usesFoundryData } from '@/osdk/household-route'
import { usePrototype } from '@/prototype/PrototypeProvider'
import { SearchChrome, searchTypeIds, toggleId, type SearchTypeId } from '@/search/SearchChrome'

/** Search crosses every section, so each hit carries its own type's tone and glyph. */
const hitStyle: Record<string, { tone: SectionId; icon: typeof MapPin; label: string }> = {
  List: { tone: 'lists', icon: ListTodo, label: 'List' },
  Note: { tone: 'notes', icon: StickyNote, label: 'Note' },
  Place: { tone: 'places', icon: MapPin, label: 'Place' },
  Watch: { tone: 'watch', icon: Clapperboard, label: 'Watch' },
  Thing: { tone: 'things', icon: Package, label: 'Thing' },
}

const kindByType: Record<SearchTypeId, string> = {
  lists: 'List',
  notes: 'Note',
  places: 'Place',
  watch: 'Watch',
  things: 'Thing',
}

export function SearchPage() {
  const { householdId = '' } = useParams()
  if (usesFoundryData(householdId)) {
    return <FoundrySearch householdId={householdId} />
  }
  return <PrototypeSearch householdId={householdId} />
}

function PrototypeSearch({ householdId }: { householdId: string }) {
  const { search, lists, notes, places, watch, things } = usePrototype()
  const [query, setQuery] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<SearchTypeId[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const tags = useMemo(() => {
    const seen = new Map<string, string>()
    for (const record of [...lists, ...notes, ...places, ...watch, ...things]) {
      for (const tag of record.tags) {
        const id = tag.toLowerCase()
        if (!seen.has(id)) {
          seen.set(id, tag)
        }
      }
    }
    return [...seen.entries()]
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [lists, notes, places, watch, things])
  const results = useMemo(
    () =>
      search(query, {
        kinds: selectedTypes.map((type) => kindByType[type]),
        tags: selectedTags,
      }),
    [query, search, selectedTags, selectedTypes],
  )
  const active = query.trim().length > 0 || selectedTypes.length > 0 || selectedTags.length > 0

  return (
    <div>
      <SearchChrome
        query={query}
        onQueryChange={setQuery}
        selectedTypes={selectedTypes}
        onToggleType={(id) => setSelectedTypes((current) => toggleId(current, id))}
        tags={tags}
        selectedTags={selectedTags}
        onToggleTag={(id) => setSelectedTags((current) => toggleId(current, id))}
      />
      {active && results.length === 0 ? <EmptyState>No matches in this household.</EmptyState> : null}
      {searchTypeIds.map((type) => {
        const kind = kindByType[type]
        const items = results.filter((hit) => hit.kind === kind)
        if (items.length === 0) {
          return null
        }
        const style = hitStyle[kind] ?? { tone: 'home' as SectionId, icon: Search, label: kind }
        return (
          <CardGroup key={kind} label={style.label}>
            <RowList>
              {items.map((hit) => (
                <LinkRow
                  key={`${hit.kind}-${hit.id}`}
                  to={`/${householdId}/${hit.hrefSuffix}`}
                  leading={<Tile icon={style.icon} tone={style.tone} />}
                  title={hit.title}
                  subtitle={style.label}
                />
              ))}
            </RowList>
          </CardGroup>
        )
      })}
    </div>
  )
}
