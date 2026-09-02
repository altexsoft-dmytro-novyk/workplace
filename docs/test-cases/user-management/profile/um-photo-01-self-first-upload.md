# UM-PHOTO-01 · Self uploads a first photo — it persists and reflects on a read

**Trace:** PRD FR-9 ("Self can directly write only the photo") · `access-control.md` §3.2 (S1 photo cell `RW` for Self) · `api-conventions.md` ("`PUT /users/:id/photo` — the one field needing a distinct content type; full-replace") · `domain-driven-design.md` §"Fakes, mocks, and stubs" (AD-15 — real object storage) · epics.md Story 1.3

> **Scope (v1.5).** This file asserts **data correctness given the entitled (Self)
> actor**: the upload stores a real object, sets a non-null `photo` reference, and
> that reference is visible on a follow-up read. *Who* is entitled — Self-only,
> `viewer id == target id` — is asserted canonically against the real facade in
> `access-control-adoption/umac-09`; `um-photo-03` re-states the denial from the
> feature side. Alice is a **seeded** employee (Story 1.1); stage 2 resolves
> `<aliceId>` from the seeded fixture id table and issues `Bearer <token:<aliceId>>`
> as a real session for that row — never a hardcoded literal.
>
> **Real storage (AD-15).** Story 1.3's deliverable *is* photo storage. The E2E
> exercises the real `src/storage/` port + `S3StorageAdapter` against LocalStack;
> a fake at the storage boundary is not the completion path and does not make this
> scenario pass for the purpose of Story 1.3 being "done". `um-photo-08` carries
> the explicit bucket-hit assertion.

## Scenario

**Given** Alice, a seeded employee whose `photo` is `null`, viewing her own profile.

**When** Alice submits `PUT /users/<aliceId>/photo` as `multipart/form-data` with
one `photo` part containing a valid JPEG.

**Then** the response is `200` and its body carries a **non-null `photo`
reference** (the object-storage URL the adapter returned for the key
`photos/<aliceId>/<uuidv7>`). A follow-up `GET /users/<aliceId>` returns the
`{ data, canEdit }` envelope with `data.photo` equal to that same reference —
the write persisted, it is not a transient echo.

**Preconditions:** [fixture](README.md#canonical-personas); Alice seeded with
`photo: null`; LocalStack S3 reachable via `AWS_ENDPOINT_URL` (compose stack).

## Test

- **Test 1 — the write**
  - **inputURL:** `PUT /users/<aliceId>/photo`
  - **inputRequest:**
    ```json
    {
      "headers": {
        "authorization": "Bearer <token:<aliceId>>",
        "content-type": "multipart/form-data"
      },
      "body": "<multipart; one part: photo=<valid JPEG bytes>, filename=alice.jpg, content-type=image/jpeg>"
    }
    ```
  - **expectedResult:** `200`; body is the plain `toUserResponse` shape (not the
    `{ data, canEdit }` envelope — see README decision 9); `body.photo` is a
    non-null string and is **not** the literal request filename.
- **Test 2 — observing the change**
  - **inputURL:** `GET /users/<aliceId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<aliceId>>" } }`
  - **expectedResult:** `200`; `data.photo` equals the `photo` value returned in
    Test 1. (No assertion is made on `canEdit` — it stays `false` for Self on S1
    scalars, README decision 10, which is unrelated to photo-write ability.)
