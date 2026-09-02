# UM-LIST-09 · Internal and unknown filter predicates are rejected `400`, never silently applied

**Trace:** epics.md Story 1.5 · PRD FR-15 (`ttId` / `isActive` are never public
filters) · [access-control.md](../../../architecture/access-control.md) §3.3.6,
§4.7 ("a filter must not leak a value the viewer cannot read", never used to
probe) · requirements §4.1

## Scenario

**Given** the list endpoint's accepted query keys are a closed set: the
permission-safe `User`-row filters (`firstName`, `lastName`, `position`,
`country`, `city`, `workEmail`, `workPhone`, `birthDay`, `birthMonth`,
`companyJoinDate`), the sanctioned `employmentStatus` visibility predicate, and
the pagination params (`page`, `pageSize`).

**When** a caller sends a query key outside that set — an internal flag
(`?ttId=…`, `?isActive=false`), a field not in the fixed projection
(`?createdBy=…`, `?customFields=…`), or an outright unknown key (`?department=…`,
`?sort=lastName`, `?q=alice`).

**Then** the response is **`400`**, the body names the unsupported parameter, and
**no list is returned**. The predicate is **never** silently ignored (a prober
must not be able to read "ignored" as "applied and matched nothing") and
**never** silently applied. This is the fail-closed posture §3.3.6 / §4.7
require for every filter surface: an internal or unresolved predicate could leak
whether a value the caller may not read exists.

**Preconditions:** [fixture](../README.md#canonical-personas); Root holds
`user-management:list`; at least one `isActive: false` (purged) row and one row
with a non-null `ttId` exist, so "rejected, not applied" is observable (neither
row can be surfaced or excluded by the rejected param).

## Test

- **Test 1 — `?ttId=` is rejected (FR-15)**
  - **inputURL:** `GET /users?ttId=tt-0001`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `400`; body names `ttId`; no `items`.

- **Test 2 — `?isActive=false` is rejected (FR-15), not "a list of inactive rows"**
  - **inputURL:** `GET /users?isActive=false`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `400`; body names `isActive`; no `items`. The purged
    row is **not** returned.

- **Test 3 — a field outside the fixed projection is rejected**
  - **inputURL:** `GET /users?createdBy=<some-uuid>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `400`; body names `createdBy`; no `items`.

- **Test 4 — an unknown key is rejected**
  - **inputURL:** `GET /users?q=alice&department=Engineering`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `400`; body names the unsupported parameter(s); no
    `items`.
