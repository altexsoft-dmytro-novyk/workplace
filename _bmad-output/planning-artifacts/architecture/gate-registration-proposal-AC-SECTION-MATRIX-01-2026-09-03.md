# Gate registration proposal — `AC-SECTION-MATRIX-01`

**Date:** 2026-09-03
**Raised by:** planning (coverage-model triage of `gap-validation-2026-09-02.md`)
**Decision owner:** Architect / `access-control` — **this document changes nothing**
**Target file:** `architecture/architecture-people-management-ratification-2026-09-02/blockers.yaml`

> ## ✅ APPLIED 2026-09-03 — resolution **(a)**
>
> Approved by the decision owner and applied in full. `blockers.yaml` `revision:` bumped to `2026-09-03-section-matrix-gate-registration`.
>
> - **§4 registered** — `AC-SECTION-MATRIX-01` exists in `blockers.yaml` (31 entries), owner Access Control, P1 open, `blocks:` S2–S8 and S14–S16 naming S6, S8, S14, S15 explicitly.
> - **§6 resolved as (a)** — S12 stays with `AC-S9-S13`, whose `blocks:` list now names *CDS registry and CDS directory filters (S12)*. `platform`'s Gate binding table gained the S12 row it never had, and `PLAT-E6-S6.5` now carries **both** gates because it spans S12 (AC-S9-S13) and S14/S15 (AC-SECTION-MATRIX-01).
> - **§5 applied** — `PM-FR-21`, `PM-FR-22`, `PM-FR-26`, `PM-FR-35` repointed; their `GATE SCOPE DEFECT` annotations retired. `PM-FR-3` carries both. `platform`, `risk`, `feedback`, `engagement` and `cds` slices updated; every "proposed, unregistered" qualifier removed.
> - **Verified** — all coverage `gates:` IDs resolve in `blockers.yaml`; both YAML files parse.
>
> **Closing `AC-S9-S13` now unblocks S9, S12 and S13 only** — it must not be read as unblocking risk (S6), feedback (S8), action items (S14) or request history (S15). The reverse holds for `AC-SECTION-MATRIX-01`.
>
> The text below is the proposal as written before approval, retained unchanged as the decision record.

---

## 1. What is being asked

Two decisions, one of which is a genuine contradiction rather than a gap:

1. **Register `AC-SECTION-MATRIX-01`** in `blockers.yaml` so that profile sections **S2–S8** and **S14–S16** have a live gate. They have none today.
2. **Resolve which gate owns S12.** Three artifacts currently give three different answers.

---

## 2. Current state, verified

`AC-S9-S13` as registered:

| Field | Value |
|---|---|
| `severity` | P1 |
| `blocks` | `[Career timeline writes, Mentorship profile projection and closure-note visibility]` |
| `closure_condition` | *An approved AD-1 increment for **S9-S13**, then production evidence* |
| `implementation_status` | `absent` |
| `note` | *The facade returns 'none' for every section other than S1/S10/S11* |

**The `blocks:` field is narrower than the entry's own ID and closure condition.** The ID and closure condition span S9–S13; `blocks:` names only S9 (career timeline) and S13 (mentorship projection). S10 and S11 are already in the implemented kernel, which leaves **S12 inside the ID's range and outside its `blocks:` list**.

`platform/epics.md` states the resulting gap directly (SD-3, and the *Gate registration gap* section): `AC-SECTION-MATRIX-01` is *"proposed and unregistered — it does not exist in `blockers.yaml`"*, and registering it *"is a prerequisite to Epic 6 entering a sprint"*.

---

## 3. Scope of the defect — smaller and sharper than reported

`gap-validation-2026-09-02.md` recorded five over-stretched requirements. Re-checked against the model:

| Requirement | Section it needs gated | Carries `AC-S9-S13`? | In S9–S13 range? | Verdict |
|---|---|---|---|---|
| `PM-FR-3` | S2–S16 (owns the matrix) | yes | partly | ✅ legitimate — it is the gate's own requirement |
| `PM-FR-29` | S9 career timeline | yes | **yes** | ✅ legitimate |
| `PM-FR-32`, `33`, `34` | S13 mentorship | yes | **yes** | ✅ legitimate |
| **`PM-FR-21`, `PM-FR-22`** | **S6 risk** | yes | **no** | ❌ **over-stretched** |
| **`PM-FR-26`** | **S15 request history** | yes | **no** | ❌ **over-stretched** |
| **`PM-FR-35`** | **S8 feedback** | yes | **no** | ❌ **over-stretched** |
| `PM-FR-30`, `PM-FR-31` | S12 CDS | yes | **yes, by ID** | ⚠️ **contested — see §6** |

**Correction to the audit:** `PM-FR-19` was listed as over-stretched. It is not — its gates are `[OQ-PERM-01, SEC-AUTH-01, CC-06, CC-08, CC-09]` and it carries no `AC-S9-S13` reference at all. The action-item S14 concern is real but is not expressed as a gate today.

So the live defect is **4 requirements across 3 sections — S6, S8, S15** — not 5 across 4. Each already carries a `GATE SCOPE DEFECT` annotation in its coverage `notes:`, so nothing is silently wrong; the annotations are the workaround for an ID that cannot yet be cited.

---

## 4. Proposed `blockers.yaml` entry

Schema matches the neighbouring `AC-S9-S13` and `DEPARTMENT-EDGE` entries. **Values in `owner`, `severity` and `closure_condition` are the architect's to set** — what follows is a defensible default, not a decision.

```yaml
  - id: AC-SECTION-MATRIX-01
    owner: Access Control
    severity: P1
    blocks: [Section resolution for S2-S8 and S14-S16, Risk section S6, Feedback section S8, Request history section S15, Action items section S14]
    status: open
    design_status: target-approved-increment-not-approved
    implementation_status: absent
    depends_on: []
    decision_refs: [PM/AD-1]
    evidence:
      - docs/project-requirements.md
      - services/backend/src/access-control/application/access-control.facade.ts
      - _bmad-output/planning-artifacts/platform/epics.md
    closure_condition: >
      An approved AD-1 increment covering S2-S8 and S14-S16, then production evidence.
      Same shape and same evidence bar as AC-S9-S13; this entry exists because that one's
      declared scope is S9-S13 and cannot be stretched over the remaining sections.
    note: >
      Registered to close a gap, not to add a new constraint: the facade already returns
      'none' for every section other than S1/S10/S11, so these sections were always blocked
      - they simply had no ID to cite. Delivered by PLAT-E6 (S6.1-S6.6). Closing AC-S9-S13
      unblocks S9 and S13 only and must never be reported as unblocking any section here.
      Until this entry exists, PM-FR-21, PM-FR-22, PM-FR-26 and PM-FR-35 point at AC-S9-S13
      as a documented stand-in, because PLAT-E1-S1.1 requires every live gates: ID to resolve
      in this file and an unregistered ID would break that invariant.
```

---

## 5. Follow-on edits, valid only after §4 lands

Exact and mechanical — no judgement left in them:

| File | Requirement | Change |
|---|---|---|
| `global-fr-epic-story-coverage.yaml` | `PM-FR-21` | `gates:` `AC-S9-S13` → `AC-SECTION-MATRIX-01`; drop the `GATE SCOPE DEFECT` paragraph from `notes:` |
| " | `PM-FR-22` | same |
| " | `PM-FR-26` | same |
| " | `PM-FR-35` | same |
| `platform/epics.md` | SD-3, *Gate registration gap*, Gate binding table, Stories 6.3/6.4/6.5 | Drop *"proposed, unregistered"* qualifiers; the ID becomes citable |
| `risk/epics.md` | RSD-3, Story 1.1 gates, Step 4 check 7 | Replace the `AC-S9-S13` stand-in with the real ID |
| `feedback/epics.md`, `resourcing/epics.md` | slice preconditions | same |

`PM-FR-3` keeps `AC-S9-S13` **and** gains `AC-SECTION-MATRIX-01` — it owns the whole matrix, so both bind it.

---

## 6. The S12 question — a contradiction, not an omission

Three artifacts, three answers, one section:

| Artifact | What it says about S12 |
|---|---|
| `blockers.yaml` `AC-S9-S13` | **In range** by `id` and `closure_condition` (*"an approved AD-1 increment for S9-S13"*); **absent** from `blocks:` |
| `platform/epics.md` Story 6.5 (*"S12, S14, and S15"*) | Gated on **`AC-SECTION-MATRIX-01`** |
| `platform/epics.md` Gate binding table | Lists `S9, S13` → `AC-S9-S13` and `S2–S8, S14, S15, S16` → `AC-SECTION-MATRIX-01`. **S12 appears in no row** |
| `cds/epics.md` (inconsistency #2, #3) | Uses `AC-S9-S13` — the registered ID — and records that its `blocks:` list is owed a CDS entry |

This is not a labelling nicety. If §4 is registered with the `blocks:` list as proposed and S12 is left unaddressed, **closing `AC-S9-S13` will read as unblocking CDS while the S12 facade increment is still absent** — the precise failure mode SD-3 was written to prevent, arriving through the other gate.

**Two clean resolutions; pick one:**

- **(a) S12 belongs to `AC-S9-S13`.** Follows the ID and the closure condition. Amend that entry's `blocks:` to name CDS/S12 explicitly, and correct `platform/epics.md` Story 6.5 and the Gate binding table. `cds/epics.md` and the two CDS requirements are already consistent with this and need no change.
- **(b) S12 belongs to `AC-SECTION-MATRIX-01`.** Follows `platform`'s story-level intent. Add S12 to §4's `blocks:`, narrow `AC-S9-S13`'s `closure_condition` from *"S9-S13"* to *"S9 and S13"* so the ID stops over-claiming, and repoint `PM-FR-30` / `PM-FR-31`.

**(a) is the smaller change and is what the registered artifact currently says.** (b) requires editing a closure condition that has been cited in downstream work.

---

## 7. What stays blocked meanwhile

- **`PLAT-E6` cannot enter a sprint** — `platform/epics.md` makes registration an explicit prerequisite.
- **`PM-FR-21`, `PM-FR-22`, `PM-FR-26`, `PM-FR-35`** keep a gate that does not cover their section. The annotation is accurate, so nothing is silently wrong — but *"`AC-S9-S13` closed"* must not be read as unblocking any of them.
- **`PM-FR-30`, `PM-FR-31`** carry `AC-S9-S13` under reading (a). If (b) is chosen, they are re-pointed.
- **The reporting hazard is the real cost.** Four requirements and one slice will look unblocked the day `AC-S9-S13` closes. Every affected artifact carries prose saying otherwise, and prose is what gets skipped.
