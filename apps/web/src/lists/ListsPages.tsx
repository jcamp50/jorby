import { ChevronRight, Plus } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MemberMark } from '@/components/jorby/member-mark'
import { EmptyState, BackLink, ScreenHeader } from '@/components/jorby/screen'
import { NotFoundState } from '@/components/jorby/states'
import { toastResult } from '@/lib/action-toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { householdPath, listDetailPath } from '@/lib/routes'
import { usePrototype } from '@/prototype/PrototypeProvider'

export function ListsIndexPage() {
  const { householdId = '' } = useParams()
  const { lists, items } = usePrototype()
  const sorted = [...lists].sort((a, b) => Number(b.isPinned) - Number(a.isPinned))

  return (
    <div>
      <ScreenHeader title="Lists" description="Pinned first. Either of us can check things off." />
      {sorted.length === 0 ? (
        <EmptyState>No lists yet.</EmptyState>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {sorted.map((list) => {
            const remaining = items.filter(
              (item) => item.listId === list.id && !item.isComplete,
            ).length
            return (
              <li key={list.id}>
                <Card className="gap-0 py-0 transition-colors hover:bg-accent/40">
                  <Link
                    to={listDetailPath(householdId, list.id)}
                    className="flex min-h-16 items-center gap-3 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 font-medium">
                        <span className="truncate">{list.name}</span>
                        {list.isPinned ? <Badge variant="secondary">Pinned</Badge> : null}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {remaining} open {remaining === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  </Link>
                </Card>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export function ListDetailPage() {
  const { listId = '', householdId = '' } = useParams()
  const { lists, items, members, setItemComplete, addListItem } = usePrototype()
  const list = lists.find((item) => item.id === listId)
  const [draft, setDraft] = useState('')

  if (!list) {
    return <NotFoundState backTo={householdPath(householdId, 'lists')} backLabel="Lists" />
  }

  const listItems = items.filter((item) => item.listId === list.id)

  function onAdd(event: FormEvent) {
    event.preventDefault()
    // The new item appears immediately, so only failure needs announcing.
    if (toastResult(addListItem(listId, draft))) {
      setDraft('')
    }
  }

  return (
    <div>
      <BackLink to={householdPath(householdId, 'lists')} label="Lists" />
      <ScreenHeader title={list.name} description={list.description} />

      <ul className="space-y-2">
        {listItems.map((item) => {
          const assignee = members.find((member) => member.id === item.assigneeMembershipId)
          return (
            <li key={item.id}>
              <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-accent/40">
                <Checkbox
                  className="size-5"
                  checked={item.isComplete}
                  onCheckedChange={(checked) => setItemComplete(item.id, checked === true)}
                />
                <span
                  className={`min-w-0 flex-1 text-pretty ${
                    item.isComplete ? 'text-muted-foreground line-through' : ''
                  }`}
                >
                  {item.text}
                </span>
                {assignee ? (
                  <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                    <MemberMark member={assignee} />
                    <span className="hidden sm:inline">{assignee.displayName}</span>
                  </span>
                ) : null}
              </label>
            </li>
          )
        })}
      </ul>

      {/* Sticky so the add field stays reachable on a phone without scrolling to the bottom. */}
      <form
        onSubmit={onAdd}
        className="sticky bottom-[calc(3.5rem+env(safe-area-inset-bottom))] mt-6 flex gap-2 border-t bg-background py-3 md:bottom-0"
      >
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Add an item"
          aria-label="New list item"
          enterKeyHint="done"
          className="h-11"
        />
        <Button type="submit" size="lg" className="h-11 shrink-0" disabled={draft.trim() === ''}>
          <Plus aria-hidden />
          Add
        </Button>
      </form>
    </div>
  )
}
