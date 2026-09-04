# Access-control scenario → PM-FR mapping proposal

**Status: PROPOSAL. Nothing here has been applied.** No scenario document, no
`approvals.yaml`, no test, no coverage YAML and no `verify-coverage.py` was
edited to produce it. It exists so one human can rule on ~8 decisions instead of
inspecting 253 files.

Scope: the 253 scenario documents under `docs/test-cases/` in
`access-control` (171), `access-control-kernel` (73) and
`access-control-foundation` (9) — 253 of the 317 check-8 failures.

Date: 2026-09-04 · workspace `0114d1c`

---

## 0. Headline numbers

| Bridge | Newly resolved | Running total of 253 |
| --- | ---: | ---: |
| 1. `§` join against `normative_refs` (mechanical, no judgment) | 169 | 169 |
| 2. `workboard_id` join, already present in the coverage YAML (mechanical) | +51 | 220 |
| 3. `AD-n` table (judgment, evidenced) | +11 | 231 |
| 4. `CAP-n` table (judgment, evidenced) | +16 | 247 |
| **Residue — cannot determine** | | **6** |

The two mechanical bridges alone reach **220 of 253 (87%)** without a single act
of judgment. Everything a human has to *rule on* concerns the last 33 documents
plus two structural questions (§1.3, §5).

16 distinct PM-FRs are touched. The distribution is concentrated as expected for
an access-control corpus: PM-FR-3 (172 docs), PM-FR-1 (51), PM-FR-2 (42),
PM-FR-37 (18), PM-FR-6 (13), PM-FR-7 (12), then a tail of PM-FR-4, -5, -12, -13,
-14, -26, -32, -33, -36, -41.

---

## 1. Bridge 1 — the `§` join (primary, mechanical)

### 1.1 The join

Every requirement in
`_bmad-output/planning-artifacts/global-coverage/global-fr-epic-story-coverage.yaml`
carries `normative_refs` into `docs/project-requirements.md` (lines 74, 91, 125,
159, … 840). 169 of the 253 scenario documents cite the same sections in their
`**Trace:**` line. Join on the section token, matching a section to a
`normative_ref` when either is a prefix of the other (`§3.3.4` matches `§3.3`).

**Result: 169 of 253 resolve on the `§` token alone.**

| Area | docs | resolved by `§` |
| --- | ---: | ---: |
| `access-control` | 171 | 160 |
| `access-control-foundation` | 9 | 7 |
| `access-control-kernel` | 73 | 2 |

The kernel area is a near-total miss because kernel scenarios trace to SPEC
capabilities and the architecture spine, not to requirement sections. The two
kernel hits are
`docs/test-cases/access-control-kernel/fr-bootstrap/acm1-fb-06-no-other-role-attachment-or-grant.md`
(cites §2.3) and
`docs/test-cases/access-control-kernel/inactive-identity/acm3-ii-11-inactive-pp-endpoint.md`
(cites §2.1).

Two parse notes, because the number moves with them:
- `access-control` and `access-control-foundation` use an inline
  `**Trace:** §3.2 S7 · AD-10 · …` line. `access-control-kernel` uses a
  `**Trace:**` heading followed by a bullet list (and one file,
  `access-control-kernel/root-user-prerequisite/acm0-ru-root-user-prerequisite.md`,
  uses a `## Trace` section instead). A parser that reads only the single
  `**Trace:**` *line* returns 167, not 169.
- `verify-coverage.py:174` cuts each document at `## Scenario`. The kernel
  documents have no `## Scenario` heading, so check 8 currently scans their
  whole body. Any implementation of this proposal should use the same window as
  check 8, or the two will disagree.

### 1.2 The `§3.2 Sn` sub-key — do not collapse it

151 of the 171 `access-control` documents cite `§3.2`, the S1–S16 section access
matrix (`docs/project-requirements.md:164-186`). A naive join on `§3.2` alone
maps each of them to **7** PM-FRs (PM-FR-3, -12, -14, -26, -32, -36, -37),
because six requirements name a specific matrix row inside a `§3.2 Sn` ref. That
is a fan-out of 8+ PM-FRs on 136 documents — technically "resolved", practically
useless.

The scenario documents already carry the S-row. Matching `§3.2 S13` against the
`§3.2 S13` in `normative_refs` collapses the fan-out:

| PM-FR per doc | naive `§3.2` join | S-row-aware join |
| ---: | ---: | ---: |
| 1 | 3 | 99 |
| 2 | 1 | 38 |
| 3 | 5 | 16 |
| 4 | 9 | 10 |
| 5 | 0 | 6 |
| 8–10 | 151 | 0 |

**Recommended rule:** `§3.2` (with or without an S-row) always yields
**PM-FR-3** — "Enforce the S1-S16 section access matrix",
`global-fr-epic-story-coverage.yaml:125`, `normative_refs: ["§3.2", "§3.3"]`.
Additionally, when the document names an S-row for which a requirement holds an
explicit `§3.2 Sn` ref, add that requirement.

Only 5 of the 16 matrix rows have such a ref:

| S-row | explicit `§3.2 Sn` owner in the YAML | docs citing it |
| --- | --- | ---: |
| S1 Identity card | PM-FR-12 (line 295), PM-FR-14 (line 316) | 10 |
| S10 Leaves | PM-FR-36 (line 756) | 8 |
| S11 Projects | PM-FR-37 (line 772) | 8 |
| S13 Mentorship | PM-FR-32 (line 700) | 9 |
| S15 Request history | PM-FR-26 (line 539) | 8 |
| S2–S9, S12, S14, S16 | *none* | 80 |
| `§3.2` with a column name (Self / Reporting line / PP / Colleague) or bare | n/a | 16 |

### 1.3 RULING NEEDED — narrow or wide reading of the S-rows

Two defensible readings, and I am deliberately not picking one:

**Reading A (narrow, recommended default).** A `§3.2 Sn` scenario proves *the
matrix cell is enforced*. Its owning requirement is PM-FR-3, plus any explicit
`§3.2 Sn` owner. S2–S9, S12, S14 and S16 scenarios map to **PM-FR-3 only**.
Consequence: 94 `access-control` documents map to the single requirement
PM-FR-3. That is honest — they *are* all tests of one requirement — but it means
PM-FR-3 alone carries 172 of the 253.

**Reading B (wide).** The matrix rows themselves cross-reference functional
sections inside `docs/project-requirements.md:164-186`, so an S-row scenario
also evidences the requirement that owns the section's *content*:

| S-row | in-matrix cross-reference | would add |
| --- | --- | --- |
| S4 Employment | "employment status (4.16)" | PM-FR-33, PM-FR-41 |
| S8 Feedbacks | "see 4.15" | PM-FR-35 |
| S9 Career timeline | "see 4.9" | PM-FR-28, PM-FR-29 |
| S12 CDS | §4.10 registry | PM-FR-30, PM-FR-31 |
| S14 Action items | "see 4.5" | PM-FR-19 |
| S16 Custom fields | "See 4.1" (+ §3.3.6) | PM-FR-5 |
| S6 Risks | §4.6 (no in-row ref) | PM-FR-21, PM-FR-22 |

Reading B is evidenced by the requirements document itself, not invented. It
spreads coverage across 7 more PM-FRs and would make check 8's bottom-up signal
more informative. Its cost: a scenario that tests *the access decision for the
Risks section* would be recorded as evidence for *the Risks feature*, which it
is not. **My recommendation is Reading A**, with Reading B available if the
reviewer wants the wider bottom-up signal. S6 is the weakest row in B — its
matrix cell carries no cross-reference at all.

---

## 2. Bridge 2 — `workboard_id`, already in the coverage YAML

This bridge was not in the task brief and is worth the reviewer's attention: it
is *already written down* in the canonical model and needs no new vocabulary.

`global-fr-epic-story-coverage.yaml:29` declares
`stable_workboard_ids: [ACF-*, ACM-*, UMAC-*]`, and four stories carry a
`workboard_id`:

| workboard_id | PM-FR | YAML line |
| --- | --- | --- |
| `ACF-1` | PM-FR-2 | 95 |
| `ACM-1` | PM-FR-1 | 79 |
| `ACM-3` | PM-FR-2 | 96 |
| `ACM-5` | PM-FR-3 | 129 |

The SPEC pins each capability to exactly one ACM item
(`_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md:38,69,84,123,133,144,154,176`):
CAP-1=ACM-3, CAP-2=ACM-4, CAP-3=ACM-1, CAP-4=ACM-2, CAP-5=ACM-5, CAP-6=ACM-8,
CAP-7=ACM-9, CAP-8=ACM-0. Every kernel and foundation document's filename begins
with its workboard id (`acm3-ii-…`, `acm1r-fb-…`, `acf-au-…`), and the ACM id is
also stated in the document body.

Joining on workboard id resolves **51 further documents** — the whole ACM-1 /
ACM-1R, ACM-3 and ACM-5 blocks plus the 2 foundation documents whose only
section token is `§7` — for a running total of **220 of 253**, entirely from
data already in the canonical model.

**FINDING — five kernel workboard items have no PM-FR story registration at
all.** `ACM-0`, `ACM-2`, `ACM-4`, `ACM-8`, `ACM-9` appear nowhere in
`global-fr-epic-story-coverage.yaml`. That is the real reason 22 kernel
documents cannot resolve: not a vocabulary mismatch, but a genuine top-down gap.
Registering those five stories under the right PM-FR would fix 22 documents
*and* close a hole in checks 1–7 that nobody has looked at.

---

## 3. Bridge 3 — `AD-n` → PM-FR

### 3.1 STRUCTURAL RULING NEEDED — `AD-n` is namespace-ambiguous

There are **two AD spines** and they collide on AD-1 through AD-4:

- `_bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md`
  — AD-1..AD-35+. AD-1 is "Three-stage quality gate per feature" (line 61).
- `_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md`
  — a **local** AD-1..AD-4. AD-1 is "Foundation boundary" (line 79); AD-4 is
  "Minimal functional-role kernel" (line 115).

The foundation spine states the disambiguation explicitly. Its inherited-invariant
table (lines 65-77) prefixes the parent's decisions `PM/AD-1`, `PM/AD-7`,
`PM/AD-10`, `PM/AD-20`, `PM/AD-24`; its capability map writes
"inherited AD-2, AD-9, AD-10; **local** AD-1".

**Any flat `AD-n → PM-FR` table is therefore unsound.** A mapping must be scoped
by area: in `access-control-kernel`, AD-1..AD-4 are local; AD-5 and above are
inherited. This is the single most important thing for a human to confirm, and it
disqualifies one of the three candidate mechanisms outright (§5).

### 3.2 Which AD numbers these 253 documents actually cite

Computed, not guessed:

| AD | `access-control` | `access-control-kernel` | `access-control-foundation` |
| ---: | ---: | ---: | ---: |
| AD-1 | 3 | 32 | 3 |
| AD-2 | – | 4 | – |
| AD-3 | – | 14 | – |
| AD-4 | – | 18 | – |
| AD-7 | – | 3 | – |
| AD-9 | – | 4 | – |
| AD-10 | 146 | 1 | 5 |
| AD-11 | 4 | 6 | 3 |
| AD-12 | 2 | 6 | 3 |
| AD-19 | 2 | 1 | 2 |
| AD-20 | 4 | 1 | – |

Almost all of these documents are already resolved by bridges 1 and 2. The AD
table is only *load-bearing* for **11 `access-control` documents that cite no
section at all** — the entire `audience-derivation/` and one `fail-closed/`
residue. Those 11 are the AD rows that matter.

### 3.3 The table (only for the 11 documents that need it)

I did not derive these by parsing every `§` mentioned inside an AD's body — that
fans AD-10 out to 14 PM-FRs and is worthless. I used two narrower sources: the
AD's own **subject** (its `Binds:` and first `Rule:` clause), and **sibling
documents in the same folder that cite both the AD and a section**, which is
direct in-corpus evidence of what the authors meant.

| AD | Subject (spine line) | → PM-FR | Evidence | Docs needing it | Confidence |
| --- | --- | --- | --- | ---: | --- |
| AD-10 | Audience resolution is bulk, live, split, never stored (PM spine:121) | PM-FR-2, PM-FR-3 | Siblings `**Trace:** §2.1 · AD-10 · facade-contract.md (Reporting transitivity)` and `**Trace:** §3.2 · AD-10 · facade-contract.md (Audience merge)` in the same folder. AD-10's rule text is the §3.2 matrix columns resolved from §2.1 relations. | 4 | **High** |
| AD-11 | Org-fact schema: typed access edges (PM spine:138) | PM-FR-2 | Sibling `docs/test-cases/access-control/fail-closed/` doc traces `**Trace:** AD-11 · §2.1`. AD-11 defines the `Relationship` rows PM-FR-2 resolves over. | 2 | **High** |
| AD-12 | Fail-closed everywhere; bootstrap by seeded role (PM spine:144) | PM-FR-3, PM-FR-4 | Sibling traces `**Trace:** AD-12 · §2.2`. §3.3 rule 1 ("every cell is strict") is the fail-closed requirement; PM-FR-4 owns §3.3 server-side assembly. **See caveat below.** | 1 (with AD-11) | **Medium** |
| AD-19 | People Partner is a fixed-cardinality organisational relationship (PM spine:199) | PM-FR-2 | AD-19 `Binds: … AccessControl PP audience`; PM-FR-2 is "Resolve Reporting, Project, and People Partner access transitively". Sibling `**Trace:** §2.1 · AD-19 · facade-contract.md Phase 1`. | 1 | **High** |
| AD-20 | Departure is a durable command with fail-closed effective execution (PM spine:207) | PM-FR-41 | Decisive: the one AD-20 document in the same folder that *does* carry a section traces `**Trace:** AD-20 · §4.16 · facade-contract.md (Due target)`. §4.16 → PM-FR-41 (`global-fr-epic-story-coverage.yaml:828`). | 3 | **High** |

**AD-12 caveat.** AD-12 has two halves — "no superuser is derived from data
shape" (fail-closed access resolution → PM-FR-3/PM-FR-4) and "the seed creates
the first user with an explicitly assigned HR Admin functional role"
(bootstrap → PM-FR-6, whose ref is §2.3). The one document needing it,
`docs/test-cases/access-control/fail-closed/ac-fc-02-orphaned-policy-row.md`, is
about an orphaned policy row after a target delete, which is the first half. I
propose PM-FR-3 + PM-FR-4 and flag it.

### 3.4 AD rows I will NOT propose a mapping for

- **AD-1, AD-2, AD-3 (either namespace), AD-9, AD-24.** These are *process and
  architecture* decisions — quality gates, hexagonal boundaries, evidence
  separation, facade entry point, HTTP denial oracle. They bind how work is
  done, not what the product must do. None has a PM-FR and none should be given
  one. AD-1 in particular appears in 32 kernel documents almost entirely as
  "this dispatch is an AD-1 sequence", i.e. procedural boilerplate. **Do not
  alias AD-1.** Every document citing it is resolved by another bridge.
- **AD-4, AD-7.** Functional-role schema decisions. They sit under §2.3, so
  PM-FR-6 is arguable, but every document citing them is already resolved via
  ACM-1/CAP-3, so proposing a mapping would add risk for zero gain.

### 3.5 A stale citation, reported not fixed

`docs/test-cases/access-control/auth/ac-au-01-profile-read-unauthenticated.md`,
`…/ac-au-02-section-read-unauthenticated.md` and
`…/ac-au-03-section-write-unauthenticated.md` all trace
`**Trace:** §3.3.4 · AD-1 global 401 rule`. **AD-1 is not a 401 rule** in either
spine. The 401/404/403 oracle is **AD-24** (PM spine:246) and §3.3 rule 8. The
three documents resolve correctly anyway through §3.3.4 → PM-FR-3, PM-FR-4, so
nothing is blocked — but the citation is wrong and should be corrected by
whoever owns those files under AD-1's own gate, not here.

Related: all 11 AD-only `access-control` documents also cite
`facade-contract.md`, which **does not exist at that name in
`docs/architecture/`**. The only file with that name is
`_bmad-output/specs/spec-access-control-facade-audience-resolution/facade-contract.md`.
Dangling reference; reported, not fixed.

---

## 4. Bridge 4 — `CAP-n` → PM-FR

CAP-1..CAP-8 are defined in
`_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md:38-190`.

Three of the eight need no judgment at all: the SPEC pins them to an ACM item
and the coverage YAML already maps that ACM item to a PM-FR (§2). Those rows are
marked *derived* below and carry the confidence of the YAML itself.

| CAP | SPEC intent (line) | → PM-FR | Reasoning | Docs needing it | Confidence |
| --- | --- | --- | --- | ---: | --- |
| CAP-1 | Fail-closed audience resolution, ACM-3 (38) | PM-FR-2 | **Derived**: CAP-1 = ACM-3; `workboard_id: ACM-3` sits on PLAT-E3-S3.1 under PM-FR-2 (YAML:96). Subject matches: Self / Reporting / direct PP / Colleague derivation = §2.1. | 0 (already resolved) | **High** |
| CAP-2 | Multi-audience input merge, ACM-4 (69) | PM-FR-2 | Same subject as CAP-1 — it validates that the Phase-0 resolver retains every audience. ACM-4 is *not* registered in the YAML, so this is judgment by analogy to ACM-3, not derivation. | 6 | **High** |
| CAP-3 | Functional-role data foundation, ACM-1 (84) | PM-FR-1 | **Derived**: `workboard_id: ACM-1` sits on PLAT-E3-S3.4 under PM-FR-1 (YAML:79). PM-FR-1 is "Separate derived access roles from assigned functional roles" — exactly the FR/AR type separation CAP-3 enforces. | 0 (already resolved) | **High** |
| CAP-4 | Live type-separated permission decision `isAllowed`, ACM-2 (123) | PM-FR-6 *(or PM-FR-4)* | **Two readings — see below.** | 10 | **Medium** |
| CAP-5 | Base S1/S10/S11 section access, ACM-5 (133) | PM-FR-3 | **Derived**: `workboard_id: ACM-5` sits on PLAT-E3-S3.6 under PM-FR-3 (YAML:129). CAP-5 *is* the §3.2 matrix for three rows. | 0 (already resolved) | **High** |
| CAP-6 | Deployable kernel composition, ACM-8 (144) | **cannot determine** | CAP-6's success criterion is "`AppModule` imports `AccessControlModule` … no User Management file, `/users` behavior, or Access Control HTTP/debug endpoint changes." That is a statement about wiring, explicitly asserting *no observable product behavior change*. No PM-FR describes it, and inventing one would manufacture traceability. | 5 | **n/a — flagged** |
| CAP-7 | 500-target PostgreSQL evidence, ACM-9 (154) | **cannot determine** | Performance, i.e. `docs/project-requirements.md` §7 Non-functional requirements. No PM-FR carries a `§7` `normative_ref`; the 42 canonical requirements are functional only. | 0 (no docs) | **n/a — flagged** |
| CAP-8 | Deploy-time root User prerequisite, ACM-0 (176) | **cannot determine** | Deployment bootstrap: `npm run db:seed` leaves exactly one normalized active root User. The nearest section is §4.17 (→ PM-FR-42, "Nested department management and exactly-one membership"), which is about departments, not a root seed. Arguable but not evidenced. | 1 | **n/a — flagged** |

### 4.1 RULING NEEDED — CAP-4 has two defensible owners

CAP-4 is `AccessControlFacade.isAllowed(userId, permissionKey)`: a live,
type-separated functional-permission decision.

- **Reading A — PM-FR-6** ("Runtime functional role and permission
  administration", `normative_refs: ["§2.3"]`, YAML:200). §2.3 is the normative
  home of functional roles and the granular permission catalog. CAP-4 is the
  *enforcement* half of that requirement; CAP-3 is its data half, and CAP-3 is
  already anchored in this family (ACM-1 → PM-FR-1, and PM-FR-1/6/7 all sit on
  §2/§2.3). Against it: the SPEC lists `/roles`, runtime role management and the
  complete §2.3 catalog as explicit **non-goals** (SPEC:~"Non-goals"), so
  PM-FR-6's *administration* framing is a partial fit.
- **Reading B — PM-FR-4** ("Assemble authorized responses server-side on every
  request", `normative_refs: ["§3.3"]`, YAML:159). §3.3 rule 5 is
  "access is evaluated server-side per section on every request", and CAP-4's
  defining property is that it reads live data and persists/caches no decision.
  Against it: PM-FR-4 is about *response assembly per section*, while CAP-4
  explicitly "grants no audience or section access".

I lean to **Reading A (PM-FR-6)** because the subject matter — functional
permissions — belongs to §2.3, and Reading B's requirement is section-scoped in
a way CAP-4 explicitly is not. This is the row I am least sure of, and it
governs 10 documents.

---

## 5. Mechanism — where the mapping should live

### 5.1 Option A — `aliases:` in the coverage model. **Reject.**

The existing `aliases` field (YAML:77, 162, 180, …) is a flat, global
token → PM-FR list, consumed by `verify-coverage.py:157-159`. Three problems,
the first fatal:

1. **It is unsound for `AD-n`.** `aliases` has no area scope. `AD-1` means
   "Three-stage quality gate" in the people-management spine and "Foundation
   boundary" in the access-control-foundation spine (§3.1). A flat table must
   pick one and will be wrong for the other area. `verify-coverage.py:163-170`
   already had to add an area-scoped `candidates()` helper for exactly this class
   of problem with bare `FR-n`; `AD-n` is the same disease, worse.
2. It does not work without also changing the matcher. `TOK` at
   `verify-coverage.py:172` is `\b(?:PM-FR-\d+|FR-M?\d+[a-z]?)\b` — it cannot
   see `AD-10`, `CAP-3`, `§3.2 S13` or `ACM-1`. Any alias route requires editing
   the verifier anyway, so "reuse the existing field" is not actually cheaper.
3. It flattens two genuinely different relations — "this old id *is* this
   requirement" (what `aliases` means today, e.g. `UM-FR-16`) and "this
   architecture decision *serves* this requirement" (many-to-many, indirect).
   Overloading the field loses that distinction permanently.

### 5.2 Option B — an explicit mapping section in the coverage YAML. **Recommended.**

A new top-level block, area-scoped, e.g.:

```yaml
scenario_vocabulary_bridges:
  # § and workboard_id need no table — they are joins against existing fields.
  ad:
    - {area: access-control, token: AD-10, pm_fr: [PM-FR-2, PM-FR-3], basis: "…"}
  cap:
    - {area: access-control-kernel, token: CAP-4, pm_fr: [PM-FR-6], basis: "…"}
```

Why:
- **It can be area-scoped**, which `aliases` cannot, so it is the only option
  that is *correct* in the presence of two AD namespaces.
- **One file, one review, one diff.** A human approves ~10 rows in one sitting —
  which is the stated goal — instead of reviewing 253 file edits.
- **It carries a `basis` field.** The reason a mapping exists is auditable next
  to the mapping. In 253 trace-line edits the reason lives nowhere.
- **It is revisable.** If Reading B of §1.3 is later preferred, or CAP-4 is
  re-ruled, that is a one-line change, not a 10-document re-approval.
- **It keeps `§` and `workboard_id` as joins, not tables.** 220 of 253 need no
  table entry at all, so the human-maintained surface stays about 10 rows and
  does not drift as scenarios are added.

Cost, stated honestly: it requires editing `verify-coverage.py` to consume the
new block (out of scope for this proposal, and correctly so — the verifier is
the thing being satisfied and should not be edited by the same agent that
proposes what satisfies it).

### 5.3 Option C — edit the `**Trace:**` line in all 253 scenarios. **Reject.**

The briefing frames the fix as "add the owning `PM-FR-n` to the existing
`**Trace:**` line". For `mentorship` and `user-management` that is right. For
these 253 it is the wrong instrument, for a governance reason and a durability
reason.

**Governance.** These are AD-1-gated artifacts. Concretely:
- All **73** `access-control-kernel` documents are recorded in
  `_bmad-output/specs/spec-access-control-kernel-mvp/approvals.yaml` with
  `artifact_path` + `commit` + `author` + `approver` (100 `artifact_path`
  records; the 73 scenario ones enumerated there).
- All **9** `access-control-foundation` documents carry an inline
  `**Approved:** Anna Pikula, 2026-08-30` line.
- The remaining **171** `access-control` documents carry neither, and appear in
  no ledger.

So the governance cost is real for 82 of the 253, not all 253 — I would rather
state that precisely than overstate it. But 82 is enough. The foundation spine's
persisted-approval rule
(`architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md`,
AD-3, "Persisted approval rule") requires that a record *verifies* — the commit
resolves and the artifact is present at that revision. An in-place edit does not
break that mechanical check, since the old commit still contains the old file.
What it does is make the ledger point at a revision whose content is no longer
what is in the working tree: a human approved specific text, and the file now
says something else. Multiply by 82 and the ledger's meaning degrades quietly.
A central table has no such effect — it adds a fact *about* the approved
documents without altering them.

**Durability.** The mapping would exist in 253 places. Any future re-ruling
(§1.3, §4.1) means 253 more edits and, for 82 of them, another approval
question. A wrong row costs one line in Option B and 253 lines here.

**Recommendation: Option B.** If the reviewer wants scenario-local traceability
as well, the right sequencing is to land Option B first — it makes check 8 pass
and it is reversible — and then, if desired, backfill trace lines through AD-1's
own gate at the pace approvals allow, rather than as a bulk agent edit.

---

## 6. Residue — 6 documents that cannot resolve

| Document | Cites | Why it cannot resolve |
| --- | --- | --- |
| `docs/test-cases/access-control-kernel/kernel-composition/acm8-kc-01-facade-resolves-from-real-container.md` | CAP-6, AD-1/3/9 | ACM-8 is module wiring. CAP-6's own success criterion asserts *no* observable behavior change. |
| `…/acm8-kc-02-interim-adapter-binding-unchanged.md` | CAP-6, AD-1/2/3 | same |
| `…/acm8-kc-03-user-management-behavior-unchanged.md` | CAP-6, AD-2/3/9 | same |
| `…/acm8-kc-04-no-http-or-debug-endpoint-added.md` | CAP-6, AD-2/3/9 | same |
| `…/acm8-kc-05-corrected-module-header-comment.md` | CAP-6, AD-1/2/3/9 | same — this one verifies a *comment*. |
| `docs/test-cases/access-control-kernel/root-user-prerequisite/acm0-ru-root-user-prerequisite.md` | CAP-8, AD-1/4 | Deploy-time seed bootstrap. Nearest section §4.17 maps only to PM-FR-42 (departments), which is not this. |

These six are not a vocabulary problem. They are scenarios for engineering and
deployment concerns that the 42 canonical product requirements deliberately do
not cover — the same class as CAP-7 (§7 performance) and the two documents whose
only section token is `§9` (Definition of Done).

**RULING NEEDED.** Check 8 as written
(`verify-coverage.py:184-188`) requires *every* scenario document to resolve to a
PM-FR. That premise is false for architecture-, performance- and deployment-level
scenarios. The options are (a) give check 8 an explicit, small, justified
exemption list, (b) register `ACM-8` / `ACM-0` as stories under some PM-FR
anyway, which manufactures traceability that does not exist, or (c) add a
non-functional requirement namespace. I recommend (a) and note that (b) is the
tempting wrong answer.

---

## 7. Confidence summary

**High confidence — apply as proposed (231 documents):**
- The entire `§` bridge with the S-row rule of §1.2 under Reading A (169 docs).
- The entire `workboard_id` bridge, ACF-1/ACM-1/ACM-3/ACM-5 (51 docs) — this is
  a join against the canonical model's own field, not a new claim.
- AD-10, AD-11, AD-19, AD-20 rows (10 docs) — each corroborated by a sibling
  document in the same folder that cites both the AD and a section.
- CAP-1, CAP-3, CAP-5 (derived from the YAML's own workboard mapping).
- CAP-2 → PM-FR-2 (6 docs) — by direct analogy to CAP-1/ACM-3, same subject.

**NOT confident — these rows need the human, individually:**

1. **CAP-4 → PM-FR-6 vs PM-FR-4** (§4.1). 10 documents. My weakest judgment call.
2. **AD-12 → PM-FR-3 + PM-FR-4 vs PM-FR-6** (§3.3 caveat). 1 document. AD-12 has
   two distinct halves and the document sits on the boundary.
3. **Reading A vs Reading B for §3.2 S-rows** (§1.3). Affects how 80 documents
   are attributed, though not *whether* they resolve.
4. **The AD namespace rule itself** (§3.1). Not a row but a precondition: if the
   reviewer disagrees that AD-1..AD-4 are area-local in the kernel corpus, the
   whole AD table has to be rebuilt.
5. **CAP-6, CAP-7, CAP-8 → nothing** (§4, §6). I assert these have no PM-FR. A
   reviewer who disagrees should say which requirement they think owns module
   composition, a performance gate, and a deploy-time seed — I could not find
   one and will not invent one.

**Explicitly not proposed, and why:** AD-1, AD-2, AD-3, AD-9, AD-24 (process and
architecture decisions, no product requirement); AD-4 and AD-7 (arguably §2.3 /
PM-FR-6, but every document citing them already resolves, so a mapping would add
risk for no coverage gain).

---

## 8. What a human must rule on

Three decisions unlock everything; the rest are refinements.

1. **Mechanism** (§5): central area-scoped mapping block in the coverage YAML
   (recommended) vs 253 trace-line edits.
2. **AD namespace scoping** (§3.1): confirm that in `access-control-kernel` and
   `access-control-foundation`, AD-1..AD-4 are the *local* foundation spine and
   AD-5+ are inherited from the people-management spine. Everything in §3 depends
   on it.
3. **The premise of check 8** (§6): whether architecture-, performance- and
   deployment-level scenarios must resolve to a product requirement at all. Six
   documents, plus the §7 and §9 cases, hang on this.

Then two narrower rulings: **CAP-4's owner** (§4.1, 10 documents) and
**Reading A vs B for the S-rows** (§1.3, attribution of 80 documents).

---

## Appendix — how the numbers were produced

A throwaway script (written to the session scratchpad, **not** committed to the
repo) that:
1. enumerates the 253 non-README documents under the three areas;
2. extracts each document's `**Trace:**` block (inline-line form, bullet-list
   form, and the one `## Trace` section form) and pulls `§n.n[ Sn]`, `AD-n`,
   `CAP-n`, `OQ-n` tokens from it;
3. parses `normative_refs` from `global-fr-epic-story-coverage.yaml` into a
   section → PM-FR index, with `§3.2 Sn` kept as a distinct key;
4. parses `workboard_id` from the same file into a second index;
5. joins, and reports counts and residue.

Every count in this document is that script's output, not an estimate. It can be
re-run against a later commit to check drift.
