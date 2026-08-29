# Access Control Foundation — Test-Case Suite (Phase 0)

Stage-1 scenario documents (AD-1) for story **ACF-1: Resolve Phase-0 Audiences**, following the pattern in [../README.md](../README.md). Contract: [SPEC-access-control-audience-foundation](../../../_bmad-output/specs/spec-access-control-audience-foundation/SPEC.md).

> **Approval status — read first.** These 8 files were **authored by an agent on 2026-08-30 and have NOT received human AD-1 approval.** The user instructed continuous execution instead of stopping at the gate; that instruction waives the pause, not the review. Nothing here is approved evidence until a human says so per file.

## Scope

Phase 0 resolves **one** audience per viewer×target and nothing else:

| Audience | Resolution input | In scope |
| --- | --- | --- |
| **Self** | `viewerId === targetEmployeeId`, evaluated first | yes |
| **Reporting line** | recursive walk over `Relationship type='direct'` reports-to edges | yes |
| **PP** | the target's directly assigned `Relationship type='people_partner'` endpoint — never that PP's own manager chain | yes |
| **Colleague** | authenticated employee with none of the above | yes (fallback) |
| Project line, Department, PP HR-line | — | **no** — fail-closed, separate gates |

No section matrix, no functional permissions, no field projection, no writes, no overlays. `canAccessSection` and `isAllowed` are **not** part of this story.

## The provisional mapping — the one assumption in this suite

`GET /users/:id` is binary: 200 or 403. Phase-0 audiences only become observable once someone decides *which audiences may read a profile*. That decision belongs to User Management (AD-2/AD-14) and has been requested but not answered — see [um-integration-contract-request.md](../../../_bmad-output/implementation-artifacts/access-control/um-integration-contract-request.md), question 3.

On the user's 2026-08-30 instruction to proceed on the existing surface, this suite assumes:

> **`self`, `reporting`, `pp` → allowed (200). `colleague` → denied (403).**

This is an Access Control assumption, not an approved contract. If User Management answers differently, the expected results in `audience/` change and the resolver does not.

## What this suite deliberately cannot prove

- **The running application is unaffected.** `ACCESS_CONTROL_PORT` stays bound to `InterimAccessControlAdapter` in `user-management.module.ts`; the facade is exercised through a **test-module override only**. Production `GET /users/:id` remains unprotected until User Management adopts the facade in its own story.
- **No field-level claim.** An allowed read still returns the whole `User` row — profile projection is User Management-owned and deferred.
- **403, not 404.** The existing guard maps denial to `ForbiddenException`. The `404` leak-free convention of the Phase 1 suite is unreachable here.

## Conventions

- **Authorization:** `Bearer <token:<persona-id>>`, where `<persona-id>` is the seeded UUID of that persona. The existing interim session resolver already accepts a raw user id as the persona segment, so no User Management file changes.
- **Placeholders** (`<alice-id>` etc.) are replaced with seeded UUIDs at translation time.
- **Preconditions are static seeded state.** The graph below is created directly through Prisma in test setup: no relationship endpoint exists to build it over HTTP.
- One file per case; IDs are stable and cited by the E2E tests.

## Foundation fixture

| Persona | Role in the graph |
| --- | --- |
| **Alice** | target employee |
| **Bob** | Alice's direct manager (`direct`: Alice → Bob) |
| **Carol** | Bob's manager (`direct`: Bob → Carol) — transitive over Alice |
| **Paula** | Alice's assigned People Partner (`people_partner`: Alice → Paula) |
| **Hana** | Paula's manager (`direct`: Paula → Hana) — must **not** inherit PP through Paula |
| **Colin** | authenticated employee with no relationship to Alice |
| **Erin** | employee whose manager row points at a deactivated user |
| **InactiveMgr** | Erin's manager, `isActive = false` — the broken edge |
| **Frank** | InactiveMgr's manager (`direct`: InactiveMgr → Frank) — must not reach Erin through the broken node |

## Layout

| Folder | Cases |
| --- | --- |
| [audience/](audience/) | ACF-AU-01..05 — Self, direct Reporting, transitive Reporting, direct PP, Colleague denial |
| [fail-closed/](fail-closed/) | ACF-FC-01..03 — broken reports-to edge, PP HR-line withheld, empty bulk |
