# Briefing — coverage-chain connectivity fix

**Read this first. It is the shared context for every chain-fix task.**
Date: 2026-09-04 · workspace `0114d1c` · backend `25afb15`

## The problem in one paragraph

This repo has three layers: 42 canonical product requirements (`PM-FR-1..42`, in
`global-coverage/global-fr-epic-story-coverage.yaml`), epics/stories, and 387
acceptance-criteria scenario documents under `docs/test-cases/` with 386 tests behind them.
Top-down (`PM-FR` → epic → story) is verified by `global-coverage/verify-coverage.py`.
Bottom-up was never checked, and the scenario layer speaks a different dialect per area —
`AD-n`, `CAP-n`, bare `FR-n`, `§n.n` — none of which is `PM-FR-n`. Result: **317 of 387
scenario documents cannot be resolved to a canonical requirement.**

A new check 8 in `verify-coverage.py` now enforces the bottom-up direction and currently FAILs.
Closing it is the point of these tasks.

## What is NOT the fix

Do **not** rename scenarios, and do **not** rewrite their content. A requirement and a
scenario are different things — one requirement has many scenarios. The fix is to add the
owning `PM-FR-n` to the existing `**Trace:**` line of each scenario document. One line per
file. **No test file is touched by any of this** — the 652 scenario-ID references in tests
stay exactly as they are.

## Shared data (already computed — use it, do not re-derive)

- `chain-fix/doc-resolution-table.json` — all 387 docs: `path`, `area`, `cited` tokens,
  `resolved` (token → `PM-FR` list), `pm_fr`, and `status` ∈ `RESOLVED` | `UNRESOLVED` | `NO_TOKENS`.
- `chain-fix/alias-map.json` — the model's alias table (`UM-FR-16` → `[PM-FR-1, …]`).

Normalizations already applied when building the table, and documented in `verify-coverage.py`:
`FR-Mn → M-FR-n`; `FR-n → {UM,M}-FR-n` scoped by the document's own area.

Current state by area:

| Area | docs | RESOLVED | UNRESOLVED | NO_TOKENS |
| ---- | ---: | -------: | ---------: | --------: |
| `mentorship` | 27 | 27 | 0 | 0 |
| `user-management` | 107 | 43 | 24 | 40 |
| `access-control` | 171 | 0 | 0 | 171 |
| `access-control-kernel` | 73 | 0 | 0 | 73 |
| `access-control-foundation` | 9 | 0 | 0 | 9 |

## Hard rules — these are governance, not style

1. **Never edit `approvals.yaml`.** Those are human AD-1 approvals. An agent writing an
   approval destroys the control the ledger exists to provide.
2. **Never edit a test file** under `services/backend/`. Nothing here requires it.
3. **Never invent a `PM-FR` mapping.** If the answer is not derivable from the shared data or
   an explicit statement in a repo artifact, record it as a question for a human. A wrong
   alias is worse than a missing one — it manufactures traceability that does not exist.
4. **Do not change scenario wording**, headings, or the Given/When/Then. Add to the
   `**Trace:**` line only.
5. Stay inside the file set your own task names. Another agent owns the others.

## How to verify your work

```bash
cd _bmad-output/planning-artifacts && python3 global-coverage/verify-coverage.py
```
Check 8 names the unresolved count per area. Your area's count should drop by exactly the
number of documents you edited. No other check may regress.

## Background reading (optional)

- `_bmad-output/test-artifacts/chain-consistency-audit-2026-09-04.md` — how this was found
- `global-coverage/PROPOSED-chain-fixes-2026-09-04.md` — the proposal this work implements
