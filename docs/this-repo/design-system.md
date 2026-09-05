# Design system and mobile rules (this repo)

**Status:** Implemented in the prototype
**Last updated:** 2026-09-05
**Code:** `apps/web/src/components/ui`, `apps/web/src/components/jorby`

## shadcn is real, not imitated

`apps/web/src/components/ui` holds unmodified shadcn `new-york` components. Installed so far: `button`, `card`, `input`, `textarea`, `label`, `checkbox`, `tabs`, `badge`, `avatar`, `separator`, `sheet`, `skeleton`. Radix primitives come from the unified `radix-ui` package.

### Adding a component

The shadcn CLI needs Node >= 22.13 and this machine runs 22.9, so the CLI cannot run. `apps/web/scripts/add-shadcn.mjs` performs the same copy step against the public registry:

```bash
node scripts/add-shadcn.mjs dialog dropdown-menu sonner
```

It writes into `src/components/ui`, rewrites the registry's unresolved `cn` alias to `@/lib/utils`, and prints any new npm dependencies to install. Once Node is upgraded, `npx shadcn@latest add` is equivalent and preferred; delete the script then.

Do not hand-edit files in `src/components/ui`. Jorby-specific composition belongs in `src/components/jorby`:

| Component | Purpose |
| --- | --- |
| `MemberMark`, `MemberTag` | Member identity, avatar plus name so color is never the only signal |
| `Rating` | Half-star integer to display stars, with a screen-reader text equivalent |
| `ScreenHeader`, `SectionHeading`, `BackLink` | Consistent page structure |
| `FilterRow`, `FilterChip` | Scrollable full-size filter chips |
| `EmptyState` | Filtered-empty and empty-household messaging |

Theme tokens live in `src/index.css` using the shadcn stone palette in oklch. Dark-mode tokens are defined but nothing toggles `.dark` yet.

## Mobile rules

These are enforced expectations, not aspirations. Every one of them was violated by the first prototype pass.

1. **Touch targets are at least 44px tall.** Includes back links, filter chips, and tab triggers — not just primary buttons.
2. **No horizontal overflow at 320px.** Filter rows scroll horizontally rather than wrapping into cramped rows.
3. **Tab-bar labels are 11px minimum**, with 20px icons in a 56px bar.
4. **Fixed tab bar never covers content.** `main` reserves `calc(3.5rem + env(safe-area-inset-bottom) + 1.5rem)` of bottom padding.
5. **Safe-area insets** are respected on the tab bar; `viewport-fit=cover` is set in `index.html`.
6. **Text inputs render at 16px on small screens** so iOS Safari does not zoom on focus. shadcn's `Input` and `Textarea` already do this via `text-base md:text-sm`; do not override it down to `text-sm` unconditionally.
7. **Primary actions on long forms are sticky** above the tab bar, so Save and Add stay thumb-reachable with the keyboard open.
8. **Destructive or branching choices use a bottom `Sheet`** on mobile rather than an inline block.

### Auditing

There is no automated layout test yet, because the Vitest environment is `node` and jsdom does not compute layout. Until Playwright lands in Phase 1, audit by hand: emulate a 320px and a 390px viewport in DevTools, then run this in the console to list violations across every route.

```js
const routes = ['home','lists','notes','places','watch','things','search','settings']
for (const r of routes) {
  history.pushState({}, '', '/our-home/' + r)
  window.dispatchEvent(new PopStateEvent('popstate'))
  await new Promise(res => setTimeout(res, 300))
  const overflow = document.scrollingElement.scrollWidth - window.innerWidth
  if (overflow > 0) console.warn(r, 'overflows by', overflow)
  document.querySelectorAll('a,button,[role=tab],input,textarea,select').forEach(el => {
    const rc = el.getBoundingClientRect()
    if (rc.height > 0 && rc.height < 44) console.warn(r, 'short target', el.textContent?.trim(), rc.height)
  })
}
```

Replace this with a Playwright check that asserts the same rules as soon as end-to-end tooling exists.

## Known gaps

- No dark-mode toggle, and `theme-color` is light-only.
- No `Skeleton` usage yet; loading states are still missing from every screen.
- No toast surface, so Action success and failure are not announced.
- Reduced-motion preferences are untested.
