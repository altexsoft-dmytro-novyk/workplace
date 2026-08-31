# User Management — `seed/` (Story 1.1: Import Seeded Population)

Stage-1 scenario documents (AD-1) for **Epic 1 Story 1.1 — Import Seeded Population**.
These replace the retired `registration/` suite: v1.5 has **no `POST /users` HTTP
create path** (AD-14 / AD-16 / §4.17). The population is a seeded/imported set.

**Status:** unapproved draft (v1.5 refresh, 2026-09-01). Per-file human approval
under the AD-1 stage-1 gate is still required; no `approvals.yaml` records any of
these yet.

## What these prove

| File | Proves | Trace |
| --- | --- | --- |
| `um-seed-01-import-success.md` | Fresh DB → population import → one `User` row per seeded employee with S1 fields; `workEmail`/`ttId` unique; `workEmail` **stored normalized** (DEC-UM-007 canonical-at-write); one `joined_company` system `UserEvents` per imported row. | FR-1, FR-4, FR-5a, FR-7 · DEC-UM-007 · DEC-UM-003 · AD-11 |
| `um-seed-02-no-post-users-create-path.md` | `POST /users` is absent or permanently rejected — there is no product create capability. | FR-4 · §4.17 · AD-14 / AD-16 |
| `um-seed-03-bootstrap-hr-admin-and-root-id-reuse.md` | Exactly one bootstrap `User` holds the `hr-admin` FR policy (proof owned by AC `fc-03` — referenced, not duplicated); an import covering the root person **reuses the ACM-0 root `User` id**, never a second row for an existing normalized email. | ACM-0 · DEC-UM-007 · DEC-UM-009 · AD-12 |

## Deployment order (binding)

`npm run db:deploy` → `npm run db:seed` (ACM-0 root `User`) →
`npm run db:bootstrap:access-control` (ACM-1 FR policy + grant + root attachment) →
population import (Story 1.1) → `npm run start:prod`.

## Not an HTTP suite

Story 1.1's subject is the population import writer, not a request handler.
`um-seed-01` and `um-seed-03` assert **database row-level state** after the
writer runs — there is no response body. The exact batch transport / operator
endpoint is an explicit follow-up contract (AD-16) that gets its own AD-1
scenario before import implementation begins; these scenarios do not presume
one. `um-seed-02` is the one HTTP assertion (the absence of `POST /users`).

## Bootstrap entitlement is not re-proved here

That exactly one bootstrap `User` is an ordinary, revocable FR-policy holder —
not a hard-coded superuser — is Access Control's `fc-03` /
`docs/test-cases/access-control/fail-closed/ac-fc-03-bootstrap-admin-revocable.md`.
`um-seed-03` references it and asserts only the seed/import side: the row exists,
and the import does not fork it.
