# UMAC-08 · PATCH body with manager / PP / department fields is rejected regardless of audience

**Trace:** SPEC-user-management-access-control-adoption CAP-2 (write, §3.2 fn 1) · `um-integration-contract-response.md` Q3 step 3 ("manager, people partner and department are read-only for every audience on S1 ... enforced in `EditUserAction` / `UpdateUserDto`, not in the guard ... the rejection must be explicit and tested") · access-control.md §3.3 (§3.2 fn 1–2 S1 derived fields) · PRD FR-9 refinement · epics.md Story 1.2 (third AC)

## Scenario

**Given** V is a fully-entitled writer over T (reporting or PP; holds the edit
permission — the dual gate of `umac-07` passes).

**When** V submits `PATCH /users/<T>` whose body carries an organisational fact —
`manager` / `reportsTo` / `managerId`, `peoplePartner` / `peoplePartnerId`, or
`department` / `departmentId`.

**Then** the request is **rejected explicitly** (`400`) — not silently stripped
and 200'd — and **no** `Relationship`, policy, or access edge changes. Manager,
People Partner, and department are read-only through S1 for **every** audience
(§3.2 fn 1); they change only through Epic 4's dedicated organisational-relationship
screen. The rejection lives in `EditUserAction` / `UpdateUserDto`, not the guard.

> **Current-state note (for the code stage).** `UpdateUserDto` today carries no
> `manager` / `peoplePartner` / `department` fields at all, so `ValidationPipe`
> `whitelist: true` **silently strips** them and the request 200s on the other
> fields. Q3 requires an **explicit** rejection (e.g. `@IsEmpty()` on those keys,
> matching the existing treatment of `photo`/`isActive`/`id`/`createdAt`/`createdBy`)
> so a client that tries to change an org fact through S1 gets a `400`, not a
> quiet success. This scenario asserts the explicit `400`.

**Preconditions:** [fixture](README.md#fixture-convention-per-um-integration-contract-response-md-q6); V is an entitled writer over T; real `Relationship` `T → V` `type='direct'`; the port is rebound.

## Test

- **Test 1 — org field in the PATCH body → 400**
  - **inputURL:** `PATCH /users/<T-uuid>`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:<V-uuid>>" },
      "body": { "position": "Senior Engineer", "managerId": "<someOtherUserId>" }
    }
    ```
  - **expectedResult:** `400` naming the rejected field; T's `position` unchanged on a follow-up read; no `Relationship` change for T.
- **Test 2 — same for `peoplePartnerId` and `departmentId`** — each rejected `400`, no relationship/policy change.
