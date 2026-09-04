---
title: 'Departure workflow'
type: 'feature'
created: '2026-09-03'
status: 'done'
review_loop_iteration: 0
baseline_commit: 'b51ef3766ceccf3f894aabeb935663a031ee6908'
context:
  - '{project-root}/services/frontend/CLAUDE.md'
  - '{project-root}/services/frontend/.claude/rules/'
  - '{project-root}/_bmad-output/implementation-artifacts/user-management/spec-organisational-relationships.md'
  - '{project-root}/docs/architecture/api-conventions.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The backend has the Epic 5 departure surface (`POST /users/:id/departures`, blocker re-parenting, status, retry) but nothing in the frontend records a departure, resolves the blockers it reports, or shows a scheduled departure's status.

**Approach:** Add a Departure screen at `/employees/:id/departure` (linked from the profile): a record form, a blocker-resolution flow when the backend reports blocking responsibilities, and a status view for the scheduled departure with a retry action.

## Boundaries & Constraints

**Always:**
- Follow every `services/frontend/.claude/rules/*` convention (page folder + UI-only component + `hooks/`; data only via TanStack Query hooks in `src/api/hooks/`, request fns suffixed `ApiCall`; i18n keys first; semantic colour tokens only; arrow components; `@/` imports; components < 200 lines; forms via `react-hook-form` + `zod`). Reuse `src/lib/http.ts`, `StatePanel`, `src/lib/employeeFormatters.ts`.
- Record: `POST /users/:id/departures` with an `Idempotency-Key` header (a client `crypto.randomUUID()` held in a ref for the life of one form fill — the SAME key is reused across a resubmit of the same values, a NEW key is minted when the form values change — so an accidental double-submit is idempotent but a corrected resubmit isn't a mismatch). Body `{ effectiveDate, reason }`. Client-validate `effectiveDate` is a real future date and `reason` is non-empty (the backend also 400s both).
- Handle the `POST` outcomes: `201` → status view; `409 { error: 'departure_blocked_by_responsibilities', blockers, expectedBlockerVersion, defaultReparentTargetId? }` → blocker panel; `409 { error: 'departure_already_scheduled' }` → "this employee already has a scheduled departure" (there is no list endpoint to link to it); `409 { error: 'idempotency_key_payload_mismatch' }` → "the form changed since the last attempt — reload and resubmit"; `400` → field errors; `403` → permission notice (attempt-and-handle, same pattern as the org screen).
- Blocker panel: render each `blockers[]` entry — `kind` (`direct_report` / `department_manager` / `people_partner`), its `summary`, and the affected `targets` (`{ userId, name }`) or `departmentName`. Offer "Re-parent everything to <name>" using `defaultReparentTargetId` when present (resolve the name via the person-picker's directory data or `GET /users/:id`), and "Choose someone else" opening the shared person-picker. Send `POST /users/:id/departure-reparenting { targetId, expectedBlockerVersion }` (echo the version verbatim). On `200 { reassigned, remainingExternalBlockers }`: if `remainingExternalBlockers === 0` prompt "Blockers cleared — record the departure now" (resubmit `POST /users/:id/departures` with a fresh key); otherwise show "external (timetracker) blockers remain — resolve them in the source system". Map `400` (target is the departing employee — also block client-side), `404` (unknown target), `422` (inactive target), `409 { error: 'blocker_version_stale' }` → "the situation changed — reload the blockers" (resubmit the departure `POST` to get a fresh version).
- Status view: `GET /users/:id/departures/:departureId` → `DepartureView` — state badge (`scheduled` / `processing` / `retry_wait` / `applied`), `effectiveDate`, `dueAt`, `effectiveTimeZone`, `reason`, `createdAt`; for a non-`scheduled` state also `attempts` and `lastError`; once `applied`, `appliedAt`. When `state` is `processing` or `retry_wait`, refetch on a short interval (~15 s) until it leaves that state. For `retry_wait`, show "Retry now" → `POST /users/:id/departures/:departureId/retry` → `202` refetch; `409 { error: 'departure_not_retryable' }` → refetch + a note; `404` → "this departure is no longer available".
- The `departureId` is known only from the record `POST` response — keep it in page state (and reflect it in the URL, e.g. `?departure=<id>`, so a reload keeps the status view).
- After a successful record or reparenting, invalidate any affected `['employee', id]` / `['employee', id, 'access-journal']` cache.
- `401` anywhere → the G1 interceptor.
- Lift the person-picker from `src/pages/EmployeeOrganisationPage/components/PersonPicker/` to `src/components/PersonPicker/` (shared); update the G4 import. Add shadcn components via `npx shadcn@latest add` only.

**Ask First:**
- Any change to `services/backend` (a "list departures for a user" read, a cancel/reschedule route, name resolution for blocker target ids).
- Polling faster than ~10 s, or adding a websocket.
- Showing `GET /health/departures` ops metrics on this screen.

**Never:**
- A cancel / reschedule / edit-departure UI — the backend has no such route (a product decision).
- Recording a departure for the currently signed-in user without the same flow (there is no self-exception).
- Inventing a departure "list" or guessing a `departureId` you were not handed.
- Re-parent target === the departing employee.
- G6/G7 (deferred, no backend).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Open the screen, no departure yet | `/employees/:id/departure` | The record form (effective date, reason), a back link to the profile | — |
| Record a clean departure | Future date + reason, no blockers | `POST` with `Idempotency-Key` → `201` → status view showing `state: 'scheduled'`, due date, timezone, reason; URL gains `?departure=<id>` | — |
| Past / invalid date | `effectiveDate` today or earlier | zod blocks submit with a field error | No request |
| Blocked by responsibilities | `POST` → `409 departure_blocked_by_responsibilities` | Blocker panel listing each responsibility + affected names; "re-parent to <default>" and "choose someone else" | — |
| Re-parent to the default | Confirm → `POST .../departure-reparenting` `200`, `remainingExternalBlockers: 0` | "Blockers cleared" → one click resubmits `POST /users/:id/departures` (fresh key) → status view | `409 blocker_version_stale` → "reload the blockers" (resubmit departure to refresh) |
| Re-parent, external blockers remain | `200`, `remainingExternalBlockers > 0` | "N external blockers remain — resolve in the timetracker"; departure not resubmitted | — |
| Re-parent target invalid | `404` / `422` / `400` | Field-level message on the picker / action | — |
| Already scheduled | `POST` → `409 departure_already_scheduled` | "This employee already has a scheduled departure" (no link — no list endpoint) | — |
| Status: retry_wait | `GET .../:departureId` → `state: 'retry_wait'` | State badge + `attempts` + `lastError`; "Retry now" button; auto-refetch every ~15 s | "Retry now" → `202` → refetch; `409 departure_not_retryable` → refetch + note |
| Status: applied | `state: 'applied'` | Terminal "applied" panel with `appliedAt`; no actions; polling stops | — |
| No permission | Any write → `403` | Permission notice; the form/actions disable | — |
| Unknown departure id in URL | `?departure=<bad>` → `GET` `404` | "This departure is no longer available" + a path back to the record form | — |
| Server/network error | any read → `500` / network | Error panel with "Try again" | — |

</frozen-after-approval>

## Code Map

- `services/backend/src/user-management/application/controllers/departures.controller.ts:51` -- `POST /users/:id/departures` (`@RequireFeature('employee:departure:record')` → `403`; `@Headers('idempotency-key')`); `:67` `GET .../:departureId`; `:81` `POST .../:departureId/retry` (`202`); `:94` `POST .../departure-reparenting` (`200`).
- `services/backend/src/user-management/application/actions/record-departure.action.ts` -- `400` missing `Idempotency-Key`, `400` non-future / unparseable `effectiveDate`; conflict body passed through verbatim.
- `services/backend/src/user-management/domain/services/departure.rules.ts:86` -- `buildBlockedResponse`: `{ error: 'departure_blocked_by_responsibilities', blockers: [{ kind, summary, targets?: [{userId,name}], departmentId?, departmentName? }], expectedBlockerVersion, defaultReparentTargetId? }`.
- `services/backend/src/user-management/domain/services/departure.service.ts:25` -- `DepartureView { departureId, userId, state, effectiveDate, effectiveTimeZone, dueAt, reason, createdAt, attempts?, lastError?, appliedAt? }`; states `scheduled | processing | retry_wait | applied`.
- `services/backend/src/user-management/application/actions/reparent-departure.action.ts:11` -- `DepartureReparentingResponse { reassigned: { directReports, departmentManager, peoplePartnerAssignments }, remainingExternalBlockers }`; `400` target===subject, `404` unknown, `422` inactive, `409 { error: 'blocker_version_stale' }`.
- `services/backend/src/user-management/application/dtos/record-departure.dto.ts` / `departure-reparenting.dto.ts` -- request bodies.
- `services/frontend/src/pages/EmployeeOrganisationPage/components/PersonPicker/**` -- to move to `src/components/PersonPicker/**` and reuse; props `{ title, description, excludeIds, busy, onPick, onClose }`.
- `services/frontend/src/lib/http.ts` -- `httpStatus` / `errorCode`.
- `services/frontend/src/pages/EmployeeProfilePage/EmployeeProfilePage.tsx` -- add the "Departure" link next to the "Organisation" link.
- `services/frontend/src/components/StatePanel/StatePanel.tsx`, `src/lib/employeeFormatters.ts` (`formatIsoDate`, `fullName`), `src/pages/EmployeeOrganisationPage/components/PermissionNotice` (consider lifting to shared).
- `services/frontend/src/router/index.tsx` -- add `employees/:id/departure`.
- `services/frontend/src/types/api.ts` -- add `DepartureView`, `DepartureState`, `DepartureBlocker`, `BlockedDepartureResponse`, `ReparentingResult`, `RecordDeparturePayload`.

## Tasks & Acceptance

**Execution:**
- [ ] `src/components/PersonPicker/**` -- move from `EmployeeOrganisationPage/components/PersonPicker/`; update the ManagerSection / PeoplePartnerSection imports.
- [ ] `src/types/api.ts` -- the departure types above.
- [ ] `src/api/departures.ts` -- `recordDepartureApiCall(id, payload, idempotencyKey)` (sets the header), `getDepartureApiCall(id, departureId)`, `retryDepartureApiCall(id, departureId)`, `reparentDepartureApiCall(id, { targetId, expectedBlockerVersion })`.
- [ ] `src/api/hooks/useDeparture.ts` -- `useQuery(['employee', id, 'departure', departureId])` enabled when `departureId` is set; `refetchInterval` returns 15000 only while `state` ∈ {processing, retry_wait}, else `false`; do not retry `403`/`404`.
- [ ] `src/api/hooks/useRecordDeparture.ts`, `useReparentDeparture.ts`, `useRetryDeparture.ts` -- mutations.
- [ ] `src/pages/EmployeeDeparturePage/EmployeeDeparturePage.tsx` + `hooks/useEmployeeDeparturePage.ts` -- reads `:id` and `?departure`, owns the phase (`form` | `blocked` | `status`), the idempotency-key ref, `canWrite`, the identity header (`useEmployee(id)`), and the profile back link.
- [ ] `src/pages/EmployeeDeparturePage/components/DepartureForm/DepartureForm.tsx` (+ `hooks/useDepartureForm.ts`) -- RHF + zod (future date, non-empty reason); on submit calls the record mutation; maps `409` variants, `400`, `403`.
- [ ] `src/pages/EmployeeDeparturePage/components/BlockerPanel/BlockerPanel.tsx` (+ `hooks/useBlockerResolution.ts`) -- renders `blockers[]`; the default + custom re-parent actions; calls the reparent mutation; on `remainingExternalBlockers === 0` surfaces the "record now" resubmit; maps `blocker_version_stale` / `400` / `404` / `422`.
- [ ] `src/pages/EmployeeDeparturePage/components/DepartureStatus/DepartureStatus.tsx` -- state badge + fields; `retry_wait` → `attempts` / `lastError` / "Retry now"; `applied` → `appliedAt` terminal panel; `404` → "no longer available" + back-to-form; `5xx` → error + retry.
- [ ] `src/pages/EmployeeProfilePage/EmployeeProfilePage.tsx` -- the "Departure" link.
- [ ] `src/router/index.tsx` -- the route.
- [ ] `src/locales/en/translation.json` -- `departure.*` (form labels, blocker `kind` labels + copy, all mapped error strings, status states, retry, the "already scheduled" / "no longer available" / permission copy).
- [ ] `e2e/flows/departure/{fixtures.ts,helpers.ts,departure.spec.ts}` -- cover the I/O matrix: clean record → `201` + `Idempotency-Key` header present + URL `?departure=` + status view; past date blocked client-side (no request); `409 blocked` → blocker panel lists names; re-parent to default → `POST` body `{ targetId, expectedBlockerVersion }` → `remainingExternalBlockers:0` → "record now" resubmits with a **new** key → status view; `remainingExternalBlockers > 0` copy; `blocker_version_stale` handling; `departure_already_scheduled` copy; `retry_wait` status shows attempts/lastError and "Retry now" → `202` refetch; `applied` terminal panel; write `403` → permission notice; `?departure=<bad>` → `404` "no longer available"; a resubmit with unchanged values reuses the same key (assert the header value is stable), a changed value mints a new one.

**Acceptance Criteria:**
- Given a future date and a reason with no blockers, when I submit, then `POST /users/:id/departures` carries an `Idempotency-Key` header and a `{ effectiveDate, reason }` body, and on `201` the screen shows the scheduled status and the URL gains `?departure=<id>`.
- Given the backend returns `409 departure_blocked_by_responsibilities`, when the panel renders, then each blocking responsibility is listed with the affected people's names, and a re-parent action is offered (defaulting to `defaultReparentTargetId` when present).
- Given I re-parent to the default and the backend returns `remainingExternalBlockers: 0`, when I confirm the follow-up, then the departure `POST` is resent with a **new** idempotency key and succeeds.
- Given `remainingExternalBlockers > 0`, when re-parenting returns, then the departure is not resubmitted and the external-blockers message shows.
- Given a `state: 'retry_wait'` departure, when the status view renders, then `attempts` and `lastError` show and "Retry now" calls `POST .../retry`; the view auto-refetches while `processing`/`retry_wait`.
- Given `?departure=<unknown>`, when `GET` returns `404`, then I see "no longer available" and a way back to the record form.
- Given any write returns `403`, when it rejects, then the form/actions disable and a permission notice shows.
- `npm run build`, `npm run lint`, `npm run format:check`, and `npm run test` pass in `services/frontend`.

## Design Notes

Idempotency key lifecycle: mint `crypto.randomUUID()` into a ref keyed by a hash of `{ effectiveDate, reason }`. Reuse it for a byte-identical resubmit (so a double-click or a retry-after-timeout is idempotent — the backend returns the original result). When the form values change, mint a new key (so a genuine correction is a new request, not `idempotency_key_payload_mismatch`). The post-reparenting "record now" resubmit always uses a fresh key — the blockers are gone, it is a new attempt.

`remainingExternalBlockers` is currently always `0` from the backend action, but the field is contractual — branch on it, don't assume.

There is no "get my scheduled departure" read. If the record `POST` returns `departure_already_scheduled`, the screen can only say so — it cannot show or manage the existing one. Recorded in `deferred-work.md`.

`GET /users/:id/departures/:departureId` and every write share the `employee:departure:record` capability, which is not broadly seeded — so for most actors the screen is `403` on submit. Same attempt-and-handle pattern as the org screen: render the form, collapse to a permission notice on the first write `403`.

## Verification

**Commands:**
- `cd services/frontend && npm run build` -- expected: tsc + Vite build pass.
- `cd services/frontend && npm run lint` -- expected: clean.
- `cd services/frontend && npm run format:check` -- expected: clean.
- `cd services/frontend && npm run test` -- expected: existing specs + new `departure` specs green.

**Manual checks:**
- With `services/backend` running and `employee:departure:record` granted: record a departure for an employee with no reports → the status view shows `scheduled`. Record one for a manager → the blocker panel lists their reports; re-parenting to the default clears them and the follow-up records the departure.

## Suggested Review Order

**Phase machine & idempotency (the design core)**

- Entry point — the three phases (`form` / `blocked` / `status`), `?departure=` as the status-view key, and the per-fill idempotency-key ref: same key for a byte-identical resubmit, fresh key on a value change or the post-reparent "record now".
  [`useEmployeeDeparturePage.ts`](../../../services/frontend/src/pages/EmployeeDeparturePage/hooks/useEmployeeDeparturePage.ts)
- The record `POST` carries the `Idempotency-Key` header; the key `signatureOf` matches exactly the bytes the body sends (`.trim()`ed reason, no `\s+` collapse).
  [`departures.ts:29`](../../../services/frontend/src/api/departures.ts#L29)

**Record path**

- Submit only opens the confirm `AlertDialog` (an irreversible termination) — the `POST` fires on confirm; error mapping: `409` blocked → blocker panel, `already_scheduled` / `idempotency_key_payload_mismatch` / `400` (→ date field) / non-mapped 4xx / network each get distinct copy.
  [`useDepartureForm.ts:82`](../../../services/frontend/src/pages/EmployeeDeparturePage/components/DepartureForm/hooks/useDepartureForm.ts#L82)
- Lenient client-side future-date check — the backend (`BUSINESS_TIME_ZONE`) owns the exact boundary.
  [`departureDate.ts`](../../../services/frontend/src/pages/EmployeeDeparturePage/helpers/departureDate.ts)

**Blocker resolution**

- `blockers[]` render (names / department), default + "choose someone else" re-parent, `remainingExternalBlockers` branch, the `blocker_version_stale` → re-`POST`-to-refresh recovery, and the "record now" resubmit with a fresh key.
  [`useBlockerResolution.ts:69`](../../../services/frontend/src/pages/EmployeeDeparturePage/components/BlockerPanel/hooks/useBlockerResolution.ts#L69)

**Status view**

- Poll only while `processing` / `retry_wait`; `retry_wait` is a normal state (not `destructive`); retry `403`/`404`/`not_retryable` → note pinned to the row state it was raised for; `dueAt` formatted in `effectiveTimeZone`.
  [`useDepartureStatus.ts`](../../../services/frontend/src/pages/EmployeeDeparturePage/components/DepartureStatus/hooks/useDepartureStatus.ts)
  [`useDeparture.ts:25`](../../../services/frontend/src/api/hooks/useDeparture.ts#L25)

**Wiring**

- Route + profile "Departure" link; the person-picker lifted to `src/components/PersonPicker/` (now shared with G4).
  [`router/index.tsx:61`](../../../services/frontend/src/router/index.tsx#L61)

**Tests (supporting)**

- 20 departure specs — record + confirm dialog, every mapped error, the blocked→reparent→record loop (default + picker paths), status states, retry failures, idempotency-key stability.
  [`departure.spec.ts:34`](../../../services/frontend/e2e/flows/departure/departure.spec.ts#L34)
