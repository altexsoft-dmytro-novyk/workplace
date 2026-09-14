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
- **Test 6 — the delegated holder PATCHes a missing target id** *(added 2026-09-13, E4-C04c / CONFLICT-UM-01)*
  - **inputURL:** `PATCH /users/<freshly generated uuidv7>` `{ city }` with
    `Bearer <token:<nadia-uuid>>`
  - **expectedResult:** `404`, not `403` — the hidden-target question is
    answered before any section or feature check, exactly as
    [`umac-11`](./umac-11-hidden-target-denial-oracle.md) Test 3 proves for an
    ordinary caller. Nadia's six canonical feature keys are never consulted.
- **Test 7 — the delegated holder PATCHes an inactive target** *(added 2026-09-13, E4-C04c / CONFLICT-UM-01)*
  - **precondition:** a real imported employee, deactivated in-suite
    (`isActive: false`) after import — fixture setup only, mirroring
    [`umac-11`](./umac-11-hidden-target-denial-oracle.md) Test 4.
  - **inputURL:** `PATCH /users/<inactive-uuid>` `{ city }` with
    `Bearer <token:<nadia-uuid>>`
  - **expectedResult:** `404`, not `403`; the target's row is unchanged.

## Tests 8–18 — every other route the six-key canonical role gates *(added 2026-09-13, E4-C04b)*

`test-design-epic-platform-4.md` E4-C04b's Planned half: "every other `hr-admin`
feature route that exists at run time." Test 4 above already proved
`org:relationships:write` and `employee:departure:record` open for Nadia
through exactly one route each (`POST .../relationships`,
`POST .../departures`). These tests enumerate the REMAINING routes carrying
those same two feature keys — `relationships.controller.ts`,
`departments.controller.ts`, `departures.controller.ts` — plus
`user-management:create` and `user-management:deactivate`, neither of which
had any route exercised by Nadia elsewhere. All real HTTP against the real
bootstrap-delegated role, never a `RunFixtures` grant. `user-management:list`
(Test 1) and `profile:timeline:write` (`s42a-op-06` Tests 1–2) already have
their one live route covered.

- **Test 8 — `PUT /users/<S2>/relationships/people-partner { targetId: <T> }`** → `200`, edge persisted (`type: 'people_partner'`).
- **Test 9 — `DELETE /users/<S2>/relationships/people-partner`** → `200`, edge gone.
- **Test 10 — `DELETE /users/<S2>/relationships/<relationshipId>`** (the `direct` S2→T edge Test 4 created) → `200`, edge gone.
- **Test 11 — `POST /users/<T>/departments { departmentId: <JS dept> }`** → `201`, a second concurrent `DepartmentMembership` row for T.
- **Test 12 — `DELETE /users/<T>/departments/<JS dept>`** → `200`, that membership closed.
- **Test 13 — `PUT /departments/<QA dept>/manager { managerUserId: <T> }`** → `200`. Not S: S already carries a scheduled departure from `s42a-op-03` Test 3, and `SetDepartmentManagerAction` refuses that target with `409` — a real business rule, unrelated to the capability gate.
- **Test 14 — `DELETE /departments/<QA dept>/manager`** → `200`, the `unit-manager` AR policy link removed.
- **Test 15 — `POST /users/import`** (one more employee, real CSV through the real route) → `200`, `created: 1`.
- **Test 16 — `DELETE /users/<the employee Test 15 created>`** → `200`, `isActive: false`.
- **Test 17 — `GET /users/<S2>/departures/<the departure Test 4 recorded>`** → `200`.
**N/A, recorded rather than tested:** the E4-C04b ticket text names "`POST /users`
and role assignment" as example hr-admin routes. `POST /users` (a bare create)
was removed from the binding docs by platform story 1-8's create-path removal
— `users.controller.ts` declares no such route, only `POST /users/import`
(Test 15). "Role assignment" (attaching an FR policy to a user) has no HTTP
route anywhere in the codebase at all — `grep -rn "@Post\|@Put\|@Patch" src`
over every controller shows no route touching `Policies` / `UserPolicies`; the
only way a user is attached to the canonical `hr-admin` policy today is the
administrator-shaped raw insert this suite's own precondition performs (the
same one that delegates to Nadia). Both are recorded here as not existing at
run time, not silently dropped.

- **Test 18 — structural, not HTTP.** `POST :id/departures/:departureId/retry` (Story 5.2, needs a `retry_wait` state from a fenced-apply failure) and `POST :id/departure-reparenting` (needs an unresolved blocker) need domain preconditions this suite does not build elsewhere and are not independently HTTP-tested for Nadia here. Test 18 instead confirms by source read that `departures.controller.ts` decorates all four of its routes — `record`, `findOne`, `retry`, `reparent` — with the identical `@RequireFeature(RECORD_A_DEPARTURE_FEATURE)`, the same constant and the same `AccessControlGuard` mechanism Tests 4 and 17 already prove open for Nadia. **This is the one E4-C04b sub-case recorded as evidenced structurally rather than by an additional live HTTP call — not an N/A: the route exists, and the gate is the same gate.**
