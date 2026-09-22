import { Camera, ImagePlus, X } from 'lucide-react'
import { type HTMLAttributes, type KeyboardEvent, type ReactNode, useId, useRef } from 'react'
import { FilterChip } from '@/components/jorby/screen'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addTag } from '@/components/jorby/create/tags'
import type { CreatePhoto, CreateSearchHit } from '@/components/jorby/create/types'

const fieldClass = 'h-11 rounded-xl border-0 bg-secondary'

export function CreateField({
  id,
  label,
  children,
}: {
  id?: string
  label: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  )
}

export function CreateTextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  inputMode,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode']
}) {
  return (
    <CreateField id={id} label={label}>
      <Input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={fieldClass}
      />
    </CreateField>
  )
}

export function TagField({
  id,
  tags,
  onChange,
}: {
  id: string
  tags: string[]
  onChange: (tags: string[]) => void
}) {
  const draftId = `${id}-draft`

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter' && event.key !== ',') {
      return
    }
    event.preventDefault()
    const next = addTag(tags, event.currentTarget.value)
    if (next !== tags) {
      onChange(next)
    }
    event.currentTarget.value = ''
  }

  return (
    <CreateField id={draftId} label="Tags">
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="h-11 gap-1 rounded-full pr-1">
              {tag}
              <button
                type="button"
                className="inline-flex size-8 items-center justify-center rounded-full hover:bg-background/70"
                aria-label={`Remove ${tag}`}
                onClick={() => onChange(tags.filter((item) => item !== tag))}
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
      <Input
        id={draftId}
        className={fieldClass}
        placeholder="Add a tag"
        aria-label="Add a tag"
        onKeyDown={onKeyDown}
      />
    </CreateField>
  )
}

export function PhotoField({
  label,
  photo,
  onChange,
}: {
  label: string
  photo?: CreatePhoto
  onChange: (photo: CreatePhoto | undefined) => void
}) {
  const uploadRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const preview = photo?.previewUrl

  function takeFile(file: File | undefined) {
    if (!file || !file.type.startsWith('image/')) {
      return
    }
    onChange({ file, previewUrl: URL.createObjectURL(file) })
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <figure className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-section/30">
        {preview ? <img src={preview} alt="" className="size-full object-cover" /> : null}
      </figure>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          className="h-11 flex-1 rounded-full"
          onClick={() => uploadRef.current?.click()}
        >
          <ImagePlus aria-hidden />
          Upload
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="h-11 flex-1 rounded-full"
          onClick={() => cameraRef.current?.click()}
        >
          <Camera aria-hidden />
          Take photo
        </Button>
      </div>
      {photo ? (
        <Button
          type="button"
          variant="ghost"
          className="h-11 w-full rounded-full"
          onClick={() => {
            if (photo?.previewUrl) {
              URL.revokeObjectURL(photo.previewUrl)
            }
            onChange(undefined)
          }}
        >
          Remove photo
        </Button>
      ) : null}
      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          takeFile(event.target.files?.[0])
          event.target.value = ''
        }}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(event) => {
          takeFile(event.target.files?.[0])
          event.target.value = ''
        }}
      />
    </div>
  )
}

export function SearchTitleField({
  id,
  label,
  placeholder,
  value,
  onChange,
  hits,
  hitsLoading,
  selectedId,
  onSelect,
  onClearMatch,
}: {
  id: string
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  hits: CreateSearchHit[]
  hitsLoading?: boolean
  selectedId?: string
  onSelect: (hit: CreateSearchHit) => void
  onClearMatch: () => void
}) {
  const listId = useId()
  const selected = hits.find((hit) => hit.id === selectedId) ?? undefined
  const showHits = value.trim().length >= 2 && !selectedId

  return (
    <CreateField id={id} label={label}>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={showHits}
        aria-controls={listId}
        className={fieldClass}
      />
      {selectedId ? (
        <div className="flex items-center justify-between gap-2 rounded-xl bg-secondary px-3 py-2">
          <p className="min-w-0 text-sm">
            <span className="font-semibold">{selected?.title ?? value}</span>
            {selected?.subtitle ? (
              <span className="block text-xs text-muted-foreground">{selected.subtitle}</span>
            ) : null}
          </p>
          <Button type="button" variant="ghost" size="sm" className="h-11 rounded-full" onClick={onClearMatch}>
            Clear
          </Button>
        </div>
      ) : null}
      {showHits ? (
        <ul id={listId} role="listbox" className="overflow-hidden rounded-2xl bg-secondary">
          {hitsLoading && hits.length === 0 ? (
            <li className="px-3 py-3 text-sm text-muted-foreground">Searching…</li>
          ) : null}
          {!hitsLoading && hits.length === 0 ? (
            <li className="px-3 py-3 text-sm text-muted-foreground">No matches. Keep typing to add it yourself.</li>
          ) : null}
          {hits.map((hit) => (
            <li key={hit.id}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                className="flex min-h-14 w-full flex-col items-start justify-center px-3 py-2 text-left hover:bg-accent/60"
                onClick={() => onSelect(hit)}
              >
                <span className="text-sm font-semibold">{hit.title}</span>
                {hit.subtitle ? <span className="text-xs text-muted-foreground">{hit.subtitle}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </CreateField>
  )
}

export function ChipRow({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

export function ChoiceChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <FilterChip active={active} onClick={onClick}>
      {children}
    </FilterChip>
  )
}
