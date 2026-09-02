# UM-PHOTO-04 · Photo upload without a usable session → `401`

**Trace:** [../../README.md](../../README.md) global 401 rule (every endpoint rejects a missing/invalid token with `401`) · `access-control.md` denial conventions (missing/invalid token → `401`, before any capability or identity check) · `access-control-adoption/umac-05` (unresolved session on a `/users/:id` route; interim resolver is lax → the guard surfaces `403`, target end state `401`) · epics.md Story 1.3

> **Scope (v1.5).** The session check runs **before** the Self identity check, so
> an unauthenticated caller never reaches it. Per `umac-05`, the **target end
> state is `401`** once the Epic 2 magic-link middleware replaces the interim
> session resolver; under the current lax `InterimSessionResolverAdapter` a
> syntactically-valid-but-unresolvable token reaches the guard and surfaces as
> `403`. Both dispositions are recorded so the stage-2 E2E asserts the right one
> for the resolver in place at the time.

## Scenario

**Given** the `PUT /users/:id/photo` route and a seeded target Alice.

**When** the request carries **no** `Authorization` header, or a **malformed**
bearer token, or a **syntactically valid token that resolves to no active
`User`**.

**Then**:

- **No header / malformed token → `401`**, leak-free body, **nothing stored** and
  `User.photo` unchanged. This is the session layer's rejection; `isAllowed*`
  and the Self identity check are never reached.
- **Valid-shape token, unresolved principal → `401`** as the target end state
  (Epic 2 middleware); **`403`** under the current interim resolver (the token
  parses to `{ userId: <string> }`, the guard's Self check
  `userId === '<aliceId>'` is `false` → `403`). Either way: nothing stored,
  `User.photo` unchanged.

**Preconditions:** [fixture](README.md#canonical-personas); Alice seeded with
`photo: null`; LocalStack S3 reachable (so a hypothetical pass would 500 on
storage, not mask the auth outcome).

## Test

- **Test 1 — no token**
  - **inputURL:** `PUT /users/<aliceId>/photo`
  - **inputRequest:**
    ```json
    {
      "headers": { "content-type": "multipart/form-data" },
      "body": "<multipart; photo=<valid JPEG bytes>, filename=x.jpg, content-type=image/jpeg>"
    }
    ```
  - **expectedResult:** `401`, leak-free body; no `photos/<aliceId>/*` object
    written; `User.photo` unchanged.
- **Test 2 — malformed token**
  - **inputRequest header:** `{ "authorization": "Bearer not-a-real-token", "content-type": "multipart/form-data" }`, same body.
  - **expectedResult:** `401`; nothing stored; `User.photo` unchanged.
- **Test 3 — valid-shape token, unresolved principal**
  - **inputRequest header:** `{ "authorization": "Bearer <token:<nonexistent-uuid>>", "content-type": "multipart/form-data" }`, same body.
  - **expectedResult:** target end state `401`; **`403`** under the current
    interim session resolver (guard denies the failed Self identity check).
    Nothing stored; `User.photo` unchanged.
