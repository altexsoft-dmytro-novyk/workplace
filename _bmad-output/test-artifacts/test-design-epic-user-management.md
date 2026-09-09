---
workflowStatus: 'complete'
totalSteps: 5
stepsCompleted: ['step-01-detect-mode','step-02-load-context','step-03-risk-and-testability','step-04-coverage-plan','step-05-generate-output']
lastStep: 'step-05-generate-output'
nextStep: ''
lastSaved: '2026-09-06'
runKey: 'user-management'
mode: 'epic-level'
designLevel: 'full'
testStackType: 'backend'
---

# Test Design: user-management

**Date:** 2026-09-06
**Author:** Master Test Architect (TEA)
**Status:** Draft — needs human approval before it drives any story

---

## Executive Summary

**Scope:** full test design for the `user-management` bounded context — 96 requirements across Epics 0–6. This area has never had one. `test-design-architecture.md` and `test-design-qa.md` cover the system level, `*-platform.md` covers Access Control; the largest context in the repository has been running on scenario documents alone.

**The finding this design exists to fix.** Level selection has never been a decision here. It has been a default:

| Level | Mapped tests for these 96 requirements | Share |
| --- | --- | --- |
| E2E (Jest + supertest, real Postgres) | 340 | 98.6% |
| Unit | 5 | 1.4% |
| API / component | 0 | 0% |

The backend has **15 domain services and 3 spec files** in total (`audience-resolver.service.spec.ts`, `get-relationships.action.spec.ts`, `health.controller.spec.ts`). Everything else — every validation rule, every date computation, every state machine, every projection — is asserted by booting Nest, migrating PostgreSQL and issuing an HTTP request.

That is the anti-pattern `test-levels-framework.md` names first: *"E2E testing for business logic validation."* It is not a hypothetical cost. The full e2e suite is 90 seconds on a warm local machine with the database already up; a single logic branch cannot be exercised in under a second anywhere in this codebase.

**This design does not ask for more tests.** The 340 e2e cases encode approved AD-1 scenarios and stay. It asks that new logic land at the level that fits it, and it names the specific existing clusters where a lower level would pay for itself.

**Risk summary**

- Risks identified: 8
- High priority (score ≥6): 3
- Critical categories: TECH (feedback latency), SEC (permission keys that exist only in code), DATA (departure state machine)

**Coverage summary (net new work only)**

| Bucket | Cases | Rough effort |
| --- | --- | --- |
| P0 | 13 | ~2–3 days |
| P1 | 33 | ~4–6 days |
| P2 | 13 | ~2–3 days |
| **Total** | **59** (54 unit + 5 e2e) | **~8–12 days** |

Effort is scoped as "a developer already fluent in this codebase, writing at the level named." It is a planning range, not a commitment; no historical velocity data exists in this repository to calibrate against.

---

## Not in Scope

| Item | Reasoning | Mitigation |
| --- | --- | --- |
| **Rewriting the 340 existing e2e cases** | They encode human-approved AD-1 Stage-1 scenarios. The approval is the asset; the level is a sunk cost. | New logic lands at the right level. Existing cases move only when a file is being changed for another reason. |
| **The 5 `UM-CT-03/04/05/06/09` `it.todo` cases** | Blocked on the FR-permission-matrix grant, not on test design. | Tracked in `deferred-work.md`; this design assigns their level for when the grant lands. |
| **Mentorship** | No `src/` module exists. | Covered by `planning-artifacts/mentorship/`; its 26 requirements are out of this area. |
| **Access Control kernel internals** | Owned by `test-design-*-platform.md`. | This design covers only the adoption seam (`access-control-adoption`, 9 requirements). |
| **Load and soak testing** | ACM9 / P6 measurement harnesses already exist and are opt-in by design. | Referenced under NFR planning; not duplicated here. |

---

## Risk Assessment

### High-Priority Risks (Score ≥6)

| Risk ID | Category | Description | Prob | Impact | Score | Mitigation | Owner |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **R-UM-01** | TECH | Every logic change costs a full Nest boot + migrated database to verify. Feedback latency is the same for a one-line date fix as for a cross-context workflow, so developers batch changes and the blast radius of each run grows. | 3 | 3 | 9 | Extract the pure-logic clusters named in §Level Strategy to unit level. Target: any single domain rule verifiable in <1s. | DEV |
| **R-UM-02** | SEC | `org:relationships:write`, `profile:timeline:write` and `employee:departure:record` exist **only as string literals in action files**. `access-control-bootstrap.ts` seeds three keys, none of them these. Every e2e suite grants them through its own fixture, so the suites are green while no deployed user can perform any of these operations. | 3 | 3 | 9 | A test that asserts the seeded key set against the keys the code gates on. Level: unit — it is a comparison of two constants and needs no database. | DEV + Access Control |
| **R-UM-03** | DATA | The departure state machine (`scheduled → processing → retry_wait → applied`) plus lease tokens, idempotency keys and attempt counters is the most complex logic in the context, and every transition is asserted only through the worker over HTTP. Illegal transitions are provable only by constructing database state. | 2 | 3 | 6 | Unit-level state-transition table over the reducer. E2E keeps one happy path and the blocked-409 path. | DEV |

### Medium-Priority Risks (Score 3–4)

| Risk ID | Category | Description | Prob | Impact | Score | Mitigation | Owner |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **R-UM-04** | TECH | The e2e suites share one database. Isolation rests on per-run id namespacing and disciplined teardown; a suite that forgets it corrupts a neighbour. Observed during contract work: `GET /users` returns rows other suites own. | 3 | 2 | 6 | Keep list-shaped assertions filtered on a run-owned value. Documented in the contract README; should become a suite convention. | QA |
| **R-UM-05** | TECH | 18 `it.todo` cases carry unblock triggers in their titles but nothing fails when a trigger is met, so they are found only by reading. | 2 | 2 | 4 | Trace already surfaces them as `skipped`. Add the trigger to the gate's recommendations rather than a new test. | QA |
| **R-UM-06** | DATA | Nullable identity fields (`photo`, `city`, `workPhone`, `birthDay`, `birthMonth`) are never asserted null anywhere: the fixtures always populate them. The contract suite hit real nulls on its first provider run. | 3 | 1 | 3 | One unit-level projection test per nullable field. Cheap, and it is the exact class of bug e2e hides behind fixture defaults. | DEV |

### Low-Priority Risks (Score 1–2)

| Risk ID | Category | Description | Score | Action |
| --- | --- | --- | --- | --- |
| **R-UM-07** | OPS | `db:bootstrap:access-control` was deleted from `package.json` and nothing failed for weeks — the e2e job is `continue-on-error`, so its 37 red cases were never read. | 2 | Fixed 2026-09-06; the job stays informational only while mentorship is red. Monitor. |
| **R-UM-08** | TECH | E2E specs address `/users`; production serves `/api/v1/users`. The prefix and versioning config had no test until the contract suite. | 2 | Covered by the contract provider run. Monitor. |

---

## NFR Planning

| NFR | Requirement / Threshold | Risk Link | Planned Validation | Evidence |
| --- | --- | --- | --- | --- |
| Security | Every gated route rejects a viewer lacking the key; the seeded key set is a superset of the keys the code gates on | R-UM-02 | Unit assertion over `CANONICAL_PERMISSIONS` vs the action constants; existing e2e keeps the per-route denial cases | Unit report; `acm1r-fr-foundation` |
| Performance | NFR-2 — `GET /users` with 500+ rows and arbitrary filters inside budget | — | `UM-LIST-12` is already an e2e perf note; the real measurement is the opt-in ACM9 / P6 harness | `_bmad-output/test-artifacts/performance/*` |
| Reliability | Departure worker is idempotent under retry and partial failure | R-UM-03 | Unit state-transition table + the existing `apply-departure` e2e | Unit report; e2e |
| Maintainability | A domain rule is verifiable without a database | R-UM-01 | Level ratio tracked per release (below) | Jest summary per config |

**Unknown thresholds:** NFR-2's numeric budget is not stated anywhere this design can read. `UM-LIST-12` asserts "no per-row query", not a latency figure. Not invented here — flagged for the product owner.

---

## Level Strategy — the core of this design

### Decision rule for this context

| Situation | Level | Why |
| --- | --- | --- |
| A rule computable from its inputs — validation, date/timezone maths, projection, state transition, digest | **Unit** | No database can make the assertion truer, and it costs 90s to find out |
| A rule that IS the persistence — transactional atomicity, uniqueness, FK behaviour, same-transaction journal rows | **E2E (integration)** | The database is the thing under test |
| The shape of a request or response crossing to the frontend | **Contract (Pact)** | Landed 2026-09-06; 18 interactions over 14 endpoints |
| A denial oracle (401 / 403 / 404 five-clause) | **E2E**, one per route class | It composes guard, resolver and handler; unit-level would mock the answer |
| A full user workflow across contexts | **E2E**, sparingly | Genuinely end-to-end |

### Clusters that should move down (net new unit tests)

| Cluster | Where the logic lives | Now | Should be | Est. cases |
| --- | --- | --- | --- | --- |
| Departure state machine | `departure-worker.service.ts` transitions | e2e only | Unit table + 2 e2e | 11 |
| Departure due-time computation | `effectiveDate` + `effectiveTimeZone` → `dueAt` | e2e only | Unit | 8 |
| Blocker digest (`expectedBlockerVersion`) | `buildBlockedResponse` | e2e only | Unit | 4 |
| S1 card projection incl. every nullable field | `user-card.response.ts` | e2e only | Unit | 6 |
| Directory pagination arithmetic (`totalPages`) | list action | e2e only | Unit | 3 |
| Directory filter pruning + whitelist rejection | `list-users-query.dto.ts` | e2e only | Unit | 7 |
| Career-event ordering and `source` derivation | `career-timeline.service.ts` | e2e only | Unit | 5 |
| Import row parsing / skip taxonomy | `population-import.service.ts` `parseRow` | e2e only | Unit | 9 |
| Permission-key seed vs. gate-key set | bootstrap vs action constants | **nothing** | Unit | 1 |

**54 unit cases**, against 5 today. That is the rebalance. It removes nothing: it moves the *first* place a rule is proven, so e2e keeps the workflow and drops the job of proving arithmetic.

### Target ratio

Not a mandate — a tripwire. When the ratio drifts back, the design is being ignored:

| | Today | After this design | Direction |
| --- | --- | --- | --- |
| Unit | 5 | ~59 | ↑ |
| E2E | 340 | 340 | flat |
| Contract | 18 | 18 | flat |

---

## Test Coverage Plan

### P0 (Critical)

| Requirement | Level | Risk | Count | Owner | Notes |
| --- | --- | --- | --- | --- | --- |
| Seeded permission keys cover every gated action | Unit | R-UM-02 | 1 | DEV | Highest value/effort ratio in this document |
| Departure transitions: legal set, illegal set | Unit | R-UM-03 | 8 | DEV | Table-driven |
| Departure idempotency under repeated apply | Unit | R-UM-03 | 3 | DEV | E2E keeps one end-to-end proof |
| S1 projection never leaks a non-S1 column | Unit | — | 1 | DEV | Currently only asserted through HTTP |
| Denial oracle per route class (401/403/404) | E2E | — | existing | QA | No change |

**Total P0 (new):** 13 cases, ~2–3 days.

### P1 (High)

| Requirement | Level | Risk | Count | Owner | Notes |
| --- | --- | --- | --- | --- | --- |
| `dueAt` across DST and non-UTC zones | Unit | R-UM-03 | 8 | DEV | Currently untested at any level |
| Nullable S1 fields render as null, not omitted | Unit | R-UM-06 | 5 | DEV | Fixtures hide this today |
| Query-param pruning and unknown-key 400 | Unit | — | 7 | DEV | |
| Import row skip taxonomy | Unit | — | 9 | DEV | One case per skip reason |
| Blocker digest is stable and change-sensitive | Unit | R-UM-03 | 4 | DEV | Blocks the deferred contract interaction |

**Total P1 (new):** 33 cases, ~4–6 days.

### P2 (Medium)

| Requirement | Level | Count | Owner | Notes |
| --- | --- | --- | --- | --- |
| Career-event ordering and `source` derivation | Unit | 5 | DEV | |
| `UM-CT-03/04/05/06/09` when the grant lands | E2E | 5 | QA | Level already correct; blocked on product |
| Directory pagination boundary arithmetic | Unit | 3 | DEV | `totalPages` rounding |

**Total P2:** 13 cases, ~2–3 days.

---

## Execution Strategy

**Philosophy:** run everything in PRs if the whole thing stays under 15 minutes; defer only what is genuinely expensive or long-running. This estate is nowhere near that ceiling — the full backend e2e suite is 90 seconds — so there is no case for tiering functional tests out of the PR gate.

### PR (every pull request)

- Backend unit suite — today 0.4s, ~5s at the ~57 cases this design adds. Fast enough to also belong in the pre-commit / watch loop, which is the point of R-UM-01.
- Whole backend e2e suite — 43 files, 406 cases, 90s with `--runInBand`.
- Contract consumer + provider verification — ~50s including the provider boot.

Total well under 5 minutes. Nothing functional is deferred.

### Nightly

- ACM9 PostgreSQL measurement (`measure:access-control:acm9`) — opt-in by design, and its artifacts are currently older than the code they describe.
- P6 `resolve-audiences` measurement (`measure:access-control:p6`).

### Weekly

- Nothing yet. When a load or soak profile for NFR-2 exists it belongs here; today no numeric budget is stated, so there is nothing to run.

### Note on parallelization

The backend e2e suite runs `--runInBand` because the suites share one database and isolate by run-namespaced ids (R-UM-04). That is the constraint keeping it serial, not the framework. Schema-per-worker would unlock parallelism; it is not needed at 90 seconds and should not be built until it is.

---

## Residual Risk

After this design is executed, what remains:

- **R-UM-02 is only detected, not fixed.** The unit test proves the seeded key set is missing three keys the code gates on; seeding them is a product and Access Control decision, not a test one. Until it lands, the deployed system cannot perform those operations and the test will be red on purpose.
- **R-UM-04 persists.** Shared-database isolation stays a discipline, not a mechanism. Accepted at current suite size.
- **The 340 existing e2e cases stay at their level.** Feedback latency improves for new work only; changing a rule that is covered only by an old e2e case still costs a full run.
- **NFR-2 remains unquantified.** No test can close that; it needs a number from the product owner.

---
## Entry Criteria

- [ ] This design approved by a human (AD-1 applies to test design too)
- [ ] Postgres reachable (`npm run db:up`)
- [ ] Decision taken on where unit specs live: beside the source (`*.spec.ts` under `src/`, matching the 3 that exist) or under `test/unit/`

## Exit Criteria

- [ ] Every P0 case above written and passing
- [ ] Unit share of mapped tests for this area ≥ 15% (from 1.4%)
- [ ] No new e2e case added for logic that is computable from its inputs
- [ ] R-UM-02 closed — either the keys are seeded or the gap is an accepted, recorded decision

---

## Handoff

Trace consumes this design through `docs/test-cases/user-management/`. New unit cases are **not** AD-1 Stage-2 artifacts: they assert internal rules, not approved external scenarios, so they need no scenario document and must not claim requirement coverage they do not have. Where a unit case does prove a `UM-*` requirement, it names the id in its title, matching the convention backend commit `20ed2a0` established.
