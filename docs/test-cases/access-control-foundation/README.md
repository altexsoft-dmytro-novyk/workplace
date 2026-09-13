# Access Control Foundation — Test-Case Suite (Phase 0)

Stage-1 scenario documents (AD-1) for story **ACF-1: Resolve Phase-0 Audiences**, following the pattern in [../README.md](../README.md). Contract: [SPEC-access-control-audience-foundation](../../../_bmad-output/specs/spec-access-control-audience-foundation/SPEC.md).

> **Approval markers — historical record, not a live status.** AD-1 stage approval was **retired on 2026-09-04** (`docs/architecture/testing-strategy.md:25–38`): scenario documents no longer carry an approval status, nothing here gates a Stage-2 test or production code, and ordinary review — the pull request, and CI actually running the suites — stands in its place. The markers below are kept as history and attribution, the same way the two approval ledgers are.
>
> All 9 Stage-1 scenarios received AD-1 approval from Anna Pikula on 2026-08-30, while the gate was still live; each file carries its own `**Approved:**` marker. The translated E2E suite received round-2 approval the same day, on a walkthrough of its fixture, requests and assertions rather than a line read; the marker is at the top of `services/backend/test/access-control/audience-resolution.e2e-spec.ts`.
>
> **Superseded expectations — 2026-09-01, reworked 2026-09-11.** The provisional mapping's *deny* half is resolved by User Management, the opposite way it was assumed: a colleague `GET /users/:id` returns the **S1 identity card** (`200`), not `403` — §3.2's S1 row is `R` for the Colleague column and every active authenticated viewer is at least a Colleague ([adoption SPEC](../../../_bmad-output/specs/spec-user-management-access-control-adoption/SPEC.md); [proposal §7 (ii)](../../../_bmad-output/planning-artifacts/sprint-change-proposal-2026-09-01-user-management-access-control-alignment.md)). The **resolver is unaffected** — Frank/Hana/Colin still resolve to `colleague` as the fallback. The **HTTP-status expected results in `ACF-AU-05`, `ACF-FC-01`, and `ACF-FC-02` were invalidated** by that answer; all three are now **reworked and reviewed (Anna Pikula, 2026-09-11 — a voluntary record; the stage gate had already been retired on 2026-09-04)** to assert the resolver's audience-set membership instead (e.g. `resolveAudiences(Frank,[Erin])` contains `colleague` and *not* `reporting`), the way `ACF-FC-04` already does. **This was a retro-anchor, explicitly recorded as such, not a mechanical status swap**: the production behavior and its e2e coverage (`services/backend` commit `da7d1fa`, 2026-09-03) predate that review, so the normal scenario → red test → production order could not be re-run — only the scenario document was brought into agreement with what already shipped and was already green.

**`ACF-AU-01..04` reworked — 2026-09-13 (`ACF-AU-R1`, `R-PLAT2-01`/`R-PLAT2-03`).** The same 2026-09-01 answer means the allow cases' `200`-on-the-route assertion no longer discriminates the audience each names either — every audience in `{self, reporting, pp, colleague}` now gets `200`. Each of the four now carries a facade-level exact-set assertion (`resolveAudiences(...)` equals exactly `{self}` / `{reporting}` / `{reporting}` / `{pp}`) as the primary oracle, the same pattern `ACF-FC-04` and the reworked deny cases use; the `200` check is kept only as separately labelled UM-owned route evidence, not as proof of the named audience.

**`ACF-FC-04` reworked — 2026-09-13 (`ACF-RW-04`, `R-PLAT2-02`).** The scenario document still combined a Colleague result with the obsolete HTTP `403` oracle after the 2026-09-01 answer, contradicting the current e2e's exact-set assertion. The document now asserts `resolveAudiences(Colin, [CycleA])` equals exactly `{colleague}` (facade-level, matching `ACF-FC-02`/`ACF-FC-03`), while retaining its termination/hang oracle unchanged: the call must still complete within the request budget instead of hanging on the cycle.

**`ACF-FC-05` added — 2026-09-13 (P1, `R-PLAT2-04`).** States, as an explicit scenario in this suite, the empty-set rule production commit `9e69682` already shipped: a deactivated target or a deactivated viewer each resolve to an EMPTY audience set, never the Colleague floor. This is not the AD-20 dismissed-target read-only projection, which remains unimplemented pending a `Departure`/`EmploymentStatus` persistence seam.

## Scope

Phase 0 resolves the **applicable set** of audiences per viewer×target from these four candidates and nothing else — not exactly one. Self is exclusive (it is the only member whenever `viewerId === targetEmployeeId`); Reporting and direct PP are independent facts that coexist in the same result when both hold; Colleague is the floor, added only when no other candidate applies. Multi-audience combination and merge precedence across sections is `PLAT-E3`'s `ACM4R-MA-01` (`docs/test-cases/access-control-kernel/multi-audience/acm4r-ma-01-reporting-and-pp-retained.md`) — consumed, not duplicated, here:

| Audience | Resolution input | In scope |
| --- | --- | --- |
| **Self** | `viewerId === targetEmployeeId`, evaluated first | yes |
| **Reporting line** | recursive walk over `Relationship type='direct'` reports-to edges | yes |
| **PP** | the target's directly assigned `Relationship type='people_partner'` endpoint — never that PP's own manager chain | yes |
| **Colleague** | authenticated employee with none of the above | yes (fallback) |
| Project line, Department, PP HR-line | — | **no** — fail-closed, separate gates |

No section matrix, no functional permissions, no field projection, no writes, no overlays. `canAccessSection` and `isAllowed` are **not** part of this story.

## The provisional mapping — resolved by User Management on 2026-09-01

`GET /users/:id` is binary: 200 or 403. Phase-0 audiences only become observable once someone decides *which audiences may read a profile*. That decision belongs to User Management (AD-2/AD-14). It was requested in [um-integration-contract-request.md](../../../_bmad-output/implementation-artifacts/access-control/um-integration-contract-request.md) question 3, and **answered on 2026-09-01**:

> **`self`, `reporting`, `pp`, *and* `colleague` → allowed (`200`, S1 identity card).** Empty audience (viewer or target not an active `User`) → `403`. Unresolved session → `401`. No leak-free `404`.

This suite was authored on the earlier provisional assumption `colleague → denied (403)`, which is now **wrong**. Per the note at the top of this README, the resolver is unaffected, and the HTTP expectations in `ACF-AU-05` / `ACF-FC-01` / `ACF-FC-02` have been superseded and reworked into an audience-set assertion (2026-09-11; reviewed voluntarily — the stage gate was already retired).

## What this suite deliberately cannot prove

- **The running application is unaffected.** `ACCESS_CONTROL_PORT` stays bound to `InterimAccessControlAdapter` in `user-management.module.ts`; the facade is exercised through a **test-module override only**. Production `GET /users/:id` remains unprotected until User Management adopts the facade in its own story.
- **No field-level claim.** An allowed read still returns the whole `User` row in this suite's test-module composition — profile projection is the User Management-owned Story 0.1 S1-card DTO, not exercised here.
- **The deny cases were reworked (2026-09-01 finding, 2026-09-11 rework).** Authored when the existing guard mapped every denial to `403` and a colleague was assumed denied. UM's answer makes a colleague a `200`, so `ACF-AU-05` / `ACF-FC-01` / `ACF-FC-02` now assert resolver audience-set membership instead (see the README top note); the genuinely-empty-audience `404` is a UM controller concern, out of scope here.

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
| [audience/](audience/) | ACF-AU-01..05 — Self, direct Reporting, transitive Reporting, direct PP, Colleague fallback (`ACF-AU-05` expected result reworked 2026-09-11 — see the README top note) |
| [fail-closed/](fail-closed/) | ACF-FC-01..05 — broken reports-to edge, PP HR-line withheld, empty bulk, cyclic reporting chain (`ACF-FC-04` expected result reworked 2026-09-13, `ACF-RW-04` — see the README top note), deactivated target/viewer empty set (`ACF-FC-05`, added 2026-09-13, P1 `R-PLAT2-04`) |
