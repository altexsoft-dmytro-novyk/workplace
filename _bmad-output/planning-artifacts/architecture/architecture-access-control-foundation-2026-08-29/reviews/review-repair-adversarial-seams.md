# Final Repair Adversarial Seam Review

**Reviewed artifact:** `ARCHITECTURE-SPINE.md` and its binding Kernel
companions after the final AD-20 and ACM9-MVP-v1 synchronization.  
**Method:** construct two independent downstream units that obey the adopted
text literally and test whether they can still produce incompatible
authorization, bootstrap, projection, or gate outcomes.

## Verdict

**PASS — ready to finalize the scoped headless Kernel MVP architecture.**

No remaining Critical or High finding was identified in the requested seams.
This verdict is architecture-only. It does not authorize scenarios, tests,
migrations, seed changes, production code, User Management adoption, or
closure of the product gate.

## Two compliant downstream units

### Unit A — direct implementation unit

- Uses the `AccessControlBootstrap` singleton keyed `root-hr-admin` as the only
  bootstrap provenance record.
- Acquires the common transaction-scoped PostgreSQL advisory lock before any
  bootstrap-state read, then locks and revalidates the singleton, candidate
  User, and recorded attachment before writes and commit.
- Implements `Policies.type` as non-null `FR|AR` and retains the FR-only
  `PolicyPermissions` check and composite foreign key.
- Uses path-local reporting state per requested target, treats shared ancestors
  across targets as valid, stops at viewer proof, and denies Reporting only
  when repetition occurs before proof.
- Defers AD-20 request-time due behavior for ACM-1 through ACM-5; ACM-8 only
  composes that kernel and ACM-9 only measures it.
- Produces baseline and final `ACM9-MVP-v1` artifacts using matching protocol,
  fixture, and environment-manifest hashes.

### Unit B — independent verifier unit

- Derives seed scenarios from the durable singleton rather than inferring
  ownership from all `hr-admin` attachments; later administrator attachments
  remain non-bootstrap state.
- Exercises identical-root and conflicting-root concurrency while requiring
  the same common advisory-lock domain.
- Verifies FR-only linkage through direct PostgreSQL constraint failures,
  including null/invalid `Policies.type` and attempted AR-policy grants.
- Builds set-oriented bulk reporting evidence with visited identity scoped by
  requested target and terminates each target walk at viewer proof.
- Excludes due/departure behavior from every behavioral Kernel slice and
  preserves the documented future dismissed-target projection for a separate
  AD-1 sequence after the persistence seam exists.
- Rejects final ACM-9 comparison as `INCOMPLETE` when protocol, fixture, or
  environment-manifest hashes differ and emits no absolute verdict or slowdown
  comparison.

The units choose different implementation and verification shapes but converge
on the same bootstrap state, grant integrity, audience results, deferral scope,
and performance-gate decision.

## Seam dispositions

### Root-email drift and locking — resolved

`AccessControlBootstrap(normalizedRootEmail, rootUserId, policyId)` provides
durable seed ownership independently of later administrator-created
attachments. Its singleton key and restrictive references preserve one
bootstrap identity.

The transaction-scoped advisory lock is acquired before inspection and covers
first creation when neither singleton nor attachment exists. Configuration
change, lock timeout, missing/ambiguous/inactive identity, singleton mismatch,
or attachment mismatch fails atomically. The seed neither transfers the root
attachment nor creates another one.

Stage-1 should pin the stable integer advisory-lock key derivation and test it
through real PostgreSQL. That is an implementation acceptance detail, not a
remaining architecture-level Critical/High ambiguity.

### FR-only grant integrity and discriminator totality — resolved

`Policies.type` is explicitly non-null and restricted to `FR|AR`. FR and AR row
shapes are database checked. `PolicyPermissions.policyType` is non-null,
defaults to `FR`, is constrained to `FR`, and participates in the restrictive
composite FK to `Policies(id,type)`. An AR policy therefore cannot receive a
permission grant even through direct SQL.

Pair uniqueness, the restrictive permission FK, and the permission-first index
are explicit. Application validation may improve diagnostics but cannot replace
the database boundary.

### Repeated-node audience behavior — resolved

The contract now fixes all decision-changing interpretation points:

- repetition state is path-local per requested target;
- shared ancestors across different targets are not repetition;
- reaching the viewer successfully terminates that walk;
- only a repeat before viewer proof denies Reporting for that target;
- Self and direct PP remain independently evaluated; and
- Colleague appears only when no stronger valid audience remains.

Set-oriented and per-target implementations can differ internally without
changing observable results.

### AD-20 deferral and future projection — resolved for Kernel scope

The spine, FR amendment, Kernel SPEC, stories/proposal, and canonical
architecture now align:

- due/departure checks and dismissed-target projection are deferred for the
  entire behavioral Kernel MVP, explicitly ACM-1 through ACM-5;
- ACM-8 only composes the approved kernel and introduces no due behavior;
- ACM-9 only measures it;
- `User.isActive` remains required now;
- the future current-manager/direct-PP read-only dismissed-target projection is
  not redefined; and
- the appearance of a Departure seam does not authorize implementation without
  a new AD-1 sequence.

Earlier shorthand mentioning ACM-1/ACM-2 is a subset statement; the later
explicit entire-Kernel scope supplies controlling detail and no longer permits
an ACM-3 interpretation split.

### ACM9-MVP-v1 threshold and artifact semantics — resolved

The protocol fixes:

- 500 active targets;
- independent Reporting, direct PP, Colleague, and mixed fixture/depth gates;
- five discarded warm-ups and twenty measured calls;
- nearest-rank p50/p95;
- end-to-end public-facade timing including transaction and mapping;
- `EXPLAIN (ANALYZE, BUFFERS)` outside timed samples;
- immediate stop on p95/worst-case above two seconds or statement timeout;
- an immutable append-only `PASS|FAIL|INCOMPLETE` artifact for every started
  run; and
- baseline/final identity through matching protocol, fixture-manifest, and
  environment-manifest hashes.

The environment manifest covers PostgreSQL configuration/version, runtime,
CPU/memory limits, database topology, and isolation/load policy. A mismatch is
`INCOMPLETE` and produces neither an absolute threshold verdict nor a slowdown
comparison. The prior environment-driven opposite-verdict seam is closed.

## Remaining non-blocking obligations

### Automation candidates

- Concurrent identical and differing-root seed tests against real PostgreSQL.
- Migration-catalog assertions for discriminator totality, row-shape checks,
  FR-only composite FK, pair uniqueness, restrictive FKs, and indexes.
- Reporting tests for repetition before proof, viewer-proof termination,
  shared ancestors, duplicate targets, and independent direct PP fallback.
- Static contract check that every Kernel artifact names the same AD-20 scope.
- ACM-9 artifact-schema tests and rejection of protocol, fixture, or
  environment hash mismatch as `INCOMPLETE`.

### Manual validation

- Review the exact advisory-lock integer derivation and migration SQL before
  Stage-2 approval.
- Review raw baseline/final artifacts and environment manifests; summary PASS
  text is not sufficient evidence.
- Keep the future AD-20 projection and User Management consumer mapping behind
  their own contracts and gates.

## Final disposition

- **Root-email drift/locking:** resolved.
- **FR-only grant integrity / `Policies.type`:** resolved.
- **Repeated-node audience behavior:** resolved.
- **AD-20 scoped precedence:** resolved.
- **ACM9-MVP-v1 threshold/artifact/environment semantics:** resolved.

**Remaining Critical findings:** none.  
**Remaining High findings:** none.
