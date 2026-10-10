# Jorby OSDK boundary

The generated Ontology SDK is consumed as `@jorby/sdk`. Generated source files are not committed here.

## Current browser SDK

The deployed consumer package is resolved `@jorby/sdk@0.20.0`. Its generated resource namespaces contain:

- 16 object types spanning Household, Lists, Notes, Tags, Places, Watch, and Things.
- 36 imported links, including five Tag links. List Item → Thing is not a typed traversal in this SDK.
- 45 consumer Actions.
- 6 query Functions. `getJorbyWatchTonight` is `0.6.0`; the other five remain `0.5.0`. The latest edit Function release is `0.6.1`.
- 3 interfaces:
  - `JorbyHouseholdScoped`, implemented by 14 private object types.
  - `JorbyContent`, implemented by 5 top-level content object types, now including `tagNames`.
  - `JorbyMemberReaction`, implemented by 3 review/reaction object types.

`resources.ts` exports exactly the union of the generated `$Objects`, `$Actions`, `$Queries`, and `$Interfaces` namespaces: 70 resource exports. It deliberately excludes the namespace objects themselves plus `$osdkMetadata`, `$branch`, and `$ontologyRid`. `resources.test.ts` compares the boundary keys so SDK drift fails in CI.

Do not import the removed legacy List symbols or the Plan B symbols `archiveJorbyListItem`, `assignJorbyListItem`, `clearJorbyListItemAssignment`, `restoreJorbyListItem`, `restoreJorbySharedNote`, and `archiveJorbySharedNote`. Note archive is `setJorbySharedNoteArchived`.

Do not send `currentUserId` on any Action. Browser OAuth stays on `api:use-ontologies-read` and `api:use-ontologies-write`. `getMyMembership` remains identity-dependent; this app still calls it to resolve the current member and it may still 403.

The compatible runtime line is exact:

```text
@jorby/sdk   0.20.0
@osdk/react  2.73.0
@osdk/client 2.73.0
@osdk/api    2.73.0
@osdk/oauth  1.13.0
```

## Provider boundary

Live place search uses `GOOGLE`. Live watch search uses `TMDB`. `MOCK` stays on deterministic tests. Never put provider secrets in browser configuration or call Google or TMDB directly from React.

## Updating the SDK

After an Ontology change reaches Foundry main:

1. Compare the live Ontology with the Developer Console SDK imports.
2. Add only approved consumer resources through Developer Console; never edit generated SDK files or an SDK manifest directly.
3. Generate and publish the next SDK version.
4. Inspect the installed generated namespaces and retrieve resource-specific OSDK documentation; never guess API names.
5. Pin the new `@jorby/sdk` version exactly in `apps/web/package.json`.
6. Read `node_modules/@osdk/react/AGENTS.md` and preserve the mutually compatible exact OSDK runtime line.
7. Install dependencies through the Foundry npm registry (`FOUNDRY_TOKEN` is install-only).
8. Update `resources.ts`; the contract test must prove exact equality with `$Objects ∪ $Actions ∪ $Queries ∪ $Interfaces`.
9. Update living documentation to distinguish deployed Ontology/SDK capabilities from implemented UI and provider integrations.
10. Run typecheck, lint, tests, and build.

Do not publish or tag the React application as part of an SDK-boundary migration unless explicitly requested.
