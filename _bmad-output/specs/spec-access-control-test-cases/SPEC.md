---
id: SPEC-access-control-test-cases
companions:
  - ../spec-access-control-facade-audience-resolution/facade-contract.md
  - ../../../docs/architecture/access-control.md
  - ../../implementation-artifacts/access-control/deferred-work.md
sources: []
---

> **RETIRED 2026-09-04.** The suite this SPEC governed — the 171 Phase-1 draft
> scenarios under `docs/test-cases/access-control/` — was deleted. None had an
> AD-1 approval and none was referenced by any test. The generators
> (`_generate_matrix.py`, `_generate_hand.py`) were deleted with it. This file is
> kept as the record of what was authored and why, not as an active contract.

> **Historical contract (superseded).** The text below describes the retired 171-file suite.
> Active access-control scenarios live under `docs/test-cases/access-control-foundation/` (9 scenario documents)
> and `docs/test-cases/access-control-kernel/` (90 scenario documents), for 99 scenario documents;
> the two README files bring the raw Markdown count to 101. Per-file AD-1 approval between stages
> was removed 2026-09-04 (`docs/architecture/testing-strategy.md:25–38`).

# Access-Control Test-Case Suite (Phase 1)

## Why

A mandate to meet: access-control correctness is the project's primary quality attribute (§7) and any leak is a critical defect (§3.3.1); the Definition of Done (§9) demands tests per audience, per relationship path, and per section, with named negatives. AD-1 requires an approved prose scenario per feature before any E2E test or production code exists. The facade spec (`spec-access-control-facade-audience-resolution`) blocks implementation until this suite exists — but the prior contract indexed 202 withdrawn pre-v1.5 files that merged Reporting and Project into one "Manager line." This spec is the refreshed v1.5 stage-1 contract aligned to the facade's Phase 1 gates.

## Capabilities

- **CAP-1** Phase 1 audience derivation
  - **intent:** Every Self, Reporting line, PP, and Colleague resolution path — and every Phase 1 gate negative from `facade-contract.md` — is specified as a runnable scenario.
  - **success:** `audience-derivation/` holds one file each for Self exclusivity, recursive direct Reporting, direct-PP-only, Colleague fallback, empty bulk, broken reports-to edge, orphan policy, Project withheld (PM with no other relation), no cross-kind inheritance (reports-to manager of a DM), Department policy contributing nothing, PP HR-line withheld, and each AD-20 departure position; each translates to a red E2E without extra context.
- **CAP-2** Phase 1 matrix cell scenarios
  - **intent:** Every §3.2 cell for Self, Reporting line, PP, and Colleague is asserted per read/write action, including flag-gated S7/S8 records and S16 visibility levels; Project line positives stay gated.
  - **success:** Under `matrix/`, one read and one write file per applicable cell for `self/`, `reporting-line/`, `pp/`, and `colleague/`; Self §3.3/§4.3 write exceptions (S5 certificate upload, S12 IDP complete, S13 mentorship flag, S14 mark-complete) have dedicated allow + deny files; negative files exist for every `—` cell (read and write paths separately); `project-line-gate/` holds Phase 1 withhold negatives; unflagged S7 is tested against both the employee and a Reporting-line manager; S16 covers all three visibility levels for Phase 1 audiences; matrix assertions bind concrete payload fields — no stage-2 shape deferrals.
- **CAP-3** Functional-permission boundary
  - **intent:** The FR dimension is proven separate from audience resolution — dual gate, FR-without-audience denial, bootstrap admin ordinariness — without re-specifying the full role-catalog UI.
  - **success:** `functional-permission/` covers: `isAllowed` true with no target audience still yields section `404`; matrix write without feature permission yields `403`; bootstrap HR Admin is an ordinary revocable FR (cross-ref `fail-closed/fc-03`). Full role-management UR scenarios belong to the deferred FR-catalog dispatch.
- **CAP-5** Fail-closed scenarios
  - **intent:** Missing or orphaned data yields less access, never more, and no power derives from data shape (AD-11/12).
  - **success:** `fail-closed/` FC-01..03: empty reportsTo (TopLee denial), orphaned policy row (live-grant baseline then orphan denial — sole project-line positive exception), bootstrap admin as ordinary revocable FR.
- **CAP-7** Authentication scenarios
  - **intent:** Representative endpoint families reject missing or invalid credentials before any access-tier reasoning applies.
  - **success:** `auth/` holds per-family 401 scenarios for profile read, section read, and section write; the README states the global 401 rule that stage 2 applies to each real route.

## Constraints

- One test case per file, written as an explicit request spec: `inputURL`, `inputRequest` (headers with `authorization`, body), `expectedResult` with HTTP status. Read and write are separate files; multiple `Test N` blocks are allowed only as probes of the same single requirement or its cause→effect sequence.
- Assertions are API-level only (§3.3.4); "not visible" means the key is absent from the payload, never null or empty.
- Denial convention: missing/invalid token `401`; valid token without feature permission `403`; write to a readable section `403`; anything touching a `—` cell `404` with a leak-free body.
- Every file carries a trace line to a requirements § and/or AD-n; a scenario without a trace is invalid. Expected results bind HTTP status and concrete payload keys — AD-1 reviewers must be able to approve without stage-2 deferrals.
- All files share the README's canonical persona fixture, the `Bearer <token:persona>` convention, and the canonical router-tree convention (resource root `/users`, role/permission catalog top-level `/roles`) — `docs/architecture/api-conventions.md` (spine AD-14), not placeholder vocabulary.
- Phase 1 scope is binding: Reporting line walks only `Relationship type='direct'`; PP resolves only the directly assigned endpoint; Project, Department, and PP HR-line contribute **no audience** until their contracts and AD-1 suites are approved — positives for those paths are out of scope; withhold negatives are in scope under `audience-derivation/` and `matrix/project-line-gate/`.
- Reporting line and Project line are **separate** matrix columns and graph passes — never merge PM/DM project reach into Reporting-line scenarios.
- Path × section cross-product is not enumerated: relationship paths are proven in `audience-derivation/`, sections per audience in `matrix/`; composition is guaranteed by the single-resolver design (AD-10).

## Non-goals

- **CAP-4 (retired ID):** Shared-link scenarios (§4.8) — deferred to the separate shared-link dispatch in `deferred-work.md`; OQ2 is decided (auth required) but scenarios are not in this suite.
- **CAP-6 (retired ID):** Cross-surface leak scenarios (list, export, filter, inline edit) — deferred to Profile Projection and list/filter/export projection specs; the facade's base section decision is the assertion surface here.
- Performance testing of permission resolution (§7 2-second NFR) — separate work.
- Notifications (§4.13) and analytics (§4.14).
- UI rendering/hiding behavior — the API contract is the whole assertion surface.
- HR Admin as a data-access audience or `matrix/hr-admin/` full-profile scenarios — v1.5 makes HR Admin configuration-only (§2.2); full-profile overlay is a separate §2.4 grant, product-blocked.
- Functional-role catalog management UI/API (`users/roles/` UR suite) — deferred FR-catalog dispatch.
- Project-line **positive** matrix cells and timetracker sync behavior — gated on the approved assignment/freshness contract.
- Department-walk positives and PP HR-line propagation positives — gated on the Department contract.
- E2E test code itself — this suite is stage 1; stage 2 starts only after per-file developer approval.

## Success signal

When authored and AD-1 approved, a reviewer can map every Phase 1 §3.2 cell (Self, Reporting line, PP, Colleague), every Phase 1 gate row in `facade-contract.md`, and every §9-named negative (each `—` cell, unflagged S7 vs employee and Reporting-line manager, colleague whitelist via matrix colleague files) to exactly one approved file; a stage-2 author picks any file and writes its red E2E without opening another document.

## Assumptions

- S1's derived subfields (manager, PP, mentor, current projects) are read-only for all audiences; Reporting-line and Project-line RW cells apply to directly stored identity fields only (once Project line is enabled).
- S10/S11 `R` cells mean no write path for any audience — the data is owned by the timetracker sync.
- DEC-UM-001 limits S9 **manual** writes to assigned PP and direct UM; Reporting-line and Project-line actors may appear in S9 **read** scenarios; write scenarios use Bob or Paula only.
- Self write exceptions (§3.2 footnotes + §4.3): S5 certificate upload, S12 own IDP completion, S13 own mentorship flag, S14 own action-item completion — each proven separately from broader mutation denials.
- S7/S8 record flags filter within allowed sections: employee sees only flagged records; unflagged/private records are absent.
- Colleague S10/S11 projections are dates-only and project-name-only respectively — forbidden fields must be absent, not null.
- Never-shareable overlay set (deferred shared-link suite): **{S3, S7, S13, S14}**; S1 default-on; all cfg sections default-off; sensitive sections require explicit re-enablement per link.
- HR Admin (Root) holds configuration FR only — profile scenarios without a relationship-derived audience follow Colleague or denial rules, not blanket full access.

## Open Questions

- OQ2: Which §3.2 column(s) does full-profile access equate to, and how does the overlay interact with Self? Blocks `full-profile/` scenarios.
- OQ3 (implementation open): Nested Department membership representation, indexed department traversal plan, and event/state sync details — **fixed v1.5 behavior:** department management is a Reporting-line relation; PP HR-line propagates within the HR boundary once the Department contract is approved.
- OQ4 (implementation open): Timetracker assignment representation, freshness query seam, and partial/intermittent-sync semantics — **fixed v1.5 behavior:** project-derived access withdraws within 15 minutes of assignment end and after four hours of failed sync.
- OQ6: Can a user hold a project (and its people) without being manager/PP — the info-sec training case? **Resolved for Phase 1:** project membership without PM/DM policy grants no Project audience; positives deferred until product decides.
