# UM-PHOTO-05 · Self upload against a non-resolvable target → `403`

**Trace:** Epic 0 Open Decision **v** (photo write is Self-only, `viewer id == target id`) · `access-control-adoption/umac-05` (authenticated active viewer, target is not an active `User` → `403`; **no** "leak-free 404" — human product decision 2026-09-01; no existence distinction on `/users/:id` routes) · `access-control.md` §3.2 (identity validation runs **before** audience derivation; an unconfirmed target yields an empty audience — here, a failed identity match) · epics.md Story 1.3

> **Scope (v1.5).** The canonical facade-level case is `umac-05` Test 3. This
> file states the Story 1.3 expectation: because Self-only is `viewer id ==
> target id`, a target id that matches no active `User` can never equal the
> caller's own resolved active id, so the identity check fails and the response
> is **`403`** — identical to a forbidden target, **no** `404`, no existence
> signal. Alice is **seeded**; stage 2 issues a real `Bearer <token:<aliceId>>`.

## Scenario

**Given** Alice, a valid active seeded `User` with a real session.

**When** Alice submits `PUT /users/<targetId>/photo` where `<targetId>` is either
a **syntactically valid UUID matching no `User` row**, or a seeded `User` whose
`isActive` is `false`.

**Then** the response is **`403`** (the Self check `aliceId === targetId` is
`false`), leak-free body, **nothing stored**, and no row's `photo` is changed.
The response for a missing target and for a forbidden one is identical.

**Preconditions:** [fixture](README.md#canonical-personas); Alice active and
seeded; for Test 2 a seeded `User` `nina` with `isActive: false` (static seeded
state); LocalStack S3 reachable.

## Test

- **Test 1 — target UUID matches no `User` row**
  - **inputURL:** `PUT /users/<random-unused-uuidv7>/photo`
  - **inputRequest:**
    ```json
    {
      "headers": {
        "authorization": "Bearer <token:<aliceId>>",
        "content-type": "multipart/form-data"
      },
      "body": "<multipart; photo=<valid JPEG bytes>, filename=x.jpg, content-type=image/jpeg>"
    }
    ```
  - **expectedResult:** `403`, leak-free body (no field names, no "not found"
    disclosure distinguishable from a forbidden target); no `photos/*` object
    written.
- **Test 2 — target is an inactive `User`**
  - **inputURL:** `PUT /users/<ninaId>/photo` with `Bearer <token:<aliceId>>`, same body.
  - **expectedResult:** `403`; `nina.photo` unchanged; nothing stored. (`viewer
    id != target id`; the target's inactivity is not separately disclosed.)
