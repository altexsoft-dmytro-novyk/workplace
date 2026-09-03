# TimeTracker — Accounts export (structure)

Structural record of the account export TimeTracker produces (`Accounts.csv`).
The raw export carries real employee PII and is **never committed**: it lives
locally at `services/backend/prisma/seed-data/*.csv`, gitignored. This file
records only the shape and the enumerations, which are what planning needs.

Companion contract: [`timetracker-external-api.json`](./timetracker-external-api.json).

## Format

Semicolon-delimited, one header row, UTF-8 (the observed export was also
offered BOM-prefixed and header-less — treat both as the same payload).
`NULL` is the literal empty marker, not an empty field.

## Columns

| # | Column | Notes |
|---|--------|-------|
| 1 | `FirstName` | |
| 2 | `LastName` | |
| 3 | `Email` | corporate address; the only usable join key (see below) |
| 4 | `Birthday` | usually `NULL` |
| 5 | `PositionId` | numeric, stable |
| 6 | `PositionName` | |
| 7 | `RegistrationDate` | `YYYY-MM-DD` |
| 8 | `DepartmentId` | numeric, stable |
| 9 | `DepartmentName` | |
| 10 | `DismissedDate` | `NULL` while active |
| 11 | `IsDismissed` | `0` / `1` |
| 12 | `EmployeeType` | `Employee` / `Subcontractor` |
| 13 | `TimeZone` | IANA, e.g. `Europe/Kyiv` |
| 14–16 | `CountryId`, `CountryCode`, `CountryName` | |
| 17–18 | `CountryStateId`, `CountryStateName` | `NULL` outside federal states |

## Department catalog (observed)

| Id | Name |
|----|------|
| 1 | IT |
| 2 | Technologies |
| 3 | .NET |
| 4 | JS |
| 5 | Python |
| 6 | Delivery Management |
| 7 | Engineering management |
| 8 | PMO |
| 9 | Client engagement |

Flat list — the export carries no parent/child column, so any nesting implied
by these names (`.NET` / `JS` / `Python` under `Technologies`) is **not** stated
by the source and must not be assumed.

## Position catalog (observed)

| Id | Name |
|----|------|
| 1 | Head of IT |
| 2 | Developer |
| 4 | Solution Architect |
| 5 | Unit Manager |
| 6 | Engineering Director |
| 7 | CEO |
| 8 | Delivery Management |
| 11 | Project Manager |
| 12 | Sales Manager |

Ids 3, 9, 10 are absent from this sample — the catalog is sparse here, not
necessarily in the source system.

## Findings that bear on open architecture items

- **No reports-to column.** The export states department and position but no
  manager link. This is a third independent confirmation of decision **C-05**
  (`critical-review-existing-artifacts.md`): the integration supplies no
  reports-to hierarchy. Reports-to stays a manually managed `direct`
  relationship.
- **Departments arrive as data, with stable ids.** The spine defers
  *Department edge modeling* and no `Department` model exists in
  `schema.prisma`. This export shows what the upstream actually provides:
  a flat id/name pair per person, exactly one department per account, and no
  department-manager field.
- **`IsDismissed` / `DismissedDate` exist upstream.** Relevant to AD-20
  departure handling: departure state is observable in the export, so a sync
  could detect it — but the export is state-at-sync only, so the *moment* of
  departure is not recoverable from it, only the recorded date.
- **`EmployeeType` distinguishes `Subcontractor` from `Employee`.** No
  equivalent distinction is currently modelled.
- **`ttId` is hand-entered, not synced.** As implemented on `main`, `ttId` is an
  optional string the HR Admin supplies on registration or edit
  (`create-user.dto.ts`, `update-user.dto.ts`); uniqueness is enforced and a
  duplicate is rejected with `409` (`um-reg-07`). Nothing populates it from an
  integration. That matters here because **this export carries no TimeTracker id
  column at all** — only `Email` — and `/api/projects/talents` likewise returns
  members by email and PM/DM as display-name strings. So an operator has no
  field in either source to copy a `ttId` from, and the link between a `User`
  and its TimeTracker account currently rests on manual entry. Which upstream
  value `ttId` is *supposed* to hold — plausibly the Accounting endpoint's
  numeric `Employee.id` — is unstated and open.
