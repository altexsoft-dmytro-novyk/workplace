# Access Control Foundation — Test-Case Suite (Phase 0)

Stage-1 scenario documents (AD-1) for story **ACF-1: Resolve Phase-0 Audiences**, following the pattern in [../README.md](../README.md). Contract: [SPEC-access-control-audience-foundation](../../../_bmad-output/specs/spec-access-control-audience-foundation/SPEC.md).

> **Approval status — read first.** All 9 Stage-1 scenarios received AD-1 approval from Anna Pikula on 2026-08-30; each file carries its own `**Approved:**` marker. The translated E2E suite received round-2 approval the same day, on a walkthrough of its fixture, requests and assertions rather than a line read; the marker is at the top of `services/backend/test/access-control/audience-resolution.e2e-spec.ts`.
>
> **Superseded expectations — 2026-09-01, reworked under `1-3a`.** The provisional mapping's *deny* half was resolved by User Management the opposite way it was assumed: a colleague `GET /users/:id` returns the **S1 identity card** (`200`), not `403` — §3.2's S1 row is `R` for the Colleague column and every active authenticated viewer is at least a Colleague ([adoption SPEC](../../../_bmad-output/specs/spec-user-management-access-control-adoption/SPEC.md); [proposal §7 (ii)](../../../_bmad-output/planning-artifacts/sprint-change-proposal-2026-09-01-user-management-access-control-alignment.md)). The **resolver is unaffected** — Frank/Hana/Colin still resolve to `colleague` as the fallback. The **HTTP-status expected results in `ACF-AU-05`, `ACF-FC-01`, and `ACF-FC-02`** were invalidated and **reworked to assert the resolver's audience-set membership** (e.g. `resolveAudiences(Frank,[Erin])` is exactly `{colleague}` and not `reporting`), the way `ACF-FC-04` does: E2E in `services/backend` `da7d1fa` (2026-09-06), scenario docs updated 2026-09-07 (sprint key `1-3a-colleague-403-audience-set-ad1`, `done`). `ACF-AU-01..04` (allow cases) are unaffected.

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

## The provisional mapping — resolved by User Management on 2026-09-01, denial oracle superseded 2026-09-02

`GET /users/:id` was authored here as binary: 200 or 403. Phase-0 audiences only become observable once someone decides *which audiences may read a profile*. That decision belongs to User Management (AD-2/AD-14). It was requested in [um-integration-contract-request.md](../../../_bmad-output/implementation-artifacts/access-control/um-integration-contract-request.md) question 3, and **answered on 2026-09-01**:

> **`self`, `reporting`, `pp`, *and* `colleague` → allowed (`200`, S1 identity card).** Empty audience (viewer or target not an active `User`) → `403`. Unresolved session → `401`. No leak-free `404`.

> **Superseded by PM/AD-24 (ratification 2026-09-02).** The empty-audience `403` / "no leak-free `404`" line above is historical 2026-09-01 approval evidence, **not the live denial oracle**. Live oracle (`docs/architecture/access-control.md` §"Denial conventions" / PM/AD-24): invalid or inactive session `401`; missing or hidden-existence target `404`; visible resource but forbidden feature/action `403`; lists omit invisible rows; hidden-target `404` precedes mutation permission checks. Do not rewrite the 2026-09-01 decision record.

This suite was authored on the earlier provisional assumption `colleague → denied (403)`, which is now **wrong**. Per the note at the top of this README, the resolver is unaffected but the HTTP expectations in `ACF-AU-05` / `ACF-FC-01` / `ACF-FC-02` were superseded and reworked as audience-set assertions. **That rework (`1-3a-colleague-403-audience-set-ad1`) is done:** the E2E asserts resolver labels directly (`services/backend` `da7d1fa`, `test/access-control/audience-resolution.e2e-spec.ts`), and the three scenario docs were updated 2026-09-07 to match.

## What this suite deliberately cannot prove

- **The running application is unaffected.** `ACCESS_CONTROL_PORT` stays bound to `InterimAccessControlAdapter` in `user-management.module.ts`; the facade is exercised through a **test-module override only**. Production `GET /users/:id` remains unprotected until User Management adopts the facade in its own story.
- **No field-level claim.** An allowed read still returns the whole `User` row in this suite's test-module composition — profile projection is the User Management-owned Story 0.1 S1-card DTO, not exercised here.
- **The deny cases were reworked (authored 2026-08-30; oracle superseded 2026-09-01 / PM/AD-24 2026-09-02; reworked under `1-3a`).** Authored when the existing guard mapped every denial to `403` and a colleague was assumed denied. UM's answer makes a colleague a `200`, so `ACF-AU-05` / `ACF-FC-01` / `ACF-FC-02` now assert the resolver audience set directly (E2E: `services/backend` `da7d1fa`; scenario docs updated 2026-09-07). The genuinely-empty-audience denial follows the PM/AD-24 oracle (`401` / `404` / `403`), a UM controller concern out of scope here.

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
| **CycleA / CycleB** | a reporting cycle the schema still accepts (`direct`: A → B and B → A) — resolution must terminate, not hang |

## Layout

| Folder | Cases |
| --- | --- |
| [audience/](audience/) | ACF-AU-01..05 — Self, direct Reporting, transitive Reporting, direct PP, Colleague fallback (`ACF-AU-05` expected result superseded 2026-09-01 — see the README top note) |
| [fail-closed/](fail-closed/) | ACF-FC-01..04 — broken reports-to edge, PP HR-line withheld, empty bulk, cyclic reporting chain |
