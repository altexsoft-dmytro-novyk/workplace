# User Management — `seed/` (Story 1.1: Import Seeded Population)

Stage-1 scenario documents (AD-1) for **Epic 1 Story 1.1 — Import Seeded Population**,
following the team-wide authoring pattern in [../../README.md](../../README.md):
**one test case per file**, each opening with a plain-language **Scenario**
(Given/When/Then) followed by the explicit request spec — `inputURL`,
`inputRequest`, `expectedResult` — traced to `docs/project-requirements.md` (§),
the [user-management PRD](../../../../_bmad-output/planning-artifacts/prds/prd-user-management-2026-08-20/prd.md)
(FR-n), architecture decisions (AD-n), and
[user-management-test-decisions.md](../../../architecture/user-management-test-decisions.md)
(DEC-UM-n).

These replace the retired `registration/` suite: v1.5 has **no `POST /users` HTTP
create path** (AD-14 / AD-16 / §4.17). The population is a seeded/imported set.

## Status — UNAPPROVED DRAFT

v1.5 refresh, regenerated 2026-09-01 against
[`epic-1-story-1-1-decisions.md`](../../../../_bmad-output/implementation-artifacts/user-management/epic-1-story-1-1-decisions.md)
(the product/schema decisions Dmytro took 2026-09-01, which resolve the OPEN items
in [`spec-1-1-import-seeded-population.md`](../../../../_bmad-output/implementation-artifacts/user-management/spec-1-1-import-seeded-population.md)).
Per-file human approval under the AD-1 stage-1 gate is required before any stage-2
E2E; no `approvals.yaml` records any of these. **`author` must differ from
`approver`** — an agent's review of its own output is never the approval
([testing-strategy.md](../../../architecture/testing-strategy.md)).

## Seam table

| Seam | What Story 1.1 owns | What it does NOT own |
| --- | --- | --- |
| Import writer | The idempotent upsert of `User` + `DepartmentMembership` + `EmploymentStatus` + `joined_company` `UserEvents` from the delivered CSV, keyed by normalized `Email` | Any request-level employee-creation API (`POST /users` stays retired — `um-seed-02`) |
| `POST /users/import` HTTP endpoint | Operator-only re-import / correction run while the app is running; multipart upload; capability check through the facade | The AR/audience side of `/users/:id` (Epic 0); the timetracker API pull (future source path) |
| Deploy/operator script entrypoint | The deploy-time population load from `docs/Accounts_template.csv` at the known repo path — same class as `npm run db:seed` | — |
| `Department` create-on-import | Creating a `Department` row when `externalId` (CSV `DepartmentId`) is new; deduping by `externalId`; one `DepartmentMembership` per user | Department `parentId` / hierarchy; Unit-Manager (department-manager) assignment; the Access-Control department-tree walk |
| `EmploymentStatus` mapping | One `active` or `dismissed` row per imported user from `IsDismissed` + dates | The Epic 5 departure workflow (`Departure`, AD-20), `departureReason` semantics |
| Access Control | `AccessControlFacade.isAllowed(callerId, 'user-management:create')` — no-target capability | Seeding any new permission; the `hr-admin` bootstrap proof (AC `ac-fc-03`) |

## The import operator endpoint (settled in-scenario — confirm at approval)

**`POST /users/import`**

- **Why `/users/import`, not `/users/imports`:** it mirrors the existing
  `GET /users/export` ([api-conventions.md](../../../architecture/api-conventions.md)
  §"The four shapes", shape 1) — a collection-level operation at the same depth as
  `/users/:id`, not a REST sub-resource. `/users/imports` would imply an
  import-run resource with its own identity and `GET /users/imports/:id` status
  polling; Story 1.1 creates no such resource and returns its summary
  **synchronously** in the response body. No import-run history table.
- **Route ordering (the literal-siblings-before-`:id` rule):** `import` is a
  literal sibling and MUST be declared **before** any `/users/:id` route in
  `users.controller.ts`, exactly as `export` is — otherwise a `:id` handler
  swallows `POST /users/import` with `id = 'import'` (no error, wrong behavior).
- **Method / body:** `POST`, `multipart/form-data`, one file part `file` = the
  semicolon-delimited `Accounts_template.csv`.
- **Authorization:** a **no-target functional capability** through the facade —
  `AccessControlFacade.isAllowed(callerId, 'user-management:create')`. The handler
  performs **no** `User.position` / role-name / `targetRole` comparison (AD-4,
  DEC-UM-002). `user-management:create` is the existing seeded kernel permission
  (ACM-1) that the retired `POST /users` required; the import is the v1.5
  population-creation path, so it reuses that capability. *(Flagged — decision 2
  below.)*
- **No `POST /users` single-create** is added or restored (`um-seed-02`).
- **Response — `200 OK`** with the summary:
  ```json
  { "created": 0, "updated": 0, "departmentsCreated": 0, "skipped": 0, "errors": [] }
  ```
  | field | meaning |
  | --- | --- |
  | `created` | new `User` rows inserted |
  | `updated` | existing `User` rows matched by normalized `Email` and updated in place (includes a row matching `ROOT_WORK_EMAIL` — `um-seed-03`) |
  | `departmentsCreated` | new `Department` rows inserted (deduped by `externalId`) |
  | `skipped` | rows not written because of a row-level error |
  | `errors[]` | one `{ "line": <int>, "email": <string\|null>, "reason": <string> }` per skipped row; `[]` on a clean import |
- **Second entrypoint (deploy / operator tooling):** the same import service is
  also invoked by a deploy/operator script that reads `docs/Accounts_template.csv`
  from the known repo path — the deploy-time population load, same class as
  `npm run db:seed` (testing-strategy "deploy-time stories invoke their real
  production entrypoint"). **The HTTP endpoint never reads a server-local path —
  upload only.** Both entrypoints share one writer and one
  normalization + idempotent-upsert contract.

### Deployment order (binding)

`npm run db:deploy` → `npm run db:seed` (ACM-0 root `User`) →
`npm run db:bootstrap:access-control` (ACM-1 FR policy + grant + root attachment) →
**population import** (Story 1.1 script entrypoint) → `npm run start:prod`.

## Column → `User` field mapping (resolved — per the 2026-09-01 decisions)

Delivered header (semicolon-delimited):

```
FirstName;LastName;Email;Birthday;PositionId;PositionName;RegistrationDate;DepartmentId;DepartmentName;DismissedDate;IsDismissed;EmployeeType;TimeZone;CountryId;CountryCode;CountryName;CountryStateId;CountryStateName
```

Shipped sample row (`docs/Accounts_template.csv`):
`Site;Administrator;email+boot@provider.domain;NULL;2;Developer;2026-08-17;1;JS;NULL;0;Employee;Europe/Kyiv;227;UA;Ukraine;NULL;NULL`

| CSV column | → target | Rule |
| --- | --- | --- |
| `Email` | `User.workEmail` | `trim()` + `toLowerCase()` before store, compare, lookup (DEC-UM-007). **Natural key** — the file has no employee-id column. |
| `FirstName` / `LastName` | `User.firstName` / `User.lastName` | verbatim |
| `Birthday` | `User.birthDay` + `User.birthMonth` | `NULL` → both `null`. A date → split to day (1-31) + month (1-12), **year dropped everywhere** (§3.2 "birthday (day and month)"). Never a half-pair. |
| `RegistrationDate` | `User.companyJoinDate` (`date`) | verbatim |
| `PositionName` | `User.position` (free-text S1) | verbatim |
| `PositionId` | *(not stored)* | no positions dictionary in Story 1.1 (decisions §5) |
| `DepartmentId` | `Department.externalId` | create-on-import if absent; dedupe by `externalId`; stored as a string (`"1"`). *(Flagged — decision 6.)* |
| `DepartmentName` | `Department.name` | set only when the `Department` row is created (first-write-wins — *flagged, decision 7*) |
| *(derived)* | `DepartmentMembership { userId, departmentId, validFrom }` | exactly one current membership per user; `validFrom` = the row's `RegistrationDate` *(flagged — decision 8)* |
| `CountryName` | `User.country` | verbatim |
| `CountryCode` / `CountryId` / `CountryStateId` / `CountryStateName` | *(not stored)* | decisions §5 |
| *(none)* | `User.city` | no source column → `null` |
| `IsDismissed` (`0`/`1`) + `DismissedDate` | `EmploymentStatus` | `0` → `{ status:'active', validFrom: RegistrationDate }`; `1` → `{ status:'dismissed', validFrom: DismissedDate }`. **Never** `User.isActive` (decisions §4). |
| `EmployeeType` | *(not stored)* | S4, not on the `User` row — a later story (decisions §5) |
| `TimeZone` | *(not stored)* | not an S1 field; distinct from AD-20 `BUSINESS_TIME_ZONE` |
| `ttId` (AD-13) | `User.ttId` = `null` | no source column; `null`-vs-`null` is not a uniqueness collision |
| *(none)* | `User.workPhone`, `User.photo` | no source column → `null` |
| *(writer-owned)* | `User.createdBy` | the ACM-0 root `User` id (import runs as the root operator) |
| *(DB default)* | `User.customFields` | `{}` — the writer omits it (DEC-UM-003) |
| *(same transaction)* | `UserEvents { type:'joined_company', source:'system', eventDate: companyJoinDate }` | one per imported user, written in the row's transaction (AD-11) — never via HTTP |

**Root-row reuse (DEC-UM-009).** A row whose normalized `Email` equals the
normalized `ROOT_WORK_EMAIL` **updates the existing ACM-0 root `User`** in place
(same `id` / `createdAt` / `createdBy`) and counts as `updated`, never `created`.
The shipped sample email is a normal employee row unless it matches
`ROOT_WORK_EMAIL`.

## Malformed-row behavior — per-row skip (settled in-scenario — confirm at approval)

A malformed data row — a missing required source value, an unparseable `Birthday`,
`IsDismissed=1` with no `DismissedDate`, or an `Email` that (after normalization)
duplicates another row **in the same file** — is **skipped**: it writes nothing,
`skipped` is incremented, and one `{ line, email, reason }` entry is added to
`errors[]`. Every well-formed row in the same file is still imported and
committed. Each row is written in **its own transaction** (the row's `User` +
`DepartmentMembership` + `EmploymentStatus` + `joined_company` event commit
together, or the row is skipped whole).

**Why per-row skip, not whole-file rollback:** the delivered population is large
and fixed; one bad row must not block loading the rest. The summary shape
(`skipped`, `errors[]`) exists precisely so an operator can see what failed, fix
the file, and re-run — and re-running is idempotent (`um-seed-08`), so the
previously-skipped rows are simply `created` on the next pass (`um-seed-09`).
Whole-file rollback would make one typo un-importable without hand-editing a
delivered artifact.

**Ambiguous pre-existing match** — the writer finds more than one *existing*
`User` row whose stored `workEmail` normalizes to the incoming key (only possible
from legacy non-normalized rows) — is skipped with a distinct `reason` naming the
colliding ids; it never silently picks one (spec I/O matrix "never silently pick
one"). *(Flagged — decision 15: if product wants the whole import to abort on any
such collision, that is a one-line change.)*

## Scope note — what Story 1.1 does NOT do

- **No `parentId` / department hierarchy.** Every created `Department` has
  `parentId = null`; the CSV carries no parent column (decisions §2). Nesting is
  assigned later (manual / timetracker).
- **No Unit-Manager (department-manager) assignment.** No CSV source column. The
  `Policies { type:'AR', targetType:'department', targetRole:'unit-manager' }` row
  is not written by this story (decisions §2).
- **No department-derived access.** `targetType:'department'` stays fail-closed
  until the separate Access-Control department-tree walk increment lands (its own
  AD-1 sequence — decisions §2, "Still owned elsewhere").
- **No `Project` touch.** The CSV has no project columns; project assignment comes
  from the future timetracker path (decisions §3).
- **No `EmployeeType` / S4.** Not on the `User` row; a later story (decisions §5).
- **No `department_change` event.** Initial import writes only `joined_company`
  (decision 9).
- **No historical `active` interval** reconstructed for a dismissed employee — one
  `EmploymentStatus` row, not two (decision 10).
- **No `POST /users`, no generic `DELETE` / deactivate route** (AD-14 / AD-16).
- **Not an authentication or session surface** — completing the import does not
  establish a session and dispatches no magic link (FR-3; DEC-UM-008 retired).
- **No real employee data** beyond the delivered pseudonymised list (NFR-1).

## Fixture convention

- `docs/Accounts_template.csv` is the canonical **header / shape** reference and
  the deploy-time source. Its one shipped row is pseudonymised sample data.
- Stage-2 builds small purpose-built semicolon-delimited fixture CSVs (delivered
  header, verbatim) under the backend test tree — e.g.
  `test/user-management/fixtures/seed/*.csv`. **Pseudonymised only** (NFR-1).
- **Shared fixture `seed-basic.csv`** — the composition the positive scenarios
  assume:

  | # | shape | `Email` | `DepartmentId` / `Name` | `Birthday` | `IsDismissed` / `DismissedDate` |
  | --- | --- | --- | --- | --- | --- |
  | 1 | active, dated birthday | `ada@x.example` | `1` / `JS` | `1990-12-10` | `0` / `NULL` |
  | 2 | active, NULL birthday | `grace@x.example` | `1` / `JS` (reuse) | `NULL` | `0` / `NULL` |
  | 3 | dismissed | `alan@x.example` | `2` / `QA` | `1988-06-23` | `1` / `2026-07-31` |
  | 4 | needs normalization | `  Katherine@X.Example ` | `2` / `QA` (reuse) | `1979-03-02` | `0` / `NULL` |
  | 5 | active, new dept | `linus@x.example` | `3` / `Infra` | `NULL` | `0` / `NULL` |

  → 5 `User` rows created, 3 `Department` rows created (`JS`, `QA`, `Infra`),
  5 `DepartmentMembership` rows, 5 `joined_company` events, 1 `dismissed` + 4
  `active` `EmploymentStatus` rows.
- **Personas** ([../README.md](../README.md#canonical-personas)) — the *operators*
  of the import: **Root** (holds `user-management:create`), **Ida** (unrelated FR
  permission — `403` probe, DEC-UM-002), **Eve** / **Colin** (unrelated active
  session). The imported rows above are fixture CSV content, not personas.
- Real-session cases use `Bearer <token:<seeded-uuid>>`; `Bearer <token:Ida>` etc.
  are shorthand for "a session resolving to that seeded row".
- Isolation (DEC-UM-010): one test worker; UUID-owned data; each test cleans only
  what it created.

## What blocks stage-2

| Blocker | Blocks |
| --- | --- |
| `EmploymentStatus` CHECK constraint conflict (decision 10) — `status='dismissed'` currently requires `sourceDepartureId` + `departureReason` | the dismissed half of `um-seed-05` translating to E2E / production |
| `Department` / `DepartmentMembership` Prisma models not yet added (decisions §2 fixes the shape; the migration is stage-3 work) | `um-seed-04`, and the department assertions in `um-seed-01` / `um-seed-08` |
| The import writer + `POST /users/import` route do not exist yet | every file here is committed-red until stage-3 |

## Decisions made in-scenario (need human confirmation at approval)

1. **Endpoint path `POST /users/import`** (not `/users/imports`) — mirrors
   `GET /users/export`; no import-run resource or history table; synchronous summary.
2. **Import capability = `user-management:create`** — reuse the existing seeded
   kernel permission (the one the retired `POST /users` needed) rather than seeding
   a new `user-management:import` key. Seeding a permission is a separate Access
   Control kernel AD-1 sequence; if product wants a dedicated key, this suite
   retargets.
3. **`200`, not `201` or `207`**, even when `errors[]` is non-empty — an
   idempotent upsert of a set, no single `Location`; the summary body carries the
   per-row outcome. Confirm vs `207 Multi-Status`.
4. **HTTP endpoint is upload-only**; the known-path mode is the deploy/operator
   script entrypoint. The HTTP handler never reads a server-local file path.
5. **Synchronous import** — the response is the finished summary; no async job /
   polling resource. Fits the fixed delivered population.
6. **`Department.externalId` stores `DepartmentId` as a string** (`"1"`),
   consistent with `ttId` being a string external id.
7. **`Department.name` is first-write-wins** — a later row with the same
   `DepartmentId` but a different `DepartmentName` reuses the row and does not
   rename it; the divergence is not an `errors[]` entry. Confirm.
8. **`DepartmentMembership.validFrom` = the row's `RegistrationDate`** — the CSV
   has no separate membership date.
9. **Initial import writes only `joined_company`** — no `department_change` for the
   first department assignment. A re-import that moves a user updates the single
   `DepartmentMembership` row in place and writes no `department_change` in Story
   1.1 (department moves/history are the future timetracker path). Confirm.
10. **`EmploymentStatus` for a dismissed import row** = a single
    `{ status:'dismissed', validFrom: DismissedDate, validTo: null,
    departureReason: null, sourceDepartureId: null }` row (per the decisions file).
    **This conflicts with the `EmploymentStatus` CHECK in `database-schema.md`**
    (`status='dismissed'` requires `sourceDepartureId IS NOT NULL AND
    departureReason IS NOT NULL`). The CHECK must be amended to admit an
    import-originated dismissed row with no source `Departure` — a schema decision
    for the architect. The import also does not reconstruct the historical
    `active` interval `[RegistrationDate, DismissedDate)`.
11. **`User.isActive` is `true` for every imported row**, dismissed included — the
    decisions file (§4) overrides the compiled spec's interim `isActive=false`
    stopgap.
12. **Re-import refreshes only import-owned columns** — `firstName`, `lastName`,
    `workEmail`, `birthDay` / `birthMonth`, `companyJoinDate`, `position`,
    `country`, plus the row's `EmploymentStatus` and `DepartmentMembership`. It
    never touches `photo` (Story 1.3), `customFields`, or `ttId` (future sync,
    AD-13) on an existing row.
13. **Duplicate `Email` within one file → both rows skipped** (not "first wins"),
    one `errors[]` entry — the file is ambiguous about which is authoritative.
14. **Malformed-row = per-row skip**, not whole-file rollback.
15. **Ambiguous pre-existing normalized match → row skipped** with a distinct
    `reason`, not a whole-import abort. Confirm (alternative: hard-abort the file).

## Files

| File | actor → request → outcome | Trace |
| --- | --- | --- |
| `um-seed-01-happy-path-import.md` | Root operator POSTs `seed-basic.csv` → 5 `User` rows with mapped S1 fields, summary `{created:5,…}` | FR-1/4/5a/7 · §4.17 · DEC-UM-003/007 · AD-11 |
| `um-seed-02-no-post-users-create-path.md` | Any session POSTs `/users` → `404`/`405`, no row created | FR-4 · §4.17 · AD-14/16/21 |
| `um-seed-03-bootstrap-hr-admin-and-root-id-reuse.md` | Import covers the root person → ACM-0 root `User` id reused, not forked | ACM-0 · DEC-UM-007/009 · AD-12 |
| `um-seed-04-department-create-on-import.md` | Import with a new + a repeated `DepartmentId` → one `Department` per id, one `DepartmentMembership` per user | §4.17 · decisions §2 |
| `um-seed-05-employment-status-mapping.md` | Import of an active + a dismissed row → `EmploymentStatus` mapped; `User.isActive` stays `true` | §4.16 · AD-16 · decisions §4 |
| `um-seed-06-birthday-split.md` | Import of a dated + a NULL `Birthday` → `birthDay`/`birthMonth` split with year dropped; NULL → both `null` | §3.2 · DEC (incomplete-pair) |
| `um-seed-07-null-source-fields.md` | Import → `ttId`/`city`/`workPhone`/`photo` `null`; `createdBy` = root id; `customFields` `{}` | AD-13 · DEC-UM-003 · decisions §5 |
| `um-seed-08-idempotent-re-import.md` | Root operator POSTs the same file twice → 2nd run `{created:0, updated:5}`, no duplicate rows/depts/events, owned-fields-only refresh | §4.17 · DEC-UM-007/009 · decision 12 |
| `um-seed-09-malformed-rows-skipped.md` | Import of a file with a missing field / bad `Birthday` / in-file duplicate `Email` → those rows skipped with `errors[]`, good rows committed; re-run creates the fixed rows | decisions §6 · decision 14 |
| `um-seed-10-import-without-capability-forbidden.md` | Ida (unrelated FR permission) POSTs `/users/import` → `403`, nothing written; facade `isAllowed`, never a `position` check | DEC-UM-002 · AD-4 · access-control.md |
| `um-seed-11-import-unauthenticated.md` | Missing/invalid token / unresolved session POSTs `/users/import` → `401`, nothing written | global 401 rule · access-control.md denial conventions |
