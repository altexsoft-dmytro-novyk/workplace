# Test Design for Architecture: People Management Platform

> ## Status: **approved**. This document inherits nothing from the document it replaces.
>
> This path previously held **`Test Design for Architecture: User Management`**, a
> `user-management`-scoped document carrying "**Approved — 2026-08-25** (human approval;
> normative propagation complete)". That document is superseded, **its approval does not
> transfer to this one**, and no validation verdict transfers either.
>
> - **Approval:** **granted 2026-09-11** (explicit stakeholder confirmation in workspace).
> - **Validation:** **PASS** — system Validate recorded in `test-design-validation-report.md`
>   (2026-09-11). Not a release verdict.
> - **Coverage:** none asserted. This document proposes and records; it does not state that
>   any test exists, any suite passes, or any gate is green.
> - **Scope changed with the filename.** The old document was scoped to the
>   `user-management` bounded context. This one is the single **platform** testability and
>   risk baseline.
>
> Because the filename is reused, any statement elsewhere about "what
> `test-design-architecture.md` says" that was written before 2026-09-10 describes the old
> document, not this one. Read the superseded content at its commit:
> `https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/_bmad-output/test-artifacts/test-design-architecture.md`

**Purpose:** The one platform testability and risk baseline. It owns **risk identity, risk
scores and risk rationale**, **architecture seams and testability gaps**, and **references**
to the shared NFR contracts. It does not own execution strategy, evidence contracts, or
coverage — those belong to `test-design-qa.md`.

**Date:** 2026-09-10
**Author:** Test-design consolidation migration, Task 3 (`docs/superpowers/plans/2026-09-10-test-design-consolidation.md`)
**Status:** **Approved 2026-09-11** · validation **PASS** (system-level, 2026-09-11)
**Scope:** Platform (system-level). Not an epic, and not a bounded context.
**Baseline commit:** `76a7220701ac6f16843dad8b303934f9a958b54c` (backend `f1eea3c0…`, frontend `fa3d3198…`)
**Requirements reference:** `docs/project-requirements.md` v1.5 (normative). Historical PRDs — including `prd-user-management-2026-08-20`, which the superseded document cited — are **not** current requirements.
**Architecture reference:** the PM spine `_bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md` (PM/AD-1..AD-34+) and the binding rendered rules under `docs/architecture/`. The superseded document cited AD-1..AD-14; that range is stale.
**Migration record:** `_bmad-output/test-artifacts/test-design/migration-map.md` — the disposition ledger this document was written from. Where this document and the ledger disagree, the ledger is the record of what was decided and why.

---

## Executive summary

**Scope.** Cross-cutting platform architecture for access control, User Management
interworking, profile and list projection, dashboards, resourcing, integrations, employment
lifecycle, the platform NFRs, and the v1.5 Definition of Done. Epic-specific scenario and
risk coverage lives in the epic plans (see [Domain navigation](#domain-navigation)).

**Business context.** The platform serves 500+ employees. **Access-control correctness is
the primary quality attribute**: a closed section leaking through an API, list, filter,
export, error, shared link or optional notification is critical. Timetracker leaves and
project/people sync are required against the provider's test environment. PeopleForce is a
good-to-have profile prefill by candidate ID. Resourcing requests are platform-owned;
vacancies are not synchronised.

**Architecture.** Hexagonal bounded contexts. The AccessControl facade is the sole
authorization entry. Audiences are resolved live and in bulk, never persisted. Reporting,
Project, PP, Self and Colleague remain distinct audiences. Platform-owned revocation is
next-request; project-derived revocation is within 15 minutes.

**What changed since the superseded platform draft (2026-08-29).** Six of the nine
`PR-B-*` product/architecture blockers are now **closed at design** and are recorded in
[Ratified design decisions](#ratified-design-decisions). **None of them is closed at
implementation**, and both sign-off packages remain **ungranted**. See
[Sign-off-ready packages](#sign-off-ready-packages) for the rule that governs that whole
block.

**Risk summary.** Ten platform risks, all P×I ≥ 6: five at score **9**, five at score
**6**. Platform `PR-*` identifiers do **not** renumber the User Management `R-*` or the
epic-scoped `R-UM-*` / `R-FE-*` identifiers — those are different risks in different scopes.

**What this document is not.** It is not a release-readiness statement, not a coverage
claim, and not an approval. The whole-repository trace remains a planning audit with
`allow_gate=false`.

---

## Ownership

| Area | Where it is owned | Note |
| --- | --- | --- |
| Risk identity, scores, rationale, residual risk | **This document** | Single definition point. `test-design-qa.md` references these IDs and must not redefine them. |
| Architecture seams and testability gaps | **This document** | |
| Shared NFR contracts (subject, dataset, statistic, threshold, evidence) | `test-design-qa.md` § NFR measurement contracts | This document **references** them; see [NFR contract references](#nfr-contract-references). |
| Execution strategy, level strategy, isolation policy, coverage, regression map, release and design gates | `test-design-qa.md` | Not restated here. |
| Epic-specific scenario and risk coverage | `test-design-epic-{domain}-{number}.md` | See [Domain navigation](#domain-navigation). |
| Access-control scenario suites | `docs/test-cases/access-control-foundation/` (10 files) and `docs/test-cases/access-control-kernel/` (91 files) — **101 files** at the baseline commit | Design inventory, **not coverage**. See the note below. |
| Deferred access-control slices | Outside the current foundation/kernel scope: shared links, projection surfaces, role catalog, full-profile overlay, Project-line positives, Department positives, integration-driven access | Staged design, not a waiver. |

**Two corrections carried into this row set, both load-bearing.**

1. **The inventory.** The superseded platform documents asserted "**171** v1.5 Phase-1
   Stage-1 draft files" under `docs/test-cases/access-control/`. That path **does not
   exist** at the baseline commit, and the count is wrong. The real inventory is
   `access-control-foundation/` (10 `.md`) plus `access-control-kernel/` (91 `.md`) =
   **101** files, machine-counted. Neither the dead path nor the 171 figure may be
   reintroduced.
2. **Those files carry no approval state.** `docs/architecture/testing-strategy.md`
   lines 25–38 removed per-file approval from `docs/test-cases/**` on 2026-09-04:
   "draft", "pending approval" and "unapproved" are no longer meaningful states for a
   scenario document — **a scenario is present or absent**. Nothing in this document asks
   anyone to establish, reconstruct or record an approval state for those files. What
   survives is the **ordering** rule (scenario document → committed-red Stage-2 test →
   production code), not an approval gate.

**The 2026-08-25 "authoritative child baseline" is dissolved.** There is no longer an
approved User Management child sitting beneath a platform parent. The User Management
obligations are re-homed into epic plans whose approval starts **ungranted**.

---

## Ready now

Work that is unblocked today, at the architecture level.

1. **Apply the AD-1 ordering per feature:** a scenario document, then a **committed-red**
   Stage-2 test, then production code written until it passes. The per-stage *human
   approval* step that the superseded documents encoded here was removed on 2026-09-04
   (`docs/architecture/testing-strategy.md:25–38`); the ordering and the
   no-self-certification review norm survive. What replaces the removed control is
   ordinary review — the pull request, and CI actually executing the suites. *(As an
   enforceable gate this is `DG-01`, defined in `test-design-qa.md` § Release and design
   gates. It is stated here only as the architecture-level entry condition for work.)*
2. **Build against the established seams**, all of which remain binding: real HTTP +
   PostgreSQL for end-to-end tests, outbound ports behind DI, **AccessControl facade
   only**, live bulk audience resolution, and synthetic seeded identities.
3. **Design and review** the two sign-off-ready packages
   ([PR-S-01, PR-S-02](#sign-off-ready-packages)) — Stage-1 design and review may proceed;
   implementation may not.
4. **Design against the six ratified decisions** in
   [Ratified design decisions](#ratified-design-decisions) — their design content is
   settled and reviewable now.

> **Retired from this list:** the superseded instruction to review and approve the
> access-control scenario files "one by one" is retired together with both of its premises —
> the wrong file count and path corrected under [Ownership](#ownership), and the per-file
> approval gate that no longer exists.

---

## Established constraints

Unchanged platform constraints, each restating v1.5 §2.2/§4.7/§5.2 or a
`docs/architecture/README.md` non-negotiable.

- **HR Admin is configuration-only** and grants no employee-data audience. Full-profile
  access is a separate concept.
- **Both dimensions must permit a mutation:** functional capability *plus* target-scoped
  section write. Dedicated relationship operations remain separate from section writes.
- **PeopleForce** stores and uses candidate ID and may optionally prefill candidate facts
  after preview and per-field confirmation. It is **not** a vacancy source of truth.
- **Resourcing** owns vacancies, headcount, Unassigned requests, candidate review,
  compensation visibility, and request-bound profile links.
- **Notifications and analytics are good-to-have.** If selected, their privacy and
  source-of-truth rules become binding *before* design.
- **Timetracker supplies projects, people, PM and DM — but no reports-to hierarchy.**
  Reports-to is a manual `direct` relationship (PM/AD-10, PM/AD-13; `TT-E2` is the sole
  relationship writer for project membership). Conflating reports-to with project-derived
  manager access is a live confusion risk, which is why this constraint is stated rather
  than assumed.

---

## Risk register

**This section is the single definition point for platform risk identity, category, score
and rationale.** `test-design-qa.md` references these IDs and maps them to evidence; it does
not restate the rationale. Epic plans reference these IDs for cross-cutting risks and define
their own epic-local `R-UM-*` / `R-FE-*` risks.

### Scoring

Probability: 1 unlikely · 2 possible · 3 likely. Impact: 1 minor · 2 degraded · 3 critical.
Score = P × I. **Score ≥ 6 is high.** Categories: `TECH` architecture/integration · `SEC`
security/auth/access · `PERF` performance/scalability · `DATA` integrity/consistency · `BUS`
business/workflow · `OPS` CI/deployment/operability.

**No score in this document was renormalised to support a priority, a heading, or a
template.** Two scoring records carried from the migration reconciliation are in
[Cross-scope risk records](#cross-scope-risk-records).

### Platform risks

| ID | Cat | Risk and consequence | P | I | Score | Status |
| --- | --- | --- | --- | --- | ---: | --- |
| **PR-001** | SEC | Distinct audiences, narrowed fields, flags, exports and filters create many leak paths; a leak exposes restricted employee data | 3 | 3 | **9** | Open |
| **PR-002** | SEC | Stale graph state can retain access after an org change, sync delay, outage, or due departure | 3 | 3 | **9** | Open — design in place, evidence absent |
| **PR-003** | DATA | Implementing the specified People Partner contract before formal sign-off, or without the CC-07 journal, can create governance or audit inconsistency | 3 | 3 | **9** | Open — sign-off ungranted; `PR-B-07` open |
| **PR-004** | SEC | Full-profile overlay precedence can expose Self-denied sections or create inconsistent grants | 3 | 3 | **9** | Open — **design unblocked** (`PR-B-06` closed at design); overlay implementation absent |
| **PR-005** | TECH | An unknown timetracker contract can create stale or mixed project policies; project assignment directly changes data access | 3 | 3 | **9** | Open — successors `TT-IDENTITY-01` (P0) and `TT-PMDM-01` (P1) |
| **PR-006** | PERF | Arbitrary visible fields plus live bulk graph resolution may breach the ≤ 2 s All Employees list requirement at 500+ rows | 2 | 3 | **6** | Open — no measurement exists |
| **PR-007** | DATA | Dashboard, resourcing and campaign aggregates can diverge from projection rules and lifecycle facts, producing wrong decisions or leaks | 2 | 3 | **6** | Open — partly re-gated by PM/AD-33 |
| **PR-008** | OPS | Implementing the specified departure contract before formal sign-off, or operating it without the AD-20 deployment controls, produces governance drift or delayed cutoff | 2 | 3 | **6** | Open — sign-off ungranted; `OPERATIONAL-ENVELOPE` open |
| **PR-009** | OPS | Counting unexecuted access-control scenario documents as coverage creates false release confidence | 2 | 3 | **6** | Open — **restated**, and less mitigated than in 2026-08-29 |
| **PR-010** | DATA | Seed, platform, timetracker or candidate identity mismatch, or real PII in the estate, can attach access to the wrong person or expose client data | 2 | 3 | **6** | Open — partial design support |

### Per-risk rationale and mitigation direction

Mitigation here is the **architecture** action. The test activities that would produce
evidence for each risk belong to `test-design-qa.md` § Risk → evidence map and to the owning
epic plans.

#### PR-001 — Projection and leak paths (SEC, 9)

*Authority:* v1.5 §3.3; PM/AD-9, PM/AD-10; `docs/architecture/README.md` non-negotiable 7
(facade only). *Architecture mitigation:* one central facade plus projection contracts that
only ever **narrow**; server-side omission on every surface; a security review checkpoint per
new surface. *Owner:* Security + Access Control + feature backend leads. *Timeline:* before
each surface ships.

**Origin note.** The superseded `user-management` risk `R-001` ("a controller bypasses the
AccessControl facade", SEC, score **9**) is preserved into this family with its score
unchanged. Its epic-level obligation is owned by `UM-E0` Access Control Adoption and is
carried in `test-design-epic-user-management-0.md`; the platform-level rationale is here.

#### PR-002 — Stale graph state retains access (SEC, 9)

*Authority:* PM/AD-10, PM/AD-19, PM/AD-20; `docs/architecture/access-control.md`.
*Architecture mitigation:* no persisted audiences; atomic graph writes; AD-20 request-time
cutoff; the 15-minute and 4-hour sync controls. *Owner:* Access Control + Integration +
Backend. *Timeline:* before any access-bearing release.

#### PR-003 — People Partner contract ahead of sign-off or journal (DATA, 9)

*Authority:* PM/AD-19, binding as `docs/architecture/README.md` non-negotiable 15.
*Architecture mitigation:* obtain the `PR-S-01` sign-off; close `CC-07`; enrol the PP fact
and the immutable journal write in **one** transaction with stable snapshots. *Owner:*
Product + Architect + Security + Backend. *Timeline:* before PP end-to-end work or
implementation. *Blocked by:* [`PR-B-07 / CC-07`](#open-blockers), still open at **P0**.

#### PR-004 — Full-profile overlay precedence (SEC, 9)

*Authority:* PM/AD-28. *Architecture mitigation:* the overlay precedence rule is now
settled at design — Self is exclusive when viewer equals target, the overlay is read-only,
and the effective section is `max(Self, overlay)` under the total order
`write > read > none`. *Change of state, recorded precisely:* the superseded document
recorded this risk as "Blocked `PR-B-06`". `PR-B-06 / CC-05` is now **closed at design**, so
the *design* is unblocked and its evidence becomes schedulable design work. **The risk score
is unchanged and the risk does not close**, because no overlay implementation exists.
*Owner:* Product + Architect + Security.

#### PR-005 — Unknown timetracker contract (TECH, 9)

*Authority:* v1.5 §5.1; PM/AD-13. *Architecture mitigation:* publish the provider contract;
make sync a sole-writer transactional replacement; define partial-success behaviour and
provenance. *State:* the delivered contract answered part of the original question —
assignment arrives as **state-at-sync** (no cursor, `since`, delta, webhook or event feed),
and no write or reassignment operation exists — but two harder contradictions replaced it
and remain open: `TT-IDENTITY-01` (**P0**) and `TT-PMDM-01` (**P1**). See
[Open blockers](#open-blockers). *Owner:* Integration + Architect + Security.

#### PR-006 — All Employees list latency (PERF, 6)

*Authority:* `docs/project-requirements.md:614` (v1.5 §7, normative) — the All Employees
list with 500+ records, arbitrary filters and derived fields responds **within 2 seconds,
including permission resolution**.

*Merged origins.* This risk is the single successor of two: platform `PR-006` (arbitrary
fields plus bulk resolution may breach ≤ 2 s at 500+ rows, PERF **2 × 3 = 6**) and the
superseded `user-management` risk `R-005` (NFR-2 untestable without a load harness, PERF
**6**). **Both scores were 6 and both are preserved unchanged.**

*Subject discipline — the load-bearing part of this entry.* The measurement subject is the
**composed All Employees HTTP/list route, end to end, including permission resolution**. It
is **not** the AccessControl facade resolver, and **not** `resolveAudiences`. Three
contracts in this repository share a "500" and a "2 seconds" and nothing else; conflating any
two would let a passing measurement of one be reported as evidence for another. See
[NFR contract references](#nfr-contract-references).

*Priority.* The obligation is **P0**, not P1. The rationale, established during migration
reconciliation and not re-derived here, is: (1) severity does not decide it — both origin
risks score exactly **6**, so neither was re-scored to support a priority; (2) the obligation
is **release-gated** (`PG-04`, in `test-design-qa.md` § Release and design gates) over a
**normative** v1.5 §7 requirement; (3) P1 would contradict (2), because the preserved exit
criteria are **P0 = 100% covered, P1 = ≥ 95%** — labelling a release gate P1 makes it
formally acceptable to ship it uncovered; (4) the canonical evidence-owning story
`PMC-E1-S1.9` has a **blocking** closing criterion — on a measured failure the story "does
not claim the NFR-3 or SM-4 threshold is met". **No P0 percentage was normalised** to reach
this, and no denominator moved.

*Architecture mitigation:* the indexed, visibility-safe custom-field query plan (now settled
at design as `PR-B-01 / OQ-114`); one bulk resolution plan; a representative seeded dataset;
query observability on the composed directory endpoint. *Owner:* Architect + Profile Backend
+ DBA/DevOps. *Timeline:* before directory release.

*State:* harness **`DIRA1-MVP-v1`**; **PASS** final artifact
`performance/dira1-final-dira1-1789080461725-944ce5c2a33a.json` (local env; U-24 resolved).

#### PR-007 — Aggregate drift across dashboards, resourcing and campaigns (DATA, 6)

*Authority:* v1.5 §4.12; PM/AD-33 and PM/AD-18, which now fix four dashboard read models.
*Architecture mitigation:* typed read models that consume AccessControl and canonical facts;
request/task transitions and counters that update transactionally and idempotently. *Partial
re-gating:* `PR-B-02 / OQ-115` is closed at design, so the *dashboard* half has a settled
contract; the implementation is **absent** and the cross-context invariant risk stands.
*Owner:* Dashboard + Resourcing + Campaign backend leads.

#### PR-008 — Departure contract ahead of sign-off or operational controls (OPS, 6)

*Authority:* PM/AD-20, binding as `docs/architecture/README.md` non-negotiable 16.
*Architecture mitigation:* obtain the `PR-S-02` sign-off; then run worker and application
against **one** validated business timezone and database, with worker lag, retry, lease and
cutoff telemetry, a named alert owner and a retry surface. *Blocked by:*
`OPERATIONAL-ENVELOPE` (**P0**, open) for the operational half; `PR-S-02` sign-off remains
**ungranted**. *Owner:* Product + Architect + DevOps + Backend + Security.

#### PR-009 — Scenario documents counted as coverage (OPS, 6)

**Restated.** The risk survives; its *subject* and its *rationale* both changed, and the
change makes it stronger, not weaker.

*What was retired.* The original statement was "treating 171 draft AC files as coverage
bypasses human gates". Two of its premises are gone: the 171 files under
`docs/test-cases/access-control/` do not exist, and the per-file approval state the phrase
"draft" depended on was removed on 2026-09-04 — a `docs/test-cases/**` scenario is present or
absent.

*What it is now.* **Counting a present but unexecuted scenario document as coverage.**
*Corrected subject:* the 101 real files (`access-control-foundation/` 10 +
`access-control-kernel/` 91). *Surviving authority:* the **ordering** rule at
`docs/architecture/testing-strategy.md:5–23` (scenario document → committed-red Stage-2 test
→ production code) and the **ordering half only** of `docs/architecture/README.md`
non-negotiables 1–2 — their *approval* half is superseded and is deliberately **not** used as
authority here (see [Open questions](#open-questions), U-18).

*Why it is less mitigated than the source described.* `testing-strategy.md:48–53` states
plainly that removing the gate removed a real safeguard, and that "if the suites are not run
in CI, nothing checks stage separation at all" — while the epic-scoped risk `R-UM-07` records
that the end-to-end CI job is `continue-on-error`. So nothing currently forces the suites to
run.

*Architecture obligation.* The coverage-state vocabulary must keep three states distinct —
**a present scenario document**, **a committed-red Stage-2 test**, and **green production
code** — and must never promote the first to the third. *Owner:* Engineering leads +
repository maintainers.

*Open, and not answered here:* which of the 101 scenario files covers which normative row is
currently unanswerable from any artifact in the repository, and must not be guessed from
filenames ([Open questions](#open-questions), U-19).

#### PR-010 — Identity mismatch and real PII (DATA, 6)

*Merged origins:* platform `PR-010` and the superseded `user-management` risk `R-012` (PII
in test fixtures and logs). *Authority:* PM/AD-13, v1.5 §6. *Architecture mitigation:*
`ttId` and candidate ID are the durable external keys and email is never a sole key;
synthetic seed-only controls; log redaction; fail closed on an ambiguous match. *Owner:*
Integration + Backend + Security/DevOps. *Dependency:* PM/AD-13's `User.ttId` currently has
**no population source**, which is exactly what `TT-IDENTITY-01` (P0, open) is about.

### Cross-scope risk records

Two records that belong to risk scoring — which this document owns — while their mitigations
live elsewhere. Both destinations are intended; neither is a duplicate.

| Record | What is recorded here | Where its mitigation lives |
| --- | --- | --- |
| **`R-UM-01`** (TECH, 3 × 3 = **9**) — every logic change costs a full Nest boot plus a migrated database, so there is no sub-second feedback loop | A **cross-cutting property of the estate**, not of one epic. It converges three origins: `R-UM-01`, the frontend risk `R-FE-04` (no sub-second loop), and the critical review's "incorrect test levels" finding. Its architectural consequence is stated in [Testability gaps](#testability-gaps). | `test-design-qa.md` § Level strategy |
| **`R-UM-04`** (TECH, 3 × 2 = **6**) — the end-to-end suites share one database | **The score is 6 and it is a high risk.** In the source it sits under a "Medium-Priority Risks (Score 3–4)" heading while the same document heads its first table "High-Priority Risks (Score ≥6)": 6 satisfies the high band and falls outside the medium band, so **the heading placement is the defect, not the score**. Its neighbours were cross-checked — `R-UM-05` (4) and `R-UM-06` (3) are correctly placed — so exactly one row was misfiled. The score was not changed and the source document was not edited. | `test-design-qa.md` § Execution strategy (backend isolation) |

### Risks retired at migration

Recorded so they are not reintroduced as active obligations. Each retirement has an
authority; retiring a risk does **not** retire the behaviour it protected.

| Retired risk | Why it is retired | What survives |
| --- | --- | --- |
| `R-003` (SEC, 6) — approved magic-link auth behaviour not yet normative | The risk *was* that the decision sat outside a normative artifact. It no longer does: `docs/architecture/user-management-test-decisions.md` **DEC-UM-004** is binding. | The behaviour, as DEC-UM-004 obligations owned by the User Management epic plans. |
| `R-004` (DATA, 6) — approved reject-then-retry reports-to behaviour not yet normative | Same shape: **DEC-UM-005** exists and is binding. | The behaviour, as DEC-UM-005 obligations. |
| `R-013` (TECH, 1) — Epic 2 blocked on an Epic 1 HTTP path for a User row | Premised on an HTTP employee-creation path. **PM/AD-16** removes employee creation entirely; PM/AD-21 replaces the legacy create path. | Nothing. No successor obligation. |
| `DG-05` — child-ownership gate ("approved UM files remain unchanged") | Premised on the child/platform split that this migration dissolves, and on an "approved UM" set that becomes epic plans with ungranted approval. | Nothing as a gate; the follow-up it named is executed by the migration itself. |
| The "B-01 copy drift" plan risk | The propagation it feared happened (**DEC-UM-001**). | Nothing. |

---

## Residual risk

**The governing rule, preserved verbatim in meaning: a mitigation is not complete because a
design exists.** A risk's status changes only when the listed verification evidence has been
reviewed. Accepted residual risk requires a **named approver and an expiry**, recorded
outside this planning document. This document accepts no residual risk on anyone's behalf.

| Risk | Residual risk after the planned mitigation | Disposition |
| --- | --- | --- |
| `PR-001` | A newly added surface, or a newly added controller, can omit the facade or widen a projection until review and architecture checks catch it. | Keep per-surface contract checks and a release review; treat a new surface as a new security review trigger. |
| `PR-002` | Revocation correctness depends on clock, sync cadence and worker liveness in a real environment; none of that is proven by design. | Keep clock-controlled revocation evidence and outage telemetry as standing requirements. |
| `PR-003` / `PR-008` | Design closure and even a formal sign-off leave the implementation and the journal enrolment unproven. | Both risks stay open until implementation evidence exists; sign-off alone does not move them. |
| `PR-004` | The precedence rule is settled but unimplemented; a partial implementation can satisfy the rule for Self while widening the overlay. | Require positive **and** negative projection evidence before the risk moves. |
| `PR-006` | A non-production baseline may not reproduce production topology, cache state, or future scale — and the statistic the threshold binds to is not yet decided. | Keep any result as a **baseline**, not as a passing grade; do not raise the scale claim from a single environment. |
| `PR-009` | The distinction between a present scenario document and executed evidence is currently enforced by convention, and the end-to-end CI job is `continue-on-error`. | Keep the three coverage states distinct in every reporting surface; treat CI not running the suites as the live failure mode. |
| `PR-010` | Durable external keys do not exist for every source today (`User.ttId` has no population source). | Fail closed on ambiguous identity; keep reconciliation reporting as a standing requirement. |

---

## Testability gaps

What the architecture must provide before reliable evidence can be produced. These are
architecture asks, not test-execution instructions.

### Blockers to fast feedback

| Concern | Impact on evidence | Architecture must provide | Owner | Timeline |
| --- | --- | --- | --- | --- |
| **Whole-`User` serialization at the HTTP edge** | A correct section decision in the kernel does not imply a correct payload at the HTTP edge, so projection cannot be proven at the boundary users actually see | Versioned field/record projection contracts around AccessControl for S1–S16, directory, exports and workflow-specific narrowing. The *design* is settled (PM/AD-34 — `user-management` owns assembly, no new bounded context); the **runtime still serializes whole `User` rows**, recorded identically in four canonical planning files as "ratification §4.2 `absent`; PM/AD-34 `partial`" | Architect | Before the profile/list wave |
| **Dynamic query model** | Hidden-value inference and directory performance cannot be proven reliably | The indexed, authorization-aware query design. Settled at design (PM/AD-32: typed EAV, `CustomFieldDefinition` + `CustomFieldValue`, four btree indexes, visibility applied **before** filter execution, column-per-field forbidden). **Implementation still uses `User.customFields` jsonb** (transition debt `TD-12`) | Architect + DBA | Foundation close, before the directory wave |
| **Provider contract for timetracker** | Fakes may encode the wrong security behaviour, and live sync cannot be explained historically | Resolution of `TT-IDENTITY-01` (a durable id for project members; `AccountTalentDto` carries `{email, dateStart, dateEnd}` and no durable id) and `TT-PMDM-01` (`projectManager` / `deliveryManager` are untyped strings while members in the same object are emails) | Integration + Security | Before integration Stage 1 |
| **Immutable journal contract** | Journal-backed PP and grant changes cannot prove immutable snapshots, reader scope, or transaction enrolment | `AccessJournal` as specified by PM/AD-29, with same-transaction enrolment for every listed kind and `idempotencyKey` uniqueness under retry. Schema is approved; **the table exists nowhere in `src/` or `prisma/`** | Architect + Security + Backend | Before affected Stage-2 or implementation work |
| **Operational environment** | Lifecycle cutoff, worker recovery, alerting and the deployed/demonstrable DoD remain unprovable; `BUSINESS_TIME_ZONE` validation across environments is the seam the departure boundary cases depend on | Each of the eight `OPERATIONAL-ENVELOPE` dimensions decided **or explicitly deferred with a named owner**, without weakening AD-20 | DevOps + Architect | Before first release |
| **Coverage state is not machine-visible** | A present-but-unexecuted scenario document can be mistaken for tested behaviour (`PR-009`) | A machine-readable distinction between a present scenario document, a committed-red Stage-2 test, and green production code. **Not** a per-file approval field — that state no longer exists | Engineering leads | Before access-control Stage 2 |
| **No sub-second feedback loop** (`R-UM-01`, cross-cutting) | Every logic change costs a full Nest boot plus a migrated database, which pushes domain rules to the slowest level available and makes fast iteration impossible | Seams that let a domain rule be verified without a database — the architecture-side half of the level-strategy problem | Architect + DEV | Standing |
| **Test-file location conventions are unsettled** | The frontend net-new work has no agreed home, which blocks it entirely | A decision on backend unit-spec placement, frontend co-location, the second vitest config and the component-testing library | DEV | Before the frontend unit/component work starts (see U-12) |

### Architectural improvements needed

1. **Projection adapters per surface.** Centralize field and record narrowing for profile,
   list/filter/export/search, shared links, dashboards and optional notifications. Direct
   policy reads remain forbidden.
2. **Controllable state and time.** Provide synthetic idempotent seed and reset contracts,
   transaction-safe fixtures, and injected clock and timezone seams for the 15-minute,
   4-hour, magic-link expiry and departure-cutoff boundaries.
3. **Observable security decisions.** Emit correlation IDs and sanitized decision, sync and
   worker metrics **without recording restricted values**. Exact retention and any broader
   profile-read audit remain **UNKNOWN** and are not invented here.
4. **Cross-context consistency.** Route resourcing, campaign, mentorship, timeline and
   lifecycle mutations through their owning application layers, with idempotency and
   explicit transaction boundaries.
5. **Stable uniqueness-violation mapping.** An unmapped Prisma unique violation surfaces as
   `500` rather than `409`, which lets a scenario pass for the wrong reason. A global
   exception filter must produce `409` with a stable error body. *(Preserved from the
   superseded `user-management` architecture asks; still an architecture-owned ask.)*
6. **A transaction-boundary helper for paired writes.** Manual wiring of a mutation and its
   paired timeline event is easy to forget. PM/AD-11's pattern needs a use-case template
   that wraps the mutation and the event write in one transaction. *(Preserved from the same
   source.)*

### Controllability, observability, reliability, isolation

Carried from the 2026-08-25 critical review and merged with the platform testability
concerns above. These are the dimensions along which the seams above are judged.

- **Controllability.** Stories rely on direct Prisma seeding in module setup (PM/AD-3).
  Outbound ports — the email port in particular — must be fake-bound by DI for
  magic-link-style tests; the requirement appears in story notes but not in the scenario
  documents that depend on it.
- **Observability.** Absence-of-session assertions need an explicit `Set-Cookie` check to
  mean anything. Career-timeline corrections are observable through a multi-step read, which
  is the pattern to keep.
- **Reliability.** Fixtures that persist across files leave downstream tests reading
  polluted state. A concurrency outcome asserted without genuinely concurrent dispatch gives
  false confidence — concurrency scenarios must issue parallel requests inside one isolated
  test.
- **Isolation.** The isolation model itself is **execution policy and lives in
  `test-design-qa.md`**; the architecture-side statement is only that isolation is
  **platform infrastructure, not per-story invention**, and that one PostgreSQL schema per
  worker is a *precondition of* raising the worker count rather than a thing to build now.

---

## Testability assessment

### What works well

- **Hexagonal ports (PM/AD-3)** isolate external failure while preserving real HTTP and
  real database behaviour end to end.
- **PM/AD-9 and PM/AD-10** provide one live, bulk authorization seam that profile, list and
  dashboard consumers can share.
- **Fixed router shapes** reduce scenario ambiguity.
- **The immutable-fact timeline model** is observable through multi-step end-to-end reads.
- **Requirements plus PM/AD-19 and PM/AD-20** specify People Partner concurrency and
  fail-closed departure execution well enough for Stage-1 design; formal sign-off remains
  before implementation.

### Accepted scope boundaries

- The access-control foundation and kernel suites deliberately exclude major slices
  (shared links, projection surfaces, role catalog, full-profile overlay, Project-line
  positives, Department positives, integration-driven access). This is **staged design, not
  a waiver**.
- PeopleForce API prefill, notifications and analytics are optional; candidate ID storage
  remains required for external candidates.
- No employee provisioning, AD/SSO, compensation profile data, leave balances, LMS, or
  project allocation percentages are added.
- Domain unit tests sit below the release gate. That is acceptable **only** while
  end-to-end evidence remains authoritative for release.
- The access matrix is not owned by any single feature context; the platform Definition of
  Done requires the access-control suites to pass.

> **Retired from this section:** the superseded bullet "the approved User Management child
> preserves bounded ownership and can progress independently within its contract". The
> child/parent split it describes no longer exists.

---

## Ratified design decisions

**Six blockers that were open in the superseded platform draft are now closed at design.**
They are recorded here — out of [Open blockers](#open-blockers) — so that a reader does not
treat them as live design discovery.

> ### The rule that governs this entire block
>
> **Closing design discovery does not close implementation work.** An adopted design is not
> implemented behaviour, and implemented behaviour is not runtime evidence — three distinct
> states. The repository states this in its own words: *"open blockers remain fail-closed
> and are not resolved by ratification"*, and individually: *"schema approval alone does not
> close implementation"*, *"a named memlog decision does not close implementation"*,
> *"design ratification is not implementation evidence"*, and *"do not treat design closure
> as production-ready projection"*.
>
> **Without this rule, moving these six out of Open blockers would read as progress on
> implementation. None of them is that.** At the 2026-09-03 verification the register stood
> at **17 open · 0 closeable**, with the note that reading these as "done" is the specific
> misreading the `implementation_status` fields exist to prevent.

| Blocker | Design decision, and its authority | Implementation status | What is still owed |
| --- | --- | --- | --- |
| **`PR-B-01` / `OQ-114`** — custom-field storage and indexed visibility-safe filter/sort | **Closed at design** (PM/AD-32, `docs/architecture/custom-fields.md`): typed EAV — `CustomFieldDefinition` + `CustomFieldValue`; column-per-field is forbidden; four btree indexes; directory filter/sort reads `CustomFieldValue`, never `User.customFields`; Access Control visibility is applied **before** filter execution so a hidden value cannot be inferred | **transition-debt** (`TD-12`) | `User.customFields` jsonb is still the live schema and is explicitly not the target; `UM-E8` and `UM-E7` are unstarted |
| **`PR-B-02` / `OQ-115`** — dashboard widget authorization, aggregation, counter projection | **Closed at design** (PM/AD-33 and PM/AD-18, `docs/architecture/dashboards.md`): AccessControl resolves authorized target ids **before** any aggregation and a dashboard never widens section access; four fixed read models (UM, DM, PM, PP) composed from owning-context queries — one composer, not a shareable widget engine; the AD-18 counter facts are fixed. The blocker is answered by **rejecting** the generic engine, which is a resolution | **absent** | `PMC-E2` additionally carries a sprint-entry block on `OQ-PERM-01`. Recorded but not owned here: `PMC-E1` SD-1 records PM/AD-33's "no widget engine" against an expected-UX dashboard-customize mode as an **open UX ↔ architecture conflict** |
| **`PR-B-03` / `OQ-116`** — non-manager project-assignment semantics | **Closed at design** (PM/AD-27): ordinary project membership is **not** a Project-line audience, and no policy target role is created for a member | **absent** | Closing this **moved** the department-walk gate rather than removing it: `DEPARTMENT-EDGE` is itself **P1 open**, with four closure elements absent (no `parentId` index, no `isHr` column, no cycle rejection, and a temporal multi-valued `DepartmentMembership` where AD-35 specifies a single-valued `UserDepartment`) |
| **`PR-B-04` / `OQ-117`** — profile bounded-context boundary, S1–S16 projection ownership | **Closed at design** (PM/AD-34): `user-management` owns assembly; no new bounded context. Re-registered as `ARCH-ENV-01` to escape an ID collision with a historical PRD `OQ-118` — **re-registered, not still-blocking** | **partial** | The projection half survives as a live seam: `GET /users` still whole-row serializes. This is a testability gap and is stated as one — see [Testability gaps](#testability-gaps) |
| **`PR-B-05` / `OQ-105`** — *HR Admin grant/revoke half only* | **Closed at design** (PM/AD-26, PM/AD-12): the HR-Admin grant/revoke chain is settled and consistent with AD-12 | **transition-debt** | Two named gaps travel with the closure: `User.position` is still treated as HR Admin — which DEC-UM-002 forbids as an authorization rule — and there is **no last-holder guard**. **The other half of this blocker is still open**; see [Open blockers](#open-blockers) |
| **`PR-B-06` / `CC-05`** — Self versus full-profile overlay precedence | **Closed at design** (PM/AD-28): Self is exclusive when viewer equals target; the overlay is read-only; the effective section is `max(Self, overlay)` under `write > read > none`. The closure statement is itself directly assertable, which is why the register records it as testable | **absent** | No overlay implementation exists. `PR-004` is therefore unblocked *at design* only — its score is unchanged and it does not close. `PM-FR-39`'s grant lifecycle stays deferred |

---

## Open blockers

Still open. Each entry names the live register identifier, because several of the
superseded `PR-B-*` labels have been superseded by, or split into, different identifiers.

| Blocker | Live identifier(s) and severity | What is required | Owner |
| --- | --- | --- | --- |
| **`PR-B-05`** — remaining default role-permission assignments *(the half that did not close)* | **`OQ-PERM-01`** (P1, open) — assignment; **`OQ-AC-EDIT`** (P1, open) — key existence | `OQ-PERM-01` closes on an **approved default role-to-permission assignment matrix**; its scope is assignment only. `OQ-AC-EDIT` closes when both keys are present in an approved permission catalog **or** the design references are removed. The register's own instruction is explicit: **the architect must not invent default grants** — three permissions being seeded in bootstrap does not establish a catalog | Product Owner (`OQ-PERM-01`); Architect + Access Control (`OQ-AC-EDIT`) |
| **`PR-B-07` / `CC-07`** — immutable relationship/access journal | **`CC-07`** — **P0 open**; design `resolved-approved` (PM/AD-29 settled schema, snapshots, readers, enrolment and idempotency), implementation **absent** | Closes only when `AccessJournal` exists, same-transaction enrolment is proven for every listed kind, reader authorization matches PM/AD-29, and `idempotencyKey` uniqueness is proven under retry. **Schema approval alone does not close implementation.** Verified twice in code at the baseline commit: **zero occurrences** of `AccessJournal` in `src/` or `prisma/` | Architect + Security + Backend |
| **`PR-B-08`** — timetracker contract | **`TIMETRACKER-CONTRACT` is superseded**, by **`TT-IDENTITY-01`** (P0 open) and **`TT-PMDM-01`** (P1 open) | `TT-IDENTITY-01`: project members arrive as `AccountTalentDto {email, dateStart, dateEnd}` with **no durable id**, email alone is insufficient by requirement, and PM/AD-13's `User.ttId` therefore has no population source. `TT-PMDM-01`: `projectManager` / `deliveryManager` are untyped strings while members in the same object are emails — joining an authorization edge on an unformatted display name is a **fail-open** risk. A third recorded gap: **no leaves endpoint** in the delivered contract (`TT-E1`'s subject) | Integration + Architect + Security |
| **`PR-B-09`** — operational envelope | **`OPERATIONAL-ENVELOPE`** — **P0 open**, owner Architect | Eight dimensions: hosting provider · environment topology · observability vendor and alert ownership · manual retry surface · `BUSINESS_TIME_ZONE` validation across environments · worker process topology · rollback position · secret management for external integration keys. Closes when each is **decided or explicitly deferred with a named owner**, without weakening AD-20's shared-database, timezone, health, alert or worker requirements | DevOps + Architect + Security |

**Two facts about `OPERATIONAL-ENVELOPE` that are easy to lose.** It is the *cheapest* of
the open entries — its closure condition explicitly accepts "deferred with a named owner",
so it requires assigning rather than solving — and it is a **live test-design dependency**,
not a release chore: `CC-06` depends on it, AD-20 classifies mixed process configuration as a
**startup/deployment failure**, and `BUSINESS_TIME_ZONE` validation across environments is
the seam the departure boundary cases rest on. Recorded with it: *declining to certify
deployment readiness is not the same as recording the envelope as deferred with an owner.*

**Superseded blocker labels — do not treat as live.** `PR-B-01`, `PR-B-02`, `PR-B-03`,
`PR-B-04`, `PR-B-06` and the HR-Admin half of `PR-B-05` are **not** open blockers; they are
in [Ratified design decisions](#ratified-design-decisions) with their implementation status.
Reintroducing them here would misstate the register.

---

## Sign-off-ready packages

Two packages whose **design is settled** and whose **formal sign-off is ungranted**. The
distinction is the whole point of this section: a binding architecture direction is a
direction, **not a sign-off**.

| Package | Design status | What may proceed now | What still waits |
| --- | --- | --- | --- |
| **`PR-S-01` / `CC-04`** — one People Partner per employee; atomic optimistic create/replace/delete; next-request revocation; concurrency; journal direction | Design **resolved-approved** (PM/AD-19, PM/AD-29). The register is explicit that this entry stays open **only as an implementation and journal-enrolment gate** and is **not a design blocker on AD-19**. The design content — storage as `Relationship`, fixed cardinality, atomic replace with `expectedCurrentTargetId`, `409` semantics, journal-in-transaction — can be designed and reviewed against today | Access-Control-owned direct-PP audience review; User-Management-owned PP-mutation Stage-1 design and review | Formal Product Owner / Architect **sign-off: ungranted**. Implementation waits behind `CC-07`. Verified state at the baseline commit: the `Relationship` model and the `people_partner` partial unique index exist; **no `PUT` / `DELETE` people-partner route and no journal write exist**. *A named memlog decision does not close implementation.* |
| **`PR-S-02` / `CC-06`** — effective date and reason; relationship blockers and outcomes; durable, retrying, fail-closed executor | Design **resolved-approved** (PM/AD-20, PM/AD-22, PM/AD-23). Depends on `CC-07`, `CC-08`, `CC-09` and `OPERATIONAL-ENVELOPE` | Employment-lifecycle Stage-1 design and review | Formal **sign-off: ungranted**. Its closure condition is itself a test contract and requires **independently approved production evidence, not scenarios or red tests**: (1) every listed participant implements PM/AD-23 against the same signature using the supplied `tx` with no nested transaction; (2) the executor owns claim and fencing, and stale tokens no-op; (3) retry and idempotency are proven per participant via `departureId`; (4) `CC-07`, `CC-08` and `CC-09` are closed; (5) the AD-20 operational release gate is demonstrated. Upstream, verified at the baseline commit: `CC-07` absent; `CC-08` / `CC-09` **P0 open** (`idempotencyKey` exists nowhere in schema or `src/`; the timetracker write path does not exist); `OPERATIONAL-ENVELOPE` P0 open; `src/mentorship` does not exist (`CC-10-MENTORSHIP`, P1 open) |

**Boundary.** `CC-04` and `CC-06` are **not** discovery or design gaps. PM/AD-19 and
PM/AD-20 are the binding architecture directions **for** formal sign-off. `CC-07` remains a
separate open architecture dependency for the immutable journal schema, readers and
transaction enrolment; `OPERATIONAL-ENVELOPE` remains the separate operational envelope.
**Sign-off closure (U-2 resolved):** each package closes only on explicit, recorded Product Owner +
Architect sign-off. PM/AD-19 and PM/AD-20 are binding direction, **not** sign-off. Both remain
**ungranted** until recorded — **this document does not grant, imply or infer sign-off**.

---

## NFR contract references

**This section references; it does not define.** The subject, dataset, environment,
statistic, threshold and evidence of every NFR contract are defined once, in
`test-design-qa.md` § NFR measurement contracts. What belongs here is the **architecture
consequence** of each contract and the separations that must never collapse.

### Three performance contracts that must stay separate

They share a "500" and a "2 seconds" and **nothing else**. Conflating any two would let a
passing measurement of one be reported as evidence for another.

| | **A — All Employees list** | **B — ACM-9 facade resolver** | **C — P6 `resolveAudiences`** |
| --- | --- | --- | --- |
| Subject | The composed All Employees **HTTP/list route**, end to end, including permission resolution | The **public AccessControl facade call**, end to end, including transaction and result mapping — **not** an HTTP list route | The **`resolveAudiences` function** |
| Authority | `docs/project-requirements.md:614` (v1.5 §7, **normative**) | `docs/architecture/testing-strategy.md` § ACM-9 operational measurement protocol (`ACM9-MVP-v1`), binding | [`p6-resolve-audiences-postgresql.md` at `3a3cd71`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/3a3cd71884bf62d8c56577da1b4b36f2a8b327a3/_bmad-output/test-artifacts/performance/p6-resolve-audiences-postgresql.md) |
| Dataset | 500+ seeded employees, representative relationship breadth and depth, no real personal data | 500 **requested active targets** | 500 synthetic users |
| Statistic | p50, p95 **and** worst case are all *recorded* — **which one the threshold binds to is UNKNOWN** | p50/p95 by nearest rank over 20 measured calls after 5 discarded warm-ups, plus absolute worst case | cold/warm p50/p95/worst, in milliseconds |
| Threshold | **≤ 2 seconds** | warm p95 **and** worst case ≤ 2 s, **per shape** | **None. C is a measurement record, not a gate**, and must never be treated as one |
| Environment | **UNKNOWN** — a PostgreSQL version must be recorded, but no target environment is named anywhere | Recorded via `ACM9-MANIFEST-v1` hashes | As recorded in that artifact |
| Load model | **UNKNOWN** — no concurrent-user model is stated | n/a | n/a |
| Harness | **UNDECIDED, and it does not exist.** Not ACM-9, not P6 | ACM-9 (`ACM9-MVP-v1`) | P6 |
| Risk owner here | [`PR-006`](#risk-register) | — | — |

**The rule that follows.** **No ACM-9 or P6 result is evidence for contract A.** In
particular, ACM-9's "warm p95 **and** worst case" pass rule is **not** read into contract A's
open statistic question merely because contract A also requires p95 and worst case to be
*recorded*: recording a statistic and binding a threshold to it are different acts, and no
authority performs the second for contract A.

**Contract A measurement (U-24 resolved).** Harness **`DIRA1-MVP-v1`**
(`docs/architecture/testing-strategy.md` § DIR-A1): `npm run measure:user-management:dira1` in
`services/backend`. Pass rule: warm p95 **and** worst case ≤ 2 s per gate; environment: local
PostgreSQL via `db:up`; load model: single sequential HTTP client.

**Gate identity (U-25 resolved).** `QUALITY-GATE-AC-NFR` governs **contract B** (the ACM-9
AccessControl facade resolver) only. Its closed state does **not** discharge **`PG-04`** or
contract **A** (the All Employees HTTP/list route). Directory-list evidence is evaluated against
**`PG-04`** / contract **A** only; `PMC-E1-S1.9` cites `PG-04` for that evidence. This document
neither reopens, closes nor renames `QUALITY-GATE-AC-NFR`, and **the standing decision that the
ACM-9 CI job remains informational is not disturbed.**

### Other NFR categories — architecture consequence only

| Category | Architecture gap | Where the contract lives |
| --- | --- | --- |
| Security | Deferred projections; the denial oracle is now a **three-code** contract (`401` invalid or inactive session, `404` hidden or missing target, `403` visible but forbidden), which is richer than the `403`-only statement the superseded document carried | `test-design-qa.md` § NFR measurement contracts — Security |
| Revocation | Partial-sync contract and operational telemetry. The numeric thresholds — **15 minutes**, **4 hours** — are exact and are preserved exactly | § NFR measurement contracts — Revocation |
| Reliability | Timeout, retry and circuit thresholds are **UNKNOWN**; partial-success behaviour is open | § NFR measurement contracts — Reliability |
| Privacy | Enforcement across environments and logs is incomplete | § NFR measurement contracts — Privacy |
| Accessibility / responsive | **WCAG conformance level and viewport set are UNKNOWN.** Two independent sources decline to invent them, and both record that the absence is a planning gap, **not a passing grade** | § Unknown thresholds |
| Availability / recovery | Availability percentage, RTO, RPO, backup frequency, restore and rollback thresholds are **UNKNOWN**; gated by `OPERATIONAL-ENVELOPE` | § Unknown thresholds |
| Deployability | Hosting, topology and rollback envelope are open; gated by `OPERATIONAL-ENVELOPE` | § NFR measurement contracts — Deployment |
| Maintainability / process | The ordering rule must be stated against the **current** policy, not the removed per-stage approval gate | § NFR measurement contracts — Process |
| Configuration-owned thresholds | Production magic-link TTL, rate limits, retry count and retry backoff are **operational configuration**; tests inject deterministic values and verify boundaries, and **no production duration is invented** | § NFR measurement contracts — configuration-owned note |

**Assessment boundary.** These are requirements for later evidence. The final
PASS / CONCERNS / FAIL verdict belongs to `nfr-assess` — **not to this document, not to
`test-design-qa.md`, and not to the migration that produced them.**

---

## Assumptions and dependencies

### Architectural assumptions

1. **`docs/project-requirements.md` v1.5 overrides stale v1.2 planning claims.** The current
   People Management PRD, its addendum and the PM spine refine v1.5 without weakening its
   normative rules. *(Load-bearing — this assumption decides which document wins a conflict.)*
2. The stack remains TypeScript / Node LTS, NestJS 11.x, Prisma 7.x and PostgreSQL.
3. Full-profile access, HR Admin, functional roles and relationship-derived audiences remain
   **four distinct concepts**.
4. **No unspecified latency, availability, recovery, accessibility, retention, retry or
   rate-limit target is inferred.** *(Load-bearing — it is the rule that keeps every UNKNOWN
   in this document honest.)*
5. The `access-control` context is available for tier and permission resolution in
   end-to-end runs — real, not mocked.
6. Test databases hold pseudonymised personas only.

**Two superseded assumptions, re-sourced rather than copied.** The old
`user-management`-scoped assumption that bootstrap HR Admin is covered by an access-control
functional-capability scenario, and the dependency on a 500-row seed owned by a specific
story, both pointed into an access-control suite layout that no longer exists. Their
subjects must be re-sourced against the current 101-file inventory; neither is carried
forward as a citation.

### Dependencies

1. The register entries `OQ-PERM-01`, `OQ-AC-EDIT`, `CC-07`, `TT-IDENTITY-01`, `TT-PMDM-01`
   and `OPERATIONAL-ENVELOPE` before their named waves.
2. `PR-S-01` and `PR-S-02` require **formal sign-off** before People Partner or departure
   implementation, while their Stage-1 design and review may proceed now. `CC-07` remains
   open before any journal-dependent implementation.
3. The actual timetracker contract before project-positive and sync scenarios; the
   PeopleForce contract only if optional prefill is selected.
4. An approved — or explicitly deferred and owned — operational envelope before any
   deployed / demonstrable Definition-of-Done evidence.
5. A PostgreSQL test instance with a migrated schema before any end-to-end evidence.
6. Outbound port DI tokens (email in particular) before dispatch-observability evidence.
7. A settled test-file location convention before the frontend unit and component work
   (U-12).

---

## Risks to this plan

- **Architecture decisions land after feature work starts.** Contracts and evidence churn.
  *Contingency:* progress only ready slices; keep blocked contexts fail-closed.
- **Design closure is read as implementation progress.** Six blockers moved into
  [Ratified design decisions](#ratified-design-decisions) in one step; a reader skimming the
  change sees six fewer blockers. *Contingency:* the governing rule is stated at the head of
  that section, and every row carries its `implementation_status` explicitly. This is the
  single most likely misreading of this document.
- **Filename reuse changes the meaning of old citations.** This path previously held an
  approved `user-management` document. Any citation of `test-design-architecture.md` written
  before 2026-09-10 describes that document. *Contingency:* the status banner at the top, and
  commit-pinned links wherever a historical content claim is made.
- **Optional scope becomes an implicit commitment.** Capacity and security review get
  diluted. *Contingency:* require explicit scope approval before PeopleForce prefill,
  notifications or analytics enter design.

> **Retired from this section:** the superseded "child/platform drift" risk. It is
> discharged by removing the child/platform split, and is replaced by the filename-reuse
> risk above.

---

## Domain navigation

**Navigation only.** Nothing in this section is a source of shared policy. Epic-local risks
and coverage are defined in the epic plans; cross-cutting risk identity is defined in
[Risk register](#risk-register); execution and evidence live in `test-design-qa.md`.

| Domain | Canonical epic identities | Epic plans that receive migrated obligations |
| --- | --- | --- |
| `user-management` | `UM-E0` Access Control Adoption · `UM-E1` Employee Record Management · `UM-E2` Magic-Link Authentication · `UM-E3` Career Timeline · `UM-E4` Organizational Relationships · `UM-E5` Employment Lifecycle · `UM-E6` Current-State Read Endpoints · `UM-E7` Visibility-Safe Filtering and Columns · `UM-E8` Custom Fields as Data | `test-design-epic-user-management-{0,1,2,3,4,5,7}.md` |
| `platform-capabilities` | `PMC-E1` Permission-Safe People Directory · `PMC-E2` People-Grouped Dashboards · `PMC-E3` Project-Grouped Dashboards · `PMC-E4` Inline Directory Editing | `test-design-epic-platform-capabilities-1.md` |
| `mentorship` | `M-E1` Mentorship Hub | `test-design-epic-mentorship-1.md` |
| `platform` | `PLAT-E1`..`PLAT-E8` | — |
| `role-administration` | `RA-E1`, `RA-E2` | — |
| `timetracker` | `TT-E1` Leaves Integration · `TT-E2` Projects and People Sync | — |
| `resourcing` · `risk` · `cds` · `profile-sharing` · `feedback` · `engagement` | `RS-E*` · `RISK-E*` · `CDS-E*` · `PSH-E*` · `FB-E*` · `ENG-E1`, `ENG-E2` | — |

**Rules that this table exists to enforce.**

- **Nothing is renumbered** by this migration, and no ClickUp mapping is touched. Epic
  identities are reused exactly as the canonical `epics.md` sources define them.
- **A bare epic number is ambiguous** — Epic 1 exists in at least ten of the twelve domains
  — which is why every plan, checkpoint and validation report is identified as
  `epic-{domain}-{number}`.
- **`frontend` is not a domain and not an epic.** Frontend obligations belong to the product
  epic they serve, as a test-level subsection inside that epic's plan, or to the QA
  improvement backlog when no product epic owns them.
- **`ENG-E3` and `ENG-E4` are superseded** in their source, with `RISK-E*` and `FB-E*` as
  live successors. No epic plan is created for a superseded epic.
- A domain with "—" has no migrated obligation routed to it by this migration. That is
  **not** a statement that the domain needs no test design.

---

## Open questions

**Every question here stays open. This document invents no answer to any of them**, and
recording an owner is not resolving a question. The register of record, with each question's
full wording and history, is `test-design/migration-map.md` §10.

| # | Question | Owner | Bears on |
| --- | --- | --- | --- |
| **U-2** | **Resolved with authority (2026-09-11)** — sign-off = explicit recorded Product Owner + Architect approval per package; PM/AD-19/AD-20 are direction only. Both **ungranted** until recorded | Product Owner + Architect | [Sign-off-ready packages](#sign-off-ready-packages), `PR-003`, `PR-008` |
| **U-3** | **Resolved with authority** — `DIRA1-MVP-v1` binds warm p95 and worst case; local PostgreSQL; single sequential client | Product Owner + Platform/DevOps | [NFR contract references](#nfr-contract-references), `PR-006` |
| **U-4** | WCAG conformance level and viewport set | Product Owner | NFR categories |
| **U-5** | Uptime SLO, RTO, RPO, backup and retention, timeout/retry/backoff, circuit thresholds | DevOps + Architect + Security | Gated by `OPERATIONAL-ENVELOPE` |
| **U-6** | `DEC-UM-012` — whether a deactivated user's `workEmail` is treated identically to an unknown email for the magic-link route. It remains an explicit **draft decision** and does **not** inherit the DEC-UM-001..011 approval | Product | Epic plans; recorded here because a draft decision must not be read as settled |
| **U-9** | Whether `org:relationships:write`, `profile:timeline:write` and `employee:departure:record` are seeded into the permission catalog. The source states this is a **product and Access Control decision, not a test decision** | Product + Access Control | `OQ-PERM-01`, `OQ-AC-EDIT` in [Open blockers](#open-blockers) |
| **U-10** | Browser support beyond Chromium | Product Owner | Frontend NFR |
| **U-11** | Frontend performance budgets, frontend accessibility requirements, photo-upload size limits | Product Owner | NFR categories |
| **U-12** | Test-file location conventions, the second vitest config, the component-testing library | DEV | [Testability gaps](#testability-gaps) — a prerequisite for all frontend net-new work |
| **U-13** | Whether the application should proactively log out on a timer or `visibilitychange` | Product | Frontend epic plan |
| **U-16** | Whether `platform/epics.md` Story 1.6 is satisfied, partially satisfied, or made obsolete | Platform epic owner | Story 1.6 artifact references |
| **U-17** | For the six blockers now closed at design, what closes them at **implementation**; and what closes the five register entries that remain open | Architect + the per-entry owners | [Ratified design decisions](#ratified-design-decisions), [Open blockers](#open-blockers) |
| **U-18** | `docs/architecture/testing-strategy.md` retains the removed per-stage approval clause in **two** places (`:84` and `:117–119`), contradicting its own lines 25–38. Which sentence does the document intend to keep? | Owner of `docs/architecture/testing-strategy.md` (Architect) | `PR-009`; the ordering rule in [Ready now](#ready-now). **This migration edits nothing under `docs/architecture/`** |
| **U-19** | Which of the **101** access-control scenario files covers which of the **119** normative trace rows | Access Control owners + QA | `PR-009`. Currently unanswerable from any artifact, and **must not be guessed from filenames** |
| **U-20** | **Resolved with authority** — schedulable when `SEC-AUTH-01`, `CC-07`, `AC-S9-S13` and `AC-SECTION-MATRIX-01` are all closed at implementation; evaluated by Platform epic owner + Architect | Platform epic owner + Architect | `PG-01` (in `test-design-qa.md` § Release and design gates) |
| **U-21** | Whether the 20 history-only retired scenario files should remain on disk | Owner of `docs/test-cases/user-management/**` | Out of scope for this migration, which modifies no scenario file |
| **U-22** | What covers the "`useAuth().userId` / `decodeJwtSub` output is unverified" gap | DEV + QA | Frontend obligations |
| **U-23** | **Resolved 2026-09-11** — implemented-test inventory re-counted in `test-design-qa.md` § Implemented-test inventory | QA | Backend e2e **506** (488 + 18 `it.todo`); unit **50**; contract **18** pact interactions; frontend Playwright **124** |
| **U-24** | **Resolved with authority** — `DIRA1-MVP-v1` (`docs/architecture/testing-strategy.md` § DIR-A1) | Platform/DevOps + QA | [NFR contract references](#nfr-contract-references), `PR-006` |
| **U-25** | **Resolved with authority** — `QUALITY-GATE-AC-NFR` governs contract **B** only; contract **A** uses release gate **`PG-04`** | Access Control + Quality Engineering + the platform-capabilities epic owner | [NFR contract references](#nfr-contract-references) |

---

## Obligation trace

Every row of `test-design/migration-map.md` whose `target_path_and_anchor` names this
document, and where it resolved. The list was extracted mechanically from the ledger, not
by reading the superseded documents: **57 obligations** — 51 whose target cell names this
file directly, plus 6 in ledger §4.2 whose target cell reads "same pattern" and resolves to
the row above it. Distribution: 17 `preserve` · 17 `merge` · 17 `replace` in the 51 explicit
rows, plus 6 `preserve` in the resolved rows.

A "split" row appears here with the destination it owns; its other successors are named in
the ledger and are written by the other parts of this migration.

| Ledger `source_anchor_or_id` | Ledger § | Disp. | Resolved in this document |
| --- | --- | --- | --- |
| `legacy-um:S1#header` (Purpose/Date/Author/Status/Project/PRD ref/ADR ref) | §3.1 | `replace` | § Header / status banner |
| `plat:S3#header` | §3.3 | `merge` | § Header / status banner |
| `legacy-um:S1#executive-summary` | §3.1 | `replace` | § Executive summary |
| `plat:S3#executive-summary` | §3.3 | `preserve` | § Executive summary |
| `plat:S3#ownership-boundary` table (UM child / AC Phase-1 inventory / deferred AC slices) | §3.3 | `replace` | § Ownership *(split — the scope index half goes to `test-design/README.md`)* |
| `plat:S3#quick-guide-ready-now` (4 items) | §3.3 | `preserve` | § Ready now |
| `plat:S3#explicit-product-architecture-blockers` (PR-B-01..09) | §3.3 | `merge` | § Open blockers **+** § Ratified design decisions |
| `plat:S4#dependencies-product-and-architecture-decisions` (PR-B table) | §3.4 | `merge` | § Open blockers **+** § Ratified design decisions |
| `plat:S3#ready-for-formal-sign-off` (PR-S-01, PR-S-02) | §3.3 | `preserve` | § Sign-off-ready packages |
| `plat:S4#ready-for-formal-sign-off` | §3.4 | `merge` | § Sign-off-ready packages |
| `plat:S3#established-architecture-constraints` (5 bullets) | §3.3 | `preserve` | § Established constraints |
| `legacy-um:C-05` (timetracker supplies projects/people/PM/DM but **no** reports-to hierarchy; reports-to is… | §5.4 | `preserve` | § Established constraints |
| `legacy-um:S1#high-priority-team-should-validate` | §3.1 | `merge` | § Risk register |
| `legacy-um:S1#risk-assessment` (14 risks, 3 tables) | §3.1 | `merge` | § Risk register |
| `legacy-um:S1#risk-mitigation-plans` (R-001..R-005 detailed plans) | §3.1 | `merge` | § Risk register *(split — mitigation test activities to QA and the epic plans)* |
| `plat:S3#platform-risk-assessment` (PR-001..010) | §3.3 | `preserve` | § Risk register |
| `plat:S3#risk-mitigation-plans` (7 grouped rows) | §3.3 | `merge` | § Risk register — per-risk rationale |
| `um-epic:S5#risk-assessment` (R-UM-01..08) | §3.5 | `merge` | § Risk register — cross-scope risk records *(split — epic-local risks to the epic plans)* |
| `fe-epic:S6#risk-assessment` (R-FE-01..07) | §3.6 | `merge` | § Risk register — cross-scope risk records *(split — epic-local risks to the epic plans and the QA backlog)* |
| `legacy-um:R-001` (SEC 3×3=9, controller bypasses AccessControl facade) | §4.1 | `preserve` | § Risk register — PR-001, origin note *(split — epic obligation to `test-design-epic-user-management-0.md`)* |
| `legacy-um:R-005` (PERF 6, NFR-2 untestable without load harness) | §4.1 | `replace` | § Risk register — PR-006, merged origins |
| `plat:PR-001` (SEC 3×3=9, projection/leak paths) | §4.2 | `preserve` | § Risk register — PR-001 |
| `plat:PR-002` (SEC 9, stale graph/sync/outage/departure retains access) | §4.2 | `preserve` | § Risk register — PR-002 |
| `plat:PR-003` (DATA 9, PP contract before sign-off / without CC-07 journal) | §4.2 | `preserve` | § Risk register — PR-003 |
| `plat:PR-004` (SEC 9, full-profile overlay precedence unresolved) | §4.2 | `preserve` | § Risk register — PR-004 |
| `plat:PR-005` (TECH 9, unknown timetracker contract) | §4.2 | `preserve` | § Risk register — PR-005 |
| `plat:PR-006` (PERF 2×3=6, arbitrary fields + bulk resolution may breach ≤2s at 500+) | §4.2 | `merge` | § Risk register — PR-006 |
| `plat:PR-007` (DATA 6, dashboard/resourcing/campaign aggregate drift) | §4.2 | `preserve` | § Risk register — PR-007 |
| `plat:PR-008` (OPS 6, departure contract before sign-off / without AD-20 controls) | §4.2 | `preserve` | § Risk register — PR-008 |
| `plat:PR-009` (OPS 6, treating draft AC files as coverage) | §4.2 | `replace` | § Risk register — PR-009 |
| `plat:PR-010` (DATA 6, identity mismatch / real PII) | §4.2 | `merge` | § Risk register — PR-010 |
| `legacy-um:S1#residual-risk-after-planned-mitigation` (5 rows) | §3.1 | `preserve` | § Residual risk |
| `plat:S3#residual-risk-rule` | §3.3 | `preserve` | § Residual risk *(the governing rule)* |
| `legacy-um:S1#testability-concerns-gates-to-fast-feedback` (4 rows) | §3.1 | `merge` | § Testability gaps |
| `legacy-um:S1#architectural-improvements-needed` (exception mapping, transaction helper) | §3.1 | `preserve` | § Testability gaps — improvements 5 and 6 |
| `plat:S3#testability-concerns-blockers-to-fast-feedback` (6 rows) | §3.3 | `preserve` | § Testability gaps — blockers to fast feedback |
| `plat:S3#architectural-improvements-needed` (4 numbered) | §3.3 | `preserve` | § Testability gaps — architectural improvements needed |
| `legacy-um:S15#6-controllability-observability-reliability-isolation` (7 rows) | §3.10 | `merge` | § Testability gaps — controllability, observability, reliability, isolation |
| `um-epic:R-UM-01` (TECH 3×3=9, every logic change costs a full Nest boot + migrated DB) | §4.3a | `merge` | § Testability gaps **+** § Risk register — cross-scope risk records *(split — level strategy to QA)* |
| `legacy-um:S1#testability-assessment-summary` (what works well / trade-offs) | §3.1 | `merge` | § Testability assessment |
| `plat:S3#testability-assessment-summary` | §3.3 | `merge` | § Testability assessment |
| `legacy-um:S1#assumptions-and-dependencies` | §3.1 | `replace` | § Assumptions and dependencies |
| `plat:S3#assumptions-and-dependencies` | §3.3 | `preserve` | § Assumptions and dependencies |
| `plat:S3#risks-to-this-plan` (3 bullets) | §3.3 | `replace` | § Risks to this plan |
| `plat:PR-B-01 / OQ-114` (EAV vs JSONB custom-field storage; indexed visibility-safe filter/sort; column-per… | §5.2 | `replace` | § Ratified design decisions — PR-B-01 |
| `plat:PR-B-02 / OQ-115` (one dashboard engine's widget authorization, aggregation, counter projection) | §5.2 | `replace` | § Ratified design decisions — PR-B-02 |
| `plat:PR-B-03 / OQ-116` (non-manager project-assignment semantics; resulting policy target roles) | §5.2 | `replace` | § Ratified design decisions — PR-B-03 |
| `plat:PR-B-04 / OQ-117` (profile bounded-context boundary; S1–S16 projection ownership) | §5.2 | `replace` | § Ratified design decisions — PR-B-04 **+** § Testability gaps *(the whole-`User` serialization seam)* |
| `plat:PR-B-05 / OQ-105` — **half 1 of 2: who may grant/revoke HR Admin** | §5.2 | `replace` | § Ratified design decisions — PR-B-05, split 1 of 2 |
| `plat:PR-B-06 / CC-05` (Self versus full-profile overlay precedence; effective section mapping) | §5.2 | `replace` | § Ratified design decisions — PR-B-06 |
| `plat:PR-B-05 / OQ-105` — **half 2 of 2: remaining default role-permission assignments** | §5.2 | `preserve` | § Open blockers — PR-B-05, split 2 of 2 |
| `plat:PR-B-07 / CC-07` (immutable relationship/access journal schema, snapshots, reader authorization, tran… | §5.2 | `preserve` | § Open blockers — PR-B-07 / CC-07 |
| `plat:PR-B-08` (timetracker API/auth/identity/error contract; events vs state-at-sync; partial/intermittent… | §5.2 | `replace` | § Open blockers — PR-B-08 |
| `plat:PR-B-09` (hosting, environment topology, secrets, backup/restore, monitoring, alert ownership, rollba… | §5.2 | `replace` | § Open blockers — PR-B-09 |
| `plat:PR-S-01 / CC-04` (one PP per employee; atomic optimistic create/replace/delete; next-request revocati… | §5.2 | `replace` | § Sign-off-ready packages — PR-S-01 |
| `plat:PR-S-02 / CC-06` (effective date/reason; relationship blockers and outcomes; durable retrying fail-cl… | §5.2 | `replace` | § Sign-off-ready packages — PR-S-02 |
| `plat:boundary/"closing design discovery does not close implementation work"` | §5.2 | `preserve` | § Sign-off-ready packages, boundary **+** the governing rule over § Ratified design decisions |

**Checked against the ledger's 51 `retire` rows.** No retired obligation appears in this
document as an active obligation. The retirements that would most plausibly have been
re-copied are stated explicitly as retirements, with their authority: `R-003`, `R-004`,
`R-013` and `DG-05` in [Risks retired at migration](#risks-retired-at-migration); the
the "review and approve … one by one" instruction in [Ready now](#ready-now); the "approved
User Management child" bullet in [Testability assessment](#testability-assessment); the
child/platform drift risk in [Risks to this plan](#risks-to-this-plan). The superseded
footer that pointed at a non-existent access-control README is not carried forward.

---

**What this document does not do.** It grants no approval, records no validation verdict,
claims no coverage, asserts no pass rate, and resolves no open product decision. It changes
no requirement, no scenario file, no trace or coverage artifact, no sprint status, no
service file and no gitlink.

**Companion documents.** `test-design-qa.md` (execution, evidence and coverage strategy) ·
`test-design/README.md` (the current-artifact index) · `test-design/migration-map.md` (the
disposition ledger this document was written from).
