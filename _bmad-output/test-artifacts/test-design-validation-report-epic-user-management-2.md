---
runScope: 'epic'
runKey: 'epic-user-management-2'
epicId: 'UM-E2'
epicDomain: 'user-management'
epicSourcePath: '_bmad-output/planning-artifacts/user-management/epics.md'
epicSourceHeading: '### Epic 2: Magic-Link Authentication'
epicNumber: 2
operation: 'Epic Validate'
verdict: 'PASS'
date: '2026-09-13'
runBaseline: '2ed944c32024eb8d5107a72d595ddc2e27209aeb'
independence: 'fresh independent Epic-Level validation; first validation of this scope'
---

# Epic Validation Report — UM-E2 Magic-Link Authentication

**Verdict: PASS.** The plan's backend and frontend coverage, risk ownership, and decision
handling are sound and traceable to primary sources. Three non-blocking findings are recorded
below; none overturns the design. This report grants no approval, asserts no executed runtime
coverage, issues no quality gate, and makes no release-readiness claim. Approval remains
**ungranted**.

## Identity and evaluated content

| Field | Value |
| --- | --- |
| Scope / run key | epic / `epic-user-management-2` |
| Canonical identity | `UM-E2` · user-management · number 2 |
| Source / heading | `_bmad-output/planning-artifacts/user-management/epics.md` · `### Epic 2: Magic-Link Authentication` |
| Plan | `_bmad-output/test-artifacts/test-design-epic-user-management-2.md` |
| Checkpoint | `_bmad-output/test-artifacts/test-design-progress-epic-user-management-2.md` |
| Report | `_bmad-output/test-artifacts/test-design-validation-report-epic-user-management-2.md` |
| Baseline before first write | `2ed944c32024eb8d5107a72d595ddc2e27209aeb` |

Identity metadata (`epicId`, `epicDomain`, `epicSourcePath`, `epicNumber`/`runKey`) agrees across
the plan, the checkpoint, and the index row. The checkpoint has `workflowStatus: 'generated'`,
all five Create steps complete, `lastStep: 'step-05-generate-output'`, and the canonical terminal
Resume prose required by contract §4.4.

### Pre-projection SHA-256 hashes

| Evaluated path | SHA-256 |
| --- | --- |
| `test-design-epic-user-management-2.md` | `45122abb66ef95e3f33ca97734bc70f4c3e4be6a1bacf01778f3ceeeab0d7219` |
| `test-design-progress-epic-user-management-2.md` | `8ef0d71669d02511ebe0ebcb53e4d973665d66fc4266e4661706918f81011f53` |
| `test-design-architecture.md` | `133efa612ad55b012fc8be9bc6a77d1d6f55e4bbdba99a8ee0404acccb648ec5` |
| `test-design-qa.md` | `3863906ad2cbe0d68bf34169905cf9517cb837a97fd8a00c3b165828e9319b7c` |
| `test-design/migration-map.md` | `0d224bdc0a64365a6bc2d476170c93b520f16f95b3134196baad1803300d62a6` |
| `test-design/README.md` | `9d67c94d5fc20958887c7cac9048bcab48c58c281820ed2673b0dc96b138553d` |
| `planning-artifacts/user-management/epics.md` | `101dc8b6b33a19bb734ea0be3c15a53e52a5831753012e6fcbe45b60958356f4` |
| `docs/architecture/user-management-test-decisions.md` | `e361c88b276591adb48295133304efe28f91bb1ea70e2efdd7b152ff2d7dbed3` |
| `docs/project-requirements.md` | `495017d0bc2f1c01ae5c7b1cdd6d4753f9c32410eb2ba1e2e3ca88003f4bf0d8` |
| `docs/architecture/testing-strategy.md` | `ffdf5b2c15838adeb8ad36d83baba7b0c51ad97ca634f6231e6c99a3785c6fac` |

Hashes describe the evaluated pre-projection content. Other worktree changes (trace JSON,
`traceability-matrix.md`, `docs/test-cases/access-control-foundation/**`, the `services/backend`
gitlink) were left untouched and are not evaluated here.

`epics.md`'s current hash differs from the one the plan's checkpoint recorded at Task 3
(`18c5fcbeb7b167325efac08bcba0f4277d979305c8b403f87302899b31377769`); `git diff 76a7220 HEAD --
_bmad-output/planning-artifacts/user-management/epics.md` shows the only changes are relative-link
path corrections and an added PRD-traceability table unrelated to Epic 1/2 content — Epic 2's
heading, stories, and acceptance criteria are unchanged from what the plan cites.

Primary sources also inspected: `services/frontend` (`src/lib/session.ts`,
`src/contexts/AuthContext.tsx`, `src/components/RequireAuth/RequireAuth.tsx`,
`src/components/MainHeader/components/AccountMenu/AccountMenu.tsx`, `e2e/flows/auth/`,
`vitest.config.ts`, `package.json`) at current `main` (`025dd7e`); `services/backend`
(`src/user-management/domain/services/magic-link.service.ts`,
`src/user-management/application/controllers/auth.controller.ts`) at the checked-out
`feat/conflict-um-01-hidden-target-404` (`7ab095a`); `_bmad-output/implementation-artifacts/user-management/sprint-status.yaml`;
`_bmad-output/implementation-artifacts/user-management/deferred-work.md`; and the retired
`test-design-epic-frontend.md` read at `76a7220` via `git show`. Their content was used as
evidence boundaries only; no runtime test ran.

## Findings

### Non-blocking

- **W-1 — U-12 status is stale.** The plan's Open Questions row (`test-design-epic-user-management-2.md:186`)
  and the identical row in the UM-E1 plan record U-12 as "resolved by DEV (2026-09-11) ...
  `services/frontend` branch `feat/u-12-unit-component-testing` (`60bc882`), **not yet merged**."
  `services/frontend` `main` is currently at `025dd7e` ("Merge pull request #4 from
  .../feat/u-12-unit-component-testing"), which has `60bc882` as an ancestor
  (`git merge-base --is-ancestor 60bc882 HEAD` → true, merged 2026-09-11T21:04:01+03:00). The
  current workspace `HEAD` (`2ed944c`) already records this commit as the `services/frontend`
  gitlink (`git ls-tree HEAD -- services/frontend` → `025dd7e`, and it does not appear in
  `git status` as a pending gitlink change, unlike `services/backend`). The tooling itself is
  narrow — the merge adds `vitest.config.ts`, `src/test/setup.ts`, the RTL devDependencies, and
  two example specs (`BrandMark.test.tsx`, `useDebounce.test.ts`) — **no test file exists yet**
  for `session.ts`, `RequireAuth`, or `AccountMenu`, so the plan's "coverage: none asserted" claim
  is still accurate. Only the "not yet merged" clause is stale.
- **W-2 — the U-22 gap citation is not re-verified against current frontend code.** The plan
  (`test-design-epic-user-management-2.md:115-117`) and its source ledger row
  (`test-design/migration-map.md:864`) keep U-22 open on the authority of
  `_bmad-output/implementation-artifacts/user-management/deferred-work.md:16-17`: "`useAuth().userId`
  / `decodeJwtSub` output is unverified — no G1 component reads it." Current code contradicts the
  second half of that sentence: `services/frontend/src/contexts/AuthContext.tsx:30-31,40-43`
  derives `userId` from `decodeJwtSub`, and
  `services/frontend/src/components/MainHeader/components/AccountMenu/AccountMenu.tsx:21,39,41`
  reads `useAuth().userId` and renders it into the "My profile" link
  (`to={\`/employees/${userId}\`}`) — exactly the "a component reads it and renders it" behaviour
  the gap describes as absent. `AccountMenu.tsx` has carried this code since commit `a0decb9`
  (2026-09-04), before the baseline this plan migrates from. The plan does not overclaim — it
  explicitly says "nothing in this plan closes that" — but the `fe-epic:component/AccountMenu`
  coverage row (`test-design-epic-user-management-2.md:113`, 3 cases, P1, "Sign-out and session
  interaction") does not name the my-profile-link rendering case, so the obligation most likely to
  close U-22 does not currently say it will. This is a citation-accuracy gap inherited from
  `deferred-work.md` and the migration ledger, not a defect this plan introduced, but it means
  U-22 may already be narrower (or closable by scoping the existing obligation) rather than a
  clean open question.
- **W-3 — minor naming mismatch, already hedged.** The NFR section
  (`test-design-epic-user-management-2.md:139`) names "the existing `fe-auth-*` e2e" as where
  security evidence would live. No file literally named `fe-auth-*` exists; the actual spec is
  `services/frontend/e2e/flows/auth/auth.spec.ts`. The plan's own caveat ("naming ... records
  where the evidence would live; it is not an assertion that they exist, run, or pass") already
  covers this, so it is recorded only as a precision note.

### Verified accurate (no finding)

- DEC-UM-004 / DEC-UM-012 characterization (`docs/architecture/user-management-test-decisions.md:38-48,109-115`)
  matches the plan's R-009 / TD-UM-AUTH-06 / G-07 / U-6 treatment exactly, including the
  draft-decision approval status and the "does not change the consume-side rule" boundary.
- `services/backend/src/user-management/domain/services/magic-link.service.ts:65-82` already
  implements the DEC-UM-012 behaviour (deactivated user treated identically to unknown email via
  `findActiveByWorkEmail`, zero dispatch), and `consume()` (lines 100-133) denies a pre-departure
  token at consume via `findActiveById`. This is implementation fact, not product approval; the
  plan correctly keeps DEC-UM-012 draft regardless of what the code already does.
- `session.ts`, `RequireAuth.tsx`, `AccountMenu.tsx` case subjects (`decodeJwtSub`/`isJwtExpired`,
  route-guard admit/refuse, sign-out/session interaction) match the code read directly.
- The obligation-trace counts in `test-design-epic-user-management-2.md:201-210` (18 rows: 17
  preserve, 1 retire) were independently recomputed against `migration-map.md` §4.1, §4.3c, §4.3e,
  §4.4, §5.4, §5.5, §7.1 and reconcile exactly, row for row.
- The epics.md Story 2.2 AC ("Colin's departure effective date has passed ... no usable session
  is established ... a pre-departure token fails at consume") is correctly read by the plan as
  consistent with, but narrower than, DEC-UM-012's request-side scope.

## Checklist results

All Epic-Level checklist criteria were evaluated; no criterion was skipped.

| Checklist group | Result | Note |
| --- | --- | --- |
| Prerequisites | PASS | Stories 2.1/2.2 with acceptance criteria, epic/PRD sources, architecture pair, and testability inputs exist. |
| Context loading | PASS | Index, routing contract, canonical pair, canonical epic, selected plan/checkpoint, migration ledger, and frontend/backend primary sources were inspected. |
| Risk assessment | PASS | Three risks carried (R-009, R-FE-01, R-FE-06 predicate half) with valid categories, scores, and mitigation direction; no re-scoring performed here (correctly deferred to the architecture doc). |
| NFR planning | PASS | Security boundary and configuration-owned TTL are stated; no threshold is invented. |
| Coverage design | PASS | AUTH-01..06 and the frontend subsection are atomic, leveled, and prioritized; no duplicate coverage across levels. |
| Deliverables | PASS | Risk, coverage (two levels), decisions/gaps, NFR, gate, regression, open questions, and obligation trace sections are present. |
| Risk matrix | PASS | IDs, categories, and scores trace to `test-design-architecture.md`; no arithmetic performed or needed here. |
| Coverage matrix | PASS with W-2 | Requirements map to levels and priorities with owners; AccountMenu's scope is narrower than the U-22 gap it is cited against. |
| Execution strategy | N/A (owned by `test-design-qa.md`) | Correctly referenced, not restated. |
| Resource estimates | PASS | Net-new case counts (19, all frontend) are stated without inventing an estimate range; effort is correctly deferred to `test-design-qa.md` § Effort. |
| Quality criteria | PASS | No gate, pass-rate, coverage, or release claim; the magic-link gate is explicitly "ungranted — no gate is asserted green." |
| Evidence/classification/priority/levels | PASS | `component` vs `api-e2e` vs Playwright e2e is explicitly disambiguated; priority is separate from execution timing. |
| Integration/accountability | PASS with W-1/W-3 | Dependencies, decisions, and open questions are documented; U-12's merge status and the `fe-auth-*` naming are stale/imprecise. |
| Cross-document consistency | PASS | Risk IDs, decision IDs, and obligation-trace totals agree with `test-design-architecture.md`, `test-design-qa.md`, and `migration-map.md`. |
| Epic-Level completion | PASS | No blocking design inconsistency remains. |

## Not executed / not applicable

- No runtime, service, E2E, or browser test ran. No runtime coverage, NFR verdict, gate result,
  percentage, or release-readiness claim follows from this validation.
- System-Level structural and handoff checks are not applicable; the system pair was loaded as
  shared authority, not revalidated.
- Sprint status, ClickUp, trace/gate artifacts, scenario files, service code, service gitlinks,
  and other epics were not changed.

## Required next action

Human review and any separate implementation/evidence workflows remain distinct from this
validation. Approval remains **ungranted**. W-1 and W-2 are worth a human look before the next
Edit of this plan (or of `deferred-work.md` / the migration ledger, which are outside this
report's edit scope) but do not block this PASS.

---

**Completed by:** independent Master Test Architect

**Date:** 2026-09-13

**Epic:** UM-E2 — Magic-Link Authentication
