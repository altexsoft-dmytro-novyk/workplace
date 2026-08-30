# API Conventions — Router Tree

Binding rules for the HTTP surface. Spine: [architecture-people-management-2026-08-30/ARCHITECTURE-SPINE.md](../../_bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-30/ARCHITECTURE-SPINE.md) AD-23, AD-25.

## No `/sections/:sN` wrapper

There is no generic sections endpoint — every resource is addressed directly.

## Routes (AD-25)

- `/users` — `GET` list, `GET :id`, `PATCH :id` (S1 writes only), `PUT :id/photo`, `GET`/`POST :id/events`. No `POST /users` (seed/import only).
- A dedicated relationships endpoint for manager/PP/department changes — never through the S1 `PATCH` (keeps AD-8's self-assignment check and AD-7's journal write from being bypassable through the general-purpose profile edit).
- `/departments` — department CRUD under the *manage departments* permission.
- `/auth/magic-link`, `/auth/magic-link/consume`.
- `/roles` — the functional-role catalog (admin-creatable roles; permissions are a closed catalog, not admin-creatable).

## Denial convention (AD-23)

`401` missing/invalid token · `403` valid token but missing functional permission, or a write against read-only access · `404` no-access section or hidden field (never reveals it exists) · absent payload data is a missing key, never `null`.
