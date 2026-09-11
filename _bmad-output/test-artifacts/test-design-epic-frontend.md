---
workflowStatus: 'complete'
totalSteps: 5
stepsCompleted: ['step-01-detect-mode','step-02-load-context','step-03-risk-and-testability','step-04-coverage-plan','step-05-generate-output']
lastStep: 'step-05-generate-output'
nextStep: ''
lastSaved: '2026-09-06'
runKey: 'frontend'
mode: 'epic-level'
designLevel: 'full'
testStackType: 'frontend'
---

# Test Design: frontend

**Date:** 2026-09-06
**Author:** Master Test Architect (TEA)
**Status:** Draft — needs human approval before it drives any story

---

## Executive Summary

**Scope:** full test design for the React/Vite frontend — 57 requirements (`FE-*`) across seven flows. Like `user-management`, this area has never had a test design; it has 124 Playwright cases and nothing else.

**The finding this design exists to fix.** The frontend has exactly one test level:

| Level | Cases | Share |
| --- | --- | --- |
| E2E (Playwright, API mocked at the network layer) | 124 | 100% |
| Component | 0 | 0% |
| Unit | 0 | 0% |

Behind those 124 cases sit **29 pages, 13 feature components, 21 API hooks, 2 utility hooks and 5 pure-logic modules** — none of which can be exercised except by starting Vite and driving a browser.

Two consequences, both observed rather than predicted:

1. **Pure logic is untested.** `lib/session.ts` exports `decodeJwtSub` and `isJwtExpired` — JWT parsing that decides whether a viewer is authenticated. `deferred-work.md` already records that "`useAuth().userId` / `decodeJwtSub` output is unverified — no G1 component reads it." That has been an open note for weeks. It is a five-line unit test.
2. **The mocks are the oracle.** Every one of the 124 cases asserts the UI against a hand-written fixture, so a fixture that is wrong is invisible. The contract suite landed on 2026-09-06 and immediately found the class of drift this hides: the real backend returns `null` for `photo`, `city`, `workPhone`, `birthDay` and `birthMonth`, while every Playwright fixture populates them. **No frontend test has ever rendered a null-valued identity card.**

**The tooling gate is already open.** Vitest was added to this repository on 2026-09-06 for the contract suite, with jsdom configured. Unit and component testing needs one more dependency (`@testing-library/react`) and a second vitest config — not a platform decision.

**Risk summary**

- Risks identified: 7
- High priority (score ≥6): 3
- Critical categories: SEC (unverified session parsing), BUS (error-copy branches), TECH (mock drift)

**Coverage summary (net new work only)**

| Bucket | Cases | Rough effort |
| --- | --- | --- |
| P0 | 36 | ~3–4 days |
| P1 | 35 | ~3–5 days |
| P2 | 14 | ~1–2 days |
| **Total** | **85** (45 unit + 40 component) | **~7–11 days** |

Planning range, not a commitment — this repository has no velocity history to calibrate against.

---

## Not in Scope

| Item | Reasoning | Mitigation |
| --- | --- | --- |
| **Rewriting the 124 Playwright cases** | They encode approved `FE-*` scenarios and every one passes. | New logic lands at the right level; existing cases move only when their file changes anyway. |
| **`components/ui/**` (14 shadcn primitives)** | Vendored, upstream-tested. Testing them tests someone else's library. | Excluded by convention; the 13 feature components are in scope. |
| **Visual regression** | No baseline infrastructure and no stated requirement. | Recorded as a possible P3; not planned here. |
| **Cross-browser** | Playwright runs chromium only; no requirement names another. | Flag for the product owner rather than assume. |
| **Contract shape assertions** | Owned by `contract/` as of 2026-09-06. | Referenced in the level strategy; not duplicated. |

---

## Risk Assessment

### High-Priority Risks (Score ≥6)

| Risk ID | Category | Description | Prob | Impact | Score | Mitigation | Owner |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **R-FE-01** | SEC | `decodeJwtSub` and `isJwtExpired` decide who is logged in and as whom. Both are pure functions with no test at any level. A malformed, unsigned or clock-skewed token has never been exercised. Already flagged in `deferred-work.md` and still open. | 3 | 3 | 9 | Unit tests over `lib/session.ts`: malformed token, missing `sub`, absent `exp`, expired, boundary-second, non-JSON payload, storage throwing. | DEV |
| **R-FE-02** | TECH | The 124 e2e cases mock the API, so their fixtures are the only definition of what the backend sends. Fixture drift is invisible: contract verification found the backend returns nulls that no fixture ever produces. | 3 | 3 | 9 | Component-level rendering tests for every nullable field; keep the contract suite as the fixture-vs-reality check. | DEV + QA |
| **R-FE-03** | BUS | `lib/http.ts` (`httpStatus`, `errorCode`, `errorBody`) drives which error copy the user sees. Error branches are the most numerous and least-exercised paths in the app, reachable at e2e only by mocking a specific failure per case. | 3 | 2 | 6 | Unit tests over the extractors; component tests for the panels that consume them. | DEV |

### Medium-Priority Risks (Score 3–4)

| Risk ID | Category | Description | Prob | Impact | Score | Mitigation | Owner |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **R-FE-04** | TECH | Every check needs a browser + Vite. The whole suite is 19s, which is good — but there is no sub-second loop, so small refactors are verified by running everything or by eye. | 3 | 1 | 3 | The unit/component tier below gives a watch loop. | DEV |
| **R-FE-05** | BUS | `PersonPicker` can only see the first page of the directory and filters client-side — a known, recorded limitation. Its behaviour past the boundary is untested. | 2 | 2 | 4 | Component tests at the page boundary; the real fix is backend typeahead (platform §4.1). | DEV |
| **R-FE-06** | TECH | No proactive session-expiry handling: `AuthContext` evaluates `isJwtExpired` only at mount, and the 401 interceptor is the only net. Recorded in `deferred-work.md`. | 2 | 2 | 4 | Unit-test the predicate now; the timer/`visibilitychange` behaviour is a product decision. | DEV |

### Low-Priority Risks (Score 1–2)

| Risk ID | Category | Description | Score | Action |
| --- | --- | --- | --- | --- |
| **R-FE-07** | OPS | No per-route `document.title` on the standalone auth pages. | 2 | Recorded in `deferred-work.md`. Monitor. |

---

## NFR Planning

| NFR | Requirement / Threshold | Risk Link | Planned Validation | Evidence |
| --- | --- | --- | --- | --- |
| Security | A malformed or expired token never yields an authenticated shell | R-FE-01 | Unit over `lib/session.ts`; existing `fe-auth-*` e2e for the redirect | Vitest report; Playwright |
| Reliability | Every documented API failure renders its own copy, never a blank screen | R-FE-03 | Unit over `lib/http.ts` + component tests per error panel | Vitest report |
| Compatibility | Chromium only today | — | No new validation; the gap is named, not filled | — |
| Performance | No stated budget for bundle size, LCP or interaction latency | — | None planned | — |
| Accessibility | No stated requirement anywhere in `docs/` | — | None planned | — |

**Unknown thresholds:** performance and accessibility have no stated requirement in this repository. Not invented here — both are flagged for the product owner. Their absence is a planning gap, not a passing grade.

---

## Level Strategy — the core of this design

### Decision rule for this context

| Situation | Level | Why |
| --- | --- | --- |
| A pure function — formatting, parsing, predicates, extractors | **Unit** | No DOM makes the assertion truer |
| One component's rendering across its state space, including null / empty / error | **Component** (vitest + Testing Library, jsdom) | Where the null-rendering gap actually lives |
| A hook's state machine in isolation | **Component** | 21 API hooks, none directly tested |
| A user journey across routes, guards and caching | **E2E** (Playwright) | Genuinely end-to-end; what the 124 do well |
| The shape of a request or response | **Contract** (Pact) | Landed 2026-09-06 |

### Concrete targets

**Unit — `src/lib/` (5 modules, 0 tests today)**

| Module | Exports | Est. cases | Priority |
| --- | --- | --- | --- |
| `session.ts` | `decodeJwtSub`, `isJwtExpired`, read/write/clear | 12 | P0 |
| `http.ts` | `httpStatus`, `errorCode`, `errorBody` | 9 | P0 |
| `employeeFormatters.ts` | `getInitials`, `formatBirthday`, `formatIsoDate`, `fullName` | 12 | P1 |
| `datetime.ts` | `formatTimestamp`, `todayIsoDate` | 6 | P1 |
| `hooks/useDebounce`, `useLocalStorage` | — | 6 | P2 |

**Component — the 13 feature components**

| Component | Why it earns a component test | Est. | Priority |
| --- | --- | --- | --- |
| `StatePanel` | The shared loading / empty / error surface. Every flow renders it; nothing tests it directly. | 6 | P0 |
| `RequireAuth` | The route guard. Only covered incidentally through full journeys. | 4 | P0 |
| `PersonPicker` | Search, pagination boundary, empty result — R-FE-05. | 8 | P1 |
| `AccountMenu` | Sign-out path; session interaction. | 3 | P1 |
| `MainHeader` / `SideMenu` | Nav state and active-route rendering. | 5 | P2 |

**Component — identity-card rendering with nulls (R-FE-02).** One case per nullable field (`photo`, `city`, `workPhone`, `birthDay`, `birthMonth`), asserting the fallback rather than a crash or a literal `null`. **5 cases, P0** — this is the specific hole the contract run exposed.

### Target ratio

| | Today | After this design |
| --- | --- | --- |
| Unit | 0 | ~45 |
| Component | 0 | ~40 |
| E2E | 124 | 124 |
| Contract | 18 (shared) | 18 |

E2E stays flat. The point is not fewer journeys — it is that a formatter no longer needs a browser to be proven.

---

## Test Coverage Plan

### P0 (Critical)

| Requirement | Level | Risk | Count | Owner | Notes |
| --- | --- | --- | --- | --- | --- |
| JWT parsing and expiry predicate | Unit | R-FE-01 | 12 | DEV | Malformed, no `sub`, no `exp`, expired, boundary, non-JSON, storage throws |
| Error extractors over every documented failure body | Unit | R-FE-03 | 9 | DEV | Incl. the departure `409` shapes |
| Identity card renders every nullable field | Component | R-FE-02 | 5 | DEV | The gap contract verification exposed |
| `StatePanel` loading / empty / error | Component | — | 6 | DEV | |
| `RequireAuth` guard | Component | R-FE-01 | 4 | DEV | |

**Total P0 (new):** 36 cases, ~3–4 days.

### P1 (High)

| Requirement | Level | Risk | Count | Owner |
| --- | --- | --- | --- | --- |
| Employee formatters incl. partial birthdays and missing names | Unit | R-FE-02 | 12 | DEV |
| Timestamp / date-only formatting across zones | Unit | — | 6 | DEV |
| `PersonPicker` search, page boundary, empty | Component | R-FE-05 | 8 | DEV |
| `AccountMenu` sign-out | Component | — | 3 | DEV |
| Mutation hooks: optimistic token, `409` recovery | Component | — | 6 | DEV |

**Total P1 (new):** 35 cases, ~3–5 days.

### P2 (Medium)

| Requirement | Level | Count | Owner | Notes |
| --- | --- | --- | --- | --- |
| `useDebounce` / `useLocalStorage` | Unit | 6 | DEV | Incl. storage unavailable |
| `MainHeader` / `SideMenu` nav state | Component | 5 | DEV | |
| Import summary rendering: partial success is not an error | Component | 3 | DEV | Mirrors the contract's framing |

**Total P2:** 14 cases, ~1–2 days.

---

## Execution Strategy

**Philosophy:** run everything in PRs if the whole thing stays under 15 minutes; defer only what is genuinely expensive or long-running. The entire frontend suite is 19 seconds, so nothing functional has any business being deferred.

### PR (every pull request)

- Unit suite (`src/lib`, hooks) — target under 2s. This is the watch loop the project does not currently have.
- Component suite (vitest + Testing Library, jsdom) — target under 10s at ~31 cases.
- Playwright, all 124 cases — 19s today.
- Contract consumer run — ~2s.

Total under a minute. Nothing functional is deferred.

### Nightly

- Nothing yet. The candidates would be visual regression and cross-browser, and neither has a stated requirement or baseline infrastructure.

### Weekly

- Nothing. No performance or accessibility threshold exists to run against.

### Note on parallelization

Playwright parallelizes by file and comfortably carries hundreds of cases in 10–15 minutes; at 124 cases in 19 seconds this suite has roughly two orders of magnitude of headroom. Growth in e2e count is not what should worry this project — level selection is. `playwright.config.ts` already sets `retries: 2` in CI.

---

## Residual Risk

After this design is executed, what remains:

- **Mock drift is reduced, not eliminated.** Component tests still use fixtures. The contract suite is the only thing checking fixtures against reality, and it covers 14 endpoints, not all of them — the three deferred interactions in `contract/README.md` stay uncovered.
- **No accessibility or performance validation.** Both are absent because no requirement exists, not because they were assessed as unnecessary. That is a planning gap the product owner owns.
- **Chromium only.** Unchanged by this design.
- **R-FE-06 (proactive session expiry) is only partly closed.** The predicate gets tested; whether the app should log out on a timer stays a product decision.

---
## Entry Criteria

- [ ] This design approved by a human
- [ ] `@testing-library/react` added (vitest + jsdom already present from the contract suite)
- [ ] Second vitest config for unit/component, kept separate from `vitest.contract.config.ts` so the three suites never collect each other's files
- [ ] Convention agreed: co-located `*.test.tsx` beside the component, or a `test/` tree

## Exit Criteria

- [ ] Every P0 case written and passing
- [ ] `lib/session.ts` and `lib/http.ts` at 100% branch coverage — small, pure, security- and copy-critical
- [ ] Every nullable identity field has a rendering assertion
- [ ] No new Playwright case added for logic provable without a browser
- [ ] R-FE-01 closed; the `deferred-work.md` note about `decodeJwtSub` retired

---

## Handoff

`FE-*` requirement ids stay owned by the Playwright suite — that is what trace maps, and unit/component cases must not claim `FE-*` coverage they do not provide. Where a component test does prove an `FE-*` scenario end to end, it names the id in its title, matching frontend commit `cfbed35`. New unit cases assert internal rules and need no AD-1 scenario document.

Two `deferred-work.md` items are closed by this design rather than by new product work: the `decodeJwtSub` verification note and the 401-interceptor coverage note, both of which have been waiting for "the first component that reads it" since G1.
