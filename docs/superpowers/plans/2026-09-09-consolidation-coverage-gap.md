# Recorded gap — platform Epic 4 (Consolidation) is absent from the FR coverage model

**Status:** RECORDED, NOT CLOSED. No coverage row, `coverage_status`, `epics[]`, `stories[]`
or `gates[]` entry was added or changed by the pass that produced this file.
**Raised by:** step 2 of `2026-09-09-epic-number-collision-repair.md` (epic-number-collision repair), 2026-09-09.
**Source finding:** AMBIGUITY-6 in [2026-09-09-epic-number-collision-audit.md](2026-09-09-epic-number-collision-audit.md).
**Owner needed:** a coverage pass. This is explicitly **out of scope** for the renumbering,
per the repair plan's *Уточнення після аудиту* §4 — adding a coverage reference is not a
free edit, because it needs an ownership/evidence decision the renumbering has no basis to make.

## The gap

`platform/epics.md` declares, for **Epic 4 — Access Control Authorization Consolidation**:

> **FRs covered:** PM-FR-3 (hardening), NFR-AC-1

Neither claim is represented anywhere in the coverage model. Verified 2026-09-09 against
the post-renumbering tree:

| Surface | What it says | Contains Consolidation? |
|---|---|---|
| `platform/epics.md` FR Coverage Map, `PM-FR-3` row | `PLAT-E3, PLAT-E6, PLAT-E7` | **no** |
| `platform/epics.md` FR Coverage Map, `NFR-AC-1` row | `PLAT-E3, PLAT-E5, PLAT-E6, PLAT-E8` | **no** |
| `global-fr-epic-story-coverage.yaml`, `PM-FR-3.epics[]` | `PLAT-E3, PLAT-E6, PLAT-E7, UM-E0` | **no** |
| `global-fr-epic-story-coverage.yaml`, any `stories[]` | no `PLAT-E4-S4.*` entry exists | **no** |
| `global-fr-epic-story-coverage.yaml`, any `epics[]` | no `PLAT-E4` reference exists | **no** |
| `global-fr-epic-story-coverage.yaml` requirements | `NFR-AC-1` is not a modelled requirement at all | n/a |

A secondary observation, recorded because a coverage pass will hit it immediately: the two
Consolidation stories carry **no `PLAT-E4-S4.n` ID literal** in `platform/epics.md` at all
(their headings are `### Story 4.1` / `### Story 4.2` with no `**ID:**` line), unlike every
post-kernel story. So the epic is invisible to `verify-coverage.py` check 4 in both
directions, and closing this gap means deciding whether those stories get ID literals too.

## Why it is not the renumbering's to fix

1. **It is pre-existing, not created here.** Before 2026-09-09 the string `PLAT-E4` appeared
   in the FR Coverage Map only in rows whose referent was *Project-Line Audience*. The
   collision made the Consolidation epic look covered when it was the other Epic 4 that was
   listed. Renumbering Project-Line to Epic 8 removed the disguise; it did not remove coverage.
2. **Closing it would change FR coverage status**, which the repair plan forbids
   (*Обмеження*: "Не змінювати acceptance criteria, FR coverage status, блокери").
   Adding `PLAT-E4` to `PM-FR-3.epics[]` is an ownership assertion, and adding
   `stories[]` rows would require picking a `status` for two `done` stories — which is
   exactly the `specified` ≠ `done` conflation the plan warns against.
3. **`NFR-AC-1` has no row to add to.** Deciding whether NFR-AC-* belongs in this model is a
   model-shape question, not a numbering question.

## What a coverage pass has to decide

- Does Consolidation's "PM-FR-3 (hardening)" claim make it a `PM-FR-3` coverage owner, or is
  hardening of an already-owned FR not itself coverage? (`PM-FR-3` is `in-progress` and gated
  on `AC-S9-S13` and `AC-SECTION-MATRIX-01`; both stay open regardless.)
- If yes: which `status` do `4-1-generalise-section-access-authorisation` and
  `4-2-default-org-relationship-seed` carry in the coverage model? Both are `done` in
  `platform/sprint-status.yaml` with backend evidence `37a3aa3`, `b311589`, `ef03c88`,
  `4ce8bd8`, `8ec35fd`, `de508c9` — but `PM-FR-3` must **not** be promoted to `implemented`
  while S16 is open.
- Whether `NFR-AC-1` (and `NFR-AC-2`/`NFR-AC-3`) should become modelled requirements.
- Whether the Consolidation stories should be given `PLAT-E4-S4.n` ID literals in `epics.md`,
  and if so how they coexist with the historical `PLAT-E4-S4.1a`…`S4.2d` sub-increment IDs
  already load-bearing across eight spec files, two story files and the test corpus
  (AMBIGUITY-2 — any future uniqueness guard must treat those as legitimate, not as collisions).
