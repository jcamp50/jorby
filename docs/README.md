# Jorby living specifications

**Status:** Living documentation  
**Last updated:** 2026-09-05  
**Applies to:** Jorby v1 shared-household catalog

This directory is the product and technical source of truth for Jorby. Update these documents in the same pull request as any implementation change that alters behavior, schema, security, or scope.

## What this GitHub repo is

**Frontend + membership service only.** Ontology object types, Actions, Functions, and object security are specified here so the UI stays aligned, but they are implemented in Foundry, not in this git repository.

| Track | Where | Implemented in this repo? |
| --- | --- | --- |
| Product decisions | [product-decisions.md](./product-decisions.md) | No (decisions only) |
| Ontology | [ontology-spec.md](./ontology-spec.md) | No |
| Production build contract | [frontend-and-membership-agent-handoff.md](./frontend-and-membership-agent-handoff.md) | Partially (UI now, OSDK later) |
| This repo (web, membership, local UI) | [this-repo/README.md](./this-repo/README.md) | Yes |

## Read in this order

1. [Product decisions](./product-decisions.md) — confirmed scope, behavior, and unresolved platform checks.
2. [Ontology specification](./ontology-spec.md) — object types, properties, keys, links, interfaces, and invariants (Foundry).
3. [Frontend and membership-service agent handoff](./frontend-and-membership-agent-handoff.md) — production build contract for this repo.
4. [This repository](./this-repo/README.md) — GitHub-only notes, including the [UI prototype](./this-repo/ui-prototype.md).

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

Money and Together are intentionally later modules and must not shape or expand the first implementation without a new approved decision.
