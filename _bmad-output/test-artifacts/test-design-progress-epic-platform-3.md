---
runScope: 'epic'
runKey: 'epic-platform-3'
workflowStatus: 'generated'
totalSteps: 8
stepsCompleted: ['step-01-detect-mode', 'step-02-load-context', 'step-03-risk-and-testability', 'step-04-coverage-plan', 'step-05-generate-output', 'step-06-post-validation-correction', 'step-07-post-revalidation-edit', 'step-08-open-item-12-widened']
lastStep: 'step-08-open-item-12-widened'
nextStep: 'C-1, C-3, C-4 and W-1 closed; C-2 recorded as plan Open item 12 (five artifacts, root at SPEC CAP-6) and recommended to DEPT-4. An Edit cannot clear a verdict — a further Epic Validate is required to supersede CONCERNS'
approvalStatus: 'granted'
approvalGrantedBy: 'Anna Pikula'
approvalGrantedDate: '2026-09-12'
validationStatus: 'CONCERNS (2026-09-12, re-validation)'
validationReport: '_bmad-output/test-artifacts/test-design-validation-report-epic-platform-3.md'
lastSaved: '2026-09-12'
epicId: 'PLAT-E3'
epicDomain: 'platform'
epicSourcePath: '_bmad-output/planning-artifacts/platform/epics.md'
epicNumber: 3
inputDocuments:
  - '_bmad-output/test-artifacts/test-design/README.md'
  - 'docs/test-design-workflow-contract.md'
  - '_bmad-output/planning-artifacts/platform/epics.md'
  - '_bmad-output/test-artifacts/test-design-architecture.md'
  - '_bmad-output/test-artifacts/test-design-qa.md'
  - 'docs/architecture/README.md'
  - 'docs/architecture/access-control.md'
  - 'docs/architecture/testing-strategy.md'
  - 'docs/architecture/database-schema.md'
  - 'docs/architecture/nestjs-di-tokens.md'
  - 'docs/architecture/domain-driven-design.md'
  - '_bmad-output/implementation-artifacts/access-control/acm-4-disposition.yaml'
  - 'services/backend/package.json'
  - 'services/frontend/package.json'
  - 'services/backend/test/access-control/'
  - 'services/backend/test/measurement/acm9/'
  - 'docs/test-cases/access-control-kernel/'
  - '.agents/skills/bmad-testarch-test-design/resources/knowledge/risk-governance.md'
  - '.agents/skills/bmad-testarch-test-design/resources/knowledge/probability-impact.md'
  - '.agents/skills/bmad-testarch-test-design/resources/knowledge/test-levels-framework.md'
  - '.agents/skills/bmad-testarch-test-design/resources/knowledge/test-priorities-matrix.md'
  - '.agents/skills/bmad-testarch-test-design/resources/knowledge/nfr-criteria.md'
  - '.agents/skills/bmad-testarch-test-design/resources/knowledge/playwright-utils-mandate.md'
  - '.agents/skills/bmad-testarch-test-design/resources/knowledge/overview.md'
  - '.agents/skills/bmad-testarch-test-design/resources/knowledge/api-request.md'
  - '.agents/skills/bmad-testarch-test-design/resources/knowledge/auth-session.md'
  - '.agents/skills/bmad-testarch-test-design/resources/knowledge/recurse.md'
  - '.agents/skills/bmad-testarch-test-design/resources/knowledge/pactjs-utils-mandate.md'
  - '.agents/skills/bmad-testarch-test-design/resources/knowledge/pactjs-utils-overview.md'
  - '.agents/skills/bmad-testarch-test-design/resources/knowledge/pactjs-utils-consumer-helpers.md'
  - '.agents/skills/bmad-testarch-test-design/resources/knowledge/pactjs-utils-provider-verifier.md'
  - '.agents/skills/bmad-testarch-test-design/resources/knowledge/pactjs-utils-request-filter.md'
  - '.agents/skills/bmad-testarch-test-design/resources/knowledge/pact-mcp.md'
pact_mcp_reachable: false
---

# Progress — PLAT-E3 Access Control Kernel MVP

## Step 1 — Detect mode and prerequisites

- **Requested operation:** Create, Epic-Level.
- **Resolved canonical identity:** `platform` / `PLAT-E3` / Epic 3 / `_bmad-output/planning-artifacts/platform/epics.md` / `## Epic 3: Access Control Kernel MVP`.
- **Resolved run key:** `epic-platform-3`.
- **Prerequisites:** the canonical epic source is present and contains the one authoritative Epic 3 body; shared architecture context is available.
- **Existing canonical artifacts:** neither the selected plan nor the selected checkpoint existed before this run.
- **Files allowed to change in this Create run:** this checkpoint, `_bmad-output/test-artifacts/test-design-epic-platform-3.md`, and the PLAT-E3 row in `_bmad-output/test-artifacts/test-design/README.md`.
- **Must remain unchanged:** system artifacts, all other epic plans/checkpoints/reports, scenario files, trace artifacts, service code, gitlinks, sprint status, and ClickUp data.

## Step 2 — Load context and knowledge base

- **Detected stack:** full-stack repository; the selected PLAT-E3 scope is backend, headless-facade/PostgreSQL only. The selected access-control tests contain no browser navigation/locator flow, so the API-only Playwright-utilities profile applies when examples are needed.
- **Epic inputs:** canonical PLAT-E3 body (ACM-0, 1, 2, 3, 4, 5, 8, and 9), platform system design pair, binding Access Control/testing/schema/DI/DDD rules, and the ACM-4 `no-gap` disposition.
- **Existing evidence boundaries:** real PostgreSQL Stage-2 suites exist for ACM-0, ACM-1R, ACM-2, ACM-3, ACM-4R, ACM-5, and ACM-8; ACM-9 has its dedicated measurement harness and append-only baseline/final artifacts. Their presence is evidence inventory, not an approval, validation, coverage, or release claim.
- **Critical scope constraints:** no `/users` enforcement, frontend, User Management rebinding, debug endpoint, or new HTTP surface; deployment stories must invoke `db:seed` / `db:bootstrap:access-control` rather than reimplementing production logic in tests; the headless facade uses the real module, Prisma adapters, and migrated PostgreSQL.
- **Pact broker:** unreachable (SmartBear MCP tools not available). Existing provider source and contract artifacts were used only for context; PLAT-E3 introduces no consumer/provider boundary, so no new Pact work is planned.
- **Browser exploration:** not run. `playwright-cli` is unavailable and the headless kernel has no browser target or UI acceptance criterion.

## Step 3 — Risk and NFR assessment

| ID | Risk | Category | P | I | Score | Mitigation / evidence owner |
| --- | --- | --- | ---: | ---: | ---: | --- |
| PLAT-E3-R01 | A missing/inactive identity, cycle, or inactive bridge leaks an audience. | SEC / BUS | 3 | 3 | 9 | Platform backend: real-PostgreSQL facade tests for viewer, target, PP, chain termination, cycles, and path-local state. |
| PLAT-E3-R02 | FR and AR facts cross-contaminate, granting data access or feature access incorrectly. | SEC / DATA | 2 | 3 | 6 | Platform backend: type-separated database constraints plus `isAllowed` and multi-audience negative cases. |
| PLAT-E3-R03 | Root normalization, bootstrap adoption/drift, or a concurrent deploy leaves a partial or wrong authority state. | DATA / OPS | 2 | 3 | 6 | Platform backend: invoke `db:seed` and `db:bootstrap:access-control`; assert transaction rollback, locks, singleton and restrictive FKs. |
| PLAT-E3-R04 | Section-access merge or an unsupported section widens profile access. | SEC / BUS | 2 | 3 | 6 | Platform backend: exact S1/S10/S11 merge table and unsupported/empty result tests through the public facade. |
| PLAT-E3-R05 | App composition alters `/users` or adds a test/debug HTTP route. | TECH / SEC | 2 | 3 | 6 | Platform backend: composition E2E plus repository/module-boundary audit; User Management owner retains adoption work. |
| PLAT-E3-R06 | A 500-target resolver regression is hidden by incomplete/non-comparable measurement or is misreported as list-route evidence. | PERF / OPS | 2 | 3 | 6 | Platform backend: `ACM9-MVP-v1` baseline/final artifact protocol; report only Contract B, not `PG-04` / DIR-A1. |
| PLAT-E3-R07 | A resolution cached in the facade or a consumer outlives a `Relationship` change, so a revoked audience survives into the next request (requirements §2.1 *Timing of revocation* [NORMATIVE]). | SEC | 2 | 3 | 6 | Platform backend: same-process re-resolution evidence across a mutation on every audience- and section-returning call. This epic's slice of `PR-002`. |
| PLAT-E3-R08 | A consumer reads base `write` on `profile:identity` as a mandate over the S1 relationship fields, bypassing `org:relationships:write`, the self-assignment bar and the §3.4 journal. | SEC / BUS | 2 | 3 | 6 | Platform backend: negative obligation on E3-C06 — the decision is section-scoped, not field-scoped. Enforcement owner is `UM-E0-S0.1`. |

Scores of 6+ require planned mitigation. Category legend: `SEC` security, `BUS` business, `DATA` data integrity, `OPS` operational, `TECH` technical, `PERF` performance; score = probability × impact on 1–3 scales. `PLAT-E3-R01` is the only score-9 risk; it blocks any claim that the kernel is safe to consume until its headless-facade evidence is present. This is a design risk register, not a release verdict.

### NFR planning

- **Security:** fail closed for missing/inactive data and unsupported sections; prove through real facade / PostgreSQL evidence. No numeric security threshold is specified.
- **Security — revocation (§2.1 [NORMATIVE]):** platform-owned relations take effect on the **next request** — no grace period, no re-login, no cache outliving the change. No numeric window applies to the owned-relation half; the 15-minute project window is PLAT-E8. Evidence: mutate a `Relationship` between two facade calls in one process and assert the second call reflects it without restart or explicit invalidation.
- **Performance (Contract B only):** `ACM9-MVP-v1` measures the public facade for 500 active targets across Reporting, PP, Colleague, mixed, and prescribed depth shapes. Warm p95 and absolute worst case must each be ≤2 seconds; failure/statement-timeout stops the run. The final must be comparable with its baseline. It is not evidence for the All Employees list `PG-04` or P6. **Framing:** PLAT-E3 applies Story 3.8's *discovery* wording (identify the first shape that breaks two seconds); the pass/fail 2 s gate is SD-8's obligation on Epics 5/6/8. Baseline pinned to `acm9-baseline-acm9-1788721821722-afd2fdac4a45.json` with final `acm9-final-acm9-1788722145229-13b089a4cb9f.json` at `3a3cd71` — five PASS baselines exist, so the choice is stated rather than left implicit.
- **Reliability / data integrity:** atomic production entrypoints, repeatable deployment order, restrictive constraints, singleton integrity, and no partial state after errors/concurrent runs. No duration/retry threshold is specified; preserve it as UNKNOWN rather than inventing one.
- **Maintainability:** facade and module boundaries are observable through headless E2E and source/module audits. No numeric threshold is specified.
- **Compliance / external integration:** not in PLAT-E3 scope; no live external-provider test is planned.

## Step 4 — Coverage and execution plan

| Coverage group | Stories / AC focus | Level | Priority | Evidence boundary |
| --- | --- | --- | --- | --- |
| E3-C01 Root prerequisite | ACM-0 normalization, exact-one-before-active validation, diagnostics, no unintended write, insert-race convergence | deploy-entrypoint + migrated PostgreSQL | P0 | Execute `npm run db:seed`; assert DB state and process result. |
| E3-C02 FR foundation | ACM-1 canonical seed/adoption/drift, rollback/concurrency, all CAP-3 constraints and restrictive delete behavior | deploy-entrypoint + migrated PostgreSQL | P0 | Execute `npm run db:bootstrap:access-control`; assert rows and direct constraint rejection. |
| E3-C03 Functional permission decision | ACM-2 live FR joins; inactive/missing/unknown/ungranted/orphan deny; no AR read or cached/persisted decision; no branch on `hr-admin` or an individual permission name; decision re-read on each call after a mid-process grant revocation | headless facade + migrated PostgreSQL | P0 | Real `AccessControlModule` and Prisma adapters. |
| E3-C04 Fail-closed audience resolution | ACM-3 request shape incl. empty list with no graph read, viewer validation ordering before any derivation, absent/inactive viewer or target with no Colleague fallback, normal Colleague fallback for an active pair, PP/manager bridge, termination, per-target cycles, path-local visited state, re-resolution on each call across a `Relationship` mutation | headless facade + migrated PostgreSQL | P0 | Exact `Map<string, Set<Audience>>` assertions; no HTTP endpoint. |
| E3-C05 Audience merge disposition | ACM-4 Reporting+PP coexistence, Self exclusivity, Colleague floor, de-duplication, FR exclusion | headless facade + migrated PostgreSQL | P1 | Existing `acm-4-disposition.yaml` is a prerequisite for ACM-5, not a substitute for its own evidence. |
| E3-C06 Base section decision | ACM-5 S1/S10/S11, empty/missing target, write-over-read merge, all unsupported sections deny, re-evaluation on each call across a `Relationship` mutation | headless facade + migrated PostgreSQL | P0 | Assert base decision only. Negative obligation: base `write` on `profile:identity` is never a mandate over the S1 *manager* / *people partner* / *department* fields (requirements §3.2 note ¹, §2.1 [NORMATIVE]). Consumer field/command projection excluded. S10/S11 Colleague narrowing **is** owned — UM `FR-17` and the written story `TT-E1-S1.2` (`1-2-s10-leaves-read-projection-on-profile`); the real gap is that `FR-17` is deferred with no scheduled story. S1 photo mutation is the only piece with no named owner. See the plan's Open items 6–7. |
| E3-C07 Composition boundary | ACM-8 real `AppModule` import/facade resolution; no UM file changes; no AC HTTP/test-only/debug endpoint. The canonical "`ACCESS_CONTROL_PORT` remains bound to `InterimAccessControlAdapter`" criterion is **superseded** by UMAC-1 Stage 3 / `UM-E0-S0.1` and carries no obligation | module E2E + repository audit | P0 | Real module boot plus scoped audit; does not test `/users` authorization. Port binds `AccessControlFacadeAdapter` (`user-management.module.ts:215`); the interim adapter was deleted in backend `0788f60` (2026-09-02) and `ACM8-KC-02`, realigned 2026-09-01 by that cutover, already asserts the facade-backed adapter. |
| E3-C08 Resolver performance | ACM-9 baseline/final 500-target representative audiences/depth shapes, manifests, explanations and breach stopping | measurement | P1 | Immutable `ACM9-MVP-v1` artifacts; Contract B only. |

### NFR evidence plan

| Category | Planned evidence | Cadence | Boundary |
| --- | --- | --- | --- |
| Security / data integrity | E3-C01 through E3-C07 real PostgreSQL results plus constraint and rollback assertions | PR | Fails closed; no approval or release claim. |
| Performance | E3-C08 `ACM9-MVP-v1` baseline after ACF-1 and comparable final after ACM-8 | Nightly / release-candidate | Artifact is append-only; job remains informational; never substitutes for DIR-A1/PG-04. |
| Reliability / operational | Entrypoint exit status, actionable diagnostics, idempotent rerun/concurrency/rollback observations | PR | No numeric SLO declared. |
| Maintainability | Module/boundary audit and existing static/lint suite | PR | No numeric threshold declared. |

- **PR:** E3-C01…E3-C07 and focused unit/static checks, against migrated PostgreSQL; keep the headless facade and deploy entrypoint boundary real.
- **Nightly / release candidate:** E3-C08 measurement because it is intentionally expensive and produces immutable run artifacts.
- **Weekly:** no separate PLAT-E3-only test class; investigate repeated performance or isolation flakes from the recorded artifacts.
- **Estimates:** P0 ~40–64 h, P1 ~16–30 h, total ~56–94 h; this is planning capacity, not time booked or execution progress.
- **Design quality targets:** the platform pair's three thresholds carried unchanged — **P0 = 100 % covered · P1 = ≥ 95 % covered · the access-control suite passes** (`test-design-qa.md` § *Gate thresholds carried from the handoff*). *Covered* is the pair's word and is not interchangeable with *passes* (`PR-009` coverage-state vocabulary). Every score-6+ risk has named evidence; full NFR assessment remains for `nfr-assess` after evidence exists. No coverage percentage is computed or asserted here.

## Step 5 — Generate output

- **Output:** `_bmad-output/test-artifacts/test-design-epic-platform-3.md`.
- **Validation performed:** template sections, canonical identity metadata, risk-score arithmetic, NFR boundary, coverage matrix, simple PR/Nightly/Weekly execution model, range estimates, status framing, and scope exclusions were checked before generation completed.
- **Result:** document generation only. Approval remains ungranted; Epic Validate has not run.

## Step 6 — Post-validation correction (2026-09-12)

Applied after [`test-design-validation-report-epic-platform-3.md`](test-design-validation-report-epic-platform-3.md)
returned **CONCERNS** and an independent requirements review of the same plan returned
*revisions needed*. The validation report is left exactly as its run wrote it — a verdict is an
attestation and is not hand-edited by a correction pass — so its recorded plan hash no longer
matches current content. **A fresh Epic Validate run against the corrected text is required and
pending.**

- **Files changed in this correction:** this checkpoint, `test-design-epic-platform-3.md`, and the
  `PLAT-E3` row in `test-design/README.md` — exactly the set Step 1 declares. An earlier draft of
  this pass also appended a remediation note to
  `test-design-validation-report-epic-platform-3.md`; that was withdrawn as out of set.
- **Deliberately not changed:** the canonical `epics.md` (its *Kernel MVP status caveat* is itself
  wrong about `sprint-status.yaml` and mis-cites the coverage YAML path — that correction is
  **Platform Story 1.1's** traceability work, and the file is additionally under a concurrent
  Story 1.6 edit), `sprint-status.yaml`, the system design pair, service code, and every other
  epic artifact.

**Identifier realignment.** `E3-C01`…`E3-C08` now follow ACM order in **both** files:
C01=ACM-0, C02=ACM-1, C03=ACM-2, C04=ACM-3, C05=ACM-4, C06=ACM-5, C07=ACM-8, C08=ACM-9. The
pre-correction plan numbered by priority-table position, so `E3-C05`/`E3-C06`/`E3-C07` resolved
to different families in the plan and the checkpoint. This checkpoint's mapping was already
ACM-ordered and is unchanged; the plan was brought to it.

**Corrections carried into the plan** (full list in its Correction log): superseded ACM-8 interim
port criterion; §2.1 revocation timing as `R07` with per-call obligations; execution-state caveat
recording that every Epic 3 story key is `done`; an acceptance-criterion traceability table
covering the five previously unnamed ACs; verbatim pair gate thresholds with the access-control
suite clause restored and *covered* ≠ *pass*; priority criteria plus the stated P1-gates-P0
inversion; the §3.2 note ¹ negative obligation as `R08`; DEPT-2/DEPT-4 ownership for the FR
catalog drift; ownership recorded for S10/S11 Colleague narrowing (UM `FR-17` and story
`TT-E1-S1.2`, the gap being that `FR-17` is deferred and unscheduled) and no named owner for S1
photo mutation;
residual-risk table, `PG-03` defect exit gate, risk legend and knowledge-base appendix; ACM-9
baseline pinned with discovery framing; PM/AD-20 and `CC-07` named as deferrals.

### Second pass — independent audit (2026-09-12)

An independent auditor re-checked every correction against primary sources. Ten of fourteen
verified cleanly, including the full 49-row acceptance-criterion enumeration, the `ACM9-MVP-v1`
baseline pin, the DEPT-2/DEPT-4 ownership and the quoted gate thresholds. Six defects were fixed
in a second pass — the full table is in the plan's Correction log. The two that matter here:

- **`E3-C07`'s conclusion was right but both its citations were fabricated.** The rebind was
  attributed to `PLAT-E4-S4.1/S4.2` (in fact section-key generalisation and the org-relationship
  seed) and the deletion to backend `37a339a` (which deleted the *session resolver*). Corrected to
  **UMAC-1 Stage 3 / `UM-E0-S0.1`** and backend **`0788f60`**.
- **The superseded-criterion test was applied to ACM-8 but not to `CC-07`.** The plan restated
  "no `AccessJournal` table exists" from two stale sources; the table ships at
  `schema.prisma:106`. Open item 9 rewritten.

This checkpoint's own defect: the design-quality target still carried the *covered*→*pass*
conflation that finding F-4 was reported as fixing. Corrected in Step 4 above.

**Provenance caveat.** The plan, this checkpoint and the validation report all enter git as
additions. The "pre-correction text" exists only as session testimony and is not reconstructible
from history; the source-file assertions are independently checkable and were re-checked.

**Result of the second pass:** correction only. No suite was executed. That pass granted no
approval and cleared no verdict; a re-validation was named as the required next action, because
leaving a stale verdict against a changed document is the same class of defect this correction
records against the canonical `epics.md` caveat.

## Step 7 — Post-re-validation Edit (2026-09-12)

Both follow-ups named above have since happened, and this step records their outcome.

- **Self-validated Epic Validate** at baseline `83aeabf` returned **PASS**. Its own report bounded
  that verdict: same session authored the corrections it validated.
- **Approval granted 2026-09-12** by the requester, Anna Pikula. Recorded in the plan frontmatter
  as `approvalStatus: granted`. A human act, separate from validation (contract §5).
- **Independent Epic Validate** at baseline `ce84f7c` returned **CONCERNS**, superseding the PASS
  at the same report path. Four concerns and five WARNs, all about document self-consistency
  rather than design substance; it neither conferred nor withdrew the approval.

This Edit run closes the findings that belong to the plan/checkpoint pair and records the one that
does not:

| Finding | Disposition |
| --- | --- |
| C-1 — checkpoint still claimed S10/S11 Colleague narrowing had "no named owner" after the plan retracted that as false | **Closed.** Both places corrected: the `E3-C06` coverage row and the second-pass summary now name UM `FR-17` and story `TT-E1-S1.2`, with the real gap stated as `FR-17` being deferred and unscheduled. Only S1 photo mutation lacks an owner. |
| C-3 — plan contradicted itself: frontmatter said granted/PASS while the Correction record and Approval prose still said ungranted and "no fresh Validate has run" | **Closed.** Both prose blocks rewritten to the actual state; frontmatter `validationStatus` corrected from PASS to CONCERNS (re-validation), and `independentRevalidation` updated from "in progress" to its result. |
| C-4 — plan and checkpoint disagreed on approval and validation status | **Closed.** This checkpoint's `validationStatus`, `nextStep` and Step 6 closing line now match the plan, and `approvalStatus` is carried here explicitly. |
| W-1 — a sentence duplicated verbatim, back to back | **Closed.** One copy kept. |
| C-2 — ACM-8 artifacts still assert the superseded interim `ACCESS_CONTROL_PORT` binding | **Recorded, not resolved** — plan Open item 12, widened in Step 8 below from three artifacts to five once the root was traced. The plan distinguishes the executable `ACM8-KC-02` (realigned 2026-09-01, asserts the facade-backed adapter) from the scenario document of the same name (not realigned). |

**§4.3 disposition, stated because it is a judgement call.** §4.3 says an epic Edit "may modify
only the selected epic plan", yet C-1, C-4 and W-1 are checkpoint defects. This run edited the
checkpoint as part of the same logical change: the validation report's own recommended next action
names "an Edit run on the PLAT-E3 plan **and checkpoint**"; C-4 is unclosable otherwise, since an
Edit confined to the plan would leave the pair inconsistent by construction; §4.1 treats the plan
and its matching checkpoint as one epic write unit; and §4.3's restriction reads as scope
isolation against other epics and the system pair rather than a bar on the run's own state file.
The index was **not** written: both indexed facts — approval granted, verdict CONCERNS
(re-validation) — were already current, so no indexed fact changed.

**Result:** an Edit cannot clear a verdict. `CONCERNS (2026-09-12, re-validation)` stands until a
further Epic Validate runs against this text. No suite was executed. The approval recorded above
is unaffected.

## Step 8 — Open item 12 widened after tracing C-2 to its root (2026-09-12)

Step 7 recorded C-2 against three artifacts. Tracing the claim to its source showed the reach is
five, and that the ordering implied by the earlier text was backwards.

- **The root is the SPEC, not the cards.** `spec-access-control-kernel-mvp/SPEC.md:150` — CAP-6's
  *success* criterion — still reads "`ACCESS_CONTROL_PORT` remains bound to
  `InterimAccessControlAdapter`". The two scenario cards **trace to CAP-6**, so correcting them
  first would put them in conflict with their own trace. CAP-6 must be amended first.
- **A fifth artifact, in production source.** `services/backend/src/access-control/access-control.module.ts:15`
  still states that user-management binds the port to the interim adapter. That is worse than a
  stale doc: it misleads anyone reading the module.
- **Provenance.** The UMAC-1 story that performed the rebind recorded this follow-up on
  2026-09-01, naming the card realignment, the module header comment, and two `deferred-work.md`
  entries. At this HEAD the first two are untouched.
- **Why nothing was scheduled.** `_bmad-output/planning-artifacts/` has no `access-control`
  domain, so the "Access Control context" the follow-up addresses has no backlog and nothing
  could be assigned against it.
- **An owner appeared while this step was being written.** A concurrent, **uncommitted** change
  amends CAP-6 and adds story **`ACM-8R-scenarios`** to `spec-access-control-kernel-mvp` —
  "realign the CAP-6 Stage-1 artifacts to the superseded port binding" — covering the five
  `ACM8-KC` scenario docs and the `access-control.module.ts` header comment. Open item 12 records
  it as in-flight and names it the owner if it lands, superseding this step's earlier DEPT-4
  suggestion; the SPEC that owns CAP-6 is the more natural home than a test-fallout backlog. Not
  treated as done — it is another session's uncommitted work.
- **Re-approval constraint recorded.** The cards are approved Stage-1 artifacts (`approvals.yaml`,
  `story_id: ACM-8-scenarios`, approved 2026-08-31), so rewriting them needs new approval entries.

**Approval unaffected, and why.** The plan's Approval section enumerates its subject: risk
register, NFR planning, coverage obligations, acceptance-criterion traceability, priority model
and estimates. Open item 12 is a recorded external dependency and none of those. This change adds
verified facts to it and alters no obligation, risk, priority, threshold or estimate, so
`approvalStatus: granted` stands unchanged. Had an obligation moved, the approval would have
needed re-granting under contract §5.

**§4.3 disposition:** unchanged from Step 7 — the plan and its checkpoint were edited as one
logical change, for the reasons stated there. The index was not written: no indexed fact changed.

**Result:** record-only. C-2 remains **not resolved** — its fix lives in `SPEC.md`,
`docs/test-cases/**` and `src/**`, all outside this plan's file set. The CONCERNS verdict stands.
