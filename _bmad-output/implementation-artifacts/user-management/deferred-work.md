# Deferred Work — user-management

Goals split out of build runs. Each entry is an independently shippable
deliverable; none is authorized by the current spec.

- source_spec: none
  status: split 2026-09-03 from the User Management **frontend UI** build run (Dmytro Novyk); deferred by the user pending backend.
  summary: Roles & permissions admin screen (`Roles.dc.html`) — functional-role list, per-permission grant toggles, custom-role creation, assignee management.
  evidence: There is no backend for it: `/roles` catalog endpoints (`GET/POST /roles`, `PATCH /roles/:roleId/permissions`, `DELETE /roles/:roleId`) are named in `api-conventions.md` but "full request/response shapes aren't specified yet — pending its own AD-1 scenario doc", and no controller exists in `services/backend`. The backend side is already tracked as "Functional-role catalog" in `_bmad-output/implementation-artifacts/access-control/deferred-work.md`. Build the screen once that lands.

- source_spec: `spec-frontend-foundation-and-magic-link-login.md`
  summary: 401 response-interceptor redirect + `isAuthEndpoint` exclusion have no e2e coverage — the spec's I/O-matrix row "Authenticated request returns 401 → clear session + redirect to /login" is unverified.
  evidence: G1 exposes no authenticated endpoint to trigger a 401, so the `src/api/client.ts` response interceptor path is untested end-to-end. Cover it when G2 adds the first real authed call (`GET /users`): seed a session, stub a 401, assert `sessionStorage` cleared + redirect to `/login` exactly once, and that a `/auth/magic-link*` 401 is NOT redirected.

- source_spec: `spec-frontend-foundation-and-magic-link-login.md`
  summary: `useAuth().userId` / `decodeJwtSub` output is unverified — no G1 component reads it.
  evidence: `e2e/flows/auth/fixtures.ts` defines `TEST_USER_ID` as "what `useAuth().userId` should resolve to" but nothing asserts it. Add the assertion when G2/G3 first consume `userId` (e.g. "view my own profile").

- source_spec: `spec-frontend-foundation-and-magic-link-login.md`
  summary: Deep-link "return to" after login — `RequireAuth` drops the attempted URL, so post-login the user always lands on `/`.
  evidence: `RequireAuth` redirects to `/login` with no `state={{ from: location }}`, and neither the login nor the consume-success path reads it. Harmless in G1 (one protected route, `/`); wire the `from` round-trip when G2 adds the first deep-linkable protected route.

- source_spec: `spec-frontend-foundation-and-magic-link-login.md`
  summary: No proactive session-expiry handling — a JWT that expires while the app is open keeps the shell rendering until the next request 401s.
  evidence: `AuthContext` evaluates `isJwtExpired` only at mount (`rehydrate`); `RequireAuth` then trusts `state.token !== null`. The 401 interceptor is the only safety net. A timer that calls `logout()` when `exp` passes (or on tab `visibilitychange`) would close the gap.

- source_spec: `spec-frontend-foundation-and-magic-link-login.md`
  summary: No per-route `document.title` for the standalone `/login` and `/auth/magic-link/consume` full-screen pages.
  evidence: The tab keeps whatever title the previous route set. A small `useDocumentTitle` hook applied on the auth pages (and later shell pages) fixes it.

- source_spec: `spec-organisational-relationships.md`
  summary: Department membership (add / move / remove) and department-manager (assign / remove) UI — deferred: no `GET /departments` list endpoint exists, so a department can't be chosen.
  evidence: The only `/departments` routes are `PUT|DELETE /departments/:deptId/manager` (`departments.controller.ts`); `POST|DELETE /users/:id/departments` needs a `departmentId`. Departments are import-created and never listed over HTTP. Needs a backend `GET /departments` (and ideally `GET /users/:id/departments`) before the UI can be built.
  unblocked_by: backend UM Epic 6 Story 6.2 (`GET /departments` + `GET /users/:id/departments`), drafted 2026-09-04.

- source_spec: `spec-organisational-relationships.md`
  summary: Manager reassignment and removal UI — deferred: `DELETE /users/:id/relationships/:relationshipId` needs a `relationshipId` that no read endpoint returns.
  evidence: `relationshipId` is only in the `POST /users/:id/relationships` response body; there is no `GET /users/:id/relationships`. DEC-UM-005 makes reassignment an explicit DELETE-then-POST, so without the id the UI can only do a first assignment. Needs a backend relationship read.
  unblocked_by: backend UM Epic 6 Story 6.1 (`GET /users/:id/relationships` — current manager + PP edges with ids), drafted 2026-09-04.

- source_spec: `spec-organisational-relationships.md`
  summary: Authoritative "current organisation" display (manager, People Partner, departments, department manager) on the profile / org screen — deferred: `GET /users/:id` omits all derived fields and there is no other read.
  evidence: `user-card.response.ts` ships only the 12 S1 scalar fields ("derived S1 display fields ... are out of scope for this route until those contexts land"). The org screen currently infers "current" values from the newest `access-journal` row per `kind`, and only when the journal is readable (the subject's manager/PP). Needs the derived-fields read (tracked on the access-control side as the `{ data, canEdit }` roll-out) or a dedicated relationships read.
  unblocked_by: partially by backend UM Epic 6 Stories 6.1 (relationships) + 6.2 (departments) — dedicated reads the org screen can compose; the full audience-filtered rollup ONTO `GET /users/:id` stays the Access-Control `{ data, canEdit }` roll-out item. Drafted 2026-09-04.

- source_spec: `spec-departure-workflow.md`
  summary: No "view / manage the current scheduled departure" — if `POST /users/:id/departures` returns `departure_already_scheduled`, the UI can only say so.
  evidence: There is no "list departures for a user" read; `GET /users/:id/departures/:departureId` needs an id only the record `POST` returns, and there is no cancel/reschedule route (a product decision, `api-conventions.md`). Needs a backend departure-list (and, for management, a lifecycle route) first.
  unblocked_by: the list read is backend UM Epic 6 Story 6.3 (`GET /users/:id/departures`), drafted 2026-09-04. A cancel/reschedule lifecycle route stays a separate product decision.

- source_spec: `spec-departure-workflow.md`
  summary: Blocker-panel and status-view user ids (re-parent default target, `lastError` references) render without name resolution beyond what the blocker body itself carries.
  evidence: `buildBlockedResponse` includes `targets[].name` for reports/PP but `defaultReparentTargetId` is a bare id; there is no batch user lookup. Same gap as the access-journal id→name item.
  unblocked_by: backend UM Epic 6 Story 6.4 (batch user identity lookup), drafted 2026-09-04.

- source_spec: `spec-organisational-relationships.md`
  summary: The person-picker can only see the first page of the directory and cannot substring-search — a target past row ~100 (or not matched by an exact filter) is unreachable.
  evidence: `GET /users` returns one page (max `pageSize` 100) with exact-equality filters only and no `q`/search param (`list-users-query.dto.ts`). The picker fetches page 1 and filters client-side. Needs a backend substring/typeahead search (or the platform §4.1 directory) before the picker can reach an arbitrary person.
  unblocked_by: NOT UM Epic 6 (explicitly out of scope) — substring/typeahead search is platform §4.1 directory work (FR-15). Still awaiting that.

- source_spec: `spec-organisational-relationships.md`
  summary: Access journal is rendered unpaginated and unfiltered — an audit view with no kind/date filter and unbounded rows for a long-tenured employee.
  evidence: `AccessJournalEnvelope` is `{ data }` with no pagination (`access-journal.response.ts`). Needs a backend pagination/filter contract before the frontend can page or filter it.
  unblocked_by: NOT UM Epic 6 (explicitly out of scope) — pagination + kind/date filtering on `/access-journal` and `/events` needs a projection contract of its own; Epic 6 §"Ownership / boundary" defers it.

- source_spec: `spec-organisational-relationships.md`
  summary: Journal actor / before / after values render as raw user UUIDs — no id→name resolution.
  evidence: The journal rows carry only ids, and there is no batch user-lookup endpoint; resolving each would be N× `GET /users/:id`. The subject's own name is shown (from the cached `GET /users/:id` S1 card); everything else stays a mono-styled UUID until a lookup endpoint exists.
  unblocked_by: backend UM Epic 6 Story 6.4 (batch user identity lookup), drafted 2026-09-04.

- source_spec: `spec-organisational-relationships.md`
  summary: Optimistic-concurrency tokens (`expectedCurrentTargetId` / `expectedCurrentManagerId`) are not wired — the UI does unconditional replace/remove.
  evidence: Using the token safely needs a current-PP / current-manager read to seed it; without that read the UI omits it (the backend treats an omitted token as an unconditional operation). Wire it once a current-state read exists.
  unblocked_by: backend UM Epic 6 Story 6.1 (relationships read supplies the current manager/PP id to seed the token), drafted 2026-09-04.

- source_spec: `spec-employee-directory.md`
  summary: Employee-directory affordances the prototype shows but `GET /users` cannot back — free-text (substring) search, a `department` filter, a server-side sort control, `.xlsx` export, per-viewer audience-filtered rows ("colleague view"), and row-select bulk actions.
  evidence: `list-users-query.dto.ts` accepts only exact-equality filters on the S1 fields + `employmentStatus`; the repository sorts by a fixed `lastName,firstName`; `toUserListItem` is one uniform projection for every viewer; there is no export route. The richer directory is platform §4.1 scope (`epics.md` FR-15) / the deferred §3.3.1 list projection (access-control deferred-work). Build these on the frontend once the list endpoint gains them.

- source_spec: `spec-employee-profile.md`
  summary: Career timeline has no pagination or virtualization — the profile renders every event row for a long-tenured employee.
  evidence: `GET /users/:id/events` returns the full set in one body (`user-event.response.ts`: "NOT a pagination envelope", a deliberate Stage-2 decision). Add a "show more" / windowed list once the endpoint gains pagination.

- source_spec: `spec-employee-profile.md`
  summary: No "remove photo" affordance and no pre-upload preview/confirm — picking a file uploads immediately, and a set photo can't be cleared.
  evidence: `PUT /users/:id/photo` has no delete counterpart in the router tree; `User.photo` can be replaced but not nulled via the API. Needs a backend `DELETE /users/:id/photo` before the UI can offer removal.
  unblocked_by: backend UM Epic 6 Story 6.5 (`DELETE /users/:id/photo`), drafted 2026-09-04. The pre-upload preview/confirm is a frontend-only follow-up that can ship independently.

- source_spec: `spec-employee-directory.md`
  summary: No combined "active + dismissed" employee view — `employmentStatus` is unset (active only) or `dismissed` (dismissed only).
  evidence: `list-users-query.dto.ts` types it `'active' | 'dismissed'` and the repo builds mutually-exclusive `where` clauses. Needs a backend change (an `all` value, or dropping the implicit active-only default) before the directory's status filter can offer it.
  unblocked_by: backend UM Epic 6 Story 6.6 (`GET /users?employmentStatus=all`), drafted 2026-09-04.

- source_spec: none
  status: split 2026-09-03 from the User Management frontend UI build run (Dmytro Novyk); deferred by the user pending backend.
  summary: Access preview screen (`Profile.dc.html`) — HR-Admin tool that resolves how the profile API assembles its response per audience (6-audience × 16-section matrix).
  evidence: Needs a server-side audience-resolution preview endpoint that does not exist — the access-control facade is a library with no HTTP surface, and there is deliberately "no audience switch anywhere else in the product". Depends on the AC `{ data, canEdit }` roll-out + `GET /me` item and the `full` audience resolver, both tracked in the access-control deferred-work. Build once a preview contract is defined.
