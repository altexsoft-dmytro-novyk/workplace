# UMAC-09 · PUT /users/:id/photo is Self-only

**Trace:** SPEC-user-management-access-control-adoption CAP-2 (write, photo narrower rule) · `um-integration-contract-response.md` Q3 step 4 (UPLOAD_PHOTO_FEATURE narrower command rule) · PRD FR-9 ("Self can directly write only the photo") · access-control.md §3.2 (S1 photo cell RW for Self) · consolidated proposal §7 Open Decisions (v) + (vi)

> **Open Decisions (v) + (vi) — TAKEN.** Photo write is **Self-only** — a
> reporting-line manager or PP may **not** replace a report's photo — and photo
> is **not** a separate permission. It is Self-only by identity (`viewer id ==
> target id`), a pure equality check with **no** facade `isAllowed` /
> `canAccessSection` call and **no** permission key. It has **never** consulted
> `user-management:edit` and does not depend on any kernel seed. Implemented via
> `@SelfOnly` / `SelfOnlyGuard`. If Product widens it, this scenario changes.

## Scenario

**Given** the port is rebound; V and T are active seeded `User` rows.

**When** a `PUT /users/<id>/photo` multipart upload is submitted.

**Then** it succeeds (`200`, non-null `photo` reference) **only when the viewer id
equals the target id** (Self). Any other viewer — a reporting-line manager, an
assigned PP, an unrelated session — is denied `403`, even one who has
`canAccessSection(V, 'S1', T) === 'write'` and can edit T's scalar identity
fields through `umac-07`. This is an identity-equality command rule narrower than
the S1 `write` cell, layered on top, not a substitute for it.

**Preconditions:** [fixture](README.md#fixture-convention-per-um-integration-contract-response-md-q6); V and T active; for the manager case a real `Relationship` `T → V` `type='direct'`; the port is rebound.

## Test

- **Test 1 — Self uploads own photo → 200**
  - **inputURL:** `PUT /users/<T-uuid>/photo`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<T-uuid>>" }, "body": "<multipart photo file>" }`
  - **expectedResult:** `200`; body `photo` is a non-null reference; a follow-up `GET /users/<T>` reflects it.
- **Test 2 — reporting-line manager uploads a report's photo → 403**
  - real `Relationship` `T → V` `type='direct'`.
  - **inputURL:** `PUT /users/<T-uuid>/photo` with `Bearer <token:<V-uuid>>`
  - **expectedResult:** `403`; T's `photo` unchanged.
- **Test 3 — unrelated session → 403** — same, with an unrelated active `User`.
