# Test Design Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Use subagents for independent reviews when authorized. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace competing test-design baselines with one current platform architecture/QA pair and plans for identified product epics, preserving valid decisions, test intent, evidence boundaries, and downstream references.

**Architecture:** The platform pair owns shared testability, NFR evidence contracts, execution strategy, and cross-epic regression. Epic plans own specific scenario/risk coverage and reference the shared rules. A repository customization resolves domain-qualified epic identities; no application behavior or test execution evidence changes as a consequence of moving documentation.

**Tech Stack:** Markdown, BMad workflow TOML overrides, Git, existing Python configuration resolver and Node repository guards.

**Spec:** The migration contract and acceptance criteria below capture the approach and risk review agreed in the conversation. This is a plan for later execution, not authorization to implement it during plan review.

**Audit baseline:** workspace `76a7220701ac6f16843dad8b303934f9a958b54c`; backend `f1eea3c048821011da96fba20d9b517f7d0e4f1b`; frontend `fa3d3198aa9921c26d22307542ab72834a03b899`. Recheck at execution; these pins are observation context, not evidence that the current code passes.

## Global Constraints

- Root changes are planning artifacts and workflow configuration only. No service code, scenarios, tests, CI execution policy, ClickUp operations, service gitlinks, or product requirement changes in this migration.
- PM spine and current binding `docs/architecture/*` are architecture authority. Preserve PM/AD versus ACF/AD namespaces. Historical PRDs are not current requirements.
- Preserve per-decision provenance. Draft DEC-UM-012 must not inherit the approval of DEC-UM-001..011. A new document does not inherit the old document's validation PASS or human approval.
- Whole-repository trace remains a planning audit with `allow_gate=false`. Do not issue a release verdict or alter coverage/sprint status through document movement.
- Current trace artifacts keep canonical undated names. Historical content assertions link to the file at its actual commit. Do not edit stored execution results or manufacture evidence.
- One public switch of the complete artifact set. Work in an isolated checkout; do not publish intermediate mixtures of old documents and new handoffs/checkpoints.
- This plan's acceptance is document/workflow migration acceptance, not product release readiness.

## Target structure and ownership

Paths are relative to the repository root. All current test-design outputs remain under `_bmad-output/test-artifacts/` (`test_artifacts`). The configured `test_design_output` subdirectory remains the existing handoff location, not an additional competing root.

| Target | Responsibility |
| --- | --- |
| `test-design-architecture.md` | One platform testability/risk baseline; risk ownership, architecture seams, shared NFR contract references |
| `test-design-qa.md` | One execution/coverage strategy; separate backend/frontend/contract/live-integration sections, cross-epic regression map, NFR measurement contracts |
| `test-design-epic-{domain}-{number}.md` | One actual epic, selected from the canonical epic source; for example `test-design-epic-user-management-2.md` |
| `test-design-progress-system.md` | New platform system run state, with `runScope: system-level`, `runKey: system`; approval starts ungranted |
| `test-design-progress-epic-{domain}-{number}.md` | Matching epic checkpoint; `runKey: epic-{domain}-{number}` and explicit source epic ID/path |
| `test-design-validation-report.md` | Fresh, scope-explicit migration-era validation; evaluated inputs identified by content hashes and baseline commit |
| `test-design-validation-report-epic-{domain}-{number}.md` | Validation of one selected epic; never overwrites the system verdict |
| `test-design/people-management-handoff.md` | Single platform handoff, explicitly selected despite configured project display name `people management` |
| `test-design/README.md` | Small current-artifact index: scope, canonical epic ID/source, outputs, checkpoints, status; includes unplanned scopes and owners |
| `test-design/migration-map.md` | Migration record, not a second strategy; old anchors/IDs, disposition, destinations, rationale, approval/evidence handling |

Do not create empty plans for every epic or use `frontend` as a fictitious epic. Transfer only actual scenario/risk obligations to their owning epics. Cross-cutting improvement candidates without a product epic stay in a clearly labelled QA improvement backlog with owner and trigger, and do not count as requirement coverage.

For an actual unnumbered epic, replace `{number}` in every plan, checkpoint, and validation-report pattern with its stable canonical slug. For example a synthetic fixture epic with domain `fixture` and slug `identity-recovery` resolves to `test-design-epic-fixture-identity-recovery.md`, `test-design-progress-epic-fixture-identity-recovery.md`, `runKey: epic-fixture-identity-recovery`, and `test-design-validation-report-epic-fixture-identity-recovery.md`. This example is a test fixture, not a new repository epic.

## Task 1: Freeze the baseline and enumerate obligations

**Files:** Read all `test-design*.md`, both existing `test-design/*handoff.md`, `critical-review-existing-artifacts.md`, current requirements/spine/binding architecture, domain epic sources, and dependent documents. Create `test-design/migration-map.md` and draft `test-design/README.md` in the isolated checkout.

**Interface:** Produces a complete source inventory and disposition ledger consumed by Tasks 2–5.

- [ ] Record `git rev-parse HEAD`, `git status --short`, and `git submodule status`. Preserve user work. If sources differ from the audit pins, inspect the changed sources before adopting old findings.
- [ ] Read `AGENTS.md`, `docs/architecture/README.md`, relevant binding docs, and the existing epic identity migration report `docs/superpowers/plans/2026-09-09-epic-number-collision-verification.md`. Reuse current IDs; do not renumber epics or ClickUp mappings.
- [ ] Inventory each source section plus every risk/test/decision ID, NFR threshold, execution constraint, approval claim, estimate, regression trigger, and unresolved task. Key bare risks by source scope (for example `legacy-um:R-001`) to prevent collisions.
- [ ] Record ledger columns: `source_commit`, `source_path`, `source_anchor_or_id`, `kind`, `disposition` (`preserve`, `merge`, `replace`, `retire`), `target_path_and_anchor`, `authority_and_reason`, `approval_status`, `evidence_contract`, `consumers`. A retirement has a reason and authority even when no successor exists. Splits list all successors; merges list all origins.
- [ ] Find consumers with `rg -n --hidden 'test-design|test_design|TD-UM-|R-UM-|people-management-handoff|people-management-platform-handoff' docs _bmad-output _bmad/custom .agents/skills .claude/skills scripts test .github`, then inspect service repositories separately. Classify current consumers versus historical statements. Do not rewrite historical statements to new semantics.
- [ ] Pin superseded validation, progress, review, and approval statements to the baseline commit where that exact content exists. Do not copy them into a dated current-evidence directory.

**Acceptance:** Every source section and ID has a disposition; every matching consumer has a treatment. An unresolved product decision remains explicit and draft; the executor does not invent its answer.

## Task 2: Reconcile meaning before drafting the new set

**Files:** Update the ledger; read `docs/architecture/user-management-test-decisions.md`, `docs/architecture/testing-strategy.md`, current PM spine, actual scenario inventories, domain epic files, and the UM/FE area designs.

**Interface:** Produces resolved placement and explicit unresolved-decision records; no source is removed yet.

- [ ] Classify legacy registration/deactivation rows against v1.5 seed/import and departure authority. Retire superseded intent; preserve surviving auth, timeline, relationship, and identity invariants. Do not resurrect retired scenario files.
- [ ] Reconcile platform blockers against current ratifications (including PM/AD-33/34). Distinguish an adopted design from implemented behavior and runtime evidence; closing design discovery does not close implementation work.
- [ ] Separate the All Employees HTTP/list performance contract from ACM-9 facade and P6 measurements. Record subject, dataset, filters/graph shape, environment, statistic, threshold, and evidence for each. Keep genuinely unknown percentile/load parameters unknown; never import resolver p95 semantics into the list requirement without authority.
- [ ] Resolve the UM P1 versus platform P0 performance conflict with a recorded rationale. Preserve risk-based severity; do not normalize P0 percentages to satisfy a template heuristic. Reconcile `R-UM-04` score 6 against its misleading Medium heading.
- [ ] Preserve backend database isolation conditions separately from frontend browser parallelism. Recheck current binding policy rather than blindly preserving old worker settings. Preserve contract, mocked-browser, real HTTP/PostgreSQL, and live-provider evidence distinctions.
- [ ] Preserve the UM cross-epic regression map, TTL/time controls, outbound fake observations, and applicable durable-state observability. Assign feature-specific cases to actual current epics. Keep useful cross-cutting unit/component improvement candidates in the QA backlog when no product epic owns them.
- [ ] Re-estimate only remaining work after distinguishing implemented tests, new tests, planning rows, shared infrastructure, and deferred candidates. Do not add old 57-scenario, 79–124-row, 59-case, and 85-case totals together. If current implementation has not been verified, label it unverified rather than completed.

**Acceptance:** No unresolved conflict is hidden by copying one source over another. Draft decisions remain draft; no test requirement is dropped merely to reduce file count.

## Task 3: Draft the canonical artifacts and migrate consumers together

**Files:** Replace the two canonical system documents; create only necessary domain-qualified epic plans; update the single handoff/index/ledger; replace current checkpoints and validation scope; update `_bmad-output/planning-artifacts/platform/epics.md` Story 1.6 deliverable references. Historical consumers include `docs/superpowers/plans/2026-08-25-test-design-validation-fixes.md`, the 2026-09-01 correct-course proposal, and the access-control spec `.memlog.md`.

**Interface:** Produces the proposed complete artifact set; Task 4 makes workflow selection agree with it.

- [ ] Write the platform architecture and QA pair using the reconciled ledger. Architecture owns risk rationale and testability gaps; QA references risk IDs and owns evidence/execution details. Domain subsections provide navigation without creating a second source of shared policy.
- [ ] Write scoped epic plans for migrated concrete epic obligations. Store canonical `epicId`, source path, domain, and number. Multiple frontend/backend components of the same product epic belong to the same plan, with separate test-level subsections.
- [ ] Consolidate both handoffs into the canonical platform handoff and update current consumers. Retain the source-to-successor ID map. Remove old platform pair, UM/FE area-plan files, duplicate handoff, superseded checkpoints and old current validation notices only after their ledger destinations exist.
- [ ] Initialize new checkpoints honestly: document generation complete does not mean validated or approved. Do not relabel the old approved UM run as a platform run. Old run history remains accessible at its commit.
- [ ] Update Story 1.6 artifact references and factual dependency references only. Preserve sprint statuses, product coverage fields, current gate identities and historical gate anchors; record additional substantive debt instead of declaring the story complete.
- [ ] Update historical citations to commit links where a reused filename would change their meaning. Preserve the original historical claim; do not rewrite what a prior review evaluated.
- [ ] Compare source disposition ledger to outputs and consumers. Each preserved/merged/replaced item must resolve; every retired item must have authority/rationale. Require a reader to find the relevant system and epic plan from the index without reading old files.

**Acceptance:** No current consumer points at a removed artifact or mistakes the new platform baseline for old UM approval. No normative DEC, scenario file, sprint status, coverage evidence or service file changes.

## Task 4: Make workflow routing agree with the artifact contract

**Files:** Create `_bmad/custom/bmad-testarch-test-design.toml` and `docs/test-design-workflow-contract.md`. Use the installed customization mechanism; do not edit generated `customize.toml` defaults or fork the skill unnecessarily.

**Interface:** The contract resolves `(domain, canonical epic ID, source path)` into the same plan/checkpoint identity for Create, context loading, Edit, Resume, and Validate.

- [ ] Put `file:docs/test-design-workflow-contract.md` into `[workflow].persistent_facts` and a prepend instruction to read the current index and resolve scope before choosing any output. Team-level override is read by both `.agents` and `.claude` installations.
- [ ] Specify explicit repository overrides to stock rules: one `system` identity for platform; `epic-{domain}-{number}` for canonical numbered epics; a domain-qualified stable canonical slug only for a real unnumbered epic. Bare repeated numbers must prompt for scope without writing anything. These override stock derivation from `epic_num` at step 1 and output generation at step 5.
- [ ] Specify the exact handoff path from the table, so project display-name spaces cannot create a second handoff. Keep output roots unchanged.
- [ ] Specify validation targeting: system writes the canonical report; an epic writes `test-design-validation-report-epic-{domain}-{number}.md`. Every report identifies evaluated paths/hashes and its scope, and updates the index; no epic validation overwrites the system report.
- [ ] Specify discovery and legacy behavior: load index plus canonical system pair; read only the selected epic's checkpoint. An old/deleted run is historical, not resumable as the new scope. A mismatched `runKey` refuses to resume; ambiguous legacy state requires explicit selection. Fresh runs update existing canonical artifacts rather than inventing suffix variants.
- [ ] Resolve customization through both installations using the commands below and compare effective facts. Check for personal overrides affecting the result. If the stock skill does not obey the explicit contract in the sandbox exercises, stop at this task and revise the routing design; do not publish a configuration-only claim of success.

```bash
UV_CACHE_DIR=/tmp/codex-uv-cache uv run python _bmad/scripts/resolve_customization.py --project-root . --skill .agents/skills/bmad-testarch-test-design --key workflow
UV_CACHE_DIR=/tmp/codex-uv-cache uv run python _bmad/scripts/resolve_customization.py --project-root . --skill .claude/skills/bmad-testarch-test-design --key workflow
diff -qr .agents/skills/bmad-testarch-test-design .claude/skills/bmad-testarch-test-design
```

**Acceptance:** Effective routing is identical across installations. No claim that loading a TOML file proves an LLM workflow will follow it; Task 5 exercises selection behavior.

## Task 5: Verify preservation and downstream behavior in a sandbox

**Files:** Create `docs/superpowers/plans/2026-09-10-test-design-consolidation-verification.md` during execution. Temporary fixtures and generated validation outputs live outside the active repository tree.

**Interface:** Produces review evidence for the proposed set; does not publish trace results or change production code.

- [ ] Check the full diff against the ledger, including priorities, NFR measurement contracts, per-decision approval, cross-epic regression, evidence levels, and retired behavior. An independent reviewer samples high-risk items and checks completeness against the source inventory, not only the executor's summary.
- [ ] Build a self-contained fixture with copies of both skill trees, resolver dependencies, required knowledge/configuration, candidate overrides, and candidate documents. Do not invoke live skill paths from a temporary cwd: the resolver infers project root from the skill path first. Bind `{project-root}` to the fixture and pass `--project-root "$migration_fixture_root"` on every fixture resolver call. Never symlink writable outputs to the live checkout or copy service credentials.
- [ ] Inspect effective prepend/append actions and completion hooks before running a fixture. Set effective `workflow.on_complete` to an empty string in the fixture's highest-precedence override and disable other external/mutating hooks there. Preserve routing facts from personal overrides when relevant; record all hook differences. Resolve and normalize all output paths, refusing any outside the fixture. Record before/after hashes of live migration inputs and fixture files outside the intended output set; any unexpected change fails the exercise.
- [ ] Exercise both copied skill entrypoints. Record requested scope, selected inputs, intended outputs, actual written files, and run identity. Cover: system; UM Epic 1; platform Epic 1; ambiguous Epic 1; matching and mismatched Resume; historical checkpoint; system Validate; epic Validate; repeated Create; system Edit; selected epic Edit. For ambiguous/mismatched runs expect no writes. For targeted runs assert other scopes' artifacts, reports and checkpoints are unchanged. Permit only sandbox document output and no test generation.
- [ ] Add the synthetic unnumbered epic described in the target contract with a source document and explicit canonical slug. Exercise Create, subsequent selection, Resume, and Validate; require the same identity and filenames across runs. Do not add this synthetic epic to repository planning or tracking artifacts.
- [ ] Confirm epic context loading includes the shared NFR contract and selected epic only. Verify the list 2-second threshold is found without being confused with ACM-9. Check that declined/ungranted approvals remain visible to the workflow.
- [ ] Perform a read-only trace-input comparison: old versus candidate requirement IDs, priorities, scope, proposed test mappings and evidence meanings. Do not regenerate canonical trace/coverage/gate JSON or run trace completion hooks. Record any justified expected changes for a separately scoped future trace run; unexpected differences block cutover.
- [ ] Run the existing identity guard and trace naming regression test. Root `npm test` is a stub; service suites are unnecessary because no service behavior changes.

```bash
node scripts/epic-id-guard.cjs --root .
node --test test/trace-artifact-naming.test.cjs
git diff --check
git diff --name-only
```

- [ ] Search removed filenames separately: allow references only as historical commit links or ledger source entries, not current input/output paths. Then validate scoped IDs against their dispositions: preserved IDs and declared replacements are valid in canonical definitions and intended consumers; retired IDs cannot remain active obligations; splits resolve to every declared successor; merges resolve each origin to their common successor. Do not reject a valid ID merely because its spelling survived migration.
- [ ] Confirm trace JSON, live verification results, sprint statuses, service gitlinks, scenarios, and application files are unchanged.
- [ ] Write the verification report with exact baseline pins, candidate content hashes, commands/outcomes, semantic findings, and any unexecuted checks. Workflow review is not a product readiness verdict.

**Acceptance:** No unresolved preservation/routing defect; no unexplained trace-input delta; no forbidden-file changes. If an entrypoint cannot be exercised, record it as unverified and withhold migration-complete status rather than substituting a prose assertion.

## Task 6: Publish coherently and retain a safe rollback

**Files:** The complete reviewed migration set, index, ledger, customization, contract, and verification record.

- [ ] Before integration compare source hashes/current HEAD to Task 1. If other work changed an input or consumer, reconcile and rerun affected checks; do not overwrite concurrent work.
- [ ] Present the complete diff and independent review findings. Integrate the migration as one coherent commit after execution authorization; no push, merge, ClickUp update, or deployment is implied by this plan-review request.
- [ ] Record the migration commit once it exists. Verify a fresh reader selects the canonical platform pair and domain-qualified epic plan through the index.
- [ ] Roll back before any downstream authoring by reverting the complete migration commit. After downstream edits exist, first enumerate those dependent edits and reconcile them; blindly reverting only the old filenames would recreate mixed identities. Preserve unrelated work and never use a hard reset as rollback.

**Completion:** The structural migration is complete only after Tasks 1–6 pass. New human approvals, missing runtime evidence, product implementation, unresolved decisions, and future trace runs remain explicitly separate work.

## Independent plan review

Independent re-review verdict: **READY FOR AUTHORIZED EXECUTION**. Initial findings R1–R3 (fixture-root/hook confinement, unnumbered-epic exercise coverage, disposition-aware ID checks) are resolved. This is plan readiness only; migration and workflow exercises have not run. Review record: `docs/superpowers/plans/2026-09-10-test-design-consolidation-review.md`.
