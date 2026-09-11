# Test Design for QA: People Management Platform

> ## Status: **approved**. This document inherits nothing from the document it replaces.
>
> This path previously held `Test Design for QA: User Management`, a `user-management`-scoped
> document carrying "**Approved — 2026-08-25**". That document is superseded, **its approval does
> not transfer to this one**, and no validation verdict transfers either.
>
> - **Approval:** **granted 2026-09-11** (explicit stakeholder confirmation in workspace).
> - **Validation:** **PASS** — system Validate recorded in `test-design-validation-report.md`
> (2026-09-11). Not a release verdict.
> - **Coverage:** none asserted. This document plans and records; it does not state that any test
> exists, that any suite passes, or that any gate is green. **No pass rate appears anywhere in
> it.**
> - **Scope changed with the filename.** The old document was scoped to the `user-management`
> bounded context. This one is the single **platform** execution and coverage strategy.
> - **Every checkbox in this document is unticked**, including the four that were ticked against a
> 2026-08-25 state in the superseded document. A new document may not inherit ticked boxes.
>
> Because the filename is reused, any statement elsewhere about "what `test-design-qa.md` says"
> that was written before 2026-09-10 describes the old document, not this one. Read the superseded
> content at its commit:
> `https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/_bmad-output/test-artifacts/test-design-qa.md`

**Purpose:** The one platform **execution and coverage strategy**. It owns evidence contracts,
execution strategy, isolation policy, level strategy, the risk → evidence map, the coverage plan,
the release and design gates, the cross-epic regression map, and the **NFR measurement contracts**.
It does **not** own risk identity, risk scores, risk rationale, residual risk, architecture seams or
testability gaps — those belong to `test-design-architecture.md`, which this document **references
and never redefines**.

**Date:** 2026-09-10
**Author:** Test-design consolidation migration, Task 3 (`docs/superpowers/plans/2026-09-10-test-design-consolidation.md`)
**Status:** **Approved 2026-09-11** · validation **PASS** (system-level, 2026-09-11)
**Scope:** Platform (system-level). Not an epic, and not a bounded context.
**Baseline commit:** `76a7220701ac6f16843dad8b303934f9a958b54c` (backend `f1eea3c0…`, frontend `fa3d3198…`)
**Requirements reference:** `docs/project-requirements.md` v1.5 (normative). Historical PRDs — including `prd-user-management-2026-08-20`, which the superseded document cited — are **not** current requirements.
**Binding policy reference:** `docs/architecture/testing-strategy.md`, `docs/architecture/README.md` non-negotiables, `docs/architecture/user-management-test-decisions.md` (DEC-UM-001..012), `docs/architecture/api-conventions.md`.
**Companion:** `test-design-architecture.md` (risk and testability baseline) · `test-design/README.md` (current-artifact index) · `test-design/migration-map.md` (the disposition ledger this document was written from).
**Migration record:** where this document and the ledger disagree, the ledger is the record of what was decided and why.

---



## Executive summary

**What this document is for.** It states how evidence is produced for the platform: at which
level, under which isolation policy, in which execution slot, against which measurement contract,
and behind which gate. Every risk it maps is defined elsewhere; every scenario it counts is owned
elsewhere. Its job is to make the *evidence* rules single-sourced so no epic plan has to invent
them.

**Ownership, stated once.** `test-design-architecture.md` § Risk register is the single definition
point for `PR-001`..`PR-010` — identity, category, probability, impact, score, rationale, residual
risk. This document **references those identifiers and maps them to evidence**. It re-scores
nothing and re-argues nothing. See [Ownership](#ownership).

**Four evidence surfaces, kept apart on purpose.** Backend, frontend, contract and live-integration
each have their own execution slot, their own isolation mechanism and their own evidence meaning.
They are **not** interchangeable, and a figure from one is never evidence for another. See
[Execution strategy](#execution-strategy).

**Three performance contracts, kept apart on purpose.** Contract **A** (the All Employees
HTTP/list route), contract **B** (the ACM-9 facade resolver) and contract **C** (P6
`resolveAudiences`) share a "500" and a "2 seconds" and nothing else. A passing measurement of one
is **never** evidence for another. See [NFR measurement contracts](#nfr-measurement-contracts).

**What this document deliberately does not settle.** Open questions — U-4, U-5, U-6, U-9, U-10,
U-11, U-13, U-16, U-17, U-18, U-21..U-22 — remain open; **U-2**, **U-12**, **U-19**, **U-20**,
**U-23**, **U-24**, and **U-25** are resolved below. This document **answers none of the still-open items
them**. `DEC-UM-012` remains a **draft decision**. No unknown threshold is filled in anywhere. See
[Unknown thresholds](#unknown-thresholds) and [Open questions](#open-questions).

**Counts in this document, and what they are not.** Planning volumes, planning rows, net-new case
counts and implemented-test counts are four different things and are never added together. The
implemented-test counts are **VERIFIED** (U-23 resolved 2026-09-11) in
[Implemented-test inventory](#implemented-test-inventory--verified-u-23-resolved-2026-09-11). Pass
rate from the recount is informational only and is not derived into estimates. See [Effort](#effort)
and [Planning volume](#planning-volume).

---



## Ownership

The plan's ownership split, restated so a reader can tell in one look which document to edit.


| Concern                                                          | Owner                                            | This document's role                                                            |
| ---------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------- |
| Risk identity, category, P × I, score, rationale, residual risk  | `test-design-architecture.md` § Risk register    | **References the IDs only.** Never redefines, never re-scores.                  |
| Architecture seams, testability gaps, architectural asks         | `test-design-architecture.md` § Testability gaps | References where an ask gates evidence.                                         |
| Ratified design decisions, open blockers, sign-off packages      | `test-design-architecture.md`                    | References blocker IDs where they gate a plan row or a gate.                    |
| **Evidence contracts and evidence levels**                       | **This document**                                | [Evidence levels](#evidence-levels-and-what-each-one-proves)                    |
| **Execution strategy and isolation policy**                      | **This document**                                | [Execution strategy](#execution-strategy)                                       |
| **Level strategy and the level tripwire**                        | **This document**                                | [Level strategy](#level-strategy)                                               |
| **Risk → evidence map**                                          | **This document**                                | [Risk → evidence map](#risk--evidence-map)                                      |
| **Coverage plan, coverage ownership, coverage-state vocabulary** | **This document**                                | [Coverage plan](#coverage-plan)                                                 |
| **Normative coverage map (**`TR-`***)**                          | **This document**                                | [Normative coverage map](#normative-coverage-map)                               |
| **NFR measurement contracts**                                    | **This document**                                | [NFR measurement contracts](#nfr-measurement-contracts)                         |
| **Release and design gates (**`DG-`***,** `PG-`***)**            | **This document**                                | [Release and design gates](#release-and-design-gates)                           |
| **Cross-epic regression map**                                    | **This document**                                | [Cross-epic regression map](#cross-epic-regression-map)                         |
| **QA improvement backlog**                                       | **This document**                                | [QA improvement backlog](#qa-improvement-backlog)                               |
| Epic-specific scenario and case coverage                         | `test-design-epic-{domain}-{number}.md`          | Routes obligations to them; states no per-epic coverage itself.                 |
| Scenario documents themselves                                    | `docs/test-cases/**`                             | **Not modified by this migration.** Present or absent — see the D-1 note below. |
| Final NFR PASS / CONCERNS / FAIL verdict                         | `nfr-assess`                                     | **Not this document.** See the [assessment boundary](#assessment-boundary).     |


**Ruling D-1 (2026-09-10, human user), applied throughout this document.**
`docs/architecture/testing-strategy.md` lines 25–38 are the authority: `docs/test-cases/**`
scenario documents **no longer carry an approval status**. "Draft", "pending approval" and
"unapproved" are no longer meaningful states for them — **a scenario is present or absent**. Stage
approval was removed on 2026-09-04. Consequently:

- Nothing in this document asks anyone to establish, reconstruct or record an approval state for
any scenario document.
- Where a preserved source cell said "approval pending", that clause is retired with D-1 as
authority and is marked as a retired source clause, never carried as a live obligation.
- The `AC STAGE-1 DRAFT` planning state is preserved as a **source** state recorded on 2026-08-29
and pinned at `76a7220`. It is **not** re-asserted as a live state and **not** converted to
"approved" — the correct current statement is that the per-file gate does not exist, so neither
word applies.

**Two corrections carried from the migration, both load-bearing and neither re-derivable from the
superseded documents.**

1. **The access-control inventory is 101 files**, machine-counted at `76a7220`:
  `docs/test-cases/access-control-foundation/` (**10** `.md`) plus
   `docs/test-cases/access-control-kernel/` (**91** `.md`). The figure "**171**" and the path
   `docs/test-cases/access-control/` that five superseded documents repeat are **wrong** — that
   path does not exist. They appear in this document only here, as an explicitly labelled
   correction of a prior error, and are never a current input.
2. `k6` **is not a repository decision.** No binding document selects a harness for the All
  Employees list requirement. The string does not appear in this document as a current choice
   anywhere. See [contract A](#contract-a--all-employees-httplist-route) (`DIRA1-MVP-v1`).

---



## Coverage-state vocabulary

**Preserved verbatim in meaning from** `plat:S4`**.** This six-state vocabulary is the mechanism that
stops a planning state being read as coverage (`PR-009`). Every row of the
[normative coverage map](#normative-coverage-map) and the [coverage plan](#coverage-plan) carries
one of these states, and **none of them is a coverage claim**.


| State                       | Meaning                                                                                                             | What it is **not**                                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `READY NOW`                 | Nothing blocks designing and writing the evidence for this row today.                                               | Not a claim that the evidence exists.                                                                      |
| `READY FOR FORMAL SIGN-OFF` | A source planning state for rows whose Stage-1 design and review were ready; it does not close their independent implementation or evidence blockers. | Not the approval record. Both package sign-offs are [recorded in the PM memlog](../planning-artifacts/architecture/architecture-people-management-2026-08-19/.memlog.md); PM/AD-19/AD-20 remain direction only. |
| `PRODUCT/ARCH BLOCKED`      | A named blocker must be resolved before the row can be designed through.                                            | Not a waiver. The named blocker travels with the row.                                                      |
| `AC STAGE-1 DRAFT`          | **A source state recorded on 2026-08-29**, retained as history.                                                     | **Not** a live approval state — under D-1 those files are present or absent (see [Ownership](#ownership)). |
| `E2E DEPENDENCY`            | The row needs an environment, provider contract or seeded population that is not available.                         | Not a scheduling estimate.                                                                                 |
| `OUT OF SCOPE`              | v1.5 marks the underlying capability GOOD TO HAVE or excludes it in §10.                                            | Not a promotion path. Preserved as out of scope; never quietly promoted.                                   |


**The three coverage states that must never collapse into each other** (the restated `PR-009`
obligation, on which the risk's *rationale* is owned by `test-design-architecture.md`):

1. a **present scenario document** under `docs/test-cases/`**;
2. a **committed-red Stage-2 test**;
3. **green production code** with the suite actually executed in CI.

State 1 is never promoted to state 3. The live failure mode is not a missing approval — it is CI
not running the suites. The end-to-end job is `continue-on-error` today, which is recorded in the
[QA improvement backlog](#qa-improvement-backlog) with an owner and a trigger, and which this
migration does **not** propose to change.

---



## Level strategy

**One shared rule, referenced by every epic plan.** This is the platform's answer to a finding that
three independent sources reached separately — the 2026-08-25 critical review ("incorrect test
levels"), `um-epic:S5` and `fe-epic:S6` — and to the estate-level risk `R-UM-01` / `R-FE-04`
("every logic change costs a full Nest boot plus a migrated database, so there is no sub-second
feedback loop"). The **risk is defined in** `test-design-architecture.md` §
Risk register — cross-scope risk records; the **level rule is owned here**.

### The decision rule


| If the behaviour under test …                                                                             | … then the level is                   | Rationale                                                       |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------- |
| is a pure function of its inputs (parsing, formatting, mapping, normalization, state tables)              | **unit**                              | No boot, no database, sub-second.                               |
| is rendering or interaction logic over supplied props/state, with no network                              | **component** (jsdom, network mocked) | See the precision note below.                                   |
| is a provider/consumer payload shape agreed between two codebases                                         | **contract (Pact)**                   | Proves the shape without a browser and without a live provider. |
| is an authorization decision, a persistence invariant, a transaction boundary, or an HTTP status contract | **api-e2e** (real HTTP + PostgreSQL)  | These cannot be proven below the boundary users actually reach. |
| depends on a real external provider's behaviour                                                           | **integration-live**                  | Weekly / pre-release only.                                      |
| is browser-level navigation, session or end-user flow                                                     | **Playwright e2e**                    | A real browser against a mocked or real API.                    |


**Precision that the migration recorded and that must not be lost:** `component` means **a
component rendered in** `jsdom` **with the network mocked** — no browser process, no HTTP, no
database. It is **not** interchangeable with the frontend Playwright e2e figures, which are a real
browser. Substituting one for the other silently changes what the evidence proves.

**No new unit or component case may claim requirement coverage it does not have.** This rule is
preserved verbatim in meaning from the level-strategy handoff: moving a case down a level changes
its cost, not its scope.

### The ratio tripwire

**Explicitly a tripwire, not a mandate, and never a coverage claim.** Preserved from
`um-epic:S5#target-ratio` and `fe-epic:S6#target-ratio` as one shared statement: a domain rule
should be verifiable **without a database**, and a level distribution that drifts far from that is
a signal to look, not a number to satisfy. The associated `um-epic:nfr/maintainability` obligation
("a domain rule is verifiable without a database") is tracked here as that tripwire and as nothing
else.

### Implemented-test inventory — **VERIFIED** (U-23 resolved 2026-09-11)

Re-counted **2026-09-11** against workspace gitlinks `services/backend` `3bc801a…` and
`services/frontend` `fa3d319…`. **Inventory only** — discovery via the canonical npm scripts and
jest/playwright configs (`test/jest-e2e.json`, default `package.json` jest, `test/jest-contract.json`,
`playwright.config.ts`, `vitest.contract.config.ts`). **Not** raw `find`. Pass rate is reported
separately and is **not** an estimate input.


| Stack    | Layer            | Files (suites)                | Cases                                                      | Status                                                                      |
| -------- | ---------------- | ----------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------- |
| Backend  | e2e              | 54 (`test/jest-e2e.json`)     | **506** discovered (**488** executable + **18** `it.todo`) | **VERIFIED** — supersedes contradictory 340 / 406 / "43 files" (2026-09-06) |
| Backend  | unit             | 6 (`src/**/*.spec.ts`)        | **50**                                                     | **VERIFIED** — supersedes "5 unit" (2026-09-06)                             |
| Backend  | contract         | 1 (`test/jest-contract.json`) | **18** pact interactions (1 provider suite)                | **VERIFIED**                                                                |
| Frontend | Playwright e2e   | 7                             | **124**                                                    | **VERIFIED** — matches 2026-09-06 source                                    |
| Frontend | component / unit | 0 on `main`                   | 0 on `main`                                                | **VERIFIED** — no layer on `main` yet; 2 files / 4 cases on unmerged branch `feat/u-12-unit-component-testing` (`60bc882`) (U-12) |
| Frontend | Pact consumer    | 5                             | **18**                                                     | **VERIFIED**                                                                |


**Recount commands (authority):** `npm run test:e2e -- --json` · `npm test -- --json` ·
`npm run test:contract -- --json` (backend) · `npx playwright test --list` ·
`npm run test:contract -- --reporter=json` (frontend).

**Pass rate at recount (informational, local Postgres, not a release verdict):** backend e2e
**459 pass / 29 fail / 18 todo**; unit **50 pass**; backend contract provider suite **pass**;
frontend Playwright inventory only (not executed in this recount).

**Consequence:** implemented-test inventory is now a **verified baseline** for planning references.
It remains **category 1** — still **excluded from the category-2 net-new estimate** (the 15–23
engineer-day figure counts only net-new authoring).

---



## Evidence levels and what each one proves

The evidence vocabulary, kept as distinct levels so no row silently substitutes one for another.


| Level                              | What it runs against                                    | What it proves                                                               | What it does **not** prove                       |
| ---------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------ |
| `unit`                             | Nothing external                                        | A pure rule                                                                  | Nothing about wiring, HTTP or persistence        |
| `component`                        | jsdom, **network mocked**                               | Rendering/interaction over supplied state                                    | Nothing about a real browser, HTTP or a database |
| `contract (Pact)`                  | Provider/consumer verification                          | The agreed payload shape                                                     | No browser, no live provider                     |
| `api-e2e (real HTTP + PostgreSQL)` | Backend Jest + supertest against a migrated database    | Authorization, invariants, transaction and status contracts                  | Nothing about a real external provider           |
| `integration-live`                 | A **real external provider** (timetracker, PeopleForce) | Provider behaviour in the test environment                                   | Not runnable in the PR gate                      |
| `measurement (ACM9-MVP-v1)`        | The AccessControl facade                                | [Contract B](#contract-b--acm-9-accesscontrol-facade-resolver) only          | **Never** contract A                             |
| `measurement (P6)`                 | `resolveAudiences`                                      | [Contract C](#contract-c--p6-resolveaudiences) — a record, not a gate        | **Never** a gate, **never** contract A           |
| `ci-scan`                          | The repository                                          | A binary scan result                                                         | Not a provenance judgement on its own            |
| `repository-audit`                 | The repository                                          | A static structural fact                                                     | Not an execution result                          |
| `manual-review`                    | A human                                                 | A reviewed judgement                                                         | Not automated regression protection              |
| `unexecuted`                       | —                                                       | The check exists and **has not been run**                                    | Nothing                                          |
| `unverified`                       | —                                                       | Something is asserted somewhere and **no evidence was located** at `76a7220` | Nothing                                          |


**No row anywhere in this document asserts that any evidence currently passes.**

---



## Test infrastructure

Merged from `legacy-um:S2#qa-infrastructure` (5 items) and the platform dataset requirement.

1. **Test data isolation is platform infrastructure, not per-story invention.** It restates
  `DEC-UM-010` and is stated in full under [backend isolation](#backend-isolation).
2. **A PostgreSQL test instance with a migrated schema** is a precondition of any api-e2e evidence.
3. **Outbound ports are bound to fakes by DI** — the email port in particular — before any
  dispatch-observability evidence.
4. **Injected clock and timezone seams** for the 15-minute, 4-hour, magic-link-expiry and
  departure-cutoff boundaries.
5. **A 500+ seeded employee dataset** with representative relationship breadth and depth and **no
  real personal data**. This is the dataset of
   [contract A](#contract-a--all-employees-httplist-route). The superseded item described it as a
   seed "for k6"; **the harness is UNDECIDED** and the seed requirement survives without it.

---



## Persona and denial-actor conventions

**Preserved from** `legacy-um:C-04`**, and it survives the routes it was written against.** Use **Ida**
for generic feature-permission denials, and **Bob** only for a manager-specific probe. The
convention exists to catch an incorrect "any functional role" gate: a denial proved only with a
manager persona cannot distinguish "denied because the feature capability is missing" from "denied
because this manager is not in the target's line". It is a cross-epic convention and is **not** tied
to `TD-UM-REG-03` or `TD-UM-DEACT-03`, both of which changed.

**The denial oracle is a three-code contract** (PM/AD-24), richer than the `403`-only statement the
superseded document carried: `401` invalid or inactive session · `404` hidden or missing target ·
`403` visible but forbidden. Asserting the wrong code passes a test for the wrong reason.

**Absence-of-session assertions need an explicit** `Set-Cookie` **check** to mean anything.

---



## Execution strategy

**The plan's target table requires separate backend, frontend, contract and live-integration
sections. They are separate here because their mechanisms are different**, and collapsing them
into one "worker" rule would lose both of the constraints it merged.

### Philosophy

**Preserved — independently restated by four sources** (`legacy-um:S2`, `plat:S4`, `um-epic:S5`,
`fe-epic:S6`), which is why it is stated once here rather than four times: **all gate end-to-end
evidence runs in the pull request unless it exceeds the PR budget**, at which point it moves to a
slower slot with a named reason. Nothing runs live third-party calls in the PR gate (PM/AD-3).

**The superseded "~10–15 minutes per PR" budget is not carried forward as a current figure.** It
disagrees with the newer measured observations below, and all of them are `unverified`.

### Backend

- **Backend end-to-end evidence is** `api-e2e`**: real HTTP + PostgreSQL**, backend Jest + supertest
against a migrated database. It is not substitutable by `contract (Pact)` and not substitutable
by `component`.
- **Inventory — VERIFIED 2026-09-11 (U-23):** 54 e2e suites / **506** cases (**488** executable +
**18** `it.todo`); 6 unit files / **50** cases; 1 contract file / **18** pact interactions.
Supersedes the contradictory 2026-09-06 figures (340 vs 406 cases; "43 files").
- **Observed timings — VERIFIED 2026-09-11 on the same gitlink (local,** `--runInBand`**):** unit ~1.1 s;
e2e ~97 s; contract ~2 s. **Pass rate is informational** (459 pass / 29 fail / 18 todo on e2e at
recount) and is not asserted as a CI or release guarantee.



#### Backend isolation

**Rechecked against the *current* binding policy, not against the superseded document.**
Authority: `docs/architecture/testing-strategy.md` § "Test data isolation (DEC-UM-010)",
**lines 254–261**, re-read at `76a7220`. It binds:

1. **One test worker now.** Backend e2e runs serial (`--runInBand`) because the suites share **one
  database**; each run and each test uses a **collision-proof UUID namespace** and deletes only
   the data it owns.
2. **One PostgreSQL schema per worker is a *precondition of* enabling parallel workers** — not a
  standing task, and **a** `Date.now()` **prefix alone is not sufficient**.
3. **Isolation is platform infrastructure**, so feature owners do not invent ad-hoc isolation per
  story.

This is the mitigation surface for the shared-database risk recorded as `R-UM-04` (TECH, 3 × 2 =
**6**) and its origin `legacy-um:R-008` (OPS, 4). **The score is 6 and it is a high risk** — its
placement under a "Medium-Priority Risks (Score 3–4)" heading in the source is the defect, not the
score. The risk-register entry lives in `test-design-architecture.md`; the mitigation lives here.
Neither the score nor the source document was changed.

**Schema-per-worker is deliberately not scheduled.** The source's own conclusion — "schema-per-worker
would unlock parallelism; it is not needed at 90 seconds and should not be built until it is" —
agrees with DEC-UM-010's ordering. It therefore carries **no estimate**, rather than an estimate of
zero. `legacy-um:G-16` (implement the approved CI isolation progression) is **retired**: DEC-UM-010
is binding policy and `--runInBand` is the current behaviour, so the progression's first stage is
done and its second stage is a conditional precondition, not an open gap.

`legacy-um:B-03`, carried in the superseded set as a scoped CI gate, **survives here as
DEC-UM-010**. Its companion `legacy-um:B-04` is **retired**: it depended on a registration
transaction that PM/AD-16 and PM/AD-21 removed and that DEC-UM-008 retires.

#### Concurrency coverage

- `@concurrency` **scenarios issue parallel HTTP inside one isolated test** via `Promise.all`.
They do **not** require multiple test workers, and they must genuinely dispatch in parallel — a
concurrency outcome asserted without concurrent dispatch gives false confidence.
- **Current concurrency coverage is thin, and one half of the gap has no successor case.**
`legacy-um:G-15` recorded that only `um-reg-08` addresses concurrency. Partially discharged: the
concurrent duplicate reports-to case survives as `TD-UM-REL-08` (owner `UM-E4`, DEC-UM-005 makes
a second reports-to `POST` a `409`). **"Concurrent PATCH of the same field" has no successor
case** and is carried in the [QA improvement backlog](#qa-improvement-backlog) with owner QA and
trigger "a concurrent-write defect, or a new same-field mutation route".
- **Fixtures that persist across files leave downstream tests reading polluted state.** Fixtures are
transaction-safe and run-namespaced.



### Frontend

**A separate constraint with a separate mechanism.** Playwright parallelises **by file** over
browsers, with **no shared database**. The frontend therefore does **not** inherit `--runInBand` or
the one-worker rule, and the backend does **not** inherit `retries: 2`.

- `playwright.config.ts` **sets** `retries: 2` **in CI.** That is a frontend fact and stays a frontend
fact.
- **Observed timings — UNVERIFIED, dated 2026-09-06:** 124 cases / 19 s; unit `< 2 s` target;
component `< 10 s` target; contract ~2 s. The unit and component targets are **targets for a layer
that does not exist yet**, not measurements.
- **Prerequisite, formerly blocking all frontend net-new work — resolved by DEV (2026-09-11,
U-12):** co-located `*.test.ts` / `*.test.tsx`; a second vitest config, `vitest.config.ts`;
`@testing-library/react` + `@testing-library/jest-dom` + `@testing-library/user-event`.
Implemented on `services/frontend` branch `feat/u-12-unit-component-testing` (`60bc882`),
proven by two passing specs. **Not yet merged to `main`** — net-new frontend work stays
blocked until it is.
- `data-testid` **selector requirements** are preserved from the superseded handoff and are **no
longer "deferred behind an API-first gate"** — the frontend exists, with 124 Playwright cases.
Stable test ids are a frontend obligation now, and they belong to the component and e2e levels.



### Contract

`contract (Pact)` **is provider/consumer verification: no browser, no live provider, no database.**
It proves the agreed payload shape and nothing else. It is the level that already caught a live
defect the migration preserved: **the backend returns** `null`**s that no fixture produced** — the
"nullable omitted columns return present-and-`null`" obligation (`legacy-um:A-05`), independently
re-derived by `R-UM-06` and `R-FE-02`, is now an evidenced obligation rather than the
"not explicitly sourced" flag it was on 2026-08-25. Its cases live in the owning epic plan at
`unit + component + contract (Pact)`.

Frontend contract shapes are owned by the frontend `contract/` layer — a shared convention, not an
epic-local choice.

### Live integration

**Weekly / pre-release slot only. Never in the PR gate** (PM/AD-3).

- **Timetracker** uses the provider's **test environment** and the seeded population (v1.5 §5.1 and
the §7 privacy rule). It is **blocked on** `PR-B-08` — the API/auth/identity/error contract,
events-versus-state-at-sync semantics and partial/intermittent behaviour are unresolved.
- **PeopleForce requires no live run**: v1.5 §5.2 marks the prefill GOOD TO HAVE. Unchanged.
- `integration-live` **evidence is never substituted for** `api-e2e` and never the reverse.



### Nightly

The nightly slot carries what is too slow or too environment-dependent for the PR gate. The
"**no live third-party calls in gate E2E**" rule (PM/AD-3) is preserved unchanged.

**The subject of the old nightly performance slot is replaced.** It was described as a k6 run of a
`GET /users` list SLA. The surviving obligation is
[contract A](#contract-a--all-employees-httplist-route) — the composed All Employees route
including permission resolution — harness `DIRA1-MVP-v1`; **PASS final artifact**
`performance/dira1-final-dira1-1789080461725-944ce5c2a33a.json` (local env). There
is no nightly performance job to schedule until that is decided.

### Weekly / pre-release

Live-integration evidence (above), the deployment-and-demonstrable evidence gated by `PR-B-09`, and
any measurement contract whose harness exists.

---



## Execution dependencies

Preserved from `plat:S4#e2e-and-integration-dependencies`. Item 1's inventory is corrected; items
2–7 stand unchanged.

1. **The access-control scenario inventory** — `docs/test-cases/access-control-foundation/` (10)
  and `docs/test-cases/access-control-kernel/` (91), **101 files** at `76a7220`. *(Correction of a
   prior error: the superseded documents named* `docs/test-cases/access-control/` *and "171 files";
   that path does not exist. Neither the dead path nor the 171 figure is a current input.)*
2. A PostgreSQL test instance with a migrated schema.
3. The seeded 500+ population with representative relationship breadth and depth.
4. Outbound port DI tokens, email in particular.
5. Controllable clock and timezone seams.
6. The timetracker test environment and its resolved contract (`PR-B-08`).
7. An approved — or explicitly deferred and owned — operational envelope (`PR-B-09`) before any
  deployed/demonstrable evidence.

---



## Access-control dependency

Access control is a **dependency of almost every other evidence surface**, and it is the reason
`PG-01` exists.

- The real inventory is the **101** files named above. No approval state is sought for them (D-1).
- The **AccessControl facade is the sole authorization entry** (`docs/architecture/README.md`
non-negotiable 7). Every route class needs its denial evidence through the facade, never through
a direct policy read.
- **Access control is not schedulable today** — see `[PG-01](#release-and-design-gates)` for the
current, evidenced rationale and for what it replaced.



## Access-boundary evidence (platform)

**Owned by the platform pair, cross-referenced from the epic plans — not duplicated into them.**

**"Self cannot PATCH another person's record"** (origins `legacy-um:TD-UM-PF-05` and
`plat:TR-4.3-01`) is an **access-control** decision, not a profile-feature decision:
`docs/architecture/README.md` non-negotiable 7 makes "who may write another person's record" a
facade question. The **rule** therefore lives here, in the platform pair, and the **instance** is
cross-referenced from `test-design-epic-user-management-0.md` § Coverage, where `UM-E0-S0.2` is the
write-path dual gate. Placing the rule here is what stops a second source of shared policy
appearing in an epic plan.

*Corroboration:* `docs/test-cases/user-management/access-control-adoption/` holds 24 scenarios on
disk. *Gate it depends on:* `SEC-AUTH-01` is **P0 open**. Evidence level: `api-e2e`.

---



## Risk → evidence map

**Every identifier in this table is defined in** `test-design-architecture.md` **§ Risk register.**
This table states **what evidence would move each risk**, at what level, and what currently exists.
It does not restate the risk, its category, its score or its rationale, and it **re-scores
nothing**.


| Risk (defined in `test-design-architecture.md`)                | Evidence that would move it                                                                                                                                                                           | Level                                                 | State at `76a7220`                                                                  |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `PR-001` — projection and leak paths                           | Per-surface projection positives **and** negatives for profile, list, filter, export, search, shared links, dashboards, errors and optional notifications; a facade-only route audit                  | `api-e2e` + manual security review                    | Suites planned; a new surface is a new review trigger                               |
| `PR-002` — stale graph state retains access                    | Revocation evidence with a **controllable clock**: owned relations next request, project changes ≤ 15 min, failed-sync withdrawal at 4 h, due-departure cutoff at request time; plus outage telemetry | `api-e2e` with controllable clock; `integration-live` | Design in place, **evidence absent**                                                |
| `PR-003` — People Partner contract ahead of sign-off / journal | The [recorded `PR-S-01` sign-off](../planning-artifacts/architecture/architecture-people-management-2026-08-19/.memlog.md), then PP concurrency and one-PP-per-employee invariants, then journal enrolment | manual sign-off trace + `api-e2e` + `@concurrency` | Sign-off recorded; `PR-B-07` / `CC-07` remains open |
| `PR-004` — full-profile overlay precedence                     | Projection **positives and negatives** together — a partial implementation can satisfy Self while widening the overlay                                                                                | `api-e2e` projection positives/negatives              | Design unblocked (`PR-B-06` closed at design); implementation **partial** (corrected 2026-09-11) — read side wired, no live grant/revoke endpoint; see `test-design-architecture.md` § Ratified design decisions |
| `PR-005` — unknown timetracker contract                        | Contract review of the real provider contract, then identity-mapping and event-versus-state evidence against the test environment                                                                     | contract review + `integration-live`                  | Blocked on `PR-B-08`                                                                |
| `PR-006` — All Employees list latency                          | **[Contract A](#contract-a--all-employees-httplist-route) only.** No ACM-9 result and no P6 result is evidence for it                                                                                 | measurement — `DIRA1-MVP-v1`                          | **PASS** — `performance/dira1-final-dira1-1789080461725-944ce5c2a33a.json`          |
| `PR-007` — aggregate drift                                     | Contract review of the four fixed dashboard read models, then cross-context invariants across dashboards, resourcing and campaigns                                                                    | contract review + cross-context `api-e2e`             | `PR-B-02` closed at design; implementation **absent**                               |
| `PR-008` — departure contract ahead of sign-off / controls     | The [recorded `PR-S-02` sign-off](../planning-artifacts/architecture/architecture-people-management-2026-08-19/.memlog.md), then worker evidence (lag, retry, lease, cutoff) and a deployment rehearsal against one validated timezone and database | worker evidence + deployment rehearsal | Sign-off recorded; `PR-B-09` / `OPERATIONAL-ENVELOPE` remains open |
| `PR-009` — scenario documents counted as coverage              | The **three coverage states kept distinct** in every reporting surface (see [Coverage-state vocabulary](#coverage-state-vocabulary)), plus the end-to-end suites actually executing in CI             | `repository-audit`                                    | **Live and less mitigated than in 2026-08-29** — the e2e job is `continue-on-error` |
| `PR-010` — identity mismatch and real PII                      | A CI scan for real PII across code, fixtures, logs, screenshots and agents; a reconciliation report for durable external keys; fail-closed on ambiguous match                                         | `ci-scan` + reconciliation report                     | `User.ttId` has **no population source** (`TT-IDENTITY-01`, P0 open)                |


**Cross-scope risks whose mitigation lives in this document** (their register entries live in
`test-design-architecture.md`):


| Risk                                                                           | Where its mitigation is stated here     |
| ------------------------------------------------------------------------------ | --------------------------------------- |
| `R-UM-01` / `R-FE-04` — no sub-second feedback loop                            | [Level strategy](#level-strategy)       |
| `R-UM-04` / `legacy-um:R-008` — e2e suites share one database                  | [Backend isolation](#backend-isolation) |
| `legacy-um:R-012` — PII in fixtures and logs (merges with `PR-010`, `TR-7-02`) | [Privacy](#privacy)                     |


**Risks retired at migration are not reintroduced here.** `legacy-um:R-003`, `legacy-um:R-004` and
`legacy-um:R-013` carry **no** evidence obligation in this document; the behaviours they protected
survive as DEC-UM-004, DEC-UM-005 and the seed/import path respectively, owned by the epic plans.

---



## NFR measurement contracts

**This is the single definition point** for the subject, dataset, environment, statistic, threshold
and evidence of every platform NFR contract. `test-design-architecture.md` § NFR contract
references points here and states only the architecture consequence.

### The three performance contracts must stay separate

They share a "500" and a "2 seconds" and **nothing else**. Conflating any two would let a passing
measurement of one be reported as evidence for another.

#### Contract A — All Employees HTTP/list route

- **Authority:** `docs/project-requirements.md:614` (v1.5 §7, **normative**) — the All Employees
list with 500+ records, arbitrary filters and derived fields responds **within 2 seconds,
including permission resolution**.
- **Release gate:** `[PG-04](#release-and-design-gates)`.
- **Evidence owner:** `PMC-E1-S1.9` "Directory Performance Evidence at 500+ Rows"
(`_bmad-output/planning-artifacts/platform-capabilities/epics.md:737`).
- **Subject:** the **composed All Employees HTTP/list route, end to end, including permission
resolution**. It is **not** the AccessControl facade resolver and **not** `resolveAudiences`.
- **Dataset:** 500+ seeded employee records "with representative relationship breadth and depth,
and no real personal data".
- **Filters / graph shape:** arbitrary filters, sorts and column combinations plus derived and
custom fields; fixture **breadth and depth are recorded with the result** rather than fixed in
advance.
- **Recorded statistics:** p50, p95 **and** worst case together, plus query count, the PostgreSQL
version, and `EXPLAIN (ANALYZE, BUFFERS)`.
- **Measured shape:** page size, whether the total-count query is included, and whether the figure
covers one page or the full entitled set must all be stated. The budget is measured **against the
shape the user actually experiences on first load**, so "2 seconds at 500+ rows" cannot be
satisfied by measuring a small page of a large set.
- **Threshold:** **≤ 2 seconds.**
- **Statistic the threshold binds to:** warm **p95** and **absolute worst case** per gate — both must
be ≤ 2 seconds (`DIRA1-MVP-v1`, binding since 2026-09-11).
- **Environment:** local PostgreSQL via `npm run db:up` in `services/backend`, recorded through
`DIRA1-MANIFEST-v1` hashes.
- **Load model:** one HTTP client, sequential requests, one request in flight (`DIRA1-MVP-v1`).
- **Harness:** `DIRA1-MVP-v1` — `npm run measure:user-management:dira1 -- --role baseline|final`
in `services/backend`, selected by `test/jest-dira1.json`. Not ACM-9, not P6, not k6.
**U-24 resolved.**
- **Reporting rule:** the first filter/sort/column shape exceeding two seconds is named explicitly,
or the run records that none did.
- **Failure semantics:** a measured miss opens optimization as a **separately gated story**, and
the run **may not claim the threshold is met**.
- **Priority: P0.** See [Coverage plan](#coverage-plan) for the recorded rationale.
- **Current scenario:** `docs/test-cases/user-management/list/um-list-12-perf-nfr2-stage2-note.md`.
- **Risk owner:** `PR-006`, in `test-design-architecture.md`.

> **The rule that follows, and it is the load-bearing sentence of this section.**
> **No ACM-9 result and no P6 result is evidence for contract A.** Contract A's pass rule is
> defined only by `DIRA1-MVP-v1` (`docs/architecture/testing-strategy.md` § DIR-A1). Contract B's
> ACM-9 thresholds do not substitute for it.

> **Gate identity (U-25 resolved).** `QUALITY-GATE-AC-NFR` governs **contract B** (the ACM-9
> AccessControl facade resolver) only. Its closed state does **not** discharge `PG-04` or
> contract **A** (the All Employees HTTP/list route). Directory-list evidence is evaluated against
> `PG-04` / contract **A** only. `PMC-E1-S1.9` cites `PG-04` for that evidence. This document
> does not reopen, close or rename `QUALITY-GATE-AC-NFR`, and **the standing decision that the ACM-9
> CI job remains informational is not disturbed.**



#### Contract B — ACM-9 AccessControl facade resolver

- **Authority:** `docs/architecture/testing-strategy.md` § "ACM-9 operational measurement protocol
— `ACM9-MVP-v1`", binding.
- **Subject:** the **public AccessControl facade call**, end to end, including transaction and
result mapping — **not** an HTTP list route.
- **Dataset:** **500 requested active targets.**
- **Graph shape:** balanced depth-5 plus acyclic chains at depths
**5 / 25 / 50 / 100 / 200 / 300 / 400 / 499**, **each an independent gate**. Slow classes must
**not** be aggregated away.
- **Environment:** recorded via `ACM9-MANIFEST-v1` hashes.
- **Statistic:** p50/p95 by **nearest rank over 20 measured calls after 5 discarded warm-ups**,
plus the absolute worst case.
- **Threshold:** **fail when warm p95 *or* worst case exceeds 2 s**, per shape.
- **Evidence:** `measurement (ACM9-MVP-v1)`; artifacts under
`_bmad-output/test-artifacts/performance/`. Tracked as blocker `QUALITY-GATE-AC-NFR`.
- **The ACM-9 CI job stays informational.** That is a standing repository decision, it is **not
disturbed here**, and **this document proposes no promotion of it to a blocking check.**
Promoting an informational job to a required check is repository governance, outside a migration
whose root changes are planning artifacts and workflow configuration only.



#### Contract C — P6 `resolveAudiences`

- **Authority:** `_bmad-output/test-artifacts/performance/p6-resolve-audiences-postgresql.md`,
whose own scope section states "Measurement only; **no production code or CI timing threshold
changed**".
- **Subject:** the `resolveAudiences` **function**.
- **Dataset:** 500 synthetic users. **Graph shape:** balanced branching 4 at depth 5, plus acyclic
chains at depths 25–499.
- **Statistic:** cold/warm p50/p95/worst, in **milliseconds**.
- **Threshold: none. C is a measurement record, not a gate**, and **must never be treated as one.**
- **Evidence:** `measurement (P6)`; backend `test/measurement/resolve-audiences.measurement-spec.ts`.



### NFR measurement contracts — Security

- **Statement:** every endpoint composes AccessControl; no entitlement means no data.
- **Authority:** `docs/architecture/README.md` non-negotiable 7; PM/AD-24.
- **Oracle:** the **three-code denial contract** — `401` invalid or inactive session · `404` hidden
or missing target · `403` visible but forbidden. This is **richer than the** `403`**-only statement**
the superseded document carried, and asserting the wrong code passes a test for the wrong reason.
- **Evidence:** `api-e2e` **per route class**. **Statistic:** none — it is a per-route contract.
- **Epic-scoped companion (owned by the epic plan, recorded here for the seam):**
`um-epic:nfr/security` — the seeded permission-key set must be a **superset** of the keys the
code gates on. Whether those keys are seeded at all is an **open product and Access Control
decision (U-9)**, not a test decision.



### NFR measurement contracts — Revocation

**Concrete numeric thresholds, preserved exactly.**


| Subject                                       | Threshold                       | Authority           |
| --------------------------------------------- | ------------------------------- | ------------------- |
| Platform-owned relations                      | revoked **on the next request** | v1.5 §2.1; PM/AD-19 |
| Project-derived access after a project change | reflected within **15 minutes** | v1.5 §5.1; PM/AD-10 |
| Project access after a **failed** sync        | withdrawn after **4 hours**     | v1.5 §5.1           |
| A due departure                               | cuts off **at request time**    | PM/AD-20            |


**Evidence:** `api`/`integration` e2e **with a controllable clock**. These four boundaries are
exactly why the injected clock and timezone seams are infrastructure, not per-story invention.

### NFR measurement contracts — Privacy

- **Statement:** pseudonymised, delivered seeded population **only**. No real PII in code, agents,
logs, screenshots or the repository.
- **Authority:** v1.5 §7; `docs/architecture/README.md` seeded-population rule.
- **Statistic:** **none** — it is a binary scan plus a provenance audit.
- **Evidence:** `ci-scan` + manual provenance audit. See [Privacy](#privacy) for the audit's scope.
- **Origins merged here:** `legacy-um:NFR-1`, `legacy-um:R-012`, `legacy-um:TD-UM-NFR-PII-01`,
`plat:PR-010`, `plat:TR-7-02`, `plat:P2-PLAT-03`.



### NFR measurement contracts — Reliability

- **Statement (replaced, not preserved):** an external integration failure **must not take down the
core**, and last-known timetracker data is **visibly stale**. The superseded `legacy-um:NFR-3`
statement was about *email transport after registration*, a path DEC-UM-008 retires; what
survives is the v1.5 §5.1/§7 integration-degradation rule plus the magic-link dispatch path.
- **Timeout, retry count, backoff and circuit thresholds: UNKNOWN**, and **not invented**.
Partial-success behaviour is open. (U-5.)
- **Evidence:** `api-e2e` with a port fake; `integration-live` smoke.
- **Epic-scoped companion:** `um-epic:nfr/reliability` — the departure worker is **idempotent under
retry and partial failure** (PM/AD-20 durable retrying fail-closed executor); unit state table
plus `api-e2e`, owned by the `UM-E5` plan.
- **Frontend companion — QA backlog, not requirement coverage:** "every documented API failure
renders its own copy, never a blank screen" sits in the
[QA improvement backlog](#qa-improvement-backlog) with `R-FE-03`.



### NFR measurement contracts — Deployment

- **Statement:** the module is **deployed and demonstrable**; the AD-20 migration runs before the
worker; the worker and the application run against **one** validated business timezone and
database.
- **Authority:** v1.5 §9; PM/AD-20. **Gated by** `PR-B-09` (hosting, topology, secrets,
backup/restore, monitoring, alert ownership, rollback).
- **Evidence:** deployment evidence, weekly/pre-release slot.



### NFR measurement contracts — Process

- **Statement (restated against the *current* rule, not copied):** the ordering is **scenario
document → committed-red Stage-2 test → production code written until it passes**, and specs
match shipped behaviour.
- **What changed:** the per-stage **human approval** step is removed (D-1;
`docs/architecture/testing-strategy.md:25–38`). The **ordering** survives, as does the
**no-self-certification** review norm of README non-negotiable 2. What replaces the removed
control is ordinary review — the pull request, and CI actually executing the suites.
- **Evidence:** `repository-audit`. See [Process/trace evidence](#processtrace-evidence).



### NFR measurement contracts — configuration-owned note

**Production magic-link TTL, rate limits, retry count and retry backoff are operational
configuration.** Tests **inject deterministic values and verify boundaries**; **no production
duration is invented** anywhere in this document. Production values remain configuration and do not
block scenario work. Authority: DEC-UM-004.

### Assessment boundary

**Preserved from three sources** (`legacy-um:S1#assessment-boundary`,
`plat:S3#assessment-boundary`, `plat:S4#unknown-and-not-guessed`). These are **requirements for
later evidence**. The final **PASS / CONCERNS / FAIL** verdict belongs to `nfr-assess` — **not to
this document, not to** `test-design-architecture.md`**, and not to the migration that produced them.**
This migration's acceptance is document and workflow migration acceptance, **not product release
readiness**.

---



## Unknown thresholds

**Load-bearing, and preserved verbatim in meaning from** `plat:S4#unknown-and-not-guessed`**: these
stay UNKNOWN. Never fill them in.** Their absence is a **planning gap, not a passing grade** — two
independent sources say so and both are preserved.


| Unknown                                                                                                                                 | Owner                                                             | Open question           |
| --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------- |
| **WCAG conformance level** and the **viewport set**                                                                                     | Product Owner                                                     | U-4                     |
| **Uptime SLO, RTO, RPO, backup frequency, retention**, restore and rollback thresholds                                                  | DevOps + Architect + Security                                     | U-5, gated by `PR-B-09` |
| **Timeout, retry count, backoff, circuit** thresholds                                                                                   | DevOps + Architect + Security                                     | U-5                     |
| **Browser support beyond Chromium** — the frontend is Chromium-only today; "no new validation; the gap is named, not filled"            | Product Owner                                                     | U-10                    |
| **Frontend performance budgets** (bundle size, LCP, interaction latency), frontend accessibility requirements, photo-upload size limits | Product Owner                                                     | U-11                    |
| Contract A measurement parameters                                                                                                       | `DIRA1-MVP-v1` (`docs/architecture/testing-strategy.md` § DIR-A1) | U-3 and U-24 resolved   |
| **Non-departure observability thresholds**; audit-log retention and any broader profile-read audit                                      | Architect + Security                                              | U-5                     |


**Percentile definitions for the 2-second list result are explicitly among these.** They are not
supplied by contract B.

---



## Coverage ownership

**Where a coverage obligation lives, and what may count as requirement coverage.**

1. **Per-ID case rows belong to the owning epic plan.** The superseded document held a
  `legacy-um` P0–P3 coverage plan spanning four epics in one file. Those per-ID rows are routed to
   `test-design-epic-{domain}-{number}.md`; this document keeps the **platform** planning rows and
   the shared rules.
2. **The superseded P0-ratio rationale is not carried forward.** It read "~14% because one plan
  spans four epics". The split into per-epic plans **changes the denominator**, so the rationale
   cannot be copied unchanged — and **priorities are not normalised to satisfy a template
   heuristic** in either direction.
3. **The** `plat` **P0 band is exactly** `P0-PLAT-01..08` **— eight rows, unchanged.** No P0 percentage was
  engineered, and no denominator was moved, to reach the P0 resolution recorded below.
4. **Cross-cutting improvement candidates with no owning product epic go to the
  [QA improvement backlog](#qa-improvement-backlog) and do NOT count as requirement coverage.**
   Of the frontend net-new cases, **112** land in epic plans and may count as coverage; **32** land
   in the backlog and may not.
5. **A planning row is not a test case and not coverage.** A `TR-`* row is a normative requirement
  with a planned level and a planning state — never a claim that evidence exists.



### Legacy priority results owned by the system plan

These are the four active `TD-UM-*` results whose destination is this system document rather
than an epic plan. The priorities are disposition results, not execution or coverage claims.


| Legacy source ID              | Priority | Disposition | Result and priority authority                                                                                                                                                                                                          |
| ----------------------------- | -------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `legacy-um:TD-UM-PF-05`       | `P2`     | merge       | The access-boundary obligation is owned by the platform pair; its source `P2` priority is retained.                                                                                                                                    |
| `legacy-um:TD-UM-NFR-PERF-01` | `P0`     | replace     | **Priority change from source** `P1`**:** current aggregate `P0-PLAT-08` is release-gated by `PG-04`; the preserved exit criteria require 100% for P0 and would permit an uncovered P1. The full rationale remains under `P0-PLAT-08`. |
| `legacy-um:TD-UM-NFR-PII-01`  | `P2`     | merge       | **Priority change from source** `P3`**:** current aggregate `P2-PLAT-03` owns the repository PII and seed-provenance audit.                                                                                                            |
| `legacy-um:TD-UM-DOC-01`      | `P1`     | merge       | **Priority change from source** `P3`**:** current aggregate `P1-PLAT-08` owns AD-1 trace and spec conformance.                                                                                                                         |


---



## Coverage plan

**23 platform planning rows, preserved with their identifiers.** These are **planning rows, not
generated test cases and not coverage**, per the source's own statement. Every row's
`approval_status` is **ungranted**.

### Coverage plan P0


| Row          | Subject                                                                    | Level                             | State / blocker                                                                   | Risks                |
| ------------ | -------------------------------------------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------- | -------------------- |
| `P0-PLAT-01` | §2–§3 audience derivation and S1–S16 negatives                             | `api-e2e`                         | `AC STAGE-1 DRAFT` *(source state; inventory pointer corrected to the 101 files)* | `PR-001`, `PR-009`   |
| `P0-PLAT-02` | Project / Department / PP-HR / full / shared overlays                      | `api-e2e` + integration           | `PRODUCT/ARCH BLOCKED` — `PR-B-03`, `PR-B-06`, `PR-B-08`                          | `PR-001/002/004/005` |
| `P0-PLAT-03` | Projection leak prevention across list, filter, export, profile and errors | api / ui / download e2e           | `READY NOW` — consumer-owned; v1.5 §3.3                                           | `PR-001`             |
| `P0-PLAT-04` | Runtime permission removal; no data widening                               | api / ui e2e                      | `READY NOW` — role catalog canonical as `RA-E1`                                   | `PR-001/007`         |
| `P0-PLAT-05` | Timetracker identity, atomic sync, freshness, outage cutoff                | `integration-live`                | `E2E DEPENDENCY` — `PR-B-08`; owner `TT-E2`                                       | `PR-002/005/010`     |
| `P0-PLAT-06` | Departure cutoff and atomic effective-date effects                         | api / worker e2e                  | `READY FOR FORMAL SIGN-OFF` (source state); [`PR-S-02` sign-off recorded](../planning-artifacts/architecture/architecture-people-management-2026-08-19/.memlog.md), but `CC-06`, `CC-07`, `CC-08`, `CC-09`, and `OPERATIONAL-ENVELOPE` remain open; owner `UM-E5` | `PR-002/008` |
| `P0-PLAT-07` | Seed import / auth cutover; no create or deactivate legacy surface         | api / import e2e + route negative | `READY NOW` — PM/AD-16, AD-21; owner `UM-E1-S1.1`                                 | —                    |
| `P0-PLAT-08` | **500+ directory ≤ 2 seconds**                                             | **measurement —** `DIRA1-MVP-v1`  | **PASS** — `performance/dira1-final-dira1-1789080461725-944ce5c2a33a.json`        | `PR-006`             |


`P0-PLAT-07` **is the platform statement of the same cutover that retires the** `legacy-um`
**registration and deactivation family.** The two must agree, and they do.

`P0-PLAT-08` **— the P0-versus-P1 resolution, recorded rather than re-derived.** The obligation is
**P0**, not P1. The rationale, in the order it was established:

1. **Severity does not decide it.** The two origin risks score **identically** — `legacy-um:R-005`
  is PERF **6** and `PR-006` is PERF 2 × 3 = **6**. Both are preserved unchanged and **neither was
   re-scored to support a priority.**
2. **The obligation is release-gated.** `[PG-04](#release-and-design-gates)` gates release on it,
  over a **normative** v1.5 §7 requirement (`docs/project-requirements.md:614`).
3. **P1 would contradict (2).** The preserved [exit criteria](#exit-criteria) set **P0 = 100 %
  covered, P1 = ≥ 95 %**. Labelling a release gate P1 makes it formally acceptable to ship it
   uncovered. P0 is the only value consistent with the exit criteria this document preserves.
4. **The canonical story agrees.** `PMC-E1-S1.9`'s closing criterion is **blocking**, not
  best-effort: on a measured failure "this story does not claim the NFR-3 or SM-4 threshold is
   met".

**What was deliberately not done:** no P0 **percentage** was normalised. The `plat` P0 band keeps
exactly its eight rows; the `legacy-um` P1 statement is a **merge origin** of `P0-PLAT-08`, not an
additional P0 row. This resolves a **priority label**, not a risk score, and it changes no product
requirement and grants no approval.

**Merged origins of** `P0-PLAT-08`**:** `plat:P0-PLAT-08`, `plat:TR-7-03`, `plat:PR-006`,
`legacy-um:R-005`, `legacy-um:TD-UM-NFR-PERF-01`, `um-epic:nfr/NFR-2`. Its single measurement
contract is [contract A](#contract-a--all-employees-httplist-route).

### Coverage plan P1


| Row          | Subject                                       | Level                        | State / blocker                                                                                                                                                                                                                              | Canonical owners                                                                                                                     |
| ------------ | --------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `P1-PLAT-01` | Directory, profile and self-service workflows | api / ui e2e                 | `PRODUCT/ARCH BLOCKED` — `PR-B-01`, `PR-B-04`                                                                                                                                                                                                | `PMC-E1`                                                                                                                             |
| `P1-PLAT-02` | The four dashboards                           | api / ui e2e                 | **Blocked on implementation, not on design.** `PR-B-02` / `OQ-115` is **closed at design** (PM/AD-33), but the same entry records `implementation_status: absent`, and open blockers remain fail-closed and are not resolved by ratification | `PMC-E2`, `PMC-E3`                                                                                                                   |
| `P1-PLAT-03` | Action items, campaigns, feedback             | api / ui / cross-context e2e | `READY NOW`                                                                                                                                                                                                                                  | `ENG-E1`, `ENG-E2`, `FB-E1`/`FB-E2`. `ENG-E3` **and** `ENG-E4` **are superseded; the live successors are** `RISK-E`* **and** `FB-E`* |
| `P1-PLAT-04` | Risks and the risk dashboard                  | api / ui + unit              | `READY NOW`                                                                                                                                                                                                                                  | `RISK-E1`, `RISK-E2`                                                                                                                 |
| `P1-PLAT-05` | Resourcing, sharing, request history          | api / ui / cross-context e2e | `READY NOW`                                                                                                                                                                                                                                  | `RS-E1`, `RS-E2`, `PSH-E1`, `PSH-E2`                                                                                                 |
| `P1-PLAT-06` | Timeline, CDS, mentorship                     | api / ui / cross-context e2e | `READY NOW`                                                                                                                                                                                                                                  | `UM-E3`, `CDS-E1`/`CDS-E2`, `M-E1`                                                                                                   |
| `P1-PLAT-07` | Integration graceful degradation and recovery | api / integration e2e        | `E2E DEPENDENCY` — `PR-B-08`                                                                                                                                                                                                                 | `TT-E1-S1.4`                                                                                                                         |
| `P1-PLAT-08` | AD-1 trace and spec conformance               | `repository-audit`           | `READY NOW`, restated — see [Process/trace evidence](#processtrace-evidence)                                                                                                                                                                 | QA                                                                                                                                   |




### Coverage plan P2


| Row          | Subject                                                           | Level              | Note                                                                                         |
| ------------ | ----------------------------------------------------------------- | ------------------ | -------------------------------------------------------------------------------------------- |
| `P2-PLAT-01` | Responsive and accessibility validation                           | scanner + manual   | **Thresholds unspecified and they stay unspecified** (U-4, U-11)                             |
| `P2-PLAT-02` | Sorting stability, empty states, correction and concurrency edges | unit / api / ui    | Merges `legacy-um:TD-UM-EXP-03` (sort stability) now that sort is specified by `PMC-E1-S1.3` |
| `P2-PLAT-03` | Repository PII and seed-provenance audit                          | `ci-scan` + manual | See [Privacy](#privacy)                                                                      |
| `P2-PLAT-04` | BMAD / parallelism / intelligent-repository evidence              | manual audit       | v1.5 §8                                                                                      |




### Coverage plan P3


| Row          | Subject                                                                                                                    | Level  | Note                                                                                                                |
| ------------ | -------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------- |
| `P3-PLAT-01` | Cross-browser and viewport exploratory beyond the agreed set                                                               | manual | **The browser set is undecided and this document invents none** (U-10). Merges `fe-epic:not-in-scope/cross-browser` |
| `P3-PLAT-02` | Terminology and drift audit — Reporting versus Project line, leaver versus dismissed, vacancy versus PeopleForce candidate | manual | Directly supports the constraint that **timetracker supplies no reports-to hierarchy**                              |
| `P3-PLAT-03` | Notifications, analytics, PeopleForce API prefill                                                                          | none   | `OUT OF SCOPE` — v1.5 §4.13 / §4.14 / §5.2 GOOD TO HAVE. Preserved as out of scope; **not promoted**                |


---



## Normative coverage map

**119 normative** `TR-`* **rows, preserved with their identifier, requirement statement, planned level
and planning state.** Every row's approval status is **ungranted**.

**Read this table as a plan, not as coverage.** A planned level is not a written test; a planning
state is not an approval; and `AC STAGE-1 DRAFT` **records what the source said on 2026-08-29**, not
a live state of any file (see [Ownership](#ownership), ruling D-1). Rows marked
`PRODUCT/ARCH BLOCKED` keep their named blocker; rows marked `OUT OF SCOPE` keep that state and its
v1.5 GOOD TO HAVE or §10 basis and are **not** promoted.

**Machine-counted at the time of writing — 119 rows:** 45 `E2E DEPENDENCY` · 23 `AC STAGE-1 DRAFT` ·
23 `PRODUCT/ARCH BLOCKED` · 21 `READY NOW` · 4 `READY FOR FORMAL SIGN-OFF` · 3 `OUT OF SCOPE`.

> **The dependency column, and the one clause retired from it.** Where a source dependency cell
> read "approval pending", that clause named the per-file approval gate removed on 2026-09-04. It
> is **retired under ruling D-1** and is marked inline rather than carried as a live obligation.
> **Which of the 101 access-control scenario files covers which of these 119 rows** — that is
> **U-19**, **resolved 2026-09-11**: see [§ U-19 normative coverage — scenario file
> mapping](#u-19-normative-coverage--scenario-file-mapping-resolved-2026-09-11) immediately after
> this table. 14 of 119 rows receive partial evidence; 105 receive none. Does not affect `PG-01`.


| Trace ID      | v1.5 source | Requirement statement (preserved)                                                                                                                                       | Planned level                                                                              | Planning state at source (2026-08-29) | Dependency / ownership                                                                                                                                                                                          |
| ------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TR-2.1-01`   | v1.5 §2.1   | Access roles and functional roles remain separate; strongest applicable audience is per section                                                                         | API E2E + policy unit                                                                      | AC STAGE-1 DRAFT                      | Phase-1 functional-boundary and audience files *(source cell also read “approval pending”; retired under D-1 — see the note below)*                                                                             |
| `TR-2.1-02`   | v1.5 §2.1   | Transitive reports-to Reporting line; relationship-specific audiences in one session                                                                                    | API E2E                                                                                    | AC STAGE-1 DRAFT                      | Phase-1 direct graph only                                                                                                                                                                                       |
| `TR-2.1-03`   | v1.5 §2.1   | Nested Department management grants Reporting-line access                                                                                                               | API E2E                                                                                    | PRODUCT/ARCH BLOCKED                  | PR-B-03 / OQ-116 plus approved Department edge contract                                                                                                                                                         |
| `TR-2.1-04`   | v1.5 §2.1   | Project PM/DM line is separate, transitive only through project path, and narrower                                                                                      | API E2E + timetracker integration                                                          | PRODUCT/ARCH BLOCKED                  | PR-B-03 / OQ-116 defines positive scope; PR-B-08 supplies assignment/freshness contract                                                                                                                         |
| `TR-2.1-05`   | v1.5 §2.1   | Direct assigned-PP audience derivation                                                                                                                                  | API E2E                                                                                    | AC STAGE-1 DRAFT                      | [`PR-S-01` sign-off is recorded](../planning-artifacts/architecture/architecture-people-management-2026-08-19/.memlog.md); E2E/implementation remains blocked by CC-04 / CC-07 and its required evidence |
| `TR-2.1-05A`  | v1.5 §2.1   | Recursive PP HR line follows the PP's HR reporting chain, never the employee delivery chain                                                                             | API E2E                                                                                    | PRODUCT/ARCH BLOCKED                  | PR-B-03 / OQ-116 and approved Department/HR-boundary contract; [`PR-S-01` sign-off is recorded](../planning-artifacts/architecture/architecture-people-management-2026-08-19/.memlog.md), while those blockers remain |
| `TR-2.1-06`   | v1.5 §2.1   | Manager, PP, department, department-manager changes use dedicated permission/screen, reject self-assignment, journal atomically, apply next request                     | API/UI E2E                                                                                 | PRODUCT/ARCH BLOCKED                  | User Management owns PP mutation; [`PR-S-01` sign-off is recorded](../planning-artifacts/architecture/architecture-people-management-2026-08-19/.memlog.md). Journal execution remains blocked by PR-B-07 / CC-07; Department mutations still need the approved Department contract |
| `TR-2.1-06A`  | v1.5 §2.1   | PP assignment create/replace/delete, concurrency, no self-assignment, journal direction, next-request effect                                                            | API/UI E2E                                                                                 | READY FOR FORMAL SIGN-OFF             | [`PR-S-01` sign-off is recorded](../planning-artifacts/architecture/architecture-people-management-2026-08-19/.memlog.md); E2E/implementation remains blocked by CC-04 / CC-07 and required journal evidence |
| `TR-2.1-07`   | v1.5 §2.1   | Project access changes within 15 minutes; outage withdraws it after 4 hours                                                                                             | Integration E2E with controllable time                                                     | E2E DEPENDENCY                        | PR-B-08 timetracker contract                                                                                                                                                                                    |
| `TR-2.2-01`   | v1.5 §2.2   | UM/DM/PM/PP feature sets; PP has no resourcing; HR Admin is configuration-only                                                                                          | API/UI E2E                                                                                 | READY NOW                             | Feature owners prove menus/actions; AC Phase-1 proves HR Admin has no default data grant                                                                                                                        |
| `TR-2.3-01`   | v1.5 §2.3   | Runtime role/permission catalog CRUD and assignment through UI, no deploy/schema change                                                                                 | UI E2E + API contract                                                                      | E2E DEPENDENCY                        | Deferred role-catalog child/consumer; no current approved UR suite                                                                                                                                              |
| `TR-2.3-02`   | v1.5 §2.3   | Every listed permission independently grantable; removal immediate                                                                                                      | API/UI E2E                                                                                 | E2E DEPENDENCY                        | Role catalog plus each feature consumer                                                                                                                                                                         |
| `TR-2.3-03`   | v1.5 §2.3   | Functional permissions never widen data; campaign exception remains campaign-local                                                                                      | API E2E                                                                                    | AC STAGE-1 DRAFT                      | Base dual-gate only; campaign exception needs campaign consumer                                                                                                                                                 |
| `TR-2.3-04`   | v1.5 §2.3   | HR Admin delegation and default starting-role permission assignments approved by PO                                                                                     | Configuration review + UI E2E                                                              | PRODUCT/ARCH BLOCKED                  | PR-B-05 / OQ-105                                                                                                                                                                                                |
| `TR-2.4-01`   | v1.5 §2.4   | Separate full-profile grant, holder-only grant, no self-assignment, seeded first holder, last-holder guard, journal                                                     | API/UI E2E                                                                                 | PRODUCT/ARCH BLOCKED                  | PR-B-06 / CC-05 for overlay precedence; CC-07 for the shared journal contract. CC-04 is PP-only and does not apply here                                                                                         |
| `TR-3.1-01`   | v1.5 §3.1   | No profile-level permission; server assembles sections per request                                                                                                      | API E2E                                                                                    | E2E DEPENDENCY                        | AC base decisions plus profile projection consumer                                                                                                                                                              |
| `TR-3.2-S01`  | v1.5 §3.2   | S1 identity-card matrix, photo exception, relationship fields not writable in S1                                                                                        | API E2E                                                                                    | AC STAGE-1 DRAFT                      | Phase-1 audiences only; Project/full/shared overlays deferred                                                                                                                                                   |
| `TR-3.2-S02`  | v1.5 §3.2   | S2 personal-contact matrix                                                                                                                                              | API E2E                                                                                    | AC STAGE-1 DRAFT                      | Same limitation                                                                                                                                                                                                 |
| `TR-3.2-S03`  | v1.5 §3.2   | S3 emergency-contact matrix                                                                                                                                             | API E2E                                                                                    | AC STAGE-1 DRAFT                      | Same limitation                                                                                                                                                                                                 |
| `TR-3.2-S04`  | v1.5 §3.2   | S4 employment matrix                                                                                                                                                    | API E2E                                                                                    | AC STAGE-1 DRAFT                      | Workflow and temporal records are feature-owned                                                                                                                                                                 |
| `TR-3.2-S05`  | v1.5 §3.2   | S5 document matrix including Project CV/cert narrowing and self certificate upload                                                                                      | API E2E                                                                                    | AC STAGE-1 DRAFT                      | Project positive cells deferred                                                                                                                                                                                 |
| `TR-3.2-S06`  | v1.5 §3.2   | S6 risk matrix; Self/Colleague denial                                                                                                                                   | API E2E                                                                                    | AC STAGE-1 DRAFT                      | Risk workflow separately owned                                                                                                                                                                                  |
| `TR-3.2-S07`  | v1.5 §3.2   | S7 flags, PM read narrowing, employee record-level visibility                                                                                                           | API E2E                                                                                    | AC STAGE-1 DRAFT                      | PM positive/flag behavior awaits Project-line suite                                                                                                                                                             |
| `TR-3.2-S08`  | v1.5 §3.2   | S8 feedback visibility matrix                                                                                                                                           | API E2E                                                                                    | AC STAGE-1 DRAFT                      | Feedback workflow separately owned                                                                                                                                                                              |
| `TR-3.2-S09`  | v1.5 §3.2   | S9 timeline matrix and functional write dual gate                                                                                                                       | API E2E                                                                                    | AC STAGE-1 DRAFT                      | Timeline workflow separately owned                                                                                                                                                                              |
| `TR-3.2-S10`  | v1.5 §3.2   | S10 leaves; colleague dates only                                                                                                                                        | API E2E                                                                                    | AC STAGE-1 DRAFT                      | Data freshness/display requires timetracker                                                                                                                                                                     |
| `TR-3.2-S11`  | v1.5 §3.2   | S11 projects; colleague project name only                                                                                                                               | API E2E                                                                                    | AC STAGE-1 DRAFT                      | Positive Project-line and sync deferred                                                                                                                                                                         |
| `TR-3.2-S12`  | v1.5 §3.2   | S12 CDS matrix and self IDP completion exception                                                                                                                        | API E2E                                                                                    | AC STAGE-1 DRAFT                      | CDS workflow separately owned                                                                                                                                                                                   |
| `TR-3.2-S13`  | v1.5 §3.2   | S13 mentorship matrix and self flag exception                                                                                                                           | API E2E                                                                                    | AC STAGE-1 DRAFT                      | Pair-note privacy also needs mentorship consumer                                                                                                                                                                |
| `TR-3.2-S14`  | v1.5 §3.2   | S14 tasks matrix and self completion exception                                                                                                                          | API E2E                                                                                    | AC STAGE-1 DRAFT                      | Campaign exception needs campaign consumer                                                                                                                                                                      |
| `TR-3.2-S15`  | v1.5 §3.2   | S15 request-history matrix                                                                                                                                              | API E2E                                                                                    | AC STAGE-1 DRAFT                      | Resourcing workflow separately owned                                                                                                                                                                            |
| `TR-3.2-S16`  | v1.5 §3.2   | S16 per-field visibility matrix                                                                                                                                         | API E2E                                                                                    | AC STAGE-1 DRAFT                      | Runtime filter/projection is PRODUCT/ARCH BLOCKED by OQ-114                                                                                                                                                     |
| `TR-3.3-01`   | v1.5 §3.3   | `—`, narrowed, and flag-gated facts absent from UI/API/export/search/errors/notifications                                                                               | API/UI/download E2E                                                                        | E2E DEPENDENCY                        | Projection-surface suite deferred; each consumer must prove its surface                                                                                                                                         |
| `TR-3.3-02`   | v1.5 §3.3   | Colleague whitelist exactly S1 + S10 dates + S11 project name                                                                                                           | API/UI E2E                                                                                 | AC STAGE-1 DRAFT                      | Base section projection only; list/profile consumers still required                                                                                                                                             |
| `TR-3.3-03`   | v1.5 §3.3   | Hidden custom values cannot be inferred through filters/columns                                                                                                         | API/UI E2E                                                                                 | PRODUCT/ARCH BLOCKED                  | PR-B-01 / OQ-114                                                                                                                                                                                                |
| `TR-3.3-04`   | v1.5 §3.3   | Campaign sender sees only recipient name and own campaign task status until close                                                                                       | API/UI E2E                                                                                 | E2E DEPENDENCY                        | Campaign workflow/consumer                                                                                                                                                                                      |
| `TR-3.4-01`   | v1.5 §3.4   | Narrow journal event set, fields, and reader authorization                                                                                                              | API E2E + DB transaction evidence                                                          | PRODUCT/ARCH BLOCKED                  | PR-B-07 / CC-07; PP Stage-1 design may proceed under PR-S-01, but journal-dependent E2E/implementation waits                                                                                                    |
| `TR-4.8-AC`   | v1.5 §4.8   | Authenticated named-recipient, read-only shared-link overlay; cfg/default/never set; configurable expiry (24-hour default); creator recheck; revocation; access journal | API/UI E2E                                                                                 | E2E DEPENDENCY                        | Shared-link child deferred; never-share set `{S3,S7,S13,S14}`                                                                                                                                                   |
| `TR-2.4-AC`   | v1.5 §2.4   | Full-profile overlay over all sections and interaction with Self                                                                                                        | API E2E                                                                                    | PRODUCT/ARCH BLOCKED                  | PR-B-06 / CC-05                                                                                                                                                                                                 |
| `TR-2.3-AC`   | v1.5 §2.3   | Full role/permission catalog authorization                                                                                                                              | API/UI E2E                                                                                 | E2E DEPENDENCY                        | Deferred role-catalog dispatch                                                                                                                                                                                  |
| `TR-2.1-PROJ` | v1.5 §2.1   | Positive Project-line matrix cells                                                                                                                                      | API E2E                                                                                    | PRODUCT/ARCH BLOCKED                  | PR-B-03 / OQ-116 and PR-B-08                                                                                                                                                                                    |
| `TR-2.1-DEPT` | v1.5 §2.1   | Positive Department walk                                                                                                                                                | API E2E                                                                                    | PRODUCT/ARCH BLOCKED                  | PR-B-03 / OQ-116 plus approved Department edge contract                                                                                                                                                         |
| `TR-2.1-PPHR` | v1.5 §2.1   | Positive PP HR-line walk with HR boundary negative                                                                                                                      | API E2E                                                                                    | PRODUCT/ARCH BLOCKED                  | PR-B-03 / OQ-116 plus AD-19 Department/HR-boundary contract                                                                                                                                                     |
| `TR-4.1-01`   | v1.5 §4.1   | Sortable All Employees columns                                                                                                                                          | API/UI component                                                                           | E2E DEPENDENCY                        | Profile/directory consumer                                                                                                                                                                                      |
| `TR-4.1-02`   | v1.5 §4.1   | Any profile/derived/custom field as filter and column                                                                                                                   | API/UI E2E                                                                                 | PRODUCT/ARCH BLOCKED                  | PR-B-01 / OQ-114                                                                                                                                                                                                |
| `TR-4.1-03`   | v1.5 §4.1   | Years-with-company numeric filtering and listed standard filters                                                                                                        | API + unit                                                                                 | E2E DEPENDENCY                        | Directory plus owning domain data                                                                                                                                                                               |
| `TR-4.1-04`   | v1.5 §4.1   | Runtime custom-field types, values, immediate filter/column use                                                                                                         | API/UI E2E                                                                                 | PRODUCT/ARCH BLOCKED                  | PR-B-01 / OQ-114                                                                                                                                                                                                |
| `TR-4.1-05`   | v1.5 §4.1   | Inline edits obey both gates; org relationships excluded                                                                                                                | API/UI E2E                                                                                 | E2E DEPENDENCY                        | Directory/profile consumer plus AC                                                                                                                                                                              |
| `TR-4.1-06`   | v1.5 §4.1   | Owner-scoped saved views, multiple tabs, manager sharing                                                                                                                | API/UI E2E                                                                                 | E2E DEPENDENCY                        | Directory consumer                                                                                                                                                                                              |
| `TR-4.1-07`   | v1.5 §4.1   | Current entitled view exports `.xlsx` with no hidden columns/values                                                                                                     | API/UI/download E2E                                                                        | E2E DEPENDENCY                        | Projection-surface owner; use XLSX utility                                                                                                                                                                      |
| `TR-4.1-08`   | v1.5 §4.1   | Colleague list and click-through limited profile                                                                                                                        | API/UI E2E                                                                                 | E2E DEPENDENCY                        | Boundary draft is insufficient without projection consumer                                                                                                                                                      |
| `TR-4.2-01`   | v1.5 §4.2   | Profile assembles S1–S16 and header manager/PP/mentor                                                                                                                   | API/UI E2E                                                                                 | PRODUCT/ARCH BLOCKED                  | PR-B-04 / OQ-117                                                                                                                                                                                                |
| `TR-4.3-01`   | v1.5 §4.3   | Self-service reads/edits/uploads/completes only enumerated capabilities                                                                                                 | API/UI E2E                                                                                 | E2E DEPENDENCY                        | Profile, document, CDS, mentorship, task consumers                                                                                                                                                              |
| `TR-4.3-02`   | v1.5 §4.3   | Self never receives risk or unflagged notes                                                                                                                             | API/UI E2E                                                                                 | AC STAGE-1 DRAFT                      | Also prove through profile projection                                                                                                                                                                           |
| `TR-4.4-01`   | v1.5 §4.4   | UM dashboard people grouping, exact counters/table/tasks/navigation                                                                                                     | API/UI E2E                                                                                 | PRODUCT/ARCH BLOCKED                  | PR-B-02 / OQ-115                                                                                                                                                                                                |
| `TR-4.4-02`   | v1.5 §4.4   | DM project tables, all/single selector, recalculated totals, Unassigned, PM-created requests                                                                            | API/UI E2E                                                                                 | PRODUCT/ARCH BLOCKED                  | PR-B-02 / OQ-115                                                                                                                                                                                                |
| `TR-4.4-03`   | v1.5 §4.4   | PM dashboard equals DM shape within own projects                                                                                                                        | API/UI E2E                                                                                 | PRODUCT/ARCH BLOCKED                  | PR-B-02 / OQ-115                                                                                                                                                                                                |
| `TR-4.4-04`   | v1.5 §4.4   | PP dashboard scoped/groupable and contains no resourcing block                                                                                                          | API/UI E2E                                                                                 | PRODUCT/ARCH BLOCKED                  | PR-B-02 / OQ-115; optional widget ideas are not acceptance requirements                                                                                                                                         |
| `TR-4.5-01`   | v1.5 §4.5   | Manual action-item creation within audience + permission                                                                                                                | API/UI E2E                                                                                 | READY NOW                             | Action-item feature owner                                                                                                                                                                                       |
| `TR-4.5-02`   | v1.5 §4.5   | Fields; open→completed; completion date; author cancellation reason; overdue everywhere                                                                                 | API + UI component/E2E                                                                     | READY NOW                             | Action-item feature owner                                                                                                                                                                                       |
| `TR-4.5-03`   | v1.5 §4.5   | Campaign activation creates exactly one action item per frozen recipient                                                                                                | Cross-context E2E                                                                          | E2E DEPENDENCY                        | Campaign/action-item contract                                                                                                                                                                                   |
| `TR-4.6-01`   | v1.5 §4.6   | Fixed risk ordering/history/current/trend; any transition; no closed state; leaver ≠ dismissed                                                                          | API + unit + UI                                                                            | READY NOW                             | Risk owner                                                                                                                                                                                                      |
| `TR-4.6-02`   | v1.5 §4.6   | Active excludes low; dashboard scope/count/sort/filter/drill-through                                                                                                    | API/UI E2E                                                                                 | READY NOW                             | Risk owner; dashboard page is separate from OQ-115 shared engine                                                                                                                                                |
| `TR-4.7-01`   | v1.5 §4.7   | Platform-owned vacancy; creation fields, department routing, optional project, Unassigned, DM visibility                                                                | API/UI E2E                                                                                 | READY NOW                             | Resourcing owner; no PeopleForce vacancy                                                                                                                                                                        |
| `TR-4.7-02`   | v1.5 §4.7   | Vacancy compensation visible only to author/routed UM/reviewing DM and absent elsewhere                                                                                 | API/UI/export negative E2E                                                                 | E2E DEPENDENCY                        | Resourcing plus projection consumers                                                                                                                                                                            |
| `TR-4.7-03`   | v1.5 §4.7   | UM proposes department employees or external candidate with required PeopleForce ID/link                                                                                | API/UI E2E                                                                                 | READY NOW                             | Candidate ID storage is required; API prefill is not                                                                                                                                                            |
| `TR-4.7-04`   | v1.5 §4.7   | Submission auto-creates request-bound DM link with exact evaluation section set and optional S6; link expires when the request is approved, rejected, or withdrawn      | Cross-context E2E                                                                          | E2E DEPENDENCY                        | Resourcing/shared-link contract                                                                                                                                                                                 |
| `TR-4.7-05`   | v1.5 §4.7   | DM approve/reject with reason, headcount fill, explicit close only, repeated proposals                                                                                  | API/UI E2E + state-machine unit                                                            | READY NOW                             | Resourcing owner                                                                                                                                                                                                |
| `TR-4.7-06`   | v1.5 §4.7   | S15 attempt history excludes compensation; approval waits for timetracker assignment                                                                                    | Cross-context E2E                                                                          | E2E DEPENDENCY                        | Resourcing, profile projection, timetracker                                                                                                                                                                     |
| `TR-4.8-01`   | v1.5 §4.8   | Manual and automatic profile-sharing workflow                                                                                                                           | API/UI E2E                                                                                 | E2E DEPENDENCY                        | Shared-link dispatch; see TR-4.8-AC                                                                                                                                                                             |
| `TR-4.9-01`   | v1.5 §4.9   | Automatic join/grade/position/department/type/extended-leave/mentorship events                                                                                          | API integration + transaction checks                                                       | E2E DEPENDENCY                        | Multiple feature owners; UM child only partially covers legacy set                                                                                                                                              |
| `TR-4.9-02`   | v1.5 §4.9   | Manual add/edit/delete under both gates; timeline readable chronologically                                                                                              | API/UI E2E                                                                                 | E2E DEPENDENCY                        | Timeline consumer and role defaults                                                                                                                                                                             |
| `TR-4.9-03`   | v1.5 §4.9   | Departure never creates a timeline event                                                                                                                                | Cross-context negative E2E                                                                 | E2E DEPENDENCY                        | Lifecycle/timeline contract                                                                                                                                                                                     |
| `TR-4.10-01`  | v1.5 §4.10  | CDS dictionary by department entity+position; external matrix/result links; conclusions                                                                                 | API/UI E2E                                                                                 | READY NOW                             | CDS owner                                                                                                                                                                                                       |
| `TR-4.10-02`  | v1.5 §4.10  | IDP fields, own completion and date, open definition                                                                                                                    | API/UI E2E                                                                                 | READY NOW                             | CDS owner                                                                                                                                                                                                       |
| `TR-4.10-03`  | v1.5 §4.10  | Last-assessment before/after/between/never and open-IDP filters                                                                                                         | API/UI E2E + query unit                                                                    | E2E DEPENDENCY                        | CDS/directory interworking                                                                                                                                                                                      |
| `TR-4.11-01`  | v1.5 §4.11  | Self open flag, mentor/mentees, unflag behavior with active pair                                                                                                        | API/UI E2E                                                                                 | READY NOW                             | Mentorship owner                                                                                                                                                                                                |
| `TR-4.11-02`  | v1.5 §4.11  | Company-wide willing pool exposes S1+flag only; mentee is access-scoped                                                                                                 | API/UI E2E                                                                                 | E2E DEPENDENCY                        | Mentorship projection plus AC                                                                                                                                                                                   |
| `TR-4.11-03`  | v1.5 §4.11  | Pair/status lifecycle, required pair closure note, privacy, durable history and timeline events                                                                         | API/UI E2E + state-machine unit                                                            | READY NOW                             | Mentorship owner                                                                                                                                                                                                |
| `TR-4.11-04`  | v1.5 §4.11  | Departure auto-closes with system note and bypasses manual-note gate                                                                                                    | Cross-context E2E                                                                          | E2E DEPENDENCY                        | Lifecycle/mentorship contract                                                                                                                                                                                   |
| `TR-4.12-01`  | v1.5 §4.12  | Form metadata, external-only content, filter/saved-view audience preview and adjustment                                                                                 | API/UI E2E                                                                                 | E2E DEPENDENCY                        | Campaign/directory contract                                                                                                                                                                                     |
| `TR-4.12-02`  | v1.5 §4.12  | Audience freezes on activation; recipients self-report completion; sender sees exact status/overdue                                                                     | API/UI E2E                                                                                 | READY NOW                             | Campaign owner                                                                                                                                                                                                  |
| `TR-4.12-03`  | v1.5 §4.12  | Campaign is sole form distribution path, including requested feedback                                                                                                   | Cross-context E2E                                                                          | E2E DEPENDENCY                        | Campaign/feedback contract                                                                                                                                                                                      |
| `TR-4.13-01`  | v1.5 §4.13  | Notifications and their negative-content metric                                                                                                                         | Deferred design                                                                            | OUT OF SCOPE                          | §4.13 GOOD TO HAVE                                                                                                                                                                                              |
| `TR-4.14-01`  | v1.5 §4.14  | Current-state/event analytics and XLSX export                                                                                                                           | Deferred design                                                                            | OUT OF SCOPE                          | §4.14 GOOD TO HAVE                                                                                                                                                                                              |
| `TR-4.15-01`  | v1.5 §4.15  | Feedback fields, management default, employee share flag, chronology/period filter                                                                                      | API/UI E2E                                                                                 | READY NOW                             | Feedback owner                                                                                                                                                                                                  |
| `TR-4.15-02`  | v1.5 §4.15  | Joining interview is feedback; requested feedback is manually entered after campaign; no period comparison                                                              | API/UI/cross-context E2E                                                                   | E2E DEPENDENCY                        | Feedback/campaign contract                                                                                                                                                                                      |
| `TR-4.16-01`  | v1.5 §4.16  | Time-bounded active/dismissed status is sole departure source and filter                                                                                                | API/UI E2E + temporal unit                                                                 | READY FOR FORMAL SIGN-OFF             | [`PR-S-02` sign-off is recorded](../planning-artifacts/architecture/architecture-people-management-2026-08-19/.memlog.md); E2E/implementation remains blocked by CC-06, CC-07, CC-08, CC-09, and OPERATIONAL-ENVELOPE |
| `TR-4.16-02`  | v1.5 §4.16  | Effective-date read-only/list/task/mentorship/account/access effects are atomic                                                                                         | API E2E + worker evidence                                                                  | READY FOR FORMAL SIGN-OFF             | [`PR-S-02` sign-off is recorded](../planning-artifacts/architecture/architecture-people-management-2026-08-19/.memlog.md); CC-06 and PR-B-09 separately block implementation, operational, and release evidence |
| `TR-4.16-03`  | v1.5 §4.16  | Recording blocked for all manager/PP responsibilities; explicit re-parent and external PM/DM remediation                                                                | API/UI E2E                                                                                 | READY FOR FORMAL SIGN-OFF             | [`PR-S-02` sign-off is recorded](../planning-artifacts/architecture/architecture-people-management-2026-08-19/.memlog.md); CC-06 remains open and timetracker-owned PM/DM remediation separately depends on PR-B-08 |
| `TR-4.17-01`  | v1.5 §4.17  | Seed-only population import, platform auth, no user-create flow, no real data                                                                                           | API/import E2E + route negative                                                            | E2E DEPENDENCY                        | Targeted UM child seed-import follow-up; AD-16/AD-21                                                                                                                                                            |
| `TR-4.17-02`  | v1.5 §4.17  | Exactly one nested department; manager grants access; department maintenance/routing/timeline/CDS key                                                                   | API/UI/cross-context E2E                                                                   | PRODUCT/ARCH BLOCKED                  | PR-B-03 / OQ-116 plus approved Department edge contract                                                                                                                                                         |
| `TR-5.1-01`   | v1.5 §5.1   | Pull leaves/type/dates/status for seeded users and self-service link                                                                                                    | Contract + live test-env integration                                                       | E2E DEPENDENCY                        | PR-B-08 timetracker contract/environment                                                                                                                                                                        |
| `TR-5.1-02`   | v1.5 §5.1   | Pull projects/people/PM/DM; sync solely owns sync-managed policy rows                                                                                                   | Contract + integration E2E                                                                 | E2E DEPENDENCY                        | PR-B-08 timetracker contract/environment                                                                                                                                                                        |
| `TR-5.1-03`   | v1.5 §5.1   | Security freshness: ≤15 minutes; visible stale banner; last-known data; Project access gone after 4 failed hours                                                        | Integration/reliability E2E                                                                | E2E DEPENDENCY                        | PR-B-08; controllable clock and failure-capable adapter                                                                                                                                                         |
| `TR-5.2-01`   | v1.5 §5.2   | Store PeopleForce candidate ID/link for external proposals                                                                                                              | API/UI E2E                                                                                 | READY NOW                             | Required resourcing data, no API call needed                                                                                                                                                                    |
| `TR-5.2-02`   | v1.5 §5.2   | Optional candidate prefill preview, per-field acceptance/conflict, mapping, authorization, idempotency, forbidden fields                                                | Deferred design                                                                            | OUT OF SCOPE                          | §5.2 GOOD TO HAVE; platform vacancy remains authoritative                                                                                                                                                       |
| `TR-6-01`     | v1.5 §6     | Runtime custom fields survive arbitrary filtering/sorting                                                                                                               | API/query evidence                                                                         | PRODUCT/ARCH BLOCKED                  | PR-B-01 / OQ-114                                                                                                                                                                                                |
| `TR-6-02`     | v1.5 §6     | Three-part role model and live split graph resolution                                                                                                                   | API E2E + architecture review                                                              | E2E DEPENDENCY                        | AC approvals plus Project/Department consumers                                                                                                                                                                  |
| `TR-6-03`     | v1.5 §6     | Grade/position/department/type/status are time-bounded records                                                                                                          | API + DB integration                                                                       | E2E DEPENDENCY                        | AD-16/AD-20 and owning feature models                                                                                                                                                                           |
| `TR-6-04`     | v1.5 §6     | Seeded user, timetracker user and optional candidate use durable IDs; email insufficient                                                                                | Contract + API/integration negatives                                                       | E2E DEPENDENCY                        | `ttId` and candidate-ID mapping contract                                                                                                                                                                        |
| `TR-7-01`     | v1.5 §7     | Access correctness directly tested per audience/path/section                                                                                                            | API E2E                                                                                    | AC STAGE-1 DRAFT                      | Phase 1 only; full DoD requires deferred suites                                                                                                                                                                 |
| `TR-7-02`     | v1.5 §7     | Only seeded test population; no real PII in contexts/logs/screenshots/repository                                                                                        | CI scan + manual provenance audit                                                          | READY NOW                             | Use synthetic identifiers and delivered seed only                                                                                                                                                               |
| `TR-7-03`     | v1.5 §7     | All Employees with 500+ records and permission resolution responds within 2 seconds                                                                                     | measurement — `DIRA1-MVP-v1`; [contract A](#contract-a--all-employees-httplist-route) only | **PASS** (local)                      | Composed directory route and the 500+ dataset. `performance/dira1-final-dira1-1789080461725-944ce5c2a33a.json`                                                                                                  |
| `TR-7-04`     | v1.5 §7     | Integration failures do not take down app within §5.1 limits                                                                                                            | Reliability E2E                                                                            | E2E DEPENDENCY                        | Timetracker failure contract                                                                                                                                                                                    |
| `TR-7-05`     | v1.5 §7     | Accessible and responsive list/profile/dashboard                                                                                                                        | Automated accessibility + manual viewport/keyboard review                                  | E2E DEPENDENCY                        | No numeric WCAG target is sourced; do not invent one                                                                                                                                                            |
| `TR-8-01`     | v1.5 §8     | BMAD use and deliberate migration decisions                                                                                                                             | Repository/process audit                                                                   | READY NOW                             | Manual evidence, not product E2E                                                                                                                                                                                |
| `TR-8-02`     | v1.5 §8     | Parallel feature ownership without serial QA bottleneck                                                                                                                 | Branch/review/process audit                                                                | READY NOW                             | AD-4 feature-owner gate evidence                                                                                                                                                                                |
| `TR-8-03`     | v1.5 §8     | Intelligent repository contains specs/decisions/transcripts/API docs/rules                                                                                              | Repository audit                                                                           | READY NOW                             | Manual evidence                                                                                                                                                                                                 |
| `TR-8-04`     | v1.5 §8     | Foundation topics have named owners and written alignment before implementation                                                                                         | Repository/review audit                                                                    | READY NOW                             | Manual evidence                                                                                                                                                                                                 |
| `TR-8-05`     | v1.5 §8     | Communication and status are captured                                                                                                                                   | Repository/process audit                                                                   | READY NOW                             | Manual evidence                                                                                                                                                                                                 |
| `TR-9-01`     | v1.5 §9     | Shipped behavior matches §§2–3 and all required functionality                                                                                                           | Trace audit + release regression                                                           | E2E DEPENDENCY                        | Requires all child evidence                                                                                                                                                                                     |
| `TR-9-02`     | v1.5 §9     | Every `—`, narrowed Project-line cell, S7 employee/PM flags, colleague whitelist/campaign exception proven                                                              | API/projection E2E                                                                         | E2E DEPENDENCY                        | The access-control scenario inventory does not cover all deferred DoD slices *(the source cell said "171 drafts"; corrected to the real 101-file inventory — see [Ownership](#ownership))*                      |
| `TR-9-03`     | v1.5 §9     | Runtime role creation/permission UI works without deploy                                                                                                                | UI E2E                                                                                     | E2E DEPENDENCY                        | Role-catalog consumer                                                                                                                                                                                           |
| `TR-9-04`     | v1.5 §9     | Org changes/full grants reject self-assignment and journal                                                                                                              | API/UI E2E                                                                                 | PRODUCT/ARCH BLOCKED                  | PP Stage-1 is PR-S-01 sign-off ready; journal execution remains PR-B-07 / CC-07, full-profile remains PR-B-06 / CC-05, and Department scope remains PR-B-03 / OQ-116                                            |
| `TR-9-05`     | v1.5 §9     | Shared link named/authenticated, creator rechecked, always revocable                                                                                                    | API/UI E2E                                                                                 | E2E DEPENDENCY                        | Shared-link child                                                                                                                                                                                               |
| `TR-9-06`     | v1.5 §9     | Timetracker runs against test environment and seeded population                                                                                                         | Live integration demonstration                                                             | E2E DEPENDENCY                        | PR-B-08 provider access/contract                                                                                                                                                                                |
| `TR-9-07`     | v1.5 §9     | Foundation test architecture is applied and specs equal behavior                                                                                                        | Trace/history audit                                                                        | E2E DEPENDENCY                        | Approved AD-1 chain per feature                                                                                                                                                                                 |
| `TR-9-08`     | v1.5 §9     | Product is deployed and demonstrable                                                                                                                                    | Deployment smoke + evidence                                                                | PRODUCT/ARCH BLOCKED                  | PR-B-09 operational envelope                                                                                                                                                                                    |




**Note on the "AD-1 approvals" clauses in the dependency column, applied without editing the
preserved text.** Seven rows above carry a dependency clause that names the **per-stage human
approval** mechanism rather than a design or product approval: `TR-2.1-01` (marked inline),
`TR-2.1-05`, `TR-2.1-06A`, `TR-2.3-01` ("no current approved UR suite"), `TR-4.16-01`, `TR-6-02`
("AC approvals") and `TR-9-07` ("Approved AD-1 chain per feature"). **That clause is retired under
ruling D-1** — AD-1 no longer requires a human approval between stages. What survives in each case
is the **ordering** (scenario document → committed-red Stage-2 test → production code) and, where
the row also names one, the separate **formal sign-off** of `PR-S-01` / `PR-S-02`, which is
[recorded in the PM memlog](../planning-artifacts/architecture/architecture-people-management-2026-08-19/.memlog.md). The dependency text is preserved as written so the source
statement stays auditable; **it is not an active approval obligation.**

**Clauses in that column that are *not* affected by D-1**, and which stay exactly as written: an
"approved Department edge contract" (`TR-2.1-03`, `TR-2.1-05A`, `TR-2.1-DEPT`, `TR-4.17-02`),
"default starting-role permission assignments **approved by PO**" (`TR-2.3-04`), and the resourcing
rows where "approved" describes a **request's** state (`TR-4.7-04`, `TR-4.7-05`, `TR-4.7-06`). These
are architecture and product approvals, not the removed per-file scenario gate.

---

### U-19 normative coverage — scenario file mapping (resolved 2026-09-11)

**Method.** Each of the 101 `docs/test-cases/access-control-foundation/` and
`access-control-kernel/` scenario files was read against its own `**Trace:**` citation (a v1.5
`§`-section number, confirmed as the same `docs/project-requirements.md` **Version: 1.5** these
`TR-*` rows are drawn from) and cross-checked against the cited row's actual requirement-statement
text — never inferred from a filename. Confirmed by grep: **zero of the 101 files cite a `TR-*` id
anywhere**; the five apparent matches are all the unrelated scenario id `S4.2b-TR-01`. Each matched
file now also carries an inline `**U-19 normative coverage:**` note (or, for kernel files, an
appended `**Trace:**` bullet) recording the same finding at the point of use.

**Result: 14 of the 119 rows receive any evidence, and none receives full coverage.**

| `TR-*` row | Evidence level | Scenario file(s) |
| --- | --- | --- |
| `TR-2.1-01` | Facade/unit-level only, not API E2E | `ACM4R-MA-01..06`, `ACM2-IA-01..10`, `S4.1a-DP-01..03`, `ACM5-SA-05` |
| `TR-2.1-02` | HTTP allow case (route unprotected, `SEC-AUTH-01` open) + facade robustness; 2 of the HTTP files invalidated pending rework | `ACF-AU-02` (component), `ACF-AU-03` (primary), `ACF-FC-01` (invalidated), `ACF-FC-04`, `ACM3-II-01..14` |
| `TR-2.1-05` | HTTP allow case (same route caveat) + facade | `ACF-AU-04`, `ACM3-II-11` (boundary) |
| `TR-2.1-05A` | Negative/boundary only — positive walk stays `PRODUCT/ARCH BLOCKED`, no file proves it | `ACF-FC-02` (invalidated), `ACM3-II-11` |
| `TR-2.3-02` | Only the "removal immediate" half; "independently grantable via UI" half has no scenario | `ACM2-IA-02` |
| `TR-2.3-03` | Facade-level only | `ACM4R-MA-05` |
| `TR-2.3-04` | Seed-time default grant only, not the configuration-review/UI mechanism | `ACM1-FB-01`, `ACM1-FB-03`, `ACM1-FB-06` |
| `TR-2.4-01` | Missing self-assignment rejection and last-holder guard entirely (out of this folder's scope) | `ACM11-FPO-01..06` |
| `TR-2.4-AC` | Mechanism-only, against a synthetic mock; kernel README's own words: "no HTTP-observable effect today" | `ACM11-FPO-03`, `ACM11-FPO-04` |
| `TR-3.1-01` | Facade edge-case only | `ACM5-SA-05..09` |
| `TR-3.2-S01` | Read/write/none shape only — no photo exception, no field matrix | `ACM5-SA-01`, `ACM5-SA-02` |
| `TR-3.2-S10` | Shape only — no "colleague dates only" field restriction | `ACM5-SA-03` |
| `TR-3.2-S11` | Shape only — no "colleague project name only" field restriction | `ACM5-SA-04` |
| `TR-7-01` | Same partial set as above; row's own text already says "Phase 1 only" | `ACF-FC-03`, `ACF-FC-04`, plus everything above |

**The remaining 105 of 119 rows have zero evidence from any of the 101 files** — not a search gap:
`docs/test-cases/access-control-foundation/README.md` and `access-control-kernel/README.md` each
state their own scope exclusions (Project line, Department, PP HR-line positive walk; every section
but S1/S10/S11; `/roles` catalog CRUD; projection/whitelist; PP/Department-mutation journal), and
everything under v1.5 §4–§6, §8–§9 (directory, dashboards, resourcing, CDS, mentorship, campaigns,
timetracker, repository process) belongs to epics this suite does not touch.

**Orphan finding:** `ACF-AU-01` (Self) has no corresponding `TR-*` row at all — no `TR-2.1-*` or
`TR-3.2-S*` row names Self as a distinct subject, even though §3.2 defines it. This is a gap in the
`TR-*` catalog, not in scenario coverage, and is recorded here rather than silently left unmapped.

**This closes U-19 as originally scoped** — "which file covers which row" is no longer unanswerable
from any artifact. **It does not change `PG-01`.** `PG-01` schedulability is governed separately by
**U-20** (`SEC-AUTH-01`, `CC-07`, `AC-S9-S13`, `AC-SECTION-MATRIX-01` all closed at implementation);
none of those four close by mapping files to rows, and none of the mapped files above constitute
production-wired evidence — most are themselves still draft, pending their own independent AD-1
Stage-1 approval (`approvals.yaml` records only nine `ACM1-FB` and three `ACM3-II` as approved), and
three foundation files' expected results are invalidated pending rework (see each suite's own
README).

---



## Release and design gates

**Design gates (**`DG-`***) govern what may be designed and built. Release gates (**`PG-`***) govern what
may ship.** Every gate below is **ungranted** — naming a gate is not passing it.

### Design gates


| Gate    | Statement                                                                                                                                         | Authority and what changed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `DG-01` | **Ordering:** a scenario document, then a **committed-red** Stage-2 test, then production code written until it passes.                           | **Restated under ruling D-1.** The per-stage **human approval** clause is **retired** — `docs/architecture/testing-strategy.md:25–38` states that AD-1 no longer requires a human approval between stages, that no new ledger entries are written, and that the two existing approval ledgers are kept as history and simply stop being a precondition for anything. What `DG-01` keeps is (a) the three-stage ordering; (b) the **no-self-certification** principle of README non-negotiable 2, which survives as a review norm; (c) the narrow **validation-only evidence exception** (`testing-strategy.md:55–74`) — characterization tests over already-shipped behaviour may be committed green, are **never** a Stage-2 gate, and the exception does **not** travel with a remediation; (d) the **Kernel MVP exception** (`testing-strategy.md:86–93`) deferring due/departure and dismissed-target coverage for ACM-0..ACM-5. |
| `DG-02` | **Do not design through** `PR-B-01..09`**.**                                                                                                      | Survives unchanged. Its live blocker list is `test-design-architecture.md` § Open blockers, after the migration's adjudication — six of nine are closed **at design only**, and **none is closed at implementation**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `DG-03` | `PR-S-01` and `PR-S-02` have **recorded formal sign-off**; E2E and implementation remain blocked on their independent implementation and evidence conditions. | PM/AD-19, PM/AD-20 are binding **direction**, not the approval. Product Owner + Architect sign-off is [recorded in the PM memlog](../planning-artifacts/architecture/architecture-people-management-2026-08-19/.memlog.md); `CC-04`, `CC-06`, `CC-07`, `CC-08`, `CC-09`, and `OPERATIONAL-ENVELOPE` remain open. |
| `DG-04` | `PR-B-08`: the timetracker contract is inspected, and event-versus-state semantics and identity mapping are recorded, **before** adapter Stage 1. | Unchanged. Evidence: contract review.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |


> `DG-05` **is retired, and must not reappear.** It was a *child-ownership* gate ("approved UM files
> remain unchanged"), premised on the child/platform split this migration dissolves and on an
> "approved UM" set that becomes epic plans with **ungranted** approval. **No successor gate.** The
> targeted follow-up it named is executed by the migration itself.

> **U-18 resolved 2026-09-11 by the document's owner (Architect).**
> `docs/architecture/testing-strategy.md` used to contradict itself about per-stage approval in
> **two** places — line **84** ("Each scenario still stops for its own human approval before stage
> 2") and lines **117–119** ("Preserve AD-1 unchanged: scenario prose, independent human approval,
> …") — against its own lines 25–38. Ruling D-1 had already resolved which reading governs this
> document's purposes (lines 25–38); the owner has now edited both contradicting locations to match
> that authority, so neither line states a per-stage human-approval requirement any more. See §10.1
> and the `plat:DG-01` row of `test-design/migration-map.md` §5.8 for the closure record.

### Release gates


| Gate    | Statement                                                                                                                                     | Evidence contract                                                                                    | State                                                                                                                                                                                                                                                                       |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PG-01` | **Access control is NOT schedulable.**                                                                                                        | `repository-audit`                                                                                   | **Not schedulable — on a new, evidenced rationale.** See below.                                                                                                                                                                                                             |
| `PG-02` | Required **live** timetracker leaves / projects / people evidence over the seeded population.                                                 | `integration-live`                                                                                   | v1.5 §5.1, §9. Blocked on `PR-B-08`.                                                                                                                                                                                                                                        |
| `PG-03` | `PR-S-01`/`PR-S-02` sign-off is [recorded](../planning-artifacts/architecture/architecture-people-management-2026-08-19/.memlog.md); PP and departure E2E still require **zero unresolved** leak, stale-access, self-assignment or due-departure defects. | `api-e2e` + sign-off trace | PM/AD-19, AD-20, AD-12 are directions/controls, not approval. `CC-04`, `CC-06`, `CC-07`, `CC-08`, `CC-09`, and `OPERATIONAL-ENVELOPE` remain open; no release claim follows. |
| `PG-04` | **All Employees list ≤ 2 seconds at 500+ records, including permission resolution** (v1.5 §7 verbatim).                                       | **[Contract A](#contract-a--all-employees-httplist-route) —** `DIRA1-MVP-v1`**. Not ACM-9. Not P6.** | Evidence owner `PMC-E1-S1.9`. **PASS** — `performance/dira1-final-dira1-1789080461725-944ce5c2a33a.json` (comparable baseline `dira1-1789080425159-ab0a0a57396f`; local env). `QUALITY-GATE-AC-NFR` does **not** discharge this gate — contract **B** only (U-25 resolved). |
| `PG-05` | Every required v1.5 trace row has accepted evidence; `OUT OF SCOPE` is used **only** for GOOD TO HAVE or §10 exclusions.                      | `repository-audit`                                                                                   | Unchanged.                                                                                                                                                                                                                                                                  |
| `PG-06` | After `PR-B-09`: a deployed, demonstrable product; AD-1 history; parallel ownership; current intelligent-repository specs.                    | deployment evidence                                                                                  | v1.5 §8, §9.                                                                                                                                                                                                                                                                |


`PG-01` **— the re-adjudication, stated in full because the gate's conclusion survived its
rationale.**

- **The stated rationale is retired in full**, with ruling D-1 as authority. It read: access control
is not schedulable "while the **171** Phase-1 files await **per-file approval**". Both halves fail
— the per-file approval gate was removed on 2026-09-04 and **was the gate's only stated support**,
and the 171-file subject does not exist. *(The real inventory is **101** files across*
`access-control-foundation/` *and* `access-control-kernel/`*. This is an explicitly labelled
correction of a prior error, not a current input.)*
- **The gate is nevertheless NOT promoted to schedulable**, because three *currently open* blockers
independently keep access control unschedulable, **none of which is an approval state**:
  - `SEC-AUTH-01` **— P0 open.** `interim-session-resolver.adapter.ts` is still wired as
  `SESSION_RESOLVER_PORT` and still self-provisions `position: 'HR Admin'`.
  - `CC-07` **— P0 open, implementation `partial` (corrected 2026-09-11; was misstated here and in
  `test-design-architecture.md` § Open blockers as "zero occurrences" — the table, repository,
  service and controller endpoint exist, but per-kind enrolment, AD-29-complete reader
  authorization and a live grant/revoke endpoint are still owed). This correction does not change
  `PG-01`'s conclusion: `SEC-AUTH-01` and `AC-S9-S13`/`AC-SECTION-MATRIX-01` remain independently
  open regardless of `CC-07`'s true state.
  - `AC-S9-S13` **/** `AC-SECTION-MATRIX-01` **— P1 open.** `access-control.facade.ts:52-54` literally
  early-returns `none` for every section but S1 / S10 / S11.
- **Authority:** `…/architecture-people-management-ratification-2026-09-02/blockers.yaml` and
`…/blocker-verification-2026-09-03.md`.
- **This is a replacement of the rationale, not a re-derivation of the same conclusion from the
same removed premise**, and it is **not** an assertion that any of those blockers will close.
- `PG-01` **is not schedulable today.** **Schedulable condition (U-20 resolved):** access control
becomes schedulable when `SEC-AUTH-01`, `CC-07`, `AC-S9-S13`, and
`AC-SECTION-MATRIX-01` are all **closed at implementation** in the current blocker register
(`…/architecture-people-management-ratification-2026-09-02/blockers.yaml` or its successor).
**Evaluator:** Platform epic owner + Architect. **Evidence:** the blocker register shows all four
closed at implementation, plus a current re-verification record (for example
`…/blocker-verification-2026-09-03.md` or a successor dated after the last closure). Until that
evidence exists, `PG-01` stays **not schedulable**.



### Gate thresholds carried from the handoff

Merged from `legacy-um:S13#recommended-quality-gates` and the platform gate set. **Three thresholds
survive unchanged: P0 = 100 % covered · P1 = ≥ 95 % covered · the access-control suite passes.** The
fourth is restated: "k6 baseline or waiver" becomes **"All-Employees-list performance baseline or a
recorded waiver, harness undecided"**. The **"Human Approval" phase between stages is retired** as a
gate (D-1), and the "ATDD" phase is superseded by the current ordering rule.

> **These are carried as thresholds only. This document computes, asserts and publishes no coverage
> percentage against any of them.**



### Gates — boundary note

**The whole-repository trace remains a planning audit run with** `allow_gate=false`**.** Its aggregate
percentage must **never** be presented as release readiness, and `gate-decision.json` does not exist
unless a run issues a verdict. **This migration issues no verdict and regenerates no trace
artifact.** (AGENTS.md § Trace artifacts; `_bmad/custom/bmad-testarch-trace.toml`.)

---



## Cross-epic regression map

**What must be re-run when something else changes.** Every trigger is preserved with its arrow and
its stated cause.


| Trigger                                        | Arrow                                                    | Re-run                                                                                                                                                               | Level                                         | Authority                                      |
| ---------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ---------------------------------------------- |
| Any change to any endpoint                     | **access control → every endpoint**                      | The **full access-control E2E on every PR**                                                                                                                          | `api-e2e`                                     | `docs/architecture/README.md` non-negotiable 7 |
| A profile-mutation route changes               | `UM-E1` → `UM-E3`                                        | `CT-02` — PATCH fires the paired timeline event                                                                                                                      | `api-e2e`                                     | PM/AD-11                                       |
| The event writer changes                       | `UM-E3` → `M-E1`                                         | The relationship-event cases. **Arrow re-pointed:** the original targets `REL-04/05` moved to the mentorship domain, so this is no longer an "Epic 3 → Epic 4" arrow | `api-e2e`                                     | Preserved trigger, re-homed target             |
| Any change to the auth / session path          | `UM-E2` → **all suites**                                 | The auth smoke, on every PR                                                                                                                                          | `api-e2e`                                     | Session-token blast radius                     |
| An org change                                  | User Management → Access Control                         | The next-request revocation cases                                                                                                                                    | `api-e2e`                                     | PM/AD-19                                       |
| Timetracker identity or project sync changes   | Timetracker → policies / profile / dashboards            | Stale-project-access cases, with the **15-minute** and **4-hour** checks                                                                                             | integration e2e **with a controllable clock** | v1.5 §5.1; `PR-B-08`                           |
| A directory projection or custom field changes | Directory → profile / custom fields / export / campaigns | Hidden-value inference and audience-drift cases                                                                                                                      | api / ui e2e                                  | v1.5 §3.3; `PR-B-01`                           |
| Resourcing or shared-link scope changes        | Resourcing → shared links → S15 → timetracker            | Candidate-data-leak and false-assignment cases                                                                                                                       | cross-context e2e                             | v1.5 §4.7 / §4.8                               |
| Campaign or action-item wiring changes         | Campaigns → action items → feedback                      | Duplicate-task and widened-sender-view cases                                                                                                                         | cross-context e2e                             | v1.5 §4.12                                     |
| Mentorship or lifecycle events change          | Mentorship, lifecycle → timeline                         | Missing/incorrect event and closure-note cases                                                                                                                       | cross-context e2e                             | PM/AD-17, AD-20                                |
| Departure execution changes                    | Departure → auth / AC / tasks / mentorship               | Partial-offboarding cases                                                                                                                                            | api / worker e2e                              | PM/AD-20                                       |
| CDS or department structure changes            | CDS → Department / directory                             | Wrong-matrix-link and filter-result cases                                                                                                                            | cross-context e2e                             | v1.5 §4.10                                     |
| The AccessControl facade changes               | **AccessControl facade → every consumer**                | Bypassed- or inconsistent-authorization cases                                                                                                                        | `api-e2e`                                     | Non-negotiable 7                               |




### Cross-epic regression map — controllable time and outbound fakes

**Preserved with its scope stated, because the qualifiers do real work.**

- **Controllable clock and timezone seams** serve the **15-minute**, **4-hour**, **magic-link
expiry** and **departure-cutoff** boundaries. Nothing here injects a production duration; the
production values are [configuration-owned](#nfr-measurement-contracts--configuration-owned-note).
- **Outbound fakes** serve **dispatch** and **sync observation**. The email port in particular must
be fake-bound by DI — the requirement appears in story notes but **not** in the scenario documents
that depend on it, which is itself a controllability gap.
- **Durable-state observability** applies to the **departure worker** and — **after DEC-UM-008** —
to the **magic-link dispatch path only**. That "applicable" qualifier is the whole content of the
clause: the registration-time durable dispatch intent it originally covered no longer exists.
- **TTL controls** are injected, never read from production configuration.

**Evidence:** `api-e2e` with an injected clock and outbound fakes.

---



## Privacy

**The obligation, and what discharges it.** No real personal data in code, fixtures, agents, logs,
screenshots or the repository; the delivered seeded population is pseudonymised and is the only
population used.

- **Evidence:** a **CI scan** (binary result) **plus** a manual **seed-provenance audit**. Neither
alone discharges it: a scan proves no known pattern is present, and the audit proves where the
data came from.
- **Log redaction** and **fail-closed on ambiguous identity match** are part of the same obligation
(PM/AD-13, v1.5 §6).
- **Test databases hold pseudonymised personas only.**
- **Origins merged here:** `legacy-um:NFR-1`, `legacy-um:R-012`, `legacy-um:TD-UM-NFR-PII-01`,
`plat:PR-010`, `plat:TR-7-02`, `plat:P2-PLAT-03`.
- **Not asserted:** that any scan has been run or has passed.

---



## Process/trace evidence

**Scenario trace lines cite the normative section, not a derived** `FR-n`**.** Recorded as already
resolved once, and **retained as a regression audit** so it does not drift back.

- **Obligation** `TD-UM-DOC-01`, merged with `plat:TR-8-01` and `plat:P1-PLAT-08` (AD-1 trace and
spec conformance).
- **What changed:** AD-1's *stage-approval* clause changed on 2026-09-04. **The conformance
obligation survives; the approval mechanism it used to audit does not.** What is audited now is
the **ordering** and whether specs equal shipped behaviour.
- **Evidence:** `repository-audit`.
- **Retired with it:** `legacy-um:C-02` — "Story 1.1's traceability must map all nine registration
scenarios" — described in its own source as *planning drift, not a product decision*. Story 1.1's
subject is now "import the seeded population", and the nine registration scenarios are legacy.
**No successor obligation.**

---



## QA improvement backlog

> **This backlog does NOT count as requirement coverage.** Every item here is a cross-cutting
> improvement candidate that **no product epic owns**. Each carries an **owner** and a **trigger**.
> Nothing in this section may be cited as coverage of a requirement, and nothing here is scheduled
> by this document.

**Counted at the time of writing: 32 frontend cases**, plus four non-case items. The **112** cases
that *do* land in epic plans (59 backend + 53 frontend) are **not** here — they may count as
coverage in their owning plans.

### Frontend error handling


| Item                                                                                                                                  | Cases    | Level                | Owner | Trigger                                                |
| ------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------- | ----- | ------------------------------------------------------ |
| `lib/http.ts` — `httpStatus`, `errorCode`, `errorBody` (P0)                                                                           | **9**    | `unit`               | DEV   | A new documented failure body is added to any endpoint |
| `R-FE-03` — error extractors drive user-visible error copy; "every documented API failure renders its own copy, never a blank screen" | non-case | `unit` + `component` | DEV   | Same                                                   |


*Cross-referenced from the* `UM-E5` *plan for the departure* `409` *shapes the source names explicitly —
a cross-reference, not a re-home.*

### Frontend shared utilities


| Item                                                       | Cases | Level  | Owner | Trigger                                    |
| ---------------------------------------------------------- | ----- | ------ | ----- | ------------------------------------------ |
| `lib/datetime.ts` — `formatTimestamp`, `todayIsoDate` (P1) | **6** | `unit` | DEV   | A helper gains a product-visible behaviour |
| Generic hooks — `useDebounce`, `useLocalStorage` (P2)      | **6** | `unit` | DEV   | Same                                       |




### Shared UI surfaces


| Item                                                                   | Cases | Level       | Owner | Trigger                                  |
| ---------------------------------------------------------------------- | ----- | ----------- | ----- | ---------------------------------------- |
| `StatePanel` (P0) — "every flow renders it; nothing tests it directly" | **6** | `component` | DEV   | A new shared state surface is introduced |
| `MainHeader` / `SideMenu` (P2) — nav state and active-route rendering  | **5** | `component` | DEV   | An app-shell requirement is stated       |


**The** `PMC-E1-S1.2` **re-home of the nav chrome was declined**, on that story's own scope note: it
owns the directory **table's** presentation and its accessibility floor, not application-global
chrome. The backlog placement stands.

### Frontend polish


| Item                                                                                                                 | Level      | Owner | Trigger                             |
| -------------------------------------------------------------------------------------------------------------------- | ---------- | ----- | ----------------------------------- |
| `R-FE-07` — no per-route `document.title` on standalone auth pages. **Status "Monitor", preserved and not upgraded** | `none-yet` | DEV   | A route-title requirement is stated |




### CI observability


| Item                                                                                                                | Level              | Owner | Trigger                                                           |
| ------------------------------------------------------------------------------------------------------------------- | ------------------ | ----- | ----------------------------------------------------------------- |
| `R-UM-07` — `db:bootstrap:access-control` was deleted and nothing failed; the end-to-end job is `continue-on-error` | `repository-audit` | QA    | The job's red-case count changes **while it stays informational** |


> **The boundary this item must not cross.** Its mitigation is **not** to promote the informational
> access-control CI job to a required check. **The standing repository decision is that the ACM-9 CI
> job stays informational**, and converting an informational job to a blocking one is repository
> governance, outside a migration whose root changes are planning artifacts and workflow
> configuration only. **This document proposes no such promotion.**



### Enforceable skip triggers


| Item                                                                            | Level                                                          | Owner | Trigger                                                                      |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------- | ----- | ---------------------------------------------------------------------------- |
| `R-UM-05` — **31** `it.todo` cases carry unblock triggers that nothing enforces | `repository-audit` (static count at `f1eea3c`; **unexecuted**) | QA    | A `skipped` row appears in a trace run whose stated unblock condition is met |


**The count was corrected upward, 18 → 31, and the score was left alone.** Statically counted at the
pinned backend gitlink; all 31 are under `services/backend/test/`, none under `src/`. Corroborated by
`_bmad-output/implementation-artifacts/platform/deferred-work.md:35`, which records the same 31 and
separately notes that `docs/ci.md`'s "19" is stale. **This is a static source count, not an execution
result.** The correction makes the risk **larger**; it was not renormalised.

### Concurrent same-field writes


| Item                                                                                           | Level                    | Owner | Trigger                                                       |
| ---------------------------------------------------------------------------------------------- | ------------------------ | ----- | ------------------------------------------------------------- |
| "Concurrent PATCH of the same field" — the half of `legacy-um:G-15` with **no successor case** | `api-e2e` `@concurrency` | QA    | A concurrent-write defect, or a new same-field mutation route |


---



## Source-to-successor map

**This is migration metadata, not coverage.** It records the historical correspondence between the
2026-08-25 scenario families and the `TD-UM-*` identifiers that succeeded them, so an old citation
can be resolved. **No scenario file on disk is changed by this migration**, and the per-ID rows
themselves live in `test-design/migration-map.md` §4.3c and in the owning epic plans.


| Source family                    | Successor identifiers                                                   | What became of the successors                                                                                                                                         |
| -------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `um-reg-01..09`                  | `TD-UM-REG-01..09`                                                      | **Largely retired** under the v1.5 "no create path" cutover (PM/AD-16, AD-21; DEC-UM-006 and DEC-UM-008 RETIRED). The map records **history**, not a live obligation. |
| `um-auth-01..05`                 | `TD-UM-AUTH-01..05`                                                     | Successors **survive**, owned by `UM-E2`.                                                                                                                             |
| `um-pf-01..04`                   | `TD-UM-PF-01..04`                                                       | Successors **survive**.                                                                                                                                               |
| `um-deact-01..03`                | `TD-UM-DEACT-01..03`                                                    | Successors **retire or are replaced** under PM/AD-21 and AD-22; the map still records the correspondence.                                                             |
| `um-ct-01..07`                   | `TD-UM-CT-01..07`                                                       | Successors **survive**, owned by `UM-E3`.                                                                                                                             |
| *(none — net-new in 2026-08-25)* | `TD-UM-LIST-01..04`, `TD-UM-REL-01..08`, `TD-UM-AUTH-06`, `TD-UM-NFR-`* | Records which successors were net-new on that date.                                                                                                                   |


**Retired identifiers must not stay in the active tag contract.** See
[Appendix — tags](#appendix--tags).

**A citation defect recorded, and not repaired here.** The five `UM-CT-03/04/05/06/09` `it.todo`
cases are cited in a superseded source as "tracked in `deferred-work.md`". **No** `UM-CT`**-keyed item
exists in any of the four** `deferred-work.md` **files**, so this document does not assert that link.
The deferral *is* genuinely tracked, in three other places, which is what should be cited instead:
the scenario documents themselves (`docs/test-cases/user-management/career-timeline/um-ct-0{3,4,5,6}-*.md`
carry "DEFERRED (pending the FR-matrix grant)" and `um-ct-09-*.md` carries "DEFERRED (pending the
DEC-UM-001 narrowing)"); the spec files, where each case is an `it.todo` carrying its own inline
unblock trigger; and
`_bmad-output/implementation-artifacts/access-control/deferred-work.md:45`, the enabling
`profile:timeline` `canAccessSection` work. **The obligation is real and traceable; only the pointer
was wrong.**

---



## Planning volume

`~79–124 planning rows` **— preserved as a *platform planning* interval, with its label attached.**

The source states plainly that these are "**not test-case counts and not evidence of coverage**".
That label is inseparable from the number.

> **This interval must never be summed with the** `legacy-um` **~57 scenarios, the** `um-epic` **59 cases,
> or the** `fe-epic` **85 cases.** They count different things, at different levels, over different
> scopes, on different dates.

---



## Effort

**Four categories, never added together.** The plan requires implemented tests, net-new tests,
planning rows, shared infrastructure and deferred candidates to stay distinguishable. They do.

### Category 1 — implemented tests: **VERIFIED inventory (U-23 resolved)**

See [Implemented-test inventory](#implemented-test-inventory--verified-u-23-resolved-2026-09-11).
**Excluded from the category-2 net-new estimate** — implemented tests and net-new authoring are
never added together. Pass rate from the 2026-09-11 recount is informational only.

### Category 2 — net-new tests: the only category estimated


| Partition                                                                                                                                                                    | Cases  | Counts as requirement coverage?                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------- |
| `um-epic` net-new to epic plans — nine unit clusters (11+8+4+6+3+7+5+9+1)                                                                                                    | **54** | Yes, in the owning epic plan                                   |
| `um-epic` net-new e2e                                                                                                                                                        | **5**  | Yes                                                            |
| `fe-epic` net-new to epic plans (session 12, employeeFormatters 12, RequireAuth 4, identity-card-nulls 5, PersonPicker 8, AccountMenu 3, mutation-hooks 6, import-summary 3) | **53** | Yes                                                            |
| `fe-epic` net-new to the **QA improvement backlog**                                                                                                                          | **32** | **No** — see [QA improvement backlog](#qa-improvement-backlog) |


**Reconciliation:** 54 + 5 = **59**, exactly the `um-epic` total; 53 + 32 = **85**, exactly the
`fe-epic` total. **No case was dropped to reduce file count and none was invented.**
**Requirement-coverage figure: 112 cases** (59 + 53) land in epic plans and may count as coverage.

> ### The only form in which the effort figure may be quoted
>
> **≈ 15–23 engineer-days of category-2 net-new test authoring (unverified, uncalibrated,
> category 2 only — not a schedule, not a commitment, and never to be added to any other estimate
> in this ledger).**
>
> **Quote the whole sentence or none of it.** The number alone is meaningless and actively
> misleading. It is the **sum of two source ranges** (8–12 + 7–11), permitted **only** because both
> ranges count net-new cases for one engineer on the same uncalibrated basis, and for no other pair
> of figures. It is the sources' own range re-partitioned, **not** a re-derived duration, and no
> velocity data exists in this repository to check it against.
>
> **It must never be added to** the `plat` 79–124 planning rows / ~12–20 QA weeks, the ~57 legacy
> scenarios, the unverified implemented-test counts, the UNKNOWN shared-infrastructure work
> (including **DIRA1-MVP-v1 artifact collection**, which is separate from planning rows), or the 31
> deferred `it.todo` cases. **None of those shares its basis.**



### Effort — platform planning interval (category 3)

`~79–124 planning rows / ~12–20 QA weeks`**, preserved with its label and its conditions.**
Per-priority: P0 ~24–34 rows (~5–8 weeks) · P1 ~35–55 (~5–8 weeks) · P2 ~15–25 (~1.5–3 weeks) ·
P3 ~5–10 (~0.5–1 week).

**The conditions travel with the number:** `PR-S-01`, `PR-S-02`, `PR-B-07`, `PR-B-08`, `PR-B-09`.
The migration's adjudication removed **none** of them — the three that gate this interval are
**all still open**, two of them P0 — so **the interval is unchanged.**

### Category 4 — shared infrastructure: UNKNOWN, deliberately not estimated

Three items, **none of them inside the 15–23 engineer-days**:

1. `@testing-library/react` **plus a second vitest config** — a prerequisite for **every one of the
  85 frontend cases**; its file-location convention is **resolved by DEV (U-12)**, but the
   85 cases themselves are not authored yet and their effort is not scheduled here.
2. **DIRA1-MVP-v1 artifacts** — collected (`performance/dira1-final-dira1-1789080461725-944ce5c2a33a.json`,
  PASS, local env). ACM-9 and P6 measure **different subjects**.
3. **Schema-per-worker** — explicitly **not** to be built (see [backend isolation](#backend-isolation)),
  so it carries **no** estimate rather than a zero.



### Category 5 — deferred candidates: not remaining work

**31** `it.todo` cases, statically counted at the pinned backend gitlink, each blocked on its own
stated unblock trigger. Five of them are the `UM-CT-03/04/05/06/09` career-timeline cases. They are
tracked, blocked, and **outside this estimate**.

### What this section is not

**Not a schedule, not a commitment, not a coverage claim.** It estimates authoring effort for
identified net-new cases only, and it asserts nothing about whether any existing test passes.

**Retired estimates, recorded so they are not resurrected as remaining work:** the `legacy-um`
"~57 scenarios / ~3–5 weeks / 1 QA engineer" total and its per-priority breakdown (P0 ~8, P1 ~31,
P2 ~13, P3 ~5) are **retired** — they count *proposed stage-1 scenarios* for a design whose
registration and deactivation half is retired, and the per-epic split changes every denominator.
The "replaces/extends existing 28 files" figure is **retired** as a stale count. All are preserved
as history at `76a7220`.

---



## Entry criteria

**Every box is unticked.** The superseded `legacy-um` document had four of seven ticked against a
2026-08-25 state; **a new document may not inherit ticked boxes**, and the `plat` source had all
eight unticked already.

- [ ] v1.5 requirements are the normative reference for every row in this document.
- [ ] The current binding rules under `docs/architecture/` have been re-read against this document.
- [ ] `test-design-architecture.md` risk identifiers referenced here resolve to that document.
- [ ] A PostgreSQL test instance with a migrated schema is available.
- [ ] The seeded 500+ population exists with recorded relationship breadth and depth.
- [ ] Outbound port DI tokens are available, email in particular.
- [ ] Controllable clock and timezone seams are available.
- [ ] The timetracker test environment is reachable and `PR-B-08` is resolved.
- [ ] A `DIRA1-MVP-v1` baseline/final artifact exists for
  ```
  [contract A](#contract-a--all-employees-httplist-route) before TR-7-03 / `PG-04` evidence is
  claimed.
  ```

*Frontend entry criteria — the test-file location convention, the second vitest config and the
component-testing library (U-12) — are **resolved by DEV (2026-09-11)**, tracked in the owning
epic plans' entry criteria, not resolved here. The entry-criteria boxes themselves stay unticked
until the implementing branch merges — a decision is not evidence.*

## Exit criteria

**Every box is unticked. The thresholds survive as *stated thresholds*; no percentage is computed,
asserted or published by this document.**

- [ ] **P0 coverage = 100 %.**
- [ ] **P1 coverage ≥ 95 %.**
- [ ] **≥ 80 % functional-requirement coverage.**
- [ ] The access-control suite passes.
- [ ] An All-Employees-list performance baseline exists, **or** a recorded waiver — harness
  ```
  undecided.
  ```
- [ ] Every required v1.5 trace row has accepted evidence (`PG-05`).
- [ ] Zero unresolved leak, stale-access, self-assignment or due-departure defects (`PG-03`).
- [ ] The unit share meets the [level tripwire](#the-ratio-tripwire) — **a tripwire, not a mandate**.

*The* `R-UM-02` *closure condition and the 100 %-branch-coverage targets for* `lib/session.ts` *and*
`lib/http.ts` *are **epic-local** and live in the owning epic plans. The "no new Playwright case for
browser-free logic" rule is **shared** and lives in [Level strategy](#level-strategy).*

---



## Not in scope

**Platform scope exclusions.** Each cites a v1.5 GOOD TO HAVE, a §10 exclusion, or PM/AD-3.

1. The §3.2 section matrix itself — owned by access control, not by this document.
2. FR-1 seed bootstrap mechanics — owned by `UM-E1-S1.1`.
3. Notifications and analytics — v1.5 §4.13 / §4.14 GOOD TO HAVE (`P3-PLAT-03`, `OUT OF SCOPE`).
4. PeopleForce API prefill — v1.5 §5.2 GOOD TO HAVE; **no live run required**.
5. Vacancy synchronisation — not synchronised; resourcing requests are platform-owned.
6. Test generation of any kind. **This is a planning artifact; test generation is forbidden in it**
  (see [Appendix — fixture pattern](#appendix--fixture-pattern)).
7. Any change to scenario files, stored execution evidence, trace or coverage JSON, sprint status,
  service code or service gitlinks.

> **Three superseded exclusions were re-stated rather than copied.** The `legacy-um` rows 2–4 were
> written against a pre-v1.5 scope and needed re-statement against v1.5 §§3–5; rows 1, 5 and 6
> survive as written and are items 1, 2 and 3 above.



### Not in scope — frontend

1. `components/ui/**` is **vendored** and is not unit-tested here — a shared convention.
2. Frontend **contract shapes are owned by the** `contract/` **layer** — a shared convention.
3. **Cross-browser support beyond Chromium** — an **open product decision (U-10)**; no browser set
  is invented (`P3-PLAT-01`).
4. **Frontend performance budgets and accessibility requirements** — **open product decisions
  (U-11)**; see [Unknown thresholds](#unknown-thresholds).
5. Proactive logout on a timer or `visibilitychange` — an **open product question (U-13)**, owned by
  the frontend obligations of the relevant epic plan.

---



## Appendix — tags

**The tag vocabulary is still used by surviving scenarios and is preserved:**

`@P0` `@P1` `@P2` `@P3` · `@API` · `@concurrency` · `@blocked` · `@TD-UM-{AREA}-{NN}`

**Retired** `TD-UM-`* **identifiers must not remain in the active tag contract.** The registration and
deactivation families largely retire under the v1.5 no-create cutover (see
[Source-to-successor map](#source-to-successor-map)); a tag that names a retired obligation makes a
suite look like it covers something that is no longer an obligation. Their text may still appear in
historical citations.

## Appendix — fixture pattern

**Configuration, unchanged by this migration:** `tea_use_playwright_utils = true`
(`_bmad/config.toml:25`). Raw `request.<method>` is **not permitted**; use `apiRequest` from the
merged fixtures together with `expect` from `@playwright/test`.

**The factory/fixture example carried from the superseded sources must be re-based before reuse.**
Its `POST /users` body is **retired content** under PM/AD-16 and PM/AD-21 — that route does not
exist. Re-base the example on a surviving route before it is copied anywhere.

> **The boundary, preserved verbatim in meaning from both sources: this is a planning artifact, and
> test generation is forbidden in it.** No code is included, and the migration honours the same
> boundary.



## Appendix — knowledge base

Knowledge-base references resolve under the installed BMad test-design skill's
`resources/knowledge/` directory. **Both installations must resolve identically** — the `.agents/`
and `.claude/` skill trees. The superseded documents carried one set of paths each (`plat:S4` the
`.agents/` paths, `legacy-um:S2` the `.claude/` paths); they are merged here as one reference
because the effective content must be the same in both. Verifying that equivalence is Task 4's
contract and Task 5's exercise, **not a claim made by this document**.

---



## Open questions

**Unresolved questions stay open; resolved ones record their closure rule below.** Recording an
owner is not resolving a question. The register of record is `test-design/migration-map.md` §10.


| #        | Question                                                                                                                                                                                                                                                       | Owner                                                                       | Bears on                                                                                                                                                                                                                                                                 |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **U-2**  | **Resolved with authority (2026-09-11)** — Product Owner + Architect sign-off for both packages is [recorded in the PM memlog](../planning-artifacts/architecture/architecture-people-management-2026-08-19/.memlog.md); PM/AD-19/AD-20 are direction, **not** approval | Product Owner + Architect | `DG-03`, `PG-03` |
| **U-3**  | **Resolved with authority** — contract A binds warm p95 and worst case per gate; environment is local docker-compose PostgreSQL; load model is single sequential client (`DIRA1-MVP-v1`)                                                                       | Product Owner + Platform/DevOps                                             | `PG-04`, [contract A](#contract-a--all-employees-httplist-route)                                                                                                                                                                                                         |
| **U-4**  | WCAG conformance level and viewport set                                                                                                                                                                                                                        | Product Owner                                                               | [Unknown thresholds](#unknown-thresholds), `P2-PLAT-01`                                                                                                                                                                                                                  |
| **U-5**  | Uptime SLO, RTO, RPO, backup and retention, timeout/retry/backoff, circuit thresholds                                                                                                                                                                          | DevOps + Architect + Security                                               | [Unknown thresholds](#unknown-thresholds); gated by `PR-B-09`                                                                                                                                                                                                            |
| **U-6**  | `DEC-UM-012` — whether a deactivated user's `workEmail` is treated identically to an unknown email for the magic-link route. It remains an explicit **draft decision** and does **not** inherit the DEC-UM-001..011 approval                                   | Product                                                                     | Epic plans; recorded here so a draft decision is not read as settled                                                                                                                                                                                                     |
| **U-9**  | Whether `org:relationships:write`, `profile:timeline:write` and `employee:departure:record` are seeded into the permission catalog. The source states this is a **product and Access Control decision, not a test decision**                                   | Product + Access Control                                                    | [Security contract](#nfr-measurement-contracts--security)                                                                                                                                                                                                                |
| **U-10** | Browser support beyond Chromium                                                                                                                                                                                                                                | Product Owner                                                               | `P3-PLAT-01`, [Not in scope — frontend](#not-in-scope--frontend)                                                                                                                                                                                                         |
| **U-11** | Frontend performance budgets, frontend accessibility requirements, photo-upload size limits                                                                                                                                                                    | Product Owner                                                               | [Unknown thresholds](#unknown-thresholds), `P2-PLAT-01`                                                                                                                                                                                                                  |
| **U-12** | **Resolved by DEV (2026-09-11)** — co-located `*.test.ts` / `*.test.tsx` next to the file under test; a second config, `vitest.config.ts`, separate from `vitest.contract.config.ts` and `playwright.config.ts`; `@testing-library/react` + `@testing-library/jest-dom` + `@testing-library/user-event`. Backend keeps its existing co-located `*.spec.ts` under `src/`. Authority is `services/frontend` branch `feat/u-12-unit-component-testing` (`60bc882`), proven by two passing specs; **not yet merged to `main`** | DEV                                                                         | [Frontend execution](#frontend) — was a prerequisite for **all** frontend net-new work; unblocked once the branch merges                                                                                                                                                |
| **U-13** | Whether the application should proactively log out on a timer or `visibilitychange`                                                                                                                                                                            | Product                                                                     | [Not in scope — frontend](#not-in-scope--frontend)                                                                                                                                                                                                                       |
| **U-16** | Whether `platform/epics.md` Story 1.6 is satisfied, partially satisfied, or made obsolete                                                                                                                                                                      | Platform epic owner                                                         | Story 1.6 artifact references                                                                                                                                                                                                                                            |
| **U-17** | For the six blockers now closed at design, what closes them at **implementation**; and what closes the **six** register entries that remain open (corrected 2026-09-11 — was "five"; `test-design-architecture.md` § Dependencies names them). **Partially re-verified, not resolved**: `CC-07` and `CC-05` were re-checked against the actual baseline commit — both were **partial**, not "absent" as previously recorded; see `test-design-architecture.md` § Open blockers and § Ratified design decisions for the corrected rows and named remaining gaps | Architect + the per-entry owners                                            | `DG-02`, the coverage plan's blocked rows                                                                                                                                                                                                                                |
| **U-18** | **Resolved 2026-09-11** — the document's owner (Architect) edited both `:84` and `:117–119` to match the authority named by ruling D-1 (lines 25–38); no reading of `docs/architecture/testing-strategy.md` now states a per-stage human-approval requirement | Owner of `docs/architecture/testing-strategy.md` (Architect) | `DG-01` |
| **U-19** *(resolved 2026-09-11)* | **Resolved** — 14 of 119 `TR-*` rows receive partial evidence from the 101 scenario files (none full coverage); 105 receive none. Matched via each file's own `**Trace:**` §-citation, never guessed from filenames. **Does not affect `PG-01`** (governed by U-20 alone) | Access Control owners + QA                                                  | [§ U-19 normative coverage — scenario file mapping](#u-19-normative-coverage--scenario-file-mapping-resolved-2026-09-11), immediately after the [Normative coverage map](#normative-coverage-map)                                                                                                                                  |
| **U-20** | **Resolved with authority** — schedulable when `SEC-AUTH-01`, `CC-07`, `AC-S9-S13` and `AC-SECTION-MATRIX-01` are all closed at implementation; evaluated by Platform epic owner + Architect against the blocker register and a current re-verification record | Platform epic owner + Architect                                             | `[PG-01](#release-and-design-gates)`                                                                                                                                                                                                                                     |
| **U-21** | Whether the 20 history-only retired scenario files should remain on disk                                                                                                                                                                                       | Owner of `docs/test-cases/user-management/`**                               | Out of scope for this migration, which modifies no scenario file                                                                                                                                                                                                         |
| **U-22** | What covers the "`useAuth().userId` / `decodeJwtSub` output is unverified" gap                                                                                                                                                                                 | DEV + QA                                                                    | Frontend obligations                                                                                                                                                                                                                                                     |
| **U-23** | **Resolved 2026-09-11** — implemented-test inventory re-counted; authority is jest/playwright configs at gitlinks `3bc801a…` / `fa3d319…`                                                                                                                      | QA                                                                          | [Implemented-test inventory](#implemented-test-inventory--verified-u-23-resolved-2026-09-11). Backend e2e **506** cases (488 executable + 18 `it.todo`); unit **50**; contract **18** pact interactions; frontend Playwright **124**. Supersedes 340 / 406 / "43 files". |
| **U-24** | **Resolved with authority** — `DIRA1-MVP-v1` via `npm run measure:user-management:dira1` (`docs/architecture/testing-strategy.md` § DIR-A1)                                                                                                                    | Platform/DevOps + QA                                                        | `PG-04`, [contract A](#contract-a--all-employees-httplist-route)                                                                                                                                                                                                         |
| **U-25** | **Resolved with authority** — `QUALITY-GATE-AC-NFR` governs contract **B** (ACM-9 facade) only; contract **A** / the All Employees list uses release gate `PG-04`. `PMC-E1-S1.9` cites `PG-04` for directory-list evidence                                     | Access Control + Quality Engineering + the platform-capabilities epic owner | `PG-04`, [contract A](#contract-a--all-employees-httplist-route), `QUALITY-GATE-AC-NFR` (contract **B** only)                                                                                                                                                            |

---



## Obligation trace

**Every row of** `test-design/migration-map.md` **whose** `target_path_and_anchor` **names this document,
and where it resolved.** The list was extracted **mechanically from the ledger**, not by reading the
superseded documents, under a parser that independently reproduces the ledger's own certified totals
(565 rows; 328 `preserve` / 90 `merge` / 96 `replace` / 51 `retire`; every row exactly eight cells).

**Machine-counted at the moment this section was written:**

- **284 obligations** name this file — **265** whose target cell names it directly, plus **19**
whose target cell is a bare `same` or `same pattern` and resolves upward to the row above it
(5 in ledger §4.3d, 8 in §9, and **6** in §4.2 whose resolved target names both
`test-design-architecture.md` § Risk register and "evidence in `test-design-qa.md` § Risk →
evidence map"). **A naive filename grep drops all 19.**
- Distribution: **196** `preserve` **· 46** `merge` **· 42** `replace`. **0** `retire` — no retired
obligation is routed here.
- **13 further rows** target the **QA improvement backlog** without naming a file. The ledger
locates that backlog in this document (§4.3a resolves it explicitly as
"QA improvement backlog (`test-design-qa.md` § QA improvement backlog)"), so they resolve here
too. **Total landing in this document: 297.**

> **Corrected 2026-09-10 (migration Task 3d), and recorded rather than silently overwritten.**
> This block first read "282 … plus **17** … 4 in §4.2 … **194** `preserve` … **295**". The §4.2
> figure was wrong: **six** rows there carry a bare `same pattern` target — `plat:PR-002`,
> `PR-003`, `PR-004`, `PR-005`, `PR-007`, `PR-008` — not four. All six are `preserve`, so the
> upward-resolving total is **19**, the direct-plus-resolved total is **284**, `preserve` is
> **196**, and the total landing here is **297**. Re-parsed from the ledger at the moment this
> correction was written; the **265** direct figure and the `46`/`42` splits were re-derived
> unchanged. This is the defect class the ledger's own banner warns about: **a mechanical count is
> not automatically a true count.**

**Grouped by ledger section and destination anchor.** The largest groups resolve **individually**
rather than in bulk: the 119 `TR-*` rows are the 119 rows of the
[normative coverage map](#normative-coverage-map), the 23 planning rows are the 23 rows of the
[coverage plan](#coverage-plan), and the 13 gate rows are the ten individual `DG-01..04` /
`PG-01..06` entries plus the section row, the handoff gate-threshold merge and the `allow_gate`
boundary note in [Release and design gates](#release-and-design-gates).


| Ledger §                                                                            | Rows | Dispositions                      | Resolved in this document                                      |
| ----------------------------------------------------------------------------------- | ---- | --------------------------------- | -------------------------------------------------------------- |
| 3.1 S1                                                                              | 1    | 1 merge                           | § Execution strategy (B-03) + retire (B-04)                    |
| 3.1 S1                                                                              | 3    | 2 preserve · 1 replace            | § NFR measurement contracts                                    |
| 3.10 S15                                                                            | 1    | 1 merge                           | § Level strategy                                               |
| 3.2 S2                                                                              | 1    | 1 merge                           | § Coverage ownership                                           |
| 3.2 S2                                                                              | 1    | 1 merge                           | § Cross-epic regression map                                    |
| 3.2 S2                                                                              | 1    | 1 replace                         | § Effort                                                       |
| 3.2 S2                                                                              | 1    | 1 replace                         | § Entry criteria                                               |
| 3.2 S2                                                                              | 1    | 1 replace                         | § Execution strategy                                           |
| 3.2 S2                                                                              | 1    | 1 replace                         | § Executive summary                                            |
| 3.2 S2                                                                              | 1    | 1 merge                           | § Exit criteria                                                |
| 3.2 S2                                                                              | 1    | 1 replace                         | § NFR measurement contracts                                    |
| 3.2 S2                                                                              | 1    | 1 merge                           | § Not in scope                                                 |
| 3.2 S2                                                                              | 1    | 1 merge                           | § Risk                                                         |
| 3.2 S2                                                                              | 1    | 1 merge                           | § Test infrastructure                                          |
| 3.2 S2                                                                              | 1    | 1 preserve                        | § `test-design-qa.md` § Appendix — fixture pattern             |
| 3.2 S2                                                                              | 1    | 1 preserve                        | § `test-design-qa.md` § Appendix — knowledge base              |
| 3.2 S2                                                                              | 1    | 1 preserve                        | § `test-design-qa.md` § Appendix — tags                        |
| 3.2 S2                                                                              | 1    | 1 replace                         | § header (platform scope)                                      |
| 3.2 S2                                                                              | 1    | 1 preserve                        | § source-to-successor map                                      |
| 3.3 S3                                                                              | 1    | 1 replace                         | § Access-control dependency                                    |
| 3.3 S3                                                                              | 1    | 1 merge                           | § NFR measurement contracts                                    |
| 3.4 S4                                                                              | 1    | 1 merge                           | § Coverage plan                                                |
| 3.4 S4                                                                              | 1    | 1 preserve                        | § Coverage-state vocabulary                                    |
| 3.4 S4                                                                              | 1    | 1 merge                           | § Cross-epic regression map                                    |
| 3.4 S4                                                                              | 1    | 1 replace                         | § Effort                                                       |
| 3.4 S4                                                                              | 1    | 1 replace                         | § Entry criteria                                               |
| 3.4 S4                                                                              | 1    | 1 preserve                        | § Execution dependencies                                       |
| 3.4 S4                                                                              | 1    | 1 merge                           | § Execution strategy                                           |
| 3.4 S4                                                                              | 1    | 1 preserve                        | § Exit criteria                                                |
| 3.4 S4                                                                              | 1    | 1 merge                           | § NFR measurement contracts                                    |
| 3.4 S4                                                                              | 3    | 3 preserve                        | § Normative coverage map                                       |
| 3.4 S4                                                                              | 1    | 1 preserve                        | § Not in scope                                                 |
| 3.4 S4                                                                              | 1    | 1 replace                         | § Planning volume                                              |
| 3.4 S4                                                                              | 1    | 1 preserve                        | § Release and design gates                                     |
| 3.4 S4                                                                              | 1    | 1 merge                           | § Risk                                                         |
| 3.4 S4                                                                              | 1    | 1 preserve                        | § Unknown thresholds                                           |
| 3.4 S4                                                                              | 1    | 1 merge                           | § `test-design-qa.md` § Appendix — fixture pattern             |
| 3.4 S4                                                                              | 1    | 1 merge                           | § `test-design-qa.md` § Appendix — knowledge base              |
| 3.4 S4                                                                              | 1    | 1 merge                           | § header                                                       |
| 3.5 S5                                                                              | 1    | 1 merge                           | § Execution strategy                                           |
| 3.5 S5                                                                              | 2    | 2 preserve                        | § Level strategy                                               |
| 3.5 S5                                                                              | 1    | 1 preserve                        | § Level strategy (shared) + owning epic plans                  |
| 3.5 S5                                                                              | 1    | 1 merge                           | § NFR measurement contracts                                    |
| 3.6 S6                                                                              | 1    | 1 merge                           | § Execution strategy (frontend)                                |
| 3.6 S6                                                                              | 1    | 1 merge                           | § Level strategy                                               |
| 3.6 S6                                                                              | 1    | 1 preserve                        | § Level strategy (frontend section)                            |
| 3.6 S6                                                                              | 1    | 1 merge                           | § Level strategy (frontend)                                    |
| 3.6 S6                                                                              | 1    | 1 merge                           | § NFR measurement contracts (frontend)                         |
| 3.6 S6                                                                              | 1    | 1 merge                           | § Not in scope (frontend) + owning epic plans                  |
| 3.9 S13–S14                                                                         | 1    | 1 merge                           | § Coverage-state vocabulary                                    |
| 3.9 S13–S14                                                                         | 1    | 1 merge                           | § Frontend section                                             |
| 3.9 S13–S14                                                                         | 1    | 1 merge                           | § Release and design gates                                     |
| 3.9 S13–S14                                                                         | 2    | 2 merge                           | § Risk                                                         |
| 4.1 `legacy-um` risks                                                               | 1    | 1 merge                           | § Execution strategy (backend isolation)                       |
| 4.1 `legacy-um` risks                                                               | 1    | 1 merge                           | § Privacy (merges with `plat:PR-010`                           |
| 4.2 `plat` risks                                                                    | 5    | 5 preserve                        | § Risk register `PR-001`                                       |
| 4.3c `legacy-um` test IDs                                                           | 1    | 1 merge                           | § Access-boundary evidence (platform)                          |
| 4.3a `um-epic` risks                                                                | 1    | 1 merge                           | § Execution strategy (backend isolation)                       |
| 4.3c `legacy-um` test IDs                                                           | 1    | 1 merge                           | § Privacy                                                      |
| 4.3c `legacy-um` test IDs                                                           | 1    | 1 merge                           | § Process/trace evidence                                       |
| 4.3a `um-epic` risks                                                                | 1    | 1 merge                           | § QA improvement backlog)                                      |
| 4.3d Source-to-successor scenario map (`legacy-um:S2#mapping-existing-to-proposed`) | 6    | 6 preserve                        | § Source-to-successor map + this ledger §4.3c                  |
| 4.3a `um-epic` risks                                                                | 1    | 1 merge                           | § Testability gaps + `test-design-qa.md` § Level strategy      |
| 4.3c `legacy-um` test IDs                                                           | 1    | 1 replace                         | § `test-design-qa.md` § NFR measurement contracts — All Employ |
| 4.4 Frontend scope                                                                  | 1    | 1 merge                           | § Level strategy                                               |
| 5.1 Execution constraints                                                           | 1    | 1 preserve                        | § Release and design gates                                     |
| 5.1 Execution constraints                                                           | 2    | 2 preserve                        | § `test-design-qa.md` § Appendix — fixture pattern             |
| 5.1 Execution constraints                                                           | 1    | 1 preserve                        | § `test-design-qa.md` § Execution strategy — backend           |
| 5.1 Execution constraints                                                           | 2    | 2 preserve                        | § `test-design-qa.md` § Execution strategy — backend isolation |
| 5.1 Execution constraints                                                           | 1    | 1 preserve                        | § `test-design-qa.md` § Execution strategy — backend, marked ` |
| 5.1 Execution constraints                                                           | 1    | 1 preserve                        | § `test-design-qa.md` § Execution strategy — frontend          |
| 5.1 Execution constraints                                                           | 1    | 1 preserve                        | § `test-design-qa.md` § Execution strategy — frontend, marked  |
| 5.1 Execution constraints                                                           | 1    | 1 replace                         | § `test-design-qa.md` § Execution strategy — nightly           |
| 5.1 Execution constraints                                                           | 1    | 1 preserve                        | § `test-design-qa.md` § Execution strategy — philosophy        |
| 5.1 Execution constraints                                                           | 2    | 2 preserve                        | § `test-design-qa.md` § Execution strategy — weekly/pre-releas |
| 5.4 `legacy-um` decision identifiers → binding decision log                         | 1    | 1 preserve                        | § Level strategy                                               |
| 5.4 `legacy-um` decision identifiers → binding decision log                         | 1    | 1 preserve                        | § Persona and denial-actor conventions                         |
| 5.4 `legacy-um` decision identifiers → binding decision log                         | 1    | 1 preserve                        | § Process/trace evidence (via `TD-UM-DOC-01`)                  |
| 5.5 `legacy-um` coverage gaps `G-01`..`G-16`                                        | 1    | 1 merge                           | § `test-design-qa.md` § Execution strategy — concurrency cover |
| 5.7 `plat` planning rows `P0–P3-PLAT` (23 rows)                                     | 7    | 6 preserve · 1 replace            | § Coverage plan P0                                             |
| 5.7 `plat` planning rows `P0–P3-PLAT` (23 rows)                                     | 7    | 7 preserve                        | § Coverage plan P1                                             |
| 5.7 `plat` planning rows `P0–P3-PLAT` (23 rows)                                     | 3    | 3 preserve                        | § Coverage plan P2                                             |
| 5.7 `plat` planning rows `P0–P3-PLAT` (23 rows)                                     | 3    | 1 merge · 2 preserve              | § Coverage plan P3                                             |
| 5.7 `plat` planning rows `P0–P3-PLAT` (23 rows)                                     | 1    | 1 merge                           | § NFR measurement contracts + Coverage plan P0                 |
| 5.7 `plat` planning rows `P0–P3-PLAT` (23 rows)                                     | 1    | 1 merge                           | § Privacy                                                      |
| 5.7 `plat` planning rows `P0–P3-PLAT` (23 rows)                                     | 1    | 1 merge                           | § Process/trace evidence                                       |
| 5.8 `plat` release and design gates (`DG-01..05`, `PG-01..06`)                      | 10   | 8 preserve · 2 replace            | § Release and design gates                                     |
| 7.1 Threshold ledger                                                                | 1    | 1 preserve                        | § Level strategy                                               |
| 7.1 Threshold ledger                                                                | 4    | 4 preserve                        | § Unknown thresholds                                           |
| 7.1 Threshold ledger                                                                | 2    | 2 preserve                        | § `test-design-qa.md` § NFR measurement contracts — **separate |
| 7.1 Threshold ledger                                                                | 1    | 1 preserve                        | § `test-design-qa.md` § NFR measurement contracts — All Employ |
| 7.1 Threshold ledger                                                                | 1    | 1 preserve                        | § `test-design-qa.md` § NFR measurement contracts — Deployment |
| 7.1 Threshold ledger                                                                | 1    | 1 merge                           | § `test-design-qa.md` § NFR measurement contracts — Privacy    |
| 7.1 Threshold ledger                                                                | 1    | 1 replace                         | § `test-design-qa.md` § NFR measurement contracts — Process    |
| 7.1 Threshold ledger                                                                | 1    | 1 replace                         | § `test-design-qa.md` § NFR measurement contracts — Reliabilit |
| 7.1 Threshold ledger                                                                | 1    | 1 preserve                        | § `test-design-qa.md` § NFR measurement contracts — Revocation |
| 7.1 Threshold ledger                                                                | 1    | 1 preserve                        | § `test-design-qa.md` § NFR measurement contracts — Security   |
| 7.1 Threshold ledger                                                                | 1    | 1 preserve                        | § `test-design-qa.md` § NFR measurement contracts — configurat |
| 7.2 Assessment boundary (preserved from three sources)                              | 1    | 1 merge                           | § NFR measurement contracts                                    |
| 8. Estimates                                                                        | 1    | 1 preserve                        | § Effort                                                       |
| 8. Estimates                                                                        | 1    | 1 preserve                        | § Level strategy                                               |
| 8. Estimates                                                                        | 1    | 1 preserve                        | § `test-design-qa.md` § Effort — platform planning interval    |
| 9. Cross-epic regression triggers                                                   | 13   | 1 merge · 11 preserve · 1 replace | § Cross-epic regression map                                    |
| 9. Cross-epic regression triggers                                                   | 1    | 1 preserve                        | § `test-design-qa.md` § Cross-epic regression map — controllab |
| Task 2 outcome (D-1)                                                                | 119  | 96 preserve · 23 replace          | § Normative coverage map                                       |




**Checked against the ledger's 51** `retire` **rows. No retired obligation appears in this document as
an active one.** The retirements most likely to have been re-copied are stated **as retirements**,
with their authority:


| Retired                                                                                                    | Where it is stated as retired here                                           | Authority                                                                                   |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `DG-05` — child-ownership gate                                                                             | [Design gates](#design-gates)                                                | The child/platform split is dissolved; the "approved UM" set becomes `ungranted` epic plans |
| `legacy-um:B-04` — scoped reliability gate                                                                 | [Backend isolation](#backend-isolation)                                      | Depends on a registration transaction PM/AD-16 and PM/AD-21 removed; DEC-UM-008 RETIRED     |
| `legacy-um:G-16` — implement the CI isolation progression                                                  | [Backend isolation](#backend-isolation)                                      | DEC-UM-010 is binding and `--runInBand` is current behaviour                                |
| `legacy-um:C-02` — Story 1.1 must map all nine registration scenarios                                      | [Process/trace evidence](#processtrace-evidence)                             | Planning drift, not a product decision; Story 1.1's subject changed                         |
| `legacy-um:R-003`, `R-004`, `R-013`                                                                        | [Risk → evidence map](#risk--evidence-map)                                   | DEC-UM-004 and DEC-UM-005 exist and are binding; PM/AD-16 removes employee creation         |
| The `legacy-um` ~57-scenario estimate and its per-priority breakdown; "replaces/extends existing 28 files" | [Effort](#effort)                                                            | Counts proposed scenarios for a retired design; stale count                                 |
| The `k6` nightly performance subject                                                                       | [Nightly](#nightly), [contract A](#contract-a--all-employees-httplist-route) | No binding document selects a harness — the harness is **UNDECIDED**                        |
| The "approval required before modifying `docs/test-cases/user-management/**`" footer                       | Not present anywhere in this document                                        | Ruling D-1; stage approval was removed on 2026-09-04                                        |
| The per-file approval rationale for `PG-01`, and `DG-01`'s per-stage approval clause                       | [Release gates](#release-gates), [Design gates](#design-gates)               | Ruling D-1                                                                                  |
| The `legacy-um` P0-ratio rationale ("~14 % because one plan spans four epics")                             | [Coverage ownership](#coverage-ownership)                                    | The per-epic split changes the denominator                                                  |
| The superseded "~10–15 minutes per PR" budget                                                              | [Philosophy](#philosophy)                                                    | Contradicted by newer measured observations, themselves `unverified`                        |


**Obligations this document deliberately does *not* carry, because they belong elsewhere:** the
per-ID `TD-UM-*` coverage rows (owning epic plans), the epic-local risks `R-UM-*` and `R-FE-*`
(epic plans), the risk register itself (`test-design-architecture.md`), the phase-transition gates
and the level-strategy handoff (`test-design/people-management-handoff.md`), and the scope index
(`test-design/README.md`). Those destinations are written by the other parts of this migration.

---

**What this document does not do.** It grants no approval, records no validation verdict, claims no
coverage, asserts no pass rate, computes no coverage percentage, and resolves no open product
decision. It changes no requirement, no scenario file, no trace or coverage artifact, no sprint
status, no service file and no gitlink. It proposes no promotion of the informational ACM-9 CI job.

**Companion documents.** `test-design-architecture.md` (platform testability and risk baseline) ·
`test-design/README.md` (the current-artifact index) · `test-design/migration-map.md` (the
disposition ledger this document was written from).
