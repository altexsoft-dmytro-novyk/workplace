# User Management — `list/` (Epic 1 Story 1.5: List Employees with Pagination and Filters)

AD-1 **Stage-1** scenario documents for **Epic 1 Story 1.5**, following the
team-wide authoring pattern in [../../README.md](../../README.md): one test case
per file, each opening with a plain-language **Scenario** (Given/When/Then)
followed by the explicit request spec (`inputURL`, `inputRequest`,
`expectedResult`), traced to `docs/project-requirements.md` (§), the
[epics.md](../../../../_bmad-output/planning-artifacts/user-management/epics.md)
Story 1.5 acceptance criteria, PRD FR-15 / FR-6, and architecture decisions.

Contract: [`spec-1-5-list-employees-with-pagination-and-filters.md`](../../../../_bmad-output/implementation-artifacts/user-management/spec-1-5-list-employees-with-pagination-and-filters.md)
(`status: draft`). The spec notes this story "had no pre-v1.5 scenario folder —
start from a blank page"; this folder is the blank-page rewrite. The four
pre-v1.5 draft files (`um-list-01..04`, plus the interim `um-list-05`) are
**replaced** — some IDs are reused for the same broad topic, retargeted to the
v1.5 contract; `um-list-06..12` are new.

## Status — UNAPPROVED DRAFT

Regenerated 2026-09-02 against spec v1.5, Story 1.1's shipped `EmploymentStatus`
aggregate, and the Access Control adoption seam. **No file here is approved.**
Per-file human approval under the AD-1 Stage-1 gate is required before any
Stage-2 E2E; `author` must differ from `approver` — an agent's review of its own
output is never the approval ([testing-strategy.md](../../../architecture/testing-strategy.md)).
No `approvals.yaml` records any of this.

## Scope

`GET /users` — the paginated, filterable, permission-safe public employee
listing (api-conventions.md "four shapes", shape 1). This suite covers workflow /
data correctness **and** the endpoint's own no-target capability gate
(`um-list-07`) — the list gate is a simple `isAllowed(caller,
'user-management:list')` check, not the per-target audience walk that
`access-control-adoption/` owns for `GET /users/:id`.

**Out of scope** (other stories / deferred): field-level per-viewer list
projection (`deferred-work.md` §3.3.1 — deferred; until it lands this endpoint
returns a fixed fail-closed field set, `um-list-08`); dynamic custom-field
filtering; saved views; `GET /users/export`; inline editing; caller-chosen sort
columns; substring / fuzzy search; the Epic 5 departure **workflow** that
produces `EmploymentStatus: dismissed` (CC-06-blocked — stage-2 seeds the fact
directly).

## Personas

From [../README.md](../README.md#canonical-personas). **Root** — holds the
`hr-admin` FR grant chain carrying `user-management:list`; the entitled actor in
every positive case. **Ida** — authenticated, only an unrelated functional-role
permission; the `403` capability-denial probe (DEC-UM-002, never a role-name
check). Unauthenticated (`authorization: ""`) → `401`. Employee rows under test
are seeded directly via Prisma with a per-run prefix — there is **no
`POST /users`** in v1.5.

## Files

| File | actor → request → outcome | Trace |
|---|---|---|
| `um-list-01-pagination-and-metadata.md` | Root `GET /users?page&pageSize` over >1 page → `200`, `{items,page,pageSize,total,totalPages}`, bounded slice, disjoint pages, size cap | Story 1.5 AC1 · FR-15 · §4.1 · AD-14 |
| `um-list-02-filter-country.md` | `GET /users?country=Poland` → every row `country=="Poland"`, exact match | Story 1.5 AC2 · FR-15 · §4.1 |
| `um-list-03-compound-filters.md` | `GET /users?position=Engineer&city=Krakow` → every row matches both (AND); null `city` never matches | Story 1.5 AC3 · FR-15 · §4.1 |
| `um-list-04-filter-remaining-identity-fields.md` | Root filters on `firstName`/`lastName`/`workEmail`/`workPhone`/`birthDay`+`birthMonth`/`companyJoinDate` → breadth of permission-safe `User`-row filters | Story 1.5 AC2/3 · FR-15 · §4.1 |
| `um-list-05-dismissed-hidden-by-default.md` | Colin `active`→`dismissed` (`stateChange`) → drops from the default `GET /users`; Alice stays; keys on current `EmploymentStatus.status`, not `isActive` | Story 1.5 AC4 · FR-15/FR-6 · §4.1/§4.16 |
| `um-list-06-dismissed-findable-via-authorized-filter.md` | `GET /users?employmentStatus=dismissed` → dismissed Colin returned; `=active` mirrors default; bad value `400`; only `user-management:list` gates it | Story 1.5 AC4 · FR-15/FR-6 · §4.1/§4.16 |
| `um-list-07-endpoint-authorization.md` | Root `200` / Ida `403` leak-free / no token `401` — no-target `isAllowed('user-management:list')`, no `position` check | Story 1.5 · FR-15 · AD-9/AD-4 · access-control.md denial conventions |
| `um-list-08-fixed-fail-closed-projection.md` | Every row = exactly 13 keys (12 S1-card fields + `employmentStatus`); never `ttId`/`isActive`/`customFields`/`createdAt`/`createdBy`/derived fields; uniform, not per-viewer | Story 1.5 · FR-15 · access-control.md §3.3.1/§3.3.6/§4.7 · deferred-work.md §3.3.1 |
| `um-list-09-unsafe-and-unknown-filters-rejected.md` | `?ttId=` / `?isActive=` / `?createdBy=` / unknown key → `400`, never silently applied or ignored (fail-closed, no probing) | Story 1.5 · FR-15 · access-control.md §3.3.6/§4.7 |
| `um-list-10-empty-result-set.md` | No-match filter / page beyond last → `200`, `items:[]`, consistent `total`/`totalPages` (not `404`/`400`) | Story 1.5 · FR-15 · api-conventions.md shape 1 |
| `um-list-11-deterministic-default-sort.md` | Default order `lastName,firstName,id` — stable across pages, repeatable; `?sort=` → `400` (later scope) | Story 1.5 · FR-15 · §4.1 |
| `um-list-12-perf-nfr2-stage2-note.md` | 500+ rows + filters within 2 s (NFR-2, Stage-2 `@perf`); exactly one facade call, zero per-row calls; forward: bulk `resolveAudiences`, never N | Story 1.5 · NFR-2 · access-control.md §3.3.1 |

## Interim `GET /users` handler vs the Story 1.5 target

The endpoint already exists (`users.controller.ts` `@Get()` → `ListUsersAction`
→ `UserService.list` → `user.repository.ts:list`), left in place by UMAC-1. These
scenarios describe the **target v1.5** behaviour; the interim handler diverges:

| Aspect | Interim (today) | Story 1.5 target |
|---|---|---|
| Capability gate | `@RequireFeature('user-management:list')` through the guard/facade — **correct**, keep | unchanged |
| Response envelope | `PaginatedResponseDto` = `{ items, total, page, pageSize }` | add `totalPages` |
| Row shape | `toUserResponse(user)` — **whole `User` row spread** (leaks `ttId`, `isActive`, `customFields`, `createdAt`, `createdBy`) | fixed 13-key permission-safe projection (`um-list-08`) — no whole-row spread |
| Accepted filters | incl. `ttId` (string) and `isActive` (boolean) — **both must go** (FR-15) | 10 permission-safe `User`-row fields + `employmentStatus`; unknown/removed key → `400` |
| Unknown query params | `whitelist: true` → silently stripped | `forbidNonWhitelisted: true` → `400` (fail-closed, `um-list-09`) |
| Dismissed exclusion | `where.isActive = filter.isActive ?? true` — filters the **wrong** flag: Story 1.1 dismissed employees are `isActive: true`, so they are **not** hidden today | join current `EmploymentStatus` (`validTo IS NULL`); default excludes `status='dismissed'`; `?employmentStatus=dismissed` includes them (`um-list-05`/`06`) |
| `isActive` handling | `?isActive=false` returns purged rows | `isActive` never a param (`400`); `isActive=false` rows always excluded internally |
| Default sort | `orderBy: { createdAt: 'asc' }` | `lastName ASC, firstName ASC, id ASC` (`um-list-11`) |
| Default `pageSize` | `10` (shared `PaginationQueryDto`) | `25` (override in `ListUsersQueryDto`, not the shared DTO); max stays `100` |
| Access Control per row | none | none this story; forward bulk `resolveAudiences` when §3.3.1 projection lands (`um-list-12`) |

Stage-2 will re-derive `list-v15.e2e-spec.ts` from the approved files (the
existing `um-list-01..05` describe/it blocks and their filenames change).

## Decisions made in-scenario — confirm at approval

All undecided by the spec / api-conventions; chosen here as the most
convention-consistent option and written as the expected outcome. **Each needs
human confirmation at Stage-1 approval.**

1. **Pagination shape = offset, envelope `{ items, page, pageSize, total,
   totalPages }`.** Chosen over cursor because the shipped `PaginatedResponseDto`
   / `PaginationQueryDto` are already offset (`page`/`pageSize`), directory
   browsing wants jump-to-page, and 500-row scale needs no cursor stability.
   `items` is the row-array key (matches the shipped DTO). `totalPages =
   ceil(total / pageSize)` — **`0` when `total` is `0`** (alternative: floor to
   `1`). `totalPages` is a **new** field the shipped DTO lacks.
2. **Default `pageSize = 25`, max `100`, default `page = 1`.** Shipped shared
   `PaginationQueryDto` currently defaults to `10`; the story overrides the
   default to `25` **locally in `ListUsersQueryDto`** (not the shared DTO — other
   endpoints keep `10`). `pageSize > 100` → `400` (existing `@Max(100)`).
   Non-positive / non-integer `page` / `pageSize` → `400` (existing).
3. **Fixed projection = the 12 `GET /users/:id` S1-card fields *plus*
   `employmentStatus` (`"active"` | `"dismissed"`).** The `+employmentStatus`
   is the one deviation from the task's "same 12" wording, taken because FR-15
   says the listing exposes "permission-safe profile fields **and employment
   status**", and the value is a straight join on the current `EmploymentStatus`
   row — **not** per-row audience resolution, so it does not breach the
   fail-closed rule. If the reviewer prefers strictly 12, drop `employmentStatus`
   from the body; `um-list-06` then asserts the filter by row identity only.
4. **No per-row `canEdit` / envelope on list items.** `deferred-work.md` line
   "list rows are OUT (N facade calls; lists stay read-only projections)".
5. **Employment-status filter param = `?employmentStatus=active|dismissed`.**
   Chosen over `?status=` (less ambiguous). Absent → **active only**.
   `?employmentStatus=active` → explicit active (== default set).
   `?employmentStatus=dismissed` → dismissed only. Any other value → `400`.
6. **"Dismissed" = the target's current `EmploymentStatus` row (`validTo IS
   NULL`) with `status = 'dismissed'`.** A `User` with **no** `EmploymentStatus`
   row → treated as `active` / visible (the import always writes one; `isActive`
   independently hard-excludes purged rows). Confirm this default-active
   fallback.
7. **The `employmentStatus=dismissed` filter is gated by `user-management:list`
   alone** — no separate "view dismissed employees" capability, and **no new
   kernel permission / seed** (consistent with Story 1.1 reusing
   `user-management:create`). Confirm, or name a stricter capability.
8. **`isActive` is never a query parameter.** `?isActive=…` → `400` (removed from
   `ListUsersQueryDto`). `isActive = false` (purged) rows are **always** excluded
   from every response, default and `employmentStatus=dismissed` alike.
9. **Unknown / non-permission-safe query keys → `400`** (`forbidNonWhitelisted:
   true` on the list DTO), body names the offending param. Never silently
   stripped (today's behaviour) and never silently applied — a fail-closed
   posture so a rejected predicate cannot be read as "applied, matched nothing"
   (§3.3.6 / §4.7). Alternative considered and rejected: silently ignore.
10. **Default sort = `lastName ASC, firstName ASC, id ASC`.** `id` (uuidv7) is
    the stable tiebreaker that keeps offset paging consistent. Replaces the
    interim `createdAt ASC`. Confirm the column choice (`lastName` vs
    `createdAt`).
11. **`?sort=` / `?order=` are not supported this story** — they fall under the
    unknown-key `400` rule (decision 9). Caller-chosen sort is later directory
    scope. Confirm `400` vs silently ignore.
12. **Filter matching is exact equality**, filters combine with **AND**, and an
    equality predicate never matches a `NULL` column (`?city=Krakow` excludes
    `city IS NULL`). Substring / case-insensitive search is later scope.
13. **A no-match query → `200` + `items: []` + `total: 0` + `totalPages: 0`**;
    a page past the last page → `200` + `items: []` with the real filtered
    `total` / `totalPages`. Never `404`, never `400`.
14. **`um-list-12` is a Stage-2 concern.** The wall-clock 2 s / 500-row
    assertion is a `@perf` spec (or is deferred to the §3.3.1 projection suite
    that owns the §7 budget); the facade **call-count** assertion (exactly one
    `isAllowed`, zero per-row calls, no `N+1`) is checkable in the Stage-2 E2E
    now.

## What blocks Stage-2

| Blocker | Blocks |
|---|---|
| The interim handler still spreads the whole `User` row and accepts `ttId` / `isActive` filters | `um-list-08`, `um-list-09` are committed-red until the projection + DTO tightening land in Stage-3 |
| No `EmploymentStatus` join in `user.repository.ts:list` (it filters `isActive`, the wrong flag) | `um-list-05`, `um-list-06` red until the join + `employmentStatus` predicate land |
| `forbidNonWhitelisted` not set for the list DTO; `totalPages` absent; default sort is `createdAt` | `um-list-09`, `um-list-01` (metadata key), `um-list-11` red until Stage-3 |
| Epic 5 departure workflow (CC-06) | nothing here — stage-2 seeds the `EmploymentStatus: dismissed` fact directly against the test DB (the aggregate itself shipped with Story 1.1) |
| A `@perf` harness seeded to 500+ rows + a facade call-counter on `ACCESS_CONTROL_PORT` | `um-list-12` wall-clock (Test 2); the call-count (Test 1) is checkable now |
