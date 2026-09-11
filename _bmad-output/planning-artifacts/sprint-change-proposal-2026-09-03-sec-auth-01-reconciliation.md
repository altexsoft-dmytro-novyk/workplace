---
status: approved
trigger: cross-branch documentation drift on SEC-AUTH-01 / TT-IDENTITY-01
scope: minor
updated: 2026-09-03
---

# Sprint Change Proposal — SEC-AUTH-01 Documentation Reconciliation

## 1. Issue Summary

`SEC-AUTH-01` (P0, `blockers.yaml`) is documented as `status: open` on the `docs/ux-reconciliation-and-platform-capabilities` branch (this branch), and its "current fact" narrative is accurate here — the checked-out `services/backend` submodule (branch `acm3-cap1-stage2`) still contains both `interim-session-resolver.adapter.ts` and `interim-access-control.adapter.ts`.

A sibling branch, `dn-um-implementation` (services/backend + workplace), independently deletes both interim adapters and replaces them with `jwt-session-resolver.adapter.ts` (real JWT session verification; the `Bearer <token:persona>` dev shorthand and `Root` self-provisioning survive only behind `ALLOW_TEST_SESSION_TOKENS`, refused in production) and `access-control-facade.adapter.ts` (`isAllowedForTarget` now resolves real per-feature audience/section checks instead of `Boolean(userId)`). This satisfies `blockers.yaml`'s own `closure_condition` for `SEC-AUTH-01`: *"Interim adapters fail closed, or are removed from the production module."*

`docs/ux-reconciliation-and-platform-capabilities` and `dn-um-implementation` diverged from a common ancestor (`a9c6873`) — neither is an ancestor of the other — and both branches independently touch the same architecture documents (`blockers.yaml`, `ARCHITECTURE-RATIFICATION.md`, `transition-debt.yaml`). Left unreconciled, merging `dn-um-implementation` risks a textual/semantic conflict between "this blocker is open" (this branch, 9 downstream epics.md files, `global-fr-epic-story-coverage.yaml`) and "this blocker's code fix landed" (the other branch), discovered only at merge time.

Checked in the same pass: `TT-IDENTITY-01` (the other P0 heavily cited across slices) has **no** corresponding code change on `dn-um-implementation` — it remains genuinely open, no reconciliation needed.

Discovered via manual cross-branch code review (this session), not a failing story or test.

## 2. Impact Analysis

**Epic impact:** none. No epic's scope, acceptance criteria, or sequencing changes. This is a precondition-annotation correction only.

**Story impact:** none directly. Dozens of individual `**Gates:** ..., SEC-AUTH-01, ...` story-level citations across the 9 slices are left untouched — they cite the ID accurately regardless of this branch's resolution status.

**Artifact conflicts:**
- `blockers.yaml` — `SEC-AUTH-01` entry: `status_note` added.
- `transition-debt.yaml` — `TD-02` entry: `status_note` added.
- `ARCHITECTURE-RATIFICATION.md` — §5 P0/P1 transition risks: one sentence appended, existing description not rewritten (it remains accurate for this branch's code).
- `.memlog.md` (ratification package): one `(event)` entry appended.
- 9 `epics.md` files (`profile-sharing`, `resourcing`, `platform-capabilities` ×3 locations, `timetracker`, `platform`, `cds`, `engagement`, `risk`): one pointer sentence appended to each SEC-AUTH-01 narrative row/paragraph. `user-management/epics.md`'s sole mention is a design-caution example (not a status claim) and was deliberately left untouched.
- `global-fr-epic-story-coverage.yaml`: **no change** — its 9 `gates: [...]` entries only cite the bare ID `SEC-AUTH-01`, they don't editorialize about current behavior, so nothing there is stale.

**PRD / Architecture / UX:** no conflicts. This does not touch requirements, decisions, or UX contracts.

**Technical impact:** none — documentation only, no application code touched by this pass.

## 3. Recommended Approach

**Direct Adjustment** (Option 1) — append evidence pointers everywhere the blocker is characterized as a live precondition, without flipping `status` to `closed` and without rewriting any existing (still-accurate) description.

**Rationale for not closing the blocker outright:**
- The evidence lives on an unmerged, unreviewed branch.
- This project closes P0 blockers only through its own verification process (cf. `QUALITY-GATE-AC`, closed against an independently-evaluated [`gate-decision.json`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/a62e705/_bmad-output/test-artifacts/gate-decision.json) (`PASS` at `a62e705`)) — nothing here has gone through that.
- `TD-02`'s `deploy_gate` is explicitly independent of the code fix itself — deployment-readiness and defect-fixed-in-diff are different questions.

**Effort:** Low (12 targeted edits, all additive). **Risk:** Low (no rewritten content; `verify-coverage.py` re-run confirms all 7 validator sections still `PASS`).

## 4. Detailed Change Proposals

### Canonical registry (4 edits)

| File | Change |
|---|---|
| `architecture/architecture-people-management-ratification-2026-09-02/blockers.yaml` | Added `status_note` to `SEC-AUTH-01` citing `dn-um-implementation` evidence; `status: open` unchanged |
| `architecture/architecture-people-management-ratification-2026-09-02/transition-debt.yaml` | Added `status_note` to `TD-02` pointing to the same evidence |
| `architecture/architecture-people-management-ratification-2026-09-02/ARCHITECTURE-RATIFICATION.md` | Appended one sentence after the existing SEC-AUTH-01 paragraph (§5), pointing to the new `status_note` |
| `architecture/architecture-people-management-ratification-2026-09-02/.memlog.md` | Appended one `(event)` entry recording this pass, per this project's append-only memlog convention |

### Downstream epics.md pointer notes (9 files, 10 locations)

Each gets the identical appended sentence:

> *(2026-09-03 correct-course note: implementation evidence exists on the unmerged `dn-um-implementation` branch — see `blockers.yaml` `status_note`. Not yet merged or independently verified; this precondition stays open.)*

Locations: `profile-sharing/epics.md:73`, `resourcing/epics.md:64`, `platform-capabilities/epics.md:60,80,147`, `timetracker/epics.md:71`, `platform/epics.md:198`, `cds/epics.md:78`, `engagement/epics.md:81`, `risk/epics.md:94`.

**Deliberately not touched:** every bare `**Gates:** ..., SEC-AUTH-01, ...` story-level citation (dozens, across all 9 files) — these cite the ID only and make no behavioral claim. `user-management/epics.md:142`'s mention (a design-caution example against repeating the `Boolean(userId)` anti-pattern) — not a status claim. `global-fr-epic-story-coverage.yaml`'s 9 `gates:` list entries — bare ID citations only.

## 5. Implementation Handoff

**Scope classification: Minor.** All 12 edits are additive documentation annotations with no epic, story, PRD, or code impact. Applied directly in this session; no further Developer/PO/Architect handoff is required for *this* pass.

**Follow-up owned outside this proposal (not blocking, flagged for awareness):**
- When `dn-um-implementation` is reviewed for merge, whoever owns `blockers.yaml` should run this project's actual verification process against the branch (the `QUALITY-GATE-AC` pattern) before flipping `SEC-AUTH-01` / `TD-02` to `closed`.
- `TT-IDENTITY-01` remains open with no code-side movement — no action needed from this pass, recorded here only because it was checked in parallel.

## Verification

`python3 global-coverage/verify-coverage.py` re-run after all edits: **ALL CHECKS PASS** (all 7 sections, including gate-ID resolution against `blockers.yaml`). Both edited YAML files (`blockers.yaml`, `transition-debt.yaml`) parse cleanly.
