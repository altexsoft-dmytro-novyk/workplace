---
id: SPEC-user-management-test-cases
companions:
  - ../../../docs/test-cases/user-management/README.md
  - ../../../docs/architecture/database-schema.md
sources:
  - ../../planning-artifacts/prds/prd-user-management-2026-08-20/prd.md
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. The README companion indexes the 24 scenario files that carry the request-level assertions.

# User-Management Test-Case Suite

## Why

A mandate to meet: AD-1's three-stage quality gate requires an approved prose scenario per feature before any E2E test or production code exists. `user-management` is the first domain to go through the full PRD → architecture → test-cases pipeline (access-control skipped the PRD step, its scope was already fully NORMATIVE). This suite is that stage-1 artifact for the `User` entity's own lifecycle and workflow correctness — registration, magic-link auth, profile-field CRUD, deactivation, and the career-timeline event log — deliberately excluding the access-control dimension (who is entitled), which `docs/test-cases/access-control/` already owns in full.

## Capabilities

- **CAP-1** Registration
  - **intent:** HR Admin creates a `User` on a new hire's behalf; the record is created with no credential stored, and completing registration never establishes a session directly.
  - **success:** `registration/` UM-REG-01..05: success, 401, 403, duplicate-`workEmail` conflict, and the no-session-on-create assertion all pass without opening another document.
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

- RBAC is explicitly out of scope: actors in every file are drawn from personas access-control's suite already proves entitled. These scenarios assert workflow/data correctness given an entitled actor, never who is entitled.
- One test case per file; read/write and auth-state variants are split, following `docs/test-cases/README.md`'s granularity rules.
- `UserEvents`' immutable-fact model is asserted literally: a correction is shown as explicit steps — soft-delete the wrong entry, append the corrected one, then a read that observes both — never a single in-place PATCH.
- Every file carries a trace line to a requirements §, a PRD FR-n, and/or an AD-n; a scenario without a trace is invalid.
- Endpoints are bound to the canonical router-tree convention (resource root `/users`, auth root `/auth`) — `docs/architecture/api-conventions.md` (spine AD-14), not placeholder vocabulary. Personas and the `Bearer <token:persona>` convention are shared with `docs/test-cases/access-control/README.md` so relationships stay consistent across both suites.
- The `User` entity's own field surface is the ceiling for this suite's request/response bodies — no S2/S3/S4/S5 field appears anywhere, matching the PRD's deliberate decision to keep `User` thin and split employment/contacts/documents into their own future tables/contexts.

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
- `workEmail` is treated as the magic-link login identity (confirmed by the user this run) — FR-2 already committed to it; the PRD's Data Model note calling this "pending confirmation" is stale and is being corrected in `prd.md` as part of this update.

## Open Questions

None outstanding for this suite. FR-4 (registration actor) and the `workEmail`-as-login-identity status — the two items that were open — were resolved this run; see Assumptions and the PRD update.
