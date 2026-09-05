---
title: 'PLAT-E4-S4.1b — Section-key rename + matrix-driven resolveSectionAccess'
type: 'refactor'
created: '2026-09-05'
status: 'in-review'
review_loop_iteration: 0
baseline_commit: '5add6a12226a1c21b46b8f95a23cbd1b324f0d9d' # services/backend submodule HEAD; 4.1a's changes sit uncommitted on top (not committed per standing "do not commit" instruction)
context: ['{project-root}/docs/architecture/access-control.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `AccessControlFacade.resolveSectionAccess` hardcodes `'S1'`/`'S10'`/`'S11'` as section identifiers and branches per section — banned by the project's standing "section names are human" rule and by D4 of the SCP. `S10`/`S11` also skip the PRD's "strongest audience wins" merge that `S1`'s branch happens to implement ad hoc.

**Approach:** Rename the three keys to `'profile:identity'`/`'profile:leave'`/`'profile:projects'` everywhere in `services/backend/src` and `test/`, and replace the `if/else` with a `SECTION_ACCESS_MATRIX` lookup + strongest-wins fold (architect design, story file §4.1b) — a new section becomes a matrix row, never a new branch. Behavior for the three existing sections is unchanged; the fold additionally fixes `S10`/`S11`'s missing multi-audience merge for free.

## Boundaries & Constraints

**Always:**
- `canAccessSection`'s three matrix rows resolve byte-identical decisions to today's hardcoded branches for every existing test fixture — this is a rename + generalisation, not a policy change.
- No `'S1'`/`'S10'`/`'S11'` string is passed as a section identifier anywhere in `services/backend/src` or `test/` afterward (grep-clean); comments that reference the old keys descriptively are also updated (stale comments citing a since-changed contract are worse than no comment).
- `SECTION_ACCESS_MATRIX` lives in `domain/constants/`, alongside `DEFAULT_PERMISSIONS` (4.1a) — same seam, same ownership.
- Follow this project's AD-1 discipline: approved scenario-doc amendment before the red test, approved red test before code. Stop between each.

**Ask First:**
- None — the target shape was already fixed in the story file's architect pass; this spec only executes it.

**Never:**
- Never touch `canEditS1`, `EDIT_USER_FEATURE`/`READ_USER_FEATURE`, or the adapter's routing — that's 4.1c.
- Never rename the `docs/test-cases/.../acm5-sa-NN-*.md` **filenames** — those numeric slugs are stable workboard ids (like an `AD-n`, never renumbered); only their prose/section-identifier content changes to the human keys.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Renamed identity section | Self/Colleague audience, `'profile:identity'` | `'read'` (was `'S1'`→`'read'`) | N/A |
| Renamed identity section, manager | Reporting/PP audience, `'profile:identity'` | `'write'` (was `'S1'`→`'write'`) | N/A |
| Renamed leave/projects sections | Any Phase-0 audience, `'profile:leave'` / `'profile:projects'` | `'read'` (was `'S10'`/`'S11'`→`'read'`) | N/A |
| Legacy key now unsupported | `'S1'`, `'S10'`, or `'S11'` passed after rename | `'none'` — no longer magic strings, just unmatched matrix keys | N/A |
| Multi-audience strongest-wins | Viewer holds Reporting + Colleague over one target, any of the three sections | Resolves the row's strongest cell across all held audiences (`write` > `read` > `none`) | N/A |

</frozen-after-approval>

## Code Map

- `services/backend/src/access-control/domain/constants/section-access-matrix.ts` -- NEW. `SECTION_ACCESS_MATRIX` per the story file's 4.1b architect pass (3 rows, byte-identical to current branch outputs).
- `services/backend/src/access-control/application/access-control.facade.ts:67-94` -- replace `resolveSectionAccess`'s `if/else` with the matrix lookup + `RANK`-based fold.
- `services/backend/src/user-management/infrastructure/access-control-facade.adapter.ts:29` -- `S1_SECTION = 'profile:identity'`; update the two comments citing `'S1'` (lines 24, 79).
- `services/backend/src/user-management/infrastructure/career-timeline-access-facade.adapter.ts:32` -- update the INTERIM comment's `'S1'/'S10'/'S11'` mention.
- `services/backend/test/access-control/acm5-section-access.e2e-spec.ts` -- rename every literal key argument and test title; SA-06's unsupported-section example switches from `'S5'` to `'S1'`, explicitly locking the legacy-key-now-denies regression (a second arbitrary string stays covered by the same generic assertion, so no new `it` is needed).
- Comment-only edits (no behavior, no assertion changes): `test/user-management/access-control-adoption/write-adoption.e2e-spec.ts`, `read-adoption.e2e-spec.ts`, `test/user-management/epic-1/edit-identity.e2e-spec.ts`, `test/user-management/epic-4/manager-change.e2e-spec.ts`.
- `docs/test-cases/access-control-kernel/section-access/acm5-sa-{01..09}-*.md` -- prose-only edits (filenames unchanged, see Boundaries); this is the AD-1 scenario-doc amendment for this story.

## Tasks & Acceptance

**Execution:**
- [x] Amend the 9 `acm5-sa-*.md` scenario docs to the human keys (AD-1 stage 1) — STOP for approval before touching the test file.
- [x] Rewrite `acm5-section-access.e2e-spec.ts` to the human keys + SA-06's `'S1'`-as-unsupported-example change -- confirmed red (7/9 fail; SA-07/08 trivially pass either way) against today's unrenamed facade -- STOP for approval before touching implementation code.
- [x] `domain/constants/section-access-matrix.ts` -- add `SECTION_ACCESS_MATRIX`.
- [x] `access-control.facade.ts` -- matrix-driven `resolveSectionAccess`.
- [x] `access-control-facade.adapter.ts` + `career-timeline-access-facade.adapter.ts` -- rename + comment updates.
- [x] Comment-only updates in the four listed adoption/epic e2e files (larger surface than scoped — dozens of bare `S1` mentions in test titles/comments, not just a few lines; all renamed, verified no behavior change).

**Acceptance Criteria:**
- Given the renamed `acm5-section-access.e2e-spec.ts`, when run against the new code, then every case (including the `'S1'`-now-unsupported case) passes.
- Given a grep for `'S1'|'S10'|'S11'` as a quoted string across `services/backend/src` and `services/backend/test`, when run after this story, then zero matches remain.
- Given the existing `write-adoption`/`read-adoption`/`edit-identity`/`manager-change` e2e suites, when run unmodified in behavior, then they stay green (comment-only edits, no assertion changes).

## Design Notes

SA-06 reusing `'S1'` as its "unsupported string" example (instead of `'S5'`) is deliberate: it turns an already-approved generic scenario into the specific regression lock for "the legacy key must not silently keep working," at zero cost to the matrix count.

## Verification

**Commands (all run 2026-09-05):**
- `npm run test:e2e -- acm5-section-access` -- red before the code change (7/9 failed), 9/9 green after.
- `npm run test:e2e -- write-adoption read-adoption edit-identity manager-change` -- 49/49 green, unchanged.
- `npm run test:e2e -- test/access-control --testPathIgnorePatterns=acm1r-fr-foundation` -- 84/84 green (full context regression check, excluding the pre-existing unrelated `acm1r-fr-foundation` failures documented in 4.1a's spec).
- `npm run lint && npm run build` -- clean; same 12 pre-existing errors in untouched files as 4.1a, none in this story's files.
- `grep -rn "'S1'\|'S10'\|'S11'" src/ test/` -- 4 matches remain, all intentional: two historical comments noting the rename (`access-control-facade.adapter.ts`, `section-access-matrix.ts`), one docstring note, and SA-06's deliberate legacy-key regression assertion — zero matches used as a live section identifier anywhere else.
