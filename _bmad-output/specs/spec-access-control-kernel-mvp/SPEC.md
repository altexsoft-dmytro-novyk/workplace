---
id: SPEC-access-control-kernel-mvp
status: approved
implementation_status: stage-1-authorized
package_review_approved_by: user
package_review_approved: 2026-08-31
companions:
  - ../../planning-artifacts/sprint-change-proposal-2026-08-30-access-control-kernel-mvp.md
  - ../../planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md
  - ../../planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md
  - ../../../docs/architecture/access-control.md
  - ../../../docs/architecture/database-schema.md
  - ../../../docs/architecture/testing-strategy.md
  - ../../../docs/architecture/user-management-test-decisions.md
  - ../../implementation-artifacts/access-control/acm-4-coverage-audit.md
  - ../../implementation-artifacts/access-control/acm-1-stage1-coverage-audit.md
sources: []
---

> **Canonical contract.** This SPEC and the adopted companions above define the
> Kernel MVP under independent review. Planning decisions in adopted companions
> remain approved, but this package authorizes no scenario, test, migration,
> seed, production-code, or User Management dispatch.

# Access Control Kernel MVP

## Why

ACF-1 established the Phase-0 audience resolver, but kernel behavior and
production `/users` adoption were coupled under one failed product gate. This
SPEC isolates a deployable, directly verifiable Access Control Kernel so its
authorization behavior, functional-role foundation, composition, and
PostgreSQL performance can advance without changing User Management or
misrepresenting kernel evidence as production enforcement.

## Capabilities

- **CAP-1 — Fail-closed audience resolution (ACM-3)**
  - **intent:** The kernel resolves inactive or missing viewers, targets,
    Reporting bridges, and PP endpoints without deriving access through invalid
    identity paths.
  - **success:** Viewer identity validation — the viewer exists and is active —
    runs before any audience derivation, Self included, and Self is exclusive
    only after **both** viewer and target are confirmed present and active;
    where the target is the viewer, one confirmation settles both. Each distinct
    requested target has one map entry and duplicate targets collapse to one
    key; an empty target list returns an empty map immediately with no
    relationship-graph read; inactive or missing viewers and targets produce an
    empty audience `Set`, never Self and never the Colleague floor. Reporting
    visited state is path-local per target, and shared ancestors across targets
    are valid. Reaching the viewer proves the viewer sits on that target's chain
    but is **provisional**: the walk continues to chain termination, and
    Reporting is granted only when that target's whole walked chain terminates
    without repeating a node. A repeated node anywhere in the chain, **before or
    after viewer proof**, denies Reporting for that target only, so a viewer
    inside a cycle is denied rather than proven. Chain termination is the
    absence of a further usable manager edge: an **absent** edge is a clean end,
    and an edge whose **endpoint is inactive** is unusable and treated as absent
    for traversal — denying Reporting before viewer proof, and granting it after
    viewer proof since the chain has then terminated without a repeat, with
    nothing above the dead node reachable. An edge whose **endpoint row is
    missing** is unreachable in supported operation, because
    `relationships_shape_check` requires a non-null endpoint and the endpoint
    foreign key is `ON DELETE RESTRICT`; it is a defensive rule, not a
    constructible scenario. Self and direct PP are evaluated independently of
    any Reporting denial, and Colleague follows the ordinary
    no-stronger-audience fallback.

- **CAP-2 — Multi-audience input merge (ACM-4)**
  - **intent:** The kernel validates through its real PostgreSQL facade that the
    Phase-0 resolver retains every audience needed by the section evaluator.
  - **success:** Real migrated-PostgreSQL facade evidence covers Reporting,
    direct PP, Colleague, and mixed fixtures; proves Reporting/direct PP coexist
    without duplicates, Self is exclusive once viewer and target are confirmed
    present and active, Colleague appears only with no stronger audience, and FR
    permissions never enter the result. The 2026-08-31 ACM-4 audit found all
    six required coverage classes missing and is persisted as an adopted
    companion. Its HALT remains in force until the separately approved
    `ACM-4R` repair sequence adds and independently approves the scenario
    contracts, then establishes the real-facade evidence and disposition. Any
    missing approved scenario coverage **or** concrete behavior gap halts Stage
    2 onward and starts a separate AD-1 sequence.

- **CAP-3 — Functional-role data foundation (ACM-1)**
  - **intent:** The kernel stores type-separated functional roles, permissions,
    grants, and user attachments as live PostgreSQL data with a deterministic
    bootstrap.
  - **success:** The reviewed custom migration makes `Policies.type` non-null,
    restricts it to FR/AR, and enforces AD-4 row shapes,
    uniqueness, restrictive foreign keys, the permission-first index, and
    FR-only grants through a `policyType='FR'` check plus composite foreign key
    to unique `Policies(id, type)`. CAP-8 has already ensured the normalized
    active root User. ACM-1 normalizes `ROOT_WORK_EMAIL`, begins one
    transaction, acquires the common bootstrap advisory lock, and
    locks/revalidates the `AccessControlBootstrap` `root-hr-admin` singleton,
    User, and recorded attachment. The singleton persists normalized email, root
    User id, and policy id, then ACM-1 ensures the three permissions, one FR
    policy, three grants, and one attachment. Stage-1 and Stage-2 each cover all
    thirteen database invariants enumerated in `database-schema.md` — row
    shapes, the partial FR role key, the `Policies(id, type)` support key,
    `Permissions.key` uniqueness, pair uniqueness, the discriminator and its
    restrictive composite foreign key, the restrictive `Permissions` foreign
    key, the permission-first index asserted via `pg_indexes`, `UserPolicies`
    integrity, the singleton constraints, and `ON DELETE RESTRICT` delete
    behavior. With the singleton **absent**, ACM-1 adopts an existing FR
    `hr-admin` policy by natural key and an existing attachment only when it
    already belongs to the located root; attachments belonging to anyone else
    are neither adopted nor transferred. With the singleton **present**, a
    changed root email neither transfers nor adds an attachment. An AR policy
    carrying `targetRole='hr-admin'` is a different object: never adopted,
    mutated, counted, or reported as drift. Any conflicting drift, lock timeout,
    or failure rolls back the transaction, and later administrator attachments
    remain distinct. The 2026-08-31 ACM-1 Stage-1 coverage audit
    found the approved `ACM1-FB-01 .. ACM1-FB-09` contracts cover three of the
    thirteen invariants fully, three partially, and seven not at all, and is
    persisted as an adopted companion. Its HALT remains in force until the
    separately approved `ACM-1R` repair sequence adds and independently approves
    the missing scenario contracts and produces one committed-red Stage-2 suite
    over their union with the original nine. Partial coverage is not a passing
    ACM-1: a Stage-2 record covering only the original nine does not authorize
    `ACM-1-production`.

- **CAP-4 — Live type-separated permission decision (ACM-2)**
  - **intent:** Consumers ask `AccessControlFacade.isAllowed(userId,
    permissionKey)` for a current global functional-permission decision.
  - **success:** Evaluation reads only live `type='FR'` data and returns `false`
    for inactive or missing users, unknown or differently-cased keys, absent
    grants, wrong-type policies, and nonmatching joins. It branches on no
    role/key name, reads no audience data, persists or caches no decision, and
    grants no audience or section access. AD-20 due/departure evaluation is
    deferred until a Departure persistence seam exists.

- **CAP-5 — Base S1/S10/S11 section access (ACM-5)**
  - **intent:** The kernel converts resolved Phase-0 audiences into a base
    section decision for S1, S10, and S11 only.
  - **success:** `canAccessSection(viewerId: string, section: string,
    targetEmployeeId: string): Promise<SectionAccess>` uses
    `SectionAccess = 'none' | 'read' | 'write'`; S1 is `read` for
    Self/Colleague and `write` for Reporting/direct PP; S10 and S11 are `read`
    for every Phase-0 audience; audiences merge `write > read > none`; and a
    successful read returns `none` for unsupported strings, missing targets, or
    empty audience sets.

- **CAP-6 — Deployable kernel composition (ACM-8)**
  - **intent:** The production application container makes the completed
    headless Access Control Kernel available without adopting it in User
    Management.
  - **success:** After ACM-2, ACM-3, and ACM-5 complete, `AppModule` imports
    `AccessControlModule` and resolves `AccessControlFacade`, while
    `ACCESS_CONTROL_PORT` remains bound to `InterimAccessControlAdapter`; no
    User Management file, `/users` behavior, or Access Control HTTP/debug
    endpoint changes.

- **CAP-7 — 500-target PostgreSQL evidence (ACM-9)**
  - **intent:** The team can pass or fail the resolver's real PostgreSQL
    performance at the Kernel MVP workload without changing behavior.
  - **success:** Separate baseline and post-ACM-8 artifacts use 500 targets and
    representative Reporting, direct PP, Colleague, and mixed graphs, recording
    PostgreSQL version, fixtures, warm-up and measured-run counts, p50, warm
    p95, worst case, query count, and `EXPLAIN (ANALYZE, BUFFERS)`. Any warm-p95
    or worst-case value above two seconds, or statement timeout, fails ACM-9 and
    stops the harness immediately. A post-composition slowdown within both
    absolute limits is recorded but does not fail this MVP. Every started run
    reserves its append-only artifact **before every fallible step** — fixture
    construction, database connection, and manifest hashing included — under the
    versioned `ACM9-MVP-v1` protocol, and finalizes it to PASS, FAIL, or
    INCOMPLETE; a finalization failure leaves the reserved INCOMPLETE artifact
    and exits nonzero. Non-timeout infrastructure errors finalize INCOMPLETE
    with an `error_class`, never PASS and never FAIL. Final evidence references
    a baseline whose protocol, fixture, and environment-manifest hashes match
    under the canonical `ACM9-MANIFEST-v1` serialization; a recorded absolute
    breach or statement timeout finalizes FAIL **regardless** of a manifest
    mismatch, while a mismatch with no breach finalizes INCOMPLETE and
    suppresses only the slowdown comparison.

- **CAP-8 — Deploy-time root User prerequisite (ACM-0)**
  - **intent:** A fresh deployment can satisfy ACM-1's root identity
    requirement without any User Management feature work.
  - **success:** Running `npm run db:seed` against a freshly migrated database
    leaves exactly one active User whose DEC-UM-007-normalized `workEmail`
    equals the normalized `ROOT_WORK_EMAIL`. The step trims and lowercases, and
    **stores the normalized value** so storage is canonical and the existing
    `users_workEmail_key` index blocks a duplicate normalized row. Eligibility
    counts **all** normalized matches first and checks active state only
    afterwards, so a count other than one fails as unmatched or ambiguous before
    `isActive` is consulted. A blank, unmatched, ambiguous, or inactive root
    identity fails with actionable diagnostics, and a normalized match that is
    not the intended root is never adopted, mutated, or reactivated. Concurrent
    runs converge: the loser of the insert race takes the unique violation,
    re-reads, and re-validates, leaving no partial state. It creates no
    permission, FR policy, grant, or attachment. Writing that one root row at
    the deploy-time seed is the whole of its write scope: it adds no User
    Management API, route, controller, handler, runtime role management, or
    other User Management feature, so "no CRUD" bars the CRUD **surface**, not
    this single deploy-time row.

## Constraints

- Approved Correct Course, AD-3/AD-4 architecture, and FR-AMD-1 decisions are
  authoritative. OQ-3, OQ-4, OQ-6, OQ-7, and OQ-11 are resolved and must not be
  reopened. FR-AMD-1 carries one gate statement: its architecture decisions are
  approved and final under `approval_scope: architecture-decision-only`, and
  **no Stage-1 dispatch is authorized until this package's review is approved**.
- Dependencies are ACF-1 → ACM-3; ACF-1 → ACM-4 → ACM-5; approved FR
  architecture → ACM-0 → ACM-1 → ACM-2; ACM-2 + ACM-3 + ACM-5 → ACM-8. ACM-9
  baseline runs before ACM-8 and repeats after ACM-8.
- Two dependencies are conditional and are checked against persisted artifact
  state, never free-text ordering. ACM-5 requires
  `_bmad-output/implementation-artifacts/access-control/acm-4-disposition.yaml`
  to exist with `disposition: no-gap`. ACM-8 and ACM-9-final require the ACM-9
  baseline artifact to exist with `status: PASS` **and** a protocol version
  matching the run that consumes it — a PASS baseline recorded under a
  different protocol version is not comparable and does not satisfy the gate.
  Each is an exact path, field, and required-value triple that `validate.py`
  checks.
- Only a PASS ACM-9 baseline satisfies the baseline dependency. A FAIL or
  INCOMPLETE baseline halts ACM-8 and ACM-9-final dispatch and opens separately
  AD-1-gated remediation; a rerun that omits the failing shape does not
  supersede it.
- ACM-3 and ACM-4 end at audience-resolution outputs. ACM-5 alone owns
  `canAccessSection`; it does not own photo commands, narrowed field
  projection, serialization, or functional-permission checks.
- ACM-4 preserves its IDs but is not already proven. It requires a scenario
  coverage audit and real migrated-PostgreSQL facade validation, and is
  authorized to add and commit reproducible integration test files inside the
  kernel Stage-2 boundary; it cannot invent retroactive red history, produce
  throwaway evidence, or change production code. Because it changes no
  production code it runs under the named **validation-only evidence exception**
  in `testing-strategy.md`: its characterization tests may be committed green,
  they are never a Stage-2 gate for a production change, and any remediation
  re-enters the ordinary three-stage sequence with a real committed-red test.
  **Any missing approved scenario coverage or concrete behavior gap** halts
  Stage 2 onward — ACM-4-red-tests, ACM-4-production, and ACM-5 — starts a
  separately approved AD-1 sequence, and requires re-running Story Breakdown
  before the package resumes. The persisted 2026-08-31 audit has found that
  coverage gap, so those original dispatches are not eligible to run.
  `ACM-4R-scenarios` is the required separate Stage-1 repair and must author
  all six missing CAP-2 contracts: multi-audience retention, confirmed-active
  Self exclusivity, Colleague as a no-stronger-audience floor, Reporting plus
  direct-PP coexistence without duplicates, FR-permission separation, and a
  representative mixed PostgreSQL fixture. Only after its independent approval
  may `ACM-4R-tests` run real facade evidence. Green characterization is
  allowed only when it proves already-shipped behavior and authorizes no
  production change; a behavior gap instead requires a real committed-red test
  and an independently approved `ACM-4R-production` dispatch. The original
  CAP-2 disposition path remains the sole ACM-5 gate and may be written only
  by `ACM-4R-disposition` after the repair reaches `no-gap`.
- ACM-1's Stage 1 was dispatched partially. The nine approved `ACM1-FB`
  contracts are valid and are not reopened, but they do not satisfy CAP-3's
  own rule that Stage 1 and Stage 2 **each** cover all thirteen invariants, nor
  `database-schema.md`'s "partial coverage is not a passing ACM-1". The original
  `ACM-1-red-tests` dispatch is therefore halted rather than reinterpreted: it
  requires proving all thirteen while translating only approved scenarios, and
  seven have no approved scenario, so no dispatch can satisfy both halves.
  Closing that gap by authoring the missing contracts in test form is a Stage-1
  act inside a Stage-2 dispatch and is prohibited. `ACM-1R-scenarios` is the
  required separate Stage-1 repair; `ACM-1R-tests` then produces a single
  committed-red suite over the union of the original nine and the repair
  contracts, because the thirteen invariants are properties of one migration and
  no split Stage-2 record could be read as CAP-3 proven. `ACM-1-production` is
  unchanged in subject and scope and becomes eligible only on that record.
  ACM-3's approved partial Stage 2 is not a counter-precedent: a partial Stage 2
  is a legitimate increment that leaves its story `in-progress`, and ACM-3 has
  no Stage-3 approval either.
- Every code slice follows AD-1 as three distinct dispatches: scenario prose,
  explicit human approval, committed-red Stage-2 evidence, explicit human
  approval, then production implementation. No automated workflow or agent may
  author or cross two stages in one dispatch.
- Every dispatch entry in `stories.yaml` has both `spec_checkpoint: true` and
  `done_checkpoint: true`; the authoring agent cannot approve its own output.
- Every AD-1 stage approval is appended to `approvals.yaml` beside this SPEC as
  `story_id`, `stage`, `repo`, `artifact_path`, `commit`, `author`, `approver`,
  `decision`, and `timestamp`. `repo` is `workspace` or `services/backend` and
  `artifact_path` is relative to that repository's root: this workspace spans
  two git repositories, so a bare revision cannot identify which one, and an
  unresolvable approval is not verifiable. `author` and `approver` must differ,
  and a dispatch may not start until the prior stage's record exists **and**
  verifies — the commit resolves in the named repository and the artifact is
  present at that revision. A prose
  assertion that a stage was approved is not an approval. The ledger is
  append-only; a superseding decision is appended, never edited in place.
- Stage-2 uses the public `AccessControlFacade` through a real Nest testing
  module importing `AccessControlModule`, real Prisma adapters, migrated
  PostgreSQL, and seeded fixtures. Access Control repository fakes, User
  Management provider overrides, and artificial HTTP endpoints are prohibited.
  ACM-0 differs in subject, not rigor: its subject is the deploy-time root User
  step, so its Stage-2 evidence runs against migrated PostgreSQL without a
  facade call while every prohibition above still holds.
- Deploy-time stories invoke their **exact named production entrypoint**.
  ACM-0's is `services/backend/prisma/seed.ts` (`npm run db:seed`); ACM-1's is
  `services/backend/src/access-control/infrastructure/bootstrap/access-control-bootstrap.ts`
  wrapped by `services/backend/scripts/bootstrap-access-control.ts`
  (`npm run db:bootstrap:access-control`). Deployment order is `db:deploy` →
  `db:seed` → `db:bootstrap:access-control` → `start:prod`. Re-implementing a
  step's normalization, eligibility, or bootstrap logic inline in a test proves
  the test rather than the deployed path and does not satisfy the story.
- Functional and access-role evaluation remain type-separated. FR grants never
  widen audiences or section access, and no decision is cached across requests.
- Bootstrap ownership is limited to the three canonical permission keys, the FR
  `hr-admin` policy, their three canonical grant pairs, the normalized root
  attachment, and the `AccessControlBootstrap` singleton. Reruns restore missing
  owned rows, fail before writes when an identity or authorization-bearing field
  differs, preserve descriptive fields and generated ids, and never delete or
  rewrite administrator-added rows, grants, or attachments; an approved fourth
  permission or grant survives. FR-AMD-1 carries the field-by-field table.
- Concurrent identical seeds must converge to one bootstrap set with no partial
  state; conflicting execution fails atomically with actionable diagnostics.
- CAP-8 runs before ACM-1 and normalizes `ROOT_WORK_EMAIL` under DEC-UM-007.
  Identity is canonical **at write**: ACM-0 stores the normalized value, so the
  existing `users_workEmail_key` unique index blocks a duplicate normalized row.
  "Exactly one active User" means exactly one active User whose normalized
  `workEmail` equals the normalized `ROOT_WORK_EMAIL`; unrelated active
  employees never affect that count. Eligibility counts **all** normalized
  matches first and checks active state only afterwards, so a count other than
  one fails as unmatched or ambiguous before `isActive` is consulted.
  Normalized uniqueness is **not** database-enforced — `users_workEmail_key`
  indexes the raw stored value — so the guarantee is writer-side. Pre-existing
  non-normalized rows can still yield more than one normalized match; ACM-0
  fails closed and never repairs them, and a database-enforced unique functional
  index is separately gated deferred work outside CAP-8's boundary.
- CAP-8's write scope is exactly one root `User` row at the deploy-time seed.
  It authorizes no User Management API, route, controller, handler, runtime
  role management, or other User Management feature work — the CRUD prohibition
  bars that surface, not the single deploy-time row CAP-8 exists to write — and
  it does not implement User Management Story 1.1's population import. That
  import is not blocked, but it **is** constrained by an already-approved
  decision: under DEC-UM-009 no writer may create a second row for a normalized
  email that already exists, active or inactive. An import covering the root
  person must therefore reuse the root `User` id CAP-8 created rather than
  insert a second row.
- ACM-1 locks and revalidates the root User and seed-owned attachment inside its
  transaction before writes and before commit. It first takes one common
  transaction advisory lock and uses the unique `AccessControlBootstrap`
  singleton as durable provenance, including when no attachment exists yet.
  A normalized email change after bootstrap is conflicting drift; no
  attachment transfer or second root attachment is allowed. With **no**
  singleton recorded there is no provenance to contradict: ACM-1 adopts an
  existing FR `hr-admin` policy by natural key and an existing attachment only
  when that attachment already belongs to the located root, then writes the
  singleton, while attachments belonging to anyone else stay non-bootstrap
  administrator state. The asymmetry is deliberate — singleton absent permits
  adoption, singleton present forbids transfer.
- FR role-key uniqueness is the **partial** index `UNIQUE targetRole WHERE
  type='FR'`, so an AR policy carrying `targetRole='hr-admin'` is legal and is a
  different object. ACM-1's lookup and ACM-2's evaluation always filter
  `type='FR'`; that row is never adopted, mutated, counted, or reported as
  drift, is preserved, can hold no grant, and a `UserPolicies` row attaching to
  it is never bootstrap state.
- Restrictive foreign keys make physically orphaned FR grant rows unreachable
  in supported operation. Acceptance covers wrong-type and nonmatching joins,
  not corruption states with disabled constraints. The same reasoning applies to
  relationship edges: `relationships_shape_check` requires a non-null endpoint
  and the endpoint foreign key is `ON DELETE RESTRICT`, so a bridge edge whose
  endpoint row is missing is unreachable and is a defensive rule rather than a
  constructible scenario.
- `User` has no soft-delete column; `isActive` is its only lifecycle field. No
  soft-deleted `User` or bridge behavior is described anywhere in this MVP, and
  no field is invented to support one.
- Database timeout, connection, transaction, and query failures reject the
  facade operation as infrastructure errors and return no authorization result;
  they are never converted to `false`, `none`, or an empty audience map.
- AD-20 due/departure checks and dismissed-target projection are deferred until
  the documented Departure persistence seam exists for the entire Kernel MVP,
  explicitly ACM-0 through ACM-5; ACM-8 only composes and ACM-9 only measures.
  This MVP neither requires that absent dependency nor redefines the future
  dismissed-target behavior or bypasses its future AD-1 gate.
  `docs/architecture/testing-strategy.md` carries the matching Kernel MVP
  exception on its global AD-19/AD-20 stage-1 scenario list.
- ACM-9 is measurement-only and changes no resolver behavior. Threshold failure
  requires a separate AD-1-gated remediation story.
- Mechanical validation of this package is a persisted, independently runnable
  script — `validate.py` beside this SPEC, run as
  `uv run _bmad-output/specs/spec-access-control-kernel-mvp/validate.py`. It
  reports the count of checks it actually ran; no check count or PASS claim may
  be made without it.
- ACM-9's exact graph-depth sequence is an operational protocol in
  `docs/architecture/testing-strategy.md`, not CAP-7 product behavior. Baseline
  and final artifacts stay separate, and the harness stops at the first
  absolute breach. `ACM9-MVP-v1` fixes five warm-ups, twenty measured facade
  calls, nearest-rank percentiles, independent fixture/depth gates, and
  EXPLAIN outside timed samples; every started run reserves its artifact before
  the first warm-up so no run can end without auditable evidence. Baseline and
  final environment hashes cover PostgreSQL configuration/version, runtime,
  CPU/memory limits, topology, and isolation/load policy, serialized under
  `ACM9-MANIFEST-v1` so equivalent runs hash identically. Precedence is
  explicit: a recorded warm-p95 or worst-case breach, or a statement timeout,
  finalizes `FAIL` **regardless** of manifest match, because the gate is
  absolute rather than comparative; a mismatch sets `comparability: mismatched`
  and suppresses only the slowdown comparison, and a mismatched run with no
  breach finalizes `INCOMPLETE`. A mismatch never upgrades a run to `PASS` and
  never erases a recorded breach.

## Non-goals

- User Management adoption is deferred work, not a story in this SPEC. A later
  User Management-owned package must define the consumer contract, production
  port rebinding, projection, route mapping, and real-consumer HTTP E2E.
- `/roles` API/UI, runtime role or permission management, the complete §2.3
  catalog, and any other default grant.
- Changes to `/users`, User Management files, frontend code, profile/list/
  filter/search/export projection, or closure of the product gate.
- User Management Story 1.1's seeded population import and its `um-seed-*`
  scenarios; CAP-8 covers only the single root User row that ACM-1 requires.
- Project, Department, or PP HR-line audiences; shared links; full-profile
  overlays; policy-level `IN`; AD-20 due/departure evaluation; or
  dismissed-target projection.
- S1 photo mutations, S10 dates-only projection, S11 project-name-only
  projection, and field/record serialization.

## Success signal

After each code slice independently passes all three human-gated AD-1 stages,
the production container resolves the Access Control facade, the facade
demonstrates the approved fail-closed audiences, FR decisions, and S1/S10/S11
base decisions against migrated PostgreSQL, and both separate ACM-9 runs
satisfy the two-second absolute pass/fail gate. User Management remains on its
interim adapter, due/departure behavior remains explicitly deferred, and the
product gate remains open for the separately deferred adoption work.
