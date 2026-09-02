---
title: User Management — PRD
status: historical
created: 2026-08-20
updated: 2026-09-02
superseded_by: _bmad-output/specs/spec-user-management-domain/SPEC.md
---

# User Management — PRD

> **Historical record.** Retained for decision and requirements traceability.
> Do not use this document for new requirements or implementation dispatch.
> Use the canonical People Management PRD and
> `_bmad-output/specs/spec-user-management-domain/SPEC.md`.

> **Stale relative to 2026-09-02 architecture (do not rewrite body as if current).**
> CC-04 / People Partner design is resolved by PM/AD-19; remaining work is
> implementation and AccessJournal enrolment (PM/AD-29). CC-06 / departure design
> is resolved by PM/AD-20, PM/AD-22, PM/AD-23; remaining work is implementation
> and named dependent blockers. Live authority is the canonical PM PRD, UM domain
> SPEC, and PM spine — not this historical file.
>
> **Reconciled 2026-09-01** (sprint-change-proposal-2026-09-01-user-management-access-control-alignment).
> The v1.5 BA alignment of this PRD was applied by the 2026-08-29 correct course
> and is not re-litigated here. This pass folds in two deltas only: (a) the
> **Access Control adoption** contract now that the Kernel MVP is built but
> headless, and (b) **kernel-reality constraints** on the seed/import and S1
> write paths (ACM-0/DEC-UM-007 canonical-at-write, DEC-UM-009, the §2.2 dual
> gate, the CC-07 journal gate). Nothing here is approved; regenerated
> downstream artifacts are `draft`.

## Scope

Covers the `user-management` bounded context: the `User` identity record, seeded-population import, self-service S1 operations, magic-link authentication, organisational facts, the `UserEvents` career-timeline log (§4.9), and temporal employment status/departure (§4.16). There is no registration endpoint, AD, SSO, or generic employee-deactivation product operation.

**Access Control adoption seam.** Every `user-management` controller authorizes through the real `AccessControlFacade` via the `ACCESS_CONTROL_PORT` binding in `user-management.module.ts` — never a direct policy-table read or role flag (AD-9). The Kernel MVP composes `AccessControlModule` into `AppModule` (ACM-8) but the port is still bound to `InterimAccessControlAdapter`; replacing it with a real facade-backed adapter in `src/user-management/infrastructure/` and deleting the interim adapter in the same cutover (AD-21) is a User Management-owned slice — see FR-7 and the authoritative contract `_bmad-output/specs/spec-user-management-access-control-adoption/SPEC.md`.

Explicitly out of scope for this PRD:
- **Timetracker integration** — separate bounded context; §5.1 provides leaves and project membership for display and access resolution.
- **Department and Project administration** — platform scope; this PRD consumes and changes employee department assignment as an organisational fact per §2.1/§4.17.
- Access-role and functional-role resolution and enforcement — owned by `access-control`.
- Mentorship workflow and pair persistence — future `mentorship` bounded context. It owns durable active/ended pairs, closure notes, availability, and departure auto-close. User Management receives only the resulting `mentorship_start`/`mentorship_end` career events through an approved cross-context application boundary.

## Data Model — User entity

**Identity is canonical at write (DEC-UM-007, reconciled to kernel reality).** `workEmail` is trimmed and lowercased before validation, storage, lookup, and uniqueness comparison. The value is **stored normalized** so storage itself is canonical; the DB `users_workEmail_key` index is on the raw stored value, so normalized uniqueness is a **writer-side** guarantee and a database-enforced functional unique index is separately gated deferred work (`_bmad-output/implementation-artifacts/access-control/deferred-work.md`). The seed/import writer, not just the lookup path, applies this normalization (previously the seed stored `ROOT_WORK_EMAIL` verbatim).

**Root User already exists before import (ACM-0 / DEC-UM-009).** `npm run db:seed` (the ACM-0 deploy-time step) creates exactly one active root `User` whose normalized `workEmail` equals the normalized `ROOT_WORK_EMAIL`, before the Access Control bootstrap and before Story 1.1's population import run. An import that covers the root person **reuses that existing root `User` id** — no writer inserts a second row for a normalized email that already exists, active or inactive (DEC-UM-009). Deployment order is `db:deploy` → `db:seed` → `db:bootstrap:access-control` → `start:prod`.

One `User` record per person. Field list extracted from §3.2 (S1 Identity card) of [project-requirements.md](../../../../../docs/project-requirements.md), adjusted through discussion:

| Field | Type | Notes |
|---|---|---|
| `id` | uuidv7 | |
| `firstName`, `lastName` | string | split from the source doc's single "full name" |
| `photo` | string, nullable | the one Self-writable identity-card field per §3.2 |
| `position` | string | |
| `country`, `city` | string | |
| `workEmail` | string, unique | account identity — the magic-link login identity (FR-2) |
| `workPhone` | string, nullable | |
| `birthDay` | int, nullable (1-31) | §3.2 S1 content is literally "birthday (day and month)" — no year is ever captured or stored, for any audience. Supersedes this PRD's earlier full-`birthDate`-with-year-redaction design, which invented an audience-based redaction rule the source doesn't state (resolved 2026-08-25) |
| `birthMonth` | int, nullable (1-12) | paired with `birthDay` — both null together (never captured) or both set together |
| `companyJoinDate` | date | |
| `isActive` | boolean, default `true` | internal account/row-retention flag; not employment status and not exposed as a generic deactivation capability |
| `ttId` | string, nullable, unique | external identity placeholder per AD-13 — column reserved now, timetracker sync itself out of scope |
| `customFields` | jsonb | interim mechanism ahead of the dynamic custom-fields system (§4.1/S16, [custom-fields.md](../../../../../docs/architecture/custom-fields.md)) |
| `createdAt`, `createdBy` | timestamp, FK -> User | |

`updatedAt`/`updatedBy` deliberately dropped — no concrete consumer named for them here. Real change-history is a separate, deliberately-scoped feature, not a default add-on (see [database-schema.md](../../../../../docs/architecture/database-schema.md) Conventions).

**Deliberately not stored on `User`** (conflicts with AD-11/AD-7's "no access-derived field" rule):
- **Manager** and **current project(s)** — organisational/project facts, not scalar identity fields. Reports-to changes use the dedicated organisational-relationships permission and screen; project membership comes from timetracker sync. Neither uses mentorship persistence.
- **People Partner** — organisational assignment fact, not a `User` column. Its persistence/write contract remains blocked on CC-04 and must not be inferred here.
- **Department** — every employee belongs to one department (§4.17); stored as org fact, not a free-text S1 field.
- **Mentor** — not a scalar field and not a generic `Relationship`; the mentorship context owns durable pairs and emits start/end career events.

## Data Model — UserEvents (career timeline, §4.9)

System-generated event log: the system writes an entry whenever a tracked change happens. An actor may manually add, edit, or delete an event for historical backfill/correction only when they hold both applicable S9 write access and the runtime *edit the career timeline* permission. **S9 manual-mutation write access is narrower than S9 read (DEC-UM-001):** the full reporting line, project line, and PP may *read* the timeline, but **manual add / correct / delete is limited to the assigned People Partner and the employee's direct Unit Manager** — project-derived DM/PM and transitive managers are read-only for manual mutation (§4.9 is the more specific workflow rule; §3.2 S9 governs the broader read). This is the §2.2 dual gate plus a §3.3 matrix exception: both the *edit the career timeline* permission and the narrowed S9 write audience must hold. The persistence mechanism for correction belongs to architecture and must not narrow v1.5's allowed operations at BA level.

| Field | Type | Notes |
|---|---|---|
| `id` | uuidv7 | |
| `userId` | FK -> User | the join — no field needed on `User` itself, `id` is already the key |
| `type` | string | not DB-enforced as an enum — e.g. `joined_company`, `grade_change`, `position_change`, `department_change`, `employment_type_change`, `extended_leave`, `mentorship_start`, `mentorship_end` |
| `eventDate` | date | |
| `details` | jsonb | type-specific payload, e.g. `grade_change: {from, to}`. `department_change` and `mentorship_start/end` payloads reference ids from contexts that don't exist yet — reserved, unpopulated until then |
| `source` | `system` \| `manual` | |
| `deletedAt` | timestamp, nullable | retained-history implementation field when the approved architecture uses soft deletion |
| `createdAt`, `createdBy` | timestamp, FK -> User | |

Whether manual correction updates in place or preserves a superseded row is an architecture decision; the externally visible operation must support the v1.5 add/edit/delete behavior.

**Cross-context rule:** grade, department, employment-type, leave, and mentorship owners invoke the User Management application boundary to append their required events. Departure is explicitly not a career-timeline event.

## Data Model — EmploymentStatus (§4.16)

Employment status is a time-bounded business fact with values `active` and `dismissed`. It is distinct from `User.isActive` and from the predictive `leaver` risk level. A departure command records an effective date and reason; representing a future scheduled change and executing it at the effective date remain blocked on CC-06.

## Functional Requirements

- **FR-1.** The very first `User` in the system is created by the ACM-0 deploy-time seed (`npm run db:seed`) as a single active row with a **normalized-stored** `workEmail` (DEC-UM-007 canonical-at-write); the Access Control bootstrap (ACM-1, `db:bootstrap:access-control`) then attaches the seeded `hr-admin` FR policy to it (AD-12 bootstrap). Story 1.1's population import runs after both and **reuses the root `User` id** for the root person rather than inserting a second row (DEC-UM-009). There is no HTTP user-creation / registration flow (§4.17); `POST /users` is retired (AD-14/AD-16/AD-21).
- **FR-2.** Authentication is passwordless: a magic link sent to `workEmail` is the sole login mechanism for the seeded population. No password is ever stored. No SSO and no Active Directory in scope (§4.17, §10).
- **FR-3.** First and subsequent logins use the same magic-link request/consume flow. Completing seed/import does not establish a session. There is no separate invite-link or registration-form login path.
- **FR-4.** Employee population is imported from the delivered seeded timetracker list only (§4.17). Creating employees via API or UI is out of scope. `isActive` may retain the account row internally but is not a public lifecycle field or a substitute for S4 employment status.
- **FR-5.** Automatic career events cover joining, grade, position, department, FTE/subcontractor transition, extended leave, and mentorship pair start/end. Departure is excluded. Manual add/edit/delete requires applicable S9 access plus the runtime permission.
- **FR-6.** An authorized actor records departure with effective date and reason. The command is blocked while the person still manages or partners anybody. On the effective date the profile becomes read-only, open tasks are cancelled as departed, mentorships auto-close with a system note, the account deactivates, and all access held by the departed person ends immediately. CC-06 blocks implementation until scheduled state/execution is approved.
- **FR-16 (Access Control adoption).** Every `user-management` controller authorizes target-scoped `/users/:id` access through the real `AccessControlFacade` via `ACCESS_CONTROL_PORT`; the interim adapter (`interim-access-control.adapter.ts`) is removed in the same cutover (AD-21, no dual-running). `isAllowed(userId, feature)` for the three no-target features already in use (`user-management:create`, `user-management:deactivate`, `user-management:list` — exactly the ACM-1 seeded keys) delegates straight to the facade, so those routes keep working for the seeded HR-Admin session and fail closed otherwise. `GET /users/:id` returns `200` with the **S1 identity card** for **any** active viewer over an active target — Self, reporting line, assigned People Partner, **or colleague** (§3.2's S1 row is `R` for the Colleague column, and every active authenticated viewer is at least a Colleague); the only denial is an empty audience set → **leak-free `404`** (`401` still covers a missing/invalid token). The S1-card projection (`id`, `firstName`, `lastName`, `photo`, `position`, `country`, `city`, `workEmail`, `workPhone`, `birthDay`, `birthMonth`, `companyJoinDate` — dropping `ttId`, `isActive`, `customFields`, `createdAt`, `createdBy`) replaces `toUserResponse`'s whole-row spread and ships in adoption Story 0.1. Makes the aspirational NFR-4 concrete and testable. Authoritative per-route contract: `_bmad-output/specs/spec-user-management-access-control-adoption/SPEC.md`.
- **FR-17 (Profile Projection).** The *further* audience-narrowed views beyond the S1 card — the colleague S10 dates-only view (own route `GET /users/:id/leaves`), the colleague S11 project-name-only view, S16 per-field custom-field visibility, S7/S8 record flags, and S1 derived-field immutability enforcement — are their own deliverable (split out in `_bmad-output/implementation-artifacts/access-control/deferred-work.md`). It calls the facade and only narrows the base section result; it never reads policy tables or derives audiences. It is **no longer coupled to `GET /users/:id`** and triggers no colleague decision — the colleague read is the positive S1 card from Story 0.1. (The former "flip colleague deny → allow-narrowed" trigger and adoption story UMAC-3 are removed — human product decision 2026-09-01.)
- **FR-9 refinement (S1 write dual gate).** *(FR-9 is the epics.md derived requirement; refined here.)* `PATCH /users/:id` and `PUT /users/:id/photo` require **both** the functional permission **and** `write` S1 section access over the target (§2.2 dual gate, `access-control.md`). Photo write is **Self-only** unless Product widens it (open decision). Manager, People Partner, and department are **not writable through S1** for any audience (§3.2 fn 1, cross-ref) — those change only through Epic 4's dedicated organisational-relationship screen; `EditUserAction`/`UpdateUserDto` reject them explicitly. The dual gate for `PATCH`/`PUT photo` cannot be completed today: no `user-management:edit` (and no photo) permission is seeded — see Open Questions.

## Open Questions

1. **CC-04:** People Partner assignment persistence and write contract; business behavior is fixed, storage is not.
2. **CC-06:** scheduled-departure representation, effective-date executor, retries, and idempotency.
3. **CC-07 (AD-19 Journal gate):** the immutable relationship/access-journal schema, snapshot payload, reader authorization, and transaction-enrolment contract. The **PP write path (Epic 4 Story 4.2) and the atomic-journal half of Stories 4.1 / 4.3 are blocked on CC-04 AND CC-07** — not CC-04 alone. `UserEvents` is not a journal substitute. The facade *reading* `Relationship type='people_partner'` to resolve the PP audience is not blocked.
4. **Missing `user-management:edit` permission (adoption open decision 1).** The seeded FR catalog is exactly `user-management:create/deactivate/list` (ACM-1). There is no `user-management:edit` and no photo permission, so the FR-9 dual gate for writes cannot pass under the real facade. Option (a, recommended): Access Control adds the permission(s) via a new three-stage AD-1 seed sequence in the kernel package, and the adoption write path consumes it. Option (b): adopt `READ` now, keep `EDIT`/`UPLOAD_PHOTO` on a narrow `// INTERIM` rule in the real adapter with a recorded expiry trigger. Final call is the human's — see the consolidated proposal §7.
