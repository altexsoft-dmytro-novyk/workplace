# UM-LIST-04 · List users filtered by the remaining S1 identity fields

**Trace:** epics.md Story 1.5 · FR-16 · requirements §4.1 ("Any field that exists on a profile can be used as a filter and as a column")

## Scenario

**Given** `User` records exist with varying `firstName`, `lastName`, `workEmail`, `ttId`, `workPhone`, `companyJoinDate`, and `birthDay`/`birthMonth` values — the S1 fields not yet exercised by `um-list-02` (`country`) or `um-list-03` (`position`+`city`).

**When** Root filters `GET /users` on each of these fields in turn.

**Then** every returned record matches the filter value exactly, and no non-matching record is included. This closes the "**any** field on the profile is filterable" breadth FR-16/§4.1 claim for the remaining S1 columns — all 12 FR-16 columns are now covered across `um-list-02`/`03`/`04` and `deactivation/um-deact-02`. `isActive` filtering is proven separately by `deactivation/um-deact-02` and is not repeated here.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice seeded with `firstName: "Alicja"`, `lastName: "Larsson"`, `birthDay: 15`, `birthMonth: 3`, `workPhone: "+48-11-222-3333"`, `companyJoinDate: "2022-04-01"`, for this scenario only; Colin seeded with `workEmail: colin@company.example` and `ttId: "tt-1042"` per the canonical fixture; at least one contrasting record exists for each field that does not match the filtered value.

## Test

- **Test 1 — filter by `lastName`**
  - **inputURL:** `GET /users?lastName=Larsson`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `200`; every returned record has `lastName: "Larsson"`.
- **Test 2 — filter by `workEmail`**
  - **inputURL:** `GET /users?workEmail=colin@company.example`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `200`; exactly the one record holding that address (Colin).
- **Test 3 — filter by `ttId`**
  - **inputURL:** `GET /users?ttId=tt-1042`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `200`; exactly the one record holding `ttId: "tt-1042"` (Colin).
- **Test 4 — compound filter by `birthDay` + `birthMonth`**
  - **inputURL:** `GET /users?birthDay=15&birthMonth=3`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `200`; every returned record has `birthDay: 15` and `birthMonth: 3` — a record matching only one of the two (e.g. `birthDay: 15, birthMonth: 7`) is excluded.
- **Test 5 — filter by `firstName`**
  - **inputURL:** `GET /users?firstName=Alicja`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `200`; every returned record has `firstName: "Alicja"`.
- **Test 6 — filter by `workPhone`**
  - **inputURL:** `GET /users?workPhone=%2B48-11-222-3333`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `200`; every returned record has `workPhone: "+48-11-222-3333"`.
- **Test 7 — filter by `companyJoinDate`**
  - **inputURL:** `GET /users?companyJoinDate=2022-04-01`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `200`; every returned record has `companyJoinDate: "2022-04-01"`.
