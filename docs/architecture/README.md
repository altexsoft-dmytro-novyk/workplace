# Architecture Rules — People Management Platform

**Status: binding.** Every developer and every AI agent working in this repository reads these files **before writing any code** and follows them as primary strategy. A change that conflicts with a rule here is wrong until the rule itself is changed.

**Source of truth:** these files are rendered from the canonical architecture spine at
`_bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md`.
Every rule cites a spine decision ID (`AD-n`). To change a rule: change the spine first (with the architect), then re-render — never edit a rule file into disagreement with the spine.

**Scope:** Iteration 1, greenfield, required features only. Notifications (§4.13) and analytics (§4.14) of `docs/project-requirements.md` are out of scope.

## Files

| File | Covers | Spine IDs |
| --- | --- | --- |
| [domain-driven-design.md](domain-driven-design.md) | Bounded contexts, folder layout, entities, naming, fakes/mocks scope | AD-2, AD-5, AD-6, AD-15 |
| [testing-strategy.md](testing-strategy.md) | Three-stage gate, no self-certification, E2E definition, test data, done-means-real | AD-1, AD-3, AD-4, AD-15 |
| [access-control.md](access-control.md) | Policy engine, tier resolution, facade usage | AD-6…AD-12 |
| [database-schema.md](database-schema.md) | Core tables, constraints, ID/edge rules | AD-7, AD-11 |
| [api-conventions.md](api-conventions.md) | Router tree: resource/collection/field-group/attachment shapes | AD-14 |
| [user-management-test-decisions.md](user-management-test-decisions.md) | Approved product/test decisions for user-management (DEC-UM-001..011) | TEA 2026-08-25 |
| [nestjs-di-tokens.md](nestjs-di-tokens.md) | Ports as DI tokens, production/test wiring | AD-2, AD-3 |
| [custom-fields.md](custom-fields.md) | **Not yet decided — do not build** | — |
| [dashboards.md](dashboards.md) | **Not yet decided — do not build** | — |

## Non-negotiables (the short list)

1. No production code without a preceding approved scenario doc **and** a red E2E test (AD-1).
2. **A gate stage is never self-certified.** "Approved by a developer" means a human sees the actual scenario doc or test file and says so — an agent's review of its own prior output is not an approval, and no single dispatch writes more than one stage before stopping for that approval (AD-1, extended 2026-08-26).
3. **Fakes/mocks/stubs are scoped to a different, not-yet-built story/epic/context's dependency — never this unit's own deliverable.** If the current story or epic owns building the real thing, build it for real, following the hexagonal pattern, even if that means a new shared module. If the real implementation needs a technology choice nobody has made yet, stop and ask — don't guess, don't fake around it. A story is not done if any of its own acceptance criteria is satisfied by a fake (AD-15).
4. Domain code imports nothing from application, infrastructure, NestJS transport, Prisma, or SDKs (AD-2).
5. `application/actions/` never inject a port token directly — only `domain/services/` may; a port living in `domain/interfaces/` isn't itself a license to skip the domain service (AD-2, extended 2026-08-26).
6. Cross-context consumption goes through the target's `application/` exports only — never its `domain/`/`infrastructure/`, bounded context or shared infra module alike (AD-2, AD-5).
7. Authorization goes through the `AccessControl` facade only — no `isManager`-style flags, ever (AD-9).
8. Access roles are computed, never assigned or stored; only functional roles are assigned (AD-6).
9. Access control fails **closed**: missing data always means less access (AD-12).
