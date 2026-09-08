# UMAC-01 · Self reads own profile → 200 with the S1 identity card

**Trace:** SPEC-user-management-access-control-adoption CAP-1 + CAP-2 (read) + CAP-3 · `um-integration-contract-response.md` Q1 (the adoption seam is the single `ACCESS_CONTROL_PORT` binding, not a route), Q2 (the port shape is kept; the adapter is UM-owned `infrastructure/`), Q3 (READ_USER_FEATURE, `self` → allow), Q5 (S1-card projection ships in Story 0.1) · PRD FR-16 · `access-control.md` §3.2 (Self column) · AD-2 (hexagonal boundary is absolute) / AD-21 (v1.5 brownfield cutover — the interim adapter is deleted in the same change) in `architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md` · AD-3 (real-consumer HTTP → router → session → AccessControl → PostgreSQL E2E, no provider overrides) in `architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md` · `nestjs-di-tokens.md` (only `application/guards/` consumes `ACCESS_CONTROL_PORT`; actions never `@Inject` a port) · `testing-strategy.md` AD-1 (scenario prose → human approval → committed-red E2E → production; no stage is self-certified)

> **Amended 2026-09-05 (PLAT-E4-S4.1c).** The `canEdit` rationale below was
> written under the 2026-09-02 "Variant A" framing (identity card has no
> functional permission; the whole gate is `canAccessSection`). That framing is
> **superseded by SCP 2026-09-04 D1**: `canEdit` is the `profile:identity`
> `'write'` **dual gate** — the audience half
> (`canAccessSection(viewer, 'profile:identity', target) === 'write'`) resolved
> **first**, and only then the feature half
> (`isAllowed(viewer, 'profile:identity:write')`, held implicitly by every
> active employee via `DEFAULT_PERMISSIONS`, D2). Ordering is the invariant: the
> feature half can only subtract, never widen a resolved audience
> (`access-control.md` line 19). **The asserted value of `canEdit` in this file
> is unchanged** — every session holder is an active employee and therefore
> holds the baseline, so the audience half remains the deciding term. The
> section identifier is the human key `profile:identity` (D4); `S1` is a §3.2
> matrix-row citation only, never a string passed to the facade. From 4.1c both
> the `data` read gate and this hint are answered by one call,
> `hasSectionAccess(viewer, 'profile:identity', <level>, target)` — see
> [`s41c-sag-01`](./s41c-sag-01-read-gate-any-audience-allows-none-denies.md)
> and [`s41c-sag-02`](./s41c-sag-02-baseline-holder-without-write-audience-denied.md).

## Scenario

**Given** the production `ACCESS_CONTROL_PORT` is bound to the real
`AccessControlFacade`-backed adapter (`interim-access-control.adapter.ts` deleted),
and V is an active seeded `User`.

**When** V calls `GET /users/<V>` with a session for its own id.

**Then** the response is `200` and the body is the read envelope
`{ data, canEdit }`. `data` is the **S1 identity card** — `toUserResponse` no
longer spreads the whole row; Story 0.1's S1-card DTO returns exactly `id`,
`firstName`, `lastName`, `photo`, `position`, `country`, `city`, `workEmail`,
`workPhone`, `birthDay`, `birthMonth`, `companyJoinDate` and nothing else.
V's Phase-0 audience over itself is `self` (after identity confirmation; Self
is exclusive), a non-empty set, so the adapter allows `user-management:read`.

`canEdit` is the read-only edit-gate hint. **Under the dual gate (SCP
2026-09-04 D1) it is the `profile:identity` `'write'` question, audience half
first.** Self's `canAccessSection(V, 'profile:identity', V)` is `'read'` (§3.2
row S1 gives Self `R (photo RW)` — read-only for self, only the photo is
Self-writable, `umac-09`), rank `1 < 2`, so the audience half denies before the
feature half is reached and **`canEdit` is `false`** for a self read. V does
hold `profile:identity:write` via `DEFAULT_PERMISSIONS` as an active employee;
it changes nothing (`s41c-sag-02`). This does not flip — a person is never the reporting-line manager or
assigned People Partner of themselves.

> **CAP-3 — `{ data, canEdit }`; `data` is the same 12 fields for every
> audience on this route.** `data` **drops** the non-S1 technical fields:
> `ttId` (AD-13 external identity), `isActive` (internal flag, "not exposed"),
> `customFields` (S16), `createdAt`, `createdBy` (audit). Derived S1 display
> fields (manager, people partner, department, mentor, current projects) come
> from other contexts and are out of scope for this route until those land —
> `data` omits them. The *further* narrowing (S10 dates-only, S11 name-only,
> S16 per-field) is the deferred FR-17 Profile Projection story on its own
> surfaces.
>
> **Scope.** Story 0.1 adds this S1-card DTO + envelope as a dedicated mapper
> on the `GET /users/:id` handler only. `GET /users` (list), `POST /users`,
> `PATCH /users/:id`, `DELETE /users/:id`, and `PUT /users/:id/photo` response
> bodies are **unchanged** by this slice — the `{ data, canEdit }` envelope
> convention rolls onto the other section/detail routes as its own later
> planning item.

**Preconditions:** [fixture](README.md#fixture-convention-per-um-integration-contract-response-md-q6); V is an active seeded `User`; the port is rebound and the S1-card DTO is in place (this scenario's E2E is red until `UMAC-1-production` lands — the interim adapter + whole-row spread make the "technical fields absent" assertions fail).

## Test

- **inputURL:** `GET /users/<V-uuid>`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:<V-uuid>>" } }
  ```
- **expectedResult:** `200`. Body is `{ data, canEdit }`. `data` **contains exactly** `id`, `firstName`, `lastName`, `photo`, `position`, `country`, `city`, `workEmail`, `workPhone`, `birthDay`, `birthMonth`, `companyJoinDate` and **does not contain** `ttId`, `isActive`, `customFields`, `createdAt`, `createdBy`. `canEdit` is `false` (`canAccessSection(V, 'profile:identity', V)` is `'read'` for self — §3.2 row S1, Self = `R (photo RW)`; the audience half denies before the feature half is consulted, and it never flips).
