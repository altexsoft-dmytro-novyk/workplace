# Testing Strategy — the Three-Stage Gate

Binding rules for how every feature is built. Spine: AD-1, AD-3, AD-4, AD-15, AD-19, AD-20.

## The gate (AD-1) — no exceptions to ordering or stage separation

Every feature, every developer, in this order:

1. **Scenario document** in `/docs/test-cases/`, written line-by-line:
   *actor (who, with which relationships/roles) → request (endpoint, payload) → expected outcome (status, body shape, what is absent)*.
   An explicitly approved headless application-facade gate records the public
   method call, typed input, typed result, and absent result members instead of
   inventing an endpoint.
   Every scenario cites the requirements section it implements (e.g. `§3.2 S6 / Project line`, `§2.3 removing a permission`).
   The authoring pattern — folder structure, file skeleton (`inputURL` / `inputRequest` / `expectedResult`), granularity and status-code conventions — is defined in [/docs/test-cases/README.md](../test-cases/README.md); [access-control-kernel/](../test-cases/access-control-kernel/) is the reference implementation.
   → Written and committed before anything else. No approval step.
2. **Stage-2 test** translated from the scenario — normally real HTTP
   E2E; only an explicitly approved headless application-facade gate may use
   direct integration evidence as defined under AD-3 below. The scenario is the
   script and the test follows it line by line.
   → Committed red.
3. **Production code**, written until that test passes. No production code
   lands without its preceding red Stage-2 test in history.

### Stage approval was removed on 2026-09-04

**AD-1 no longer requires a human approval between stages.** The three-stage
ordering above still holds — scenario first, then a red Stage-2 test, then
production written until that test passes — but a stage no longer waits on a
developer signing off the previous one, and a dispatch may span more than one
stage.

What this changes, stated plainly so nobody has to infer it:

- **`docs/test-cases/` scenario documents no longer carry an approval status.**
  "Draft", "pending approval" and "unapproved" are no longer meaningful states
  for them. A scenario is either present or absent.
- **Nothing blocks a Stage-2 test or production code.** The previous rule —
  *"a dispatch may not start until the prior stage's record exists and
  verifies"* — is withdrawn.
- **No new ledger entries are written.** The two existing ledgers
  (`spec-access-control-kernel-mvp/approvals.yaml`,
  `spec-user-management-access-control-adoption/approvals.yaml`) are **kept as
  history**. Their 113 entries record decisions that were genuinely made, and
  all 113 still resolve; they are not deleted and not edited. They simply stop
  being a precondition for anything.

The control this removes was real: it existed because a single agent dispatch
once wrote the scenario, the tests and the production code back to back, then
cited its own review as the approval. Removing the gate removes that safeguard.
What now stands in its place is ordinary review — the pull request, and CI
actually executing the suites. Neither is automatic, so if the suites are not
run in CI, nothing checks stage separation at all.

#### Validation-only evidence exception (AD-1)

Characterization tests added over **already-shipped** behavior, which change no
production code, may be committed **green**. The committed-red rule exists to
stop production code from landing without a preceding failing test; where there
is no production change, it has no subject.

The exception is narrow and carries three conditions:

- It applies only when the dispatch changes no production code at all.
- Such evidence is **not** a Stage-2 gate for any production change and can
  never be cited as one.
- If the validation finds a gap, the fix re-enters the ordinary three-stage
  sequence with a real committed-red test — the exception does not travel with
  the remediation.

ACM-4 in the Access Control Kernel MVP runs under this exception. Any missing
approved scenario coverage **or** concrete behavior gap it finds halts Stage 2
onward, opens a separately approved AD-1 sequence, and requires a Story
Breakdown re-run before the package resumes.

### Done means built for real, not merely green (AD-15)

A story's tests passing is not proof the story is finished if a fake is what made them pass. Before marking any story complete, check every port its own acceptance criteria exercise: if the port's real adapter is this story's job, it must be real (see [domain-driven-design.md's fakes/mocks scope rule](domain-driven-design.md#fakes-mocks-and-stubs--scope-test-ad-15)); a fake is only legitimate standing in for a different, not-yet-built story/epic/context's dependency.

Negative cases are first-class: every `—` cell of the §3.2 access matrix, unflagged S7 records against both the employee and a PM, the colleague whitelist — each is its own scenario (§9 Definition of Done requires them).

The narrowed Project-line cells (S2/S3 denied, S5 CV/certificates only), named-recipient share links, organisational self-assignment denial/journaling, runtime role creation, and departure revocation require explicit regression scenarios. If good-to-have notifications are built, automate negative content checks per notification type and audience; delivery totals are not a privacy oracle.

For AD-19/AD-20, stage-1 scenario contracts explicitly cover: PP zero-or-one cardinality, concurrent absent/create and replace/replace CAS, expected-current `409`, self/authorization negatives, journal rollback, and HR-boundary negative traversal; departure blocker matrix, leak-safe remediation plan, explicit platform-owned one-click re-parenting and stale blocker version, sync-owned PM/DM refusal until external remediation is confirmed, idempotency-key replay/hash mismatch/authorization recheck, stored timezone/dueAt boundary, due/overdue pickup order, duplicate workers, delayed stale worker after lease reclaim, uncertain commit, retry/backoff/manual retry conflicts, legacy-blocker incident, actor cutoff, due target projection, and negative traversal through due manager/PP nodes. Each scenario still stops for its own human approval before stage 2.

**Kernel MVP exception.** The scoped AD-20 amendment in
`_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md` defers request-time due/departure evaluation and
dismissed-target projection for the entire Access Control Kernel MVP, explicitly
ACM-0 through ACM-5, because no Departure persistence seam exists; ACM-8 only
composes and ACM-9 only measures. Stage-1 dispatches inside that package must
not reintroduce the due/departure items listed above as binding coverage. Every
other feature keeps the full list, and future due behavior still requires its
own AD-1 sequence.

## What "E2E" means here (AD-3)

Real HTTP request → real NestJS router → real access resolution → **real test database** (PostgreSQL, migrated schema, seeded fixtures).

Faked: the outbound integration ports (timetracker, PeopleForce) — rebound to fixture-backed fakes via their DI tokens in the test module (see [nestjs-di-tokens.md](nestjs-di-tokens.md)). **Live third-party calls in the E2E suite are forbidden.**

Not faked: the database, the router, authentication, the AccessControl facade, tier resolution. If the test doesn't assert what the API actually returns, it isn't a gate test.

Separately from deterministic E2E automation, release validation must exercise the real timetracker test environment over the provided seeded population (§9). That manual/integration smoke evidence is required for completion and does not weaken the no-live-calls E2E rule.

### Scoped headless-facade gate — Access Control Kernel MVP

The approved
`_bmad-output/planning-artifacts/sprint-change-proposal-2026-08-30-access-control-kernel-mvp.md` establishes one
scoped Stage-2 boundary for ACM-1, ACM-2, ACM-3, ACM-4, ACM-5, and ACM-8:

- Invoke the public `AccessControlFacade` through a real Nest testing module
  importing the real `AccessControlModule`.
- Use real Prisma adapters, migrated PostgreSQL, and seeded fixture facts.
- Do not fake an Access Control repository and do not override a User
  Management provider.
- Do not create a test-only, debug, or artificial HTTP endpoint.
- Preserve AD-1 unchanged: scenario prose, independent human approval, a
  separate Stage-2 dispatch committed red and independently approved, then a
  separate production dispatch.

ACM-0 sits inside the same boundary but has no facade call to make: its subject
is the deploy-time root User step, so its Stage-2 evidence runs against migrated
PostgreSQL directly. Every prohibition above still applies to it, and AD-1 is
unchanged.

**Deploy-time stories invoke their real production entrypoint.** Where a story's
subject is a deploy-time step rather than a facade call, its Stage-2 evidence
runs that story's exact named entrypoint against migrated PostgreSQL.
Re-implementing the step's normalization, eligibility, or bootstrap logic inline
in a test proves the test, not the deployed path, and does not satisfy the story.

| Story | Production entrypoint | Invocation |
| --- | --- | --- |
| ACM-0 | `services/backend/prisma/seed.ts` | `npm run db:seed` |
| ACM-1 | `services/backend/src/access-control/infrastructure/bootstrap/access-control-bootstrap.ts`, wrapped by `services/backend/scripts/bootstrap-access-control.ts` | `npm run db:bootstrap:access-control` |

Deployment order is `npm run db:deploy` → `npm run db:seed` →
`npm run db:bootstrap:access-control` → `npm run start:prod`.

This proves the deployable kernel only. It does not prove `/users` enforcement,
field/record projection, or consumer routing. The separate User
Management-owned integration story still requires ordinary real-consumer HTTP
E2E under the definition above before the product gate can close.

ACM-9 is a measurement-only dispatch: its baseline may not change behavior
under `services/backend/src/access-control/**`. It records PostgreSQL evidence
before and after ACM-8; any remediation is a separately gated story.

### ACM-9 operational measurement protocol — `ACM9-MVP-v1`

This sequence is a repeatable MVP measurement method, not normative resolver
behavior:

1. Every started run first reserves a new immutable append-only artifact path
   with a run id and role (`baseline` or `final`). **Reservation is atomic and
   precedes every fallible step** — fixture construction, database connection,
   and manifest hashing included, not merely the first warm-up call. It happens
   in two phases: the artifact is created carrying run id, role, protocol
   version, and status `INCOMPLETE`, and the manifest hashes are written into it
   as they are computed. A failure while probing the environment or hashing a
   manifest therefore still leaves a reserved auditable artifact carrying its
   `stop_reason`, rather than no artifact at all.
   Finalization rewrites only the status and results block, to `PASS`, `FAIL`,
   or `INCOMPLETE`; setup failure and partial threshold failure still publish
   evidence. A run that cannot finalize leaves its reserved `INCOMPLETE`
   artifact in place and exits nonzero, so no started run ends without auditable
   evidence. Never overwrite a prior run.
2. For each run, use 500 requested active targets and cover representative
   Reporting, direct PP, Colleague, and mixed-audience fixtures as independent
   gates at each required shape; do not aggregate a slow class into a combined
   percentile.
3. Measure a balanced depth-5 graph, then acyclic depths 25, 50, 100, 200, 300,
   400, and 499 in that order. Each gate uses five discarded warm-up calls and
   twenty measured calls, computes p50/p95 by nearest rank, and times the public
   facade call end to end, including transaction and result mapping. Run
   `EXPLAIN (ANALYZE, BUFFERS)` separately from latency samples.
4. After every measured shape, fail and stop immediately when warm p95 or worst
   case exceeds two seconds, or when statement timeout occurs. Do not continue
   collecting later shapes after an absolute breach.
   **Non-timeout infrastructure errors are recorded, not swallowed.** A
   connection failure, a query error, or a fixture-setup failure finalizes the
   run `INCOMPLETE` with an `error_class` and message in the artifact. Such a run
   is never `PASS`, and never `FAIL` — `FAIL` is reserved for a measured
   threshold breach or a statement timeout, so an infrastructure outage cannot
   masquerade as a performance verdict in either direction.
5. Apply the same absolute gate to baseline and final runs. Compare final with
   baseline, but a post-composition slowdown within both two-second limits is
   recorded and does not fail this MVP.
6. Each artifact records protocol version, fixture-manifest hash, source and
   migration revisions, PostgreSQL/runtime/environment identity and
   environment-manifest hash, timestamps, warm-up/sample counts, completed
   shape results, query count, plan references, first breach or timeout, and
   stop reason. The environment manifest covers PostgreSQL
   configuration/version, runtime version, host/container CPU and memory
   limits, database topology, and isolation/load policy. A final artifact
   references the approved baseline run id and must match its protocol,
   fixture, and environment hashes.
   **Precedence between an absolute failure and a manifest mismatch.** A
   recorded warm-p95 or worst-case value above two seconds, or a statement
   timeout, **always finalizes the run `FAIL`**, whether or not the manifests
   match: the gate is absolute, not comparative, and a measured breach is real
   evidence about a real environment. A mismatch sets
   `comparability: mismatched` and suppresses the baseline slowdown comparison;
   a mismatched run that recorded **no** breach finalizes `INCOMPLETE`, because
   an unbreached measurement in a different environment cannot be credited as a
   `PASS` against the baseline. A mismatch can therefore never upgrade a run to
   `PASS` and never erases a recorded breach. This supersedes the earlier rule
   that a mismatch produces no absolute gate verdict.
7. Fixture and environment manifests use the versioned `ACM9-MANIFEST-v1`
   canonical form: a JSON object serialized with keys sorted by Unicode code
   point, UTF-8 without a byte-order mark, no insignificant whitespace, integers
   without exponent, decimals at fixed precision, and an explicit `null` for
   every absent optional field. Each hash is SHA-256 over exactly those bytes,
   recorded as lowercase hex. Two runs whose manifests differ only in key order
   or formatting therefore hash identically; any other difference is a real
   mismatch. A manifest schema change requires a new manifest version and cannot
   be compared across versions.

The 500-target absolute gate and representative graph coverage are binding.
The exact depth sequence above may evolve as an operational protocol without
changing CAP-7 product behavior, but any change creates a new protocol version
and cannot be compared to an `ACM9-MVP-v1` baseline.

**Ratification coverage (2026-09-02):** the 500-record / 2-second permission-resolution
NFR is tracked as blocker `QUALITY-GATE-AC-NFR`. It closes only on an ACM9-MVP-v1
**final** artifact with `status: PASS` at 500 requested active targets and warm p95
plus worst case ≤ 2 seconds. ACM-8 composition is not a substitute. This is not a
release-readiness claim.

## Test data isolation (DEC-UM-010)

Gate E2E for `user-management` follows an approved two-phase progression:

1. **Initial (active now):** Run the Playwright suite with **one test worker**. Each run/test uses a collision-proof UUID namespace and deletes only data it owns. Concurrency scenarios (`@concurrency`) issue parallel HTTP inside one isolated test via `Promise.all`; they do not require multiple test workers.
2. **Before enabling parallel test workers:** Provision **one PostgreSQL schema per worker** and clean up that schema after the run. `Date.now()` prefix alone is not sufficient.

Parallel developers never share mutable test state across workers. This is platform infrastructure — feature owners do not invent ad-hoc isolation per story.

## Ownership (AD-4)

The feature owner drives their own scenario → test → code sequence. Approvals are asynchronous peer reviews — there is no dedicated test-author role, and nobody's stage 1 blocks anybody else's stage 3. One person waiting on another is a process defect (§8.2).
