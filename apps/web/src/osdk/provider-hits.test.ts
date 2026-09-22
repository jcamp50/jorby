import { describe, expect, it } from 'vitest'
import {
  mediaDetailsFromSource,
  mediaHitsFromQuery,
  mergePlaceDetails,
  placeDetailsFromSource,
  placeHitsFromQuery,
} from './provider-hits'

describe('provider hit adapters', () => {
  it('reads place results from a results wrapper', () => {
    expect(
      placeHitsFromQuery({
        results: [{ placeId: 'MOCK:1', name: 'Taco Place', formattedAddress: 'DC' }],
      }),
    ).toEqual([{ id: 'MOCK:1', name: 'Taco Place', subtitle: 'DC' }])
  })

  it('reads media results from a flat array', () => {
    expect(
      mediaHitsFromQuery([{ mediaTitleId: 'MOCK:MOVIE:1', title: 'Heat', mediaType: 'MOVIE' }]),
    ).toEqual([{ id: 'MOCK:MOVIE:1', name: 'Heat', subtitle: 'MOVIE', mediaType: 'MOVIE' }])
  })
})

describe('provider detail adapters', () => {
  it('reads place metadata and ignores relative photo paths', () => {
    expect(
      placeDetailsFromSource({
        formattedAddress: '43 E 28th St',
        phoneNumber: '(646) 476-7217',
        websiteUrl: 'https://www.atoboynyc.com',
        editorialSummary: 'Korean sharing plates.',
        neighborhood: 'Nomad',
        cuisineTags: ['Korean'],
        photoUrl: '/places/1.jpg',
      }),
    ).toEqual({
      name: undefined,
      address: '43 E 28th St',
      phoneNumber: '(646) 476-7217',
      websiteUrl: 'https://www.atoboynyc.com',
      description: 'Korean sharing plates.',
      neighborhood: 'Nomad',
      cuisine: 'Korean',
      photoUrl: undefined,
    })
  })

  it('reads media credits and only keeps http poster URLs', () => {
    expect(
      mediaDetailsFromSource({
        overview: 'A chef comes home.',
        posterPath: '/abc.jpg',
        posterUrl: 'https://image.tmdb.org/t/p/w500/abc.jpg',
        director: 'Christopher Storer',
        genres: ['Comedy', 'Drama'],
        cast: [{ name: 'Jeremy Allen White' }, { name: 'Ayo Edebiri' }],
      }),
    ).toEqual({
      title: undefined,
      overview: 'A chef comes home.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/abc.jpg',
      director: 'Christopher Storer',
      genres: ['Comedy', 'Drama'],
      cast: ['Jeremy Allen White', 'Ayo Edebiri'],
      year: undefined,
      mediaType: undefined,
    })
  })

  it('fills missing place fields from later sources', () => {
    expect(
      mergePlaceDetails(
        { address: '43 E 28th St' },
        { phoneNumber: '(646) 476-7217', address: 'ignored' },
      ),
    ).toEqual({
      name: undefined,
      address: '43 E 28th St',
      phoneNumber: '(646) 476-7217',
      websiteUrl: undefined,
      description: undefined,
      neighborhood: undefined,
      cuisine: undefined,
      photoUrl: undefined,
    })
  })
})
