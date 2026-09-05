import { NavLink, Outlet, useParams } from 'react-router-dom'
import { householdPath } from '@/lib/routes'

const sections = [
  { id: 'home', label: 'Home' },
  { id: 'lists', label: 'Lists' },
  { id: 'notes', label: 'Notes' },
  { id: 'places', label: 'Places' },
  { id: 'watch', label: 'Watch' },
  { id: 'things', label: 'Things' },
] as const

export function AppShell() {
  const { householdId } = useParams()

  if (!householdId) {
    return <Outlet />
  }

  return (
    <div className="flex min-h-svh flex-col bg-background pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-sm font-medium">Jorby</p>
        <nav className="flex items-center gap-3 text-sm">
          <NavLink className="min-h-11 min-w-11 inline-flex items-center" to={householdPath(householdId, 'search')}>
            Search
          </NavLink>
          <NavLink className="min-h-11 min-w-11 inline-flex items-center" to={householdPath(householdId, 'settings')}>
            Household
          </NavLink>
          <NavLink className="min-h-11 min-w-11 inline-flex items-center" to="/households">
            Switch
          </NavLink>
        </nav>
      </header>
      <div className="flex flex-1">
        <nav
          aria-label="Primary"
          className="hidden w-48 shrink-0 border-r border-border p-3 md:block"
        >
          <ul className="space-y-1">
            {sections.map((section) => (
              <li key={section.id}>
                <NavLink
                  to={householdPath(householdId, section.id)}
                  className={({ isActive }) =>
                    `flex min-h-11 items-center rounded-md px-3 text-sm ${isActive ? 'bg-muted font-medium' : ''}`
                  }
                >
                  {section.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <main className="flex-1 px-4 py-6">
          <Outlet />
        </main>
      </div>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="grid grid-cols-6">
          {sections.map((section) => (
            <li key={section.id}>
              <NavLink
                to={householdPath(householdId, section.id)}
                className={({ isActive }) =>
                  `flex min-h-11 items-center justify-center px-1 text-xs ${isActive ? 'font-medium' : 'text-muted-foreground'}`
                }
              >
                {section.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
