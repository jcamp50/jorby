# This repository: frontend and membership service

**Last updated:** 2026-09-05

This GitHub repo is **not** the Foundry / Ontology project. It contains:

| Path | What it is |
| --- | --- |
| `apps/web` | React PWA (Vite, TypeScript, Tailwind) |
| `services/membership` | Trusted invite and household-membership service |
| `docs/this-repo/` | Docs that apply to **this** codebase |

Product behavior and the Ontology model still live one level up, because the UI must match them:

- [Product decisions](../product-decisions.md)
- [Ontology specification](../ontology-spec.md)
- [Frontend and membership-service agent handoff](../frontend-and-membership-agent-handoff.md)

Those three documents describe Foundry-backed production. This repo consumes `@jorby/sdk` from the browser app only. Seeded prototype data is allowed only on the `our-home` mock household. The membership service still does not use the consumer SDK.

## Docs in this folder

- [Design direction](./design-direction.md) — living visual language, adapted from the Monzo starter screens
- [Design system and mobile rules](./design-system.md) — shadcn install, mobile constraints, screen states
- [UI prototype](./ui-prototype.md) — current clickable mock, local-only state, and what is intentionally fake
- [Foundry OSDK](./foundry-osdk.md) — how this repo consumes `@jorby/sdk` without hosting Ontology code
- [Frontend OSDK backlog](./frontend-osdk-backlog.md) — what is live, what is mock-only, and how each catalog will be wired
