# Independent review — test-design consolidation plan

**Final verdict: READY FOR AUTHORIZED EXECUTION.** Independent re-review confirms R1–R3 are addressed in the revised plan. This is plan readiness only: the migration and workflow exercises remain unexecuted. The proposed single platform pair and domain-qualified real epic plans are supported.

**Reviewed:** `docs/superpowers/plans/2026-09-10-test-design-consolidation.md`, initial uncommitted draft on workspace `76a7220701ac6f16843dad8b303934f9a958b54c`. This is a plan review, not execution or a product readiness verdict. Only this review report was written.

## Initial findings and verified resolutions

### R1 — Bind sandbox execution to the fixture root and effective hooks

**Resolution: CLOSED.** Revised Task 4 passes `--project-root .`; Task 5 requires self-contained copies, explicit fixture-root binding, highest-precedence empty completion hook, effective action inspection, normalized confined outputs, and before/after hashes. No live skill-path inference is allowed.

**Location:** Task 4 resolver commands; Task 5 sandbox exercise (initial draft lines 103–106 and 118).

The sandbox intent is correct, but the operational boundary is underspecified. `_bmad/scripts/resolve_customization.py` first infers the project root from the supplied skill directory, before considering the working directory. Calling a live installed skill from a temporary cwd can therefore load the real repository's team/personal overrides. The TEA config derives output paths from `{project-root}`, and terminal steps execute effective `workflow.on_complete`.

**Fix:** State that both skill trees, resolver dependencies, config and candidate overrides are copied into a self-contained fixture; pin `{project-root}` and every resolver call with `--project-root <fixture-root>`. Verify resolved output paths stay inside that fixture before writing. Inspect the effective hook and disable it in the fixture explicitly; if personal overrides are included, preserve their routing effect but replace their hook in the fixture, recording that difference. Do not use symlinks to live writable outputs or copy service credentials. Capture before/after file inventories or hashes outside the allowed sandbox output set. Add `--project-root .` to the real-repository resolver checks for deterministic intent.

This is a documentation clarification, not a request for a new sandbox implementation.

### R2 — Complete the unnumbered canonical identity exercise

**Resolution: CLOSED.** The target contract now spells out all four identities for a synthetic unnumbered epic. Task 5 exercises Create, later selection, Resume and Validate against its source, and separately covers system Edit and epic Edit. The fixture is explicitly excluded from real planning/tracking artifacts.

**Location:** Task 4 interface and slug rule; Task 5 exercise matrix (initial draft line 118).

The routing contract promises domain-qualified unnumbered epic support, but the acceptance exercises omit it. During review the author added explicit Edit exercise coverage and the numbered epic validation-report table row; those address the initial Edit/report omission. The unnumbered case remains unverified by the proposed matrix.

**Fix:** Add a fixture for an unnumbered epic with a canonical source and stable domain-qualified slug; confirm Create, subsequent selection and Resume retain the same identity. The fixture may be synthetic; do not invent a real repository epic. Name the same slug-based validation-report convention explicitly. If unnumbered support is intentionally out of scope, remove that promise and require explicit refusal instead. Run the newly added Edit exercise for both system and epic targets, checking that unrelated scope outputs remain untouched.

### R3 — Allow preserved current IDs in the final reference check

**Resolution: CLOSED.** Revised Task 5 separates removed-path checks from disposition-aware scoped-ID validation, permits preserved/replacement IDs in canonical definitions and consumers, checks split/merge destinations, and excludes retired IDs from active obligations.

**Location:** Task 5 removed-filename/migrated-ID check (initial draft line 130).

The instruction accepts remaining migrated-ID matches only in historical commit links or ledger entries. That contradicts Tasks 1–3, which preserve valid IDs in canonical plans and their current consumers. An executor following the acceptance literally could rename valid IDs unnecessarily or report failure on the correctly migrated set.

**Fix:** Separate two checks: removed paths must appear only in historical/ledger contexts; source IDs must resolve according to their ledger disposition. Preserved IDs and declared replacement IDs are allowed in current canonical definitions and intended consumers. Retired IDs must not remain active obligations. For splits, verify all intended successors; for merges, verify each origin resolves to the common successor. Check scoped identity rather than forbidding the text of an ID.

## Reviewed and adequate without further expansion

- The disposition ledger covers per-section and per-ID obligations, split/merge origins, explicit retirement authority, and consumer treatment. Canonical epic inventory is appropriately an execution task; the plan need not pre-author every epic document.
- Explicit persistent facts plus prepend activation is a supported local customization mechanism. The plan correctly requires behavioral exercises and withholds completion when overrides are not obeyed; parsing TOML alone is not claimed as proof.
- Separate system/epic validation identities, fresh approval state, input hashes, and historical commit anchors address report/checkpoint semantic collisions.
- NFR measurement subjects, priority conflicts, cross-epic regression, test-level evidence distinctions, implementation-versus-planning counts, and per-decision approval are explicitly preserved or reconciled.
- No trace completion hooks, status promotion, scenario rewrite, service changes, or runtime evidence generation is authorized by document movement. The read-only trace comparison is appropriately scoped.
- Coherent cutover, input-drift recheck and dependency-aware rollback are adequate. No destructive rollback is proposed.

## Verification performed for this review

Read the complete candidate plan, installed test-design entrypoint/customization defaults, customization resolver, Validate step, TEA config, and existing epic-identity verification report. Checked workspace status: the plan was untracked and no implementation migration was present. No workflow run, test-design output, trace run, service test, or external action was performed.

## Final re-review

Read the revised plan in full and checked the changed target identity contract, Task 4 commands, and Task 5 acceptance exercises against R1–R3. All three findings are closed at the planning level. No further blocking plan defect was identified within this bounded review. No implementation, workflow exercise, runtime test, external action, or release verification was performed.

**READY FOR AUTHORIZED EXECUTION — plan only; workflow remains unexecuted.**
