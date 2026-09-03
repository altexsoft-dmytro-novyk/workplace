---
title: 'Employee profile'
type: 'feature'
created: '2026-09-03'
status: 'done'
review_loop_iteration: 0
baseline_commit: '49433e14941a274ef3871a98528cdb93146e4374'
context:
  - '{project-root}/services/frontend/CLAUDE.md'
  - '{project-root}/services/frontend/.claude/rules/'
  - '{project-root}/_bmad-output/implementation-artifacts/user-management/spec-employee-directory.md'
  - '{project-root}/docs/design/people-platform-prototype/design-notes.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Directory rows link to `/employees/:id` but that route doesn't exist (it currently falls through to Home). There is no screen to view or edit an employee's identity card, upload one's own photo, or see a career timeline — all of which the backend already serves.

**Approach:** Add the employee profile screen at `/employees/:id`: the S1 identity card (view + conditional inline edit), self-service photo upload, and the career timeline (view + conditional add/delete). Gating is driven entirely by the `canEdit` hints the backend returns — the UI never re-derives access.

## Boundaries & Constraints

**Always:**
- Follow every `services/frontend/.claude/rules/*` convention (page folder + UI-only component + `hooks/`; data only via TanStack Query hooks in `src/api/hooks/`, request fns suffixed `ApiCall`; i18n keys first; semantic colour tokens only; arrow components; `@/` imports; components < 200 lines; forms use `react-hook-form` + `zod`).
- The identity card shows **exactly** the 12 fields `GET /users/:id` returns in `data` (id, firstName, lastName, photo, position, country, city, workEmail, workPhone, birthDay, birthMonth, companyJoinDate). No derived manager/PP/department/mentor rows — the backend does not send them on this route.
- Show the "Edit" affordance only when the `GET /users/:id` response `canEdit` is `true`. The edit form submits `PATCH /users/:id` with only the changed subset of {firstName, lastName, position, country, city, workEmail, workPhone, birthDay, birthMonth, companyJoinDate}. `birthDay` 1–31, `birthMonth` 1–12, `workEmail` email-shaped, `companyJoinDate` a date — validate client-side with zod before sending.
- Show the photo-upload control only when `routeId === useAuth().userId` (backend `PUT /users/:id/photo` is Self-only). Client-validate: type ∈ {image/jpeg, image/png, image/webp}, size ≤ 5 MiB, before upload.
- The career timeline reads `GET /users/:id/events` → `{ data, canEdit }`. Show "Add event" / per-row delete only when that response's `canEdit` is `true`. There is **no edit** — a correction is delete + re-add; reflect that (no edit affordance on a row). `POST /users/:id/events` body is `{ type: string, eventDate: 'YYYY-MM-DD', details?: object }`; `DELETE /users/:id/events/:eventId` → 204.
- Every error path renders in place, never a blank screen: `GET /users/:id` `403`/`404` → a full "profile unavailable" panel; `GET /users/:id/events` `403` → the timeline section shows "Not available at your access level" (colleague audience is excluded from the timeline) — not an error panel; `401` anywhere → the G1 interceptor handles it.
- After any successful mutation (PATCH, photo PUT, event POST/DELETE) invalidate/refetch the affected query so the screen reflects the new state.
- Add an "My profile" link to the header account menu → `/employees/${useAuth().userId}`.
- Add shadcn components via `npx shadcn@latest add` only (`dialog`, `alert-dialog`, `textarea`, and `tooltip` if used).

**Ask First:**
- Any change to `services/backend`.
- Rendering or editing anything beyond the 12 S1 fields + the timeline (S2–S16 sections, org relationships, custom fields) — those are later goals / deferred.
- A rich `details` editor for career events beyond a plain key/value or JSON textarea.

**Never:**
- The 6-audience × 16-section access matrix from `Profile.dc.html` — that artboard is the HR-Admin "Access preview" tool (deferred G7, no backend). This screen is the ordinary employee profile.
- Editing the photo for anyone but yourself; editing manager / People Partner / department / employment status / custom fields from this screen (the backend `PATCH` rejects those keys with `400` by design).
- Client-side re-derivation of access — trust the response `canEdit` flags only.
- G4/G5 screens (org-relationships, departures).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| View a profile | Navigate to `/employees/:id`, `GET /users/:id` → `200 { data, canEdit:false }` | Header (photo/initials, name, position, location) + identity card of the 12 fields; nullable fields render `—`; no Edit button | — |
| View own profile | `routeId === useAuth().userId` | Same, plus the photo-upload control | — |
| Editable profile | `canEdit:true` | "Edit" button → form with the 10 editable fields prefilled | — |
| Save an edit | Change `position`, submit | `PATCH /users/:id` with `{ position }` only → `200` → exit edit mode, card shows the new value | Validation fails client-side → field errors, no request |
| Email conflict | `PATCH` sets `workEmail` to a taken address | `409` → inline error on the email field, card unchanged | — |
| Rejected field | (not reachable via the form) | n/a — the form never offers manager/PP/department inputs | — |
| Upload a photo | Own profile, pick a 2 MB PNG | `PUT /users/:id/photo` (multipart `photo`) → `200` → header photo updates | Wrong type/size → inline message, no upload; `503` → "storage temporarily unavailable, try again" |
| View timeline | `GET /users/:id/events` → `200 { data, canEdit:false }` | Chronological list; each row: type, date, `details`, a "manual"/"system" source tag; empty → "No timeline events yet" | — |
| Timeline not permitted | Colleague viewing another person → `GET .../events` `403` | Timeline section shows "Not available at your access level" (no retry, no error styling) | — |
| Add an event | `canEdit:true`, open dialog, fill type + date | `POST /users/:id/events` → `201` → dialog closes, list refetches and shows it | `400` (bad date/type) → dialog stays open with the error |
| Delete an event | `canEdit:true`, confirm the alert dialog | `DELETE /users/:id/events/:eventId` → `204` → list refetches without it | `403`/`404` → toast/inline error, list unchanged |
| Profile missing / no access | `GET /users/:id` → `403` or `404` | Full-panel "This profile isn't available" + a link back to the directory | — |
| Server/network error | `GET /users/:id` → `500` / network failure | Error panel with "Try again" (refetch) | — |

</frozen-after-approval>

## Code Map

- `services/backend/src/user-management/application/controllers/users.controller.ts:150` -- `GET /users/:id` (`{ data: S1IdentityCard, canEdit }`; `RequireFeatureForTarget('user-management:read')` → `403` when the viewer's S1 audience over the target is empty, incl. a nonexistent id; `401` unauth). `:202` `PATCH /users/:id` (`RequireFeatureForTarget('user-management:edit')` = `canAccessSection('S1')==='write'` — reporting-line manager or assigned PP; returns the whole-row `UserResponse`). `:217` `PUT /users/:id/photo` (`@SelfOnly` — `session.userId === :id`; multipart `photo`; 5 MiB; `image/jpeg|png|webp`; `503` on storage outage). `:164` `GET /:id/events`, `:177` `POST /:id/events`, `:192` `DELETE /:id/events/:eventId` (no `PATCH` — `404`).
- `services/backend/src/user-management/application/dtos/user-card.response.ts` -- `S1IdentityCard` field list + `UserCardResponse { data, canEdit }`; `companyJoinDate` is `YYYY-MM-DD`.
- `services/backend/src/user-management/application/dtos/update-user.dto.ts` -- editable keys + rules (`birthDay` 1–31, `birthMonth` 1–12, `workEmail` normalised+unique → `409`); manager/PP/department/employmentStatus/customFields/photo/isActive keys are rejected `400`.
- `services/backend/src/user-management/application/dtos/user-event.response.ts` -- `UserEventResponse { id, type, eventDate: 'YYYY-MM-DD', details: unknown, source, createdAt }`, `UserEventsEnvelope { data, canEdit }`. Order: `eventDate asc, createdAt asc`.
- `services/backend/src/user-management/application/dtos/create-user-event.dto.ts` -- `POST` body `{ type (non-empty string), eventDate (date string), details? (object) }`.
- `services/backend/.../upload-user-photo.action.ts` + `src/storage/infrastructure/s3-storage.adapter.ts:74` -- `photo` in responses is a **full URL** — render it directly in `<img>`/`<AvatarImage>` with an initials fallback on error.
- `services/frontend/src/api/client.ts` -- `apiClient` + interceptors; multipart: pass a `FormData` and let axios set the boundary (do not force `Content-Type`).
- `services/frontend/src/api/employees.ts` + `hooks/useEmployees.ts` -- existing directory pattern to mirror for the new hooks; `queryKey` conventions.
- `services/frontend/src/contexts/AuthContext.tsx` -- `useAuth().userId` (the JWT `sub`); used for the self-photo gate and the "My profile" menu link.
- `services/frontend/src/pages/EmployeesPage/components/EmployeeTable/EmployeeTable.tsx:55` -- the `Link to={`/employees/${id}`}` this route lights up; reuse `getInitials`/`fullName`/`formatBirthday`/`formatJoinDate` from `.../helpers/employeeFormatters.ts` (export-shared or lift to `src/lib/`).
- `services/frontend/src/components/MainHeader/components/AccountMenu/AccountMenu.tsx` -- add the "My profile" item.
- `services/frontend/src/router/index.tsx` -- add `/employees/:id` under `RequireAuth`/`AppLayout`.
- `services/frontend/src/types/api.ts` -- add `S1IdentityCard`, `UserCardResponse`, `CareerEvent`, `CareerTimelineResponse`, `UpdateIdentityCardPayload`, `CreateCareerEventPayload`.
- `services/frontend/src/index.css` -- prototype tokens present; the profile uses the neutral/blue accent (the `--accent-violet` "access-inspection" hue belongs to the deferred access-preview screen, not this one).
- `docs/design/people-platform-prototype/Profile.dc.html` -- visual reference for the `.phead` header + `.sec` section-card treatment only; ignore its audience switch / matrix.

## Tasks & Acceptance

**Execution:**
- [ ] `services/frontend/package.json` -- `npx shadcn@latest add dialog alert-dialog textarea` (+ `tooltip` if used).
- [ ] `src/types/api.ts` -- the profile + timeline types listed in the Code Map.
- [ ] `src/api/profile.ts` -- `getEmployeeApiCall(id)`, `updateEmployeeApiCall(id, payload)`, `uploadEmployeePhotoApiCall(id, file)` (builds `FormData`), `getCareerEventsApiCall(id)`, `createCareerEventApiCall(id, payload)`, `deleteCareerEventApiCall(id, eventId)`.
- [ ] `src/api/hooks/useEmployee.ts` -- `useQuery(['employee', id])`; do not retry `403`/`404`.
- [ ] `src/api/hooks/useUpdateEmployee.ts`, `useUploadEmployeePhoto.ts` -- mutations; on success invalidate `['employee', id]`.
- [ ] `src/api/hooks/useCareerEvents.ts` -- `useQuery(['employee', id, 'events'])`; do not retry `403`.
- [ ] `src/api/hooks/useCreateCareerEvent.ts`, `useDeleteCareerEvent.ts` -- mutations; on success invalidate `['employee', id, 'events']`.
- [ ] `src/pages/EmployeeProfilePage/EmployeeProfilePage.tsx` + `hooks/useEmployeeProfilePage.ts` -- reads `:id` from the route, `useEmployee`, derives `isOwnProfile`, `status` (`loading|ready|unavailable|error`), passes data down; back-link to `/employees`.
- [ ] `src/pages/EmployeeProfilePage/components/ProfileHeader/ProfileHeader.tsx` (+ `hooks/useProfilePhotoUpload.ts`) -- avatar (photo URL w/ initials fallback), name, position · city, country; photo-upload button + hidden file input + client validation, shown only when `isOwnProfile`.
- [ ] `src/pages/EmployeeProfilePage/components/IdentityCard/IdentityCard.tsx` -- read view of the 12 fields in the prototype `.sec` card; "Edit" button when `canEdit`.
- [ ] `src/pages/EmployeeProfilePage/components/IdentityCard/IdentityCardForm.tsx` (+ `hooks/useIdentityCardForm.ts`) -- RHF + zod; submits only dirty fields; maps `409` → email field error, `400` → field/general errors; Cancel restores the read view.
- [ ] `src/pages/EmployeeProfilePage/components/CareerTimeline/CareerTimeline.tsx` -- chronological list; per row: type label, formatted date, `details` (compact key/value render of the object, or `—`), a `Badge` for `source` (`manual`/`system`); empty state; the `403` "not available" state; "Add event" + per-row delete only when `canEdit`.
- [ ] `src/pages/EmployeeProfilePage/components/CareerTimeline/AddEventDialog.tsx` (+ `hooks/useAddEventForm.ts`) -- shadcn `Dialog`; fields: `type` (text), `eventDate` (date input → `YYYY-MM-DD`), `details` (optional JSON `textarea`, parsed + validated, omitted when blank); submit → `useCreateCareerEvent`; `400` keeps the dialog open with the error.
- [ ] `src/pages/EmployeeProfilePage/components/CareerTimeline/DeleteEventButton.tsx` -- shadcn `AlertDialog` confirm → `useDeleteCareerEvent`.
- [ ] `src/components/MainHeader/components/AccountMenu/AccountMenu.tsx` -- "My profile" item → `/employees/${userId}` (only when `userId` is set).
- [ ] `src/router/index.tsx` -- `/employees/:id` route.
- [ ] `src/lib/` or `EmployeeProfilePage/helpers/` -- share the date/initials formatters with the directory (avoid a second copy).
- [ ] `src/locales/en/translation.json` -- `profile.*` (header, card labels, edit/save/cancel, timeline, add-event dialog, source tags, all error/empty/unavailable copy, "My profile").
- [ ] `e2e/flows/profile/{fixtures.ts,helpers.ts,profile.spec.ts}` -- cover the I/O matrix: read-only view (+ `—` for nulls, no Edit); own profile shows the photo control; `canEdit` view edits `position` → `PATCH` carries only that key → card updates; `409` → email field error; photo upload happy path + client-side type/size rejection; timeline list + empty + the `403` "not available" state; add event → `POST` body shape → list refetch; delete event via the confirm dialog; `GET /users/:id` `403`/`404` → unavailable panel; `500` → error panel + retry; the "My profile" menu link resolves to `/employees/<the JWT sub>` (closes the G1 `userId` coverage gap).

**Acceptance Criteria:**
- Given `GET /users/:id` returns `canEdit:false`, when the profile loads, then the 12 fields render (nulls as `—`), there is no Edit button, and the photo control appears only if it is my own profile.
- Given `canEdit:true`, when I edit `city` and save, then `PATCH /users/:id` is sent with `{ city }` only and the card reflects the new value without a full reload.
- Given I `PATCH` `workEmail` to a taken address, when the backend returns `409`, then the email field shows a conflict error and the stored value is unchanged.
- Given I am on my own profile, when I upload a 3 MB JPEG, then `PUT /users/:id/photo` is sent as multipart and the header photo updates; a 10 MB file or a PDF is rejected client-side with no request.
- Given `GET /users/:id/events` returns `403`, when the timeline renders, then it shows "Not available at your access level" and no error panel.
- Given `canEdit:true` on the timeline, when I add an event with a type and date, then `POST /users/:id/events` carries `{ type, eventDate }` and the new row appears after refetch; deleting it via the confirm dialog removes it.
- Given `GET /users/:id` returns `403` or `404`, when the page loads, then I see the "profile unavailable" panel with a link back to `/employees`.
- Given I open the account menu, when I click "My profile", then I land on `/employees/<my user id>`.
- `npm run build`, `npm run lint`, `npm run format:check`, and `npm run test` pass in `services/frontend`.

## Design Notes

`canEdit` is the whole access model on this screen. `GET /users/:id` returns it for the identity card (`true` for the target's reporting-line manager or assigned People Partner); `GET /users/:id/events` returns its own (`true` for a `profile:timeline:write` holder). Both are `false` for most viewers in the current backend (the permissions aren't broadly seeded), so the default rendered experience is read-only — that is correct, not a bug. Build the edit/add/delete paths fully; they light up when the grants exist.

`PATCH` returns the whole-row `UserResponse`, not the `{ data, canEdit }` card envelope — after a successful edit, invalidate `['employee', id]` and re-render from the fresh `GET` rather than trusting the PATCH body's extra fields.

Photo `<img>` src is a cross-origin storage URL that may fail to load (bucket ACL, expiry) — always render an initials fallback on `onError`, same as the directory avatars.

Career-event `details` is an arbitrary object (`{ from: 'Engineer', to: 'Senior Engineer' }`, etc.). Render it as a compact definition list of its top-level entries; if it is empty or not an object, show `—`. The add-event dialog takes it as an optional JSON textarea — parse on submit, show a parse error inline, omit the key entirely when blank.

## Verification

**Commands:**
- `cd services/frontend && npm run build` -- expected: tsc + Vite build pass.
- `cd services/frontend && npm run lint` -- expected: clean.
- `cd services/frontend && npm run format:check` -- expected: clean.
- `cd services/frontend && npm run test` -- expected: existing specs + new `profile` specs green.

**Manual checks:**
- With `services/backend` running and a seeded population: from the directory, click an employee → the profile loads with the identity card and timeline. On your own profile the photo control appears; uploading a small JPEG updates the avatar. Editing is read-only unless you are signed in as the target's manager/PP (or the timeline permission is granted).

## Suggested Review Order

**Access model (the design core)**

- Entry point: `canEdit` from the `GET /users/:id` response is the whole access model for the card; `403`/`404` → `unavailable`, a data-less `200` → `error`, `5xx` → retryable `error`.
  [`useEmployeeProfilePage.ts:30`](../../../services/frontend/src/pages/EmployeeProfilePage/hooks/useEmployeeProfilePage.ts#L30)
- Photo control is the one client-derived gate (`routeId === useAuth().userId`) — the S1 card carries no self/photo flag; noted as a spec gap.
  [`useProfilePhotoUpload.ts:35`](../../../services/frontend/src/pages/EmployeeProfilePage/components/ProfileHeader/hooks/useProfilePhotoUpload.ts#L35)
- Timeline has its own independent `canEdit` (from `GET .../events`); a `403` is an expected non-error state, not the error panel.
  [`CareerTimeline.tsx:76`](../../../services/frontend/src/pages/EmployeeProfilePage/components/CareerTimeline/CareerTimeline.tsx#L76)

**Edit path & backend contract**

- Diff-only PATCH body: sends just the changed subset; numeric fields coerced; a cleared set-birthday is blocked with a message, not a silent close.
  [`useIdentityCardForm.ts:85`](../../../services/frontend/src/pages/EmployeeProfilePage/components/IdentityCard/hooks/useIdentityCardForm.ts#L85)
- 3-way mutation error classification (permission / network / generic), shared by edit, add-event and delete.
  [`mutationError.ts:13`](../../../services/frontend/src/pages/EmployeeProfilePage/helpers/mutationError.ts#L13)
- Real-calendar-date validation for `companyJoinDate` and `eventDate`.
  [`isoDate.ts:8`](../../../services/frontend/src/pages/EmployeeProfilePage/helpers/isoDate.ts#L8)
- Photo multipart: `FormData` + a `Content-Type` override the browser adapter then replaces with the real boundary.
  [`profile.ts:36`](../../../services/frontend/src/api/profile.ts#L36)

**Wiring**

- `/employees/:id` route + the "My profile" account-menu link (first `useAuth().userId` consumer — closes the G1 gap).
  [`AccountMenu.tsx:39`](../../../services/frontend/src/components/MainHeader/components/AccountMenu/AccountMenu.tsx#L39)

**Tests (supporting)**

- 24 profile specs — read/edit/validation/conflict, photo happy + size + 503, timeline add/delete + failure, and the 403 / data-less-200 / unavailable panels.
  [`profile.spec.ts:15`](../../../services/frontend/e2e/flows/profile/profile.spec.ts#L15)
