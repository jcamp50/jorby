# Jorby v1 ontology specification

**Status:** Living technical specification  
**Last updated:** 2026-09-30
**Ontology target:** Object Storage v2 with project-based permissions

This GitHub repository specifies the Ontology so the consumer UI stays aligned. Object types, Actions, Functions, and object security are implemented in Foundry, not in this git repository.

This document defines Jorby's logical Ontology. Household, Lists, Notes, Tags, Places, Watch, and Things API names are confirmed against the live Ontology and resolved `@jorby/sdk@0.20.0`. The consumer package contains 16 objects, 45 Actions, 6 query Functions, 3 interfaces with 14/5/3 concrete implementations, and 70 top-level boundary resources. Generated object definitions expose 36 imported links. The Ontology itself has 56 Actions. The latest `Jorby Functions` edit release is `0.6.1`. `getJorbyWatchTonight` is `0.6.0`; the other five queries remain `0.5.0`. Consumer Actions derive actor identity from trusted Action context and must not take `currentUserId` from the browser. This GitHub frontend queries `JorbyContent` for Home and household search. Tag management, photo upload, and List Item `thingId` selection are deployed in the SDK and not yet in the UI. Once published, avoid casually renaming active API names; update this specification and plan a migration first.

## 1. Modeling rules

1. Model real household concepts, not UI components or provider response payloads.
2. Separate canonical provider facts from private household state.
3. Every private record carries an immutable household discriminator and access discriminator.
4. Every consumer mutation occurs through an Action.
5. Use deterministic primary keys where they enforce a real uniqueness rule.
6. Preserve historical Memberships and Reviews; archive normal records instead of deleting them.
7. Never trust a client-supplied household or access-group value when it can be derived from an authorized parent.
8. Never create a link between private records from different households.

## 2. Ontology inventory

### Interfaces (deployed)

- `JorbyHouseholdScoped` — 14 concrete implementations.
- `JorbyContent` — exactly 5 concrete implementations.
- `JorbyMemberReaction` — 3 concrete implementations.

All three interfaces and their concrete property/link mappings are generated in resolved `@jorby/sdk@0.20.0`.

### Object types

| Domain | Object types                                                               |
| ------ | -------------------------------------------------------------------------- |
| Core   | `Household`, `HouseholdMembership`, `HouseholdInvite`                      |
| Lists  | `SharedList`, `ListItem`                                                   |
| Notes  | `SharedNote`                                                               |
| Tags   | `Tag`                                                                      |
| Places | `CatalogPlace`, `PlaceEntry`, `Visit`, `Dish`, `PlaceReview`, `DishReview` |
| Watch  | `MediaTitle`, `WatchEntry`, `WatchReaction`                                |
| Things | `Thing`                                                                    |

Total logical inventory: 17 concrete object types, of which 16 are deployed in the consumer SDK and `HouseholdInvite` remains planned/service-only.

### Deployed object types (current consumer SDK `0.20.0`)

- Core: `JorbyHousehold`, `JorbyHouseholdMembership`.
- Lists and Notes: `JorbySharedList`, `JorbyListItem`, `JorbySharedNote`.
- Tags: `JorbyTag` (`ri.ontology.main.object-type.c07cf151-48a5-4ccf-8639-1fc3ceacdace`).
- Places: `JorbyCatalogPlace`, `JorbyPlaceEntry`, `JorbyVisit`, `JorbyDish`, `JorbyPlaceReview`, `JorbyDishReview`.
- Watch: `JorbyMediaTitle`, `JorbyWatchEntry`, `JorbyWatchReaction`.
- Things: `JorbyThing`.

That is 16 deployed consumer objects. See `implementation-status.md` for exact object type RIDs.

## 3. Reusable value types

Create shared enumeration/value types where supported.

| Value type            | Values or rule                                                                       |
| --------------------- | ------------------------------------------------------------------------------------ |
| `HouseholdId`         | UUID string                                                                          |
| `MembershipId`        | Deterministic string                                                                 |
| `FoundryUserId`       | Foundry user UUID                                                                    |
| `AccessGroupId`       | Foundry group UUID                                                                   |
| `CurrencyCode`        | Uppercase ISO 4217 code                                                              |
| `LocaleCode`          | BCP 47-style locale                                                                  |
| `TimezoneId`          | IANA timezone                                                                        |
| `HouseholdStatus`     | `ACTIVE`, `ARCHIVED`                                                                 |
| `MembershipStatus`    | `ACTIVE`, `LEFT`, `REMOVED`                                                          |
| `InviteStatus`        | `ACTIVE`, `CONSUMED`, `REVOKED`, `EXPIRED`                                           |
| `VisitState`          | `WANT_TO_GO`, `BEEN`                                                                 |
| `ExternalProvider`    | Current adapter: `MOCK`; planned real providers include `GOOGLE`, `TMDB`; extensible |
| `MediaType`           | `MOVIE`, `SHOW`                                                                      |
| `WatchStatus`         | `WATCHLIST`, `WATCHING`, `WATCHED`, `DROPPED`                                        |
| `WatchReactionStage`  | `WANTS_TO_WATCH`, `REVIEWED`                                                         |
| `ThingLifecycleState` | `IDEA`, `BUYING`, `BOUGHT`, `OWNED`, `BROKEN`, `UPGRADE_WANTED`, `GIFTED`, `SOLD`    |
| `RecipientKind`       | `MEMBER`, `HOUSEHOLD`, `EXTERNAL`                                                    |
| `RatingHalfStars`     | Integer 1 through 10; UI displays value divided by 2                                 |
| `PriceMinorUnits`     | Nonnegative Long containing exact minor currency units                               |

Prefer integer half-star units over floating-point ratings so validation and equality are exact. Optional prices use `PriceMinorUnits` plus a `CurrencyCode`; Decimal is not used because the Ontology runs on Object Storage v2.

## 4. Interfaces — deployed contracts

Interfaces are contracts over concrete object types, not storage types. The `Jorby` prefix matches the deployed object API-name convention. All three interfaces below and their concrete mappings are deployed in the Ontology and generated in resolved `@jorby/sdk@0.20.0`. Application code may query them polymorphically while continuing to use concrete object types for domain-specific behavior.

### 4.1 `JorbyHouseholdScoped`

Non-searchable. Implemented by 14 consumer-readable private types: `Household`, `HouseholdMembership`, `SharedList`, `ListItem`, `SharedNote`, `Tag`, `PlaceEntry`, `Visit`, `Dish`, `PlaceReview`, `DishReview`, `WatchEntry`, `WatchReaction`, and `Thing`. It excludes service-only `HouseholdInvite` and shared canonical provider types.

| Property           |    Logical type | Required | Rule                                  |
| ------------------ | --------------: | -------: | ------------------------------------- |
| `householdId`      |   `HouseholdId` |      Yes | Immutable                             |
| `accessGroupId`    | `AccessGroupId` |      Yes | Must match Household                  |
| `createdAt`        |       Timestamp |      Yes | Server-generated                      |
| `createdByUserId`  | `FoundryUserId` |      Yes | Actor identity                        |
| `updatedAt`        |       Timestamp |      Yes | Server-generated                      |
| `updatedByUserId`  | `FoundryUserId` |      Yes | Actor identity                        |
| `archivedAt`       |       Timestamp |       No | Null means active                     |
| `archivedByUserId` | `FoundryUserId` |       No | Required when archived                |
| `revision`         |         Integer |      Yes | Starts at 1 and increases on mutation |

The interface creates a consistent Functions and application contract; each concrete type still needs its own tested object security policy.

### 4.2 `JorbyContent`

Searchable and paired with `JorbyHouseholdScoped` on its concrete types. Implemented by 5 types: `SharedList`, `SharedNote`, `PlaceEntry`, `WatchEntry`, and `Thing`.

| Property       | Logical type | Required | Purpose                      |
| -------------- | -----------: | -------: | ---------------------------- |
| `contentId`    |       String |      Yes | Maps to concrete primary key |
| `displayTitle` |       String |      Yes | Cross-section display        |
| `searchText`   |       String |      Yes | Denormalized search document |
| `tagNames`     | String array |      Yes | Normalized names of active linked Tags; links are source |

Required link constraint: `household` points to exactly one `Household`. `Tag` is household-scoped and is not `JorbyContent`.

The initial interface does not define `relatedNotes`. Concrete many-to-many Note links remain authoritative until a supported polymorphic traversal is required. The frontend can query this interface for Home and global search, inspect the concrete object type, and route to the corresponding detail screen.

### 4.3 `JorbyMemberReaction`

Non-searchable and paired with `JorbyHouseholdScoped` on its concrete types. Implemented by 3 types: `PlaceReview`, `DishReview`, and `WatchReaction`.

| Property          |   Logical type |    Required |
| ----------------- | -------------: | ----------: |
| `reactionId`      |         String |         Yes |
| `membershipId`    | `MembershipId` |         Yes |
| `ratingHalfStars` |        Integer | Conditional |
| `reviewText`      |         String |          No |
| `reviewedAt`      |      Timestamp |          No |

Required link constraint: `reviewer` points to exactly one `HouseholdMembership`. The concrete subject remains a typed link; no generic target-type/target-ID relationship is permitted. Actions enforce conditional rating and review rules.

## 5. Core object types

### 5.1 `Household`

Primary key: `householdId`, random UUID.

| Property                        |              Type | Required | Notes                       |
| ------------------------------- | ----------------: | -------: | --------------------------- |
| `householdId`                   |       UUID string |      Yes | Primary key                 |
| `displayName`                   |            String |      Yes | User-facing name            |
| `defaultCurrency`               |    `CurrencyCode` |      Yes | Default for new prices      |
| `timezone`                      |      `TimezoneId` |      Yes | Household date/time display |
| `locale`                        |      `LocaleCode` |      Yes | Formatting/language         |
| `homeCity`                      |            String |       No | Place-search bias           |
| `homeRegion`                    |            String |       No | State/province/region       |
| `homeCountryCode`               |            String |       No | Two-letter country code     |
| `accessGroupId`                 |   `AccessGroupId` |      Yes | Unique access group         |
| `status`                        | `HouseholdStatus` |      Yes | Active or archived          |
| shared audit/archive properties |                 — |        — | From `JorbyHouseholdScoped` |

Invariants:

- One unique access group per Household.
- An archived Household has no active Memberships.
- The final active member leaving archives the Household.
- Empty Households remain archived until explicit admin purge.
- Reactivation is a trusted service/admin workflow.

### 5.2 `HouseholdMembership`

Primary key:

```text
membershipId = householdId + ":" + foundryUserId
```

| Property                |               Type | Required | Notes                       |
| ----------------------- | -----------------: | -------: | --------------------------- |
| `membershipId`          |             String |      Yes | Primary key                 |
| `householdId`           |      `HouseholdId` |      Yes | Parent                      |
| `foundryUserId`         |    `FoundryUserId` |      Yes | Authentication identity     |
| `displayName`           |             String |      Yes | App-specific, per Household |
| `avatarUrl`             |                URL |       No | External URL only           |
| `profileColor`          |             String |      Yes | Valid design token/color    |
| `status`                | `MembershipStatus` |      Yes | Lifecycle                   |
| `joinedAt`              |          Timestamp |      Yes | First admission             |
| `leftAt`                |          Timestamp |       No | Voluntary departure         |
| `removedAt`             |          Timestamp |       No | Forced removal              |
| `removedByUserId`       |    `FoundryUserId` |       No | Required for forced removal |
| shared audit properties |                  — |        — | Retained for history        |

Invariants:

- One Membership per Household/user pair.
- A user may have active Memberships in several Households.
- `ACTIVE` means the user belongs to the Household access group.
- `LEFT` or `REMOVED` means access-group membership has been revoked.
- Historical Memberships are retained.
- New assignments/reactions require an active Membership.
- Smart views count only active Memberships.
- Removal releases reservations held by the removed member.

### 5.3 `HouseholdInvite`

Service-only; do not import into the consumer OSDK.

Primary key: `inviteId`, random UUID.

| Property                |            Type | Required |
| ----------------------- | --------------: | -------: |
| `inviteId`              |     UUID string |      Yes |
| `householdId`           |   `HouseholdId` |      Yes |
| `tokenHash`             |          String |      Yes |
| `tokenVersion`          |         Integer |      Yes |
| `createdByMembershipId` |  `MembershipId` |      Yes |
| `createdAt`             |       Timestamp |      Yes |
| `expiresAt`             |       Timestamp |      Yes |
| `status`                |  `InviteStatus` |      Yes |
| `consumedAt`            |       Timestamp |       No |
| `consumedByUserId`      | `FoundryUserId` |       No |
| `revokedAt`             |       Timestamp |       No |
| `revokedByUserId`       | `FoundryUserId` |       No |

Invariants:

- Persist only a cryptographic token hash, never the raw token.
- Invite expires seven days after creation.
- Claim requires an authenticated consumer identity.
- Invite must be active, unexpired, unconsumed, and unrevoked.
- Consume invite, create Membership, and grant group membership atomically or with compensating rollback.
- Claiming as an existing active member is idempotently successful.

## 6. Lists

### 6.1 `SharedList`

Primary key: `listId`, random UUID.

| Property                        |            Type | Required |
| ------------------------------- | --------------: | -------: |
| `listId`                        |     UUID string |      Yes |
| `householdId`                   |   `HouseholdId` |      Yes |
| `accessGroupId`                 | `AccessGroupId` |      Yes |
| `name`                          |          String |      Yes |
| `description`                   |          String |       No |
| `isPinned`                      |         Boolean |      Yes |
| `tagNames`                      |    String array |      Yes |
| `searchText`                    |          String |      Yes |
| shared audit/archive properties |               — |        — |

`displayTitle` maps to `name`.

`searchText` includes normalized name, description, and List Item text.

### 6.2 `ListItem`

Primary key: `listItemId`, random UUID.

| Property                        |            Type | Required | Notes                   |
| ------------------------------- | --------------: | -------: | ----------------------- |
| `listItemId`                    |     UUID string |      Yes | Primary key             |
| `householdId`                   |   `HouseholdId` |      Yes | Derived from List       |
| `accessGroupId`                 | `AccessGroupId` |      Yes | Derived from List       |
| `listId`                        |     UUID string |      Yes | Parent                  |
| `thingId`                       |     UUID string |       No | Optional linked Thing   |
| `text`                          |          String |      Yes | Nonblank                |
| `rank`                          |          String |      Yes | Fractional ordering key |
| `isComplete`                    |         Boolean |      Yes | Default false           |
| `completedAt`                   |       Timestamp |       No | Required when complete  |
| `completedByMembershipId`       |  `MembershipId` |       No | Required when complete  |
| `assigneeMembershipId`          |  `MembershipId` |       No | Null means anyone       |
| shared audit/archive properties |               — |        — | —                       |

Invariants:

- Item and List share Household and access group.
- An optional linked Thing shares the same Household. SDK `0.20.0` does not generate typed `linkedThing` traversal; use the List Item Action `thingId` parameter.
- Active ranks are unique within a List.
- Set completion to a requested final value; do not implement a blind invert.
- Unchecking clears completion metadata.
- Assignee must be active when assigned.
- Item mutation refreshes parent search text and update metadata.
- Duplicate List copies active items in order, preserves assignees, and resets completion.

## 7. Notes

### 7.1 `SharedNote`

Primary key: `noteId`, random UUID.

| Property                        |            Type | Required |
| ------------------------------- | --------------: | -------: |
| `noteId`                        |     UUID string |      Yes |
| `householdId`                   |   `HouseholdId` |      Yes |
| `accessGroupId`                 | `AccessGroupId` |      Yes |
| `title`                         |          String |      Yes |
| `markdownBody`                  |          String |      Yes |
| `tags`                          |    String array |      Yes |
| `searchText`                    |          String |      Yes |
| `lockOwnerMembershipId`         |  `MembershipId` |       No |
| `lockTokenHash`                 |          String |       No |
| `lockAcquiredAt`                |       Timestamp |       No |
| `lockExpiresAt`                 |       Timestamp |       No |
| shared audit/archive properties |               — |        — |

`displayTitle` maps to `title`.

Note-local `tags` normalization:

- Trim whitespace and reject empty values.
- Compare case-insensitively.
- Store normalized lowercase values unless display casing becomes an explicit requirement.

Shared Tag projection: Tag links are the source of truth. `tagNames` holds normalized names of active linked `JorbyTag` objects and is not edited directly. `tags` does not replace `tagNames`.

Lock invariants:

- At most one unexpired lock.
- Lock holder is an active same-Household Membership.
- Lease expires five minutes after the latest successful heartbeat.
- Only lock holder may save or voluntarily release.
- Any active member may acquire an expired lock.
- Save requires valid lock proof and matching expected revision.
- Archive clears lock state.

Note links are many-to-many with Shared Lists, Place Entries, Watch Entries, and Things.

## 7a. Tags

### `JorbyTag`

Primary key: `tagId`, random UUID. Implements `JorbyHouseholdScoped` and is not `JorbyContent`.

| Property           | Type            | Required | Rule                                      |
| ------------------ | --------------- | -------: | ----------------------------------------- |
| `tagId`            | UUID string     |      Yes | Immutable primary key                     |
| `householdId`      | `HouseholdId`   |      Yes | Owning Household                          |
| `accessGroupId`    | `AccessGroupId` |      Yes | Must match Household                      |
| `name`             | String          |      Yes | Household-facing label                    |
| `normalizedName`   | String          |      Yes | Trimmed lowercase uniqueness key          |
| `searchText`       | String          |      Yes | System-maintained                         |

Active Tag names are unique case-insensitively within one Household. `manageJorbyTag` performs `FIND_OR_CREATE`, `RENAME`, and `SET_ARCHIVED`. `manageJorbyTagLinks` performs `ATTACH` or `DETACH` against exactly one Shared List, Shared Note, Thing, Place Entry, or Watch Entry and requires that target's current revision. The target-side link API name is `tagLinks` because `JorbySharedNote` already has a legacy `tags` property. See `implementation-status.md` for Action and link RIDs.

## 8. Places

Planned API names use the `Jorby` prefix. Display names may remain Catalog place, Place entry, Visit, Dish, Place review, and Dish review.

### 8.1 `JorbyCatalogPlace`

Canonical provider snapshot; shared and not Household-private.

Primary key:

```text
catalogPlaceId = primaryProvider + ":" + primaryProviderId
```

| Property                 |               Type | Required |
| ------------------------ | -----------------: | -------: |
| `catalogPlaceId`         |             String |      Yes |
| `primaryProvider`        | `ExternalProvider` |      Yes |
| `primaryProviderId`      |             String |      Yes |
| `externalKeys`           |       String array |      Yes |
| `name`                   |             String |      Yes |
| `formattedAddress`       |             String |       No |
| `location`               |           GeoPoint |       No |
| `mapUrl`                 |                URL |       No |
| `websiteUrl`             |                URL |       No |
| `phoneNumber`            |             String |       No |
| `primaryType`            |             String |       No |
| `types`                  |       String array |      Yes |
| `cuisineTags`            |       String array |      Yes |
| `neighborhood`           |             String |       No |
| `city`                   |             String |       No |
| `region`                 |             String |       No |
| `countryCode`            |             String |       No |
| `providerPhotoReference` |             String |       No |
| `photoAttribution`       |             String |       No |
| `snapshotAt`             |          Timestamp |      Yes |
| `lastRefreshedAt`        |          Timestamp |      Yes |
| `revision`               |            Integer |      Yes |

Invariants:

- One Catalog Place per external provider key.
- Store curated provider fields, not raw response JSON.
- Persist provider photo references and attribution, not secret-bearing URLs.
- `JorbyCatalogPlace` has no household `photo` Attachment. Uploads live only on private Place Entries and Visits.
- Refresh is manual/on-demand.
- Canonical refresh never overwrites Household state.
- Manual Places never create shared canonical records.

### 8.2 `JorbyPlaceEntry`

Primary key: `placeEntryId`, random UUID for both manual and provider-backed entries.

| Property                        |            Type | Required |
| ------------------------------- | --------------: | -------: |
| `placeEntryId`                  |     UUID string |      Yes |
| `householdId`                   |   `HouseholdId` |      Yes |
| `accessGroupId`                 | `AccessGroupId` |      Yes |
| `catalogPlaceId`                |          String |       No |
| `displayTitle`                  |          String |      Yes |
| `isDisplayTitleOverridden`      |         Boolean |      Yes |
| `manualFormattedAddress`        |          String |       No |
| `manualLocation`                |        GeoPoint |       No |
| `manualWebsiteUrl`              |             URL |       No |
| `manualPhoneNumber`             |          String |       No |
| `manualTypes`                   |    String array |      Yes |
| `manualCuisineTags`             |    String array |      Yes |
| `visitState`                    |    `VisitState` |      Yes |
| `isFavorite`                    |         Boolean |      Yes |
| `sharedNote`                    |          String |       No |
| `searchText`                    |          String |      Yes |
| shared audit/archive properties |               — |        — |

Invariants:

- A null `catalogPlaceId` identifies a manual, private Entry.
- Only one active Entry in a Household may reference a given Catalog Place.
- Manual creation requires only a nonblank display title.
- Reconciliation sets the optional canonical key without replacing the Entry ID or history.
- Reconciliation rejects an already-linked canonical duplicate; v1 does not merge histories.
- A correction may replace an incorrect canonical link only when no duplicate results.
- Provider refresh preserves title overrides and all manual fields.
- Re-adding a provider Place restores the existing archived Entry where one exists.
- Favorite requires `BEEN`.
- An active Visit forces `BEEN` and prevents return to `WANT_TO_GO`.
- A Place Review requires `BEEN`; a Visit record is not required.

### 8.3 `JorbyVisit`

Primary key: `visitId`, random UUID.

| Property                        |            Type | Required |
| ------------------------------- | --------------: | -------: |
| `visitId`                       |     UUID string |      Yes |
| `householdId`                   |   `HouseholdId` |      Yes |
| `accessGroupId`                 | `AccessGroupId` |      Yes |
| `placeEntryId`                  |          String |      Yes |
| `visitedOn`                     |      Local date |      Yes |
| `visitNote`                     |          String |       No |
| shared audit/archive properties |               — |        — |

Many-to-many links: `participants` to Membership and `dishes` to Dish.

Invariants:

- At least one same-Household participant.
- Current member is selected by default in the UI.
- Linked Dishes belong to the same Place Entry.
- Visit changes refresh the parent Entry.

### 8.4 `JorbyDish`

Primary key: `dishId`, random UUID.

| Property                        |            Type | Required |
| ------------------------------- | --------------: | -------: |
| `dishId`                        |     UUID string |      Yes |
| `householdId`                   |   `HouseholdId` |      Yes |
| `accessGroupId`                 | `AccessGroupId` |      Yes |
| `placeEntryId`                  |          String |      Yes |
| `name`                          |          String |      Yes |
| `normalizedName`                |          String |      Yes |
| `description`                   |          String |       No |
| shared audit/archive properties |               — |        — |

No two active Dishes under one Place Entry may have the same normalized name.

### 8.5 `JorbyPlaceReview`

Primary key:

```text
placeReviewId = placeEntryId + ":" + membershipId
```

| Property                        |            Type | Required |
| ------------------------------- | --------------: | -------: |
| `placeReviewId`                 |          String |      Yes |
| `householdId`                   |   `HouseholdId` |      Yes |
| `accessGroupId`                 | `AccessGroupId` |      Yes |
| `placeEntryId`                  |          String |      Yes |
| `membershipId`                  |  `MembershipId` |      Yes |
| `ratingHalfStars`               |         Integer |      Yes |
| `reviewText`                    |          String |       No |
| `reviewedAt`                    |       Timestamp |      Yes |
| shared audit/archive properties |               — |        — |

### 8.6 `JorbyDishReview`

Same shape as Place Review, replacing `placeEntryId` with `dishId`.

Primary key:

```text
dishReviewId = dishId + ":" + membershipId
```

Review invariants:

- One current Review per member/subject.
- Re-submission updates the deterministic Review.
- Rating is integer 1 through 10.
- Subject and reviewer share Household.
- Only reviewer revises or archives their Review.
- Inactive-member Reviews remain visible.
- Review changes refresh parent search/update metadata.

The default “we disagree” threshold is a spread of at least 3 half-star units, or 1.5 displayed stars.

## 9. Watch

Planned API names use the `Jorby` prefix.

### 9.1 `JorbyMediaTitle`

Canonical provider snapshot; shared and not Household-private.

Primary key:

```text
mediaTitleId = primaryProvider + ":" + mediaType + ":" + primaryProviderId
```

| Property            |               Type | Required |
| ------------------- | -----------------: | -------: |
| `mediaTitleId`      |             String |      Yes |
| `primaryProvider`   | `ExternalProvider` |      Yes |
| `primaryProviderId` |             String |      Yes |
| `externalKeys`      |       String array |      Yes |
| `mediaType`         |        `MediaType` |      Yes |
| `title`             |             String |      Yes |
| `originalTitle`     |             String |       No |
| `overview`          |             String |       No |
| `releaseYear`       |            Integer |       No |
| `originalLanguage`  |             String |       No |
| `posterPath`        |             String |       No |
| `backdropPath`      |             String |       No |
| `genres`            |       String array |      Yes |
| `seasonCount`       |            Integer |       No |
| `episodeCount`      |            Integer |       No |
| `snapshotAt`        |          Timestamp |      Yes |
| `lastRefreshedAt`   |          Timestamp |      Yes |
| `revision`          |            Integer |      Yes |

Movie rows have null season and episode counts. Store image paths rather than secret-bearing URLs. Manual titles never create shared Media Title objects.

### 9.2 `JorbyWatchEntry`

Primary key: `watchEntryId`, random UUID for both manual and provider-backed entries.

| Property                        |            Type | Required |
| ------------------------------- | --------------: | -------: |
| `watchEntryId`                  |     UUID string |      Yes |
| `householdId`                   |   `HouseholdId` |      Yes |
| `accessGroupId`                 | `AccessGroupId` |      Yes |
| `mediaTitleId`                  |          String |       No |
| `displayTitle`                  |          String |      Yes |
| `isDisplayTitleOverridden`      |         Boolean |      Yes |
| `mediaType`                     |     `MediaType` |      Yes |
| `manualReleaseYear`             |         Integer |       No |
| `manualOverview`                |          String |       No |
| `manualImageUrl`                |             URL |       No |
| `status`                        |   `WatchStatus` |      Yes |
| `lastWatchedSeasonNumber`       |         Integer |       No |
| `lastWatchedEpisodeNumber`      |         Integer |       No |
| `sharedNote`                    |          String |       No |
| `searchText`                    |          String |      Yes |
| shared audit/archive properties |               — |        — |

Progress means the last completed episode.

Invariants:

- A null `mediaTitleId` identifies a manual, private Entry.
- Manual creation requires a nonblank title and media type.
- Only one active Entry in a Household may reference a given Media Title.
- Reconciliation preserves the Entry ID, progress, reactions, links, and history.
- Duplicate canonical reconciliation is rejected rather than merged in v1.
- Provider refresh preserves title overrides and manual fields.
- Movies have null episode progress.
- Show progress requires positive season and episode values; episode requires season.
- Season cannot exceed a known canonical season count.
- Per-season episode bounds are not enforced because v1 has no Episode objects.
- Re-adding an archived provider title restores its existing Entry.
- `WATCHED` may archive outstanding interest-only reactions but preserves Reviews.
- `DROPPED` retains progress.

### 9.3 `JorbyWatchReaction`

Primary key:

```text
watchReactionId = watchEntryId + ":" + membershipId
```

| Property                        |                 Type |    Required |
| ------------------------------- | -------------------: | ----------: |
| `watchReactionId`               |               String |         Yes |
| `householdId`                   |        `HouseholdId` |         Yes |
| `accessGroupId`                 |      `AccessGroupId` |         Yes |
| `watchEntryId`                  |               String |         Yes |
| `membershipId`                  |       `MembershipId` |         Yes |
| `stage`                         | `WatchReactionStage` |         Yes |
| `ratingHalfStars`               |              Integer | Conditional |
| `reviewText`                    |               String |          No |
| `reviewedAt`                    |            Timestamp |          No |
| shared audit/archive properties |                    — |           — |

Invariants:

- `WANTS_TO_WATCH` has no rating or review.
- `REVIEWED` requires rating and reviewed timestamp.
- A rated Review is allowed only while the Entry is `WATCHED` or `DROPPED`.
- Review submission transitions the same reaction object.
- Only the owning member modifies their reaction.
- Everyone-wants is computed server-side when active wants reactions equal active Membership count; missing reactions are never positive.

## 10. Things

### 10.1 `JorbyThing`

Primary key: `thingId`, random UUID.

One Thing represents one physical or intended unit. Identical units are separate Thing objects; v1 has no quantity property.

| Property                        |                  Type | Required | Notes                |
| ------------------------------- | --------------------: | -------: | -------------------- |
| `thingId`                       |           UUID string |      Yes | Primary key          |
| `householdId`                   |         `HouseholdId` |      Yes | —                    |
| `accessGroupId`                 |       `AccessGroupId` |      Yes | —                    |
| `name`                          |                String |      Yes | Display title        |
| `lifecycleState`                | `ThingLifecycleState` |      Yes | Drives lens          |
| `productUrl`                    |                   URL |       No | —                    |
| `priceMinorUnits`               |                  Long |       No | Exact, nonnegative   |
| `priceCurrency`                 |        `CurrencyCode` |       No | Required with price  |
| `recipientKind`                 |       `RecipientKind` |       No | —                    |
| `recipientMembershipId`         |        `MembershipId` |       No | Conditional          |
| `externalRecipientLabel`        |                String |       No | Conditional          |
| `assigneeMembershipId`          |        `MembershipId` |       No | Null means anyone    |
| `category`                      |                String |       No | —                    |
| `storageLocation`               |                String |       No | Home lens            |
| `purchaseDate`                  |            Local date |       No | —                    |
| `warrantyExpiry`                |            Local date |       No | —                    |
| `notes`                         |                String |       No | Shared               |
| `imageUrl`                      |                   URL |       No | External URL only    |
| `reservedByMembershipId`        |        `MembershipId` |       No | Visible to Household |
| `reservedAt`                    |             Timestamp |       No | —                    |
| `searchText`                    |                String |      Yes | Global search        |
| shared audit/archive properties |                     — |        — | —                    |

Lens mapping:

| Lens    | States                              |
| ------- | ----------------------------------- |
| Wish    | `IDEA`, `BUYING`, `BOUGHT`          |
| Home    | `OWNED`, `BROKEN`, `UPGRADE_WANTED` |
| History | `GIFTED`, `SOLD`                    |

Normal transitions:

- `IDEA` → `BUYING`, `BOUGHT`, `OWNED`, or `GIFTED`.
- `BUYING` → `IDEA`, `BOUGHT`, `OWNED`, or `GIFTED`.
- `BOUGHT` → `OWNED` or `GIFTED`.
- `OWNED` → `BROKEN`, `UPGRADE_WANTED`, or `SOLD`.
- `BROKEN` → `OWNED`, `UPGRADE_WANTED`, or `SOLD`.
- `UPGRADE_WANTED` → `OWNED`, `BROKEN`, or `SOLD`.

A separate confirmed correction Action may repair an incorrect state outside the normal graph.

Additional invariants:

- Purchase UI asks: Move to Home, Mark Gifted, or Leave Bought.
- Reservation is allowed only in `IDEA` or `BUYING`.
- Only reserver normally releases it.
- Transition to Bought, Owned, Gifted, or Sold clears reservation.
- Member removal clears their reservation.
- Member recipient requires Membership and no external label.
- External recipient requires label and no Membership.
- Household recipient requires neither.
- Price is optional; `priceMinorUnits` and `priceCurrency` are both absent or both present.
- Minor units are a nonnegative exact integer. TypeScript v2 uses its Long string representation and `BigInt` for arithmetic.
- Price currency is initialized from Household when first entered and then preserved as a snapshot; a later edit replaces the current price.
- Warranty expiry cannot precede purchase date.

## 11. Link types

All links are bidirectional. Names below are the intended OSDK-side API names.

| From                  | Side API              | To                    | Reverse API         | Cardinality      |
| --------------------- | --------------------- | --------------------- | ------------------- | ---------------- |
| `HouseholdMembership` | `household`           | `Household`           | `memberships`       | Many-to-one      |
| `SharedList`          | `household`           | `Household`           | `lists`             | Many-to-one      |
| `SharedNote`          | `household`           | `Household`           | `notes`             | Many-to-one      |
| `PlaceEntry`          | `household`           | `Household`           | `placeEntries`      | Many-to-one      |
| `WatchEntry`          | `household`           | `Household`           | `watchEntries`      | Many-to-one      |
| `Thing`               | `household`           | `Household`           | `things`            | Many-to-one      |
| `ListItem`            | `list`                | `SharedList`          | `items`             | Many-to-one      |
| `ListItem`            | `assignee`            | `HouseholdMembership` | `assignedListItems` | Many-to-zero/one |
| `SharedNote`          | `relatedLists`        | `SharedList`          | `relatedNotes`      | Many-to-many     |
| `SharedNote`          | `relatedPlaces`       | `PlaceEntry`          | `relatedNotes`      | Many-to-many     |
| `SharedNote`          | `relatedWatchEntries` | `WatchEntry`          | `relatedNotes`      | Many-to-many     |
| `SharedNote`          | `relatedThings`       | `Thing`               | `relatedNotes`      | Many-to-many     |
| `PlaceEntry`          | `catalogPlace`        | `CatalogPlace`        | `householdEntries`  | Many-to-zero/one |
| `Visit`               | `placeEntry`          | `PlaceEntry`          | `visits`            | Many-to-one      |
| `Dish`                | `placeEntry`          | `PlaceEntry`          | `dishes`            | Many-to-one      |
| `PlaceReview`         | `placeEntry`          | `PlaceEntry`          | `reviews`           | Many-to-one      |
| `Visit`               | `participants`        | `HouseholdMembership` | `visits`            | Many-to-many     |
| `Visit`               | `dishes`              | `Dish`                | `visits`            | Many-to-many     |
| `DishReview`          | `dish`                | `Dish`                | `reviews`           | Many-to-one      |
| `PlaceReview`         | `reviewer`            | `HouseholdMembership` | `placeReviews`      | Many-to-one      |
| `DishReview`          | `reviewer`            | `HouseholdMembership` | `dishReviews`       | Many-to-one      |
| `WatchEntry`          | `mediaTitle`          | `MediaTitle`          | `householdEntries`  | Many-to-zero/one |
| `WatchReaction`       | `watchEntry`          | `WatchEntry`          | `reactions`         | Many-to-one      |
| `WatchReaction`       | `reviewer`            | `HouseholdMembership` | `watchReactions`    | Many-to-one      |
| `Thing`               | `assignee`            | `HouseholdMembership` | `assignedThings`    | Many-to-zero/one |
| `Thing`               | `recipientMember`     | `HouseholdMembership` | `recipientThings`   | Many-to-zero/one |
| `Thing`               | `reservedBy`          | `HouseholdMembership` | `reservedThings`    | Many-to-zero/one |

Every private-to-private link must satisfy equal `householdId` values. Links from private entries to public canonical provider records are exempt.

## 12. Global search

Global search returns top-level `JorbyContent`, even when a child supplied the match.

| Type         | `searchText` content                                                                          |
| ------------ | --------------------------------------------------------------------------------------------- |
| `SharedList` | Name, description, List Item text                                                             |
| `SharedNote` | Title, Markdown body, tags                                                                    |
| `PlaceEntry` | Place name/address, shared note, Visit notes, Dish names/descriptions, Place and Dish Reviews |
| `WatchEntry` | Title/year, shared note, member Reviews                                                       |
| `Thing`      | Name, recipient label, category, location, notes, useful URL text                             |

Rules:

- Normalize case and whitespace.
- Strip Markdown syntax where practical.
- Exclude IDs, invite secrets, and security metadata.
- Bound generated search text, initially 32 KB.
- Child mutations recompute parent search text.
- Archived top-level records are excluded from normal search.
- Search remains subject to object security policy.

## 13. Cross-cutting security invariants

Preferred access policy:

```text
currentUser.groupIds intersects [object.accessGroupId]
```

Before implementation, validate exact policy operators and trusted-service group-management capabilities in the target enrollment.

Rules:

1. Every private record has non-null `householdId` and `accessGroupId`.
2. Access group matches the referenced Household.
3. Actions derive tenancy fields from an already-authorized parent.
4. Users need an active Membership for consumer edits.
5. The UI filters every query by the selected Household even though row security remains authoritative.
6. Consumers receive only actions-only edit capability.
7. `HouseholdInvite` and admin purge resources are excluded from the browser OSDK.
8. Canonical provider records contain no private Household state.
9. Member removal revokes access-group membership before reporting success.

Fallback if dynamic group provisioning is unavailable:

- Add `authorizedUserIds: FoundryUserId[]` to every private type.
- Policy compares current user ID to that array.
- Membership changes require a complete, verified bulk rewrite of Household records.

Do not adopt the fallback without documenting the operational and consistency costs.

## 14. Archival and purge

- Null `archivedAt` means active.
- Normal Delete actions populate archive metadata.
- Restore clears archive metadata and increments revision.
- Archiving a top-level record does not erase its children.
- Applications do not surface children of archived parents.
- Child archival updates parent search/update metadata.
- Hard purge deletes dependent links and children before parent.
- Hard purge is trusted-service/admin-only.
- Household purge is never automatic.

## 15. Concurrency and idempotency

- Every editable private record has `revision`.
- Overwrite/destructive Actions accept `expectedRevision`.
- Revision mismatch returns a stale-data validation result.
- Desired-state Actions are preferred to blind toggles.
- Subscriptions improve freshness but do not replace concurrency checks.
- Notes additionally require a valid unexpired lock.
- Deterministic-key creates are idempotent.
- Trusted-service endpoints require idempotency keys for create, claim, removal, and leave operations.

## 16. Parent refresh rule

Any child mutation that affects a top-level record updates its parent:

- `updatedAt`
- `updatedByUserId`
- `revision`
- `searchText`

This enables Home recency and global search without an Activity object.

## 17. Derived views, not object types

The concrete per-section views and `JorbyContent`-backed polymorphic query formulations are supported by the deployed Ontology/SDK. `Recent` and global `We should`/search remain frontend work; do not present a global-search UI as implemented until it is built and validated.

| View             | Query definition                                                       |
| ---------------- | ---------------------------------------------------------------------- |
| Recent           | Active `JorbyContent` ordered by `updatedAt DESC`                      |
| Pinned Lists     | Active Lists where `isPinned = true`                                   |
| Unfinished Lists | Lists with at least one active incomplete Item                         |
| Want to go       | Place Entries with `visitState = WANT_TO_GO`                           |
| Favorites        | Place Entries where `isFavorite = true`                                |
| We disagree      | Place Review spread at least 3 half-star units                         |
| Everyone wants   | Active wants reactions equal active Membership count                   |
| Watch tonight    | Everyone-wants entries in `WATCHLIST`                                  |
| Wish             | Thing state in `IDEA`, `BUYING`, `BOUGHT`                              |
| Home inventory   | Thing state in `OWNED`, `BROKEN`, `UPGRADE_WANTED`                     |
| Thing history    | Thing state in `GIFTED`, `SOLD`                                        |
| We should        | Want-to-go Places union everyone-wants Watch Entries union Wish Things |

## 18. OSDK import boundary

### Current consumer SDK (resolved `@jorby/sdk@0.20.0`)

The deployed Developer Console scope and generated package contain:

- 16 concrete object types spanning Household, Lists, Notes, Tags, Places, Watch, and Things.
- 36 imported typed links, including all five Tag links. The List Item → Thing relation is deployed and is not a typed traversal in this SDK.
- 45 consumer Actions. The Ontology contains 56 Actions; the other 11 are outside the browser SDK.
- 6 query Functions: `getJorbyWatchTonight` at `0.6.0`; the other five at `0.5.0`.
- 3 interfaces with 14/5/3 concrete implementations.
- Exactly 70 resource exports across `$Objects`, `$Actions`, `$Queries`, and `$Interfaces`.

The latest edit release is `0.6.1`. Runtime packages are pinned to `@osdk/react@2.73.0`, `@osdk/client@2.73.0`, `@osdk/api@2.73.0`, and `@osdk/oauth@1.13.0`. Do not send `currentUserId` from the browser. The only household upload properties are optional `photo` Attachments on `JorbyThing`, `JorbyPlaceEntry`, and `JorbyVisit`.

### Deployed concrete additions

- Places: `JorbyCatalogPlace`, `JorbyPlaceEntry`, `JorbyVisit`, `JorbyDish`, `JorbyPlaceReview`, and `JorbyDishReview`, with concrete links, governed Actions, and provider-neutral search/detail queries.
- Watch: `JorbyMediaTitle`, `JorbyWatchEntry`, and `JorbyWatchReaction`, with concrete links, governed Actions, provider-neutral queries, and the smart-queue query.
- Things: `JorbyThing`, with its Household/Membership/Note links and governed composite Actions.

Provider Functions implement deterministic `MOCK` plus production `GOOGLE`/`TMDB` adapters. This app uses `GOOGLE` for places and `TMDB` for watch. Canonical Catalog Place and Media Title objects contain no household Attachment.

### Deployed interface layer

`JorbyHouseholdScoped`, `JorbyContent`, and `JorbyMemberReaction` are deployed with 14/5/3 concrete implementations. `JorbyContent` includes `tagNames`. This GitHub app queries the interface for Home and search.

### Action-cap migration

Six legacy List symbols remain unavailable: `archiveJorbySharedList`, `completeJorbyListItem`, `reopenJorbyListItem`, `restoreJorbySharedList`, `updateJorbyListItem`, and `updateJorbySharedList`. Plan B also removed `archiveJorbyListItem`, `assignJorbyListItem`, `clearJorbyListItemAssignment`, `restoreJorbyListItem`, and `restoreJorbySharedNote`, and renamed `archiveJorbySharedNote` to `setJorbySharedNoteArchived`. See `implementation-status.md`.

### Do not import

- `HouseholdInvite`.
- `provisionJorbyHousehold`.
- Administrative purge Actions.
- Trusted membership-service-only Functions.
- Unrestricted edit resources.
- Provider secret or source resources.

## 19. Required pre-build validation

1. Confirm Object Storage v2 and project-based permissions.
2. Confirm group-per-Household provisioning and revocation.
3. Test the object security policy with at least two Households and three users.
4. Test that removed users immediately lose reads and Actions.
5. Confirm all property and link API names before frontend implementation.
6. Confirm interface property/link mappings.
7. Configure Actions-only edits.
8. Create deterministic-key and cross-Household invariant tests.
9. Import only approved resources into the generated SDK.
10. Generate resource-specific OSDK documentation before writing integration code.
