# Foundry OSDK in this repo

**Status:** Consumer frontend on `@jorby/sdk@0.3.0`  
**Last updated:** 2026-09-06

This GitHub repo consumes a generated consumer SDK. It does not contain Ontology definitions.

| Package | Where | Privilege |
| --- | --- | --- |
| `@jorby/sdk` | `apps/web` only | Consumer reads, Actions, and Functions |
| Future confidential backend SDK | `services/membership` only | Household provisioning and membership |

Do not install the consumer SDK in the membership service. Do not install a provisioning SDK in the browser app. `FOUNDRY_TOKEN` downloads private npm packages; it is never a `VITE_*` value.

## Local install

```powershell
$env:FOUNDRY_TOKEN = "<read-only Foundry token>"
cd apps/web
npm install
```

The Foundry-generated `.npmrc` is at the repo root as the source pattern. `apps/web/.npmrc` scopes only `@jorby` to that registry so public packages still install from npmjs without a token. npm does not inherit the monorepo-root file when installing inside the app.

## Public OAuth env

Copy `apps/web/.env.example` to `apps/web/.env.local` and fill:

```text
VITE_FOUNDRY_API_URL
VITE_FOUNDRY_CLIENT_ID
VITE_FOUNDRY_REDIRECT_URL
```

Local values live in the repo-root `.env` (gitignored). Vite’s `envDir` points there so `apps/web` picks up the public `VITE_*` keys. `FOUNDRY_TOKEN` in that file is only for npm; it is not a `VITE_` variable and is not bundled.

The registered local callback is `http://localhost:8080/auth/callback`. That URL is this GitHub frontend (`apps/web`), not a Foundry process. Foundry’s login UI and Ontology API run at `VITE_FOUNDRY_API_URL`. After login, the browser is sent back here. The Foundry-generated starter app in the other repository also defaults to port 8080; only one local process can bind it. This repo pins Vite to 8080 so it matches Developer Console. Playwright still starts its own server on 5174.

If both local apps need to run, register a second redirect on the public client (for example `http://localhost:5173/auth/callback`) and give the Foundry starter a different port. Do not point the consumer callback at a Foundry-hosted frontend.

## CI

Once `@jorby/sdk` is a dependency, GitHub Actions needs a read-only `FOUNDRY_TOKEN` secret on the install step. Do not use a personal long-lived token in CI.

## Verified versions

```text
@jorby/sdk    0.3.0
@osdk/react   2.63.0
@osdk/client  2.63.0
@osdk/api     2.63.0
@osdk/oauth   1.13.0
```

Consumer imports go through `apps/web/src/osdk/resources.ts`. That barrel re-exports `JorbySharedNote`, `getMyMembership`, and the function-backed list/note Actions. Do not import `provisionJorbyHousehold`. New list work uses `addJorbyListItemAtPosition`, `setJorbyListItemCompletion`, `saveJorbySharedList`, and `setJorbySharedListArchived` rather than the older revision/rank Actions.

After changing `@jorby/sdk` versions, restart Vite with `--force` so the prebundle picks up new exports.

Keep the three `@osdk/*` runtime packages on the same release line.

## Client construction

`createPublicOauthClient` argument order is `clientId`, **Foundry URL**, **redirect URL**, then options. Do not swap the URL and redirect arguments. Prefer the options object for scopes:

```ts
createPublicOauthClient(
  import.meta.env.VITE_FOUNDRY_CLIENT_ID,
  import.meta.env.VITE_FOUNDRY_API_URL,
  import.meta.env.VITE_FOUNDRY_REDIRECT_URL,
  {
    loginPage: "/welcome",
    scopes: ["api:use-ontologies-read", "api:use-ontologies-write"],
  },
);
```

The Ontology RID comes from `$ontologyRid` in `@jorby/sdk`. Do not hardcode it.

## CORS vs local proxy

Login is a full-page redirect to Foundry, so it is not a CORS request. Object queries and token refresh are `fetch` calls and **are**.

Locally, Vite proxies `/api` and `/multipass` to `VITE_FOUNDRY_API_URL`, and the browser client uses `window.location.origin` so those fetches stay same-origin. Restart `npm run dev` after pulling this.

Production still talks to Foundry directly. An enrollment admin must allowlist the exact browser origins in Foundry CORS settings, for example:

```text
http://localhost:8080
https://<production-origin>
```

If you run the app on another local port, that origin must be allowlisted too, or you must use this repo’s Vite proxy on that port. Do not change `VITE_FOUNDRY_API_URL` to `localhost`. That value is the real Foundry origin and the proxy target.

## Out of scope here

The confidential membership-service application and restricted backend SDK are a Foundry-side task. They do not belong in `apps/web`.
