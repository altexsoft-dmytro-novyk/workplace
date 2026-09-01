# User Management — `seed/` (Story 1.1: Import Seeded Population)

Stage-1 scenario documents (AD-1) for **Epic 1 Story 1.1 — Import Seeded Population**.
These replace the retired `registration/` suite: v1.5 has **no `POST /users` HTTP
create path** (AD-14 / AD-16 / §4.17). The population is a seeded/imported set.

**Status:** unapproved draft (v1.5 refresh, 2026-09-01). Per-file human approval
under the AD-1 stage-1 gate is still required; no `approvals.yaml` records any of
these yet.

## Import source — `docs/Accounts_template.csv` (the file shape from TT)

The import source is the delivered **semicolon-delimited timetracker export**
`docs/Accounts_template.csv`. Header:

```
FirstName;LastName;Email;Birthday;PositionId;PositionName;RegistrationDate;DepartmentId;DepartmentName;DismissedDate;IsDismissed;EmployeeType;TimeZone;CountryId;CountryCode;CountryName;CountryStateId;CountryStateName
```

Sample row:
`Site;Administrator;dmytro.novyk+boot@altexsoft.com;NULL;2;Developer;2026-08-17;1;JS;NULL;0;Employee;Europe/Kyiv;227;UA;Ukraine;NULL;NULL`

### Column → `User` field mapping

| CSV column | → `User` field | Notes / **OPEN** |
| --- | --- | --- |
| `Email` | `workEmail` | trimmed + lowercased before store/compare (DEC-UM-007). **This is the natural key** — the file carries **no employee-id column**. `ttId` (AD-13) has **no source column here** → import leaves `ttId` `null`. **OPEN:** whether a later TT sync populates `ttId`. |
| `FirstName` | `firstName` | |
| `LastName` | `lastName` | |
| `Birthday` | `birthDay` + `birthMonth` | value is `NULL` or a date. When a date: split to `birthDay` (1-31) / `birthMonth` (1-12), **drop the year** (§3.2 "day and month" only). `NULL` → both `null` — a deliberate `NULL` is **not** the DEC "incomplete pair rejected" case. |
| `RegistrationDate` | `companyJoinDate` (`date`) | |
| `PositionName` | `position` (free-text S1 field) | |
| `PositionId` | *(not stored)* | **OPEN:** is there a positions dictionary? For now ignored. |
| `DepartmentName` / `DepartmentId` | the **department organisational fact** (§4.17) — **not** a free-text S1 field | **OPEN:** the Department entity/edge contract is still deferred (spine Deferred). The importer either stores the department name transiently or defers department assignment. Do **not** invent the Department schema. |
| `CountryName` | `country` | |
| `CountryCode` / `CountryStateId` / `CountryStateName` / `CountryId` | *(not stored yet)* | **OPEN** whether `CountryCode` / `CountryStateName` are stored. S1 is "country and city" — `city` has **no source column** → `city` `null`. **OPEN.** |
| `IsDismissed` (`0`/`1`) + `DismissedDate` | **employment status** (§4.16 `active` / `dismissed`) — **not** `User.isActive` directly | **Interim flagged:** `User.isActive` may be set `false` for a dismissed import row as the stopgap until the `EmploymentStatus` aggregate lands (Epic 5, CC-06). |
| `EmployeeType` (`Employee` / …) | S4 employee type (FTE / Subcontractor) | **S4 is not on the `User` row** (PRD: `User` is S1-only) → **OPEN / not imported yet.** |
| `TimeZone` | *(not imported)* | not an S1 field. Distinct from AD-20's `BUSINESS_TIME_ZONE`. |
| *(none)* | `workPhone` | **no source column** → `null` on import. |
| *(none)* | `photo` | **no source column** → `null` on import. |
| *(writer-owned)* | `createdBy` | the ACM-0 root `User` id — the import runs as the root operator. |
| *(DB default)* | `customFields` | `{}` — writer omits it (DEC-UM-003). |

**Root-row reuse (DEC-UM-009).** The sample row's email
`dmytro.novyk+boot@altexsoft.com` is a normal employee row. But if a row's
normalized `Email` matches the normalized `ROOT_WORK_EMAIL`, the import
**updates the existing ACM-0 root `User`** rather than inserting a second row.

## What these prove

| File | Proves | Trace |
| --- | --- | --- |
| `um-seed-01-import-success.md` | Fresh DB → import of `docs/Accounts_template.csv` → one `User` row per CSV row with the mapped S1 fields; `workEmail` unique and **stored normalized** (DEC-UM-007 canonical-at-write); `workPhone` / `city` / `photo` / `ttId` come back `null` (no source column); one `joined_company` system `UserEvents` per imported row. | FR-1, FR-4, FR-5a, FR-7 · DEC-UM-007 · DEC-UM-003 · AD-11 |
| `um-seed-02-no-post-users-create-path.md` | `POST /users` is absent or permanently rejected — there is no product create capability. | FR-4 · §4.17 · AD-14 / AD-16 |
| `um-seed-03-bootstrap-hr-admin-and-root-id-reuse.md` | Exactly one bootstrap `User` holds the `hr-admin` FR policy (proof owned by AC `fc-03` — referenced, not duplicated); an import covering the root person **reuses the ACM-0 root `User` id**, never a second row for an existing normalized email. | ACM-0 · DEC-UM-007 · DEC-UM-009 · AD-12 |

## Deployment order (binding)

`npm run db:deploy` → `npm run db:seed` (ACM-0 root `User`) →
`npm run db:bootstrap:access-control` (ACM-1 FR policy + grant + root attachment) →
population import (Story 1.1) → `npm run start:prod`.

## Not an HTTP suite

Story 1.1's subject is the population import writer, not a request handler.
`um-seed-01` and `um-seed-03` assert **database row-level state** after the
writer runs — there is no response body. The exact batch transport / operator
endpoint is an explicit follow-up contract (AD-16) that gets its own AD-1
scenario before import implementation begins; these scenarios do not presume
one. `um-seed-02` is the one HTTP assertion (the absence of `POST /users`).

## Bootstrap entitlement is not re-proved here

That exactly one bootstrap `User` is an ordinary, revocable FR-policy holder —
not a hard-coded superuser — is Access Control's `fc-03` /
`docs/test-cases/access-control/fail-closed/ac-fc-03-bootstrap-admin-revocable.md`.
`um-seed-03` references it and asserts only the seed/import side: the row exists,
and the import does not fork it.
