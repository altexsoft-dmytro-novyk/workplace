---
title: 'PLAT-E2/E3 Status-Surface Correction'
type: 'bugfix'
created: '2026-09-12'
status: 'in-review'
review_loop_iteration: 0
baseline_commit: '9c5fef843da221e557afa2b45bec456234ae212e'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `platform/epics.md`'s *Kernel MVP status caveat* asserts `sprint-status.yaml` "still records `epic-3: in-progress` and `epic-2: in-progress`". The tracker records `done` for both, so the claim is false and contradicts the same paragraph's opening clause. The Epic 2 and Epic 3 `**Status:**` headers likewise read `in-progress` while the `**Tracker:**` they declare one line later says `done`.

**Approach:** Repair the canonical source: withdraw the false bullet, name the authoritative surface per epic, and make each header agree with its declared tracker — while leaving the one *genuine* divergence (coverage vs tracker on `PLAT-E2-S2.1`) explicitly recorded and open, since that is Story 1.1's subject, not this pass's.

## Boundaries & Constraints

**Always:**
- `sprint-status.yaml` is authoritative. Correct the document to the tracker, never the tracker to the document.
- State authority per epic in prose *before* changing any header.
- Preserve the caveat block's exact 6-line span (39–44) so no downstream line-number citation of `epics.md` shifts, and the trailing two-space hard break on every `**Status:**` line.

**Ask First:**
- Any change to `1-1-changelog-traceability-matrix`'s `backlog` status, or any claim Story 1.1 is complete.
- Any edit that would close the `PLAT-E2-S2.1` coverage divergence.

**Never:**
- Do not flip Epic 2's header to a bare `done` — that mechanically closes a deliberately-held open question.
- Do not touch `sprint-status.yaml`, `global-fr-epic-story-coverage.yaml`, `test-artifacts/**`, `docs/test-cases/**`, service code, gitlinks, or ClickUp.
- Do not produce the Story 1.1 traceability matrix; this is not that deliverable.
- Do not stage the parallel session's uncommitted files from the main checkout.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior |
|----------|--------------|---------------------------|
| Epic 3 | tracker `epic-3: done`; all `3-1`…`3-8` `done`; header `in-progress` | Header → `done`; caveat states Epic 3 is mechanically verified — no surface contradicts it |
| Epic 2 | tracker `epic-2: done`; coverage `:95` holds `PLAT-E2-S2.1: in-progress` deliberately | Header records the tracker **and** names the open reconciliation; divergence stays open |
| False bullet | caveat `:41` claims the tracker says `in-progress` | Withdrawn *in place* with the withdrawal stated, not silently deleted |
| Arithmetic | prose says "two tracking artifacts" / "one of the two tracking surfaces" | Recounted to the one surviving divergence |

</frozen-after-approval>

## Code Map

- `planning-artifacts/platform/epics.md:39-44` -- the caveat; **the only prose block to edit**. `:41` false (remove), `:42` correct (must survive), `:39`/`:44` carry the stale arithmetic.
- `planning-artifacts/platform/epics.md:403` / `:427` -- Epic 2 / Epic 3 `**Status:** in-progress  ` (trailing 2 spaces); `:404`/`:428` their `**Tracker:**`. Story ACs nearby are **not** touched.
- `implementation-artifacts/platform/sprint-status.yaml` -- **read-only evidence.** `:64` `epic-2: done`, `:65` `2-1-…: done`, `:68` `epic-3: done`, `:69-76` all eight `done`. `:41` `1-1-changelog-traceability-matrix: backlog` **must stay `backlog`**.
- `planning-artifacts/global-coverage/global-fr-epic-story-coverage.yaml:95` -- **read-only evidence.** `PLAT-E2-S2.1 … in-progress`; `:121-123` state the hold is deliberate pending Story 1.1.
- `planning-artifacts/platform/epics.md:1707` -- register row already recording the E2 conflict as "Left to Platform Story 1.1". Read-only; new caveat text must not contradict it.
- `test-artifacts/test-design-epic-platform-3.md:58-77` -- **read-only, protected.** Independently tabulates the four surfaces and calls the caveat "Factually false at this HEAD". This edit staleens its rows 2–3 and its "four surfaces" count. Under `docs/test-design-workflow-contract.md`, verdict CONCERNS, `approvalStatus: granted` → follow-up for a test-design Edit run.

## Tasks & Acceptance

**Execution:**
- [x] `planning-artifacts/platform/epics.md` -- replace `:39-44` with a 6-line block: intro (tracker authority, header fix, explicit withdrawal of the false claim), blank, bullet *Epic 3 — no divergence*, bullet *Epic 2 — disputed, recorded not resolved*, blank, closing (not an Epic 5–8 deliverable; do not close by flipping either surface; belongs to Story 1.1) -- removes a false assertion while preserving the surviving divergence and every downstream line number.
- [x] `planning-artifacts/platform/epics.md:427` -- Epic 3 `**Status:** done` -- tracker and all eight story keys agree.
- [x] `planning-artifacts/platform/epics.md:403` -- Epic 2 `**Status:** done (tracker) — coverage reconciliation open, see *Kernel MVP status caveat*` -- records the tracker without asserting the reconciliation is closed.
- [x] `implementation-artifacts/platform/deferred-work.md` -- append the test-design staleness follow-up -- that caveat describes a HEAD this commit changes, and it is under its own contract.

**Acceptance Criteria:**
- Given the caveat, when read after the edit, then no claim survives that `sprint-status.yaml` records `epic-2`/`epic-3` as `in-progress`, and `sprint-status.yaml` is named authoritative.
- Given Epic 2's header, when read, then it neither asserts a closed reconciliation nor contradicts `sprint-status.yaml:64`, and it points to the caveat.
- Given `sprint-status.yaml` and `global-fr-epic-story-coverage.yaml`, when diffed against HEAD, then both are byte-identical.
- Given the commit's `git diff --stat`, then only `epics.md`, `deferred-work.md` and this spec appear — no `test-artifacts/**` or `specs/**` path.

## Verification

**Commands:**
- `wc -l _bmad-output/planning-artifacts/platform/epics.md` -- expected: `1709` (unchanged)
- `awk 'NR>=37 && NR<=46' …/epics.md` -- expected: caveat within 39–44, `## Requirements Inventory` still at `:46`
- `grep -nE "epic-(2|3): in-progress" …/epics.md` -- expected: no matches
- `git diff HEAD -- …/sprint-status.yaml …/global-fr-epic-story-coverage.yaml` -- expected: empty
- `git diff --stat HEAD` -- expected: 3 files, none under `test-artifacts/` or `specs/`

**Manual checks:**
- Epic 2's header reads as a tracker record plus an open-item pointer, not as a closed reconciliation.
