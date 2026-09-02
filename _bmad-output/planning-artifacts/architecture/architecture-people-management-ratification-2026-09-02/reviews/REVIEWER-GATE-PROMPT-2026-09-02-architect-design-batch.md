# Independent Reviewer Gate — 2026-09-02 architect-design-batch

Run this against the working tree. Do **not** treat the Update author as the reviewer.

## Mechanical floor (required)

```bash
uv run workplace/.agents/skills/bmad-architecture/scripts/lint_spine.py \
  --workspace workplace/_bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-19
```

Parse YAML:

- `architecture-people-management-ratification-2026-09-02/{blockers,evidence-matrix,transition-debt}.yaml`
- `global-coverage/global-fr-epic-story-coverage.yaml`

Checks:

- AD IDs 1–35 present, monotonic, not reused.
- Every new AD has Binds / Prevents / Rule.
- `blockers.yaml` §7 prose in `ARCHITECTURE-RATIFICATION.md` lists the same open IDs.
- An AD rated `conformant` must not carry open transition-debt.
- Evidence paths exist as files.
- Spine frontmatter `revision` / `updated` match in-body amendment date.

## Rubric walker

Judge `ARCHITECTURE-SPINE.md` against the good-spine checklist in `.agents/skills/bmad-architecture/references/reviewer-gate.md`.

## Configured lenses (run as independent subagents)

1. **Version / reality check.** Confirm named tech against the repo (NestJS 11, Prisma 7, frontend stack). Flag anything asserted from training data.
2. **Adversarial seams.** Construct two units that obey every AD yet still diverge. Pay special attention to:
   - PM/AD-27 vs AD-10 vs AD-31 (membership vs PM/DM policy vs sync-only writes)
   - PM/AD-28 vs narrower S13 closure-note rule
   - PM/AD-29 readers vs HR Admin
   - PM/AD-30 idempotency vs AD-20 at-least-once
   - PM/AD-35 `isHr` vs AD-19 HR-line
   - PM/AD-32 vs live `User.customFields` jsonb (must remain debt, not a silent rewrite of the AD)
   - OQ-PERM-01 still open (no invented default grants)

## Scope constraints for this gate

- Documentation-only Update. Application code must be unchanged.
- Historical Mentorship PRD and UMAC 403 artifacts must not have been rewritten as if they always contained these decisions.
- Do not claim release readiness.
- Closing a design question is not closing implementation.

Write findings to `architecture-people-management-ratification-2026-09-02/reviews/review-{slug}.md`.
