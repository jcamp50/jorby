export type CreatePhoto = {
  file: File
  previewUrl: string
}

export type CreateSearchHit = {
  id: string
  title: string
  subtitle?: string
  neighborhood?: string
  cuisine?: string
  year?: number
  mediaType?: 'MOVIE' | 'SHOW'
}

export type ListCreateInput = {
  name: string
  description: string
  isPinned: boolean
  tags: string[]
}

export type NoteCreateInput = {
  title: string
  markdownBody: string
  tags: string[]
}

export type PlaceCreateInput = {
  name: string
  neighborhood: string
  cuisine: string
  visitState: 'WANT_TO_GO' | 'BEEN'
  isFavorite: boolean
  sharedNote: string
  tags: string[]
  photo?: CreatePhoto
  providerId?: string
}

export type WatchCreateInput = {
  title: string
  year?: number
  mediaType: 'MOVIE' | 'SHOW'
  status: 'WATCHLIST' | 'WATCHING' | 'WATCHED' | 'DROPPED'
  wantsIt: boolean
  tags: string[]
  providerId?: string
}

export type ThingCreateInput = {
  name: string
  lens: 'Wish' | 'Home'
  priceAmount?: number
  recipientLabel: string
  notes: string
  tags: string[]
  photo?: CreatePhoto
}
