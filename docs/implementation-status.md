# Jorby implementation status

**Status:** Living implementation record
**Last updated:** 2026-09-30
**Current consumer SDK:** resolved `@jorby/sdk@0.20.0`
**Current Functions edit release:** `0.6.1`

This document records deployed truth. Product intent remains in `product-decisions.md`; the complete logical model remains in `ontology-spec.md`. Ontology, Actions, Functions, and object security are implemented in Foundry, not in this GitHub repository.

## Executive summary

The Household, Lists, Notes, Tags, Places, Watch, and Things concrete Ontology slices and governed Actions are deployed. The resolved generated consumer package is `@jorby/sdk@0.20.0`: **16 objects, 45 consumer Actions, 6 query Functions, 3 interfaces, and exactly 70 top-level boundary resources**. Generated object definitions expose 36 imported links, including all five Tag links. The exact runtime is `@osdk/react`, `@osdk/client`, and `@osdk/api` `2.73.0` plus `@osdk/oauth` `1.13.0`. The Ontology contains **56 Actions total**; the consumer SDK imports 45. The latest published edit Function release is `0.6.1`. Every consumer Action derives trusted actor identity from Action context. The browser never supplies `currentUserId`. Public OAuth/PKCE and local CORS work with the external consumer PWA.

`JorbyHouseholdScoped`, `JorbyContent`, and `JorbyMemberReaction` are deployed with 14/5/3 concrete implementations. `JorbyContent` exposes denormalized `tagNames`; Tag links are authoritative. `JorbyTag`, five Tag links, `manageJorbyTag`, and `manageJorbyTagLinks` are deployed. The List Item → Thing link is deployed in the Ontology but is not generated as typed traversal in SDK `0.20.0`. Provider Functions import `GooglePlaces`, `Tmdb`, and `TmdbImage` egress and implement production `GOOGLE` and `TMDB` adapters alongside `MOCK`. The narrow media exception is optional `photo` on Thing, Place Entry, and Visit.

The enrollment still does not support OAuth Client Credentials/Application permissions. Household membership is manually administered through one internal Foundry group per Household. Automated invite, join, leave, and group-management workflows remain blocked or require a future security-model redesign.

## This GitHub frontend

This repository consumes the consumer SDK from `apps/web` only. `apps/web/src/osdk/resources.ts` is the browser import boundary and must export exactly the union of generated `$Objects`, `$Actions`, `$Queries`, and `$Interfaces` (70 resource exports). Infrastructure namespace objects and metadata (`$Objects`, `$Actions`, `$Queries`, `$Interfaces`, `$osdkMetadata`, `$branch`, and `$ontologyRid`) are not part of the browser boundary.

Live household screens query concrete Lists, Notes, Places, Watch, and Things objects and the `JorbyContent` interface. Note archive calls `setJorbySharedNoteArchived`. `useMyMembership` still calls `getMyMembership`, which remains the identity-dependent query limitation and may 403. Search filters by content type and `tagNames`. Tag create/rename/archive, Tag attach/detach, Thing/Place Entry/Visit photo upload, and List Item `thingId` selection are in the SDK and not yet in the UI. Live place search uses `GOOGLE` and live watch search uses `TMDB`. `MOCK` remains for deterministic tests. Seeded prototype catalog and Finance numbers remain allowed only on `/our-home/…`.

Seeded prototype catalog and Finance numbers remain allowed only on `/our-home/…`. Live Foundry households must not show that mock data. Finance stays a household-tied mock app mode with no Foundry money objects.

## Live Household

| Field              | Current value                          |
| ------------------ | -------------------------------------- |
| Household          | `Jordan & Abby`                        |
| Household ID       | `6d7f2790-1bde-4baa-b63d-3a2fbdb906c8` |
| Status             | `ACTIVE`                               |
| Access group       | `Jorby Household`                      |
| Active Memberships | Jordan                                 |
| Default currency   | `USD`                                  |
| Timezone           | `America/New_York`                     |
| Locale             | `en-US`                                |
| Home location      | Washington, DC, US                     |

Abby does not yet have a durable Membership. Under the current manual model, add Abby's Foundry consumer identity to `Jorby Household`, then create the corresponding `JorbyHouseholdMembership`.

## Authentication and hosting

### Working

- Public Developer Console client using Authorization Code Grant with PKCE.
- Local callback `http://localhost:8080/auth/callback` and matching CORS origin.
- No browser client secret and no `FOUNDRY_TOKEN` in the browser bundle.
- External frontend hosting remains the production direction.

### Enrollment limitation

The enrollment does not support Client Credentials. Therefore no confidential Application-permissions membership service exists, no dedicated service user is available, and personal tokens are not a production substitute. Service-only provisioning, group management, membership administration, hard purge, provider credentials, and source resources must remain outside the consumer SDK.

## Exact consumer SDK contract

```text
@jorby/sdk     0.20.0 (resolved)
@osdk/react    2.73.0
@osdk/client   2.73.0
@osdk/api      2.73.0
@osdk/oauth    1.13.0
```

`src/osdk/resources.ts` exports exactly the union of generated `$Objects`, `$Actions`, `$Queries`, and `$Interfaces`: 70 resource exports.

### Object types — deployed (16)

| Generated export           | Object type RID                                                     |
| -------------------------- | ------------------------------------------------------------------- |
| `JorbyCatalogPlace`        | `ri.ontology.main.object-type.28a1912f-dce5-4025-96f3-98b97ce9d5bc` |
| `JorbyDish`                | `ri.ontology.main.object-type.f35346cb-9234-4c65-9f2c-1182cfc13e55` |
| `JorbyDishReview`          | `ri.ontology.main.object-type.1fecf2b3-e189-47a4-9491-8c01e23bfd3f` |
| `JorbyHousehold`           | `ri.ontology.main.object-type.5fe176fc-cafb-456a-bcf1-2ad89ecc42a9` |
| `JorbyHouseholdMembership` | `ri.ontology.main.object-type.54ee48af-7c06-4c26-a416-57e1a8e37ed5` |
| `JorbyListItem`            | `ri.ontology.main.object-type.ac72a99d-a56c-4027-92ff-957ad2b5cf7b` |
| `JorbyMediaTitle`          | `ri.ontology.main.object-type.30ffa031-0e26-4bfb-9681-ec2d727521e8` |
| `JorbyPlaceEntry`          | `ri.ontology.main.object-type.2831d586-2294-40d7-ba6a-4235b7da271e` |
| `JorbyPlaceReview`         | `ri.ontology.main.object-type.3f0bcc49-e6b1-42ed-89b9-439c72ea07fe` |
| `JorbySharedList`          | `ri.ontology.main.object-type.fe252ddb-870e-4b4a-acc9-34fc34a7bdba` |
| `JorbySharedNote`          | `ri.ontology.main.object-type.a8fbb320-cca1-4ba4-954d-9bb4574f6474` |
| `JorbyTag`                 | `ri.ontology.main.object-type.c07cf151-48a5-4ccf-8639-1fc3ceacdace` |
| `JorbyThing`               | `ri.ontology.main.object-type.de7038fb-aa55-4716-8874-4ef7ba0bf5d9` |
| `JorbyVisit`               | `ri.ontology.main.object-type.6795f54f-a5da-42a8-a2b1-13ca4b023e90` |
| `JorbyWatchEntry`          | `ri.ontology.main.object-type.2085fd61-b22c-42b4-9d0b-39722c3cd7d6` |
| `JorbyWatchReaction`       | `ri.ontology.main.object-type.30a1223d-bbc0-460f-87ef-2bd42092303e` |

The generated object definitions expose 36 imported links, including all five Tag links. The List Item → Thing link (`ri.ontology.main.relation.94c3dfb7-b410-4e6e-8e32-a09decf5ff24`) is deployed in the Ontology and is not in the SDK `0.20.0` imported-link set. Browser code must use List Item Actions and `thingId`, not typed `linkedThing` traversal.

| Deployed Tag relationship | Link RID                                                         |
| ------------------------- | ---------------------------------------------------------------- |
| Tag ↔ Shared List         | `ri.ontology.main.relation.5b35448a-8704-450e-a232-56c1182deba9` |
| Tag ↔ Shared Note         | `ri.ontology.main.relation.df6da6db-5869-4f47-be4f-3287a8c3f652` |
| Tag ↔ Thing               | `ri.ontology.main.relation.f66cf77d-3d80-4753-8fa5-3751eef6ff5d` |
| Tag ↔ Place Entry         | `ri.ontology.main.relation.676b9df9-4b05-4e88-96de-a2e54af3685b` |
| Tag ↔ Watch Entry         | `ri.ontology.main.relation.6f3f3035-e531-4e11-b426-814c71fa91c9` |

### Interfaces — deployed (3)

| Generated export         | Interface RID                                                     | Concrete implementations |
| ------------------------ | ----------------------------------------------------------------- | -----------------------: |
| `JorbyHouseholdScoped`   | `ri.ontology.main.interface.c062bcf2-76a2-4398-9167-4f4e4287e31e` |                       14 |
| `JorbyContent`           | `ri.ontology.main.interface.3cae8e8a-2f52-4164-a2ad-c04ce5364c70` |                        5 |
| `JorbyMemberReaction`    | `ri.ontology.main.interface.38ed317e-d0d3-4fb7-a02c-d4955d808c91` |                        3 |

`JorbyContent` still has exactly five implementations and now includes denormalized `tagNames`. This GitHub app queries it for Home and search. Search can require selected `tagNames` and, when a type is chosen, reads that concrete object instead.

### Consumer Actions — deployed (45)

| Generated export                 | Action type RID                                                    |
| -------------------------------- | ------------------------------------------------------------------ |
| `acquireJorbySharedNoteLock`     | `ri.actions.main.action-type.3672157e-ba46-4472-b62a-0b8023accff8` |
| `addJorbyListItem`               | `ri.actions.main.action-type.fe7eabaf-6a96-4a29-bed3-1303e83bdab9` |
| `addJorbyListItemAtPosition`     | `ri.actions.main.action-type.aacb19ec-e4e1-4065-a223-5aa53cb12584` |
| `correctJorbyPlaceProviderMatch` | `ri.actions.main.action-type.33c46d14-b674-41df-b1a3-441bbeff2b90` |
| `createJorbyManualPlace`         | `ri.actions.main.action-type.ece47441-c6c4-4608-8b50-6840627a67e6` |
| `createJorbyManualWatchEntry`    | `ri.actions.main.action-type.58cb72bc-22f4-426c-acc4-0b682cb45199` |
| `createJorbySharedList`          | `ri.actions.main.action-type.694b5948-ba57-4fd0-ac7a-ef08850457b2` |
| `createJorbySharedNote`          | `ri.actions.main.action-type.cfa6c486-dcd8-4e23-9258-4a301fa1f1fb` |
| `createJorbyThing`               | `ri.actions.main.action-type.fe4ec5ef-78b9-4ab2-97ca-e0271e6b3b8c` |
| `duplicateJorbySharedList`       | `ri.actions.main.action-type.919e316f-3f0f-41f6-803d-b25200115e7f` |
| `heartbeatJorbySharedNoteLock`   | `ri.actions.main.action-type.ceda179d-37e9-4f69-b4f2-d9b9baf9544e` |
| `manageJorbyPlaceReviews`        | `ri.actions.main.action-type.00114fc7-2477-4fcd-9aba-130ea72c091f` |
| `manageJorbyTag`                 | `ri.actions.main.action-type.f90aae0e-de1a-4834-91e8-7c22e312d2c9` |
| `manageJorbyTagLinks`            | `ri.actions.main.action-type.afcc1fb7-8f11-48f3-a923-107d2e221c89` |
| `manageJorbyThingDetails`        | `ri.actions.main.action-type.958d83a2-2c9b-43b0-9349-091cfef1a2e5` |
| `manageJorbyThingLifecycle`      | `ri.actions.main.action-type.952d8c20-92e8-4d2d-8b59-4aafa7d185a9` |
| `manageJorbyThingReservation`    | `ri.actions.main.action-type.969afed9-d2c5-4adb-94cd-9db72f01126b` |
| `manageJorbyWatchProvider`       | `ri.actions.main.action-type.9c04b9e8-cbe3-42c7-8c8c-0a1348c2d6d2` |
| `manageJorbyWatchReaction`       | `ri.actions.main.action-type.c7f49236-b41c-47cf-9966-0baff2f2ebf4` |
| `reconcileJorbyPlaceEntry`       | `ri.actions.main.action-type.e46adf3c-8874-4c90-9004-e34850ad102a` |
| `reconcileJorbyWatchEntry`       | `ri.actions.main.action-type.55fd19e8-5549-489a-b48b-7aed1d2c9b47` |
| `refreshJorbyCatalogPlace`       | `ri.actions.main.action-type.a5395484-457b-46e9-bd68-ea8465cba8c9` |
| `releaseJorbySharedNoteLock`     | `ri.actions.main.action-type.37663028-c301-4526-b7bb-bdf0ed67f675` |
| `saveJorbyDish`                  | `ri.actions.main.action-type.e39a7568-6b5d-47ed-b9e1-8319de2952af` |
| `saveJorbyListItem`              | `ri.actions.main.action-type.c6e1a1f8-cf6a-44b8-9218-ed2397ecc054` |
| `saveJorbyPlaceEntry`            | `ri.actions.main.action-type.74024713-bee1-4b75-a17a-a7c9d818a4e0` |
| `saveJorbyProviderPlace`         | `ri.actions.main.action-type.14892669-807d-45e8-a166-26b6d02e20c7` |
| `saveJorbySharedList`            | `ri.actions.main.action-type.1b207b65-7e5c-4233-a25c-b6067b914861` |
| `saveJorbySharedNote`            | `ri.actions.main.action-type.9fa6752d-121a-44fa-9ace-e1c430fbd7a3` |
| `saveJorbyVisit`                 | `ri.actions.main.action-type.3bd20526-7b46-4880-8b01-c1bb4ea4bbcd` |
| `saveJorbyWatchEntry`            | `ri.actions.main.action-type.f503558f-4180-4194-940c-d801f4d4c50d` |
| `setJorbyDishArchived`           | `ri.actions.main.action-type.c9f457d2-6a58-45d9-95f7-e505aca42164` |
| `setJorbyListItemArchived`       | `ri.actions.main.action-type.6c6976a2-7b6f-4559-a7f4-f653b3e00a6f` |
| `setJorbyListItemAssignee`       | `ri.actions.main.action-type.abffeef6-b5a3-4c06-ac52-13c32da34f21` |
| `setJorbyListItemCompletion`     | `ri.actions.main.action-type.8afd5cad-16d5-44ce-b94b-7668ea78cd50` |
| `setJorbyPlaceEntryArchived`     | `ri.actions.main.action-type.1404c037-1e91-4722-b0dc-89cf2bbc591d` |
| `setJorbySharedListArchived`     | `ri.actions.main.action-type.c812e15f-9f8d-4e8a-a101-56f6f837fd6e` |
| `setJorbySharedNoteArchived`     | `ri.actions.main.action-type.aa05f99b-e2ce-4a64-9e93-8bee0a078228` |
| `setJorbyVisitArchived`          | `ri.actions.main.action-type.38e1e02d-52f7-4f9e-bbff-33297786ea9c` |
| `setJorbyVisitDishes`            | `ri.actions.main.action-type.3ae0a4ff-e8c9-4ec1-9ed7-3c718378fcfa` |
| `setJorbyVisitParticipants`      | `ri.actions.main.action-type.56c9a340-8eb7-4ff6-8df9-72c533e195f1` |
| `setJorbyWatchEntryArchived`     | `ri.actions.main.action-type.324d9751-3f34-46b2-8794-c8317cff01b3` |
| `setJorbyWatchProgress`          | `ri.actions.main.action-type.89fcbdf8-8af0-42c6-8b5d-b44f427b3f4d` |
| `setJorbyWatchReactionArchived`  | `ri.actions.main.action-type.caad751b-99b8-4465-a7a6-467b17c277a3` |
| `setJorbyWatchStatus`            | `ri.actions.main.action-type.e1388b91-0b56-4430-a767-2bd1f4b9b703` |

### Query Functions — deployed (6)

| Generated export            | Version | Function RID                                                              |
| --------------------------- | ------- | ------------------------------------------------------------------------- |
| `getJorbyMediaTitleDetails` | `0.5.0` | `ri.function-registry.main.function.f513bb7e-fc79-403f-9baa-57d5fb08b870` |
| `getJorbyPlaceDetails`      | `0.5.0` | `ri.function-registry.main.function.2fb09562-b318-4dcd-8884-37775aacab50` |
| `getJorbyWatchTonight`      | `0.6.0` | `ri.function-registry.main.function.2b1e66a7-6f5e-4702-b024-44f08b160104` |
| `getMyMembership`           | `0.5.0` | `ri.function-registry.main.function.4475dfd5-e03e-4a0e-8456-2eadda3cc280` |
| `searchJorbyMediaTitles`    | `0.5.0` | `ri.function-registry.main.function.286b77e7-bff9-4053-9ea4-230ddc561089` |
| `searchJorbyPlaces`         | `0.5.0` | `ri.function-registry.main.function.1854643e-3c5c-4d23-99f1-0c7cb9dd930e` |

`getJorbyWatchTonight` is `0.6.0`. The other five queries remain `0.5.0`. `getMyMembership(householdId)` is the sole identity-dependent direct-query limitation. This React app still calls it for the current member on Home, Notes, Places, Watch, Things, and Finance. It may still return 403. The four Places/Watch queries implement deterministic `MOCK` plus real `GOOGLE`/`TMDB` adapters. This app sends `GOOGLE` for places and `TMDB` for watch. Detail lookups use the saved object's `primaryProvider`.

Do not send `currentUserId` on any consumer Action. Browser OAuth stays on `api:use-ontologies-read` and `api:use-ontologies-write`. Do not add Admin scopes.

## Deployed versus planned

| Domain                     | Status                                     | Current truth                                                                                               |
| -------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Household / Membership     | Deployed; membership manually administered | Concrete objects, security, current-user resolver                                                           |
| Lists / Notes              | Deployed                                   | Concrete objects, links, governed Actions, Note lock lifecycle; optional List Item `thingId`                |
| Tags                       | **Deployed**                               | `JorbyTag`, five Tag links, two composite Actions, and `JorbyContent.tagNames`                              |
| Places                     | Deployed concrete slice                    | 6 objects, concrete links/Actions, provider queries, optional Place Entry/Visit `photo`                     |
| Watch                      | Deployed concrete slice                    | 3 objects, concrete links/Actions, provider queries; canonical Media Title has no household media           |
| Things                     | Deployed concrete slice                    | 1 object, composite Actions, optional `photo` Attachment                                                    |
| Interfaces                 | **Deployed**                               | `JorbyHouseholdScoped`, `JorbyContent`, and `JorbyMemberReaction`; 14/5/3 concrete implementations          |
| Global polymorphic search  | **Enabled in Ontology/SDK**                | `JorbyContent` search can filter by content type and `tagNames`                                             |
| Real provider integrations | **Production**                             | This app uses `GOOGLE` for places and `TMDB` for watch; `MOCK` stays on deterministic tests                 |
| Money / Together           | Out of v1 Foundry                          | No backend resources. This repo still has a household-tied Finance mock UI (`D-MONEY-*`)                    |

All deployed private object types use Object Storage v2 edit-only properties and a Household `accessGroupId` security discriminator.

## 60-Action cap and legacy List migration

The enrollment permits at most 60 Action types. To fit the deployed Places, Watch, and Things surface, six legacy List Action RIDs were deliberately repurposed into the six current composite Actions below:

| Current composite Action      | Repurposed RID                                                     |
| ----------------------------- | ------------------------------------------------------------------ |
| `manageJorbyPlaceReviews`     | `ri.actions.main.action-type.00114fc7-2477-4fcd-9aba-130ea72c091f` |
| `manageJorbyThingDetails`     | `ri.actions.main.action-type.958d83a2-2c9b-43b0-9349-091cfef1a2e5` |
| `manageJorbyThingLifecycle`   | `ri.actions.main.action-type.952d8c20-92e8-4d2d-8b59-4aafa7d185a9` |
| `manageJorbyThingReservation` | `ri.actions.main.action-type.969afed9-d2c5-4adb-94cd-9db72f01126b` |
| `manageJorbyWatchProvider`    | `ri.actions.main.action-type.9c04b9e8-cbe3-42c7-8c8c-0a1348c2d6d2` |
| `manageJorbyWatchReaction`    | `ri.actions.main.action-type.c7f49236-b41c-47cf-9966-0baff2f2ebf4` |

Accordingly, these six legacy SDK symbols no longer exist and must not be imported: `archiveJorbySharedList`, `completeJorbyListItem`, `reopenJorbyListItem`, `restoreJorbySharedList`, `updateJorbyListItem`, and `updateJorbySharedList`.

Plan B then deleted five more Action types and repurposed `archiveJorbySharedNote` as `setJorbySharedNoteArchived`:

| Plan B outcome                  | Old generated symbol                                    | Action type RID                                                    |
| ------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------ |
| Deleted                         | `archiveJorbyListItem`                                  | `ri.actions.main.action-type.2b27850f-7e07-4b45-baf5-601fcafb2845` |
| Deleted                         | `assignJorbyListItem`                                   | `ri.actions.main.action-type.7250fb22-a6d1-4720-a3d0-2f0dd4e42a4e` |
| Deleted                         | `clearJorbyListItemAssignment`                          | `ri.actions.main.action-type.895820a3-e985-4d8f-8d23-0c552dcaf783` |
| Deleted                         | `restoreJorbyListItem`                                  | `ri.actions.main.action-type.ebf62f60-0729-4616-963d-e1e613d6b5f9` |
| Deleted                         | `restoreJorbySharedNote`                                | `ri.actions.main.action-type.4139000e-ce58-4dc6-ba3e-b65bbf97615a` |
| Repurposed/renamed, not deleted | `archiveJorbySharedNote` → `setJorbySharedNoteArchived` | `ri.actions.main.action-type.aa05f99b-e2ce-4a64-9e93-8bee0a078228` |

Those six old symbols are absent from `@jorby/sdk@0.20.0`. Use `setJorbyListItemArchived`, `setJorbyListItemAssignee`, and `setJorbySharedNoteArchived`.

## Tag workflow contract

- `manageJorbyTag` supports `FIND_OR_CREATE`, `RENAME`, and `SET_ARCHIVED`.
- `manageJorbyTagLinks` supports `ATTACH`/`DETACH` against exactly one Shared List, Shared Note, Thing, Place Entry, or Watch Entry, with that target's current revision.
- Tag links are authoritative. The Action updates the target's `tagNames`, `searchText`, audit fields, and revision.
- `JorbySharedNote.tags` remains the separate Note-local free-form tag array.
- Browser callers never supply `currentUserId`.

## Photo Attachment contract

The property API name is `photo`, type `Attachment`, optional on `JorbyThing`, `JorbyPlaceEntry`, and `JorbyVisit`. Canonical Catalog Place and Media Title objects have no household Attachment.

Upload or replace with `createAttachmentUpload` from `@osdk/client`: `manageJorbyThingDetails` operation `SET_PHOTO`, or the `photo` parameter on `saveJorbyPlaceEntry` / `saveJorbyVisit`. Clear with `CLEAR_PHOTO` or `clearPhoto: true`, and never send both. JPEG, PNG, and WebP up to 10 MB are accepted. HEIC/HEIF must be converted in the frontend or the Action fails closed. This UI is not built yet.

## Notes collaboration contract

Shared Notes retain explicit Save and a renewable five-minute Membership-owned edit lease:

1. Acquire a lock and observe it through the object subscription.
2. Edit locally with unsaved-change protection.
3. Heartbeat approximately every two minutes.
4. Save with the content revision observed by the editor.
5. Continue editing or release the lock.

Save requires the authenticated member's unexpired lease. Heartbeat does not change content revision; archive clears lock state; expiry recovers from browser crashes.

## Validation and remaining risks

Validated before this consumer migration:

- Public login/callback and local CORS.
- Group-based Household object security and active Membership resolution.
- Household, Lists, Notes, Places, Watch, and Things concrete Ontology resources and Actions deployed.
- Functions diagnostics/publication through edit release `0.6.1`.
- SDK `0.20.0` generated with exact 16/45/6/3 namespace counts, 36 imported links, 70 boundary exports, and 14/5/3 interface implementations.
- Action identity comes from trusted Action context. The browser does not supply `currentUserId`.

Remaining risks:

1. Membership/group administration remains manual and only one active Membership currently exists.
2. Global search filters by content type and `tagNames`. Tag create/rename/attach is still not in the UI.
3. Live place and watch search use `GOOGLE` and `TMDB`. `MOCK` stays on deterministic tests.
4. Shared Note Actions remain experimental.
5. Photo upload/replace/clear UX is not built. HEIC/HEIF needs frontend conversion or fails safely.
6. The List Item → Thing link is not a typed traversal in SDK `0.20.0`.
7. Plan B's five deletions and one renamed Action are breaking changes for clients that import the old symbols.

## Immediate next work

1. `apps/web` is pinned to `@jorby/sdk@0.20.0` through `src/osdk/resources.ts`.
2. Build Tag management and attach/detach, photo upload/replace/clear, and optional List Item `thingId` against the generated Actions.
3. Search already filters by content type and `tagNames`. Tag management UI is still open.
4. Keep live place search on `GOOGLE` and live watch search on `TMDB`.
5. Add Abby's Membership when her consumer identity is available.

## Release history

| Consumer SDK   | Contents                                                                                                                                                          |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0.1.0`        | Household, Membership, Lists, Items, original List Actions                                                                                                        |
| `0.2.0`        | Added `getMyMembership`                                                                                                                                           |
| `0.3.0`        | Added Shared Notes and function-backed List/Note Actions                                                                                                          |
| `0.4.0–0.6.0`  | Regenerated the original Household/List/Note surface                                                                                                              |
| `0.7.0–0.10.0` | Added deployed Places, Watch, and Things concrete resources; converged on the exact 15-object, 31-link, 48-Action, 6-query consumer boundary |
| `0.11.0`       | Added 3 deployed interfaces with 13/5/3 implementations and expanded the exact consumer boundary to 72 exports |
| `0.14.0`        | Functions `0.6.0`; 42 Function-backed Actions rebound; `getJorbyWatchTonight` at `0.6.0`; no `currentUserId` consumer parameter |
| `0.15.0–0.19.0` | Intermediate regeneration while Tags, photo Attachments, List Item → Thing, Function `0.6.1`, and Plan B Action changes were deployed |
| `0.20.0`        | Current: 16 objects, 45 consumer Actions, 6 queries, 3 interfaces, 70 exports; adds `JorbyTag`, five Tag links, `setJorbySharedNoteArchived`, and photo-capable Action contracts |
