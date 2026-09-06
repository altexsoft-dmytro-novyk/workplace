# S4.2a-OP-03 · Root provisioned only by the production bootstrap can wire relationships and record departures

> **New Stage-1 scenario, PLAT-E4-S4.2a (2026-09-06).** This is the capability
> the increment adds: the canonical ACM-1 `hr-admin` set grows from three keys
> to six, and the two added **feature** keys — `org:relationships:write` and
> `employee:departure:record` — are what turn these routes from `403` into
> `200` for a root that has never seen `scripts/dev-grant-root.ts`. The third
> added key, `profile:timeline:write`, is a **data-write** key and is recorded
> separately in
> [`S4.2a-OP-06`](./s42a-op-06-delegated-hr-admin-timeline-write-accepted-deviation.md)
> as a known accepted deviation; the full amendment record is in
> [`ACM1-FB-01`](../../access-control-kernel/fr-bootstrap/acm1-fb-01-three-canonical-permissions-seeded.md).
>
> **Flag for the Stage-1 gate — harness shape.** No suite in this repository
> today provisions a session holder through the *production* bootstrap and then
> boots Nest against that database; every existing case grants its own FR chain
> from a fixture. The 4.2a spec's Verification proposes recording this as an
> explicit manual run instead, and asks whether it should become an e2e case.
> **This file is written as an e2e scenario and the question is put to the human
> gate**: approve it as a case, or approve it as the script for a recorded
> manual run. Nothing below depends on which is chosen — the steps are the same
> either way, and none of them is a fixture back door.

**Trace:**

- Story [`story-4-2-default-org-relationship-seed.md`](../../../../_bmad-output/implementation-artifacts/platform/story-4-2-default-org-relationship-seed.md) scope item 2 — "a clean `db:seed && db:bootstrap:access-control` on a fresh production DB leaves root fully operational with **no dev script**."
- Spec [`spec-4-2a-root-operator-permission-set.md`](../../../../_bmad-output/implementation-artifacts/platform/spec-4-2a-root-operator-permission-set.md) — Acceptance Criteria, "root can wire relationships and record departures on a deployment with no dev script"; Boundaries, "A key enters the canonical set only with a named live consumer."
- Live consumers, read at `services/backend` HEAD `ef03c88`: `relationships.controller.ts:46` `ORG_RELATIONSHIPS_WRITE_FEATURE`, declared at `:65`, `:100`, `:113`, `:126`, `:140`, `:153`; `departments.controller.ts:33`, declared at `:47`, `:59`; `departures.controller.ts:38` `RECORD_A_DEPARTURE_FEATURE`, declared at `:52`, `:68`, `:83`, `:96`; `users.controller.ts:58` `IMPORT_POPULATION_FEATURE`, declared at `:139`.
- [`umac-06`](./umac-06-no-target-isallowed-delegates-to-facade.md) — the no-target `isAllowed` delegation this file extends from three keys to six. The facade never reads `User.position`; the allow must come from a real FR grant chain (DEC-UM-002).
- [`access-control.md` § Functional-role Kernel MVP (AD-4)](../../../architecture/access-control.md) — `@RequireFeature` is a **feature** gate with no data-audience half, which is exactly why these two keys are safe to seed and `profile:timeline:write` is not.
- [`ACM1-FB-01`](../../access-control-kernel/fr-bootstrap/acm1-fb-01-three-canonical-permissions-seeded.md) and [`ACM1-FB-03`](../../access-control-kernel/fr-bootstrap/acm1-fb-03-role-granted-exactly-three-permissions.md) — the database side of the same change. This file is its consumer-side counterpart: the rows exist *and* they reach the gates.

## Scenario

**Given** a database provisioned by the production path and **nothing else** —
`npm run db:deploy`, then `npm run db:seed`, then
`npm run db:bootstrap:access-control`, with `npm run db:dev:grant-root`
deliberately **not** run — so the only functional-role holder is the root
`User`, attached to the one canonical `hr-admin` FR policy carrying the six
canonical grants. Root then imports a small population through the real route
its `user-management:create` key gates, producing two active employees, a
subject **S** and a prospective manager **M**.

**When** root, signed in with a real session, calls one relationship-write
route and one departure-record route against those employees.

**Then** both succeed — `POST /users/<S>/relationships` returns `201` with the
created `direct` edge, and `POST /users/<S>/departures` returns a success
status with the recorded departure. **Today both return `403`**, because
`org:relationships:write` and `employee:departure:record` are absent from the
canonical set and no other seeded grant supplies them. That inversion is the
increment.

The import step is not scaffolding — it is the third assertion. It proves
`user-management:create` reaches its gate through the same bootstrap-created
chain, and it produces the two employees through a real request rather than a
fixture insert, so no id in this scenario stands for state that nothing
created.

**What this does *not* prove, deliberately.** Root gains **feature** reach here
and no **data** reach. `@RequireFeature` consults `isAllowed` alone; it never
resolves an audience, and none of the six keys appears in
`SECTION_ACCESS_MATRIX` or is consulted by `hasSectionAccess`. Root still
cannot edit an unrelated identity card — that is
[`S4.2a-OP-04`](./s42a-op-04-root-data-reach-unchanged-by-the-operator-set.md),
and it stays `403` until Story 4.2 scope item 3 seats root in the relationship
tree.

**Preconditions:** produced by real in-suite steps, in this order, with no
hand-written id anywhere:

1. `npm run db:deploy`, then `npm run db:seed` with a run-scoped
   `ROOT_WORK_EMAIL`. Root's uuid is read back from `users` by that normalized
   address — the same way
   [`ACM1-FB-01`](../../access-control-kernel/fr-bootstrap/acm1-fb-01-three-canonical-permissions-seeded.md)
   establishes the CAP-8 precondition.
2. `npm run db:bootstrap:access-control`; exit `0` asserted.
3. **`npm run db:dev:grant-root` is not run, and the suite asserts it has not
   been**: `SELECT count(*) FROM "Permissions"` is `6`, not the stopgap's
   seven-key superset, and `UserPolicies` holds exactly one row.
4. The application is booted against that same database.
5. Root's session is `Bearer <token:<root-uuid>>` per the
   [fixture convention](README.md#fixture-convention-per-um-integration-contract-response-md-q6)
   — a real `User` row's UUID, never a persona placeholder.
6. S and M are created by request 1 below; their uuids are threaded from the
   import result, never written literally.

## Test

- **Test 1 — root imports the population (`user-management:create` reaches its gate)**
  - **inputURL:** `POST /users/import`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:<root-uuid>>" },
      "body": "multipart/form-data with a `file` part: the semicolon-delimited population CSV, two active rows — S and M"
    }
    ```
  - **expectedResult:** `200`; the import result names two created employees.
    Their uuids are read from the persisted `users` rows and threaded into the
    requests below. A `403` here means the bootstrap did not attach root to the
    canonical role at all, and the rest of this scenario is not meaningful.
- **Test 2 — root wires a manager edge (`org:relationships:write`)**
  - **inputURL:** `POST /users/<S-uuid>/relationships`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:<root-uuid>>" },
      "body": { "type": "direct", "targetId": "<M-uuid>" }
    }
    ```
  - **expectedResult:** `201`; the created `direct` edge from S to M is
    returned and is persisted — asserted against the `Relationship` row, not
    inferred from the status. **Expected red before Stage 3:** `403`, because
    `org:relationships:write` is not in the canonical set at the baseline
    commit.
- **Test 3 — root records a departure (`employee:departure:record`)**
  - **inputURL:** `POST /users/<S-uuid>/departures`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:<root-uuid>>" },
      "body": { "effectiveDate": "2026-10-01", "reason": "resignation" }
    }
    ```
  - **expectedResult:** success, and the departure is persisted for S.
    **Expected red before Stage 3:** `403`, because
    `employee:departure:record` is not in the canonical set at the baseline
    commit.
- **Test 4 — the department-manager route carries the same key**
  - **Preconditions:** the department is created by request 1 — the population
    import creates `Department` rows from the CSV
    (`population-import.repository.ts:144`), so `<deptId>` is read back from
    the row that import produced, never written literally.
  - **inputURL:** `PUT /departments/<deptId>/manager`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:<root-uuid>>" },
      "body": { "managerUserId": "<M-uuid>" }
    }
    ```
  - **expectedResult:** success, and the department's manager is persisted as
    M. Included because `org:relationships:write` gates **two** controllers,
    and a canonical set that reached only `relationships.controller.ts` would
    still leave a live gate closed. **Expected red before Stage 3:** `403`.
