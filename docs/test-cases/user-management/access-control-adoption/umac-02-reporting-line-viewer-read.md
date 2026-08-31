# UMAC-02 · Reporting-line viewer reads a report's profile → 200

**Trace:** SPEC-user-management-access-control-adoption CAP-2 (read) + CAP-4 · `um-integration-contract-response.md` Q3 (`reporting` → allow) · PRD FR-16 · access-control.md §3.2 (Reporting line) · AD-3 (real-consumer E2E, no provider overrides)

## Scenario

**Given** the port is rebound to the real facade adapter; V and T are active
seeded `User` rows; and there is a real `Relationship` row `T` → `V` of
`type='direct'` (T reports to V) — a genuine reporting edge, produced in-suite,
never a hardcoded id (E2E precondition rule).

**When** V calls `GET /users/<T>`.

**Then** the response is `200` with the whole row. The adapter obtains the
audience set from `AccessControlFacade.resolveAudiences(V, [T])`, sees it contains
`reporting`, and allows `user-management:read`. A transitive reporting edge (V is
T's manager's manager) resolves the same way — `reporting` is the transitive
`direct` walk.

**Preconditions:** [fixture](README.md#fixture-convention-per-um-integration-contract-response-md-q6); V and T active; real `Relationship` `T → V` `type='direct'`; the port is rebound.

## Test

- **Test 1 — direct report**
  - **inputURL:** `GET /users/<T-uuid>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<V-uuid>>" } }`
  - **expectedResult:** `200`; whole `User` row for T.
- **Test 2 — transitive reporting line**
  - **stateChange:** a real `Relationship` chain `T → M → V` (`type='direct'`) exists; V is two hops up.
  - **inputURL:** `GET /users/<T-uuid>` with `Bearer <token:<V-uuid>>`
  - **expectedResult:** `200` — `reporting` resolves through the transitive `direct` walk.
