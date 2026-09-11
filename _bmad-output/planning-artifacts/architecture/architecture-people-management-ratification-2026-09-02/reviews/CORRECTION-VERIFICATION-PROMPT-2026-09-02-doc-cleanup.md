# Correction verification prompt — 2026-09-02 doc-cleanup

Use this as a focused second-pass check after the documentation-cleanup Update
that applied bmad-review sections **1 (must-fix)** and **2 (editorial)**.

Documentation-only. Do not modify application code, tests, lockfiles, package
manifests, or CI. Do not claim release readiness. Preserve **PM/AD-1..PM/AD-35**.
Do not rewrite protected historical evidence listed in the review §3.

## Scope

Verify disposition of review items **1.1–1.7** and the §2 editorial cleanup,
with mechanical counts recomputed from `blockers.yaml`.

## Checks

### Must-fix (1.1–1.7)

1. **1.1 Frontmatter revision**  
   `ARCHITECTURE-RATIFICATION.md` frontmatter `revision` and `binds_spine.note`
   name `2026-09-02-reviewer-gate-correction` (not stale `architect-design-batch`).

2. **1.2 Departure cancel wording**  
   `docs/architecture/database-schema.md` apply transaction cancels **only open
   Action Items assigned to the departing person**; authored-for-other-active-assignee
   items remain open. Must match `docs/project-requirements.md` / CC-06 condition 6.

3. **1.3 Stale open/pending for ratified designs**  
   No live “open / not yet decided / pending” instructions for designs resolved by
   PM/AD-32, PM/AD-34, or PM/AD-35 in `database-schema.md`, `api-conventions.md`,
   or `mentorship.md`. Implementation-absent status may remain.

4. **1.4 Historical PRD freshness**  
   `prd-user-management-2026-08-20/prd.md` and `prd-mentorship-2026-09-01/prd.md`
   have `updated: 2026-09-02` and memlog entries explaining the status/banner
   change. Approved Sprint Change Proposal bodies unchanged; clarification only
   in `sprint-change-proposal-2026-09-02-domain-prd-historical-status.ERRATUM.md`.

5. **1.5 AD-28 citation honesty**  
   `access-control.md` must **not** claim `matrix/full-profile-access/` scenarios
   exist. Must state scenarios are not authored and require AD-1 dispatch.

6. **1.6 Mentorship / coverage gates**  
   No live `G-CTX` / `G-PERM` / `G-S13` / `G-CT` / `G-DEP` or `OQ-M1`–`OQ-M7` as
   global blockers. Mentorship SPEC §7 and `global-fr-epic-story-coverage.yaml`
   gates resolve only to `blockers.yaml` IDs (e.g. `CC-10-MENTORSHIP`,
   `OQ-PERM-01`, `OQ-AC-EDIT`, `AC-S9-S13`, `CC-09`, `CC-06`).

7. **1.7 UMAC empty-audience 403**  
   In `spec-user-management-access-control-adoption/SPEC.md`, the three
   empty-audience 403 passages are annotated superseded by PM/AD-24 with pointer
   to live 401/404/403. Live dual-gate write 403 and Colleague-read-not-403
   rules preserved. `approvals.yaml`, `stories.yaml`, and committed-red tests
   untouched.

### Editorial (§2)

- Ambiguous “this revision” replaced with named revisions in the ratification.
- §7 titled **Blocker register**; narrative counts = 18 open / 8 closed / 4 superseded.
- §2 has explicit status vocabulary mapping without collapsing document lifecycle
  statuses; historical enforcement sentence not in normative §2.
- §11 is a dated pointer list; detail remains in `.memlog.md` / `reviews/`.
- Short denial summary in `access-control.md` links to complete PM/AD-24 rule.
- Bare citations in `testing-strategy.md` are resolvable repo paths; PM PRD
  SharePoint rows labeled `external`.
- ACF Decision Register reconciled with `package_review_approved` frontmatter;
  Inherited Invariants use `PM/AD-n`; local headings remain `AD-1..4` for lint.
- Memlog retirements appended (not edited in place).
- Functional-roles draft OQ-3/OQ-7 `Permissions.title` options marked superseded
  by ACF/AD-4.

### Protected (must be unchanged)

UMAC `approvals.yaml` / `stories.yaml` bodies / umac-05 / committed-red tests;
both spines’ pre-2026-09-02 amendment history; approved Sprint Change Proposal
bodies; [`gate-decision.json`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/c342138/_bmad-output/test-artifacts/gate-decision.json) (`c342138`) ACM3-II-06 FAIL; ratification memlog prior entries;
`TD-10` retired row retained; `CONFLICT-UM-01` dual-axis status model.

## Mechanical validation

```bash
uv run workplace/.agents/skills/bmad-architecture/scripts/lint_spine.py \
  --workspace workplace/_bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-19
uv run workplace/.agents/skills/bmad-architecture/scripts/lint_spine.py \
  --workspace workplace/_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29
```

Expect `total_findings: 0` for both.

Also:

- Parse `blockers.yaml`, `evidence-matrix.yaml`, `transition-debt.yaml`,
  `global-fr-epic-story-coverage.yaml`.
- Confirm PM AD headings are exactly 1..35 sequential.
- Confirm every live coverage `gates:` ID exists in `blockers.yaml`.
- Recompute open/closed/superseded = 18/8/4.
- Search live (non-`reviews/`) docs for: `matrix/full-profile-access/`,
  `cancels open action items` (unscoped), live `G-CTX`/`G-PERM`/`G-S13`/`G-CT`/`G-DEP`
  gates, and unmarked empty-audience 403 presented as live oracle.

## Out of scope

- Closing implementation blockers
- Creating AD-28 scenarios
- Editing `package.json` / lockfiles / CI / application code
- Rewriting historical review transcripts
- Commit / push / tag / release-readiness claims
