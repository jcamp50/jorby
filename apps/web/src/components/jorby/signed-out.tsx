import type { ReactNode } from 'react'
import { PageWash } from '@/components/jorby/screen'

/** Front-door screens sit outside the household shell but still use Home's wash. */
export function SignedOutShell({ children }: { children: ReactNode }) {
  return (
    <div data-section="home" className="relative flex min-h-svh flex-col">
      <PageWash />
      <main className="relative z-0 mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        {children}
      </main>
    </div>
  )
}
