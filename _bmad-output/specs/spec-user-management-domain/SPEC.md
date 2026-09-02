---
id: SPEC-user-management-domain
title: User Management Domain Specification
status: canonical-domain
created: 2026-09-02
implementation_status: partial-transition
parent_requirements:
  - PM-FR-12
  - PM-FR-13
  - PM-FR-14
  - PM-FR-28
  - PM-FR-29
  - PM-FR-41
  - PM-FR-42
historical_source:
  - ../../planning-artifacts/prds/prd-user-management-2026-08-20/prd.md
companions:
  - ../spec-user-management-access-control-adoption/SPEC.md
  - ../spec-user-management-test-cases/SPEC.md
  - ../../planning-artifacts/user-management/epics.md
  - ../../implementation-artifacts/user-management/sprint-status.yaml
  - ../../../docs/architecture/user-management-test-decisions.md
---

# User Management Domain Specification

## 1. Purpose and authority

This specification is the canonical bounded-context decomposition of the People Management product PRD for `user-management`. It converts, but does not delete or rewrite, the historical User Management PRD dated 2026-08-20 and reconciled 2026-09-01.

Authority order:

1. `docs/project-requirements.md` v1.5 — normative behavior.
2. `prd-people-management-2026-08-24/prd.md` — canonical product FRs.
3. This document — canonical User Management domain boundary and consolidated behavior.
4. Approved capability specs and architecture decisions — binding within their approved scope.
5. Epics, stories, compiled specs, scenarios, tests, and sprint status — delivery evidence.

The historical aliases `UM-FR-*` are retained for traceability only. They do not form a second product-requirement namespace.

## 2. Domain boundary

User Management owns:

- The seeded `User` identity anchor and population import.
- Passwordless magic-link authentication for the seeded population.
- S1 identity-card data and self-service identity mutations.
- The `UserEvents` career-timeline log and its application write boundary.
- Platform-owned organisational fact mutations for manager, People Partner, and employee department, subject to Access Control and journal contracts.
- Temporal employment status and departure orchestration.
- Adoption of the public Access Control facade on User Management routes.

User Management does not own:

- Audience, section-access, or functional-permission evaluation (`access-control`).
- Mentorship availability, pairs, closure notes, or pair history (`mentorship`).
- Timetracker synchronization and project-line source data.
- Department administration UX or the department aggregate.
- Broader profile sections, directory engine, dashboards, resourcing, or campaigns.

Cross-context calls use exported `application/` boundaries. No context reaches into another context's domain or infrastructure.

## 3. Core invariants

### 3.1 Identity and population

- `workEmail` is trimmed and lowercased before validation, storage, lookup, and uniqueness comparison.
- ACM-0 creates one active root User before Access Control bootstrap and population import.
- Import reuses an existing normalized-email identity, including the root User; it never creates a second row for an active or inactive match.
- Population comes only from the delivered seeded test list.
- There is no employee-registration product flow, Active Directory provisioning, or SSO.
- `User.isActive` is an internal account/row-retention field, not employment status or a generic deactivation capability.
- `ttId` is the durable Timetracker identity placeholder; email alone is not cross-system identity.

### 3.2 Data not stored as User scalars

Manager, People Partner, department, projects, and mentor are not access-derived scalar fields on `User`:

- Manager and People Partner are platform-owned organisational facts.
- Department membership references the department context.
- Projects come from Timetracker.
- Mentor and mentees come from Mentorship.

### 3.3 Authorization

- Every User Management controller authorizes through the real `AccessControlFacade` via the User Management port; no role-name checks or policy-table reads are allowed.
- Every mutation requires both a functional permission and target section `write` access, plus command-specific restrictions.
- Manager, People Partner, and department are never writable through S1.
- Photo write is Self-only under the approved adoption decision and uses `user-management:edit`; no separate photo permission exists.
- Missing, inactive, or unresolved identities fail closed.
- HTTP denials follow the product oracle (PM-FR-4 / requirements §3.3 rule 8): `401` invalid or inactive session; `404` missing or hidden-existence target with a leak-free body; `403` visible resource but forbidden feature or action. Lists omit invisible rows. Hidden-target `404` precedes mutation permission checks. This resolves CONFLICT-UM-01 at product/domain level. Historical UMAC empty-audience `403` evidence is stale and is not rewritten.

### 3.4 Career timeline

- Automatic types include join, grade, position, department, employment-type, extended-leave, mentorship-start, and mentorship-end events.
- Departure is not a career event.
- Manual add/edit/delete requires the runtime permission and the narrowed write audience: assigned People Partner or direct Unit Manager.
- Project-derived and transitive managers may read but not manually mutate the timeline.
- Other contexts append events only through the User Management application boundary, in the shared transaction required by architecture.

### 3.5 Employment lifecycle

- Employment status is a time-bounded `active` or `dismissed` business fact, distinct from `User.isActive` and risk level `leaver`.
- Departure records an effective date and reason.
- Recording is blocked while the person still manages or partners anybody through platform-owned manager, department-manager, or People Partner relationships.
- At the effective date the profile becomes read-only; only open action items **assigned to** the departing person are cancelled as departed (items they authored for other active assignees remain open); Mentorship clears availability and excludes dismissed people from the pool; active mentorships system-close; the account deactivates; and access held by the person ends immediately.
- Future scheduling, retries, idempotency, and shared transaction behavior remain blocked on CC-06 **implementation** (design is PM/AD-20/22/23). Dependent blockers: CC-07, CC-08, CC-09 implementation, OPERATIONAL-ENVELOPE, and AD-23 participants.

## 4. Capabilities and traceability

| Capability | Canonical parents | Historical aliases | Delivery owner | Current state |
|---|---|---|---|---|
| Seed/root identity and population import | PM-FR-12, PM-FR-14 | UM-FR-1, UM-FR-4 | UM-E1 / ACM-0 prerequisite | specified; root prerequisite implemented |
| Magic-link authentication | PM-FR-12–13 | UM-FR-2, UM-FR-3 | UM-E2 | specified |
| S1 identity card and Self mutations | PM-FR-12–14 | UM-FR-9 | UM-E1 | partial legacy implementation |
| Access Control facade adoption | PM-FR-1–4, PM-FR-12 | UM-FR-16 | UM-E0 / UMAC-1–2 | in-progress |
| Further audience-safe projection | PM-FR-3–5, PM-FR-12 | UM-FR-17 | deferred work | deferred |
| Career timeline | PM-FR-28–29 | UM-FR-5 | UM-E3 | specified; section gate missing |
| Organisational relationship mutations | PM-FR-7, PM-FR-40, PM-FR-42 | UM-FR-7 | UM-E4 | blocked |
| Employment/departure lifecycle | PM-FR-41 | UM-FR-6 | UM-E5 | blocked |

## 5. API and projection contracts

Target architecture routes include:

- `GET /users`, `GET /users/:id`, `PATCH /users/:id`, `PUT /users/:id/photo`
- Magic-link request/consume routes
- Career timeline routes under `/users/:id/events`
- Organisational relationship routes under `/users/:id/relationships`
- Departure and re-parenting routes under `/users/:id/departures` and `/users/:id/departure-reparenting`

Current runtime code exposes `GET/POST/PATCH/DELETE /users` plus photo upload. `POST /users` and `DELETE /users/:id` are transition debt, not target product contracts.

`GET /users/:id` target contract:

- Any active viewer over an active target is at least Colleague and receives the S1 card.
- Response is `{ data, canEdit }`. `user-management` owns the envelope (PM/AD-34); AccessControl computes `canEdit` as the dual-gate projection.
- `data` contains only `id`, `firstName`, `lastName`, `photo`, `position`, `country`, `city`, `workEmail`, `workPhone`, `birthDay`, `birthMonth`, and `companyJoinDate` until derived S1 fields have approved cross-context read contracts.
- `ttId`, `isActive`, `customFields`, `createdAt`, and `createdBy` are excluded.
- `canEdit` is an informational projection of the same dual gate enforced by the write route.

## 6. Open conflicts and gates

| ID | State | Impact |
|---|---|---|
| CONFLICT-UM-01 | Resolved at product/domain | Live oracle is 401/404/403 (requirements §3.3 rule 8, PM-FR-4). Historical UMAC `403` and historical UM PRD `404` artifacts are not rewritten. Runtime still diverges (interim target check always allows; guard maps deny to `403`; missing user is `404`). New tests follow the live oracle after AD-1 sweep. |
| CC-04 | Open (design resolved) | Storage/write contract is PM/AD-19. Remaining: PUT/DELETE people-partner routes and AccessJournal enrolment (PM/AD-29). |
| CC-06 | Open (design resolved) | Aggregate/executor/participant contract is PM/AD-20/22/23. Remaining: implementation, fencing/idempotency proof, operational release gate. Not departure-ready while CC-07/08/09 implementation and OPERATIONAL-ENVELOPE remain open. |
| CC-07 | Open (design approved) | AccessJournal schema is PM/AD-29. Table and same-transaction enrolment are absent. |
| OQ-PERM-01 | Open | Default role-to-permission matrix requires a later PO batch. Do not invent grants. |
| OQ-AC-EDIT | Partially decided, not delivered | Approved adoption chooses a new Access Control seed sequence for `user-management:edit`; writes remain blocked until production evidence exists. |
| S9 section increment | Open delivery dependency | Manual career-event Stage 2 cannot proceed until the facade supports S9. |

## 7. Implementation evidence snapshot

As of 2026-09-02:

- Backend context exists at `services/backend/src/user-management/`.
- Basic User list/read/edit/photo and legacy create/deactivate actions exist.
- Production still binds `InterimAccessControlAdapter` and `InterimSessionResolverAdapter`. Target-scoped `isAllowedForTarget` currently returns `Boolean(userId)` (ungated). `AccessControlGuard` maps deny to `403`. Missing user on get/edit is `404`. This does **not** implement the 401/404/403 product oracle.
- Access Control adoption Story 0.1 is in progress; Story 0.2 is backlog.
- Career timeline, organisational relationship mutation, and departure APIs/models are not implemented.
- Scenario and committed-red E2E artifacts exist for planned slices; they are contract evidence, not proof of shipped behavior.
- Frontend People Management features are not implemented.

## 8. Quality gates

- Scenario prose → independently approved committed-red E2E → independently approved production implementation.
- Negative authorization checks must prove absence from API payloads, not only hidden UI.
- Tests for a capability do not substitute for manual validation of cross-context journeys, access revocation timing, and operational failure behavior.
- This domain is not complete while transition debt or open P0 authorization/projection gaps remain.

## 9. Success criteria

User Management conforms when legacy create/deactivate behavior is retired, real session and Access Control adapters are active, every read uses the required audience-safe projection, every mutation applies the dual gate, population/authentication/timeline/relationships/departure behavior matches this spec, and all applicable AD-1 gates pass.
