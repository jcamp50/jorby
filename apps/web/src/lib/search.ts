export function normalizeSearchText(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase()
}

export type SearchFilter = {
  kinds: readonly string[]
  tags: readonly string[]
}

export function searchIsActive(query: string, filter: SearchFilter) {
  return query.trim().length > 0 || filter.kinds.length > 0 || filter.tags.length > 0
}

/** Kind and tag filters narrow first. An empty query then keeps every remaining record. */
export function matchesSearch(
  haystack: string,
  tags: readonly string[],
  kind: string,
  query: string,
  filter: SearchFilter,
) {
  if (filter.kinds.length > 0 && !filter.kinds.includes(kind)) {
    return false
  }
  const owned = new Set(tags.map((tag) => tag.toLowerCase()))
  if (filter.tags.some((tag) => !owned.has(tag.toLowerCase()))) {
    return false
  }
  const term = query.trim().toLowerCase()
  if (!term) {
    return true
  }
  return haystack.toLowerCase().includes(term)
}
