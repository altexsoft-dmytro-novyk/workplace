# User Management — `access-control-adoption/` (Epic 0)

Stage-1 scenario documents (AD-1) for **Epic 0 — Access Control Adoption**. They
mirror the dispatch entries `UMAC-1` / `UMAC-2` / `UMAC-3` in
`_bmad-output/specs/spec-user-management-access-control-adoption/stories.yaml`
and answer `um-integration-contract-response.md` Q3.

**Status:** unapproved draft (2026-09-01). Per-file human approval under the AD-1
stage-1 gate is required. **The adoption package's `approvals.yaml` does not
exist yet** — it is created on the first recorded approval; nothing here has a
prior record. `author != approver` for every stage.

## The seam

The adoption seam is one line in `services/backend/src/user-management/user-management.module.ts`:
`{ provide: ACCESS_CONTROL_PORT, useClass: InterimAccessControlAdapter }`. Epic 0
rebinds it to a real `AccessControlFacade`-backed adapter in
`src/user-management/infrastructure/` and **deletes `interim-access-control.adapter.ts`
in the same change** (AD-21, no dual-running). One binding answers three routes;
behaviour is chosen per feature string inside the adapter.

| Route | Feature constant | Adapter behaviour |
| --- | --- | --- |
| `GET /users/:id` | `user-management:read` | allow `self` / `reporting` / `pp`; deny empty set or `colleague`-only (`403`, **temporary** two-state rule) |
| `PATCH /users/:id` | `user-management:edit` | §2.2 dual gate: `isAllowed(v, edit key)` **and** `canAccessSection(v, 'S1', t) === 'write'` — **blocked on a missing permission** |
| `PUT /users/:id/photo` | `user-management:upload-photo` | Self-only (viewer id == target id) unless Product widens it |
| `GET /users`, `POST /users`, `DELETE /users/:id` | `user-management:list` / `:create` / `:deactivate` | `isAllowed` delegates straight to the facade — these three keys are exactly the ACM-1 seeded set |

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
empty audience → `403` under the real facade). Stage-2 seeds real `User` rows and
real `Relationship` rows (`direct`, `people_partner`) and threads the returned
ids. The interim **session** resolver stays (Epic 2 retires it); only the interim
**access-control** adapter is deleted here.

## Two-state colleague rule

`colleague → 403` on `GET /users/:id` is correct **only while the route returns
the whole `User` row**. The durable rule is `colleague → 200, body narrowed to
the §3.3.4 whitelist`. Every colleague scenario here (`umac-04`) records the
`403` as **explicitly temporary** and names the deferred **Profile Projection**
story (FR-17, `deferred-work.md`) as the trigger that flips it (adoption story
`UMAC-3` / `umac-03` flip — a separate three-stage AD-1 sequence). Do not harden
colleague-`403` as intended end-state.

## Contents

| File | Story | State |
| --- | --- | --- |
| `umac-01-self-read-whole-row.md` | 0.1 | ready for approval |
| `umac-02-reporting-line-viewer-read.md` | 0.1 | ready for approval |
| `umac-03-assigned-pp-read.md` | 0.1 | ready for approval |
| `umac-04-colleague-read-denied-temporary.md` | 0.1 | ready for approval (records the temporary two-state outcome) |
| `umac-05-unresolved-session-read-denied.md` | 0.1 | ready for approval |
| `umac-06-no-target-isallowed-delegates-to-facade.md` | 0.1 | ready for approval |
| `umac-07-write-dual-gate.md` | 0.2 | **CONDITIONAL — blocked on the missing `user-management:edit` permission (Open Decision i)** |
| `umac-08-write-rejects-org-fields.md` | 0.2 | ready for approval (§3.2 fn 1) |
| `umac-09-photo-write-self-only.md` | 0.2 | ready for approval (Open Decision v — confirm Self-only) |
