# Jorby frontend and membership-service agent handoff

**Audience:** Agent or engineering team implementing the React frontend and trusted user/membership service in this GitHub repo  
**Status:** Build contract  
**Last updated:** 2026-09-05

This repository implements the browser app and membership service only. Foundry Ontology is a separate backend. Local UI work currently uses mock data; see [docs/this-repo/](./this-repo/README.md).

## 1. Mission

Build Jorby as a private, mobile-first shared-household catalog using Foundry's Ontology as the application backend.

The frontend must provide:

- Household selection and profile context.
- Home.
- Lists.
- Notes.
- Places.
- Watch.
- Things.
- Global search.

The trusted membership service must provide:

- Household creation with an access boundary.
- Generic single-use invitation creation and claim.
- Invitation revocation.
- Member removal and voluntary departure.
- Access-group synchronization.
- Empty-Household archival.
- Admin-only recovery/purge hooks.

Finance mock UI is approved as a separate household app. Do not add bank connections, Foundry money objects, Together, uploaded media, or social features.

## 2. Mandatory reading and precedence

Before writing code, read:

1. `docs/product-decisions.md`
2. `docs/ontology-spec.md`
3. This handoff

If code and documentation disagree, do not assume the code is correct. Follow the precedence in `docs/README.md`, record the discrepancy, and resolve it explicitly.

## 3. Current repository reality

The current repository is a Foundry-generated React OSDK application using React, Vite, TypeScript, OAuth, and a generated SDK configuration.

Important current-state observations:

- `@osdk/react` and `@osdk/client` are already dependencies.
- Blueprint dependencies are present from the template, but the approved design direction is Tailwind, accessible headless primitives, and shadcn components.
- `foundry.config.json` currently targets Foundry static hosting.
- The approved product decision is external static hosting for the production frontend.
- The approved source layout is one GitHub monorepo containing the web app and membership service.

Do not delete current hosting configuration or Blueprint dependencies as an unrelated cleanup. Establish the GitHub/external-hosting migration and remove unused dependencies in a dedicated change with a working replacement.

Suggested eventual monorepo layout:

```text
jorby/
├── apps/
│   └── web/
├── services/
│   └── membership/
├── packages/
│   ├── ui/
│   ├── contracts/
│   └── config/
├── docs/
└── .github/workflows/
```

The living documentation in this repository must be preserved in the GitHub source of truth.

## 4. Non-negotiable architecture

```text
Consumer user
  -> externally hosted React PWA
  -> public OAuth/PKCE session
  -> @osdk/react
  -> restricted generated OSDK
  -> Ontology reads, Actions, and Functions

Consumer user
  -> trusted serverless membership service
  -> confidential authentication
  -> narrowly scoped administrative/service credential
  -> invitation records, Household access group, Membership objects

OSDK frontend
  -> Foundry provider Functions
  -> mock adapter initially
  -> Google Places or TMDB after credentials and egress approval
```

### Trust boundaries

- The browser is untrusted.
- A route parameter, local-storage value, or submitted Household ID is never proof of access.
- Foundry object security is authoritative for reads.
- Actions are authoritative for normal content writes.
- The membership service is authoritative for access-group membership.
- Provider API secrets never enter the browser bundle.
- Invite token plaintext never enters logs or Ontology properties.

## 5. Frontend technology requirements

Use:

- React and TypeScript.
- Vite unless a deliberate migration is approved.
- React Router.
- Tailwind CSS.
- shadcn components.
- Accessible headless primitives where shadcn does not cover a need.
- `@osdk/react` for new OSDK reads, Actions, cache integration, and subscriptions.
- Generated OSDK types rather than handwritten copies of Ontology object types.
- A schema validator such as Zod for membership-service HTTP payloads and non-OSDK provider DTOs.
- Vitest and React Testing Library for unit/component tests.
- A browser automation framework for critical end-to-end flows.

Do not use `useEffect` as the normal data-loading mechanism. Use `@osdk/react` for Ontology resources. Use a standard query library only for non-OSDK HTTP endpoints such as the membership service.

Before writing `@osdk/react` code:

1. Read `node_modules/@osdk/react/AGENTS.md`.
2. Inspect the installed package documentation.
3. Confirm the generated SDK contains the needed resource.
4. Retrieve resource-specific OSDK documentation and use the exact generated API name.
5. Confirm `@osdk/react`, `@osdk/client`, and `@osdk/api` are compatible versions.

Do not guess generated property, link, Action, or Function names from this logical specification.

## 6. Authentication design

### 6.1 Browser application

Use an OAuth public client with PKCE.

Required routes:

- `/auth/callback`
- a signed-out/auth-start experience
- an authenticated application shell

Requirements:

- Never embed a client secret.
- Validate OAuth state and nonce using the supported SDK flow.
- Preserve the intended post-login destination safely.
- Handle expired sessions and reauthentication without losing unsaved form state where practical.
- Configure exact production and local-development redirect URLs.
- Allow only approved origins in CORS configuration.

### 6.2 Membership service

Use a distinct confidential authentication/client configuration. The service needs two identities:

1. The authenticated human requester, used for authorization decisions and audit fields.
2. A narrowly scoped service identity, used only for group and protected membership operations that cannot be performed directly by an unjoined consumer.

Never authorize a service request using only a user-supplied `foundryUserId`, `membershipId`, or `householdId`.

### 6.3 Household selection

After login:

1. Load active `HouseholdMembership` objects visible to the user.
2. If zero, show Create Household and Claim Invite.
3. If one, enter it directly unless returning from an invite flow.
4. If more than one, require selection.
5. Keep the selected Household in route state; do not treat it as authorization.
6. Every screen query also filters by the selected `householdId`.

Do not add a persistent active-Household preference object in v1.

## 7. Membership-service HTTP contract

Exact paths may change, but preserve these semantics. All mutating operations accept an idempotency key.

### `POST /v1/households`

Creates:

- Household access group.
- Household object.
- Creator Membership.
- Group membership for creator.

Input:

```json
{
  "displayName": "Our Home",
  "defaultCurrency": "USD",
  "timezone": "America/New_York",
  "locale": "en-US",
  "homeCity": "New York",
  "homeRegion": "NY",
  "homeCountryCode": "US"
}
```

Requirements:

- Derive creator identity from authenticated request.
- Roll back or compensate if any step fails.
- Return only safe Household and Membership projections.

### `GET /v1/households/{householdId}/invites`

Returns safe invite metadata to an active Household member:

- Invite ID.
- Creation time.
- Expiration time.
- Status.
- Issuing member.

Never return token hashes or prior plaintext tokens.

### `POST /v1/households/{householdId}/invites`

Creates a seven-day, single-use invite.

Response may return the raw invite URL/token exactly once.

Requirements:

- Requester must be an active member.
- Generate at least 128 bits of cryptographic entropy.
- Store only a slow or keyed cryptographic hash appropriate to the chosen token format.
- Rate-limit creation.
- Do not log URL, token, or hash.

### `DELETE /v1/households/{householdId}/invites/{inviteId}`

Revokes an active invite.

- Any active member may revoke.
- Repeated revocation is idempotent.

### `POST /v1/invites/claim`

Claims an invite for the authenticated user.

Input:

```json
{
  "token": "opaque-single-use-token",
  "profile": {
    "displayName": "Jordan",
    "avatarUrl": null,
    "profileColor": "violet"
  }
}
```

Atomic outcome:

1. Validate token hash in constant time.
2. Verify active, not expired, not consumed, and not revoked.
3. Add user to Household access group.
4. Create or reactivate Membership as allowed by policy.
5. Mark invite consumed with actor identity and timestamp.
6. Return safe Household and Membership data.

If partial failure occurs, revoke access or compensate before reporting failure.

### `DELETE /v1/households/{householdId}/members/{membershipId}`

Removes another member.

Requirements:

- Requester is a different active member in the same Household.
- Revoke access-group membership before returning success.
- Set Membership to `REMOVED` with actor metadata.
- Release Things reserved by that Membership.
- Leave Reviews, assignments, and attribution intact.
- If no active members remain because of a race, archive Household.

### `POST /v1/households/{householdId}/leave`

Voluntary departure.

Requirements:

- Revoke requester access.
- Set Membership to `LEFT`.
- Release their reservations.
- Archive Household if they were the final active member.

### Administrative operations

Admin-only, not called by ordinary browser UI:

- Recover archived empty Household.
- Hard purge Household and all dependents.
- Repair access-group drift.
- Reconcile Membership objects against group membership.

## 8. Membership-service security requirements

- Use least-privilege credentials.
- Store secrets in the hosting platform's secret manager.
- Never store service credentials in Git, frontend environment variables, or browser-readable configuration.
- Protect state-changing endpoints against CSRF when cookie-based auth is used.
- Validate issuer, audience, expiry, and signature on identity tokens.
- Apply per-user and per-IP rate limiting to invite creation and claim.
- Redact tokens, authorization headers, and personal data from logs.
- Use structured audit events with requester user ID, operation, target Household, result, and correlation ID.
- Apply request-body size limits and strict schemas.
- Use idempotency records with expiry for mutating operations.
- Treat group update plus Ontology update as a distributed transaction with explicit compensation.
- Regularly reconcile `ACTIVE` Memberships with actual access-group membership.
- Never expose group-management operations directly to the public client.

## 9. Provider Function contracts

Provider access runs in Foundry server-side Functions, not in the browser or membership service.

Initial functions:

- `searchPlaces(query, locationBias, pageToken?)`
- `getPlaceDetails(provider, providerId)`
- `searchMediaTitles(query, mediaType?, page?)`
- `getMediaTitleDetails(provider, providerId, mediaType)`
- `refreshCatalogPlace(catalogPlace)`
- `refreshMediaTitle(mediaTitle)`

Start with mock adapters and stable provider-neutral DTOs.

Provider DTO rules:

- Include only data needed by the UI or canonical object.
- Preserve provider attribution requirements.
- Represent errors as typed user-safe categories.
- Do not leak provider keys, raw headers, or unbounded raw responses.
- Debounce search in the UI.
- Cancel or ignore stale search responses.
- Do not persist a provider result until the user selects Add.
- Saving a result must idempotently upsert the canonical object and create/restore the Household entry.

## 10. Routing and application shell

Recommended routes:

```text
/auth/callback
/welcome
/households
/invite/:token
/:householdId/home
/:householdId/search
/:householdId/lists
/:householdId/lists/:listId
/:householdId/notes
/:householdId/notes/:noteId
/:householdId/places
/:householdId/places/:placeEntryId
/:householdId/watch
/:householdId/watch/:watchEntryId
/:householdId/things
/:householdId/things/:thingId
/:householdId/settings
```

Route rules:

- Resolve Household context before rendering child screens.
- A route Household not present in visible active Memberships gets a neutral not-found/access-denied experience.
- Do not reveal whether an inaccessible object exists.
- Preserve filter state in URL search parameters where useful.
- Mobile navigation uses the six confirmed primary sections.
- Household switcher is available from the app shell, not mixed into section tabs.

## 11. Frontend module structure

Suggested structure inside `apps/web/src`:

```text
src/
├── app/
│   ├── providers/
│   ├── router/
│   └── shell/
├── auth/
├── households/
├── home/
├── lists/
├── notes/
├── places/
├── watch/
├── things/
├── search/
├── osdk/
│   ├── hooks/
│   ├── actions/
│   └── subscriptions/
├── membership-service/
│   ├── client.ts
│   ├── schemas.ts
│   └── hooks.ts
├── components/
├── design-system/
├── lib/
└── test/
```

Keep presentation components independent from generated OSDK object instances where practical. Feature hooks should adapt OSDK data into explicit view models rather than spreading queries throughout leaf components.

## 12. Screen-to-query/action map

Names are logical placeholders. Replace them with generated API names after the Ontology SDK is available.

### Home

Queries:

- Recent active `JorbyContent` by `updatedAt`.
- Pinned Lists.
- Lists with incomplete Items.
- Want-to-go Place Entries.
- Watchlist entries with reactions.
- Wish-state Things.

Do not create or query an Activity type.

### Lists index

Queries:

- Active Lists for selected Household.
- Sort pinned first, then recently updated or alphabetically.

Actions:

- Create List.
- Edit List metadata.
- Pin/unpin with desired state.
- Duplicate List.
- Archive/restore List.

### List detail

Queries:

- One visible List.
- Active Items ordered by rank.
- Household Memberships for assignee display.

Actions:

- Add Item.
- Edit Item.
- Set completion state.
- Set/clear assignee.
- Reorder Item.
- Archive/restore Item.

Use an optimistic checkbox experience only if Action validation and rollback are correctly handled.

### Notes index/detail

Queries:

- Active Notes by update time/tag.
- One Note plus related records and lock state.

Actions:

- Create Note.
- Acquire lock.
- Heartbeat while actively editing.
- Save with lock proof and expected revision.
- Release lock.
- Link/unlink records.
- Archive/restore.

UI behavior:

- Show lock owner and expiry state.
- Never silently overwrite stale content.
- Warn before navigation with unsaved changes.
- Stop heartbeat when editor unmounts or tab loses editing state.
- Treat failed release as safe because the lease expires.
- Sanitize rendered Markdown.

### Places

Queries:

- Household Place Entries with linked canonical metadata.
- Filters for state, favorite, cuisine, neighborhood, and disagreement.
- Place detail with Visits, Dishes, Reviews, Memberships, and Notes.

Functions/Actions:

- Search provider.
- Save provider result.
- Refresh provider snapshot.
- Set visit state/favorite.
- Log/edit/archive Visit.
- Create/edit/archive Dish.
- Attach/detach Dish from Visit.
- Upsert/archive current member Place Review.
- Upsert/archive current member Dish Review.

### Watch

Queries:

- Watch Entries by status.
- Linked Media Title and Reactions.
- Active Membership count for everyone-wants calculation.

Functions/Actions:

- Search titles.
- Save provider result.
- Refresh metadata.
- Set status.
- Set shared show progress.
- Set/clear wants-to-watch.
- Submit/update/archive Review.

Do not treat a missing reaction as a positive interest signal.

### Things

Queries:

- Filter one Thing type by lifecycle lens.
- Resolve assignee, recipient member, and reserver Memberships.

Actions:

- Create/edit Thing.
- Assign/unassign.
- Reserve/release.
- Purchase transition with explicit outcome.
- Change lifecycle state through allowed transitions.
- Archive/restore.

Disable reservation release for non-reservers unless the reserver is inactive and the membership-removal workflow is reconciling it.

### Global search

Query `JorbyContent` by selected Household and normalized search text.

Requirements:

- Debounce input.
- Group or label results by concrete object type.
- Show the top-level record even when a child caused the match.
- Exclude archived results by default.
- Do not search provider catalogs until the user enters the explicit Add flow.

## 13. Subscriptions and cache behavior

Use subscriptions selectively:

- Open List and Items.
- Open Note lock state.
- Current section result page.
- Current detail record and visible children.
- Home summary only while Home is mounted.

Do not subscribe to every object in the Household globally.

After successful Actions:

- Prefer `@osdk/react` cache synchronization where supported.
- Reconcile optimistic state with returned edits.
- Refetch/invalidates only affected objects when necessary.
- Present typed validation failures inline.
- Present transport/system failures as retryable errors without claiming the mutation succeeded.

Subscriptions do not remove the need for revision checks.

## 14. Design-system and interaction guidance

### Mobile-first layout

- Bottom navigation for the six primary sections on narrow screens.
- Sidebar or top navigation on desktop.
- Touch targets at least 44 by 44 CSS pixels.
- Forms use mobile-friendly input types.
- Sticky primary action where useful, without covering content.
- Support safe-area insets.

### shadcn/headless usage

Use components for:

- Dialog and confirmation flows.
- Sheet/drawer on mobile.
- Select/combobox.
- Tabs for Things lenses and section filters.
- Dropdown menus.
- Toasts.
- Form controls.
- Skeletons.

Do not sacrifice semantic HTML or keyboard behavior for visual consistency.

### Accessibility

- WCAG 2.2 AA target.
- Keyboard access for every operation.
- Visible focus treatment.
- Correct labels and descriptions.
- Announce Action success/failure with an appropriate live region.
- Do not rely on color alone for member identity, status, or ratings.
- Provide text equivalents for star ratings.
- Respect reduced-motion preferences.
- Trap and restore focus correctly in dialogs/sheets.

### Loading and empty states

Every screen needs distinct states for:

- Initial loading.
- Background refresh.
- Empty Household content.
- Filtered-empty results.
- Access denied/not found.
- Recoverable error.
- Action validation failure.

Avoid full-screen spinners for background refreshes.

## 15. PWA boundaries

Implement installable PWA metadata and responsive behavior, but v1 is online-only.

Required:

- App manifest.
- Icons and theme metadata.
- Safe update prompt when a new bundle is available.
- Clear offline indicator/error.

Do not implement:

- Offline object cache presented as current truth.
- Offline Action queue.
- Conflict resolution for disconnected edits.
- Background sync.

A service worker may cache immutable application assets only if OAuth and dynamic API responses are excluded.

## 16. Error model

Normalize errors into:

- `AUTH_REQUIRED`
- `ACCESS_DENIED`
- `NOT_FOUND_OR_HIDDEN`
- `VALIDATION_FAILED`
- `STALE_REVISION`
- `LOCKED_BY_OTHER_MEMBER`
- `LOCK_EXPIRED`
- `DUPLICATE`
- `PROVIDER_UNAVAILABLE`
- `RATE_LIMITED`
- `NETWORK_UNAVAILABLE`
- `UNKNOWN`

Do not expose stack traces, provider responses, object existence across security boundaries, or raw Foundry error payloads to users.

## 17. Test strategy

### Unit tests

- Lifecycle and lens mapping.
- Rating conversion.
- Search normalization.
- Invite-expiry calculation.
- Route construction.
- DTO validation.
- Error normalization.

### Component tests

- Household chooser states.
- List completion rollback.
- Note lock states and unsaved warning.
- Dual/multi-member Review cards.
- Everyone-wants calculation.
- Thing purchase decision flow.
- Accessible dialogs and keyboard navigation.

### Contract tests

- Membership-service request/response schemas.
- OSDK adapter view models against generated types.
- Provider mock adapter parity with production adapter DTOs.

### Security integration tests

Create two Households and at least three users. Prove:

1. A member sees only their Household data.
2. A multi-Household user sees both and can switch.
3. A nonmember cannot infer another Household's objects.
4. Invite claim grants only the intended Household.
5. Invite replay fails.
6. Expired/revoked invites fail.
7. Member removal immediately removes reads and Actions.
8. Cross-Household links and assignments fail.
9. Browser-supplied access-group values are ignored.
10. Service credentials never reach frontend assets or logs.

### End-to-end journeys

1. Create Household → create invite → claim as second user.
2. Create and complete a List with live update in another browser.
3. Acquire Note lock → save → verify second editor is blocked.
4. Search/save Place → Visit → Dish → two Reviews.
5. Search/save Show → all members want → update shared progress → Review.
6. Create Wish → reserve → purchase → move to Home.
7. Remove member → lose access → preserve historical Review → release reservation.
8. Archive and restore each top-level record type.

## 18. Implementation sequence

### Phase 0: platform spikes

- Verify consumer OAuth.
- Verify external host redirect and CORS configuration.
- Verify access-group provisioning from the trusted service.
- Verify object security policy behavior.
- Verify generated SDK resource imports and exact API names.
- Verify `@osdk/react` package compatibility.

Do not build broad UI before these spikes pass.

### Phase 1: foundation

- GitHub monorepo and CI.
- App shell, authentication, Household chooser.
- Tailwind/shadcn design system.
- Membership-service skeleton and secure auth.
- Mock provider contracts.

### Phase 2: Household and Lists

- Household create/invite/claim/member management.
- Lists and Items.
- Subscriptions and Action error pattern.

### Phase 3: Notes

- Markdown editor.
- Lock lifecycle.
- Explicit Save and unsaved protection.
- Record links.

### Phase 4: Watch

- Mock title search, save, status, progress, reactions, and queue.
- Replace mock with TMDB after approvals.

### Phase 5: Places

- Mock place search, save, Visits, Dishes, Reviews, and filters.
- Replace mock with Google Places after approvals.

### Phase 6: Things

- Wish/Home/history lenses.
- Assignment, recipient, reservation, and lifecycle transitions.

### Phase 7: Home and global search

- Recent content.
- We Should smart union.
- Cross-section search.
- Performance and accessibility pass.

## 19. Pull-request checklist

Every implementation pull request must answer:

- Which accepted decision IDs does this implement or alter?
- Which Ontology resources and generated API names are used?
- Are all reads scoped to the selected Household?
- Are writes performed only through approved Actions/service endpoints?
- Are stale revisions, validation failures, and hidden objects handled safely?
- Does this add a new secret, origin, redirect, egress domain, or permission?
- Are mobile, keyboard, screen-reader, loading, empty, and error states covered?
- Are living specifications still accurate?
- Did build, typecheck, lint, and tests pass?

## 20. Do not do these things

- Do not query all private objects and filter them only in React.
- Do not use a shared service user for normal household reads.
- Do not place provider or service secrets in `VITE_*` variables.
- Do not call Google Places or TMDB directly from the browser.
- Do not edit Ontology objects directly outside Actions.
- Do not create a generic polymorphic `targetType + targetId` relationship when a typed link exists.
- Do not create separate Wish and Home object types.
- Do not create one Review object with an untyped target.
- Do not add an Activity object for Home.
- Do not use floating-point star values as the persisted rating.
- Do not overwrite Note content without lock and revision validation.
- Do not expose whether inaccessible Household objects exist.
- Do not add offline writes, bank connections, Foundry money objects, Together, photos, social features, or surprise-gift privacy without an approved decision.

## 21. Definition of frontend/service readiness

The implementation is ready for broader feature work only when:

- Consumer login works from the intended external origin.
- Household row security passes the multi-user integration test.
- Group creation, invitation claim, and removal are proven end to end.
- The generated OSDK contains only approved resources.
- A vertical slice can create and query a Household-scoped object through an Action.
- The app handles access denial without information leakage.
- CI runs build, typecheck, lint, unit tests, and contract tests.
- No secret is present in the browser bundle.

Once these gates pass, build in the phased order above rather than implementing every section in parallel.
