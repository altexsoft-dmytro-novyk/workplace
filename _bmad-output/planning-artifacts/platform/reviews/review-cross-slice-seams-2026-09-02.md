---
title: Cross-Slice Seam Review — Platform CE Post-Ratification
date: 2026-09-02
review_type: documentation-planning-only
lenses: [adversarial-seams, verification-gap, structure]
primary_content: _bmad-output/planning-artifacts/platform/epics.md
verdict: PASS WITH FINDINGS (conditional — 5 blocking guards before Epic 1 build)
scope_note: >
  No application code reviewed or changed. sprint-status.yaml not modified.
  No story marked done or cancelled. No protected artifact rewrite recommended.
---

# Cross-Slice Seam Review — Platform CE Post-Ratification

## Verdict

**PASS WITH FINDINGS — conditional.** Platform Epic 1 may proceed, but **five
guards (G1–G5) must land before the first Epic 1 story is executed**, because
each one either directs a writer at an artifact that is already correct
(collateral-damage risk) or lets a story pass its own acceptance criteria while
the seam it exists to close stays open (false-confidence risk).

Not a FAIL: the ratification overlay is substantially applied, the blocker
register reconciles mechanically, and no platform story acceptance criterion
implies a User Management code change. The findings are ID-integrity and
ownership-scope defects in `platform/epics.md`, not architectural errors.

### Blocking guards (before any Epic 1 story executes)

| Guard | Fix | File | Before |
|---|---|---|---|
| **G1** | Correct `PM-FR-15` → `PM-FR-36`/`PM-FR-37`/`PM-FR-38`; PM-FR-15 is the Unit Manager dashboard | `platform/epics.md` lines 40, 71, 83 | Story 1.6 |
| **G2** | Remove `DEC-UM-009` from the retire/rewrite list; move it to the keep list | `platform/epics.md` line 212 | Story 1.8 |
| **G3** | Restate Story 1.8 AC-1 as a verification ("confirm no `POST /users` create route remains") and fence owned sub-collection routes | `platform/epics.md` line 210 | Story 1.8 |
| **G4** | Name `user-management/epics.md` and the UM PRD explicitly in Story 1.3's denial-oracle sweep scope, or open a separate UM-owned item | `platform/epics.md` lines 145–146 | Story 1.3 |
| **G5** | Reconcile Story 1.9's `P-1…P-9` AC against the superseded alias scheme; materialize `PLAT-E1-S1.1..S1.9` in the coverage model | `platform/epics.md` line 225; `global-fr-epic-story-coverage.yaml` | Story 1.1 |

### Lens note

`adversarial-seams` is not a registered lens code in this install — the
registered codes are `adversarial`, `edge-case-hunter`, `verification-gap`,
`structure`, `prose` (`.claude/skills/bmad-review/customize.toml`). It was run
as the **adversarial** lens with the six requested focus areas supplied as
`also_consider`. The `verification-gap` lens declares `applies_to = "code"`; it
was run on explicit request and adapted — the "test" whose failure is traced is
each story's own acceptance criterion, the coverage model, and the named quality
gates, since the review is documentation-only.

---

## Confirmed vs assumption

Everything in the Confirmed section below was opened and read at the cited
`file:line`. The Assumptions section holds judgements that need a human owner
decision and must not be actioned as if settled.

---

## Findings — adversarial-seams

### S-01 · PM-FR-15 is a hard ID collision (confirmed)

- **Location:** `platform/epics.md:40`, `:71`, `:83`
- **Trigger:** `epics.md:40` defines `PM-FR-15: TimeTracker required integration; PeopleForce optional prefill only`. The canonical PRD says `§4.4 | PM-FR-15–18 | Dashboards` (`prd-people-management-2026-08-24/prd.md:728`) and the canonical coverage model says `PM-FR-15 … summary: Unit Manager dashboard, normative_refs: ["§4.4.1"], coverage_status: uncovered` (`global-fr-epic-story-coverage.yaml:149-154`). TimeTracker/PeopleForce are `PM-FR-36`/`PM-FR-37` (`§5.1`) and `PM-FR-38` (`§5.2`) — `prd.md:737-738`. Note `docs/project-requirements.md` contains **no** `PM-FR-*` tokens at all, so the PRD and the coverage model are the only numbering authorities.
- **Guard:** In `platform/epics.md`, change the Requirements Inventory entry to `PM-FR-36` / `PM-FR-37` (TimeTracker required) and `PM-FR-38` (PeopleForce optional prefill). Update the FR Coverage Map row `:71` and Epic 1's `**FRs covered:**` line `:83` to match. Do not renumber anything in the PRD or the coverage model.
- **Consequence:** Story 1.6 is a test-design refresh whose content genuinely is about TimeTracker and PeopleForce. On completion it would report coverage of `PM-FR-15` — the Unit Manager dashboard, which is `uncovered`, has no stories, and is gated by `PM/AD-33`. That is a false closure of a dashboards FR by a documentation story, and it is the exact failure mode the coverage README warns about at `global-coverage/README.md:56` ("Red E2E and scenario prose count as specification evidence, not implementation evidence").
- **Before:** Story 1.6.

### S-02 · PM-FR-4 is claimed by Platform Epic 1 but assigned to UM only (confirmed)

- **Location:** `platform/epics.md:70`, `:39`, `:83`
- **Trigger:** `epics.md:70` maps `PM-FR-4 | Epic 1 | 1.3, 1.4`. The coverage model lists exactly one story for `PM-FR-4`: `{id: UM-E0-S0.1, workboard_id: UMAC-1, status: in-progress}` (`coverage.yaml:67-74`). No `PLAT` story appears. The two also disagree on what `PM-FR-4` *is*: `epics.md:39` says "Global HTTP denial oracle — 401 … 404 … 403"; `coverage.yaml:69` says "Assemble authorized responses server-side on every request". Both cite `§3.3`.
- **Guard:** Decide whether `PM-FR-4` is one §3.3 requirement covering both assembly and the denial oracle (see A-01). Then either add `PLAT-E1-S1.3` / `PLAT-E1-S1.4` to `coverage.yaml` `PM-FR-4.stories` with an explicit `specified` status and a note that they are documentation-only, **or** drop the `PM-FR-4` row from the platform FR Coverage Map and let Stories 1.3/1.4 trace to `PM/AD-24` instead. Do not leave both files asserting different owners.
- **Consequence:** `PM-FR-4` is `in-progress` with live runtime divergence (`CONFLICT-UM-01` is `open`, `implementation_status: stale-and-divergent`, `blockers.yaml:206-229`). Two documentation stories cannot deliver a runtime denial oracle. If Epic 1 completion is read as `PM-FR-4` progress, the open P1 conflict becomes invisible in the platform view.
- **Before:** Story 1.3.

### S-03 · Platform Epic 1's nine stories do not exist in the canonical coverage model (confirmed)

- **Location:** `global-fr-epic-story-coverage.yaml:351`; `platform/epics.md:72`
- **Trigger:** `PLAT-E1-S1.1..S1.9` appears exactly once in the coverage model, and only inside prose: `reason: Unmaterialized alias scheme; PLAT-E1-S1.1..S1.9 are canonical global aliases` (`coverage.yaml:349-351`). No `requirements[].stories[]` entry carries a `PLAT-E1-*` ID — the only materialized platform IDs are `PLAT-E2-S2.1`, `PLAT-E3-S3.1`, `PLAT-E3-S3.4`, `PLAT-E3-S3.6` (verified mechanically). Meanwhile `epics.md:72` puts `PLAT-E1 | Epic 1 | 1.1–1.9` in the FR Coverage Map.
- **Guard:** Before Story 1.1 closes, add the nine `PLAT-E1-S1.x` entries to `coverage.yaml` against whichever requirement each genuinely serves (several serve none — they serve `PM/AD-*` decisions and gates, which the model has no column for; record that as an explicit modelling gap rather than forcing a PM-FR). Add an AC to Story 1.1 requiring every `PLAT-E1-S1.x` story to resolve in the coverage model, mirroring the existing gate-ID AC at `epics.md:115`.
- **Consequence:** The coverage model is designated "the cross-product traceability source" by ratification condition 4 (`ARCHITECTURE-RATIFICATION.md:254`). Epic 1 is the largest planning workstream in the platform slice and is currently invisible to it, so the model cannot detect Epic 1 drift, duplication, or abandonment.
- **Before:** Story 1.1.

### S-04 · Story 1.9's AC mandates an alias scheme the coverage model marks superseded (confirmed)

- **Location:** `platform/epics.md:225`; `global-fr-epic-story-coverage.yaml:349-351`; `implementation-artifacts/platform/sprint-status.yaml:38-47`
- **Trigger:** Story 1.9 AC requires the tracker to list "this epic and **P-1…P-9**" (`epics.md:225`). The coverage model records `- id: P-1..P-9, status: superseded, reason: Unmaterialized alias scheme` (`coverage.yaml:349-351`). The actual tracker uses neither: it uses `1-1-changelog-traceability-matrix` … `1-9-register-epic-in-platform-sprint-status` (`sprint-status.yaml:39-47`). `P-1..P-9` survives only in the approved SCP at `sprint-change-proposal-2026-08-27.md:154`, which is a protected artifact.
- **Guard:** Rewrite Story 1.9's AC to reference the canonical `PLAT-E1-S1.1..S1.9` global IDs and the actual context-local sprint keys, with a pointer noting `P-1…P-9` is the historical SCP alias scheme (superseded, not rewritten). Do not edit `sprint-change-proposal-2026-08-27.md`, and do not touch `sprint-status.yaml`.
- **Consequence:** Three ID schemes for the same nine stories, with the platform epic file mandating the one the coverage model rejects. Any future reconciliation of platform stories has to guess which scheme is authoritative.
- **Before:** Story 1.1 (which asserts the superseded-ID mapping).

### S-05 · Story 1.8 orders the retirement of a decision that is explicitly KEPT and load-bearing (confirmed)

- **Location:** `platform/epics.md:212`
- **Trigger:** Story 1.8 AC: "`docs/architecture/user-management-test-decisions.md`: retire/rewrite `DEC-UM-003/006/008/009` … keep `DEC-UM-001/002/004/005/007` as applicable." But `user-management-test-decisions.md:82` reads `## DEC-UM-009 — Rehire identity (OQ4) — **KEPT**, reframed to the seed/import writer`, and `DEC-UM-009` is actively cited by: **Platform Epic 3 Story 3.3's own AC** (`platform/epics.md:358`: "DEC-UM-009 already constrains it"), `spec-access-control-kernel-mvp/SPEC.md`, `user-management/epics.md:212` (Story 1.1 "reuse the root id"), `prd-user-management-2026-08-20/prd.md` FR-1, and the traceability table at `user-management-test-decisions.md:130`. Separately, `DEC-UM-006` (`:62`) and `DEC-UM-008` (`:76`) are **already** marked RETIRED, and `DEC-UM-003` (`:32`) is already REFRAMED and still live.
- **Guard:** Change `epics.md:212` to: "confirm `DEC-UM-006`/`DEC-UM-008` remain RETIRED and `DEC-UM-003` remains REFRAMED; drop stale `um-reg-*` traces; **keep** `DEC-UM-001/002/003/004/005/007/009`." Add an explicit note that `DEC-UM-009` is load-bearing for ACM-0 root-row reuse and must not be retired.
- **Consequence:** A writer executing this AC literally would retire the single decision that prevents the population import from inserting a second `User` row for the root person's normalized email. That would orphan a live AC inside Platform Story 3.3 (already `done`) and inside UM Story 1.1, and would remove the documented constraint behind `users_workEmail_key` reuse. This is the highest-impact finding in the review: it is a documentation change with a direct path to a data-integrity defect.
- **Before:** Story 1.8.

### S-06 · Story 1.8's create-path AC is already satisfied, and executing it risks collateral removal (confirmed)

- **Location:** `platform/epics.md:210`
- **Trigger:** AC: "`docs/architecture/api-conventions.md`: remove `POST /users` (create) from User resource shape." That file already states, at `api-conventions.md:13`, "**There is no `POST /users` create route**", and again at `:36`, "There is **no `POST /users` employee-creation route**." The file does legitimately contain many `POST /users/:id/<collection>` routes (`:17`, `:28`, `:30`, `:40`, `:42`, `:46`, `:58-63`) which are the AD-14 owned-sub-collection shape and must stay.
- **Guard:** Restate the AC as verification, not removal: "confirm `api-conventions.md` states no `POST /users` create route exists; owned sub-collection `POST /users/:id/<collection>` routes are out of scope and must remain." Keep the existing correct fence at `epics.md:211` ("Code removal of `POST /users` remains **implementation handoff**").
- **Consequence:** An AC phrased as a deletion against a file where the deletion is already done invites a writer to find something else to delete. The nearest matches are the valid owned-collection routes, including `POST /users/:id/departures` and `POST /users/:id/relationships` — removing those would silently contradict `PM/AD-31` and the `§4.16` departure workflow.
- **Before:** Story 1.8.

### S-07 · The live empty-audience 403 that remains is in `user-management/epics.md`, which no platform story AC covers (confirmed)

- **Location:** `platform/epics.md:145-146` (scope); `user-management/epics.md:48`, `:104`, `:170`, `:243`
- **Trigger:** Story 1.3's AC bans a live empty-audience 403 "in access-control SPEC, stage-1 scenarios, or binding architecture prose". Those three are **already clean** — see V-04. But `user-management/epics.md` still presents 403 as the current rule in four places with **no** `PM/AD-24` annotation, most explicitly at `:170`: "a **`403`** when an authenticated active viewer's audience over T is empty (T not an active `User`; no existence distinction — human product decision 2026-09-01, no \"leak-free 404\")". `PM/AD-24`, `PM-FR-4`, and `CONFLICT-UM-01` appear nowhere in that file. It also carries no `status:` or `updated:` frontmatter (`user-management/epics.md:1-10`), so it is not marked historical either. Story 1.7 — the only platform story aimed at UM planning — is scoped to CAP-1 retirement and says it "does **not** change UM Epics 2–4 feature scope" (`platform/epics.md:201`), saying nothing about Epic 0.
- **Guard:** Add `user-management/epics.md` (and the UM PRD FR-16/FR-17 text) to Story 1.3's sweep scope with the same "annotate as superseded, do not rewrite the 2026-09-01 decision record" rule already used elsewhere — **or**, if platform is not licensed to edit the UM slice (see A-02), open a UM-owned item and reference it from Story 1.3 so the gap is tracked rather than silently out of scope.
- **Consequence:** `user-management/epics.md` is the document a UM developer reads before implementing Epic 0. It currently teaches the superseded oracle as a live human product decision, while `CONFLICT-UM-01` stays `open` precisely because runtime does not implement `PM/AD-24` (`blockers.yaml:206-229`). This is the single most likely path to re-implementing the wrong denial code after ratification.
- **Before:** Story 1.3.

### S-08 · Story 1.3's mentorship-gate AC targets a draft artifact in another slice (confirmed)

- **Location:** `platform/epics.md:147`; `mentorship/epics.md:105-125`
- **Trigger:** Story 1.3 AC: "Mentorship and coverage companion gates resolve only to `blockers.yaml` IDs (no live duplicate globals `G-CTX` / `G-PERM` / `G-S13` / `G-CT` / `G-DEP` or `OQ-M1`–`OQ-M7`)." `spec-mentorship-domain/SPEC.md:156` already complies: it declares those aliases "**not** global blockers" and maps residuals to `blockers.yaml` IDs. But `mentorship/epics.md:105-125` still uses all five `G-*` codes as live epic-wide gates, and repeats them per story at `:133`, `:167`, `:192`, `:228`, `:271`, `:305`, `:334-350`. That file is `status: draft` (`:10`) and states "**Nothing here is approved**" (`:15-16`).
- **Guard:** Decide the scope explicitly. Either (a) narrow the AC to `spec-mentorship-domain/SPEC.md` plus the coverage companions — which is already satisfied, so mark it verified rather than pending; or (b) extend it to `mentorship/epics.md` with a note that the file is an unapproved draft and the change is an alias-annotation only, not a gate redesign. Do not silently leave a platform AC that can only be satisfied by editing another slice's unapproved draft.
- **Consequence:** As written the AC is either already met (if it means the SPEC) or requires cross-slice edits to a draft (if it means the epics file). A reviewer cannot tell which, so Story 1.3 can be signed off with the mentorship seam untouched — or a writer can churn an unapproved draft that `bmad` will regenerate anyway.
- **Before:** Story 1.3.

### S-09 · Story 1.1's gate-ID AC cites two IDs that are not live gates (confirmed)

- **Location:** `platform/epics.md:115`
- **Trigger:** AC: "Every live `gates:` ID in `global-fr-epic-story-coverage.yaml` resolves to an ID in `blockers.yaml` (e.g. `CC-10-MENTORSHIP`, `OQ-PERM-01`, `ARCH-ENV-01`, `ARCH-PROJ-WRITER-01` …)". Mechanically, the live `gates:` set is exactly `{AC-S9-S13, CC-04, CC-06, CC-07, CC-09, CC-10-MENTORSHIP, DEPARTMENT-EDGE, OQ-PERM-01, TT-IDENTITY-01, TT-PMDM-01}` — all ten resolve, all ten are `open`. `ARCH-ENV-01` appears in **no** `gates:` list and is `closed`; `ARCH-PROJ-WRITER-01` appears in **no** `gates:` list and is `open`.
- **Guard:** Replace the two wrong examples with `TT-IDENTITY-01` and `DEPARTMENT-EDGE` (real live gates). If `ARCH-PROJ-WRITER-01` *should* gate `PM-FR-37` (project-line identity) or `PM-FR-2`, add it to those `gates:` lists in the coverage model — that is a coverage-model change, not an example fix, and should be decided rather than assumed.
- **Consequence:** The AC's examples are unverifiable, so a checker either reports a false failure (looking for `ARCH-ENV-01` among gates) or quietly drops the examples and checks nothing. It also hides a possible real gap: `ARCH-PROJ-WRITER-01` is an open P1 blocking `Relationship type='project'` writes, and no FR currently gates on it.
- **Before:** Story 1.1.

### S-10 · Epic 1's status line contradicts its own tracker (confirmed)

- **Location:** `platform/epics.md:100`
- **Trigger:** `epics.md:100` says `**Status:** backlog`. The tracker it names one line later (`:101`) says `epic-1: in-progress` and `1-9-register-epic-in-platform-sprint-status: done` (`sprint-status.yaml:38`, `:47`).
- **Guard:** Update the epic file's `**Status:**` line to `in-progress`. Per the review constraints, `sprint-status.yaml` is not to be modified — the epic file is the side that is wrong. Also note only Epic 1 carries a `Status`/`Tracker` block; Epics 2 and 3 carry none despite both being `in-progress` in the same tracker.
- **Consequence:** A planner reading `epics.md` believes Epic 1 has not started and may re-plan or re-key work that is already partly recorded as done.
- **Before:** Story 1.1.

### S-11 · One file mixes a documentation-only epic with two code-delivering epics under an identical schema (confirmed)

- **Location:** `platform/epics.md:20`, `:82`, Epics 2–3 generally
- **Trigger:** `epics.md:20` frames the document as "Cross-cutting planning/test/architecture alignment", and Epic 1 is explicitly "Planning artifacts only — no application code" (`:82`). Epics 2 and 3 are production-code epics with production entrypoints (`:334`, `:380`) and AD-1 stage gates (`:513-515`). Both kinds use the same `### Story N.M` + `**Acceptance Criteria:**` schema, and the file's `status: final` frontmatter covers all three.
- **Guard:** Add a one-line licensing banner under each of Epic 2 and Epic 3 mirroring Epic 1's "Planning artifacts only" line — e.g. "Production code; every story runs the full AD-1 three-stage gate." Keep the file as one document, but make the code/no-code boundary explicit at each epic header rather than only in the Overview.
- **Consequence:** `status: final` on a file that contains both documentation ACs and unstarted production-code ACs can be read as authorizing the code stories. The kernel stories already guard themselves (`:513-515`), but Epic 2 Story 2.1 is `review` in the tracker while its implementation gate at `:238` requires independent AD-1 approval — a reader who trusts the `final` frontmatter over the inline gate could treat that approval as granted.
- **Before:** Story 1.1 (documentation-integrity), and before any Epic 2 dispatch.

### S-12 · The `UM-E0-S0.1` ↔ `Story 0.1 (UMAC-1)` bridge is asserted nowhere (confirmed)

- **Location:** `global-fr-epic-story-coverage.yaml:44`, `:73`; `user-management/epics.md:152`
- **Trigger:** The coverage model references `{id: UM-E0-S0.1, workboard_id: UMAC-1, sprint_key: 0-1-adopt-read-path-and-rebind-port}` for `PM-FR-1`, `PM-FR-3`, `PM-FR-4`, and `PM-FR-12`. `user-management/epics.md` never uses the string `UM-E0-S0.1`; it uses `### Story 0.1: Adopt the Read Path and Rebind the Port (UMAC-1)` (`:152`). The coverage README states the rule (`README.md:31`, `:37`: "Context-local sprint keys are interpreted using the story-ID prefix") but no file asserts the specific mapping.
- **Guard:** Add the `UM-E{epic}-S{story}` global alias next to each UM story heading, or add an explicit alias table to `global-coverage/README.md`. This is a UM/coverage-owned fix; reference it from Platform Story 1.1 rather than doing it inside a platform story.
- **Consequence:** The convention holds only as long as everyone applies it identically. `PM-FR-4`'s entire coverage claim rests on this unasserted bridge, so a reconciliation script or a new reader can fail to connect the coverage row to the story that satisfies it.
- **Before:** Story 1.1.

### S-13 · Story 1.7's scope fence omits UM Epic 0 (confirmed)

- **Location:** `platform/epics.md:199-201`
- **Trigger:** Story 1.7 covers `spec-user-management-test-cases` CAP-1 retirement and the registration folder disposition, and fences itself with "Does **not** change UM Epics 2–4 feature scope" (`:201`). UM Epic 0 (Access Control Adoption) and UM Epic 1 and Epic 5 are unmentioned. UM Epic 0 is the slice that owns the FR-16 denial text in S-07, and `spec-user-management-test-cases/SPEC.md` — the file Story 1.7 does touch — cites `DEC-UM-009` and ACM-0 root-id reuse.
- **Guard:** Extend the fence to "does not change UM Epic 0–5 feature scope", and state whether the FR-16 denial-text sweep (S-07) is inside or outside Story 1.7. If inside, this is the natural home for it and G4 can point here instead of Story 1.3.
- **Consequence:** An incomplete fence on the one platform story that reaches into UM planning artifacts. Either the FR-16 seam has no owner (current state), or a writer widens Story 1.7 unilaterally into approved UM Epic 0 material.
- **Before:** Story 1.7.

### S-14 · The blocker count is duplicated as prose and as an acceptance criterion (confirmed)

- **Location:** `platform/epics.md:55`, `:115`
- **Trigger:** `epics.md:55` states "Ratification blocker register: 18 open / 8 closed / 4 superseded (`blockers.yaml` is canonical ID source)" in the Requirements Inventory, and `:115` re-asserts the same three numbers as a Story 1.1 acceptance criterion. `ARCHITECTURE-RATIFICATION.md:117` and `:213` also carry them. All four are currently **correct** — verified mechanically: 30 entries, 18 open / 8 closed / 4 superseded.
- **Guard:** Keep the AC at `:115` (it is the verification point) and reduce `:55` to "Ratification blocker register: see `blockers.yaml` (canonical ID and count source)". One asserted copy, one verifying copy.
- **Consequence:** Four hard-coded copies of a number that changes every time a blocker opens or closes. The ratification itself lists this reconciliation as an automation candidate (`ARCHITECTURE-RATIFICATION.md:276`), which is an admission that manual copies drift.
- **Before:** Story 1.1.

---

## Findings — verification-gap

Adapted for documentation review: the "verification" traced is each story's own
acceptance criteria, the canonical coverage model, and the named quality gates.

### V-01 · Story 1.9 is `done` against an AC its artifact never satisfied

- **gap_shape:** broken-verification-gap
- **Location:** `platform/epics.md:225` — the AC oracle for platform tracker registration
- **Trigger:** The AC requires the tracker to list `P-1…P-9`; the tracker lists `1-1-…`…`1-9-…`; the story is recorded `done`.
- **Consumer:** `implementation-artifacts/platform/sprint-status.yaml:47` (`1-9-register-epic-in-platform-sprint-status: done`), read by `bmad-sprint-status` and by Story 1.1's reconciliation.
- **Evidence:** Read `sprint-status.yaml:31-63` in full — keys are `1-1-changelog-traceability-matrix` through `1-9-register-epic-in-platform-sprint-status`; no `P-` key exists anywhere in the file. `epics.md:225` requires "P-1…P-9". `coverage.yaml:349-351` marks `P-1..P-9` superseded.
- **Guard:** Fix the AC text (G5) and record in the Story 1.1 matrix that Story 1.9's original oracle was stale, so the `done` status is explained rather than silently inconsistent. Per review constraints, do not change the story's status.
- **Consequence:** The one story whose job was to make platform work trackable passed on an oracle that does not describe the artifact produced. Nothing would fail today if the tracker keys were wrong, because the AC that would have caught it does not match reality.

### V-02 · No check fails if Epic 1 stories land without coverage-model entries

- **gap_shape:** missing-adoption-gap
- **Location:** `global-fr-epic-story-coverage.yaml` `requirements[].stories[]` — the canonical traceability surface
- **Trigger:** Story 1.1 has an AC verifying gate IDs resolve (`epics.md:115`) and an AC verifying blocker counts (`:114`), but none verifying that platform stories resolve in the coverage model. See S-03.
- **Consumer:** The coverage model itself, designated the cross-product traceability source by `ARCHITECTURE-RATIFICATION.md:254`.
- **Evidence:** Searched the whole coverage model for `PLAT-E1`: one hit, at `:351`, inside a `superseded_work` prose reason. The four materialized platform IDs are `PLAT-E2-S2.1`, `PLAT-E3-S3.1`, `PLAT-E3-S3.4`, `PLAT-E3-S3.6`. `README.md:52` requires "Every story mapping has a namespaced story ID"; `README.md:100` lists "Sprint-key existence in the context-specific tracker" as a validation check — neither is expressed as a platform AC.
- **Guard:** Add to Story 1.1: "Every `PLAT-E1-S1.x` story resolves to an entry in `global-fr-epic-story-coverage.yaml`, or is recorded there as decision/gate-serving work with no PM-FR owner." This mirrors the gate-ID AC already present and is the smallest change that makes S-03 falsifiable.
- **Consequence:** All nine Epic 1 stories can complete with the coverage model unchanged, and the model would still report the platform slice as three stories. The ratification's own automation candidate list names this class of drift (`ARCHITECTURE-RATIFICATION.md:272`, "Compare referenced sprint keys and paths with current artifacts").

### V-03 · Two Story 1.8 ACs pass without any work, and nothing pins the artifacts against regression

- **gap_shape:** broken-verification-gap
- **Location:** `platform/epics.md:210` (api-conventions create path), `:213` (CC-06 departure wording)
- **Trigger:** Both ACs describe changes that are already applied, so both evaluate true on an untouched repository.
- **Consumer:** `docs/architecture/api-conventions.md:13`; `docs/architecture/database-schema.md:115`.
- **Evidence:** `api-conventions.md:13` — "**There is no `POST /users` create route**"; `:36` repeats it. `database-schema.md:115` — "cancels only open Action Items assigned to the departing person (authored-for-other-active-assignee items remain open)", which matches the `docs/project-requirements.md` CC-06 condition-6 wording the AC demands. I read both lines directly.
- **Guard:** Restate both as verification ACs with the exact expected sentence quoted, so the AC fails if a later edit weakens the wording — this converts a no-op AC into a regression pin. For CC-06 specifically, quote "only open Action Items assigned to the departing person" as the required phrase.
- **Consequence:** Story 1.8 can be signed off having verified nothing, and the two sentences it exists to protect have no pin. `PM/AD-23`'s assigned-only cancel is the exact rule that `blockers.yaml:112-114` makes a `CC-06` closure condition; if `database-schema.md:115` were later broadened back to "all open action items", no AC anywhere would fail.

### V-04 · The denial-oracle ACs are satisfied in their named scope, so nothing sweeps the slices outside it

- **gap_shape:** missing-adoption-gap
- **Location:** `platform/epics.md:145-146` (Story 1.3), `:163` (Story 1.4) — the `PM/AD-24` verification surface
- **Trigger:** The doc-cleanup overlay is genuinely applied everywhere these ACs point, which means both ACs pass while `user-management/epics.md` still teaches 403 as live (S-07).
- **Consumer:** `user-management/epics.md:48`, `:104`, `:170`, `:243` — the UM developer's entry point for Epic 0.
- **Evidence:** Confirmed **applied**: `docs/architecture/access-control.md:209-210` ("Do not treat the 2026-09-01 empty-audience `403` paragraph below as live (PM/AD-24)" + the superseded banner with the full five-clause oracle) and `:187` (short summary linking to the complete rule, satisfying Story 1.4's `:163` AC); `spec-user-management-access-control-adoption/SPEC.md` frontmatter `denial_oracle` (`:6-10`) plus inline annotations at `:109-111`, `:209`, `:244`, `:327`; `stories.yaml:1-3`; `docs/test-cases/user-management/access-control-adoption/umac-05-…md:3-7`; that directory's `README.md:3-9`. Confirmed **not** applied: `user-management/epics.md`, where `PM/AD-24`, `PM-FR-4`, and `CONFLICT-UM-01` do not appear at all.
- **Guard:** Apply G4 — name `user-management/epics.md` and the UM PRD FR-16/FR-17 text in the sweep scope (or open a UM-owned item), preserving the established "annotate superseded, never rewrite the 2026-09-01 record" rule from `ARCHITECTURE-RATIFICATION.md:236` and `:240`.
- **Consequence:** Stories 1.3 and 1.4 will report the denial-oracle debt closed while the highest-traffic UM planning document still contradicts `PM/AD-24`. `CONFLICT-UM-01` stays `open` on the implementation axis, so the discrepancy will not be caught by the blocker register either.

### V-05 · Story 1.1's gate-ID AC is unfalsifiable for two of its four examples

- **gap_shape:** broken-verification-gap
- **Location:** `platform/epics.md:115` — the gate-ID reconciliation oracle
- **Trigger:** Two of the four cited example IDs are not live gates, so a literal checker cannot pass. See S-09.
- **Consumer:** Whatever executes Story 1.1's matrix, plus the automation candidate at `ARCHITECTURE-RATIFICATION.md:277` ("gate IDs resolving in `blockers.yaml`").
- **Evidence:** Parsed every `gates:` list in the coverage model and resolved each against `blockers.yaml`: ten distinct IDs, all present, all `open`. `ARCH-ENV-01` — not in any `gates:` list, `status: closed` (`blockers.yaml:641`). `ARCH-PROJ-WRITER-01` — not in any `gates:` list, `status: open` (`blockers.yaml:558`).
- **Guard:** Correct the examples (G5 companion), and separately decide whether `ARCH-PROJ-WRITER-01` should gate `PM-FR-2` or `PM-FR-37`.
- **Consequence:** The AC most likely to be automated is the one whose examples don't resolve, so the first automation run produces a false failure and the check gets weakened or dropped.

### V-06 · Every TimeTracker gate rests on an untracked file (`gap_shape: other`)

- **gap_shape:** other
- **Location:** `platform/epics.md:189` (Story 1.6: "Live coverage gates use `TT-IDENTITY-01` and/or `TT-PMDM-01`")
- **Trigger:** `TT-IDENTITY-01` (P0) and `TT-PMDM-01` cite `docs/integrations/timetracker-external-api.json` as their sole evidence, and that path is untracked in git.
- **Evidence:** `git status --porcelain docs/integrations/` returns `?? docs/integrations/`, and `git ls-files docs/integrations/` returns nothing — the directory is entirely untracked. The file does exist in the working tree. `blockers.yaml:18-23` (`evidence_caveat`) and `ARCHITECTURE-RATIFICATION.md:42-47` both already state this and name committing the contract as a precondition for auditability.
- **Guard:** Add an AC to Story 1.6 recording the evidence caveat verbatim alongside the gate-ID requirement, so the story does not present `TT-IDENTITY-01`/`TT-PMDM-01` as auditable gates without the caveat travelling with them. Committing `docs/integrations/` is outside this documentation review's scope and needs an owner decision.
- **Consequence:** Story 1.6 will assert the live TimeTracker gates are correctly cited — true — while the evidence behind both gates is not reproducible for anyone else. This is already known and recorded upstream; the gap is that the platform story reproduces the gate IDs without the caveat.

### V-07 · `platform/epics.md` is `status: final` but uncommitted (`gap_shape: other`)

- **gap_shape:** other
- **Location:** `platform/epics.md:13` (`status: final`)
- **Trigger:** The file declares itself final while carrying uncommitted modifications.
- **Evidence:** `git status --porcelain` reports ` M _bmad-output/planning-artifacts/platform/epics.md`. `ARCHITECTURE-RATIFICATION.md:35-40` already flags that planning evidence is not reproducible at the pinned SHA for exactly this class of file.
- **Guard:** Commit the file, or add `reproducible: working-tree-only` to its frontmatter, before Story 1.1 cites it as a baseline. No content change needed.
- **Consequence:** Story 1.1 builds a traceability matrix over a "final" document that cannot be resolved at any commit, so the matrix inherits the same non-reproducibility the ratification package went out of its way to disclose.

---

## Findings — structure

This document exists to help platform planners and developers find, per story,
exactly what to change and what not to touch across three bounded-context slices.

**Structure model:** Reference/Database — the reading pattern is random access to
one story with a consistent per-story schema, not linear narrative. Word metrics
from `scripts/word_metrics.py`: **3,713 words total**; Epic 1 = 1,004 words
across nine stories, Epic 2 = 196, Epic 3 = 1,617 across eight stories plus a
128-word dependency graph.

Content is treated as sacrosanct below — these rows address organisation and
placement only, never whether a decision is right.

| Pass | Original Text | Revised Text | Changes |
|---|---|---|---|
| structure | `## Epic List` — the three `### Epic N` entries (~68 words) | **MERGE** into each `## Epic N` section body | Every `### Epic N` entry in Epic List is restated by the `## Epic N` section that follows (e.g. `:82` vs `:100`, `:90` vs `:230`). True redundancy under the Reference model's MECE rule (saves ~60 words) |
| structure | `### Additional Requirements (architecture / ratification)` (112 words), specifically the count at `:55` | **CONDENSE** to a pointer: "see `blockers.yaml` (canonical ID and count source)" | Restates `blockers.yaml` and `ARCHITECTURE-RATIFICATION.md` §3; the hard-coded 18/8/4 is a fourth copy of a changing number (see S-14). Keep the `PM/AD-*` list — it is the platform-relevant subset, not redundancy (saves ~35 words) |
| structure | `### FR Coverage Map` (98 words) — the `Story` column values `1.3, 1.4`, `3.1–3.5`, `1.1–1.9` | **CONDENSE** to namespaced IDs (`PLAT-E1-S1.3`, `PLAT-E3-S3.1..S3.5`) | `global-coverage/README.md:26` states "Bare FR, Epic, and Story numbers are ambiguous and must not appear in cross-product references"; this table is a cross-product reference. Also mixes `PM-FR-*` and `PLAT-E*` in one "FR / ID" column — split into two tables or add a `Namespace` column |
| structure | `### Kernel Dependency Graph` (128 words) at the file's end, after Story 3.8 | **MOVE** to directly under `## Epic 3` (before Story 3.1) | It defines the execution order of the eight stories above it; the Reference model's front-loading rule puts ordering before the items ordered. Currently a reader must finish Epic 3 to learn Epic 3's sequence |
| structure | `## Epic 1 … **Status:** backlog / **Tracker:** …` (`:100-101`) | **MOVE** the pattern to Epics 2 and 3 as well | Consistent-schema violation: only Epic 1 carries Status/Tracker, though all three are tracked in the same file. Fixing S-10's stale value is a content correction; replicating the block is the structural fix |
| structure | Epic 2 (`:230`) and Epic 3 (`:250`) headers, versus Epic 1's "Planning artifacts only — no application code" (`:82`) | **MOVE** an equivalent one-line licensing banner under Epics 2 and 3 | The code/no-code boundary appears once, in the Overview, but is the single most consequential fact for a reader jumping straight to a story (see S-11) |
| structure | `### UX Design Requirements` — "None — no `bmad-ux` contract exists for platform scope." (9 words) | **PRESERVE** | Looks cuttable as an empty section, but it records a deliberate negative finding for BMad completeness checks. Removing it would make "was UX considered?" unanswerable from this file |
| structure | Stories 3.1 (333 words), 3.3 (340), 3.4 (322) — dense multi-clause bullets | **PRESERVE** | The least scannable items in the file, but all three are `done` in the tracker and their precision is load-bearing (e.g. the repeated-node rule at `:290-294`, the count-before-active-state ordering at `:343-346`). Rewriting settled, delivered ACs is churn with regression risk and no reader gain |
| structure | `## Overview` → "**Out of scope for this epic:** … `um-seed-01`..`03` (owned by UM Story 1.1)" (`:26`) | **QUESTION** — scope it to Epic 1 or to the file | The heading says "this epic" but the file holds three epics. Confirmed accurate for Epic 1 (UM Story 1.1 does own `um-seed-01..03` — `user-management/epics.md:207`), so this is a placement question, not a content one |

**Structure summary.** Nine recommendations; two are PRESERVE. Accepting all
seven actionable rows removes roughly **110 words of 3,713 (~3%)**. That is
deliberately small: this document is dense rather than padded, and the
structural problems are placement, schema consistency, and namespace discipline
rather than bloat. No length target was provided. One comprehension trade-off
worth naming: merging the Epic List (row 1) removes the only place a reader sees
all three epics side by side — if that overview is valued, keep the list and cut
the duplicated prose from the `## Epic N` bodies instead.

**Prose pass:** not run — not requested.

---

## Coverage of the success criteria

### Every PM-FR with both PLAT and UM stories, assessed for seam risk

Derived from `global-fr-epic-story-coverage.yaml`. Only two requirements
genuinely carry stories from both slices; `PM-FR-4` is disputed, and two more
are included because a platform-owned gate governs a UM/mentorship story.

| PM-FR | PLAT story | UM / M story | Seam risk | Guard |
|---|---|---|---|---|
| PM-FR-1 | `PLAT-E3-S3.4` (ACM-1, implemented) | `UM-E0-S0.1` (UMAC-1, in-progress) | **Medium.** Kernel separation shipped; consumer adoption not. Coverage note already says so (`:45`). Platform Epic 3 Story 3.7 fences `user-management/**` (`:467`), so no ownership collision. | None new — the fence holds. Keep `PM-FR-1` at `in-progress` until UMAC-1 has production evidence |
| PM-FR-3 | `PLAT-E3-S3.6` (ACM-5, implemented) | `UM-E0-S0.1` (UMAC-1, in-progress) | **Medium.** Facade returns `none` for every section but S1/S10/S11 (`blockers.yaml:330-331`); `AC-S9-S13` is open. Both slices correctly describe the narrow slice. | None new. Do not let Story 1.3's S-matrix edits imply S9–S13 exist |
| PM-FR-4 | **Disputed** — `epics.md:70` claims `1.3, 1.4`; coverage lists none | `UM-E0-S0.1` (UMAC-1, in-progress) | **High.** Two artifacts disagree on ownership *and* on the requirement's meaning; the live 403 text survives in the UM slice; `CONFLICT-UM-01` is open. | **G4**, S-02, S-07 |
| PM-FR-12 | none (but `AC-S9-S13` is platform/access-control-owned) | `UM-E0-S0.1`, `UM-E1-S1.2`, `M-E1-S1.5` | **Medium.** Three consuming stories across two slices depend on an open platform-owned gate with no PLAT story attached. Coverage note flags the runtime divergence (`:130`). | Record in Story 1.1's matrix that `AC-S9-S13` has consumers in two slices and no owning platform story |
| PM-FR-2 | `PLAT-E2-S2.1` (ACF-1), `PLAT-E3-S3.1` (ACM-3) | none | **Low.** PLAT-only. Gated on `DEPARTMENT-EDGE`, `TT-IDENTITY-01`, `TT-PMDM-01` — all open, all correctly cited. | **V-06** (evidence caveat) |
| PM-FR-14 / 32 / 33 / 34 / 41 | none | UM and/or M stories | **Low–Medium.** Mentorship-side gates are the `G-*` alias issue, already resolved in the domain SPEC. | **S-08** |

### Epic 2/3 boundary — no platform story AC implies a UM code change (verified PASS)

- Epic 2 Story 2.1: "No User Management controller, guard, adapter, or frontend file changes are included" (`epics.md:246`).
- Epic 3 Story 3.7: "No file under `services/backend/src/user-management/**` changes" (`:467`); `ACCESS_CONTROL_PORT` stays bound to the interim adapter (`:469`).
- Epic 3 Story 3.4: "Create no `/roles` or `/users` route" (`:415`).
- Epic 1 Stories 1.7 and 1.8 touch only `docs/**` and `_bmad-output/specs/**`; Story 1.8 explicitly fences code: "Code removal of `POST /users` remains **implementation handoff**" (`:211`).
- Consistent with the UMAC SPEC's own reciprocal fence: "The still-present `POST /users` and `DELETE /users/:id` are an AD-16/AD-21 UM Epic 1 concern … this slice must not be blocked by them and must not remove them" (`SPEC.md:287-291`).

**One caveat:** the boundary is clean for *code*. It is **not** clean for
*planning artifacts* — Stories 1.3, 1.7, and 1.8 all reach into UM- and
mentorship-owned documents without a stated cross-slice editing license (S-07,
S-08, S-13, A-02).

### Protected artifacts — no rewrite recommended (verified)

No finding in this review asks for a change to: UMAC `approvals.yaml`;
`spec-user-management-access-control-adoption/stories.yaml` bodies; committed-red
tests; `umac-05` or any `expectedResult` line; or any approved Sprint Change
Proposal body (including `sprint-change-proposal-2026-08-27.md:154`, which is the
`P-1…P-9` source and is left intact by S-04). Every denial-oracle finding follows
the established rule from `ARCHITECTURE-RATIFICATION.md:236`: annotate as
superseded, never rewrite the 2026-09-01 record.

### Ratification overlay — verified applied, not assumed

| Story 1.x AC | Named artifact | State |
|---|---|---|
| 1.3 `PM/AD-24` oracle in binding docs | `docs/architecture/access-control.md:187`, `:209-210` | **Applied** |
| 1.3 no live empty-audience 403 in AC SPEC | `spec-…-adoption/SPEC.md:6-10`, `:109-111`, `:209`, `:244`, `:327` | **Applied** (annotated, not rewritten) |
| 1.3 no live 403 in stage-1 scenarios | `umac-05-…md:3-7`; `access-control-adoption/README.md:3-9` | **Applied** |
| 1.3 `PM/AD-28` honesty | `docs/test-cases/access-control/matrix/full-profile-access` | **Absent as required** — no such directory |
| 1.3 mentorship gates → `blockers.yaml` IDs | `spec-mentorship-domain/SPEC.md:156` | **Applied** in the SPEC; **not** in `mentorship/epics.md` (S-08) |
| 1.4 short denial summary links to full rule | `access-control.md:187` | **Applied** |
| 1.6 `QUALITY-GATE-AC` current state | `_bmad-output/test-artifacts/gate-decision.json` | **Accurate** — `gate_status: FAIL`, `p0_status: NOT_MET`, `critical_open: 1`, evaluated `2026-08-31` |
| 1.8 `POST /users` removed | `api-conventions.md:13`, `:36` | **Already applied** (S-06, V-03) |
| 1.8 CC-06 assigned-only cancel | `database-schema.md:115` | **Already applied** (V-03) |
| 1.1 blocker counts 18/8/4 | `blockers.yaml` | **Verified correct** — 30 entries |
| 1.1 live gate IDs resolve | `coverage.yaml` → `blockers.yaml` | **All 10 resolve**; two AC *examples* are not gates (S-09) |
| — | All 14 evidence paths cited by `platform/epics.md` | **All exist** |

---

## Assumptions — not confirmed, needs an owner decision

- **A-01 · What `PM-FR-4` means.** `coverage.yaml:69` summarises it as "Assemble authorized responses server-side on every request"; its own `conflicts` block ties `PM-FR-4` to the 401/404/403 oracle (`:31-36`); `platform/epics.md:39` treats it as the oracle alone. Both cite `§3.3`. It may be one broad requirement or two conflated ones. S-02's guard depends on this. **Product Owner / Architect.**
- **A-02 · Whether Platform Epic 1 may edit other slices' artifacts.** Stories 1.3, 1.7, and 1.8 all reach into UM- and mentorship-owned documents. Nothing states whether platform holds that license, and `mentorship/epics.md` is an unapproved draft. S-07, S-08, and S-13 all hinge on this. **Delivery lead / Architect.**
- **A-03 · Whether `mentorship/epics.md` will be regenerated.** It is `status: draft` with "Nothing here is approved" (`:15-16`), and `spec-mentorship-domain/SPEC.md` (`status: canonical-domain`) already supersedes its gate aliases. If regeneration is planned, S-08 should be closed by narrowing the AC rather than by editing the draft. **Architect.**
- **A-04 · Whether `ARCH-PROJ-WRITER-01` should be a live coverage gate.** It is an open P1 blocking `Relationship type='project'` writes (`blockers.yaml:554-572`) and gates no FR today. Adding it to `PM-FR-2` or `PM-FR-37` is a coverage-model decision, not an example fix. **Architect.**
- **A-05 · The `UM-E{epic}-S{story}` alias convention.** Applied by the coverage model but asserted in no UM artifact (S-12). Treated here as convention, not fact. **Coverage-model owner.**

---

## Manual validation vs automation candidates

**Requires manual validation** (judgement, not mechanically checkable):

- A-01 through A-05 — every one is a scope or semantics decision.
- Whether Stories 1.3/1.4 genuinely closed the denial-oracle debt, or only the part their AC scope named (V-04). The scope boundary is the finding; only a human can decide whether it was intentional.
- Whether retiring `DEC-UM-009` was ever intended (S-05). The AC and the artifact contradict each other; which is authoritative is a human call.
- Whether `status: final` on a file containing unstarted production-code epics is intended (S-11, V-07).

**Automation candidates** (deterministic, worth wiring into the Story 1.1 matrix
or a coverage validator — several already listed at
`ARCHITECTURE-RATIFICATION.md:268-279`):

- `blockers.yaml` count reconciliation against every prose copy — catches S-14. Verified reproducible here.
- Every live `gates:` ID resolves in `blockers.yaml`, and every ID cited as an *example* in an AC is actually a live gate — catches S-09/V-05.
- Every `PLAT-E*`, `UM-E*`, `M-E*` story ID in any epic file resolves in the coverage model, and every coverage story ID resolves to a heading in its slice's epic file — catches S-03, S-12, V-02.
- PM-FR ID → summary consistency across `platform/epics.md`, the PRD, and the coverage model — catches S-01 directly, and would have caught it at authoring time.
- Sprint-tracker keys versus epic-file `**Status:**` lines — catches S-10.
- Grep for `403` co-occurring with "empty audience" in any file lacking a `PM/AD-24` annotation — catches S-07 and any future regression of V-04.
- Evidence-path existence **plus relevance**, and git-tracked status for every cited evidence path — catches V-06 and V-07. The relevance half is the gap `blockers.yaml:24-27` (`validator_note`) already names.

---

## Overlap between lenses (retained, not deduped)

- S-04 and V-01 both cover Story 1.9's `P-1…P-9` AC. Adversarial reads it as an ID-scheme conflict across three files; verification-gap reads it as a `done` story whose oracle never matched its artifact. Both matter — the first tells you what to fix, the second tells you why the existing status is untrustworthy.
- S-06 and V-03 both cover Story 1.8's create-path AC. Adversarial flags the collateral-removal risk; verification-gap flags that the AC passes without work and leaves the sentence unpinned.
- S-07 and V-04 both cover the surviving 403. Adversarial locates it and names the missing owner; verification-gap explains why Stories 1.3/1.4 will pass anyway.
- S-09 and V-05 both cover the gate-ID examples. Adversarial proposes the correct examples; verification-gap notes the AC is the one most likely to be automated first.
- S-14 and the structure pass's `Additional Requirements` row both address the duplicated blocker count, from the ID-integrity and the document-shape angles respectively.

---

## Appendix — canonical findings array

`output_format` resolves to `both`. The `structure` lens declares its own
rendering (the findings table above) and is not repeated here.

```json
[
  {"lens":"adversarial-seams","location":"platform/epics.md:40,:71,:83","trigger_condition":"PM-FR-15 is defined as TimeTracker/PeopleForce integration, but the canonical PRD (prd.md:728) and coverage model (coverage.yaml:149-154) assign PM-FR-15 to the Unit Manager dashboard; TimeTracker/PeopleForce are PM-FR-36/37/38","guard_snippet":"Renumber to PM-FR-36/PM-FR-37/PM-FR-38 in the Requirements Inventory, the FR Coverage Map row, and Epic 1's FRs-covered line; change nothing in the PRD or coverage model","potential_consequence":"Story 1.6 completion would claim coverage of PM-FR-15, an uncovered dashboards FR gated by PM/AD-33, falsely closing it via a documentation story"},
  {"lens":"adversarial-seams","location":"platform/epics.md:70,:39,:83","trigger_condition":"Platform claims PM-FR-4 is covered by Stories 1.3/1.4 while the coverage model lists only UM-E0-S0.1, and the two disagree on what PM-FR-4 means","guard_snippet":"Settle A-01, then either add PLAT-E1-S1.3/S1.4 to coverage.yaml PM-FR-4.stories marked documentation-only, or drop the PM-FR-4 row from the platform FR Coverage Map and trace those stories to PM/AD-24","potential_consequence":"Two documentation stories are credited with a runtime denial oracle while CONFLICT-UM-01 stays open, hiding the P1 conflict from the platform view"},
  {"lens":"adversarial-seams","location":"global-fr-epic-story-coverage.yaml:351; platform/epics.md:72","trigger_condition":"PLAT-E1-S1.1..S1.9 exist only inside a superseded_work prose reason; no requirements[].stories[] entry carries a PLAT-E1 ID","guard_snippet":"Materialize the nine PLAT-E1-S1.x entries in coverage.yaml, or record them as decision/gate-serving work with no PM-FR owner; add a Story 1.1 AC requiring each to resolve","potential_consequence":"Epic 1 is invisible to the source designated canonical by ratification condition 4, so its drift, duplication, or abandonment cannot be detected"},
  {"lens":"adversarial-seams","location":"platform/epics.md:225; coverage.yaml:349-351; sprint-status.yaml:38-47","trigger_condition":"Story 1.9's AC mandates P-1...P-9, the coverage model marks that scheme superseded, and the tracker uses neither (it uses 1-1-...through 1-9-...)","guard_snippet":"Rewrite the AC to cite PLAT-E1-S1.1..S1.9 plus the actual sprint keys, with a pointer noting P-1...P-9 is the historical SCP alias; do not edit the SCP or sprint-status.yaml","potential_consequence":"Three competing ID schemes for the same nine stories, with the epic file mandating the one the coverage model rejects"},
  {"lens":"adversarial-seams","location":"platform/epics.md:212","trigger_condition":"Story 1.8 orders retire/rewrite of DEC-UM-009, but user-management-test-decisions.md:82 marks it KEPT and it is cited by Platform Story 3.3's own AC, UM Story 1.1, the UM PRD FR-1, and the kernel MVP SPEC","guard_snippet":"Move DEC-UM-009 to the keep list; restate the AC as confirming DEC-UM-006/008 remain RETIRED and DEC-UM-003 remains REFRAMED; note DEC-UM-009 is load-bearing for ACM-0 root-row reuse","potential_consequence":"Retiring it removes the rule preventing a second User row for the root person's normalized email, orphaning a live AC in an already-done story and opening a data-integrity path"},
  {"lens":"adversarial-seams","location":"platform/epics.md:210","trigger_condition":"The AC orders removal of POST /users from api-conventions.md, where it was already removed (:13, :36), while valid POST /users/:id/<collection> routes remain","guard_snippet":"Restate as verification: confirm no POST /users create route is documented; declare owned sub-collection routes out of scope and required to remain","potential_consequence":"A deletion AC against an already-clean file invites removal of the valid owned-collection routes, silently contradicting PM/AD-31 and the §4.16 departure workflow"},
  {"lens":"adversarial-seams","location":"platform/epics.md:145-146; user-management/epics.md:48,:104,:170,:243","trigger_condition":"Story 1.3's AC scope names the access-control SPEC, stage-1 scenarios, and binding architecture prose - all already clean - while user-management/epics.md still presents empty-audience 403 as live with no PM/AD-24 annotation","guard_snippet":"Add user-management/epics.md and the UM PRD FR-16/FR-17 text to the sweep scope under the annotate-don't-rewrite rule, or open a UM-owned item and reference it from Story 1.3","potential_consequence":"The document a UM developer reads before implementing Epic 0 teaches the superseded oracle as a live product decision, the most likely path to re-implementing the wrong denial code"},
  {"lens":"adversarial-seams","location":"platform/epics.md:147; mentorship/epics.md:105-125","trigger_condition":"The AC bans live G-CTX/G-PERM/G-S13/G-CT/G-DEP aliases; spec-mentorship-domain/SPEC.md:156 already complies, but mentorship/epics.md still uses all five as live gates and is an unapproved draft","guard_snippet":"Either narrow the AC to the domain SPEC and coverage companions and mark it verified, or extend it to mentorship/epics.md noting the change is alias annotation only, not gate redesign","potential_consequence":"The AC is either already satisfied or requires editing another slice's unapproved draft; a reviewer cannot tell which, so Story 1.3 can pass with the mentorship seam untouched"},
  {"lens":"adversarial-seams","location":"platform/epics.md:115","trigger_condition":"Two of the AC's four example gate IDs are not live gates: ARCH-ENV-01 appears in no gates: list and is closed; ARCH-PROJ-WRITER-01 appears in no gates: list","guard_snippet":"Replace both examples with TT-IDENTITY-01 and DEPARTMENT-EDGE; separately decide whether ARCH-PROJ-WRITER-01 should gate PM-FR-2 or PM-FR-37","potential_consequence":"The AC most likely to be automated has examples that cannot resolve, producing a false failure on first run so the check gets weakened or dropped"},
  {"lens":"adversarial-seams","location":"platform/epics.md:100","trigger_condition":"Epic 1 declares Status: backlog while the tracker it cites one line later records epic-1: in-progress with story 1-9 done","guard_snippet":"Update the epic file's Status line to in-progress; sprint-status.yaml is out of scope per the review constraints, so the epic file is the side to correct","potential_consequence":"A planner believes Epic 1 has not started and may re-plan or re-key work already recorded as done"},
  {"lens":"adversarial-seams","location":"platform/epics.md:20,:82; Epics 2-3","trigger_condition":"One file with status: final mixes a documentation-only epic with two production-code epics under an identical story schema; the code/no-code boundary is stated only in the Overview","guard_snippet":"Add a one-line licensing banner under Epic 2 and Epic 3 mirroring Epic 1's 'Planning artifacts only - no application code'","potential_consequence":"status: final can be read as authorizing the unstarted code stories; Epic 2 Story 2.1's inline AD-1 implementation gate could be treated as already granted"},
  {"lens":"adversarial-seams","location":"coverage.yaml:44,:73; user-management/epics.md:152","trigger_condition":"The coverage model references UM-E0-S0.1 for four PM-FRs, but that string appears nowhere in the UM slice, which uses 'Story 0.1 ... (UMAC-1)'","guard_snippet":"Add the UM-E{epic}-S{story} global alias beside each UM story heading, or add an alias table to global-coverage/README.md; own this in the UM/coverage slice, not a platform story","potential_consequence":"PM-FR-4's entire coverage claim rests on an unasserted naming convention, so a validator or a new reader can fail to connect the coverage row to the story satisfying it"},
  {"lens":"adversarial-seams","location":"platform/epics.md:199-201","trigger_condition":"Story 1.7's fence covers only 'UM Epics 2-4', omitting UM Epic 0 - the slice that owns the FR-16 denial text - as well as Epics 1 and 5","guard_snippet":"Extend the fence to UM Epics 0-5 and state whether the FR-16 denial sweep belongs here; if it does, G4 should point at Story 1.7 rather than Story 1.3","potential_consequence":"An incomplete fence on the only platform story that reaches into UM planning artifacts: either the FR-16 seam has no owner, or a writer widens Story 1.7 into approved UM Epic 0 material"},
  {"lens":"adversarial-seams","location":"platform/epics.md:55,:115","trigger_condition":"The 18/8/4 blocker count is hard-coded in the Requirements Inventory and again as a Story 1.1 AC, plus twice more in ARCHITECTURE-RATIFICATION.md; all four are currently correct","guard_snippet":"Keep the AC as the verification point; reduce :55 to 'see blockers.yaml (canonical ID and count source)'","potential_consequence":"Four copies of a number that changes whenever a blocker opens or closes; the ratification itself lists this reconciliation as an automation candidate, conceding manual copies drift"},

  {"lens":"verification-gap","gap_shape":"broken-verification-gap","location":"platform/epics.md:225 - the AC oracle for platform tracker registration","trigger_condition":"Story 1.9 is recorded done against an AC requiring P-1...P-9, which the produced artifact never contained","guard_snippet":"Fix the AC text and record in the Story 1.1 matrix that Story 1.9's original oracle was stale, so the done status is explained; do not change the story status","potential_consequence":"The story responsible for making platform work trackable passed on an oracle that does not describe its own output; wrong tracker keys would fail no check today","consumer":"implementation-artifacts/platform/sprint-status.yaml:47 (1-9-register-epic-in-platform-sprint-status: done), read by bmad-sprint-status and Story 1.1's reconciliation","evidence":"Read sprint-status.yaml:31-63 in full - keys run 1-1-changelog-traceability-matrix through 1-9-register-epic-in-platform-sprint-status; no P- key exists in the file. epics.md:225 requires P-1...P-9. coverage.yaml:349-351 marks P-1..P-9 superseded"},
  {"lens":"verification-gap","gap_shape":"missing-adoption-gap","location":"global-fr-epic-story-coverage.yaml requirements[].stories[] - the canonical traceability surface","trigger_condition":"Story 1.1 has ACs verifying gate IDs and blocker counts but none verifying that platform stories resolve in the coverage model","guard_snippet":"Add to Story 1.1: every PLAT-E1-S1.x story resolves to an entry in global-fr-epic-story-coverage.yaml, or is recorded there as decision/gate-serving work with no PM-FR owner","potential_consequence":"All nine Epic 1 stories can complete with the coverage model unchanged, still reporting the platform slice as three stories","consumer":"The coverage model, designated the cross-product traceability source by ARCHITECTURE-RATIFICATION.md:254","evidence":"Searched the whole coverage model for PLAT-E1: one hit at :351, inside a superseded_work prose reason. Materialized platform IDs are only PLAT-E2-S2.1, PLAT-E3-S3.1, PLAT-E3-S3.4, PLAT-E3-S3.6. README.md:52 requires namespaced story IDs and README.md:100 lists sprint-key existence as a check; neither is expressed as a platform AC"},
  {"lens":"verification-gap","gap_shape":"broken-verification-gap","location":"platform/epics.md:210 and :213 - Story 1.8's api-conventions and CC-06 ACs","trigger_condition":"Both ACs describe changes already applied, so both evaluate true on an untouched repository and pin nothing against later regression","guard_snippet":"Restate both as verification ACs quoting the exact required sentence - for CC-06, 'only open Action Items assigned to the departing person' - so the AC fails if the wording is later weakened","potential_consequence":"Story 1.8 can be signed off having verified nothing; if database-schema.md:115 were later broadened back to all open action items, no AC anywhere would fail","consumer":"docs/architecture/api-conventions.md:13; docs/architecture/database-schema.md:115","evidence":"api-conventions.md:13 'There is no POST /users create route', repeated at :36. database-schema.md:115 'cancels only open Action Items assigned to the departing person (authored-for-other-active-assignee items remain open)'. Both lines read directly. blockers.yaml:112-114 makes that assigned-only rule a CC-06 closure condition"},
  {"lens":"verification-gap","gap_shape":"missing-adoption-gap","location":"platform/epics.md:145-146 and :163 - the PM/AD-24 verification surface","trigger_condition":"The doc-cleanup overlay is applied everywhere Stories 1.3/1.4 point, so both pass while user-management/epics.md still teaches 403 as live","guard_snippet":"Apply G4 - name user-management/epics.md and the UM PRD FR-16/FR-17 text in the sweep scope, preserving the annotate-superseded-never-rewrite rule from ARCHITECTURE-RATIFICATION.md:236","potential_consequence":"Stories 1.3 and 1.4 report the denial-oracle debt closed while the highest-traffic UM planning document contradicts PM/AD-24; CONFLICT-UM-01 is open on the implementation axis so the blocker register will not catch it either","consumer":"user-management/epics.md:48,:104,:170,:243 - the UM developer's entry point for Epic 0","evidence":"Applied: access-control.md:209-210 (do-not-treat-as-live plus superseded banner with the five-clause oracle) and :187 (short summary linking to the full rule); spec-...-adoption/SPEC.md:6-10 frontmatter denial_oracle plus inline annotations at :109-111,:209,:244,:327; stories.yaml:1-3; umac-05:3-7; access-control-adoption/README.md:3-9. Not applied: user-management/epics.md, where PM/AD-24, PM-FR-4, and CONFLICT-UM-01 do not appear at all"},
  {"lens":"verification-gap","gap_shape":"broken-verification-gap","location":"platform/epics.md:115 - the gate-ID reconciliation oracle","trigger_condition":"Two of the AC's four example IDs are not live gates, so a literal checker cannot pass","guard_snippet":"Correct the examples to TT-IDENTITY-01 and DEPARTMENT-EDGE, and separately decide whether ARCH-PROJ-WRITER-01 should gate PM-FR-2 or PM-FR-37","potential_consequence":"The AC most likely to be automated is the one whose examples do not resolve, so the first run yields a false failure and the check is weakened or dropped","consumer":"Whatever executes Story 1.1's matrix, plus the automation candidate at ARCHITECTURE-RATIFICATION.md:277","evidence":"Parsed every gates: list in the coverage model and resolved each against blockers.yaml: ten distinct IDs, all present, all open. ARCH-ENV-01 in no gates: list, status closed (blockers.yaml:641). ARCH-PROJ-WRITER-01 in no gates: list, status open (blockers.yaml:558)"},
  {"lens":"verification-gap","gap_shape":"other","location":"platform/epics.md:189 - Story 1.6's live TimeTracker gate AC","trigger_condition":"TT-IDENTITY-01 (P0) and TT-PMDM-01 rest solely on docs/integrations/timetracker-external-api.json, which is untracked in git","guard_snippet":"Add an AC to Story 1.6 recording the evidence caveat alongside the gate-ID requirement, so the caveat travels with the gate IDs; committing docs/integrations/ needs a separate owner decision","potential_consequence":"Story 1.6 asserts the live TimeTracker gates are correctly cited - true - while the evidence behind both is not reproducible for anyone else"},
  {"lens":"verification-gap","gap_shape":"other","location":"platform/epics.md:13 - status: final","trigger_condition":"The file declares itself final while carrying uncommitted modifications","guard_snippet":"Commit the file, or add reproducible: working-tree-only to its frontmatter, before Story 1.1 cites it as a baseline; no content change needed","potential_consequence":"Story 1.1 builds a traceability matrix over a final document that resolves at no commit, inheriting the non-reproducibility the ratification package disclosed at :35-40"}
]
```
