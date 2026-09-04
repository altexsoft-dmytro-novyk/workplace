---
title: 'Organisational relationships'
type: 'feature'
created: '2026-09-03'
status: 'done'
review_loop_iteration: 0
baseline_commit: 'a458bc595743df03c185c2a56f2d3535f05acc5a'
context:
  - '{project-root}/services/frontend/CLAUDE.md'
  - '{project-root}/services/frontend/.claude/rules/'
  - '{project-root}/_bmad-output/implementation-artifacts/user-management/spec-employee-profile.md'
  - '{project-root}/docs/architecture/api-conventions.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The backend has the Epic 4 organisational-relationship surface (manager, People Partner, department membership, department manager, and the access journal) but nothing in the frontend uses it. Most of that surface is not yet buildable in a UI — there is no read endpoint for a person's current manager / PP / departments, no department list, and no way to obtain a `relationshipId`. The one fully-operable slice is People-Partner assignment and the access-journal read.

**Approach:** Add an "Organisation" screen at `/employees/:id/organisation` (linked from the profile) covering exactly what the API supports today: assign a manager (first assignment), assign / replace / remove the People Partner, and view the access journal. Everything else is recorded as deferred with the specific backend gap.

## Boundaries & Constraints

**Always:**
- Follow every `services/frontend/.claude/rules/*` convention (page folder + UI-only component + `hooks/`; data only via TanStack Query hooks in `src/api/hooks/`, request fns suffixed `ApiCall`; i18n keys first; semantic colour tokens only; arrow components; `@/` imports; components < 200 lines; forms via `react-hook-form` + `zod`).
- Target people are chosen with a picker backed by `GET /users` (the directory search from G2) — the actor who holds `org:relationships:write` is also HR-Admin, who can list. The picker shows name + position + work email and yields the user's `id`.
- Manager assignment: `POST /users/:id/relationships { type: 'direct', targetId }`. Handle `400` (self-assignment — also block it client-side), `409 { error: 'target_has_scheduled_departure' }`, and a plain `409` (a manager already exists — DEC-UM-005 requires a delete-then-post the API can't yet support) → show "this employee already has a manager; reassignment isn't available yet".
- People Partner: `PUT /users/:id/relationships/people-partner { targetId }` for assign-or-replace (omit `expectedCurrentTargetId` — unconditional); `DELETE /users/:id/relationships/people-partner` for removal (unconditional). Handle `400` (self), `404` (unknown target / no current PP on delete), `422` (inactive target), `409` (`target_has_scheduled_departure`).
- Access journal: `GET /users/:id/access-journal` → `{ data: AccessJournalRow[] }` newest-first. Rows: `occurredAt`, `kind`, `actorUserId`, `before`, `after`. A `403` means the viewer is not the subject's current manager or assigned PP → render an explanatory panel, not an error. Use the newest `kind: 'manager'` / `'people_partner'` row's `after` as a best-effort "current" hint when the journal is readable — clearly labelled as derived from the change history.
- `org:relationships:write` is not broadly seeded, so the write actions return `403` for most actors. On a `403` from any write, disable the write forms and show a "you don't have permission to change organisational relationships" notice — the same attempt-and-handle pattern used for the profile edit.
- After a successful manager/PP mutation, invalidate the access-journal query and any affected `['employee', targetId]` cache.
- `401` anywhere → the G1 interceptor handles it.
- Add shadcn components via `npx shadcn@latest add` only (`command` / `popover` for the picker if used; otherwise reuse `dialog` + a filtered list).

**Ask First:**
- Any change to `services/backend` (a `GET /departments`, a `GET /users/:id/relationships`, a derived-fields read on `GET /users/:id`, or surfacing `relationshipId`).
- Building the department-membership or department-manager UI (both need a department list that does not exist).
- Wiring `expectedCurrentTargetId` optimistic concurrency (needs a current-PP read).

**Never:**
- Department membership add/move/remove, department-manager assign/remove — deferred (no department list endpoint).
- Manager reassignment or removal — deferred (`DELETE /users/:id/relationships/:relationshipId` needs a `relationshipId` no read returns).
- Inventing a "current org state" from anything other than the access journal's own rows.
- Self-assignment for any relationship (block client-side and rely on the backend `400`).
- G5 (departures).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Open the screen | `/employees/:id/organisation` | Three sections: Manager, People Partner, Access journal; a back link to the profile | — |
| Journal readable | `GET .../access-journal` → `200` | Newest-first table (time, kind, actor, before→after); "current manager/PP" hint derived from the latest matching row | Empty → "No organisational changes recorded" |
| Journal not readable | `GET .../access-journal` → `403` | Panel: "The access history is visible only to this person's current manager or People Partner" | No retry loop |
| Assign a manager | Pick a person, confirm → `POST .../relationships` `201` | Success toast/among-section confirmation; journal refetches; the manager section reflects the new value | — |
| Manager self-assign | Picked person is the subject | Blocked client-side with a message; if it still 400s, show the backend message | No request when blocked client-side |
| Manager already set | `POST` → plain `409` | "This employee already has a manager; reassignment isn't available yet" | — |
| Manager target departing | `POST` → `409 target_has_scheduled_departure` | "That person has a scheduled departure and can't take on reports" | — |
| Assign / replace PP | Pick a person → `PUT .../people-partner` `200` | Confirmation; journal refetches; PP section updates | `404` unknown target / `422` inactive → field message |
| Remove PP | Confirm → `DELETE .../people-partner` `200` | PP section shows "none"; journal refetches | `404` (no current PP) → "there is no People Partner to remove" |
| No write permission | Any write → `403` | Forms disabled + a permission notice; reads still work | — |
| Server/network error | Any read → `500` / network | Section-level error panel with "Try again" | — |

</frozen-after-approval>

## Code Map

- `services/backend/src/user-management/application/controllers/relationships.controller.ts:61` -- `POST /users/:id/relationships` (`@RequireFeature('org:relationships:write')` → `403`); `:80` `PUT .../people-partner`; `:93` `DELETE .../people-partner` (optional `?expectedCurrentTargetId=`); `:151` `GET /users/:id/access-journal` (no `@RequireFeature` — reader gate in the action).
- `services/backend/src/user-management/application/actions/assign-manager.action.ts` -- `400` self-assignment (also `subjectId === targetId`), `409 { error: 'target_has_scheduled_departure' }`, repo `409` when a `direct` edge already exists (DEC-UM-005).
- `services/backend/src/user-management/application/actions/change-people-partner.action.ts` -- `400` self, `404` unknown target, `422` inactive target, `409 target_has_scheduled_departure`, `409` stale token.
- `services/backend/src/user-management/application/actions/get-access-journal.action.ts` -- `403` for anyone who is not the subject's current reporting-line manager or assigned PP (self and HR-Admin-by-role included), and for a nonexistent subject (no `404`).
- `services/backend/src/user-management/application/dtos/relationship.response.ts` -- `{ id, userId, type, reportsToUserId }` (bare edge; `POST`/`PUT` bodies).
- `services/backend/src/user-management/application/dtos/access-journal.response.ts` -- `AccessJournalRowResponse { id, occurredAt, actorUserId, subjectUserId, subjectDepartmentId?, kind, before, after }`; `kind` ∈ `manager | people_partner | department_membership | department_manager | full_profile_grant | full_profile_revoke | shared_link_access`; envelope `{ data }`, newest-first.
- `services/backend/src/user-management/application/dtos/create-relationship.dto.ts` / `update-people-partner.dto.ts` -- request bodies (`targetId` a UUID; `type: 'direct'` only).
- `services/frontend/src/api/employees.ts` + `hooks/useEmployees.ts` -- the directory list/search to reuse for the people-picker (`GET /users`, exact-match filters, HR-Admin-gated — a `403` there means the actor also can't operate this screen).
- `services/frontend/src/api/profile.ts` + `src/lib/employeeFormatters.ts` -- request-fn and `formatIsoDate` / `fullName` / `getInitials` patterns to reuse.
- `services/frontend/src/pages/EmployeeProfilePage/EmployeeProfilePage.tsx` -- add the "Organisation" link near the profile back-link.
- `services/frontend/src/components/StatePanel/StatePanel.tsx` -- the shared not-available / error panel.
- `services/frontend/src/router/index.tsx` -- add `/employees/:id/organisation` under `RequireAuth`/`AppLayout`.
- `services/frontend/src/types/api.ts` -- add `AccessJournalRow`, `AccessJournalResponse`, `RelationshipEdge`, `AssignManagerPayload`, `ChangePeoplePartnerPayload`.

## Tasks & Acceptance

**Execution:**
- [ ] `services/frontend/package.json` -- `npx shadcn@latest add command popover` (only if the picker uses them; otherwise none).
- [ ] `src/types/api.ts` -- the org types above.
- [ ] `src/api/organisation.ts` -- `getAccessJournalApiCall(id)`, `assignManagerApiCall(id, targetId)`, `changePeoplePartnerApiCall(id, targetId)`, `removePeoplePartnerApiCall(id)`.
- [ ] `src/api/hooks/useAccessJournal.ts` -- `useQuery(['employee', id, 'access-journal'])`; do not retry `403`.
- [ ] `src/api/hooks/useAssignManager.ts`, `useChangePeoplePartner.ts`, `useRemovePeoplePartner.ts` -- mutations; on success invalidate `['employee', id, 'access-journal']` and `['employee', id]`.
- [ ] `src/pages/EmployeeOrganisationPage/EmployeeOrganisationPage.tsx` + `hooks/useEmployeeOrganisationPage.ts` -- reads `:id`, composes the three sections, derives `canWrite` (starts `true`, flips `false` on a write `403`), back link to `/employees/:id`.
- [ ] `src/pages/EmployeeOrganisationPage/components/PersonPicker/PersonPicker.tsx` (+ `hooks/usePersonPicker.ts`) -- a dialog with a name filter → `GET /users` → pick a row (returns `{ id, name }`); a `403` from `GET /users` disables the picker with "directory access required".
- [ ] `src/pages/EmployeeOrganisationPage/components/ManagerSection/ManagerSection.tsx` -- shows the journal-derived current manager (or "unknown — no history readable"), an "Assign manager" action opening the picker → `useAssignManager`; maps `400`/`409`/`409 target_has_scheduled_departure` to specific copy.
- [ ] `src/pages/EmployeeOrganisationPage/components/PeoplePartnerSection/PeoplePartnerSection.tsx` -- journal-derived current PP; "Assign / replace" (picker → `useChangePeoplePartner`) and "Remove" (confirm → `useRemovePeoplePartner`); maps `400`/`404`/`422`/`409`.
- [ ] `src/pages/EmployeeOrganisationPage/components/AccessJournal/AccessJournal.tsx` -- newest-first table (`occurredAt` via `formatIsoDate`/time, `kind` label, actor id, `before`→`after` compact render); `403` → explanatory `StatePanel`; empty state; `5xx` → error + retry.
- [ ] `src/pages/EmployeeProfilePage/EmployeeProfilePage.tsx` -- add the "Organisation" link.
- [ ] `src/router/index.tsx` -- the route.
- [ ] `src/locales/en/translation.json` -- `organisation.*` (section titles, picker, all the mapped error strings, journal column headers + `kind` labels, the permission notice, empty/unavailable copy).
- [ ] `e2e/flows/organisation/{fixtures.ts,helpers.ts,organisation.spec.ts}` -- cover the I/O matrix: journal renders newest-first + derives the current-manager hint; journal `403` → explanatory panel (requested once, no retry); assign manager happy path → `POST` body `{ type:'direct', targetId }` → journal refetch; manager self-pick blocked client-side (no request); plain `409` → "already has a manager" copy; `409 target_has_scheduled_departure` → its copy; PP assign/replace → `PUT` body → refetch; PP remove → `DELETE` → "none"; PP `404`/`422` copy; a write `403` → forms disabled + permission notice; journal `500` → retry.

**Acceptance Criteria:**
- Given `GET /users/:id/access-journal` returns rows, when the screen loads, then they render newest-first and the Manager/PP sections show a "from history" current value derived from the latest matching `kind` row.
- Given the journal returns `403`, when the section renders, then it explains that only the person's manager or People Partner can view the history, with no retry loop.
- Given I pick a manager and confirm, when `POST /users/:id/relationships` succeeds, then the request body is exactly `{ type: 'direct', targetId }` and the journal refetches.
- Given I pick myself as the manager, when I confirm, then the action is blocked client-side with a message and no request is sent.
- Given the employee already has a manager, when `POST` returns a plain `409`, then I see "reassignment isn't available yet", not a generic error.
- Given I assign then remove a People Partner, when each call succeeds, then the PP section updates and the journal refetches each time.
- Given any write returns `403`, when it rejects, then the write forms disable and a permission notice shows while the journal still renders.
- `npm run build`, `npm run lint`, `npm run format:check`, and `npm run test` pass in `services/frontend`.

## Design Notes

This screen is deliberately narrow. The backend Epic 4 surface assumes a companion read API (current manager/PP/departments, a department list, `relationshipId`s) that does not exist yet, so department membership, department-manager, and manager reassignment/removal are **out of scope and recorded in `deferred-work.md`** with their specific gap. Do not approximate them.

"Current" manager / People Partner is shown only as *derived from the access journal* — the newest `kind: 'manager'` / `people_partner` row's `after` value — and only when the journal is readable (the subject's manager or PP). Label it as history-derived; never present it as an authoritative read. When the journal is not readable, the sections show "current value not available" and still offer the write actions (which the backend will accept or `403`).

`org:relationships:write` follows the same attempt-and-handle pattern as the profile `canEdit` gate: render the actions, and on the first write `403` collapse them to a permission notice for the rest of the session on this screen.

## Verification

**Commands:**
- `cd services/frontend && npm run build` -- expected: tsc + Vite build pass.
- `cd services/frontend && npm run lint` -- expected: clean.
- `cd services/frontend && npm run format:check` -- expected: clean.
- `cd services/frontend && npm run test` -- expected: existing specs + new `organisation` specs green.

**Manual checks:**
- With `services/backend` running and the `org:relationships:write` capability granted to your session, open an employee's Organisation screen: the access journal lists prior changes; assigning a People Partner via the picker adds a `people_partner` row to the journal on refetch. Without the capability, the forms are disabled and the notice shows.

## Suggested Review Order

**Scope & the backend gap (read first)**

- Why the screen is narrow: no current-state read, no department list, no `relationshipId` — the operable slice is journal-read + manager-first-assign + PP assign/replace/remove. Everything else is in `deferred-work.md`.
  [`spec-organisational-relationships.md` Intent / Never](spec-organisational-relationships.md)

**Screen state**

- Entry point: `useEmployee(routeId)` for the identity header, `useAccessJournal` for everything else; `journalStatus` ∈ loading/ready/forbidden/notFound/error; `canWrite` starts `true`, flips `false` on the first write `403`.
  [`useEmployeeOrganisationPage.ts:41`](../../../services/frontend/src/pages/EmployeeOrganisationPage/hooks/useEmployeeOrganisationPage.ts#L41)
- "Current" manager / PP is derived only from the newest matching journal row's `after`, with explicit `loading` / `unknown` / `none` / `assigned` states — never an authoritative read.
  [`journalDerived.ts:25`](../../../services/frontend/src/pages/EmployeeOrganisationPage/helpers/journalDerived.ts#L25)

**Write paths & backend contract**

- Exact request bodies: manager `{ type: 'direct', targetId }`, PP `{ targetId }` (no concurrency token — deferred).
  [`organisation.ts:28`](../../../services/frontend/src/api/organisation.ts#L28)
- Status mapping: `400` → generic (self is client-side only), plain `409` → "already has a manager", `409 target_has_scheduled_departure` / `404` / `422` → specific copy; first write `403` → session-scoped permission notice.
  [`useManagerSection.ts`](../../../services/frontend/src/pages/EmployeeOrganisationPage/components/ManagerSection/hooks/useManagerSection.ts)
- The people-picker: `GET /users` page 1 + exact-match filters (no substring search — deferred), excludes the subject and the already-assigned person, double-pick guarded.
  [`usePersonPicker.ts`](../../../services/frontend/src/pages/EmployeeOrganisationPage/components/PersonPicker/hooks/usePersonPicker.ts)

**Shared**

- New `src/lib/http.ts` (`httpStatus`, `errorCode`) — consolidates the error-status helper inlined across G2–G4.
  [`http.ts:10`](../../../services/frontend/src/lib/http.ts#L10)

**Tests (supporting)**

- 32 organisation specs — journal read/403/404/500/empty/malformed, manager + PP happy paths and every mapped error status, picker exclusion + narrow-search, permission lockout, and "a failed write doesn't refetch".
  [`organisation.spec.ts:39`](../../../services/frontend/e2e/flows/organisation/organisation.spec.ts#L39)
