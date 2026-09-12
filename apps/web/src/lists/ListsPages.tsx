import { ListTodo, Pin, Plus } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CardGroup, LinkRow, RowList } from '@/components/jorby/card-group'
import { MemberChip } from '@/components/jorby/member-mark'
import { BackLink, EmptyState, ScreenHeader, StickyActions } from '@/components/jorby/screen'
import { NotFoundState } from '@/components/jorby/states'
import { Tile } from '@/components/jorby/tile'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { toastResult } from '@/lib/action-toast'
import { householdPath, listDetailPath } from '@/lib/routes'
import { FoundryListDetail, FoundryListsIndex } from '@/osdk/FoundryLists'
import { usesFoundryData } from '@/osdk/household-route'
import { usePrototype } from '@/prototype/PrototypeProvider'

export function ListsIndexPage() {
  const { householdId = '' } = useParams()
  if (usesFoundryData(householdId)) {
    return <FoundryListsIndex householdId={householdId} />
  }
  return <PrototypeListsIndex householdId={householdId} />
}

function PrototypeListsIndex({ householdId }: { householdId: string }) {
  const { lists, items } = usePrototype()
  const sorted = [...lists].sort((a, b) => Number(b.isPinned) - Number(a.isPinned))

  return (
    <div>
      <ScreenHeader title="Lists" description="Pinned first. Either of us can check things off." />
      {sorted.length === 0 ? (
        <EmptyState>No lists yet.</EmptyState>
      ) : (
        <CardGroup>
          <RowList>
            {sorted.map((list) => {
              const remaining = items.filter(
                (item) => item.listId === list.id && !item.isComplete,
              ).length
              return (
                <LinkRow
                  key={list.id}
                  to={listDetailPath(householdId, list.id)}
                  leading={<Tile icon={list.isPinned ? Pin : ListTodo} tone="lists" />}
                  title={list.name}
                  subtitle={list.description}
                  trailing={
                    <span className="text-sm font-semibold tabular-nums">
                      {remaining}
                      <span className="ml-1 font-normal text-muted-foreground">open</span>
                    </span>
                  }
                />
              )
            })}
          </RowList>
        </CardGroup>
      )}
    </div>
  )
}

export function ListDetailPage() {
  const { listId = '', householdId = '' } = useParams()
  if (usesFoundryData(householdId)) {
    return <FoundryListDetail householdId={householdId} listId={listId} />
  }
  return <PrototypeListDetail householdId={householdId} listId={listId} />
}

function PrototypeListDetail({ householdId, listId }: { householdId: string; listId: string }) {
  const { lists, items, members, setItemComplete, addListItem } = usePrototype()
  const list = lists.find((item) => item.id === listId)
  const [draft, setDraft] = useState('')

  if (!list) {
    return <NotFoundState backTo={householdPath(householdId, 'lists')} backLabel="Lists" />
  }

  const listItems = items.filter((item) => item.listId === list.id)
  const open = listItems.filter((item) => !item.isComplete).length

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
      <ScreenHeader
        title={list.name}
        description={list.description}
        action={
          <span className="text-sm font-semibold tabular-nums text-muted-foreground">
            {open}/{listItems.length}
          </span>
        }
      />

      <CardGroup>
        <RowList>
          {listItems.map((item) => {
            const assignee = members.find((member) => member.id === item.assigneeMembershipId)
            return (
              <label
                key={item.id}
                className="flex min-h-16 cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/60"
              >
                <Checkbox
                  className="size-6 rounded-lg"
                  checked={item.isComplete}
                  onCheckedChange={(checked) => setItemComplete(item.id, checked === true)}
                />
                <span
                  className={`min-w-0 flex-1 text-[0.9375rem] font-medium text-pretty ${
                    item.isComplete ? 'text-muted-foreground line-through' : ''
                  }`}
                >
                  {item.text}
                </span>
                {assignee ? <MemberChip member={assignee} /> : null}
              </label>
            )
          })}
        </RowList>
      </CardGroup>

      <StickyActions>
        <form onSubmit={onAdd} className="flex gap-2">
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Add an item"
            aria-label="New list item"
            enterKeyHint="done"
            className="h-11 rounded-full border-0 bg-secondary"
          />
          <Button
            type="submit"
            size="lg"
            className="h-11 shrink-0 rounded-full"
            disabled={draft.trim() === ''}
          >
            <Plus aria-hidden />
            Add
          </Button>
        </form>
      </StickyActions>
    </div>
  )
}
