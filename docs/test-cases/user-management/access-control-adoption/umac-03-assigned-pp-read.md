# UMAC-03 · Assigned People Partner reads an employee's profile → 200

**Trace:** SPEC-user-management-access-control-adoption CAP-2 (read) + CAP-4 · `um-integration-contract-response.md` Q3 (`pp` → allow) · PRD FR-16 · access-control.md §3.2 (PP column), §2.1 (assigned PP + HR line) · Epic 0 constraint "CC-07 does not block Epic 0 — the facade *reads* `Relationship type='people_partner'`"

## Scenario

**Given** the port is rebound; V and T are active seeded `User` rows; and there is
a real `Relationship` row `T` → `V` of `type='people_partner'` (V is T's directly
assigned People Partner), produced in-suite.

**When** V calls `GET /users/<T>`.

**Then** the response is `200` with the whole row — `resolveAudiences(V, [T])`
contains `pp`, which the adapter maps to allow for `user-management:read`.
Reading the `people_partner` edge to resolve the PP audience is **not** blocked by
CC-07; only the Epic 4 PP *write*/journal path is. Transitive PP-HR-line
propagation above V stays fail-closed to the directly assigned PP (AD-19
Department-boundary gate) — out of scope for this read.

**Preconditions:** [fixture](README.md#fixture-convention-per-um-integration-contract-response-md-q6); V and T active; real `Relationship` `T → V` `type='people_partner'`; the port is rebound.

## Test

- **inputURL:** `GET /users/<T-uuid>`
- **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<V-uuid>>" } }`
- **expectedResult:** `200`; whole `User` row for T.
