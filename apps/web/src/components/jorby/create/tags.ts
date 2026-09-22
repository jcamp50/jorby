export function normalizeTag(value: string) {
  return value.trim().replace(/^#/, '')
}

export function addTag(tags: string[], raw: string): string[] {
  const tag = normalizeTag(raw)
  if (tag === '') {
    return tags
  }
  if (tags.some((item) => item.toLowerCase() === tag.toLowerCase())) {
    return tags
  }
  return [...tags, tag]
}

export function parsePrice(raw: string): number | undefined {
  const cleaned = raw.trim().replace(/[$,]/g, '')
  if (cleaned === '') {
    return undefined
  }
  const amount = Number(cleaned)
  if (!Number.isFinite(amount) || amount < 0) {
    return undefined
  }
  return amount
}
