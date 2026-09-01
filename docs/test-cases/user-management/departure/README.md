# User Management — `departure/` (v1.5 Epic 5: Employment Lifecycle)

Stage-1 scenario documents (AD-1) for **Epic 5 — Employment Lifecycle**: an
authorized HR actor records a departure (effective date + reason) and the
platform applies the complete effective-date outcome.

**Status:** unapproved draft (v1.5 refresh, 2026-09-01). Every file here is
**BLOCKED — CC-06; scenario prose only.** Not translatable to a stage-2 E2E or
production code until CC-06 defines the scheduled-departure state, the
effective-date executor, retry, and idempotency contract. `um-deact-*` (generic
`DELETE /users/:id` deactivation) is retired — this is the v1.5 replacement.

## Contents

| File | Proves | Trace |
| --- | --- | --- |
| `um-dep-01-record-a-departure.md` | Recording a future departure stores the schedule without changing current status early. | FR-6 · §4.16 · AD-20 |
| `um-dep-02-blocked-while-managing-or-partnering.md` | Recording is rejected (`409`) while the person still manages or partners anyone; the response names the blocking relationships and offers a re-parent default. | FR-6 · §4.16 · AD-20 |
| `um-dep-03-apply-on-effective-date.md` | On the effective date: status → `dismissed`, profile read-only + off the default list (still filterable — see `list/um-list-05`), open action items → `cancelled — departed`, mentorship pairs auto-close with a system note, account deactivates, all access ends immediately (overriding the project-line 15-minute window); no departure career event. | FR-6 · §4.16 · AD-20 · access-control.md §revocation-timing |
| `um-dep-04-idempotent-retry.md` | The executor retrying a partially/uncertainly-failed departure is idempotent — no duplicate status, cancellation, closure, or journal effect. | FR-6 · AD-20 (retry/idempotency) |

## Endpoints (from api-conventions.md, AD-20 — not yet built)

`POST /users/:id/departures` (`Idempotency-Key`, `{effectiveDate, reason}`) →
`201` after the blocker check; `409` with leak-safe blocker summaries when
responsibilities remain. `POST /users/:id/departure-reparenting`
(`{targetId, expectedBlockerVersion}`). `GET /users/:id/departures/:departureId`
for status. `POST /users/:id/departures/:departureId/retry` (accepts only
`retry_wait`). No `PATCH`/`DELETE`/cancel/reschedule route exists.
