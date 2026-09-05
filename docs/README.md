# Jorby living specifications

**Status:** Living documentation  
**Last updated:** 2026-09-05  
**Applies to:** Jorby v1 shared-household catalog

This directory is the product and technical source of truth for Jorby. Update these documents in the same pull request as any implementation change that alters behavior, schema, security, or scope.

## Read in this order

1. [Product decisions](./product-decisions.md) — confirmed scope, behavior, and unresolved platform checks.
2. [Ontology specification](./ontology-spec.md) — object types, properties, keys, links, interfaces, and invariants.
3. [Frontend and membership-service agent handoff](./frontend-and-membership-agent-handoff.md) — build instructions for the React OSDK frontend and trusted user/membership service.

## Document precedence

When documents disagree, use this precedence:

1. A newer explicitly approved decision recorded in `product-decisions.md`.
2. Security and tenancy invariants in `ontology-spec.md`.
3. Implementation guidance in the agent handoff.
4. Existing application code.

Do not silently resolve a contradiction in code. Record the decision, update the affected documents, and then implement it.

## Change protocol

For every material change:

1. Add or amend a decision in `product-decisions.md`.
2. Update affected ontology properties, links, actions, and invariants.
3. Update the screen/query or service contract in the agent handoff.
4. Add or update tests that prove the decision.
5. Call out migrations and compatibility concerns in the pull request.

## Current repository state

As of 2026-09-05 this GitHub monorepo is the source of truth for specifications and the React web scaffold in `apps/web`. Generated Foundry OSDK packages, `@osdk/react` wiring, Foundry hosting config, and the membership service implementation are not in this tree yet. Do not guess Ontology API names; wait for the generated SDK.

## Scope boundary

The v1 product is a private shared-life catalog with these primary sections:

- Home
- Lists
- Notes
- Places
- Watch
- Things

Money and Together are intentionally later modules and must not shape or expand the first implementation without a new approved decision.
