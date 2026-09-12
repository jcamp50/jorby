import { LayoutGrid, Settings2 } from 'lucide-react'
import { NavLink, Outlet, useLocation, useParams } from 'react-router-dom'
import { MemberMark } from '@/components/jorby/member-mark'
import { PageWash } from '@/components/jorby/screen'
import { financePath, householdAppsPath, householdPath } from '@/lib/routes'
import { financeSectionFromPath, financeSections } from '@/lib/finance-sections'
import { FinanceViewProvider } from '@/finance/FinanceView'
import { usesFoundryData } from '@/osdk/household-route'
import { memberFromMembership } from '@/osdk/member'
import { useMyMembership } from '@/osdk/useMyMembership'
import { usePrototype } from '@/prototype/PrototypeProvider'
import { cn } from '@/lib/utils'

export function FinanceShell() {
  const { householdId } = useParams()
  const { pathname } = useLocation()
  const { currentMember } = usePrototype()

  if (!householdId) {
    return <Outlet />
  }

  const live = usesFoundryData(householdId)
  const section = financeSectionFromPath(pathname)

  return (
    <div data-section="finance" className="flex min-h-svh flex-col">
      <PageWash />

      <header className="relative z-10">
        <p className="px-4 pt-1 pb-0.5 text-center text-[11px] font-medium text-foreground/45">
          {live
            ? 'Jorby Finance · live household, mock money'
            : 'Jorby Finance · local mock data · not Foundry'}
        </p>
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-4 py-2">
          <NavLink
            to={householdAppsPath(householdId)}
            end
            className="flex size-11 items-center justify-center rounded-full"
          >
            {live ? (
              <FinanceHomeMark householdId={householdId} />
            ) : (
              <MemberMark member={currentMember} />
            )}
            <span className="sr-only">Jorby apps</span>
          </NavLink>

          <div className="flex items-center gap-0.5 rounded-full bg-card/70 p-1 shadow-card backdrop-blur">
            <NavLink
              to={householdAppsPath(householdId)}
              end
              className="flex size-11 items-center justify-center rounded-full transition-colors hover:bg-accent"
            >
              <LayoutGrid className="size-[18px]" aria-hidden />
              <span className="sr-only">Jorby apps</span>
            </NavLink>
            <NavLink
              to={householdPath(householdId, 'settings')}
              className="flex size-11 items-center justify-center rounded-full transition-colors hover:bg-accent"
            >
              <Settings2 className="size-[18px]" aria-hidden />
              <span className="sr-only">Household settings</span>
            </NavLink>
          </div>
        </div>
      </header>

      <div className="relative z-0 mx-auto flex w-full max-w-5xl flex-1">
        <nav aria-label="Finance" className="hidden w-52 shrink-0 p-3 md:block">
          <ul className="space-y-1">
            {financeSections.map((item) => {
              const Icon = item.icon
              const to = financePath(householdId, item.path)
              const active = item.id === section
              return (
                <li key={item.id}>
                  <NavLink
                    to={to}
                    end={item.path === ''}
                    className={cn(
                      'flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-medium transition-colors',
                      active
                        ? 'bg-card text-section-ink shadow-card'
                        : 'text-muted-foreground hover:bg-card/60',
                    )}
                  >
                    <Icon className="size-[18px]" aria-hidden />
                    {item.label}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>

        <main className="min-w-0 flex-1 px-4 py-2 pb-[calc(var(--tab-bar-space)+0.5rem)] sm:py-3 md:pb-6">
          <FinanceViewProvider>
            <Outlet />
          </FinanceViewProvider>
        </main>
      </div>

      <nav
        aria-label="Finance"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-20 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:hidden"
      >
        <ul className="pointer-events-auto mx-auto grid max-w-md grid-cols-5 gap-0.5 rounded-full bg-card/80 p-1.5 shadow-float backdrop-blur-xl">
          {financeSections.map((item) => {
            const Icon = item.icon
            const to = financePath(householdId, item.path)
            return (
              <li key={item.id}>
                <NavLink
                  to={to}
                  end={item.path === ''}
                  className={({ isActive }) =>
                    cn(
                      'flex h-14 flex-col items-center justify-center gap-1 rounded-full text-[11px] leading-none transition-colors',
                      isActive
                        ? 'bg-section-wash font-bold text-section-ink'
                        : 'font-medium text-muted-foreground',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className="size-5" strokeWidth={isActive ? 2.4 : 1.9} aria-hidden />
                      {item.label}
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

function FinanceHomeMark({ householdId }: { householdId: string }) {
  const { data } = useMyMembership(householdId)
  if (!data) {
    return (
      <span className="flex size-9 items-center justify-center rounded-full bg-card text-[11px] font-extrabold shadow-card">
        You
      </span>
    )
  }
  return <MemberMark member={memberFromMembership(data)} />
}
