---
title: User Management — PRD
status: draft
created: 2026-08-20
updated: 2026-08-27
---

# User Management — PRD

## Scope

Covers the `user-management` bounded context: the `User` entity, self-service profile CRUD, magic-link authentication, and the `UserEvents` career-timeline log (§4.9). Employee population is imported from the seeded timetracker list (§4.17) — no registration endpoint, no AD, no SSO.

Explicitly out of scope for this PRD:
- **Timetracker integration** — separate bounded context; §5.1 provides leaves and project membership for display and access resolution.
- **Department and Project administration** — platform scope; this PRD consumes department assignment facts per §4.17.
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
| `birthDay` | int, nullable (1-31) | §3.2 S1 content is literally "birthday (day and month)" — no year is ever captured or stored, for any audience. Supersedes this PRD's earlier full-`birthDate`-with-year-redaction design, which invented an audience-based redaction rule the source doesn't state (resolved 2026-08-25) |
| `birthMonth` | int, nullable (1-12) | paired with `birthDay` — both null together (never captured) or both set together |
| `companyJoinDate` | date | |
| `isActive` | boolean, default `true` | soft delete — deactivating a user flips this rather than removing the row |
| `ttId` | string, nullable, unique | external identity placeholder per AD-13 — column reserved now, timetracker sync itself out of scope |
| `customFields` | jsonb | interim mechanism ahead of the dynamic custom-fields system (§4.1/S16, [custom-fields.md](../../../../../docs/architecture/custom-fields.md)) |
| `createdAt`, `createdBy` | timestamp, FK -> User | |

`updatedAt`/`updatedBy` deliberately dropped — no concrete consumer named for them here. Real change-history is a separate, deliberately-scoped feature, not a default add-on (see [database-schema.md](../../../../../docs/architecture/database-schema.md) Conventions).

**Deliberately not stored on `User`** (conflicts with AD-11/AD-7's "no access-derived field" rule):
- **Manager** and **current project(s)** — derived from `Relationship` rows. Reports-to is assigned via the change-organisational-relationships permission (`POST`/`DELETE /users/:id/relationships`, `type: 'direct'`), same mechanism as mentorship.
- **People Partner** — policy attachment under AD-7, not a `User` column.
- **Department** — every employee belongs to one department (§4.17); stored as org fact, not a free-text S1 field.
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

- **FR-1.** The very first `User` in the system is created by the population seed/import script and assigned the HR Admin functional role directly (AD-12 bootstrap). There is no HTTP user-creation / registration flow (§4.17).
- **FR-2.** Authentication is passwordless: a magic link sent to `workEmail` is the sole login mechanism for the seeded population. No password is ever stored. No SSO and no Active Directory in scope (§4.17, §10).
- **FR-3.** First and subsequent logins use the same magic-link request/consume flow. Completing seed/import does not establish a session. There is no separate invite-link or registration-form login path.
- **FR-4.** Employee population is imported from the seeded timetracker list only (§4.17). Creating employees via API or UI is out of scope. **Resolved 2026-08-25 (retained):** `isActive` is not a status modeled on anything in project-requirements.md — the source document never describes a deactivation feature or an active/inactive state anywhere in §1-10. It exists purely as a technical soft-delete mechanism: `UserEvents` and `Relationship` rows reference `User` by FK and must stay valid after someone leaves the company, so the row is flipped inactive rather than removed. Product decision: keep `isActive` as-is on this basis. It remains a distinct concept from S4's sourced "employment status" field (unrelated, narrower-access table, still unbuilt/deferred for this PRD) — don't conflate the two if/when S4 is eventually built.

## Open Questions

1. Account provisioning — resolved via seed import (FR-4 / FR-4a, §4.17). HTTP registration retired.
2. Department & Project CRUD — out of scope for this PRD; department entity per §4.17.
3. Reports-to hierarchy — no external sync; assignment via change-organisational-relationships permission and `POST`/`DELETE /users/:id/relationships` (`type: 'direct'`).
