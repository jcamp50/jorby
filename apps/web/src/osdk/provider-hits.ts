type Hit = { id: string; name: string; subtitle?: string; mediaType?: string; year?: number }

function readNumber(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) {
        return parsed
      }
    }
  }
  return undefined
}

function readString(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim()
    }
  }
  return undefined
}

function rowsFrom(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) {
    return data.filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object')
  }
  if (data && typeof data === 'object') {
    const container = data as Record<string, unknown>
    for (const key of ['results', 'items', 'hits']) {
      const value = container[key]
      if (Array.isArray(value)) {
        return value.filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object')
      }
    }
  }
  return []
}

export function placeHitsFromQuery(data: unknown): Hit[] {
  return rowsFrom(data).flatMap((row) => {
    const id = readString(row, ['placeId', 'providerPlaceId', 'catalogPlaceId', 'id'])
    const name = readString(row, ['name', 'displayTitle', 'title'])
    if (!id || !name) {
      return []
    }
    return [
      {
        id,
        name,
        subtitle: readString(row, ['formattedAddress', 'address', 'city']),
      },
    ]
  })
}

export type PlaceDetails = {
  name?: string
  address?: string
  phoneNumber?: string
  websiteUrl?: string
  description?: string
  neighborhood?: string
  cuisine?: string
  photoUrl?: string
}

export type MediaDetails = {
  title?: string
  overview?: string
  posterUrl?: string
  director?: string
  genres?: string[]
  cast?: string[]
  year?: number
  mediaType?: string
}

function asRecord(data: unknown): Record<string, unknown> | undefined {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return undefined
  }
  const row = data as Record<string, unknown>
  for (const key of ['result', 'place', 'title', 'details']) {
    const nested = row[key]
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      return nested as Record<string, unknown>
    }
  }
  return row
}

function readHttpUrl(row: Record<string, unknown>, keys: string[]) {
  const value = readString(row, keys)
  if (value && /^https?:\/\//i.test(value)) {
    return value
  }
  return undefined
}

function readStringList(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === 'string' && value.trim() !== '') {
      return value
        .split(/[,|/]/)
        .map((item) => item.trim())
        .filter(Boolean)
    }
    if (Array.isArray(value)) {
      const items = value.flatMap((item) => {
        if (typeof item === 'string' && item.trim() !== '') {
          return [item.trim()]
        }
        if (item && typeof item === 'object') {
          const named = readString(item as Record<string, unknown>, ['name', 'title', 'displayName'])
          return named ? [named] : []
        }
        return []
      })
      if (items.length > 0) {
        return items
      }
    }
  }
  return undefined
}

function firstDefined<T>(...values: Array<T | undefined>): T | undefined {
  return values.find((value) => value !== undefined && value !== '')
}

export function placeDetailsFromSource(data: unknown): PlaceDetails {
  const row = asRecord(data)
  if (!row) {
    return {}
  }
  const cuisineTags = readStringList(row, ['cuisineTags', 'cuisines', 'tags'])
  return {
    name: readString(row, ['name', 'displayTitle', 'title']),
    address: readString(row, ['formattedAddress', 'manualFormattedAddress', 'address']),
    phoneNumber: readString(row, ['phoneNumber', 'manualPhoneNumber', 'phone']),
    websiteUrl: readString(row, ['websiteUrl', 'manualWebsiteUrl', 'website', 'url']),
    description: readString(row, ['description', 'editorialSummary', 'overview', 'summary']),
    neighborhood: readString(row, ['neighborhood', 'city']),
    cuisine: readString(row, ['cuisine', 'category', 'primaryType']) ?? cuisineTags?.[0],
    photoUrl: readHttpUrl(row, ['photoUrl', 'imageUrl', 'pictureUrl']),
  }
}

export function mediaDetailsFromSource(data: unknown): MediaDetails {
  const row = asRecord(data)
  if (!row) {
    return {}
  }
  const crew = Array.isArray(row.crew) ? row.crew : []
  const directorFromCrew = crew
    .map((item) => (item && typeof item === 'object' ? (item as Record<string, unknown>) : undefined))
    .find((item) => item && readString(item, ['job', 'role']) === 'Director')
  const creators = readStringList(row, ['creators', 'createdBy'])
  return {
    title: readString(row, ['title', 'displayTitle', 'name']),
    overview: readString(row, ['overview', 'manualOverview', 'synopsis', 'description']),
    posterUrl: readHttpUrl(row, ['posterUrl', 'manualImageUrl', 'imageUrl', 'posterPath']),
    director:
      readString(row, ['director']) ??
      (directorFromCrew ? readString(directorFromCrew, ['name']) : undefined) ??
      (creators && creators.length > 0 ? creators.join(', ') : undefined),
    genres: readStringList(row, ['genres', 'genre']),
    cast: readStringList(row, ['cast', 'actors']),
    year: readNumber(row, ['releaseYear', 'year', 'manualReleaseYear']),
    mediaType: readString(row, ['mediaType']),
  }
}

export function mergePlaceDetails(...parts: PlaceDetails[]): PlaceDetails {
  return {
    name: firstDefined(...parts.map((part) => part.name)),
    address: firstDefined(...parts.map((part) => part.address)),
    phoneNumber: firstDefined(...parts.map((part) => part.phoneNumber)),
    websiteUrl: firstDefined(...parts.map((part) => part.websiteUrl)),
    description: firstDefined(...parts.map((part) => part.description)),
    neighborhood: firstDefined(...parts.map((part) => part.neighborhood)),
    cuisine: firstDefined(...parts.map((part) => part.cuisine)),
    photoUrl: firstDefined(...parts.map((part) => part.photoUrl)),
  }
}

export function mergeMediaDetails(...parts: MediaDetails[]): MediaDetails {
  return {
    title: firstDefined(...parts.map((part) => part.title)),
    overview: firstDefined(...parts.map((part) => part.overview)),
    posterUrl: firstDefined(...parts.map((part) => part.posterUrl)),
    director: firstDefined(...parts.map((part) => part.director)),
    genres: parts.find((part) => part.genres && part.genres.length > 0)?.genres,
    cast: parts.find((part) => part.cast && part.cast.length > 0)?.cast,
    year: firstDefined(...parts.map((part) => part.year)),
    mediaType: firstDefined(...parts.map((part) => part.mediaType)),
  }
}

export function mediaHitsFromQuery(data: unknown): Hit[] {
  return rowsFrom(data).flatMap((row) => {
    const id = readString(row, ['mediaTitleId', 'providerId', 'id'])
    const name = readString(row, ['title', 'displayTitle', 'name'])
    const year = readNumber(row, ['releaseYear', 'year'])
    if (!id || !name) {
      return []
    }
    return [
      {
        id,
        name,
        subtitle: readString(row, ['releaseYear', 'year', 'mediaType']),
        mediaType: readString(row, ['mediaType']),
        ...(year !== undefined ? { year } : {}),
      },
    ]
  })
}
