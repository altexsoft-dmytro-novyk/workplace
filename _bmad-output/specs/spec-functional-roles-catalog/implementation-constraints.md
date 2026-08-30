# Implementation Constraints

> **UNAPPROVED DRAFT.** Companion to `SPEC.md`, which is itself unreviewed. Nothing here authorizes work. Several rules below are conditional on open questions in `SPEC.md` and are marked as such.

This companion carries implementation-prescriptive content that does not belong in the WHAT-level kernel.

## Data and query rules

- The approved Kernel MVP plan reserves the minimal FR schema, three-permission
  seed, `hr-admin` bootstrap attachment, repository port, and `isAllowed`
  evaluator for ACM-1/ACM-2. Their physical shape remains blocked until
  FR-AMD-1 resolves OQ-3, OQ-4, OQ-6, OQ-7, and OQ-11 and receives independent
  human approval. This catalog consumes the approved result; it must not create
  a second migration, seed, attachment, port, or evaluator.
- The role→permission link has no defined storage (OQ-3). No migration, seed, or model may be written for it until `database-schema.md` records the decision. This is a hard stop, not a design freedom.
- Read and write only `type: 'FR'` rows. No query in this slice may join `Relationship`, and no AR row may be read, written, or seeded here.
- Support only operator `==`. Do not represent, seed, or evaluate policy-level `IN`, and do not add `!=`.
- Write only `managedBy: 'admin'`. `'sync'` is the timetracker integration's exclusively (AD-13).
- Seed exactly one AD-12 bootstrap HR Admin FR attachment. Seed no other grant, and no default permission set for any of the five §2.2 starting roles (§2.3 defaults gate). An "obvious" default in a fixture is still a default.
- Store no evaluated FR decision anywhere — no table, no column, no in-process memo, no request-spanning cache. §2.3's immediate-revocation rule leaves no room for one.
- Use raw SQL migrations for any uniqueness, check, or index constraint the configured Prisma schema cannot express, following the existing convention.
- The catalog's read and write queries are administrative, not hot-path. They still must not degrade into full scans over `Policies`; index on the discriminator that separates FR from AR rows so an FR lookup never sweeps AR rows.

## Context placement and dependency rules

The slice lives in the **existing** `access-control` context, not a sibling. AD-5 already assigns both role dimensions to it, and AD-7 puts both dimensions on the same three tables — a sibling context would give two contexts write access to `Policies`, `Permissions`, and `UserPolicies`, which AD-2's entry-point rule (cross-context access only through the owner's `application/` exports) cannot express without one of them becoming a thin proxy for the other.

**The accepted cost, stated so it is not discovered later:** one context now holds a read-only hot path (the audience resolver) and a mutating administrative surface (this catalog). AD-7's type separation — FR checks never touching the AR path — becomes a convention inside one module rather than a boundary between two. It must therefore be proven by test, not assumed by structure. The mitigations:

- Separate domain services. The FR evaluator and the audience resolver share no service, no port, and no repository adapter.
- Separate ports under `domain/interfaces/`. A single "policies repository" port serving both dimensions would defeat the separation; do not create one.
- An integration test asserting an FR evaluation issues zero relationship/audience queries, and its converse for audience resolution. The facade spec's `implementation-constraints.md` already names this obligation; this slice is where the FR half becomes testable.

Target layout, extending what exists (`src/access-control/` currently holds `access-control.module.ts`, `application/access-control.facade.ts`, `domain/audience.ts`, `domain/interfaces/relationship-graph.port.ts`, `domain/services/audience-resolver.service.ts`, and `infrastructure/prisma-relationship-graph.adapter.ts`):

```text
src/access-control/
  application/
    actions/        # catalog use cases
    controllers/    # first inbound HTTP adapter in this context — see note below
    dtos/           # shapes fixed by the Stage-1 scenario doc, not invented here
  domain/
    interfaces/     # FR ports + Symbol tokens, separate from relationship-graph.port.ts
    services/       # FR evaluator; FR catalog service
  infrastructure/
```

Note the consequence: `access-control` has had no controller until now. This slice makes it a context with a public HTTP surface, which changes how it is wired in the app module and how its E2E suite is bootstrapped. That is new ground, not a copy of the audience side.

Standing rules from `domain-driven-design.md` that apply unchanged:

- Port interfaces and `Symbol` tokens live together under `domain/interfaces/`.
- Only `domain/services/` injects port tokens. `application/actions/` and controllers depend on domain services, never on a port token, even one declared in `domain/interfaces/`.
- `domain/` imports no Prisma types, HTTP/transport types, SDKs, adapters, or foreign-context internals.
- Prisma adapters live under `infrastructure/`.
- Other contexts consume only the exported application-layer facade.
- Role mutation uses `assignFunctionalRole` / `revokeFunctionalRole` and nothing else (AD-6). No flag, column, or method may name or store an access role.

## Blocked before any production slice can be named

The required production slices cannot be listed the way the facade spec lists its own, because four questions gate them:

- OQ-3 (role→permission storage) blocks the migration and the domain model.
- OQ-4 (FR row shape) blocks the repository port signature and the `roleId` identity.
- OQ-5 (which permission gates `/roles`) blocks the controller's guard.
- OQ-11 (who ships `isAllowed`) blocks the evaluator's ownership.

What can be stated now: ACM-1/ACM-2 supply the approved repository/evaluator
foundation after FR-AMD-1. This slice then needs only the runtime catalog domain
service and adapters for create/read/update-permissions/delete over that
foundation. The exact catalog decomposition follows its Stage-1 document.

## Verification obligations

Production work starts only after independently approved Stage-1 scenarios and Stage-2 E2E committed red (AD-1). No dispatch spans two stages.

Automation candidates:

- A role created at runtime grants exactly its permission set; a role with an empty set grants nothing.
- Permission removal is visible on the next request within one session, with no re-login and no cache warm-up.
- An unknown feature key, an unattached user, and an orphaned attachment each return `false`.
- Query-level assertion that `isAllowed` reads no relationship or audience data (the FR half of the facade spec's type-separation obligation).
- Architecture test that no context outside `access-control` reads `Policies`, `Permissions`, or `UserPolicies` directly, and that no FR decision is reached outside the facade.
- Seed idempotency and uniqueness for the single bootstrap HR Admin attachment, plus an assertion that the seed creates **no other** FR grant — the test that keeps an unapproved default from arriving quietly.
- Database assertion that a request persists no FR decision.
- Consistency with the three existing draft scenarios under `docs/test-cases/access-control/functional-permission/` (AC-FP-01 dual gate, AC-FP-02 FR-is-not-audience, AC-FP-03 HR Admin has no data access). Do not re-author them.

Manual validation:

- Human approval of every Stage-1 scenario and every translated Stage-2 E2E; the producing agent cannot self-approve either stage (AD-1, as extended 2026-08-26).
- A human reads the seed diff specifically for default grants before it merges.

Service verification commands after implementation:

```sh
npm run lint
npx tsc --noEmit
npx prisma migrate dev
npm run test:e2e -- access-control
```

Migration and E2E evidence must use PostgreSQL, not a repository fake.
