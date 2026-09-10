# Test Design Validation Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> ### Citation anchor (added 2026-09-10; this plan's own text is unchanged)
>
> **Nothing in this plan was rewritten.** Every statement, line number, `rg` command and expected
> content below is the 2026-08-25 record, preserved exactly as it was evaluated then.
>
> What changed is outside this document. The 2026-09-10 test-design consolidation
> (`docs/superpowers/plans/2026-09-10-test-design-consolidation.md`) **reuses five of the filenames
> this plan cites** for new, platform-scoped, **approval-ungranted** documents:
> `_bmad-output/test-artifacts/test-design-architecture.md`, `test-design-qa.md`,
> `test-design-progress-system.md`, `test-design-validation-report.md`, and
> `test-design/people-management-handoff.md`. Read by filename alone at `HEAD`, this plan's content
> claims would silently start describing those new documents instead of the User Management
> artifacts it actually evaluated.
>
> **Therefore: every artifact path this plan names resolves at commit
> `76a7220701ac6f16843dad8b303934f9a958b54c`, not at `HEAD`.** Link form:
> `https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/<path>`
> — for example
> [`test-design-qa.md` @ `76a7220`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/_bmad-output/test-artifacts/test-design-qa.md).
>
> The 2026-08-25 human approval and the "PASS — Approved for ATDD" verdict this plan worked toward
> belong to those pinned files **only**; they do **not** transfer to the current documents at the
> same paths, which are ungranted with validation NOT RUN. The disposition of every obligation is
> recorded in `_bmad-output/test-artifacts/test-design/migration-map.md`; the current-artifact index
> is `_bmad-output/test-artifacts/test-design/README.md`.

**Goal:** Bring the derived user-management test-design artifacts from `WARN — Conditionally Complete` to checklist-ready review without changing normative requirements, frozen stories, scenario documents, automated tests, or production code.

**Architecture:** Treat the validation report as a gap inventory, not as a new source of product behavior. Fix mechanical checklist gaps in the architecture, QA, handoff, and progress artifacts; preserve the user-approved B-01..B-05 and OQ1–OQ5 decision set; then rerun the repository's Test Design Validate workflow to regenerate the report from evidence.

**Tech Stack:** Markdown, BMAD/TEA test-design checklist, `rg`, `awk`, Git read-only verification

**Spec:** `_bmad-output/test-artifacts/test-design-validation-report.md`

## Global Constraints

- Modify only these derived artifacts: `_bmad-output/test-artifacts/test-design-architecture.md`, `_bmad-output/test-artifacts/test-design-qa.md`, `_bmad-output/test-artifacts/test-design/people-management-handoff.md`, `_bmad-output/test-artifacts/test-design-progress-system.md`, and the regenerated `_bmad-output/test-artifacts/test-design-validation-report.md`.
- Do not modify `docs/project-requirements.md`, `docs/requirements-qa-addendum.md`, `docs/architecture/**`, `docs/test-cases/**`, `_bmad-output/planning-artifacts/**`, `_bmad-output/implementation-artifacts/**`, `_bmad-output/specs/**`, backend code, or executable tests.
- Keep the approved decisions unchanged: no global decision blockers; B-03 gates only parallel test workers; B-04 uses durable retryable dispatch intent; OQ1 returns `400`; OQ2 trims/lowercases email; OQ4 reuses the existing User identity; OQ5 uses one worker + UUID-owned data until schema-per-worker exists.
- Do not invent a production magic-link TTL, retry count/backoff, permission identifier, or rehire endpoint shape.
- Preserve the historical findings in `critical-review-existing-artifacts.md`; this plan does not edit that audit snapshot.
- Do not mark full human approval or team review complete on behalf of people.
- Do not start ATDD, generate E2E tests, or modify scenario files as part of this plan.

---

## File Responsibility Map

| File | Responsibility in this change |
| --- | --- |
| `_bmad-output/test-artifacts/test-design-architecture.md` | Risk taxonomy, high-risk mitigation plans, status, residual risk, architecture-owned gates |
| `_bmad-output/test-artifacts/test-design-qa.md` | Complete QA coverage for R-001..R-014, priority distribution, ownership rule, quality exit criteria, KB evidence |
| `_bmad-output/test-artifacts/test-design/people-management-handoff.md` | Complete risk-to-story mapping and priority-consistent epic gates |
| `_bmad-output/test-artifacts/test-design-progress-system.md` | Accurate counts/status after the document corrections |
| `_bmad-output/test-artifacts/test-design-validation-report.md` | Regenerated validation evidence; never hand-edit the verdict before rerunning Validate mode |

---

### Task 1: Make the architecture risk section checklist-complete

**Files:**
- Modify: `_bmad-output/test-artifacts/test-design-architecture.md:7`
- Modify: `_bmad-output/test-artifacts/test-design-architecture.md:37-76`
- Modify: `_bmad-output/test-artifacts/test-design-architecture.md:81-112`
- Modify: `_bmad-output/test-artifacts/test-design-architecture.md:176-203`

**Interfaces:**
- Consumes: approved decision set in `_bmad-output/test-artifacts/critical-review-existing-artifacts.md:41-71`
- Produces: complete R-001..R-005 mitigation evidence and residual-risk statements consumed by QA, handoff, and validation

- [ ] **Step 1: Read the checklist and scoring references completely**

Read:

```text
.claude/skills/bmad-testarch-test-design/checklist.md
.claude/skills/bmad-testarch-test-design/resources/knowledge/risk-governance.md
.claude/skills/bmad-testarch-test-design/resources/knowledge/probability-impact.md
.claude/skills/bmad-testarch-test-design/resources/knowledge/nfr-criteria.md
```

Confirm that risk scores remain P×I, scores 6–8 require mitigation, score 9 remains a blocking risk until mitigated/waived, and priority is not mechanically derived from risk score.

- [ ] **Step 2: Align the document status and Quick Guide tier**

Set the architecture status to:

```markdown
**Status:** Draft — Decision Set Approved; Full Test-Design Review Pending
```

Rename the first Quick Guide tier without reintroducing false global blockers:

```markdown
### 🚨 SCOPED GATES — Team Must Honor (No Global Decision Blockers)
```

Add one sentence explaining that this intentionally preserves the checklist's actionable first tier while distinguishing conditional engineering gates from unresolved product decisions.

- [ ] **Step 3: Add the risk category legend**

Immediately after `**Total risks:** 14 ...`, add:

```markdown
**Risk categories:** `TECH` architecture/integration · `SEC` security/auth/access · `PERF` performance/scalability · `DATA` integrity/consistency · `BUS` business/workflow · `OPS` CI/deployment/operability.
```

- [ ] **Step 4: Complete the existing R-001, R-002, and R-003 plan metadata**

Keep their current numbered strategies and add an explicit `Status` to each metadata line:

```markdown
**Owner:** ... | **Timeline:** ... | **Status:** Planned / decision approved, implementation evidence pending | **Verification:** ...
```

Use these statuses:

- R-001: `Planned — controller and architecture-test evidence pending`
- R-002: `Planned — transaction pattern and failure-path evidence pending`
- R-003: `Decision approved — normative security record and implementation evidence pending`

- [ ] **Step 5: Add the missing R-004 mitigation plan**

Add this dedicated section after R-003:

```markdown
### R-004: Reports-To Reassignment Integrity (Score: 6)

1. Propagate the approved explicit `DELETE` → `POST` workflow and second-`POST` `409` rule into the normative API/decision record.
2. Enforce at most one active `direct` reports-to edge per employee with a database constraint and stable `409` exception mapping.
3. Approve and automate TD-UM-REL-01..03 against the real HTTP + PostgreSQL path.

**Owner:** Architect + Backend | **Timeline:** Pre-Epic 4 implementation approval | **Status:** Decision approved — normative propagation and implementation evidence pending | **Verification:** Decision-log trace + schema review + green TD-UM-REL-01..03
```

- [ ] **Step 6: Add the missing R-005 mitigation plan**

Add:

```markdown
### R-005: Employee-List Performance Evidence (Score: 6)

1. Name the representative test environment and provision a pseudonymised 500+ User dataset with permission-resolution data.
2. Implement TD-UM-NFR-PERF-01 in k6 against `GET /users`, measuring the normative ≤2 s threshold including permission resolution.
3. Store the baseline report and rerun the load check nightly or under an explicitly documented waiver.

**Owner:** Platform + Backend | **Timeline:** Story 1.5 before release evidence | **Status:** Planned — target environment, seed, and baseline pending | **Verification:** Versioned k6 summary showing the 500+ row dataset and ≤2 s result, or an approved release waiver
```

- [ ] **Step 7: Add a consolidated residual-risk table for all high risks**

After the five mitigation plans, add:

```markdown
### Residual Risk After Planned Mitigation

| Risk | Residual risk | Disposition |
| --- | --- | --- |
| R-001 | A newly added controller can omit the facade until review/architecture checks cover it. | Keep controller-level contract checks and release review. |
| R-002 | A new mutation path can omit its paired event or fail across a boundary not covered by the local transaction. | Require the AD-11 pattern and a failure-path integration test for every new mutation. |
| R-003 | Configurable expiry and single-use do not address rate abuse or theft of an unconsumed link. | Track rate limiting and delivery-channel hardening separately; do not weaken enumeration/replay tests. |
| R-004 | Two-call reassignment can temporarily leave an employee without a direct manager if `DELETE` succeeds and the new `POST` fails. | Accept for the approved reject-then-retry workflow; revisit an atomic replace command only if the workflow proves operationally unsafe. |
| R-005 | A non-production 500-row baseline may not reproduce production topology, cache state, or future scale. | Keep the result as baseline evidence and monitor production-like environments before raising the scale claim. |
```

- [ ] **Step 8: Remove the borderline tool-selection detail from Architecture**

Replace the Quick Guide tooling item with a cross-reference to the QA document. Architecture may name required evidence (`load report`, `fake outbound port`) but should not contain a tool-selection recipe.

- [ ] **Step 9: Verify Task 1**

Run:

```bash
rg -n "SCOPED GATES|Risk categories:|### R-00[1-5]:|Status:.*pending|Residual Risk After Planned Mitigation|R-004.*temporarily leave|R-005.*non-production" _bmad-output/test-artifacts/test-design-architecture.md
```

Expected: the scoped-gate heading, one legend, five mitigation headings, status metadata for all five plans, and five residual-risk rows are present.

---

### Task 2: Complete QA risk coverage, ownership, and exit evidence

**Files:**
- Modify: `_bmad-output/test-artifacts/test-design-qa.md:7`
- Modify: `_bmad-output/test-artifacts/test-design-qa.md:114-139`
- Modify: `_bmad-output/test-artifacts/test-design-qa.md:142-161`
- Modify: `_bmad-output/test-artifacts/test-design-qa.md:164-256`
- Modify: `_bmad-output/test-artifacts/test-design-qa.md:335-341`

**Interfaces:**
- Consumes: R-001..R-014 register and mitigation/residual-risk text from Task 1
- Produces: one QA validation mapping for every risk and consistent coverage ownership/exit criteria

- [ ] **Step 1: Align QA status with Architecture**

Set:

```markdown
**Status:** Draft — Decision Set Approved; Full Test-Design Review Pending
```

- [ ] **Step 2: Add the complete medium/low QA risk table**

Keep the high-risk table and add a separate table with every R-006..R-014 row:

| Risk | QA coverage to record |
| --- | --- |
| R-006 | TD-UM-REG-04/08 plus TD-UM-DOM-01 verify Prisma uniqueness maps to `409`, not `500`. |
| R-007 | TD-UM-REG-11 verifies trim/lowercase on write and lookup and normalized duplicates return `409`. |
| R-008 | TD-UM-REG-08/REL-08 use parallel HTTP inside one test; the runner stays at one worker until schema-per-worker exists. |
| R-009 | TD-UM-AUTH-06 verifies a deactivated User receives no usable magic-link session. |
| R-010 | Migration/schema review plus relationship E2E verifies AD-11 CHECK/UNIQUE constraints exist and map violations stably. |
| R-011 | TD-UM-REG-12 verifies no second User is created for a deactivated normalized email and the same identity is retained. |
| R-012 | TD-UM-NFR-PII-01 scans fixtures/logs for real PII. |
| R-013 | Epic 2 fixture contract seeds a User directly through Prisma without depending on Epic 1 HTTP readiness. |
| R-014 | TD-UM-CT-03 explicitly proves manual backfill only; TD-UM-REL-04/05 separately prove automatic mentorship lifecycle events. |

- [ ] **Step 3: Add a concise ownership rule instead of repeating an owner in every row**

Immediately before the P0 table, add:

```markdown
**Coverage ownership:** QA owns E2E/API scenario implementation and evidence by default; Platform co-owns k6 and parallel-worker infrastructure; Backend owns TD-UM-DOM-* unit checks and database-migration verification. Product/Architecture own normative propagation and waivers, not test execution.
```

This satisfies “owners where applicable” without adding a repetitive owner column that conflicts with the template's required five-column scenario tables.

- [ ] **Step 4: Make exit criteria explicit**

Add these exit criteria:

```markdown
- [ ] R-001..R-005 mitigations have implementation evidence or an owner/date/reason waiver
- [ ] ≥80% of in-scope FR-1..FR-16 requirements have approved scenario + green automated evidence; every uncovered FR has a documented waiver
```

Keep P0 100%, P1 ≥95%, high-severity bug, traceability, and k6 criteria intact.

- [ ] **Step 5: Add KB evidence references**

Append exact references to Appendix B:

```markdown
- `probability-impact.md` — applied for 1–3 probability/impact scoring and 6–8 MITIGATE / 9 BLOCK action thresholds
- `nfr-criteria.md` — applied to Security, Performance, Reliability, Maintainability, and Data-privacy evidence planning; final verdict remains deferred to `nfr-assess`
```

Use the repository paths under `.claude/skills/bmad-testarch-test-design/resources/knowledge/` in the link targets or surrounding text.

- [ ] **Step 6: Verify Task 2**

Run:

```bash
rg -n "R-00[6-9]|R-01[0-4]|Coverage ownership|≥80%|R-001\.\.R-005 mitigations|probability-impact\.md|nfr-criteria\.md" _bmad-output/test-artifacts/test-design-qa.md
```

Expected: every risk R-006..R-014 appears in QA coverage, ownership and exit rules exist, and both missing KB references are present.

---

### Task 3: Recalibrate P0 without gaming the percentage

**Files:**
- Modify: `_bmad-output/test-artifacts/test-design-qa.md:20-28`
- Modify: `_bmad-output/test-artifacts/test-design-qa.md:164-256`
- Modify: `_bmad-output/test-artifacts/test-design-qa.md:298-307`
- Modify: `_bmad-output/test-artifacts/test-design/people-management-handoff.md:29-38`
- Modify: `_bmad-output/test-artifacts/test-design-progress-system.md:60-64`

**Interfaces:**
- Consumes: strict P0 definition from `test-priorities-matrix.md` and the current ~57 scenario inventory
- Produces: one priority assignment used consistently by QA, handoff, counts, and effort estimates

- [ ] **Step 1: Retain only no-workaround release gates in P0**

Retain these eight P0 scenarios:

```text
TD-UM-REG-01
TD-UM-AUTH-01
TD-UM-AUTH-03
TD-UM-DEACT-01
TD-UM-CT-01
TD-UM-REL-01
TD-UM-AC-01
TD-UM-AUTH-06
```

Rationale: they cover creation, passwordless entry, session establishment, deactivation, atomic initial audit event, the core direct relationship, cross-controller authorization, and denial of authentication after deactivation.

- [ ] **Step 2: Move overlapping or recoverable P0 scenarios**

Move to P1:

```text
TD-UM-REG-02
TD-UM-REG-03
TD-UM-PF-01
TD-UM-CT-02
TD-UM-CT-05
TD-UM-CT-07
TD-UM-REL-02
TD-UM-REL-04
TD-UM-REL-05
```

Move `TD-UM-PF-02` to P2 because photo upload has an acceptable workaround and does not block identity/authentication.

- [ ] **Step 3: Update counts and effort rows without changing total scope**

Use:

```text
P0: ~8
P1: ~31
P2: ~13
P3: ~5
Total: ~57
```

Keep interval estimates; rebalance only the row notes/ranges if the moved scenarios make the old row estimate misleading. Do not calculate exact hours per test.

- [ ] **Step 4: Document the residual P0-ratio warning honestly**

Add one concise note:

```markdown
**P0 distribution note:** 8/~57 (~14%) remains above the checklist's <10% heuristic because this is one system-level plan spanning four epics. Each retained P0 is a distinct no-workaround lifecycle, security, or data-integrity gate; priorities are not reduced solely to meet a percentage.
```

- [ ] **Step 5: Make the handoff epic gates match the QA table**

Use:

```text
Epic 1: TD-UM-REG-01, TD-UM-DEACT-01, plus cross-epic TD-UM-AC-01
Epic 2: TD-UM-AUTH-01, TD-UM-AUTH-03, TD-UM-AUTH-06
Epic 3: TD-UM-CT-01
Epic 4: TD-UM-REL-01
```

Remove PF-01/02, LIST-01..03, and the other newly-P1 scenarios from the P0-gate cells; keep them in story guidance at their proper priority.

- [ ] **Step 6: Verify Task 3**

Run:

```bash
rg -n "P0.*~8|P1.*~31|P2.*~13|P0 distribution note|TD-UM-PF-02|Epic 1: Employee|Epic 4: Organizational" _bmad-output/test-artifacts/test-design-qa.md _bmad-output/test-artifacts/test-design/people-management-handoff.md _bmad-output/test-artifacts/test-design-progress-system.md
```

Expected: counts total ~57, the eight P0 IDs appear only in P0, moved IDs appear in their new sections, and handoff gates match.

---

### Task 4: Complete the handoff risk mapping and status alignment

**Files:**
- Modify: `_bmad-output/test-artifacts/test-design/people-management-handoff.md:1-10`
- Modify: `_bmad-output/test-artifacts/test-design/people-management-handoff.md:72-84`
- Modify: `_bmad-output/test-artifacts/test-design/people-management-handoff.md:116`
- Modify: `_bmad-output/test-artifacts/test-design-progress-system.md:65-102`

**Interfaces:**
- Consumes: complete risk register from Architecture and QA mappings from Task 2
- Produces: R-001..R-014 story/epic ownership map and consistent review status

- [ ] **Step 1: Add the six missing risk mappings**

Add:

| Risk | Story/Epic mapping | Test level |
| --- | --- | --- |
| R-007 | Epic 1 Stories 1.1 and 1.2 | E2E API + DB constraint |
| R-010 | Epic 4 Stories 4.1 and 4.2 | Migration review + E2E API |
| R-011 | Epic 1 identity lifecycle; registration guard now, dedicated rehire interface later | E2E API |
| R-012 | All epics / CI fixtures | CI scan |
| R-013 | Epic 2 Story 2.1 fixture setup | E2E infrastructure |
| R-014 | Epic 3 Story 3.2 + Epic 4 Story 4.2 | E2E API + scenario audit |

Confirm the table then contains every ID from R-001 through R-014 exactly once.

- [ ] **Step 2: Align status language without claiming human completion**

Use the same semantic status across Architecture, QA, Handoff, and Progress:

```text
Decision set approved; full test-design review pending.
```

Do not check the full-design human approval box and do not claim a team meeting is scheduled.

- [ ] **Step 3: Verify Task 4**

Run:

```bash
rg -n "R-00[1-9]|R-01[0-4]|full test-design review pending|Full Test-Design Review Pending" _bmad-output/test-artifacts/test-design/people-management-handoff.md _bmad-output/test-artifacts/test-design-progress-system.md _bmad-output/test-artifacts/test-design-architecture.md _bmad-output/test-artifacts/test-design-qa.md
```

Expected: all 14 risk IDs are mapped and status wording is semantically aligned.

---

### Task 5: Run structural and scope verification

**Files:**
- Verify: all four edited derived artifacts
- Verify unchanged: normative requirements, architecture sources, scenarios, implementation specs, and code

**Interfaces:**
- Consumes: completed Tasks 1–4
- Produces: evidence that checklist cleanup did not expand scope or damage Markdown structure

- [ ] **Step 1: Scan for stale validation-failure language**

Run:

```bash
rg -n -i "missing mitigation plans|risk category legend absent|residual risk not documented|QA Risk Assessment incomplete|adopted interim|remaining architecture blockers" _bmad-output/test-artifacts/test-design-architecture.md _bmad-output/test-artifacts/test-design-qa.md _bmad-output/test-artifacts/test-design/people-management-handoff.md _bmad-output/test-artifacts/test-design-progress-system.md
```

Expected: no matches. Historical language may remain only inside the old validation report until Task 6 regenerates it.

- [ ] **Step 2: Validate Markdown table shape**

Run:

```bash
awk 'BEGIN { bad=0; in_table=0 } /^\|/ { pipes=gsub(/\|/, "|"); if (!in_table) { expected=pipes; in_table=1 } else if (pipes != expected) { printf "%s:%d table pipe-count mismatch: expected %d, got %d\n", FILENAME, FNR, expected, pipes; bad=1 } next } { in_table=0 } END { exit bad }' _bmad-output/test-artifacts/test-design-architecture.md _bmad-output/test-artifacts/test-design-qa.md _bmad-output/test-artifacts/test-design/people-management-handoff.md _bmad-output/test-artifacts/test-design-progress-system.md
```

Expected: exit 0 and no output.

- [ ] **Step 3: Verify risk coverage mechanically**

Run one count per artifact:

```bash
rg -n "R-(001|002|003|004|005|006|007|008|009|010|011|012|013|014)" _bmad-output/test-artifacts/test-design-architecture.md
rg -n "R-(001|002|003|004|005|006|007|008|009|010|011|012|013|014)" _bmad-output/test-artifacts/test-design-qa.md
rg -n "R-(001|002|003|004|005|006|007|008|009|010|011|012|013|014)" _bmad-output/test-artifacts/test-design/people-management-handoff.md
```

Expected: each output includes R-001 through R-014. Extra risk references must be investigated rather than ignored.

- [ ] **Step 4: Verify protected scope stayed unchanged**

Run:

```bash
git diff --exit-code -- docs/project-requirements.md docs/architecture docs/test-cases _bmad-output/planning-artifacts _bmad-output/implementation-artifacts _bmad-output/specs
git -C /Users/home/bootcamp/workplace diff --exit-code -- docs/requirements-qa-addendum.md
```

Expected: exit 0 and no output. The new plan under `docs/superpowers/plans/` is outside these protected normative/scenario paths.

- [ ] **Step 5: Review the exact worktree state**

Run:

```bash
git status --short
```

Expected: only the plan and `_bmad-output/test-artifacts/` changes relevant to this work are present. Do not stage or alter unrelated user files.

---

### Task 6: Rerun TEA Validate and interpret the new result

**Files:**
- Read: `.claude/skills/bmad-testarch-test-design/SKILL.md`
- Read: `.claude/skills/bmad-testarch-test-design/steps-v/step-01-validate.md`
- Regenerate: `_bmad-output/test-artifacts/test-design-validation-report.md`

**Interfaces:**
- Consumes: verified derived artifacts from Task 5
- Produces: fresh checklist evidence and an accurate sign-off boundary

- [ ] **Step 1: Invoke the repository test-design workflow in Validate mode**

Load `.claude/skills/bmad-testarch-test-design/SKILL.md`, resolve its customization as instructed, select `[V] Validate`, and validate the existing system-level outputs. Do not use Create or Edit mode for this step.

- [ ] **Step 2: Require fresh evidence for the four former critical findings**

Confirm the regenerated report marks these as PASS:

```text
Mitigation plans defined for R-001..R-005
QA Test Coverage present for R-001..R-014
Risk category legend included
Residual risk documented
```

- [ ] **Step 3: Classify remaining warnings instead of hiding them**

Accept only warnings that accurately reflect human/external work, such as:

```text
Normative propagation pending
Full human test-design approval pending
Team review not yet scheduled
Schema-per-worker pending before parallel workers
Production TTL/retry operational values configuration-owned
```

Do not rewrite those as PASS without evidence.

- [ ] **Step 4: Verify the regenerated report is internally current**

Run each fixed-string marker check independently:

```bash
rg -n -F "Overall Verdict" _bmad-output/test-artifacts/test-design-validation-report.md
rg -n -F "Critical Findings" _bmad-output/test-artifacts/test-design-validation-report.md
rg -n -F "Completion Criteria overall" _bmad-output/test-artifacts/test-design-validation-report.md
rg -n -F "Decision set approved" _bmad-output/test-artifacts/test-design-validation-report.md
rg -n -F "full test-design" _bmad-output/test-artifacts/test-design-validation-report.md
```

Expected: all five commands exit 0; the report reflects the edited line counts/content, preserves the exact `Completion Criteria overall` compatibility label for strict FAIL, and no longer lists the four fixed documentation gaps as critical findings.

- [ ] **Step 5: Stop at the human boundary**

Prepare a concise handoff stating:

```text
AI-executable checklist fixes: complete and revalidated.
Human-owned next steps: review/approve the full test design, authorize normative propagation, and schedule team review.
ATDD remains out of scope until stage-1 scenario approval.
```

Do not mark those human-owned steps complete.

---

## Final Acceptance Checklist

- [ ] R-001..R-005 each have Strategy, Owner, Timeline, Status, Verification, and residual risk.
- [ ] R-001..R-014 each have QA coverage and handoff mapping.
- [ ] Architecture risk-category legend is present.
- [ ] Architecture/QA/Handoff/Progress statuses agree semantically.
- [ ] P0/P1/P2/P3 counts total ~57 and handoff gates match the QA tables.
- [ ] KB references cite `probability-impact.md` and `nfr-criteria.md` because they were actually read/applied.
- [ ] Protected normative, scenario, implementation, and code paths have no diff.
- [ ] Fresh Validate-mode report no longer lists the four former documentation gaps as critical.
- [ ] Human approval, normative propagation, team scheduling, scenario edits, and ATDD remain explicitly pending.

## Commit Boundaries

If the user requests commits, keep them reviewable and stage exact files only:

```bash
git add _bmad-output/test-artifacts/test-design-architecture.md _bmad-output/test-artifacts/test-design-qa.md
git commit -m "docs: complete test design risk validation"

git add _bmad-output/test-artifacts/test-design/people-management-handoff.md _bmad-output/test-artifacts/test-design-progress-system.md
git commit -m "docs: align test design handoff and priorities"

git add _bmad-output/test-artifacts/test-design-validation-report.md docs/superpowers/plans/2026-08-25-test-design-validation-fixes.md
git commit -m "docs: record test design revalidation"
```

Do not commit unless the user explicitly asks for repository commits.
