# Architecture Spine Reviewer Gate — CC-04 / CC-06

**Artifact reviewed:** `ARCHITECTURE-SPINE.md` (updated 2026-08-29)  
**Review type:** BMAD architecture-spine rubric walk  
**Verdict:** **CONDITIONAL REJECT — do not treat this as an implementation-ready build substrate yet.**

The spine is materially stronger than a conventional high-level architecture: it defines the PP fact separately from policy, makes replacement compare-and-swap style, and treats departure as a durable, fenced, request-time fail-closed workflow. AD-19 and AD-20 are largely consistent with the companion documents. The gate is not passed because the artifact frames the work as greenfield while an incompatible user-management implementation is already present, and because core access/operations decisions are still deferred without a bounded resolution path.

## Evidence reviewed

- `docs/project-requirements.md`, especially §§2.1, 3.4, 4.16, 4.17, 5.1, 7, and 9.
- `docs/architecture/access-control.md`, `api-conventions.md`, `database-schema.md`, `domain-driven-design.md`, and `testing-strategy.md`.
- Existing backend reality under `services/backend`, including `prisma/schema.prisma`, `users.controller.ts`, the interim access-control adapter, and current registration/deactivation actions.

## Rubric outcome

| Good-spine check | Result | Assessment |
| --- | --- | --- |
| Divergence points | **Partial / fail** | A direct contradiction exists around departure re-parenting/legacy blockers; the retry API is also absent from the API convention that AD-14 declares canonical. |
| Enforceable rules | **Partial** | AD-19/20 contain testable behavior and the testing strategy names high-value cases. The root metadata lists only requirements as a source, `companions` is empty, and the mechanism that forces architecture rules into implementation sessions remains Deferred. |
| Deferred leaks | **Fail** | The unresolved department edge model is a prerequisite for the normative PP “inside HR” chain and department access. The artifact says to fail closed but has no owner, decision record, or completion gate. |
| Brownfield reality | **Fail** | The spine declares greenfield although the service already exposes and tests endpoints/authorization that AD-14/16 prohibit. There is no migration, retirement, compatibility, or data-transition plan. |
| Requirements coverage | **Partial** | Most relationship, journal, revocation, worker, and testing requirements are covered. The required one-click re-parenting path is omitted, and the PP HR-boundary cannot yet be implemented precisely. |
| Operational envelope | **Fail** | The spine makes availability/security promises (worker, leases, alerts, timezone, 15-minute/4-hour windows) but leaves deployment/environments/hosting deferred, despite §9 requiring deployment and demonstration. |

## Findings

### F1 — P1: The declared greenfield posture ignores an incompatible brownfield service

**Evidence.** The spine calls the initiative “greenfield” (spine line 7) and forbids `POST /users` and generic user deactivation (AD-14 line 145; AD-16 line 161). The existing controller still exposes both `POST /users` and `DELETE /users/:id` (`services/backend/src/user-management/application/controllers/users.controller.ts:72-79,109-113`). The live Prisma schema currently contains only `User`, not the new relationship, policy, employment-status, mentorship, or departure models (`services/backend/prisma/schema.prisma:12-35`). Its configured authorization adapter grants target-scoped access to any non-empty session user rather than exercising the AD-9/10 facade (`interim-access-control.adapter.ts`).

**Why it fails the gate.** A build substrate must say how the current capability is retired or transformed. Otherwise teams can both preserve legacy behavior and add the new contract, producing duplicate lifecycle paths and authorization behavior that contradict §4.16 and AD-16.

**Required correction.** Add a bounded brownfield migration decision before implementation: exact endpoints/actions/tests to remove or quarantine; database migration/seed order (including bootstrap actor); compatibility policy; the replacement rollout order; and an explicit verification that interim target authorization is removed before any profile or departure feature is considered done.

### F2 — P1: AD-19 does not make the normative “inside HR” boundary executable

**Evidence.** Requirements §2.1 says PP inheritance follows the assigned PP’s reporting chain **restricted to the HR department**. AD-19 says the audience comes from the PP edge and “its HR-line `direct` chain” (spine line 179), while AD-10 similarly says “inside HR” (line 116). But the actual department membership/edge model is deferred (line 280). The schema companion only describes a pending department edge and contains no predicate or algorithm that identifies/limits the HR chain.

**Why it fails the gate.** “HR line” is currently an intention rather than an enforceable query invariant. An implementation can accidentally traverse a PP’s direct chain into delivery management (data exposure) or fail closed and omit entitled HR leadership (functional failure). The full PP cardinality and atomic replacement rule is good, but it does not solve this access-scope requirement.

**Required correction.** Before AD-19 implementation, decide and bind: how the HR department is identified; how current employee department membership is stored/indexed; whether every traversed PP-chain node must be in HR and what happens at the boundary; and the exact recursive query plus negative E2E examples. Mark PP-chain propagation blocked until that decision is approved.

### F3 — P1: Departure behavior diverges from the required manager/PP re-parenting flow

**Evidence.** Requirements §4.16 requires the platform to block recording a manager/PP departure and prompt re-parenting, offering re-parenting to the person’s own manager as a one-click default. AD-16 only says the request is rejected while the person manages or partners somebody (line 161). AD-20 goes further in the other direction: “a legacy blocker never delays the security cutoff or offboarding” and “no automatic re-parenting is invented” (line 185). The departure schema companion repeats that legacy blockers do not delay execution.

**Why it fails the gate.** The requirements distinguish a pre-recording blocker from effective-date enforcement. The spine neither defines the mandated assisted re-parenting command nor defines *legacy blocker*, when it can exist, or why it can bypass the pre-recording blocker. That ambiguity can schedule an offboarding which leaves active reports/PP relationships orphaned, or it can omit a required workflow altogether.

**Required correction.** Split the states explicitly: (1) authoritative current manager/PP responsibilities block `POST /departures` and return a remediation/re-parenting plan; (2) an already-due departure always denies the actor at request time; (3) define the exceptional legacy-data condition, its authorization/audit route, and whether it is allowed only after a departure was validly scheduled. Bind an explicit user-confirmed one-click re-parent operation; it is not an automatic re-parent.

### F4 — P2: AD-20’s retry command is not in the canonical router contract

**Evidence.** AD-20 adds authorized `POST /users/:userId/departures/:departureId/retry` (spine line 185). `api-conventions.md` documents only create and status GET for departures and says the API lifecycle is otherwise intentionally limited. AD-14 identifies that document as the full/canonical mapping.

**Why it matters.** A manual operation that changes scheduling/worker state needs an unambiguous route, request shape, authorization permission, diagnostics policy, idempotency/concurrency behavior, and scenario contract; otherwise one of the two “canonical” artifacts will drift.

**Required correction.** Add the retry route to `api-conventions.md` (or remove it from AD-20), including who may invoke it, allowed source states, response/409 behavior when already claimed/applied, audit/diagnostic redaction, and the required AD-1 scenarios.

### F5 — P2: The operational and rule-loading envelope is deferred, but AD-19/20 rely on it

**Evidence.** The spine defers both the agent rule-loading guarantee (line 282) and deployment/environments/hosting (line 288). Yet AD-20 depends on a deployment-configured IANA timezone, durable PostgreSQL worker execution, lease recovery, retry alerts, and a security cutoff. AD-10 additionally promises 15-minute project revocation, four-hour outage withdrawal, and a visible stale-data banner. Requirements §7 requires graceful integration degradation and 500-record/2-second behavior; §9 requires the module to be deployed and demonstrable. The spine front matter declares no companion documents despite relying on them for the implementation details.

**Why it fails the gate.** These are not optional delivery details: an inactive worker, missing alert route, inconsistent timezone config, or unpropagated rule document changes the security behavior of departure and access control.

**Required correction.** Replace this Deferred item with a release-blocking operational decision containing environment topology, worker deployment/scheduling and singleton/concurrency model, business-timezone config source/change control, health/lag/failed-sync/lease-expiry alerts and owners, migrations/seeding execution, and demonstrable release acceptance. Add the companion documents to the spine’s declared sources/binds and make their loading/checking part of the implementation gate.

## What is sound and should be retained

- **AD-19’s model choice is correct:** a zero-or-one `people_partner` edge, not an access role or policy attachment; expected-current compare-and-swap plus one transactional before/after journal record address the concurrency and evidence requirements.
- **AD-20 has the right safety shape:** durable command separate from `EmploymentStatus`, PostgreSQL due/overdue claiming, fencing token, retry state, and request-time denial prevent timer loss or worker delay from extending access. `database-schema.md` usefully adds a lease token and transaction-time token verification.
- **The test strategy is unusually concrete:** its mandatory AD-19 and AD-20 scenario list covers the important failure modes, including replacement conflict, journal rollback, worker races, lease expiry, uncertain commit, and delayed-worker access cutoff. Keep this as a release gate once the above contracts are made executable.

## Gate re-entry criteria

1. Approve a brownfield transition/retirement plan and reconcile it with the current backend routes, adapter, schema, and tests.
2. Approve the department/HR-boundary contract and turn PP propagation into a queryable, indexed, negative-tested rule.
3. Reconcile the departure blocker/re-parent/legacy-exception semantics and synchronize the retry route across the spine and API conventions.
4. Approve the operational envelope and enforce companion-document loading before work begins.

No source artifacts were modified during this review.
