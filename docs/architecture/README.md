# Architecture Rules — People Management Platform

**Status: approved-with-open-items** (People Management spine `PM`, updated 2026-09-02). Binding for developers and agents. Open items remain fail-closed; this label is not a release-readiness claim.

Every developer and every AI agent working in this repository reads these files **before writing any code** and follows them as primary strategy. A change that conflicts with a rule here is wrong until the rule itself is changed.

**Source of truth:** these files are rendered from the canonical architecture spine at
`_bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md`
(`spine_id: PM`). The Access Control Foundation spine is a separate document (`spine_id: ACF`).
New machine-readable citations use qualified refs (`PM/AD-2`, `ACF/AD-3`). Historical bare `AD-n` in these rendered files means the People Management spine unless the surrounding document is the ACF spine.
Every rule cites a spine decision ID. To change a rule: change the spine first (user-approved behavioral/security/ownership/data-contract choices recorded in the BMAD memlog), then re-render — never edit a rule file into disagreement with the spine.

**Scope:** Iteration 2 / requirements v1.5, greenfield, required features only. Notifications (§4.13) and analytics (§4.14) are good-to-have and outside required delivery. If selected, their v1.5 privacy and source-of-truth constraints still bind the design.

**Implementation baseline:** the product scope is greenfield, but the backend repository contains superseded create/deactivate/interim-authorization scaffolding. AD-21 makes v1.5 a replacement cutover, not a compatibility layer.

## Files

| File | Covers | Spine IDs |
| --- | --- | --- |
| [domain-driven-design.md](domain-driven-design.md) | Bounded contexts, folder layout, entities, naming, fakes/mocks scope | PM/AD-2, AD-5, AD-6, AD-15…AD-23 |
| [testing-strategy.md](testing-strategy.md) | Three-stage ordering (approval gate removed 2026-09-04), E2E definition, test data, ACM-9 (contract B) and DIR-A1 (contract A / `PG-04`) measurement protocols | PM/AD-1, AD-3, AD-4, AD-10, AD-15, AD-19, AD-20 |
| [access-control.md](access-control.md) | Policy engine, audience resolution, PP source, departure cutoff, denial oracle | PM/AD-6…AD-13, AD-19, AD-20, AD-24 |
| [database-schema.md](database-schema.md) | Core tables, constraints, ID/edge/lifecycle rules | PM/AD-7, AD-11, AD-16, AD-17, AD-19, AD-20, AD-22 |
| [api-conventions.md](api-conventions.md) | Router tree, PP relationship, departure, and seeded-import contracts | PM/AD-14, AD-16, AD-17, AD-19, AD-20 |
| [mentorship.md](mentorship.md) | Mentorship context boundary, routes, departure participant | PM/AD-5, AD-17, AD-23 |
| [user-management-test-decisions.md](user-management-test-decisions.md) | Approved product/test decisions for user-management (DEC-UM-001..011) | TEA 2026-08-25 |
| [nestjs-di-tokens.md](nestjs-di-tokens.md) | Ports as DI tokens, production/test wiring | AD-2, AD-3 |
| [custom-fields.md](custom-fields.md) | Typed EAV custom fields | PM/AD-32 |
| [dashboards.md](dashboards.md) | Fixed dashboard read models | PM/AD-33, AD-18 |

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
10. There is no employee-creation API: import only the provided seeded population; employment status is owned by the employment lifecycle, not `User.isActive` (AD-16, AD-22).
11. HTTP denials: invalid/inactive session `401`; hidden or missing target `404`; visible but forbidden `403` (AD-24).
12. Frontend must not duplicate access matrices; permission-sensitive queries use `staleTime: 0` and no persistent personal-data cache (AD-25).
13. Mentorship pairs are durable records with retained ended history and closure notes; they never grant an access audience (AD-17).
14. An open feature design does not reopen fixed v1.5 product semantics; follow the owning document's fixed-facts section (AD-18).
15. People Partner assignment is a fixed-cardinality organisational `Relationship`, not a policy; policy/matrix projection controls the derived PP audience's section access (AD-19).
16. Effective departure is fail-closed on every request and converges through a durable PostgreSQL-backed worker; worker delay or retry never preserves actor access (AD-20).
17. v1.5 replaces the repository's legacy create/deactivate/interim-authorization paths; there is no dual-running compatibility mode (AD-21).
