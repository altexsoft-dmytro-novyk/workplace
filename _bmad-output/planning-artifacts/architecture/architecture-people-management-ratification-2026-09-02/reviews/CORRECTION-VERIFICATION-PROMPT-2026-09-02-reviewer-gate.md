# Correction verification prompt — 2026-09-02 reviewer-gate-correction

Use this as a focused second-pass check. Documentation-only. Do not modify application code, tests, lockfiles, package manifests, or CI. Do not claim release readiness.

## Scope

Verify the Update that reconciled Reviewer Gate findings **H1–H7 and H11**, with **H8 verification-only**.

Preserve **PM/AD-1..PM/AD-35** sequential IDs. Do not renumber PM/AD-26..35.

## Checks

1. **H1 — Mentorship SPEC**  
   `_bmad-output/specs/spec-mentorship-domain/SPEC.md` binds MentorshipPair / MentorshipAvailability, derived status (never independently persisted), and approved routes. §3.1 / §6 / G-CTX must not say those design facts remain unapproved. Residual items are implementation-narrow only. Authority cites the PM spine + `docs/architecture/mentorship.md`.

2. **H2 — CC-04 / CC-06**  
   Canonical PM PRD §11 + pre-sprint and UM SPEC §3.5/§6 classify both as **design resolved**; remaining work is implementation and named deps. Must **not** mark departure implementation-ready while CC-07/08/09 implementation, OPERATIONAL-ENVELOPE, and AD-23 participants remain open. Historical PRDs may have stale banners only.

3. **H3 — ID collisions**  
   Historical PRD meanings of OQ-118/OQ-119 and CC-11 Option 1 preserved. Live architecture blockers are `ARCH-ENV-01` (envelope / PM/AD-34) and `ARCH-PROJ-WRITER-01` (project Relationship sole writer / PM/AD-31). Architecture `OQ-118` and `CC-11` entries are `superseded`, not rewritten. Reciprocal updates in blockers, ratification, evidence-matrix, spine AD-31/34 notes, coverage companions, memlogs.

4. **H4 — PM/AD-7**  
   Binding identity is `Permissions.key` (unique, append-only); `title` is not identity; ACF/AD-4 supersedes earlier `{id,title,description}`. Structural seed ERD, evidence-matrix, FR-catalog stale marker agree. No new AD ID.

5. **H5 — Bound ACF**  
   Evidence matrix has qualified `ACF/AD-1..ACF/AD-4` and `ACM-0..ACM-9` rows. ACF Inherited Invariants include PM/AD-22, PM/AD-23 (exact `applyDepartureEffects` contract), PM/AD-24. Namespaces not merged. No false implementation claims.

6. **H6 — TimeTracker gates**  
   `global-fr-epic-story-coverage.yaml` has **no live** `TIMETRACKER-CONTRACT` gates. Live gates use `TT-IDENTITY-01` and/or `TT-PMDM-01`. README states TIMETRACKER-CONTRACT is superseded historical only.

7. **H7 + H11 — Stack**  
   Spine Stack: Node **24.x** exact major (not “current LTS” as the pin); NestJS **11.x**; NestJS 12 optional separately planned; **no** ESM-migration requirement claim. Toolchain debt recorded (TD-13); manifests/CI untouched.

8. **H8 — verify only**  
   AD-19 / evidence-matrix must **not** list CC-04 as a design blocker. CC-04 remains implementation + PM/AD-29 journal enrolment. Register, blocker notes, and dependencies agree. No new AD unless a contradiction remains.

## Mechanical validation

- `lint_spine.py` on PM and ACF workspaces → `total_findings: 0`
- Parse `blockers.yaml`, `evidence-matrix.yaml`, `transition-debt.yaml`, `global-fr-epic-story-coverage.yaml`
- Confirm PM AD headings are exactly 1..35 sequential
- Confirm evidence path bases resolve (strip `#anchor` and `:line` suffixes)
- Search live (non-`reviews/`) docs for contradictory phrases: “still unapproved” (for approved mentorship design facts), “CC-04 remains a gate on AD-19”, NestJS 12 “ESM migration” requirement, live `TIMETRACKER-CONTRACT` gates

## Out of scope

- Closing implementation blockers
- Editing `package.json` / lockfiles / CI / local Node
- Rewriting historical review transcripts as if they always reflected this correction
- Commit / push / tag / release-readiness claims
