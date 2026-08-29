---
title: User Management — PRD
status: draft
created: 2026-08-20
updated: 2026-08-29
---

# User Management — PRD

## Scope

Covers the `user-management` bounded context: the `User` identity record, seeded-population import, self-service S1 operations, magic-link authentication, organisational facts, the `UserEvents` career-timeline log (§4.9), and temporal employment status/departure (§4.16). There is no registration endpoint, AD, SSO, or generic employee-deactivation product operation.

Explicitly out of scope for this PRD:
- **Timetracker integration** — separate bounded context; §5.1 provides leaves and project membership for display and access resolution.
- **Department and Project administration** — platform scope; this PRD consumes and changes employee department assignment as an organisational fact per §2.1/§4.17.
- Access-role and functional-role resolution and enforcement — owned by `access-control`.
- Mentorship workflow and pair persistence — future `mentorship` bounded context. It owns durable active/ended pairs, closure notes, availability, and departure auto-close. User Management receives only the resulting `mentorship_start`/`mentorship_end` career events through an approved cross-context application boundary.

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

System-generated event log: the system writes an entry whenever a tracked change happens. An actor may manually add, edit, or delete an event for historical backfill/correction only when they hold both applicable S9 write access and the runtime *edit the career timeline* permission. The persistence mechanism for correction belongs to architecture and must not narrow v1.5's allowed operations at BA level.

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

- **FR-1.** The very first `User` in the system is created by the population seed/import script and assigned the HR Admin functional role directly (AD-12 bootstrap). There is no HTTP user-creation / registration flow (§4.17).
- **FR-2.** Authentication is passwordless: a magic link sent to `workEmail` is the sole login mechanism for the seeded population. No password is ever stored. No SSO and no Active Directory in scope (§4.17, §10).
- **FR-3.** First and subsequent logins use the same magic-link request/consume flow. Completing seed/import does not establish a session. There is no separate invite-link or registration-form login path.
- **FR-4.** Employee population is imported from the delivered seeded timetracker list only (§4.17). Creating employees via API or UI is out of scope. `isActive` may retain the account row internally but is not a public lifecycle field or a substitute for S4 employment status.
- **FR-5.** Automatic career events cover joining, grade, position, department, FTE/subcontractor transition, extended leave, and mentorship pair start/end. Departure is excluded. Manual add/edit/delete requires applicable S9 access plus the runtime permission.
- **FR-6.** An authorized actor records departure with effective date and reason. The command is blocked while the person still manages or partners anybody. On the effective date the profile becomes read-only, open tasks are cancelled as departed, mentorships auto-close with a system note, the account deactivates, and all access held by the departed person ends immediately. CC-06 blocks implementation until scheduled state/execution is approved.

## Open Questions

1. **CC-04:** People Partner assignment persistence and write contract; business behavior is fixed, storage is not.
2. **CC-06:** scheduled-departure representation, effective-date executor, retries, and idempotency.
