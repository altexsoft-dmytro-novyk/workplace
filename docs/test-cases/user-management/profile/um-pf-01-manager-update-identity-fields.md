# UM-PF-01 · Manager-line edit to identity fields persists — SUPERSEDED

**Status:** SUPERSEDED 2026-09-02 by the `um-edit-*` set in this folder (Epic 1
Story 1.2 AD-1 stage-1 scenario package). Do **not** translate, cite, or approve
this file. Its ID `um-pf-01` is retired **in place** — never reused, never
renumbered (ID-stability rule, [../../README.md](../../README.md)).

## Why

The single "a manager edit persists and reflects on a read" case did not cover
the Story 1.2 contract surface once `GET /users/:id` returns the CAP-3
`{ data, canEdit }` envelope and the edit path acquired explicit
partial-merge / wholesale-reject / DTO-rejection rules. The successor set:

| Successor | Covers |
| --- | --- |
| [`um-edit-01-entitled-actor-edits-identity-fields.md`](um-edit-01-entitled-actor-edits-identity-fields.md) | the original UM-PF-01 case — entitled actor edits S1 scalars, partial merge, follow-up `GET` reflects it in the `{ data, canEdit }` envelope |
| [`um-edit-02-workemail-normalized-before-uniqueness-check.md`](um-edit-02-workemail-normalized-before-uniqueness-check.md) | DEC-UM-007 normalization on the edit path, before the uniqueness check |
| [`um-edit-05-org-fields-in-body-rejected.md`](um-edit-05-org-fields-in-body-rejected.md) | §3.2 fn 1 — manager / PP / department in the body → `400` |
| [`um-edit-06-forbidden-technical-fields-rejected.md`](um-edit-06-forbidden-technical-fields-rejected.md) | `photo` / `isActive` / `employmentStatus` / `customFields` → `400` |
| [`um-edit-07-empty-or-no-op-patch.md`](um-edit-07-empty-or-no-op-patch.md) | empty / no-op body → `200` |
| [`um-edit-08-birthday-pair-both-or-neither.md`](um-edit-08-birthday-pair-both-or-neither.md) | `birthDay` / `birthMonth` pair invariant on edit |

## Stage-2 note

`services/backend/test/user-management/epic-1/profile-v15.e2e-spec.ts` has a
`describe('um-pf-01 …')` block. When the `um-edit-*` set is approved, that block
is re-pointed at `um-edit-01` and the rest of the set is added as new
`describe`s. No production code or E2E is changed by this doc.
