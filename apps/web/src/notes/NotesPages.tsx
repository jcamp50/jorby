import { SectionPlaceholder } from '@/app/shell/SectionPlaceholder'

export function NotesIndexPage() {
  return (
    <SectionPlaceholder
      title="Notes"
      description="Markdown notes with tags, record links, and a five-minute edit lock."
    />
  )
}

export function NoteDetailPage() {
  return (
    <SectionPlaceholder
      title="Note"
      description="Explicit save, unsaved navigation warning, lock heartbeat while editing."
    />
  )
}
