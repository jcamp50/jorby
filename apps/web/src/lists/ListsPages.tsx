import { type FormEvent, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { MemberMark, ScreenHeader, Surface } from '@/components/ui/chrome'
import { listDetailPath } from '@/lib/routes'
import { usePrototype } from '@/prototype/PrototypeProvider'

export function ListsIndexPage() {
  const { householdId = '' } = useParams()
  const { lists, items } = usePrototype()
  const sorted = [...lists].sort((a, b) => Number(b.isPinned) - Number(a.isPinned))

  return (
    <div>
      <ScreenHeader title="Lists" description="Pinned first. Anyone can check things off." />
      <ul className="space-y-3">
        {sorted.map((list) => {
          const remaining = items.filter((item) => item.listId === list.id && !item.isComplete).length
          return (
            <li key={list.id}>
              <Link to={listDetailPath(householdId, list.id)}>
                <Surface className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{list.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {list.isPinned ? 'Pinned · ' : ''}
                      {remaining} open
                    </p>
                  </div>
                </Surface>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function ListDetailPage() {
  const { listId = '', householdId = '' } = useParams()
  const { lists, items, members, setItemComplete, addListItem } = usePrototype()
  const list = lists.find((item) => item.id === listId)
  const [draft, setDraft] = useState('')

  if (!list) {
    return <p className="text-sm text-muted-foreground">This list isn’t available.</p>
  }

  function onAdd(event: FormEvent) {
    event.preventDefault()
    addListItem(listId, draft)
    setDraft('')
  }

  return (
    <div>
      <p className="mb-2 text-sm">
        <Link className="underline" to={`/${householdId}/lists`}>
          Lists
        </Link>
      </p>
      <ScreenHeader title={list.name} description={list.description} />
      <ul className="space-y-2">
        {items
          .filter((item) => item.listId === list.id)
          .map((item) => {
            const assignee = members.find((member) => member.id === item.assigneeMembershipId)
            return (
              <li key={item.id}>
                <label className="flex min-h-11 items-start gap-3 rounded-lg border border-border bg-card px-3 py-3">
                  <input
                    type="checkbox"
                    className="mt-1 size-5"
                    checked={item.isComplete}
                    onChange={(event) => setItemComplete(item.id, event.target.checked)}
                  />
                  <span className={item.isComplete ? 'text-muted-foreground line-through' : ''}>{item.text}</span>
                  <span className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                    {assignee ? (
                      <>
                        <MemberMark member={assignee} />
                        <span>{assignee.displayName}</span>
                      </>
                    ) : (
                      'Anyone'
                    )}
                  </span>
                </label>
              </li>
            )
          })}
      </ul>
      <form onSubmit={onAdd} className="mt-6 flex gap-2">
        <input
          className="min-h-11 flex-1 rounded-md border border-input bg-background px-3 text-sm"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Add an item"
          aria-label="New list item"
        />
        <Button type="submit">Add</Button>
      </form>
    </div>
  )
}
