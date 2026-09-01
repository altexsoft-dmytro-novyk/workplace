---
title: 'Story 1.3: Self Uploads Own Photo'
type: 'feature'
status: draft
created: 2026-08-24
regenerated: 2026-09-01
context: ['{project-root}/_bmad-output/implementation-artifacts/user-management/epic-1-context.md']
---

> Regenerated 2026-09-01 from epics.md v1.5 — **NOT an AD-1 approval.** Pre-v1.5
> `<frozen-after-approval>` block re-opened for renegotiation. `baseline_commit`
> dropped as stale.

## Intent

**Problem:** `photo` is the one identity-card field an employee can write on
themselves (§3.2, FR-9). It needs a dedicated multipart route —
`PUT /users/:id/photo`, full-replace semantics (`api-conventions.md`) — separate
from the scalar `PATCH /users/:id` (Story 1.2).

**Approach:** Add a multipart `PUT /users/:id/photo` handler in the
`user-management` module. The uploaded file needs real object storage — per
**AD-15**, photo storage *is* this story's deliverable, so build the real
`ObjectStoragePort` + real adapter following the `src/storage/`
`S3StorageAdapter` + LocalStack precedent; **a fixture fake standing in for
photo storage does not make this story done.** `photo` on `User` stays a
nullable string reference.

## Boundaries & Constraints

**Always:**
- AD-1 gate: `um-pf-02` scenario approved → red E2E → implementation.
- `domain/` imports nothing from Prisma, NestJS transport, or HTTP.
- **Photo write is Self-only** (`viewer id == target id`) unless Product widens
  it (Epic 0 Open Decision 3). This is narrower than the S1 `write` cell — an
  additional check, not a substitute for the §2.2 dual gate.
- Authorization routes through `ACCESS_CONTROL_PORT` — the real facade adapter
  under Epic 0. The functional half is "editing your own row"; whether photo
  needs its own permission key is Epic 0 Open Decision 2 (recommendation: no —
  covered by `user-management:edit`, Self-only by FR-9).
- Real storage adapter, real bucket via env pointed at local infra (LocalStack
  for local/CI, real S3 in prod) — no dev-infra container added to compose.

**Never:**
- No fake at the storage adapter level as the story's completion path (AD-15).
- Don't fold photo into `PATCH /users/:id`.
- Don't let a non-Self actor replace a photo unless Product confirms it.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior |
|---|---|---|
| Self upload | Alice viewing her own profile (`photo: null`), `PUT /users/<aliceId>/photo` with a file | `200`, non-null `photo` reference; follow-up `GET /users/<aliceId>` reflects it (`um-pf-02`) |
| Non-Self | Bob (reporting-line to Alice) `PUT /users/<aliceId>/photo` | `403` unless Product widened it (Epic 0 owns this scenario) |

## v1.5 Cutover Notes

- `UPLOAD_PHOTO_FEATURE` currently points at `user-management:upload-photo`,
  which is not seeded. Epic 0 Open Decision 1/2 resolves whether that key
  exists or photo folds into `user-management:edit`.
- The pre-v1.5 `FakePhotoStorageAdapter` (the AD-15 cautionary precedent) must
  not be the completion path.

## Open Questions / Gates

- Object-storage technology choice — if not already pinned by `src/storage/`,
  **stop and ask the architect** (AD-15). The `src/storage/` precedent suggests
  it is already answered (S3 + LocalStack).
- Whether a manager/PP may replace a report's photo (Epic 0 Open Decision 3).
