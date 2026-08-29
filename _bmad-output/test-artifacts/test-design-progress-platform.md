---
runScope: 'platform-level'
runKey: 'platform'
workflowStatus: 'completed'
totalSteps: 5
stepsCompleted:
  - 'step-01-detect-mode'
  - 'step-02-load-context'
  - 'step-03-risk-and-testability'
  - 'step-04-coverage-plan'
  - 'step-05-generate-output'
lastStep: 'step-05-generate-output'
nextStep: 'human-review-then-validate'
lastSaved: '2026-08-29'
inputDocuments:
  - 'docs/project-requirements.md v1.5'
  - '_bmad-output/planning-artifacts/prds/prd-people-management-2026-08-24/prd.md'
  - '_bmad-output/planning-artifacts/prds/prd-people-management-2026-08-24/addendum.md'
  - '_bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md'
requiredKnowledge:
  - '.agents/skills/bmad-testarch-test-design/resources/knowledge/risk-governance.md'
  - '.agents/skills/bmad-testarch-test-design/resources/knowledge/probability-impact.md'
  - '.agents/skills/bmad-testarch-test-design/resources/knowledge/test-levels-framework.md'
  - '.agents/skills/bmad-testarch-test-design/resources/knowledge/test-priorities-matrix.md'
  - '.agents/skills/bmad-testarch-test-design/resources/knowledge/nfr-criteria.md'
  - '.agents/skills/bmad-testarch-test-design/resources/knowledge/playwright-utils-mandate.md'
requiredChecklist:
  - '.agents/skills/bmad-testarch-test-design/checklist.md'
outputs:
  - '_bmad-output/test-artifacts/test-design-architecture-platform.md'
  - '_bmad-output/test-artifacts/test-design-qa-platform.md'
  - '_bmad-output/test-artifacts/test-design/people-management-platform-handoff.md'
testsGenerated: false
---

# Test Design Progress — Platform Level

## Checkpoint

The 2026-08-29 `bmad-testarch-test-design` **Create** run is complete. It refreshed the platform architecture test design, QA test design, and BMAD handoff against requirements v1.5. This checkpoint records planning completion only: it grants no scenario approval, executable coverage, implementation approval, validation verdict, NFR verdict, or release approval.

**Naming exception:** repository convention intentionally uses `runScope: platform-level` with `runKey: platform`, rather than a feature/child key. This isolates the platform checkpoint and prevents the Create run from clobbering the approved User Management child checkpoint.

## Authoritative Inputs and Outputs

Authoritative inputs were:

1. `docs/project-requirements.md` **v1.5** as the normative product authority.
2. The current People Management PRD and its addendum.
3. The Architecture Spine updated 2026-08-29, including AD-1–AD-21.
4. The required BMAD knowledge fragments and validation checklist listed in frontmatter.

Generated outputs were:

- `_bmad-output/test-artifacts/test-design-architecture-platform.md`
- `_bmad-output/test-artifacts/test-design-qa-platform.md`
- `_bmad-output/test-artifacts/test-design/people-management-platform-handoff.md`

No scenarios, test cases, automated tests, production code, or validation report were generated.

## Child Status and Ownership

- **User Management:** the approved architecture design, QA design, and handoff child remain unchanged and authoritative within their child scope. A targeted follow-up is required for v1.5 seed-import drift, including replacement of legacy registration/deactivation assumptions and departure cutover under AD-16/AD-20/AD-21. Scheduled-departure Stage-1 design/review may proceed under PR-S-02 / CC-06; E2E/implementation waits for formal Product Owner/Architect sign-off and normal AD-1 approvals. This is not a redo of the approved child.
- **Access Control:** exactly **171 v1.5 Phase-1 Stage-1 draft files** exist. Every file is pending independent human approval under AD-1 and none counts as approved coverage. Direct-PP audience review may proceed under PR-S-01 / CC-04, but Access Control does not own PP mutation; that Stage-1 design belongs to User Management. E2E/implementation waits for formal Product Owner/Architect sign-off, normal AD-1 approvals, and PR-B-07 / CC-07 where journal details apply. Deferred slices remain shared links, list/filter/export/search projection surfaces, runtime role catalog, full-profile overlay, positive Project-line cells, Department positives, and PP HR-line propagation.

## Testability and Platform Risks

The architecture provides useful seams—real HTTP and PostgreSQL E2E, outbound ports, a single AccessControl facade, live bulk audience resolution, and specified PP/departure solutions—but current evidence is absent. Requirements plus AD-19 define PR-S-01 / CC-04, and requirements plus AD-20 define PR-S-02 / CC-06; both packages are **READY FOR FORMAL PO/ARCHITECT SIGN-OFF**, not unresolved design discovery. Their Stage-1 design/review may proceed now, while E2E/implementation waits for sign-off and normal AD-1 approvals. Projection ownership, dynamic query design, the timetracker contract, CC-07 journal details, operational topology, and machine-visible approval state still limit reliable feedback.

All 10 platform risks are high and remain open until their listed evidence is reviewed:

- **PR-001 (SEC, 9):** audience, field, flag, export, and filter paths can leak restricted employee data.
- **PR-002 (SEC, 9):** stale graph, sync, outage, or departure state can retain access.
- **PR-003 (DATA, 9):** implementing the specified PP contract before formal sign-off, or without CC-07 journal detail, can create governance or audit inconsistency.
- **PR-004 (SEC, 9):** unresolved full-profile precedence can expose Self-denied sections or create inconsistent grants.
- **PR-005 (TECH, 9):** the unknown timetracker contract can create stale or mixed project policies.
- **PR-006 (PERF, 6):** arbitrary visible fields plus live bulk resolution can breach the ≤2-second target at 500+ rows.
- **PR-007 (DATA, 6):** dashboard, resourcing, and campaign aggregates can drift from projection and lifecycle facts.
- **PR-008 (OPS, 6):** implementing the specified departure contract before formal sign-off, or operating it without AD-20 deployment controls, can cause governance drift or delayed cutoff.
- **PR-009 (OPS, 6):** treating the 171 drafts as coverage can bypass human gates and create false confidence.
- **PR-010 (DATA, 6):** seed/platform/timetracker/candidate identity mismatch or real PII use can misattach access or expose data.

The nine open product/architecture blockers are:

- **PR-B-01 / OQ-114:** EAV versus JSONB custom-field storage and indexed visibility-safe filter/sort design.
- **PR-B-02 / OQ-115:** dashboard engine widget authorization, aggregation, and counter projection contract.
- **PR-B-03 / OQ-116:** non-manager project-assignment semantics and resulting policy target roles.
- **PR-B-04 / OQ-117:** profile bounded-context boundary and S1–S16 projection ownership.
- **PR-B-05 / OQ-105:** HR Admin grant/revoke authority and remaining default role-permission assignments.
- **PR-B-06 / CC-05:** Self versus full-profile overlay precedence and effective section mapping.
- **PR-B-07 / CC-07:** immutable relationship/access journal schema, snapshots, reader authorization, and transaction enrollment for journal-backed PP, full-access, and organisational mutations.
- **PR-B-08:** timetracker API, authentication, identity, error, state/event, and partial-success contract.
- **PR-B-09:** hosting, environment topology, secrets, backup/restore, monitoring, alert ownership, and rollback envelope.

### Ready for Formal Sign-off

- **PR-S-01 / CC-04:** requirements plus AD-19 specify one PP per employee, atomic optimistic create/replace/delete, next-request revocation, concurrency handling, and journal direction. Status: **READY FOR FORMAL PO/ARCHITECT SIGN-OFF**. Direct-PP audience and PP-mutation Stage-1 design/review may proceed now; E2E/implementation waits for explicit sign-off, normal AD-1 approvals, and PR-B-07 / CC-07 where journal details apply.
- **PR-S-02 / CC-06:** requirements plus AD-20 specify effective date/reason, relationship blockers and outcomes, and a durable retrying fail-closed executor. Status: **READY FOR FORMAL PO/ARCHITECT SIGN-OFF**. Scheduled-departure Stage-1 design/review may proceed now; E2E/implementation waits for explicit sign-off and normal AD-1 approvals, while PR-B-09 separately gates operational/release evidence.

The sign-off packages are specified solutions, not PR-B discovery blockers. Open blockers apply only to their named slices and do not reopen or overwrite the approved User Management child. Eligible Access Control draft review can proceed within the Phase-1 boundary, but no draft advances to Stage 2 without per-file AD-1 approval.

## Coverage Status

The refreshed QA map uses these readiness categories:

- **READY NOW:** intent is defined enough for feature-owned Stage-1 design; this is not approved or executable coverage.
- **READY FOR FORMAL SIGN-OFF:** requirements plus binding architecture direction specify the solution sufficiently for Stage-1 design/review now; E2E/implementation still requires explicit Product Owner/Architect sign-off and normal AD-1 approvals.
- **PRODUCT/ARCH BLOCKED:** safe design waits for the exact listed PR-B decision.
- **AC STAGE-1 DRAFT:** one or more of the 171 files apply, with per-file AD-1 approval pending; this is inventory, not coverage.
- **E2E DEPENDENCY:** the requirement is defined, but evidence waits for approval, a consumer, an integration contract, tooling, or an environment.
- **OUT OF SCOPE:** only v1.5 GOOD TO HAVE items or §10 exclusions.

Current coverage is a plan, not tests: approximately **79–124 planning rows** across P0–P3, estimated at **12–20 QA weeks** for one engineer with feature-owner parallelism. READY NOW examples include action-item core, risk workflow/dashboard, platform-owned resourcing core, CDS core, mentorship core, campaign activation/status, feedback core, privacy/process audits, and per-file AC review. Direct assigned-PP audience derivation remains an **AC STAGE-1 DRAFT**; PP-mutation Stage-1 and scheduled-departure Stage-1 are **READY FOR FORMAL SIGN-OFF**. Design/review may proceed for both PR-S packages, but E2E/implementation waits for formal sign-off and AD-1; PP journal execution also waits for PR-B-07 / CC-07, and departure operational/release evidence separately waits for PR-B-09. Major profile/query, dashboard, overlay, journal, integration, deployment, and consumer-projection evidence remains blocked or dependent. Notifications, analytics, and PeopleForce API prefill remain out of scope unless explicitly promoted; PeopleForce candidate ID/link storage remains required, and PeopleForce is not a vacancy source.

Manual validation remains necessary for human AD-1 approvals, architecture/product decisions, accessibility/responsive behavior, the live timetracker drill, deployment rehearsal, and residual-risk acceptance. Automation candidates are stable approved authorization regression, feature state machines, projection negatives, contract-failure paths, XLSX entitlement checks, the performance threshold, privacy scans, and trace-state validation.

## NFR Status

Sourced thresholds and rules:

- restricted facts must not escape through any surface;
- platform-owned relationship changes apply on the next request;
- project changes apply within **15 minutes**, with project-derived access withdrawn after **4 hours** of failed sync;
- due departure denies the actor on every request under the PR-S-02 / CC-06 specified solution; Stage-1 design/review may proceed, while E2E/implementation waits for formal sign-off and AD-1;
- All Employees responds within **2 seconds** at **500+ records**, including permission resolution;
- integration failure does not take down the core application and stale timetracker data is visibly identified;
- only the delivered seeded population may be used, with no real PII in agent contexts, logs, screenshots, or the repository;
- list, profile, and dashboards must be accessible and responsive;
- AD-1 requires approved scenario → approved red E2E → production code;
- the product must be deployed and demonstrable; this operational evidence is separately blocked by PR-B-09.

Unknown and deliberately not guessed: WCAG conformance level, viewport set, concurrent-user/load model, percentile definition for the 2-second result, timeout/retry/backoff counts, uptime SLO, RTO/RPO, backup frequency, retention period, and non-departure observability thresholds. NFR planning identifies future evidence only; no final PASS/CONCERNS/FAIL exists.

## Completion and Next Step

All five Create steps are complete, and the three platform outputs are ready for human review. PR-S-01 / CC-04 and PR-S-02 / CC-06 are ready for formal Product Owner/Architect sign-off; their Stage-1 design/review may proceed now, while E2E/implementation waits for sign-off and normal AD-1 approvals. PR-B-07 / CC-07 remains open for journal-backed execution, and PR-B-09 separately remains open for departure operational/release evidence. `_bmad-output/test-artifacts/test-design-validation-report-platform.md` evaluates the superseded 2026-08-25 v1.2 artifact set and is stale historical evidence; it is superseded for this refresh and provides **no current validation verdict**.

After human review, run `bmad-testarch-test-design` in **Validate** mode as a separate workflow. Validation has not been run automatically.
