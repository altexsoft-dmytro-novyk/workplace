# User Management — `access-control-adoption/` (Epic 0)

> **Denial oracle superseded 2026-09-02 (PM/AD-24).** Q4 / `umac-05` still record
> the 2026-09-01 empty-audience `403` product decision as **historical AD-1
> evidence**. Live rule: invalid/inactive session `401`; missing or hidden-existence
> target `404`; visible resource but forbidden feature/action `403`; lists omit
> invisible rows; hidden-target `404` precedes mutation permission checks.
> Do not rewrite historical expectedResult lines as if they had always said `404`.
> Regeneration is a new AD-1 dispatch. Implementation still diverges (guard `403`,
> action `404`, interim adapter bypass).

> **Amended 2026-09-05 (PLAT-E4-S4.1c — `@RequireSectionAccess` gate).** Two
> things below changed and are marked inline: (a) **"Variant A" is superseded.**
> SCP [`sprint-change-proposal-2026-09-04-section-access-consolidation.md`](../../../../_bmad-output/planning-artifacts/sprint-change-proposal-2026-09-04-section-access-consolidation.md)
> **D1** restores the identity-card edit as a **dual gate** — the audience half
> `canAccessSection(viewer, 'profile:identity', target) === 'write'` resolved
> **first**, then the feature half `isAllowed(viewer, 'profile:identity:write')`,
> which every active employee holds implicitly through the `DEFAULT_PERMISSIONS`
> code constant (**D2**). The ordering is the invariant: the feature half can
> only subtract, never widen a resolved audience (`access-control.md` line 19).
> Because every session holder is an active employee, **no asserted outcome in
> `umac-01`..`umac-09` changes** — only the composition behind it. (b) **The
> section identifier is now the human key** `profile:identity`, not `'S1'`
> (**D4** / PLAT-E4-S4.1b, already landed in code); `S<n>` survives only as a
> §3.2 matrix-row citation. `umac-10` is **superseded** by
> [`s41c-sag-04`](./s41c-sag-04-functional-grant-never-widens-audience.md).

> **Amended 2026-09-06 (PLAT-E4-S4.2a — root-operator permission set).** The
> canonical ACM-1 `hr-admin` functional role grows from **three** permission
> keys to **six**: the three `user-management:*` keys plus
> `org:relationships:write`, `employee:departure:record` and
> `profile:timeline:write`. Four new scenarios below — `s42a-op-03`..`s42a-op-06`
> — are the consumer side of that change; the database side is
> [`fr-bootstrap/`](../../access-control-kernel/fr-bootstrap/) and the full
> amendment record is
> [`ACM1-FB-01`](../../access-control-kernel/fr-bootstrap/acm1-fb-01-three-canonical-permissions-seeded.md).
> **No asserted outcome in `umac-01`..`umac-09` or `s41c-sag-01`..`s41c-sag-05`
> changes**: none of the six keys is a section key, none appears in
> `SECTION_ACCESS_MATRIX`, and `hasSectionAccess` consults none of them.
>
> **One deviation is deliberate and is recorded, not softened.**
> `profile:timeline:write` is in the set by a dated Product Owner ruling (AF-2,
> Dmytro Novyk, 2026-09-06) that overrides the increment spec's own
> recommendation to exclude it. `canEditTimeline` discards its target, so this
> grant gives every present and future holder of `hr-admin` org-wide write
> access to every employee's career timeline with no relationship required —
> a **known, accepted deviation from a NORMATIVE invariant** (`access-control.md`
> line 19) in permanent production configuration. It stops being a deviation
> when `canEditTimeline` gains its audience half. See
> [`s42a-op-06`](./s42a-op-06-delegated-hr-admin-timeline-write-accepted-deviation.md);
> do not silently "fix" it.

> **Added 2026-09-06 (PLAT-E4-S4.2b — tree-root seed).** Three new scenarios
> below — `s42b-tr-02`..`s42b-tr-04` — are the HTTP-level, positive-fact half of
> the increment: a real two-level `direct` chain (`E2 → E1 → root`), built
> through the real `POST /users/:id/relationships` write route, terminates at
> root and resolves `reporting` write transitively, through the unmodified
> upward-walk CTE. The database-level negative fact — a fresh bootstrap writes
> zero `Relationship` rows — is
> [`S4.2b-TR-01`](../../access-control-kernel/tree-root-seed/s42b-tr-01-bootstrap-writes-no-relationship-row.md)
> in [`tree-root-seed/`](../../access-control-kernel/tree-root-seed/). **This is
> a verification, not new seed behaviour**: no schema, no migration, and no
> change to `prisma-relationship-graph.adapter.ts` or `assign-manager.action.ts`
> is authorized by these files. `s42b-tr-04` is the negative control — nothing
> about reaching **into** root moved for the employees the chain touches or for
> anyone outside it.

> **Added 2026-09-07 (PLAT-E4-S4.2d — dev seed spine).** One new scenario below
> — `s42d-ds-06` — is the HTTP-level counterpart to the five DB-level scenarios
> in [`dev-seed-spine/`](../../access-control-kernel/dev-seed-spine/), per Ask
> First **AF-1**. Where `S4.2b-TR-02` built its two-hop chain by hand through
> `POST /users/:id/relationships`, `s42d-ds-06` reads root's `reporting`
> resolution over a spine the new `db:dev:seed-org` script actually produced
> over a real, multi-department imported population — proving the same
> unmodified upward-walk CTE holds for the script's output, not only for a
> hand-wired fixture. This increment also **retires** `scripts/dev-grant-root.ts`
> and repoints `create:root`; neither change touches any asserted outcome in
> this folder's existing files.

Stage-1 scenario documents (AD-1) for **Epic 0 — Access Control Adoption**. They
mirror the dispatch entries `UMAC-1` / `UMAC-2` in
`_bmad-output/specs/spec-user-management-access-control-adoption/stories.yaml`
and answer `um-integration-contract-response.md` Q1 (the seam is the
`ACCESS_CONTROL_PORT` binding), Q2 (port shape kept, adapter UM-owned), Q3
(feature → audience/section mapping), Q4 (denials: `401` unresolved session, `403` authenticated viewer with empty audience — no "leak-free 404"), Q5
(the minimal S1-card projection ships in Story 0.1), and Q6 (seeded-UUID fixture
convention). (`UMAC-3` — the colleague deny→allow-narrowed flip — was **removed
2026-09-01** by human product decision: §3.2's S1 row is `R` for the Colleague
column, so a colleague reads the S1 identity card from Story 0.1 and there is
nothing to flip.)

Every required source for this Stage-1 package is cited across `umac-01`..`umac-06`:
this SPEC (CAP-1 / CAP-2 read half / CAP-3); AD-2 and AD-21 in
`architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md`; AD-3 in
`architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md`;
`access-control.md` denial conventions, §3.2 (S1 = `R` for Colleague), §3.3.4
(colleague whitelist), and matrix exceptions §3.3; `nestjs-di-tokens.md` (guards
are the only sanctioned port consumer; actions never inject ports);
`testing-strategy.md` (AD-1 stage separation); and
`um-integration-contract-response.md` Q1/Q2/Q4/Q5/Q6.

**Status:** `umac-01`..`umac-06` (Story 0.1) **approved 2026-09-01** by Dmytro
Novyk (Product Owner / Architect), then **revised and re-approved the same day**
when he directed folding the `{ data, canEdit }` capability envelope into
`GET /users/:id`; both entries are in
`_bmad-output/specs/spec-user-management-access-control-adoption/approvals.yaml`
(`UMAC-1-scenarios`, `stage-1-scenarios`; author = Claude Code agent, approver =
Dmytro Novyk). `umac-07`..`umac-09` (Story 0.2 write path) remain unapproved
draft. **Reframed to Variant A (product decision 2026-09-02, Dmytro Novyk):**
the identity-card edit gate is `canAccessSection('S1') === 'write'` alone (the
reporting-line manager or assigned People Partner) — §2.2's functional-permission
half is **not** applied to this section, so the write path no longer depends on a
`user-management:edit` kernel seed. `user-management:edit` survives only as the
adapter's internal routing key for the `PATCH` gate branch. `author != approver`
for every stage.

**Superseded 2026-09-05 (PLAT-E4-S4.1c).** The Variant A paragraph immediately
above is kept as the historical record of the 2026-09-02 decision; it is **no
longer the live rule.** SCP 2026-09-04 **D1** makes the identity-card edit a
dual gate again (audience half first, then the `DEFAULT_PERMISSIONS`-backed
feature half — **D2**), and **D4** replaces `'S1'` with `'profile:identity'`.
The asserted outcomes of `umac-01`..`umac-09` are unchanged; `umac-10` is
superseded by `s41c-sag-04`. `s41c-sag-01`..`s41c-sag-05` are Story 4.1c
Stage-1 draft, unapproved.

## The seam

The adoption seam is one line in `services/backend/src/user-management/user-management.module.ts`:
`{ provide: ACCESS_CONTROL_PORT, useClass: InterimAccessControlAdapter }`. Epic 0
rebinds it to a real `AccessControlFacade`-backed adapter in
`src/user-management/infrastructure/` and **deletes `interim-access-control.adapter.ts`
in the same change** (AD-21, no dual-running). One binding answers three routes.

**Updated 2026-09-05 (4.1c).** Behaviour is no longer chosen per feature string
for the two identity-card routes. `GET /users/:id` and `PATCH /users/:id` each
declare one `@RequireSectionAccess('<section>', 'read' | 'write')` line, and
`SectionAccessGuard` asks the port one question —
`hasSectionAccess(viewer, section, level, targetId)`. The section→endpoint map
**is** those decorator lines; there is no registry table to keep in sync. The
remaining rows still route by feature string until their own stories move them.

| Route | Route gate (declaration / feature constant) | Adapter behaviour |
| --- | --- | --- |
| `GET /users/:id` | `@RequireSectionAccess('profile:identity', 'read')` (4.1c; was the `user-management:read` routing key) | allow **any non-empty audience** (`self` / `reporting` / `pp` / `colleague`) → `200` with `{ data, canEdit }` — `data` the **S1 identity card** (same 12 fields for every audience), `canEdit` the read-only edit-gate hint. The read requirement is **audience-only**: every §3.2 row-S1 cell is at least `R`, satisfaction is by **rank** (`write` satisfies `'read'`), and there is **no feature half** — `DEFAULT_PERMISSIONS` holds no `:read` key, so a uniformly derived `profile:identity:read` would deny every read. `canEdit` is the separate `'write'` dual-gate question (`true` for a reporting-line manager / assigned PP, `false` for self / colleague), answered by the **same** `hasSectionAccess` call the `PATCH` gate makes. Unresolved session → `401` (interim resolver lax → `403`); authenticated active viewer, empty audience or non-active target → `403` (no "leak-free 404" — human decision 2026-09-01) |
| `PATCH /users/:id` | `@RequireSectionAccess('profile:identity', 'write')` (4.1c; was the `user-management:edit` routing key) | **Dual gate (SCP 2026-09-04 D1), audience-first:** `canAccessSection(v, 'profile:identity', t)` must already resolve to `write` (reporting-line manager or assigned PP — §3.2 row S1 gives them `RW¹`, and Self / Colleague only `R`), **and then** `isAllowed(v, 'profile:identity:write')`, satisfied for every active employee by `DEFAULT_PERMISSIONS` (**D2**). A failed audience half short-circuits, so no functional grant can widen it (`umac-10` → `s41c-sag-04`). `user-management:edit` is no longer part of this gate |
| `PUT /users/:id/photo` | `user-management:upload-photo` | Self-only (viewer id == target id) unless Product widens it |
| `GET /users`, `POST /users`, `DELETE /users/:id` | `user-management:list` / `:create` / `:deactivate` | `isAllowed` delegates straight to the facade — these three keys are exactly the ACM-1 seeded set |

**Response-body scope.** The S1-card DTO is a dedicated mapper on the
`GET /users/:id` handler only. `GET /users` (list), `POST /users`,
`PATCH /users/:id`, `DELETE /users/:id`, and `PUT /users/:id/photo` response
bodies are **unchanged** by this slice — the shared `toUserResponse` is not
rewritten. List projection is Epic 1 Story 1.5 / FR-15.

## `canAccessSection` section string

**Updated 2026-09-05 (SCP 2026-09-04 D4, realised by PLAT-E4-S4.1b).** The real
`AccessControlFacade.canAccessSection` takes **human section keys**:
`'profile:identity'` (the identity card), `'profile:leave'`, and
`'profile:projects'`. Those three are the rows of
[`SECTION_ACCESS_MATRIX`](../../../../services/backend/src/access-control/domain/constants/section-access-matrix.ts);
**every other string — including the retired `'S1'` / `'S10'` / `'S11'` — returns
`'none'`**, successfully and without throwing
([`acm5-sa-06`](../../access-control-kernel/section-access/acm5-sa-06-unsupported-section-returns-none.md)).
An unmapped key therefore fails **closed** at the User Management gate too
([`s41c-sag-05`](./s41c-sag-05-unmapped-section-fails-closed.md)).

`S<n>` is a `docs/project-requirements.md` §3.2 **matrix-row citation only** —
cite it for traceability, never pass it. Scenario prose written before
2026-09-05 that shows `canAccessSection(v, 'S1', t)` is describing the
pre-rename call; the argument today is `'profile:identity'`. Only
`profile:identity` has a live route consumer: 4.1c wires one decorator, and
`profile:leave` / `profile:projects` get theirs in whichever story routes them.

## Fixture convention (per `um-integration-contract-response.md` Q6)

Cases that need a **real audience** use `Bearer <token:<seeded-uuid>>` — a real
`User` row's UUID that `InterimSessionResolverAdapter` accepts unchanged
(`{ userId: persona }`) — **not** a literal persona placeholder like
`Bearer <token:Bob>` (which resolves to the non-existent string id `'Bob'` →
empty audience → `403` under the real facade via the guard; `401` once the real
session middleware lands). Stage-2 seeds real `User` rows and
real `Relationship` rows (`direct`, `people_partner`) and threads the returned
ids. The interim **session** resolver stays (Epic 2 retires it); only the interim
**access-control** adapter is deleted here.

## Colleague reads the S1 identity card (no "two-state" rule)

§3.2's S1 (Identity card) row is `R` for the Colleague column, and the matrix
legend defines Colleague as "any authenticated employee holding none of the above
roles" — so **every active authenticated viewer is at least a Colleague** and is
entitled to S1. `umac-04` is a **positive** test: colleague → `200` with the S1
card, the **same fields** as Self / reporting / PP. Story 0.1 ships the S1-card
projection (`id`, `firstName`, `lastName`, `photo`, `position`, `country`,
`city`, `workEmail`, `workPhone`, `birthDay`, `birthMonth`, `companyJoinDate`;
`ttId` / `isActive` / `customFields` / `createdAt` / `createdBy` absent). The
former "two-state" rule and adoption story `UMAC-3` were **removed 2026-09-01**.

The deferred **FR-17 Profile Projection** story (`deferred-work.md`) still owns
the *further* colleague narrowing — S10 dates-only (`GET /users/:id/leaves`), S11
project-name-only, S16 per-field visibility — on those **own surfaces**, plus
S7/S8 record flags and S1 derived-field immutability. It is no longer coupled to
`GET /users/:id`.

## Contents

| File | Story | State |
| --- | --- | --- |
| `umac-01-self-read-s1-card.md` | 0.1 | **approved 2026-09-01** (Self → 200, `{ data: S1 card, canEdit: false }` — Variant A: S1 is `read` for self) |
| `umac-02-reporting-line-viewer-read.md` | 0.1 | **approved 2026-09-01**; **canEdit reconciled to Variant A 2026-09-02** (reporting → 200, `{ data, canEdit: true }` — `canAccessSection` `'write'` is the whole gate) |
| `umac-03-assigned-pp-read.md` | 0.1 | **approved 2026-09-01**; **canEdit reconciled to Variant A 2026-09-02** (PP → 200, `{ data, canEdit: true }`) |
| `umac-04-colleague-read-s1-card.md` | 0.1 | **approved 2026-09-01** (**colleague → 200, `{ data, canEdit: false }` — positive test; `canEdit` false by section access**) |
| `umac-05-unresolved-session-read-denied.md` | 0.1 | **approved 2026-09-01** (unresolved session → `401`, interim → `403` via guard; authenticated active viewer with empty audience → `403`; no "leak-free 404" — human product decision) |
| `umac-06-no-target-isallowed-delegates-to-facade.md` | 0.1 | **approved 2026-09-01** (root → allowed on `GET`/`POST` `/users` + `DELETE /users/:id` = `200`/`201`/`200`; unrelated session, Ida, **and an `HR Admin` impostor with no FR grant chain** → `403` on all three — the facade never reads `User.position`; `interim-access-control.adapter.ts` deleted in the same cutover, AD-21) |
| `umac-07-write-dual-gate.md` | 0.2 | **amended 2026-09-05 (4.1c)** — Variant A superseded by SCP D1; the file name is accurate again: the identity-card edit is the `profile:identity` **dual gate** (audience `write` **and** the `DEFAULT_PERMISSIONS`-backed `profile:identity:write`), audience-first. Asserted outcomes unchanged. `write-adoption.e2e-spec.ts` UMAC-07 is green |
| `umac-08-write-rejects-org-fields.md` | 0.2 | ready for approval (§3.2 fn 1); E2E stays red until Story 1.2 Stage 3 adds `@IsEmpty()` on the org keys |
| `umac-09-photo-write-self-only.md` | 0.2 | Self-only (Open Decision v) — implemented via `@SelfOnly`; `write-adoption.e2e-spec.ts` UMAC-09 is green |
| `umac-10-write-fr-grant-override.md` | 0.2 | **SUPERSEDED 2026-09-05 by `s41c-sag-04`** (PLAT-E4-S4.1c; PO decision recorded in `spec-4-1c-require-section-access-gate.md`). Ratified the interim `user-management:edit` OR-override — the widening the 2026-09-03 review flagged. Text kept as the historical record with a dated pointer; its `write-adoption` describe block is retired by 4.1c's implementation stage. The dead `canEditS1` OR clause itself is Story 4.2's deletion |
| `s41c-sag-01-read-gate-any-audience-allows-none-denies.md` | 4.1c | draft — `GET /users/:id` read gate: any non-empty audience (`self` / `colleague` / `reporting` / `pp`) → `200`; satisfaction by rank, so `write` satisfies `'read'`; no feature half; empty audience / non-active target → `403` leak-free |
| `s41c-sag-02-baseline-holder-without-write-audience-denied.md` | 4.1c | draft — holding `profile:identity:write` via `DEFAULT_PERMISSIONS` is necessary, never sufficient: colleague and self `PATCH` → `403` with the row unchanged, `canEdit: false`; the audience half short-circuits before `isAllowed` |
| `s41c-sag-03-write-audience-plus-baseline-allows.md` | 4.1c | draft — reporting-line manager, assigned PP, and a transitive (two-hop) manager `PATCH` → `200`, change persists, follow-up `GET` → `canEdit: true`; no `UserPolicies` row anywhere, so the allow is the D2 code baseline |
| `s41c-sag-04-functional-grant-never-widens-audience.md` | 4.1c | draft — **supersedes `umac-10`.** A live FR grant (`user-management:edit`, and even an explicit `profile:identity:write`) over a colleague-only or self audience → `403`, `canEdit: false`; a `'none'` target stays closed. The `access-control.md` line-19 invariant, asserted mechanically. **Expected red before 4.1c's implementation stage** |
| `s41c-sag-05-unmapped-section-fails-closed.md` | 4.1c | draft — a section key with no `SECTION_ACCESS_MATRIX` row resolves `'none'` and denies for both `'read'` and `'write'`, with no throw, no log-and-allow, and `isAllowed` never called. No route declares an unmapped section, so its Stage-2 surface is the adapter unit spec plus kernel `acm5-sa-06` — see the flag in that file |
| `s42a-op-03-root-operator-capability-after-production-bootstrap.md` | 4.2a | draft — root provisioned by `db:seed && db:bootstrap:access-control` **with no dev script** imports a population, wires a `direct` manager edge, sets a department manager and records a departure → success on all four. **Expected red before Stage 3** on the last three (`403`): `org:relationships:write` and `employee:departure:record` are absent from the canonical set at the baseline commit. Flags a Stage-1 question — this needs a harness that boots Nest against a bootstrap-provisioned database, which no suite has today |
| `s42a-op-04-root-data-reach-unchanged-by-the-operator-set.md` | 4.2a | draft — the negative control: the same root still gets `403` on `PATCH /users/<unrelated>` and `canEdit: false` on the follow-up `GET`. Green before **and** after; a red here at Stage 3 means the increment widened data access and stops for a human. Root's edit reach is tree position (scope item 3), not a key |
| `s42a-op-05-delegated-hr-admin-gets-no-data-access.md` | 4.2a | draft — a second holder attached to the bootstrap's own canonical policy lists users (`200`) and reads a colleague card (`200`, `canEdit: false`), is refused `PATCH` (`403`, row unchanged) and every other section write (`403`), and gains the two feature routes. The `access-control.md` line-19 invariant restated for the six-key role |
| `s42a-op-06-delegated-hr-admin-timeline-write-accepted-deviation.md` | 4.2a | draft — **the AF-2 accepted deviation, asserted rather than left latent.** The same delegated holder, with no relationship to the target, writes and deletes career-timeline events (`201`/`204`) while still being refused that target's identity card (`403`, `canEdit: false`). Kept in its own file so the exception cannot soften the invariant in `s42a-op-05`. A later increment that narrows `canEditTimeline` supersedes this file with a dated pointer; it does not invert its expected results |
| `s42b-tr-02-root-resolves-reporting-write-two-levels-down.md` | 4.2b | draft — root imports two employees, wires a real two-level `direct` chain (`E2 → E1 → root`) through `POST /users/:id/relationships`, then `PATCH`/`GET /users/<E2>` → `200`/`canEdit: true`, two hops up the unmodified upward-walk CTE. **Expected green on first run** — a regression lock over an already-correct property, not red-to-green |
| `s42b-tr-03-root-has-no-upward-edge.md` | 4.2b | draft — `GET /users/<root>/relationships` → `200`, `data: []`, over the real endpoint (Gate B's `isAllowed('org:relationships:write')` disjunct is why root can read its own empty list at all). Re-proves `S4.2b-TR-01`'s database-level negative fact through HTTP, with two other people's edges already in the table. **Expected green on first run** |
| `s42b-tr-04-unrelated-and-colleague-reach-into-root-unchanged.md` | 4.2b | draft — the negative control: E1 (whose own edge points at root) and U (no edge anywhere) both still get `403` on `PATCH /users/<root>` and `canEdit: false` on `GET /users/<root>`. Relationship edges are directional — reaching down to E2 grants nobody reach back up into root. Green before **and** after; a red here means the increment widened reach into root |
| `s42d-ds-06-root-resolves-reporting-write-over-every-seeded-member.md` | 4.2d | draft — root reads `GET /users/:id` for a department lead (one hop), an ordinary member (two hops, through their lead), and the sole member of a single-person department (one hop, lead and member the same row) — all `200`, `canEdit: true` — over a spine `db:dev:seed-org` produced, never a hand-wired chain. **Expected red before Stage 3**: the script and its npm alias do not exist yet |
