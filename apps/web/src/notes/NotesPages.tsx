import { useEffect, useMemo, useState } from 'react'
import { Link, useBlocker, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ScreenHeader, Surface } from '@/components/ui/chrome'
import { noteDetailPath } from '@/lib/routes'
import { usePrototype } from '@/prototype/PrototypeProvider'

export function NotesIndexPage() {
  const { householdId = '' } = useParams()
  const { notes } = usePrototype()
  const sorted = [...notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  return (
    <div>
      <ScreenHeader title="Notes" description="Markdown, tags, explicit save." />
      <ul className="space-y-3">
        {sorted.map((note) => (
          <li key={note.id}>
            <Link to={noteDetailPath(householdId, note.id)}>
              <Surface>
                <p className="font-medium">{note.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{note.tags.join(', ')}</p>
              </Surface>
            </Link>
          </li>
        ))}
      </ul>
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
    return <p className="text-sm text-muted-foreground">This note isn’t available.</p>
  }

  return (
    <div>
      <p className="mb-2 text-sm">
        <Link className="underline" to={`/${householdId}/notes`}>
          Notes
        </Link>
      </p>
      <ScreenHeader
        title="Edit note"
        description="Prototype lock is not wired. Save is explicit so we don’t overwrite on navigate."
        action={
          <Button
            type="button"
            disabled={!dirty}
            onClick={() => saveNote({ id: note.id, title, markdownBody: body })}
          >
            Save
          </Button>
        }
      />
      {blocker.state === 'blocked' ? (
        <div className="mb-4 rounded-md border border-border bg-muted p-3 text-sm" role="alertdialog">
          <p>You have unsaved changes.</p>
          <div className="mt-2 flex gap-2">
            <Button type="button" onClick={() => blocker.proceed()}>
              Leave
            </Button>
            <Button type="button" variant="outline" onClick={() => blocker.reset()}>
              Stay
            </Button>
          </div>
        </div>
      ) : null}
      <label className="mb-3 block text-sm">
        Title
        <input
          className="mt-1 min-h-11 w-full rounded-md border border-input bg-background px-3"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>
      <label className="block text-sm">
        Markdown
        <textarea
          className="mt-1 min-h-48 w-full rounded-md border border-input bg-background p-3 font-mono text-sm"
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
      </label>
    </div>
  )
}
