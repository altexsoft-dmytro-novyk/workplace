# UM-SEED-05 · `IsDismissed` + dates map to one `EmploymentStatus` row; `User.isActive` is not touched

**Trace:** requirements §4.16 (`active` / `dismissed` employment status) · AD-16 (`EmploymentStatus` aggregate replaces the `isActive` overload) · [decisions §4](../../../../_bmad-output/implementation-artifacts/user-management/epic-1-story-1-1-decisions.md) (`IsDismissed=1` → `status:'dismissed'`, `validFrom = DismissedDate`; `IsDismissed=0` → `status:'active'`, `validFrom = RegistrationDate`; `User.isActive` stays the internal row-retention flag only) · [database-schema.md](../../../architecture/database-schema.md) §EmploymentStatus "Import-origin dismissals (2026-09-02)" (CHECK relaxed — a `dismissed` row created by the import has no `Departure`; `sourceDepartureId` / `departureReason` stay `null`) · epics.md Story 1.1

## Scenario

**Given** the deployment order has completed through
`db:bootstrap:access-control`.

**When** Root `POST`s `/users/import` with a fixture holding one active and one
dismissed row:

| line | `Email` | `RegistrationDate` | `IsDismissed` | `DismissedDate` |
| --- | --- | --- | --- | --- |
| 1 | `working@x.example` | `2024-02-01` | `0` | `NULL` |
| 2 | `left@x.example` | `2021-05-10` | `1` | `2026-07-31` |

**Then**:

- line 1 → **exactly one** `EmploymentStatus` row
  `{ userId, status: 'active', validFrom: 2024-02-01, validTo: null,
  departureReason: null, sourceDepartureId: null }`.
- line 2 → **exactly one** `EmploymentStatus` row
  `{ userId, status: 'dismissed', validFrom: 2026-07-31, validTo: null,
  departureReason: null, sourceDepartureId: null }` — `validFrom` is the
  `DismissedDate`, not the `RegistrationDate`. The import does **not**
  reconstruct the historical `active` interval `[RegistrationDate, DismissedDate)`
  — one row, not two (decision 10). `sourceDepartureId` and `departureReason` are
  **`null`** for an import-origin dismissal: the departure predates the system, so
  there is no `Departure` to reference — and the `EmploymentStatus` CHECK no
  longer requires them on a `dismissed` row (`database-schema.md` §EmploymentStatus
  "Import-origin dismissals (2026-09-02)").
- **`User.isActive` is `true` for BOTH rows.** The import never derives
  `isActive` from `IsDismissed` (decisions §4): a dismissed employee is a real,
  retained `User` row whose *employment* fact is `dismissed`. Assert
  `isActive = true` on line 2 explicitly.
- both users still import fully otherwise — mapped S1 fields, one
  `DepartmentMembership`, one `joined_company` event each.

> **Schema alignment (resolved 2026-09-02).** The `EmploymentStatus` CHECK was
> relaxed so a `dismissed` row no longer requires `sourceDepartureId` /
> `departureReason` — both are `null` for an import-origin dismissal
> (`database-schema.md` §EmploymentStatus "Import-origin dismissals (2026-09-02)";
> [decisions §2b](../../../../_bmad-output/implementation-artifacts/user-management/epic-1-story-1-1-decisions.md)).
> There is **no `source` discriminator column** on `EmploymentStatus`. The
> `dismissed` half of this scenario is no longer stage-2-blocked and needs no
> further architect amendment. The AD-20 apply-transaction still sets both fields
> for departures it processes; the constraint just no longer forbids the historical
> import case.

**Preconditions:** [fixture](../README.md#canonical-personas); fresh DB through
bootstrap; Root holds the `hr-admin` FR grant chain; the 2-row status fixture
above is the upload.

## Test

- **inputURL:** `POST /users/import`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:<root-uuid>>", "content-type": "multipart/form-data" },
    "body": "<multipart; file part = the 2-row status fixture (delivered header verbatim)>"
  }
  ```
- **expectedResult:** `200`; summary `{ "created": 2, "updated": 0, "departmentsCreated": <D>, "skipped": 0, "errors": [] }`.
- **expectedResult (database state):**
  - `employment_status` has exactly one row for `working@x.example`:
    `status='active'`, `validFrom='2024-02-01'`, `validTo IS NULL`,
    `departureReason IS NULL`, `sourceDepartureId IS NULL`.
  - `employment_status` has exactly one row for `left@x.example`:
    `status='dismissed'`, `validFrom='2026-07-31'`, `validTo IS NULL`,
    `departureReason IS NULL`, `sourceDepartureId IS NULL`.
  - `SELECT "userId", count(*) FROM employment_status GROUP BY 1 HAVING count(*) > 1`
    returns zero rows.
  - `users.isActive` is `true` for **both** rows.
