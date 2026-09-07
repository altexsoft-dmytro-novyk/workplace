---
id: SPEC-access-control-facade-audience-resolution
companions:
  - facade-contract.md
  - implementation-constraints.md
  - ../../implementation-artifacts/access-control/deferred-work.md
  - ../../../docs/architecture/access-control.md
  - ../../../docs/architecture/database-schema.md
  - ../../../docs/architecture/domain-driven-design.md
  - ../../../docs/architecture/nestjs-di-tokens.md
  - ../../../docs/architecture/testing-strategy.md
sources:
  - ../../implementation-artifacts/access-control/spec-access-control-facade-audience-resolution.md
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. The source is retained for audit; downstream work consumes this contract.

# AccessControl Facade and Phase 1 Audience Resolution

## Why

A mandate to meet: access-control correctness is the platform's primary quality attribute, yet no real `access-control` implementation exists and User Management currently grants target-scoped access to any non-empty session user. Every bounded context needs one fail-closed authorization seam before profile or feature work can safely expose personal data.

## Capabilities

- **CAP-1 — Authorization facade**
  - **intent:** Every bounded context can obtain functional-permission, audience, and base section decisions only through `AccessControl`.
  - **success:** A repository search finds no authorization decision outside the facade: no direct policy-table read, role flag, or substitute audience inference.
- **CAP-2 — Phase 1 audience resolution**
  - **intent:** An authenticated viewer can resolve Self, Reporting line, assigned PP, and Colleague audiences live for one or many target employees. **Reporting line and Project line are distinct matrix columns and distinct graph passes (v1.5 §3.1/§3.2, AD-10) — never a single merged "Manager line."**
  - **success:** The cases in `facade-contract.md` pass, including Self exclusivity, recursive direct reporting, direct-PP-only behavior, per-section best-of merge, empty bulk, and fail-closed Project/Department/PP-HR-line gates. The Project-line pass, once its freshness contract lands, resolves a **narrower** matrix than Reporting: Project-line PM/DM see **no S2 and no S3 at all**, **S5 = CV + certificates only**, and the rest identical (S6 included) per v1.5 §3.2 / §3.3.2. Those narrowed Project-line cells (S2/S3-absent, S5-narrowed) are **not** in the Phase-1 stage-1 contract — deeper cell coverage is Platform Epic 6 / `AC-SECTION-MATRIX-01`, not this slice.
- **CAP-3 — Functional permission decision**
  - **intent:** An authenticated user can receive a functional permission from persisted FR policy, permission, and attachment data independently of target audiences.
  - **success:** `isAllowed` returns the live FR decision without reading audience data, rejects due actors, and a fresh seed contains exactly one bootstrap HR Admin attachment without unapproved default grants.
- **CAP-4 — Base section access**
  - **intent:** A facade consumer can obtain a live `none`, `read`, or `write` decision for one S1–S16 section and target.
  - **success:** `canAccessSection` applies the base matrix to resolved audiences, hidden data is absent rather than null, and every owning-context projection calls the facade and can only narrow its result.
- **CAP-5 — Departure-safe authorization**
  - **intent:** Effective departures remove authority at request time even while cleanup is delayed or retrying.
  - **success:** Automated scenarios prove the actor, target, manager/PP endpoint, recursion-node, and shared-link-authority outcomes in `facade-contract.md` without relying on worker completion.

## Constraints

- AD-1 is blocking and ordered: independently human-approved stage-1 scenarios, then independently human-approved E2E committed red, then production code. This spec authors or approves neither gate artifact.
- Reporting and Project are separate passes. Phase 1 recursively follows only `direct` reports-to edges, resolves only the assigned PP endpoint, and grants nothing from Department, PP HR-line, or Project inputs until their contracts and AD-1 suites are approved.
- Self is evaluated first and is exclusive of manager columns; other simultaneous audiences merge per section by `write > read > none`.
- Missing, orphaned, broken, stale, or due-person data can only reduce access. Decisions are never persisted or cached across requests.
- Initial policies support only equality through indexed joins. Policy-level `IN`, target-set storage, and application-side set membership are excluded; internal SQL `IN` for requested IDs is allowed.
- A mutation requires both live FR permission and `write` section access plus any narrower command rule. Reads do not call FR permission merely to transform an audience denial.
- Denials are leak-safe: missing/invalid token `401`; missing feature permission or write against readable data `403`; no-access cell or hidden field `404`. Absent payload data means a missing key, never `null`.
- Bulk resolution uses one indexed query plan per graph within the platform's 500-record, 2-second response budget; empty input performs zero queries, and related policy/target reads share one transaction.
- Code obeys the dependency and DI boundaries in `implementation-constraints.md`; implementation belongs in `services/backend`, never the workspace root.
- **Resolved-pointer (2026-08-31):** the User Management consumer contract this slice's HTTP E2E depends on — including the production `ACCESS_CONTROL_PORT` rebind and the deletion of `interim-access-control.adapter.ts` named in `implementation-constraints.md` — is answered in `../../implementation-artifacts/access-control/um-integration-contract-response.md` and owned by `../spec-user-management-access-control-adoption/`. This slice stays gated behind its own approved Stage-1 scenario suite and Stage-2 red E2E, but is no longer blocked on an *unanswered* contract.

## Non-goals

- Authoring or approving AD-1 stage-1 scenarios or stage-2 E2E.
- Field/record projection for profile, list, filter, export, or search surfaces.
- Functional-role catalog management UI/API or an unapproved default-permission catalogue.
- Shared-link or full-profile overlays.
- Timetracker adapter/sync behavior, positive Project-line grants, Department traversal, or PP HR-line recursion.
- Policy-level `IN`, mentorship-derived audiences, or application code in this workspace repository.

## Success signal

After the approved red E2E gate, every context uses the facade for authorization; its meaningful positive, negative, merge, bulk, departure, and fail-closed scenarios pass on real PostgreSQL; 500-target resolution stays within two seconds; and database inspection finds no persisted derived decision.

## Open Questions

- What target-set representation, target types, cardinality, mutation rules, and indexed plan would authorize policy-level `IN`?
- **Department (implementation open):** nested membership representation, indexed traversal plan, event/state sync details. **Behavior is not open — it is normative and settled:** department management is a **Reporting-line** relation (v1.5 §2.1 relation 2, §4.17; AD-10), not "provisional because it is not in the requirements." PP HR-line propagates within the HR boundary once the traversal contract is approved.
- **Project/timetracker (implementation open):** assignment representation, freshness query seam, partial/intermittent-sync semantics. **Behavior is not open — it is normative and settled:** project-derived access withdraws within 15 minutes of assignment end and after four hours of failed sync (v1.5 §2.1, §5.1); the Project line is a **narrower** matrix than Reporting (no S2, no S3, S5 = CV + certificates only — v1.5 §3.2/§3.3.2); ordinary project membership without a PM/DM policy is **never** an audience (PM/AD-27).
- ~~Which matrix column does full-profile access map to, and how does that overlay interact with Self?~~ **RESOLVED 2026-09-02 (PM/AD-28).** The full-profile grant is **not a matrix column.** It is a separate §2.4 overlay that can only ever raise a resolved section decision `none → read`, never to `write`, never applied to an unconfirmed/inactive target; Self is unaffected (Self already reads every section). See `docs/architecture/access-control.md` §"Full-profile access overlay (§2.4)". Overlay *scenarios* are **not authored** — authoring requires an AD-1 Stage-1 dispatch (draft prose for the overlay behavior lives under `docs/test-cases/access-control-kernel/full-profile-overlay/` for Platform Epic 4 / Story 4.2c, pending approval).
