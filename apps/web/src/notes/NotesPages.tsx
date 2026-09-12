import { StickyNote } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useBlocker, useParams } from 'react-router-dom'
import { CardGroup, LinkRow, RowList } from '@/components/jorby/card-group'
import { BackLink, EmptyState, ScreenHeader, StickyActions } from '@/components/jorby/screen'
import { NotFoundState } from '@/components/jorby/states'
import { Tile } from '@/components/jorby/tile'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toastResult } from '@/lib/action-toast'
import { householdPath, noteDetailPath } from '@/lib/routes'
import { FoundryNoteDetail, FoundryNotesIndex } from '@/osdk/FoundryNotes'
import { usesFoundryData } from '@/osdk/household-route'
import { usePrototype } from '@/prototype/PrototypeProvider'

export function NotesIndexPage() {
  const { householdId = '' } = useParams()
  if (usesFoundryData(householdId)) {
    return <FoundryNotesIndex householdId={householdId} />
  }
  return <PrototypeNotesIndex householdId={householdId} />
}

function PrototypeNotesIndex({ householdId }: { householdId: string }) {
  const { notes } = usePrototype()
  const sorted = [...notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  return (
    <div>
      <ScreenHeader title="Notes" description="Markdown, tags, explicit save." />
      {sorted.length === 0 ? (
        <EmptyState>No notes yet.</EmptyState>
      ) : (
        <CardGroup>
          <RowList>
            {sorted.map((note) => (
              <LinkRow
                key={note.id}
                to={noteDetailPath(householdId, note.id)}
                leading={<Tile icon={StickyNote} tone="notes" />}
                title={note.title}
                meta={note.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="rounded-full">
                    {tag}
                  </Badge>
                ))}
              />
            ))}
          </RowList>
        </CardGroup>
      )}
    </div>
  )
}

export function NoteDetailPage() {
  const { noteId = '', householdId = '' } = useParams()
  if (usesFoundryData(householdId)) {
    return <FoundryNoteDetail householdId={householdId} noteId={noteId} />
  }
  return <PrototypeNoteDetail householdId={householdId} noteId={noteId} />
}

function PrototypeNoteDetail({ householdId, noteId }: { householdId: string; noteId: string }) {
  const { notes, saveNote } = usePrototype()
  const note = notes.find((item) => item.id === noteId)
  const [title, setTitle] = useState(note?.title ?? '')
  const [body, setBody] = useState(note?.markdownBody ?? '')

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setBody(note.markdownBody)
    }
  }, [note])

  const dirty = useMemo(() => {
    if (!note) {
      return false
    }
    return title !== note.title || body !== note.markdownBody
  }, [note, title, body])

  const blocker = useBlocker(dirty)

  if (!note) {
    return <NotFoundState backTo={householdPath(householdId, 'notes')} backLabel="Notes" />
  }

  return (
    <div>
      <BackLink to={householdPath(householdId, 'notes')} label="Notes" />
      <ScreenHeader
        title="Edit note"
        description="Prototype lock is not wired. Save is explicit so we don’t overwrite on navigate."
      />

      {blocker.state === 'blocked' ? (
        <div className="mb-5 rounded-2xl bg-card p-4 text-sm shadow-card" role="alertdialog">
          <p className="font-semibold">You have unsaved changes.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              size="lg"
              className="h-11 rounded-full"
              onClick={() => blocker.proceed()}
            >
              Leave without saving
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="h-11 rounded-full"
              onClick={() => blocker.reset()}
            >
              Stay here
            </Button>
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl bg-card p-4 shadow-card">
        <div className="space-y-2">
          <Label htmlFor="note-title">Title</Label>
          <Input
            id="note-title"
            className="h-11 rounded-xl border-0 bg-secondary"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
        <div className="mt-4 space-y-2">
          <Label htmlFor="note-body">Markdown</Label>
          <Textarea
            id="note-body"
            className="min-h-64 rounded-xl border-0 bg-secondary font-mono"
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
        </div>
      </div>

      <StickyActions>
        <Button
          type="button"
          size="lg"
          className="h-11 w-full rounded-full"
          disabled={!dirty}
          onClick={() =>
            toastResult(saveNote({ id: note.id, title, markdownBody: body }), 'Note saved')
          }
        >
          {dirty ? 'Save changes' : 'Saved'}
        </Button>
      </StickyActions>
    </div>
  )
}
