# UM-PHOTO-02 · Self replaces an existing photo — full-replace semantics

**Trace:** PRD FR-9 · `api-conventions.md` ("`PUT`, not `PATCH`: full-replace semantics, no partial-update meaning for a single photo") · `access-control.md` §3.2 (S1 photo `RW` for Self) · `domain-driven-design.md` §"Fakes, mocks, and stubs" (AD-15) · epics.md Story 1.3

> **Scope (v1.5).** Data correctness given the entitled (Self) actor. Entitlement
> is `umac-09`'s. Alice is **seeded**; stage 2 resolves `<aliceId>` and issues a
> real `Bearer <token:<aliceId>>` session. The state transition (Alice already
> has a photo) is shown as explicit steps per the authoring pattern — it is not a
> precondition, because it is producible by this suite's own first request.

## Scenario

**Given** Alice, viewing her own profile, who has **already** uploaded a photo
(`um-photo-01`'s write path).

**When** Alice submits a second `PUT /users/<aliceId>/photo` with a different
valid image.

**Then** the response is `200` and `body.photo` is a **new reference, different
from the first** (a fresh `photos/<aliceId>/<uuidv7>` key — keys are per-upload
and never overwritten). A follow-up `GET /users/<aliceId>` shows `data.photo`
equal to the **new** reference. The previous object is left in the bucket as a
harmless **orphan** — Story 1.3 does **not** delete it synchronously and does
**not** add a `delete` verb to the storage port (README decision 8); reclamation
is a documented follow-up (a `photos/<aliceId>/` sweep of keys `!= User.photo`,
or a bucket lifecycle rule). The scenario asserts the row re-points and the new
object is retrievable; it does **not** assert the old object is gone.

**Preconditions:** [fixture](README.md#canonical-personas); Alice seeded with
`photo: null`; LocalStack S3 reachable.

## Test

- **Test 1 — first upload (establish the "before" state)**
  - **inputURL:** `PUT /users/<aliceId>/photo`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<aliceId>>", "content-type": "multipart/form-data" }, "body": "<multipart; photo=<valid PNG bytes>, filename=first.png, content-type=image/png>" }`
  - **expectedResult:** `200`; `body.photo` is a non-null string — capture it as `photoRef1`.
- **Test 2 — the replace**
  - **inputURL:** `PUT /users/<aliceId>/photo`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<aliceId>>", "content-type": "multipart/form-data" }, "body": "<multipart; photo=<a different valid JPEG>, filename=second.jpg, content-type=image/jpeg>" }`
  - **expectedResult:** `200`; `body.photo` is non-null and **`!== photoRef1`**.
- **Test 3 — observing the change**
  - **inputURL:** `GET /users/<aliceId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<aliceId>>" } }`
  - **expectedResult:** `200`; `data.photo` equals the Test-2 reference and
    **`!== photoRef1`**. (Stage 2: the object at the Test-2 reference is
    retrievable from the bucket — `um-photo-08`. No assertion that `photoRef1`'s
    object was deleted.)
