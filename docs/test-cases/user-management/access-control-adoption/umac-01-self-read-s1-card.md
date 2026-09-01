# UMAC-01 · Self reads own profile → 200 with the S1 identity card

**Trace:** SPEC-user-management-access-control-adoption CAP-1 + CAP-2 (read) + CAP-3 · `um-integration-contract-response.md` Q1 (the adoption seam is the single `ACCESS_CONTROL_PORT` binding, not a route), Q2 (the port shape is kept; the adapter is UM-owned `infrastructure/`), Q3 (READ_USER_FEATURE, `self` → allow), Q5 (S1-card projection ships in Story 0.1) · PRD FR-16 · `access-control.md` §3.2 (Self column) · AD-2 (hexagonal boundary is absolute) / AD-21 (v1.5 brownfield cutover — the interim adapter is deleted in the same change) in `architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md` · AD-3 (real-consumer HTTP → router → session → AccessControl → PostgreSQL E2E, no provider overrides) in `architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md` · `nestjs-di-tokens.md` (only `application/guards/` consumes `ACCESS_CONTROL_PORT`; actions never `@Inject` a port) · `testing-strategy.md` AD-1 (scenario prose → human approval → committed-red E2E → production; no stage is self-certified)

## Scenario

**Given** the production `ACCESS_CONTROL_PORT` is bound to the real
`AccessControlFacade`-backed adapter (`interim-access-control.adapter.ts` deleted),
and V is an active seeded `User`.

**When** V calls `GET /users/<V>` with a session for its own id.

**Then** the response is `200` and the body is the **S1 identity card** —
`toUserResponse` no longer spreads the whole row; Story 0.1's S1-card DTO returns
`id`, `firstName`, `lastName`, `photo`, `position`, `country`, `city`,
`workEmail`, `workPhone`, `birthDay`, `birthMonth`, `companyJoinDate` and nothing
else. V's Phase-0 audience over itself is `self` (after identity confirmation; Self
is exclusive), a non-empty set, so the adapter allows `user-management:read`.

> **CAP-3 — the S1 card is the same fields for every audience on this route.**
> The response **drops** the non-S1 technical fields: `ttId` (AD-13 external
> identity), `isActive` (internal flag, "not exposed"), `customFields` (S16),
> `createdAt`, `createdBy` (audit). Derived S1 display fields (manager, people
> partner, department, mentor, current projects) come from other contexts and
> are out of scope for this route until those land — the response omits them.
> The *further* narrowing (S10 dates-only, S11 name-only, S16 per-field) is the
> deferred FR-17 Profile Projection story on its own surfaces.
>
> **Scope.** Story 0.1 adds this S1-card DTO as a dedicated mapper on the
> `GET /users/:id` handler only. `GET /users` (list), `POST /users`,
> `PATCH /users/:id`, `DELETE /users/:id`, and `PUT /users/:id/photo` response
> bodies are **unchanged** by this slice.

**Preconditions:** [fixture](README.md#fixture-convention-per-um-integration-contract-response-md-q6); V is an active seeded `User`; the port is rebound and the S1-card DTO is in place (this scenario's E2E is red until `UMAC-1-production` lands — the interim adapter + whole-row spread make the "technical fields absent" assertions fail).

## Test

- **inputURL:** `GET /users/<V-uuid>`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:<V-uuid>>" } }
  ```
- **expectedResult:** `200`. Body **contains** `id`, `firstName`, `lastName`, `photo`, `position`, `country`, `city`, `workEmail`, `workPhone`, `birthDay`, `birthMonth`, `companyJoinDate`. Body **does not contain** `ttId`, `isActive`, `customFields`, `createdAt`, `createdBy`.
