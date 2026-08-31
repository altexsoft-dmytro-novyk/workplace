# User Management — `deactivation/` — RETIRED (v1.5)

**RETIRED (v1.5, 2026-09-01).** `um-deact-01`..`um-deact-03` tested a generic
`DELETE /users/:id` deactivation capability. That capability is removed in v1.5
(AD-16): `isActive` is an internal account/row-retention flag only, not
employment status and not a product deactivation operation.

**Where the behaviour went:**

- **Employment lifecycle** (recording and applying a departure) is **Epic 5**
  — see [`../departure/`](../departure/) (`um-dep-01..04`, implementation
  blocked on CC-06).
- The one surviving observable behaviour — *"a dismissed employee is absent from
  the default employee list but can be found through an authorized
  employment-status filter"* — is now a **Story 1.5 list scenario**:
  [`../list/um-list-05-dismissed-employee-filterable.md`](../list/um-list-05-dismissed-employee-filterable.md).
  The mechanism changed (departure workflow, not `DELETE /users/:id`); the
  list-visibility behaviour survives.

The 3 `um-deact-*.md` files are **retained in this folder as history only** — do
not translate them to stage-2, do not cite them, do not approve them.
`DEC-UM-002`'s *principle* carries forward (any capability check is a no-target
AccessControl feature check through the facade — never a role-name or
`User.position` check); only the generic-deactivation *surface* is retired.

The backend `services/backend/test/user-management/deactivation.e2e-spec.ts` is a
corresponding retirement — see
`_bmad-output/test-artifacts/e2e-actual-state-audit-2026-09-01.md`.
