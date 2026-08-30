# Architecture Rules — People Management Platform

**Status: binding.** Every developer and every AI agent working in this repository reads these files **before writing any code** and follows them as primary strategy. A change that conflicts with a rule here is wrong until the rule itself is changed.

**Source of truth:** these files are rendered from the canonical architecture spine at
[`_bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-30/ARCHITECTURE-SPINE.md`](../../_bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-30/ARCHITECTURE-SPINE.md).
Every rule cites a spine decision ID (`AD-n`). To change a rule: change the spine first, then re-render — never edit a rule file into disagreement with the spine.

**Scope:** `user-management` and `access-control` bounded contexts only, redesigned from scratch on 2026-08-30 at the user's direction (prior architecture decisions removed, full autonomy on the redesign, requirements/test-architecture kept). Every other bounded context (dashboards, resourcing, risks, feedback, CDS, mentorship-as-a-context, campaigns, notifications, analytics, custom-fields, PeopleForce) remains undecided — see the spine's Deferred section.

## Files

| File | Covers | Spine IDs |
| --- | --- | --- |
| [domain-driven-design.md](domain-driven-design.md) | Bounded contexts, folder layout, cross-context boundary, fakes/mocks scope | AD-1, AD-2, AD-3 |
| [testing-strategy.md](testing-strategy.md) | Three-stage gate, no self-certification, E2E definition, test data, ownership — process policy, not tied to this spine's numbering | — |
| [database-schema.md](database-schema.md) | Core tables, CAS/journal rules, departure/employment-status shapes | AD-5 through AD-11, AD-15, AD-16, AD-18 through AD-21, AD-26, AD-27 |
| [api-conventions.md](api-conventions.md) | Router tree, denial convention | AD-23, AD-25 |
| [user-management-test-decisions.md](user-management-test-decisions.md) | Approved product/test decisions for user-management (DEC-UM-001..012) | TEA 2026-08-25 |
| [nestjs-di-tokens.md](nestjs-di-tokens.md) | Ports as DI tokens, module-boundary corollary | AD-1, AD-3 |
| [custom-fields.md](custom-fields.md) | **Not yet decided — do not build** | — |
| [dashboards.md](dashboards.md) | Engine undecided; out of scope for this reset | — |

## Non-negotiables (the short list)

1. No production code without a preceding approved scenario doc **and** a red E2E test (see testing-strategy.md's three-stage gate).
2. **A gate stage is never self-certified.** A human sees the actual scenario doc or test file and says so; no single dispatch writes more than one stage before stopping for approval.
3. **Fakes/mocks/stubs are scoped to a different, not-yet-built story/epic/context's dependency — never this unit's own deliverable.**
4. Domain code imports nothing from application, infrastructure, NestJS transport, Prisma, or SDKs (AD-1).
5. `application/actions/` never inject a port token directly — only `domain/services/` may (AD-1).
6. Cross-context consumption goes through the target's `application/` exports only — never its `domain/`/`infrastructure/` (AD-2).
7. `AccessControlModule` imports only the narrow `UserManagementQueryModule`, never `UserManagementModule` itself — keeps the two dependency edges from becoming a NestJS module cycle (AD-3).
8. Authorization goes through the `AccessControl` facade only — no `isManager`-style flags, ever (AD-9).
9. Access roles are computed, never assigned or stored; only functional roles are assigned (AD-4, AD-9).
10. Access control fails **closed**: missing or malformed data always means less access (AD-4).
11. There is no employee-creation API: import only the provided seeded population (AD-25).
12. Functional-role permissions are a closed catalog — no admin-facing create-permission path (AD-9).
13. Full profile access is a separate grant, resolves to read-only override, never bundled with a functional role (AD-10, AD-27).
14. Departure: scheduling and applying are distinct; the executor is idempotent and never blind-overwrites a concurrent human write (AD-15, AD-16, AD-17).
