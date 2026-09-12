import { Clapperboard, ListTodo, MapPin, Package, Search, StickyNote } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CardGroup, LinkRow, RowList } from '@/components/jorby/card-group'
import { EmptyState, ScreenHeader } from '@/components/jorby/screen'
import { Tile } from '@/components/jorby/tile'
import { Input } from '@/components/ui/input'
import type { SectionId } from '@/lib/sections'
import { FoundrySearch } from '@/osdk/FoundrySearch'
import { usesFoundryData } from '@/osdk/household-route'
import { usePrototype } from '@/prototype/PrototypeProvider'

/** Search crosses every section, so each hit carries its own type's tone and glyph. */
const hitStyle: Record<string, { tone: SectionId; icon: typeof MapPin }> = {
  List: { tone: 'lists', icon: ListTodo },
  Note: { tone: 'notes', icon: StickyNote },
  Place: { tone: 'places', icon: MapPin },
  Watch: { tone: 'watch', icon: Clapperboard },
  Thing: { tone: 'things', icon: Package },
}

export function SearchPage() {
  const { householdId = '' } = useParams()
  if (usesFoundryData(householdId)) {
    return <FoundrySearch householdId={householdId} />
  }
  return <PrototypeSearch householdId={householdId} />
}

function PrototypeSearch({ householdId }: { householdId: string }) {
  const { search } = usePrototype()
  const [query, setQuery] = useState('')
  const results = useMemo(() => search(query), [query, search])

  return (
    <div>
      <ScreenHeader
        title="Search"
        description="Household catalog only. Provider catalogs stay in the Add flow later."
      />
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
      {query && results.length === 0 ? (
        <EmptyState>No matches in this household.</EmptyState>
      ) : (
        <CardGroup>
          <RowList>
            {results.map((hit) => {
              const style = hitStyle[hit.kind] ?? { tone: 'home' as SectionId, icon: Search }
              return (
                <LinkRow
                  key={`${hit.kind}-${hit.id}`}
                  to={`/${householdId}/${hit.hrefSuffix}`}
                  leading={<Tile icon={style.icon} tone={style.tone} />}
                  title={hit.title}
                  subtitle={hit.kind}
                />
              )
            })}
          </RowList>
        </CardGroup>
      )}
    </div>
  )
}
