---
id: SPEC-access-control-test-cases
companions:
  - ../../../docs/test-cases/access-control/README.md
  - ../../../docs/architecture/access-control.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. The README companion indexes the 202 scenario files that carry the request-level assertions.

# Access-Control Test-Case Suite

## Why

A mandate to meet: access-control correctness is the project's primary quality attribute (§7) and any leak is a critical defect (§3.3.1); the Definition of Done (§9) demands tests per audience, per relationship path and per section, with named negatives. The team's own quality gate (AD-1) requires an approved prose scenario per feature before any E2E test or production code exists. This suite is that stage-1 artifact for the entire access-control surface — misunderstandings get caught in prose, the cheapest stage.

## Capabilities

- **CAP-1** Tier derivation scenarios
  - **intent:** Every §2.1 relationship path that yields or revokes an access tier is specified as a runnable scenario.
  - **success:** `tier-derivation/` holds one file each for Self, Colleague, direct, transitive, PM, DM, compound chain, PP, HR-line-above-PP, per-target evaluation in one session, and both revocation paths (project end, edge removal); each translates to a red E2E without extra context.
- **CAP-2** Matrix cell scenarios
  - **intent:** Every §3.2 cell for Self / Manager line / PP / Colleague is asserted per action, including flag-gated records and field-level rules.
  - **success:** One file per cell **per read/write action** under `matrix/sNN-*/` (148 files); negative files exist for every `—` cell (read and write paths separately); unflagged S7 is tested against both the employee and a PM; S16 covers all three visibility levels; HR Admin covered in `matrix/hr-admin/`.
- **CAP-3** Functional-role scenarios
  - **intent:** Every §2.3 bullet — runtime extensibility, UI assignment, granular independent permissions, immediate revocation, no data-widening, AR non-extensibility — plus the 401/403/success decomposition of role management is specified.
  - **success:** `users/roles/` UR-01..12 map onto the §2.3 requirements; UR-01/02/03 decompose role creation by auth state; UR-11 proves a permission-holding role still sees the colleague view.
- **CAP-4** Shared-link scenarios
  - **intent:** Every §4.8 rule — per-section selection, never-shareable set, sensitive defaults, expiry, revocation, logging, read-only, creator authorization — is specified.
  - **success:** `shared-link/` SL-01..12; SL-02 also covers the S14 `—` cell of the shared-link column; SL-12 covers unauthenticated creation.
- **CAP-7** Authentication scenarios
  - **intent:** Every endpoint family rejects missing or invalid credentials before any access-tier reasoning applies.
  - **success:** 401 scenarios exist per endpoint family (`matrix/au-01..03`, `users/roles` UR-01, SL-12, SF-07/08) and the README states the global 401 rule stage 2 applies to each real route.
- **CAP-5** Fail-closed scenarios
  - **intent:** Missing or orphaned data yields less access, never more, and no power derives from data shape (AD-11/12).
  - **success:** `fail-closed/` FC-01..03: empty reportsTo, orphaned policy row, bootstrap admin as ordinary revocable FR.
- **CAP-6** Cross-surface leak scenarios
  - **intent:** No forbidden data escapes through any surface: list, export, filters, inline edit, direct requests, error responses (§3.3.1, §3.3.3, §3.3.5).
  - **success:** `surfaces/` SF-01..06, incl. whitelist set-equality (SF-01) and indistinguishable 404s for hidden vs nonexistent sections (SF-06).

## Constraints

- One test case per file, written as an explicit request spec: `inputURL`, `inputRequest` (headers with `authorization`, body), `expectedResult` with HTTP status. Read and write are separate files; multiple `Test N` blocks are allowed only as probes of the same single requirement.
- Assertions are API-level only (§3.3.4); "not visible" means the key is absent from the payload, never null or empty.
- Denial convention: missing/invalid token `401`; valid token without feature permission `403`; write to a readable section `403`; anything touching a `—` cell `404` with a leak-free body.
- Every file carries a trace line to a requirements § and/or AD-n; a scenario without a trace is invalid.
- All files share the README's canonical persona fixture, the `Bearer <token:persona>` convention, and placeholder endpoint vocabulary (resource root `/users`, role management `/users/roles`); stage-2 binds them to real routes.
- Path × section cross-product is not enumerated: paths are proven in TD-*, sections per audience in matrix-*, justified by the single-resolver design (AD-10); matrix files vary manager personas to spread path coverage.

## Non-goals

- Performance testing of permission resolution (§7 2-second NFR) — separate work.
- Notifications (§4.13) and analytics (§4.14) — out of scope for this iteration.
- UI rendering/hiding behavior — the API contract is the whole assertion surface.
- Feature-workflow tests for resourcing, CDS, campaigns, mentorship beyond their access boundaries.
- E2E test code itself — this suite is stage 1; stage 2 starts only after per-file developer approval.

## Success signal

A reviewer can map every §3.2 cell, every §2.1 path, and every §9-named negative (each `—` cell, unflagged S7 vs employee and PM, colleague whitelist) to exactly one approved file; a stage-2 author picks any file and writes its red E2E without opening another document.

## Assumptions

- S1's derived subfields (manager, PP, mentor, current projects) are read-only for all audiences; the Manager-line RW cell applies to directly stored identity fields.
- S10/S11 `R` cells mean no write path for any audience — the data is owned by the timetracker sync.
- The shared-link viewer is modeled as an authenticated employee without Manager/PP relation to the target (the §4.7 DM-candidate case).
- TD-13 (department-manager tier) follows the architecture spine's Departments extension, which is not in the requirements doc — marked provisional, not for E2E translation yet.
- S16 visibility levels grant read only; writes remain Manager/PP regardless of level.

## Open Questions

- OQ1: Can a user hold a project (and its people) without being manager/PP — the info-sec training case? (Already open in the architecture memlog; answer expected ~2026-08-20; may add tier scenarios.)
- OQ2: Does opening a shared link require authentication, or is the token bearer-access?
- OQ3: §3.1 gives HR Admin full data access while §2.3 says a functional role never widens data access — what is the sanctioned mechanism? (Behavior is asserted in `matrix/hr-admin-full-access.md`; mechanism is the architect's call.)
- OQ4: Departments as a resource level above projects — confirmed by the requirements owner? (Gates TD-13.)
- OQ5: §3.2 gives the whole Manager line RW on S9, but §4.9 names only "PP and UM" for manual timeline overrides — may a DM/PM edit timeline events?
- OQ6: §4.8 never-shareable list omits S14 though the matrix marks it `—` for shared links — SL-02 follows the matrix; confirm.
