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

Those three documents describe Foundry-backed production. Implementation in this repo may use local mock data until OSDK and the membership service exist.

## Docs in this folder

- [UI prototype](./ui-prototype.md) — current clickable mock, local-only state, and what is intentionally fake
- [Design system and mobile rules](./design-system.md) — how shadcn is installed, and the mobile constraints every screen must meet
