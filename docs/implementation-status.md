# Jorby implementation status

**Status:** Living implementation record
**Last updated:** 2026-09-13
**Current consumer SDK:** `@jorby/sdk@0.14.0`
**Current Functions release:** `0.6.0`

This document records deployed truth. Product intent remains in `product-decisions.md`; the complete logical model remains in `ontology-spec.md`. Ontology, Actions, Functions, and object security are implemented in Foundry, not in this GitHub repository.

## Executive summary

The Household, Lists, Notes, Places, Watch, and Things concrete Ontology slices and governed Actions are deployed. The exact generated consumer package is `@jorby/sdk@0.14.0`: **15 objects, 31 links, 48 consumer Actions, 6 query Functions, and 3 interfaces**. The underlying `Jorby Functions` release is `0.6.0`. Function-backed edits take the submitting user from trusted Action context (`currentUserId` / `current_user_id`) and must not receive it from the browser. Public OAuth/PKCE and local CORS work with the external consumer PWA.

`JorbyHouseholdScoped`, `JorbyContent`, and `JorbyMemberReaction` are deployed with 13/5/3 concrete implementations. Global polymorphic search through `JorbyContent` is enabled at the Ontology/SDK layer. Places and Watch provider adapters are deterministic `MOCK` implementations only; real credentials and Foundry egress approval remain pending.

The enrollment still does not support OAuth Client Credentials/Application permissions. Household membership is manually administered through one internal Foundry group per Household. Automated invite, join, leave, and group-management workflows remain blocked or require a future security-model redesign.

## This GitHub frontend

This repository consumes the consumer SDK from `apps/web` only. `apps/web/src/osdk/resources.ts` is the browser import boundary and must export exactly the union of generated `$Objects`, `$Actions`, `$Queries`, and `$Interfaces` (72 resource exports). Infrastructure namespace objects and metadata (`$Objects`, `$Actions`, `$Queries`, `$Interfaces`, `$osdkMetadata`, `$branch`, and `$ontologyRid`) are not part of the browser boundary.

Live household screens now query concrete Places, Watch, and Things objects and the `JorbyContent` interface. Provider search is labeled MOCK. Seeded prototype catalog and Finance numbers remain allowed only on `/our-home/…`.

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
@jorby/sdk     0.14.0
@osdk/react    2.67.0
@osdk/client   2.67.0
@osdk/api      2.67.0
@osdk/oauth    1.13.0
```

### Object types — deployed (15)

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
| `JorbyThing`               | `ri.ontology.main.object-type.de7038fb-aa55-4716-8874-4ef7ba0bf5d9` |
| `JorbyVisit`               | `ri.ontology.main.object-type.6795f54f-a5da-42a8-a2b1-13ca4b023e90` |
| `JorbyWatchEntry`          | `ri.ontology.main.object-type.2085fd61-b22c-42b4-9d0b-39722c3cd7d6` |
| `JorbyWatchReaction`       | `ri.ontology.main.object-type.30a1223d-bbc0-460f-87ef-2bd42092303e` |

The generated object definitions expose 31 deployed links.

### Interfaces — deployed (3)

| Generated export         | Interface RID                                                     | Concrete implementations |
| ------------------------ | ----------------------------------------------------------------- | -----------------------: |
| `JorbyHouseholdScoped`   | `ri.ontology.main.interface.c062bcf2-76a2-4398-9167-4f4e4287e31e` |                       13 |
| `JorbyContent`           | `ri.ontology.main.interface.3cae8e8a-2f52-4164-a2ad-c04ce5364c70` |                        5 |
| `JorbyMemberReaction`    | `ri.ontology.main.interface.38ed317e-d0d3-4fb7-a02c-d4955d808c91` |                        3 |

`JorbyContent` enables polymorphic recent-content and search queries at the Ontology/SDK layer.

### Consumer Actions — deployed (48)

| Generated export                 | Action type RID                                                    |
| -------------------------------- | ------------------------------------------------------------------ |
| `acquireJorbySharedNoteLock`     | `ri.actions.main.action-type.3672157e-ba46-4472-b62a-0b8023accff8` |
| `addJorbyListItem`               | `ri.actions.main.action-type.fe7eabaf-6a96-4a29-bed3-1303e83bdab9` |
| `addJorbyListItemAtPosition`     | `ri.actions.main.action-type.aacb19ec-e4e1-4065-a223-5aa53cb12584` |
| `archiveJorbyListItem`           | `ri.actions.main.action-type.2b27850f-7e07-4b45-baf5-601fcafb2845` |
| `archiveJorbySharedNote`         | `ri.actions.main.action-type.aa05f99b-e2ce-4a64-9e93-8bee0a078228` |
| `assignJorbyListItem`            | `ri.actions.main.action-type.7250fb22-a6d1-4720-a3d0-2f0dd4e42a4e` |
| `clearJorbyListItemAssignment`   | `ri.actions.main.action-type.895820a3-e985-4d8f-8d23-0c552dcaf783` |
| `correctJorbyPlaceProviderMatch` | `ri.actions.main.action-type.33c46d14-b674-41df-b1a3-441bbeff2b90` |
| `createJorbyManualPlace`         | `ri.actions.main.action-type.ece47441-c6c4-4608-8b50-6840627a67e6` |
| `createJorbyManualWatchEntry`    | `ri.actions.main.action-type.58cb72bc-22f4-426c-acc4-0b682cb45199` |
| `createJorbySharedList`          | `ri.actions.main.action-type.694b5948-ba57-4fd0-ac7a-ef08850457b2` |
| `createJorbySharedNote`          | `ri.actions.main.action-type.cfa6c486-dcd8-4e23-9258-4a301fa1f1fb` |
| `createJorbyThing`               | `ri.actions.main.action-type.fe4ec5ef-78b9-4ab2-97ca-e0271e6b3b8c` |
| `duplicateJorbySharedList`       | `ri.actions.main.action-type.919e316f-3f0f-41f6-803d-b25200115e7f` |
| `heartbeatJorbySharedNoteLock`   | `ri.actions.main.action-type.ceda179d-37e9-4f69-b4f2-d9b9baf9544e` |
| `manageJorbyPlaceReviews`        | `ri.actions.main.action-type.00114fc7-2477-4fcd-9aba-130ea72c091f` |
| `manageJorbyThingDetails`        | `ri.actions.main.action-type.958d83a2-2c9b-43b0-9349-091cfef1a2e5` |
| `manageJorbyThingLifecycle`      | `ri.actions.main.action-type.952d8c20-92e8-4d2d-8b59-4aafa7d185a9` |
| `manageJorbyThingReservation`    | `ri.actions.main.action-type.969afed9-d2c5-4adb-94cd-9db72f01126b` |
| `manageJorbyWatchProvider`       | `ri.actions.main.action-type.9c04b9e8-cbe3-42c7-8c8c-0a1348c2d6d2` |
| `manageJorbyWatchReaction`       | `ri.actions.main.action-type.c7f49236-b41c-47cf-9966-0baff2f2ebf4` |
| `reconcileJorbyPlaceEntry`       | `ri.actions.main.action-type.e46adf3c-8874-4c90-9004-e34850ad102a` |
| `reconcileJorbyWatchEntry`       | `ri.actions.main.action-type.55fd19e8-5549-489a-b48b-7aed1d2c9b47` |
| `refreshJorbyCatalogPlace`       | `ri.actions.main.action-type.a5395484-457b-46e9-bd68-ea8465cba8c9` |
| `releaseJorbySharedNoteLock`     | `ri.actions.main.action-type.37663028-c301-4526-b7bb-bdf0ed67f675` |
| `restoreJorbyListItem`           | `ri.actions.main.action-type.ebf62f60-0729-4616-963d-e1e613d6b5f9` |
| `restoreJorbySharedNote`         | `ri.actions.main.action-type.4139000e-ce58-4dc6-ba3e-b65bbf97615a` |
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

`getJorbyWatchTonight` is identity-independent and fail-closed on Household/object security. `getMyMembership(householdId)` remains identity-dependent. This React app still calls it for the current member on Home, Notes, Places, Watch, Things, and Finance. It may still return 403; create/edit Actions and Watch Tonight do not send that query. The five Places/Watch queries expose stable provider-neutral DTOs, but currently accept only the deterministic `MOCK` provider behavior. They do not prove real provider connectivity.

Do not send `currentUserId` on any consumer Action. Browser OAuth stays on `api:use-ontologies-read` and `api:use-ontologies-write`. Do not add Admin scopes.

## Deployed versus planned

| Domain                     | Status                                     | Current truth                                                                                               |
| -------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Household / Membership     | Deployed; membership manually administered | Concrete objects, security, current-user resolver                                                           |
| Lists / Notes              | Deployed                                   | Concrete objects, links, governed Actions, Note lock lifecycle                                              |
| Places                     | Deployed concrete slice                    | 6 objects, concrete links and Actions, deterministic MOCK queries                                           |
| Watch                      | Deployed concrete slice                    | 3 objects, concrete links and Actions, deterministic MOCK queries                                           |
| Things                     | Deployed concrete slice                    | 1 object, concrete links and composite lifecycle/detail/reservation Actions                                 |
| Interfaces                 | **Deployed**                               | `JorbyHouseholdScoped`, `JorbyContent`, and `JorbyMemberReaction`; 13/5/3 concrete implementations          |
| Global polymorphic search  | **Enabled in Ontology/SDK**                | `JorbyContent` is queryable polymorphically                                                                 |
| Real provider integrations | **Pending**                                | Credentials and Foundry egress approval are outstanding; adapters remain MOCK                               |
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

Accordingly, these six legacy SDK symbols no longer exist and must not be imported: `archiveJorbySharedList`, `completeJorbyListItem`, `reopenJorbyListItem`, `restoreJorbySharedList`, `updateJorbyListItem`, and `updateJorbySharedList`. Consumers should use the generated final-state/function-backed List Actions that remain in `0.14.0`.

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
- Functions diagnostics/publication at release `0.6.0`.
- SDK `0.14.0` generated with exact 15/48/6/3 namespace counts, 31 links, 72 boundary exports, and 13/5/3 interface implementations.
- Function-backed edits no longer call `Admin.Users.getCurrent`; identity comes from trusted Action context.

Remaining risks:

1. Membership/group administration remains manual and only one active Membership currently exists.
2. Provider behavior is deterministic MOCK only; credentials, egress, attribution, quotas, and production failure handling remain pending.
3. Shared Note Actions remain experimental.
4. No uploaded media exists in v1.
5. Repurposed Action RIDs are a deliberate breaking change for clients that still import the six removed legacy symbols.

## Immediate next work

1. Keep `apps/web` on generated `0.14.0` resources through `src/osdk/resources.ts` while preserving `OsdkProvider` wiring.
2. Exercise Places, Watch, and Things UI against concrete object types and Actions; label mock provider behavior clearly.
3. Keep Home / We Should / global search on the deployed `JorbyContent` interface.
4. Obtain provider credentials and egress approval before implementing real adapters.
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
| `0.14.0`       | Functions `0.6.0`; 42 Function-backed Actions rebound; `getJorbyWatchTonight` at `0.6.0`; no `currentUserId` consumer parameter; current |
