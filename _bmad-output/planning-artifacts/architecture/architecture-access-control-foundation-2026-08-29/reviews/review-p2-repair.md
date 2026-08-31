---
title: bmad-review — Access Control Kernel MVP P2 repair
date: 2026-08-31
reviews: sprint-change-proposal-2026-08-30-kernel-mvp-p2-repair.md
target_package: _bmad-output/specs/spec-access-control-kernel-mvp/
lenses: [adversarial, edge-case-hunter]
lenses_skipped: [verification-gap, structure, prose]
kernel_spec_status: in-review
implementation_status: not-authorized
verdict: findings only — superseded by the user's package approval below
---

# bmad-review — Kernel MVP P2 Repair

> **Origin.** This is the authoring pass's own review output. It could not and
> did not close any gate by itself.
>
> **Package gate — APPROVED by the user on 2026-08-31.** The user reviewed the
> findings above and approved the Kernel MVP package. Per FR-AMD-1's gate
> statement, that authorizes **Stage-1 dispatch** and nothing further, so
> `implementation_status` is now `stage-1-authorized`, not `authorized`.
>
> **`approvals.yaml` remains empty, deliberately.** The per-story AD-1 stage
> approvals cannot be granted in advance: Stage-1 scenario prose, Stage-2 red
> tests, and Stage-3 production code do not exist yet, so there is no artifact
> for an approver to have read and no commit for a record to resolve against.
> Writing those records now would fabricate audit history and every one of them
> would fail the ledger's own verification rule. Each stage is recorded when a
> human actually reads that stage's artifact.

**Lenses.** `verification-gap` is `applies_to: code` and the content is docs, so
it was skipped. `structure` and `prose` were skipped as out of scope: the
editorial condensation pass was explicitly declined in repair round 2 to avoid
churning already-approved wording, and nothing in the P2 finding list reopened
it. One structural observation survived that decision and is recorded as OPEN-1
below rather than acted on.

**Mechanical state at review time.** `lint_spine.py` → 0 findings.
`validate.py` → 839 checks, 0 failures.

## Findings fixed during the review

Each was a consequence of the P2 repair itself, so fixing it completed that
work rather than widening scope.

| # | Location | Problem | Fix |
| --- | --- | --- | --- |
| F-1 | `stories.yaml` ACM-9-final | Still said "reserve … before the first warm-up call"; only the baseline entry had been corrected to reserve before every fallible step | Synced to "before every fallible step" |
| F-2 | `SPEC.md` CAP-8 + Constraints | "authorizes no … CRUD" now sat directly beside "ACM-0 **creates** the root User", readable as forbidding the create | Disambiguated: the prohibition bars the User Management CRUD **surface**, not the single deploy-time row CAP-8 exists to write |
| F-3 | `stories.yaml` ACM-8 trio, ACM-9-final | The gate checked only `status: PASS`; a PASS baseline recorded under a different `ACM9-MVP-*` protocol version would have satisfied it, which `testing-strategy.md` says is incomparable | Precondition now requires `status: PASS` **and** a matching protocol version |
| F-4 | `stories.yaml` ACM-0-production, `epics.md` | `prisma/seed.ts` currently **warns and skips** when `ROOT_WORK_EMAIL` is unset; CAP-8 changes that to a hard failure, and the change was unstated | Flagged as a deliberate behavior change in both artifacts |
| F-5 | `stories.yaml` ACM-0-production | The seed's header comment says the HR Admin role is not assigned because `Policies`/`UserPolicies` "don't exist yet" — ACM-1 makes that false. Same defect class ACM-8 already corrects for `AccessControlModule` | Correcting the comment is now an ACM-0 acceptance item |
| F-6 | `stories.yaml` ACM-3-scenarios | CAP-1 grants Reporting when an inactive bridge is hit **after** viewer proof. The current recursive CTE joins `users.isActive` in both terms and stops at an inactive node, so it denies that case today — this is a **widening**, presented as a restatement | Scenarios must state the before/after so a reviewer approves a widening knowingly |
| F-7 | `stories.yaml` ACM-4-production | The disposition file had no reservation, so a crash mid-validation left it absent — and ACM-5's precondition treats absent as "do not start", blocking it permanently with no diagnostic | Reserves `disposition: pending` before validation, mirroring ACM-9's reservation rule |
| F-8 | `epics.md` ACM-0 | Out of sync with the SPEC on the CRUD boundary | Synced |
| F-9 | `validate.py` | Substring-matching limitation undocumented, inviting the checks to be read as proof of correctness | Stated in the docstring: it verifies placement, not correctness, and never substitutes for the human gate |

## Resolved after review — OPEN-3 and OPEN-5

The user reviewed the five open findings on 2026-08-31 and directed that these
two be closed as defects rather than carried as questions. Both were contract
defects inside the original eighteen-finding remit, not new decisions.

### OPEN-3 — RESOLVED: root row versus User Management Story 1.1's import

The claim "neither implements nor blocks" was factually wrong and appeared in
five live artifacts. It is replaced everywhere by the accurate statement, which
required no new decision because **DEC-UM-009 already settles it**: no writer
may create a second row for a normalized email that already exists, active or
inactive. The import is therefore not blocked but is constrained — an import
covering the root person reuses the root `User` id CAP-8 created. Synchronized
in `SPEC.md`, `ARCHITECTURE-SPINE.md`, `fr-architecture-amendment.md`,
`epics.md`, and the P2 repair proposal.

### OPEN-5 — RESOLVED: approvals ledger could not identify the repository

`approvals.yaml` gains a required `repo` field (`workspace` | `services/backend`)
with `artifact_path` relative to that repository's root, so the verification
command is unambiguous in either repository. Synchronized in `approvals.yaml`,
`SPEC.md` Constraints, `testing-strategy.md`'s field table and verification
rule, and spine AD-3's persisted-approval rule.

## Open findings — for the independent reviewer

None of these was silently resolved. Each needs a human decision. OPEN-1 was
reviewed and deliberately left declined, consistent with repair round 2.

### OPEN-1 — `SPEC.md` Constraints outweighs Capabilities

- **Trigger:** Constraints is 1514 words against Capabilities' 1303 (measured by
  `word_metrics.py`). The load-bearing ordering rules — identity-before-Self,
  count-all-matches-before-active-state — sit deep in a 30-plus bullet list.
- **Guard:** move the non-ordering constraints into a spec-authored companion,
  keeping the two ordering rules inside CAP-1 and CAP-8 `success`.
- **Consequence:** a Stage-1 agent stops reading before the constraints that
  actually bend its dispatch.
- **Note:** editorial condensation was declined in repair round 2. This is
  recorded so the decision is re-taken deliberately, not by default.

### OPEN-2 — `AccessControlBootstrap.rootUserId` pins the root User permanently

- **Trigger:** the foreign key is `ON DELETE RESTRICT`, so once ACM-1 runs the
  root `User` row can never be deleted. The package never states this.
- **Guard:** state the consequence and reconcile it with DEC-UM-009 rehire and
  deactivation semantics, or accept it explicitly as a bootstrap invariant.
- **Consequence:** a later User Management story meets an undocumented,
  unremovable row and reads it as a defect.

### OPEN-3 — root row versus User Management Story 1.1's population import

- **Trigger:** CAP-8 says it "neither implements nor blocks" Story 1.1, but its
  root row already occupies that normalized `workEmail`. An import containing
  the same person collides.
- **Guard:** name the interaction — an import covering the root person must
  reuse the existing row rather than insert a second.
- **Consequence:** Story 1.1's import fails on a unique violation nobody
  predicted, and "does not block" turns out to be false.

### OPEN-4 — skipping the bootstrap entrypoint fails closed but silently

- **Trigger:** deployment order is `db:deploy` → `db:seed` →
  `db:bootstrap:access-control` → `start:prod`. Nothing defines what happens
  when an operator skips the third step. After ACM-8 the app starts with
  `AccessControlModule` composed and zero FR rows, so every `isAllowed` returns
  `false`.
- **Guard:** define a startup diagnostic for "composed with zero FR rows", or
  accept the silent state explicitly.
- **Consequence:** the application comes up fail-closed and unusable with no
  signal distinguishing it from a correctly-denying system.

### OPEN-5 — `approvals.yaml` cannot say which repository a commit belongs to

- **Trigger:** the ledger carries one `commit` field, but planning artifacts live
  in the workspace repository while tests and production code live in the
  `services/backend` submodule. A bare revision cannot identify which.
- **Guard:** add a `repo` field, or require repo-qualified `artifact_path`
  values.
- **Consequence:** an approval record cannot be verified, so the gate it exists
  to enforce becomes unverifiable — the exact failure the ledger was introduced
  to prevent.
