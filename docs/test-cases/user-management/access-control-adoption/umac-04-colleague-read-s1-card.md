# UMAC-04 · Colleague / unrelated active session reads a profile → 200 with the S1 identity card

**Trace:** SPEC-user-management-access-control-adoption CAP-2 (read) + CAP-3 · `um-integration-contract-response.md` Q3 (`colleague` → allow, S1 card), Q5 (S1-card projection ships in Story 0.1) · PRD FR-16 · `docs/project-requirements.md` §3.2 (S1 Identity card row is `R` for the Colleague column; legend: Colleague = "any authenticated employee holding none of the above roles") · `access-control.md` §3.3.4 (colleague whitelist — exactly S1, S10 dates-only, S11 project name; the *further* S10/S11/S16 narrowing is FR-17 on its own surfaces, not this route) · AD-2 (User Management alone owns the route shape, guard, binding, adapter, and projection)

## Scenario

**Given** the port is rebound; V and T are active seeded `User` rows with **no**
`Relationship` edge between them and V is not T (V's Phase-0 audience over T is the
`colleague` floor only).

**When** V calls `GET /users/<T>`.

**Then** the response is **`200`** with the **`{ data, canEdit }` envelope** —
`data` is the **same fields every other audience gets** on this route. §3.2's S1
(Identity card) row is `R` for the Colleague column, and the matrix legend
defines Colleague as any authenticated employee holding none of the above roles
— so every active authenticated viewer is at least a Colleague and is entitled
to S1. This is a **positive** test: there is no "two-state" rule, no `403`, and
no deferred flip.

`canEdit` is **`false`** — and, unlike self/reporting/pp, it is `false` by
**section access**: `canAccessSection(V, 'S1', T)` returns `'read'` for a
colleague, so `canEdit` is `false` regardless of any functional permission. It
never flips to `true` for a colleague.

> **The S1 card projection (CAP-3, Story 0.1).** `data` contains exactly `id`,
> `firstName`, `lastName`, `photo`, `position`, `country`, `city`, `workEmail`,
> `workPhone`, `birthDay`, `birthMonth`, `companyJoinDate`. It **does not**
> contain `ttId`, `isActive`, `customFields`, `createdAt`, or `createdBy`.
> Derived S1 display fields (manager, people partner, department, mentor,
> current projects) come from other contexts and are out of scope for this
> route until those land — `data` omits them. The *further* colleague
> narrowing — S10 dates-only (`GET /users/:id/leaves`), S11 project-name-only,
> S16 per-field visibility — is the deferred FR-17 Profile Projection story on
> those own surfaces, not this route.

A genuinely unrelated *field* route for a colleague (e.g. `GET
/users/:id/personal-contacts`, S2, absent from the colleague whitelist) is a
`404`/`—`-cell case owned by other slices and is out of this slice's scope.

**Preconditions:** [fixture](README.md#fixture-convention-per-um-integration-contract-response-md-q6); V and T active seeded rows; no `Relationship` edge either direction; V ≠ T; the port is rebound (this scenario's E2E is red until `UMAC-1-production` ships the S1-card DTO — under the interim adapter `toUserResponse` spreads the whole row, so the "technical fields absent" assertions fail).

## Test

- **inputURL:** `GET /users/<T-uuid>`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:<V-uuid>>" } }
  ```
- **expectedResult:** `200`. Body `{ data, canEdit }`. `data` **contains exactly** `id`, `firstName`, `lastName`, `photo`, `position`, `country`, `city`, `workEmail`, `workPhone`, `birthDay`, `birthMonth`, `companyJoinDate` and **not** `ttId`, `isActive`, `customFields`, `createdAt`, `createdBy` — identical `data` to `umac-01` / `umac-02` / `umac-03`. `canEdit` is `false` (colleague → `canAccessSection` `'read'`; never flips true).
