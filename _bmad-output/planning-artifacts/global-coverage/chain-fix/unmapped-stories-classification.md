# Unmapped stories — classification

**Status: ANALYSIS + PROPOSAL. Nothing here has been applied.** No coverage YAML, no
`verify-coverage.py`, no `approvals.yaml`, no epics.md, no scenario document and no test
file was edited to produce it. Every line number below was read from the working tree.

Date: 2026-09-04 · workspace `0114d1c` · branch `claude/bmad-testarch-trace-a4ddb9`
Companion to `BRIEFING.md`. Consumes `chain-fix/authentication-requirement-proposal.md`.

---

## 1. Scope and method

Check 4 of `global-coverage/verify-coverage.py` (lines 68-82) compares the story-ID
literals it finds in each registered `epics.md` against the story IDs the coverage model
maps to a `PM-FR`. The reverse-direction residue — a story in a slice file that no
requirement claims — used to print under the label *"expected: infra, evidence,
superseded"* and never failed. It now FAILs until each story is mapped or declared in a
new optional top-level key `unmapped_story_exemptions`.

The full list was computed, not sampled:

```
cd _bmad-output/planning-artifacts && python3 global-coverage/verify-coverage.py

FAIL  every unmapped story is declared in unmapped_story_exemptions
  {'PLAT': ['PLAT-E1-S1.1', 'PLAT-E1-S1.3', 'PLAT-E1-S1.4', 'PLAT-E1-S1.6',
            'PLAT-E1-S1.9', 'PLAT-E3-S3.8'],
   'UM':   ['UM-E0-S0.2', 'UM-E1-S1.1', 'UM-E1-S1.5', 'UM-E2-S2.1', 'UM-E2-S2.2'],
   'PMC':  ['PMC-E1-S1.2', 'PMC-E1-S1.9'],
   'ENG':  ['ENG-E3-S3.1', 'ENG-E3-S3.2', 'ENG-E3-S3.3', 'ENG-E3-S3.4', 'ENG-E3-S3.5',
            'ENG-E4-S4.1', 'ENG-E4-S4.2', 'ENG-E4-S4.3'],
   'RA':   ['RA-E1-S1.6']}
```

**22 stories.** Each was located in its slice's `epics.md` (path from `source_slices`,
`global-fr-epic-story-coverage.yaml:30-66`), and its sprint key and story body read.

### 1.1 Result

| Classification | Count | Stories |
|---|---:|---|
| **MAP** | 2 | `UM-E0-S0.2`, `RA-E1-S1.6` |
| **EXEMPT** | 16 | `PLAT-E1-S1.1/1.3/1.4/1.6/1.9`, `PLAT-E3-S3.8`, `PMC-E1-S1.2`, `PMC-E1-S1.9`, `ENG-E3-S3.1…S3.5`, `ENG-E4-S4.1…S4.3` |
| **NEEDS-HUMAN** | 4 | `UM-E1-S1.1`, `UM-E1-S1.5`, `UM-E2-S2.1`, `UM-E2-S2.2` |

The label *"expected: infra, evidence, superseded"* was wrong as a blanket description but
was not wrong about every entry. 16 of 22 genuinely are documentation, NFR-evidence, or
explicitly-superseded work. The damage was that the label was applied without discrimination,
so the 6 that are not — two mappable, four real product-capability gaps — sat inside it
unexamined.

### 1.2 Two findings that change how this list should be read

**(a) The list is not the complete set of unmapped stories.** Check 4 discovers stories by
regex over global-ID *literals* (`verify-coverage.py:58-60`). A story whose global ID is
never written in the slice file is invisible to both directions of the check. In
`platform/epics.md` the ID literals present are:

```
PLAT-E1-S1.1 S1.3 S1.4 S1.6 S1.9 | PLAT-E2-S2.1 | PLAT-E3-S3.1 S3.4 S3.6 S3.8 | E4…E7 (all)
```

`PLAT-E1-S1.2`, `S1.5`, `S1.7`, `S1.8` and `PLAT-E3-S3.2`, `S3.3`, `S3.5`, `S3.7` have
`### Story n.n:` headings and full acceptance criteria but **no global-ID literal**, so
check 4 never sees them. Eight further stories are unmapped-and-undetected. Five of the six
PLAT entries above are in the list only because they happen to be named inside the *FR
Coverage Map table* at `platform/epics.md:106-112`, not because of anything about the
stories themselves. Fixing the exemption key does not fix this; it is a separate defect and
is recorded here rather than silently worked around.

**(b) `PLAT-E1-S1.1` already specifies this exemption mechanism as its own acceptance
criterion.** `platform/epics.md:251`:

> Every `PLAT-E1-S1.x` story resolves to an entry in `global-fr-epic-story-coverage.yaml`,
> or is recorded there as decision/gate-serving work with no PM-FR owner (modelling gap
> called out explicitly).

The exemption key is not a new invention being retro-fitted; a planning story asked for it a
week ago. That is the strongest single argument that the PLAT-E1 exemptions below are
legitimate and not a wave-through.

---

## 2. MAP — 2 stories

### 2.1 `UM-E0-S0.2` → `PM-FR-4`

**Confidence: high.**

`user-management/epics.md:200-217`, *Story 0.2: Adopt the Write Path Dual Gate (UMAC-2) —
CONDITIONAL*, sprint key `0-2-adopt-write-path-dual-gate` (`sprint-status.yaml:50`,
`backlog`). Delivers `PATCH /users/:id` and `PUT /users/:id/photo` gated by both the
functional permission and `write` S1 section access — `200` only when
`isAllowed(V, <edit key>)` **and** `canAccessSection(V,'S1',T) === 'write'`, `403` when
either half fails.

Evidence chain, every link explicit in a repo artifact:

1. The story is in **Epic 0**. `user-management/epics.md:118` FR Coverage Map:
   `| FR-16 | Epic 0 — real facade adoption + ACCESS_CONTROL_PORT rebind … |`.
2. UM's `FR-16` text (`user-management/epics.md:41`) *itself names this story's deliverable*:
   "`PATCH`/`PUT photo` are behind the §2.2 dual gate — blocked on a missing
   `user-management:edit` permission (Open Question)."
3. The coverage model already declares the alias:
   `global-fr-epic-story-coverage.yaml` `PM-FR-4 … aliases: [UM-FR-16, UM-FR-17]`.
4. Its sibling story `UM-E0-S0.1` (the read half of the same FR-16 adoption) is already
   mapped to `PM-FR-4` with `workboard_id: UMAC-1`. `S0.2` is `UMAC-2`, the write half.
5. `PM-FR-4`'s `epics:` list is already `[UM-E0]`, so no epic reference changes.

This is a derivation from the model's own alias table, not a new mapping. `PM-FR-4` is
`in-progress`, which check 2 permits alongside a `backlog`/`specified` story (cf. `PM-FR-1`).

Proposed story entry, if a human accepts it:

```yaml
      - {id: UM-E0-S0.2, workboard_id: UMAC-2, sprint_key: 0-2-adopt-write-path-dual-gate, status: specified}
```

*Not applied.* Note the story is marked **CONDITIONAL** in its own heading — blocked on
Open Decision 1 (no `user-management:edit` permission key exists). That is a scheduling
block, not a mapping block; `PM-FR-6` / `RA-E1` is the epic that would create the key.

### 2.2 `RA-E1-S1.6` → `PM-FR-6`

**Confidence: medium-high.** *This one contradicts the 8-story sample.*

`role-administration/epics.md:249-276`, *Story RA-E1.6: Standalone Capability-Check Endpoint
for Target-Less Actions*, sprint key
`1-6-standalone-capability-check-endpoint-for-target-less-actions`. Added **2026-09-04** —
two days after the coverage model's `baseline_date: 2026-09-02`. It is unmapped because it
is newer than the model, not because it lacks a parent.

The briefing's sample called this "plausibly infrastructure". On reading the body I do not
agree, and the disagreement is evidential rather than stylistic:

- It ships a **client-facing HTTP endpoint** that gates real product features — the story's
  own opening names them: "create a form campaign, view a dashboard, import the population".
  A user-visible action either renders or does not, based on this call.
- `role-administration/epics.md:89` FR Coverage Map: `| PM-FR-6 | RA-E1 (engine/API), RA-E2 (UI…) |`.
- `role-administration/epics.md:99`, Epic RA-E1: **FRs covered: `PM-FR-6` (data/API layer)**.
  S1.6 is an RA-E1 API story; RA-E1 has exactly one declared FR.
- The model already maps every other RA-E1 story (`RA-E1-S1.1`…`S1.5`) to `PM-FR-6`.
- The AC says it is "RA-E1.4's `isAllowed`, exposed here over HTTP" — and `RA-E1-S1.4` is
  itself a `PM-FR-6` story. This is the transport for a capability `PM-FR-6` already owns.

One honest caveat, stated because it is the argument against: the story describes itself as
covering "§2.2's functional axis", and `PM-FR-6`'s `normative_refs` is `["§2.3"]`, not §2.2.
§2.2 is covered in check 7 only transitively, through `PM-FR-1`'s broad `"§2"`
(`verify-coverage.py:146` prefix match). If a reviewer prefers, `PM-FR-6`'s `normative_refs`
could gain `"§2.2"` — but that is a widening of an existing requirement, not a different
parent, and I did not make it.

Proposed story entry:

```yaml
      - {id: RA-E1-S1.6, sprint_key: 1-6-standalone-capability-check-endpoint-for-target-less-actions, status: specified}
```

*Not applied.*

---

## 3. EXEMPT — 16 stories

Each carries a specific reason. "Infra" alone is not used anywhere below.

### 3.1 `PLAT-E1-S1.1`, `S1.3`, `S1.4`, `S1.6`, `S1.9` — documentation-alignment epic

**Confidence: high.**

Platform Epic 1 is *"Platform Spec v1.5 Alignment"*. `platform/epics.md:24` states it in the
epic's own overview: **"This is *not* a fifth user-management feature epic"**, and
`platform/epics.md:26` puts **"application code"** first in its out-of-scope list. The FR
Coverage Map row for the epic is self-referential — `platform/epics.md:108`:
`| PLAT-E1 | PLAT-E1 | PLAT-E1-S1.1–S1.9 |` — the table's way of saying the epic maps to no
FR. No story below changes runtime behaviour; each edits planning, architecture, or
test-design documents.

| Story | Sprint key (`platform/sprint-status.yaml`) | Deliverable | Specific reason |
|---|---|---|---|
| `PLAT-E1-S1.1` | `1-1-changelog-traceability-matrix` (`:41` backlog) | A v1.2→v1.5 changelog traceability matrix; verifies blocker counts against `blockers.yaml` and that every live `gates:` ID resolves | Produces a **traceability artifact about the model**, not product behaviour. Its own AC (`:251`) asks for exactly this exemption record. |
| `PLAT-E1-S1.3` | `1-3-access-control-spec-stage-1-suite-alignment` (`:46` backlog) | Aligns access-control SPEC + Stage-1 scenario prose to the PM/AD-24 401/404/403 denial oracle | **Documentation alignment only.** `platform/epics.md:106` states it verbatim: *"documentation alignment; runtime owner is `UM-E0-S0.1` per coverage model"*. The runtime denial oracle is `PM-FR-4`, already owned by a different story. Mapping this here would double-count `PM-FR-4`. |
| `PLAT-E1-S1.4` | `1-4-architecture-binding-updates` (`:47` backlog) | Updates `ARCHITECTURE-SPINE` AD-10 and `docs/architecture/access-control.md`; marks `OQ-118`/`CC-11` superseded | Same row `:106`, same reason — edits binding architecture prose. The behaviour it documents (Reporting vs Project line) is delivered by `PLAT-E4`/`PLAT-E5`, which **are** mapped (`PM-FR-2`). |
| `PLAT-E1-S1.6` | `1-6-platform-test-design-refresh-v1-2-v1-5` (`:49` backlog) | Refreshes platform test-design/QA/handoff artifacts off stale PRD v1.2 assumptions; records `QUALITY-GATE-AC` / `-AC-NFR` state | **Test-design artifact refresh — evidence layer, no product surface.** `platform/epics.md:107` names `PM-FR-36/37/38` against it, but those are the *subjects the refreshed documents describe*: `PM-FR-36`/`37` are delivered by `TT-E1`/`TT-E2`, and `PM-FR-38` is `coverage_status: deferred` with `epics: []` — attaching a story to it would **break check 2** (`verify-coverage.py:41-44` requires deferred to carry no stories). |
| `PLAT-E1-S1.9` | `1-9-register-epic-in-platform-sprint-status` (`:52` **done**) | Creates the platform `sprint-status.yaml` keys so platform work is not nested under UM epic keys | **Pure sprint-tracking bookkeeping.** Its entire AC is "this YAML file lists these keys". There is no product statement it could trace to. |

### 3.2 `PLAT-E3-S3.8` — NFR performance evidence (ACM-9)

**Confidence: high.** **Relates directly to the sibling access-control finding — see §5.**

`platform/epics.md:618-636`, *Story 3.8: PostgreSQL 500-Target Performance Evidence
(ACM-9)*, sprint key `3-8-postgresql-500-target-performance-evidence-acm-9`
(`platform/sprint-status.yaml:67`, **done**).

Reason: it is a **measurement run that is contractually forbidden from changing behaviour**.
Its first acceptance criterion (`platform/epics.md:628-629`) is *"Run the baseline in
parallel after ACF-1 **without changing behavior** under `services/backend/src/access-control/**`"*,
and its last (`:635-636`) is *"Treat any optimization as a separate gated story and do not
claim the full `/users` list/projection NFR."* It records p50/p95/worst case, query count,
PostgreSQL version and `EXPLAIN (ANALYZE, BUFFERS)`.

Its owning obligations are `NFR-AC-1` and `NFR-AC-3` (`platform/epics.md:70,72`) and the
gate `QUALITY-GATE-AC-NFR`. **The canonical set `PM-FR-1..42` is functional requirements
only** — there is no non-functional requirement in it, so an NFR-evidence story has no
`PM-FR` to map to by construction. This is the cleanest EXEMPT in the list.

### 3.3 `PMC-E1-S1.2` — presentation floor and accessibility

**Confidence: medium-high.**

`platform-capabilities/epics.md:418-472`, *Story 1.2: Directory Page Chrome and Presentation
Floor*, sprint key `1-2-directory-page-chrome-and-presentation-floor`.

Reason: it is the **presentation layer over rows another story produces**, split out of
Story 1.1 at Step 4 validation. Its own note (`:425`) draws the line: *"Story 1.1 owns the
row projection, its leak matrix, and pagination; this story owns everything presentational
over those rows."* Its ACs are a `Skeleton` loading state, the `.pghd` header band
typography tokens, a `.prov` provenance tag, keyboard focus rings and tab order,
`prefers-reduced-motion`, three responsive breakpoints, Cyrillic/bidi/max-length name
rendering, and a row-hover inset shadow. Its governing requirements are UX-DRs, not FRs —
`platform-capabilities/epics.md:223`: *"UX-DR1–UX-DR3 (nav, page header band, provenance) |
Epic 1 | Shared chrome **delivered** here"*, plus NFR-5 (responsive + accessible) at `:221`.
The `PM-FR-8` directory behaviour it renders is owned by `PMC-E1-S1.1`, which is mapped.

**One clause deliberately flagged rather than buried.** This story also renders the amber
timetracker-stale banner, and that banner *is* normative product text
(`docs/project-requirements.md` §5.1: *"behind a visible banner saying the data is not
fresh"*, and *"the banner has to be visible rather than decorative"*). It is not orphaned:
`PM-FR-37` (§5.1) owns it and `timetracker/epics.md:469,479` carries the banner acceptance
criteria explicitly (*"a visible stale-data banner is present on surfaces that show
timetracker-sourced project data (TT-DR2, requirements §5.1)"*). `PMC-E1-S1.2` **consumes**
that contract on the directory surface; `platform-capabilities/epics.md:227` records it as
an addition beyond `EXPERIENCE.md`. If a reviewer disagrees and wants the rendering surface
counted as `PM-FR-37` delivery, this is the story to argue about — I did not map it, because
`PM-FR-37`'s stories are all `TT-E2` and crossing that boundary is a product call.

### 3.4 `PMC-E1-S1.9` — NFR performance evidence (directory read model)

**Confidence: high.**

`platform-capabilities/epics.md:737-772`, *Story 1.9: Directory Performance Evidence at 500+
Rows*, sprint key `1-9-directory-performance-evidence-at-500-rows`.

Same shape as `PLAT-E3-S3.8`, one layer up. It measures the shared directory read model
against the two-second budget at 500+ rows including permission resolution, and records
p50/p95/worst case, query count, fixture breadth/depth, PostgreSQL version and
`EXPLAIN (ANALYZE, BUFFERS)`, cited by path into `QUALITY-GATE-AC-NFR`. Its owning
obligation is **NFR-3 / SM-4** (`platform-capabilities/epics.md:219`), a non-functional
requirement with no `PM-FR` counterpart. Its final AC (`:771`) forbids it from claiming the
threshold is met on a measured failure, and routes optimization to *"a separately gated
story"* — so it delivers no behaviour, by design.

Worth recording for the model's benefit: `:219` states the evidence is measured **once on
the shared read model**, not per surface, and `:766-767` makes this run the single evidence
source for both the directory and Epic 2's people-table. That is a deliberate
de-duplication, and exempting the story does not lose it.

### 3.5 `ENG-E3-S3.1…S3.5` and `ENG-E4-S4.1…S4.3` — superseded, redelivered in another slice

**Confidence: high. This is the strongest-evidenced group in the list, and it corrects the
briefing's sample.**

The sample read `ENG-E3-S3.1` (*"record a risk with level, description, details and date"*)
as *"plainly product … reads as PM-FR-21"*. It **is** `PM-FR-21` work — and that is exactly
why it must not be mapped. `PM-FR-21`'s canonical stories are `RISK-E1-S1.1`…`S1.4`, already
in the model. The ENG copies are the superseded originals.

`engagement/epics.md:631-633` says so in the epic heading and a stop-block:

> `## Epic 3: Risk Records and the Scoped Risk Dashboard *(superseded)*`
>
> 🛑 **SUPERSEDED 2026-09-02 — do not schedule.** `PM-FR-21` and `PM-FR-22` are owned by
> `risk/epics.md` (`RISK-E*`). The stories below are retained for historical traceability
> only; `ENG-E3-S3.1` … `ENG-E3-S3.5` are **retired identifiers** and are never reused or
> reassigned. The coverage model points both FRs at `RISK-E*` stories.

`engagement/epics.md:869` for Epic 4: *"**SUPERSEDED** by `feedback/epics.md`. Coverage
owner: `FB-E*`. Do not schedule stories below."* Both epics carry `**Status:** superseded`.

The slice's own FR Coverage Map (`engagement/epics.md:181-183`) routes all three FRs away:

| Row | Reads |
|---|---|
| `PM-FR-21` | `— | **Superseded** → risk/epics.md RISK-E1-S1.1 … S1.4` |
| `PM-FR-22` | `— | **Superseded** → risk/epics.md RISK-E2-S2.1, S2.2, S2.3 (gated)` |
| `PM-FR-35` | `— | **Superseded** → feedback/epics.md FB-E1-S1.1, FB-E1-S1.2, FB-E2-S2.1` |

The redelivery is verifiable by title, not merely by assertion:

| Superseded (ENG) | Canonical (mapped in the model) | Title match |
|---|---|---|
| `ENG-E3-S3.1` Record a risk with level, description, details, and date | `RISK-E1-S1.1` Record a risk with level, description, details, and date | identical |
| `ENG-E3-S3.2` Trend against the previous record | `RISK-E1-S1.3` Trend against the previous record | identical |
| `ENG-E3-S3.3` S6 is never visible to the employee, on any surface | `RISK-E1-S1.4` Verify the S6 wall — the employee reaches risk through nothing | same subject |
| `ENG-E3-S3.4` Scoped risk dashboard — counts, table, and drill-through | `RISK-E2-S2.1` + `RISK-E2-S2.2` | split in two |
| `ENG-E3-S3.5` Risk dashboard filters by department, project, People Partner, and manager | `RISK-E2-S2.3` Filters by department, project, People Partner, and manager | identical |
| `ENG-E4-S4.1` Create a feedback record with an explicit visibility decision | `FB-E1-S1.1` (same title) | identical |
| `ENG-E4-S4.2` S8 read projection and the per-record visibility flag | `FB-E1-S1.2` (same title) | identical |
| `ENG-E4-S4.3` Requested feedback through a form campaign | `FB-E2-S2.1` (same title) | identical |

Mapping any of these eight would **double-count** `PM-FR-21`, `PM-FR-22` or `PM-FR-35` and
would attach a *"do not schedule"* story to a live requirement. The exemption reason is
therefore not "superseded" as a bare word but: *retired identifier, redelivered under
`RISK-E*` / `FB-E*`, which the model already maps*.

**Modelling note, not a change I made.** `global-fr-epic-story-coverage.yaml` already has a
top-level `superseded_work:` key holding four entries (`UMAC-3`, `UM-E1-S1.4`,
`UM-E4-S4.2-LEGACY-MENTORSHIP`, `P-1..P-9`). These eight ENG stories are the same kind of
thing and are absent from it. Check 4 does not read `superseded_work` — it reads only
`unmapped_story_exemptions` — so listing them there instead would not satisfy the check. A
reviewer may reasonably want them in **both**, which is a schema question for §6.

---

## 4. NEEDS-HUMAN — 4 stories

These are the reason the bucket was dangerous. All four are `user-management`, all four are
product capability, and in every case the model has **no canonical requirement to map to**.
Neither MAP nor EXEMPT is honest for any of them.

### 4.1 `UM-E2-S2.1` and `UM-E2-S2.2` — magic-link authentication

**Confidence: high that this is NEEDS-HUMAN. Blocked on an open decision, not on analysis.**

`user-management/epics.md:340` `UM-E2-S2.1` *Request a Magic Link by Work Email* and `:359`
`UM-E2-S2.2` *Consume a Magic-Link Token to Establish a Session*; sprint keys
`2-1-request-a-magic-link-by-work-email` and
`2-2-consume-a-magic-link-token-to-establish-a-session`
(`user-management/sprint-status.yaml:64-65`, both `backlog`). Together they are the
product's only login path: `POST /auth/magic-link`, `POST /auth/magic-link/consume`, an
account-enumeration guard, token expiry, single-use replay rejection.

**Cross-reference: `chain-fix/authentication-requirement-proposal.md`.** That paper's
verified finding governs these two stories and I am not re-deciding it here:

- `docs/project-requirements.md:514` §4.17 *"Population, departments and authentication"*
  contains a normative authentication mandate at line 519 — *"Authentication is your own
  implementation over the seeded population, and the seeded record is the identity anchor."*
- The **only** requirement citing §4.17 is `PM-FR-42`, whose summary is *"Nested department
  management and exactly-one membership"* — it covers that section's **departments clause
  and nothing else**.
- Authentication is therefore normatively mandated and has **no requirement**. Check 7 cannot
  see it because it matches section numbers, not clauses, so §4.17 reports as covered.
- A `PM-FR-43` is proposed (option (a), recommended) but **NOT decided**. Option (b) makes
  these two stories the first entries of `unmapped_story_exemptions`.

**Classified NEEDS-HUMAN pending that ruling.** Under option (a) both leave this task's
scope entirely and become `PM-FR-43` stories; under option (b) both become EXEMPT entries
with the reason *"authentication declared outside the canonical requirement set per
decision <ref>"*. They are **not** in the proposed YAML block in §6, because writing them in
would pre-empt the decision in the direction the sibling task recommended against.

**Do not copy `specs/spec-user-management-domain/SPEC.md:114`.** It asserts
`| Magic-link authentication | PM-FR-12–13 | UM-FR-2, UM-FR-3 | UM-E2 | specified |`. The
sibling task verified this is **false**: `PM-FR-12` is *"Section-based profile rendering"*
(§4.2, §3.2 S1) and `PM-FR-13` is *"Employee self-service across authorized profile
capabilities"* (§4.3); neither concerns signing in, and neither lists a `UM-E2` story. I
confirmed both requirement bodies independently in
`global-fr-epic-story-coverage.yaml` while producing this file. That line is a false
traceability claim in a canonical document and must be corrected by whichever option is
chosen — it is not a mapping anyone may reuse.

### 4.2 `UM-E1-S1.1` — import the seeded population

**Confidence: high. This is a second, independent clause-level gap in §4.17 of exactly the
same shape as the authentication one, and it has not been written up before.**

`user-management/epics.md:227` *Story 1.1: Import Seeded Population*, sprint key
`1-1-import-seeded-population` (`sprint-status.yaml:54`, `backlog`). It delivers
`POST /users/import` (multipart, HR-Admin-only) plus a deploy-script entrypoint, parsing the
semicolon-delimited TT export `docs/Accounts_template.csv` into `User` rows with the full S1
field mapping, keyed on normalized `workEmail`; structurally invalid file → `400` nothing
written, row errors → `200` with a per-row `skipped`/`errors[]` summary; idempotent
re-import. Thirteen Stage-1 scenarios (`um-seed-01`..`um-seed-13`) back it.

This is the story that creates **every user in the system**. Nothing else in the product
creates one — `docs/project-requirements.md:516`: *"**Creating employees is out of scope for
this iteration.** There is no provisioning flow to build."*

The normative mandate is `docs/project-requirements.md:518`, the **first bullet of §4.17**:

> **The initial population is a seeded list.** A test user list has been generated and
> imported into the timetracker test environment, and is delivered on **26 August**. Import
> it into the platform; those users are the population you work with […]

That is a positive instruction to build an importer. §4.17 has three clauses — population,
authentication, departments — and **`PM-FR-42` covers only the third**. The sibling paper
found the authentication clause orphaned; the population clause is orphaned by the same
mechanism, and check 7 is equally blind to it.

Verified there is no other candidate parent. Searching all 42 requirement summaries for
`import|seed|population|listing` returns **zero** matches. UM's local `FR-1`, `FR-4`,
`FR-5a`, `FR-7` all route to Epic 1 (`user-management/epics.md:119-123`) and none of the
four has an alias anywhere in the model (`aliases:` appears on 15 requirements; the complete
alias set is `UM-FR-5,6,9,10,11,12,13,14,16,17` and `M-FR-1..17` — no `UM-FR-1/4/5a/7`).

Three secondary clauses of the story *do* touch mapped requirements, and none of them is the
story's primary deliverable — recording them so nobody mistakes a fragment for the whole:

- Department create-on-import plus one `DepartmentMembership` per person touches `PM-FR-42`
  (*"exactly-one membership"*), whose story is `UM-E4-S4.3`.
- `IsDismissed`/`DismissedDate` → an `EmploymentStatus` row touches `PM-FR-41` (§4.16),
  whose stories are `UM-E5-S5.1/5.2`.
- The `joined_company` system event at import touches `PM-FR-28` (*"Automatic career
  timeline events"*), whose story is `UM-E3-S3.1`.

**Recommendation for the human:** treat this together with the `PM-FR-43` decision, since
both are §4.17 clause-level derivation failures found in the same week. If §4.17 is split so
its three clauses stop sharing one section number, `PM-FR-42`, the proposed `PM-FR-43`, and a
population requirement would all want re-pointed refs in one pass rather than three.

### 4.3 `UM-E1-S1.5` — list employees with pagination and filters

**Confidence: medium. Product capability, certainly. Contested ownership, not a clean gap.**

`user-management/epics.md:306` *Story 1.5: List Employees with Pagination and Filters*,
sprint key `1-5-list-employees-with-pagination-and-filters` (`sprint-status.yaml:60`,
`backlog`). `GET /users` returning a page plus pagination metadata; filters on `country`,
`position`, `city`; dismissed people absent from the default list but reachable through an
authorized employment-status filter.

Its local parent is UM's `FR-15` (`user-management/epics.md:56`), which has **no alias in
the model**. Two canonical requirements are plausible parents and I decline to pick between
them, because the slice files actively contradict each other:

**Candidate `PM-FR-8`** — *Universal profile-field filters and columns*, `["§4.1"]`.
§4.1 (`docs/project-requirements.md:227`) names *"Country, join year, … position, … employment
status"* as filters, which is exactly this story's filter set. **But** UM's own `FR-15` ends
*"The full §4.1 directory remains platform scope"*, and the story's scope note repeats it:
custom fields, saved views, export and inline editing *"remain owned by the platform
directory scope rather than this bounded-context epic"*. The slice disclaims §4.1 while
delivering §4.1 behaviour.

**Candidate `PM-FR-4`** — *Assemble authorized responses server-side on every request*,
`["§3.3"]`, aliases `[UM-FR-16, UM-FR-17]`. `UM-FR-16` covers `isAllowed` for the
`user-management:list` key, so the **authorization** of this endpoint already belongs to
`PM-FR-4`. It says nothing about pagination or filtering.

**The seam that a human has to rule on.** `PMC-E1-S1.1` is mapped to `PM-FR-8`, and
`platform-capabilities/epics.md:425` states that Story 1.1 *"owns the row projection, its
leak matrix, and **pagination**"*. `UM-E1-S1.5` also owns pagination, over the same `User`
rows. Either one endpoint is being specified twice in two slices, or there is a genuine
UM-base / PMC-directory layering that no artifact writes down. Mapping `S1.5` to `PM-FR-8`
would assert the layering by fiat and cross a boundary the UM slice explicitly refuses;
mapping it to `PM-FR-4` would file a filtering feature under a response-assembly requirement.

**A fourth acceptance criterion belongs elsewhere again**, and is worth stating because it is
the one clause that *is* cleanly owned: *"Colin is absent by default but can be found through
an authorized employment-status filter (FR-15, FR-6)"* is a literal restatement of §4.16
(`docs/project-requirements.md:505`: *"drops out of the default employee list, while staying
filterable"*), which is `PM-FR-41`.

Per the briefing's rule — prefer NEEDS-HUMAN over a guess — this is left unmapped and
unexempted. It is **not** in the §6 YAML block.

---

## 5. Relationship to the sibling access-control finding (ACM-0/2/4/8/9)

The third sibling task found that kernel workboard items **ACM-0, ACM-2, ACM-4, ACM-8 and
ACM-9 are absent from the coverage model entirely**. One story in my list is directly one of
them, and the finding is broader than it first appears:

- **`PLAT-E3-S3.8` *is* ACM-9** (`platform/epics.md:618`, sprint key
  `3-8-postgresql-500-target-performance-evidence-acm-9`). It appears in check 4's failure
  list; I classify it EXEMPT (§3.2). For ACM-9 specifically the absence is **correct rather
  than an oversight** — it is NFR evidence, and the canonical set holds no NFRs. The other
  four are a different matter.
- **The remaining four are invisible to check 4 as well as to the model.** Cross-referencing
  the ACM ids in `platform/epics.md` against the story-ID literals present in that file:

  | Workboard | Story | Global-ID literal in file? | In coverage model? |
  |---|---|---|---|
  | ACM-0 | `PLAT-E3-S3.3` Deploy-Time Root User Prerequisite (`:469`) | **no** | no |
  | ACM-1 | `PLAT-E3-S3.4` (`:106`+) | yes | yes — `PM-FR-1` |
  | ACM-2 | `PLAT-E3-S3.5` Evaluate `isAllowed` (`:562`) | **no** | no |
  | ACM-3 | `PLAT-E3-S3.1` | yes | yes — `PM-FR-2` |
  | ACM-4 | `PLAT-E3-S3.2` Multi-Audience Merge (`:445`) | **no** | no |
  | ACM-5 | `PLAT-E3-S3.6` | yes | yes — `PM-FR-3` |
  | ACM-8 | `PLAT-E3-S3.7` Compose the Deployable Kernel (`:600`) | **no** | no |
  | ACM-9 | `PLAT-E3-S3.8` | yes | no — EXEMPT per §3.2 |

  So the model knows about exactly the three ACM items whose stories happen to be written in
  global-ID form. **ACM-0, ACM-2, ACM-4 and ACM-8 are missing from the model *and* cannot be
  detected by check 4**, because §1.2(a)'s literal-matching blind spot hides them. Adding the
  exemption key does nothing for them. `ACM-2` (*Evaluate `isAllowed`*) and `ACM-8`
  (*Compose the Deployable Kernel*) are shipped production code, `done` in
  `platform/sprint-status.yaml`.

- **`UM-E1-S1.1` depends on ACM-0.** Its kernel-reality constraint DEC-UM-009
  (`user-management/epics.md`, Story 1.1) requires that *"ACM-0 (`npm run db:seed`) has
  already created the single active root `User` … before import runs"*, and a CSV row
  matching `ROOT_WORK_EMAIL` updates that root row in place. So a NEEDS-HUMAN story with no
  requirement (§4.2) has a hard ordering dependency on a kernel story the model does not
  know exists. `platform/epics.md:349` records `DEC-UM-009` as *"load-bearing for ACM-0
  root-row reuse — cited by Platform Story 3.3, UM Story 1.1, and the kernel MVP spec; must
  not be retired."*

Flagged for whoever owns the access-control mapping task; I made no change on their behalf.

---

## 6. Proposed `unmapped_story_exemptions:` block

### 6.1 Shape — read this before pasting

**As patched, check 4 tests plain membership.** `verify-coverage.py:72,75-76`:

```python
exempt = set(d.get('unmapped_story_exemptions') or [])
declared   = {k: [s for s in v if s in exempt]     for k, v in extra.items()}
unexplained = {k: [s for s in v if s not in exempt] for k, v in extra.items()}
```

`set(...)` over the loaded value and `s in exempt` mean the key must be a **flat list of
story-ID strings**. A list of mappings (`- {id: X, reason: Y}`) would load as a set of
`dict`s — unhashable, so `set()` raises `TypeError` and the script dies before check 4
prints. A mapping of `id: reason` would work by accident (`in` tests keys) but is not what
the check was written for.

**I am proposing a flat list plus YAML comments.** The reasons are therefore *documentation,
not data* — invisible to every tool, including this check. That is stated plainly rather
than implied, because it is the same failure mode that created this problem: a bucket whose
justification lived only in a label.

If the reason must be machine-readable — and after this exercise there is a case for it —
that is a **schema change**, and it is not free. The minimum honest version is three lines:

```python
_ex = d.get('unmapped_story_exemptions') or []
exempt = set(_ex) if not isinstance(_ex, dict) else set(_ex)
# and, if reasons become mandatory:
noreason = [k for k, v in (_ex.items() if isinstance(_ex, dict) else []) if not str(v).strip()]
check("every exemption carries a reason", not noreason, str(noreason))
```

with the YAML becoming `id: reason` pairs. I did **not** make that change — `verify-coverage.py`
is off-limits for this task — and I flag it as the reviewer's call. A reason that no check
enforces will rot exactly the way `"expected: infra, evidence, superseded"` rotted.

### 6.2 The block

Contains **only** the 16 EXEMPT stories. The 2 MAP stories belong in `requirements[].stories`
(§2); the 4 NEEDS-HUMAN stories are deliberately absent and **check 4 will still FAIL on
them** until they are ruled on. That is intended — it is the check doing its job, not an
incomplete deliverable. Suggested placement: top level, immediately before `superseded_work:`.

```yaml
# Stories that exist in a slice's epics.md and deliberately have no PM-FR owner.
# Every entry needs a specific reason. "Infra" is not a reason — that label is what let
# UM-E2 (magic-link login) hide in this bucket. Classification and evidence:
# global-coverage/chain-fix/unmapped-stories-classification.md
#
# NOTE: check 4 reads this as a flat set of IDs (verify-coverage.py:72, `s in exempt`).
# The reasons below are comments — no check enforces them. See §6.1 of the classification.
unmapped_story_exemptions:

  # --- PLAT Epic 1: documentation-alignment epic, not a feature epic. --------------------
  # "This is *not* a fifth user-management feature epic" (platform/epics.md:24); application
  # code is out of scope (:26); the FR Coverage Map row is self-referential (:108).
  # PLAT-E1-S1.1's own AC (:251) asks for precisely this record.
  - PLAT-E1-S1.1   # v1.2->v1.5 changelog traceability matrix; an artifact about the model
  - PLAT-E1-S1.3   # access-control SPEC/Stage-1 prose aligned to the PM/AD-24 denial oracle;
                   # ":106" states the runtime owner is UM-E0-S0.1 (PM-FR-4), not this story
  - PLAT-E1-S1.4   # architecture binding prose (AD-10, access-control.md); behaviour it
                   # documents ships in PLAT-E4/E5, which are mapped to PM-FR-2
  - PLAT-E1-S1.6   # test-design artifact refresh off stale PRD v1.2 assumptions. PM-FR-36/37
                   # ship in TT-E1/TT-E2; PM-FR-38 is deferred with epics: [] and attaching a
                   # story to it would break check 2
  - PLAT-E1-S1.9   # sprint-status bookkeeping: registers platform keys so platform work is
                   # not nested under UM epic keys. No product statement to trace to

  # --- NFR evidence: measurement runs, contractually behaviour-free. ---------------------
  # PM-FR-1..42 are functional requirements only, so an NFR-evidence story has no PM-FR to
  # map to by construction.
  - PLAT-E3-S3.8   # ACM-9: 500-target resolver evidence (p50/p95/EXPLAIN). Its first AC
                   # forbids changing behaviour under src/access-control/**; owned by
                   # NFR-AC-1/NFR-AC-3 and QUALITY-GATE-AC-NFR
  - PMC-E1-S1.9    # directory read-model evidence at 500+ rows incl. permission resolution.
                   # Owned by NFR-3/SM-4; optimization routes to a separately gated story

  # --- Presentation layer over rows another mapped story produces. -----------------------
  - PMC-E1-S1.2    # directory page chrome, a11y floor, responsive breakpoints, provenance
                   # tag. Split from PMC-E1-S1.1 at Step 4 (":425"); governed by UX-DR1-DR3
                   # and NFR-5. PM-FR-8 behaviour is PMC-E1-S1.1's. The §5.1 stale banner it
                   # renders is owned by PM-FR-37 / TT-E2 (timetracker/epics.md:469,479)

  # --- Superseded 2026-09-02: retired identifiers, redelivered in the risk slice. --------
  # engagement/epics.md:631-633 "do not schedule ... never reused or reassigned".
  # Mapping any of these would double-count PM-FR-21/PM-FR-22 against live RISK-E* stories.
  - ENG-E3-S3.1    # record a risk           -> RISK-E1-S1.1 (PM-FR-21)
  - ENG-E3-S3.2    # trend vs previous       -> RISK-E1-S1.3 (PM-FR-21)
  - ENG-E3-S3.3    # the S6 wall             -> RISK-E1-S1.4 (PM-FR-21)
  - ENG-E3-S3.4    # scoped risk dashboard   -> RISK-E2-S2.1 + S2.2 (PM-FR-22)
  - ENG-E3-S3.5    # risk dashboard filters  -> RISK-E2-S2.3 (PM-FR-22)

  # --- Superseded: retired identifiers, redelivered in the feedback slice. ---------------
  # engagement/epics.md:869 "SUPERSEDED by feedback/epics.md. Coverage owner: FB-E*."
  - ENG-E4-S4.1    # create feedback record  -> FB-E1-S1.1 (PM-FR-35)
  - ENG-E4-S4.2    # S8 read projection      -> FB-E1-S1.2 (PM-FR-35)
  - ENG-E4-S4.3    # requested feedback      -> FB-E2-S2.1 (PM-FR-35)

  # DELIBERATELY ABSENT — do not add without a ruling. See §4 of the classification.
  #   UM-E2-S2.1 / UM-E2-S2.2  magic-link login. §4.17's authentication clause
  #     (project-requirements.md:519) is normative and has no requirement; PM-FR-42 covers
  #     only that section's departments clause. PM-FR-43 is PROPOSED, not decided —
  #     chain-fix/authentication-requirement-proposal.md. Under option (a) these become
  #     PM-FR-43 stories, not exemptions.
  #     Do NOT reuse SPEC.md:114's "PM-FR-12-13" claim; it was verified false.
  #   UM-E1-S1.1  import the seeded population. §4.17's *population* clause
  #     (project-requirements.md:518) is orphaned the same way. No PM-FR summary mentions
  #     import/seed/population. Second clause-level gap in the same section.
  #   UM-E1-S1.5  list employees with pagination and filters. Contested between PM-FR-8
  #     (§4.1 filters/columns — which the UM slice explicitly disclaims) and PM-FR-4
  #     (permission-safe assembly), and it overlaps PMC-E1-S1.1's declared ownership of
  #     pagination and row projection.
```

### 6.3 Expected effect on check 4

Not simulated by running the script — nothing on disk was modified. Reading the check's own
logic (`verify-coverage.py:72-82`), with this block in place the FAIL detail reduces from 22
stories across 5 slices to:

```
FAIL  every unmapped story is declared in unmapped_story_exemptions
      {'UM': ['UM-E0-S0.2', 'UM-E1-S1.1', 'UM-E1-S1.5', 'UM-E2-S2.1', 'UM-E2-S2.2']}
```

and PLAT, PMC, ENG and RA move to the `INFO stories in a slice with no FR mapping, declared
exempt` line. Adding the two §2 story entries removes `UM-E0-S0.2` and `RA-E1-S1.6`, leaving
the four NEEDS-HUMAN stories as the entire residue. **Check 4 cannot pass until a human
rules on §4** — by design.

No other check is touched: no requirement is added or removed (check 1), no
`coverage_status` changes (check 2), no slice registration changes (check 3), the two MAP
entries add stories to epics already listed in their requirements' `epics:` (check 5), no
gate ID is introduced (check 6), no `normative_refs` changes (check 7), and no scenario
document's `**Trace:**` line is edited (check 8).

---

## 7. What was deliberately not done

`approvals.yaml` was not opened for writing. No test file under `services/backend/` was
touched. `global-fr-epic-story-coverage.yaml` and `verify-coverage.py` were read only. No
`**Trace:**` line was edited. No `PM-FR` mapping was invented: the two MAPs in §2 each rest
on an explicit statement in a repo artifact (`PM-FR-4`'s own `aliases:` list, and RA-E1's
declared `FRs covered: PM-FR-6`), and the four cases where no such statement exists are
recorded as NEEDS-HUMAN rather than resolved. `python3 global-coverage/verify-coverage.py`
reports exactly what it reported before this file existed.
