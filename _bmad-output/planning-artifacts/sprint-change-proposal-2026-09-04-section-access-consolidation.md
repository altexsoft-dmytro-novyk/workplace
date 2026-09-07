---
title: Sprint Change Proposal — Section-Access Authorisation Consolidation
date: 2026-09-04
status: approved
mode: batch
scope: planning-artifacts-and-companion-docs-only
normativeSoT: docs/project-requirements.md
builds_on:
  - sprint-change-proposal-2026-09-01-user-management-access-control-alignment.md
  - _bmad-output/implementation-artifacts/access-control/user-management-edit-permission-options.md
  - _bmad-output/implementation-artifacts/access-control/fr-permission-matrix-draft-2026-09-02.md
approved_by: 'Dmytro Novyk (Product Owner / Architect) — 2026-09-03/04, Winston architecture session'
---

> **Status boundary.** `status: approved` covers the planning-artifact and
> `docs/architecture/` companion-doc deltas in §4 only. It touches **no**
> `_bmad-output/specs/*/approvals.yaml`, **no** application code, Prisma schema,
> migration, seed, or test file, and nothing under `services/backend/`. Every
> behavioural change lands through Platform Epic 4 (Stories 4.1 / 4.2), each
> running its three AD-1 stages with independent human approval. The
> `canEditS1` OR-override and the P2 active-target guard already on the
> `dn-um-implementation` working tree from the 2026-09-03 code review are
> interim and are removed by Story 4.2 — see §4.7.

---

## 1. Issue Summary

### Change trigger

The 2026-09-03 `dn-um-implementation` code review found that the identity-card
edit gate had gained an OR-override — `isAllowed(viewer, 'user-management:edit')
OR canAccessSection(...) === 'write'` — so `scripts/dev-grant-root.ts` could
give a local root `canEdit` on every card. An `isAllowed` that **widens** the
resolved audience is a direct violation of the NORMATIVE invariant
(`docs/architecture/access-control.md` line 19; `docs/project-requirements.md`
§2 line 100): *a functional role never widens data access.*

A follow-up architecture session (Winston + Dmytro, 2026-09-03/04) established
that the deeper problem is structural: `AccessControlFacadeAdapter` hand-writes
one authorisation predicate per section/feature (`canEditS1`, the
`READ_USER_FEATURE` / `EDIT_USER_FEATURE` routing-key branches), and the
"Variant A — no functional permission for the identity card" resolution of
2026-09-02 made that one section a permanent special case that cannot be folded
into a single generalised gate.

### Problem statement

1. The identity-card edit gate violates the FR-never-widens invariant.
2. There is no uniform section-access gate; each section is a bespoke predicate.
3. `canAccessSection` still takes legacy `'S1'` / `'S10'` / `'S11'` strings.
4. `dev-grant-root` depends on the override for a capability the model does not
   have ("edit any identity card"); the model gives S1 write to the
   reporting-line manager and assigned PP only.
5. The seeded root's real power (administer + edit the org) has never been
   expressed through the ordinary mechanisms.

## 2. Decisions (normative output of this proposal)

**D1 — Identity-card edit is a dual gate.** `PATCH /users/:id` and the
`GET /users/:id` `canEdit` hint require **both** the feature half
(`isAllowed(viewer, 'profile:identity:write')`) **and** the audience half
(`canAccessSection(viewer, 'profile:identity', target) === 'write'`). This
**supersedes** the 2026-09-02 "Variant A / no functional permission" resolution
in `user-management-edit-permission-options.md` and
`fr-permission-matrix-draft-2026-09-02.md` line 106. The historical decision
records are not rewritten; they gain a superseded pointer.

**D2 — The feature half is a code-owned baseline, not data.** Every per-person
section-write key (`profile:identity:write`, `profile:employment:write`, …) is
held implicitly by every **active** employee via a code constant
`DEFAULT_PERMISSIONS`. The `isAllowed` evaluator returns `true` when the
requested key is in `DEFAULT_PERMISSIONS` (active user) **or** in the user's
explicit FR grant chain — the two are union'd. There is **no `employee`
`Policies` row, no `PolicyPermissions`, no `UserPolicies` attachment, and no
seed / bootstrap / migration change**. Consequences:

- Changing the baseline set is a **code deploy**, not a roles-admin toggle. The
  roles-admin screen shows it read-only ("baseline — every employee").
- **Narrowing** a section (e.g. "only senior managers edit the employment
  grade") = remove the key from `DEFAULT_PERMISSIONS` and grant it explicitly to
  a tighter FR role; the evaluator's explicit-grant path still serves it.
- **No per-individual carve-out of the base set** — the policy engine is
  allow-only (no deny operator). Accepted: individual narrowing is done by the
  remove-from-baseline-plus-explicit-grant path above, not by subtracting from
  one person.
- This is the recorded confirmation the `access-control.md` changelog line
  ("do not hard-code defaults until that confirmation is recorded") was waiting
  for — **for the per-person section-write keys only**. Global-feature default
  holders (`directory:*`, `admin:*`, role management) remain their own §2.3
  process follow-up and are out of scope here.

**D3 — One section-parameterised gate.** A `@RequireSectionAccess('<key>',
'read' | 'write')` decorator + guard in User Management `application/guards/`,
driven by `canAccessSection`, replaces `canEditS1` and the
`EDIT_USER_FEATURE` / `READ_USER_FEATURE` routing-key branches in
`AccessControlFacadeAdapter.isAllowedForTarget`, and is the pattern every future
section adopts.

**D4 — Human section identifiers.** `canAccessSection` and every caller,
scenario doc, and test move from `'S1'` / `'S10'` / `'S11'` to `profile:identity`
/ `profile:leave` / `profile:projects`. The `S<n>` labels are requirements-matrix
row ids only, cited for traceability, never passed. Full map in §5.

**D5 — Seeded root = the boss; delegated HR Admin = features only.** The ACM-0
seeded root identity holds, by seed: the `hr-admin` functional role carrying the
full **operator permission set** (population import, org-relationship writes,
departure recording — not just today's `list`/`create`/`deactivate`; section
writes come from `DEFAULT_PERMISSIONS`), the top position in the `reports-to`
relationship tree, and the first §2.4 full-profile-access grant — all provisioned
at deploy time by `bootstrap-access-control.ts` (a deliberate AD-1 amendment to
the ACM-1 canonical FR set and its invariant suite). A clean
`db:seed && db:bootstrap:access-control` on a fresh production DB leaves root
fully operational with **no dev script**. A person the root later assigns
`hr-admin` to holds the complete functional-role feature set and may delegate
the role onward, but derives **no data access** from it — they read or write a
profile only where they are that person's reporting-line manager or assigned PP,
or hold a separate §2.4 grant.

**D6 — The `canEditS1` OR-override is deleted** (Story 4.2). Root's edit reach
is the seeded tree position (D5), resolved through `canAccessSection` like any
other manager's.

**D7 — `resolveAudiences` walks upward from targets.** The reporting-chain
resolution changes from "expand every descendant of the viewer, then filter" to
"walk up from each target, bounded by chain depth." Seating root permanently at
the tree root makes this load-bearing for §7 (500 records / 2 s), not optional.

## 3. Recommended Approach

Two new Platform Epic 4 stories carry the work; this proposal only records the
decisions and the artifact deltas.

- **PLAT-E4-S4.1** — generalised gate (D1–D4): `DEFAULT_PERMISSIONS` + evaluator
  union rule + `access-control.md` decision entry; section-key rename;
  `@RequireSectionAccess` + adapter migration; cleanup.
- **PLAT-E4-S4.2** — seeded-root model (D5–D7): override deletion, dev org-seed
  spine (two-level), §2.4 first holder = root, upward-walk resolver.

Both are `backlog`, each sub-slice AD-1-gated. 4.1's product blocker (the
composition decision) is resolved by D1/D2; it now needs only the architect
solution-design for the gate shape + the section→endpoint map.

## 4. Detailed Change Proposals

### 4.1 — `_bmad-output/implementation-artifacts/access-control/user-management-edit-permission-options.md`

Add a superseded banner under the existing 2026-09-02 "RESOLVED — Variant A"
note: the identity card **does** carry a functional half (D1), satisfied by the
`DEFAULT_PERMISSIONS` code baseline (D2). This is the options doc's Option 2
("universal baseline") realised as a code constant rather than a DB policy row.
Options 1/3/4 and the Variant A write-up stay as the historical record.

### 4.2 — `_bmad-output/implementation-artifacts/access-control/fr-permission-matrix-draft-2026-09-02.md`

Line 106: un-strike `profile:identity:write`; replace the "Variant A: NO
functional permission" cell with "in `DEFAULT_PERMISSIONS` (D2 / SCP
2026-09-04) — dual-gate, audience half discriminates." Add a note above the
"Per-person section writes" table that every key in it is a `DEFAULT_PERMISSIONS`
member unless a later narrowing decision removes it.

### 4.3 — `docs/architecture/access-control.md`

Two inline additions, matching the file's existing "Resolved YYYY-MM-DD" style:

- In the functional-role Kernel MVP / `isAllowed` description: the evaluator has
  a **code-defined baseline** (`DEFAULT_PERMISSIONS`) union'd with the
  data-driven grant chain — `isAllowed` is no longer purely data-driven for the
  per-person section-write keys. FR-tier only, no relationship read, in-memory
  set check, no hot-path scan.
- In §2.2 dual-gate: the identity card is a dual gate (D1); its feature half is
  the baseline (D2). Remove any "Variant A / audience-only for S1" language.

### 4.4 — `_bmad-output/specs/spec-user-management-access-control-adoption/SPEC.md` + `stories.yaml`

Add a forward-reference note: the write-path Variant A gate (UMAC-2 / Story 0.2)
is superseded by Platform Epic 4 Story 4.1 (D1–D4). The adoption package stays
`done` as shipped; Epic 4 is the follow-on. No `approvals.yaml` change.

### 4.5 — `_bmad-output/planning-artifacts/platform/epics.md` + `sprint-status.yaml`

Epic 4 already registered (2026-09-03). Update Story 4.1's blocked_on: the
composition decision is resolved; only the architect gate-shape design remains.

### 4.6 — `docs/test-cases/user-management/` (access-control-adoption + profile folders)

**Not rewritten in this proposal.** The `umac-07` dual-gate scenario, the
`um-edit-01/05` entitlement notes, `write-adoption.e2e-spec.ts`, and the
`career-timeline` / `README.md` section-string references regenerate through
Story 4.1's AD-1 Stage-1 (scenario prose → human approval → red tests). Listed
in §5 so nothing is missed. The `write-adoption.e2e-spec.ts` "OR-override"
describe block added 2026-09-03 is interim and is deleted by Story 4.2.

### 4.7 — Interim code on the working tree

`dn-um-implementation` currently carries the `canEditS1` OR-override
(constrained so it never widens past a `'none'` section result), the P2
active-target guard, a pinning e2e block, and `scripts/dev-grant-root.ts`. These
are **interim**, superseded by Story 4.2, then deleted. Not made normative here.

**`dev-grant-root.ts` — `NODE_ENV=production` guard reverted (decision, Dmytro
2026-09-04).** The script is an accepted dev **and production** stopgap for
provisioning an operational root until Story 4.2 folds the operator set into
`bootstrap-access-control.ts`. Rationale: the production `hr-admin` bootstrap
currently under-provisions root (three keys only) — it cannot run import
corrections, wire relationships, or record departures — so a prod deployment
today has no other way to make root operational. Known debt while the stopgap
stands: it grants a wider, pre-`directory:*` key bundle and will fail the ACM-1
drift-check e2e (`acm1r-fr-foundation.e2e-spec.ts`) if run against that suite's
DB. The `DATABASE_URL` presence check added in the same review stays.

## 5. Impact Map

| Artifact | Current state | Required change | Carrier |
| --- | --- | --- | --- |
| `user-management-edit-permission-options.md` | "RESOLVED 2026-09-02: Variant A, no FR permission" | superseded banner → D1/D2 | this SCP §4.1 (applied) |
| `fr-permission-matrix-draft-2026-09-02.md` L106 | `~~profile:identity:write~~` struck | un-strike; `DEFAULT_PERMISSIONS` note | this SCP §4.2 (applied) |
| `docs/architecture/access-control.md` | `isAllowed` "data-driven"; §2.2 dual gate generic | baseline-union note; identity card = dual gate | this SCP §4.3 (applied) |
| `spec-user-management-access-control-adoption/SPEC.md` | Variant A write gate | forward-ref to Epic 4 | this SCP §4.4 (applied) |
| `platform/epics.md`, `platform/sprint-status.yaml` | Epic 4 / 4.1 / 4.2 registered | 4.1 blocked_on softened | this SCP §4.5 (applied) |
| `access-control/deferred-work.md` | "Generalise section-access" entry | reflect D1/D2 resolution | this SCP (applied) |
| `docs/test-cases/user-management/access-control-adoption/umac-07*.md` | "Variant A, audience-only, no `user-management:edit` seed" | dual-gate + `DEFAULT_PERMISSIONS` | **PLAT-E4-S4.1 AD-1 Stage-1** |
| `docs/test-cases/user-management/access-control-adoption/README.md`, `umac-01..04`, `umac-08` | S-number section strings; Variant A notes | human keys; dual-gate | **PLAT-E4-S4.1 AD-1 Stage-1** |
| `docs/test-cases/user-management/profile/um-edit-01`, `um-edit-05`, `README.md` | `canAccessSection(v,'S1',t)==='write'` audience-only | human key; dual gate | **PLAT-E4-S4.1 AD-1 Stage-1** |
| `docs/test-cases/user-management/career-timeline/README.md`, `docs/test-cases/user-management/README.md` | `S9` / `S1` strings, `canAccessSection('profile:timeline')` future | human keys throughout | **PLAT-E4-S4.1 AD-1 Stage-1** |
| `docs/test-cases/access-control-foundation/README.md`, `docs/test-cases/access-control-kernel/**` (ACM-5) | ships `'S1'/'S10'/'S11'` strings | rename increment | **PLAT-E4-S4.1 AD-1 (AC package)** |
| `services/backend/src/**` `canAccessSection('S1'|'S10'|'S11')` callers, `access-control-facade.adapter.ts` predicates | legacy strings, per-section predicates, OR-override | D2/D3/D4/D6 | **PLAT-E4-S4.1 + S4.2 production dispatches** |
| `services/backend/src/access-control/**` `isAllowed` evaluator | pure data-driven join | `DEFAULT_PERMISSIONS` union (D2) | **PLAT-E4-S4.1 AD-1 (AC package)** |
| `services/backend/src/access-control/domain/services/audience-resolver.service.ts` | descend-from-viewer walk | walk-upward (D7) | **PLAT-E4-S4.2 AD-1 (AC package)** |
| `scripts/bootstrap-access-control.ts` + ACM-1 canonical set + `acm1r-fr-foundation.e2e-spec.ts` | `hr-admin` granted 3 keys | grow to the operator set; seat tree-root edge + §2.4 holder (D5) | **PLAT-E4-S4.2 AD-1 (AC package)** |
| `prisma/seed.ts`, `scripts/dev-grant-root.ts` | root user only; `dev-grant-root` = broad FR bundle, `NODE_ENV` guard reverted | `db:dev:seed-org` fake spine (dev-only); `dev-grant-root` deleted once bootstrap covers root (D5) | **PLAT-E4-S4.2** |
| `prd-user-management-2026-08-20/prd.md`, `prd-people-management-2026-08-24/prd.md` | identity-card edit described at FR level | review for Variant-A language; light touch only | **PLAT-E4-S4.1 Stage-1 (if any)** |

## 6. What proceeds now / what stays gated

**Now:** the §4.1–4.5 artifact edits (applied with this proposal); Story 4.1 and
4.2 refinement; the architect solution-design pass for the `@RequireSectionAccess`
gate shape and the section→endpoint map.

**AD-1 gated:** every code change; every `docs/test-cases/**` rewrite; the
`isAllowed` evaluator change; the `resolveAudiences` walk change; the seed
changes. Nothing in §5's "carrier = PLAT-E4-*" rows moves without its Stage-1
scenario approval.

## 7. Open Decisions for the approver

1. **Baseline mutability (D2).** Confirmed acceptable that `DEFAULT_PERMISSIONS`
   changes only by deploy, with runtime control limited to the
   remove-and-explicitly-regrant narrowing path? *(Recorded as accepted per the
   2026-09-04 session; flag here for the record.)*
2. **`profile:personal-contacts` / `:emergency-contacts` / `:documents`
   write for root.** Reporting line is read-only there by design; even the
   seeded root cannot write them without being PP. No routes exist today.
   Recorded lean: accept the boundary; revisit when those routes are specced.
3. **Section keys for the not-yet-ratified rows** (`profile:leave`,
   `profile:projects`, `profile:action-items`, `profile:request-history`) —
   proposed names in §5; ratify during 4.1 Stage-1.

## 8. Approval

Approved by Dmytro Novyk (Product Owner / Architect) in the 2026-09-03/04
architecture session with Winston. Scope: planning artifacts and
`docs/architecture/` companion docs only, as bounded in the status note. All
behavioural change runs Platform Epic 4 under AD-1.

## 9. Amendments

### 9.1 — `profile:timeline:write` — deviation stands this PR; target design fixed; closure tracked as DEPT-2 (PO, 2026-09-07)

**Context.** PO ruling AF-2 (2026-09-06, `spec-4-2a-root-operator-permission-set.md`)
seeded `profile:timeline:write` into the canonical `hr-admin` bootstrap set as a
stopgap, because the deferred `profile:timeline` `canAccessSection` support had
not shipped. Its gate (`canEditTimeline`, `career-timeline-access-facade.adapter.ts`
— `isAllowed` alone, `void targetUserId`) has no audience half, so the grant gives
every `hr-admin` holder org-wide career-timeline write with no relationship to the
target. `s42a-op-06` records that as a known deviation from the NORMATIVE
invariant (`docs/architecture/access-control.md:19`; `project-requirements.md`
§2.2 "HR Admin grants no data access", §2.3 "a feature operates within the
holder's access role").

**What ships in this PR.** The deviation **stands, unchanged** — `hr-admin`
carries six canonical keys including `profile:timeline:write`, and manual
timeline write is gated by `isAllowed` alone. Reversing it needs the
department-manager audience (relation 2 of the §2.1 reporting line), which does
not exist in the resolver or the data today — a multi-increment Epic 5
dependency. It is a **known, accepted, time-boxed deviation** for the
consolidation increment, exactly as `s42a-op-06` frames it. No code in this PR
changes for it.

**Target design (decided, not yet built).** Career timeline is a profile section
(§3.2 **S9**: Self `R`; Reporting line / Project line / PP `RW`; Colleague `—`).
When the closure increment lands:

- `profile:timeline:write` **leaves the canonical `hr-admin` bootstrap set**
  (6 keys → 5). The operator keys `org:relationships:write` and
  `employee:departure:record` stay — they touch no section matrix.
- The feature half moves to **`DEFAULT_PERMISSIONS`** (D2), like
  `profile:identity:write`. `canEditTimeline` becomes a **dual gate**:
  `isAllowed(viewer, 'profile:timeline:write')` **AND**
  `canAccessSection(viewer, 'profile:timeline', target) === 'write'`.
- The audience half is narrowed per **DEC-UM-001**: the effective manual-write
  holders are the target's **direct department manager** and **assigned People
  Partner** only. Project-derived DM/PM and transitive managers are read-only
  for manual mutation. This confirms the "Confirm" points in
  `fr-permission-matrix-draft-2026-09-02.md` §6 item 4 and §5.
- `canReadTimeline` moves off its interim `resolveAudiences` rule to
  `canAccessSection(..., 'profile:timeline', ...) !== 'none'`.

**Closure carrier.** **DEPT-2** in
`_bmad-output/planning-artifacts/platform/dept-epic.md` (DEPT-EPIC), which
depends on **DEPT-1** — the `Department.managerUserId` fact +
`isDirectDeptManager` derivation. Knock-on when DEPT-2 lands: `profile:timeline`
is the first matrix row with a reachable `'none'` cell (Colleague), so it makes
the §2.4 full-profile overlay observable for the first time — expected, covered
by `acm11-fpo-03`. DEPT-2's Stage-1 reconciles the downstream records
(`spec-4-2a`, `s42a-op-06`, `fr-permission-matrix-draft`, `deferred-work`,
`epic-4-context`, `project-requirements.md` §2.3).

### 9.2 — D5 tree-root position correction (PO, 2026-09-07)

D5 as written says the seeded root holds "the top position in the `reports-to`
relationship tree ... all provisioned at deploy time by
`bootstrap-access-control.ts`." Story 4.2b (`spec-4-2b-tree-root-seed.md`,
backend `8ec35fd`) found that half cannot be written as stated: root's tree-root
position is **structural** — the permanent absence of any `Relationship` row for
root — not a seeded edge. The bootstrap seeds the operator FR set (4.2a) and the
§2.4 full-profile-access first-holder grant (4.2c); it writes **no** tree edge.
Root resolves `reporting` write over a subordinate only once an ordinary
`assign-manager` call terminates a chain at root (proven transitively by
`s42b-tr-02`), never over the imported production population by default
(`s42a-op-04`, `s42b-tr-03`). D5's intent — root operational with no dev script —
holds; the mechanism for the tree half is verify-and-lock, not seed.
