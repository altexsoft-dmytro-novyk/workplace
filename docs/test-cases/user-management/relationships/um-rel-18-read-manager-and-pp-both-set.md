# UM-REL-18 · Read relationships — manager + People Partner both set, read by the reporting-line manager

**Trace:** epics.md Story 6.1 (Epic 6 — Read the current reporting-line manager and People Partner) · [spec-6-1](../../../../_bmad-output/implementation-artifacts/user-management/spec-6-1-read-current-manager-and-people-partner.md) · PRD FR-10 · [api-conventions.md](../../../architecture/api-conventions.md) (`{ data }` envelope) · DEC-UM-005 (the `relationshipId` a reports-to reassignment needs) · **product decision 2026-09-04 (Dmytro Novyk) — "Option B" read gate**

> **Stage ordering.** Epic 4 shipped the manager/PP **write** paths with no way
> to read them. The Stage-2 suite for this story
> (`test/user-management/epic-4/relationships-read.e2e-spec.ts`) landed before
> this Stage-1 document existed — an AD-1 inversion recorded here rather than
> hidden. This file is the reconciliation, and approving it ratified behaviour
> the suite already asserts. **Approved 2026-09-04 by Anna Pikula** — recorded in
> [`spec-user-management-test-cases/approvals.yaml`](../../../../_bmad-output/specs/spec-user-management-test-cases/approvals.yaml),
> which is the approval; this sentence is only a pointer to it.

## Scenario-stage decisions (for the human gate)

- **Read gate ("Option B", 2026-09-04).** The viewer may read iff
  `resolveAudiences(viewer, [target]) ∩ { reporting, pp } ≠ ∅` **OR**
  `isAllowed(viewer, 'org:relationships:write')` — "edit implies read". Self is
  **not** a reader (`um-rel-21`).
- **Projection.** Only *current* `direct` (manager) and `people_partner` edges.
  A `project` edge is never returned (`um-rel-25`); an edge whose target is
  deactivated is not current (`um-rel-26`).
- **Envelope.** `{ data: CurrentEdgeView[] }` — house `{ data }` convention, and
  **no `canEdit`** key: this route is read-only and grants no edit affordance.
- **Order.** `direct` before `people_partner`, so the UI can render the manager
  row first without sorting.

## Scenario

**Given** an active employee T has both a current `direct` edge to Mona Manager
and a current `people_partner` edge to Pat Partner.

**When** Mona — T's reporting-line manager — calls
`GET /users/<T>/relationships`.

**Then** `200` with exactly two edges, the `direct` edge first, each carrying
`relationshipId`, `type`, and the target's `{ id, firstName, lastName }` and
nothing else.

## Test

- **inputURL:** `GET /api/v1/users/<targetId>/relationships`
- **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<monaId>>" } }`
- **expectedResult:** `200`
  - the response body's key set is **exactly** `['data']` — no `canEdit`
  - `data` has length `2`
  - `data[0].type === 'direct'`, `data[0].target === { id: <monaId>, firstName: 'Mona', lastName: 'Manager' }`
  - `data[1].type === 'people_partner'`, `data[1].target === { id: <patId>, firstName: 'Pat', lastName: 'Partner' }`
  - every edge's key set is **exactly** `['relationshipId', 'target', 'type']`, with `relationshipId` a string
  - no edge carries a `type` outside `{ 'direct', 'people_partner' }`

**Preconditions:** [fixture](../README.md#canonical-personas). Real `User` +
`Relationship` rows are seeded (AD-3: real `AppModule`, real migrated
PostgreSQL, no `overrideProvider`); the header is the seeded-uuid session
shorthand.
