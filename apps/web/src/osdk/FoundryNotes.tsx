import {
  acquireJorbySharedNoteLock,
  archiveJorbySharedNote,
  createJorbySharedNote,
  heartbeatJorbySharedNoteLock,
  JorbyHousehold,
  JorbyHouseholdMembership,
  JorbySharedNote,
  releaseJorbySharedNoteLock,
  saveJorbySharedNote,
} from '@/osdk/resources'
import { useOsdkAction, useOsdkObject, useOsdkObjects } from '@osdk/react'
import { Plus, StickyNote } from 'lucide-react'
import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useBlocker, useNavigate } from 'react-router-dom'
import { CardGroup, LinkRow, RowList } from '@/components/jorby/card-group'
import { BackLink, EmptyState, ScreenHeader, StickyActions } from '@/components/jorby/screen'
import { ErrorState, NotFoundState, RefreshingBanner } from '@/components/jorby/states'
import { Tile } from '@/components/jorby/tile'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AppErrorCode } from '@/lib/errors'
import { householdPath, noteDetailPath } from '@/lib/routes'
import { useMyMembership } from '@/osdk/useMyMembership'
import { toast } from 'sonner'

function lockIsActive(expiresAt: Date | string | undefined) {
  if (!expiresAt) {
    return false
  }
  return new Date(expiresAt).getTime() > Date.now()
}

export function FoundryNotesIndex({ householdId }: { householdId: string }) {
  const { object: household, isLoading: householdLoading } = useOsdkObject(
    JorbyHousehold,
    householdId,
    Boolean(householdId),
  )
  const { data, isLoading, error } = useOsdkObjects(JorbySharedNote, {
    where: {
      householdId: { $eq: householdId },
      archivedAt: { $isNull: true },
    },
    orderBy: { updatedAt: 'desc' },
    pageSize: 50,
    streamUpdates: true,
    enabled: Boolean(householdId),
  })
  const { applyAction, isPending } = useOsdkAction(createJorbySharedNote)
  const [title, setTitle] = useState('')
  const notes = data ?? []

  async function onCreate(event: FormEvent) {
    event.preventDefault()
    if (!household || title.trim() === '') {
      return
    }
    try {
      await applyAction({
        household,
        title: title.trim(),
        markdownBody: '',
        tags: [],
      })
      setTitle('')
    } catch {
      toast.error('The note could not be created.')
    }
  }

  if (error) {
    return <ErrorState code={AppErrorCode.UNKNOWN} />
  }

  return (
    <div>
      <ScreenHeader title="Notes" description="Markdown, tags, explicit save. Lock while you edit." />
      {isLoading && notes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Loading notes…</p>
      ) : notes.length === 0 ? (
        <EmptyState>No notes yet.</EmptyState>
      ) : (
        <>
          {isLoading ? <RefreshingBanner /> : null}
          <CardGroup>
            <RowList>
              {notes.map((note) => (
                <LinkRow
                  key={note.$primaryKey}
                  to={noteDetailPath(householdId, note.noteId)}
                  leading={<Tile icon={StickyNote} tone="notes" />}
                  title={note.title ?? 'Untitled note'}
                  meta={(note.tags ?? []).map((tag) => (
                    <Badge key={tag} variant="secondary" className="rounded-full">
                      {tag}
                    </Badge>
                  ))}
                />
              ))}
            </RowList>
          </CardGroup>
        </>
      )}

      <StickyActions>
        <form onSubmit={onCreate} className="flex gap-2">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="New note title"
            aria-label="New note title"
            className="h-11 rounded-full border-0 bg-secondary"
          />
          <Button
            type="submit"
            size="lg"
            className="h-11 shrink-0 rounded-full"
            disabled={isPending || householdLoading || !household || title.trim() === ''}
          >
            <Plus aria-hidden />
            Create
          </Button>
        </form>
      </StickyActions>
    </div>
  )
}

export function FoundryNoteDetail({
  householdId,
  noteId,
}: {
  householdId: string
  noteId: string
}) {
  const navigate = useNavigate()
  const { object: note, isLoading, error } = useOsdkObject(
    JorbySharedNote,
    noteId,
    Boolean(noteId),
  )
  const { data: me } = useMyMembership(householdId)
  const { data: members } = useOsdkObjects(JorbyHouseholdMembership, {
    where: { householdId: { $eq: householdId } },
    pageSize: 20,
    streamUpdates: true,
    enabled: Boolean(householdId),
  })
  const acquire = useOsdkAction(acquireJorbySharedNoteLock)
  const heartbeat = useOsdkAction(heartbeatJorbySharedNoteLock)
  const save = useOsdkAction(saveJorbySharedNote)
  const release = useOsdkAction(releaseJorbySharedNoteLock)
  const archive = useOsdkAction(archiveJorbySharedNote)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [lockFailed, setLockFailed] = useState(false)
  const noteKey = note?.$primaryKey
  const releaseRef = useRef(release.applyAction)
  const noteRef = useRef(note)
  const ownsLockRef = useRef(false)

  releaseRef.current = release.applyAction
  noteRef.current = note

  useEffect(() => {
    if (note) {
      setTitle(note.title ?? '')
      setBody(note.markdownBody ?? '')
    }
  }, [note])

  useEffect(() => {
    if (!noteKey || !note) {
      return
    }
    setLockFailed(false)
    void acquire.applyAction({ sharedNote: note }).catch(() => {
      setLockFailed(true)
    })
    // Acquire once per note. The action hook identity is not a render dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteKey])

  const lockActive = lockIsActive(note?.lockExpiresAt)
  const ownsLock =
    Boolean(me) &&
    lockActive &&
    note?.lockOwnerMembershipId === me?.membershipId
  ownsLockRef.current = ownsLock
  const lockOwner = (members ?? []).find(
    (member) => member.membershipId === note?.lockOwnerMembershipId,
  )
  const readOnly = !ownsLock

  useEffect(() => {
    if (!ownsLock || !note) {
      return
    }
    const timer = window.setInterval(() => {
      void heartbeat.applyAction({ sharedNote: note }).catch(() => {
        toast.error('Your editing lock expired. Reload before saving.')
      })
    }, 120_000)
    return () => window.clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownsLock, noteKey])

  useEffect(() => {
    return () => {
      const current = noteRef.current
      if (current && ownsLockRef.current) {
        void releaseRef.current({ sharedNote: current }).catch(() => undefined)
      }
    }
  }, [noteKey])

  const dirty = useMemo(() => {
    if (!note) {
      return false
    }
    return title !== (note.title ?? '') || body !== (note.markdownBody ?? '')
  }, [note, title, body])

  const blocker = useBlocker(dirty)

  async function onSave() {
    if (!note || note.revision == null || !ownsLock) {
      return
    }
    try {
      await save.applyAction({
        sharedNote: note,
        expectedRevision: note.revision,
        title,
        markdownBody: body,
      })
      toast.success('Note saved')
    } catch {
      toast.error('The note could not be saved.')
    }
  }

  async function onRetryLock() {
    if (!note) {
      return
    }
    setLockFailed(false)
    try {
      await acquire.applyAction({ sharedNote: note })
    } catch {
      setLockFailed(true)
    }
  }

  async function onArchive() {
    if (!note || note.revision == null) {
      return
    }
    try {
      await archive.applyAction({
        sharedNote: note,
        expectedRevision: note.revision,
      })
      navigate(householdPath(householdId, 'notes'), { replace: true })
    } catch {
      toast.error('The note could not be archived.')
    }
  }

  if (error) {
    return <ErrorState code={AppErrorCode.UNKNOWN} />
  }

  if (isLoading && !note) {
    return <p className="text-sm text-muted-foreground">Loading note…</p>
  }

  if (!note || note.householdId !== householdId) {
    return <NotFoundState backTo={householdPath(householdId, 'notes')} backLabel="Notes" />
  }

  return (
    <div>
      <BackLink to={householdPath(householdId, 'notes')} label="Notes" />
      <ScreenHeader
        title="Edit note"
        description={
          ownsLock
            ? 'You have the edit lock. Save is explicit.'
            : lockActive
              ? `${lockOwner?.displayName ?? 'Someone else'} is editing. The lock expires ${
                  note.lockExpiresAt
                    ? new Date(note.lockExpiresAt).toLocaleTimeString()
                    : 'soon'
                }.`
              : 'Read-only until you get the edit lock.'
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {readOnly ? (
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-full"
            disabled={acquire.isPending}
            onClick={() => {
              void onRetryLock()
            }}
          >
            {lockFailed ? 'Try for the lock again' : 'Retry lock'}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-full"
          disabled={archive.isPending || (lockActive && !ownsLock)}
          onClick={() => {
            void onArchive()
          }}
        >
          Archive
        </Button>
      </div>

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
          <Label htmlFor="foundry-note-title">Title</Label>
          <Input
            id="foundry-note-title"
            className="h-11 rounded-xl border-0 bg-secondary"
            value={title}
            disabled={readOnly}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
        <div className="mt-4 space-y-2">
          <Label htmlFor="foundry-note-body">Markdown</Label>
          <Textarea
            id="foundry-note-body"
            className="min-h-64 rounded-xl border-0 bg-secondary font-mono"
            value={body}
            disabled={readOnly}
            onChange={(event) => setBody(event.target.value)}
          />
        </div>
      </div>

      <StickyActions>
        <Button
          type="button"
          size="lg"
          className="h-11 w-full rounded-full"
          disabled={readOnly || !dirty || save.isPending}
          onClick={() => {
            void onSave()
          }}
        >
          {save.isPending ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
        </Button>
      </StickyActions>
    </div>
  )
}
