import {
  Clapperboard,
  Home,
  ListTodo,
  MapPin,
  Package,
  Search,
  StickyNote,
  Users,
} from 'lucide-react'
import { NavLink, Outlet, useParams } from 'react-router-dom'
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

export function AppShell() {
  const { householdId } = useParams()
  const { currentMember } = usePrototype()

  if (!householdId) {
    return <Outlet />
  }

  return (
    <div className="flex min-h-svh flex-col bg-background pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
      <p className="border-b border-border bg-muted px-4 py-1.5 text-center text-xs text-muted-foreground">
        UI prototype · local mock data · not Foundry
      </p>
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="text-sm font-medium">Jorby</p>
        <nav className="flex items-center gap-1 text-sm">
          <NavLink
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-md px-2"
            to={householdPath(householdId, 'search')}
          >
            <Search className="size-4" aria-hidden />
            <span className="hidden sm:inline">Search</span>
            <span className="sr-only sm:hidden">Search</span>
          </NavLink>
          <NavLink
            className="inline-flex min-h-11 items-center gap-2 rounded-md px-2"
            to={householdPath(householdId, 'settings')}
          >
            <Users className="size-4" aria-hidden />
            <span>{currentMember.displayName}</span>
          </NavLink>
        </nav>
      </header>
      <div className="mx-auto flex w-full max-w-5xl flex-1">
        <nav aria-label="Primary" className="hidden w-52 shrink-0 border-r border-border p-3 md:block">
          <ul className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <li key={section.id}>
                  <NavLink
                    to={householdPath(householdId, section.id)}
                    className={({ isActive }) =>
                      `flex min-h-11 items-center gap-2 rounded-md px-3 text-sm ${isActive ? 'bg-muted font-medium' : ''}`
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
        <main className="min-w-0 flex-1 px-4 py-6">
          <Outlet />
        </main>
      </div>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="grid grid-cols-6">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <li key={section.id}>
                <NavLink
                  to={householdPath(householdId, section.id)}
                  className={({ isActive }) =>
                    `flex min-h-12 flex-col items-center justify-center gap-0.5 px-1 text-[10px] ${isActive ? 'font-medium' : 'text-muted-foreground'}`
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
    </div>
  )
}
