---
runScope: 'epic-level'
runKey: 'epic-platform-4'
epicId: 'PLAT-E4'
epicDomain: 'platform'
epicSourcePath: '_bmad-output/planning-artifacts/platform/epics.md'
epicNumber: 4
workflowStatus: 'generated'
approvalStatus: 'granted'
approvalGrantedBy: 'Anna Pikula'
approvalGrantedDate: '2026-09-12'
validationStatus: 'PASS'
validationDate: '2026-09-12'
validationReport: '_bmad-output/test-artifacts/test-design-validation-report-epic-platform-4.md'
totalSteps: 5
stepsCompleted: ['step-01-detect-mode', 'step-02-load-context', 'step-03-risk-and-testability', 'step-04-coverage-plan', 'step-05-generate-output']
lastStep: 'step-05-generate-output'
nextStep: 'document generation is complete; no Create step remains; proceed with human review, then choose Validate, Edit, or a fresh Create'
lastSaved: '2026-09-12'
inputDocuments:
  - '_bmad/tea/config.yaml'
  - '_bmad-output/test-artifacts/test-design/README.md'
  - 'docs/test-design-workflow-contract.md'
  - '_bmad-output/planning-artifacts/platform/epics.md'
  - '_bmad-output/implementation-artifacts/platform/story-4-1-generalise-section-access-authorisation.md'
  - '_bmad-output/implementation-artifacts/platform/story-4-2-default-org-relationship-seed.md'
  - '_bmad-output/implementation-artifacts/platform/sprint-status.yaml'
  - 'docs/project-requirements.md'
  - 'docs/architecture/README.md'
  - 'docs/architecture/access-control.md'
  - 'docs/architecture/testing-strategy.md'
  - '_bmad-output/test-artifacts/test-design-architecture.md'
  - '_bmad-output/test-artifacts/test-design-qa.md'
  - '.agents/skills/bmad-testarch-test-design/resources/knowledge/risk-governance.md'
  - '.agents/skills/bmad-testarch-test-design/resources/knowledge/probability-impact.md'
  - '.agents/skills/bmad-testarch-test-design/resources/knowledge/test-levels-framework.md'
  - '.agents/skills/bmad-testarch-test-design/resources/knowledge/test-priorities-matrix.md'
  - '.agents/skills/bmad-testarch-test-design/resources/knowledge/nfr-criteria.md'
  - '.agents/skills/bmad-testarch-test-design/resources/knowledge/library-integration-mandate.md'
  - '.agents/skills/bmad-testarch-test-design/resources/knowledge/playwright-utils-mandate.md'
  - '.agents/skills/bmad-testarch-test-design/resources/knowledge/pactjs-utils-mandate.md'
  - '.agents/skills/bmad-testarch-test-design/resources/knowledge/pact-mcp.md'
  - '_bmad-output/test-artifacts/test-design-validation-report-epic-platform-4.md'
  - '_bmad-output/planning-artifacts/platform/dept-epic.md'
  - '_bmad-output/implementation-artifacts/platform/spec-4-2a-root-operator-permission-set.md'
  - '_bmad-output/implementation-artifacts/platform/spec-4-2d-dev-seed-spine.md'
  - '_bmad-output/implementation-artifacts/access-control/deferred-work.md'
  - '_bmad-output/planning-artifacts/architecture/architecture-people-management-ratification-2026-09-02/blockers.yaml'
  - '_bmad-output/test-artifacts/test-design-epic-user-management-0.md'
---

# PLAT-E4 test-design progress

**Validation projection:** **PASS (2026-09-12)** —
`test-design-validation-report-epic-platform-4.md`, synchronized with `test-design/README.md`.

## Resolved run

- Operation: Create
- Scope: Epic-Level
- Identity: `PLAT-E4` — Access Control Authorization Consolidation
- Domain: `platform`
- Canonical source: `_bmad-output/planning-artifacts/platform/epics.md`, `## Epic 4: Access Control Authorization Consolidation`
- Canonical plan: `_bmad-output/test-artifacts/test-design-epic-platform-4.md`
- Canonical checkpoint: `_bmad-output/test-artifacts/test-design-progress-epic-platform-4.md`

## Step 1 outcome

The user's explicit request selects Create and Epic-Level mode. The canonical epic source has one matching Epic 4 body, and neither the selected plan nor checkpoint existed before this run. The run may change only the selected plan, this checkpoint, and the current-artifact index entry needed to register the new canonical scope. Approval, validation, execution evidence, coverage, release-readiness, shared system plans, and all other epic artifacts remain unchanged.

## Step 2 outcome — context and testability inputs

- Detected stack: fullstack — NestJS/Prisma backend plus React/Vite frontend. PLAT-E4's delivery surface is backend access-control and User Management; no distinct frontend acceptance criterion was found.
- Canonical scope and both full story tickets were loaded. The tracker marks both story keys `done`, while the plan retains the residual seeded-two-level ACM-9 question and open PO/architect decisions as unclosed evidence/planning items rather than treating the status as an approval or validation verdict.
- Existing evidence includes focused backend unit, real-PostgreSQL facade, and real HTTP E2E suites for default permissions, section gates, bootstrap, tree-root position, and the dev seed spine. The platform pair remains the source for shared authorization policy, cross-epic regression, NFR contracts, test isolation, and evidence levels.
- NFR/security context is relevant: audience-first authorization/fail-closed behaviour and the ACM-9 resolver measurement. Contract A (directory HTTP), Contract B (ACM-9 facade), and Contract C (P6 resolver) remain separate; only Contract B is relevant to the residual PLAT-E4 measurement question.
- Browser exploration was not run: no runnable application URL or deployed environment was supplied, and the epic's acceptance criteria are server-side authorization/provisioning behaviours. Repository and test evidence were used instead.
- `tea_use_playwright_utils` and `tea_use_pactjs_utils` are enabled in configuration, but neither corresponding utility package is declared in the service manifests, so their implementation mandates do not bind this Jest/Playwright/Pact inventory. Pact is relevant as an existing repository capability, but no new consumer/provider boundary is specified by PLAT-E4. Pact broker: unreachable (SmartBear MCP tools not available). Provider states derived from provider source.

## Step 3 outcome — risk and NFR assessment

| ID | Category | Risk | P | I | Score | Priority / mitigation owner |
| --- | --- | --- | ---: | ---: | ---: | --- |
| PLAT-E4-R01 | SEC | A route guard or `canEdit` hint bypasses the audience-first dual gate, allowing an FR grant to widen a user's data audience. | 3 | 3 | 9 | P0 — Access Control + User Management; real HTTP deny/allow pairs must prove the same decision path. |
| PLAT-E4-R02 | SEC | A legacy `S<n>` key, duplicated predicate, or route-map drift gives a section a different decision than the matrix. | 2 | 3 | 6 | P0 — Access Control + User Management; exhaustive source/test migration oracle plus facade and route cases. |
| PLAT-E4-R03 | SEC | Root or a delegated HR Admin gains profile write through functional role alone, contradicting the data-audience boundary; the AF-2 `profile:timeline:write` deviation is the sanctioned, pinned exception (DEPT-2 closure). | 2 | 3 | 6 | P0 — Access Control + User Management; clean-bootstrap and unrelated-target `403`/`canEdit:false` proofs plus the `s42a-op-06` pin. |
| PLAT-E4-R04 | OPS | `db:dev:seed-org` can alter production data, generate an invalid/non-idempotent reporting graph, or leave shared test data polluted. | 2 | 3 | 6 | P1 — Access Control + QA; production refusal, script ordering, graph shape and cleanup/isolation evidence. |
| PLAT-E4-R05 | SEC | The new full-profile grant is treated as write authority or as an observable live-section grant before its precedence contract has evidence. | 2 | 3 | 6 | P1 — Access Control; keep the read-only/Self-exclusive boundary and distinguish bootstrap/resolution proof from live projection coverage. |
| PLAT-E4-R06 | PERF | The upward-walk resolver is credited without comparable `seeded-two-level` ACM-9 evidence, GAP-2's added per-request queries go unexamined, or the evidence is conflated with DIRA1/P6. | 2 | 2 | 4 | P2 — Access Control + Architect; explicit decision including baseline comparability; GAP-2 by rerun or inspection proof. |
| PLAT-E4-R07 | SEC | A change to `db:dev:seed-org` drops or unpairs a seeded edge's `AccessJournal` row. The AF-3 exception was declined 2026-09-12 (Anna Pikula, PO + Architect), and the seed now journals. | 1 | 2 | 2 | Low — Access Control; `s42d-ds-07` inside P1 E4-C06. |
| PLAT-E4-R08 | SEC | The section gate answers `403` for missing/inactive targets where PM/AD-24 requires `404` before mutation checks; existing suites pin the superseded `403`. | 3 | 2 | 6 | P0 — User Management + Access Control, oracle owner `UM-E0`; regenerate three-code cases under `CONFLICT-UM-01`. |

### NFR planning boundary

- **Security:** in scope. The measurable API outcome is the architecture denial oracle (`401` invalid/inactive session, `404` hidden/missing target, `403` visible-but-forbidden); PLAT-E4 specifically needs audience-first `403` and `canEdit:false` evidence. Source scans are supplementary and cannot replace real router/facade evidence.
- **Performance:** the only potentially relevant contract is **B, ACM9-MVP-v1**, over the public facade with 500 requested active targets, five warm-ups and twenty samples; warm p95 and worst case must each be at most two seconds per required shape. The residual `seeded-two-level` measurement is not yet a settled deliverable. Contract A (directory HTTP) and Contract C (P6, no gate) are explicitly excluded.
- **Reliability / operability:** script refusal under production `NODE_ENV`, idempotence, a real deployment-order harness, and run-namespaced cleanup are required evidence mechanisms. No retry/availability threshold is stated for this epic; it remains UNKNOWN rather than invented.
- **Maintainability:** one parameterised decorator/guard and human keys reduce drift; static removal checks must be paired with runnable behaviour. No numerical maintainability threshold is specified.

The highest release-impacting risks are R01 through R03 and R08. After the 2026-09-12 Edit the register holds six high risks (R01–R05, R08) one medium risk (R06, P2), and, after the AF-3 decision, one low risk (R07). These are planning risks only: no approval, validation, execution result, release verdict, or coverage percentage is asserted.

## Step 4 outcome — coverage and execution plan

| Coverage ID | Requirement / risk scenario | Level | Priority | Existing or planned evidence |
| --- | --- | --- | --- | --- |
| E4-C01 | An active user has the `DEFAULT_PERMISSIONS` section-write key without a policy row; inactive users deny; an explicit FR grant still works; no `employee` policy shape is introduced. | facade E2E + unit boundary | P0 | `test/access-control/s41a-default-permissions-baseline.e2e-spec.ts`; functional-role evaluator unit test. |
| E4-C02 | Human section keys preserve the access matrix, unknown keys fail closed, and the strongest resolved audience wins; legacy `S<n>` values are not executable identifiers. | facade E2E + repository audit | P0 | `test/access-control/acm5-section-access.e2e-spec.ts`; scoped `git grep` oracle that distinguishes sanctioned historical prose/comments from executable use. |
| E4-C03 | `GET /users/:id` data and `PATCH /users/:id` route gates share `@RequireSectionAccess`; `canEdit` equals the write-gate decision for colleague/self, reporting, and People Partner personas. | real HTTP / PostgreSQL E2E | P0 | `test/user-management/access-control-adoption/s41c-section-access-gate.e2e-spec.ts`, `read-adoption.e2e-spec.ts`, `read-denial.e2e-spec.ts`, `write-adoption.e2e-spec.ts`. |
| E4-C04 | A functional role never widens target data access: root on a production-shaped seed and a delegated HR Admin without a relationship receive the correct feature-route allows but `403` / `canEdit:false` on unrelated profile writes. | real bootstrap + HTTP E2E | P0 | `s42a-op-bootstrap-canonical-set.e2e-spec.ts`, `s42a-op-root-operator-set.e2e-spec.ts`, and access-control-adoption denial suites. |
| E4-C05 | Root is structurally at the top of the reporting tree without a seeded root relationship row; the relevant bootstrap grants are canonical and the full-profile grant is read-only/Self-exclusive rather than a write bypass. | real bootstrap + facade/HTTP E2E | P1 | `s42b-tr-bootstrap-no-relationship-row.e2e-spec.ts`, `s42b-tr-root-tree-position.e2e-spec.ts`, and `acm11-full-profile-overlay-*.e2e-spec.ts`. |
| E4-C06 | `db:dev:seed-org` refuses production, creates only the specified two-level fake spine after import, preserves prior direct edges, handles inactive and multi-department users deterministically, and is safe to rerun. | script/integration E2E | P1 | `s42d-ds-dev-seed-spine.e2e-spec.ts` and `s42d-ds-root-resolves-over-seeded-population.e2e-spec.ts`, including scoped teardown. |
| E4-C07 | The delivered authorization suite does not regress consumers: an AccessControl facade change re-runs all access-control E2E and affected User Management adoption suites. | PR regression E2E | P1 | Platform pair cross-epic regression map; no duplicate policy narrative in this epic plan. |
| E4-C08 | The residual `seeded-two-level` performance question has a decision and, if accepted, an append-only ACM9-MVP-v1 artifact with the protocol's fixed sample/warm-up/threshold contract. | measurement | P2 | No current acceptance claim; owner must settle fixture role, scheduling and baseline comparability before evidence is planned. |

**Superseded by the 2026-09-12 Edit:** the table above is the Create-time record. The canonical plan now splits E4-C03 into C03a/C03b (denial oracle), E4-C04 into C04a–C04d (root, delegated HR Admin, oracle precedence, AF-2 timeline pin), extends E4-C06 with entrypoint absence, the AF-3 journal assertion and the ACM-1 invariant condition, adds E4-C09 (GAP-2) and repository-audit obligations E4-AV01..AV03, and adds an acceptance-criterion traceability table. The plan is authoritative for coverage content.

### NFR evidence plan

- Security: E4-C02 through E4-C05; real facade/router responses plus static oracle, never static scan alone.
- Performance: E4-C08 only; the expected future evidence is an append-only ACM9-MVP-v1 measurement artifact. It must not stand in for DIRA1 or P6.
- Reliability/operability: E4-C06 uses real scripts and a run-namespaced database cleanup path. No unprovided availability/retry threshold is assumed.
- Maintainability: E4-C02 and E4-C03 prove a single declared route mechanism and no executable legacy routing branches.

### Execution and gates

- **PR:** affected P0/P1 PLAT-E4 suites; the full access-control E2E regression set for any AccessControl facade change; affected User Management adoption tests. Backend e2e remains serial with run-namespaced data under the platform isolation policy.
- **Nightly:** an accepted ACM9-MVP-v1 measurement run only; it remains informational and is not promoted to a blocking CI job by this plan.
- **Weekly / release preparation:** repeat the accepted measurement only when its fixture or resolver dependency changes, retaining each immutable artifact; execute the separate NFR assessment once evidence exists.
- **Quality gates:** every P0 scenario is executable and green in its required environment; high-risk mitigations have an owner and evidence path; each acceptance criterion is mapped to an executable scenario or an explicit, owned evidence gap; NFR evidence is identified without issuing an NFR verdict. The repository has no approved per-epic percentage target, so none is invented here.

### Planning estimate

This is an evidence-maintenance plan, not a claim that completed tracker stories need a full reimplementation. Estimated net test/evidence work: P0 **~6–12 hours**, P1 **~8–16 hours**, P2 **~2–6 hours**, total **~16–34 hours** after the `seeded-two-level` decision. The P2 range is contingent and excluded until its owner accepts the measurement scope.

## Step 5 outcome — generated artifact and validation

- Generated canonical epic plan: `_bmad-output/test-artifacts/test-design-epic-platform-4.md`.
- Updated current-artifact index: `_bmad-output/test-artifacts/test-design/README.md` registers `PLAT-E4` and removes it from the unplanned range.
- Checklist review: Epic/story, PRD/architecture, system-pair, test inventory, risk matrix, NFR planning, atomic coverage, priority, PR/nightly/weekly strategy, estimates, entry/exit, out-of-scope, and interworking sections are present. The plan uses the canonical identity tuple and output paths.
- Checklist exceptions resolved through repository policy: no new release claim or execution result; NFR verdict remains deferred; the `seeded-two-level` scope remains explicitly open. The plan's P1/P2 thresholds are planning criteria, not a product gate.
- Verification: `git diff --check` passed. No browser session or temporary exploration artifact was created.
- Generation state only at Create time: approval was ungranted then; it was **granted 2026-09-12 by the requester, Anna Pikula**, after the final PASS (see the approval record below). The first Epic Validate returned CONCERNS; after the 2026-09-12 Edit, the current validation is **PASS (2026-09-12)** (see the projection above).

## Edit record — 2026-09-12 (Epic-Level Edit, contract §4.3)

- Operation: Edit · scope `epic` · `PLAT-E4` · domain `platform` · number `4` · `runKey` `epic-platform-4`.
- Inputs: the CONCERNS validation report (F-1..F-9) and the same-day epic requirements review (ERR-PLAT-E4-01..03).
- Plan changes: named the AF-2 timeline deviation (R03, E4-C04d, Not-in-Scope DEPT-2); added AV obligations for `dev-grant-root.ts` retirement and deferred-work closure; completed E4-C06 (entrypoint absence, ACM-1 invariants, AF-3 journal assertion); added the AC traceability table; received and declined the three-versus-six reconciliation (DEPT-2/DEPT-4); reconciled R06 to medium/P2 everywhere; recorded ACM-9 baseline comparability and GAP-2 (E4-C09); normalized evidence paths; added a week-range estimate and priority Criteria/Purpose; confirmed the unit-level surface; added R07 (dev-seed journal exception) and R08 (denial-oracle divergence, `CONFLICT-UM-01`).
- Epic source changes (ERR-PLAT-E4-01/02/03): Epic 4 summary acceptance criteria aligned to the Story 4.1/4.2 tickets; retired `dev-grant-root.ts` wording and "root edits the organisation" replaced; AF-2 deviation, denial-oracle boundary and the bounded AF-3 development-fixture exception recorded.
- Lifecycle: `workflowStatus` stays `generated`; approval was ungranted during the Edit and re-validations. The fresh Epic Validate run after this Edit replaced the CONCERNS report with **PASS (2026-09-12)**; a second same-day re-validation, after `deferred-work.md` and `access-control.md` were updated to record the E4-AV01/AV02/AV03 closures, independently re-confirmed **PASS (2026-09-12)**; a third, after the E4-AV03 grep-pattern correction, confirmed **PASS (2026-09-12)** with no open finding remaining; a fourth, after the AF-3 decision below, independently re-verified the backend journaling change and confirmed **PASS (2026-09-12)** again, with one new non-blocking finding (G-1: this checkpoint's "23/24" Stage-3 figure below did not reproduce in that run — 24/24 passed twice instead).

## Approval record — 2026-09-12

- **Approval granted 2026-09-12** by the requester, Anna Pikula, for the PLAT-E4 test design only, after the final same-day Epic Validate returned PASS. Recorded in the plan and checkpoint frontmatter as granted.
- A human act, separate from validation (contract §5). It confers no coverage, execution evidence, gate result, or release readiness.
- It does not close `CONFLICT-UM-01` (PO, Architect, QE; runtime `UM-E0-S0.1`). Both remain owned open items.

## AF-3 decision record — 2026-09-12 (after approval)

- **Decision:** Anna Pikula, acting as PO + Architect, **declined** the `spec-4-2d` AF-3 development-fixture journal exception. Seeded dev-spine edges are manager changes under §2.1/§3.4 and PM/AD-29, and are journaled in the same transaction.
- **Implementation (AD-1):**
  1. Stage 1: scenario `docs/test-cases/access-control-kernel/dev-seed-spine/s42d-ds-07-seeded-edges-are-journaled.md`.
  2. Stage 2: `s42d-ds-07` Tests 1–3 in `services/backend/test/access-control/s42d-ds-dev-seed-spine.e2e-spec.ts`. They were red against `de508c9` (no journal rows).
  3. Stage 3: `services/backend/scripts/dev-seed-org.ts` writes edge and journal rows in one transaction. On branch `feat/plat-e4-dev-seed-journal`, uncommitted, the suite passed 23/24 in the implementing session. The one failure, `s42d-ds-05` Test 2 (npm's `Missing script` text not captured from the subprocess), also failed on the unmodified suite in that session, which makes it environment-dependent. The change does not touch that test. The independent validator's two runs passed 24/24. Related suites (`s42d-ds-root-resolves-over-seeded-population`, `epic-4/access-journal`, `acm1r-fr-foundation`) pass 53/53.
- **Plan and epic updates:**
  - R07 was re-scored from 4 to 2 (low).
  - E4-C06 (7) now asserts one journal row per seeded edge.
  - The Not-in-Scope ratification row was removed.
  - The Epic 4 source and the `spec-4-2d` AF-3 row record the supersession.
- **Approval and validation:** approval stays granted; this decision was the requester's own and narrows no approved obligation. Epic Validate must run again for the edited content.
