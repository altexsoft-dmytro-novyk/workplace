# Epic Number Collision — Audit (Step 1)

**Status:** analysis only. No product artifact was modified by this pass.
**Author pass:** analyst, 2026-09-09.
**Input plan:** [2026-09-09-epic-number-collision-repair.md](2026-09-09-epic-number-collision-repair.md)

---

## 0. Baseline

| Fact | Value |
|---|---|
| Branch | `main` |
| HEAD | `d05581f0a562022c22cd83ca001f2f5e9f713cf9` |
| Dirty (workspace) | `M services/backend` (gitlink), `?? docs/superpowers/plans/2026-09-09-epic-number-collision-repair.md` |
| `services/backend` submodule | `+f7c0385c…` on `heads/fix/restore-db-bootstrap-access-control-1-gf7c0385` — **foreign change, out of scope** |
| `services/frontend` submodule | `fa3d3198…` on `heads/main`, clean |

**Counts before change**

| Surface | Count |
|---|---|
| `platform/epics.md` — `### Story` headings | 36 |
| `platform/sprint-status.yaml` — story keys (incl. 4 `dept-*`) | 24 |
| `user-management/epics.md` — `### Story` headings | 28 (incl. the `0.3 — REMOVED` marker) |
| `user-management/sprint-status.yaml` — story keys | 22 |

Derived: platform tracking is short by **16** described stories, user-management by **5** — the 21 gaps in §6. This reproduces the plan's figures exactly.

---

## 1. Domain scan — what is and is not a collision

All 13 `epics.md` files under `_bmad-output/planning-artifacts/` were scanned for `## Epic N` / `### Epic N` / `### Story N.n` headings.

**Two genuine collisions — one domain, one number, two distinct epic bodies:**

| Domain | Number | Body A | Body B |
|---|---|---|---|
| platform | Epic 4 | `epics.md:668` Access Control Authorization Consolidation | `epics.md:779` Project-Line Audience |
| user-management | Epic 6 | `epics.md:587` Current-State Read Endpoints | `epics.md:725` Custom Fields as Data |

Each also appears twice in its file's Epic List (`platform:144` / `:150`; `user-management:137` / `:141`).

**Legitimate repetition — NOT collisions, must not be "fixed":**

- Epic List entry + epic body for the same epic. Every domain does this by design.
- The same epic number in different domains (`PLAT-E4` vs `UM-E4` vs `PMC-E4` vs `RA-E1`). Namespaces are per-domain; `id_namespace: UM-E{epic}-S{story}` is declared in `user-management/epics.md:11`.
- `_bmad-output/planning-artifacts/epics.md` and `platform-capabilities/epics.md` are **byte-identical in structure** (same headings at the same line numbers). This is a duplicated/aliased file, not a number collision. **Not in scope for this repair — flagged in §7 (A5).**
- `engagement/epics.md` Epic 3/Epic 4 are marked *(superseded)* and re-homed into `risk/` and `feedback/`. Historical, intentional.
- `dept-*` keys in `platform/sprint-status.yaml` are a separate live namespace with no numeric epic. Preserve verbatim.

---

## 2. The migration map — seven stories

Identity used for every row: **domain + epic title + story title + current full key**. The number alone was never treated as sufficient.

### 2.1 platform / Project-Line Audience → Epic 8

Epic heading: `## Epic 4: Project-Line Audience` → `## Epic 8: Project-Line Audience` (`epics.md:779`; Epic List `:150`).
Epic status: `backlog` (declared at `epics.md:781`; **absent from `sprint-status.yaml`**).

| # | Old ID | New ID | Old sprint key | New sprint key | Story title | Body line | Class |
|---|---|---|---|---|---|---|---|
| 1 | `PLAT-E4-S4.1` | `PLAT-E8-S8.1` | `4-1-project-line-derivation-from-explicit-pm-dm-attachments` | `8-1-project-line-derivation-from-explicit-pm-dm-attachments` | Project-Line Derivation from Explicit PM/DM Attachments | `:802` / ID `:804` | active backlog |
| 2 | `PLAT-E4-S4.2` | `PLAT-E8-S8.2` | `4-2-project-line-column-narrowness-and-best-column-merge` | `8-2-project-line-column-narrowness-and-best-column-merge` | Project-Line Column Narrowness and Best-Column Merge | `:854` / ID `:856` | active backlog |
| 3 | `PLAT-E4-S4.3` | `PLAT-E8-S8.3` | `4-3-project-derived-revocation-and-timetracker-outage-withdrawal` | `8-3-project-derived-revocation-and-timetracker-outage-withdrawal` | Project-Derived Revocation and TimeTracker Outage Withdrawal | `:895` / ID `:897` | active backlog |
| 4 | `PLAT-E4-S4.4` | `PLAT-E8-S8.4` | `4-4-project-membership-is-read-only-to-access-control` | `8-4-project-membership-is-read-only-to-access-control` | Project Membership Is Read-Only to Access Control | `:937` / ID `:939` | active backlog |

Preserve unchanged: gates `TT-IDENTITY-01` (P0 open), `SEC-AUTH-01` (P0 open), `ARCH-PROJ-WRITER-01` (P1 open); dependency `ACF-1, ACM-3`; the **SD-8** ACM-9 re-baseline obligation; S8.2's Epic-6 fence; S8.4's independence from S8.1–S8.3; the `blockers.yaml` evidence caveat at `:800`.

### 2.2 user-management / Custom Fields as Data → Epic 8

Epic heading: `## Epic 6: Custom Fields as Data` → `## Epic 8: Custom Fields as Data` (`epics.md:725`; Epic List `:141`).
Epic status: **absent from `sprint-status.yaml`** (no `epic-6` second entry; the tracked `epic-6` is the reads epic).

| # | Old ID | New ID | Old sprint key | New sprint key | Story title | Body line | Class |
|---|---|---|---|---|---|---|---|
| 5 | `UM-E6-S6.1` | `UM-E8-S8.1` | `6-1-define-a-custom-field-with-declared-visibility` | `8-1-define-a-custom-field-with-declared-visibility` | Define a Custom Field with Declared Visibility | `:729` / ID `:731` | active backlog |
| 6 | `UM-E6-S6.2` | `UM-E8-S8.2` | `6-2-set-and-store-custom-field-values` | `8-2-set-and-store-custom-field-values` | Set and Store Custom Field Values | `:751` / ID `:753` | active backlog |
| 7 | `UM-E6-S6.3` | `UM-E8-S8.3` | `6-3-custom-field-values-respect-section-level-access` | `8-3-custom-field-values-respect-section-level-access` | Custom Field Values Respect Section-Level Access | `:769` / ID `:771` | active backlog |

Preserve unchanged: the `RA-E1` cross-slice dependency (`manage custom fields` key + working `isAllowed`); the "do not stub the check / `SEC-AUTH-01` is the negative example" instruction; the PM/AD-32 typed-EAV vs TD-12 jsonb constraint; the cross-boundary note that enforcement belongs to `access-control`.

**Ordering caveat carried forward:** `UM-E7` (Visibility-Safe Filtering) declares **Depends on: Epic 6 (this file)** at `epics.md:797`. That dependency points at *Custom Fields*, so after migration it reads `UM-E7` depends on `UM-E8`. This is correct and intended — the plan states numbers do not imply order. The prose must be updated to say so explicitly, or a future reader will read it as a defect.

### 2.3 Explicitly NOT migrated

| Keeps its number | Why |
|---|---|
| platform Epic 4 — Access Control Authorization Consolidation | `epic-4: done` in tracking; stories `4-1-generalise-section-access-authorisation`, `4-2-default-org-relationship-seed` both `done`; backend commits `37a3aa3`, `b311589`, `ef03c88`, `4ce8bd8`, `8ec35fd`, `de508c9`; ClickUp parent already mapped |
| user-management Epic 6 — Current-State Read Endpoints | `epic-6: in-progress`; `6-1-read-current-manager-and-people-partner: review`; `6-2`…`6-6` `backlog`; ClickUp parent already mapped |
| platform Epics 5, 6, 7 · user-management Epic 7 | No collision; renumbering them would break live references for no gain |
| `dept-epic`, `dept-1`…`dept-4` | Separate live namespace, `backlog` |

---

## 3. Reference inventory — resolved by reading, per reference

The plan's warning is confirmed and is the central finding of this audit.

> **AMBIGUITY-1 (critical).** `PLAT-E4-S4.1` and `PLAT-E4-S4.2` are **each used today for two different stories**. Neither string can be migrated by pattern match. Every occurrence below was classified by reading its surrounding sentence.

**`PLAT-E4-S4.*` → Consolidation (keeps Epic 4, do NOT touch):**

| File | Lines |
|---|---|
| `_bmad-output/planning-artifacts/sprint-change-proposal-2026-09-04-section-access-consolidation.md` | 137, 140, 225–235, 245 |
| `_bmad-output/planning-artifacts/platform/dept-epic.md` | 285 |
| `_bmad-output/implementation-artifacts/platform/spec-4-1a`…`spec-4-1d`, `spec-4-2a`…`spec-4-2d` (title frontmatter) | all 8 files |
| `_bmad-output/implementation-artifacts/platform/spec-4-1d-baseline-2026-09-06.md` | 1 |
| `_bmad-output/implementation-artifacts/platform/story-4-1-generalise-section-access-authorisation.md` | 7, 19 |
| `_bmad-output/implementation-artifacts/platform/story-4-2-default-org-relationship-seed.md` | 6, 13, 19, 105, 118 |
| `_bmad-output/implementation-artifacts/platform/epic-4-context.md` | whole file (already carries its own explicit "Note on epic numbering" disambiguator) |
| `.../architecture-access-control-foundation-2026-08-29/.memlog.md` | 94 (historical) |

**`PLAT-E4-S4.*` / `PLAT-E4` → Project-Line (migrates to `PLAT-E8`):**

| File | Lines |
|---|---|
| `platform/epics.md` | 52, 103, 104, 111, 804, 856, 897, 939, 1613, 1614, 1617, 1625, 1638, 1666 |
| `global-coverage/global-fr-epic-story-coverage.yaml` | 80, 82, 85, 97–100, 104, 110, 171 |
| `global-coverage/.memlog.md` | 33 (historical — leave, add map pointer) |
| `global-coverage/chain-fix/unmapped-stories-classification.md` | 184, 567 |
| `docs/demo/workplace-readiness-data-2026-09-07.json` | 158, 201, 206, 211, 216 — **see AMBIGUITY-3** |

**`UM-E6` → Custom Fields (migrates to `UM-E8`)** — all reachable references are semantically unambiguous, every one is about custom-field visibility:

`global-fr-epic-story-coverage.yaml:182–184, 187, 191, 193, 251` · `platform/epics.md:65, 122, 1393, 1407, 1629, 1662` · `platform-capabilities/epics.md:89, 210, 707` · `role-administration/epics.md:103, 116` · `global-coverage/epic-coverage-review-2026-09-03.md:21` · `global-coverage/.memlog.md:86, 89` (historical) · `prds/prd-people-management-2026-08-24/prd.md:741` · `docs/demo/workplace-readiness-data-2026-09-07.json:374, 379, 384, 400, 406, 541`

**`Epic 6` in prose → Current-State Reads (keeps Epic 6, do NOT touch).** This is the blanket-replace trap the plan named:

`_bmad-output/implementation-artifacts/user-management/deferred-work.md:34, 39, 45, 51, 56, 61, 66, 71, 76, 90, 95` · `user-management/epics.md:716` (`### Epic 6 Sequencing`) · `implementation-artifacts/user-management/epic-6-context.md` (whole file) · `spec-6-1-read-current-manager-and-people-partner.md`

**Range expressions requiring semantic (not literal) rewrite in `platform/epics.md`.** Post-kernel scope is currently written as "Epics 4–7"; after migration the same set is **5, 6, 7, 8** and must never absorb the consolidation epic:

`37, 44, 52, 59, 64, 66, 85, 121, 180, 186, 187, 192, 194, 202, 204, 205, 208, 216, 226, 782, 978, 1140, 1426, 1611, 1631, 1634, 1639, 1643, 1647, 1651, 1657` — plus plain "Epic 4" meaning Project-Line at `53, 1621, 1649, 1659`.

Line `146` contains the historical *"No Epic 4"* note. It is evidence about the 2026-09-02 CE pass. **Keep verbatim.**

**Confirmed clean (checked, zero hits):**

- `services/backend`, `services/frontend` — no `PLAT-E4` / `UM-E6` / `PLAT-E8` / `UM-E8` occurrences anywhere.
- `blockers.yaml` — refers to project-line work **by name** ("project-line audience derivation", `:597`, `:620`), never by epic number. `PLAT-E6-S6.*` references there are the Section Matrix epic, unaffected.
- No cross-file markdown anchor links point into `platform/epics.md` or `user-management/epics.md`. The only `epics.md#…` links in the repo target `engagement/epics.md` (`feedback:13`, `risk:12`) and are untouched.

---

## 4. Status baseline to preserve

| Key | Current status | Source |
|---|---|---|
| `epic-4` (platform, Consolidation) | `done` | `platform/sprint-status.yaml` |
| `4-1-generalise-section-access-authorisation` | `done` | ″ |
| `4-2-default-org-relationship-seed` | `done` | ″ |
| `epic-6` (UM, Current-State Reads) | `in-progress` | `user-management/sprint-status.yaml` |
| `6-1-read-current-manager-and-people-partner` | **`review`** | ″ |
| `6-2`…`6-6` (reads) | `backlog` | ″ |
| all 7 migrating stories | **not in any `sprint-status.yaml`** | — |
| all 7 migrating stories | `status: specified` in coverage | `global-fr-epic-story-coverage.yaml` |

`specified` is a coverage-model value meaning *a story exists that owns this FR*. It is **not** `done` and must not be converted into a tracking status. Migrating stories enter tracking as `backlog`.

**Short-key warning confirmed.** Live sprint keys do not always match the heading slug, so a full regeneration would silently rewrite them:

| Live key | Heading it belongs to |
|---|---|
| `4-1-generalise-section-access-authorisation` | "Generalise section-access authorisation **+ human section keys**" |
| `4-2-default-org-relationship-seed` | "Default org-relationship seed **+ retire the identity-card FR override**" |
| `6-1-read-current-manager-and-people-partner` | "Read an Employee's **Current Reporting-Line** Manager and People Partner" |
| `6-2-read-department-catalog-and-memberships` | "Read the Department Catalog and an Employee's **Current** Memberships" |
| `6-3-list-an-employees-departures` | "List an Employee's Departures" (apostrophe dropped) |
| `6-6-combined-active-and-dismissed-directory-view` | "Combined Active **+** Dismissed Directory View" |

Do not run a full `sprint_plan.py` regeneration. Edit by comparison against a copy.

---

## 5. ClickUp — live audit NOT performed

**No ClickUp credential is present in this environment** (no `CLICKUP_*` / `CU_*` variable; the only `.env` files are `.tt-keys.env*`, TimeTracker). Task IDs, parent IDs, `bmad_key` values and live statuses were **not read**. No mapping below is invented.

**What is verifiable statically** — `scripts/clickup-lib.cjs:14-30`:

| Track | Prefix | Epic parent ID | Currently serves |
|---|---|---|---|
| platform | `1-` | `869eupgh3` | Epic 1 |
| platform | `2-` | `869euphdh` | Epic 2 |
| platform | `3-` | `869euphgj` | Epic 3 |
| platform | `4-` | `869ew04c9` | **Epic 4 Consolidation** (`4-1-generalise…`, `4-2-default-org…`) |
| user-management | `0-`…`5-` | `869euphpm`, `869evaraf`, `869evarr8`, `869evatht`, `869evau1q`, `869evau97` | Epics 0–5 |
| user-management | `6-` | `869ew04uk` | **Epic 6 Current-State Reads** (`6-1-read-current…` … `6-6-combined…`) |

Three consequences, all static-verifiable:

1. **Mapping is prefix-string based** — `key.startsWith(entry.prefix)` at `:101`. There is no `8-` prefix in either track, so every migrated key resolves to `null`, hits `warnUnmappedPrefix` (`:105`) and is **silently skipped, not failed**. Two new epic parents must be created in ClickUp and registered before any `8-*` key can sync.
2. **The migrating stories have never been synced.** They are absent from both `sprint-status.yaml` files, and the sync reads only those files (`findSprintStatusPaths`, `INCLUDED_TRACKS = ['platform','user-management']`). Expect **zero** pre-existing ClickUp tasks under the old keys — but this is an inference from the local files, **not a confirmed live read**. Step 4 must confirm it against the live board before creating anything.
3. **`869ew04c9` and `869ew04uk` must not be reused** as the parents for the migrated epics. They belong to the epics that keep their numbers.

**Live-write trigger.** `.github/workflows/sync-clickup.yml` fires on push to `main` for `**/sprint-status.yaml`, `**/epics.md`, `clickup-sync.yaml`, and the three ClickUp scripts. Both step-2 target files are inside that path filter, so **merging step 2 to `main` triggers live create/sync**. Integration verification before merge is mandatory, per plan constraint.

*(Consistent with the standing note that the ClickUp board is a projection of `main` and syncs only from there.)*

---

## 6. The 21 tracking gaps — named, not resolved

Statuses are **not** assigned here; §1 of step 2 must set each from evidence, defaulting to `backlog` where none exists.

**platform — 16 missing:**

| Epic (after migration) | Stories | Count |
|---|---|---|
| Epic 8 Project-Line Audience | 8.1–8.4 | 4 |
| Epic 5 Department Walk and PP HR-Line | 5.1–5.3 | 3 |
| Epic 6 Section Matrix Beyond the Kernel Slice | 6.1–6.6 | 6 |
| Epic 7 Shared-Link Section Policy and Full-Profile Overlay | 7.1–7.3 | 3 |

**user-management — 5 missing:**

| Epic (after migration) | Stories | Count |
|---|---|---|
| Epic 8 Custom Fields as Data | 8.1–8.3 | 3 |
| Epic 7 Visibility-Safe Filtering and Columns | 7.1–7.2 | 2 |

**DEPT overlap — must be linked, not double-counted.** `platform/dept-epic.md` DEPT-1…DEPT-4 are `backlog` in `platform/sprint-status.yaml`. `dept-epic.md:30` states DEPT work is the *department-management contribution to the reporting line* — i.e. the same substrate as **platform Epic 5** ("Epic 5 substrate", `dept-epic.md:56`). Adding Epic 5 stories 5.1–5.3 to tracking **must** carry an explicit cross-reference to DEPT-1…DEPT-4 rather than presenting 3 new independent stories. No `done` may propagate between them.

Also recorded in `platform/sprint-status.yaml` and unrelated to this repair: the CI gate promotion (`spec-ci-promote-backend-unit-frontend-e2e-gates.md`) landed with no story row; follow-ups live in `platform/deferred-work.md`. Leave alone.

---

## 7. Ambiguities — named, not migrated blindly

**AMBIGUITY-1 — `PLAT-E4-S4.1` / `PLAT-E4-S4.2` are two-valued (critical).**
Resolved by reading, per reference, in §3. **No blanket `PLAT-E4` replacement may be run on this repository.** The classification table in §3 is the only authorised basis for edits. `epic-4-context.md` already carries a hand-written disambiguation note — that note becomes obsolete after migration and should be rewritten to point at the map rather than deleted.

**AMBIGUITY-2 — historical `PLAT-E4-S4.1a`…`S4.2d` sub-increment IDs.**
Eight spec files and two story files address the Consolidation epic's sub-increments. They keep Epic 4 and need no change — **but** they make the string `PLAT-E4-S4.1` permanently load-bearing as *Consolidation*. Any future guard (step 3) that asserts "one story ID → one story" must treat these as legitimate historical references, not collisions. Otherwise the guard fails on correct data.

**AMBIGUITY-3 — `docs/demo/workplace-readiness-data-2026-09-07.json`: live input or frozen snapshot?**
It is date-stamped (reads as a frozen historical snapshot) **but** it is read as a seed by `scripts/build-readiness-map.cjs:11` (reads as a live input). It contains all 7 old IDs and all 7 old sprint keys. **Unresolved — a human decision.** The two defensible outcomes:
- *frozen evidence* → leave verbatim, add a pointer to this map; the readiness map then renders stale IDs;
- *live input* → migrate the 7 IDs/keys in place, at the cost of editing a dated artifact.
Do not migrate it by default. Step 2 must record which reading was chosen and why.

**AMBIGUITY-4 — `role-administration/epics.md:41` prose goes stale.**
It records a PO ruling (2026-09-03) that folding role administration in as `PLAT-E8`/`PLAT-E9` was *considered and rejected*, reasoning that `platform/epics.md` "never claims an eighth concern". After this migration platform **does** have an Epic 8 — a different one. The ruling itself is unaffected (nothing moves into role administration), but the sentence's supporting reason becomes misleading. Flag for a one-line clarification; **do not reverse the ruling.**

**AMBIGUITY-5 — `_bmad-output/planning-artifacts/epics.md` duplicates `platform-capabilities/epics.md`.**
Identical headings at identical line numbers; the root file has no domain directory. Whether one is a stale copy, a symlink-by-convention, or an intentional alias is **not determinable from the files alone**. Neither carries a collision, so this repair does not touch either — but a `PMC-E*` edit applied to only one of them would desynchronise them. Out of scope; raised for a separate decision.

**AMBIGUITY-6 — the Consolidation epic is missing from the FR Coverage Map.**
`platform/epics.md:148` declares Epic 4 Consolidation covers *PM-FR-3 (hardening), NFR-AC-1*. The FR Coverage Map (`:103–112`) lists `PLAT-E4` only in rows where the referent is Project-Line (PM-FR-1, PM-FR-2, and the NFR-AC-1 re-baseline row that names the *post-kernel* E4/E5/E6). PM-FR-3 at `:105` lists `PLAT-E3, PLAT-E6, PLAT-E7` and **not** `PLAT-E4`. So the Consolidation epic's declared coverage is unrepresented. This is a **pre-existing coverage gap that the collision was hiding**, not something the renumbering creates. Migration will make it visible. **Do not close it by adding coverage rows** — that would change FR coverage status, which the plan forbids. Record it and hand it to a coverage pass.

---

## 8. Gate check (step 1)

| Gate condition | Result |
|---|---|
| Unambiguous old→new map | **PASS** — 7 stories, 2 epic headings, each with exactly one successor (§2) |
| Every unresolved two-valued reference recorded, not guessed | **PASS** — AMBIGUITY-1/2/3 recorded with per-reference classification (§3) |
| Nothing migrated at random | **PASS** — no product artifact modified by this pass |
| Statuses / counts captured before change | **PASS** (§0, §4) |
| ClickUp live audit | **NOT PERFORMED** — no credential available; recorded as such, no mappings invented (§5) |

**Carried into step 2 as binding:** the §3 classification tables; the "no blanket replace" rule; AMBIGUITY-3 is a decision to be made and recorded, not a default; §4's baseline statuses; §6's DEPT linkage requirement.
