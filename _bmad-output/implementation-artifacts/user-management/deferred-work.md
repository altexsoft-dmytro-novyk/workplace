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

- source_spec: `spec-employee-directory.md`
  summary: Employee-directory affordances the prototype shows but `GET /users` cannot back — free-text (substring) search, a `department` filter, a server-side sort control, `.xlsx` export, per-viewer audience-filtered rows ("colleague view"), and row-select bulk actions.
  evidence: `list-users-query.dto.ts` accepts only exact-equality filters on the S1 fields + `employmentStatus`; the repository sorts by a fixed `lastName,firstName`; `toUserListItem` is one uniform projection for every viewer; there is no export route. The richer directory is platform §4.1 scope (`epics.md` FR-15) / the deferred §3.3.1 list projection (access-control deferred-work). Build these on the frontend once the list endpoint gains them.

- source_spec: `spec-employee-directory.md`
  summary: No combined "active + dismissed" employee view — `employmentStatus` is unset (active only) or `dismissed` (dismissed only).
  evidence: `list-users-query.dto.ts` types it `'active' | 'dismissed'` and the repo builds mutually-exclusive `where` clauses. Needs a backend change (an `all` value, or dropping the implicit active-only default) before the directory's status filter can offer it.

- source_spec: none
  status: split 2026-09-03 from the User Management frontend UI build run (Dmytro Novyk); deferred by the user pending backend.
  summary: Access preview screen (`Profile.dc.html`) — HR-Admin tool that resolves how the profile API assembles its response per audience (6-audience × 16-section matrix).
  evidence: Needs a server-side audience-resolution preview endpoint that does not exist — the access-control facade is a library with no HTTP surface, and there is deliberately "no audience switch anywhere else in the product". Depends on the AC `{ data, canEdit }` roll-out + `GET /me` item and the `full` audience resolver, both tracked in the access-control deferred-work. Build once a preview contract is defined.
