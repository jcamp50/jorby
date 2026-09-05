import { ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useBlocker, useParams } from 'react-router-dom'
import { BackLink, EmptyState, ScreenHeader } from '@/components/jorby/screen'
import { NotFoundState } from '@/components/jorby/states'
import { toastResult } from '@/lib/action-toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { householdPath, noteDetailPath } from '@/lib/routes'
import { usePrototype } from '@/prototype/PrototypeProvider'

export function NotesIndexPage() {
  const { householdId = '' } = useParams()
  const { notes } = usePrototype()
  const sorted = [...notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  return (
    <div>
      <ScreenHeader title="Notes" description="Markdown, tags, explicit save." />
      {sorted.length === 0 ? (
        <EmptyState>No notes yet.</EmptyState>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {sorted.map((note) => (
            <li key={note.id}>
              <Card className="gap-0 py-0 transition-colors hover:bg-accent/40">
                <Link
                  to={noteDetailPath(householdId, note.id)}
                  className="flex min-h-16 items-center gap-3 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-pretty">{note.title}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {note.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function NoteDetailPage() {
  const { noteId = '', householdId = '' } = useParams()
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
        <div className="mb-4 rounded-lg border bg-muted p-4 text-sm" role="alertdialog">
          <p className="font-medium">You have unsaved changes.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button type="button" size="lg" className="h-11" onClick={() => blocker.proceed()}>
              Leave without saving
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="h-11"
              onClick={() => blocker.reset()}
            >
              Stay here
            </Button>
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="note-title">Title</Label>
          <Input
            id="note-title"
            className="h-11"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="note-body">Markdown</Label>
          <Textarea
            id="note-body"
            className="min-h-64 font-mono"
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
        </div>
      </div>

      {/* Save sits above the tab bar so it is thumb-reachable while the keyboard is open. */}
      <div className="sticky bottom-[calc(3.5rem+env(safe-area-inset-bottom))] mt-4 border-t bg-background py-3 md:bottom-0">
        <Button
          type="button"
          size="lg"
          className="h-11 w-full sm:w-auto"
          disabled={!dirty}
          onClick={() =>
            toastResult(saveNote({ id: note.id, title, markdownBody: body }), 'Note saved')
          }
        >
          {dirty ? 'Save changes' : 'Saved'}
        </Button>
      </div>
    </div>
  )
}
