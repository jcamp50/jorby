# UI prototype (this repo)

**Status:** Local mock  
**Last updated:** 2026-09-18  
**Code:** `apps/web/src/prototype`

## Purpose

Give a clickable, mobile-first walkthrough of Jorby Home (Lists, Notes, Places, Watch, Things, Search, settings) and Jorby Finance **without** Foundry money objects or bank connections.

See [design-direction.md](./design-direction.md) for the visual language and [design-system.md](./design-system.md) for shadcn install and mobile rules.

## What is real

- Routes from the agent handoff
- Six-section navigation
- Home activity feed shared with live (`CatalogHome` + `ActivityFeed` + `buildActivityFeed`)
- shadcn `new-york` components on Radix primitives
- Dual-member ratings and reviews as UI
- Thing Wish / Home / History lenses
- List completion as a desired on/off state
- Note unsaved-change warning
- Visible gift reservation (no surprise-gift hiding)

## What is fake

- Seeded Jordan/Sam catalog and finance data exists only on `/our-home/…`. A Foundry household URL must not show it
- After entering a household, `/our-home` asks Home vs Finance. Finance uses a separate shell at `/our-home/finance` with Household / Jordan / Sam views over accounts, spend, budgets, goals, and bills
- Welcome can start Foundry OAuth when root `.env` is present; “Enter mock household” is a labeled escape hatch
- A “View as” control in Household settings switches which mock member you are
- Provider search (Places / Watch) on the mock household is seeded local data. Live households use Foundry `MOCK` query Functions, not Google Places or TMDB.
- Reloading the page resets mock data
- Load latency and failures are simulated with `?simulate=slow|error|empty`
- Invite copy is a placeholder string, not a membership-service token

## Out of scope for this prototype

- Bank connections, Together, uploads, offline writes
- Calling Google Places or TMDB from the browser
- Treating `householdId` in the URL as authorization
