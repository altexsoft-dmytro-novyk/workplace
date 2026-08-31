---
title: Sprint Change Proposal — Access Control Kernel MVP P2 Repair
date: 2026-08-30
status: approved
approval_scope: planning-repair-only
kernel_spec_status: approved
implementation_status: stage-1-authorized
package_review_approved_by: user
package_review_approved: 2026-08-31
mode: batch
scope: access-control-kernel-planning-package-only
supersedes_nothing: true
amends:
  - sprint-change-proposal-2026-08-30-access-control-kernel-mvp.md
approved_by: user
---

# Sprint Change Proposal — Access Control Kernel MVP P2 Repair

> **Status boundary.** Approval covers this planning repair only. The Kernel SPEC
> package stays `in-review` with `implementation_status: not-authorized`. No
> scenario, test, migration, seed, production-code, User Management, or frontend
> dispatch is authorized, and no BMAD gate is self-approved by this pass.

## 1. Issue Summary

An independent P2 review of `spec-access-control-kernel-mvp` confirmed eighteen
findings. They are not eighteen unrelated defects; they are four failure classes:

1. **Desynchronized semantics.** The approved Reporting-cycle rule and the
   identity-validation order live in some artifacts and not others, so a
   Stage-1 agent citing the sprint proposal would author the retired rule.
2. **Non-executable contracts.** CAP-8/ACM-0 cannot run on a fresh migrated
   database; the deploy-time prerequisite had no named executable owner; two
   conditional dependencies existed only as free-text ordering.
3. **Invented persistence.** Soft-deleted `User`/bridge behavior and
   database-enforced normalized `workEmail` uniqueness are both described in
   the package but neither exists in the schema.
4. **Process contradictions.** FR-AMD-1 both authorized and forbade Stage-1
   dispatch; ACM-4 is validation-only yet carried committed-red framing;
   a "200/200" mechanical validation was claimed without a runnable validator.

### Evidence from current repository reality

Read-only inspection of `services/backend` established three facts the repair
depends on:

| Source | Fact |
| --- | --- |
| `prisma/schema.prisma` | `User` has no soft-delete column. `isActive` is the only lifecycle field. |
| `prisma/migrations/20260830010000_access_control_relationships/migration.sql` | `relationships_shape_check` forces `reportsToUserId IS NOT NULL` on `direct` and `people_partner` rows, and the endpoint foreign key is `ON DELETE RESTRICT`. A bridge edge whose endpoint row is missing is structurally impossible. |
| `prisma/migrations/20260810130423_init/migration.sql`, `prisma/seed.ts` | `users_workEmail_key` is a plain unique index on the raw stored value. Create/update DTOs normalize on write; the seed does not. Normalized uniqueness is not enforced by the database. |

## 2. Impact Analysis

### Epic impact

- No epic is added, removed, or resequenced. The Access Control Kernel MVP epic
  gains the missing **ACM-0** story body and a corrected dependency graph.
- All existing CAP IDs (CAP-1 through CAP-8) and all 23 story IDs are preserved.
- `sprint-status.yaml` gains the three `acm-0-*` entries at `backlog`.

### Artifact impact

| Artifact | Change class |
| --- | --- |
| `specs/spec-access-control-kernel-mvp/SPEC.md` | Capability success and constraint edits |
| `specs/spec-access-control-kernel-mvp/stories.yaml` | Dispatch-text edits; IDs unchanged |
| `specs/spec-access-control-kernel-mvp/validate.py` | New — persisted mechanical validator |
| `specs/spec-access-control-kernel-mvp/approvals.yaml` | New — append-only stage-approval ledger |
| `architecture/.../ARCHITECTURE-SPINE.md` | AD-1, AD-3, AD-4 rule amendments in place |
| `architecture/.../fr-architecture-amendment.md` | Single gate statement; drift-table additions |
| `platform/epics.md` | ACM-0 story; ACM-3/ACM-4 acceptance; dependency graph |
| `docs/architecture/access-control.md` | Cycle rule, bridge taxonomy, Self ordering |
| `docs/architecture/database-schema.md` | Invariant enumeration; adoption rules |
| `docs/architecture/testing-strategy.md` | Approval ledger; validation-only exception; ACM-9 semantics |
| `implementation-artifacts/access-control/deferred-work.md` | New entry for the normalized-uniqueness gap |
| Both `.memlog.md` files | Append-only supersession entries |

### Technical impact

None executed. This proposal changes planning artifacts only. No application
code, Prisma schema, migration, seed file, or test is modified by this pass.

### UX impact

None. No screen, workflow, or frontend artifact is in scope.

## 3. Recommended Approach

**Direct Adjustment.** Effort medium, risk low, timeline impact none.

Rollback is not applicable — nothing is implemented. MVP Review is not
applicable — the MVP boundary is correct and is not the defect; the defect is
that the boundary was described in contracts that could not execute.

## 4. Detailed Change Proposals

### R1 — Reporting-cycle semantics synchronized

One rule, stated identically in SPEC CAP-1, spine AD-1, `access-control.md`,
the Kernel MVP sprint proposal, `epics.md`, and both memlogs:

> Reaching the viewer proves the viewer sits on that target's chain but is
> **provisional**: it does not by itself grant Reporting. The walk continues to
> chain termination, and Reporting is granted only when that target's whole
> walked chain terminates without repeating a node. A repeated node **anywhere
> in the chain, before or after viewer proof**, denies Reporting for that target
> only — a viewer inside a cycle is therefore denied rather than proven. Self
> and direct PP remain independently evaluated, and Colleague follows the
> ordinary no-stronger-audience fallback.

`sprint-change-proposal-2026-08-30-access-control-kernel-mvp.md` §5 carried the
retired "walk ends successfully at the viewer / repeated node **before** viewer
proof" wording and is corrected. `epics.md` ACM-3 was silent and gains the rule.
The architecture memlog held only the retired rule and receives an appended
supersession entry.

### R2 — Identity validation before Self

New explicit ordering in SPEC CAP-1, spine AD-1, `access-control.md` (Self row
of the §3.2 audience-column table), this package's ACM-3/ACM-4 acceptance, and
`epics.md`:

> Viewer identity validation — the viewer exists and is active — runs before any
> audience derivation, Self included. **Self is exclusive only after both viewer
> and target are confirmed present and active**; where the target is the viewer
> they are the same row and one confirmation settles both. An unconfirmed viewer
> or target yields an empty audience `Set`: never Self, and never the Colleague
> floor.

### R3 — Bridge contradiction resolved

The package previously called a missing bridge both a clean chain end and a
traversal denial. One taxonomy replaces both:

| Condition | Behavior |
| --- | --- |
| **No manager edge exists** for the node | Clean chain termination. The walked chain is complete; Reporting is granted if and only if the viewer was proven on it and no node repeated. |
| **Edge exists, its endpoint is inactive** | The edge is unusable and is treated as absent for traversal; the walk stops there. **Before viewer proof:** the viewer is unproven, so Reporting is denied for that target; Self and direct PP stay independent and Colleague applies as the floor. **After viewer proof:** the chain has terminated without a repeat, so Reporting is granted; nothing above the dead node becomes reachable. |
| **Edge whose endpoint row is missing** | Unreachable in supported operation — the shape `CHECK` requires a non-null endpoint and the foreign key restricts deletion. Recorded as an invariant and kept as a defensive rule; **not** required as a constructible Stage-2 scenario, following the pattern the SPEC already uses for physically orphaned FR grant rows. |

### R4 — Soft-deleted behavior removed

`User` has no soft-delete representation, so the package no longer describes
one. The phrase is removed from `SPEC.md`, `ARCHITECTURE-SPINE.md`, and both
occurrences in `access-control.md`, replaced by the R3 taxonomy. Kernel memlog
history is corrected by an appended entry, never rewritten. `UserEvents`
soft-delete in the career-timeline context is a different subject and is
untouched.

### R5 — CAP-8/ACM-0 made executable on a fresh migrated database

**Approved contract: ACM-0 creates and validates the normalized root User.**

A fresh migrated database has zero users, so a validation-only ACM-0 could never
pass and its root identity came from an unnamed prerequisite. ACM-0 now owns the
deploy-time root User step end to end: it normalizes `ROOT_WORK_EMAIL` under
DEC-UM-007, ensures the row exists with the normalized value stored, and then
validates exact-one active eligibility. There is no unnamed external
prerequisite left in the package.

CAP-8's boundary is unchanged in every other respect: it owns the single root
`User` row's existence, active state, and normalized identity only. It adds no
API, CRUD, route, runtime role management, or other User Management feature, and
it does not implement User Management Story 1.1's population import. That
import is not blocked, but DEC-UM-009 constrains it: no writer may create a
second row for a normalized email that already exists, so an import covering the
root person reuses the root `User` id CAP-8 created.

### R6 — Named production entrypoints and deployment order

| Story | Production entrypoint | Invocation |
| --- | --- | --- |
| ACM-0 | `services/backend/prisma/seed.ts` | `npm run db:seed` (`prisma db seed` → `tsx prisma/seed.ts`) |
| ACM-1 | `services/backend/src/access-control/infrastructure/bootstrap/access-control-bootstrap.ts`, wrapped by `services/backend/scripts/bootstrap-access-control.ts` | new `npm run db:bootstrap:access-control` |

**Deployment order:** `npm run db:deploy` → `npm run db:seed` (ACM-0) →
`npm run db:bootstrap:access-control` (ACM-1) → `npm run start:prod`.

ACM-1 gets its own entrypoint rather than extending the seed because OQ-11 gives
the functional-role slice sole ownership of the seed contract and evaluator;
folding the Access Control bootstrap into the User-shaped seed would split that
ownership. `prisma/seed.ts` is deploy tooling outside `src/user-management/**`,
so AD-2 is not crossed.

**Stage-2 rule:** ACM-0 and ACM-1 Stage-2 evidence must invoke these exact
production entrypoints against migrated PostgreSQL. Re-implementing the
normalization, eligibility, or bootstrap logic inline in a test does not satisfy
the story.

### R7 — Normalized workEmail identity resolved

**Approved model: canonical storage, with the database gap named.**

- **Storage.** ACM-0 normalizes by trim and lowercase **on write**, so the stored
  `workEmail` is itself canonical. The existing `users_workEmail_key` unique
  index then makes a second row with the same normalized value impossible.
- **Exact-one counting.** Count **all** normalized matches first — every row
  whose normalized `workEmail` equals the normalized `ROOT_WORK_EMAIL` —
  and only then check active state. A count other than one fails as unmatched or
  ambiguous **before** `isActive` is consulted. This prevents two rows differing
  only in case, one of them inactive, from silently resolving to a single active
  match.
- **Collision.** A normalized match that is not the intended root fails with
  actionable diagnostics. ACM-0 never adopts, mutates, reactivates, or reuses it.
- **Concurrency.** Two concurrent ACM-0 runs race on insert. The loser receives
  the unique violation on `users_workEmail_key`, treats it as "already created",
  re-reads, and re-runs the exact-one validation. Both converge on one row with
  no partial state.
- **Named residual risk.** There is **no database-enforced normalized
  uniqueness**. Pre-existing non-normalized rows can still produce more than one
  normalized match; ACM-0 fails closed in that case rather than repairing it.
  Closing the gap — a unique functional index on the normalized value — is
  separately gated work recorded in `deferred-work.md`. It is deliberately out of
  the Kernel MVP because it is a migration on the `users` table, past CAP-8's
  stated boundary.

### R8 — Dependency graph corrected

`Approved FR architecture → ACM-1 → ACM-2` becomes:

> **Approved FR architecture → ACM-0 → ACM-1 → ACM-2**

in this package's §6 equivalent, the amended Kernel MVP sprint proposal §6, and
the `epics.md` Kernel Dependency Graph. `epics.md` also gains the missing ACM-0
story body, and `sprint-status.yaml` gains its three `acm-0-*` entries.

### R9 — Single FR amendment gate statement

FR-AMD-1's "Status and Authority" section stated it authorized ACM-1 to enter
Stage 1, while its "Remaining Gate" section stated it authorized no Stage-1
dispatch. Both are replaced by one statement, used verbatim wherever the gate is
described:

> FR-AMD-1's architecture decisions are approved and final under
> `approval_scope: architecture-decision-only`. **No Stage-1 dispatch is
> authorized until the Kernel package review is approved.**

### R10 — Persisted, independently verifiable stage approvals

AD-1 approvals were prose assertions. A new append-only ledger,
`_bmad-output/specs/spec-access-control-kernel-mvp/approvals.yaml`, records one
entry per stage approval with `story_id`, `stage`, `artifact_path`, `commit`,
`author`, `approver`, `decision`, and `timestamp`.

Enforceable rules: `author` and `approver` must differ; a dispatch may not start
until the prior stage's record exists **and** verifies — the commit resolves and
the named artifact is present at that revision. The rules land in SPEC
constraints, `testing-strategy.md`'s AD-1 section, and every `invoke_dev_with`.
This repair writes the schema and an empty ledger; it records no approval.

### R11 — Conditional dependencies made executable

`stories.yaml` accepts no fields beyond `id`, `title`, `description`,
`spec_checkpoint`, `done_checkpoint`, and `invoke_dev_with`, so the gate state
lives in artifacts and the check is expressed as an exact triple of path, field,
and required value:

| Dependent | Precondition |
| --- | --- |
| ACM-5 (all three stages) | `_bmad-output/implementation-artifacts/access-control/acm-4-disposition.yaml` exists and `disposition == no-gap` |
| ACM-8 (all three stages) and ACM-9-final | The ACM-9 baseline artifact exists and `status == PASS` |

`ACM-4-production` writes the disposition file; ACM-9 runs already carry
`status`. The persisted validator (R17) checks both triples mechanically, so the
dependency no longer rests on free-text ordering.

### R12 — Absent-singleton bootstrap adoption and provenance

The drift table covered a present `AccessControlBootstrap` singleton only. Rules
for its absence are now explicit:

| Singleton absent, and… | ACM-1 behavior |
| --- | --- |
| No FR `hr-admin` policy and no attachment | First run: create the canonical rows and write the singleton. |
| An FR `hr-admin` policy already exists | **Adopt** it by natural key (`targetRole='hr-admin' AND type='FR'`) and record its id. Verify `operator='=='`, `managedBy='admin'`, and null `targetType`/`targetId`; fail on drift. Never create a second FR policy — the partial unique index forbids it. |
| Exactly one `hr-admin` attachment exists **and its `userId` is the located root** | **Adopt** it as bootstrap provenance and write the singleton. |
| `hr-admin` attachments exist but **none belongs to the located root** | **Do not adopt and do not transfer.** Create the located root's own attachment and write the singleton. The pre-existing attachments remain non-bootstrap administrator state and are preserved. |
| The configured root has changed | No recorded provenance exists, so there is no drift to detect. Adopt the currently configured normalized root. |

More than one candidate attachment for the root is impossible: `UserPolicies`
is keyed `(userId, policyId)`.

The asymmetry is stated deliberately because it is the security-relevant one:
**with the singleton absent, adoption is permitted; with the singleton present,
a changed normalized root is conflicting drift that fails atomically and never
transfers or duplicates the root attachment.**

### R13 — Cross-type hr-admin collision

FR role-key uniqueness is the **partial** index `UNIQUE targetRole WHERE
type='FR'`, so an AR policy row with `targetRole='hr-admin'` is legal and is a
different object. Binding rules:

- ACM-1's lookup and ACM-2's evaluator always filter `type='FR'`. An AR row with
  the same `targetRole` is never adopted, mutated, counted toward cardinality,
  or reported as drift, and it is preserved.
- It can hold no permission grant: `PolicyPermissions` fixes `policyType='FR'`
  by `CHECK` and references `Policies(id, type)` compositely.
- A `UserPolicies` row attaching a user to that AR policy is not an `hr-admin`
  functional-role attachment and is never bootstrap state.

### R14 — ACM-1 stages cover every CAP-3 database invariant

ACM-1 Stage-1 and Stage-2 previously covered roughly half of the CAP-3
invariants. The complete enumeration is now binding on both stages:

1. `Policies.type` non-null and restricted to `FR|AR`.
2. Row-shape `CHECK` — FR requires `targetRole` with null `targetType`/`targetId`; AR requires both target values.
3. Partial unique index on `targetRole WHERE type='FR'`.
4. Unique support key `Policies(id, type)`.
5. `Permissions.key` unique, immutable, lowercase `context:action`.
6. `PolicyPermissions` primary key `(policyId, permissionId)` rejecting duplicate grants.
7. `PolicyPermissions.policyType` non-null, default `FR`, `CHECK (policyType = 'FR')`.
8. Restrictive composite foreign key `(policyId, policyType) → Policies(id, type)`, so an AR-policy grant is rejected at the database boundary.
9. Restrictive foreign key `permissionId → Permissions.id`.
10. Permission-first index `(permissionId, policyId)`.
11. `UserPolicies` integrity — primary key `(userId, policyId)`, foreign keys to `User` and `Policies`; attachment to a nonexistent user or policy is rejected, and a duplicate attachment is rejected.
12. `AccessControlBootstrap` — primary key `key`, `CHECK (key = 'root-hr-admin')`, unique `normalizedRootEmail`, unique restricted `rootUserId`, unique restricted `policyId`.
13. Delete behavior — `ON DELETE RESTRICT` on all four functional-role-side foreign keys, so deleting a granted permission, a granted policy, an attached user, or a singleton-referenced row is rejected.

Executability note: the permission-first index is asserted by querying
`pg_indexes` against the migrated database. That is legitimate migrated-
PostgreSQL Stage-2 evidence, not a facade behavior, and it is stated so the
story cannot stall on how to observe an index.

### R15 — ACM-9 evidence semantics repaired

- **Reservation precedes fallible setup.** Reservation is two-phase. The
  artifact path is reserved first with run id, role, protocol version, and
  `status: INCOMPLETE` — **before** fixture construction, database connection,
  or manifest hashing — and the manifest hashes are filled in as they are
  computed. A failure during hashing therefore leaves a reserved auditable
  artifact carrying its `stop_reason`, instead of no artifact at all.
- **Non-timeout infrastructure errors are recorded.** Connection failure, query
  error, and fixture-setup failure finalize the run as `INCOMPLETE` with an
  `error_class` and message. They are never `PASS`, and never `FAIL` — `FAIL` is
  reserved for a measured threshold breach or a statement timeout.
- **Precedence is explicit.** A recorded warm-p95 or worst-case value above two
  seconds, or a statement timeout, **always finalizes the run `FAIL`**, whether
  or not the environment manifest matches: the gate is absolute, not
  comparative. An environment-manifest mismatch sets `comparability: mismatched`
  and suppresses the baseline slowdown comparison; a mismatched run that
  recorded **no** breach finalizes `INCOMPLETE`. A mismatch can never upgrade a
  run to `PASS` and can never erase a recorded breach. This corrects
  `testing-strategy.md` step 6, which stated that a mismatch produces no
  absolute gate verdict.

### R16 — ACM-4 process contradiction resolved

**Halt trigger.** The trigger widens from "a concrete unmet behavior" to **any
missing approved scenario coverage or concrete behavior gap**, and it halts
**Stage 2 onward** — `ACM-4-red-tests`, `ACM-4-production`, and ACM-5 — rather
than production alone. The gap opens a separately approved AD-1 sequence and
requires a Story Breakdown re-run before the package resumes.

**Committed-red conflict.** `testing-strategy.md` gains one narrow named clause:

> **Validation-only evidence exception (AD-1).** Characterization tests added
> over already-shipped behavior, which change no production code, may be
> committed green. They are not a Stage-2 gate for any production change. If the
> validation finds a gap, the fix re-enters the ordinary three-stage sequence
> with a real committed-red test.

ACM-4 changes no production code, so the committed-red rule has no subject
there. All three ACM-4 story **IDs are preserved**; only their titles and
descriptions change so that "red-tests" stops misdescribing validation work.

### R17 — Mechanical validator persisted

The claimed "200 checks" had no runnable validator behind it. A persisted
validator now lives at
`_bmad-output/specs/spec-access-control-kernel-mvp/validate.py`, run as:

```
uv run _bmad-output/specs/spec-access-control-kernel-mvp/validate.py
```

It checks capability identity, intent, and success for CAP-1 through CAP-8; all
23 story IDs for uniqueness, quoting, prefix-freedom, ordering, and both
checkpoints; companion-path existence; the R11 precondition triples; and a
landing site for each repair item. It reports the count it actually ran. The
unsupported claim is corrected by an appended memlog entry naming the script and
command; the original line remains as history.

### R18 — Preservation constraints honored

CAP-1 through CAP-8 and all 23 story IDs are unchanged — no repair required a
new capability or story ID. Both memlogs are append-only: every superseding
decision is appended and no history is rewritten. `status: in-review` and
`implementation_status: not-authorized` are unchanged in every artifact.

## 5. Dependency Graph

- ACF-1 → ACM-3
- ACF-1 → ACM-4 → ACM-5 *(ACM-5 additionally gated on ACM-4 `disposition=no-gap`)*
- Approved FR architecture → **ACM-0** → ACM-1 → ACM-2
- ACM-2 + ACM-3 + ACM-5 → ACM-8 *(additionally gated on ACM-9 baseline `status=PASS`)*
- ACM-9 baseline runs after ACF-1 and before ACM-8; ACM-9-final reruns after
  ACM-8 *(additionally gated on ACM-9 baseline `status=PASS`)*

## 6. Implementation Handoff

**Scope: Moderate** — planning-artifact repair with backlog coherence updates.

- **Architect** — owns the spine AD-1/AD-3/AD-4 amendments, the FR-AMD-1 single
  gate statement and drift-table additions, and the three
  `docs/architecture/` contracts.
- **Spec owner** — owns the Kernel `SPEC.md`, `stories.yaml`, the persisted
  validator, and the approvals ledger.
- **Independent reviewer** — re-reviews the repaired package. The authoring pass
  does not and may not approve it.
- **Gate owner** — keeps the product gate open; the Kernel package review
  remains the one open gate, and no Stage-1 dispatch is authorized until it is
  approved.

**Success criteria:** every one of the eighteen findings has a landing site in a
named artifact; the persisted validator runs clean; all CAP and story IDs are
unchanged; no application code, Prisma schema, migration, seed, or test file is
modified; the package leaves this pass `in-review` and `not-authorized`.

## 7. Approval

Approved by the user on 2026-08-30 in batch mode, with four decisions taken
explicitly at approval time: ACM-0 creates and validates the normalized root
User (R5); the named entrypoints and deployment order in R6 are accepted;
normalized `workEmail` identity uses canonical storage with the database gap
named and deferred (R7); and the ACM-4 contradiction is resolved by the explicit
validation-only exception rather than by reclassifying the story (R16).

Approval authorizes the planning-artifact repair described above. It authorizes
no scenario, test, migration, seed, production code, User Management change,
frontend change, or `/users` enforcement, and it approves no BMAD gate.
