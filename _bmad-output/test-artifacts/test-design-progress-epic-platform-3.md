---
runScope: 'epic'
runKey: 'epic-platform-3'
workflowStatus: 'generated'
totalSteps: 6
stepsCompleted: ['step-01-detect-mode', 'step-02-load-context', 'step-03-risk-and-testability', 'step-04-coverage-plan', 'step-05-generate-output', 'step-06-post-validation-correction']
lastStep: 'step-06-post-validation-correction'
nextStep: 'plan corrected against the CONCERNS validation report; proceed with human review, then re-validate for a byte-exact attestation'
validationStatus: 'CONCERNS (2026-09-12) — plan and checkpoint corrected 2026-09-12'
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
| PLAT-E3-R07 | A resolution cached in the facade or a consumer outlives a `Relationship` change, so a revoked audience survives into the next request (requirements §2.1 *Timing of revocation* [NORMATIVE]). | SEC | 2 | 3 | 6 | Platform backend: same-process re-resolution evidence across a mutation on every audience- and section-returning call. This epic's slice of `PR-002`. |
| PLAT-E3-R08 | A consumer reads base `write` on `profile:identity` as a mandate over the S1 relationship fields, bypassing `org:relationships:write`, the self-assignment bar and the §3.4 journal. | SEC / BUS | 2 | 3 | 6 | Platform backend: negative obligation on E3-C06 — the decision is section-scoped, not field-scoped. Enforcement owner is `UM-E0-S0.1`. |
| PLAT-E3-R06 | A 500-target resolver regression is hidden by incomplete/non-comparable measurement or is misreported as list-route evidence. | PERF / OPS | 2 | 3 | 6 | Platform backend: `ACM9-MVP-v1` baseline/final artifact protocol; report only Contract B, not `PG-04` / DIR-A1. |

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
| E3-C06 Base section decision | ACM-5 S1/S10/S11, empty/missing target, write-over-read merge, all unsupported sections deny, re-evaluation on each call across a `Relationship` mutation | headless facade + migrated PostgreSQL | P0 | Assert base decision only. Negative obligation: base `write` on `profile:identity` is never a mandate over the S1 *manager* / *people partner* / *department* fields (requirements §3.2 note ¹, §2.1 [NORMATIVE]). Consumer field/command projection excluded; S10/S11 Colleague narrowing has no named owner. |
| E3-C07 Composition boundary | ACM-8 real `AppModule` import/facade resolution; no UM file changes; no AC HTTP/test-only/debug endpoint. The canonical "`ACCESS_CONTROL_PORT` remains bound to `InterimAccessControlAdapter`" criterion is **superseded** by PLAT-E4-S4.1/S4.2 and carries no obligation | module E2E + repository audit | P0 | Real module boot plus scoped audit; does not test `/users` authorization. Port binds `AccessControlFacadeAdapter` (`user-management.module.ts:215`); the interim adapter was deleted in backend `37a339a` and `ACM8-KC-02` already asserts the facade-backed adapter. |
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
- **Design quality targets:** P0 functional scenarios must pass; P1 target ≥95%; every score-6+ risk has named evidence; full NFR assessment remains for `nfr-assess` after evidence exists. Coverage percentage is intentionally not asserted.

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
catalog drift; unnamed owners recorded for S10/S11 Colleague narrowing and S1 photo mutation;
residual-risk table, `PG-03` defect exit gate, risk legend and knowledge-base appendix; ACM-9
baseline pinned with discovery framing; PM/AD-20 and `CC-07` named as deferrals.

**Result:** correction only. No suite was executed, no approval is granted, and the CONCERNS
verdict stands until a fresh Epic Validate runs against the corrected text. That run is the next
action, not an optional follow-up: leaving a stale verdict against a changed document is the same
class of defect this correction records against the canonical `epics.md` caveat.
