import { useEffect, useId, useState } from 'react'
import {
  ChipRow,
  ChoiceChip,
  CreateTextField,
  PhotoField,
  SearchTitleField,
  TagField,
} from '@/components/jorby/create/fields'
import { CreateComposer } from '@/components/jorby/create/composer'
import { parsePrice } from '@/components/jorby/create/tags'
import type {
  CreatePhoto,
  CreateSearchHit,
  ListCreateInput,
  NoteCreateInput,
  PlaceCreateInput,
  ThingCreateInput,
  WatchCreateInput,
} from '@/components/jorby/create/types'
import { NoteContent } from '@/notes/NoteContent'

const watchStatuses = ['WATCHLIST', 'WATCHING', 'WATCHED', 'DROPPED'] as const

export function ListCreate({
  busy,
  onCreate,
}: {
  busy?: boolean
  onCreate: (input: ListCreateInput) => boolean | Promise<boolean>
}) {
  const ids = useId()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPinned, setIsPinned] = useState(false)
  const [tags, setTags] = useState<string[]>([])

  return (
    <CreateComposer
      label="Add a list"
      title="New list"
      canSubmit={name.trim() !== ''}
      busy={busy}
      onSubmit={async () => {
        const ok = await onCreate({
          name: name.trim(),
          description: description.trim(),
          isPinned,
          tags,
        })
        if (ok) {
          setName('')
          setDescription('')
          setIsPinned(false)
          setTags([])
        }
        return ok
      }}
    >
      <CreateTextField id={`${ids}-name`} label="Name" value={name} onChange={setName} placeholder="List name" />
      <CreateTextField
        id={`${ids}-description`}
        label="Description"
        value={description}
        onChange={setDescription}
        placeholder="Optional"
      />
      <ChipRow label="Pin">
        <ChoiceChip active={isPinned} onClick={() => setIsPinned((value) => !value)}>
          {isPinned ? 'Pinned' : 'Not pinned'}
        </ChoiceChip>
      </ChipRow>
      <TagField id={`${ids}-tags`} tags={tags} onChange={setTags} />
    </CreateComposer>
  )
}

export function NoteCreate({
  busy,
  onCreate,
}: {
  busy?: boolean
  onCreate: (input: NoteCreateInput) => boolean | Promise<boolean>
}) {
  const ids = useId()
  const [title, setTitle] = useState('')
  const [markdownBody, setMarkdownBody] = useState('')
  const [tags, setTags] = useState<string[]>([])

  return (
    <CreateComposer
      label="Add a note"
      title="New note"
      canSubmit={title.trim() !== ''}
      busy={busy}
      onSubmit={async () => {
        const ok = await onCreate({ title: title.trim(), markdownBody, tags })
        if (ok) {
          setTitle('')
          setMarkdownBody('')
          setTags([])
        }
        return ok
      }}
    >
      <CreateTextField id={`${ids}-title`} label="Title" value={title} onChange={setTitle} placeholder="Note title" />
      <NoteContent id={`${ids}-body`} value={markdownBody} onChange={setMarkdownBody} compact />
      <TagField id={`${ids}-tags`} tags={tags} onChange={setTags} />
    </CreateComposer>
  )
}

export function PlaceCreate({
  hits,
  hitsLoading,
  busy,
  onQueryChange,
  onCreate,
}: {
  hits: CreateSearchHit[]
  hitsLoading?: boolean
  busy?: boolean
  onQueryChange: (query: string) => void
  onCreate: (input: PlaceCreateInput) => boolean | Promise<boolean>
}) {
  const ids = useId()
  const [name, setName] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [visitState, setVisitState] = useState<'WANT_TO_GO' | 'BEEN'>('WANT_TO_GO')
  const [isFavorite, setIsFavorite] = useState(false)
  const [sharedNote, setSharedNote] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [photo, setPhoto] = useState<CreatePhoto | undefined>()
  const [providerId, setProviderId] = useState<string | undefined>()

  useEffect(() => {
    onQueryChange(name)
  }, [name, onQueryChange])

  function selectHit(hit: CreateSearchHit) {
    setName(hit.title)
    setNeighborhood(hit.neighborhood ?? neighborhood)
    setCuisine(hit.cuisine ?? cuisine)
    setProviderId(hit.id)
  }

  return (
    <CreateComposer
      label="Add a place"
      title="New place"
      canSubmit={name.trim() !== ''}
      busy={busy}
      onSubmit={async () => {
        const ok = await onCreate({
          name: name.trim(),
          neighborhood: neighborhood.trim(),
          cuisine: cuisine.trim(),
          visitState,
          isFavorite,
          sharedNote: sharedNote.trim(),
          tags,
          photo,
          providerId,
        })
        if (ok) {
          setName('')
          setNeighborhood('')
          setCuisine('')
          setVisitState('WANT_TO_GO')
          setIsFavorite(false)
          setSharedNote('')
          setTags([])
          setPhoto(undefined)
          setProviderId(undefined)
        }
        return ok
      }}
    >
      <PhotoField label="Photo" photo={photo} onChange={setPhoto} />
      <SearchTitleField
        id={`${ids}-name`}
        label="Name"
        placeholder="Search or type a place"
        value={name}
        onChange={setName}
        hits={hits}
        hitsLoading={hitsLoading}
        selectedId={providerId}
        onSelect={selectHit}
        onClearMatch={() => setProviderId(undefined)}
      />
      <CreateTextField
        id={`${ids}-neighborhood`}
        label="Neighborhood"
        value={neighborhood}
        onChange={setNeighborhood}
        placeholder="Optional"
      />
      <CreateTextField id={`${ids}-cuisine`} label="Cuisine" value={cuisine} onChange={setCuisine} placeholder="Optional" />
      <ChipRow label="Visit">
        <ChoiceChip active={visitState === 'WANT_TO_GO'} onClick={() => setVisitState('WANT_TO_GO')}>
          Want to go
        </ChoiceChip>
        <ChoiceChip active={visitState === 'BEEN'} onClick={() => setVisitState('BEEN')}>
          Been
        </ChoiceChip>
      </ChipRow>
      <ChipRow label="Favorite">
        <ChoiceChip active={isFavorite} onClick={() => setIsFavorite((value) => !value)}>
          {isFavorite ? 'Favorite' : 'Not a favorite'}
        </ChoiceChip>
      </ChipRow>
      <CreateTextField
        id={`${ids}-note`}
        label="Our note"
        value={sharedNote}
        onChange={setSharedNote}
        placeholder="Optional"
      />
      <TagField id={`${ids}-tags`} tags={tags} onChange={setTags} />
    </CreateComposer>
  )
}

export function WatchCreate({
  hits,
  hitsLoading,
  busy,
  onQueryChange,
  onCreate,
}: {
  hits: CreateSearchHit[]
  hitsLoading?: boolean
  busy?: boolean
  onQueryChange: (query: string) => void
  onCreate: (input: WatchCreateInput) => boolean | Promise<boolean>
}) {
  const ids = useId()
  const [title, setTitle] = useState('')
  const [year, setYear] = useState('')
  const [mediaType, setMediaType] = useState<'MOVIE' | 'SHOW'>('MOVIE')
  const [status, setStatus] = useState<(typeof watchStatuses)[number]>('WATCHLIST')
  const [wantsIt, setWantsIt] = useState(true)
  const [tags, setTags] = useState<string[]>([])
  const [providerId, setProviderId] = useState<string | undefined>()

  useEffect(() => {
    onQueryChange(title)
  }, [title, onQueryChange])

  function selectHit(hit: CreateSearchHit) {
    setTitle(hit.title)
    if (hit.year) {
      setYear(String(hit.year))
    }
    if (hit.mediaType === 'MOVIE' || hit.mediaType === 'SHOW') {
      setMediaType(hit.mediaType)
    }
    setProviderId(hit.id)
  }

  const parsedYear = year.trim() === '' ? undefined : Number(year)
  const yearValue = parsedYear !== undefined && Number.isFinite(parsedYear) ? parsedYear : undefined

  return (
    <CreateComposer
      label="Add a title"
      title="New title"
      canSubmit={title.trim() !== ''}
      busy={busy}
      onSubmit={() =>
        onCreate({
          title: title.trim(),
          year: yearValue,
          mediaType,
          status,
          wantsIt,
          tags,
          providerId,
        })
      }
    >
      <SearchTitleField
        id={`${ids}-title`}
        label="Title"
        placeholder="Search or type a title"
        value={title}
        onChange={setTitle}
        hits={hits}
        hitsLoading={hitsLoading}
        selectedId={providerId}
        onSelect={selectHit}
        onClearMatch={() => setProviderId(undefined)}
      />
      <CreateTextField
        id={`${ids}-year`}
        label="Year"
        value={year}
        onChange={setYear}
        placeholder="Optional"
        inputMode="numeric"
      />
      <ChipRow label="Type">
        <ChoiceChip active={mediaType === 'MOVIE'} onClick={() => setMediaType('MOVIE')}>
          Movie
        </ChoiceChip>
        <ChoiceChip active={mediaType === 'SHOW'} onClick={() => setMediaType('SHOW')}>
          Show
        </ChoiceChip>
      </ChipRow>
      <ChipRow label="Status">
        {watchStatuses.map((item) => (
          <ChoiceChip key={item} active={status === item} onClick={() => setStatus(item)}>
            <span className="capitalize">{item.toLowerCase()}</span>
          </ChoiceChip>
        ))}
      </ChipRow>
      <ChipRow label="You">
        <ChoiceChip active={wantsIt} onClick={() => setWantsIt((value) => !value)}>
          {wantsIt ? 'You want to watch this' : 'Not marked yet'}
        </ChoiceChip>
      </ChipRow>
      <TagField id={`${ids}-tags`} tags={tags} onChange={setTags} />
    </CreateComposer>
  )
}

export function ThingCreate({
  defaultLens,
  members,
  busy,
  onCreate,
}: {
  defaultLens: 'Wish' | 'Home'
  members: { id: string; displayName: string }[]
  busy?: boolean
  onCreate: (input: ThingCreateInput) => boolean | Promise<boolean>
}) {
  const ids = useId()
  const [name, setName] = useState('')
  const [lens, setLens] = useState<'Wish' | 'Home'>(defaultLens === 'Home' ? 'Home' : 'Wish')
  const [price, setPrice] = useState('')
  const [recipientLabel, setRecipientLabel] = useState('')
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [photo, setPhoto] = useState<CreatePhoto | undefined>()

  return (
    <CreateComposer
      label="Add a thing"
      title="New thing"
      canSubmit={name.trim() !== ''}
      busy={busy}
      onSubmit={async () => {
        const ok = await onCreate({
          name: name.trim(),
          lens,
          priceAmount: parsePrice(price),
          recipientLabel: recipientLabel.trim(),
          notes: notes.trim(),
          tags,
          photo,
        })
        if (ok) {
          setName('')
          setLens(defaultLens === 'Home' ? 'Home' : 'Wish')
          setPrice('')
          setRecipientLabel('')
          setNotes('')
          setTags([])
          setPhoto(undefined)
        }
        return ok
      }}
    >
      <PhotoField label="Photo" photo={photo} onChange={setPhoto} />
      <CreateTextField id={`${ids}-name`} label="Name" value={name} onChange={setName} placeholder="Thing name" />
      <ChipRow label="Wish or Home">
        <ChoiceChip active={lens === 'Wish'} onClick={() => setLens('Wish')}>
          Wish
        </ChoiceChip>
        <ChoiceChip active={lens === 'Home'} onClick={() => setLens('Home')}>
          Home
        </ChoiceChip>
      </ChipRow>
      <CreateTextField
        id={`${ids}-price`}
        label="Price"
        value={price}
        onChange={setPrice}
        placeholder="Optional"
        inputMode="decimal"
      />
      <CreateTextField
        id={`${ids}-for`}
        label="For"
        value={recipientLabel}
        onChange={setRecipientLabel}
        placeholder="Optional"
      />
      {members.length > 0 ? (
        <ChipRow label="Someone in the household">
          {members.map((member) => (
            <ChoiceChip
              key={member.id}
              active={recipientLabel === member.displayName}
              onClick={() => setRecipientLabel(member.displayName)}
            >
              {member.displayName}
            </ChoiceChip>
          ))}
          <ChoiceChip
            active={recipientLabel === 'Household'}
            onClick={() => setRecipientLabel('Household')}
          >
            Household
          </ChoiceChip>
        </ChipRow>
      ) : null}
      <CreateTextField id={`${ids}-notes`} label="Notes" value={notes} onChange={setNotes} placeholder="Optional" />
      <TagField id={`${ids}-tags`} tags={tags} onChange={setTags} />
    </CreateComposer>
  )
}
