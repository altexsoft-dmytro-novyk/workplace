---
review: BMad Reviewer Gate — rubric walker lens
target: ARCHITECTURE-RATIFICATION.md (+ blockers.yaml, evidence-matrix.yaml, transition-debt.yaml, .memlog.md)
target_revision: 2026-09-02-reviewer-gate-update
reviewed_at: 2026-09-02
lens: good-spine checklist adapted to a ratification artifact
verdict: PASS WITH FINDINGS
baseline_verified:
  workplace: 0e703d19150b4727c1f2b42e2f359df9995735dc
  services_backend: 08931ad14778f1953ca551c0e25c782afa4ccb1b
  services_frontend: d06b977c714d69036eb9407dffaf33d953e6fa15
---

# Rubric-walker review — People Management architecture ratification, revision `2026-09-02-reviewer-gate-update`

## Verdict

**PASS WITH FINDINGS.**

The revision is materially sound where it can be mechanically checked. Every count stated in prose
reconciles against the files, every code and migration citation I spot-checked is line-accurate, all
21 AD IDs are genuinely preserved, CC-08 is genuinely unresolved, no release-readiness claim is
present, and the §7.2 scope correction against AD-13 is correct — the *prior* Reviewer Gate's framing
was wrong and this package caught it. That is an unusually high standard of self-verification.

It does not pass clean. The dominant residual risk is **not** error in what is recorded; it is
**silence about dimensions the initiative altitude owns**. §3.1 opened a dimension register and put
exactly one row in it. At least four more dimensions are still silent, one of which (the 500-record /
2-second permission-resolution NFR) is a hard, testable requirement bound directly to an AD the
package rates `partial`. Separately, one recorded status is refuted by its own cited evidence, and one
inaccuracy the document itself identifies is left standing in the register teams actually read.

Findings are tiered below. Every claim cites a path and line number verified at the pinned SHAs.

---

## Section A — What I verified as sound

Recorded as evidence, not as praise. These are the rubric items the package passes, with the check
that establishes it.

### A1. Counts in prose reconcile exactly against the files (rubric 5)

Parsed `blockers.yaml` mechanically: **25 unique blocker IDs, 8 × P0, 13 × P1, 4 × P2, zero entries
missing `severity`.** §7's "all 25", "P0 — eight items", "P1 — thirteen items", "P2 — four items" are
all exact, and the §7 P1 prose list enumerates 13 distinct IDs. `13 → 25` in §11 row 1 reconciles with
the twelve added IDs listed there. No count in the prose is asserted rather than true.

### A2. AD IDs are genuinely preserved (rubric 7)

`ARCHITECTURE-RATIFICATION.md` §3 register: `AD-1`…`AD-21`. `evidence-matrix.yaml`: `AD-1`…`AD-21`.
`ARCHITECTURE-SPINE.md`: the same set, `AD-1`…`AD-21`. No renumbering, no reuse, no retirement, and no
AD invented. Confirmed.

### A3. Code and migration citations are line-exact (rubric 2)

Spot-checked every load-bearing citation against the working tree at the pinned SHAs:

| Cited | Verified content | Status |
|---|---|---|
| `interim-session-resolver.adapter.ts:43-48` | the `persona === 'Root'` branch **and** the `return { userId: persona }` fallthrough | exact |
| `interim-session-resolver.adapter.ts:74-87` | `prisma.user.create` with `position: 'HR Admin'` | exact |
| `interim-access-control.adapter.ts:11-14` | `HR_ADMIN_FEATURES` = create, deactivate, list | exact |
| `interim-access-control.adapter.ts:37` | `isAllowedForTarget(userId): Promise<boolean>` → `Boolean(userId)` | exact |
| `users.controller.ts:65,76,84,90,104,112` | all six `toUserResponse` call sites | exact, all six |
| `20260831070000…/migration.sql:17` | `"operator" TEXT NOT NULL DEFAULT '=='` | exact |
| `access-control-bootstrap.ts:185-188` | `if (policy.operator !== '==') fail(...)` | exact |
| `schema.prisma:121-131` | `model Permission { id, key @unique, description }` | exact |
| `ARCHITECTURE-SPINE.md:145` | AD-13 Rule | exact |
| `ARCHITECTURE-SPINE.md:194` | AD-20 Rule | exact |
| `ARCHITECTURE-SPINE.md:196` | AD-20 "Operational release gate" | exact |
| `ARCHITECTURE-SPINE.md:316` | Deferred "Remaining operational envelope … before first release" | exact |
| `docs/test-cases/user-management/seed/README.md:37` | `IsDismissed`/`DismissedDate` → §4.16 `active`/`dismissed`, `User.isActive` stopgap | exact, incl. the §4.16 reference |

All 48 distinct evidence paths cited across `blockers.yaml` and `evidence-matrix.yaml` resolve on disk.
Both submodule SHAs match the pin and are dirty only from untracked files (`services/backend`:
`.claude/worktrees/`, `AGENTS.md`), so the frontmatter caveat is accurate and the evidence is
reproducible.

### A4. The AD-7 and AD-8 downgrades follow from the evidence

- **AD-7:** `schema.prisma:121-131` delivers `{id, key, description}`; the spine specifies
  `{id, title, description}`. Divergence real. AD-7 also carries TD-08, which the §2 status model makes
  incompatible with `conformant`. Downgrade justified.
- **AD-8:** `rg -i operator` across `prisma/migrations/` and `schema.prisma` returns exactly two hits —
  the column definition and the Prisma `@default("==")`. **There is no `CHECK` constraint anywhere.**
  `rg -n operator src/access-control/` returns hits only in `access-control-bootstrap.ts`; the cited
  `functional-role-evaluator.service.ts` genuinely never reads the column. The bootstrap throw is real
  but scoped to the single `FR_ROLE` row at startup. The package's own correction of the prior gate's
  "zero enforcement" wording is more accurate than the finding it replaces. Downgrade justified.

### A5. The §5/§6 write-path corrections are accurate and were understated before

`users.controller.ts` has exactly **six** handlers, and **all six** call the whole-row serializer
`toUserResponse`, which spreads `...user` (`user.response.ts:10-15`) — so "whole-row serialization on
all six handlers including `GET /users`" is exact. Exactly **three** handlers carry
`@RequireFeatureForTarget`: `findOne` (`:82`), `update` (`:88`), `uploadPhoto` (`:94`) — so "three
handlers route through it" and "the writes are as ungated as the read" are both exact.

### A6. `SEC-AUTH-01` is real, correctly scoped, and its latency caveat is accurate

All three compounding paths verified in source. `docker-compose.yml` contains only `localstack` and
`postgres` — **no backend service** — so "not containerized, not deployed" is accurate. I additionally
found **no `Dockerfile` and no CI workflow anywhere in the repo**, which strengthens rather than
weakens the "latent, not live" framing. Refusing to downgrade on latency is the correct risk call.

### A7. `QUALITY-GATE-AC` matches the gate artifact verbatim

[`gate-decision.json`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/c342138/_bmad-output/test-artifacts/gate-decision.json) (`c342138`): `gate_status: FAIL`, `p0_status: NOT_MET`,
`critical_open: 1`, `evaluated_at: 2026-08-31`, rationale naming `ACM3-II-06`. Every element of the
blocker note is present in the artifact. Naming the requirement explicitly is the right call: it stops
an uncovered fail-closed security invariant reading as paperwork.

### A8. No release-readiness claim is present

Checked specifically, as instructed. §1 states implementation completeness **FAIL**, and explicitly
disclaims conformity, security, deployment readiness, and completion. §1 further states the revision
moves nothing closer to release and enumerates why (blockers 13→25, two downgrades, two widened debts).
§7.1 states "Zero blockers were closed"; `blockers.yaml:11-14` repeats it. §11 records "No
release-readiness claim is made or implied."

I found **no** statement that reads as release readiness or as progress toward release. §3.1's closing
sentence ("Recording this dimension as open with a named owner is the opposite of a readiness claim")
is defensive framing, not a claim. `transition-debt.yaml:6-10`'s severity rule — severity reflects
consequence if the deviation reaches a shared environment, not effort to retire — is the correct
posture and is applied consistently to TD-02.

### A9. CC-08 is genuinely unresolved, and §7.2's scope correction is correct

This is the check the prompt flagged, and the package gets it right against the prior gate.

`ARCHITECTURE-SPINE.md:145` (AD-13 Rule) reads: *"the sync is the sole writer of `managedBy:'sync'`
rows and replaces a user's rows transactionally"* — in a clause about **managerial policy rows**. It
says nothing about `EmploymentStatus`. **The prior Reviewer Gate's framing (AD-13 designates the sync
as sole writer of employment state, contradicting AD-20) is not supported by the spine.** §7.2's
correction is verified correct.

The replacement framing holds up:

- **(a) AD-20 executor** — `ARCHITECTURE-SPINE.md:194`: *"`EmploymentStatus` receives the `dismissed`
  fact only when applied"* and *"inserts the idempotent dismissed fact"*. Confirmed writer.
- **(b) AD-16 seeded import** — `docs/test-cases/user-management/seed/README.md:37` maps
  `IsDismissed` + `DismissedDate` to *"**employment status** (§4.16 `active`/`dismissed`) — **not**
  `User.isActive` directly"* with *"**Interim flagged:** `User.isActive` may be set `false` … as the
  stopgap until the `EmploymentStatus` aggregate lands"*. Confirmed candidate, cited precisely.
- **(c) AD-13 future sync** — labelled "plausible", with the explicit note that AD-13 "neither claims
  nor disclaims it". Honest inference, correctly labelled as such.

`blockers.yaml` CC-08: `status: open`, `severity: P0`, `design_status: open`, plus an explicit
`resolution_note: Deliberately left unresolved. No ownership rule is invented here`. No default is
selected anywhere. **The constraint was honoured.** See M5 for the one wording overstatement.

### A10. Reciprocal links that exist do resolve (rubric 5)

`CC-06.depends_on: [CC-07, CC-08, CC-09]` — all three exist. `DEPARTMENT-EDGE.depends_on: [OQ-116]` —
exists. `TIMETRACKER-CONTRACT.superseded_by: [TT-IDENTITY-01, TT-PMDM-01]`, and both successors carry
`supersedes_part_of: TIMETRACKER-CONTRACT` — reciprocal and consistent. `AD-19.blocked_by: [CC-07,
DEPARTMENT-EDGE]` and `AD-20.blocked_by: [CC-08, CC-09]` — all resolve and agree with §3's prose.
`TD-02.blocker: SEC-AUTH-01` ↔ SEC-AUTH-01's "Tracked as transition debt TD-02" — reciprocal.
`TD-10.blocker: CC-10` ↔ CC-10's "Also the owner of TD-10" — reciprocal. No dangling or contradictory
link found among those declared. See M2 for the links that are *absent*.

### A11. TD-10's link correction is correct and correctly left empty

`ARCHITECTURE-SPINE.md` AD-1 is the three-stage scenario/test/code quality gate; it has no bearing on
document-status labelling. Reassigning `decisions:` to another AD would have been worse than emptying
it. Leaving it `[]` and carrying the absence in CC-10 is the right call, and
`link_correction_reason` states exactly that.

---

## Section B — Findings

### CRITICAL

#### C1. The second bound spine is declared but never ratified — its decisions appear in no register

**Confirmed.** Frontmatter declares `binds_access_control_spine` pointing at
`architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md`. I enumerated that spine's
decision identifiers:

- `ACF-1`, `ACM-0`, `ACM-1`, `ACM-2`, `ACM-3`, `ACM-4`, `ACM-5`, `ACM-8`, `ACM-9`
- and its **own** `AD-1`…`AD-4`, which are different decisions from the parent spine's:
  `AD-1 — Foundation boundary` (`:75`), `AD-2 — User Management ownership boundary` (`:84`),
  `AD-3 — Kernel evidence and consumer evidence are separate` (`:90`),
  `AD-4 — Minimal functional-role kernel` (`:111`).

**Not one of these appears in §3, §3.1, `evidence-matrix.yaml`, or `transition-debt.yaml`.** The
package binds two spines and ratifies one.

The AD-number collision is not theoretical; it is already producing a wrong link. `TD-09` is *"Access
Control E2E uses a User Management token as a test seam"* with `decisions: [AD-2]`. Bare `AD-2`
resolves to the parent spine's *hexagonal bounded-context boundaries*. The decision that actually owns
that deviation is the **AC spine's** `AD-2 — User Management ownership boundary` (`:84`). §11 states
this correctly; the wrong link is still in the file.

**Why this is Critical, not High.** The unratified spine is the *authorization* spine. Rubric 1 asks
whether the package fixes the divergence points for teams building epics/stories below it. A team
picking up an Access Control epic gets no design status, no implementation status, and no evidence row
for any ACM/ACF decision, on the one dimension where the risk is permissions and data exposure. Rubric
4 asks whether every dimension the altitude owns is decided, deferred, or open; nine-plus decisions of
a formally bound spine are none of the three.

**The stated reason for deferring it does not hold.** §11 says resolving this "needs a qualified
AD-reference convention, which is a governance decision rather than a correction". But §3.1 had just
demonstrated the available move: add a new register section, assign an owner, do not touch the spine.
An `ac_decisions:` block keyed `ACM-0`…`ACM-9`, `ACF-1`, `AC-AD-1`…`AC-AD-4` requires no spine
amendment and no governance decision — it is a local naming choice inside this package, exactly like
`register_dimension: operational-envelope`. The package applied that reasoning to the envelope and
declined it here without distinguishing the two cases.

**Recommended action.** Add an `ac_decisions:` register to `evidence-matrix.yaml` and a §3.2 to
`ARCHITECTURE-RATIFICATION.md` covering `ACF-1`, `ACM-0`…`ACM-9`, and the AC spine's `AD-1`…`AD-4`,
each with design status, implementation status, and evidence. Adopt a qualified-reference prefix
(`PM-AD-n` / `AC-AD-n`) inside this package only, note it as package-local convention, and correct
`TD-09.decisions` to the AC spine's ownership-boundary decision. If the run genuinely cannot do this,
say so as an explicit scope exclusion in §1 — "this package ratifies the People Management spine only"
— rather than declaring `binds_access_control_spine` in frontmatter, which asserts coverage that does
not exist.

---

### HIGH

#### H1. The 500-record / 2-second permission-resolution NFR is a silent dimension bound to an AD rated `partial`

**Confirmed.** `docs/project-requirements.md:590`: *"Performance: the All Employees list with 500+
records, arbitrary filters and derived fields responds within 2 seconds, **including permission
resolution**."* This is not aspirational; the parent spine binds it into AD-10 twice:

- `ARCHITECTURE-SPINE.md:116` — AD-10 **Binds:** *"access-control context; every list/profile/dashboard
  endpoint; NFR §7 (500 records / 2 s)"*
- `ARCHITECTURE-SPINE.md:122` — *"Bulk resolution for all requested targets in one round trip per graph
  (or one combined query plan), same 500-record/2 s NFR … Secondary polymorphic lookups are allowed for
  feature/audience resolution but barred from the tier hot path."*

Coverage in the package: **zero.** `rg -i 'non-functional|p95|throughput|scalab|load test|rate limit'`
across all four package files returns nothing. (`rg -i NFR` appears to hit 12 times but every hit is
the substring inside "i**nfr**astructure" — there is no genuine NFR mention.) AD-10 is rated
`design: partial / implementation: partial` with evidence `audience-resolver.service.ts` and
`deferred-work.md`, and neither the register row nor the evidence row mentions the performance envelope
or the one-round-trip / no-hot-path-polymorphic-lookup constraints.

**This is the rubric-3 failure case, precisely.** Two teams one level down can each build a conformant
implementation that the other cannot use: one writes a per-target resolver called in a loop over the
list page (N+1, correct results, blows the 2 s budget at 500 records), the other writes the bulk
one-round-trip plan the spine requires. **Neither contradicts anything in this package**, because the
package records no status for the constraint. The consequence lands on users and on the highest-traffic
surface in the product, and the rework is an architectural rewrite of the audience hot path rather than
a tuning pass.

**Recommended action.** Add a `performance-envelope` dimension row to §3.1 and
`evidence-matrix.yaml.dimensions` — owner Architect and Access Control, design status recorded against
`ARCHITECTURE-SPINE.md:116,122` and `docs/project-requirements.md:590`, implementation status against
`audience-resolver.service.ts`. State explicitly whether the delivered Phase-0 resolver meets the
one-round-trip rule or deviates, and if unmeasured say `unmeasured` — an honest `unmeasured` is
enforceable, silence is not. Add a P1 blocker for the missing measurement, and add the bulk-resolution
constraint to AD-10's register row so a story author sees it without reading the spine.

#### H2. `OQ-AC-EDIT`'s `open` status is refuted by the only evidence it cites

**Confirmed.** `blockers.yaml` `OQ-AC-EDIT`: `severity: P1`, `status: open`, blocks
*"`user-management:edit` permission key, `mentorship:assign` permission key"*, sole evidence
`_bmad-output/specs/spec-user-management-access-control-adoption/SPEC.md`, closure condition *"Both keys
present in an approved permission catalog, or the design references removed"*, note *"Both keys are
referenced by design and exist in no catalog."*

That SPEC says the opposite about the decision. `SPEC.md:327`: **"## Open decisions — TAKEN 2026-09-01
(Dmytro Novyk, Product Owner / Architect)"**. `:329`: *"All five are decided."* `:331-336`:
*"**Missing edit/photo permission — RESOLVED: option (a).** Access Control adds `user-management:edit`
to the bootstrap catalog and grant via a new three-stage AD-1 sequence in the kernel package; the
adoption slice's write path (CAP-2 write / Story 0.2) blocks on that sequence reaching
`stage-3-production`."*

So the **decision is taken**, with a named approver and a date. What remains is **delivery** of the
seed increment — which the package already tracks correctly as `TD-08` (*"`user-management:edit` is
approved as a future seed increment but not delivered"*, `decisions: [AD-7, AD-12, AD-21]`,
`expiry_trigger: Permission/grant increment reaches approved production`).

Two consequences, both real:

1. **A rating that its evidence contradicts** (rubric 2). `OQ-AC-EDIT` and `TD-08` describe the same
   object in incompatible approval states — one "exists in no catalog / open decision", the other
   "approved but not delivered". Reading `blockers.yaml` alone, an architect is told to go make a
   decision that was made on 2026-09-01. Reading `transition-debt.yaml` alone, a delivery lead is told
   to go ship it. The register does not resolve which.
2. **`mentorship:assign` has no supporting evidence at all.** `rg -c 'mentorship:assign'` against the
   adoption SPEC returns **zero**. The key actually appears in `docs/architecture/mentorship.md`,
   `docs/architecture/database-schema.md`, `_bmad-output/implementation-artifacts/access-control/deferred-work.md`,
   the 2026-09-01 alignment SCP, and five mentorship e2e specs. Half of this blocker's declared scope
   is cited to a file that never mentions it.

This is the one place where the revision's own §7.1 discipline slipped in the opposite direction from
usual: not closing something on weak evidence, but *opening* something whose cited evidence records it
as decided.

**Recommended action.** Split `OQ-AC-EDIT`. For `user-management:edit`: either delete the entry as
duplicative of `TD-08`, or restate it as *delivery* of an approved decision, cite `SPEC.md:327-336`
with the approver and date, and cross-link `TD-08`. For `mentorship:assign`: keep it open if the key
genuinely has no approved catalog entry, but cite the files that actually reference it
(`docs/architecture/mentorship.md`, `deferred-work.md`, the alignment SCP) and state whether the
2026-09-01 SCP decided it. Reconcile the wording with `TD-08` either way.

#### H3. §3's AD-15 row and TD-05 both carry a claim the same document declares inaccurate

**Confirmed, and the underlying fact is confirmed too.** §3 AD-15: *"Storage is real and **dispatcher
fake is scoped**; interim auth/AC adapters are cutover debt."* `transition-debt.yaml` TD-05:
*"Magic-link dispatcher is **a scoped external-integration fake**"*, `severity: P3`. §11 "Known
remaining findings, carried not fixed": *"AD-15's 'dispatcher fake is scoped' claim is inaccurate — the
fake is bound in the production module."*

Verified: `user-management.module.ts:34` —
`{ provide: MAGIC_LINK_DISPATCHER_PORT, useClass: MagicLinkDispatcherFake }` — inside the sole
`@Module({ providers: [...] })` of `UserManagementModule`. There is no separate test module override.
The fake is in the production composition root.

The problem is not which side is right; it is that **the package asserts and denies the same thing and
leaves the contradiction standing in the register teams read.** §3 is the decision register. A planner
reading §3 sees AD-15 as clean apart from the interim adapters. Only a reader who reaches §11's
"carried not fixed" list learns that the same document considers that row wrong.

**The scope justification is also wrong.** §11 groups this with items requiring spine edits. It does
not require one. AD-15's *text* lives in the spine and is off-limits; the **ratification's own
description of implementation state** is this package's own content, in this package's own files. §11
row 4 rewrote TD-04's deviation text in exactly this way. The same move was available here.

For completeness on the substance: AD-15 (`ARCHITECTURE-SPINE.md:160`) does bless interim fakes when
*"the dependency belongs to a different, not-yet-built story, epic, or bounded context"*, and
magic-link auth is UM Epic 2 — so a fake is arguably legitimate. But AD-15's stated precedent
(`:158`) is `src/storage/` with *"**no fake at all** at the adapter level (production never runs the
test suite, so there is nothing to protect a fake from)"*, and that rationale is what a
production-module binding defeats. The register should record which reading governs.

**Recommended action.** Pick one reading and make all three places agree. If the fake is compliant,
delete the §11 bullet and say in TD-05 *why* (Epic 2 owns the real adapter, AD-15:160 permits it). If
it is not, correct §3's AD-15 row and TD-05's deviation text to state that the fake is bound at the
production composition root, and cite `user-management.module.ts:34` instead of the bare directory
`services/backend/src/user-management/`. Also reconsider `P3`: a dispatcher that only logs
(`magic-link-dispatcher.fake.ts` logs the recipient address, no token — so this is **not** a
credential leak) still means that if the backend is deployed, magic-link login silently succeeds while
no user ever receives a link. That is a total authentication-availability failure on deploy, which
under `transition-debt.yaml:6-10`'s own "consequence if it reaches a shared environment" rule reads as
P2, not P3.

#### H4. Frontend architecture is a silent dimension, while the frontend is SHA-pinned as evidence

**Confirmed.** `services/frontend` is a real React application: `src/App.tsx`, `src/main.tsx`, and
`api/`, `components/`, `config/`, `contexts/`, `hooks/`, `i18n/`, `lib/`, `locales/`, `pages/`,
`router/`, `types/`.

Every mention of the frontend in the entire package (`rg -i frontend`, 3 hits, all incidental):

- `ARCHITECTURE-RATIFICATION.md:23` — the SHA pin `services_frontend: d06b977…`
- `:27` — the untracked-file caveat
- `:127` — one §4.2 bullet, *"People Management frontend features."*, under "Confirmed absent or incomplete"

**No AD, no §3.1 dimension row, no blocker, no evidence-matrix entry covers frontend architecture.**
The parent spine is silent too: its Stack table (`ARCHITECTURE-SPINE.md:216-223`) lists only
TypeScript/Node, NestJS, Prisma, and PostgreSQL — no frontend framework, no state management, no API
client contract. Under §3.1's own stated standard — *"A dimension left silent is a finding, not a clean
package"* — a spine-level silence is exactly what the dimension register exists to record.

This compounds `OQ-118` (`{data, canEdit}` response-envelope ownership, P1, open). The envelope is a
frontend↔backend contract; the package records the backend-side ownership gap and nothing about the
consumer side, so the same "two teams build incompatibly" exposure applies to auth-token handling,
error/denial rendering (which interacts with the open 403-vs-404 question in `CONFLICT-UM-01`), and
i18n/locale sourcing.

The pinning makes it sharper: the package pins the frontend SHA as part of `evidence_baseline`,
asserting that frontend evidence was assessed at that commit, then assesses none.

**Recommended action.** Either add a `frontend-architecture` dimension row to §3.1 and
`evidence-matrix.yaml.dimensions` (owner Architect; design `open`; implementation `partial`; covering
framework/state management, API client and envelope consumption, session/token handling, denial
rendering, i18n) with a matching blocker; or drop `services_frontend` from `evidence_baseline` and
state in §1 that the frontend is outside this ratification's scope. Pinning it while recording nothing
is the one option that misleads.

---

### MEDIUM

#### M1. `partial` versus `transition-debt` has no precedence rule, so open debt is systematically understated in §3

**Confirmed.** `evidence-matrix.yaml:8-10` declares the new invariant: *"An AD carrying an open
transition-debt item may not be rated conformant; the two values are mutually exclusive."* §2 repeats
it and notes this revision enforces it "for the first time".

The invariant is written to bar only `conformant`. But §2 defines `transition-debt` as its own
implementation value meaning *"the target decision is accepted while current code temporarily deviates
under a named retirement trigger"* — which is precisely the state of several ADs now rated something
else:

| AD | §3 implementation rating | Open TD items pointing at it (`decisions:`) |
|---|---|---|
| AD-2 | `partial` | TD-09 |
| AD-7 | `partial` | TD-08 (acknowledged via `carries_transition_debt`) |
| AD-10 | `partial` | TD-06, TD-07 |
| AD-14 | `partial` | TD-03 |
| AD-17 | `absent` | TD-07 |

No rule in the package says when a deviating AD is `partial` versus `transition-debt`, so the same code
state supports either rating and the register understates named, trigger-bearing debt on five ADs. The
practical cost: AD-14 reads `partial` — "some of it isn't built yet" — when the actual state is
"legacy `POST /users` and `DELETE /users/:id` are still live and must be retired in the cutover"
(TD-03), which is a different instruction to a story author.

This also undercuts §10's new automation candidate. *"The `conformant` versus `transition-debt`
mutual-exclusion invariant, which AD-7 violated"* — as specified, a validator would pass AD-2, AD-10,
AD-14, and AD-17 while their debt goes unsurfaced.

**Recommended action.** Add a precedence rule to §2 and `evidence-matrix.yaml.invariants`: an AD with
at least one open transition-debt item is rated `transition-debt` unless the deviation is confined to a
not-yet-built part, in which case record both the rating and the reason. Then re-rate or annotate
AD-2, AD-10, AD-14, and AD-17, and restate the §10 automation candidate as "every AD referenced by an
open TD item is rated `transition-debt`, or carries a recorded exception".

#### M2. AD↔TD reciprocity is claimed as a checkable invariant but implemented on one AD out of ten

**Confirmed.** `transition-debt.yaml` items point up at ADs via `decisions:`. Only **one** AD points
back: `AD-7` has `carries_transition_debt: [TD-08]`. AD-2 (TD-09), AD-6/AD-9/AD-12/AD-21 (TD-01),
AD-10 (TD-06, TD-07), AD-13 (TD-06), AD-14 (TD-03), AD-15 (TD-02, TD-05), AD-16 (TD-02, TD-03), and
AD-17 (TD-07) have no back-link.

§10 lists *"Cross-file AD status consistency … including the reciprocal `decisions:` links"* as a new
automation candidate, and §11 row 5 records fixing one such link. But a reader in
`evidence-matrix.yaml` at AD-14 sees `partial` with two directory-level evidence paths and no signal
that TD-03 exists. The package does hedge — §10 concedes the referential-integrity check *"is not
implementable until `decisions:` has defined semantics"* — but that concession is the same gap as M1,
and it means the reciprocity invariant currently guarantees nothing.

**Recommended action.** Populate `carries_transition_debt:` on all ten referenced ADs. It is
mechanical, derivable from `transition-debt.yaml`, and it is the precondition that makes both this and
the M1 validator implementable.

#### M3. §3's AD-19 row says the write contract is approved; `CC-04` says sign-off is not recorded

**Confirmed.** §3 AD-19: *"Storage, cardinality, and **write contract are approved**."*
`evidence-matrix.yaml` AD-19 note: *"The People Partner storage, cardinality, and write contract are
approved and distilled into AD-19."* But `blockers.yaml` `CC-04` (P2) is
`status: design-approved-pending-signoff` with
`closure_condition: Named Product Owner and Architect sign-off recorded in an approval ledger`, and it
`blocks: [People Partner mutation contract]` — the same contract.

So the register asserts approval of an artifact that an open blocker says has no recorded sign-off.
§7.1 is careful about this distinction elsewhere (*"`CC-04` and `CC-06` moving to design-approved means
two *design* questions are answered"*), which makes the unqualified "approved" in §3 the outlier.
Contrast AD-20's row, which handles the identical situation correctly by naming exactly what keeps it
short of `ratified`.

Note this is the same pattern as H2 in mirror image: H2 records an approved decision as open, M3
records a pending-sign-off decision as approved.

**Recommended action.** Change §3's AD-19 disposition to "design distilled into AD-19; named sign-off
pending (CC-04)", and add `blocked_by`/`pending_signoff: [CC-04]` to the AD-19 row in
`evidence-matrix.yaml` so the reciprocal link exists.

#### M4. PeopleForce integration is silent, though the bound spine names it as deferred

**Confirmed.** `rg -i PeopleForce` across all four package files: **zero hits**. In the parent spine:
three, including `ARCHITECTURE-SPINE.md:309`, a Deferred entry titled *"**Timetracker & PeopleForce
integration design**"*, and AD-13's **Binds** line (`:143`) *"user-management; future
timetracker/PeopleForce sync"*.

The revision did good work splitting `TIMETRACKER-CONTRACT` into `TT-IDENTITY-01` (P0) and
`TT-PMDM-01` (P1). It resolved one half of a two-named integration dimension and left the other
unrecorded. This is the prompt's "integration topology beyond TimeTracker" case: a second external
system named in a bound spine's Deferred list, plausibly a second candidate writer of the very
employment-status fact CC-08 is about (PeopleForce is an HR system), appearing in no register.

**Recommended action.** Either add a blocker for the PeopleForce integration contract (owner Architect
and Integration owner; closure: contract inspected and an events-vs-state-at-sync decision recorded,
mirroring the AD-18 discovery gate at `ARCHITECTURE-SPINE.md:180`), or record explicitly that
PeopleForce is out of v1.5 scope. Also consider whether it belongs in CC-08's candidate-writer list.

#### M5. §7.2(b)'s "currently stopgapped" overstates a planned path in an unapproved draft

**Confirmed, narrow.** §7.2 item 2 and `blockers.yaml` `CC-08.statement` (b) both read: the seeded
import *"carries CSV `IsDismissed`/`DismissedDate` … **currently stopgapped** onto `User.isActive`
until the aggregate lands."*

The word "currently" implies live code. It is not. The source
(`docs/test-cases/user-management/seed/README.md:37`) is conditional — *"`User.isActive` **may** be set
`false` for a dismissed import row **as the stopgap**"* — and that README is labelled at `:7-9`:
*"**Status:** unapproved draft (v1.5 refresh, 2026-09-01). Per-file human approval under the AD-1
stage-1 gate is still required; no `approvals.yaml` records any of these yet."* The package's own §4.2
confirms the import does not exist, and §3's AD-16 row says only *"Root seed exists"*.

Opening a P0 on draft evidence is the correct fail-closed instinct and does not violate §7.1, which
governs *closures*. The issue is only that the tense presents a planned mapping as an implemented one,
in the one blocker the run was told not to resolve — so precision matters more here than elsewhere.

Worth adding while there: the planned mapping deviates from AD-16's explicit rule
(`ARCHITECTURE-SPINE.md:167`, *"`User.isActive` remains a technical account/row-retention flag and is
**not** employment status"*). That conflict is currently visible only inside CC-08's prose.

**Recommended action.** Reword to "the planned AD-16 seeded-import path (unapproved draft,
`seed/README.md:37`) maps CSV `IsDismissed`/`DismissedDate` to the same §4.16 fact and proposes an
interim `User.isActive` stopgap". Note in CC-08 that the proposed stopgap contradicts
`ARCHITECTURE-SPINE.md:167`, so the ownership decision must also rule on it.

#### M6. The operational-envelope dimension is a real improvement but incomplete on deploy mechanics

**Partly confirmed.** The dimension's eight sub-items cover `ARCHITECTURE-SPINE.md:316` and most of
AD-20's release gate at `:196` (timezone validation, worker topology, health signals folded into
"observability vendor and alert ownership", manual retry surface), plus two the spine does not name —
rollback position and secret management. Both additions are well-founded; the secret-management
rationale (dev-only TimeTracker host, per-partner `X-Api-Key`) is sound.

What it omits, against AD-20:196 and the repository state:

1. **Migration-before-worker-enablement sequencing.** AD-20:196 opens with *"schema migration lands
   before worker enablement"*. That is a deploy-ordering constraint, and it is not "rollback position"
   or "worker process topology". Getting it wrong means workers claim rows against a schema that lacks
   the columns — a runtime failure, which is the exact class the dimension says it exists to catch.
2. **No build or deployment pipeline exists at all.** I found **no `Dockerfile` anywhere** in the repo
   and **no CI workflow** (`.github/workflows/*.yml` absent). `docker-compose.yml` provides only
   `localstack` and `postgres`. The dimension asks who the hosting provider is; the more basic fact —
   there is no container image and no pipeline to produce one — is recorded nowhere, though it is the
   binding constraint on every other envelope sub-item and is the same observation that makes
   `SEC-AUTH-01` latent.
3. **Backup, restore, and disaster recovery** are absent from the list, on a system whose product
   scope is personal-data records for 500+ employees.

**Recommended action.** Add the three items to `OPERATIONAL-ENVELOPE.blocks` and to the §3.1 and
`evidence-matrix.yaml` `covers:` lists, and record the no-image/no-pipeline fact as dated
implementation evidence on the dimension row (it is a factual observation at the baseline, not a
readiness statement).

---

### LOW

#### L1. "all 25" open blockers counts a superseded entry alongside both its replacements

Status breakdown: 22 `open`, 1 `superseded` (`TIMETRACKER-CONTRACT`), 1
`design-approved-pending-signoff` (`CC-04`), 1 `design-approved-implementation-blocked` (`CC-06`).
§7's heading is "Open blockers" and its text says it "now enumerates **all 25**". `TIMETRACKER-CONTRACT`
is superseded and both successors are counted separately, so the headline is inflated by one and three
of the 25 are not `status: open`.

The package is not hiding this — §7.1 explains the supersession in detail and `blockers.yaml:11-14`
states a re-scope is never a closure. Since the direction of error is conservative and the reasoning
is disclosed, this is presentational. **Recommended action:** state it as "24 open, 1 superseded with
two open successors", or add a one-line status breakdown under the §7 heading.

#### L2. Security and compliance posture for personal data is silent

`rg -i 'GDPR|PII|privacy|compliance|retention'` across the package: **zero**. The data in scope is
employee personal data — `Birthday` (day and month, year deliberately dropped), photo, work email,
country/city, documents, feedback, assessments. The spine touches the edges (`:167` row-retention
versus employment status; `:317` notifications/analytics privacy constraints becoming binding if
selected) but no register in the package records a status for data-retention policy, lawful basis,
export/erasure, or audit-log retention. `CC-07` covers the journal *schema* and reader authorization,
which is adjacent but not the same dimension.

I rate this Low rather than Medium only because the prompt's own list places it after the dimensions
above and because no requirement I found sets a concrete compliance obligation. **Recommended
action:** add a one-row `data-protection-posture` dimension (owner Architect and Security; design
`open`) or record explicitly that it is out of v1.5 scope, so the silence is a decision rather than an
omission.

#### L3. Directory-level evidence on TD-05 and TD-09 does not pin the claim

`TD-05.evidence` is `services/backend/src/user-management/` and `TD-09.evidence` is
`services/backend/test/access-control/`. Both exist, so §10's new "evidence-path existence, asserting
file rather than directory" check would pass them, but neither points at the line that establishes the
deviation — for TD-05 that is `user-management.module.ts:34` (see H3). Contrast TD-02 and TD-04, which
cite exact line ranges. **Recommended action:** replace both with file-and-line citations.

#### L4. API versioning is not addressed

`rg -i 'versioning|api-version'` returns zero in both the package and the spine. AD-14 fixes route
*shapes* (`ARCHITECTURE-SPINE.md:151`) but says nothing about how a breaking change to the
`{data, canEdit}` envelope or the S1 projection would be rolled out to the frontend. Marginal for an
internal v1.5 with a single first-party consumer, and it partly folds into `OQ-118`. **Recommended
action:** note it as deliberately out of scope in `OQ-118`, or accept as-is.

#### L5. Minor: the `ACM-0..ACM-9` range label is not exact

§11 refers to *"ACF-1, ACM-0..ACM-9"*. The AC spine actually carries `ACM-0`…`ACM-5`, `ACM-8`, `ACM-9`
— `ACM-6` and `ACM-7` do not appear. The range label matches [`gate-decision.json`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/c342138/_bmad-output/test-artifacts/gate-decision.json)'s (`c342138`) target label
(*"Access Control Kernel MVP (ACM-0..ACM-9)"*), so it is inherited rather than invented. Only worth
fixing when C1 is addressed and these IDs get enumerated individually.

---

## Section C — Severity assignments (rubric: defensible on impact?)

Judged on money, users, data, integrations, permissions, production.

**Defensible as assigned (6 of 8 P0s).** `SEC-AUTH-01` (privilege escalation to a self-provisioned HR
Admin — permissions, correctly kept P0 despite being latent); `CC-07` (journal for permission and
relationship changes — data integrity plus audit); `CC-08` (employment status gates access revocation
for departed staff — permissions and data); `CC-09` (no idempotency key on `UserEvents` under an
at-least-once retry duplicates career history — data integrity); `OPERATIONAL-ENVELOPE` (AD-20:196
classes mixed process configuration as a startup/deployment failure — production);
`QUALITY-GATE-AC` (an uncovered inactive-identity fail-closed invariant against a recorded FAIL gate —
permissions, verified against the artifact).

`TT-IDENTITY-01` at P0 is also defensible, and well argued: project members arrive as
`AccountTalentDto {email, dateStart, dateEnd}` with no durable id, requirements state email alone is
insufficient, and AD-13 builds `User.ttId` on that premise — so an authorization edge would be joined
on the one key the requirements forbid. Integration plus permissions.

**Two I would question:**

- **`CC-10` at P0 is heterogeneous.** Its `blocks:` list mixes the Mentorship bounded context and the
  `MentorshipAvailability` aggregate (delivery-scoped) with *"Architecture document-status
  governance"* (process). The governance half has no direct money/users/data/permissions impact; it is
  a real finding — a spine labelled `draft` changed underneath a ratification, and it carries TD-10 —
  but bundling it with the Mentorship gate makes the P0 unfalsifiable, since it cannot be closed
  without also closing a process question. **Recommendation:** split into a P0 for the Mentorship
  approval gate and a P2 for document-status governance, so each can close on its own evidence.

- **`CONFLICT-UM-01` at P1 looks under-weighted.** The unresolved question is the empty-audience denial
  oracle for `GET /users/:id`, 403 versus 404. The choice is an existence-disclosure decision: 403
  confirms a user id exists to a viewer with no audience over them; 404 does not. The blocker's own
  note records that the implementation is currently **split** — *"the guard throws 403, the action
  throws 404, and the interim adapter bypasses both"* — and `propagation:` records four artifacts
  carrying the 404 behaviour. An inconsistent, untested information-disclosure boundary on the primary
  profile endpoint is a permissions and data-exposure concern, and
  `docs/project-requirements.md:99` is emphatic that holding a functional role must never confer data
  access. Keeping it open rather than inventing a rule is right (the approved SCP instructs exactly
  that); the **P1** is the part I would challenge. **Recommendation:** raise to P0, or record in the
  note why disclosure-by-status-code is accepted at P1 for now.

- **`TD-05` at P3** — see H3. Under `transition-debt.yaml:6-10`'s own consequence-on-deploy rule, a
  dispatcher fake bound at the production composition root reads P2.

**No severity looked inflated.** The P2 set (`CC-04` design-done-pending-signoff, `OQ-114`/`OQ-115`
stub-backed engines, `OQ-117` context placement) is reasonable, and the P1 set is not padded with
items that belong lower.

---

## Section D — Rubric scorecard

| # | Rubric item | Result | Governing findings |
|---|---|---|---|
| 1 | Fixes the real divergence points for the level below, misses none | **Partial** | Fixes the authorization/serialization divergences precisely (A5, A6). Misses the performance envelope (H1), the entire AC spine (C1), and frontend (H4) |
| 2 | Every status enforceable and evidence-backed | **Mostly pass** | Citations line-exact and downgrades justified (A3, A4). One status refuted by its own evidence (H2); one approval overstated (M3) |
| 3 | Nothing deferred could let two units below build incompatibly | **Fail** | H1 is the clear case — an N+1 and a bulk resolver are both conformant to this package. Also C1, H4 |
| 4 | Every dimension the altitude owns is decided, deferred, or open | **Fail** | §3.1 opened the register and filled one row. Silent: performance/NFR (H1), frontend (H4), AC-spine decisions (C1), PeopleForce (M4), data protection (L2). Envelope row itself incomplete (M6) |
| 5 | Internal consistency across the four files | **Mostly pass** | Counts exact (A1); declared links resolve (A10). Self-contradiction left standing (H3); no `partial`/`transition-debt` precedence (M1); reciprocity 1-of-10 (M2); AD-19 vs CC-04 (M3) |
| 6 | Ratifies rather than contradicts the codebase and both spines | **Partial** | Faithful to the brownfield code and to the People Management spine. The Access Control spine is bound in frontmatter and ratified nowhere (C1) |
| 7 | AD IDs genuinely preserved | **Pass** | AD-1…AD-21 in register, matrix, and spine; none renumbered, reused, or retired; none invented (A2) |
| — | No release-readiness claim | **Pass** | Verified specifically; none found (A8) |
| — | CC-08 genuinely unresolved; §7.2 framing accurate | **Pass** | Unresolved with an explicit `resolution_note`; the scope correction against AD-13:145 is verified correct and the prior gate's framing was wrong (A9). One tense overstatement (M5) |

**Constraints honoured:** all AD IDs preserved; CC-08 not resolved and no `EmploymentStatus` ownership
rule invented; no release-readiness claim; neither spine edited (both spine files are at the pinned
commit with clean paths).

---

## Section E — Confirmed findings versus assumptions

**Confirmed** — verified against files at the pinned SHAs, with path and line: C1, H1, H2, H3, H4, M1,
M2, M3, M4, M5, L1, L2, L3, L4, L5, and every item in Section A.

**Partly assumption** — the facts are confirmed; the weight is judgement:

- **M6** — the three omissions are confirmed absent (no `Dockerfile`, no CI workflow, no
  backup/restore or migration-sequencing item in the `covers:` list). Whether they belong inside
  `OPERATIONAL-ENVELOPE` or in a separate delivery-infrastructure dimension is a judgement call.
- **Section C** — severities are recorded facts; my challenges to `CC-10`, `CONFLICT-UM-01`, and
  `TD-05` are risk judgements, not defects. I have stated the impact reasoning so the Architect can
  disagree on the reasoning rather than on the reading.
- **H3 substance** — that the fake is bound at the production composition root is confirmed
  (`user-management.module.ts:34`). Whether that *violates* AD-15 is genuinely arguable both ways
  (`:158` versus `:160`). The finding does not depend on resolving it: the package asserts both
  positions.
- **L2** — the silence is confirmed. That data-protection posture is owned at *this* altitude rather
  than deferred to a later compliance workstream is an assumption; I found no requirement fixing it.

**Not assessed:** whether the delivered Phase-0 audience resolver actually meets the 500-record / 2 s
budget. No performance evidence exists in the package or in `_bmad-output/test-artifacts/`, which is
the substance of H1. I did not run the test suites; A3–A7 rest on static reading of source, schema,
migrations, and the gate artifact, not on execution.

---

## Section F — Recommended disposition

**Do not re-issue the package for the whole finding set.** The revision's factual discipline is high
and its corrections are sound; re-running it wholesale would risk regressing A1–A11.

Sequenced, cheapest-first:

1. **C1** — add the Access Control decision register (or narrow the frontmatter binding claim). Largest
   coverage gap; touches the permissions dimension; requires no spine edit.
2. **H1** — add the performance-envelope dimension and its blocker. This is the only finding where the
   current package actively permits two incompatible implementations one level down.
3. **H2, H3, M3** — three status/wording corrections inside this package's own files. Each is a few
   lines. Together they remove every internal contradiction I found.
4. **H4, M4, L2** — three more dimension rows, or explicit scope exclusions. Either is acceptable;
   silence is not.
5. **M1, M2** — the precedence rule plus `carries_transition_debt:` back-links. These are the
   precondition that makes §10's proposed validators actually implementable, which is what converts
   this package from a document into an enforceable gate.
6. **M5, M6, L1, L3** — wording and completeness cleanups.
7. **Section C** — Architect to confirm or revise `CC-10`, `CONFLICT-UM-01`, and `TD-05`.

`CC-08` should remain open and unresolved. Nothing in this review should be read as reducing the open
blocker surface, and nothing here constitutes evidence of release readiness.
