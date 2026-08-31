# ACM-0 Stage 1 · Deploy-time root User prerequisite

## Trace

This scenario dispatch is governed by:

- [SPEC CAP-8 — Deploy-time root User prerequisite](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities)
- [Architecture spine AD-1 and AD-4](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md)
- [FR-AMD-1 Seed Contract](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md#seed-contract)
- [DEC-UM-007 — workEmail normalization](../../../architecture/user-management-test-decisions.md#dec-um-007--workemail-normalization-oq2)
- [Testing Strategy — AD-1 and deploy-time entrypoints](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp)

The subject is `services/backend/prisma/seed.ts`, invoked only through
`npm run db:seed` against migrated PostgreSQL. It creates and validates the
CAP-8 root User; no unnamed User Management prerequisite exists.

For every scenario, normalization means trimming outer whitespace and
lowercasing before validation, lookup, comparison, or storage. Eligibility is
scoped only to Users whose normalized `workEmail` equals normalized
`ROOT_WORK_EMAIL`; unrelated employees never contribute to that count.

## ACM0-RU-01 · Fresh deployment creates one canonically stored active root User

**Given** a freshly migrated database with no User rows, and
`ROOT_WORK_EMAIL="  Root.Admin@Company.Example  "`.

**When** `npm run db:seed` completes.

**Then** the database contains exactly one User eligible as the root:

- its stored `workEmail` is exactly `root.admin@company.example`;
- its stored value contains no outer whitespace or uppercase characters;
- its normalized `workEmail` equals normalized `ROOT_WORK_EMAIL`;
- it is active; and
- no second User has that normalized identity.

The raw configured value is never stored. Successful creation is followed by
the same normalized exact-one eligibility validation used for a rerun.

## ACM0-RU-02 · Unrelated active employees do not affect root eligibility

**Given** the database contains one active root User with canonical
`workEmail="root.admin@company.example"` and several other active employees
whose normalized work emails differ, and
`ROOT_WORK_EMAIL=" ROOT.ADMIN@COMPANY.EXAMPLE "`.

**When** `npm run db:seed` completes.

**Then** the existing root User remains the single eligible normalized match,
retains the same id and existing data, and remains active.

The unrelated active employees are neither counted as root candidates nor
modified. The number of active Users in the database is irrelevant; only the
exact-one normalized root match determines eligibility.

## ACM0-RU-03 · Blank root configuration fails before database mutation

**Given** `ROOT_WORK_EMAIL` is absent, empty, or contains only whitespace.

**When** `npm run db:seed` runs.

**Then** the command exits nonzero before creating or changing a User.

The diagnostic identifies `ROOT_WORK_EMAIL`, states that its value is blank
after trimming, and tells the operator to configure a nonblank work email. A
warning followed by a successful skip does not satisfy this scenario.

## ACM0-RU-04 · An unmatched configured identity fails without fallback adoption

**Given** an initialized database contains Users, including active employees
and an employee whose position is `HR Admin`, but no User's normalized
`workEmail` equals normalized `ROOT_WORK_EMAIL`.

**When** `npm run db:seed` runs.

**Then** the command exits nonzero with an `unmatched root identity` diagnostic.

The diagnostic includes the normalized configured email, reports a
normalized-match count of zero, and directs the operator to correct the
configuration or database identity. The seed does not select the first User,
select by position, rewrite another User's email, or otherwise adopt an
unrelated employee as the root. All existing Users remain unchanged.

## ACM0-RU-05 · All normalized matches are counted before active state

**Given** `ROOT_WORK_EMAIL="root.admin@company.example"` and the database
contains two Users whose stored emails differ only in case:

- one active User with `workEmail="root.admin@company.example"`; and
- one inactive User with `workEmail="ROOT.ADMIN@COMPANY.EXAMPLE"`.

**When** `npm run db:seed` runs.

**Then** normalization finds two matches and the command exits nonzero as
`ambiguous root identity`.

The seed reports the normalized email and match count of two before consulting
either row's `isActive` value. It does not discard the inactive match to
manufacture a single eligible active User, choose either row, canonicalize
either stored email, or reactivate the inactive row.

The diagnostic identifies the conflicting row ids and active states and directs
the operator to reconcile the duplicate normalized identities manually.

## ACM0-RU-06 · A single inactive normalized match is rejected, not reactivated

**Given** exactly one User's normalized `workEmail` equals normalized
`ROOT_WORK_EMAIL`, and that User has `isActive=false`.

**When** `npm run db:seed` runs.

**Then** the exact-one count succeeds first, the subsequent active-state check
fails, and the command exits nonzero as `inactive root identity`.

The diagnostic includes the normalized email, matched User id, and inactive
state, and explains that automatic reactivation is prohibited. The matched
User's email, profile, id, and active state remain unchanged.

## ACM0-RU-07 · Concurrent fresh-deployment seeds converge on one root User

**Given** a freshly migrated database and two concurrent `npm run db:seed`
processes configured with values that normalize to the same root email.

**When** both processes attempt the CAP-8 root creation.

**Then** one process creates the canonically stored active root User. If the
other loses the insert race on `users_workEmail_key`, it handles that specific
unique violation by re-reading all normalized matches and repeating the
exact-one and active-state validation.

Both processes converge successfully on the same User id. The final database
contains exactly one active root User with the normalized email and no partially
created alternative row. A race-related unique violation is not treated as
proof of success without the required re-read and re-validation.

Unexpected database errors, or a re-read producing zero, multiple, or inactive
matches, still cause a nonzero exit with the corresponding actionable
diagnostic.
