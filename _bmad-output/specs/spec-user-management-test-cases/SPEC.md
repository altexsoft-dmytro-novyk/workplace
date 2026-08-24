---
id: SPEC-user-management-test-cases
companions:
  - ../../../docs/test-cases/user-management/README.md
  - ../../../docs/architecture/database-schema.md
sources:
  - ../../planning-artifacts/prds/prd-user-management-2026-08-20/prd.md
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. The README companion indexes the 26 scenario files that carry the request-level assertions.

# User-Management Test-Case Suite

## Why

A mandate to meet: AD-1's three-stage quality gate requires an approved prose scenario per feature before any E2E test or production code exists. `user-management` is the first domain to go through the full PRD → architecture → test-cases pipeline (access-control skipped the PRD step, its scope was already fully NORMATIVE). This suite is that stage-1 artifact for the `User` entity's own lifecycle and workflow correctness — registration, magic-link auth, profile-field CRUD, deactivation, and the career-timeline event log — deliberately excluding the access-control dimension (who is entitled), which `docs/test-cases/access-control/` already owns in full.

## Capabilities

- **CAP-1** Registration
  - **intent:** HR Admin creates a `User` on a new hire's behalf; the record is created with no credential stored, completing registration never establishes a session directly, and neither an invalid payload nor a duplicate identity value can produce a row.
  - **success:** `registration/` UM-REG-01..07 pass without opening another document: success with server-set audit columns, `401` unauthenticated, `403` for a functional-role holder lacking the user-creation permission, duplicate `workEmail` (exact, case-variant, and deactivated-holder), no-session-on-create asserted on body *and* headers, `400` on an invalid payload, and duplicate `ttId` on create.
- **CAP-2** Magic-link authentication
  - **intent:** A user requests a magic link by `workEmail` and consumes the resulting one-time token to establish a session, replacing password auth ahead of SSO.
  - **success:** `auth/` UM-AUTH-01..05: known-email request, enumeration-safe unknown-email request, successful consume, expired-token denial, single-use replay denial.
- **CAP-3** Profile field CRUD
  - **intent:** A Manager-line edit to Alice's own S1 fields persists correctly; Self's photo upload persists; `workEmail`/`ttId` uniqueness holds on write.
  - **success:** `profile/` UM-PF-01..04 cover a successful Manager-line field edit (observed via a follow-up read), a successful Self photo upload, and both uniqueness-conflict paths.
- **CAP-4** Deactivation
  - **intent:** `isActive` soft-delete flips on request, the row survives, and the user drops out of active-only views.
  - **success:** `deactivation/` UM-DEACT-01..03: successful deactivation with row survival, exclusion from the active-only list, and the without-permission denial.
- **CAP-5** Career-timeline system-generation
  - **intent:** The system writes a `UserEvents` row automatically on a tracked change, with no request from any actor producing it directly.
  - **success:** `career-timeline/` UM-CT-01..02 prove `joined_company` on creation and `position_change` on a position edit — the only two of the eight documented types currently triggerable (see Assumptions).
- **CAP-6** Career-timeline manual mechanics
  - **intent:** PP and UM can manually add backfill entries and correct wrongly-inferred ones; a correction is never an in-place edit.
  - **success:** `career-timeline/` UM-CT-03..07 cover PP add, UM add, PP correction (explicit soft-delete-then-append-then-observe sequence), UM delete, and the absence-not-null assertion on a deleted entry's read.

## Constraints

- RBAC is explicitly out of scope: actors in every file are drawn from personas access-control's suite already proves entitled. These scenarios assert workflow/data correctness given an entitled actor, never who is entitled. The one exception is the registration denial case, which probes permission *granularity* on this endpoint (a role-holder lacking this permission) rather than re-deriving the access matrix.
- One test case per file; read/write and auth-state variants are split, following `docs/test-cases/README.md`'s granularity rules.
- `UserEvents`' immutable-fact model is asserted literally: a correction is shown as explicit steps — soft-delete the wrong entry, append the corrected one, then a read that observes both — never a single in-place PATCH.
- Every file carries a trace line to a requirements §, a PRD FR-n, and/or an AD-n; a scenario without a trace is invalid. "PRD FR-n" means FR-1..FR-4 — the only numbered FRs the PRD defines. FR-5..FR-16 exist solely in `epics.md` as derived requirements, so a scenario cites their underlying source (`database-schema.md`, an AD, a requirements §) rather than the derived number.
- Endpoints are bound to the canonical router-tree convention (resource root `/users`, auth root `/auth`) — `docs/architecture/api-conventions.md` (spine AD-14), not placeholder vocabulary. Personas and the `Bearer <token:persona>` convention are shared with `docs/test-cases/access-control/README.md` so relationships stay consistent across both suites.
- The `User` entity's own field surface is the ceiling for this suite's request/response bodies — no S2/S3/S4/S5 field appears anywhere, matching the PRD's deliberate decision to keep `User` thin and split employment/contacts/documents into their own future tables/contexts.
- Every write request body carries the full set of non-nullable `User` columns, so a negative case can only fail for the condition under test. A partial body lets a validation error stand in for the intended status and the case passes for the wrong reason — the defect that made the original duplicate-`workEmail` case unable to reach its asserted `409`.
- A negative case ends with a request observing absence or unchangedness. "No record created" is never asserted from the write response alone.
- Session-absence is asserted on response headers as well as body. `Set-Cookie` cannot appear in a body, so a body-only check would miss a cookie-based session entirely.
- `workEmail` is normalized on write (trimmed, lower-cased) and uniqueness is enforced on the normalized value; a case variant conflicts rather than creating a second account. Two rows sharing one address would leave FR-2 unable to name a single account for a magic link.
- `workEmail` and `ttId` uniqueness is absolute with respect to `isActive`. A deactivated user keeps their address and external id, because `isActive` is a soft delete that leaves the row in place; releasing an address would require an explicit reactivation or release flow, and none is specified.
- A failed magic-link dispatch never rolls back a registration: creation commits and returns `201`, with dispatch treated as best-effort plus retry or manual resend. Rolling back would leave HR unable to onboard during an email outage, against NFR-3's graceful-degradation requirement.

## Non-goals

- Access-matrix / permission testing for any section — entirely `docs/test-cases/access-control/`'s job.
- S2 (personal contacts), S3 (emergency contacts), S4 (employment), S5 (documents) section content — no schema exists yet; gated on the Profile bounded-context decision (architecture spine, Deferred).
- Six of `UserEvents`' eight documented types — `grade_change`, `department_change`, `employment_type_change`, `extended_leave`, `mentorship_start`, `mentorship_end` — reference fields/contexts with no schema yet in this PRD.
- Timetracker/PeopleForce sync-driven writes (AD-13) — future integration.
- Seed-script bootstrap behavior itself — not an HTTP-driven scenario; access-control's `fc-03` already covers the bootstrap admin being an ordinary revocable FR.
- E2E test code itself — this suite is stage 1; stage 2 starts only after per-file developer approval.

## Success signal

A reviewer can map each of CAP-1..6's sourced behaviors to exactly one approved file under `docs/test-cases/user-management/`; a stage-2 author picks any file and writes its red E2E without opening another document or re-deriving the access-control dimension.

## Assumptions

- Deactivation's actor is assumed to be HR Admin, by symmetry with registration — `isActive` is not one of S1's listed matrix fields, so no audience is directly sourced for it. Flagged for correction if wrong (`UM-DEACT-01`/`03`).
- Magic-link request for an unregistered email returns the same `200` as a known one (enumeration-safe); token expiry and single-use invalidation are asserted as reasonable defaults. None of this is sourced from `project-requirements.md` — own additions (`UM-AUTH-02`, `04`, `05`).
- Of `UserEvents`' 8 documented tracked types (§4.9), only `joined_company` and `position_change` are currently triggerable — the User entity has no `grade`, `department`, or `employmentType` field, and mentorship/leave live in contexts that don't exist yet. This extends the "reserved, unpopulated" treatment `database-schema.md` already gives `department_change`/`mentorship_start`/`mentorship_end` to `grade_change`/`employment_type_change`/`extended_leave` too, by the same logic.
- Manual `UserEvents` mutation actors are strictly PP and UM per §4.9's literal text, not the full Manager line implied by the §3.2 S9 matrix cell — mirrors the standing open question already tracked as OQ5 in `spec-access-control-test-cases/SPEC.md`; not re-litigated here.
- `workEmail` is the magic-link login identity — FR-2 already committed to it, and the PRD Data Model note that called this "pending confirmation" has been corrected.
- `customFields` defaults to `{}` on create. `database-schema.md` declares the column non-nullable but names no default, and no registration payload supplies it, so an empty object is the only workable value. `UM-REG-01` asserts it; flagged for confirmation against the migration.
- Nullable columns a create omits (`photo`, `workPhone`, `birthDate`, `ttId`) come back present-and-`null` for an entitled viewer. The suite's absence-is-absence rule governs audience filtering — a field hidden from this viewer — not a field that is genuinely empty for everyone.

## Open Questions

1. **Server-owned fields on create.** When a client supplies `id`, `isActive`, `createdAt`, or `createdBy` in a registration payload, does the endpoint silently strip them and return `201`, or reject the request with `400`? FR-4 fixes the *outcome* (records go straight to `isActive: true`, and audit columns are server-set) but not the mechanism, and the two produce different assertions. No scenario asserts this today; it needs a decision before one can.
2. **No scenario covers the dispatch-failure rule.** The rule is decided (Constraints: creation commits, `201` stands), but no file exercises it. It is a distinct requirement from UM-REG-05's no-session assertion, so folding it in would break the one-requirement-per-file rule — it needs its own file (`UM-REG-08`) or an `auth/` case.
3. **The suite states no fixture-isolation model.** `UM-REG-01`/`05`/`06`/`07` create rows and `UM-REG-04` deactivates Alice, so cases mutate shared seeded state. Whether the fixture resets between cases, between files, or not at all is nowhere written, yet correctness of the registration group now depends on it. Stage 2 cannot be relied on to guess consistently.
4. **Upstream drift.** `prd.md` carries no rule for `workEmail` normalization, deactivated-address reuse, or dispatch-failure behavior — all three were decided here. `epics.md` Story 1.1 still lists four registration acceptance criteria against seven scenarios, and its FR-6 claims `ttId` uniqueness at registration, which only became true with `UM-REG-07`. Both documents should be updated to match, in their own runs.
