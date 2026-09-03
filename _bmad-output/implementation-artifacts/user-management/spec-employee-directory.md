---
title: 'Employee directory'
type: 'feature'
created: '2026-09-03'
status: 'done'
review_loop_iteration: 0
baseline_commit: 'e2c00fc45ab2fbff3f63b59c542cd2743bd43771'
context:
  - '{project-root}/services/frontend/CLAUDE.md'
  - '{project-root}/services/frontend/.claude/rules/'
  - '{project-root}/_bmad-output/implementation-artifacts/user-management/spec-frontend-foundation-and-magic-link-login.md'
  - '{project-root}/docs/design/people-platform-prototype/design-notes.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** G1 stood up the app shell and auth, but there is no screen that lists employees. The backend exposes `GET /api/v1/users` (paginated, filterable, HR-Admin-only via the `user-management:list` capability), and nothing in the frontend consumes it.

**Approach:** Add an "All Employees" directory screen (`/employees`) — a paginated, filterable table over `GET /users`, styled to the `Main.dc.html` prototype within the real backend contract. It is the first authenticated data screen, so it also proves the G1 axios session/401 plumbing end-to-end.

## Boundaries & Constraints

**Always:**
- Follow every `services/frontend/.claude/rules/*` convention (pages = folder + UI-only component + `hooks/`; data only via TanStack Query hooks in `src/api/hooks/`, request fns suffixed `ApiCall`; i18n keys added to `translation.json` first; semantic colour tokens only; arrow components; `@/` imports; components < 200 lines).
- The table shows **exactly** the fields `GET /users` returns per row (`UserListItem`): name (+ photo/initials), position, country, city, work email, work phone, birthday (day/month, no year), company join date, employment status. No grade / risk / department / project / mentorship columns — the backend does not send them.
- Filters map 1:1 to the accepted query params and are **exact-match**: `firstName`, `lastName`, `position`, `country`, `city`, `workEmail`, `workPhone`, `birthDay`, `birthMonth`, `companyJoinDate`, and an `employmentStatus` select (`active` | `dismissed`; unset = active only). Pagination: `page` (1-based), `pageSize` (default 25, max 100). Any other query key → the API returns `400`; never send one.
- Server order is fixed (`lastName, firstName` asc) and there is no sort override — column headers are not sortable. State the fixed order in the footer.
- Reflect list state (filters + page) in the URL query string so a view is linkable and survives reload; drive `GET /users` from the parsed URL state.
- A `403` from `GET /users` renders an in-page "You don't have access to the employee directory" state (the capability is HR-Admin-only and there is no `/me` to check first). A `401` is already handled globally by the G1 interceptor — do not re-handle it here.
- New sidebar nav item ("All Employees") is always rendered for an authenticated user; access is enforced by the screen's `403` state, not by hiding the link.
- Add shadcn components via `npx shadcn@latest add` only (`table`, `select`, `badge`, and `skeleton`/`pagination` if used).

**Ask First:**
- Any change to `services/backend` (adding a `department`/substring-search filter, a sort param, an export endpoint, or a `/me` capability probe).
- Adding a client-side data-massaging layer beyond TanStack Query + URL state (e.g. a table library like TanStack Table) — plain table markup is expected at this size.
- Row selection + bulk actions (assign PP, add to campaign) — the prototype shows them but no backend supports them.

**Never:**
- The "Colleague view" toggle, "Export .xlsx", "Columns" chooser, saved "views" tabs, and row-checkbox bulk bar from the prototype — none are backed by `GET /users` (it returns one uniform projection for every viewer). Omit them, or render disabled with a deferred note; do not fake them client-side.
- G3+ screens (profile, org-relationships, departures). A row links to `/employees/:id` but that route is out of scope here — it may 404 until G3.
- No `POST`/create, no delete/deactivate, no inline editing from this screen.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Default load | Navigate to `/employees` as an HR-Admin session | `GET /users?page=1&pageSize=25` → table of rows, footer "N employees · sorted by name", pager | — |
| Filtered load | `/employees?country=Poland&position=Engineer` | `GET /users?...&country=Poland&position=Engineer` → only matching rows; inputs pre-filled from URL | — |
| Change a filter | User types `country=Poland`, submits | URL updates, query refetches, page resets to 1 | Empty result → "No employees match these filters" + clear-filters action |
| Paginate | Click "Next" on page 1 of 3 | URL `?page=2`, refetch, pager reflects page 2 | Page beyond last → backend returns empty page; show the empty state, allow going back |
| `employmentStatus=dismissed` | Select "Dismissed" in the status filter | `GET /users?employmentStatus=dismissed` → dismissed rows, each badged "Dismissed" | — |
| Not entitled | Session without `user-management:list` | `GET /users` → `403` → in-page "no access" panel, no table, no retry loop | — |
| Session expired mid-use | Any refetch returns `401` | G1 interceptor clears session + redirects to `/login` (verify it fires from this screen) | — |
| Backend/network error | `GET /users` returns `500` / network failure | Inline error panel with a "Try again" button (refetch) | — |
| Loading | Request in flight | Table area shows a skeleton/loading state, not a blank flash | — |

</frozen-after-approval>

## Code Map

- `services/backend/src/user-management/application/controllers/users.controller.ts:102` -- `GET /users` handler: `@RequireFeature('user-management:list')` (→ `403` without it), rejects unknown query params with `400` (`LIST_QUERY_PARAMS` allowlist at line 66).
- `services/backend/src/user-management/application/dtos/list-users-query.dto.ts` -- the complete accepted param set (extends `PaginationQueryDto`); filters are plain equality; `employmentStatus` `'active'|'dismissed'`.
- `services/backend/src/user-management/application/dtos/user-list-item.response.ts:9` -- `UserListItem` row shape (the 12 S1 fields + `employmentStatus`); `companyJoinDate` is a `YYYY-MM-DD` string; `photo`/`city`/`workPhone`/`birthDay`/`birthMonth` nullable.
- `services/backend/src/common/dtos/pagination-query.dto.ts` -- `page` default 1, `pageSize` default 25 / max 100.
- `services/backend/.../users.controller.ts` `PaginatedResponseDto` usage -- response envelope `{ items, page, pageSize, total, totalPages }`.
- `services/frontend/src/api/client.ts` -- `apiClient.get<T>(url, { params })`; 401 interceptor already redirects — no local 401 handling.
- `services/frontend/src/api/hooks/` -- existing pattern (`useRequestMagicLink.ts` etc.); add `useEmployees.ts` here.
- `services/frontend/src/components/SideMenu/SideMenu.tsx:15` -- `NavItem` / `NAV_SECTIONS`; add the "All Employees" item (icon `Users` from lucide). `labelKey` is `ParseKeys`.
- `services/frontend/src/router/index.tsx:33` -- `RequireAuth` → `AppLayout` children; add the `/employees` route (and optionally an `/employees/:id` placeholder is NOT added here).
- `services/frontend/src/pages/HomePage/HomePage.tsx` -- reference for the prototype page-header band markup (`home.eyebrow`/mono/tick).
- `services/frontend/src/index.css:26` -- stretch-layer tokens already present (`--font-mono`, `--provenance-*`, `--page-band-tick`); the directory's provenance tag is `ACCESS` (`--provenance-access`) per design-notes.
- `services/frontend/src/types/api.ts` -- add `PaginatedResponse<T>` and `EmployeeListItem`.
- `docs/design/people-platform-prototype/Main.dc.html` -- visual reference (page-header band, filter bar, table, footer). Ignore its mock columns/toggles not in `UserListItem`.
- `services/frontend/e2e/flows/` -- add `employees/` flow (fixtures + helpers + spec); helpers mock `**/users*`.

## Tasks & Acceptance

**Execution:**
- [ ] `services/frontend/package.json` -- `npx shadcn@latest add table select badge skeleton` (add `pagination` only if used).
- [ ] `src/types/api.ts` -- `EmployeeListItem` (mirror backend `UserListItem`), `PaginatedResponse<T>` (`items,page,pageSize,total,totalPages`), `EmployeeListParams`.
- [ ] `src/api/employees.ts` -- `getEmployeesApiCall(params: EmployeeListParams)` → `apiClient.get<PaginatedResponse<EmployeeListItem>>('/users', { params })`; drop `undefined`/empty params before sending so no stray key is added.
- [ ] `src/api/hooks/useEmployees.ts` -- `useQuery({ queryKey: ['employees', params], queryFn: … , placeholderData: keepPreviousData })`; do not retry a `403`.
- [ ] `src/pages/EmployeesPage/EmployeesPage.tsx` -- UI only: page-header band (eyebrow `EMPLOYEES`, `ACCESS` provenance tag), filter bar, table, footer, pager; branches for loading / empty / error / forbidden from the hook.
- [ ] `src/pages/EmployeesPage/hooks/useEmployeesPage.ts` -- read/write URL query state (`useSearchParams`), build `EmployeeListParams`, call `useEmployees`, expose `rows`, `page`, `totalPages`, `total`, `status` (`'loading'|'ready'|'empty'|'forbidden'|'error'`), `filters`, `setFilter`, `clearFilters`, `goToPage`. Changing any filter resets `page` to 1.
- [ ] `src/pages/EmployeesPage/components/EmployeeFilters/EmployeeFilters.tsx` -- the exact-match filter inputs + `employmentStatus` `Select`; submit-on-change or on-enter (pick one, keep it consistent).
- [ ] `src/pages/EmployeesPage/components/EmployeeTable/EmployeeTable.tsx` -- shadcn `Table`; name cell = initials avatar + full name linking to `/employees/:id`; birthday rendered `D MMM` (or `—`); join date localised; `employmentStatus` as a `Badge` (dismissed = muted/`destructive`-ish per tokens); nullable fields render `—` in `text-muted-foreground`.
- [ ] `src/pages/EmployeesPage/components/EmployeePager/EmployeePager.tsx` -- prev/next + "Page X of Y"; disabled at bounds.
- [ ] `src/components/SideMenu/SideMenu.tsx` -- add the "All Employees" nav item (new section or the top group), `sidebar.employees` key.
- [ ] `src/router/index.tsx` -- `/employees` route under `RequireAuth`/`AppLayout`.
- [ ] `src/locales/en/translation.json` -- `employees.*` (title, eyebrow, lead, provenanceTag, filter labels/placeholders, column headers, `statusActive`/`statusDismissed`, `footerCount`, empty/error/forbidden copy, pager).
- [ ] `e2e/flows/employees/{fixtures.ts,helpers.ts,employees.spec.ts}` -- cover the I/O matrix rows: default list renders rows + footer; a filter updates the URL and refetches with the right params and resets page; pagination; `employmentStatus=dismissed`; `403` → forbidden panel; `500` → error panel + retry; empty → empty state; and a `401` on the list request triggers the global redirect to `/login` (this closes the G1 deferred coverage gap).

**Acceptance Criteria:**
- Given an entitled session, when I open `/employees`, then I see a page of employees with name/position/country/city/email/phone/birthday/join-date/status columns and a footer count, and the request carried only `page`/`pageSize`.
- Given I set `country` and `position` filters, when the list refetches, then the URL reflects both, `page` is back to 1, and every visible row matches (per the backend).
- Given more than one page of results, when I click Next/Prev, then the URL `page` changes, the table updates, and the pager disables at the first/last page.
- Given I choose "Dismissed" status, when the list refetches, then dismissed employees are shown, each with a "Dismissed" badge.
- Given a session without `user-management:list`, when `/employees` loads, then I see the "no access" panel, no table, and no repeated retries.
- Given the list request returns `401`, when it rejects, then the app clears the session and navigates to `/login` (G1 interceptor).
- Given `GET /users` fails with `500`, when it rejects, then I see an error panel with a working "Try again".
- `npm run build`, `npm run lint`, `npm run format:check`, and `npm run test` pass in `services/frontend`.

## Design Notes

Backend reality vs. the prototype — the prototype's `Main.dc.html` is a richer mock than `GET /users` supports. Concretely: no `department`/`risk`/`grade`/`project`/`leave`/`mentor`/`type` columns, no free-text name search (filters are exact equality — a `firstName` filter matches `"Bob"`, not `"bo"`), no server sort control, no export, no colleague-view, no bulk selection. Build the honest subset; the removed affordances are recorded in deferred-work for when the platform §4.1 directory / audience-filtered projection lands.

URL state is the source of truth: `useEmployeesPage` parses `useSearchParams` into `EmployeeListParams`, the query key includes those params, and every control writes back to the URL (`setSearchParams`). This makes a filtered view shareable and reload-safe for free, and keeps the hook stateless beyond what the URL holds.

`keepPreviousData` (TanStack v5 `placeholderData: keepPreviousData`) keeps the current page visible while the next page/filter loads, so paging doesn't flash empty.

## Verification

**Commands:**
- `cd services/frontend && npm run build` -- expected: tsc + Vite build pass.
- `cd services/frontend && npm run lint` -- expected: clean.
- `cd services/frontend && npm run format:check` -- expected: clean.
- `cd services/frontend && npm run test` -- expected: existing auth specs + new `employees` specs green.

**Manual checks:**
- With `services/backend` running and a seeded population imported, sign in as the HR-Admin root, open "All Employees": rows load, filters narrow results and update the URL, paging works, the fixed name-sort is noted in the footer. Signing in as a non-admin seeded user and visiting `/employees` shows the "no access" panel.

## Suggested Review Order

**URL-driven list state (the design core)**

- Entry point — how the screen works: `useSearchParams` is the single source of truth; parsed params drive both `GET /users` and the query cache key; every control writes back to the URL.
  [`useEmployeesPage.ts:68`](../../../services/frontend/src/pages/EmployeesPage/hooks/useEmployeesPage.ts#L68)
- Status resolution: `403 → forbidden`, `400 → badRequest` (filter bar stays, no retry), else `error`; then `loading`/`empty`/`ready`. Out-of-range birthday params are dropped, not sent.
  [`useEmployeesPage.ts:115`](../../../services/frontend/src/pages/EmployeesPage/hooks/useEmployeesPage.ts#L115)
- Local filter draft that re-syncs from the URL during render (no effect) — the one subtle bit.
  [`useEmployeeFilters.ts:20`](../../../services/frontend/src/pages/EmployeesPage/components/EmployeeFilters/hooks/useEmployeeFilters.ts#L20)

**Backend contract boundary**

- Param pruning — empty/undefined filters never reach the wire (`GET /users` `400`s on any unknown key).
  [`employees.ts:13`](../../../services/frontend/src/api/employees.ts#L13)
- Retry only a transport failure or `5xx`; `400/401/403` are terminal.
  [`useEmployees.ts:20`](../../../services/frontend/src/api/hooks/useEmployees.ts#L20)
- Date/initials formatters — range-guarded so malformed values render `—` / raw, never a wrong date.
  [`employeeFormatters.ts:17`](../../../services/frontend/src/pages/EmployeesPage/components/EmployeeTable/helpers/employeeFormatters.ts#L17)

**Screen composition**

- Branch tree: `forbidden` replaces the screen; `error`/`badRequest` keep the filter bar; footer/pager hidden while loading.
  [`EmployeesPage.tsx:54`](../../../services/frontend/src/pages/EmployeesPage/EmployeesPage.tsx#L54)
- Nav + route wiring.
  [`SideMenu.tsx:39`](../../../services/frontend/src/components/SideMenu/SideMenu.tsx#L39)
  [`router/index.tsx:46`](../../../services/frontend/src/router/index.tsx#L46)

**Tests (supporting)**

- 11 specs — default load + cell formatting, sidebar nav, filter/URL round-trip, birthday-param drop, pagination bounds, and the 400/403/500/401 panels (the 401 case closes the G1 interceptor coverage gap).
  [`employees.spec.ts:10`](../../../services/frontend/e2e/flows/employees/employees.spec.ts#L10)
