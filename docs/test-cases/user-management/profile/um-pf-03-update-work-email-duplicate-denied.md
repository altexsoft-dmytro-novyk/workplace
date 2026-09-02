# UM-PF-03 · Editing `workEmail` to an address already in use is rejected — SUPERSEDED

**Status:** SUPERSEDED 2026-09-02 by
[`um-edit-03-duplicate-workemail-rejected-wholesale.md`](um-edit-03-duplicate-workemail-rejected-wholesale.md)
(Epic 1 Story 1.2 AD-1 stage-1 package). Do **not** translate, cite, or approve
this file. ID `um-pf-03` is retired **in place** (ID-stability rule,
[../../README.md](../../README.md)).

## Why

The successor keeps the original `409`-on-conflict / row-unchanged assertion and
**adds** the wholesale-rollback assertion (a sibling field in the same body is
also not applied) and the normalized-comparison detail. Normalization-before-the-check
is split out into
[`um-edit-02-workemail-normalized-before-uniqueness-check.md`](um-edit-02-workemail-normalized-before-uniqueness-check.md).

## Stage-2 note

The `describe('um-pf-03 …')` block in `profile-v15.e2e-spec.ts` is re-pointed at
`um-edit-03` when the `um-edit-*` set is approved. No code or E2E changed by this
doc.
