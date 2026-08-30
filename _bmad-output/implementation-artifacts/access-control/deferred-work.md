# Deferred Work — access-control

Goals split out of the 2026-08-29 Access Control build run. Each entry is an
independently shippable deliverable; none is authorized by the current spec.

- source_spec: none
  summary: Functional-role catalog — runtime-extensible FR policies, granular permission grants, and the HR Admin role-management surface.
  evidence: Split from the Access Control build intent. FR assignment is its own data model and HTTP surface (`/roles` per api-conventions.md) and must stay off the AR tier-resolution hot path (access-control.md, type-separated evaluation), so it can be reviewed and merged without the audience resolver.

- source_spec: `_bmad-output/implementation-artifacts/access-control/spec-access-control-facade-audience-resolution.md`
  summary: Policy-level `IN` operator — define the product use case and a safe target-set model before adding support beyond equality.
  evidence: `Policies.targetId` is currently scalar, so `IN` has no defined set representation. The initial facade slice does not need it: bulk SQL `IN` used to fetch requested employee IDs is not a policy operator. Design the permitted target types, cardinality, storage and atomic mutation rules, indexes/query plan, and fail-closed behavior before adding schema, seed, or evaluator support.

- source_spec: none
  summary: Shared-link overlay — named-recipient profile shares with per-section selection, expiry, revocation, never-share set, and creator re-check on every view.
  evidence: Split from the Access Control build intent. §4.8 overlay has its own persistence, lifecycle, and endpoints, and is applied after relationship-derived audience merge; it depends on the facade but ships separately.

- source_spec: none
  summary: Full-profile access overlay — §2.4 separate grant with seeded first holder, grant/revoke journaling, and last-holder protection.
  evidence: Split from the Access Control build intent AND blocked on product decision: access-control.md records the overlay's §3.2 column mapping and its Self-precedence as unresolved. Implementing now would hard-code an undecided rule.

- source_spec: `_bmad-output/implementation-artifacts/access-control/spec-access-control-facade-audience-resolution.md`
  summary: Author the v1.5 AD-1 stage-1 access-control scenario suite — persona fixture and README, audience-derivation scenarios, and per-cell matrix read/write scenarios with first-class negatives.
  evidence: Split from the facade spec on size and on AD-1. `testing-strategy.md` forbids a single dispatch spanning stages, so scenario authoring and implementation cannot share a spec. The previous 202-file suite was withdrawn in commit `6086491` and is pre-v1.5, so this is fresh authoring against v1.5 §2/§3, not a restore. This is a hard precondition for the facade spec.

- source_spec: `_bmad-output/implementation-artifacts/access-control/spec-access-control-facade-audience-resolution.md`
  summary: Profile Projection — construct a safe `GET /users/:id` response from the facade's base section decision, including S1 derived-field immutability, Project-line S5 subset, colleague S10/S11 field subsets, S7/S8 record flags, and S16 custom-field visibility.
  evidence: `canAccessSection` returns only `none`/`read`/`write`; it cannot decide an endpoint's field or record shape. The projection owns serialization, calls the facade rather than reading policies or deriving audiences, and may only narrow its base section result. This must replace the current whole-`User` spread response before a profile endpoint is treated as permission-safe.

- source_spec: none
  summary: List, filter, export, and search projection — apply section and field-level access rules to every non-profile surface.
  evidence: Split from the Access Control build intent. §3.3.1 projection is a separate cross-cutting surface with its own leak-negative suite and the §7 2-second / 500-record budget; it consumes the facade rather than defining it.

- source_spec: `_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md`
  status: named residual risk of the 2026-08-30 Kernel MVP P2 repair; requires a separately gated story
  summary: Database-enforced normalized `workEmail` uniqueness — today the guarantee is writer-side only.
  evidence: `users_workEmail_key` (`20260810130423_init/migration.sql`) is a plain unique index on the **raw** stored `workEmail`. `create-user.dto.ts` and `update-user.dto.ts` normalize with `trim().toLowerCase()` on write, so API-created rows are canonical, but nothing in the database enforces that — and `prisma/seed.ts` currently stores `ROOT_WORK_EMAIL` verbatim. DEC-UM-007 states "uniqueness is enforced on the normalized value", which is not true of the schema. The Kernel MVP closes the seed half of this through ACM-0 (canonical storage on write) and fails closed when more than one normalized match exists, but it deliberately does **not** add the database constraint: a unique functional index over `lower(btrim("workEmail"))` is a migration on the `users` table, past CAP-8's stated "no User Management feature work" boundary. The follow-up must choose the index shape, decide how to remediate any pre-existing non-normalized rows it would reject, define the failure mode for concurrent inserts under the new constraint, and reconcile DEC-UM-007's wording with whatever ships.

## Open findings — checkpoint review of ACF-1, 2026-08-30

A `bmad-checkpoint-preview` walkthrough of the ACF-1 implementation raised seven
findings. One was fixed in place (the transaction claimed a no-torn-reads
guarantee that READ COMMITTED does not provide; the adapter now uses the
interactive form at REPEATABLE READ, which is the only form this driver adapter
honours). Two were dispatched to a separate build run and are listed here only
so the record is complete. The remaining four are unresolved and belong to
nobody yet.

The systemic gaps — missing AD-1 approval, the provisional HTTP mapping, and the
dormant module — are recorded separately as `gate_status: FAIL` in
`_bmad-output/test-artifacts/gate-decision.json`. These entries are the specific
technical ones underneath that verdict.

- source_spec: none
  status: needs an ownership decision before it can be scheduled
  summary: A deactivated viewer keeps the Reporting audience over their live reports.
  evidence: In `prisma-relationship-graph.adapter.ts` the `isActive` join constrains `r."userId"` — the person being walked to — in both the base and recursive terms. No predicate anywhere tests the viewer. Nothing upstream compensates: the interim session resolver returns `{ userId: persona }` for any string without an existence or activity check. Scenario ACF-FC-01 passes only because its deactivated user sits in the middle of the chain; move that user to the top and the same filter does nothing. AD-20 names the actor position first. The open question is ownership, not mechanism — refusing a switched-off account may belong to session validation, which is a User Management file this context must not edit (AD-2). If it belongs to the resolver instead, AD-1 requires a scenario before the code.

- source_spec: none
  status: unresolved
  summary: A deactivated target silently drops to Colleague instead of the dismissed-target projection.
  evidence: The same `isActive` join that blocks the bridge also blocks the target, so a manager loses a deactivated report entirely. `access-control.md` (AD-20) says the current manager or PP may still resolve the read-only dismissed-target projection. The behaviour is fail-closed and therefore safe, and departure handling is out of Phase-0 scope — but it is a rule no approved scenario states, and it was decided by the placement of a join rather than by a decision.

- source_spec: none
  status: unresolved
  summary: ACF-FC-01 cannot distinguish a blocked bridge from a blocked target.
  evidence: The fixture exercises the deactivated user in one position only — intermediate. The scenario claims the walk terminates at a broken node, but the same green would appear if the implementation merely refused deactivated targets. Two further cases separate them: a deactivated user at the top of the chain (the viewer), and a deactivated target with a live manager. This is why the finding above went unnoticed until the checkpoint.

- source_spec: none
  status: unresolved
  summary: The access-control e2e suite imports User Management domain internals.
  evidence: `test/access-control/audience-resolution.e2e-spec.ts` pulls `ACCESS_CONTROL_PORT` and the `AccessControlPort` type from `src/user-management/domain/interfaces/`. `domain-driven-design.md` forbids reaching into another context's `domain/`, "even to import just a type or a DI token symbol." No file of User Management was edited, but Access Control now depends on its domain surface from tests — and answer 2 of the integration contract request explicitly contemplates changing that port's signature, which would break this suite. There may be no way to write this test without the import; establishing that either way is the work.

- source_spec: dispatched to a separate build run, 2026-08-30
  summary: The facade returns one audience label per target where a viewer may hold several.
  evidence: `Map<string, Audience>` cannot express a viewer who is both manager and People Partner; the resolver prefers `reporting`. Harmless only while both audiences grant identically — §3.2's multi-audience merge and DEC-UM-001's PP-only S9 write rights end that as soon as the section matrix lands. This is the cross-context contract other bounded contexts will build against, so widening it is cheapest before adoption.

- source_spec: dispatched to a separate build run, 2026-08-30
  summary: The reporting walk descends from the viewer, so cost scales with the org, not the request.
  evidence: The recursive CTE expands every descendant of the viewer and only then filters `WHERE id IN (targets)`. A viewer near the top of the tree walks the whole company to open one profile. `access-control.md` bars full scans from the tier-resolution hot path and §7 requires 500 records within 2 seconds. Walking upward from each target bounds the cost to chain depth. The 9-person fixture cannot show the difference, so any fix needs a measurement, not an assertion.

- source_spec: `_bmad-output/test-artifacts/performance/p6-resolve-audiences-postgresql.md`
  status: accepted P6 finding; requires a separate follow-up story
  summary: Add database timeout headroom below the outer two-second request budget and define PostgreSQL `statement_timeout` error classification.
  evidence: The approved P6 PostgreSQL measurement found no valid acyclic shape over budget: 500 balanced targets had a warm p95 of 41.790 ms, and the valid depth-499 chain had a warm p95 of 161.165 ms. The separate timeout probe showed the outer budget firing first at 2001.103 ms; PostgreSQL cancellation arrived later at 2006.536 ms (database-only probe: 2054.437 ms, SQLSTATE 57014). The follow-up must choose explicit headroom, preserve fail-closed behavior, distinguish database cancellation from outer request timeout, and add error-classification coverage. P6 must not change Access Control production behavior; its opt-in benchmark and Markdown/JSON reports remain the reproducible baseline.
