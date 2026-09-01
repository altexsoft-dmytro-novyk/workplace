# User Management — `access-control-adoption/` (Epic 0)

Stage-1 scenario documents (AD-1) for **Epic 0 — Access Control Adoption**. They
mirror the dispatch entries `UMAC-1` / `UMAC-2` in
`_bmad-output/specs/spec-user-management-access-control-adoption/stories.yaml`
and answer `um-integration-contract-response.md` Q1 (the seam is the
`ACCESS_CONTROL_PORT` binding), Q2 (port shape kept, adapter UM-owned), Q3
(feature → audience/section mapping), Q4 (denials: `401` unresolved session, `403` authenticated viewer with empty audience — no "leak-free 404"), Q5
(the minimal S1-card projection ships in Story 0.1), and Q6 (seeded-UUID fixture
convention). (`UMAC-3` — the colleague deny→allow-narrowed flip — was **removed
2026-09-01** by human product decision: §3.2's S1 row is `R` for the Colleague
column, so a colleague reads the S1 identity card from Story 0.1 and there is
nothing to flip.)

Every required source for this Stage-1 package is cited across `umac-01`..`umac-06`:
this SPEC (CAP-1 / CAP-2 read half / CAP-3); AD-2 and AD-21 in
`architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md`; AD-3 in
`architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md`;
`access-control.md` denial conventions, §3.2 (S1 = `R` for Colleague), §3.3.4
(colleague whitelist), and matrix exceptions §3.3; `nestjs-di-tokens.md` (guards
are the only sanctioned port consumer; actions never inject ports);
`testing-strategy.md` (AD-1 stage separation); and
`um-integration-contract-response.md` Q1/Q2/Q4/Q5/Q6.

**Status:** `umac-01`..`umac-06` (Story 0.1) **approved 2026-09-01** by Dmytro
Novyk (Product Owner / Architect), then **revised and re-approved the same day**
when he directed folding the `{ data, canEdit }` capability envelope into
`GET /users/:id`; both entries are in
`_bmad-output/specs/spec-user-management-access-control-adoption/approvals.yaml`
(`UMAC-1-scenarios`, `stage-1-scenarios`; author = Claude Code agent, approver =
Dmytro Novyk). `umac-07`..`umac-09` (Story 0.2 write path) remain unapproved
draft and are blocked on the missing `user-management:edit` permission
(Open Decision (i) = option (a)). `author != approver` for every stage.

## The seam

The adoption seam is one line in `services/backend/src/user-management/user-management.module.ts`:
`{ provide: ACCESS_CONTROL_PORT, useClass: InterimAccessControlAdapter }`. Epic 0
rebinds it to a real `AccessControlFacade`-backed adapter in
`src/user-management/infrastructure/` and **deletes `interim-access-control.adapter.ts`
in the same change** (AD-21, no dual-running). One binding answers three routes;
behaviour is chosen per feature string inside the adapter.

| Route | Feature constant | Adapter behaviour |
| --- | --- | --- |
| `GET /users/:id` | `user-management:read` | allow **any non-empty audience** (`self` / `reporting` / `pp` / `colleague`) → `200` with `{ data, canEdit }` — `data` the **S1 identity card** (same 12 fields for every audience), `canEdit` the read-only dual-gate hint (`isAllowed(v, edit key) && canAccessSection(v, 'S1', t) === 'write'`; `false` for all until `user-management:edit` is seeded; always `false` for a colleague); unresolved session → `401` (interim resolver lax → `403`); authenticated active viewer, empty audience → `403` (no "leak-free 404" — human decision 2026-09-01) |
| `PATCH /users/:id` | `user-management:edit` | §2.2 dual gate: `isAllowed(v, edit key)` **and** `canAccessSection(v, 'S1', t) === 'write'` — **blocked on a missing permission** |
| `PUT /users/:id/photo` | `user-management:upload-photo` | Self-only (viewer id == target id) unless Product widens it |
| `GET /users`, `POST /users`, `DELETE /users/:id` | `user-management:list` / `:create` / `:deactivate` | `isAllowed` delegates straight to the facade — these three keys are exactly the ACM-1 seeded set |

**Response-body scope.** The S1-card DTO is a dedicated mapper on the
`GET /users/:id` handler only. `GET /users` (list), `POST /users`,
`PATCH /users/:id`, `DELETE /users/:id`, and `PUT /users/:id/photo` response
bodies are **unchanged** by this slice — the shared `toUserResponse` is not
rewritten. List projection is Epic 1 Story 1.5 / FR-15.

## `canAccessSection` section string

The real `AccessControlFacade.canAccessSection` takes the literal string `'S1'`
for the identity section (confirmed against
`services/backend/test/access-control/acm5-section-access.e2e-spec.ts` and the
ACM5-SA-* scenario docs — supported strings are `'S1'`, `'S10'`, `'S11'`; every
other string returns `'none'`). Phase A's `'S1'` placeholder is correct; scenario
prose and the future adapter use `'S1'` verbatim.

## Fixture convention (per `um-integration-contract-response.md` Q6)

Cases that need a **real audience** use `Bearer <token:<seeded-uuid>>` — a real
`User` row's UUID that `InterimSessionResolverAdapter` accepts unchanged
(`{ userId: persona }`) — **not** a literal persona placeholder like
`Bearer <token:Bob>` (which resolves to the non-existent string id `'Bob'` →
empty audience → `403` under the real facade via the guard; `401` once the real
session middleware lands). Stage-2 seeds real `User` rows and
real `Relationship` rows (`direct`, `people_partner`) and threads the returned
ids. The interim **session** resolver stays (Epic 2 retires it); only the interim
**access-control** adapter is deleted here.

## Colleague reads the S1 identity card (no "two-state" rule)

§3.2's S1 (Identity card) row is `R` for the Colleague column, and the matrix
legend defines Colleague as "any authenticated employee holding none of the above
roles" — so **every active authenticated viewer is at least a Colleague** and is
entitled to S1. `umac-04` is a **positive** test: colleague → `200` with the S1
card, the **same fields** as Self / reporting / PP. Story 0.1 ships the S1-card
projection (`id`, `firstName`, `lastName`, `photo`, `position`, `country`,
`city`, `workEmail`, `workPhone`, `birthDay`, `birthMonth`, `companyJoinDate`;
`ttId` / `isActive` / `customFields` / `createdAt` / `createdBy` absent). The
former "two-state" rule and adoption story `UMAC-3` were **removed 2026-09-01**.

The deferred **FR-17 Profile Projection** story (`deferred-work.md`) still owns
the *further* colleague narrowing — S10 dates-only (`GET /users/:id/leaves`), S11
project-name-only, S16 per-field visibility — on those **own surfaces**, plus
S7/S8 record flags and S1 derived-field immutability. It is no longer coupled to
`GET /users/:id`.

## Contents

| File | Story | State |
| --- | --- | --- |
| `umac-01-self-read-s1-card.md` | 0.1 | **approved 2026-09-01** (Self → 200, `{ data: S1 card, canEdit: false }`) |
| `umac-02-reporting-line-viewer-read.md` | 0.1 | **approved 2026-09-01** (reporting → 200, `{ data, canEdit: false }`) |
| `umac-03-assigned-pp-read.md` | 0.1 | **approved 2026-09-01** (PP → 200, `{ data, canEdit: false }`) |
| `umac-04-colleague-read-s1-card.md` | 0.1 | **approved 2026-09-01** (**colleague → 200, `{ data, canEdit: false }` — positive test; `canEdit` false by section access**) |
| `umac-05-unresolved-session-read-denied.md` | 0.1 | **approved 2026-09-01** (unresolved session → `401`, interim → `403` via guard; authenticated active viewer with empty audience → `403`; no "leak-free 404" — human product decision) |
| `umac-06-no-target-isallowed-delegates-to-facade.md` | 0.1 | **approved 2026-09-01** (root → allowed on `GET`/`POST` `/users` + `DELETE /users/:id` = `200`/`201`/`200`; unrelated session, Ida, **and an `HR Admin` impostor with no FR grant chain** → `403` on all three — the facade never reads `User.position`; `interim-access-control.adapter.ts` deleted in the same cutover, AD-21) |
| `umac-07-write-dual-gate.md` | 0.2 | **CONDITIONAL — blocked on the missing `user-management:edit` permission (Open Decision i)** |
| `umac-08-write-rejects-org-fields.md` | 0.2 | ready for approval (§3.2 fn 1) |
| `umac-09-photo-write-self-only.md` | 0.2 | ready for approval (Open Decision v — confirm Self-only) |
