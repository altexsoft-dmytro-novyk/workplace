# UM-PHOTO-03 · Photo upload is Self-only — a manager and a colleague are denied

**Trace:** PRD FR-9 ("Self can directly write only the photo") · `access-control.md` §3.2 ("Self is exclusive… S1 photo RW" — Self column only; the Reporting/Project/PP RW cells apply to directly stored *identity* fields, and photo is Self's alone) · Epic 0 Open Decision **v** (photo write is Self-only — a reporting-line manager / PP may not replace a report's photo) + **vi** (photo is **not** a distinct permission — Self-only by identity, not a functional-permission check) · `access-control-adoption/umac-09` (canonical facade-level assertion) · epics.md Story 1.3

> **Scope (v1.5).** The canonical entitlement assertion against the real
> `AccessControlFacade` is `access-control-adoption/umac-09`. This file re-states
> the denial from the **feature-story side** so Story 1.3's suite is
> self-contained, and pins the semantic: the Self check is a pure **identity
> comparison** (`viewer id == target id`), **not** a permission lookup. There is
> **no `user-management:upload-photo` key** (Open Decision vi) and Story 1.3 does
> **not** depend on the `user-management:edit` seed. A viewer who *can* write
> Alice's S1 scalars through the `umac-07` dual gate (her reporting-line manager)
> is still denied her photo — the Self rule is layered on top, not a substitute.
> Alice/Bob/Eve are **seeded**; stage 2 resolves their ids and seeds a real
> `direct` `Relationship` Alice→Bob so the "manager who otherwise has S1 write"
> framing is real, not assumed.

## Scenario

**Given** Alice (a seeded employee with `photo: null`), Bob (Alice's **direct**
Unit Manager — reporting-line `write` on Alice's S1 scalars), and Eve (a seeded
employee with **no** relationship to Alice — colleague floor).

**When** Bob, then Eve, submits `PUT /users/<aliceId>/photo` with a valid image.

**Then** every such request is **`403`** and Alice's `photo` is unchanged
(`null`). The reporting-line `write` audience over Alice's S1 card does **not**
extend to her photo; only `viewer id == target id` may write it.

**Preconditions:** [fixture](README.md#canonical-personas); Alice seeded with
`photo: null`; a real `Relationship` Alice→Bob `type='direct'`; Eve has no edge
to Alice; LocalStack S3 reachable (a permitted call would otherwise 500 on
storage, not 403 — the denial must precede the store).

## Test

- **Test 1 — reporting-line manager → 403**
  - **inputURL:** `PUT /users/<aliceId>/photo`
  - **inputRequest:**
    ```json
    {
      "headers": {
        "authorization": "Bearer <token:<bobId>>",
        "content-type": "multipart/form-data"
      },
      "body": "<multipart; photo=<valid JPEG bytes>, filename=bob-tries.jpg, content-type=image/jpeg>"
    }
    ```
  - **expectedResult:** `403`, leak-free body; a follow-up `GET /users/<aliceId>`
    shows `data.photo` absent/`null` — unchanged. No `photos/<aliceId>/*` object
    is written.
- **Test 2 — unrelated colleague → 403**
  - **inputRequest header:** `{ "authorization": "Bearer <token:<eveId>>", "content-type": "multipart/form-data" }`, same body shape.
  - **expectedResult:** `403`; Alice's `photo` unchanged; no object written.
- **Test 3 — assigned People Partner → 403**
  - **Preconditions:** a real `Relationship` Alice→Paula `type='people_partner'`.
  - **inputRequest header:** `{ "authorization": "Bearer <token:<paulaId>>", "content-type": "multipart/form-data" }`, same body shape.
  - **expectedResult:** `403`; Alice's `photo` unchanged; no object written.
