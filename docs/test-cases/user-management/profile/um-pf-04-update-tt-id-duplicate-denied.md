# UM-PF-04 · Setting `ttId` to a value already in use is rejected — SUPERSEDED

**Status:** SUPERSEDED 2026-09-02 by
[`um-edit-04-duplicate-ttid-rejected-wholesale.md`](um-edit-04-duplicate-ttid-rejected-wholesale.md)
(Epic 1 Story 1.2 AD-1 stage-1 package). Do **not** translate, cite, or approve
this file. ID `um-pf-04` is retired **in place** (ID-stability rule,
[../../README.md](../../README.md)).

## Why

The successor keeps the original `409`-on-conflict / row-unchanged assertion and
**adds** the wholesale-rollback assertion and an explicit `null`-vs-`null`
negative (two rows both holding `ttId: null` is not a conflict).

## Stage-2 note

The `describe('um-pf-04 …')` block in `profile-v15.e2e-spec.ts` is re-pointed at
`um-edit-04` when the `um-edit-*` set is approved. No code or E2E changed by this
doc.
