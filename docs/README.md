# Jorby living specifications

**Status:** Living documentation  
**Last updated:** 2026-09-12  
**Applies to:** Jorby v1 shared-household catalog

This directory is the product and technical source of truth for Jorby. Update these documents in the same pull request as any implementation change that alters behavior, schema, security, or scope.

Current deployed baseline: exact `@jorby/sdk@0.14.0`, 15 concrete objects, 31 links, 48 consumer Actions, 6 query Functions from Functions release `0.6.0` (`getJorbyWatchTonight` at `0.6.0`; the other five queries remain `0.5.0`), and 3 interfaces with 13/5/3 concrete implementations. Function-backed edits take the submitting user from trusted Action context; do not send `currentUserId` from the browser. Global polymorphic search through `JorbyContent` is enabled at the Ontology/SDK layer. Provider adapters remain deterministic `MOCK` pending real credentials and Foundry egress.

## What this GitHub repo is

**Frontend + membership service only.** Ontology object types, Actions, Functions, and object security are specified here so the UI stays aligned, but they are implemented in Foundry, not in this git repository.

| Track | Where | Implemented in this repo? |
| --- | --- | --- |
| Implementation status | [implementation-status.md](./implementation-status.md) | No (deployed Foundry truth) |
| Product decisions | [product-decisions.md](./product-decisions.md) | No (decisions only) |
| Ontology | [ontology-spec.md](./ontology-spec.md) | No |
| Places / Watch / Things scope | [places-watch-things-scope.md](./places-watch-things-scope.md) | No (Foundry contract) |
| Production build contract | [frontend-and-membership-agent-handoff.md](./frontend-and-membership-agent-handoff.md) | Partially (UI consumes the generated SDK) |
| This repo (web, membership, local UI) | [this-repo/README.md](./this-repo/README.md) | Yes |

## Read in this order

1. [Implementation status](./implementation-status.md) — what is deployed, published, validated, blocked, and next.
2. [Product decisions](./product-decisions.md) — confirmed scope, behavior, and unresolved platform checks.
3. [Ontology specification](./ontology-spec.md) — object types, properties, keys, links, interfaces, and invariants (Foundry).
4. [Places, Watch, and Things backend scope](./places-watch-things-scope.md) — accepted staged Ontology, Functions, and OSDK implementation contract.
5. [Frontend and membership-service agent handoff](./frontend-and-membership-agent-handoff.md) — production build contract for this repo.
6. [This repository](./this-repo/README.md) — GitHub-only notes, including the [design direction](./this-repo/design-direction.md) and [UI prototype](./this-repo/ui-prototype.md).

## Document precedence

When documents disagree, use this precedence:

1. A newer explicitly approved decision recorded in `product-decisions.md`.
2. Security and tenancy invariants in `ontology-spec.md`.
3. Implementation guidance in the agent handoff, then `docs/this-repo/`.
4. Existing application code.

Do not silently resolve a contradiction in code. Record the decision, update the affected documents, and then implement it.

## Change protocol

For every material change:

1. Add or amend a decision in `product-decisions.md`.
2. If Ontology behavior changes, update `ontology-spec.md` (even though Ontology is not coded here).
3. If this repo’s UI, hosting, or membership service changes, update `docs/this-repo/` and the agent handoff as needed.
4. Add or update tests that prove the decision.
5. Call out migrations and compatibility concerns in the pull request.

## Scope boundary

The v1 product is a private shared-life catalog with these primary sections:

- Home
- Lists
- Notes
- Places
- Watch
- Things

Jorby Finance is an approved mock app mode, still household-scoped and not Foundry-backed. Together, uploads, and social features stay out without a new approved decision.
