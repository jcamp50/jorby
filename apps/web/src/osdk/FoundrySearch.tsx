import { JorbySharedList, JorbySharedNote } from '@/osdk/resources'
import { useOsdkObjects } from '@osdk/react'
import { ListTodo, Search, StickyNote } from 'lucide-react'
import { useState } from 'react'
import { CardGroup, LinkRow, RowList } from '@/components/jorby/card-group'
import { EmptyState, ScreenHeader } from '@/components/jorby/screen'
import { Tile } from '@/components/jorby/tile'
import { Input } from '@/components/ui/input'
import { listDetailPath, noteDetailPath } from '@/lib/routes'

export function FoundrySearch({ householdId }: { householdId: string }) {
  const [query, setQuery] = useState('')
  const term = query.trim()
  const enabled = term.length >= 2

  const lists = useOsdkObjects(JorbySharedList, {
    where: {
      householdId: { $eq: householdId },
      archivedAt: { $isNull: true },
      searchText: { $containsAllTerms: term },
    },
    pageSize: 20,
    enabled,
  })
  const notes = useOsdkObjects(JorbySharedNote, {
    where: {
      householdId: { $eq: householdId },
      archivedAt: { $isNull: true },
      searchText: { $containsAllTerms: term },
    },
    pageSize: 20,
    enabled,
  })

  const listHits = lists.data ?? []
  const noteHits = notes.data ?? []
  const empty = enabled && !lists.isLoading && !notes.isLoading && listHits.length === 0 && noteHits.length === 0

  return (
    <div>
      <ScreenHeader
        title="Search"
        description="Lists and notes in this household. Places, Watch, and Things are not searchable yet."
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
          placeholder="Lists and notes"
          aria-label="Search Jorby"
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
        />
      </div>
      {empty ? <EmptyState>No matches in this household.</EmptyState> : null}
      {listHits.length > 0 ? (
        <CardGroup label="Lists">
          <RowList>
            {listHits.map((list) => (
              <LinkRow
                key={list.$primaryKey}
                to={listDetailPath(householdId, list.listId)}
                leading={<Tile icon={ListTodo} tone="lists" />}
                title={list.name ?? 'Untitled list'}
                subtitle="List"
              />
            ))}
          </RowList>
        </CardGroup>
      ) : null}
      {noteHits.length > 0 ? (
        <CardGroup label="Notes">
          <RowList>
            {noteHits.map((note) => (
              <LinkRow
                key={note.$primaryKey}
                to={noteDetailPath(householdId, note.noteId)}
                leading={<Tile icon={StickyNote} tone="notes" />}
                title={note.title ?? 'Untitled note'}
                subtitle="Note"
              />
            ))}
          </RowList>
        </CardGroup>
      ) : null}
    </div>
  )
}
