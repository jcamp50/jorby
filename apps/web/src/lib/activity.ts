export type ActivityKind = 'lists' | 'notes' | 'places' | 'watch' | 'things'

export type ActivityParent = {
  id: string
  kind: ActivityKind
  title: string
  createdAt: number
  updatedAt: number
  createdById: string
  updatedById: string
  revision?: number
  visitState?: string
  watchStatus?: string
  lifecycleState?: string
}

export type ActivityListItem = {
  id: string
  listId: string
  text: string
  createdAt: number
  createdById: string
}

export type ActivityChild = {
  id: string
  parentId: string
  kind: 'review' | 'visit' | 'want'
  at: number
  actorId: string
}

export type ActivityInput = {
  parents: ActivityParent[]
  listItems: ActivityListItem[]
  children: ActivityChild[]
  actorName: (id: string) => string
}

export type ActivityEvent = {
  id: string
  at: number
  kind: ActivityKind
  parentId: string
  actorId: string
  actorName: string
  verb: string
  objectTitle: string
  items?: string[]
}

const CREATE_WINDOW_MS = 5_000
const CHILD_SUPPRESS_MS = 10 * 60_000
const ITEM_GROUP_MS = 2 * 60 * 60_000

export function toMillis(value: unknown): number {
  if (value == null) {
    return 0
  }
  if (typeof value === 'number') {
    return value
  }
  if (value instanceof Date) {
    return value.getTime()
  }
  const parsed = Date.parse(String(value))
  return Number.isFinite(parsed) ? parsed : 0
}

export function joinItemNames(names: string[]): string {
  const items = names.map((name) => name.trim()).filter(Boolean)
  if (items.length === 0) {
    return 'items'
  }
  if (items.length === 1) {
    return items[0]
  }
  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`
  }
  if (items.length === 3) {
    return `${items[0]}, ${items[1]}, and ${items[2]}`
  }
  return `${items[0]}, ${items[1]}, and ${items.length - 2} more`
}

export function formatActivityTime(at: number, now = Date.now()): string {
  if (at <= 0) {
    return ''
  }
  const diff = Math.max(0, now - at)
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) {
    return 'Just now'
  }
  if (minutes < 60) {
    return `${minutes}m ago`
  }
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours}h ago`
  }
  const days = Math.floor(hours / 24)
  if (days === 1) {
    return 'Yesterday'
  }
  if (days < 7) {
    return `${days}d ago`
  }
  return new Date(at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function isCreate(parent: ActivityParent): boolean {
  if (parent.revision === 1) {
    return true
  }
  return Math.abs(parent.updatedAt - parent.createdAt) < CREATE_WINDOW_MS
}

function parentCopy(parent: ActivityParent, created: boolean): { verb: string; objectTitle: string } {
  const objectTitle = parent.title.trim() || 'untitled'
  if (parent.kind === 'lists') {
    return { verb: created ? 'created' : 'updated', objectTitle }
  }
  if (parent.kind === 'notes') {
    return { verb: created ? 'created' : 'edited', objectTitle }
  }
  if (parent.kind === 'places') {
    if (parent.visitState === 'WANT_TO_GO') {
      return { verb: 'wants to go', objectTitle }
    }
    return { verb: created ? 'added' : 'updated', objectTitle }
  }
  if (parent.kind === 'watch') {
    if (parent.watchStatus === 'WATCHLIST' || created) {
      return { verb: 'wants to watch', objectTitle }
    }
    return { verb: 'updated', objectTitle }
  }
  if (
    parent.lifecycleState === 'IDEA' ||
    parent.lifecycleState === 'BUYING' ||
    parent.lifecycleState === 'BOUGHT'
  ) {
    return { verb: 'added to wishes', objectTitle }
  }
  return { verb: created ? 'added' : 'updated', objectTitle }
}

function groupListItems(items: ActivityListItem[]): ActivityListItem[][] {
  const groups: ActivityListItem[][] = []
  const sorted = [...items]
    .filter((item) => item.text.trim() !== '' && item.createdAt > 0)
    .sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id))
  for (const item of sorted) {
    const open = groups.find((group) => {
      const last = group[group.length - 1]
      return (
        last.listId === item.listId &&
        last.createdById === item.createdById &&
        item.createdAt - last.createdAt <= ITEM_GROUP_MS
      )
    })
    if (open) {
      open.push(item)
    } else {
      groups.push([item])
    }
  }
  return groups
}

function displayActor(resolve: (id: string) => string, id: string) {
  const name = resolve(id).trim()
  return name === '' ? 'Someone' : name
}

export function buildActivityFeed(input: ActivityInput, limit = 24): ActivityEvent[] {
  const parents = new Map(input.parents.map((parent) => [parent.id, parent]))
  const events: ActivityEvent[] = []
  const explained = new Map<string, number[]>()

  function remember(parentId: string, at: number) {
    const times = explained.get(parentId) ?? []
    times.push(at)
    explained.set(parentId, times)
  }

  for (const group of groupListItems(input.listItems)) {
    const first = group[0]
    const list = parents.get(first.listId)
    if (!list) {
      continue
    }
    const at = Math.max(...group.map((item) => item.createdAt))
    events.push({
      id: `items:${first.listId}:${first.createdById}:${at}`,
      at,
      kind: 'lists',
      parentId: list.id,
      actorId: first.createdById,
      actorName: displayActor(input.actorName, first.createdById),
      verb: 'added',
      objectTitle: list.title.trim() || 'a list',
      items: group.map((item) => item.text.trim()),
    })
    remember(list.id, at)
  }

  for (const child of input.children) {
    const parent = parents.get(child.parentId)
    if (!parent || child.at <= 0) {
      continue
    }
    const objectTitle = parent.title.trim() || 'untitled'
    const verb =
      child.kind === 'visit' ? 'visited' : child.kind === 'want' ? 'wants to watch' : 'reviewed'
    events.push({
      id: `${child.kind}:${child.id}`,
      at: child.at,
      kind: parent.kind,
      parentId: parent.id,
      actorId: child.actorId,
      actorName: displayActor(input.actorName, child.actorId),
      verb,
      objectTitle,
    })
    remember(parent.id, child.at)
  }

  for (const parent of input.parents) {
    const at = parent.updatedAt || parent.createdAt
    if (at <= 0) {
      continue
    }
    const created = isCreate(parent)
    const nearby = (explained.get(parent.id) ?? []).some(
      (time) => Math.abs(time - at) < CHILD_SUPPRESS_MS,
    )
    if (nearby) {
      continue
    }
    const actorId = created ? parent.createdById : parent.updatedById
    const copy = parentCopy(parent, created)
    events.push({
      id: `parent:${parent.kind}:${parent.id}:${at}`,
      at,
      kind: parent.kind,
      parentId: parent.id,
      actorId,
      actorName: displayActor(input.actorName, actorId),
      verb: copy.verb,
      objectTitle: copy.objectTitle,
    })
  }

  return events.sort((a, b) => b.at - a.at).slice(0, limit)
}
