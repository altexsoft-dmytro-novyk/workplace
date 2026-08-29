# Correct Course v1.5 — File Inventory

## Purpose

This branch isolates the local files that form the traceable Correct Course chain for the approved 2026-08-29 BA alignment, including its CC-04/CC-06 architecture-resolution follow-up. It deliberately excludes unrelated TEA/test-design artifacts, platform work, the 2026-08-28 verification-only proposal, and operating-system metadata.

## Change sources

| File | Role in the change |
| --- | --- |
| `docs/project-requirements.md` | Normative requirements v1.5 (SoT); local v1.5 corrections are included in this branch. |
| `docs/project-requirements-v1.2.md` | Baseline used to identify the v1.2 → v1.5 delta; newly added in this branch. |
| `docs/requirements-changelog-v1.2-to-v1.5.md` | Breaking-change index used by the proposal; inherited unchanged from the branch base. |

## Final Correct Course outputs

| File | Role in the change |
| --- | --- |
| `_bmad-output/planning-artifacts/sprint-change-proposal-2026-08-29.md` | Approved proposal and implementation record. |
| `_bmad-output/planning-artifacts/prds/prd-people-management-2026-08-24/prd.md` | Corrected People Management PRD. |
| `_bmad-output/planning-artifacts/prds/prd-user-management-2026-08-20/prd.md` | Corrected User Management PRD. |
| `_bmad-output/planning-artifacts/user-management/epics.md` | Corrected User Management epic/story plan. |
| `_bmad-output/implementation-artifacts/user-management/sprint-status.yaml` | Reconciled User Management sprint tracker. |

## Architecture resolution follow-up

| File group | Role in the change |
| --- | --- |
| `_bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md` and `.memlog.md` | Binding AD-19/AD-20 architecture decisions and their decision history. |
| `docs/architecture/{README,access-control,api-conventions,database-schema,domain-driven-design,testing-strategy}.md` | Rendered binding rules reconciled to the spine. |
| `_bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-19/reviews/review-cc04-cc06-{rubric,adversarial,reality,resolution}.md` | Review evidence and the resolution gate for CC-04/CC-06. |

## Exclusions

- `_bmad-output/planning-artifacts/sprint-change-proposal-2026-08-28.md` is verification-and-triage only; it did not apply the final BA corrections.
- All other local changes require their own review and are not claimed by this Correct Course package.
