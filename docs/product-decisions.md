# Jorby product decisions

**Status:** Living decision register  
**Last updated:** 2026-09-05  
**Product:** Jorby v1

## 1. Product statement

Jorby is a private shared-household application. Its first release is a shared life catalog for lists, notes, places, watch titles, and things. It is designed around one household context at a time while allowing a person to belong to multiple households.

The interface is optimized for couples, but the domain model supports any household size.

## 2. Product principles

1. **One household, multiple voices.** Reviewable records support a separate rating and review for every active or historical member.
2. **Search to add culture; type to add life.** Places and watch titles come from provider search. Lists, notes, dishes, and things are entered by people.
3. **Status belongs on the record.** Want, watched, owned, gifted, and related states are lifecycle values, not separate products.
4. **Household-visible by default.** All v1 household content is visible to every active household member.
5. **Money waits.** A Thing may have a price, but v1 has no transactions, budgets, bank data, or ledgers.
6. **Actions, not arbitrary writes.** Every consumer mutation passes through a governed action or trusted membership workflow.
7. **Mobile first, not mobile only.** The primary experience is a responsive PWA that remains useful on desktop.

## 3. Confirmed information architecture

Primary navigation:

1. Home
2. Lists
3. Notes
4. Places
5. Watch
6. Things

Later modules, excluded from v1 navigation:

- Money
- Together

Home is a thin orientation layer, not a separate data-entry product.

## 4. Confirmed decisions

### 4.1 Household, identity, and access

| ID         | Decision                                                                                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `D-HH-001` | The model supports multiple households and any number of members, even though the UI is optimized for two people.                                                     |
| `D-HH-002` | A person may belong to multiple households and chooses a household on entry when more than one is available.                                                          |
| `D-HH-003` | Household members are equal. Creator status is informational and does not create an owner role.                                                                       |
| `D-HH-004` | Any active member may invite a new member.                                                                                                                            |
| `D-HH-005` | Any active member may remove another member, with an explicit confirmation step.                                                                                      |
| `D-HH-006` | A member may leave voluntarily.                                                                                                                                       |
| `D-HH-007` | The final active member leaving archives the household.                                                                                                               |
| `D-HH-008` | An empty archived household remains recoverable indefinitely until an administrator explicitly purges it.                                                             |
| `D-HH-009` | Removed or departed membership records remain so historical reviews, assignments, and attribution remain intelligible.                                                |
| `D-HH-010` | New workflows ignore inactive members unless showing history.                                                                                                         |
| `D-HH-011` | Each membership has an app-specific display name, optional external avatar URL, and profile color while retaining the Foundry user ID as the authentication identity. |
| `D-HH-012` | The household stores a display name, default currency, timezone, locale, and home city/region for place-search bias.                                                  |

### 4.2 Authentication and deployment

| ID           | Decision                                                                                                                                                                                                                                                                                        |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `D-AUTH-001` | End users may not otherwise use Foundry; use individual consumer identities and OAuth rather than a shared service identity for normal app usage.                                                                                                                                               |
| `D-AUTH-002` | The browser is a public OAuth client.                                                                                                                                                                                                                                                           |
| `D-AUTH-003` | Generic single-use invitation codes require a narrow trusted membership service.                                                                                                                                                                                                                |
| `D-AUTH-004` | The membership service is an externally hosted serverless service with a confidential authentication configuration and tightly scoped administrative credentials.                                                                                                                               |
| `D-AUTH-005` | Invite links/codes are copied by a member into any messaging app; Jorby does not send invitation email in v1.                                                                                                                                                                                   |
| `D-AUTH-006` | Invitations expire after seven days and are single-use.                                                                                                                                                                                                                                         |
| `D-AUTH-007` | The frontend is externally hosted while Foundry remains the application backend.                                                                                                                                                                                                                |
| `D-AUTH-008` | This GitHub repository contains only the web application and membership service. Foundry remains the Ontology backend and is a separate project. |
| `D-AUTH-009` | Docs that describe this GitHub codebase (UI prototype, web hosting, membership HTTP implementation) live in `docs/this-repo/`. Product and Ontology specs stay at `docs/` root. |

### 4.3 Archival, audit, and collaboration

| ID           | Decision                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------- |
| `D-DATA-001` | Normal deletion is soft archival with restore. Permanent purge is an administrator-only workflow.  |
| `D-DATA-002` | Home recent activity is a convenience view over updated timestamps, not a durable Activity object. |
| `D-DATA-003` | The app shows who added and last edited content.                                                   |
| `D-DATA-004` | Live changes use OSDK subscriptions where useful, but v1 has no cursors or presence UI.            |
| `D-DATA-005` | Notes use a five-minute renewable edit lock to prevent simultaneous editing.                       |
| `D-DATA-006` | Notes use explicit Save and warn about unsaved changes.                                            |
| `D-DATA-007` | Removed members' reviews, attribution, and old assignments remain visible.                         |

### 4.4 Lists

| ID           | Decision                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------- |
| `D-LIST-001` | Lists have a name, optional description, items, household-wide pinning, archival, and duplication. |
| `D-LIST-002` | A List Item has zero or one assignee; null means anyone/either.                                    |
| `D-LIST-003` | Duplicating a List copies active items as unchecked.                                               |
| `D-LIST-004` | Duplicating a List preserves assignees and order.                                                  |
| `D-LIST-005` | v1 does not include templates, public sharing, or recurring-list automation.                       |

### 4.5 Notes

| ID           | Decision                                                                     |
| ------------ | ---------------------------------------------------------------------------- |
| `D-NOTE-001` | Notes use lightweight Markdown rather than block editing.                    |
| `D-NOTE-002` | Notes use free-form multi-value tags, not folders.                           |
| `D-NOTE-003` | A Note can link to multiple Lists, Place Entries, Watch Entries, and Things. |
| `D-NOTE-004` | v1 has no comments, version-history UI, or real-time co-editing.             |

### 4.6 Places

| ID            | Decision                                                                                                              |
| ------------- | --------------------------------------------------------------------------------------------------------------------- |
| `D-PLACE-001` | Google Places is the preferred first provider because coverage and place details are more important than lowest cost. |
| `D-PLACE-002` | Provider facts are stored separately from household state.                                                            |
| `D-PLACE-003` | Saved provider metadata is a snapshot refreshed manually/on demand, not on a schedule.                                |
| `D-PLACE-004` | Place visit state is `Want to go` or `Been`; `Favorite` is an independent household flag.                             |
| `D-PLACE-005` | A Visit records a selected subset of household members and defaults to the current member.                            |
| `D-PLACE-006` | Dishes are reusable objects belonging to a saved Place Entry.                                                         |
| `D-PLACE-007` | Visits link to reused Dishes.                                                                                         |
| `D-PLACE-008` | Each member may maintain one overall rating/review for a Place and one overall rating/review for a Dish.              |
| `D-PLACE-009` | Dish reviews describe the reusable Dish overall, not an individual Visit.                                             |
| `D-PLACE-010` | Ratings use 0.5 to 5 stars in half-star increments.                                                                   |
| `D-PLACE-011` | No uploaded visit/place photos in v1. Provider image metadata may be shown when permitted.                            |

### 4.7 Watch

| ID            | Decision                                                                                              |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| `D-WATCH-001` | TMDB-style search supplies canonical title metadata; household Watch state is stored separately.      |
| `D-WATCH-002` | Provider metadata refresh is manual/on demand.                                                        |
| `D-WATCH-003` | Watch states are Watchlist, Watching, Watched, and Dropped.                                           |
| `D-WATCH-004` | Show progress is one shared household season/episode position, not per-member episode history.        |
| `D-WATCH-005` | A member's Watch reaction starts as `Wants to watch` and transitions into their one revisable Review. |
| `D-WATCH-006` | A title qualifies for the household smart queue only when every active member wants to watch it.      |
| `D-WATCH-007` | Ratings use 0.5 to 5 stars in half-star increments.                                                   |
| `D-WATCH-008` | No episode-level objects, reviews, or streaming-link product in v1.                                   |

### 4.8 Things

| ID            | Decision                                                                                            |
| ------------- | --------------------------------------------------------------------------------------------------- |
| `D-THING-001` | Wish and Home are two lenses over one Thing lifecycle, not separate object types.                   |
| `D-THING-002` | The same Thing transitions from Wish to Home, preserving identity and history.                      |
| `D-THING-003` | Thing lifecycle is one enum; the active lens is derived from state.                                 |
| `D-THING-004` | On purchase, the action asks whether to move the Thing to Home, mark it Gifted, or leave it Bought. |
| `D-THING-005` | Recipient can be a household member, the whole household, or an external person label.              |
| `D-THING-006` | A Thing can have zero or one assignee; null means anyone/either.                                    |
| `D-THING-007` | Household default currency initializes prices, but each entered price stores its currency snapshot. |
| `D-THING-008` | Gift reservations are visible to the household; surprise-gift privacy is not part of v1.            |
| `D-THING-009` | Only the reserving member normally clears a reservation.                                            |
| `D-THING-010` | Removing the reserving member automatically releases the reservation.                               |
| `D-THING-011` | No uploaded Thing photos in v1; an optional external image URL is allowed.                          |

### 4.9 Home and search

| ID             | Decision                                                                                                         |
| -------------- | ---------------------------------------------------------------------------------------------------------------- |
| `D-HOME-001`   | Home shows recent content, pinned/unfinished Lists, want-to-go Places, Watch suggestions, and unresolved Things. |
| `D-HOME-002`   | “We should” is a smart union of want-to-go Places, everyone-wants Watch Entries, and Wish Things.                |
| `D-SEARCH-001` | v1 includes global search across Lists, Notes, Places, Watch, and Things.                                        |
| `D-SEARCH-002` | Global search includes top-level names/titles, Note bodies, List Item text, reviews, and shared notes.           |
| `D-SEARCH-003` | Search returns top-level records, even when a child record provided the match.                                   |

### 4.10 Frontend experience

| ID         | Decision                                                                    |
| ---------- | --------------------------------------------------------------------------- |
| `D-UI-001` | Build a mobile-first responsive web app/PWA that remains usable on desktop. |
| `D-UI-002` | v1 is online-only; do not build offline mutation queues or synchronization. |
| `D-UI-003` | Use Tailwind CSS, accessible headless primitives, and shadcn components.    |
| `D-UI-004` | Use `@osdk/react` for new OSDK reads, Actions, and subscriptions.           |

## 5. Explicit v1 exclusions

- Money, transactions, budgeting, bank connections, or spending charts.
- Together, trips as a first-class type, memories, shared calendar, or date-night events.
- Private Notes or private Lists.
- Surprise-gift hiding.
- Public profiles or social sharing.
- Friends, followers, chat, or comments.
- Full Notion-style blocks.
- Uploaded media and media vaults.
- Offline writes.
- Real-time cursors or collaborative text editing.
- List-template marketplace.
- Reservation booking and menu ingestion.
- Episode-level Watch tracking.
- Barcode scanning, depreciation, or insurance-document storage.

## 6. Decisions deferred beyond v1

- Private surprise-gift exception.
- Uploaded photos and a reusable Attachment model.
- Recurring grocery lists.
- Map-first Places experience.
- Notifications.
- Money module.
- Together module.
- More advanced search ranking.
- Scheduled provider refresh.
- Data export and household ownership transfer.

## 7. Required platform validation before implementation

These are validation tasks, not reopened product decisions:

1. Verify consumer-mode identity provisioning for the intended users.
2. Verify that a tightly scoped trusted service can create and manage a household-specific access group.
3. Verify the consumer user's group changes take effect quickly enough after invitation acceptance/removal.
4. Confirm object security policies support the selected group-property comparison in the target Ontology.
5. Confirm the target Ontology uses project-based permissions and Object Storage v2.
6. Create Google Places and TMDB mock adapters before requesting credentials or egress.
7. Confirm the final external static hosting provider, OAuth redirect URLs, CORS, and CSP.
8. Establish the GitHub monorepo and synchronization/migration path from the current Foundry React OSDK repository.
9. Import only the approved object, interface, Action, and Function resources into the application's generated OSDK.
10. Validate that `@osdk/react`, `@osdk/client`, and `@osdk/api` are on compatible release lines before frontend work.

## 8. Decision-change template

Use this template when changing behavior:

```md
### D-<DOMAIN>-<NUMBER>: <title>

- Status: Proposed | Accepted | Rejected | Superseded
- Date:
- Decision:
- Reason:
- Product impact:
- Ontology impact:
- Frontend impact:
- Membership/security impact:
- Migration required:
- Supersedes:
```
