import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ScreenHeader, Surface } from '@/components/ui/chrome'
import { usePrototype } from '@/prototype/PrototypeProvider'

export function SearchPage() {
  const { householdId = '' } = useParams()
  const { search } = usePrototype()
  const [query, setQuery] = useState('')
  const results = useMemo(() => search(query), [query, search])

  return (
    <div>
      <ScreenHeader title="Search" description="Household catalog only. Provider catalogs stay in the Add flow later." />
      <label className="mb-4 block text-sm">
        <span className="sr-only">Search Jorby</span>
        <input
          className="min-h-11 w-full rounded-md border border-input bg-background px-3"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Lists, notes, places, watch, things"
          type="search"
        />
      </label>
      {query && results.length === 0 ? (
        <p className="text-sm text-muted-foreground">No matches in this household.</p>
      ) : (
        <ul className="space-y-3">
          {results.map((hit) => (
            <li key={`${hit.kind}-${hit.id}`}>
              <Link to={`/${householdId}/${hit.hrefSuffix}`}>
                <Surface>
                  <p className="text-xs text-muted-foreground">{hit.kind}</p>
                  <p className="font-medium">{hit.title}</p>
                </Surface>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
