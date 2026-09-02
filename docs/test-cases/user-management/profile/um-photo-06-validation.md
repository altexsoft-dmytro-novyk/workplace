# UM-PHOTO-06 · Photo upload input validation → `400`

**Trace:** `api-conventions.md` ("`PUT /users/:id/photo` — the one field needing a distinct content type (multipart upload)") · `domain-driven-design.md` §"Fakes, mocks, and stubs" (AD-15 — the real adapter must not be handed junk to store) · NFR-1 (pseudonymised data only — no bearing, but the bucket is not a general blob store) · epics.md Story 1.3

> **Scope (v1.5).** One requirement — **the upload rejects a malformed file
> before storing anything** — probed from four angles, so it is one file with
> four `Test N` blocks per the authoring pattern's granularity rule 5. Every
> branch: `400`, **nothing stored**, `User.photo` unchanged. The concrete limits
> below are **decisions made in-scenario** (README decisions 3/4/5) — confirm at
> approval. Alice is **seeded**; stage 2 issues a real `Bearer <token:<aliceId>>`
> (so the Self gate passes and the failure is genuinely the validation layer).

**Limits asserted (confirm at approval):**

| Rule | Value | Rationale |
| --- | --- | --- |
| Max size | **5 MiB** (5 242 880 bytes) | avatar, not a document store; enforced as `FileInterceptor` `limits.fileSize` so an over-limit body is refused before full buffering |
| Accepted MIME | **`image/jpeg`, `image/png`, `image/webp`** | web-safe raster formats every target browser renders; excludes `image/svg+xml` (script vector), `image/gif`, `image/heic` |
| Content check | declared `Content-Type` must be in the allow-list; a **magic-byte sniff** of the buffer is recommended defense-in-depth (flagged for the implementer) | a renamed non-image with a spoofed `Content-Type` should still be rejected |
| Empty | no `photo` part / zero-byte `photo` part / empty body | nothing to store |

## Scenario

**Given** Alice, viewing her own profile, with a real session.

**When** Alice submits `PUT /users/<aliceId>/photo` with a file that violates one
of the rules above.

**Then** the response is **`400`** with a leak-free message naming the violated
rule class, **nothing is written to object storage**, and `User.photo` is
unchanged.

**Preconditions:** [fixture](README.md#canonical-personas); Alice seeded with
`photo: null`; LocalStack S3 reachable (so a "should have failed" case that
slipped through would surface a stored object, not a storage error).

## Test

- **Test 1 — disallowed content type**
  - **inputURL:** `PUT /users/<aliceId>/photo`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<aliceId>>", "content-type": "multipart/form-data" }, "body": "<multipart; photo=<bytes>, filename=resume.pdf, content-type=application/pdf>" }`
  - **expectedResult:** `400`; body names the accepted types; no `photos/<aliceId>/*` object; `User.photo` unchanged.
- **Test 2 — oversized file**
  - **inputRequest body:** `<multipart; photo=<6 MiB of valid JPEG bytes>, filename=big.jpg, content-type=image/jpeg>`
  - **expectedResult:** `400` (payload-too-large class; `413` is an acceptable
    equivalent if the interceptor surfaces it as such — flag at approval); no
    object stored; `User.photo` unchanged.
- **Test 3 — missing file part**
  - **inputRequest body:** `<multipart; a text field "note"=hello, NO photo part>`
  - **expectedResult:** `400`; body: a `photo` file part is required; `User.photo` unchanged.
- **Test 4 — zero-byte file**
  - **inputRequest body:** `<multipart; photo=<empty buffer>, filename=empty.png, content-type=image/png>`
  - **expectedResult:** `400`; body: the `photo` file is empty; no object stored; `User.photo` unchanged.
- **Test 5 — content-type spoof (recommended, flag at approval)**
  - **inputRequest body:** `<multipart; photo=<the bytes of resume.pdf>, filename=avatar.png, content-type=image/png>`
  - **expectedResult:** `400` **if** the magic-byte sniff is implemented; if
    Product accepts declared-type-only validation, this test is dropped or
    marked `it.todo`. Recorded as an open implementer choice.
