---
title: 'Access Control — AccessControl facade and audience resolution'
type: 'feature'
created: '2026-08-29'
status: 'review'
review_loop_iteration: 0
context:
  - '{project-root}/docs/architecture/access-control.md'
  - '{project-root}/docs/architecture/domain-driven-design.md'
  - '{project-root}/docs/architecture/nestjs-di-tokens.md'
  - '{project-root}/docs/architecture/database-schema.md'
  - '{project-root}/docs/architecture/testing-strategy.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** AD-9 makes the `AccessControl` facade the only authorization entry point in every context, but no `access-control` code exists. User Management shipped an interim adapter granting target-scoped access to any non-empty session user, so §7's primary quality attribute is unenforced and downstream contexts have nothing real to call.

**Approach:** Build the facade — `isAllowed`, `resolveAudiences`, `canAccessSection` — over live per-request resolution of the v1.5 audience columns (Self, Reporting line, Project line, PP, Colleague) from `Relationship` rows and `Policies` attachments. Reporting and Project are separate passes. Nothing derived is stored.

## Boundaries & Constraints

**Blocking precondition:** AD-1 is a sequence, not a checklist to execute inside this spec. The v1.5 `docs/test-cases/access-control/` suite does not exist (203 withdrawn files in `6086491` were never approved). Before any production task below: (1) a separate dispatch authors each replacement scenario and stops; a human developer approves each file; (2) a separate dispatch translates the approved scenarios into E2E and stops; a human developer approves the tests and commits them red. This spec neither authors nor self-approves either gate artifact; that work remains in `deferred-work.md`.

**Always:**

- The facade is the only authorization entry point — no `isManager || isPP` flags, no policy-table reads from another context.
- Reporting line and Project line resolve in **separate** passes; a reports-to manager of a DM gets no Project-line reach into that DM's projects.
- Phase 1 audience boundary: Reporting line recursively walks only `Relationship type='direct'` reports-to edges (all ancestors, not merely the immediate manager). A `people_partner` edge grants the assigned PP only; it never walks that PP's `direct` manager chain. `targetType:'department'` policies contribute no audience until the Department contract is approved.
- Self evaluated first; multiple audiences over one target merge per section best-of RW > R > none (CC-02 Option 1).
- Fail closed: missing, orphaned, or broken data yields less access, never more.
- The initial facade slice supports only the `==` policy operator through indexed joins. Policy-level `IN` is deferred: do not add a target-set schema, seed, evaluator branch, or application-side set membership. Internal bulk SQL `IN` for requested IDs is not this policy operator.
- Derived decisions are never persisted and never cached across requests.
- `domain/` imports nothing from Prisma, NestJS transport, or HTTP.
- Denials: `401` missing/invalid token; `403` no feature permission, or write to a readable section; `404` leak-free for a `—` cell. Absent means the key is missing, never `null`.
- Functional-role foundation is in scope: `isAllowed` evaluates persisted FR policy, permission, and user-attachment data separately from audience resolution; seed attaches the single AD-12 bootstrap HR Admin role. This does not invent a general default-permission catalogue.

**Ask First:**

- Enabling the department walk or transitive PP-inside-HR inheritance — fail-closed until the Department contract defines the HR boundary (AD-19).
- Hard-coding default permission grants — pending recorded PO confirmation.
- Enabling policy-level `IN` — requires approved target-set representation, valid target types/cardinality, mutation rules, and an indexed query plan.
- Enabling Project-line grants — requires an approved timetracker assignment/freshness contract and its own AD-1 scenarios. Until then, Project line contributes no audience.
- Any cross-request cache.
- Anything needing the full-profile overlay's column mapping or its precedence against Self — both unresolved.

**Never:**

- Functional-role catalog and role-management UI/API, shared links, full-profile overlay, and profile/list/export projection — see `deferred-work.md`.
- A timetracker adapter, sync worker, outage banner, or an assumed provider payload. They belong to the separate Project-line integration contract, not this facade slice.
- Restoring the withdrawn pre-v1.5 scenarios; they encode one merged "Manager line" that v1.5 splits.
- Mentorship pairs as audience inputs (AD-17).
- Application code in this workspace root; implementation lands in `services/backend`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Behavior | Error |
|----------|--------------|-------------------|-------|
| Self wins | Viewer is target, also in own reporting chain | Self column only, manager cells not merged | N/A |
| Colleague hits `—` | Authenticated, no relation, requests S2 | Key absent from payload | `404` leak-free |
| Project line withheld in Phase 1 | PM shares a project with the target and requests any section | No Project audience resolves; with no other relation the PM falls back to Colleague, so S2/S3 are denied. The narrower Project-line cells — including S5 as CV and certificates — are Profile Projection's contract, not this facade's | `404` |
| No cross-kind inheritance | A manages a DM by reports-to; DM is PM of P | A gets no Project-line reach into P | `404` |
| Broken reports-to edge | `reportsToUserId` missing or user deleted | Walk stops at orphan, no ancestor grant | Fail closed |
| Orphan policy | `targetId` names a deleted project | Joins zero members, zero grant | Fail closed |
| Department policy | A `targetType:'department'` row exists | Contributes nothing pending Department contract | Fail closed |
| Reporting remains transitive | Alice reports to Bob; Bob reports to Carol | Carol resolves Reporting line for Alice through `direct` edges | N/A |
| PP HR line withheld | Paula is Alice's assigned PP and reports to Hana | Paula resolves PP; Hana does not inherit PP through Paula | Fail closed |
| Empty bulk | `resolveAudiences(viewerId, [])` | Empty map, zero queries | N/A |
| Project integration unavailable | No approved timetracker assignment/freshness contract | Project line contributes no audience; Self, Reporting, PP, and Colleague continue normally | Fail closed |
| Merge | Viewer holds Reporting + PP over one target, and Project once its gate opens | Per-section best-of RW > R > none | N/A |
| Dual gate | Matrix RW, viewer lacks feature permission | Write denied | `403` |
| FR is data, not audience | Viewer has a live FR permission but no target audience | `isAllowed` is true; target section remains denied | `404` |
| Bootstrap role | Fresh seed | Exactly one user holds the seeded HR Admin FR attachment | N/A |
| Due actor | Viewer has a due departure | Denied before feature or audience resolution | `401`/`403` |
| Due target | Target has a due departure | Current manager/PP receives read-only dismissed-target projection; target is absent from active lists | N/A |
| Due manager/PP endpoint | Traversal reaches a due manager or PP | It grants no audience and cannot bridge to an ancestor | Fail closed |
| Due recursion node | Reporting or PP recursion reaches a due intermediate node | Stop at the node; do not grant the ancestor through it | Fail closed |
| Due share-link authority | Link creator or revoker is due | Recheck fails; the dependent link is `404` leak-free | `404` |

</frozen-after-approval>

## Code Map

`services/backend` is **not checked out** here (gitlink `c42de7d`); no application file was read. `src/` paths are the target layout from `domain-driven-design.md`, not observed files.

- `docs/architecture/access-control.md` -- authoritative, read-only: facade signatures, audience columns, merge order, revocation timing, fail-closed, AD-20 departure cutoff.
- `docs/architecture/domain-driven-design.md` -- layout `src/access-control/{application,domain,infrastructure}`; only `domain/services/` may `@Inject` tokens.
- `docs/architecture/nestjs-di-tokens.md` -- token pattern (`Symbol('…')` in `domain/interfaces/`); guards may inject ports; facade and tier resolution never faked in E2E. **No access-control tokens exist yet — this work introduces them.**
- `docs/architecture/database-schema.md` -- `Relationship` (`type: 'direct'|'project'|'people_partner'`), `Policies`, `Permissions`, `UserPolicies`. Partial unique indexes need raw SQL; `UserPolicies` has no declared composite PK; department edges deferred.
- `docs/project-requirements.md` §2, §3.2, §3.3 -- normative audiences and the S1–S16 cell set.
- `docs/architecture/testing-strategy.md` -- AD-1 stages; E2E means real HTTP, router, resolution, PostgreSQL.

## Facade Contract

The facade is called only after authentication has established a valid session. It is the authorization seam; HTTP controllers map its decision to the status conventions in **Boundaries & Constraints** and never infer audiences from flags or policy rows.

| Method | Input | Output | Required behavior |
| --- | --- | --- | --- |
| `isAllowed(userId, feature)` | Authenticated user and one functional permission | `boolean` | Reads FR attachments only. Returns `false` for no matching live permission or a due actor; it never supplies target data access. |
| `resolveAudiences(viewerId, employeeIds)` | Authenticated viewer and zero or more target employee IDs | A map keyed by every requested target ID; each value records only applicable `self`, `reporting`, `project`, `pp`, or fallback `colleague` audience columns | Empty input returns an empty map without queries. Self is exclusive of manager columns. Reporting and Project resolve in separate passes; a missing/orphaned target or relation produces no grant. No section permission, feature permission, or cached decision is returned. |
| `canAccessSection(viewerId, section, targetEmployeeId)` | Authenticated viewer, one S1–S16 section, and one target | `SectionAccess`: `'none' \| 'read' \| 'write'` | Resolves the target live, merges applicable audience columns best-of, then applies the base section matrix. It does not grant the feature half of a mutation; callers pair a requested write with `isAllowed`. |

`canAccessSection` is the only base profile-section decision. `none` exposes no section. It does not construct an HTTP payload or decide field- and record-level visibility: Project-line S5, colleague S10/S11, S16 custom fields, and S7/S8 record flags need the separate Profile Projection work item. That work must call this facade and may only narrow its result; it may not read policy tables or infer audiences itself.

### Project-line integration gate

Project line is a separate, fail-closed branch of `resolveAudiences`. Until the timetracker assignment/freshness contract is approved and its scenario suite completes AD-1, the branch returns no Project audience; it must not infer access from stale rows, a host clock, or an assumed provider payload. This blocks only positive Project-line grants, not Self, Reporting, direct PP, or Colleague resolution.

The separate contract must define: whether assignments arrive as events or current state; the persisted assignment-end and last-successful-sync timestamps; the PostgreSQL-time rules for withdrawal within 15 minutes of an assignment ending and after four hours of failed sync; partial/intermittent-sync semantics; and its dedicated E2E matrix. Once approved, that work supplies the narrow freshness/query seam consumed by the Project-line pass; it does not widen any other audience.

### Department and PP HR-line gate

Phase 1 deliberately has no Department traversal and no PP HR-line recursion. The Reporting pass still recursively follows only `Relationship type='direct'` reports-to edges, so ordinary reporting ancestry remains available. The PP branch resolves only the employee's directly assigned `Relationship type='people_partner'` endpoint; it must not traverse from that PP to a manager.

`targetType:'department'` policies are valid stored data but yield no audience in Phase 1. Enable Department traversal or PP HR-line propagation only after an approved Department contract defines nested membership, the HR root/boundary predicate, indexes, and boundary-negative AD-1 scenarios. PP stage-2/production work additionally remains subject to AD-19's relationship-journal gate; no unrestricted `direct` recursion is an acceptable substitute.

### Request sequencing

For every request: validate session and due-departure cutoff → call the relevant facade method(s) → apply an approved owning-context field/record projection, when that endpoint has one → map denial without leaking a hidden section. A mutation requires both `isAllowed(viewerId, feature) === true` and `canAccessSection(...) === 'write'`, plus any narrower command rule. A read must not call `isAllowed` merely to turn a data-access denial into a feature denial.

## Tasks & Acceptance

**After AD-1 stages 1 and 2 are approved and the E2E suite is committed red:**

- [ ] `services/backend/prisma/schema.prisma` -- add `Policies`, `Permissions`, `UserPolicies`, extend `Relationship`; support only the `==` policy operator (no `IN` target-set representation) -- no tables exist today
- [ ] `services/backend/prisma/migrations/` -- raw SQL for partial unique and hot-path join indexes
- [ ] `src/access-control/domain/interfaces/` -- repository ports and DI tokens
- [ ] `src/access-control/domain/services/functional-permission.service.ts` -- evaluate persisted FR attachments for `isAllowed`, type-separated from the AR hot path
- [ ] `src/access-control/domain/services/audience-resolver.service.ts` -- two-pass walk, Self first, best-of merge; Reporting recursively follows only `direct` reports-to edges, PP resolves only the assigned endpoint, Department yields no audience, and Project returns no audience until its approved integration gate is satisfied
- [ ] `src/access-control/domain/services/section-access.service.ts` -- join audiences to the seeded audience→section mapping
- [ ] `src/access-control/infrastructure/` -- Prisma adapters; one query plan per graph, policy and target lookup in one transaction
- [ ] `src/access-control/application/` -- facade exposing the three methods and the exact `Facade Contract` result shapes
- [ ] `services/backend/prisma/seed.ts` -- seed equality-based AR policies, the audience→section mapping, and exactly one AD-12 bootstrap HR Admin FR attachment; do not invent `IN` policies or any other default FR permission grants pending PO confirmation
- [ ] `src/user-management/infrastructure/interim-access-control.adapter.ts` -- delete, rewire callers to the real facade
- [ ] unit tests -- every I/O matrix row, facade contract branch, five AD-20 positions, fail-closed path, merge case, and each base `SectionAccess` result

**Acceptance Criteria:**

- Given the backend repo, when searching outside `src/access-control/`, then no authorization decision is made anywhere but through the facade.
- Given 500 employees, when `resolveAudiences` gets all 500 ids, then it issues one query plan per graph within the 2-second budget.
- Given an approved stage-1 scenario, when translated to E2E, then it runs on real PostgreSQL with facade and tier resolution unfaked.
- Given any completed request, when the database is inspected, then no derived decision was persisted.
- Given persisted FR policy, permission, and user attachments, when `isAllowed` evaluates a feature, then it returns that FR decision without reading audience data; the seeded bootstrap HR Admin attachment exists exactly once.
- Given the initial facade schema and evaluator, when a policy uses `IN`, then it is not representable or evaluated; a bulk SQL lookup over requested IDs does not count as policy-level `IN`.
- Given no approved timetracker assignment/freshness contract, when `resolveAudiences` runs, then Project line contributes no audience while the remaining audience branches continue normally.
- Given Project-line grants are enabled, when a project assignment ends or timetracker sync fails, then the separately approved contract's E2E suite proves the 15-minute and four-hour withdrawal rules before this facade consumes that data.
- Given Alice reports to Bob and Bob reports to Carol, when Carol resolves Alice, then Carol receives Reporting line through the recursive `direct` reports-to walk.
- Given a Department-targeted policy row or a PP's manager chain, when Phase 1 resolves audiences, then neither contributes access beyond the directly assigned PP; enabling either path requires the Department and AD-19 gates above.
- Given any facade consumer, when it needs a feature, audience, or section decision, then it can obtain that decision only through the corresponding contract row above and cannot substitute a direct policy read or role flag.
- Given a profile or directory endpoint needs field- or record-level visibility, when this facade returns a base section decision, then its separately approved projection calls the facade and may only narrow the base result.
- Given a due departure in each AD-20 position, when the request-time facade resolves access, then it follows the five I/O-matrix outcomes without relying on worker completion.
- Given AD-1 evidence, when implementation begins, then every scenario and translated E2E named by the access-control suite has independent human approval and the E2E commit is red in history.

## Spec Change Log

- 2026-08-29 — Correct-course review: made AD-1 a strict pre-implementation sequence; defined I/O contracts for all three facade methods including fail-closed base section access; expanded AD-20 coverage from one actor case to all five architecture-defined positions; bound task/acceptance wording to these contracts.
- 2026-08-29 — Removed the unratified `projection` return shape from `canAccessSection`. Field- and record-level projection is deferred to an owning-context spec that consumes, but cannot widen, the facade result.
- 2026-08-29 — Deferred policy-level `IN`: the initial schema, seed, and evaluator support only equality. A future design must specify the target-set model and indexed query plan before enabling it.
- 2026-08-29 — Gated positive Project-line grants on a separate approved timetracker assignment/freshness contract. Before that contract and its AD-1 scenarios exist, Project line fails closed without blocking the other audience branches.
- 2026-08-29 — Defined Phase 1 audience boundaries: recursive reports-to access uses only `direct` edges; PP resolves only the assigned endpoint; Department and PP HR-line traversal remain fail-closed behind their respective approval gates.
- 2026-08-29 — Reconciled two stale I/O matrix rows against the amended facade contract (human-authorized edit inside the frozen block, not a review loopback). The Project-line row asserted narrowed cells and an S5 CV/certificate subset as facade behavior; both contradicted the Project-line integration gate and the Profile Projection carve-out. It now states that Phase 1 resolves no Project audience and that a PM with no other relation falls back to Colleague. The merge row no longer implies a Project audience is available before its gate opens.

## Design Notes

Two conceptual passes, not one graph: the reporting pass walks `Relationship type='direct'` plus department-management attachments; once its separate integration gate is satisfied, the project pass walks `type='project'` rows plus project-management attachments. Before then, the project pass returns no grant. Merging the graphs is the mistake AD-10 forbids — it silently hands Project-line reach to reports-to ancestors.

Request order: departure cutoff → Self → relationship-derived columns (project line per shared project first) → per-section best-of merge → field/record narrowing. Overlays are out of slice. A due target remains a read-only dismissed-target projection for its current manager/PP; a due relationship endpoint or recursion node is never a bridge.

## Verification

Nothing here runs in this workspace; run inside the service once the submodule is initialized and the AD-1 gate is met.

**Commands:**

- `npm run lint && npx tsc --noEmit` -- expected: clean
- `npx prisma migrate dev` -- expected: applies, including the raw-SQL index migration
- `npm run test:e2e -- access-control` -- expected: red before implementation, green after, on real PostgreSQL

**Manual checks:**

- `EXPLAIN` the resolver queries: index scans only, no sequential scan on `Relationship` or `Policies`.
