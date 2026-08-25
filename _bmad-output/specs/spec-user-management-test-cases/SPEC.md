---
id: SPEC-user-management-test-cases
companions:
  - ../../../docs/test-cases/user-management/README.md
  - ../../../docs/architecture/database-schema.md
sources:
  - ../../planning-artifacts/prds/prd-user-management-2026-08-20/prd.md
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. The README companion indexes the **45** scenario files that carry the request-level assertions.

# User-Management Test-Case Suite

## Why

A mandate to meet: AD-1's three-stage quality gate requires an approved prose scenario per feature before any E2E test or production code exists. `user-management` is the first domain to go through the full PRD → architecture → test-cases pipeline (access-control skipped the PRD step, its scope was already fully NORMATIVE). This suite is that stage-1 artifact for the `User` entity's own lifecycle and workflow correctness — registration, magic-link auth, profile-field CRUD, deactivation, and the career-timeline event log — deliberately excluding the access-control dimension (who is entitled), which `docs/test-cases/access-control/` already owns in full.

## Capabilities

- **CAP-1** Registration
  - **intent:** HR Admin creates a `User` on a new hire's behalf; the record is created with no credential stored, completing registration never establishes a session directly, and neither an invalid payload nor a duplicate identity value can produce a row.
  - **success:** `registration/` UM-REG-01..12 pass without opening another document: success with server-set audit columns and `customFields: {}`, `401` unauthenticated, `403` for a functional-role holder lacking the user-creation permission (Ida), exact duplicate `workEmail`, no-session-on-create asserted on body *and* headers with exactly one email dispatch, missing non-nullable field, duplicate `ttId`, concurrent duplicate `workEmail` resolving to one row, malformed `workEmail`, server-owned fields rejected with `400`, normalized-email uniqueness, rehire identity preservation, and graceful dispatch failure after durable create.
- **CAP-2** Magic-link authentication
  - **intent:** A user requests a magic link by `workEmail` and consumes the resulting one-time token to establish a session, replacing password auth ahead of SSO.
  - **success:** `auth/` UM-AUTH-01..06: known-email request, enumeration-safe unknown-email request, successful consume, expired-token denial, single-use replay denial, deactivated-user denial.
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
  - **intent:** Assigned PP and direct UM can manually add backfill entries and correct wrongly-inferred ones; a correction is never an in-place edit. Full Manager line and PP may read per DEC-UM-001.
  - **success:** `career-timeline/` UM-CT-03..07 cover PP add, direct UM add, PP correction (explicit soft-delete-then-append-then-observe sequence), UM delete, and the absence-not-null assertion on a deleted entry's read.
- **CAP-7** Employee list (Story 1.5)
  - **intent:** An entitled actor lists employees with pagination and S1-field filters; deactivated users are excluded from active-only views.
  - **success:** `list/` UM-LIST-01..04 cover pagination metadata, single filter, compound filters, and inactive filter.
- **CAP-8** Organizational relationships (Epic 4)
  - **intent:** HR Admin assigns/revokes reports-to and pairs/unpairs mentorship; relationship mutations fire the correct system `UserEvents` where applicable.
  - **success:** `relationships/` UM-REL-01..08 cover reports-to assign/revoke/409-on-second-post, mentorship pair/unpair/events, multiple mentors, permission denial, and concurrent reports-to assign.

## Constraints

- RBAC is explicitly out of scope: actors in every file are drawn from personas access-control's suite already proves entitled. These scenarios assert workflow/data correctness given an entitled actor, never who is entitled. The one exception is the registration denial case, which probes permission *granularity* on this endpoint (a role-holder lacking this permission) rather than re-deriving the access matrix.
- One requirement per file, enforced strictly. Where a file probes one requirement from several angles it may carry several `Test N` blocks, but a second requirement is a second file — a present-but-invalid field is not an absent one, and a concurrent duplicate is not a sequential one.
- `UserEvents`' immutable-fact model is asserted literally: a correction is shown as explicit steps — soft-delete the wrong entry, append the corrected one, then a read that observes both — never a single in-place PATCH.
- Every file carries a trace line to a requirements §, a PRD FR-n, and/or an AD-n; a scenario without a trace is invalid. "PRD FR-n" means FR-1..FR-4 — the only numbered FRs the PRD defines. FR-5..FR-16 exist solely in `epics.md` as derived requirements, so a scenario cites their underlying source (`database-schema.md`, an AD, a requirements §) rather than the derived number.
- Endpoints are bound to the canonical router-tree convention (resource root `/users`, auth root `/auth`) — `docs/architecture/api-conventions.md` (spine AD-14), not placeholder vocabulary. Personas and the `Bearer <token:persona>` convention are shared with `docs/test-cases/access-control/README.md` so relationships stay consistent across both suites.
- The `User` entity's own field surface is the ceiling for this suite's request/response bodies — no S2/S3/S4/S5 field appears anywhere, matching the PRD's deliberate decision to keep `User` thin and split employment/contacts/documents into their own future tables/contexts.
- Every write request body carries the full set of non-nullable `User` columns, so a negative case can only fail for the condition under test. A partial body lets a validation error stand in for the intended status and the case passes for the wrong reason — the defect that made the original duplicate-`workEmail` case unable to reach its asserted `409`.
- **A scenario asserts only through endpoints its own story builds.** A registration scenario therefore asserts through `POST /users` alone: `GET /users/:id` and `PATCH /users/:id` are Story 1.2, `DELETE /users/:id` is Story 1.4, and `GET /users` with filters is Story 1.5. Absence and persistence are asserted against the datastore in stage 2 instead. Observing through another story's endpoint would make this story's stage-2 suite unrunnable until that story lands, inverting the dependency order the epic set out.
- Session-absence is asserted on response headers as well as body. `Set-Cookie` cannot appear in a body, so a body-only check would miss a cookie-based session entirely.
- **Normative product/test decisions** live in [user-management-test-decisions.md](../../../docs/architecture/user-management-test-decisions.md) (DEC-UM-001..011). Scenarios trace those decisions where requirements text alone is insufficient.
- **Gate E2E isolation** follows DEC-UM-010: one test worker + UUID-owned data initially; schema-per-worker before parallel workers. Concurrency scenarios use parallel HTTP inside one test.
- **Registration dispatch durability (DEC-UM-008):** creation returns `201` even when downstream email transport fails after durable dispatch intent is stored; the User and `joined_company` event survive.
- **Deactivation authorization (DEC-UM-002):** gated by AccessControl feature capability, not role-name checks in domain code.
- **Magic-link security (DEC-UM-004):** enumeration-safe request response, zero dispatch for unknown email, configurable TTL with controllable clock in tests, single-use tokens.
- **Reports-to reassignment (DEC-UM-005):** explicit DELETE then POST; second POST while direct edge exists returns `409`.
- **`customFields` (DEC-UM-003):** database default `{}`; registration omits the field.
- **Server-owned create fields (DEC-UM-006):** client-supplied `id`, `createdAt`, or `createdBy` → `400`.
- **`workEmail` normalization (DEC-UM-007):** trim + lowercase before validation, storage, lookup, and uniqueness.
- **Rehire (DEC-UM-009):** no second User for normalized email; reactivation preserves identity.

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

- Of `UserEvents`' 8 documented tracked types (§4.9), only `joined_company` and `position_change` are **automatically triggerable from User/profile mutations today** — the User entity has no `grade`, `department`, or `employmentType` field, and mentorship/leave live in contexts that don't exist yet. **`mentorship_start`/`mentorship_end` are triggerable from Epic 4 relationship attach/detach** (`um-rel-04`/`05`), distinct from manual backfill (`um-ct-03`, DEC-UM-011).
- Nullable columns a create omits (`photo`, `workPhone`, `birthDate`, `ttId`) come back present-and-`null` for an entitled viewer. The suite's absence-is-absence rule governs audience filtering — a field hidden from this viewer — not a field that is genuinely empty for everyone.

## Open Questions

None for the approved decision set (DEC-UM-001..011). Reopen through architecture change control if product direction shifts.

**Upstream drift (maintenance, not open product questions):** `epics.md` Story 1.1 AC count should stay aligned with the registration folder; Story 4.1 no longer treats reports-to reassignment as undecided.
