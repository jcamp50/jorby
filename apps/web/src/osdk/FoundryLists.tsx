import {
  addJorbyListItemAtPosition,
  createJorbySharedList,
  JorbyHousehold,
  JorbyListItem,
  JorbySharedList,
  saveJorbySharedList,
  setJorbyListItemCompletion,
  setJorbySharedListArchived,
} from '@/osdk/resources'
import { useOsdkAction, useOsdkObject, useOsdkObjects } from '@osdk/react'
import { ListTodo, Pin, Plus } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CardGroup, LinkRow, RowList } from '@/components/jorby/card-group'
import { BackLink, EmptyState, ScreenHeader, StickyActions } from '@/components/jorby/screen'
import { ErrorState, NotFoundState, RefreshingBanner } from '@/components/jorby/states'
import { Tile } from '@/components/jorby/tile'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { AppErrorCode, errorMessage } from '@/lib/errors'
import { householdPath, listDetailPath } from '@/lib/routes'
import { toast } from 'sonner'

export function FoundryListsIndex({ householdId }: { householdId: string }) {
  const { object: household, isLoading: householdLoading } = useOsdkObject(
    JorbyHousehold,
    householdId,
    Boolean(householdId),
  )
  const { data, isLoading, error } = useOsdkObjects(JorbySharedList, {
    where: {
      householdId: { $eq: householdId },
      archivedAt: { $isNull: true },
    },
    orderBy: { updatedAt: 'desc' },
    pageSize: 50,
    streamUpdates: true,
    enabled: Boolean(householdId),
  })
  const { applyAction, isPending } = useOsdkAction(createJorbySharedList)
  const [name, setName] = useState('')
  const lists = [...(data ?? [])].sort((a, b) => Number(b.isPinned) - Number(a.isPinned))

  async function onCreate(event: FormEvent) {
    event.preventDefault()
    if (!household || name.trim() === '') {
      return
    }
    try {
      await applyAction({ household, listName: name.trim() })
      setName('')
    } catch {
      toast.error('The list could not be created.')
    }
  }

  if (error) {
    return <ErrorState code={AppErrorCode.UNKNOWN} />
  }

  return (
    <div>
      <ScreenHeader title="Lists" description="Pinned first. Either of us can check things off." />
      {isLoading && lists.length === 0 ? (
        <p className="text-sm text-muted-foreground">Loading lists…</p>
      ) : lists.length === 0 ? (
        <EmptyState>No lists yet.</EmptyState>
      ) : (
        <>
          {isLoading ? <RefreshingBanner /> : null}
          <CardGroup>
            <RowList>
              {lists.map((list) => (
                <LinkRow
                  key={list.$primaryKey}
                  to={listDetailPath(householdId, list.listId)}
                  leading={<Tile icon={list.isPinned === true ? Pin : ListTodo} tone="lists" />}
                  title={list.name ?? 'Untitled list'}
                  subtitle={list.description ?? undefined}
                />
              ))}
            </RowList>
          </CardGroup>
        </>
      )}

      <StickyActions>
        <form onSubmit={onCreate} className="flex gap-2">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="New list name"
            aria-label="New list name"
            className="h-11 rounded-full border-0 bg-secondary"
          />
          <Button
            type="submit"
            size="lg"
            className="h-11 shrink-0 rounded-full"
            disabled={isPending || householdLoading || !household || name.trim() === ''}
          >
            <Plus aria-hidden />
            Create
          </Button>
        </form>
      </StickyActions>
    </div>
  )
}

export function FoundryListDetail({
  householdId,
  listId,
}: {
  householdId: string
  listId: string
}) {
  const navigate = useNavigate()
  const { object: list, isLoading: listLoading, error: listError } = useOsdkObject(
    JorbySharedList,
    listId,
    Boolean(listId),
  )
  const { data, isLoading, error } = useOsdkObjects(JorbyListItem, {
    where: {
      householdId: { $eq: householdId },
      listId: { $eq: listId },
      archivedAt: { $isNull: true },
    },
    orderBy: { rank: 'asc' },
    pageSize: 100,
    streamUpdates: true,
    enabled: Boolean(listId),
  })
  const add = useOsdkAction(addJorbyListItemAtPosition)
  const complete = useOsdkAction(setJorbyListItemCompletion)
  const saveList = useOsdkAction(saveJorbySharedList)
  const archiveList = useOsdkAction(setJorbySharedListArchived)
  const [draft, setDraft] = useState('')
  const items = data ?? []

  async function onAdd(event: FormEvent) {
    event.preventDefault()
    if (!list || list.revision == null || draft.trim() === '') {
      if (list && list.revision == null) {
        toast.error('List revision is unavailable.')
      }
      return
    }
    try {
      await add.applyAction({
        sharedList: list,
        itemText: draft.trim(),
        expectedListRevision: list.revision,
      })
      setDraft('')
    } catch {
      toast.error('The item could not be added.')
    }
  }

  async function onComplete(item: (typeof items)[number], isComplete: boolean) {
    if (!list || list.revision == null || item.revision == null) {
      toast.error(errorMessage(AppErrorCode.STALE_REVISION))
      return
    }
    try {
      await complete.applyAction({
        listItem: item,
        sharedList: list,
        expectedItemRevision: item.revision,
        expectedListRevision: list.revision,
        isComplete,
      })
    } catch {
      toast.error('Someone else changed this first. Reload to see their version.')
    }
  }

  async function onPin() {
    if (!list || list.revision == null) {
      return
    }
    try {
      await saveList.applyAction({
        sharedList: list,
        expectedRevision: list.revision,
        isPinned: list.isPinned !== true,
      })
    } catch {
      toast.error('The list could not be updated.')
    }
  }

  async function onArchive() {
    if (!list || list.revision == null) {
      return
    }
    try {
      await archiveList.applyAction({
        sharedList: list,
        expectedRevision: list.revision,
        isArchived: true,
      })
      navigate(householdPath(householdId, 'lists'), { replace: true })
    } catch {
      toast.error('The list could not be archived.')
    }
  }

  if (listError || error) {
    return <ErrorState code={AppErrorCode.UNKNOWN} />
  }

  if (listLoading && !list) {
    return <p className="text-sm text-muted-foreground">Loading list…</p>
  }

  if (!list || list.householdId !== householdId) {
    return <NotFoundState backTo={householdPath(householdId, 'lists')} backLabel="Lists" />
  }

  const open = items.filter((item) => item.isComplete !== true).length
  const busy = add.isPending || complete.isPending || saveList.isPending || archiveList.isPending

  return (
    <div>
      <BackLink to={householdPath(householdId, 'lists')} label="Lists" />
      <ScreenHeader
        title={list.name ?? 'Untitled list'}
        description={list.description ?? undefined}
        action={
          <span className="text-sm font-semibold tabular-nums text-muted-foreground">
            {open}/{items.length}
          </span>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          className="h-11 rounded-full"
          disabled={busy}
          onClick={() => {
            void onPin()
          }}
        >
          <Pin aria-hidden />
          {list.isPinned === true ? 'Unpin' : 'Pin'}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-full"
          disabled={busy}
          onClick={() => {
            void onArchive()
          }}
        >
          Archive
        </Button>
      </div>

      {isLoading && items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Loading items…</p>
      ) : items.length === 0 ? (
        <EmptyState>No items yet.</EmptyState>
      ) : (
        <>
          {isLoading ? <RefreshingBanner /> : null}
          <CardGroup>
            <RowList>
              {items.map((item) => (
                <label
                  key={item.$primaryKey}
                  className="flex min-h-16 cursor-pointer items-center gap-3 px-4 py-3"
                >
                  <Checkbox
                    className="size-6 rounded-lg"
                    checked={item.isComplete === true}
                    disabled={busy}
                    onCheckedChange={(checked) => {
                      void onComplete(item, checked === true)
                    }}
                    aria-label={item.text ?? 'List item'}
                  />
                  <span
                    className={`min-w-0 flex-1 text-[0.9375rem] font-medium text-pretty ${
                      item.isComplete === true ? 'text-muted-foreground line-through' : ''
                    }`}
                  >
                    {item.text}
                  </span>
                </label>
              ))}
            </RowList>
          </CardGroup>
        </>
      )}

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
            disabled={add.isPending || draft.trim() === ''}
          >
            <Plus aria-hidden />
            Add
          </Button>
        </form>
      </StickyActions>
    </div>
  )
}
