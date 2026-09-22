import { useEffect, useRef, useState } from 'react'
import Markdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const markdownClassName = cn(
  'text-[0.9375rem] leading-relaxed text-pretty',
  '[&_p]:mb-3 [&_p:last-child]:mb-0',
  '[&_strong]:font-semibold',
  '[&_em]:italic',
  '[&_h1]:mb-2 [&_h1]:text-xl [&_h1]:font-extrabold [&_h1]:tracking-[-0.02em]',
  '[&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-bold',
  '[&_h3]:mb-1.5 [&_h3]:text-base [&_h3]:font-bold',
  '[&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5',
  '[&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5',
  '[&_li]:mb-1',
  '[&_a]:underline',
  '[&_code]:rounded-md [&_code]:bg-background/70 [&_code]:px-1 [&_code]:py-0.5',
)

export function NoteContent({
  id,
  value,
  onChange,
  readOnly,
  compact,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
  compact?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fieldRef = useRef<HTMLDivElement>(null)
  const renderAfterTyping = useRef(false)

  useEffect(() => {
    if (editing) {
      textareaRef.current?.focus()
    }
  }, [editing])

  useEffect(() => {
    if (!editing) {
      return
    }
    function closeIfOutside(event: PointerEvent) {
      if (fieldRef.current?.contains(event.target as Node)) {
        return
      }
      setEditing(false)
    }
    document.addEventListener('pointerdown', closeIfOutside)
    return () => document.removeEventListener('pointerdown', closeIfOutside)
  }, [editing])

  useEffect(() => {
    if (!editing) {
      renderAfterTyping.current = false
      return
    }
    if (!renderAfterTyping.current) {
      return
    }
    const timer = window.setTimeout(() => setEditing(false), 800)
    return () => window.clearTimeout(timer)
  }, [editing, value])

  return (
    <div className="mt-4 space-y-2" ref={fieldRef}>
      <Label htmlFor={id}>Content</Label>
      {editing && !readOnly ? (
        <textarea
          ref={textareaRef}
          id={id}
          className="field-sizing-content min-h-64 w-full rounded-xl border-0 bg-secondary px-3 py-2 text-base shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm"
          value={value}
          aria-label="Content"
          onChange={(event) => {
            renderAfterTyping.current = true
            onChange(event.target.value)
          }}
        />
      ) : (
        <div
          id={id}
          role={readOnly ? undefined : 'textbox'}
          tabIndex={readOnly ? undefined : 0}
          aria-label="Content"
          aria-readonly={readOnly || undefined}
          className={cn(
            'rounded-xl bg-secondary p-4',
            compact ? 'min-h-32' : 'min-h-64',
            readOnly ? '' : 'cursor-text focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
          )}
          onClick={() => {
            if (!readOnly) {
              setEditing(true)
            }
          }}
          onKeyDown={(event) => {
            if (readOnly) {
              return
            }
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              setEditing(true)
            }
          }}
        >
          {value.trim() === '' ? (
            <p className="text-muted-foreground">{readOnly ? 'No content yet.' : 'Tap to write'}</p>
          ) : (
            <div className={markdownClassName}>
              <Markdown remarkPlugins={[remarkBreaks]}>{value}</Markdown>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
