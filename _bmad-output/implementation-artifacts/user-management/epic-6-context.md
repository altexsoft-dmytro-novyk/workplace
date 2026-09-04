# Epic 6 Context: Current-State Read Endpoints

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Epics 1–5 shipped the write paths for organisational facts (manager, People
Partner, department, department manager) and for departure, but the only way to
read a current value is the response body of the mutation that just set it. The
already-shipped G4/G5 frontend can therefore change a relationship or schedule a
departure but cannot display the current one, cannot obtain the
`relationshipId` / `departureId` a follow-up mutation needs, and renders every
actor/subject id in the access journal and the departure blocker panel as a raw
UUID. This epic adds six independent User-Management-owned read endpoints (plus a
photo delete) that only observe state Epics 1–5 already persist — no new product
behaviour, no new writes, no journal rows. It closes concrete gaps the frontend
is currently working around.

## Stories

- Story 6.1: Read an Employee's Current Reporting-Line Manager and People Partner
- Story 6.2: Read the Department Catalog and an Employee's Current Memberships
- Story 6.3: List an Employee's Departures
- Story 6.4: Batch User Identity Lookup
- Story 6.5: Remove an Employee's Photo
- Story 6.6: Combined Active + Dismissed Directory View

## Requirements & Constraints

- Every route's request/response shape and denial oracle is fixed in the story's
  Stage-1 AD-1 scenario doc under `docs/test-cases/user-management/`, and
  `docs/architecture/api-conventions.md` is updated in the same increment — these
  routes are absent from the router tree today.
- **Denial oracle (uniform, PM/AD-24 five-clause):** `401` for an invalid or
  inactive session; `404` with a leak-free body for a missing target or one
  whose existence is hidden from the viewer, and this `404` is decided before any
  permission check; `403` for a visible resource where the feature/action is
  forbidden; list/collection responses omit rows the viewer may not see.
- Reads are audience-gated through the AccessControl facade, never an inline role
  or `position` check. 6.1 and 6.2's employee-scoped reads require the viewer to
  hold the organisation-editing entitlement or equivalent audience over the
  target (same gate class as the corresponding Epic 4 write). 6.4 returns only
  the always-visible identity minimum, so any authenticated active viewer may
  call it. 6.5 is Self-only. 6.6 reuses the existing `GET /users` list
  entitlement.
- **Story 6.1** returns each *current* edge only (`type='direct'` manager
  edge(s), the fixed-cardinality `people_partner` edge), each with its id, type,
  and the target user's id + display name; closed/historical edges are omitted.
  The id it exposes is what DEC-UM-005 (reports-to reassignment = explicit
  DELETE-then-POST) and the PP replace/remove optimistic-concurrency token
  (`expectedCurrentTargetId` / `expectedCurrentManagerId`) need.
- **Story 6.2** = a department catalog list (`id`, `name`, external id, and
  current manager id + name when one is set) plus an employee's current
  `DepartmentMembership` rows (`validTo IS NULL` only), each with the department
  id + name and `validFrom`. Department identity is the `(externalId, name)`
  pair, so `externalId` alone is not unique.
- **Story 6.3** lists an employee's departures, each with id, effective date,
  reason, and execution state; for a failed one it includes the same sanitized
  diagnostics already exposed by `GET /users/:id/departures/:departureId` (never
  `leaseToken`, raw `lastError`, `requestHash`, or worker internals). No
  departure on record → an empty collection, not `404`. This lets the UI act on
  the `departure_already_scheduled` / `departure_blocked_by_responsibilities`
  responses from `POST /users/:id/departures`.
- **Story 6.4** is a batch id → identity resolver returning
  `{ id, firstName, lastName }` (the §3.3.4 always-visible identity minimum) for
  every id that resolves — active or dismissed — and silently omitting unknown
  ids; it never `404`s for the batch. A request over the documented size cap is
  rejected `400` with the cap stated, not silently truncated. Its projection
  must match the colleague-view identity-minimum rules exactly.
- **Story 6.5** — `DELETE /users/:id/photo`, Self-only: sets `User.photo` to
  `null`, mirrors the `PUT /users/:id/photo` response shape, and runs the same
  object-store cleanup semantics as an upload failure. Non-Self → `403`; no photo
  set → leak-free `404` / no-op per the oracle.
- **Story 6.6** — `GET /users?employmentStatus=all` returns active and dismissed
  employees in one page, each row carrying its `employmentStatus`, with the
  existing pagination and permission-safe projection unchanged. Omitting the
  param keeps the current active-only default; `all` is opt-in. This extends the
  existing list query DTO + repository, so the NFR that `GET /users` answers
  within 2 s for 500+ records still applies.
- Use only the delivered pseudonymised seed population; no real PII in contexts,
  logs, or fixtures.

## Technical Decisions

- Standard hexagonal layout (`application/{actions,controllers,dtos}`,
  `domain/{interfaces,services,entities}`, `infrastructure/`). Domain imports
  nothing from Prisma, NestJS transport, or HTTP. Actions call a domain service;
  only a domain service may `@Inject` a port. Cross-context access only via the
  target context's `application/` exports or the AccessControl facade.
- Detail reads use the `{ data, canEdit }` envelope convention where a caller
  would act on the result; append-only / pure-catalog reads use a bare
  `{ data }` collection with no `canEdit` (mirrors `GET /users/:id/access-journal`).
- Route ordering: any new literal sibling of `/users/:id` (e.g. a batch-lookup
  path if mounted under `/users`) must be declared before the `:id` handler.
- State being read, already persisted by Epics 1–5: `Relationship`
  (`type` `direct` / `people_partner`, hard-deleted so "current" = row exists);
  `DepartmentMembership` (temporal, current = `validTo IS NULL`); `Department`
  (import-created, `(externalId, name)` identity, `parentId` tree); department
  manager as an AR `Policies` `targetType:'department'` row + `UserPolicies`
  link; `Departure` (states `scheduled` / `processing` / `retry_wait` /
  `applied`); `User.photo`; `EmploymentStatus` (`active` / `dismissed`).
- Each story runs the full AD-1 gate (Stage-1 scenario doc → E2E → code), with a
  real human checkpoint between stages. Stage-2 E2E seeds its own `User` /
  `Relationship` / `DepartmentMembership` / `Departure` fixtures via Prisma or
  the import script — it does not call another epic's live HTTP endpoint.
- Production stage writes no data and adds no journal row (6.5's photo clear is
  the only mutation in the epic and emits no `AccessJournal` / `UserEvents`).

## Cross-Story Dependencies

- All six stories are independent — different resources, no shared write path.
  6.1–6.4 unblock the largest frontend gaps and go first; 6.5 and 6.6 are small.
- None is blocked on Epic 4 or Epic 5: the reads only observe state those epics
  persist, and E2E fixtures seed it directly. They do depend on the Epic 1
  import (departments created on import, `User` rows) and on the Epic 4/5
  schema (`Relationship`, `DepartmentMembership`, `AccessJournal`, `Departure`)
  being present.
- 6.4's identity-minimum projection must be coordinated at Stage-1 with whoever
  owns the colleague-view field rules (§3.3.4), so the two never diverge.
- Explicitly **out of this epic**, each its own separate item: rolling current
  manager / PP / department / projects onto `GET /users/:id` as audience-filtered
  derived fields (Access-Control-owned `{ data, canEdit }` roll-out);
  substring / typeahead search on `GET /users` (platform §4.1 directory scope);
  pagination + filtering on `GET /users/:id/events` and `/access-journal` (needs
  its own pagination contract first).
- Consumes these frontend deferred-work items on landing: manager reassignment
  UI, department membership / department-manager UI, "current organisation"
  display, view/manage scheduled departure, access-journal and blocker-panel
  id → name resolution, optimistic-concurrency token wiring, "remove photo"
  affordance, combined active+dismissed directory filter.
