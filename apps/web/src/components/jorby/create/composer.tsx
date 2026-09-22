import { Plus } from 'lucide-react'
import { type FormEvent, type ReactNode, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

export function CreateComposer({
  label,
  title,
  canSubmit,
  busy,
  onSubmit,
  children,
}: {
  label: string
  title: string
  canSubmit: boolean
  busy?: boolean
  onSubmit: () => boolean | Promise<boolean>
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!canSubmit || busy) {
      return
    }
    if (await onSubmit()) {
      setOpen(false)
    }
  }

  return (
    <>
      <div className="h-30" aria-hidden />
      <button
        type="button"
        aria-label={label}
        onClick={() => setOpen(true)}
        className="fixed bottom-[calc(var(--tab-bar-space)+1.25rem)] left-1/2 z-10 flex size-16 -translate-x-1/2 items-center justify-center rounded-full bg-section text-white shadow-float md:bottom-8"
      >
        <Plus className="size-8" strokeWidth={2.4} aria-hidden />
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="inset-x-0 bottom-0 gap-0 overflow-hidden rounded-t-3xl border-0 pb-[env(safe-area-inset-bottom)] md:inset-x-auto md:left-1/2 md:w-full md:max-w-lg md:-translate-x-1/2"
          style={{ height: '90dvh', maxHeight: '90dvh' }}
        >
          <form
            onSubmit={(event) => void submit(event)}
            className="flex min-h-0 flex-col"
            style={{ height: '100%' }}
          >
            <SheetHeader className="shrink-0">
              <SheetTitle className="text-xl font-extrabold tracking-[-0.02em]">{title}</SheetTitle>
              <SheetDescription className="sr-only">{label}</SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-2">{children}</div>
            <SheetFooter className="shrink-0 flex-row gap-2">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="h-11 flex-1 rounded-full"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="lg"
                className="h-11 flex-1 rounded-full"
                disabled={!canSubmit || busy}
              >
                Create
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
