---
title: 'Story 1.5: List Employees with Pagination and Filters'
type: 'feature'
status: draft
created: 2026-08-24
regenerated: 2026-09-01
context: ['{project-root}/_bmad-output/implementation-artifacts/user-management/epic-1-context.md']
---

> Regenerated 2026-09-01 from epics.md v1.5 — **NOT an AD-1 approval.** Pre-v1.5
> `<frozen-after-approval>` block re-opened. `baseline_commit` dropped.

## Intent

**Problem:** Entitled actors can fetch one `User` at a time but cannot browse or
search the directory. A `dismissed` employee must drop out of the default list
while staying findable through an authorized employment-status filter (§4.16,
FR-15, FR-6).

**Approach:** Add `GET /users` (list/filter/paginate) to the `user-management`
module, filtering only on permission-safe S1 fields stored on the `User` row
plus employment status. No new Prisma columns.

## Boundaries & Constraints

**Always:**
- AD-1 gate: scenario docs under `docs/test-cases/user-management/list/` → red
  E2E → implementation. (This story had no pre-v1.5 scenario folder — start from
  a blank page.)
- `domain/` imports nothing from Prisma, NestJS transport, or HTTP.
- Every request routes entitlement through the `ACCESS_CONTROL_PORT` facade
  (Epic 0's real adapter). **List/filter/export/search projection is a separate
  cross-cutting deliverable** (`deferred-work.md`, §3.3.1) — until it lands,
  this endpoint must fail closed on any field it cannot prove the viewer may
  read, and must not leak a value through a filter predicate the viewer cannot
  read (§3.3.6, §4.7).
- **NFR-2:** `GET /users` responds within 2 s for 500+ records with arbitrary
  filters **including permission resolution** — a joint budget shared with
  access-control's `resolveAudiences` bulk path (one round trip per graph).
- `dismissed` employees: absent from the default list, present under an
  authorized `employment status` filter.

**Never:**
- `ttId` and `isActive` are **never** public filters (FR-15).
- No dynamic custom-field filtering, saved views, export, or inline editing —
  platform directory scope.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior |
|---|---|---|
| Paginated list | > 1 page of `User` rows | `200`, one page + pagination metadata |
| Single filter | `GET /users?country=Poland` | Every record has `country: "Poland"` |
| Combined filter | `GET /users?position=Engineer&city=Krakow` | Every record matches both |
| Dismissed hidden | Colin `dismissed`; default list | Colin absent; findable via authorized employment-status filter |
| Perf | 500+ rows, arbitrary filters, permission resolution | Within 2 s (NFR-2) |

## v1.5 Cutover Notes

- The pre-v1.5 spec expected Story 1.4 to forward "excluded from the active
  list" here via an `isActive` filter. v1.5 replaces that with the
  **employment-status** (`active`/`dismissed`) filter — `isActive` is never a
  public filter.

## Open Questions / Gates

- The full list/filter/export/search projection contract is deferred
  (`deferred-work.md`). This story ships a fail-closed column subset; widening the
  projected columns is that separate story's job.
- Exact pagination contract (cursor vs offset) — architect / api-conventions
  follow-up.
