# User Management — Test-Case Suite

Stage-1 quality-gate scenario documents (AD-1), following the team-wide authoring pattern in [../README.md](../README.md): **one test case per file**, each opening with a plain-language **Scenario** (Given/When/Then) followed by the explicit request spec — `inputURL`, `inputRequest` (headers + body), `expectedResult` with HTTP status — traced to `docs/project-requirements.md` (§), the [user-management PRD](../../../_bmad-output/planning-artifacts/prds/prd-user-management-2026-08-20/prd.md) (FR-n), architecture decisions (AD-n), and/or [user-management-test-decisions.md](../../architecture/user-management-test-decisions.md) (DEC-UM-n).

**Status:** Approved baseline (2026-08-25) — system-level test design and critical review approved; normative decisions propagated. Each file still requires **per-file developer approval** before its stage-2 E2E is written (AD-1).

Spec contract: `_bmad-output/specs/spec-user-management-test-cases/SPEC.md`.

## Scope — read this before adding a file

This suite tests **workflow and data correctness**, not **who is entitled**. Whether an actor is allowed to read/write a section is the access-control suite's job ([docs/test-cases/access-control/](../access-control/), spec'd in [SPEC-access-control-test-cases](../../../_bmad-output/specs/spec-access-control-test-cases/SPEC.md) but **not yet authored on disk as of 2026-08-25** — treat "proven there" below as the intended end state, not a completed dependency) — these files assume an already-entitled actor and assert what the feature actually does: does the record get created, does the constraint hold, does the derived event get written, does the correction leave the old entry intact-but-hidden.

The `User` entity in this PRD carries only S1-identity-card fields (see [database-schema.md](../../architecture/database-schema.md)) plus `UserEvents`. This is deliberate, not an oversight: employment (S4), contacts (S2/S3), documents (S5), mentorship and feedback are planned as their own tables/contexts later. Scenarios here don't reach past that boundary — no S2/S3/S4/S5 field appears in any request or response body below.

## Conventions (apply to every file)

- **Authorization header:** `"Bearer <token:persona>"` = a valid session token for that persona; `""` (empty) = unauthenticated. Every endpoint rejects a missing/invalid token with `401` — same global rule stated in [docs/test-cases/README.md](../README.md); access-control's own suite would apply it per real route once authored (not yet, see the Scope note above).
- **Denial convention:** valid token, no permission for the feature → `403`.
- **Permission-negative probes (DEC-UM-002):** use **Ida** for generic feature-capability denials; use Bob only for manager-specific probes unrelated to the capability under test.
- **Endpoints are bound to the canonical convention.** Resource root `/users`; auth root `/auth`; routes follow the router-tree convention in [api-conventions.md](../../architecture/api-conventions.md) (AD-14) — not placeholder vocabulary.
- **Absence is absence:** a soft-deleted `UserEvents` row is excluded from reads, never returned with a null/placeholder body.
- **Immutable-fact model:** a `UserEvents` correction is never a single in-place PATCH. It is shown as explicit steps — soft-delete the wrong entry, append the corrected one, then a read that observes both (old entry gone from the active view, new entry present) — per the granularity rule in [../README.md](../README.md).
- **Isolation (DEC-UM-010):** one Playwright test worker + UUID-owned data initially; `@concurrency` scenarios use parallel HTTP inside one test; schema-per-worker before parallel CI workers.
- A file with several `Test N` blocks is still one requirement, probed via its cause→effect sequence (baseline → change → observation).

## Canonical personas

Intended to reuse the cast seeded for access-control's suite so relationships stay consistent across both — but that suite doesn't exist on disk yet (see the Scope note above), so the table below is this suite's own working definition of each persona, not an import from an established fixture. Reconcile against access-control's fixture once it's authored. Personas are expected from the **seeded population** (Story 1.1 / `um-seed-*`). CAP-1 HTTP registration (`um-reg-01`..`15`) is **retired / superseded** (spec v1.5).

| Persona | Role in this suite |
| --- | --- |
| **Root** | HR Admin functional role (seed bootstrap). Deactivates users, manages relationships. Does **not** create employees via `POST /users`. |
| **Nina** | Seeded employee used where scenarios previously assumed a registration create target. Identity comes from seed/import, not `um-reg-01`. |
| **Tomas** | Second seeded employee (formerly registration-only fixture). Prefer distinct seeded rows over HTTP create. |
| **Alice** | Existing employee (reports to Bob, PP Paula). Subject of profile-edit, auth, career-timeline, and relationship scenarios. |
| **Bob** | Alice's **direct** unit manager. Edits Alice's identity fields; manually adds/corrects her career-timeline entries under DEC-UM-001 (assigned PP + direct UM write). |
| **Paula** | Alice's assigned people partner. Manually adds/corrects career-timeline entries. |
| **Colin** | Unrelated employee, no HR Admin role. Holds `workEmail: colin@company.example` and `ttId: "tt-1042"` — the in-use values the uniqueness cases collide against. |
| **Ida** | Holds the custom functional role *IT Campaigns*, whose only permission is *create form campaigns*. Used for generic feature-permission 403 probes (DEC-UM-002). |

## Layout

| Folder | Covers | Files |
| --- | --- | --- |
| `registration/` | **DEAD (2026-08-30 audit) — RETIRED / SUPERSEDED (v1.5).** Former CAP-1 `um-reg-01`..`15` HTTP create. Not cited by current epics.md; do not translate to stage-2. | 15 (dead) |
| `seed/` | FR-1/FR-4a/FR-5a: population import, no `POST /users`, bootstrap HR Admin (Story 1.1) | 3 (`um-seed-01`..`03`, authored 2026-08-30) |
| `auth/` | FR-2/FR-7: magic-link request/consume, security edge cases | 6 — alive, cited by epics.md Story 2.1/2.2 |
| `profile/` | FR-8: Manager-line edits, Self photo upload, uniqueness on PATCH | 4 total; `um-pf-01`..`03` alive (Story 1.2/1.3), `um-pf-04` (ttId uniqueness) dead — uncited |
| `deactivation/` | **DEAD (2026-08-30 audit).** Epic 5 is now a two-step Departure lifecycle (spine AD-15/16/17), not generic deactivation; zero citations in current epics.md. | 3 (dead) |
| `list/` | FR-16: pagination and S1-field filters (Story 1.5) | 5 — `um-list-01`..`04` verified alive against Story 1.5's ACs (2026-08-30); `um-list-05` newly authored to close a real gap `um-list-04` left (it delegated dismissed-employee-filter coverage to now-dead `deactivation/um-deact-02`) |
| `career-timeline/` | FR-10..FR-13: system events, PP/direct-UM manual mechanics (DEC-UM-001), and edit-immutability | 8 total; `um-ct-01,02,03,05,06,07` alive (Story 3.1/3.2/3.3), `um-ct-04`/`um-ct-08` dead — uncited |
| `relationships/` | FR-10: manager/PP/department/department-manager changes, self-assignment rejection, atomic journaling (Epic 4, spine AD-5..AD-8) | 9 (`um-rel-01`..`09`, rewritten from scratch 2026-08-30 — the prior 8 files were mentorship-pair-shaped and dead, see below) |
| `departure/` | FR-6: record + apply an effective departure (Epic 5, spine AD-15..AD-18) | 6 (`um-dep-01`..`06`, newly authored 2026-08-30) |

**Total:** 67 stage-1 scenario files (23 alive/reusable pre-2026-08-30, 26 dead, 4 newly authored 2026-08-30 for Epic 3's remainder, 15 newly authored 2026-08-30 for Epic 4/5). See the 2026-08-30 architecture-reset audit for the pre-existing alive/dead/missing breakdown.

File names state actor/behavior (`um-reg-01-hr-admin-create-success.md`), so a folder listing is its own index.

## Deliberately not covered here

Whether an actor is entitled to perform an action (access-control's job, entirely). S2/S3/S4/S5 section content (no schema yet). Timetracker/PeopleForce sync-driven writes (AD-13, future integration). Seed-script bootstrap behavior (not an HTTP-driven scenario; access-control's `fc-03` is specified to cover the bootstrap admin being an ordinary revocable FR once that suite is authored — it is not yet, see the Scope note above). k6 NFR-2 load tests (planned in TEA QA design, not stage-1 prose scenarios).

## Normative decisions

Approved product/test rules: [user-management-test-decisions.md](../../architecture/user-management-test-decisions.md) (DEC-UM-001..011).
