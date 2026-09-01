# UM-SEED-09 · File-level failure → `400` nothing written; every row-level problem → `200` per-row skip, good rows commit

**Trace:** requirements §4.17 · [spec-1-1](../../../../_bmad-output/implementation-artifacts/user-management/spec-1-1-import-seeded-population.md) I/O matrix ("never silently pick one"; deliberate `NULL` birthday accepted) · [decisions §2b / §2c / §6](../../../../_bmad-output/implementation-artifacts/user-management/epic-1-story-1-1-decisions.md) (**file-level** failure — no `file` part, non-CSV / wrong content-type, header row missing or not matching the expected columns, structurally unparseable — → `400`, nothing written; **row-level** problems → `200` with the summary + `errors[]`, the bad row per-row skipped, every good row committed; an in-file duplicate normalized `Email` is a per-row skip — first occurrence processed, later duplicates skipped, rest of the import commits; re-run creates the fixed rows) · [seed README](README.md#malformed-row-behavior-settled-in-scenario) (file-level `400` vs uniform per-row skip for all row-level problems) · [DEC-UM-007](../../../architecture/user-management-test-decisions.md#dec-um-007--workemail-normalization-oq2--kept-reconciled-to-kernel-reality) (normalized-email comparison for the in-file duplicate check) · epics.md Story 1.1

## File-level vs row-level (decision §2c)

Two disjoint dispositions:

- **File-level failure → `400`, nothing written.** No multipart `file` part; the
  part is not a CSV / wrong content-type / unreadable; the header row is missing
  or does not match the expected delivered columns; the file is structurally
  unparseable; or a file-wide precondition fails. The body identifies the
  failure; **zero** rows are touched, no `Department` / `EmploymentStatus` /
  `joined_company` row is written, the summary counters are not returned.
- **Row-level problems → `200`** with `{ created, updated, departmentsCreated,
  skipped, errors[] }`. Individual rows in an **otherwise-valid** file that fail
  are per-row skipped; every good row commits. There is **no** whole-import
  `400` branch for a row-level problem, and **no** partial `400` — a structurally
  valid file whose every data row is bad still returns `200` (`created: 0`,
  all rows in `skipped` / `errors[]`).

## Scenario

**Given** the deployment order has completed through
`db:bootstrap:access-control`.

A **structurally valid** file is one with a readable CSV `file` part whose header
row matches the expected delivered columns. Only such a file reaches row
processing; anything else is a **file-level `400`** (see above), nothing written.

Every **row-level problem** in an *otherwise-valid* file has the **same** disposition — the
offending row is **skipped**, it writes nothing, `skipped` is incremented, one
`{ line, email, reason }` entry is added to `errors[]`, and every well-formed row
in the same file is still imported and committed. HTTP status stays **`200`**.
Row-level problems are:

- a **missing required source value** — e.g. no `Email` (the natural key);
- an **unparseable `Birthday`** — e.g. `1990-13-40` (a deliberate `Birthday =
  NULL` is *not* a problem — it is accepted as "unknown", `um-seed-06`);
- `IsDismissed=1` with **no `DismissedDate`**;
- a **duplicate normalized `Email` within the file** — a row whose `Email`, after
  `trim()` + `toLowerCase()` (DEC-UM-007), equals that of an **earlier** row in
  the same file. The **first** occurrence is processed normally (create / update);
  each **later** row with that same normalized email is the one skipped, with
  `reason: "email already exists"`.

There is **no whole-file rollback** and **no whole-import `400`** for a row-level
problem: the delivered population is large and fixed, so one bad row must not
block loading the rest. The operator reads `errors[]`, fixes the source file, and
re-runs — re-running is idempotent (`um-seed-08`), so a fixed row is simply
`created` on the next pass.

> An `Email` that matches an **existing active `User`** from a prior import is
> **not** an error — that is the normal idempotent `updated` path (`um-seed-08`).
> The "email already exists" skip reason here is strictly the **within-file**
> case: two rows of *this* file sharing a normalized email.

**When** Root (the HR-Admin operator) `POST`s `/users/import` with a fixture
mixing well-formed and row-level-malformed rows:

| line | shape | `Email` | note |
| --- | --- | --- | --- |
| 1 | well-formed | `ok1@x.example` | imports |
| 2 | **missing required field** | *(empty)* | no `Email` (the natural key) |
| 3 | **unparseable `Birthday`** | `bad-bday@x.example` | `Birthday = 1990-13-40` |
| 4 | duplicate — first occurrence | `dup@x.example` | **processed normally** (imports) |
| 5 | duplicate — later occurrence | `  DUP@x.example ` | normalizes to line 4's key → **skipped** |
| 6 | well-formed | `ok2@x.example` | imports |

**Then**:

- lines 1, 4, and 6 are **imported and committed** — line 4 (the first
  `dup@x.example`) is a normal `created` row.
- line 2 → **skipped**, `skipped += 1`, one `errors[]` entry
  `{ line: 2, email: null, reason: "<missing required field: Email>" }`.
- line 3 → **skipped**, `skipped += 1`, one `errors[]` entry
  `{ line: 3, email: "bad-bday@x.example", reason: "<unparseable Birthday>" }`.
- line 5 → **skipped**, `skipped += 1`, one `errors[]` entry
  `{ line: 5, email: "dup@x.example", reason: "email already exists" }` (the
  normalized value, and the line that could not be written — line 5, not line 4).
- summary: `{ created: 3, updated: 0, departmentsCreated: <D for lines 1,4,6>,
  skipped: 3, errors: [<3 entries>] }`.
- **HTTP status is `200`**, not `207` / `4xx`, even with a non-empty `errors[]` —
  the body carries the per-row outcome (in-scenario decision 3).
- **each row is its own transaction:** a skipped row writes **nothing** — no
  `User`, no `Department` created solely for it, no `DepartmentMembership`, no
  `EmploymentStatus`, no `joined_company` event.

**And when** the operator fixes the file (adds line 2's `Email`, corrects line
3's `Birthday`, removes the line-5 duplicate — or gives it a distinct `Email`)
and re-imports:

- the previously-skipped rows are now **`created`** (idempotent re-run —
  `um-seed-08`); lines 1, 4, and 6 come back as `updated`; `skipped: 0`,
  `errors: []`, `200`.

**Preconditions:** [fixture](../README.md#canonical-personas); fresh DB through
bootstrap; Root holds the `hr-admin` FR grant chain (the import is HR-Admin-only);
the 6-row malformed fixture above is the first upload, its corrected version the
second.

## Test

- **Test 1 — import the malformed file**
  - **inputURL:** `POST /users/import`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:<root-uuid>>", "content-type": "multipart/form-data" },
      "body": "<multipart; file part = the 6-row malformed fixture (delivered header verbatim)>"
    }
    ```
  - **expectedResult:** `200`; `created = 3`, `skipped = 3`, `updated = 0`;
    `errors` has 3 entries — line 2 (missing `Email`), line 3 (unparseable
    `Birthday`), line 5 (`reason: "email already exists"`, `email:
    "dup@x.example"`) — each with a `line` and a human-readable `reason`.
  - **expectedResult (database state):** `users` gains exactly 3 rows
    (`ok1@x.example`, `dup@x.example` once, `ok2@x.example`); no row for
    `bad-bday@x.example` or an empty email; exactly one row whose stored
    `workEmail` is `dup@x.example`; no orphan `Department` /
    `department_membership` / `employment_status` / `user_events` row for any
    skipped line.
- **Test 2 — re-import the corrected file**
  - **inputRequest:** `file part = the corrected fixture` (line 2 has an `Email`,
    line 3 a valid `Birthday`, line 5 removed or given a distinct `Email`).
  - **expectedResult:** `200`; `created` = the count of previously-skipped rows
    now valid, `updated` = 3 (lines 1, 4, 6), `skipped = 0`, `errors = []`; the
    datastore now holds every distinct employee from the file exactly once.
- **Test 3 — file-level failure aborts the whole import (`400`, nothing written)**
  - **inputURL:** `POST /users/import`
  - Run three sub-cases, each with `authorization: Bearer <token:<root-uuid>>`:
    - **(a) no `file` part** — a multipart body with no `file` part (or a JSON
      body) → `400`.
    - **(b) header mismatch** — a CSV `file` part whose header row is missing, or
      lists columns that are not the expected delivered set → `400`.
    - **(c) not a CSV** — a `file` part that is not parseable as
      semicolon-delimited CSV (binary / wrong content-type / unreadable) → `400`.
  - **expectedResult:** `400` with a leak-free body naming the failure class; **no
    summary counters**; the datastore is **unchanged** — no `users`, `department`,
    `department_membership`, `employment_status`, or `user_events` row is written,
    even for rows that would have been well-formed. Re-uploading a fixed,
    structurally valid file then imports normally (`200`, per Test 1 semantics).
