# UM-LIST-08 · Every list row is the same fixed, fail-closed permission-safe projection

**Trace:** epics.md Story 1.5 · PRD FR-15 · [access-control.md](../../../architecture/access-control.md)
§3.3.1 (list/filter/export/search projection), §3.3.6, §4.7 · `deferred-work.md`
§3.3.1 (field-level list projection is a separate deferred deliverable) ·
`access-control-adoption/umac-01` (the 12-field S1 identity card)

## Scenario

**Given** field-level list projection (which fields each viewer may see per row)
is **deferred** — until it lands, `GET /users` returns a **single fixed field
set for every row and every viewer**, and must fail closed on any field it
cannot prove every viewer holding `user-management:list` may read.

**When** Root lists employees and inspects a row.

**Then** each element of `items` contains **exactly** these keys and no others:

| # | key | source |
|---|---|---|
| 1 | `id` | `User.id` |
| 2 | `firstName` | `User.firstName` |
| 3 | `lastName` | `User.lastName` |
| 4 | `photo` | `User.photo` (nullable) |
| 5 | `position` | `User.position` |
| 6 | `country` | `User.country` |
| 7 | `city` | `User.city` (nullable) |
| 8 | `workEmail` | `User.workEmail` |
| 9 | `workPhone` | `User.workPhone` (nullable) |
| 10 | `birthDay` | `User.birthDay` (nullable) |
| 11 | `birthMonth` | `User.birthMonth` (nullable) |
| 12 | `companyJoinDate` | `User.companyJoinDate` (date-only string `YYYY-MM-DD`) |
| 13 | `employmentStatus` | current `EmploymentStatus.status` — `"active"` \| `"dismissed"` (FR-15 "…and employment status"; see README decision) |

Keys 1–12 are byte-for-byte the `GET /users/:id` S1 identity card (`umac-01`).
The row **never** contains `ttId`, `isActive`, `customFields`, `createdAt`,
`createdBy`, or any derived audience-dependent field (`manager`, `peoplePartner`,
`department`, `projects`, `mentor`, `canEdit`). Those are omitted **uniformly**
— not per-viewer — because per-row projection/audience resolution is deferred.
Absence is absence: the key is missing, never `null`.

**Preconditions:** [fixture](../README.md#canonical-personas); Root holds
`user-management:list`; at least one active employee exists whose `photo`,
`workPhone`, `city`, `birthDay`, `birthMonth` are all populated **and** at least
one whose nullable fields are `null`, so the assertion covers both.

## Test

- **Test 1 — exact key set of a list row**
  - **inputURL:** `GET /users?pageSize=100`
  - **inputRequest:**
    ```json
    { "headers": { "authorization": "Bearer <token:Root>" } }
    ```
  - **expectedResult:** `200`; for **every** element of `items`, `Object.keys`
    equals exactly the 13-key set in the table above (order-independent).
    No element contains `ttId`, `isActive`, `customFields`, `createdAt`,
    `createdBy`, `canEdit`, `manager`, `peoplePartner`, `department`,
    `projects`, or `mentor`.

- **Test 2 — nullable fields are present-but-null, not dropped, for keys 1–13**
  - **inputURL:** `GET /users?workEmail=<null-fields-user-run-email>`
  - **inputRequest:**
    ```json
    { "headers": { "authorization": "Bearer <token:Root>" } }
    ```
  - **expectedResult:** `200`; the single row still has all 13 keys; `photo`,
    `workPhone`, `city`, `birthDay`, `birthMonth` are `null` (the value, not an
    absent key). `employmentStatus` is `"active"`.
