# UM-SEED-12 · The deploy-script entrypoint loads `docs/Accounts_template.csv` in the deploy order

**Trace:** requirements §4.17 · [decisions §1](../../../../_bmad-output/implementation-artifacts/user-management/epic-1-story-1-1-decisions.md) (the operator endpoint accepts the file OR reads it from the known path) · [testing-strategy.md](../../../architecture/testing-strategy.md) ("deploy-time stories invoke their real production entrypoint") · [seed README](README.md#deployment-order-binding) (binding deployment order; "the HTTP endpoint never reads a server-local path — upload only") · [seed README](README.md#seam-table) seam row "Deploy/operator script entrypoint" · epics.md Story 1.1

## Scenario

**Given** a fresh environment being deployed. The binding order is
`npm run db:deploy` → `npm run db:seed` (ACM-0 root `User`) →
`npm run db:bootstrap:access-control` (ACM-1 FR policy + grant + root attachment)
→ **population import** → `npm run start:prod`.

**When** the population-import step runs as its **real production entrypoint** — a
deploy/operator script that reads the delivered `docs/Accounts_template.csv` from
the known repo path (same class as `npm run db:seed`) — **after** seed and
bootstrap, **before** the app serves traffic.

**Then**:

- the script writes through the **same import service, normalization, and
  idempotent-upsert contract** as `POST /users/import` — normalized `workEmail`,
  `Department` create-on-import, `DepartmentMembership`, `EmploymentStatus`
  mapping, one `joined_company` event per new user, `createdBy` = ACM-0 root id.
  For the shipped one-row sample this is one `User`
  (`email+boot@provider.domain`, normalized), one `Department`
  (`externalId "1"`, `name "JS"`), one `DepartmentMembership`
  (`validFrom 2026-08-17`), one `active` `EmploymentStatus` (`IsDismissed=0`),
  one `joined_company` event.
- running the script a **second time** is idempotent — every row is `updated`,
  `created: 0`, `departmentsCreated: 0` (`um-seed-08`); the deploy is re-runnable.
- a row whose normalized `Email` equals `ROOT_WORK_EMAIL` **updates** the ACM-0
  root row in place (`um-seed-03`) — the script depends on `db:seed` having run
  first.
- the **HTTP endpoint never reads a server-local path**: `POST /users/import`
  requires the multipart `file` part and ignores / rejects any body field that
  names a path. A request with no `file` part is a **file-level `400`, nothing
  written** (decision §2c; `um-seed-09` Test 3), whatever path-like fields it
  carries — as is any non-CSV / header-mismatched / structurally unparseable
  `file` part. Only the deploy/operator script reads `docs/Accounts_template.csv`
  from the repo path; it shares the writer and the same file-level-`400` /
  row-level-`200` contract but is invoked in-process, not over HTTP.

**Preconditions:** [fixture](../README.md#canonical-personas); fresh migrated DB;
`db:deploy` → `db:seed` → `db:bootstrap:access-control` completed; the repo
working tree contains `docs/Accounts_template.csv` at the known path.

## Test

- **Test 1 — the script entrypoint, in order**
  - **stateChange:** run `npm run db:seed`, then `npm run db:bootstrap:access-control`, then the population-import script (its real entrypoint) reading `docs/Accounts_template.csv`.
  - **expectedResult (database state):**
    - one `users` row for the normalized sample `Email`; `createdBy` = ACM-0 root id; mapped S1 fields per the [column mapping](README.md#column--user-field-mapping-resolved--per-the-2026-09-01-decisions).
    - one `department` row `externalId = "1"`, `name = 'JS'`, `parentId IS NULL`; one `department_membership` row `validFrom = '2026-08-17'`.
    - one `employment_status` row `status = 'active'`, `validFrom = '2026-08-17'`.
    - one `user_events` row `type = 'joined_company'`, `source = 'system'`, `eventDate = '2026-08-17'`.
- **Test 2 — re-run the script**
  - **stateChange:** run the population-import script a second time against the same file.
  - **expectedResult:** no new rows in any of the tables above; the run reports every row as `updated` / `departmentsCreated: 0`.
- **Test 3 — the HTTP endpoint is upload-only**
  - **inputURL:** `POST /users/import`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:<root-uuid>>", "content-type": "application/json" },
      "body": { "path": "docs/Accounts_template.csv" }
    }
    ```
  - **expectedResult:** `400` (no multipart `file` part — a file-level failure per decision §2c); no import runs; datastore unchanged. A path field in the body is never honored.
