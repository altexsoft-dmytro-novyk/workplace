# UM-LIST-05 · A dismissed employee is absent by default but filterable

**Trace:** epics.md Story 1.5 (final AC) · PRD FR-15, FR-6 · requirements §4.1, §4.16 · supersedes the retired `deactivation/um-deact-02`

## Scenario

**Given** Colin is a seeded employee whose **effective employment status is
`dismissed`** (an applied Epic 5 departure — not a generic `DELETE /users/:id`,
which no longer exists), and Alice is an ordinary `active` employee.

**When** an entitled actor opens the default employee list (`GET /users` with no
status filter).

**Then** Colin is **absent** from the default page and Alice is present. When the
same actor re-runs the list with an authorized employment-status filter
(`GET /users?employmentStatus=dismissed`, exact predicate name owned by Story 1.5
/ §4.16), Colin **is** returned. The list never exposes the internal `isActive`
or `ttId` flags as filter predicates (FR-15); `employmentStatus` is the §4.16
business fact, distinct from `isActive`.

> **v1.5 note.** The *behaviour* (dismissed → absent by default, findable by
> authorized filter) survives from the retired `um-deact-02`. The *mechanism*
> changed: the dismissed state is produced by the Epic 5 departure workflow
> (`um-dep-03`), whose implementation is blocked on CC-06. Stage-2 for this
> scenario seeds the `dismissed` employment-status fact directly against the
> test DB (no departure-executor dependency) and asserts only the list
> projection.

**Preconditions:** [fixture](../README.md#canonical-personas); Colin's employment status is `dismissed`; Alice is `active`; both rows exist from seed/import.

## Test

- **Test 1 — default list omits the dismissed employee**
  - **inputURL:** `GET /users`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `200`; the returned page contains Alice and does **not** contain Colin's id.
- **Test 2 — authorized employment-status filter surfaces the dismissed employee**
  - **inputURL:** `GET /users?employmentStatus=dismissed`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `200`; every returned record has employment status `dismissed`; Colin's id is present.
- **Test 3 — internal flags are not public predicates**
  - **inputURL:** `GET /users?isActive=false`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** the `isActive` query param is ignored or rejected — it is not an accepted public filter (FR-15); the response is not a "list of inactive rows".
