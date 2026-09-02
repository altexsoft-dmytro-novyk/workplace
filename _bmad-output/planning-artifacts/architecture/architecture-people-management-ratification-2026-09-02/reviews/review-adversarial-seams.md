---
title: Reviewer Gate — Adversarial Seams lens
target: architecture-people-management-ratification-2026-09-02
target_revision: 2026-09-02-reviewer-gate-update
lens: adversarial-seams
date: 2026-09-02
verdict: FAIL
verdict_scope: >
  This lens assesses one question only: can two units one level down each obey every
  recorded decision, blocker and transition-debt item to the letter and still build
  incompatibly? It does not re-assess architecture correctness, which other lenses own.
evidence_baseline:
  workplace: 0e703d19150b4727c1f2b42e2f359df9995735dc
  services_backend: 08931ad14778f1953ca551c0e25c782afa4ccb1b
  verified: >
    Both SHAs confirmed as HEAD of their repository at review time (`git rev-parse HEAD`).
    Every code citation below is reproducible at those revisions.
findings: 18
severity_counts: {S1: 7, S2: 7, S3: 4}
---

# Adversarial Seams review — People Management ratification, revision `2026-09-02-reviewer-gate-update`

## Verdict

**FAIL.**

Not because the package is wrong, and not because it overclaims — it is unusually
disciplined about *not* overclaiming. It fails this lens because **seven constructed
pairs of units one level down each obey every recorded decision, blocker and
transition-debt item to the letter and still build incompatibly**, and because two of
those pairs are *internal contradictions of the package itself* rather than merely
uncovered ground:

- `CC-06` is recorded `design_status: resolved-approved` while a named, unresolved
  contract-shape decision is explicitly routed to it by the binding mentorship design
  (AS-05).
- `TD-04`'s deviation was widened from one route to six in this revision, but its
  `expiry_trigger` was left at the narrow scope. Retiring it exactly as written removes
  one sixth of the recorded risk (AS-01).

The package's own §9 condition 2 — *"Open blockers remain fail-closed and are not
inferred away"* — is not satisfiable as written, because four blockers carry
`closure_condition`s that can be met in full without removing the risk they name
(AS-01, AS-04, AS-09, AS-16). That is the failure mode this lens exists to catch.

**Scope honesty.** Nothing below reverses the package's ratification verdict on
architecture correctness, and nothing below is a release-readiness claim in either
direction. Every finding is a seam that lets two compliant teams diverge; the remedy
class for each is stated explicitly as **NEW BLOCKER**, **TIGHTEN EXISTING**, or **SPINE
AMENDMENT**.

**Method.** Findings are separated into *Confirmed* (verified against a file at the
pinned SHAs, with path and line) and *Assumption* (a construction that depends on a
reading I could not close from the repository). Assumptions are labelled inline and
listed again in §5.

---

## 1. Tier S1 — a team can build the wrong thing today

### AS-01 — `TD-04` widened its deviation and kept its narrow expiry trigger; retiring it on the stated trigger leaves five of six routes exposed

**Status: Confirmed.** **Remedy: TIGHTEN EXISTING (`TD-04`).**

**The pair.**

- **Team A** delivers adoption Story 0.1 exactly as approved. `spec-user-management-access-control-adoption/SPEC.md:172-181` scopes it explicitly: *"scope — the `GET /users/:id` handler only… The other five `toUserResponse` call sites in `users.controller.ts` — `GET /users` list items, `POST /users`, `PATCH /users/:id`, `DELETE /users/:id`, `PUT /users/:id/photo` — are **untouched by this slice** and keep returning what they return today. A Stage-2 assertion for this slice checks the `GET /users/:id` body shape and does not assert the other five."* Team A ships, gets approved production evidence, and is done.
- **Team B** owns transition-debt hygiene. `transition-debt.yaml:70` gives TD-04 the trigger `UMAC-1 S1 projection reaches approved production`. Team A just satisfied it verbatim. Team B retires TD-04, a **P0** item.

**Where they collide.** `transition-debt.yaml:60-67` (this revision's own widening) defines the TD-04 deviation as *"The whole-row `toUserResponse` serializer is applied by **every** User handler, not only `GET /users/:id`, so a broader User shape than the target S1 envelope is returned by **six routes** including the `GET /users` list."* After the retirement, five of those six routes still spread the whole `User` row —
`services/backend/src/user-management/application/dtos/user.response.ts:10-15` (`return { ...user, companyJoinDate: ... }`), reached from
`services/backend/src/user-management/application/controllers/users.controller.ts:65, 76, 90, 105, 112`. `ttId`, `isActive`, `customFields`, `createdAt` and `createdBy` — the exact five fields the SPEC lists as non-S1 at `SPEC.md:131-137` — keep flowing out of the `GET /users` list and every writer echo.

**Why this is the package's error, not the teams'.** Change #4 in §11 widened the *deviation* and left the *trigger* untouched. Both fields are in the same YAML block, eleven lines apart. A widened deviation with an unwidened trigger is strictly worse than the original narrow item: it now records a P0 risk **and** supplies an approved way to close the record without touching five sixths of it.

**Consequence.** A P0 data-projection debt is retired on evidence that covers one route, and the register then shows zero open projection debt while the `GET /users` list still emits internal fields to any holder of `user-management:list`.

**Remedy.** `TD-04`'s `expiry_trigger` must enumerate the same six routes its `affected_routes` block already lists, or split into `TD-04a` (`GET /users/:id`, trigger = UMAC-1) and `TD-04b` (the other five, trigger = Epic 1 Story 1.5 / FR-15 list projection plus the writer-echo decision). The `ungated_target_routes` sub-list needs its own trigger for the same reason — see AS-02.

---

### AS-02 — Deleting the interim adapter is Story 0.1's job, but two **P1** items gate the write path it also governs; a P0 cannot close until two P1s do, and self-service edit breaks in between

**Status: Confirmed.** **Remedy: TIGHTEN EXISTING (`TD-08` and `OQ-AC-EDIT` severity; `TD-01`/`TD-04` sequencing constraint).**

**The pair.**

- **Team A** implements CAP-1 as written: *"`interim-access-control.adapter.ts` is **deleted in the same change** — no dual-running, no compatibility alias (AD-21)"* (`SPEC.md:70-83`). This is Story 0.1, the read slice, which `SPEC.md:335` says *"proceeds now"*.
- **Team B** owns UM Epic 1 / the frontend profile surface and depends on `PATCH /users/:id` and `PUT /users/:id/photo` working for a Self viewer (FR-9, decided Self-only at `SPEC.md:340-342`).

**Where they collide.** One binding answers three routes, and `docs/architecture/access-control.md` says so explicitly: *"The seam is the single `ACCESS_CONTROL_PORT` provider binding… One binding answers three routes at once — `GET /users/:id`, `PATCH /users/:id`, `PUT /users/:id/photo` — so behaviour is chosen per feature, not per route."* Deleting the interim adapter therefore necessarily re-gates the two write routes at the same moment. The new adapter's write branch is the §2.2 dual gate, and `SPEC.md:147-152` states the outcome plainly: *"Because `user-management:edit` is **not yet seeded**… `isAllowed` fails closed and `canEdit` is `false` for every viewer today."* `AccessControlGuard` turns that into a hard denial —
`services/backend/src/user-management/application/guards/access-control.guard.ts:51-52` (`if (!isAllowed) { throw new ForbiddenException(); }`). Verified: the seeded catalog is exactly three keys and contains no `user-management:edit`
(`services/backend/src/access-control/infrastructure/bootstrap/access-control-bootstrap.ts` `CANONICAL_PERMISSIONS`, and the FR migration at
`services/backend/prisma/migrations/20260831070000_access_control_functional_roles/migration.sql:28,83`).

Team A is compliant. Team B is compliant. Between Story 0.1 landing and the Access Control kernel-seed sequence for `user-management:edit` reaching stage 3, **no employee can edit their own profile or replace their own photo.**

**The severity inversion.** `TD-04` is **P0** and its `ungated_target_routes` are `GET /users/:id`, `PATCH /users/:id`, `PUT /users/:id/photo`. Closing that P0 requires the dual gate. The dual gate requires `user-management:edit`, which is recorded as `TD-08` — **P1** (`transition-debt.yaml:117-123`) — and `OQ-AC-EDIT` — **P1** (`blockers.yaml:418-429`). A P0 whose closure is a strict consequence of two P1s is a severity rating that permits deferral of load-bearing work. `transition-debt.yaml:6-10` states the rule the package set for itself: *"Severity reflects the consequence if the deviation reaches a shared environment."* The consequence of TD-08 reaching a shared environment is either an ungated write path (if the interim adapter stays, contradicting AD-21's no-dual-running clause) or a broken self-service surface (if it goes). Both are P0 consequences.

**Remedy.** Raise `TD-08` and `OQ-AC-EDIT` to P0, or record an explicit ordering constraint on `TD-01`/`TD-04` naming the kernel-seed sequence as a co-requisite of the CAP-1 deletion. The package currently records the dependency nowhere machine-readable: `TD-01`'s `decisions:` list is `[AD-6, AD-9, AD-12, AD-21]` and `TD-08` is not referenced from it.

---

### AS-03 — `User.isActive` is the fourth, unrecorded writer *and* the live reader of employment state; `CC-08` names three writers and omits it, so closing CC-08 as written leaves a resurrection path

**Status: Confirmed.** **Remedy: TIGHTEN EXISTING (`CC-08` scope) — resolution itself still needs a SPINE AMENDMENT.**

`CC-08` (`blockers.yaml:279-287`) states the gap as *"`EmploymentStatus` has three candidate writers"*: (a) the AD-20 departure executor, (b) the AD-16 seeded import, (c) the future TimeTracker sync. Its `closure_condition` is *"An approved architecture decision naming the sole writer of `EmploymentStatus` and the permitted behaviour of every other candidate writer."*

**The omitted writer.** `User.isActive` is written today by the legacy deactivation path —
`services/backend/src/user-management/infrastructure/user.repository.ts:59` (`data: { isActive: false }`), reached from `DeactivateUserAction` and `DELETE /users/:id`
(`users.controller.ts:109-113`). That route is recorded as `TD-03`, **P1**. AD-16 is explicit that *"`User.isActive` remains a technical account/row-retention flag and is not employment status"*, and `docs/architecture/database-schema.md:51` repeats it. But the seed contract deliberately breaks that separation as a stopgap:
`docs/test-cases/user-management/seed/README.md:37` — *"`User.isActive` may be set `false` for a dismissed import row as the stopgap until the `EmploymentStatus` aggregate lands."* CC-08 records that stopgap under writer (b) but treats it as a fact about `EmploymentStatus`, not about `isActive`'s own writer set.

**Why the omission is load-bearing.** `isActive` is not an inert flag: it is the live authorization switch for both facade paths.
`services/backend/src/access-control/infrastructure/prisma-identity.adapter.ts:24` filters `isActive: true` before any audience is derived, and the FR evaluator joins the same column
(`services/backend/src/access-control/infrastructure/prisma-functional-role.repository.ts`). The relationship-graph adapter joins it on every hop
(`services/backend/src/access-control/infrastructure/prisma-relationship-graph.adapter.ts`).

**The pair.**

- **Team A** builds the AD-16 idempotent seeded import against the approved seed README. AD-16 says the import is *"idempotent"* and keyed by external identity; the CSV is state-at-sync (`TIMETRACKER-CONTRACT`'s own finding). Team A maps `IsDismissed=0 → isActive=true` on every run, because idempotent state-at-sync import means converging the row to the source.
- **Team B** builds the AD-20 executor. Its apply transaction *"deactivates account/profile"* and inserts the `dismissed` fact.

**Where they collide.** A departure applies on day 1. The next import run on day 2 reads a CSV where the leaver's `IsDismissed` has not yet flipped (or flips back on a rehire), sets `isActive=true`, and **silently restores every audience and every functional permission** the departure revoked. AD-20's request-time cutoff is scoped to *"an actor with a due departure"* — an *applied* departure is no longer due, so the cutoff does not backstop this. Closing `CC-08` exactly as written — naming a sole writer of `EmploymentStatus` — does not touch `User.isActive`'s writer set at all, so the risk survives its own closure condition.

**Remedy.** `CC-08` must name `User.isActive` as a contested column with four writers (import, legacy `DELETE /users/:id`, AD-20 executor, future sync), and its `closure_condition` must require a rule for `isActive` writes, not only for `EmploymentStatus`. Related: `CC-08.depends_on` is `[]` (`blockers.yaml:269`) while `CC-11` says *"decide the two together"* — the link exists in prose only and no validator can see it.

---

### AS-04 — `CC-06`'s `depends_on` chain is incomplete, and its `closure_condition` is fully satisfiable while AD-20 remains unbuildable

**Status: Confirmed.** **Remedy: TIGHTEN EXISTING (`CC-06`).**

`CC-06` (`blockers.yaml:62`) declares `depends_on: [CC-07, CC-08, CC-09]` and a `closure_condition` of *"CC-07, CC-08, and CC-09 resolved, then Departure/EmploymentStatus persistence and executor reach independently approved production evidence."*

**Three dependencies the AD-20 rule text requires and CC-06 does not list:**

1. **`CC-11` (P1).** AD-20's apply transaction *"ends persisted access assignments held by the actor"*, and its recording gate says *"new synced PM/DM grants to that employee are rejected or quarantined with an incident"* and *"No admin policy may shadow the sync source."* Both clauses presuppose an answer to CC-11 — who writes `Relationship type='project'`. Resolving CC-07/08/09 does not answer it.
2. **`OPERATIONAL-ENVELOPE` (P0).** AD-20's own *"Operational release gate"* demands a startup-validated `BUSINESS_TIME_ZONE` in every environment, at least one worker process against the same PostgreSQL source, five named health signals, alert ownership and a manual retry surface. The package correctly rates this P0 and correctly notes that *"AD-20 classifies mixed process configuration as a startup/deployment failure"* — then does not put it in the dependency list of the blocker that gates AD-20's implementation.
3. **The `action-items` context owner** — see AS-11.

**The pair.** **Team A** (Architect) closes CC-07, CC-08 and CC-09 and marks CC-06's dependencies satisfied. **Team B** (delivery) reads `CC-06.closure_condition`, sees the dependency clause met, and dispatches the departure executor. Both are compliant. Team B then discovers mid-slice that it must invent a project-grant quarantine rule (CC-11), a timezone validation contract, and a worker topology — the three things the package rates as blocking elsewhere but does not wire into the blocker that fronts them.

**Consequence.** A false-confidence closure by construction: the condition is met, the risk is not removed.

**Remedy.** `depends_on: [CC-07, CC-08, CC-09, CC-11, OPERATIONAL-ENVELOPE]`, and a `closure_condition` clause requiring the operational envelope's AD-20-facing items (timezone validation, worker topology, health signals, alert ownership, manual retry surface) to be decided rather than merely owned.

---

### AS-05 — `CC-06` is `design_status: resolved-approved` while the binding mentorship design routes an open, named contract-shape decision *to CC-06*

**Status: Confirmed.** **Remedy: TIGHTEN EXISTING (`CC-06` back to `design_status: partial`).**

The shared unit-of-work contract exists in two incompatible shapes in two documents the package treats as authoritative:

- `docs/architecture/domain-driven-design.md:18` — *"Participating application services expose `applyDepartureEffects({departureId, leaseToken, tx})`-shaped operations."*
- `docs/architecture/mentorship.md:320-328` — mentorship's export is `applyDepartureEffects({ departureId, departingUserId, effectiveDate, leaseToken, tx })`, and `mentorship.md:348-350` says so explicitly: *"`domain-driven-design.md` shows the bare `{departureId, leaseToken, tx}`. mentorship needs `departingUserId` and `effectiveDate` too (Decision 10) — **resolve with CC-06**."* Decision 10 is listed in mentorship.md's open-decision register with owner `A (CC-06)`.

`blockers.yaml:60` records `CC-06.design_status: resolved-approved`, and `ARCHITECTURE-RATIFICATION.md` §7.1 asserts *"`CC-04` and `CC-06` moving to design-approved means two *design* questions are answered."*

**The pair.** **Team A** builds the AD-20 executor against `domain-driven-design.md`'s three-field call. **Team B** builds `mentorship/application/actions/ApplyDepartureEffectsAction` against mentorship.md's five-field signature. Both cite an approved-or-binding document; the executor cannot call the participant. Worse, mentorship's stated idempotency depends on `effectiveDate` reaching it: the system-close `UPDATE` sets `endedAt = :effectiveDate` (`mentorship.md:332-336`), which a three-field executor cannot supply, so Team A would have to either read `Departure` from inside mentorship (which `mentorship.md:322` explicitly forbids — *"mentorship does not read Departure"*) or substitute a wall-clock date, breaking the AD-20 timezone rule.

**Consequence.** The register asserts a design question is closed while the design document that consumes it names the same question open and points at the closed blocker. Any consistency validator built from §10's new automation candidates would still pass this, because the contradiction is between a blocker's `design_status` and a companion architecture document, not between the four package files.

**Remedy.** `CC-06.design_status` returns to `partial`, with an explicit `remaining_design_gaps` entry naming the `applyDepartureEffects` signature and mentorship Decision 10. If the Architect intends the five-field shape, that is a `domain-driven-design.md` correction, which is a companion edit and therefore inside a documentation-only package's reach.

---

### AS-06 — The `{data, canEdit}` envelope has no composition rule, and `OQ-118`'s only evidence path does not contain the envelope

**Status: Confirmed.** **Remedy: TIGHTEN EXISTING (`OQ-118` scope and evidence).**

**The evidence defect first.** `OQ-118` (`blockers.yaml:451-459`) cites exactly one evidence path: `docs/architecture/api-conventions.md`. That file is 74 lines and contains **no occurrence of `canEdit`, `data,` or `envelope`** (verified by `rg` across the repository: the envelope is defined in `docs/architecture/access-control.md:205-214`, `_bmad-output/specs/spec-user-management-access-control-adoption/SPEC.md:94-160`, and `_bmad-output/implementation-artifacts/access-control/um-integration-contract-response.md:45-368`). The adoption SPEC itself says rolling the envelope *into* `api-conventions.md` is a separate, unstarted planning item (`SPEC.md:159-161`). So the blocker points at the file where the contract will eventually live, not at any file that states it.

This is a direct hit on the new automation candidate added by this revision — *"Evidence-path existence, asserting file rather than directory"* (§10). That check passes on `OQ-118` today, because the file exists. Existence is not probativeness.

**The pair.**

- **Team A** delivers Story 0.1's `GET /users/:id` and writes the Stage-2 assertion the SPEC mandates: *"asserting `data` is **exactly** the 12 S1 fields"* (`SPEC.md:196-199`, and the enumerated list at `SPEC.md:125-131`).
- **Team B** delivers mentorship FR-M16/FR-M17. `mentorship.md:228` requires the S13 summary and the S1 `mentor` field to be served *"`GET /users/:id` (inline)… **no new route**"*, and `mentorship.md:400-403` says the profile assembler *"just inlines the non-null result under an `s13` / `mentorship` key."* `SPEC.md:137-140` independently confirms `mentor` is an S1 field whose supply is deferred, not relocated: *"The S1 derived display fields — manager, people partner, department, **mentor**, current project(s) — come from other contexts and are out of scope for this route until those land."*

**Where they collide.** Team B must put `mentor` somewhere. Inside `data` breaks Team A's exact-12-field assertion and Team A's own SPEC text. Beside `data` breaks the stated envelope shape, which `SPEC.md:154-158` defines as two keys per section resource. And `s13` has three equally-compliant homes: a third top-level key, a key inside `data`, or a nested `{data, canEdit}` per `SPEC.md:154-158`'s *"each readable section/resource is its own endpoint returning `{data, canEdit}`"* — except mentorship explicitly says **no new route**, so "its own endpoint" is unavailable.

**A second, sharper divergence in the same seam.** `mentorship.md:260-261` specifies `GET /users/:id/mentorship-availability` returning `{ openToMentoring }` — a bare object, not enveloped — while the envelope convention says every section/detail read gets `{data, canEdit}`. And the `canEdit` semantics do not compose: `canEdit` is defined as `isAllowed(viewer, 'user-management:edit') && canAccessSection(viewer,'S1',target)==='write'` (`access-control.md:205-207`), which `SPEC.md:148-149` says is `false` for **every** viewer today, whereas the availability flag's write gate is pure identity equality with *"**no** facade call"* (`mentorship.md:253-259`). A Self viewer therefore sees `canEdit: false` on a surface they can in fact write. A frontend that honours the hint hides a control that would have worked; FR-M1 self-service becomes unreachable through the UI while both backends are correct.

**Remedy.** `OQ-118` must (a) cite `docs/architecture/access-control.md` and the adoption SPEC as its real evidence, (b) widen `blocks:` from *"envelope ownership"* to include the **composition rule** — how a multi-context profile read nests sections and derived fields, and whether `canEdit` is per-envelope or per-section — and (c) be linked to `OQ-117`, which it already recommends deciding together but does not reference in a machine-readable field.

---

### AS-07 — The denial-oracle conflict escapes `CONFLICT-UM-01`'s single-route scope; two contexts ship opposite oracles and the pair leaks

**Status: Confirmed.** **Remedy: TIGHTEN EXISTING (`CONFLICT-UM-01` scope and `propagation` list).**

`CONFLICT-UM-01` (`blockers.yaml:135`) declares `blocks: ['Single empty-audience denial oracle for GET /users/:id']` — one route — with `alternatives: [403, 404]` and a `propagation` note naming *"Four artifacts"*.

**The conflicting authorities, both approved the same day.**

- `docs/architecture/access-control.md` "Denial conventions": *"valid token without feature permission or write to a readable section → `403`; valid token touching a `—` cell or hidden field → **`404` with a leak-free body**."* This clause is **not** withdrawn — the 2026-09-01 revision note in the same file withdraws the leak-free 404 *only* for `GET /users/:id`.
- `sprint-change-proposal-2026-09-01-user-management-access-control-alignment.md:84, 205-207, 463, 486`: *"empty audience → leak-free `404`"*, repeated four times.
- `spec-user-management-access-control-adoption/SPEC.md:96-104`: *"There is no `404` authorization branch on this route… empty → `403`."*

**The pair.**

- **Team A** ships UM adoption: empty audience on `GET /users/:id` → `403` (per the SPEC). The runtime already splits this way — `access-control.guard.ts:51-52` throws `ForbiddenException`, `get-user.action.ts:11-12` throws `NotFoundException`.
- **Team B** ships mentorship. `mentorship.md:223` and `mentorship.md:431`: *"`404` (leak-free) if the viewer has no S13 base access over **either** participant"*, justified as *"S13 Colleague cell is `—`"* — i.e. Team B is applying `access-control.md`'s still-standing `—`-cell rule, correctly.

**Where they collide.** The two oracles are individually defensible and jointly a leak. A viewer probing a user id gets `403` from `GET /users/:id` (proving the id resolves to an active user, since the SPEC states the only `403` cause on that route is an empty audience, *"which on this read route means the target is not an active `User`"*) and `404` from `GET /mentorship-pairs/:id`. Composing the two responses reconstructs information neither endpoint intends to disclose. Neither team violated anything.

**Remedy.** `CONFLICT-UM-01.blocks` must be widened from one route to *the platform-wide denial oracle for empty-audience and `—`-cell reads*, and its `propagation` list must enumerate `docs/architecture/access-control.md`'s Denial conventions clause and `docs/architecture/mentorship.md` §3/§6 alongside the four artifacts it already names. The blocker's own warning — *"do not fix one in isolation"* — is defeated by a propagation list that omits the two documents a second context is building from.

---

## 2. Tier S2 — a team can build something that silently defeats a control

### AS-08 — Deployment silently restores permissions a runtime administrator revoked

**Status: Confirmed.** **Remedy: NEW BLOCKER.**

`AD-7` states *"FR policies are runtime-editable via HR Admin UI (§2.3)"*. `OQ-105` (P1) owns *"the HR Admin grant and revoke chain"*. The Access Control spine's AD-3 fixes the deployment order as `db:deploy → db:seed → db:bootstrap:access-control → start:prod` — i.e. the bootstrap runs on **every** deploy.

The bootstrap's grant step is additive-only and says so in its own comment:
`services/backend/src/access-control/infrastructure/bootstrap/access-control-bootstrap.ts` — *"Ensures the three canonical pairs are **PRESENT** — not that they are the only ones"*, implemented as `INSERT … ON CONFLICT ("policyId","permissionId") DO NOTHING`. The drift guard (`assertCanonicalPolicyShape`) fails on `operator`, `managedBy` and target drift, but has no opinion on grants.

**The pair.** **Team A** ships runtime role administration per AD-7 and OQ-105; an administrator revokes `user-management:deactivate` from the `hr-admin` role (a legitimate least-privilege action). **Team B** deploys. The bootstrap re-inserts the pair. The revocation is undone with no error, no log, and no drift failure — the code path is explicitly designed to be silent about extra/missing grants.

**Why this is not already covered.** `OQ-PERM-01` is scoped to *"Default functional-role permission **assignments**"* and its note says *"seeding does not establish a catalog"* — it is about what the defaults should be, not about whether the seed may overwrite an administrator's later decision. `OQ-105` is scoped to the grant/revoke chain's shape. Neither records the seed-versus-runtime write-precedence question. The Access Control spine's own phrasing — *"never delete or rewrite later **non-bootstrap** catalog rows or attachments"* — protects rows the seed does not own, and the `hr-admin` grants are precisely the rows it does own.

**Remedy.** NEW BLOCKER (suggested `CC-12`, P1): an approved write-precedence rule between the deploy-time bootstrap and runtime FR administration, covering grant revocation, the root attachment, and whether a revoked seed-owned grant is drift (fail), restored (current behaviour), or respected.

---

### AS-09 — A departed employee stays in the willing-mentor pool; `CC-10`'s closure condition never touches it

**Status: Confirmed.** **Remedy: NEW BLOCKER or TIGHTEN `CC-06`.**

AD-20's apply transaction enumerates its effects: *"closes the active employment interval, inserts the idempotent dismissed fact, deactivates account/profile, cancels open action items, system-closes mentorship pairs, ends persisted access assignments held by the actor, and marks the departure applied."* `MentorshipAvailability` is not in that list, and `mentorship.md:161-164` makes the independence structural: *"`SetMentorshipAvailabilityAction` upserts `{userId, openToMentoring}`. It **never** reads or writes `MentorshipPair`."* `applyDepartureEffects` (`mentorship.md:330-341`) touches pairs only.

The pool query is `MentorshipAvailability WHERE openToMentoring` joined to S1 (`mentorship.md:167, 226`) with no `isActive` predicate stated anywhere in §2.2, §3 or §6.

**The pair.** **Team A** builds the AD-20 executor to the letter of its effect list. **Team B** builds `GET /mentorship-pool` to the letter of `mentorship.md`. A dismissed employee whose flag was `true` remains listed as available to mentor, and — because FR-M5 mentee-scoping gates the *mentee*, not the mentor — can be selected as a mentor by a compliant `POST /mentorship-pairs`.

**Why the existing blockers do not catch it.** `CC-10` (P0) does block *"MentorshipAvailability aggregate"*, but its `closure_condition` is *"A recorded design-approval gate for the 2026-09-01 AD-5 and AD-17 amendments, and an approved rule for how a spine's status label and its in-body amendments relate."* Both halves are governance artifacts. Recording an approval and writing a labelling rule closes CC-10 in full and surfaces nothing about departure interaction. This is a false-confidence closure: the blocker's *name* covers the aggregate, its *condition* covers only paperwork.

**Remedy.** Either add the aggregate to AD-20's effect list via `CC-06`'s design gates, or open a NEW BLOCKER (P1) for departure's effect on non-access mentorship state. Separately, `CC-10`'s `closure_condition` should be split so the governance half cannot close the aggregate half.

---

### AS-10 — `CC-11` covers only `type='project'`; `direct` has three writers and `people_partner` has two incompatible concurrency contracts

**Status: Confirmed.** **Remedy: TIGHTEN EXISTING (`CC-11` scope).**

`CC-11` (`blockers.yaml:406-416`) blocks *"`Relationship type='project'` writes"* and correctly identifies its class: *"Same class of sole-writer ambiguity as CC-08."* It then stops at one of the three types.

**`type='direct'` — three writers, no rule.** (a) The AD-16 seeded import establishes the reports-to tree. (b) AD-14 fixes a generic admin command: *"generic `POST/DELETE /users/:id/relationships` for `direct|project`."* (c) AD-20's re-parenting command *"atomically reassigns exactly the still-current **platform-owned** direct/department/PP blocker set."* Plus a fourth in waiting: the spine's Deferred list names *"`resourcing` context's write path into `Relationship`"* and says its flow *"must go through `user-management`'s application layer (AD-2), never write `Relationship` rows directly"* — a stated intent with no blocker and no owner.

**`people_partner` — two concurrency contracts on one row.** AD-19 fixes `PUT /users/:employeeId/relationships/people-partner {targetId, expectedCurrentTargetId}` with *"existing-row update predicates on employee/type/expected target"* and `DELETE` carrying the expected PP in `If-Match`. AD-20's re-parenting writes the same PP edge predicated on `expectedBlockerVersion`, *"an opaque digest of their sorted identities/targets"*. Two optimistic-concurrency tokens over one partial-unique-indexed row, each mapping failure to `409`.

**The pair.** **Team A** implements the AD-19 route and its `409` semantics. **Team B** implements AD-20 re-parenting and its digest `409`. Both write the same row through different predicates. A Team-A write that lands between Team B's digest computation and its write is caught by the digest — but a Team-B re-parenting write is invisible to Team A's `expectedCurrentTargetId` check only if Team A refetches, and neither AD requires the two paths to share a lock order or a journal-entry shape. AD-19 requires *"one old→new journal record in the same transaction"*; AD-20 requires *"journals every before/after change"*. Whether those are the same record shape is exactly the `CC-07` gap — but `CC-11` does not reference `CC-07`, and `CC-07` does not reference the two write paths.

**Remedy.** Widen `CC-11` to *"`Relationship` write ownership across all three types"*, add the `resourcing` future writer, and add `depends_on: [CC-07]` plus a cross-reference to `CC-08` (which its own note already asks for in prose).

---

### AS-11 — `action-items` is a named participant in the AD-20 shared transaction and exists in no context list, no register, and no blocker

**Status: Confirmed.** **Remedy: NEW BLOCKER.**

`docs/architecture/domain-driven-design.md:16` — *"The AD-20 executor… calls exported application services of **action-items**, mentorship, access-control, and other owning contexts under one shared PostgreSQL unit of work; it never reaches into their domain or infrastructure folders."*

AD-5's confirmed context list is `user-management`, `access-control`, `dashboards`, `mentorship`; its pending list is `profile, resourcing, cds, risk, feedback, campaigns, career-timeline`. `action-items` is on neither. AD-14 gives it a route (`action-items` as a top-level cross-user collection) with no owner. `OQ-117` covers `profile` placement only. §4.2 of the ratification lists absent capabilities and does not name action items.

**The pair.** **Team A** builds the AD-20 executor and, finding no `action-items` context and no exported service, cancels action items with a direct write inside the shared `tx` — a clean AD-2 violation that no blocker warned them about. **Team B** later builds `action-items` as a proper context per AD-5 and discovers user-management owns its table.

**Remedy.** NEW BLOCKER (P1): owning context for `action-items`, and the `applyDepartureEffects`-shaped boundary AD-20 requires from it. Fold into `CC-06.depends_on` per AS-04.

---

### AS-12 — Retiring `TD-07` does not retire mentorship's parallel S13 section-decision, and the two disagree on `project`

**Status: Confirmed.** **Remedy: TIGHTEN EXISTING (`TD-07` expiry scope).**

`TD-07` records *"`canAccessSection` supports only the implemented base section slice"*, `decisions: [AD-10, AD-17]`, expiry *"S9 and S13 increments reach approved production."* The facade confirms the limit:
`services/backend/src/access-control/application/access-control.facade.ts:52-54` returns `'none'` for every section other than `S1`/`S10`/`S11`.

`mentorship.md:363` and Decision 3(b) authorise an interim workaround: *"Interim: derive from `resolveAudiences` ∩ `{reporting, project, pp, self}`; colleague/empty → `404`. Marked `// INTERIM` with the expiry trigger."*

**The pair.** **Team A** (Access Control) ships the real `canAccessSection('S13')` increment and retires `TD-07` on its stated trigger. **Team B**'s interim derivation is still in `src/mentorship/` — nothing in `TD-07`'s expiry requires its removal, because `TD-07` is owned by `access-control-section-increments` and lists no mentorship evidence path. Two section-access implementations now coexist.

**And they disagree.** Team B's interim set includes `project`. AD-10 states *"Project line is narrower (§3.3.2)"* and that project-derived access is fail-closed until the TimeTracker contract lands (`TD-06`, still open). A mentorship read that grants S13 on a project audience while the facade grants nothing on one is a divergence that appears the moment `TD-06` retires — and mentorship's own closure-note narrowing (`mentorship.md:365`) also keys on `project`, so the more sensitive field inherits the wider set.

**Remedy.** `TD-07`'s `expiry_trigger` must include removal of every recorded interim section derivation, and the item needs a second `owner` for the mentorship-side interim. Better: record the mentorship interim as its own transition-debt item so it has an independent owner and trigger.

---

### AS-13 — The `Permissions` shape supersession is recorded as legitimate but owned by nobody, while the AC spine tells the future catalog team it is unconstrained

**Status: Confirmed.** **Remedy: SPINE AMENDMENT.**

`evidence-matrix.yaml:62-67` records the divergence and calls it *"a legitimate supersession by the Access Control spine, but recording it is this document's job and it recorded nothing."* Recording it is correct. What follows from the record is not addressed.

Verified state: `services/backend/prisma/schema.prisma:121-131` and
`services/backend/prisma/migrations/20260831070000_access_control_functional_roles/migration.sql:28,83` deliver `Permissions {id, key, description}` with `key` unique. The parent spine's AD-7 rule text and its Structural Seed ERD both still specify `Permissions {id uuidv7, title, description}`.

**The pair.** **Team A** (Access Control kernel) writes and reads `key`. **Team B** builds the `/roles` catalog surface. Both spines point Team B away from the delivered shape: the parent spine's Deferred list says *"`/roles` catalog surface — AD-14 fixes attachment… but full request/response shapes aren't specified"*, and the AC spine's Deferred says `/roles` and *"the complete §2.3 permission catalog remain out of the Kernel MVP **without constraining their future normative contract**"*. Told explicitly that its contract is unconstrained, Team B's only normative shape is the parent spine's ERD — `title`. It ships a catalog API over a column that does not exist.

**Why recording is not enough here.** Every other recorded divergence in this package has a blocker or a debt item carrying it. This one has neither: no `TD-`, no `CC-`, no `OQ-`. §11's "Known remaining findings" lists five carried items and this is not among them.

**Remedy.** SPINE AMENDMENT to AD-7 and the Structural Seed ERD (`title` → `key`, with the append-only immutability rule), or — if the amendment is out of reach for a documentation-only package — a NEW BLOCKER holding the `/roles` and catalog contract until the two spines agree. Note that the AC spine's own Deferred already flags a related synchronisation debt (*"the current inline FR policy body in `api-conventions.md` is superseded for FR and must be synchronized"*), which is likewise in no register here.

---

### AS-14 — `TD-03` carries the privilege payload of a P0 security blocker at P1, with no deploy gate

**Status: Confirmed.** **Remedy: TIGHTEN EXISTING (`TD-03` deploy gate).**

`SEC-AUTH-01` (P0) and `TD-02` (P0) describe a three-step escalation: any `Bearer <token:persona>` resolves
(`interim-session-resolver.adapter.ts:37-48`); `Root` self-provisions a `position: 'HR Admin'` row
(`interim-session-resolver.adapter.ts:74-87`); the interim adapter grants `user-management:create|deactivate|list`
(`interim-access-control.adapter.ts:11-14, 26-27`). Verified at all four sites.

The **capability** those three grants unlock is the legacy routes — `POST /users` and `DELETE /users/:id`
(`users.controller.ts:72-79, 109-113`) — which are `TD-03`, **P1**, with expiry *"Seeded-import and departure cutover removes both legacy product operations"* and **no `deploy_gate` field**. `TD-02` was given a deploy gate by this revision precisely because *"a deviation that defeats an authorization invariant is P0 even while it is latent."* The routes the invariant protects were left one tier down and ungated.

**The pair.** **Team A** retires `TD-02` by shipping magic-link authentication, satisfying the P0 deploy gate. **Team B** has not yet reached the Epic 1 cutover, so `TD-03` stands. The system now deploys with real authentication and a live employee-creation and deactivation API — a direct contradiction of AD-16's *"There is no employee-creation/provisioning API"* — and no gate anywhere blocks the deploy, because the only gate was attached to the item that just closed.

**Remedy.** Give `TD-03` its own `deploy_gate` mirroring `TD-02`'s, or note in `TD-02`'s gate that it is not satisfied while `TD-03` is open.

---

## 3. Tier S3 — register hygiene that permits divergence

### AS-15 — `AD-5` and `AD-17` are rated `ratified` while `CC-10` (P0) says their governing amendments landed with no approval gate

**Status: Confirmed.** **Remedy: TIGHTEN EXISTING (`evidence-matrix.yaml` `blocked_by`).**

`CC-10` states *"AD-5 was amended and AD-17 refined on 2026-09-01 with no approval ledger entry."* The package's `binds_spine` commit includes both amendments. Yet `evidence-matrix.yaml:41-46` rates AD-5 `design: ratified` and `:144-149` rates AD-17 `design: ratified`, neither with a `blocked_by` field — a field the same file does supply for AD-19 (`[CC-07, DEPARTMENT-EDGE]`) and AD-20 (`[CC-08, CC-09]`).

**The pair.** **Team A** reads §3 (`AD-5 | ratified`, `AD-17 | ratified`) plus `mentorship.md`, which the spine calls *"Binding design"*, and starts `src/mentorship/`. **Team B** reads `CC-10` (P0, *"blocks: Mentorship bounded context"*) and holds. The register and the blocker list give opposite instructions and both are authoritative.

**Remedy.** Add `blocked_by: [CC-10]` to AD-5 and AD-17 in `evidence-matrix.yaml`, and footnote §3's rows. The status model already supports this; only the field is missing.

### AS-16 — `QUALITY-GATE-AC`'s closure condition admits a non-passing gate and a covered-but-failing test

**Status: Confirmed.** **Remedy: TIGHTEN EXISTING (wording).**

`closure_condition: ACM3-II-06 covered and the gate re-evaluated to a non-FAIL status`. Two openings. *"Covered"* is a coverage predicate, not a result predicate — a written and committed red scenario is covered. *"Non-FAIL"* admits `CONCERNS`, `WAIVED`, or `INCOMPLETE`. The scenario file exists at
`docs/test-cases/access-control-kernel/inactive-identity/acm3-ii-06-repeat-before-viewer-proof.md`, so the coverage half is closer to satisfiable than the note implies. Given the blocker's own framing — *"Naming it explicitly stops an untested security invariant reading as a paperwork item"* — the condition should read *"ACM3-II-06 passing"* and *"gate_status PASS with p0_status MET and critical_open 0"*.

### AS-17 — `AD-18`'s `not-applicable` rating exempts a live security input from any conformance obligation

**Status: Confirmed** (the package carries this in §11; restated here with a constructed pair, because the carried note does not include one). **Remedy: TIGHTEN EXISTING.**

AD-18 fixes *"timetracker project assignment is security input"*. `evidence-matrix.yaml:150-154` rates its implementation `not-applicable`. `TT-PMDM-01` (P1) records that the only available join for PM/DM is an untyped display-name string and calls it *"a fail-open risk"*.

**The pair.** **Team A** builds the TimeTracker adapter and joins PM/DM on display name, because `TT-PMDM-01` is P1 and its closure condition is an *approved identifier* that has not arrived. **Team B** builds the AD-10 project-line pass and consumes those edges as authorization inputs, because AD-18 says project assignment is security input. Nothing rates AD-18 as violated, because `not-applicable` carries no conformance obligation to violate.

**Remedy.** Rate AD-18's implementation `absent` rather than `not-applicable`, or record which fixed facts have live consumers and are therefore conformance-bearing.

### AS-18 — Prose dependencies between blockers are invisible to the validators this revision commissioned

**Status: Confirmed.** **Remedy: TIGHTEN EXISTING (machine-readable links).**

Four cross-blocker dependencies exist only in free-text `note:` fields: `CC-11` → `CC-08` (*"decide the two together"*), `OQ-117` → `OQ-118` (*"decide the two together"*), `OQ-116` → `DEPARTMENT-EDGE` (which does carry `depends_on`, so only one direction is machine-readable), and `CC-06` → the operational envelope (not present in either form). §10 commissions a cross-file consistency validator and simultaneously concedes *"The referential-integrity check is not implementable until `decisions:` has defined semantics."* The same defect applies to `depends_on`: it is populated on three entries and omitted from four that need it.

**Remedy.** Populate `depends_on` and a `decide_with:` field on every entry whose note asserts a relationship, so the commissioned validator has something to check.

---

## 4. Cross-cutting: which closure conditions are satisfiable without removing the risk

Four, listed in the order a delivery team would hit them:

| Item | Condition as written | Satisfiable while the risk survives, because |
|---|---|---|
| `TD-04` (P0) | UMAC-1 S1 projection reaches approved production | UMAC-1 is scoped to one of the six routes the deviation names (AS-01) |
| `CC-06` (P1) | CC-07 + CC-08 + CC-09 resolved, then executor evidence | CC-11, the operational envelope, and the action-items owner are omitted from the chain (AS-04, AS-11) |
| `CC-08` (P0) | Sole writer of `EmploymentStatus` named | `User.isActive`, the fourth writer and the live access switch, is outside the condition's scope (AS-03) |
| `CC-10` (P0) | Approval gate recorded + status-label rule approved | Both halves are governance artifacts; the `MentorshipAvailability` aggregate the blocker names is untouched (AS-09) |

The package explicitly forbids closure *"on draft prose, an agent-authored assumption, a scenario document or red test"* (§7.1). It does not forbid closure on a condition that is met and does not help, which is the more likely failure at this altitude because it looks like progress.

---

## 5. Assumptions, and what I did not verify

Stated separately so nothing above reads as more settled than it is.

1. **`mentorship.md` is `status: draft` and unapproved.** I treat a team building from it as legitimate because the spine's AD-5 amendment calls it *"Binding design: `docs/architecture/mentorship.md`"* and AD-17's refinement adopts its `endedByDepartureId` marker verbatim. If the gate holds and nobody builds from a draft, AS-06, AS-07, AS-09 and AS-12 become latent rather than live. They do not become closed: the spine text pointing at the draft is what makes them constructible, and that text is inside the ratified baseline. This is the same hazard `CC-10` names.
2. **AS-03's import-resurrection step assumes the AD-16 idempotent import converges `isActive` to the CSV on every run.** The seed README fixes the mapping but not the convergence direction for a row that flips back. If the import is insert-only for new rows and never updates `isActive`, the resurrection path narrows to the rehire case. The writer-set gap in `CC-08` is confirmed either way.
3. **AS-02's outage window assumes Story 0.1 ships CAP-1 and CAP-3 together.** The SPEC lists them as one story and CAP-1's deletion clause is unconditional, but the stories file may sequence them; I read the SPEC, not `stories.yaml` in full.
4. **Not examined:** the frontend submodule, `_bmad-output/test-artifacts/gate-decision.json` contents beyond the package's quotation of them, the four `docs/test-cases/user-management/access-control-adoption/` scenario files, and `services/frontend` at any depth. AS-16 relies on the package's own quotation of the gate JSON.
5. **Not a finding, verified clean:** both pinned SHAs resolve and match repository HEAD (`workplace 0e703d19…`, `services/backend 08931ad1…`), so every code citation above is reproducible as the frontmatter claims. The AD-7 `Permissions` divergence, the AD-8 operator gap, the TD-02 escalation chain, the TD-04 six-route serializer, and the `403`/`404` runtime split are all present exactly as the package describes them. Where this review disagrees with the package, it is about what follows from a correct record, not about the record.

---

## 6. Remedy summary

**NEW BLOCKER (3).**

| Suggested | Severity | Subject | Finding |
|---|---|---|---|
| `CC-12` | P1 | Write precedence between the deploy-time bootstrap and runtime FR administration | AS-08 |
| `CC-13` | P1 | Owning context and departure boundary for `action-items` | AS-11 |
| `CC-14` | P1 | Departure's effect on non-access mentorship state (`MentorshipAvailability`) | AS-09 |

**TIGHTEN EXISTING (11).** `TD-04` expiry scope (AS-01); `TD-08` + `OQ-AC-EDIT` severity and `TD-01` sequencing (AS-02); `CC-08` writer set (AS-03); `CC-06` `depends_on` (AS-04) and `design_status` (AS-05); `OQ-118` evidence and scope (AS-06); `CONFLICT-UM-01` scope and propagation (AS-07); `CC-11` scope (AS-10); `TD-07` expiry (AS-12); `TD-03` deploy gate (AS-14); `evidence-matrix.yaml` `blocked_by` for AD-5/AD-17 (AS-15); `QUALITY-GATE-AC` wording (AS-16); AD-18 rating (AS-17); machine-readable dependency fields (AS-18).

**SPINE AMENDMENT (1).** AD-7 rule text and the Structural Seed ERD: `Permissions {id, title, description}` → `{id, key, description}`, append-only (AS-13). Out of a documentation-only package's reach; a holding blocker on the `/roles` contract is the interim.

**Additional automation candidates**, all mechanically checkable and none caught by the six §10 additions:

- Every `transition-debt.yaml` item whose `deviation` names N routes/surfaces has an `expiry_trigger` naming the same N (AS-01, AS-12).
- No P0 item's closure is a strict consequence of an open P1 item (AS-02, AS-14).
- Every blocker's `evidence:` paths **contain** the term the blocker's `blocks:` field names — not merely exist (AS-06).
- Every `note:` containing "together with", "decide the two together", or "resolve with `<ID>`" has a corresponding `depends_on` / `decide_with` entry (AS-05, AS-10, AS-18).
- Every AD whose amendment date falls inside an open governance blocker's scope carries `blocked_by` for it (AS-15).
- No `closure_condition` uses "non-FAIL", "covered", or "addressed" where a positive result predicate is available (AS-16).
