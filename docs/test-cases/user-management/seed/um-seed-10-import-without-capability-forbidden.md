# UM-SEED-10 · The import is HR-Admin-only — without `user-management:create` → `403`, nothing written

**Trace:** [DEC-UM-002](../../../architecture/user-management-test-decisions.md#dec-um-002--deactivation-authorization-b-02--a-02) (holding *a* functional permission is not holding *this* one; use Ida / an unrelated session, never a role-name or `User.position` check) · AD-4 (minimal functional-role kernel — authorization joins `User.isActive`, `UserPolicies`, `type='FR'` policies, grants, and the immutable permission key; nothing else) · ACM-1 (`npm run db:bootstrap:access-control` seeds the `hr-admin` FR policy with `user-management:create` and attaches it to the ACM-0 root — the import reuses this existing key, no new `user-management:import` seed) · [decisions §2b](../../../../_bmad-output/implementation-artifacts/user-management/epic-1-story-1-1-decisions.md) (import capability = the existing `user-management:create`) · [access-control.md](../../../architecture/access-control.md) §"Functional-role Kernel MVP" (`position === 'HR Admin'` is prohibited as an authorization rule) · [seed README](README.md#the-import-operator-endpoint-settled-in-scenario--confirm-at-approval) ("Authorization: a no-target functional capability through the facade — `AccessControlFacade.isAllowed(callerId, 'user-management:create')`; the handler performs no `User.position` / role-name / `targetRole` comparison") · epics.md Story 1.1

## Scenario

**Given** the application is running after `db:seed`,
`db:bootstrap:access-control`, and an initial population import. `POST /users/import`
is guarded by a **no-target** functional capability:
`AccessControlFacade.isAllowed(callerId, 'user-management:create')`. This is the
**existing** kernel permission seeded by ACM-1 (`npm run db:bootstrap:access-control`
attaches the `hr-admin` FR policy carrying `user-management:create` / `:deactivate`
/ `:list` to the ACM-0 root) — the same key the retired `POST /users` required.
The import is v1.5's population-creation path, so it reuses `user-management:create`:
**no new `user-management:import` permission key and no new Access Control kernel
seed sequence are introduced** (confirmed 2026-09-02 —
[decisions §2b](../../../../_bmad-output/implementation-artifacts/user-management/epic-1-story-1-1-decisions.md)).
The handler makes **no** `User.position`, role-name, or `targetRole` comparison.

Because ACM-1 attaches `user-management:create` only to the **HR-Admin root** and
nothing else in the seeded system holds it, the population import is effectively
**HR-Admin-only**: the sole authorized operator is a session carrying the HR-Admin
FR grant chain (or a principal to whom an HR Admin has explicitly delegated that
FR policy through the normal kernel path). Every other caller is denied.

**When** a caller who does **not** hold `user-management:create` `POST`s
`/users/import` with a well-formed multipart CSV:

1. **Ida** — holds a custom functional role whose only permission is unrelated
   (*create form campaigns*), not any `user-management:*` key;
2. an **unrelated active** seeded `User` (Colin / Eve) with no FR policy
   attachment at all.

**Then** each request is **`403`** with a leak-free body, and **nothing is
written** — no `User`, `Department`, `DepartmentMembership`, `EmploymentStatus`,
or `UserEvents` row; the import writer never runs. The denial comes from the
facade branching on the exact permission key: an absent or non-matching FR grant
denies, and a `position` column literally reading `'HR Admin'` would grant
nothing (that impostor assertion lives in Epic 0's `umac-06`).

**Preconditions:** [fixture](../README.md#canonical-personas); running app;
initial import completed; Ida holds only the unrelated *create form campaigns*
permission; Colin is an active seeded `User` with zero FR attachments. Real
sessions use `Bearer <token:<seeded-uuid>>`.

## Test

- **Test 1 — Ida (unrelated FR permission, DEC-UM-002)**
  - **inputURL:** `POST /users/import`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:<ida-uuid>>", "content-type": "multipart/form-data" },
      "body": "<multipart; one file part: file=seed-basic.csv>"
    }
    ```
  - **expectedResult:** `403`, leak-free body. `SELECT count(*) FROM users WHERE "createdBy" = <ACM-0 root id>` is unchanged from before the request; no new `department` / `user_events` rows.
- **Test 2 — unrelated active session (no FR policy)**
  - **inputRequest header:** `{ "authorization": "Bearer <token:<colin-uuid>>", "content-type": "multipart/form-data" }`, same body.
  - **expectedResult:** `403`, identical body shape to Test 1 — decided by the facade's no-target `isAllowed`, not by any role name; datastore unchanged.
