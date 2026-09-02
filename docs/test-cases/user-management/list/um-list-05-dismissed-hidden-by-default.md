# UM-LIST-05 · A dismissed employee drops out of the default list

**Trace:** epics.md Story 1.5 (AC 4) · PRD FR-15, FR-6 · requirements §4.1, §4.16
· supersedes the retired `deactivation/um-deact-02`

## Scenario

**Given** Colin and Alice are seeded `User` rows, both `isActive: true`, both
with a current `EmploymentStatus` of `active` (`validTo IS NULL`). Per Story 1.1
a dismissed employee is a live account carrying a `dismissed` employment-status
fact — `isActive` is the internal account/row-retention flag and is **not** what
drives directory visibility.

**When** Colin's employment status becomes `dismissed` and an entitled actor
opens the default employee list (`GET /users`, **no** `employmentStatus`
filter).

**Then** Colin's `id` disappears from the default list while Alice's stays. The
rule keys on Colin's **current** `EmploymentStatus.status`, not on
`User.isActive` (which is still `true` for him). A `User` with no
`EmploymentStatus` row is treated as `active`/visible — the import always writes
one, and `isActive: false` still hard-excludes purged rows independently.

> **v1.5 note.** The *behaviour* (dismissed → absent by default, findable via an
> authorized filter — `um-list-06`) survives from the retired `um-deact-02`. The
> *mechanism* is now the real `EmploymentStatus` aggregate shipped by Story 1.1;
> the Epic 5 departure **workflow** that sets `status: "dismissed"` in
> production is still blocked on CC-06 and has no HTTP surface, so the step below
> is a `stateChange`, not a request.

**Preconditions:** [fixture](../README.md#canonical-personas); Root holds
`user-management:list`; Colin and Alice both start with a current
`EmploymentStatus` of `active`.

## Test

- **Test 1 — baseline: the default list contains Colin**
  - **inputURL:** `GET /users?pageSize=100`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `200`; `items[].id` contains both Alice's and Colin's
    `id`.

- **stateChange:** Colin's current `EmploymentStatus` row is closed and replaced
  with `{status: "dismissed", validFrom: <today>, validTo: null}`, seeded
  directly against the test DB — the Epic 5 departure command that performs this
  in production is CC-06-blocked and exposes no endpoint.

- **Test 2 — the default list no longer contains Colin**
  - **inputURL:** `GET /users?pageSize=100`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `200`; `items[].id` still contains Alice's `id` and does
    **not** contain Colin's `id`.
