# S4.2a-OP-05 · A delegated HR Admin gets zero data access from the six-key role

> **New Stage-1 scenario, PLAT-E4-S4.2a (2026-09-06).** Root is not the only
> holder the canonical role will ever have: `hr-admin` is a delegable
> functional role, and after this increment every person an administrator
> attaches to it holds **six** keys instead of three. This file is the
> acceptance test for that delegation, not a footnote — it asserts that the
> grown role still carries no section access for **every** section, with the
> single deliberate exception AF-2 introduces, which is
> [`S4.2a-OP-06`](./s42a-op-06-delegated-hr-admin-timeline-write-accepted-deviation.md).
> The full amendment record is in
> [`ACM1-FB-01`](../../access-control-kernel/fr-bootstrap/acm1-fb-01-three-canonical-permissions-seeded.md).
>
> **Green before and after the implementation stage**, apart from the two
> feature routes in Test 4, which invert from `403` to `200` for the same
> reason [`S4.2a-OP-03`](./s42a-op-03-root-operator-capability-after-production-bootstrap.md)
> does.

**Trace:**

- [`access-control.md` line 19](../../../architecture/access-control.md) **NORMATIVE** and [`docs/project-requirements.md` §2](../../../project-requirements.md) — a functional role never widens data access; feature permissions operate **within** the holder's resolved audiences only.
- [`docs/project-requirements.md` §3.2](../../../project-requirements.md) — the section matrix. `profile:identity` gives `Colleague: R`; the other sections are read-only for the reporting-line audience and read-write for Self and the assigned People Partner alone. An FR grant repaints no cell.
- [`s41c-sag-04`](./s41c-sag-04-functional-grant-never-widens-audience.md) — the same invariant for an ad-hoc grant; this file carries it to the seeded canonical role.
- [`s41c-sag-02`](./s41c-sag-02-baseline-holder-without-write-audience-denied.md) — holding the feature half is necessary and never sufficient; the audience half short-circuits first.
- Spec [`spec-4-2a-root-operator-permission-set.md`](../../../../_bmad-output/implementation-artifacts/platform/spec-4-2a-root-operator-permission-set.md) — Acceptance Criteria, "the NORMATIVE invariant restated for the grown role"; Boundaries, "The delegated-HR-Admin invariant is the acceptance test, not a footnote."
- [`ACM1-FB-06`](../../access-control-kernel/fr-bootstrap/acm1-fb-06-no-other-role-attachment-or-grant.md) — the database side: the bootstrap creates no audience for anyone, only the six grants.

## Scenario

**Given** a database provisioned by the production path alone (`db:deploy` →
`db:seed` → `db:bootstrap:access-control`, no `db:dev:grant-root`), and an
administrator has since attached a **second** active employee, **Nadia**, to
the one canonical `hr-admin` FR policy — the ordinary delegation an
administrator performs, and exactly the addition
[`ACM1R-FB-28`](../../access-control-kernel/fr-bootstrap/acm1r-fb-28-fourth-permission-and-admin-attachments-survive.md)
already dispositions as preserved. Nadia holds all six canonical keys. She has
**no** `direct` and no `people_partner` edge to the active target **T** in
either direction; her only audience over T is `colleague`.

**When** Nadia reads and attempts to write T's profile across the sections the
platform exposes, and separately calls the two feature routes the increment
adds.

**Then** the feature routes open and the data stays shut:

- `GET /users` → `200` (her `user-management:list` key), and `GET /users/<T>` →
  `200` with `canEdit: false` — a colleague reads the identity card by §3.2, so
  the read is not the interesting part; `canEdit: false` is.
- `PATCH /users/<T>` → `403`, T's row unchanged. Holding
  `profile:identity:write` implicitly through `DEFAULT_PERMISSIONS` does not
  help her, because the audience half resolves `read` and returns before the
  feature half is consulted.
- Every other profile section stays at its matrix value for a colleague: she
  writes none of `profile:leave`, `profile:projects`,
  `profile:personal-contacts`, `profile:emergency-contacts` or
  `profile:documents` on T, because none of those keys is in the canonical set
  and none of them has a colleague write cell to begin with.
- `POST /users/<S>/relationships` and `POST /users/<S>/departures` → success.
  These are pure feature actions with no data-audience half, which is precisely
  why they are safe to put in a delegable role.

The one deviation is deliberate and is not asserted here: `profile:timeline:write`
**is** in the canonical set by the 2026-09-06 Product Owner ruling, and
`canEditTimeline` discards its target, so Nadia **can** write T's career
timeline with no relationship. That behaviour, and the reasoning that accepts
it, are recorded in
[`S4.2a-OP-06`](./s42a-op-06-delegated-hr-admin-timeline-write-accepted-deviation.md).
It is kept in its own file on purpose: this file is the invariant, that file is
the dated exception to it, and merging them would let the exception quietly
soften the invariant.

**Preconditions:** [fixture convention](README.md#fixture-convention-per-um-integration-contract-response-md-q6).
Produced by real in-suite steps, no hand-written ids:

1. `npm run db:deploy` → `npm run db:seed` (run-scoped `ROOT_WORK_EMAIL`) →
   `npm run db:bootstrap:access-control`, exit `0`. **`db:dev:grant-root` is
   not run**, and the suite asserts `Permissions` = `6`.
2. Root imports the population through `POST /users/import`, producing Nadia, T
   and S as active employees; all three uuids are threaded from the persisted
   rows.
3. Nadia is attached to the canonical policy by an administrator-shaped insert:
   `INSERT INTO "UserPolicies" ("userId", "policyId") VALUES (<Nadia's uuid>,
   (SELECT id FROM "Policies" WHERE type = 'FR' AND "targetRole" = 'hr-admin'))`.
   The policy is resolved by its natural key **from the bootstrap's own
   output** — never a literal id, and never a second policy created by the
   fixture, because a fixture-created policy would prove something other than
   the shipped role.
4. The suite asserts no `Relationship` row exists between Nadia and T in either
   direction, and that `UserPolicies` now holds exactly `2` rows.
5. Sessions are `Bearer <token:<uuid>>` for real `User` rows.

## Test

- **Test 1 — the delegated holder lists users**
  - **inputURL:** `GET /users` with `Bearer <token:<nadia-uuid>>`
  - **expectedResult:** `200` with the list page. `user-management:list`
    reaches its gate through the canonical chain — the delegation is real.
- **Test 2 — she reads T's card but cannot edit it**
  - **inputURL:** `GET /users/<T-uuid>` with `Bearer <token:<nadia-uuid>>`
  - **expectedResult:** `200`; `{ data, canEdit }` with **`canEdit: false`**.
    §3.2's `profile:identity` row gives Colleague `R`; six functional keys do
    not turn that cell into `RW`.
- **Test 3 — her write is refused and the row is untouched**
  - **inputURL:** `PATCH /users/<T-uuid>`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:<nadia-uuid>>" },
      "body": { "city": "Berlin" }
    }
    ```
  - **expectedResult:** `403`; T's persisted row still carries its imported
    `city` — asserted against the database. This is the NORMATIVE invariant,
    restated for the grown role.
- **Test 4 — the feature half of the role does open, and only the feature half**
  - **inputURL:** `POST /users/<S-uuid>/relationships` with
    `Bearer <token:<nadia-uuid>>`, body
    `{ "type": "direct", "targetId": "<T-uuid>" }`; then
    `POST /users/<S-uuid>/departures` with body
    `{ "effectiveDate": "2026-10-01", "reason": "resignation" }`
  - **expectedResult:** both succeed. **Expected red before Stage 3:** both
    `403`. Paired with Test 3 this is the whole claim of the increment — the
    role gained feature reach and no data reach.
- **Test 5 — no other section opens for her**
  - **inputURL:** the write surface of each remaining profile section the
    platform routes today, as `Bearer <token:<nadia-uuid>>` against `<T-uuid>`
  - **expectedResult:** `403` on every one, with the persisted record unchanged
    in each case. None of `profile:leave:*`, `profile:projects:*`,
    `profile:personal-contacts:*`, `profile:emergency-contacts:*` or
    `profile:documents:*` is in the canonical set, and a colleague holds no
    write cell for any of them. **Flag for the Stage-1 gate:** the set of
    section write routes that actually exist at the baseline commit is smaller
    than §3.2's full matrix; Stage 2 asserts this test over the routes that
    exist and records which sections have no route yet, rather than inventing
    endpoints for them.
