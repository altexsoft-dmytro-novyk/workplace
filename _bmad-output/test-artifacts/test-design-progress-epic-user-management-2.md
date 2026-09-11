---
runScope: 'epic'
runKey: 'epic-user-management-2'
epicId: 'UM-E2'
epicDomain: 'user-management'
epicNumber: '2'
epicSourcePath: '_bmad-output/planning-artifacts/user-management/epics.md'
epicSourceHeading: '### Epic 2: Magic-Link Authentication'
workflowStatus: 'generated'
approval: 'ungranted'
validation: 'NOT RUN'
totalSteps: 5
stepsCompleted:
  - 'step-01-detect-mode'
  - 'step-02-load-context'
  - 'step-03-risk-and-testability'
  - 'step-04-coverage-plan'
  - 'step-05-generate-output'
lastStep: 'step-05-generate-output'
nextStep: 'document generation is complete; no Create step remains; proceed with human review, then choose Validate, Edit, or a fresh Create'
lastSaved: '2026-09-10'
baselineCommit: '76a7220701ac6f16843dad8b303934f9a958b54c'
backendPin: 'f1eea3c048821011da96fba20d9b517f7d0e4f1b'
frontendPin: 'fa3d3198aa9921c26d22307542ab72834a03b899'
planPath: '_bmad-output/test-artifacts/test-design-epic-user-management-2.md'
---

# Test Design Progress — Epic UM-E2, Magic-Link Authentication

> ## Status: **generated, ungranted, NOT validated.** This is a new run and inherits nothing.
>
> - **Approval:** ungranted. No human has approved this run or the plan it records.
> - **Validation:** NOT RUN. No verdict of any kind is claimed here, and no epic validation
>   report exists for this epic. `test-design-validation-report-epic-user-management-2.md` is
>   written only when this epic is actually validated.
> - **Coverage:** none asserted. **No pass rate appears anywhere in this file.**
> - **`workflowStatus: 'generated'` means the plan document was written.** It does not mean it
>   was validated and it does not mean anyone approved it. Those are three different states,
>   and this checkpoint asserts only the first.
>
> This run does **not** resume or inherit state from the 2026-09-06 `runKey: 'user-management'`
> or `runKey: 'frontend'` runs. Those were **domain**-scoped and **area**-scoped runs, not epic
> runs; a `runKey` mismatch is not resumable. Read them at
> [`test-design-progress-user-management.md` at `76a7220`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/_bmad-output/test-artifacts/test-design-progress-user-management.md) and
> [`test-design-progress-frontend.md` at `76a7220`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/_bmad-output/test-artifacts/test-design-progress-frontend.md). Their citation of a dated coverage matrix "as of commit
> `1edec31`" is a correctly anchored historical statement and is **not** repointed here.

## Run identity

| Field | Value |
| --- | --- |
| `runScope` | `epic` |
| `runKey` | `epic-user-management-2` |
| Canonical `epicId` | `UM-E2` |
| Epic title | Magic-Link Authentication |
| Domain | `user-management` |
| Number | `2` |
| **Source epic ID and path** | `UM-E2` in `_bmad-output/planning-artifacts/user-management/epics.md`, heading `### Epic 2: Magic-Link Authentication` |
| Plan produced | `_bmad-output/test-artifacts/test-design-epic-user-management-2.md` |
| Stories in scope | `UM-E2-S2.1` request a magic link by work email · `UM-E2-S2.2` consume a magic-link token to establish a session |
| Mode | Create (test-design consolidation migration, plan Task 3) |
| Date | 2026-09-10 |
| Baseline commit | `76a7220701ac6f16843dad8b303934f9a958b54c` (backend `f1eea3c0…`, frontend `fa3d3198…`) |
| Approval | **ungranted** |
| Validation | **NOT RUN** |
| Coverage claimed | **none** |

**The epic identity is reused verbatim from its canonical source. Nothing is renumbered**, and
no ClickUp mapping is touched. The `epic-{domain}-{number}` form exists because bare epic
numbers repeat across domains — Epic 1 exists in at least ten of the twelve domain sources — so
a bare number is not an identity.

## Inputs, by path and content hash

`shasum -a 256`, computed in the migration worktree (branch
`docs/2026-09-10-test-design-consolidation`, created from `76a7220…`) at the moment this
checkpoint was written.

| Input | SHA-256 |
| --- | --- |
| `_bmad-output/planning-artifacts/user-management/epics.md` (canonical epic source) | `18c5fcbeb7b167325efac08bcba0f4277d979305c8b403f87302899b31377769` |
| `_bmad-output/test-artifacts/test-design/migration-map.md` (disposition ledger) | `21ee95fa8d8c646deac951d821844d0a2edc7e44556df3d1ed32f8134a92c8ec` |
| `docs/project-requirements.md` (v1.5, normative) | `495017d0bc2f1c01ae5c7b1cdd6d4753f9c32410eb2ba1e2e3ca88003f4bf0d8` |

The shared platform rules this plan references, rather than restates, are
`_bmad-output/test-artifacts/test-design-architecture.md` and `…/test-design-qa.md`. Their
hashes are recorded once, in `test-design-validation-report.md` § Evaluated inputs.

## Output of this run

| Output | SHA-256 (re-recorded 2026-09-11 — see the note below) | Approval | Validation |
| --- | --- | --- | --- |
| `_bmad-output/test-artifacts/test-design-epic-user-management-2.md` | `45122abb66ef95e3f33ca97734bc70f4c3e4be6a1bacf01778f3ceeeab0d7219` | ungranted | NOT RUN |

> **Hash re-recorded 2026-09-11.** This column previously read *"SHA-256 at the moment this
> checkpoint was written"* and held `2705e61413ec42863847a3053c1cb3dd6ad241f9d5940fffc5e7c46cfa556e36`, which was correct for the plan as it
> stood at `a86df68`, when this checkpoint was written (2026-09-10). `acbe7d2` (*docs(test-design):
> resolve U-12 with DEV decision, cite unmerged implementation*) then edited the plan and the hash
> was not re-recorded, so `npm run test:test-design-routing` reported `plan-hash-drift`.
> The original value is preserved in this note and in git history. **Nothing else about this
> checkpoint changes:** approval stays `ungranted`, validation stays `NOT RUN`. This re-record
> accounts for an edit; it does not review or bless it.

## What this run did not do

- It executed no test, and reports no pass rate and no coverage percentage.
- It issued no validation verdict and granted no approval.
- It changed no scenario document, stored execution result, trace or coverage JSON, sprint
  status, ClickUp mapping, product requirement, service file or service gitlink.
- It resolved no open decision. The register is `test-design/migration-map.md` §10.

## Next step

**Human review, then a separate Validate run scoped to this epic.** An epic Validate run writes
`test-design-validation-report-epic-user-management-2.md` and **never** overwrites the system
report at `test-design-validation-report.md`. Neither has happened.
