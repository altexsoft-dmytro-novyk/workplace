---
topic: Epic coverage review — are all product requirements covered by epics?
skill: bmad-review
lens: adversarial
date: 2026-09-03
scope: 11 `*/epics.md` slices, prd-people-management-2026-08-24, global-fr-epic-story-coverage.yaml, docs/project-requirements.md v1.5
verdict: no — 3 real gaps, 3 recorded deferrals, 1 structural blind spot (now closed)
---

# Epic coverage review — 2026-09-03

> **Epic-number migration (2026-09-09).** `platform/epics.md` and `user-management/epics.md` each carried two epics under one number. The renumbering was: platform *Project-Line Audience* `PLAT-E4-S4.1`…`S4.4` → `PLAT-E8-S8.1`…`S8.4` (sprint keys `4-n-…` → `8-n-…`), and user-management *Custom Fields as Data* `UM-E6-S6.1`…`S6.3` → `UM-E8-S8.1`…`S8.3` (sprint keys `6-n-…` → `8-n-…`). Platform **Epic 4 — Access Control Authorization Consolidation** and user-management **Epic 6 — Current-State Read Endpoints** kept their numbers. Old IDs below are correct for the date they were written; read them through this map. Full map: `docs/superpowers/plans/2026-09-09-epic-number-collision-audit.md`.

## Addendum — closed the same day

While this review was being written, a `bmad-create-epics-and-stories` re-entry closed all
three gaps below, and the coverage model was updated to match. The findings are kept as
written — they are what the model looked like when the review ran — and this addendum records
the outcome.

| Gap | Now | Owning epics |
|---|---|---|
| `PM-FR-5` | `specified` | `UM-E6` (storage + declared visibility), `UM-E7` (anti-inference completion) |
| `PM-FR-6` | `specified` | new `role-administration` slice — `RA-E1`, `RA-E2` (gated on `OQ-PERM-01`) |
| `PM-FR-9` | `specified` | `PMC-E4` |

`RA-E*` is registered in `namespace_rules` and `source_slices` as `bounded-context-slice` —
not draft, because the code lives inside the already-AD-5-confirmed `access-control` context.
PRD §0.2 gained the Role Administration row and §13 was updated for all three.

Rollup moved from `in-progress` 5 · `specified` 30 · `uncovered` 3 · `deferred` 4
to `in-progress` 5 · `specified` 33 · `uncovered` 2 · `deferred` 2. The remaining `uncovered`
two are `PM-FR-16` and `PM-FR-17`, epic-assigned to `PMC-E3` and deliberately story-uncovered
by ruling PMC SD-7; the remaining `deferred` two are `PM-FR-38` (`[GOOD TO HAVE]`) and
`PM-FR-39`. `verify-coverage.py` passes all checks over 12 registered slices.

**Still open from this review:** the stale `REGISTRATION GAP` block, the uneven draft-status
disclosure, the two identifier collisions in `user-management/epics.md`, check 7's heading
regex, and the absence of NFRs from the model. None of those were touched.

Not closed by the decomposition pass: the S10/S11 colleague-narrowing, S7/S8 flag, and S1
derived-field-immutability portions of the historical `FR-17` "Profile Projection" placeholder.
They remain a recorded gap under the model's `PM-FR-4` aliases rather than being absorbed by
Epic 6/7's existence.

## Question

Is every canonical product requirement `PM-FR-1`..`PM-FR-42` covered by an epic?

## Answer

**No.** Four requirements have neither an epic nor a story; three have an epic but
deliberately no stories.

| Class | Requirements | Count |
|---|---|---|
| No epic, no stories | `PM-FR-5`, `PM-FR-6`, `PM-FR-9`, `PM-FR-38` | 4 |
| Epic assigned, no stories (deliberate) | `PM-FR-16`, `PM-FR-17` (`PMC-E3`), `PM-FR-39` (`PLAT-E7`) | 3 |
| Story coverage entirely inside a non-final slice | 17 requirements | risk |

`PM-FR-38` is `[GOOD TO HAVE]` under §5.2 and out of MVP by `prd.md` §6.2 — legitimate.
The three epic-assigned requirements carry recorded rulings with named unblock triggers.
The three requirements below are the real gaps.

## The three gaps

### `PM-FR-6` — runtime functional role administration

`deferred`, no epic, no stories, gated on `OQ-PERM-01`. It is simultaneously:

- **in MVP scope** — `prd.md:616` §6.1: "Runtime functional role administration (FR-6, FR-7)";
- **a Definition of Done item** — `docs/project-requirements.md` §9: "a new functional role can be
  created and granted permissions through the UI, without a deploy";
- **normative** — §2.3, marked `[NORMATIVE]`.

`PM-FR-7` (the sibling in the same §6.1 sentence) has three `UM-E4` stories. `PM-FR-6` has none.
`prd.md` §13 discloses it as `deferred` without reconciling against §6.1.

**Fix:** either give `PM-FR-6` an owning epic behind `OQ-PERM-01`, or remove it from §6.1 and
§9 by a dated product decision. `OQ-PERM-01` is one of the five approval-closable blockers, and
a drafted default role-to-permission matrix already exists at
`architecture/decision-package-five-open-blockers-2026-09-03.md`.

### `PM-FR-9` — permission-safe inline directory editing

`uncovered`. No epic, no stories, **no gate, no notes, and no recorded deferral decision** — the
only requirement in the model with no trace of a reason. The sole rationale lives in another
slice's scope statement, `platform-capabilities/epics.md:37`: "EXPERIENCE.md records **No surface**;
prototype table is read-only".

Inline editing is a normative bullet of `docs/project-requirements.md` §4.1, and §6.1 puts the
directory in MVP. The absence of a UX artifact is not a product decision to drop a normative
requirement.

**Fix:** record a decision with a date and an owner — deferral behind a gate, or an owning epic.

### `PM-FR-5` — custom-field visibility in reads, filters, and columns

`deferred`, no epic, no stories, no gate. The gate absence is **deliberate and recorded**:
`.memlog.md` logs "Removed live OQ-114/OQ-115/CC-05 gates after PM/AD-32/33/28", and the note
binds the visibility rule to PM/AD-32. So the deferral itself is sound.

What is not sound is the undeclared dependency on it:

- `PM-FR-8` is `specified`, but its own note says the custom-field clause "is carried only by
  `PMC-E1-S1.8`, which depends on `PM-FR-5` (deferred, no stories)".
- `PM-FR-3` cannot reach `implemented` while `PLAT-E6-S6.6` (S16) is open, and S6.6 "is blocked
  on `PM-FR-5`, which is deferred with no stories and no owner".

Both dependencies exist only as prose in `notes`. Nothing mechanical carries them, so `PM-FR-8`
reads as fully specified and `PMC-E1-S1.8` can be pulled into a sprint with its dependency intact.

**Fix:** an FR→FR dependency edge in the model, or the dependency restated as a gate on the two
stories that carry it.

## What was structurally invisible

`epics:` was populated on **7 of 42** requirements. Epic-level coverage was recoverable only by a
reader parsing story-ID prefixes, and no check required a `specified`-or-better requirement to
name an epic. `verify-coverage.py` printed `ALL CHECKS PASS` while being unable to answer the
question this document asks.

Closed on 2026-09-03:

- `epics:` filled for all 42 requirements from `stories[]` plus prior explicit values. Only the
  `epics` key changed; every other field is byte-identical. `PM-FR-3` gained `UM-E0`, which its
  `UM-E0-S0.1` story had always implied.
- Three new checks in section 5 of `verify-coverage.py`: every requirement declares `epics[]`;
  every `specified`/`in-progress`/`implemented` requirement names an epic; `epics[]` is never
  narrower than the epics its stories imply.
- Two new INFO lines: epic-assigned-but-story-uncovered requirements, and requirements whose
  entire story coverage sits in a non-final slice.
- Completeness rules added to `README.md`.

## Remaining findings — not fixed, they need a decision

### Slice maturity is disclosed unevenly

Slice status as read from each epic file's frontmatter:

```
PLAT final · PMC final · RS final · ENG final · RISK final · TT final
UM none · M draft · FB draft · CDS draft · PSH draft
```

17 of 42 requirements have their entire story coverage inside a non-final slice:
`PM-FR-4, 7, 12, 13, 14, 27, 28, 29, 30, 31, 32, 33, 34, 35, 40, 41, 42`.

- `prd.md` §0.2 and §13 disclose `draft` for **cds**, **profile-sharing** and **mentorship** only.
  **feedback** is `status: draft` and its §13 row (`PM-FR-35`) says plain `specified`.
- `user-management/epics.md` has **no `status:` field at all** and `stepsCompleted: [1, 2, 3]` —
  step 4 (cohesion and validation) never ran. It is the sole owner of `PM-FR-4`, `7`, `29`, `40`,
  `42` and co-owner of `12`, `13`, `28`, `41`. §13 reports all of them without qualification.

### Stale blocking text in `platform-capabilities/epics.md:33`

The block "REGISTRATION GAP (must be closed before this slice enters a sprint)" asserts that
`PMC-E*` is not a registered namespace and that the coverage model declares neither `PMC-E*` under
`namespace_rules` nor a `platform-capabilities` entry under `source_slices`. All three conditions
are now false — `prd.md:70` lists `PMC-E*`, and both model entries exist. `PMC-E1` (`PM-FR-8`,
`10`, `11`) is standing behind a blocker that has already been closed.

### Identifier collisions in `user-management/epics.md`

Two, both forbidden by the identifier rule in `prd.md` §0.2 and `README.md` ("Bare FR, Epic, and
Story numbers are ambiguous and must not appear in cross-product references"):

1. **NFR renumbering.** Its §NonFunctional Requirements block (lines 55–62) numbers §7 locally, and
   the numbers collide with the canonical `prd.md` §8 IDs:

   | In this file | Means | Canonical `prd.md` §8 ID |
   |---|---|---|
   | NFR-1 | personal data | NFR-2 |
   | NFR-2 | performance | NFR-3 |
   | NFR-3 | availability | NFR-4 |
   | NFR-4 | access-control correctness | NFR-1 |

   The story text "This makes NFR-4 concrete and testable" therefore reads, to anyone
   cross-referencing §8, as a claim about graceful degradation — a complete inversion.
   `mentorship/epics.md` avoids this correctly with `NFR-M1`..`NFR-M3`.

2. **~104 bare `FR-N` headings.** `FR-1:` … `FR-17:` are used as this slice's own requirement
   headings. The other ten slices use a bare `FR-N` only inside an explicit provenance citation
   attached to a namespaced ID (`**PM-FR-1** *[PRD §4.1 FR-1; requirements §2]*`), which is
   unambiguous. Here `FR-16`/`FR-17` collide with `PM-FR-16`/`PM-FR-17` (the Delivery Manager and
   Project Manager dashboards) and `FR-4` collides with `PM-FR-4`.

### Coverage of §7 and §8 is unverified by construction

`verify-coverage.py` check 7 matches headings with `^#{2,4}\s+(\d+(?:\.\d+)*)\s+`. The `\s+` cannot
match the `.` in `## 7. Non-functional requirements`, so **every top-level section of
`docs/project-requirements.md` is invisible to it** — 31 dotted subsections are checked, and §1,
§2, §3, §6, §7, §8, §9, §10 are not. The check nonetheless prints
"every normative section has >=1 requirement".

This is left unfixed deliberately: adding `\.?` makes the check FAIL immediately, because §7 and
§8 genuinely carry no `PM-FR-*`. That needs a product decision, not a regex edit. §8 Engineering
process requirements is marked `[NORMATIVE]` and its own text says the rules "are graded".

Related: **no NFR is in the coverage model at all.** `NFR-1`..`NFR-7` are asserted per-slice in
prose, with no rollup. `engagement/epics.md:127` explicitly declines NFR-3 for the risk dashboard;
nothing anywhere confirms which slice does carry each NFR, so an NFR claimed by no slice is
undetectable.

## Recorded and accepted — no action

- `PM-FR-16`, `PM-FR-17`: `PMC-E3` exists with no stories by ruling PMC SD-7, because acceptance
  criteria for the project axis would be written against a data model that does not exist while
  `TT-IDENTITY-01` (P0) is open. Recorded as a Step 4 FAIL in the PMC slice and accepted as such.
- `PM-FR-39`: `PLAT-E7-S7.3` evaluates the AD-28 overlay and creates no grant, revoke or seeding
  path. `STAYS DEFERRED` is explicit in the model; completing `PLAT-E7` does not change it.
- `PM-FR-38`: `[GOOD TO HAVE]` §5.2, out of MVP by §6.2.
