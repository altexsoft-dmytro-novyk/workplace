---
title: 'Story 1.5: List Employees with Pagination and Filters'
type: 'feature'
created: '2026-08-24'
status: 'ready-for-dev'
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/user-management/epic-1-context.md']
baseline_commit: '6254ed50d910acb4bfa8f046e3cf0b72f3153934'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Entitled actors can only fetch one `User` at a time (`GET /users/:id`, once Story 1.2 lands) — there is no way to browse or search the employee directory. Story 1.4's deactivation deliberately left "excluded from the active list" behavior undelivered, forwarding it here (epic-1-context.md, Cross-Story Dependencies).

**Approach:** Add a `GET /users` list/filter handler to the existing `user-management` hexagonal module, reusing Story 1.1's skeleton (`domain/`, `application/`, `infrastructure/`, `User` entity, repository, AccessControl port) rather than recreating it. Filtering and pagination operate only on S1 fields already stored on the `User` row; no new Prisma columns or migration are needed for this story.

## Boundaries & Constraints

**Always:**
- AD-1 gate, blank-page case: no scenario doc exists yet under `docs/test-cases/user-management/` for the list endpoint. Get `docs/test-cases/user-management/list/um-list-*.md` approved first, then write failing E2E tests, then implement — never code before a red E2E test exists. This applies to 3 of this story's 4 acceptance criteria (pagination, single filter, combined filters).
- Partial exception: the 4th AC (`isActive=true` excludes a deactivated user) already has an approved-pending scenario doc (`docs/test-cases/user-management/deactivation/um-deact-02-deactivated-user-excluded-from-active-list.md` — filed under Story 1.4's folder but belongs to this story per epics.md) and an existing red E2E assertion (`um-deact-02` inside `test/user-management/deactivation.e2e-spec.ts` on the backend submodule's `user-management` branch, commit `865df5f`). No new scenario doc or test file is needed for that one case — landing `GET /users` should flip it green as-is.
- Router ordering (AD-14): `GET /users/export` is not built in this story, but it and any other literal sibling route on the `User` resource must be declared before `GET /users/:id` so it isn't swallowed by the param route. This story only adds `GET /users` (not `:id`-shaped, no conflict), but the controller file this story touches is the one future stories must keep this ordering in — flagging it here so it isn't missed later.
- Every entitlement check for this endpoint routes through the shared AccessControl facade (AD-9) — no direct role-flag or policy-table read inside the controller.
- Filters cover only S1 fields living on the `User` row: name, position, location (`country`/`city`), contact fields, dates, `ttId`, `isActive`.
- `domain/` imports nothing from Prisma, NestJS transport, or HTTP.
- Subject to NFR-2: responds within 2s at 500+ records with arbitrary filters, including permission resolution — a budget shared jointly with access-control's tier walk.
- This story's own E2E scenarios cover workflow/data correctness only, not who is entitled to call the endpoint — entitlement logic itself is proven in access-control's own test suite (epic-1-context.md). The controller must still route every check through the facade; it just isn't this story's job to re-prove 401/403 behavior.

**Ask First:**
- Pagination parameter shape and defaults (page/limit vs. cursor-based, default/max page size) are not specified in epics.md — confirm before locking the query DTO.
- Filter match semantics (exact match vs. partial/contains, case sensitivity) are not specified — confirm before writing the `um-list-*` scenario docs.

**Never:**
- No dynamic custom-field filtering, saved views, export endpoint, or inline editing — all explicitly out of scope for this story/epic (PRD §4.1).
- No `updatedAt`/`updatedBy` — no named consumer, don't add speculatively.
- Don't reintroduce manager/current-project/people-partner/department/mentor as filterable or returned fields — they are not columns on `User`.
- Don't rewrite or edit the existing `um-deact-02` scenario doc or its E2E assertion to make this story land — it is already correct and should just start passing.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Paginated listing | More than one page's worth of `User` records exist; entitled actor submits `GET /users` with pagination params | `200`, a page of results plus pagination metadata (FR-16) | N/A |
| Single-field filter | `User`s exist with varying `country`; `GET /users?country=Poland` | `200`, every returned record has `country: "Poland"` (FR-16) | N/A |
| Combined filters | `User`s exist with varying `position`/`city`; `GET /users?position=Engineer&city=Krakow` | `200`, every returned record matches both filters (FR-16) | N/A |
| Active-only filter excludes deactivated | Colin seeded/deactivated to `isActive: false`; Root submits `GET /users?isActive=true` | `200`, result set does not contain Colin's `id` (FR-9/FR-16; traces `um-deact-02` — scenario doc and E2E case already exist, see Code Map) | N/A |

</frozen-after-approval>

## Code Map

- `docs/test-cases/user-management/list/` -- NEW folder, does not exist yet: needs `um-list-01` (pagination), `um-list-02` (single filter, e.g. `country`), `um-list-03` (combined filters) scenario docs -- AD-1 stage 1, blank page, not yet started
- `docs/test-cases/user-management/deactivation/um-deact-02-deactivated-user-excluded-from-active-list.md` -- EXISTS (approved-pending; lives in the `deactivation/` folder but belongs to this story per epics.md line 222) -- no changes needed
- `test/user-management/list.e2e-spec.ts` -- NEW, does not exist yet: E2E tests for `um-list-01..03` -- AD-1 stage 2, not yet started
- `test/user-management/deactivation.e2e-spec.ts` -- EXISTS on backend branch `user-management` (commit `865df5f`) — contains this story's `um-deact-02` case only (alongside Story 1.4's `um-deact-01`/`um-deact-03`); the other 3 ACs above need a new scenario doc + new E2E test file, not this one
- `src/user-management/{domain,application,infrastructure}/**` -- REUSES Story 1.1's hexagonal skeleton (stashed/not-yet-merged premature implementation) -- do not recreate the module, entity, repository, or port scaffolding
- `src/user-management/application/controllers/users.controller.ts` -- ADD handler: `GET /users` (list/filter), alongside the existing `POST /users`; keep AD-14 ordering in mind for any future literal sibling route (e.g. `GET /users/export`) added to this file
- `src/user-management/application/dtos/list-users-query.dto.ts` -- NEW: pagination params + S1-field filter query DTO
- `src/user-management/application/actions/list-users.action.ts` -- NEW: list-users use case; calls the AccessControl port before querying
- `src/user-management/infrastructure/user.repository.ts` -- EXTEND (reused from Story 1.1): add a paginated, filterable list query method over S1 fields
- `src/user-management/domain/interfaces/access-control.port.ts` -- REUSED as-is from Story 1.1, no changes expected

## Tasks & Acceptance

**Execution:**
- [ ] Write `docs/test-cases/user-management/list/um-list-01..03.md` (pagination, single filter, combined filters) and get them approved -- AD-1 stage 1
- [ ] `test/user-management/list.e2e-spec.ts` -- write failing E2E tests for `um-list-01..03` -- AD-1 stage 2
- [ ] Verify `test/user-management/deactivation.e2e-spec.ts` (backend branch `user-management`, commit `865df5f`) is available in the branch this story lands on, so its existing `um-deact-02` case can flip green with no test edits
- [ ] `application/dtos/list-users-query.dto.ts` -- pagination + S1-field filter query DTO
- [ ] `infrastructure/user.repository.ts` -- add paginated, filterable list query method (S1 fields only; excludes inactive unless `isActive` is explicitly requested)
- [ ] `application/actions/list-users.action.ts` -- list-users use case, AccessControl port called before querying
- [ ] `application/controllers/users.controller.ts` -- add `GET /users` handler

**Acceptance Criteria:**
- Given the 4 E2E scenarios above (3 new, 1 inherited from `um-deact-02`), when `npm run test:e2e` runs, then all pass with no real network calls
- Given the module builds, when `npm run build` runs, then it succeeds with no dangling imports

## Design Notes

`GET /users` is a pure read/query path: no new Prisma model fields or migration are required, only a new repository query method translating validated query params into a Prisma `where` clause scoped to S1 fields, plus `skip`/`take` (or cursor) pagination. The AccessControl port call happens once, ahead of the query, consistent with Story 1.1's pattern of a single port/interface call per action rather than inline role logic — this keeps the NFR-2 budget (2s at 500+ records, permission resolution included) attributable to one well-defined call rather than scattered checks. Pagination parameter shape and filter match semantics are open questions (see "Ask First" above) and should be pinned down before the `um-list-*` scenario docs are drafted, since the docs need concrete request/response shapes to be reviewable. The `um-deact-02` case is a genuine freebie: it was written and red-committed against Story 1.4's folder in anticipation of this story, and needs no rework — only `GET /users` needs to exist for it to pass.

## Verification

**Commands:**
- `npm run test:e2e` -- `user-management/list` (once written) and `user-management/deactivation` specs pass, including `um-deact-02`
- `npm run build` -- no TS errors
- `npm run lint` -- clean
