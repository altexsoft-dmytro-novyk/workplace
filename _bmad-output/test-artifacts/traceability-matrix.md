---
stepsCompleted: ['step-01-load-context', 'step-02-discover-tests', 'step-03-map-criteria', 'step-04-analyze-gaps', 'step-05-gate-decision']
lastStep: 'step-05-gate-decision'
lastSaved: '2026-09-04'
workflowType: 'testarch-trace'
coverageBasis: 'acceptance_criteria'
oracleConfidence: 'high'
oracleResolutionMode: 'formal_requirements'
oracleSources: ['docs/test-cases/**', 'docs/architecture/testing-strategy.md']
externalPointerStatus: 'not_used'
collectionStatus: 'COLLECTED'
collectionMode: 'contract_static'
sourceSha: 'b074364'
backendSha: '53894d7'
frontendSha: 'a0decb9'
gateStatus: 'FAIL'
---

# Traceability Matrix & Gate Decision — Whole Repository

**Target:** all epics (Access Control Foundation, Access Control Kernel MVP, User Management, Mentorship)
**Date:** 2026-09-04 · **Evaluator:** TEA Agent, for User
**Oracle:** acceptance criteria — `docs/test-cases/` scenario documents · confidence **high**
**Collection mode:** `contract_static` — every counted test is a re-runnable spec file. **Nothing was executed in this run.**

**Source SHAs:** workspace `b074364` · backend `53894d7` · frontend `a0decb9` — **pins corrected to each service's `main` during this run**

---

## Gate Decision: **FAIL**

**Rule 1 — P0 is 100%. MET.**
**Rule 3 — P1 coverage is 70% against an 80% minimum. NOT MET.** That is
mentorship, entire, and it is now the *only* thing failing the gate.

---

## The pins were diverged; they were corrected during this run

The run opened against pins that were **not** on either service's `main`, which
is what the briefing had assumed. They were moved as part of this run.

| Submodule | Was | Now | Verified |
| --------- | --- | --- | -------- |
| `services/backend` | `ebf7f2b` (10 ahead / 5 behind) | **`53894d7`** | ancestor of `origin/main` ✓ |
| `services/frontend` | `25bd71c` (9 ahead / 1 behind) | **`a0decb9`** | ancestor of `origin/main` ✓ |

Nothing was lost. The "ahead" commits were ahead in *graph*, not in *content*:
`main` already carried that work squash-merged. Verified before moving —
frontend trees were **byte-identical**, and the backend differed in exactly four
files with **zero deletions**.

The two commits the old pin was missing closed two of this report's findings:

| Commit | Closed |
| -- | -- |
| `461d480 test(um-dep-08): replace the deferred it.todo pair with the scenario's four tests` | F1 — P0 99% → **100%** |
| `da7d1fa test(access-control): rework superseded 403 assertions as resolver audience-label checks` | F2 — the stale-red contradiction |

| | Before (`ebf7f2b`) | After (`53894d7`) |
| -- | --: | --: |
| P0 | 99% (127/128) | **100%** (128/128) |
| P1 | 70% (47/67) | 70% (47/67) |
| Overall | 84% (174/207) | **85%** (175/207) |
| Gate | FAIL (Rule 1 + Rule 3) | FAIL (**Rule 3 only**) |

---

## Coverage Summary

The gate counts **FULL only**; `PARTIAL` does not score.

| Priority | Total | FULL | % | Required | Status |
| -------- | ----: | ---: | -: | -------- | ------ |
| P0 | 128 | 128 | **100%** | 100% | MET |
| P1 | 67 | 47 | 70% | 80% | NOT MET |
| P2 | 12 | 0 | 0% | — | — |
| **Total** | **207** | **175** | **85%** | 80% | MET |

Distribution: FULL 175 · PARTIAL 32 · NONE 0.

**Legend:** `FULL` = a test case names the criterion (in its `it()` title, an
enclosing `describe()`, or an adjacent comment) **and** the production code it
exercises exists at HEAD **and** the test is actually written · `PARTIAL` = one
of those fails · `NONE` = nothing references it.

---

## Coverage by Area

| Area | Criteria | FULL | PARTIAL | NONE | % | What is blocking |
| ---- | -------: | ---: | ------: | ---: | -: | ---------------- |
| `access-control-foundation` | 9 | 9 | 0 | 0 | 100% | — |
| `access-control-kernel` | 79 | 79 | 0 | 0 | 100% | — |
| `mentorship` | 27 | 0 | 27 | 0 | 0% | no `src/mentorship/`, no `MentorshipPair` model |
| `user-management` | 92 | 87 | 5 | 0 | 95% | 5 criteria rest on `it.todo` only |


---

## Oracle: how 227 documents became 207 criteria

`docs/test-cases/` holds **227** scenario documents (the deleted 171-file
`access-control/` draft set is confirmed gone). Of those:

| | Count | Treatment |
| -- | --: | -- |
| Documents on disk | 227 | — |
| Retired / superseded | 26 | **excluded from the denominator** |
| Live documents | 201 | counted |
| Criteria they carry | **207** | `acm0-ru-*.md` carries 7 criteria as `##` headings |

**The 26 excluded, with the evidence for each:**

| Set | N | Why |
| -- | --: | -- |
| `registration/um-reg-01..15` | 15 | folder `README.md`: **RETIRED (v1.5)** — `POST /users` removed by AD-14/AD-16/§4.17 |
| `deactivation/um-deact-01..03` | 3 | folder `README.md`: **RETIRED (v1.5)** — capability removed by AD-16 |
| `um-rel-04`, `-05`, `-06` | 3 | per-file **SUPERSEDED / RETIRED** — mentorship left UM under AD-17 |
| `um-pf-01`..`-04` | 4 | per-file **Status: SUPERSEDED 2026-09-02**, retired in place |
| `umac-05` | 1 | per-file **SUPERSEDED 2026-09-02 — PM/AD-24** |

> **`registration/` is the trap in this set.** All 15 files are retired by their
> folder README, but **not one of the 15 carries a retirement header of its
> own**. A per-file scan keeps all 15 as live criteria. The same is true of the
> 3 `deactivation/` files. Folder-level retirement has to be read, or the
> denominator inflates by 18.

### Why this run counts 207 where the previous run counted 191

The delta is not new documents; it is three counting corrections.

| Change | Δ | Reason |
| -- | --: | -- |
| `ACM-0` expanded into `ACM0-RU-01..07` | +6 | one file, seven `##` criteria, seven matching `it()` cases. Counting it as a single criterion hid six. |
| `ACF-AU-05`, `ACF-FC-01`, `ACF-FC-02` restored | +3 | previously dropped as retired. They are **not** retired — only their *expected result* is superseded; the principle is explicitly still load-bearing. Dropping them hides real work (see F2). |
| Mentorship + UM recount | +7 | per-file re-derivation from the folder-level retirement rules above |

Approval state was **not** used as an oracle input anywhere in this run.
`testing-strategy.md` § "Stage approval was removed on 2026-09-04" retires
"draft"/"pending approval"/"unapproved" as meaningful states. Roughly a dozen
mentorship scenarios still carry `**Unapproved draft** — AD-1 approval required`
in their headers; those notes are **stale prose**, and ignoring them is what the
rule change requires. Both `approvals.yaml` ledgers were read as history only.

---

## Findings

### F1 — RESOLVED. P0 is 100%; five `it.todo` criteria remain at P1

`UM-DEP-08` was the only P0 short of FULL, resting on two `it.todo`
declarations. Commit `461d480` replaced them with the scenario's four tests, and
it arrived with the pin correction. P0 is now 100%.

**5 criteria still rest on an `it.todo` as their only evidence** — `UM-CT-03`,
`UM-CT-04`, `UM-CT-05`, `UM-CT-06`, `UM-CT-09`, all P1, all deferred pending the
FR-matrix grant. 18 `it.todo` cases remain in total. A named-but-unwritten test
is a declaration, not coverage.

### F2 — RESOLVED. The 403/200 contradiction is gone

`ACF-AU-05` / `ACF-FC-01` / `ACF-FC-02` each carried a header dated 2026-09-01:
*"Expected result superseded … Do not translate the `403` below."* At the old
pin each was covered by two tests that disagreed — a unit spec asserting the
prescribed resolver rework, and an e2e asserting `403` on `GET /users/:id`.

Production settles it: `access-control.facade.ts:83-90` returns `read` for S1
when the audience set contains `colleague` — **200 with the S1 identity card** —
and `UMAC-04` asserts exactly that 200 on the same route. Two tests in one
backend suite asserted 403 and 200 for the same request, and nothing ran them.

Commit `da7d1fa` reworked all three into resolver audience-label checks.
`audience-resolution.e2e-spec.ts` now contains **zero** `expect(403)`. Verified
after the pin move.

The three scenario documents still carry their superseded expected results and
still need rewriting to match; the tests no longer follow them.

### F3 — All four `EXPECTED RED` headers are stale, and stale in the same direction

Every one claims production that now exists — verified against `src/` and
`prisma/schema.prisma`, not against the prose:

| File | Claim | Reality |
| -- | -- | -- |
| `acm2-is-allowed.e2e-spec.ts:13` | "`isAllowed` does not exist" | exists — `access-control.facade.ts:27` |
| `acm5-section-access.e2e-spec.ts:24` | "no `canAccessSection` public method" | exists — `access-control.facade.ts:51` |
| `acm8-kernel-composition.e2e-spec.ts:26` | "AppModule does not import AccessControlModule" | imported — `app.module.ts:9,31` |
| `acm1r-fr-foundation.e2e-spec.ts:34` | "none of the five tables exists" | all five models present in `schema.prisma` |

These four files are green, not red. Red/green in this report is decided by
production-code presence, never by header prose.

### F4 — Mentorship is the whole P1 gap, and `main` does not change it

All **27** live mentorship criteria are PARTIAL. Their contracts are complete
and ID-traced — `be:test/mentorship/*.e2e-spec.ts` covers every one — but there
is **no `src/mentorship/` and no `MentorshipPair` model**, at the old pin or at
the corrected one. The pin move did not touch this. The only production trace of mentorship is five
comments naming it as a future participant seam.

P1 sits at 70% against an 80% minimum entirely because of this. With the pins
corrected it is **the only thing still failing the gate**.

`MEN-END-04` is covered: the suite splits it into `men-end-04a/b/c`. A matcher
that does not fold lettered sub-cases back onto the parent ID reports it as
uncovered.

### F5 — The frontend suite and the oracle do not touch, in either direction

| Suite | Files | Cases | Cases citing an oracle ID |
| -- | --: | --: | --: |
| backend | 47 | 426 | **385** |
| frontend `e2e/` | 7 | 124 | **0** |
| root `test/` (ClickUp tooling) | 5 | 75 | 0 |

Zero of 124 frontend cases cite any scenario ID, and no scenario document
describes a UI journey — the oracle is uniformly backend-shaped (`inputURL`,
HTTP status). The frontend suite is real, substantial work that this matrix
cannot score, and 124 cases of behaviour are governed by no scenario document.
This is a scope decision, not a coverage number: either extend the oracle with
UI journeys, or state that the frontend is deliberately out of the traced scope.

### F6 — `contract_static` is a ceiling, not a preference

`.github/workflows/tests.yml` runs one job: `npm run test:clickup`. Neither
submodule carries its own workflow. **The backend and frontend suites execute
nowhere.**

Everything above is therefore inference from source, not observation. This run
can prove a test *will not* pass (F2 is exactly that) but never that one *does*.
Until the suites run, "FULL" means "a written test names this criterion and its
production code exists" — not "this behaviour is verified".

---

## Recommendations

| # | Priority | Action | Effect |
| -- | -- | -- | -- |
| 1 | ~~P0~~ | ~~Move the submodule pins to each service's `main`.~~ **Done in this run** (`53894d7` / `a0decb9`). | P0 → 100%; F2 resolved. |
| 2 | P1 | Build the mentorship module + `MentorshipPair`. | Moves 27 criteria; the only route past P1 80%. |
| 3 | P1 | Resolve the 5 `UM-CT` `it.todo`s (blocked on the FR-matrix grant). | 5 criteria stop resting on declarations. |
| 4 | P1 | Decide what the frontend suite traces to — extend the oracle, or declare it out of scope. | Closes F5 either way. |
| 5 | P2 | Run the backend and frontend suites in CI. | Turns inference into observation; would have caught F2 on commit. |
| 6 | P3 | Delete the 4 stale `EXPECTED RED` headers and the stale `Unapproved draft` notes. | Removes prose that actively misleads. |

---

## Full Traceability Matrix

| ID | Behavior | Pri | Coverage | Prod code | Evidence |
| -- | -- | -- | -- | -- | -- |
| `ACF-AU-01` | Self reads own profile | P0 | **FULL** | IMPLEMENTED | `be:src/access-control/domain/services/audience-resolver.service.spec.ts`<br>`be:test/access-control/audience-resolution.e2e-spec.ts` |
| `ACF-AU-02` | Direct manager reads a report's profile | P0 | **FULL** | IMPLEMENTED | `be:src/access-control/domain/services/audience-resolver.service.spec.ts`<br>`be:test/access-control/audience-resolution.e2e-spec.ts` |
| `ACF-AU-03` | Manager's manager reads through the chain | P0 | **FULL** | IMPLEMENTED | `be:src/access-control/domain/services/audience-resolver.service.spec.ts`<br>`be:test/access-control/audience-resolution.e2e-spec.ts` |
| `ACF-AU-04` | Assigned People Partner reads the profile | P0 | **FULL** | IMPLEMENTED | `be:src/access-control/domain/services/audience-resolver.service.spec.ts`<br>`be:test/access-control/audience-resolution.e2e-spec.ts` |
| `ACF-AU-05` | Unrelated colleague is denied | P0 | **FULL** | IMPLEMENTED | `be:src/access-control/domain/services/audience-resolver.service.spec.ts`<br>`be:test/access-control/audience-resolution.e2e-spec.ts` |
| `ACF-FC-01` | Walk stops at a broken reports-to edge | P0 | **FULL** | IMPLEMENTED | `be:src/access-control/domain/services/audience-resolver.service.spec.ts`<br>`be:test/access-control/audience-resolution.e2e-spec.ts` |
| `ACF-FC-02` | PP inheritance stops at the assigned People Partner | P0 | **FULL** | IMPLEMENTED | `be:src/access-control/domain/services/audience-resolver.service.spec.ts`<br>`be:test/access-control/audience-resolution.e2e-spec.ts` |
| `ACF-FC-03` | Empty bulk resolves without touching the database | P0 | **FULL** | IMPLEMENTED | `be:src/access-control/domain/services/audience-resolver.service.spec.ts`<br>`be:test/access-control/audience-resolution.e2e-spec.ts` |
| `ACF-FC-04` | A cyclic reporting chain terminates instead of hanging | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/audience-resolution.e2e-spec.ts` |
| `ACM0-RU-01` | Fresh deployment creates one canonically stored active root User | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm0-root-user-prerequisite.e2e-spec.ts` |
| `ACM0-RU-02` | Unrelated active employees do not affect root eligibility | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm0-root-user-prerequisite.e2e-spec.ts` |
| `ACM0-RU-03` | Blank root configuration fails before database mutation | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm0-root-user-prerequisite.e2e-spec.ts` |
| `ACM0-RU-04` | An unmatched configured identity fails without fallback adoption | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm0-root-user-prerequisite.e2e-spec.ts` |
| `ACM0-RU-05` | All normalized matches are counted before active state | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm0-root-user-prerequisite.e2e-spec.ts` |
| `ACM0-RU-06` | A single inactive normalized match is rejected, not reactivated | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm0-root-user-prerequisite.e2e-spec.ts` |
| `ACM0-RU-07` | Concurrent fresh-deployment seeds converge on one root User | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm0-root-user-prerequisite.e2e-spec.ts` |
| `ACM1-FB-01` | A fresh database seeds exactly three canonical permission rows | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm1r-fr-foundation.e2e-spec.ts` |
| `ACM1-FB-02` | A fresh database seeds exactly one hr-admin FR policy | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm1r-fr-foundation.e2e-spec.ts` |
| `ACM1-FB-03` | The seeded hr-admin role is connected to exactly three permissions | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm1r-fr-foundation.e2e-spec.ts` |
| `ACM1-FB-04` | Exactly one existing root User receives the bootstrap attachment | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm1r-fr-foundation.e2e-spec.ts` |
| `ACM1-FB-05` | Running the seed again creates no duplicates | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm1r-fr-foundation.e2e-spec.ts` |
| `ACM1-FB-06` | No other role, attachment, or default grant exists after bootstrap | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm1r-fr-foundation.e2e-spec.ts` |
| `ACM1-FB-07` | The seeded FR policy row carries no targetType or targetId | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm1r-fr-foundation.e2e-spec.ts` |
| `ACM1-FB-08` | Invalid AR-shaped and FR-shaped rows are rejected by the database CHECK constraint | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm1r-fr-foundation.e2e-spec.ts` |
| `ACM1-FB-09` | Duplicate permission keys and duplicate joins are rejected by database constraints | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm1r-fr-foundation.e2e-spec.ts` |
| `ACM1R-FB-10` | The FR role key is partial: a second FR `hr-admin` is rejected, an AR `hr-admin` is accepted | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm1r-fr-foundation.e2e-spec.ts` |
| `ACM1R-FB-11` | The grant table's type separation is a database boundary, not application validation | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm1r-fr-foundation.e2e-spec.ts` |
| `ACM1R-FB-12` | A grant to an unknown permission is rejected, and the permission-first index exists | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm1r-fr-foundation.e2e-spec.ts` |
| `ACM1R-FB-13` | An attachment to an unknown user or an unknown policy is rejected | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm1r-fr-foundation.e2e-spec.ts` |
| `ACM1R-FB-14` | The `AccessControlBootstrap` row is a constrained singleton, not a convention | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm1r-fr-foundation.e2e-spec.ts` |
| `ACM1R-FB-15` | Deleting a referenced functional-role row is rejected on all four foreign keys | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm1r-fr-foundation.e2e-spec.ts` |
| `ACM1R-FB-16` | The seed restores an absent canonical key rather than renaming a drifted row back | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm1r-fr-foundation.e2e-spec.ts` |
| `ACM1R-FB-17` | The root lookup normalizes `ROOT_WORK_EMAIL` under DEC-UM-007 | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm1r-fr-foundation.e2e-spec.ts` |
| `ACM1R-FB-18` | The bootstrap serializes on a common advisory lock and fails atomically on timeout | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm1r-fr-foundation.e2e-spec.ts` |
| `ACM1R-FB-19` | Identity is revalidated before any write and again before commit | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm1r-fr-foundation.e2e-spec.ts` |
| `ACM1R-FB-20` | With no singleton, an existing FR `hr-admin` policy is adopted by natural key — and verified | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm1r-fr-foundation.e2e-spec.ts` |
| `ACM1R-FB-21` | With no singleton, an attachment is adopted only when it already belongs to the located root | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm1r-fr-foundation.e2e-spec.ts` |
| `ACM1R-FB-22` | With no singleton, a changed configured root is adopted rather than rejected | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm1r-fr-foundation.e2e-spec.ts` |
| `ACM1R-FB-23` | With the singleton present, a changed root email is conflicting drift — no transfer, no second attachment | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm1r-fr-foundation.e2e-spec.ts` |
| `ACM1R-FB-24` | An AR policy carrying `targetRole='hr-admin'` is invisible to the bootstrap | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm1r-fr-foundation.e2e-spec.ts` |
| `ACM1R-FB-25` | Concurrent runs converge on one bootstrap set, and conflicting runs fail atomically | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm1r-fr-foundation.e2e-spec.ts` |
| `ACM1R-FB-26` | Drift is dispositioned per field: restore, preserve, or fail before writes | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm1r-fr-foundation.e2e-spec.ts` |
| `ACM1R-FB-27` | A failure part-way through leaves no partial bootstrap state | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm1r-fr-foundation.e2e-spec.ts` |
| `ACM1R-FB-28` | An approved fourth permission and later administrator attachments survive a rerun | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm1r-fr-foundation.e2e-spec.ts` |
| `ACM2-IA-01` | A live active FR grant for the exact permission key allows | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm2-is-allowed.e2e-spec.ts` |
| `ACM2-IA-02` | Removing a live grant revokes the next decision immediately | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm2-is-allowed.e2e-spec.ts` |
| `ACM2-IA-03` | An inactive user with a valid FR grant is denied | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm2-is-allowed.e2e-spec.ts` |
| `ACM2-IA-04` | A nonexistent user id denies without becoming an application error | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm2-is-allowed.e2e-spec.ts` |
| `ACM2-IA-05` | An unknown permission key is denied | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm2-is-allowed.e2e-spec.ts` |
| `ACM2-IA-06` | A differently cased permission key is denied | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm2-is-allowed.e2e-spec.ts` |
| `ACM2-IA-07` | An attached AR cross-type collision never grants a functional permission | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm2-is-allowed.e2e-spec.ts` |
| `ACM2-IA-08` | An existing permission with no matching attached FR grant is denied | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm2-is-allowed.e2e-spec.ts` |
| `ACM2-IA-09` | An evaluation infrastructure error rejects instead of denying silently | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm2-is-allowed.e2e-spec.ts` |
| `ACM2-IA-10` | An empty permission key is denied without inventing a short-circuit contract | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm2-is-allowed.e2e-spec.ts` |
| `ACM3-II-01` | Inactive viewer at the top of a reporting chain receives no audience | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm3-inactive-identity.e2e-spec.ts` |
| `ACM3-II-02` | Inactive bridge inside the chain stops traversal | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm3-inactive-identity.e2e-spec.ts` |
| `ACM3-II-03` | Inactive target below an active manager fails closed for the Kernel MVP | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm3-inactive-identity.e2e-spec.ts` |
| `ACM3-II-04` | Empty target list returns an empty map with no relationship-graph read | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm3-bulk-input-contract.e2e-spec.ts` |
| `ACM3-II-05` | Duplicate requested targets collapse to one map key | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm3-bulk-input-contract.e2e-spec.ts` |
| `ACM3-II-06` | A repeated node reached before viewer proof ends the walk and denies Reporting | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm3-cycle-acyclicity.e2e-spec.ts` |
| `ACM3-II-07` | A repeated node above a proven viewer denies Reporting for that target | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm3-cycle-acyclicity.e2e-spec.ts` |
| `ACM3-II-08` | A viewer inside the cycle is denied rather than proven | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm3-cycle-acyclicity.e2e-spec.ts` |
| `ACM3-II-09` | Termination case 1 — an absent manager edge is a clean end and Reporting is granted | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm3-termination-taxonomy.e2e-spec.ts` |
| `ACM3-II-10` | Termination case 2 — an inactive endpoint above a proven viewer is a clean end and Reporting is granted | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm3-termination-taxonomy.e2e-spec.ts` |
| `ACM3-II-11` | An inactive PP endpoint derives no direct-PP audience | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm3-inactive-pp-endpoint.e2e-spec.ts` |
| `ACM3-II-12` | Reporting visited state is path-local — shared ancestors are not repeats | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm3-path-local-visited-state.e2e-spec.ts` |
| `ACM3-II-13` | An infrastructure failure propagates as an error, never as an empty map | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm3-fail-closed-identity.e2e-spec.ts` |
| `ACM3-II-14` | A missing viewer or target id derives no audience | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm3-fail-closed-identity.e2e-spec.ts` |
| `ACM4R-MA-01` | Reporting and direct PP are retained for one target | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm4r-multi-audience.e2e-spec.ts` |
| `ACM4R-MA-02` | Confirmed active Self is exclusive | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm4r-multi-audience.e2e-spec.ts` |
| `ACM4R-MA-03` | Colleague is present only when no stronger audience applies | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm4r-multi-audience.e2e-spec.ts` |
| `ACM4R-MA-04` | Repeated target input preserves one de-duplicated mixed result | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm4r-multi-audience.e2e-spec.ts` |
| `ACM4R-MA-05` | A functional permission never enters audience resolution | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm4r-multi-audience.e2e-spec.ts` |
| `ACM4R-MA-06` | One PostgreSQL fixture covers every CAP-2 audience class | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm4r-multi-audience.e2e-spec.ts` |
| `ACM5-SA-01` | S1 grants read to Self or Colleague alone | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm5-section-access.e2e-spec.ts` |
| `ACM5-SA-02` | S1 grants write to Reporting or direct PP | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm5-section-access.e2e-spec.ts` |
| `ACM5-SA-03` | S10 grants read to every Phase-0 audience | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm5-section-access.e2e-spec.ts` |
| `ACM5-SA-04` | S11 grants read to every Phase-0 audience | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm5-section-access.e2e-spec.ts` |
| `ACM5-SA-05` | The strongest merged audience wins | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm5-section-access.e2e-spec.ts` |
| `ACM5-SA-06` | An unsupported section returns none successfully | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm5-section-access.e2e-spec.ts` |
| `ACM5-SA-07` | A missing target returns none | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm5-section-access.e2e-spec.ts` |
| `ACM5-SA-08` | Empty Phase-0 audiences return none for every supported section | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm5-section-access.e2e-spec.ts` |
| `ACM5-SA-09` | An audience-resolution infrastructure error propagates | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm5-section-access.e2e-spec.ts` |
| `ACM8-KC-01` | AccessControlFacade resolves from the real application container | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm8-kernel-composition.e2e-spec.ts` |
| `ACM8-KC-02` | ACCESS_CONTROL_PORT stays bound to InterimAccessControlAdapter | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm8-kernel-composition.e2e-spec.ts` |
| `ACM8-KC-03` | No User Management file or route behavior changes | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm8-kernel-composition.e2e-spec.ts` |
| `ACM8-KC-04` | AccessControlModule remains headless — no HTTP or debug endpoint | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm8-kernel-composition.e2e-spec.ts` |
| `ACM8-KC-05` | AccessControlModule header comment no longer conflates composition with port rebinding | P0 | **FULL** | IMPLEMENTED | `be:test/access-control/acm8-kernel-composition.e2e-spec.ts` |
| `MEN-DEP-01` | Departure auto-closes the departing person's active pairs | P1 | **PARTIAL** | ABSENT | `be:test/mentorship/departure.e2e-spec.ts` |
| `MEN-DEP-02` | The departure closure note bypasses the mandatory-note gate | P1 | **PARTIAL** | ABSENT | `be:test/mentorship/departure.e2e-spec.ts` |
| `MEN-END-01` | End a pair with a closure note | P1 | **PARTIAL** | ABSENT | `be:test/mentorship/end.e2e-spec.ts` |
| `MEN-END-02` | Ending a pair without a closure note is rejected | P1 | **PARTIAL** | ABSENT | `be:test/mentorship/departure.e2e-spec.ts`<br>`be:test/mentorship/end.e2e-spec.ts` |
| `MEN-END-03` | Closure note is visible to reporting line, project line, and PP | P1 | **PARTIAL** | ABSENT | `be:test/mentorship/end.e2e-spec.ts` |
| `MEN-END-04` | Closure note is hidden from the mentor, the mentee, and colleagues | P1 | **PARTIAL** | ABSENT | `be:test/mentorship/end.e2e-spec.ts` |
| `MEN-END-05` | Status returns to open-to-mentoring when no active mentee remains | P1 | **PARTIAL** | ABSENT | `be:test/mentorship/end.e2e-spec.ts` |
| `MEN-END-06` | Status does not return to the pool when the flag was cleared | P1 | **PARTIAL** | ABSENT | `be:test/mentorship/end.e2e-spec.ts` |
| `MEN-END-07` | Ending a pair writes mentorship_end to the career timeline | P1 | **PARTIAL** | ABSENT | `be:test/mentorship/end.e2e-spec.ts` |
| `MEN-END-08` | Ended pairs stay in history on both profiles | P1 | **PARTIAL** | ABSENT | `be:test/mentorship/end.e2e-spec.ts` |
| `MEN-FLAG-01` | Self sets own open-to-mentoring flag | P2 | **PARTIAL** | ABSENT | `be:test/mentorship/flag.e2e-spec.ts` |
| `MEN-FLAG-02` | Self clears own open-to-mentoring flag | P2 | **PARTIAL** | ABSENT | `be:test/mentorship/flag.e2e-spec.ts` |
| `MEN-FLAG-03` | Clear the flag while holding an active mentee | P2 | **PARTIAL** | ABSENT | `be:test/mentorship/flag.e2e-spec.ts` |
| `MEN-FLAG-04` | A non-Self actor cannot set someone else's flag | P2 | **PARTIAL** | ABSENT | `be:test/mentorship/flag.e2e-spec.ts` |
| `MEN-PAIR-01` | Create a pair with a mentee in the assigner's access scope | P1 | **PARTIAL** | ABSENT | `be:test/mentorship/pair.e2e-spec.ts` |
| `MEN-PAIR-02` | Mentee outside the assigner's access scope is rejected | P1 | **PARTIAL** | ABSENT | `be:test/mentorship/pair.e2e-spec.ts` |
| `MEN-PAIR-03` | First active pair flips status open-to-mentoring → mentor | P1 | **PARTIAL** | ABSENT | `be:test/mentorship/pair.e2e-spec.ts` |
| `MEN-PAIR-04` | Pair creation writes mentorship_start to the career timeline | P1 | **PARTIAL** | ABSENT | `be:test/mentorship/pair.e2e-spec.ts` |
| `MEN-PAIR-05` | Pair creation denied without *assign and end mentorships* | P1 | **PARTIAL** | ABSENT | `be:test/mentorship/pair.e2e-spec.ts` |
| `MEN-POOL-01` | Permission-holder reads the company-wide willing-mentor pool | P2 | **PARTIAL** | ABSENT | `be:test/mentorship/pool.e2e-spec.ts` |
| `MEN-POOL-02` | The pool never exposes anyone's S13 section | P2 | **PARTIAL** | ABSENT | `be:test/mentorship/pool.e2e-spec.ts` |
| `MEN-POOL-03` | Pool read denied without *assign and end mentorships* | P2 | **PARTIAL** | ABSENT | `be:test/mentorship/pool.e2e-spec.ts` |
| `MEN-VIEW-01` | Self sees own mentor and own mentee(s) | P2 | **PARTIAL** | ABSENT | `be:test/mentorship/view.e2e-spec.ts` |
| `MEN-VIEW-02` | All-pairs view lists active and ended pairs with dates and status | P2 | **PARTIAL** | ABSENT | `be:test/mentorship/view.e2e-spec.ts` |
| `MEN-VIEW-03` | The profile header shows the mentor | P2 | **PARTIAL** | ABSENT | `be:test/mentorship/view.e2e-spec.ts` |
| `MEN-VIEW-04` | S13 inline mentorship summary on the profile | P2 | **PARTIAL** | ABSENT | `be:test/mentorship/view.e2e-spec.ts` |
| `MEN-VIEW-05` | Mentorship status is a filterable directory field | P2 | **PARTIAL** | ABSENT | `be:test/mentorship/view.e2e-spec.ts` |
| `UM-AUTH-01` | Request a magic link for a registered active email | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-2/request-magic-link.e2e-spec.ts` |
| `UM-AUTH-02` | Request a magic link for an unregistered email | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-2/request-magic-link.e2e-spec.ts` |
| `UM-AUTH-02B` | Request a magic link for a deactivated user's email | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-2/request-magic-link.e2e-spec.ts` |
| `UM-AUTH-03` | Consuming a valid magic-link token establishes a session | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-2/consume-magic-link.e2e-spec.ts` |
| `UM-AUTH-04` | Consuming an expired magic-link token is denied | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-2/consume-magic-link.e2e-spec.ts` |
| `UM-AUTH-05` | A magic-link token cannot be consumed twice | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-2/consume-magic-link.e2e-spec.ts` |
| `UM-AUTH-06` | Deactivated / departed user cannot establish a session via magic link | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-2/consume-magic-link.e2e-spec.ts` |
| `UM-CT-01` | Creating a user writes a joined_company event | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-3/auto-events.e2e-spec.ts` |
| `UM-CT-02` | Editing position writes a position_change event | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-3/auto-events.e2e-spec.ts` |
| `UM-CT-03` | PP manually adds a backfill entry | P1 | **PARTIAL** | IMPLEMENTED | `it.todo` only — `be:test/user-management/epic-3/manual-events.e2e-spec.ts` |
| `UM-CT-04` | Unit Manager manually adds a backfill entry | P1 | **PARTIAL** | IMPLEMENTED | `it.todo` only — `be:test/user-management/epic-3/manual-events.e2e-spec.ts` |
| `UM-CT-05` | PP corrects a wrongly-inferred event | P1 | **PARTIAL** | IMPLEMENTED | `it.todo` only — `be:test/user-management/epic-3/edit-delete-events.e2e-spec.ts` |
| `UM-CT-06` | Unit Manager soft-deletes an event | P1 | **PARTIAL** | IMPLEMENTED | `it.todo` only — `be:test/user-management/epic-3/edit-delete-events.e2e-spec.ts` |
| `UM-CT-07` | A soft-deleted event is absent, not null, from the timeline read — LIVE | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-3/edit-delete-events.e2e-spec.ts` |
| `UM-CT-08` | Direct edit of a career-timeline event is rejected — LIVE | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-3/edit-delete-events.e2e-spec.ts` |
| `UM-CT-09` | Holding the timeline permission but lacking S9 write audience → denied | P1 | **PARTIAL** | IMPLEMENTED | `it.todo` only — `be:test/user-management/epic-3/manual-events.e2e-spec.ts` |
| `UM-CT-10` | Having S9 write access but lacking the timeline permission → denied — LIVE | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-3/manual-events.e2e-spec.ts` |
| `UM-CT-11` | `GET /users/:id/events` is gated by the career-timeline read audience | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-3/timeline-read-audience.e2e-spec.ts` |
| `UM-CT-12` | HR Admin manually adds a backfill entry — LIVE | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-3/manual-events.e2e-spec.ts` |
| `UM-CT-13` | HR Admin soft-deletes an event and runs the correction flow — LIVE | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-3/edit-delete-events.e2e-spec.ts` |
| `UM-DEP-01` | Record a future departure without changing current status | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-5/record-departure.e2e-spec.ts` |
| `UM-DEP-02` | Recording a departure is blocked while responsibilities remain | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-5/record-departure.e2e-spec.ts` |
| `UM-DEP-03` | Applying a departure on its effective date | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-5/apply-departure.e2e-spec.ts` |
| `UM-DEP-04` | Retrying a partially-failed departure is idempotent | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-5/apply-departure.e2e-spec.ts` |
| `UM-DEP-05` | Re-parenting clears the platform blockers, then recording succeeds | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-5/record-departure.e2e-spec.ts` |
| `UM-DEP-06` | Recording a departure is idempotent per `Idempotency-Key` | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-5/record-departure.e2e-spec.ts` |
| `UM-DEP-07` | Request-time cutoff holds even when the worker has not run | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-5/apply-departure.e2e-spec.ts` |
| `UM-DEP-08` | A stale executor no-ops; the current-token executor owns the row | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-5/apply-departure.e2e-spec.ts` |
| `UM-EDIT-01` | An entitled actor edits S1 identity fields and the change reflects on a read | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/edit-identity.e2e-spec.ts` |
| `UM-EDIT-02` | `PATCH` normalizes `workEmail` (`trim().toLowerCase()`) before the uniqueness check | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/edit-identity.e2e-spec.ts` |
| `UM-EDIT-03` | Editing `workEmail` to one already in use rejects the whole write (`409`), nothing partially applied | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/edit-identity.e2e-spec.ts` |
| `UM-EDIT-04` | Setting `ttId` to one already in use rejects the whole write (`409`); `null`-vs-`null` is not a duplicate | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/edit-identity.e2e-spec.ts` |
| `UM-EDIT-05` | A `PATCH` body carrying `manager` / `peoplePartner` / `department` is rejected `400`, whole DTO | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/edit-identity.e2e-spec.ts` |
| `UM-EDIT-06` | `PATCH /users/:id` never touches `photo` / `isActive` / `employmentStatus` / `customFields` — each → `400` | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/edit-identity.e2e-spec.ts` |
| `UM-EDIT-07` | An empty / no-op `PATCH` body returns `200` with the current state | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/edit-identity.e2e-spec.ts` |
| `UM-EDIT-08` | `birthDay` / `birthMonth` on edit — both-or-neither, consistent with import | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/edit-identity.e2e-spec.ts` |
| `UM-LIST-01` | List employees returns one page plus pagination metadata | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/list-v15.e2e-spec.ts` |
| `UM-LIST-02` | List employees filtered by a single identity field (`country`) | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/list-v15.e2e-spec.ts` |
| `UM-LIST-03` | List employees with combined filters (`position` + `city`) | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/list-v15.e2e-spec.ts` |
| `UM-LIST-04` | List employees filtered by the remaining permission-safe S1 fields | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/list-v15.e2e-spec.ts` |
| `UM-LIST-05` | A dismissed employee drops out of the default list | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/list-v15.e2e-spec.ts` |
| `UM-LIST-06` | A dismissed employee is findable via the authorized employment-status filter | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/list-v15.e2e-spec.ts` |
| `UM-LIST-07` | The list endpoint is gated by the no-target `user-management:list` capability | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/list-v15.e2e-spec.ts` |
| `UM-LIST-08` | Every list row is the same fixed, fail-closed permission-safe projection | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/list-v15.e2e-spec.ts` |
| `UM-LIST-09` | Internal and unknown filter predicates are rejected `400`, never silently applied | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/list-v15.e2e-spec.ts` |
| `UM-LIST-10` | A filter that matches nothing returns `200` with an empty page and valid metadata | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/list-v15.e2e-spec.ts` |
| `UM-LIST-11` | The list has a deterministic default sort; `?sort=` is not supported in this story | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/list-v15.e2e-spec.ts` |
| `UM-LIST-12` | 500+ rows with arbitrary filters resolve within the NFR-2 budget, with no per-row facade calls | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/list-v15.e2e-spec.ts` |
| `UM-PHOTO-01` | Self uploads a first photo — it persists and reflects on a read | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/photo-v15.e2e-spec.ts` |
| `UM-PHOTO-02` | Self replaces an existing photo — full-replace semantics | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/photo-v15.e2e-spec.ts` |
| `UM-PHOTO-03` | Photo upload is Self-only — a manager and a colleague are denied | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/photo-v15.e2e-spec.ts` |
| `UM-PHOTO-04` | Photo upload without a usable session → `401` | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/photo-v15.e2e-spec.ts` |
| `UM-PHOTO-05` | Self upload against a non-resolvable target → `403` | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/photo-v15.e2e-spec.ts` |
| `UM-PHOTO-06` | Photo upload input validation → `400` | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/photo-v15.e2e-spec.ts` |
| `UM-PHOTO-07` | Object store unreachable → `503`, `User.photo` NOT changed | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/photo-v15.e2e-spec.ts` |
| `UM-PHOTO-08` | The upload hits real object storage — Stage-2 bucket assertion (AD-15) | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/photo-v15.e2e-spec.ts` |
| `UM-PHOTO-09` | `PATCH /users/:id` never writes `photo`, and a photo upload never writes other S1 fields | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/photo-v15.e2e-spec.ts` |
| `UM-REL-01` | HR Admin assigns reports-to | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-4/manager-change.e2e-spec.ts` |
| `UM-REL-02` | HR Admin revokes reports-to (hard delete) | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-4/manager-change.e2e-spec.ts` |
| `UM-REL-03` | Second reports-to POST without DELETE returns 409 | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-4/manager-change.e2e-spec.ts` |
| `UM-REL-07` | Non-HR Admin cannot mutate relationships | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-4/manager-change.e2e-spec.ts`<br>`be:test/user-management/epic-4/pp-delete.e2e-spec.ts` |
| `UM-REL-08` | Concurrent reports-to assign resolves to one edge | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-4/manager-change.e2e-spec.ts` |
| `UM-REL-09` | Change an employee's People Partner (atomic replace + journal) | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-4/people-partner-change.e2e-spec.ts`<br>`be:test/user-management/epic-4/pp-delete.e2e-spec.ts` |
| `UM-REL-10` | Assigning yourself as an employee's People Partner is rejected | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-4/people-partner-change.e2e-spec.ts` |
| `UM-REL-11` | A stale `expectedCurrentTargetId` on the PP replace returns 409 | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-4/people-partner-change.e2e-spec.ts` |
| `UM-REL-12` | Change an employee's department (membership move) | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-4/department-change.e2e-spec.ts` |
| `UM-REL-13` | Change a department's manager | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-4/department-change.e2e-spec.ts` |
| `UM-REL-14` | Making yourself a department's manager is rejected | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-4/department-change.e2e-spec.ts` |
| `UM-REL-15` | Access journal — append-only, idempotent write, reader-authorized read | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-4/access-journal.e2e-spec.ts` |
| `UM-REL-16` | Remove an employee's People Partner + PP-change authorization and audience | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-4/pp-delete.e2e-spec.ts` |
| `UM-REL-17` | Department membership — add a second, remove one, remove the last | P1 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-4/department-change.e2e-spec.ts` |
| `UM-SEED-01` | Population import creates one canonical `User` row per seeded employee | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/seed.e2e-spec.ts` |
| `UM-SEED-02` | There is no `POST /users` single-create path | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/seed.e2e-spec.ts` |
| `UM-SEED-03` | A CSV row for the root person updates the ACM-0 root `User` in place | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/seed.e2e-spec.ts` |
| `UM-SEED-04` | Department create-on-import: identity is the `(externalId, name)` pair, one membership per user | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/seed.e2e-spec.ts` |
| `UM-SEED-05` | `IsDismissed` + dates map to one `EmploymentStatus` row; `User.isActive` is not touched | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/seed.e2e-spec.ts` |
| `UM-SEED-06` | `Birthday` splits to `birthDay` + `birthMonth`, year dropped; `NULL` → both null | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/seed.e2e-spec.ts` |
| `UM-SEED-07` | Fields with no CSV source persist as `null`; `createdBy` is the ACM-0 root id | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/seed.e2e-spec.ts` |
| `UM-SEED-08` | Re-importing the same file is idempotent; only import-owned columns refresh | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/seed.e2e-spec.ts` |
| `UM-SEED-09` | File-level failure → `400` nothing written; every row-level problem → `200` per-row skip, good rows commit | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/seed.e2e-spec.ts` |
| `UM-SEED-10` | The import is HR-Admin-only — without `user-management:create` → `403`, nothing written | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/seed.e2e-spec.ts` |
| `UM-SEED-11` | Import with a missing/invalid/unresolved session → `401`, nothing written | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/seed.e2e-spec.ts` |
| `UM-SEED-12` | The deploy-script entrypoint loads `docs/Accounts_template.csv` in the deploy order | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/seed.e2e-spec.ts` |
| `UM-SEED-13` | Each new `User` gets a `joined_company` `UserEvents` row in the same transaction | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/epic-1/seed.e2e-spec.ts` |
| `UMAC-01` | Self reads own profile → 200 with the S1 identity card | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/access-control-adoption/read-adoption.e2e-spec.ts` |
| `UMAC-02` | Reporting-line viewer reads a report's profile → 200 with the S1 identity card | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/access-control-adoption/read-adoption.e2e-spec.ts` |
| `UMAC-03` | Assigned People Partner reads an employee's profile → 200 with the S1 identity card | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/access-control-adoption/read-adoption.e2e-spec.ts` |
| `UMAC-04` | Colleague / unrelated active session reads a profile → 200 with the S1 identity card | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/access-control-adoption/read-adoption.e2e-spec.ts` |
| `UMAC-06` | No-target `isAllowed` delegates straight to the real facade — including against an `HR Admin` impostor | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/access-control-adoption/no-target-permission.e2e-spec.ts` |
| `UMAC-07` | PATCH /users/:id identity-card edit is gated by S1 write-access (Variant A) | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/access-control-adoption/write-adoption.e2e-spec.ts` |
| `UMAC-08` | PATCH body with manager / PP / department fields is rejected regardless of audience | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/access-control-adoption/write-adoption.e2e-spec.ts` |
| `UMAC-09` | PUT /users/:id/photo is Self-only | P0 | **FULL** | IMPLEMENTED | `be:test/user-management/access-control-adoption/write-adoption.e2e-spec.ts` |

