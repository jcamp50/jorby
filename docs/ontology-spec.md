# Jorby v1 ontology specification

**Status:** Living technical specification  
**Last updated:** 2026-09-05  
**Ontology target:** Object Storage v2 with project-based permissions

This document defines Jorby's logical Ontology. API names are provisional until the resources are created and generated OSDK documentation confirms them. Once published, avoid casually renaming active API names; update this specification and plan a migration first.

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

### Interfaces

- `HouseholdScoped`
- `JorbyContent`
- `MemberReaction`

### Object types

| Domain | Object types                                                               |
| ------ | -------------------------------------------------------------------------- |
| Core   | `Household`, `HouseholdMembership`, `HouseholdInvite`                      |
| Lists  | `SharedList`, `ListItem`                                                   |
| Notes  | `SharedNote`                                                               |
| Places | `CatalogPlace`, `PlaceEntry`, `Visit`, `Dish`, `PlaceReview`, `DishReview` |
| Watch  | `MediaTitle`, `WatchEntry`, `WatchReaction`                                |
| Things | `Thing`                                                                    |

Total: 16 concrete object types.

## 3. Reusable value types

Create shared enumeration/value types where supported.

| Value type            | Values or rule                                                                    |
| --------------------- | --------------------------------------------------------------------------------- |
| `HouseholdId`         | UUID string                                                                       |
| `MembershipId`        | Deterministic string                                                              |
| `FoundryUserId`       | Foundry user UUID                                                                 |
| `AccessGroupId`       | Foundry group UUID                                                                |
| `CurrencyCode`        | Uppercase ISO 4217 code                                                           |
| `LocaleCode`          | BCP 47-style locale                                                               |
| `TimezoneId`          | IANA timezone                                                                     |
| `HouseholdStatus`     | `ACTIVE`, `ARCHIVED`                                                              |
| `MembershipStatus`    | `ACTIVE`, `LEFT`, `REMOVED`                                                       |
| `InviteStatus`        | `ACTIVE`, `CONSUMED`, `REVOKED`, `EXPIRED`                                        |
| `VisitState`          | `WANT_TO_GO`, `BEEN`                                                              |
| `ExternalProvider`    | Initially `GOOGLE`, `TMDB`; extensible                                            |
| `MediaType`           | `MOVIE`, `SHOW`                                                                   |
| `WatchStatus`         | `WATCHLIST`, `WATCHING`, `WATCHED`, `DROPPED`                                     |
| `WatchReactionStage`  | `WANTS_TO_WATCH`, `REVIEWED`                                                      |
| `ThingLifecycleState` | `IDEA`, `BUYING`, `BOUGHT`, `OWNED`, `BROKEN`, `UPGRADE_WANTED`, `GIFTED`, `SOLD` |
| `RecipientKind`       | `MEMBER`, `HOUSEHOLD`, `EXTERNAL`                                                 |
| `RatingHalfStars`     | Integer 1 through 10; UI displays value divided by 2                              |

Prefer integer half-star units over floating-point ratings so validation and equality are exact.

## 4. Interfaces

### 4.1 `HouseholdScoped`

Implemented by every consumer-readable private type, including `Household`, but excluding service-only `HouseholdInvite` and public canonical provider types.

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

The interface creates a consistent application API; each concrete type still needs its own tested object security policy.

### 4.2 `JorbyContent`

Implemented by `SharedList`, `SharedNote`, `PlaceEntry`, `WatchEntry`, and `Thing`.

| Property       |  Logical type | Required | Purpose                      |
| -------------- | ------------: | -------: | ---------------------------- |
| `contentId`    |        String |      Yes | Maps to concrete primary key |
| `householdId`  | `HouseholdId` |      Yes | Household filtering          |
| `displayTitle` |        String |      Yes | Cross-section display        |
| `searchText`   |        String |      Yes | Denormalized search document |
| `updatedAt`    |     Timestamp |      Yes | Recent ordering              |
| `archivedAt`   |     Timestamp |       No | Normal exclusion             |

Link constraints:

| Link API       | Target       | Cardinality | Required |
| -------------- | ------------ | ----------: | -------: |
| `household`    | `Household`  |         One |      Yes |
| `relatedNotes` | `SharedNote` |        Many |       No |

`SharedNote` may leave `relatedNotes` unmapped.

### 4.3 `MemberReaction`

Implemented by `PlaceReview`, `DishReview`, and `WatchReaction`.

| Property          |   Logical type |    Required |
| ----------------- | -------------: | ----------: |
| `reactionId`      |         String |         Yes |
| `householdId`     |  `HouseholdId` |         Yes |
| `membershipId`    | `MembershipId` |         Yes |
| `ratingHalfStars` |        Integer | Conditional |
| `reviewText`      |         String |          No |
| `updatedAt`       |      Timestamp |         Yes |
| `archivedAt`      |      Timestamp |          No |

Required link constraint: `reviewer` points to exactly one `HouseholdMembership`.

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
| shared audit/archive properties |                 — |        — | From `HouseholdScoped`      |

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
| `text`                          |          String |      Yes | Nonblank                |
| `rank`                          |          String |      Yes | Fractional ordering key |
| `isComplete`                    |         Boolean |      Yes | Default false           |
| `completedAt`                   |       Timestamp |       No | Required when complete  |
| `completedByMembershipId`       |  `MembershipId` |       No | Required when complete  |
| `assigneeMembershipId`          |  `MembershipId` |       No | Null means anyone       |
| shared audit/archive properties |               — |        — | —                       |

Invariants:

- Item and List share Household and access group.
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

Tag normalization:

- Trim whitespace.
- Reject empty values.
- Compare case-insensitively.
- Store normalized lowercase values unless display casing becomes an explicit requirement.

Lock invariants:

- At most one unexpired lock.
- Lock holder is an active same-Household Membership.
- Lease expires five minutes after the latest successful heartbeat.
- Only lock holder may save or voluntarily release.
- Any active member may acquire an expired lock.
- Save requires valid lock proof and matching expected revision.
- Archive clears lock state.

Note links are many-to-many with Shared Lists, Place Entries, Watch Entries, and Things.

## 8. Places

### 8.1 `CatalogPlace`

Canonical provider snapshot; not Household-private.

Primary key:

```text
catalogPlaceId = "GOOGLE:" + providerPlaceId
```

The key remains an opaque stable internal identity even if a future provider becomes primary.

| Property                 |               Type | Required |
| ------------------------ | -----------------: | -------: |
| `catalogPlaceId`         |             String |      Yes |
| `primaryProvider`        | `ExternalProvider` |      Yes |
| `primaryProviderId`      |             String |      Yes |
| `externalKeys`           |       String array |      Yes |
| `name`                   |             String |      Yes |
| `formattedAddress`       |             String |       No |
| `latitude`               |             Double |       No |
| `longitude`              |             Double |       No |
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
- Persist photo references/attribution, not secret-bearing URLs.
- Refresh is manual/on-demand.
- Canonical refresh never overwrites Household state.

### 8.2 `PlaceEntry`

Primary key:

```text
placeEntryId = householdId + ":" + catalogPlaceId
```

| Property                        |            Type | Required |
| ------------------------------- | --------------: | -------: |
| `placeEntryId`                  |          String |      Yes |
| `householdId`                   |   `HouseholdId` |      Yes |
| `accessGroupId`                 | `AccessGroupId` |      Yes |
| `catalogPlaceId`                |          String |      Yes |
| `displayTitle`                  |          String |      Yes |
| `visitState`                    |    `VisitState` |      Yes |
| `isFavorite`                    |         Boolean |      Yes |
| `sharedNote`                    |          String |       No |
| `searchText`                    |          String |      Yes |
| shared audit/archive properties |               — |        — |

Invariants:

- One Place Entry per Household/Catalog Place.
- Re-adding an archived Place restores the same entry.
- Favorite requires `BEEN`.
- An active Visit forces `BEEN`.
- A Place with an active Visit cannot return to `WANT_TO_GO`.
- First Visit automatically changes state to `BEEN`.

### 8.3 `Visit`

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

- At least one participant.
- Participants belong to the Visit Household.
- Current member is selected by default in the UI.
- Linked Dishes belong to the same Place Entry.
- Visit changes refresh the parent entry.

### 8.4 `Dish`

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

### 8.5 `PlaceReview`

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

### 8.6 `DishReview`

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

### 9.1 `MediaTitle`

Canonical TMDB snapshot.

Primary key:

```text
mediaTitleId = "TMDB:" + mediaType + ":" + tmdbId
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

Movie rows have null season and episode counts. Store image paths rather than secret-bearing URLs.

### 9.2 `WatchEntry`

Primary key:

```text
watchEntryId = householdId + ":" + mediaTitleId
```

| Property                        |            Type | Required |
| ------------------------------- | --------------: | -------: |
| `watchEntryId`                  |          String |      Yes |
| `householdId`                   |   `HouseholdId` |      Yes |
| `accessGroupId`                 | `AccessGroupId` |      Yes |
| `mediaTitleId`                  |          String |      Yes |
| `displayTitle`                  |          String |      Yes |
| `status`                        |   `WatchStatus` |      Yes |
| `lastWatchedSeasonNumber`       |         Integer |       No |
| `lastWatchedEpisodeNumber`      |         Integer |       No |
| `sharedNote`                    |          String |       No |
| `searchText`                    |          String |      Yes |
| shared audit/archive properties |               — |        — |

Progress means the last completed episode.

Invariants:

- Movies have null episode progress.
- Episode requires a season.
- Progress values are positive and do not exceed known provider bounds.
- One Watch Entry per Household/Media Title.
- Re-adding an archived title restores it.
- `WATCHED` may archive outstanding interest-only reactions but preserves Reviews.
- `DROPPED` retains progress.

### 9.3 `WatchReaction`

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
| `reviewedAt`                    |            Timestamp |       No |
| shared audit/archive properties |                    — |           — |

Invariants:

- `WANTS_TO_WATCH` has no rating/review.
- `REVIEWED` requires rating and reviewed timestamp.
- Review submission transitions the same reaction object.
- Only the owning member modifies their reaction.
- Everyone-wants is true when active interest reactions equal active Membership count.

## 10. Things

### 10.1 `Thing`

Primary key: `thingId`, random UUID.

| Property                        |                  Type | Required | Notes                |
| ------------------------------- | --------------------: | -------: | -------------------- |
| `thingId`                       |           UUID string |      Yes | Primary key          |
| `householdId`                   |         `HouseholdId` |      Yes | —                    |
| `accessGroupId`                 |       `AccessGroupId` |      Yes | —                    |
| `name`                          |                String |      Yes | Display title        |
| `lifecycleState`                | `ThingLifecycleState` |      Yes | Drives lens          |
| `productUrl`                    |                   URL |       No | —                    |
| `priceAmount`                   |               Decimal |       No | Nonnegative          |
| `priceCurrency`                 |        `CurrencyCode` |       No | Snapshot             |
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
- Price currency is initialized from Household and then preserved.
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
| `PlaceEntry`          | `catalogPlace`        | `CatalogPlace`        | `householdEntries`  | Many-to-one      |
| `Visit`               | `placeEntry`          | `PlaceEntry`          | `visits`            | Many-to-one      |
| `Dish`                | `placeEntry`          | `PlaceEntry`          | `dishes`            | Many-to-one      |
| `PlaceReview`         | `placeEntry`          | `PlaceEntry`          | `reviews`           | Many-to-one      |
| `Visit`               | `participants`        | `HouseholdMembership` | `visits`            | Many-to-many     |
| `Visit`               | `dishes`              | `Dish`                | `visits`            | Many-to-many     |
| `DishReview`          | `dish`                | `Dish`                | `reviews`           | Many-to-one      |
| `PlaceReview`         | `reviewer`            | `HouseholdMembership` | `placeReviews`      | Many-to-one      |
| `DishReview`          | `reviewer`            | `HouseholdMembership` | `dishReviews`       | Many-to-one      |
| `WatchEntry`          | `mediaTitle`          | `MediaTitle`          | `householdEntries`  | Many-to-one      |
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

Import into the consumer application SDK:

- `Household`
- `HouseholdMembership`
- all five top-level content types
- child types required by screens
- `CatalogPlace` and `MediaTitle`
- the three interfaces
- approved consumer Actions
- provider search/detail Functions

Do not import:

- `HouseholdInvite`
- administrative purge Actions
- trusted membership-service-only Functions
- unrestricted edit resources
- secret/source resources

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
