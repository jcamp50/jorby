# Frontend catalog and action backlog

**Status:** Living  
**Last updated:** 2026-09-30

Mock seed data is allowed only on `/our-home/…`. Live Foundry households use `@jorby/sdk@0.20.0`.

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

Do not call `provisionJorbyHousehold` or invoke edit Functions directly. Use the governed Actions. Live place search uses `GOOGLE` and live watch search uses `TMDB`.

## Still to build against 0.20.0

| Action / resource | UI |
| --- | --- |
| `manageJorbyTag` | Find/create, rename, archive |
| `manageJorbyTagLinks` | Attach/detach on the five content types |
| `JorbyContent.tagNames` | Search filter is live; section screens still do not filter by tag |
| `thingId` on List Item Actions | Optional Thing picker; no typed `linkedThing` traversal |
| `SET_PHOTO` / `CLEAR_PHOTO` / `photo` / `clearPhoto` | Upload, replace, and clear on Thing, Place Entry, and Visit |
| `saveJorbyListItem` | Rename / reorder |
| `setJorbyListItemAssignee` | Member picker sheet |
| `setJorbyListItemArchived` | Item overflow |
| `duplicateJorbySharedList` | Overflow on list detail |
| `setJorbySharedNoteArchived` | Restore path; archive already calls this Action with `isArchived: true` |
| Visit dishes / participants | Full visit editor |
| Place / Watch reconciliation | Attach a provider record to a manual entry |

Do not import the deleted Plan B symbols. Do not send `MOCK` from production place or watch search.

## Still waiting outside this SDK

Invite / first-household stay on the confidential membership service, which remains blocked on Client Credentials. Real Google Places and TMDB adapters are implemented in Foundry; production credentials, quota, attribution, and smoke tests are not recorded.
