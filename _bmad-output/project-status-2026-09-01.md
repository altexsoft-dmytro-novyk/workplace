# Project status — 2026-09-01 (regenerated)

Short orientation snapshot after tracker and living-contract cleanup. Normative SoT remains `docs/project-requirements.md` (v1.5, still marked Draft for review).

## Where we are

Planning for User Management and Access Control is in place. Implementation is in **Phase 4 (ship)**.

The Access Control Kernel (ACM-0…8) is built and imported in `AppModule`, but User Management still binds `ACCESS_CONTROL_PORT` to `InterimAccessControlAdapter`. **UM Epic 0 Story 0.1 / `UMAC-1-production`** is the next shipping cut.

Mentorship is draft planning only. There is no formal UX spec; an uncommitted prototype lives in `docs/design/people-platform-prototype/`.

## Sprint status

Three trackers. Kernel work is under **platform**.

### User Management

| Key | Status | Note |
| --- | --- | --- |
| epic-0 | in-progress | |
| **0-1** adopt read path | in-progress | Stage 1 + Stage 2 approved. Next: **`UMAC-1-production`**. |
| 0-2 write dual gate | backlog | Blocked on kernel seed for `user-management:edit` |
| Epics 1–5 | backlog | Compiled specs are `draft`. Epic 4 gated on CC-07/CC-04; Epic 5 on CC-06 |

Untracked local work: `epic-1-story-1-1-decisions.md` and `docs/test-cases/user-management/seed/README.md`.

### Platform

| Key | Status | Note |
| --- | --- | --- |
| epic-1 | in-progress | Matches `platform/epics.md` |
| 1-1…1-6 | backlog | 1-1 has a UM↔AC matrix, not the platform-wide changelog matrix. 1-2 addendum still says “pending v1.3”. 1-3 ACF HTTP colleague-403 cases still need a fresh AD-1 pass. |
| **1-7, 1-8, 1-9** | done | CAP-1 is seed; create-path removed from binding docs; tracker registered |
| 2-1 ACF-1 | review | Spec frontmatter aligned |
| 3-1…3-7 ACM kernel | done | Shipped |
| 3-8 ACM-9 | review | Spec frontmatter aligned. TEA gate **FAIL** (2026-08-31): P0 95%, ACM3-II-06 uncovered |

### Mentorship

All backlog. PRD / epics / architecture are `draft`. Stage-2 blocked on G-CTX, G-PERM, G-S13, G-CT, G-DEP.

## Contract (settled)

`GET /users/:id` denials:

- unresolved session → `401` (interim resolver may surface `403`)
- authenticated viewer, empty audience → **`403`**
- no leak-free `404`

Living copies (PRD FR-16, epic-0-context, adoption SPEC header, test-case SPEC CAP-0, foundation README, architect handoff, contract-request banner, alignment traceability) now match. The 2026-09-01 alignment proposal keeps the original `404` wording in §4.1 / §7 (ii) / §8 and carries a top amendment pointing at this correction.

Adoption SPEC is `implementation_status: stage-3-authorized`. `approvals.yaml` header matches Stage 2 recorded.

Left untouched on purpose:

- People Management / User Management / Mentorship PRD frontmatter still `draft` (product call, not a tracker fix)
- ACF-AU-05 / ACF-FC-01 / ACF-FC-02 scenario files (need a fresh AD-1 pass as resolver audience-set checks)
- Section-matrix `leak-free 404` cases under `docs/test-cases/access-control/matrix/` (different convention: hide a section key, not the `GET /users/:id` empty-audience rule)
- Old UM spec slugs (register / deactivate / mentor-pair) remain superseded pointers

## Next action

**Ship:** `bmad-build` for `UMAC-1-production` — rebind the port, delete the interim adapter, ship `{ data, canEdit }` on `GET /users/:id` only, turn the approved red E2E green.

Do not start Story 0.2 until `user-management:edit` is seeded. Do not start Mentorship until the PRD is approved and G-CTX is answered.
