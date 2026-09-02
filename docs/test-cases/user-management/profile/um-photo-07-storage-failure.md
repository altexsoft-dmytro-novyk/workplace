# UM-PHOTO-07 · Object store unreachable → `503`, `User.photo` NOT changed

**Trace:** NFR-3 ("future integration failures degrade gracefully") · `domain-driven-design.md` §"Fakes, mocks, and stubs" (AD-15 — the real adapter is exercised, including its failure mode) · `api-conventions.md` (multipart `PUT /users/:id/photo`) · epics.md Story 1.3 · README decisions **6** (write ordering) + **7** (`503`)

> **Scope (v1.5).** Asserts the **no-half-apply** invariant: when the object
> write fails, the DB row is never touched, so `User.photo` and the stored object
> can never disagree. The failure code (`503`) and the object-first ordering are
> **decisions made in-scenario** — confirm at approval. Alice is **seeded**;
> stage 2 issues a real `Bearer <token:<aliceId>>`.
>
> **How the failure is injected (real adapter, real fault — not a port fake).**
> Per AD-15 there is no fake at the storage port. Stage 2 induces a genuine
> outage against the real `S3StorageAdapter`: point `AWS_ENDPOINT_URL` at a
> closed port (or stop the LocalStack container) for the duration of the write,
> so the real `S3Client.send(PutObjectCommand)` throws a connection error. This
> is a `stateChange`, not a precondition, because it is a transition the test
> performs.

## Scenario

**Given** Alice, viewing her own profile, with `photo: null` and a real session;
the object store is reachable at the start.

**When** the object store becomes **unreachable**, and Alice then submits a valid
`PUT /users/<aliceId>/photo`.

**Then** the response is **`503`** (transient dependency outage — retry invited;
distinct from `502`, which is a malformed upstream *response*). The object `put`
threw before the row update ran (README decision 6: object first, then row), so
`User.photo` is **still `null`** — no dangling reference, no half-applied state.
A follow-up read after the store recovers confirms `data.photo` absent/`null`,
and a retry then succeeds normally.

**Preconditions:** [fixture](README.md#canonical-personas); Alice seeded with
`photo: null`; object store reachable at test start.

## Test

- **Test 1 — baseline: the store is up, the photo is unset**
  - **inputURL:** `GET /users/<aliceId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<aliceId>>" } }`
  - **expectedResult:** `200`; `data.photo` absent/`null`.
- **stateChange:** the object store is made unreachable (`AWS_ENDPOINT_URL`
  repointed to a closed port / LocalStack stopped) — there is no API for this;
  it models a real infra outage.
- **Test 2 — upload during the outage**
  - **inputURL:** `PUT /users/<aliceId>/photo`
  - **inputRequest:**
    ```json
    {
      "headers": {
        "authorization": "Bearer <token:<aliceId>>",
        "content-type": "multipart/form-data"
      },
      "body": "<multipart; photo=<valid JPEG bytes>, filename=alice.jpg, content-type=image/jpeg>"
    }
    ```
  - **expectedResult:** `503`, leak-free body; no row change.
- **Test 3 — the row did not move**
  - **inputURL:** `GET /users/<aliceId>` with `Bearer <token:<aliceId>>`
  - **expectedResult:** `200`; `data.photo` still absent/`null` — the failed
    upload left `User.photo` exactly as it was.
- **stateChange:** the object store is restored.
- **Test 4 — retry succeeds**
  - **inputURL:** `PUT /users/<aliceId>/photo` with `Bearer <token:<aliceId>>`, same body.
  - **expectedResult:** `200`; `body.photo` non-null; a follow-up `GET` shows the
    new reference at `data.photo`.
