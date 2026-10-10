# Places, Watch, and Things backend scope

**Status:** Concrete slices and interfaces deployed; real-provider work pending
**Accepted:** 2026-09-07
**Deployment status updated:** 2026-09-13
**Build order used:** Places, Watch, Things
**Current consumer SDK:** superseded by resolved `@jorby/sdk@0.20.0`. Counts below that still say `0.14.0` are historical. Use `implementation-status.md` for the live 16/45/6/3, 70-export contract, including Tags, photos, and Plan B.

This document records the accepted design and its implementation outcome. `product-decisions.md` remains authoritative for behavior, `ontology-spec.md` for the logical model, and `implementation-status.md` for exact deployed RIDs.

## 1. Current verified baseline

The live Ontology, Functions release, Developer Console SDK, and generated package agree on:

- Ontology RID `ri.ontology.main.ontology.9f2b2cd7-43c1-4b50-b372-e49921c9b1cf`.
- 15 deployed concrete object types and 31 generated links across Household, Lists, Notes, Places, Watch, and Things.
- 48 consumer Actions.
- 6 query Functions from Functions release `0.6.0` (`getJorbyWatchTonight` at `0.6.0`; the other five remain `0.5.0`).
- 3 deployed interfaces: `JorbyHouseholdScoped`, `JorbyContent`, and `JorbyMemberReaction`, with 13/5/3 concrete implementations. Global polymorphic search is enabled at the Ontology/SDK layer.
- Provider-neutral Places/Watch contracts backed only by deterministic `MOCK` adapters; real credentials and Foundry egress remain pending.
- Exact runtime line: `@jorby/sdk@0.14.0`, `@osdk/react@2.67.0`, `@osdk/client@2.67.0`, `@osdk/api@2.67.0`, and `@osdk/oauth@1.13.0`.

Six legacy List Action RIDs were repurposed into composite Places/Watch/Things Actions to stay within the 60-Action cap. The old six generated symbols no longer exist. The public browser SDK continues to exclude Household provisioning, membership administration, purge operations, unrestricted edits, provider secrets, and sources.

## 2. Shared interface contracts — deployed

All three accepted contracts and their concrete mappings are deployed in the Ontology and generated in `@jorby/sdk@0.14.0`. `JorbyHouseholdScoped` has 13 implementations, `JorbyContent` has 5, and `JorbyMemberReaction` has 3. These generated interfaces can now be queried polymorphically; UI work remains separate.

### `JorbyHouseholdScoped`

A non-searchable interface implemented by the 13 consumer-readable private object types. It guarantees:

```text
householdId
accessGroupId
createdAt
createdByUserId
updatedAt
updatedByUserId
archivedAt?
archivedByUserId?
revision
```

Each concrete type still requires its own object-security policy. Canonical provider objects and service-only invites do not implement this interface.

### `JorbyContent`

A searchable interface paired with `JorbyHouseholdScoped` on its five implementations: Shared List, Shared Note, Place Entry, Watch Entry, and Thing.

```text
contentId
displayTitle
searchText
```

It is the OSDK surface for recent content and global search. Concrete primary keys and title properties map to the interface; no duplicate ID or title field is required solely for the interface.

The initial interface does not require `relatedNotes`. Concrete typed Note links remain authoritative until interface-link traversal has a proven consumer workflow.

### `JorbyMemberReaction`

A non-searchable interface paired with `JorbyHouseholdScoped` on its three implementations: Place Review, Dish Review, and Watch Reaction.

```text
reactionId
membershipId
ratingHalfStars?
reviewText?
reviewedAt?
```

Actions enforce conditional requirements. Review subjects remain typed links; Jorby will not introduce an untyped `targetType + targetId` relationship.

## 3. Places slice

### Object API names

```text
JorbyCatalogPlace
JorbyPlaceEntry
JorbyVisit
JorbyDish
JorbyPlaceReview
JorbyDishReview
```

`JorbyCatalogPlace` is a deployed shared provider snapshot. All other Place types are deployed private concrete objects and implement `JorbyHouseholdScoped`; `JorbyPlaceEntry` also implements `JorbyContent`, and both review types also implement `JorbyMemberReaction`.

### Identity and manual/provider interop

- `catalogPlaceId = provider + ":" + providerPlaceId`.
- `placeEntryId` is always a random UUID.
- `catalogPlaceId` on Place Entry is optional.
- A null canonical key means the entry is manual and remains Household-private.
- Reconciliation attaches a provider record without changing the Entry ID or replacing Visits, Dishes, Reviews, Note links, or audit history.
- An Action rejects reconciliation when another active Entry in the same Household already uses the canonical Place. v1 does not automatically merge histories.
- A correction Action may replace an incorrect canonical match when it creates no duplicate.

### Place Entry display behavior

```text
displayTitle
isDisplayTitleOverridden
manualFormattedAddress?
manualLocation?
manualWebsiteUrl?
manualPhoneNumber?
manualTypes[]
manualCuisineTags[]
```

A manual Place requires only `displayTitle`. Provider-backed entries default it from canonical metadata. When a member edits the title, refresh preserves the override. Canonical refresh never clears household-authored fields.

### Canonical location

Store canonical coordinates as a GeoPoint named `location`, not independent latitude and longitude properties. Provider DTOs may use numeric latitude/longitude fields at the adapter boundary and convert them before editing the Ontology.

### Place invariants

- Favorite requires `BEEN`.
- An active Visit forces `BEEN`.
- A Place with an active Visit cannot return to `WANT_TO_GO`.
- A Place Review requires `BEEN`, but not a Visit record.
- Visits have at least one same-Household participant.
- Visit Dishes must belong to the same Place Entry.
- Active Dish normalized names are unique within one Place Entry.
- Ratings are integer half-star units from 1 through 10.

### Place query Functions

```text
searchJorbyPlaces
getJorbyPlaceDetails
```

Search currently uses a deterministic provider-neutral `MOCK` adapter. Results are not persisted until selected. Real provider credentials and egress remain pending.

### Place Action families

```text
createJorbyManualPlace
saveJorbyProviderPlace
reconcileJorbyPlaceEntry
correctJorbyPlaceProviderMatch
refreshJorbyCatalogPlace
saveJorbyPlaceEntry
setJorbyPlaceEntryArchived
saveJorbyVisit
setJorbyVisitArchived
setJorbyVisitParticipants
setJorbyVisitDishes
saveJorbyDish
setJorbyDishArchived
manageJorbyPlaceReviews
```

`manageJorbyPlaceReviews` is the deployed composite review operation; the four separate review Action names in the original plan were not deployed.

## 4. Watch slice

### Object API names

```text
JorbyMediaTitle
JorbyWatchEntry
JorbyWatchReaction
```

`JorbyMediaTitle` is a deployed shared provider snapshot. Watch Entry and Reaction are deployed private concrete objects that implement `JorbyHouseholdScoped`. Watch Entry also implements `JorbyContent`, and Reaction also implements `JorbyMemberReaction`.

### Identity and manual/provider interop

- `mediaTitleId = provider + ":" + mediaType + ":" + providerId`.
- `watchEntryId` is always a random UUID.
- `mediaTitleId` is optional.
- Manual facts remain on the private Watch Entry.
- Reconciliation preserves Entry identity, progress, reactions, Note links, and history.
- Duplicate canonical reconciliation is rejected rather than merged in v1.

### Watch Entry manual/display fields

```text
displayTitle
isDisplayTitleOverridden
mediaType
manualReleaseYear?
manualOverview?
manualImageUrl?
```

A manual Watch Entry requires title and media type. Provider-backed entries also retain local `mediaType` so progress validation does not depend on a live provider call.

### Watch progress and reaction rules

- Movies have no season or episode progress.
- A Show progress update requires positive season and episode values.
- Episode requires season.
- Season must not exceed a known canonical season count.
- Per-season episode bounds are not enforced because v1 has no Episode objects.
- One reaction exists per member and Watch Entry.
- `WANTS_TO_WATCH` has no rating or review.
- `REVIEWED` requires a 1–10 half-star rating and reviewed timestamp.
- A rated Review is allowed only when status is `WATCHED` or `DROPPED`.
- Everyone-wants compares active wants reactions with active Memberships on the server; a missing reaction is never positive interest.

### Watch query Functions

```text
searchJorbyMediaTitles
getJorbyMediaTitleDetails
getJorbyWatchTonight
```

### Watch Action families

```text
createJorbyManualWatchEntry
manageJorbyWatchProvider
reconcileJorbyWatchEntry
saveJorbyWatchEntry
setJorbyWatchStatus
setJorbyWatchProgress
manageJorbyWatchReaction
setJorbyWatchReactionArchived
setJorbyWatchEntryArchived
```

## 5. Things slice

### Object API name

```text
JorbyThing
```

One Thing represents one physical or intended unit. Identical units are separate objects; v1 has no quantity property.

### Optional exact price

```text
priceMinorUnits?: Long
priceCurrency?: CurrencyCode
```

Both properties are absent or present together. Minor units are nonnegative integers. Currency is initialized from Household defaults when a price is first entered and then remains a snapshot. A later edit replaces the current price; v1 has no price-history object.

TypeScript v2 and OSDK represent Long safely as a string. Functions use `BigInt` for arithmetic and the frontend formats the value using the currency's minor-unit rules.

### Thing invariants

- Reservation is allowed only in `IDEA` or `BUYING`.
- Purchase, ownership, gifting, or sale clears a reservation.
- Only the active reserving member normally releases a reservation.
- Membership removal releases that member's reservations.
- Recipient fields are mutually constrained by `MEMBER`, `HOUSEHOLD`, or `EXTERNAL`.
- Warranty expiry cannot precede purchase date.
- Normal lifecycle changes use the accepted transition graph and desired final states.

### Thing Action families

```text
createJorbyThing
manageJorbyThingDetails
manageJorbyThingReservation
manageJorbyThingLifecycle
```

## 6. Common mutation contract

Every consumer mutation must:

1. Resolve the authenticated Foundry user server-side.
2. Resolve one active Membership in the target Household.
3. Derive `householdId` and `accessGroupId` from an already authorized parent.
4. Reject private cross-Household object or link combinations.
5. Accept caller-observed `expectedRevision` for destructive or overwrite behavior.
6. Compute audit fields and the next revision server-side.
7. Use desired final states rather than blind toggles.
8. Refresh the top-level parent's `updatedAt`, `updatedByUserId`, `revision`, and `searchText` when a child changes.
9. Return actionable `UserFacingError` messages for expected validation failures.
10. Apply edits only through governed Actions.

## 7. Consumer OSDK deployment outcome

### Deployed

- All six Places object types, their concrete links and current generated Actions, plus `searchJorbyPlaces` and `getJorbyPlaceDetails`.
- All three Watch object types, their concrete links and current generated Actions, plus `searchJorbyMediaTitles`, `getJorbyMediaTitleDetails`, and `getJorbyWatchTonight`.
- `JorbyThing`, its concrete links, and four composite Actions.
- Exact package `@jorby/sdk@0.14.0` with 15 objects, 31 links, 48 consumer Actions, 6 queries (`getJorbyWatchTonight` at `0.6.0`), and 3 interfaces with 13/5/3 implementations.
- Global polymorphic search enabled through `JorbyContent` at the Ontology/SDK layer.

Canonical Catalog Place and Media Title objects are consumer-readable, have no household state, and expose no provider credentials. Their edits are reachable only through governed Actions. Provider query results come from deterministic `MOCK` adapters today.

### Still planned

- Replace MOCK adapters with real providers only after credentials and Foundry egress approval.

Never import service-only invitation/provisioning, purge, unrestricted edit, provider secret, or source resources into the browser SDK.

## 8. OSDK and Ontology synchronization gate

For every slice:

1. Create or update resources on a branch.
2. Confirm exact object, property, link-side, interface, Action, and query API names from the branch Ontology.
3. Refresh the TypeScript v2 Functions local SDK.
4. Build, test, and publish Functions before binding Actions.
5. Add only approved consumer resources to the Developer Console SDK.
6. Publish the next generated SDK version.
7. Retrieve resource-specific OSDK documentation from that exact SDK.
8. Pin the package exactly and update `apps/web/src/osdk/resources.ts`.
9. Verify `@osdk/react`, `@osdk/client`, and `@osdk/api` remain on the exact compatible release line.
10. Run build, typecheck, lint, tests, and CI.
11. Update implementation status with deployed RIDs and versions.

Code must import only names present in the exact generated SDK and consumer boundary.

## 9. Delivery status and remaining order

Completed: Places deterministic-MOCK concrete slice; Watch deterministic-MOCK concrete slice; Things lifecycle concrete slice; Functions `0.6.0`; all three shared interfaces and their mappings; consumer SDK `0.14.0`.

Remaining order:

1. Deepen Places/Watch/Things UI (visit dishes, reconciliation, archived views) against the generated composite Actions.
2. Obtain credentials and Foundry egress approval, then implement/test real Places and Watch provider adapters.
