# Frontend catalog and action backlog

**Status:** Living  
**Last updated:** 2026-09-06

Mock seed data is allowed only on `/our-home/…`. Live Foundry households use `@jorby/sdk@0.3.0`.

## Live now

| Surface | How |
| --- | --- |
| Households / membership | `JorbyHousehold`, `getMyMembership`, membership list |
| Lists | `createJorbySharedList`, `addJorbyListItemAtPosition`, `setJorbyListItemCompletion`, `saveJorbySharedList` (pin), `setJorbySharedListArchived` |
| Notes | Query, create, acquire/heartbeat/save/release lock, archive |
| Search | `searchText` `$containsAllTerms` on lists and notes |

Do not call `provisionJorbyHousehold` or invoke edit Functions directly. Use the governed Actions.

## Still to wire from 0.3.0

| Action | UI |
| --- | --- |
| `saveJorbyListItem` | Rename / reorder |
| `setJorbyListItemAssignee` | Member picker sheet |
| `setJorbyListItemArchived` | Item overflow |
| `duplicateJorbySharedList` | Overflow on list detail |
| `restoreJorbySharedNote` | Archived-notes view |

Older revision/rank Actions remain in the package. New code should not use them.

## Still waiting on Ontology

Places, Watch, Things, and provider search Functions. Invite / first-household stay on the confidential membership service.
