# UM-PF-02 · Self photo upload — SUPERSEDED

**Status:** SUPERSEDED 2026-09-02 by the `um-photo-*` set in this folder
(Epic 1 Story 1.3 AD-1 stage-1 scenario package). Do **not** translate, cite, or
approve this file. Its ID `um-pf-02` is retired **in place** — never reused,
never renumbered (ID-stability rule, [../../README.md](../../README.md)).

## Why

The single "the write persists and reflects on a read" scenario here did not
cover the Story 1.3 contract surface: Self-only entitlement as an identity check
(no `user-management:upload-photo` key — Open Decision vi), file validation
(size / MIME / empty), the object-vs-row write ordering and storage-failure
behaviour, the full-replace / orphan-object contract, and the AD-15 real-storage
assertion. Those are now nine files:

| Successor | Covers |
| --- | --- |
| [`um-photo-01-self-first-upload.md`](um-photo-01-self-first-upload.md) | the original UM-PF-02 case — Self, first photo, persists, reflects on `GET` |
| [`um-photo-02-self-replace.md`](um-photo-02-self-replace.md) | Self replace — reference changes, old object orphaned |
| [`um-photo-03-non-self-denied.md`](um-photo-03-non-self-denied.md) | manager / colleague / PP → `403` (Self-only) |
| [`um-photo-04-unauthenticated.md`](um-photo-04-unauthenticated.md) | no / bad session → `401` |
| [`um-photo-05-target-not-active-user.md`](um-photo-05-target-not-active-user.md) | non-resolvable target → `403` |
| [`um-photo-06-validation.md`](um-photo-06-validation.md) | bad content type / oversized / empty → `400` |
| [`um-photo-07-storage-failure.md`](um-photo-07-storage-failure.md) | object store down → `503`, no half-apply |
| [`um-photo-08-real-storage-assertion.md`](um-photo-08-real-storage-assertion.md) | AD-15 — real LocalStack bucket hit, no fake at the port |
| [`um-photo-09-patch-never-touches-photo.md`](um-photo-09-patch-never-touches-photo.md) | `PATCH /users/:id` cannot write `photo`; upload touches only `photo` |

## Stage-2 note

`services/backend/test/user-management/epic-1/profile-v15.e2e-spec.ts` currently
has a `describe('um-pf-02 …')` block. When the `um-photo-*` set is approved, that
block is re-pointed at `um-photo-01` (and the rest of the set is added as new
`describe`s). No production code or E2E is changed by this doc.
