# Implementation Constraints

This companion carries implementation-prescriptive content that does not belong in the WHAT-level kernel.

## Data and query rules

- Add `Policies`, `Permissions`, and `UserPolicies`; extend `Relationship` with the approved `direct`, `project`, and `people_partner` shapes from `database-schema.md`.
- Support only policy operator `==`. Do not represent, seed, or evaluate policy-level `IN`.
- Use raw SQL migrations for required partial uniqueness, checks, and hot-path indexes that the configured Prisma schema cannot express.
- Resolve each graph for all requested targets with an indexed bulk query plan. Policy and polymorphic-target reads that form one decision run in one PostgreSQL transaction.
- Store no audience, section result, role flag, or other derived authorization decision.
- Seed the audience-to-section mapping, equality-based AR policies, and exactly one AD-12 bootstrap HR Admin FR attachment. Do not invent other default FR grants.

## Dependency and DI rules

Target layout:

```text
src/access-control/
  application/
  domain/
    interfaces/
    services/
  infrastructure/
```

- Port interfaces and `Symbol` tokens live together under `domain/interfaces/`.
- Only `domain/services/` injects port tokens. Application actions/controllers depend on domain services; module wiring names adapters.
- `domain/` imports no Prisma types, HTTP/transport types, SDKs, adapters, or foreign-context internals.
- Prisma adapters live under `infrastructure/`.
- Other contexts consume only the exported application-layer facade.
- Delete `src/user-management/infrastructure/interim-access-control.adapter.ts` and rewire its callers to the real facade.

## Required production slices

- Repository ports/tokens for live FR attachments, relationships, policies, and matrix lookup.
- Functional-permission domain service for `isAllowed`, type-separated from audience queries.
- Audience resolver implementing the Phase 1 branches and gates in `facade-contract.md`.
- Section-access service joining resolved audiences to the seeded S1–S16 base matrix.
- Prisma adapters and indexed migrations.
- Application facade exposing the exact three method contracts.
- Seed data described above.

## Verification obligations

Production work starts only after stage-1 scenarios exist and stage-2 E2E are committed red (AD-1 ordering only — the per-stage human approval was retired 2026-09-04 (`docs/architecture/testing-strategy.md:25–38`, ruling `D-1`)).

Automation candidates:

- Every row in `facade-contract.md`, every facade branch, all five AD-20 positions, all three `SectionAccess` values, and every fail-closed path.
- Architecture tests proving no authorization decision exists outside the facade and no forbidden dependency crosses the context boundary.
- Integration tests proving FR evaluation does not read audience data and audience resolution does not read FR data.
- Real-PostgreSQL E2E through HTTP, router, authentication, facade, resolution, and database; only external integration ports may be fixture-backed.
- Seed idempotency and uniqueness for the bootstrap HR Admin attachment.
- Database assertion that requests persist no derived decision.
- Query-count assertion for empty and 500-target bulk resolution.

Manual validation:

- Human approval of every stage-1 scenario and translated stage-2 E2E; the producing agent cannot self-approve either stage.
- `EXPLAIN (ANALYZE, BUFFERS)` for resolver plans: verify intended indexes and no sequential scans on `Relationship` or `Policies` at representative 500+ employee volume.
- Release smoke against the real timetracker test environment only after the Project-line integration contract is approved; deterministic E2E never calls the live provider.

Service verification commands after implementation:

```sh
npm run lint
npx tsc --noEmit
npx prisma migrate dev
npm run test:e2e -- access-control
```

The relevant service's existing unit/integration test command must also pass. Migration and E2E evidence must use PostgreSQL, not a repository fake.
