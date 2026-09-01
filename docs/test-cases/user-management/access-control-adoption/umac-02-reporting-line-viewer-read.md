# UMAC-02 · Reporting-line viewer reads a report's profile → 200 with the S1 identity card

**Trace:** SPEC-user-management-access-control-adoption CAP-2 (read) + CAP-3 + CAP-4 · `um-integration-contract-response.md` Q3 (`reporting` → allow) · PRD FR-16 · `access-control.md` §3.2 (Reporting line column), matrix exceptions §3.3 (§3.2 fn 1: manager/PP/department on S1 are read-only for every audience — read is unaffected here) · AD-3 (real-consumer HTTP E2E, no provider overrides) in `architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md`

## Scenario

**Given** the port is rebound to the real facade adapter; V and T are active
seeded `User` rows; and there is a real `Relationship` row `T` → `V` of
`type='direct'` (T reports to V) — a genuine reporting edge, produced in-suite,
never a hardcoded id (E2E precondition rule).

**When** V calls `GET /users/<T>`.

**Then** the response is `200` with the **S1 identity card** — the same field set
`umac-01` and `umac-04` return. The adapter obtains the audience set from
`AccessControlFacade.resolveAudiences(V, [T])`, sees it is non-empty (contains
`reporting`), and allows `user-management:read`. A transitive reporting edge (V is
T's manager's manager) resolves the same way — `reporting` is the transitive
`direct` walk.

> Read-vs-write differs by audience (a reporting-line viewer may `PATCH` S1 — that
> is `umac-07`), but the `GET /users/:id` **response body is the same S1 card**
> for every audience.

**Preconditions:** [fixture](README.md#fixture-convention-per-um-integration-contract-response-md-q6); V and T active; real `Relationship` `T → V` `type='direct'`; the port is rebound and the S1-card DTO is in place.

## Test

- **Test 1 — direct report**
  - **inputURL:** `GET /users/<T-uuid>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<V-uuid>>" } }`
  - **expectedResult:** `200`; body **contains** the S1 fields (`id`, `firstName`, `lastName`, `photo`, `position`, `country`, `city`, `workEmail`, `workPhone`, `birthDay`, `birthMonth`, `companyJoinDate`) and **does not contain** `ttId`, `isActive`, `customFields`, `createdAt`, `createdBy`.
- **Test 2 — transitive reporting line**
  - **Preconditions:** a real seeded `Relationship` chain `T → M → V` (both edges `type='direct'`), so V is two hops up T's reporting line; produced in-suite, never a hardcoded id. This is static seeded state, not a transition — no baseline/change/observe steps.
  - **inputURL:** `GET /users/<T-uuid>` with `Bearer <token:<V-uuid>>`
  - **expectedResult:** `200`, same S1-card assertions (S1 fields present; `ttId`, `isActive`, `customFields`, `createdAt`, `createdBy` absent) — `reporting` resolves through the transitive `direct` walk to chain termination without a repeated node.
