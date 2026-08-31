---
title: 'Story 5.1: Record a Departure'
type: 'feature'
status: draft
created: 2026-09-01
regenerated_from: ../../planning-artifacts/user-management/epics.md
context: ['{project-root}/_bmad-output/implementation-artifacts/user-management/epic-5-context.md']
---

> Compiled 2026-09-01 from epics.md v1.5 — **NEW story** (Epic 5 added by the
> 2026-08-29 v1.5 correct course). **NOT an AD-1 approval.**

## Intent

**Problem:** There is no way to record that an employee is leaving. Generic
deactivation is retired (AD-16). v1.5 requires a durable command carrying an
**effective date** and **reason**, blocked while the person still holds
management/PP responsibility, that does not change the current `active` fact
early (§4.16, AD-20).

**Approach:** `POST /users/:id/departures` with `Idempotency-Key` and
`{effectiveDate, reason}` records a scheduled departure after the authoritative
blocker check and returns `201`. Blocker remediation is the explicit
`POST /users/:id/departure-reparenting {targetId, expectedBlockerVersion}`
command.

## Boundaries & Constraints — GATE

- **CC-06 blocks implementation.** CC-06 must define the scheduled-departure
  representation, executor, retries, and idempotency before stage-2 or
  production work. Scenario prose (AD-1 stage 1) may proceed.
- **AD-20 is the binding target and must not be redefined** at spec level.

## Boundaries & Constraints — behaviour

**Always:**
- AD-1 gate, blank page: `docs/test-cases/user-management/departure/`
  scenario docs → red E2E → implementation.
- The command requires the **`record a departure`** permission (through the
  facade — no role-name check).
- Blocked while the person holds any authoritative direct-report,
  department-manager, PM/DM, or PP responsibility. The `409` returns leak-safe
  blocker summaries, an opaque `expectedBlockerVersion` digest, and the person's
  own manager as a default re-parent target where available.
- `effectiveDate` is a PostgreSQL `DATE`; `BUSINESS_TIME_ZONE` is snapshotted as
  `effectiveTimeZone` at creation, resolving an immutable `dueAt` at `00:00` in
  that zone.
- Idempotency: same key + payload → original result; same key + different
  payload, or a different key while a non-applied departure exists → `409`. The
  canonical hash covers API contract version, path user id, normalized ISO
  `effectiveDate`, normalized reason, authenticated creator id.
- Recording does **not** change the current `active` status early. Once
  scheduled, new direct-report/department-manager/PP responsibility for the
  actor is rejected; new synced PM/DM grants are quarantined with an incident.
- `domain/` imports nothing from Prisma, NestJS transport, or HTTP.

**Never:**
- No generic `DELETE`/deactivate — this is the only lifecycle path.
- No automatic re-parenting; re-parenting is explicit and user-confirmed.
- No `PATCH`/`DELETE`/cancel/reschedule route (spine Deferred).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior |
|---|---|---|
| Record success | Alice manages nobody, partners nobody; authorized actor records a future effective date + reason | `201`; scheduled departure stored; Alice's current `active` status unchanged before the effective date |
| Blocked by responsibility | Alice still manages or partners someone | `409` with leak-safe blocker summaries + `expectedBlockerVersion` + default re-parent target (Alice's own manager where available); no schedule written |
| Re-parent then retry | Authorized actor runs `POST /users/:id/departure-reparenting` with a matching digest | Platform-owned direct/department/PP blockers atomically reassigned + journaled; a changed digest → `409`; the command never records departure itself |
| Timetracker PM/DM blocker | External PM/DM responsibility remains | Returned as external-remediation item; departure stays blocked until sync confirms removal; no platform shadow policy |
| Idempotent replay | Same key + payload | Original `201` result |

## v1.5 Cutover Notes

- The `Departure` aggregate + `EmploymentStatus` interval schema are owned by
  CC-06/AD-20 — do not hand-author against a guessed shape.
- Additive migrations land before worker enablement (AD-21 operational release
  gate).

## Open Questions / Gates

- **CC-06** — hard blocker for stage 2 / production.
- The re-parenting command's atomic reassignment shares a transaction contract
  with Epic 4's relationship commands + journal (CC-07) — coordinate.
