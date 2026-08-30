---
title: Sprint Change Proposal — Access Control Kernel MVP
date: 2026-08-30
status: approved
approval_scope: planning-change-only
kernel_spec_status: approved
implementation_status: stage-1-authorized
package_review_approved_by: user
package_review_approved: 2026-08-31
mode: batch
scope: access-control-kernel-only
approved_by: user
amended_by: sprint-change-proposal-2026-08-30-kernel-mvp-p2-repair.md
amended: 2026-08-30
---

# Sprint Change Proposal — Access Control Kernel MVP

> **Status boundary:** Approval applies to this planning change only. The
> derived Kernel SPEC remains in independent review and implementation is not
> authorized.
>
> **Amended 2026-08-30 (P2 repair).** Sections 5 and 6 below were corrected by
> `sprint-change-proposal-2026-08-30-kernel-mvp-p2-repair.md`. The amendment is
> planning-only: it re-approves nothing, and the original approval record in
> section 9 stands unchanged.

## 1. Issue Summary

ACF-1 provides the Phase-0 audience-resolution baseline, but its historical gate
remains failed because kernel behavior and production `/users` enforcement were
evaluated together.

This correction creates a separate deployable Access Control Kernel that requires
no changes under `services/backend/src/user-management/**`, requires no frontend
work, is imported into `AppModule` without rebinding the User Management port,
and is proven through its public facade against real PostgreSQL.

**Boundary:** the result is a deployable kernel, not production enforcement on
`/users`. The full product gate remains open until a separate User
Management-owned integration story delivers production port rebinding,
projection, and real-consumer HTTP E2E. ACF-1 remains the baseline and retains
its historical failed gate.

No canonical ACM definitions exist in Git, so this proposal adopts the
definitions from the human-provided workboard. Their absence from Git is not
permission to reassign the IDs.

## 2. MVP Boundary

### Included

- Existing ACF-1 Phase-0 `resolveAudiences`: Self, recursive Reporting over
  direct edges, direct assigned PP, and Colleague.
- Fail-closed inactive viewer, bridge, and target handling.
- Multi-audience retention and merging.
- Functional roles represented as data.
- Exactly three permission keys: `user-management:create`,
  `user-management:deactivate`, and `user-management:list`.
- Exactly one seeded functional role, `hr-admin`, and one bootstrap attachment.
- `isAllowed`.
- `canAccessSection` for S1, S10, and S11 only.
- `AccessControlModule` imported into `AppModule` without rebinding the User
  Management port.
- PostgreSQL performance evidence for 500 targets.

### Excluded

- `/roles` HTTP/API and UI; runtime role or permission management.
- Changes to `/users`; User Management port rebinding or adoption.
- Profile, list, filter, search, or export projection.
- Frontend work.
- Project line, Department, or PP HR-line resolution.
- Shared links and full-profile overlays.
- Any claim that the three seeded permissions constitute the complete §2.3
  catalogue.
- AD-20 due/departure enforcement, while preserving the documented
  dismissed-target projection as future work.

The three permission keys are only the deploy-time bootstrap set. The
evaluator accepts the open lowercase `context:action` key space and branches on
no key. Their presence as data does not assert that corresponding HTTP
operations are valid product routes.

## 3. Impact Analysis

### Epic and product impact

- Add a distinct Access Control Kernel MVP epic.
- Keep ACF-1 as the Phase-0 baseline and preserve its gate history.
- Leave P-3 and the full Access Control program unchanged.
- Record a future User Management integration story outside this kernel epic.
- Do not claim completion of the full functional-role, profile-projection, or
  `/users` authorization requirements.

### Architecture impact

ACM-1 is blocked on an independently approved Functional Role architecture
amendment resolving:

- OQ-3: role-to-permission storage.
- OQ-4: canonical FR role-row shape.
- OQ-6: whether permissions are closed seeded data or runtime-extensible.
- OQ-7: canonical feature identifier and spelling.
- OQ-11: ownership of `isAllowed` and its seed/evaluator implementation.

The amendment must preserve FR/audience type separation, no cross-request
decision cache, no audience widening by a functional role, and single ownership
of the evaluator and schema.

### UX impact

None. No screen, workflow, or frontend artifact is included.

## 4. Recommended Approach

Use a direct adjustment with a bounded MVP:

1. Preserve ACF-1 as the resolver baseline.
2. Close inactive-state behavior through ACM-3.
3. Formalize multi-audience behavior through ACM-4.
4. Approve the FR architecture amendment.
5. Implement the minimal FR dataset through ACM-1 and `isAllowed` through ACM-2.
6. Add the limited section matrix through ACM-5.
7. Compose the completed kernel through ACM-8.
8. Run ACM-9 both as an early baseline and final verification.

The change is moderate in planning scope and high-risk for authorization
correctness if kernel deployability is confused with `/users` enforcement.

## 5. Story Proposals

### ACM-3 — Inactive Viewer, Bridge, and Target Fail-Closed Behavior

**Depends on:** ACF-1.

- Every requested target remains present in the returned map.
- An inactive viewer causes every requested target to map to an empty audience
  `Set`.
- An inactive target maps to an empty audience `Set` and never falls back to
  Colleague.
- An inactive viewer receives no Self, Reporting, PP, or Colleague audience.
- An inactive intermediate Reporting node cannot bridge to an ancestor.
- An inactive PP endpoint grants no PP audience and cannot bridge into another
  chain.
- For an active viewer and active target, an inactive bridge contributes no
  derived audience. Other independently valid audiences may apply; otherwise
  normal Colleague fallback applies.
- Missing or orphaned users fail identically where identity validity cannot be
  established.
- Reporting repetition is path-local per target; shared ancestors across
  targets are not repeats. Reaching the viewer is provisional: it proves the
  viewer sits on that target's chain but does not by itself grant Reporting.
  The walk continues to chain termination, and Reporting is granted only when
  that target's whole walked chain terminates without repeating a node. A
  repeated node anywhere in the chain, before or after viewer proof, denies
  Reporting for that target only, so a viewer inside a cycle is denied rather
  than proven. Self and direct PP remain independently evaluated, with normal
  Colleague fallback when no stronger valid audience remains.
- Chain termination is the absence of a further usable manager edge. An absent
  edge is a clean end. An edge whose endpoint is inactive is unusable and is
  treated as absent for traversal: before viewer proof Reporting is denied,
  and after viewer proof the chain has already terminated without a repeat so
  Reporting is granted, with nothing above the dead node reachable. An edge
  whose endpoint row is missing is unreachable in supported operation — the
  relationship shape `CHECK` requires a non-null endpoint and the foreign key
  restricts deletion — so it is a defensive rule, not a constructible scenario.
  No soft-deleted `User` or bridge state is described, because none exists.
- Viewer identity validation runs before any audience derivation, Self
  included. Self is exclusive only after both viewer and target are confirmed
  present and active.
- No dismissed-target projection is implied.

### ACM-4 — Multi-Audience Merge

**Depends on:** ACF-1.

- An active viewer may simultaneously hold Reporting and direct PP for one
  active target.
- `resolveAudiences` retains every applicable audience in a `Set`.
- Self remains exclusive, and is reached only after both viewer and target are
  confirmed present and active.
- Colleague appears only when no stronger audience applies.
- Duplicate relationships do not duplicate results.
- Functional-role permissions do not participate in audience merging.
- The result retains the audience inputs required by the later section
  evaluator; section decisions are ACM-5's responsibility.
- Existing multi-audience code is ACF-1 carry-over. This proposal does not
  treat unit evidence as proof of the required facade behavior. ACM-4 must
  validate Reporting, direct PP, Colleague, and mixed fixtures through the
  public facade against real migrated PostgreSQL. It does not invent
  retroactive red-before-code history; any required behavior change follows a
  new Stage-1 → approved red test → production sequence. Because ACM-4 changes
  no production code it runs under the named validation-only evidence exception
  in `docs/architecture/testing-strategy.md`. Any missing approved scenario
  coverage or concrete behavior gap halts Stage 2 onward, opens a separately
  approved AD-1 sequence, and requires a Story Breakdown re-run.

### ACM-1 — Minimal Functional-Role Data Foundation

**Depends on:** an independently approved FR architecture amendment resolving
OQ-3, OQ-4, OQ-6, OQ-7, and OQ-11, then a completed ACM-0.

- Roles, permissions, role-permission relationships, and user-role attachments
  are PostgreSQL data.
- Seed exactly `user-management:create`, `user-management:deactivate`, and
  `user-management:list`.
- Seed exactly one role, `hr-admin`, granting exactly those three permissions.
- Attach exactly one bootstrap user; create no other role, permission,
  attachment, or default grant.
- Before ACM-1, the deploy-time root User step **creates and validates** the
  normalized root User so a fresh migrated database is satisfiable without an
  unnamed external prerequisite. It normalizes `ROOT_WORK_EMAIL` according to
  DEC-UM-007, stores the normalized value so storage is canonical, then counts
  every normalized match **before** checking active state and requires exactly
  one; unrelated active employees never affect that count. The Kernel SPEC
  tracks it as CAP-8 and dispatches it as ACM-0, whose production entrypoint is
  `services/backend/prisma/seed.ts` invoked by `npm run db:seed`. This
  authorizes no User Management API, CRUD, runtime role management, or other
  User Management feature.
- ACM-1's production entrypoint is
  `services/backend/src/access-control/infrastructure/bootstrap/access-control-bootstrap.ts`,
  wrapped by `services/backend/scripts/bootstrap-access-control.ts` and invoked
  by `npm run db:bootstrap:access-control`. Deployment order is `db:deploy` →
  `db:seed` → `db:bootstrap:access-control` → `start:prod`, and Stage-2 evidence
  for both stories invokes those exact entrypoints.
- ACM-1 begins one transaction, locks the selected User and any seed-owned
  `hr-admin` attachment, and revalidates normalized identity, exact-one active
  eligibility, and attachment identity before writes and before commit. It
  first acquires the common transaction advisory lock and uses the durable
  `AccessControlBootstrap` singleton specified by AD-4 to cover first creation
  and distinguish bootstrap provenance from later administrator attachments.
- An absent, blank, unmatched, ambiguous, inactive, or drifted root identity
  fails clearly and atomically.
- If normalized `ROOT_WORK_EMAIL` changes after bootstrap, ACM-1 fails as
  conflicting bootstrap drift; it does not transfer or add a root attachment.
- The seed never falls back to the first user, a position value, or another
  heuristic, and is idempotent.
- No `/roles` or `/users` route is added or changed.

### ACM-2 — `isAllowed`

**Depends on:** ACM-1.

- `isAllowed(userId, permissionKey)` reads live FR data.
- The evaluator contains no branch for `hr-admin` or individual permission
  names.
- Inactive/missing users, unknown keys, absent grants, and orphaned or
  inconsistent FR data return `false`.
- AD-20 due/departure evaluation is deferred until the Departure persistence
  seam exists across this Kernel MVP, including ACM-3 audience behavior;
  `User.isActive` remains required and future work retains its own AD-1 gate.
- Evaluation reads no relationship or audience data and persists or caches no
  decision.
- Grant or revocation changes are visible on the next call.
- A true result grants no audience or section access by itself.

### ACM-5 — Base Section Access for S1, S10, and S11

**Depends on:** ACM-4.

- `canAccessSection` supports only S1, S10, and S11; unsupported sections return
  `none`.
- An absent target entry or empty audience `Set` returns `none`.
- S1: Self and Colleague receive `read`; Reporting and direct PP receive
  `write`.
- S10 and S11: Self, Reporting, direct PP, and Colleague receive `read`.
- Multiple audiences merge as `write > read > none`.
- S1 photo mutation, S10 dates-only projection, and S11 project-name-only
  projection are not represented by the base result.
- The method does not serialize fields, filter records, or call `isAllowed`.

### ACM-8 — Compose the Deployable Kernel

**Depends on:** ACM-2, ACM-3, and ACM-5.

- `AppModule` imports `AccessControlModule`.
- `AccessControlFacade` is resolvable from the production application container.
- No file under `services/backend/src/user-management/**` changes.
- `UserManagementModule` continues binding `ACCESS_CONTROL_PORT` to
  `InterimAccessControlAdapter`.
- No `/users` behavior changes and no Access Control HTTP, test-only, or debug
  endpoint is introduced.
- Startup evidence verifies that kernel availability did not silently rebind the
  User Management port.

### ACM-9 — PostgreSQL 500-Target Performance Evidence

**Baseline dependency:** ACF-1 only; runs in parallel with ACM-3, ACM-4, and the
FR track.

**Final verification dependency:** ACM-8.

The baseline measurement must not change behavior under
`services/backend/src/access-control/**`, optimize SQL, alter timeout behavior,
or add caching. It records only:

- Real migrated PostgreSQL and at least 500 requested active targets.
- Representative Reporting, direct PP, Colleague, and mixed-audience fixtures.
- Fixture breadth and maximum Reporting depth.
- Warm-up/measured-run counts, p50, p95, and worst-case duration.
- Query count, PostgreSQL version, and `EXPLAIN (ANALYZE, BUFFERS)` evidence.
- The first target-count/graph-depth shape exceeding two seconds.
- Whether `SET LOCAL statement_timeout = '2s'` aborts before the end-to-end
  threshold can be measured.
- If the timeout is earlier: the first facade fixture that triggers it and the
  equivalent isolated diagnostic query behavior without changing production
  resolver behavior.

After ACM-8, the same method and fixtures rerun through the composed production
container. ACM-9 proves only the resolver workload, not the complete `/users`
list/filter/projection NFR. Baseline and final evidence are separate artifacts.
The harness stops and fails on the first warm-p95 or worst-case value above two
seconds or on statement timeout. A post-composition slowdown within both
absolute limits is recorded but does not fail this MVP. The exact depth
sequence is an operational measurement protocol in
`docs/architecture/testing-strategy.md`, not normative product behavior.
`ACM9-MVP-v1` fixes sampling, percentile, facade timing, independent fixture
gates, and append-only PASS/FAIL/INCOMPLETE artifact fields; final evidence
references a baseline with matching protocol, fixture, and environment
manifest hashes. An environment mismatch is INCOMPLETE and yields no gate or
slowdown comparison. Any optimization is a separate gated story.

## 6. Dependency Graph

- ACF-1 → ACM-3
- ACF-1 → ACM-4 → ACM-5
- Approved FR architecture → ACM-0 → ACM-1 → ACM-2
- ACM-2 + ACM-3 + ACM-5 → ACM-8
- ACM-9 baseline runs in parallel after ACF-1.
- ACM-9 final verification reruns after ACM-8.

Two of those dependencies are conditional and are checked against persisted
artifact state rather than free-text ordering:

- ACM-5 requires
  `_bmad-output/implementation-artifacts/access-control/acm-4-disposition.yaml`
  to exist with `disposition: no-gap`.
- ACM-8 and ACM-9-final require the ACM-9 baseline artifact to exist with
  `status: PASS`.

ACM-3 and ACM-4 do not depend on ACM-5. They end at exact
audience-resolution outputs; ACM-5 alone owns `canAccessSection`.

## 7. Evidence Gate Decision

### Kernel gate

For every new behavior:

1. One dispatch authors Stage-1 facade scenarios and stops.
2. A human independently approves them.
3. A separate dispatch translates them into direct-facade PostgreSQL
   integration tests and stops.
4. A human independently approves the tests while red.
5. A separate dispatch implements production behavior.

The kernel test uses a real Nest testing module, `AccessControlModule`,
`AccessControlFacade`, Prisma adapters, and migrated PostgreSQL. It uses no
Access Control repository fake and no User Management provider override.

ACM-9 is a separate measurement dispatch and cannot modify resolver behavior.

### Consumer/product gate

A future User Management-owned story must provide an approved consumer contract,
production `ACCESS_CONTROL_PORT` rebinding, projection, approved route mappings,
and real HTTP → router → authentication → Access Control → PostgreSQL E2E with
no provider override. Kernel integration tests do not replace this gate.

No test-only, debug, or artificial HTTP endpoint may be created merely to make
the kernel gate appear to be HTTP E2E.

## 8. Implementation Handoff

- Architect: resolve and record OQ-3, OQ-4, OQ-6, OQ-7, and OQ-11.
- QA/Access Control owner: author kernel scenarios and PostgreSQL evidence one
  stage per dispatch.
- Database reviewer: review FR constraints, atomic seed behavior, query plans,
  and ACM-9 evidence.
- User Management owner: later deliver consumer adoption and real HTTP E2E.
- Gate owner: keep the product gate open until that integration is complete.

Approval authorizes planning artifact updates, the scoped architecture/testing
amendment, the FR architecture decision workflow, and creation of the new
SPEC/story definitions. It does not authorize scenarios, tests, migrations,
production code, User Management changes, frontend changes, or `/users`
enforcement.

## 9. Approval

Approved by the user on 2026-08-30 with the editorial correction that ACM-3 and
ACM-4 contain no `canAccessSection` acceptance behavior. ACM-5 alone owns those
decisions.
