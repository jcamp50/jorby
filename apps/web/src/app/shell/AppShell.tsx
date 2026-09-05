import {
  Clapperboard,
  Home,
  ListTodo,
  MapPin,
  Package,
  Search,
  StickyNote,
} from 'lucide-react'
import { NavLink, Outlet, useParams } from 'react-router-dom'
import { MemberMark } from '@/components/jorby/member-mark'
import { ErrorState, ScreenSkeleton } from '@/components/jorby/states'
import { Button } from '@/components/ui/button'
import { AppErrorCode } from '@/lib/errors'
import { householdPath } from '@/lib/routes'
import { usePrototype } from '@/prototype/PrototypeProvider'

const sections = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'lists', label: 'Lists', icon: ListTodo },
  { id: 'notes', label: 'Notes', icon: StickyNote },
  { id: 'places', label: 'Places', icon: MapPin },
  { id: 'watch', label: 'Watch', icon: Clapperboard },
  { id: 'things', label: 'Things', icon: Package },
] as const

/** Tab bar height plus the iOS home-indicator inset, so fixed nav never covers the last row. */
const TAB_BAR_SPACE = 'calc(3.5rem + env(safe-area-inset-bottom))'

export function AppShell() {
  const { householdId } = useParams()
  const { currentMember, status, retry } = usePrototype()

  if (!householdId) {
    return <Outlet />
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <p className="bg-muted px-4 py-1 text-center text-xs text-muted-foreground">
          UI prototype · local mock data · not Foundry
        </p>
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-2 py-2 sm:px-4">
          <p className="px-2 text-base font-semibold tracking-tight">Jorby</p>
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="icon" className="size-11">
              <NavLink to={householdPath(householdId, 'search')}>
                <Search aria-hidden />
                <span className="sr-only">Search</span>
              </NavLink>
            </Button>
            <Button asChild variant="ghost" className="h-11 gap-2 px-2">
              <NavLink to={householdPath(householdId, 'settings')}>
                <MemberMark member={currentMember} />
                <span className="hidden sm:inline">{currentMember.displayName}</span>
                <span className="sr-only sm:hidden">
                  Household settings, signed in as {currentMember.displayName}
                </span>
              </NavLink>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-1">
        <nav aria-label="Sections" className="hidden w-52 shrink-0 border-r p-3 md:block">
          <ul className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <li key={section.id}>
                  <NavLink
                    to={householdPath(householdId, section.id)}
                    className={({ isActive }) =>
                      `flex min-h-11 items-center gap-2 rounded-md px-3 text-sm transition-colors hover:bg-accent ${
                        isActive ? 'bg-accent font-medium' : 'text-muted-foreground'
                      }`
                    }
                  >
                    <Icon className="size-4" aria-hidden />
                    {section.label}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>
        <main
          className="min-w-0 flex-1 px-4 py-5 sm:py-6 md:pb-6"
          style={{ paddingBottom: `calc(${TAB_BAR_SPACE} + 1.5rem)` }}
        >
          {status === 'loading' ? <ScreenSkeleton /> : null}
          {status === 'error' ? (
            <ErrorState code={AppErrorCode.NETWORK_UNAVAILABLE} onRetry={retry} />
          ) : null}
          {status === 'ready' ? <Outlet /> : null}
        </main>
      </div>

      <nav
        aria-label="Sections"
        className="fixed inset-x-0 bottom-0 z-20 border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="mx-auto grid max-w-5xl grid-cols-6">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <li key={section.id}>
                <NavLink
                  to={householdPath(householdId, section.id)}
                  className={({ isActive }) =>
                    `flex h-14 flex-col items-center justify-center gap-1 text-[11px] leading-none transition-colors ${
                      isActive ? 'font-medium text-foreground' : 'text-muted-foreground'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className="size-5"
                        strokeWidth={isActive ? 2.25 : 1.75}
                        aria-hidden
                      />
                      {section.label}
                    </>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
