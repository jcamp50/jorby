import { ChevronRight, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState, ScreenHeader } from '@/components/jorby/screen'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { usePrototype } from '@/prototype/PrototypeProvider'

export function SearchPage() {
  const { householdId = '' } = useParams()
  const { search } = usePrototype()
  const [query, setQuery] = useState('')
  const results = useMemo(() => search(query), [query, search])

  return (
    <div>
      <ScreenHeader
        title="Search"
        description="Household catalog only. Provider catalogs stay in the Add flow later."
      />
      <div className="relative mb-4">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          className="h-12 pl-9"
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
        <ul className="grid gap-3 sm:grid-cols-2">
          {results.map((hit) => (
            <li key={`${hit.kind}-${hit.id}`}>
              <Card className="gap-0 py-0 transition-colors hover:bg-accent/40">
                <Link
                  to={`/${householdId}/${hit.hrefSuffix}`}
                  className="flex min-h-16 items-center gap-3 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <Badge variant="secondary" className="mb-1.5">
                      {hit.kind}
                    </Badge>
                    <p className="font-medium text-pretty">{hit.title}</p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
