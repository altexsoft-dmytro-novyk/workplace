# Good-Spine Re-review — Accepted Repair Decisions

**Final verdict: PASS — the five accepted repair decisions are explicit, enforceable, and synchronized sufficiently to prevent downstream unit divergence.**

## Scope and evidence

This re-review applies the good-spine checklist in
`.agents/skills/bmad-architecture/references/reviewer-gate.md` only to:

- inherited AD-20 scoped precedence;
- `AccessControlBootstrap` singleton provenance and the common advisory lock;
- path-local Reporting traversal horizon;
- FR policy-type totality and FR-only `PolicyPermissions`; and
- `ACM9-MVP-v1` artifact and protocol rules.

Reviewed:

- `ARCHITECTURE-SPINE.md`
- parent People Management `ARCHITECTURE-SPINE.md`
- `fr-architecture-amendment.md`
- Access Control Kernel MVP `SPEC.md`
- approved Kernel MVP sprint-change proposal
- `docs/architecture/access-control.md`
- `docs/architecture/database-schema.md`
- `docs/architecture/testing-strategy.md`

The deterministic spine linter passed with zero findings.

## Critical findings

None.

## High findings

None.

## Decision evidence

### 1. Inherited AD-20 scoped precedence — PASS

The spine now includes AD-20 in `binds` and in Inherited Invariants. It states
the precedence rule directly: inherited due/departure cutoff and
dismissed-target projection remain the binding future target, while local AD-4
formally defers request-time evaluation only for ACM-1/ACM-2 in this Kernel
MVP because no Departure persistence seam exists.

The exception is bounded in both directions:

- `User.isActive` remains mandatory now;
- later lifecycle and full-facade work receive no exception;
- the future dismissed-target behavior is not redefined; and
- appearance of the persistence seam does not authorize implementation—a new
  AD-1 sequence is still required.

The approved FR amendment repeats the same scoped amendment. The Kernel SPEC
and proposal consistently defer the absent dependency without claiming that
AD-20 is implemented. A unit loading parent and child decisions therefore has
one deterministic precedence rule.

### 2. Bootstrap singleton provenance and advisory lock — PASS

AD-4 now defines one Access Control-owned `AccessControlBootstrap` singleton
keyed `root-hr-admin`, durably recording:

- `normalizedRootEmail`;
- `rootUserId`; and
- `policyId`.

The canonical database schema fixes the singleton key with a `CHECK`, unique
identity fields, and restrictive references. This record identifies the
bootstrap attachment without treating later administrator-created
`hr-admin` attachments as seed-owned state.

Every ACM-1 transaction must acquire the same transaction-scoped PostgreSQL
advisory lock derived from
`access-control:bootstrap:root-hr-admin` before inspecting bootstrap state.
While holding it, the transaction locks and revalidates the singleton,
candidate User, and recorded attachment before writes and before commit. The
rule explicitly covers first creation when no singleton or attachment row
exists. Lock timeout, identity ambiguity/inactivity, configuration drift, or
attachment mismatch fails atomically.

The spine, amendment, Kernel SPEC, proposal, access-control document, and
database schema agree on lock order, provenance, drift behavior, and
preservation of later administrator state. The prior absent-row and ownership
ambiguities are closed.

### 3. Path-local Reporting traversal horizon — PASS

AD-1 now fixes both visited-state scope and the success horizon:

- visited state is local to one requested target;
- shared ancestors across different target walks are valid, not repeats;
- traversal succeeds and ends when it reaches the viewer; and
- only a node repeated before viewer proof invalidates Reporting for that
  target.

Self and direct PP remain independently evaluated, and Colleague remains the
ordinary fallback only when no stronger valid audience survives. The Kernel
SPEC, sprint proposal, and canonical access-control document repeat this
contract. Bulk order, cycles above an already-proven viewer, and malformed
paths can no longer receive opposite outcomes from two conforming resolvers.

### 4. FR policy-type totality and grant boundary — PASS

The spine and approved amendment require `Policies.type` to be `NOT NULL` and
restricted to `FR|AR`. The canonical database schema carries the same
nullability and its two-arm row-shape `CHECK`, so every policy belongs to
exactly one admitted type.

`PolicyPermissions.policyType` is independently:

- `NOT NULL DEFAULT 'FR'`;
- constrained by `CHECK (policyType = 'FR')`; and
- part of a restrictive composite foreign key to unique
  `Policies(id, type)`.

Together with pair uniqueness and the restrictive permission foreign key,
this makes AR-policy grants structurally impossible and prevents an untyped
policy row from bypassing the intended totality. The Kernel SPEC identifies
the reviewed custom PostgreSQL migration as the enforcement boundary.

### 5. `ACM9-MVP-v1` protocol and artifacts — PASS

The spine retains only the architecture-owned requirements: real PostgreSQL
facade evidence, 500 targets, representative Reporting/direct-PP/Colleague/
mixed fixtures, separate baseline and final evidence, the two-second
warm-p95/worst-case absolute gate, statement-timeout failure, and immediate
stop at the first breach.

The versioned operational protocol in `testing-strategy.md` now fixes:

- independent fixture/depth gates;
- depth order;
- five discarded warm-ups and twenty measured calls;
- nearest-rank p50/p95;
- end-to-end public-facade timing including transaction and result mapping;
- `EXPLAIN (ANALYZE, BUFFERS)` outside latency samples; and
- baseline/final comparability by protocol version and fixture-manifest hash.

Every started run must publish a new immutable append-only artifact with a run
id, baseline/final role, and terminal `PASS`, `FAIL`, or `INCOMPLETE` status.
Setup failure and partial threshold failure still leave evidence. Required
metadata includes revisions, environment identity, completed results, first
breach/timeout, and stop reason. A final artifact references its approved
baseline; a protocol or fixture mismatch is `INCOMPLETE`, and a protocol
change requires a new version rather than reinterpretation of an
`ACM9-MVP-v1` baseline.

This preserves the correct architecture/operations separation without leaving
the measurement gate statistically or auditably ambiguous.

## Validation obligations

### Automation candidates

- Concurrent identical and conflicting-root ACM-1 executions against real
  PostgreSQL, including first creation with no singleton row.
- Rerun after later administrator-created `hr-admin` attachments, proving
  bootstrap provenance and non-destructive behavior.
- Migration-catalog tests for `Policies.type` totality and every
  `PolicyPermissions` check, key, index, and restrictive foreign key.
- Reporting fixtures for shared ancestors, repeats before viewer proof, cycles
  after viewer proof, and mixed direct-PP/cyclic paths.
- Golden tests for nearest-rank percentiles and the `ACM9-MVP-v1` artifact
  schema, including breach, timeout, setup failure, incomparable final, and
  append-only rerun cases.

### Manual validation

- Inspect the generated PostgreSQL migration and actual catalog; Prisma schema
  review alone cannot prove the custom constraints or advisory-lock behavior.
- Review seed lock order and bounded lock-timeout diagnostics under deployment
  concurrency.
- Review raw ACM-9 plans, fixture manifests, and immutable artifacts;
  threshold automation alone does not prove fixture representativeness.

## Gate recommendation

The requested repair passes the good-spine gate. No Critical or High finding
remains in scope. This review does not authorize Stage-1, tests, migrations,
seed changes, production code, User Management integration, or AD-20
implementation; the existing approval boundaries remain in force.
