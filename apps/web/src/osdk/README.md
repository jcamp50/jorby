# Jorby OSDK boundary

The generated Ontology SDK is consumed as `@jorby/sdk`. Generated source files are not committed here.

## Current browser SDK

The deployed consumer package is exactly `@jorby/sdk@0.14.0`. Its generated resource namespaces contain:

- 15 object types spanning Household, Lists, Notes, Places, Watch, and Things.
- 31 generated links on those object types.
- 48 consumer Actions.
- 6 query Functions from the published `Jorby Functions` release `0.6.0`. `getJorbyWatchTonight` is imported at `0.6.0`; `getMyMembership` and the four Places/Watch provider queries remain `0.5.0`.
- 3 interfaces:
  - `JorbyHouseholdScoped`, implemented by 13 private object types.
  - `JorbyContent`, implemented by 5 top-level content object types.
  - `JorbyMemberReaction`, implemented by 3 review/reaction object types.

`resources.ts` exports exactly the union of the generated `$Objects`, `$Actions`, `$Queries`, and `$Interfaces` namespaces: 72 resource exports. It deliberately excludes the namespace objects themselves (`$Actions`, `$Objects`, `$Queries`, and `$Interfaces`) plus `$osdkMetadata`, `$branch`, and `$ontologyRid`. `resources.test.ts` mechanically compares the boundary keys with all four generated namespaces so SDK drift fails in CI.

The six legacy List symbols `archiveJorbySharedList`, `completeJorbyListItem`, `reopenJorbyListItem`, `restoreJorbySharedList`, `updateJorbyListItem`, and `updateJorbySharedList` are no longer generated. Their six Action RIDs were repurposed for composite Places, Watch, and Things Actions to stay within the enrollment's 60-Action cap.

Do not send `currentUserId` on any Action. Identity is supplied by trusted Action context. Browser OAuth stays on `api:use-ontologies-read` and `api:use-ontologies-write`. `getMyMembership` remains identity-dependent; this app still calls it to resolve the current member and it may still 403.

The compatible runtime line remains exact:

```text
@jorby/sdk   0.14.0
@osdk/react  2.67.0
@osdk/client 2.67.0
@osdk/api    2.67.0
@osdk/oauth  1.13.0
```

## Provider boundary

Places and Watch provider query contracts are deployed, but their adapters are deterministic `MOCK` implementations only. Real provider credentials and Foundry egress approval remain pending. Never put provider secrets in browser configuration or call providers directly from React.

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
