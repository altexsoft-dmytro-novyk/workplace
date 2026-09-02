# UM-LIST-04 · List employees filtered by the remaining permission-safe S1 fields

**Trace:** epics.md Story 1.5 (AC 2/3, breadth) · PRD FR-15 · requirements §4.1
("any field that exists on a profile can be used as a filter")

## Scenario

**Given** `User` rows exist with varying `firstName`, `lastName`, `workEmail`,
`workPhone`, `birthDay` / `birthMonth`, and `companyJoinDate` values — the
permission-safe S1 identity fields on the `User` row not already exercised by
`um-list-02` (`country`) or `um-list-03` (`position` + `city`).

**When** Root filters `GET /users` on each of these fields in turn.

**Then** the response is `200` and every returned row matches the filter value
exactly; no non-matching row is included. Together with `um-list-02` / `03` this
closes the "every permission-safe S1 field is a filter" breadth claim for the
`User`-row columns. **Not** filterable here, by design: `ttId` and `isActive`
(internal — `um-list-09` proves they are rejected, FR-15) and `employmentStatus`
(a filter-only visibility predicate, proven by `um-list-05` / `06`, not a plain
equality field).

**Preconditions:** [fixture](../README.md#canonical-personas); Root holds
`user-management:list`; for this run — Alice seeded `{firstName: "Alicja",
lastName: "Larsson", birthDay: 15, birthMonth: 3, workPhone: "+48-11-222-3333",
companyJoinDate: "2022-04-01"}`, a contrast user sharing `birthDay: 15` but
`birthMonth: 7`, and at least one non-matching row per field. All rows active.

## Test

- **Test 1 — `firstName`**
  - **inputURL:** `GET /users?firstName=Alicja&pageSize=100`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `200`; every `items[].firstName === "Alicja"`.

- **Test 2 — `lastName`**
  - **inputURL:** `GET /users?lastName=Larsson&pageSize=100`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `200`; every `items[].lastName === "Larsson"`.

- **Test 3 — `workEmail` (unique → exactly one row)**
  - **inputURL:** `GET /users?workEmail=<alice-run-email>&pageSize=100`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `200`; `items` has exactly one element, Alice's `id`.

- **Test 4 — `workPhone`**
  - **inputURL:** `GET /users?workPhone=%2B48-11-222-3333&pageSize=100`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `200`; every `items[].workPhone === "+48-11-222-3333"`.

- **Test 5 — compound `birthDay` + `birthMonth` excludes a partial match**
  - **inputURL:** `GET /users?birthDay=15&birthMonth=3&pageSize=100`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `200`; every row has `birthDay === 15` **and**
    `birthMonth === 3`; the `birthMonth: 7` contrast user is absent; Alice is
    present.

- **Test 6 — `companyJoinDate`**
  - **inputURL:** `GET /users?companyJoinDate=2022-04-01&pageSize=100`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `200`; every `items[].companyJoinDate === "2022-04-01"`.
