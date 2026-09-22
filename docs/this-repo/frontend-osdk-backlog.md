# Frontend catalog and action backlog

**Status:** Living  
**Last updated:** 2026-09-18

Mock seed data is allowed only on `/our-home/…`. Live Foundry households use `@jorby/sdk@0.14.0`.

## Live now

| Surface | How |
| --- | --- |
| Households / membership | `JorbyHousehold`, `getMyMembership`, membership list |
| Lists | `createJorbySharedList`, `addJorbyListItemAtPosition`, `setJorbyListItemCompletion`, `saveJorbySharedList` (pin), `setJorbySharedListArchived` |
| Notes | Query, create, acquire/heartbeat/save/release lock, archive |
| Places | Concrete `JorbyPlaceEntry` reads/writes, manual create, MOCK provider search |
| Watch | Concrete `JorbyWatchEntry` reads/writes, manual create, MOCK provider search |
| Things | Concrete `JorbyThing` reads/writes with composite lifecycle/detail/reservation Actions |
| Home / search | Derived activity feed plus polymorphic `JorbyContent` search |

Do not call `provisionJorbyHousehold` or invoke edit Functions directly. Use the governed Actions. Provider search is deterministic `MOCK` only — label it as such in the UI.

## Still to deepen from 0.14.0

| Action / query | UI |
| --- | --- |
| `saveJorbyListItem` | Rename / reorder |
| `setJorbyListItemAssignee` | Member picker sheet |
| `setJorbyListItemArchived` | Item overflow |
| `duplicateJorbySharedList` | Overflow on list detail |
| `restoreJorbySharedNote` | Archived-notes view |
| Visit dishes / participants | Full visit editor |
| Place / Watch reconciliation | Attach a MOCK provider record to a manual entry |

The six legacy List symbols no longer exist. New code must not import them.

## Still waiting outside this SDK

Invite / first-household stay on the confidential membership service, which remains blocked on Client Credentials. Real Google Places and TMDB adapters stay pending credentials and Foundry egress.
