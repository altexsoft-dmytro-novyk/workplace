# Closed gap — platform Epic 4 (Consolidation) in the FR coverage model

**Status:** CLOSED 2026-09-09 by a dedicated coverage follow-up.
**Raised by:** step 2 of `2026-09-09-epic-number-collision-repair.md`.
**Source finding:** AMBIGUITY-6 in
`2026-09-09-epic-number-collision-audit.md`.

## Resolution

The collision repair correctly recorded this issue without changing coverage.
The follow-up then evaluated the requirement and delivery evidence and made the
coverage decision separately:

| Question | Decision |
|---|---|
| Is Consolidation an owner of `PM-FR-3`? | **Yes.** Story 4.1 replaces per-section predicates with the section-parameterised `canAccessSection` gate and human section keys; Story 4.2 delivers the seed/overlay and ordinary audience path used by that decision. This is implemented hardening of the matrix enforcement requirement. |
| Story status in coverage | Both `PLAT-E4-S4.1` and `PLAT-E4-S4.2` are `implemented`, matching their `done` tracker entries and recorded backend evidence. |
| Requirement status | `PM-FR-3` remains `in-progress`. Epic 6, Epic 7, S16, `AC-S9-S13`, and `AC-SECTION-MATRIX-01` remain open; implemented Epic 4 stories do not close the whole FR. |
| NFR model shape | `NFR-AC-*` remains slice-local. The global model intentionally inventories exactly 42 `PM-FR-*` requirements; adding NFR rows would violate that model contract. |
| NFR-AC-1 claim | The platform-local map now includes `PLAT-E4` with an explicit unresolved re-baseline obligation. No performance/NFR closure is claimed. |
| Story identity | The epic body now declares `PLAT-E4-S4.1` and `PLAT-E4-S4.2` literals and their existing sprint keys. Historical `PLAT-E4-S4.1a`…`S4.2d` values remain valid child increment IDs, not collisions. |

## Changed surfaces

- `platform/epics.md` local `PM-FR-3` and `NFR-AC-1` rows;
- `global-fr-epic-story-coverage.yaml` `PM-FR-3.stories[]` and
  `PM-FR-3.epics[]`;
- `global-coverage/.memlog.md` with the ownership/status decision;
- the Consolidation epic/story identity and delivered status in
  `platform/epics.md`.

## Evidence boundary

This closes the coverage-model omission, not every requirement behind it.
`PM-FR-3` remains `in-progress`, and Epic 4's performance re-baseline remains
unresolved. No live service, ClickUp, or production verification was performed
as part of this documentation follow-up.
