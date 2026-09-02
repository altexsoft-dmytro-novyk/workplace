# UM-PHOTO-08 · The upload hits real object storage — Stage-2 bucket assertion (AD-15)

**Trace:** `domain-driven-design.md` §"Fakes, mocks, and stubs" (AD-15 — "Owned by the story/epic you are building right now → build it for real"; the `FakePhotoStorageAdapter` cautionary precedent; reference precedent `src/storage/` `ObjectStoragePort` + real `S3StorageAdapter` + LocalStack) · `testing-strategy.md` §"Done means built for real, not merely green (AD-15)" · `testing-strategy.md` §"What 'E2E' means here (AD-3)" (real DB, real router; only outbound *third-party* integrations are faked — object storage is this story's own deliverable, not a third party) · epics.md Story 1.3

> **Scope (v1.5).** This file is the explicit **real-storage gate** for Story
> 1.3. It is a Stage-2 assertion contract layered on `um-photo-01`'s write, not a
> new endpoint call. It exists so "the tests are green" cannot be claimed for
> Story 1.3 while a fake stands behind the storage port.

## Scenario

**Given** the Story 1.3 E2E suite, running against the real `AppModule` with the
**real** `StorageModule` (`OBJECT_STORAGE_PORT` → `S3StorageAdapter`) and
`AWS_ENDPOINT_URL` pointed at the LocalStack S3 in the compose stack — **no
provider override, no fake bound at the storage port** (contrast AD-3's
third-party fakes, which do not apply here).

**When** Alice completes a Self photo upload (`um-photo-01` Test 1).

**Then**:

1. The `photo` reference the API returns resolves to an object that **actually
   exists in the bucket** — a direct S3 `HeadObject` / `GetObject` on
   `AWS_S3_BUCKET` at key `photos/<aliceId>/<uuidv7>` (parsed from the returned
   reference) returns `200`, with `ContentType` matching the uploaded part and
   `ContentLength` equal to the uploaded byte count.
2. The retrieved bytes are **byte-identical** to the uploaded file.
3. No `Fake`/`Mock`/`Stub` class is registered for `OBJECT_STORAGE_PORT` in the
   test module (assert by construction / code review, recorded here as a gate
   condition): the suite must fail if one is introduced.

If LocalStack is unreachable, this test is **red on environment setup**, not on
behaviour — but it stays red (it does not degrade to a fake), and Story 1.3 is
**not done** while it is red. `db:up` / `docker compose up` brings LocalStack up
alongside Postgres.

**Preconditions:** [fixture](README.md#canonical-personas); Alice seeded with
`photo: null`; LocalStack S3 running; `AWS_S3_BUCKET` / `AWS_REGION` /
`AWS_ENDPOINT_URL` set for the test process (the same env the app reads).

## Test

- **Test 1 — the upload (as `um-photo-01` Test 1)**
  - **inputURL:** `PUT /users/<aliceId>/photo`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<aliceId>>", "content-type": "multipart/form-data" }, "body": "<multipart; photo=<N bytes of a known valid JPEG>, filename=alice.jpg, content-type=image/jpeg>" }`
  - **expectedResult:** `200`; `body.photo` non-null — parse the bucket + key from it.
- **Test 2 — the object is really in the bucket (out-of-band S3 read, not an app route)**
  - **stateChange:** the test issues an S3 `GetObject` directly against
    `AWS_ENDPOINT_URL` / `AWS_S3_BUCKET` for the parsed key — there is no app
    endpoint that serves the stored bytes.
  - **expectedResult:** the object exists; `ContentType` is `image/jpeg`;
    `ContentLength` is `N`; the body bytes equal the uploaded file exactly.
- **Test 3 — no fake behind the port**
  - **expectedResult:** the test module's `OBJECT_STORAGE_PORT` provider is
    `S3StorageAdapter` (the production binding), asserted by construction; the
    suite fails if any `Fake*`/`Mock*` is bound. Recorded as an AD-15 gate.
