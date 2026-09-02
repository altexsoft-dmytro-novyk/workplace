---
title: Correction-Verification Review — People Management Ratification, revision 2026-09-02-reviewer-gate-update
review_type: correction-verification (ad-hoc Reviewer Gate lens)
date: 2026-09-02
scope: >
  Audits the thirteen changes claimed in §11 of ARCHITECTURE-RATIFICATION.md as claims, not
  as truth. Every claim was checked against the working tree at the pinned SHAs.
verdict: PASS WITH FINDINGS
baseline:
  workplace: 0e703d19150b4727c1f2b42e2f359df9995735dc
  services_backend: 08931ad14778f1953ca551c0e25c782afa4ccb1b
  services_frontend: d06b977c714d69036eb9407dffaf33d953e6fa15
---

# Correction-Verification Review

## 0. Verdict

**PASS WITH FINDINGS.** Twelve of the thirteen claimed corrections landed. The factual
substrate is unusually accurate: every code line citation I re-derived (`users.controller.ts`
:65/:76/:84/:90/:104/:112, `interim-session-resolver.adapter.ts` :43-48 and :74-87,
`interim-access-control.adapter.ts` :11-14, `migration.sql:17`, `access-control-bootstrap.ts`
:185-188, `schema.prisma:121-131`) is exact, and every spine citation (`:57-62`, `:145`,
`:194`, `:196`, `:316`) says precisely what the package claims. No AD was renumbered, reused,
retired, or invented, and no release-readiness claim was introduced.

Item 12 (AD-19/AD-20 design `blocked` → `partial`) is the one change I judge **not adequately
justified as written** — it rests on an evidence class the same document's §7.1 excludes, and
it drops an open blocker from AD-19's gate list. Two further findings concern claims *about*
the corrections rather than the corrections themselves: the SHA-pin reproducibility caveat is
overstated for document evidence, and §1's summary of the revision is selective.

The 13 → 25 blocker delta is **self-attested and cannot be verified against a primary source** —
see F-M3.

---

## 1. Per-item audit

| # | Claim (§11) | Landed? | Factually correct? | Verified against | Notes |
|---|---|---|---|---|---|
| 1 | 12 new blockers; count 13 → 25 | **Yes** | **Partly unverifiable** | `blockers.yaml` (25 `- id:` rows, 25 `severity:`, 25 `status:`) | All 12 named IDs present at the stated severities. P0/P1/P2 split is 8/13/4, exactly as §7 claims. Each of the 12 has owner, severity, blocks, status, evidence and closure_condition. The *pre-revision* set of 13 is unrecoverable (F-M3); 24 of 25 carry `closure_condition` (F-L1) |
| 2 | AD-7, AD-8 `conformant` → `partial` in §3 **and** `evidence-matrix.yaml` | **Yes** | **Yes, with one generous inference** | `schema.prisma:121-131`; spine `:100`, `:107`; `migration.sql:17`; `functional-role-evaluator.service.ts`; `access-control-bootstrap.ts:49-51,185-188`; AC spine `:115`,`:120` | All stated facts confirmed. AD-8's "partial not absent" reasoning is weaker than presented — F-M2. Both rows carry `previous_implementation` and `downgraded`; §3 and the matrix agree for all 21 ADs |
| 3 | TD-02 re-scoped P1 → P0, incl. root self-provisioning; "latent, not live" | **Yes** | **Yes** | `interim-session-resolver.adapter.ts:43-48,74-87`; `interim-access-control.adapter.ts:11-14`; `user-management.module.ts:35-36`; `services/backend/docker-compose.yml` | Self-provisioning path confirmed exactly. Both interim adapters are production providers. "Latent, not live" is **TRUE**: compose defines only `localstack` and `postgres`, and there is no Dockerfile, CI workflow or IaC anywhere in the tree. Path citation imprecise (F-L2); one escalation path understated (F-L5) |
| 4 | TD-04 re-scoped to whole-row serializer × 6 handlers + 3 ungated target routes | **Yes** | **Yes — exact** | `user.response.ts`; `users.controller.ts:65,76,84,90,104,112`; `interim-access-control.adapter.ts:37` | `toUserResponse` is a literal whole-row spread of the Prisma `User`. All six line numbers correct. The three `@RequireFeatureForTarget` routes are exactly `GET/PATCH /users/:id` and `PUT /users/:id/photo`. Off-by-one at :37 vs :38 (F-L3) |
| 5 | TD-10 `decisions: [AD-1]` → `[]`, linked to CC-10 | **Yes** | **Yes** | spine `:57-62`; `transition-debt.yaml:131-148` | AD-1 is the three-stage quality gate and is genuinely unrelated to document-status labelling. `[]` is the right call: `blocker: CC-10` preserves traceability, and the file declares no schema that `[]` could violate. Residual weakness is pre-existing, not introduced — see §3 note |
| 6 | QUALITY-GATE-AC names ACM3-II-06, set P0 | **Yes** | **Yes — exact quote** | `_bmad-output/test-artifacts/gate-decision.json` | `gate_status FAIL`, `p0_status NOT_MET`, `critical_open 1`, rationale string matches character-for-character. Both evidence paths exist |
| 7 | CC-08 recorded, not resolved; no ownership rule invented; AD-13 scope correction | **Yes** | **Yes** | spine `:145`; spine `.memlog.md:51`; `docs/test-cases/user-management/seed/README.md:37` | Hard constraint **honoured**: nothing in any of the five package files resolves CC-08 or implies an owner. The scope correction is **correct** — spine `:145` scopes the sole-writer rule to `managedBy:'sync'` policy rows, in a sentence about managerial policy rows; it says nothing about `EmploymentStatus`. All three candidate writers verified at the cited lines |
| 8 | Operational envelope as §3.1 dimension, owner Architect, plus blocker | **Yes** | **Yes — both citations exact** | spine `:196`, `:316`; `timetracker-external-api.json` | `:196` is AD-20's "Operational release gate"; `:316` is Deferred "Remaining operational envelope … must be resolved before first release". Both say exactly what is claimed. The secret-management rationale is confirmed: the contract declares one dev-environment server and per-partner `X-Api-Key` auth |
| 9 | SHA pins with untracked-only caveat | **Yes** | **Overstated** | `git rev-parse HEAD`, `git submodule status`, `git status` | All three SHAs are real, reachable, and match exactly. Submodule claim is **precisely** true (backend: untracked `.claude/worktrees/`, `AGENTS.md`; frontend: untracked `AGENTS.md`). But the superproject has **7 modified tracked files**, and a P0 blocker's sole evidence file is untracked at the workplace pin — **F-H1** |
| 10 | §5/§6 corrected: writes not just reads; TD-02 added to P0 set | **Yes** | **Yes** | `users.controller.ts:87-107`; `interim-access-control.adapter.ts:37-39` | §5 now names `PATCH /users/:id` and `PUT /users/:id/photo` explicitly and states the list route. §6 names TD-01, TD-02, TD-04 and "reads and writes alike". Both corrections are substantively right |
| 11 | §7 rewritten to all 25 by severity | **Yes** | **Yes — exact** | `blockers.yaml` vs §7 | Counts match: 8 P0 / 13 P1 / 4 P2 = 25. Bidirectional ID reconciliation is clean: every YAML ID appears in the prose and every prose ID appears in the YAML, at the same severity. No orphans either direction |
| 12 | AD-19, AD-20 design `blocked` → `partial` | **Yes** | **Not adequately justified** | spine `:182-188`, `:194-196`; spine `.memlog.md:49-53`; `blockers.yaml` CC-04 | Went beyond the user's change list, as flagged. The two named AD-19 gates (CC-07, DEPARTMENT-EDGE) *do* match the spine's own two gate clauses. But the upgrade's approval provenance is spine memlog entries plus draft-spine prose — the exact evidence class §7.1 excludes — and CC-04 is dropped from AD-19's `blocked_by` while remaining open on AD-19's own contract. **F-H2** |
| 13 | `.memlog.md` created | **Yes** | **Yes** | `.memlog.md` | Exists; 13 substantive entries. Every technical claim I spot-checked in it is accurate, including the `:51` and `:57-62` citations and the seed-README line. One entry overstates coverage — F-L1. It also correctly records the auditability gap that the original run left no memlog |

### Also-flag checks

| Check | Result |
|---|---|
| Release-readiness claim, or reads as progress toward release | **Clean at statement level.** All seven occurrences of readiness language are explicit disclaimers. **Not clean at summary level** — §1 is selective (F-M4) |
| AD renumbered / reused / retired / invented | **Clean.** The package references exactly AD-1…AD-21 with no gaps and no additions; the spine carries exactly AD-1…AD-21. The new dimension is deliberately not an AD. Neither spine was edited (both are unmodified in `git status`) |
| New factual error or overstatement introduced | **Four.** F-H1, F-M4, F-L1, F-L4. Plus one known-false statement knowingly left in the register: F-M5 |

---

## 2. Findings

### High

**F-H1 — The pin caveat is overstated, and a P0 blocker's sole evidence file is not reachable at the pinned baseline.**

Confirmed: `docs/integrations/timetracker-external-api.json` is **untracked** in the workplace
repo (`git status`: `?? docs/integrations/`). It is therefore not retrievable at
`evidence_baseline.workplace: 0e703d1`. That file is the **only** evidence cited for
`TT-PMDM-01`, the only evidence for `TIMETRACKER-CONTRACT`, one of three for the P0
`TT-IDENTITY-01`, and one of three for the P0 `OPERATIONAL-ENVELOPE` (and its
`evidence-matrix.yaml` dimension row).

Confirmed: the superproject has seven modified tracked files — `AGENTS.md` and the three
domain PRDs with their memlogs. The frontmatter sentence "No tracked file is modified" is true
only of the two submodules.

The caveat's conclusion is narrowly hedged to "code-evidence", and for code evidence it is
correct — both submodules are dirty from untracked files only, exactly as described. But the
stated purpose of the pin, per `.memlog.md:19`, is to prevent "an unverifiable 'ratified' claim
six weeks out", and a material share of the *document* evidence — including for two P0
blockers — is not reachable at the workplace pin. A reader six weeks out will check out
`0e703d1` and not find it.

*Consequence:* two P0 blockers become unauditable at the baseline they are pinned to, and the
caveat as written tells the reader they are reproducible.
*Action:* state that document evidence under `docs/integrations/`, `_bmad-output/specs/spec-*-domain/`,
`_bmad-output/planning-artifacts/global-coverage/` and the two 2026-09-02 SCPs was untracked at
pin time, and either commit them or record their content hashes.

**F-H2 — The AD-19/AD-20 design upgrade rests on the evidence class §7.1 excludes, and drops an open blocker from AD-19's gate list.**

§7.1 states: "Nothing was closed on draft prose, an agent-authored assumption, … a memlog entry
without evidence of human approval, or another artifact merely asserting 'resolved'." Nothing
was *closed*, so there is no literal violation. But two design statuses were **raised** on
exactly that basis. The provenance of "the write contract are approved" (AD-19) and "fully
specified and approved through the CC-06 decision chain" (AD-20) is
`architecture-people-management-2026-08-19/.memlog.md:49-53` — memlog decision entries — plus
`ARCHITECTURE-SPINE.md`, whose own frontmatter reads `status: draft` (`:8`) and whose governance
this revision holds open as `CC-10`.

Sharper: `blockers.yaml` CC-04 carries `closure_condition: Named Product Owner and Architect
sign-off recorded in an approval ledger` and remains `open`. So the same file states, of the same
People Partner mutation contract, both that the design is approved enough to raise AD-19 out of
`blocked` and that no named human sign-off for it exists. Meanwhile CC-04 — whose declared
`blocks:` value is literally `[People Partner mutation contract]` — is excluded from AD-19's
`blocked_by: [CC-07, DEPARTMENT-EDGE]` on the stated grounds that the attribution is "stale".

To be fair to the change: the two gates it *does* name are correct. Spine `:187` ("Department-boundary
gate") and `:188` ("Journal gate: … CC-07 still owns the immutable relationship/access-journal
schema") are exactly DEPARTMENT-EDGE and CC-07. AD-20's rule at `:194-196` is genuinely exhaustive.
`partial` is not an unreasonable landing place for either.

*Consequence:* the guardrail in §7.1 covers closures but not status upgrades, and this revision
used the gap. Two design statuses now read better than the approval record supports, in the one
section of the package a downstream planner is most likely to read as permission to proceed.
*Action:* either restore `blocked` pending a named approval, or keep `partial` and add CC-04 to
AD-19's `blocked_by` with an explicit note that "approved" here means memlog-recorded and not
ledger-signed. Extend §7.1's evidence rule to cover status *changes*, not only closures.

### Medium

**F-M2 — AD-8's "partial rather than absent" justification does not support its own conclusion.**

Every stated fact checks out. `migration.sql:17` is `"operator" TEXT NOT NULL DEFAULT '==',`
and no `CHECK` touches `operator` anywhere in that migration (the CHECKs cover `type`, row
shape, `policyType`, and the bootstrap key). `functional-role-evaluator.service.ts` does not
read `operator` — and neither does anything else at evaluation time: `operator` appears in
`services/backend/src` **only** in `access-control-bootstrap.ts`. And `:185-188` does throw:
`fail()` at `:49-51` raises `AccessControlBootstrapError`, and `findFrPolicy` (`:174-181`)
selects the single `type='FR'` row, so "only at bootstrap and only for the single functional-role
policy row" is exact.

The inference is the problem. AD-8's substantive rule (spine `:107`) is: "`!=` is barred from
**AR/tier-granting** rules." The bootstrap guard protects the **FR** row — a row type AD-8's
`!=` bar does not restrict — by enforcing an unrelated MVP canonical value of `==`. Nothing
constrains an AR row's operator at any layer, and the AC spine's CAP-3 invariant list (`:120`)
does not include the operator column either. So the AD-8-relevant enforcement is *absent*, and
the guard cited as the reason for `partial` is coincidental to the rule being assessed.

*Consequence:* `partial` reads as "the guard exists but is narrow." The accurate reading is
"an unrelated guard exists; AD-8's guard does not." A planner may treat the operator whitelist
as partially enforced when AD-10 tier resolution starts consuming the column.
*Action:* keep `partial` if preferred over `absent`, but restate the reason: the enforcement
gap is total for the row class AD-8 governs.

**F-M3 — The 13 → 25 delta and "no pre-existing blocker was dropped" are self-attested only.**

The package directory is untracked (`?? …/architecture-people-management-ratification-2026-09-02/`),
`git log` for it is empty, and no other `blockers.yaml` exists anywhere in the tree or in
history. The prior Reviewer Gate report is not in the repo. So the pre-revision baseline is
unrecoverable.

What I *can* confirm is internal: the file's own section comments partition 13 entries as
pre-existing and 12 as new, 13 + 12 = 25, and the resulting 25 reconcile bidirectionally with
§7. That is consistency, not verification. If a fourteenth blocker existed before this run, no
artifact in the repository would show it.

*Consequence:* the single most quotable number in the revision ("13 to 25", used in §1 as the
proof that nothing moved toward release) cannot be independently checked.
*Action:* commit the package. This is the same auditability gap `.memlog.md:9` already
records for the original run, recurring one revision later.

**F-M4 — §1's revision summary is selective.**

§1 lists the revision's effects as: blocker count 13 → 25, two implementation downgrades, two
transition-debt widenings, one dimension added with an owner — then concludes "Nothing here
moves the package closer to release." It omits the two **design-status upgrades** that §11 item
12 records. Those are the only two changes in the revision that move a status in the favourable
direction, and they are the two the user did not ask for.

*Consequence:* the sentence asserting directional neutrality is supported by an incomplete
enumeration. It is not a release-readiness claim, but it is a net-effect claim resting on a
one-sided list.
*Action:* add the AD-19/AD-20 design upgrades to the §1 enumeration.

**F-M5 — A statement the revision knows to be false was left standing in the authoritative register.**

§3's AD-15 row reads "Storage is real and **dispatcher fake is scoped**; interim auth/AC adapters
are cutover debt." §11's carried-findings list reads "AD-15's 'dispatcher fake is scoped' claim
is inaccurate — the fake is bound in the production module." Confirmed: `user-management.module.ts:34`
binds `MAGIC_LINK_DISPATCHER_PORT` to `MagicLinkDispatcherFake` in the module's production
`providers` array.

So the document asserts a claim in §3 and refutes it in §11, 170 lines later. Correcting a
register cell is documentation-only work and squarely inside this package's scope; the "outside
a documentation-only package" rationale applies to the spine edits in that list, not to this row.

*Consequence:* §3 is the table downstream readers cite. A known-false disposition there is worse
than an open finding.
*Action:* correct the AD-15 disposition cell in this revision.

**F-M6 — The new mutual-exclusion invariant is asserted broadly and enforced on one row.**

§2 and `evidence-matrix.yaml:8-10` introduce: "An AD carrying an open transition-debt item may
not be rated `conformant`." As written it is now trivially satisfied, because after this revision
**no AD is rated `conformant` at all**.

The reciprocal link is applied once. Twelve ADs are referenced by at least one `transition-debt.yaml`
row (AD-2, 6, 7, 9, 10, 12, 13, 14, 15, 16, 17, 21). Six are rated `transition-debt`; the other
six are rated `partial` (AD-2, AD-7, AD-10, AD-13, AD-14) or `absent` (AD-17). Only AD-7 carries
the new `carries_transition_debt: [TD-08]` field. No criterion is stated for when a TD-carrying
AD is `transition-debt` versus `partial`.

*Consequence:* §10's proposed automation ("Cross-file AD status consistency … including the
reciprocal `decisions:` links") is not implementable against this data: the reciprocal field
exists on 1 of 12 eligible rows, and the invariant it would check has no discriminating power.
*Action:* either populate `carries_transition_debt` on all twelve, or state the rule that
distinguishes `transition-debt` from `partial` for a TD-carrying AD.

### Low

**F-L1 — `.memlog.md:22` overstates field coverage.** It claims "Added severity, evidence, and
`closure_condition` to every pre-existing entry." 24 of 25 entries carry `closure_condition`;
`TIMETRACKER-CONTRACT` does not (it carries `superseded_by` and `remaining_gaps` instead). §7's
narrower claim — that every entry carries a machine-readable `severity` — is true: 25 of 25.

**F-L2 — `docker-compose.yml` is cited without a path.** No root-level `docker-compose.yml`
exists; the file is `services/backend/docker-compose.yml` and defines only `localstack` and
`postgres`. The substantive claim is confirmed (no backend service in compose, no Dockerfile, no
`.github/`, no IaC). But an unresolvable path in a package that cites line numbers everywhere
else weakens the one claim doing the most work to keep a P0 "latent".

**F-L3 — Off-by-one on the `isAllowedForTarget` citation.** `interim-access-control.adapter.ts:37`
is the method signature; `return Promise.resolve(Boolean(userId));` is `:38`. Cited from both
`SEC-AUTH-01` and `TD-04`.

**F-L4 — One inference in TT-IDENTITY-01 is stated as contract fact.** "returning only employees
with time entries in that period" is not in the contract; the description says only "for employees
for a given month/year, optionally filtered." Everything else in that blocker verifies exactly:
`Employee.id` is `integer` and exists only on `/api/accounting/report`; that path's security is
`AccountingApiKey` while `/api/projects/talents` uses a different scheme; `required: ["month","year"]`;
`AccountTalentDto` is `{email, dateStart, dateEnd}` with `required: ["email","dateStart"]`;
`projectManager` and `deliveryManager` are bare `"type": "string"`. `TIMETRACKER-CONTRACT`'s
"no leaves endpoint" is also correct — the contract exposes two paths, and "leave" appears only
as the `UnpaidLeave` day-status enum name.

**F-L5 — SEC-AUTH-01 understates one escalation path.** `interim-session-resolver.adapter.ts:55-63`
shows that when a real `position: 'HR Admin'` row *does* exist, `Bearer <token:Root>` resolves to
**that** row — direct impersonation of the seeded root, which is the more severe case and is not
described. The blocker documents only the no-root self-provisioning branch. This is an
understatement; it strengthens rather than weakens the P0.

**F-L6 — §10's evidence-path check contradicts the package's own convention.** "Evidence-path
existence, asserting file rather than directory" would flag the package's own rows:
`services/backend/test/user-management/epic-4/` and `epic-5/` are directories, as are roughly ten
`evidence-matrix.yaml` paths (`docs/test-cases/`, `services/backend/test/`, `services/backend/src/access-control/`,
and others). All exist; none is a file.

---

## 3. Notes on the specific judgement calls asked for

**Is `TD-10 decisions: []` the right call, and does it break a schema expectation?**
Right call, and no formal expectation exists to break. AD-1 at spine `:57-62` is the three-stage
scenario/test/code gate and has nothing to do with document-status labelling, so `[AD-1]` was
simply wrong. `transition-debt.yaml` declares no schema, no required keys, and no enum, so `[]`
violates nothing formal, and `blocker: CC-10` carries the traceability that `decisions:` would
have. TD-10 is now the only row of ten with an empty list, which makes it the single row a
`decisions:`-based reconciliation cannot resolve — but the package states that limitation itself
in §10, and the real weakness (that `decisions:` is load-bearing for a proposed validator while
having no defined semantics) is pre-existing rather than introduced here.

**Is `access-control-bootstrap.ts:185-188` fairly characterised?**
The mechanism is described accurately and conservatively — it does throw, it is bootstrap-only,
and it does cover exactly one row. The *conclusion* drawn from it is the overstatement. See F-M2.

**Was the CC-08 hard constraint honoured?**
Yes, and thoroughly. I grepped all five package files: nothing resolves CC-08, nothing names an
`EmploymentStatus` owner, and nothing implies a default. `CC-08.depends_on` is `[]`,
`design_status: open`, and `resolution_note` states the constraint explicitly. The scope
correction against spine `:145` is independently correct and is the strongest single piece of
verification work in the revision.

**Was the AD-19/AD-20 change justified?**
Directionally defensible, insufficiently justified as recorded, and it softens the register.
See F-H2.
