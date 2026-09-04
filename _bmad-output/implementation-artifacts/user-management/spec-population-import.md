---
title: 'Population import'
type: 'feature'
created: '2026-09-03'
status: 'done'
review_loop_iteration: 0
baseline_commit: 'f6953f36e48cbf78238bd5219e612cea823ae722'
context:
  - '{project-root}/services/frontend/CLAUDE.md'
  - '{project-root}/services/frontend/.claude/rules/'
  - '{project-root}/_bmad-output/implementation-artifacts/user-management/spec-employee-directory.md'
  - '{project-root}/docs/architecture/api-conventions.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** On a fresh database the app is a dead end — `GET /users` returns nothing, so the directory is empty and every drill-down screen (profile, organisation, departure) is unreachable. The backend has `POST /users/import` (the seeded-population CSV import, AD-16) but the frontend never exposes it.

**Approach:** Add a population-import screen at `/employees/import`, reachable from the directory (a toolbar button and the empty state), that uploads the semicolon-delimited timetracker CSV and shows the import summary.

## Boundaries & Constraints

**Always:**
- Follow every `services/frontend/.claude/rules/*` convention (page folder + UI-only component + `hooks/`; data only via TanStack Query hooks in `src/api/hooks/`, request fns suffixed `ApiCall`; i18n keys first; semantic colour tokens only; arrow components; `@/` imports; components < 200 lines). Reuse `src/lib/http.ts`, `StatePanel`.
- The request is `POST /users/import`, `multipart/form-data`, **one file part named `file`**. Build a `FormData`, append the `File` as `file`, and override the axios instance default `Content-Type` to `multipart/form-data` so the browser adapter sets the real boundary (same technique as `uploadEmployeePhotoApiCall`).
- Response handling:
  - **`200`** → `ImportSummary { created, updated, departmentsCreated, skipped, errors: Array<{ line: number; email: string | null; reason: string }> }`. Render the four counts and, when `errors.length > 0`, a table of the per-row errors. This is a partial-success outcome — a `200` with `skipped > 0` is normal, not an error.
  - **`400`** → a file-level failure (no file part, empty file, header row missing or not matching the expected columns, unparseable). Show the backend `message` from the body verbatim as the error, re-enable the picker. **Nothing was imported.**
  - **`403`** → the caller lacks `user-management:create` (HR-Admin only). Show a permission notice; disable the upload control (attempt-and-handle, same pattern as the profile/organisation screens).
  - **`401`** → handled by the G1 interceptor.
  - transport/`5xx` → a generic "couldn't reach the server" error, picker re-enabled.
- After a `200` (any `created`/`updated` > 0), invalidate the `['employees']` query so the directory reflects the new population, and offer a "View the directory" link to `/employees`.
- Client-side: require that a file is chosen before enabling submit. Do **not** hard-block on file extension / MIME (browsers report `.csv` inconsistently) — the backend validates the header strictly. A soft hint when the name doesn't end `.csv` is fine.
- Directory entry points: a "Import population" button in the `EmployeesPage` toolbar (visible whenever the directory renders — i.e. for entitled viewers), and an action on the directory's **empty** state. The empty state must distinguish "no employees at all" (no active filters → lead with the import CTA) from "no match for these filters" (keep the clear-filters action).
- Route `/employees/import` under `RequireAuth` / `AppLayout`.
- Add shadcn components via `npx shadcn@latest add` only (`table` already present).

**Ask First:**
- Any change to `services/backend`.
- A drag-and-drop upload zone, client-side CSV parsing/preview, or column mapping — the backend takes the delivered export verbatim.
- Progress streaming / chunked upload — the import summary is returned synchronously.

**Never:**
- A per-employee "create user" form — there is no `POST /users` create route (AD-14/AD-16); import is the only population path.
- Parsing or transforming the CSV client-side, or validating its header client-side (the backend owns that — `400` with a specific message).
- Retrying a `400` or `403` automatically.
- A sidebar nav item for import — it stays a directory-contextual admin action.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Open the screen | `/employees/import` | A file picker + a short explanation of the expected file, a back link to `/employees` | — |
| Pick a file, submit | A `.csv` chosen | `POST /users/import` (multipart, part `file`); button shows a pending state | — |
| Successful import | `200` `{ created: 512, updated: 0, departmentsCreated: 8, skipped: 0, errors: [] }` | Summary panel: the four counts; "View the directory" link; the `['employees']` cache is invalidated | — |
| Partial success | `200` with `skipped: 3, errors: [{line, email, reason}]` | Same summary + an errors table (line / email / reason); still a success, not an error panel | — |
| Bad file | `400 { message: "the file header does not match…" }` | The message shown inline; picker re-enabled; no summary | Nothing imported — say so |
| No permission | `403` | Permission notice; upload disabled | — |
| Server/network error | `500` / transport failure | Generic error; picker re-enabled | — |
| Directory is empty, no filters | `/employees` → `200` `{ items: [] }` with no active filters | Empty state leads with "No employees yet" + an "Import population" action → `/employees/import` | — |
| Directory toolbar | Directory renders (any state with the toolbar) | An "Import population" button → `/employees/import` | — |

</frozen-after-approval>

## Code Map

- `services/backend/src/user-management/application/controllers/users.controller.ts:134` -- `@Post('import')` `@HttpCode(HttpStatus.OK)` `@RequireFeature('user-management:create')` `@UseInterceptors(FileInterceptor('file'))`; missing file → `400 "a multipart \"file\" part … is required"`.
- `services/backend/src/user-management/application/actions/import-population.action.ts` -- `POPULATION_CSV_COLUMNS` (the exact expected header, semicolon-delimited); file-level `400` messages ("the uploaded file is empty", "the uploaded file has no rows", "the file header does not match the expected timetracker export columns").
- `services/backend/src/user-management/domain/services/population-import.service.ts:13` -- `ImportError { line: number; email: string | null; reason: string }`; `:18` `ImportSummary { created, updated, departmentsCreated, skipped, errors }`. Row-level problems (`email is required`, `first name is required`, `email already exists`, ambiguous match) are per-row skips in the `200` summary.
- `docs/architecture/api-conventions.md` -- "Seeded-population import (AD-16)" section: upload-only, synchronous summary, `user-management:create` gate, `400` file-level / `200` row-level contract.
- `docs/Accounts_template.csv` -- the delivered sample file (semicolon-delimited; header is the `POPULATION_CSV_COLUMNS` set).
- `services/frontend/src/api/profile.ts` (`uploadEmployeePhotoApiCall`) -- the `FormData` + `Content-Type: multipart/form-data` override pattern to copy.
- `services/frontend/src/api/hooks/useEmployees.ts` -- `queryKey: ['employees', params]`; invalidate the `['employees']` prefix after an import.
- `services/frontend/src/pages/EmployeesPage/EmployeesPage.tsx` -- `emptyStateActions` (line ~31), `showFooter`; add the toolbar button + the "no employees yet" empty-state branch. `EmployeeFilters` renders the toolbar row.
- `services/frontend/src/pages/EmployeesPage/hooks/useEmployeesPage.ts` -- `hasActiveFilters`, `status` (`empty` when `rows.length === 0`).
- `services/frontend/src/components/StatePanel/StatePanel.tsx` -- shared panel (`link` + `actions` props).
- `services/frontend/src/router/index.tsx` -- add `employees/import` before `employees/:id` (literal beats param) under the authed shell.
- `services/frontend/src/types/api.ts` -- add `ImportSummary`, `ImportRowError`.

## Tasks & Acceptance

**Execution:**
- [ ] `src/types/api.ts` -- `ImportRowError { line: number; email: string | null; reason: string }`, `ImportSummary { created; updated; departmentsCreated; skipped; errors: ImportRowError[] }`.
- [ ] `src/api/import.ts` -- `importPopulationApiCall(file: File): Promise<ImportSummary>` (FormData `file`, multipart header override).
- [ ] `src/api/hooks/useImportPopulation.ts` -- `useMutation`; `onSuccess` → `queryClient.invalidateQueries({ queryKey: ['employees'] })`.
- [ ] `src/pages/EmployeeImportPage/EmployeeImportPage.tsx` + `hooks/useEmployeeImportPage.ts` -- file state, the mutation, `phase` (`idle` | `uploading` | `done` | `fileError` | `forbidden` | `error`), the `ImportSummary` result, `canWrite` gate, back link, "view directory" link. `403` → `forbidden`; `400` → `fileError` with the backend message; transport/`5xx` → `error`.
- [ ] `src/pages/EmployeeImportPage/components/ImportResult/ImportResult.tsx` -- the four counts as stat tiles + (when `errors.length`) a shadcn `Table` of line / email / reason; a "View the directory" link.
- [ ] `src/pages/EmployeeImportPage/components/FilePicker/FilePicker.tsx` -- a labelled file input (`accept=".csv,text/csv"`), the chosen file name, a soft non-`.csv` hint, the submit button (disabled with no file / while uploading / when `!canWrite`).
- [ ] `src/pages/EmployeesPage/EmployeesPage.tsx` (+ `EmployeeFilters` toolbar or a small `DirectoryToolbar`) -- an "Import population" button → `/employees/import`; the empty state gains a "no employees yet" variant (when `!hasActiveFilters`) whose primary action is the import link.
- [ ] `src/pages/EmployeesPage/hooks/useEmployeesPage.ts` -- if needed, expose whether the empty result is unfiltered so the page can pick the empty-state copy.
- [ ] `src/router/index.tsx` -- `employees/import` route (before `employees/:id`).
- [ ] `src/locales/en/translation.json` -- `import.*` (title, lead, file-input label, expected-file hint, submit, counts labels, errors-table headers, the `400`/`403`/`error` copy, "view directory", "import population" button, the "no employees yet" empty-state copy).
- [ ] `e2e/flows/import/{fixtures.ts,helpers.ts,import.spec.ts}` -- cover the I/O matrix: pick a file + submit → `POST /users/import` is multipart with a `file` part → `200` summary renders the counts; a `200` with `skipped`/`errors` renders the errors table and is not an error panel; `400` shows the backend message and re-enables the picker with no summary; `403` → permission notice, upload disabled; `500` → generic error; the directory empty state (no filters) shows the "no employees yet" import CTA and the toolbar button routes to `/employees/import`; a successful import invalidates the directory query (the next `/employees` visit refetches).

**Acceptance Criteria:**
- Given I choose a CSV and submit, when the backend returns `200`, then the request was `multipart/form-data` with a part named `file`, the four counts render, and the directory query is invalidated.
- Given the backend returns `200` with `skipped > 0` and `errors`, when the summary renders, then the per-row errors (line / email / reason) are shown and the screen is not in an error state.
- Given the backend returns `400`, when it rejects, then the backend message is shown, no summary appears, and the picker is usable again.
- Given the backend returns `403`, when it rejects, then a permission notice shows and the upload control is disabled.
- Given the directory is empty with no active filters, when it renders, then the empty state's primary action is "Import population" → `/employees/import`; with active filters it still offers "Clear filters".
- `npm run build`, `npm run lint`, `npm run format:check`, and `npm run test` pass in `services/frontend`.

## Design Notes

The screen is deliberately thin: pick a file, POST it, show the summary. No client-side CSV parsing, preview, or column mapping — the backend consumes the delivered timetracker export verbatim and owns all validation. The "expected file" hint should name it plainly (a semicolon-delimited export from the timetracker; `docs/Accounts_template.csv` is the sample) without reproducing the column list.

`multipart/form-data` via axios: the `apiClient` instance sets a default `Content-Type: application/json`, which would make axios JSON-serialise the `FormData`. Override it to `multipart/form-data` in the request config; the browser XHR adapter then strips that and sets the real `multipart/form-data; boundary=…`. This is exactly what `uploadEmployeePhotoApiCall` already does — mirror it.

A `200` is the success status even when every row was skipped. Only a `400` means "nothing happened". Keep that distinction visible in the UI — a `200` with `created: 0, skipped: 40` is a summary, not an error.

## Verification

**Commands:**
- `cd services/frontend && npm run build` -- expected: tsc + Vite build pass.
- `cd services/frontend && npm run lint` -- expected: clean.
- `cd services/frontend && npm run format:check` -- expected: clean.
- `cd services/frontend && npm run test` -- expected: existing specs + new `import` specs green.

**Manual checks:**
- With `services/backend` running (population **not** yet imported) and signed in as the HR-Admin root: `/employees` shows the "no employees yet" empty state → "Import population" → upload `docs/Accounts_template.csv` → the summary shows `created` matching the row count → "View the directory" now lists everyone, and profile / organisation / departure become reachable. A non-admin session sees the permission notice on `/employees/import`.

## Suggested Review Order

**The upload path (the design core)**

- Entry point: `multipart/form-data`, one part `file`, `Content-Type` override so axios doesn't JSON-serialise the `FormData` (same as the photo upload).
  [`import.ts:20`](../../../services/frontend/src/api/import.ts#L20)
- Phase machine + guards: `isImportSummary` rejects a malformed `200` → `error`; `inFlightRef` kills the double-submit race; `400` → `fileError` (verbatim backend message), `403` → session-scoped `forbidden`, `413` / `5xx` / transport → `serverError`.
  [`useEmployeeImportPage.ts:33`](../../../services/frontend/src/pages/EmployeeImportPage/hooks/useEmployeeImportPage.ts#L33)
- Confirm dialog before the write (creates/updates hundreds; existing rows matched by email are updated).
  [`EmployeeImportPage.tsx`](../../../services/frontend/src/pages/EmployeeImportPage/EmployeeImportPage.tsx)

**Result & cache**

- A `200` is success even with `skipped > 0` — clean vs partial copy, an errors table, "copy skipped rows", "import another file", "view the directory".
  [`ImportResult.tsx`](../../../services/frontend/src/pages/EmployeeImportPage/components/ImportResult/ImportResult.tsx)
- On any `200`, invalidate both `['employees']` (the list) and `['employee']` (open profile cards that `updated` rows made stale).
  [`useImportPopulation.ts:18`](../../../services/frontend/src/api/hooks/useImportPopulation.ts#L18)

**Directory entry points**

- Toolbar button (hidden while `loading` / `forbidden`) + the unfiltered-empty state's "No employees yet" CTA (no clear-filters actions there).
  [`EmployeesPage.tsx:68`](../../../services/frontend/src/pages/EmployeesPage/EmployeesPage.tsx#L68)
- Route declared before `employees/:id`.
  [`router/index.tsx:56`](../../../services/frontend/src/router/index.tsx#L56)

**Tests (supporting)**

- 18 import specs — multipart single-part assertion, `200` clean / partial / malformed, `400` re-arm loop, `403` (+ the directory panel hiding its CTA), `500`, `401`, confirm dialog, empty / non-`.csv` / re-pick, and the directory-query invalidation round-trip.
  [`import.spec.ts:26`](../../../services/frontend/e2e/flows/import/import.spec.ts#L26)
