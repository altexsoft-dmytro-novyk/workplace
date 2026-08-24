---
title: User Management — PRD
status: draft
created: 2026-08-20
updated: 2026-08-22
---

# User Management — PRD

## Scope

Covers the `user-management` bounded context (per [domain-driven-design.md](../../../../../docs/architecture/domain-driven-design.md)): the `User` entity, self-service profile CRUD, a temporary magic-link signup/login mechanism ahead of SSO, and the `UserEvents` career-timeline log (§4.9).

Explicitly out of scope for this PRD:
- **Timetracker integration** — deferred (separate future integration; per project-requirements.md §5.1 it provides leave/vacation balances and reported working days only — no hierarchy data, so it has no bearing on reports-to; corrects an earlier draft of this PRD that conflated the two).
- Department and Project creation/assignment — HR-Admin-gated, covered under access-control/policies.
- Access-role and functional-role resolution and enforcement — owned by `access-control`.
- Mentorship **workflow** (status tracking beyond active/ended, notifications) — future `mentorship` bounded context. The pairing *fact* itself is in scope: `Relationship.type='mentorship'`, assigned/revoked through the generic attachment endpoint (`POST`/`DELETE /users/:id/relationships`, architecture spine AD-11/AD-14) the same way project membership is — see Data Model note below. Attach/detach fires the `mentorship_start`/`mentorship_end` `UserEvents`.

## Data Model — User entity

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
| `birthDate` | date, nullable | full date incl. year stored; §3.2 shows only day+month — year redaction for non-privileged audiences is an access-control/presentation concern, not a storage one |
| `companyJoinDate` | date | |
| `isActive` | boolean, default `true` | soft delete — deactivating a user flips this rather than removing the row |
| `ttId` | string, nullable, unique | external identity placeholder per AD-13 — column reserved now, timetracker sync itself out of scope |
| `customFields` | jsonb | interim mechanism ahead of the dynamic custom-fields system (§4.1/S16, [custom-fields.md](../../../../../docs/architecture/custom-fields.md)) |
| `createdAt`, `createdBy` | timestamp, FK -> User | |

`updatedAt`/`updatedBy` deliberately dropped — no concrete consumer named for them here. Real change-history is a separate, deliberately-scoped feature, not a default add-on (see [database-schema.md](../../../../../docs/architecture/database-schema.md) Conventions).

**Deliberately not stored on `User`** (conflicts with AD-11/AD-7's "no access-derived field" rule):
- **Manager** and **current project(s)** — derived from `Relationship` rows (existing `reportsTo`/`project` edges). No external sync feeds reports-to (see Scope note above) — assignment is a manual HR-Admin operation, in scope for this PRD: `POST`/`DELETE /users/:id/relationships` (`type: 'direct'`), the same generic attachment mechanism as mentorship pairing below.
- **People Partner** — an access role per §2.1, "arises from assignment" the same way Manager access does; a policy attachment under AD-7, not a `User` column.
- **Department** — deferred to policies/department-edge work (pending architect decision).
- **Mentor** — not a scalar field: `Relationship.type='mentorship'` (architecture spine AD-11), the same treatment as Manager/current-project. Start/end are not new columns — they're the existing `UserEvents.mentorship_start`/`mentorship_end`, fired on attach/detach. Status beyond active/ended awaits the future `mentorship` context.

## Data Model — UserEvents (career timeline, §4.9)

System-generated event log: the system writes an entry whenever a tracked change happens to a `User`. PP and UM may also add or soft-delete entries manually (historical backfill; correcting an event the system inferred wrongly). An event is an immutable fact — a correction soft-deletes the wrong entry and appends a new one, never an in-place edit.

| Field | Type | Notes |
|---|---|---|
| `id` | uuidv7 | |
| `userId` | FK -> User | the join — no field needed on `User` itself, `id` is already the key |
| `type` | string | not DB-enforced as an enum — e.g. `joined_company`, `grade_change`, `position_change`, `department_change`, `employment_type_change`, `extended_leave`, `mentorship_start`, `mentorship_end` |
| `eventDate` | date | |
| `details` | jsonb | type-specific payload, e.g. `grade_change: {from, to}`. `department_change` and `mentorship_start/end` payloads reference ids from contexts that don't exist yet — reserved, unpopulated until then |
| `source` | `system` \| `manual` | |
| `deletedAt` | timestamp, nullable | soft delete — including superseding a wrongly-inferred event with a corrected one |
| `createdAt`, `createdBy` | timestamp, FK -> User | |

No `updatedAt`/`updatedBy` — an event is an immutable fact, not a mutable record (see Conventions in [database-schema.md](../../../../../docs/architecture/database-schema.md)).

**Future consideration (not a blocker):** writes come from an automated mechanism reacting to changes across other contexts (grade/department/mentorship) — genuinely cross-cutting. Kept inside `user-management` because AD-2 bars a context from directly querying another context's tables, and the profile page needs a plain `User` ⋈ `UserEvents` read; splitting this out would break that. Revisit only if a design emerges that doesn't need the join.

## Functional Requirements — Account & Authentication

- **FR-1.** The very first `User` in the system is created by a seed script and assigned the HR Admin functional role directly (AD-12 bootstrap) — not through the registration flow below.
- **FR-2.** Authentication is passwordless: a magic link sent to `workEmail` is the sole login mechanism (temporary, ahead of SSO). No password is ever stored.
- **FR-3.** Completing the registration form does not log the user in directly — it triggers the same magic-link email used for every subsequent login. There is no separate "invite link" mechanism.
- **FR-4.** Resolved: HR Admin submits the registration form on the new hire's behalf (not self-registration). `isActive` alone is sufficient — no intermediate "not yet activated" state is needed, since HR Admin-entered records go straight to `isActive: true` and the magic link (FR-3) is the activation-equivalent step. Note: an invited/active/deactivated-style status is **not** in the requirements doc — that was my own speculation about a possible consequence, not a sourced requirement. The real S4/S6/S10/S13 statuses (employment, risk, leave, mentorship) are unrelated, different tables.

## Open Questions

1. ~~Account provisioning~~ — resolved (FR-1..FR-4).
2. ~~Department & Project CRUD~~ — **closed**: out of scope for this PRD, confirmed HR-Admin/policy work.
3. ~~Reports-to hierarchy scope~~ — resolved: not tied to timetracker (earlier draft conflated the two, corrected 2026-08-22). No external sync exists; manual HR-Admin assignment via the generic relationship endpoint (`type: 'direct'`) is in scope, same treatment as mentorship pairing.
