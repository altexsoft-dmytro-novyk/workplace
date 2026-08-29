# Access Control — Test-Case Suite (Phase 1)

Stage-1 quality-gate scenario documents (AD-1), following the team-wide authoring pattern in [../README.md](../README.md): **one test case per file**, each opening with a plain-language **Scenario** (Given/When/Then) followed by the explicit request spec — `inputURL`, `inputRequest` (headers + body), `expectedResult` with HTTP status — traced to `docs/project-requirements.md` (§), architecture decisions (AD-n), and/or the facade contract.

**Status:** v1.5 Phase 1 scenarios **authored 2026-08-29**, **P-3 alignment pass 2026-08-29** (171 files) — **draft**, pending per-file developer approval (AD-1). The pre-v1.5 suite (202 files) was withdrawn in commit `6086491` and was not restored.

Spec contract: `_bmad-output/specs/spec-access-control-test-cases/SPEC.md`.

Binding references:

- Phase 1 gates and edge-case matrix: [facade-contract.md](../../../_bmad-output/specs/spec-access-control-facade-audience-resolution/facade-contract.md)
- Audience model (Reporting line / Project line split): [access-control.md](../../architecture/access-control.md)
- Deferred slices (shared-link, surfaces, FR catalog, full-profile): [deferred-work.md](../../../_bmad-output/implementation-artifacts/access-control/deferred-work.md)

## Scope — read this before adding a file

This suite proves **who is entitled** — audience resolution, base §3.2 matrix cells, functional-permission boundaries, fail-closed behavior, and authentication rejection — for **Phase 1** of the AccessControl facade. It does **not** prove feature workflows (registration, timeline mechanics, list pagination, etc.) — those belong to [user-management/](../user-management/).

**Phase 1 audiences (in scope):** Self, Reporting line (recursive `direct` reports-to only), directly assigned PP, Colleague fallback.

**Phase 1 gates (withhold negatives only — no positive grants yet):** Project line, Department policies, PP HR-line above the assigned PP. See `facade-contract.md` §Phase 1 resolution.

**Explicitly deferred (do not author here):** shared-link overlay, list/export/filter leak negatives, role-catalog management UI, full-profile overlay, Project-line positive matrix cells, Department-walk positives.

## v1.5 audience vocabulary

| Term | Meaning | Phase 1 |
| --- | --- | --- |
| **Reporting line** | Transitive walk on `Relationship type='direct'` reports-to edges | In scope |
| **Project line** | PM/DM via shared project assignment + project-management policies — separate graph pass | Withhold negatives only |
| **PP** | Directly assigned `Relationship type='people_partner'` endpoint | In scope |
| **Colleague** | Authenticated employee with none of the above | In scope |
| **Self** | `viewerId === targetEmployeeId`; evaluated first, exclusive of manager columns | In scope |

Do **not** use "Manager line" — v1.5 splits Reporting and Project into separate §3.2 columns and separate resolver passes.

## Conventions (apply to every file)

- **Authorization header:** `"Bearer <token:persona>"` = valid session; `""` = unauthenticated. Global 401 rule per [../README.md](../README.md).
- **Denial convention:** valid token, no feature permission → `403`; write to readable-only data → `403`; `—` cell or hidden field → `404` leak-free; absent data = key missing, never `null`.
- **Endpoints:** resource root `/users`; role catalog `/roles` — [api-conventions.md](../../architecture/api-conventions.md) (AD-14).
- **Preconditions = static seed only.** State transitions are explicit Test steps or `stateChange` lines per [../README.md](../README.md).
- **HR Admin (Root)** holds configuration FR only — not a matrix audience and not default full profile access (§2.2).

## Canonical personas

Re-established for v1.5 authoring. Reconcile with [user-management/README.md](../user-management/README.md) once both suites are seeded.

| Persona | v1.5 role |
| --- | --- |
| **Alice** | Primary target employee (reports to Bob; PP Paula) |
| **Bob** | Alice's **direct** unit manager (Reporting line) |
| **Carol** | Bob's manager (Reporting line transitive to Alice) |
| **Pete** | PM on a shared project with Alice — **Phase 1: no Project audience**; falls back to Colleague unless another relation applies |
| **Dave** | DM on the same project |
| **Frank** | Dave's manager by reports-to — **no** Project-line reach into Dave's project members |
| **Paula** | Alice's assigned PP (direct endpoint only in Phase 1) |
| **Hana** | Paula's manager — **Phase 1: no PP HR-line inheritance** through Paula |
| **Colin** | Unrelated colleague |
| **Root** | Bootstrap HR Admin FR — configuration only; no default profile data access |
| **Ida** | Custom FR holder (for dual-gate / permission-boundary probes) |
| **Eve** | Authenticated employee with no edges to Alice |
| **Morgan** | Seed variant: Alice's direct UM **and** assigned PP — used for audience-merge (AC-AD-13) only |
| **DueDan** | Employee with due departure — AD-20 actor cutoff |
| **DueBob** / **DueMid** | Due manager nodes in recursion scenarios (AD-AD-16/17) |
| **TopLee** | Top-of-tree employee with empty `reportsTo` (AC-FC-01) |

Seed a shared project membership linking Alice, Pete, and Dave for Project-line gate negatives.

## Fixture binding (story 1 seed)

After `npm run db:migrate && npm run db:seed` in `services/backend`:

| Persona | Work email | Stable user id |
| --- | --- | --- |
| Alice | `ac-fixture-alice@company.example` | `0195f100-0000-7000-8000-000000000002` |
| Bob | `ac-fixture-bob@company.example` | `0195f100-0000-7000-8000-000000000003` |
| … | `ac-fixture-{persona}@company.example` | see `services/backend/src/common/access-control-fixture-ids.ts` |

`Bearer <token:Alice>` resolves to the seeded Alice row via `InterimSessionResolverAdapter`. Stage-2 E2E replaces `<alice-id>` with `ACCESS_CONTROL_FIXTURE_IDS.users.Alice`.

**Variant targets** (same graph rules, separate target rows): `MergeAlice` (AC-AD-13), `AliceBroken` (AC-AD-08), `AliceDue` / `AliceMid` (AD-20 chains).

## Layout

| Folder | Covers | Files |
| --- | --- | --- |
| `audience-derivation/` | Self, Reporting, PP, Colleague paths; Phase 1 gate negatives; AD-20 departure | 18 |
| `matrix/self/` | §3.2 Self column per section, read + write + §4.3 exceptions | 38 |
| `matrix/reporting-line/` | §3.2 Reporting line column (+ S7 DoD, S1 derived-field deny, S16 visibility) | 36 |
| `matrix/pp/` | §3.2 PP column | 32 |
| `matrix/colleague/` | §3.2 Colleague column + whitelist + S16 visibility | 34 |
| `matrix/project-line-gate/` | Phase 1 withhold negatives (PM/DM resolve no Project audience) | 4 |
| `functional-permission/` | Dual gate, FR≠audience, HR Admin no default data access | 3 |
| `fail-closed/` | AD-11/12: empty reportsTo, orphan policy, bootstrap ordinariness | 3 |
| `auth/` | Representative 401 per endpoint family | 3 |

**Total:** 171 stage-1 scenario files (draft).

**Shared-link resolved facts (deferred suite):** never-shareable **{S3, S7, S13, S14}**; S1 default-on; cfg sections default-off; sensitive sections require explicit per-link re-enablement.

**Deferred folders (do not author under Phase 1):** `shared-link/`, `surfaces/`, `users/roles/`, `matrix/hr-admin/`, `matrix/full-profile-access/`, positive `matrix/project-line/` cells.

File names state audience + behavior (`reporting-line-read-s09.md`, `project-gate-pm-colleague-s02-denied.md`), kebab-case. Stable IDs: `AC-<GROUP>-NN` (e.g. `AC-AD-01`, `AC-M-S07-01`).

## Deliberately not covered here

Feature workflows (user-management's job). Shared-link overlay (§4.8 — separate dispatch). List/export/filter leak prevention (projection specs). Role-catalog CRUD (`/roles` — FR-catalog dispatch). Full-profile overlay (§2.4 — product-blocked). Project-line positive cells and timetracker sync (integration contract). Performance NFR (k6 — Platform).
