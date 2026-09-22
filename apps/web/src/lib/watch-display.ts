import { joinItemNames } from '@/lib/activity'

const statusCopy: Record<string, string> = {
  WATCHLIST: 'Watchlist',
  WATCHING: 'Watching',
  WATCHED: 'Watched',
  DROPPED: 'Dropped',
}

export function watchStatusLabel(entry: {
  status?: string | null
  mediaType?: string | null
  lastWatchedSeasonNumber?: number | null
  lastWatchedEpisodeNumber?: number | null
  movieProgress?: string | null
}) {
  const status = entry.status ?? ''
  if (status === 'WATCHING') {
    if (entry.mediaType === 'SHOW' && entry.lastWatchedSeasonNumber) {
      return `S${entry.lastWatchedSeasonNumber} · E${entry.lastWatchedEpisodeNumber}`
    }
    const timestamp = entry.movieProgress?.trim()
    if (entry.mediaType === 'MOVIE' && timestamp) {
      return timestamp
    }
  }
  return statusCopy[status] ?? (status ? status.charAt(0) + status.slice(1).toLowerCase() : '')
}

export function suggestedByCopy(names: string[], everyone: boolean) {
  const people = names.map((name) => name.trim()).filter(Boolean)
  if (people.length === 0) {
    return undefined
  }
  if (everyone && people.length >= 2) {
    return 'Suggested by both'
  }
  if (people.length === 1) {
    return `Suggested by ${people[0]}`
  }
  return `Suggested by ${joinItemNames(people)}`
}
