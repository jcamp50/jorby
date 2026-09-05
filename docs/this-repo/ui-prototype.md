# UI prototype (this repo)

**Status:** Local mock  
**Last updated:** 2026-09-05  
**Code:** `apps/web/src/prototype`

## Purpose

Give a clickable, mobile-first walkthrough of Home, Lists, Notes, Places, Watch, Things, Search, and Household settings **without** Foundry, OSDK, or the membership service.

See [design-system.md](./design-system.md) for how shadcn is installed and the mobile rules each screen must satisfy.

## What is real

- Routes from the agent handoff
- Six-section navigation
- shadcn `new-york` components on Radix primitives
- Dual-member ratings and reviews as UI
- Thing Wish / Home / History lenses
- List completion as a desired on/off state
- Note unsaved-change warning
- Visible gift reservation (no surprise-gift hiding)

## What is fake

- All data is in-memory mock state (`PrototypeProvider`)
- There is no OAuth; Welcome continues straight into the prototype household
- A “View as” control in Household settings switches which mock member you are
- Provider search (Places / Watch) is not connected; entries are seeded
- Reloading the page resets mock data
- Load latency and failures are simulated with `?simulate=slow|error|empty`
- Invite copy is a placeholder string, not a membership-service token

## Out of scope for this prototype

- Money, Together, uploads, offline writes
- Calling Google Places or TMDB from the browser
- Treating `householdId` in the URL as authorization
