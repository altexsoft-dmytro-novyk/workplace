# Mentorship — Test-Case Suite

Stage-1 quality-gate scenario documents (AD-1), following the team-wide authoring
pattern in [../README.md](../README.md): **one test case per file**, each opening
with a plain-language **Scenario** (Given/When/Then) followed by the explicit
request spec — `inputURL`, `inputRequest` (headers + body), `expectedResult` with
HTTP status — traced to `docs/project-requirements.md` (§), the
[mentorship PRD](../../../_bmad-output/planning-artifacts/prds/prd-mentorship-2026-09-01/prd.md)
(FR-Mn), the [mentorship epics](../../../_bmad-output/planning-artifacts/mentorship/epics.md)
(Story n.n), and architecture decisions (AD-n).

## Status — UNAPPROVED DRAFT

**No file in this suite is approved.** `approvals.yaml` **does not exist** for
this area. Per-file human approval under the AD-1 stage-1 gate is required before
any file is translated to a stage-2 E2E test — an agent's review of its own
output is never a substitute ([../README.md](../README.md),
[testing-strategy.md](../../architecture/testing-strategy.md)).

The mentorship planning package it derives from
(`prd-mentorship-2026-09-01/`, `planning-artifacts/mentorship/epics.md`) is
itself `draft`. The `MentorshipPair` schema, the open-to-mentoring flag's owning
aggregate and endpoint, the closure route, and the willing-pool route are
**open architect decisions** — the routes below are **provisional** and flagged
where used.

## Scope — read this before adding a file

This suite tests **workflow and data correctness**: the availability flag, the
pool, pair creation and closure, the mandatory closure note, ended-pair history,
career-event emission, and departure auto-close.

**Not in this suite:**

- **Who is entitled** to S13 and the base §3.2 matrix cells — that is
  [access-control/](../access-control/)'s. These files assume an already-resolved
  audience and assert what the feature does, *except* the closure-note narrowing
  (FR-M10) and the "pool never exposes S13" leak check (FR-M4), which are
  mentorship-owned **projection** rules that only narrow the facade result.
- The **All Employees directory engine** (platform scope) — `men-view-05` asserts
  only that mentorship supplies a correct, non-leaking status field.
- Mentoring goals, session logs, progress tracking — out of scope (§4.11).

## Conventions (apply to every file)

- **Authorization header.** `"Bearer <token:persona>"` = a valid session for that
  persona; `""` = unauthenticated. Every endpoint rejects a missing/invalid token
  with `401` (global rule, [../README.md](../README.md)).
- **Denial convention.** Valid token, no feature permission → `403`. Write to
  readable-only data → `403`. Touching a `—` cell or hidden field → `404`
  leak-free. Absence is absence (key missing, never `null`).
- **Permission-negative probes.** Use **Ida** (holds a custom functional role
  whose only permission is unrelated) for *assign and end mentorships* capability
  denials — never a role-name or `User.position` check; the facade's no-target
  `isAllowed` is the gate.
- **Real-audience cases** (the closure-note visibility set in `men-end-*`) seed
  real `User` + `Relationship` rows and use `"Bearer <token:<seeded-uuid>>"`;
  a persona literal that resolves to a non-existent id yields an empty audience.
- **Endpoints** follow `api-conventions.md` (AD-14): `mentorship-pairs` is a
  **top-level** collection (`GET/POST /mentorship-pairs`, `GET /mentorship-pairs/:id`).
  The **closure action**, the **willing-pool route**, and the **availability-flag
  route** are **not yet fixed** — this suite uses the provisional names below and
  every file that touches one carries a `> PROVISIONAL ROUTE` note:
  - closure: `POST /mentorship-pairs/:id/closure { note }`
  - willing pool: `GET /willing-mentors`
  - availability flag: `PUT /users/:id/mentorship-availability { openToMentoring }`
    — **not** a `Relationship` patch (spine Deferred; AD-17).
  - S13 inline summary and the profile-header mentor: `GET /users/:id`.
- **Career events** have no mentorship HTTP surface — they are written through
  `user-management`'s application boundary in the same transaction (AD-11). A
  scenario observes them via `GET /users/:id/events` and marks the write as a
  `stateChange`.

## Canonical personas

Reuse the [access-control fixture](../access-control/README.md) cast where the
graphs overlap; mentorship-specific additions below.

| Persona | Role in this suite |
| --- | --- |
| **Alice** | Seeded employee. Reports to Bob; assigned PP Paula; on a project with PM Pete. The **mentee** in most pair scenarios. |
| **Bob** | Alice's **direct** Unit Manager (Reporting line over Alice). Additionally holds *assign and end mentorships* — the assigner in scoped-mentee cases (Alice in scope, Eve out of scope). Reads closure notes (reporting line). |
| **Paula** | Alice's assigned People Partner. Ends pairs; reads closure notes (PP). |
| **Pete** | PM on Alice's project (Project line). Reads closure notes (project line). |
| **Carol** | Bob's manager (Reporting line, transitive to Alice). Reads closure notes. |
| **Mona** | Willing mentor. In a **different department** from Alice — the company-wide-pool case. Not otherwise related to Alice; cannot read the closure note of her own pair. |
| **Root** | Seeded bootstrap HR Admin. Holds *assign and end mentorships* and *record a departure* where a scenario needs a broadly-entitled actor. |
| **Ida** | Holds a custom functional role whose only permission is unrelated (*create form campaigns*). Generic *assign and end mentorships* `403` probes. |
| **Eve** | Authenticated seeded employee with **no edges** to Bob or Alice — out-of-scope-mentee negative; colleague reads. |
| **Colin** | Unrelated seeded employee — colleague closure-note leak negative. |
| **Nina** | Seeded employee used where a scenario needs a fresh mentor or mentee. |

## Layout

| Folder | Covers | Story | Files | Stage-2 gate |
| --- | --- | --- | --- | --- |
| `flag/` | FR-M1, FR-M3 — self set/clear, non-self denied, clear-while-active-mentee | 1.1 | 4 | G-CTX (flag endpoint/aggregate — spine Deferred) |
| `pool/` | FR-M4 — company-wide pool, S1+flag only, no S13 exposure, permission-gated | 1.2 | 3 | G-CTX + G-PERM |
| `pair/` | FR-M5, FR-M6, FR-M7 — create, scoped mentee, status transition, career event | 1.3 | 5 | G-CTX + G-PERM + G-CT |
| `end/` | FR-M9..FR-M13 — mandatory note, restricted visibility, status roll-back, career event, history | 1.4 | 8 | G-CTX + G-PERM + G-S13 + G-CT |
| `view/` | FR-M2, FR-M8, FR-M15, FR-M16, FR-M17 — S13 inline, all-pairs, header mentor, directory field | 1.5 | 5 | G-CTX + G-S13 (partial) |
| `departure/` | FR-M14 — departure auto-close, system note bypasses the gate | 1.6 | 2 | **G-DEP (CC-06) — stage-2 blocked; prose only** |

**Live stage-1 scenario files:** 27. All unapproved drafts.

## What blocks stage-2

> **Gate-ID note (Platform Story 1.3, 2026-09-07).** The `G-CTX` / `G-PERM` / `G-S13` / `G-CT` / `G-DEP` labels below and in the Layout table are **local aliases, not global blockers**, and are flagged here for cleanup — they must resolve to `blockers.yaml` IDs. Canonical mapping (authoritative source: `_bmad-output/specs/spec-mentorship-domain/SPEC.md` §7): `G-CTX` → **`CC-10-MENTORSHIP`**; `G-PERM` → **`OQ-PERM-01`**; `G-S13` → **`AC-S9-S13`**; `G-CT` → **`CC-09`**; `G-DEP` → **`CC-06`**. The `OQ-M1`–`OQ-M7` local questions are likewise not global blockers (design resolved by PM/AD-5, PM/AD-17, PM/AD-23, PM/AD-30, PM/AD-34). Rewriting each cell to the canonical ID is a follow-up, not done here.

| Blocker | Blocks |
| --- | --- |
| **G-CTX** — `MentorshipPair` schema; the open-to-mentoring flag's owning aggregate and endpoint (spine Deferred: "Do not infer it as a relationship patch"); closure + pool route names | every file (no endpoint contract exists) |
| **G-PERM** — *assign and end mentorships* FR permission is unseeded (kernel MVP seeds only `user-management:create/deactivate/list`); same shape as the `user-management:edit` gap (alignment proposal §7 (i)) | `pool/`, `pair/`, `end/` — the feature half of the §2.2 dual gate |
| **G-S13** — `AccessControlFacade.canAccessSection` supports `S1`/`S10`/`S11` only (ACM-5); **S13 is a pending Access Control increment**, same class as the career-timeline S9 gap | `end/` closure-note projection (FR-M10); `view/` S13 inline narrowing (FR-M17) |
| **G-CT** — `user-management` Epic 3 Story 3.1's career-event application boundary must exist | `pair/` (`mentorship_start`), `end/` (`mentorship_end`) |
| **G-DEP** — AD-20 departure executor + CC-06 | all of `departure/` |

## Normative references

- `docs/project-requirements.md` §4.11 (Mentorship Hub), §3.2 S1/S13, §4.9, §4.16, §4.1
- `_bmad-output/planning-artifacts/prds/prd-mentorship-2026-09-01/prd.md`
- `_bmad-output/planning-artifacts/mentorship/epics.md`
- ARCHITECTURE-SPINE.md AD-5, AD-11, AD-14, AD-17, AD-20; Deferred ("S13 mentorship self-visibility flag's exact endpoint")
- `docs/architecture/api-conventions.md` (`mentorship-pairs` rows), `docs/architecture/access-control.md` (§3.3 matrix exceptions)
