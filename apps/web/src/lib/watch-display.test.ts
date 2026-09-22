import { describe, expect, it } from 'vitest'
import { suggestedByCopy, watchStatusLabel } from '@/lib/watch-display'

describe('watchStatusLabel', () => {
  it('uses season and episode instead of Watching for a show in progress', () => {
    expect(
      watchStatusLabel({
        status: 'WATCHING',
        mediaType: 'SHOW',
        lastWatchedSeasonNumber: 3,
        lastWatchedEpisodeNumber: 2,
      }),
    ).toBe('S3 · E2')
  })

  it('uses a movie timestamp instead of Watching when one is set', () => {
    expect(
      watchStatusLabel({
        status: 'WATCHING',
        mediaType: 'MOVIE',
        movieProgress: '1:15',
      }),
    ).toBe('1:15')
  })

  it('falls back to the status name when there is no progress', () => {
    expect(watchStatusLabel({ status: 'WATCHING', mediaType: 'SHOW' })).toBe('Watching')
    expect(watchStatusLabel({ status: 'WATCHLIST', mediaType: 'MOVIE' })).toBe('Watchlist')
    expect(watchStatusLabel({ status: 'WATCHED', mediaType: 'MOVIE', movieProgress: '1:15' })).toBe(
      'Watched',
    )
  })
})

describe('suggestedByCopy', () => {
  it('names one person, both, or a list', () => {
    expect(suggestedByCopy(['Jordan'], false)).toBe('Suggested by Jordan')
    expect(suggestedByCopy(['Jordan', 'Sam'], true)).toBe('Suggested by both')
    expect(suggestedByCopy(['Jordan', 'Sam'], false)).toBe('Suggested by Jordan and Sam')
    expect(suggestedByCopy([], true)).toBeUndefined()
  })
})
