# Access Control Kernel — Test-Case Suite (Kernel MVP)

Stage-1 scenario documents (AD-1) for `SPEC-access-control-kernel-mvp`, following
the team-wide authoring pattern in [../README.md](../README.md) and the scoped
headless-facade variant of it defined in
[../../architecture/testing-strategy.md](../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp).

**Status:** mixed. The recorded Stage-1 approvals — three ACM-3 scenarios
(`ACM3-II-01`..`ACM3-II-03`) and nine ACM-1 scenarios — are in
`_bmad-output/specs/spec-access-control-kernel-mvp/approvals.yaml`. The eleven
ACM-3 CAP-1 completion scenarios (`ACM3-II-04`..`ACM3-II-14`) and the six
ACM-4R CAP-2 repair scenarios below are **draft and pending their own
independent AD-1 Stage-1 approval**. The existing ACM-3 Stage-2 test file
covers only the three approved scenarios; no Stage-2 test or production code
exists for `ACM3-II-04`..`ACM3-II-14` or for ACM-4R, and none may be written
until those Stage-1 approvals are recorded.

The ten `ACM2-IA-01`..`ACM2-IA-10` CAP-4 `isAllowed` scenarios in
[`is-allowed/`](is-allowed/) are draft Stage-1 prose pending independent human
approval. They authorize neither an ACM-2 Stage-2 test nor production work.

The nine `ACM5-SA-01`..`ACM5-SA-09` CAP-5 `canAccessSection` scenarios in
[`section-access/`](section-access/) are draft Stage-1 prose pending independent
human approval. They authorize neither an ACM-5 Stage-2 test nor production
work.

The five `ACM8-KC-01`..`ACM8-KC-05` CAP-6 kernel-composition scenarios in
[`kernel-composition/`](kernel-composition/) are draft Stage-1 prose pending
independent human approval. They authorize neither an ACM-8 Stage-2 test nor
any `app.module.ts`/`access-control.module.ts` change.

**ACM-8 non-goals:** rebinding `ACCESS_CONTROL_PORT` away from
`InterimAccessControlAdapter` in `user-management.module.ts` (User
Management's own, separately-gated AD-2 story); any change to
`UserManagementModule` or any other User Management file; any new route or
controller; and any change to `isAllowed`/`canAccessSection`/`resolveAudiences`
behavior itself — that behavior is already shipped (ACM-2/ACM-3/ACM-5) and out
of scope here. This dispatch is composition only.

**ACM-2 non-goals:** AD-20 due/departure evaluation; any
`resolveAudiences`/audience interaction; decision caching or persistence;
role- or permission-name branching; and `canAccessSection`/ACM-5 section
behavior are outside this dispatch.

**ACM-5 non-goals:** field/record-level projection — including the S5 CV subset,
S7/S8 record flags, and S16 custom-field visibility — is an owning-context
projection contract that may only narrow the facade's base decision. Project-line
audiences/access; `isAllowed`/CAP-4 coupling; HR Admin and shared-link overlays;
and every section other than S1, S10, and S11 are outside this dispatch.

**Scope of this dispatch.** `ACM-3-scenarios` is now complete against CAP-1:
`ACM3-II-04`..`ACM3-II-14` close the gaps this section previously listed as
unwritten — the empty-bulk short-circuit, duplicate-target collapse, both
constructible cycle positions relative to viewer proof plus a viewer inside the
cycle, the direct-PP inactive-endpoint variants, both chain-termination cases
stated separately, path-local visited state with shared ancestors, missing
(non-existent) viewer and target ids, and infrastructure-error propagation.
`ACM-1-scenarios` was dispatched partially and its gap is now measured,
persisted, and under repair: the 2026-08-31 Stage-1 coverage audit at
`_bmad-output/implementation-artifacts/access-control/acm-1-stage1-coverage-audit.md`
found the nine approved `ACM1-FB` contracts cover 3 of the 13 CAP-3 invariants
fully, 3 partially, and 7 not at all. `ACM1R-FB-10`..`ACM1R-FB-28` below are the
ACM-1R repair contracts that close every item the audit records as Missing or
Partial; they are **draft and pending their own independent AD-1 Stage-1
approval**, and the original `ACM-1-red-tests` dispatch is halted in
`stories.yaml` until they have it. The six ACM-4R documents
deliberately repair only the CAP-2 coverage gap recorded in the adopted audit;
none authorizes a test or production dispatch. None of this may be inferred
from what is here.

## Contract and boundary

This suite proves **CAP-1 — fail-closed audience resolution** and the scoped
**CAP-2 — multi-audience input merge** against the
public `AccessControlFacade.resolveAudiences(viewerId, employeeIds): Promise<Map<string, Set<Audience>>>`
method, per the scoped headless-facade gate (local AD-3): real
`AccessControlModule`, real Prisma adapters, migrated PostgreSQL, no
repository fake, no invented HTTP endpoint. Every scenario records the public
method call, its typed input, and its typed result — including which map
entries are **absent audiences** (an empty `Set`, not a missing key: every
requested id always gets a map entry per the facade contract) — instead of an
`inputURL`/`inputRequest` HTTP triad, which does not apply to a headless
facade gate.

**In scope here:** the whole of CAP-1's success criteria in
[SPEC.md](../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md) —
`User.isActive` and existence fail-closed behavior for the viewer, for a
mid-chain Reporting bridge, for the target, and for a direct-PP endpoint; the
request-shape rules (empty-bulk short-circuit, duplicate-target collapse, one
entry per distinct target); and the Reporting walk rules (provisional viewer
proof, per-target acyclicity, path-local visited state, and the two
chain-termination cases).

**Explicitly out of scope here (do not author under these IDs):**

- `isAllowed` / functional-role (FR) **evaluation** — that is CAP-4, dispatched
  separately as `ACM-2-scenarios`. ACM4R-MA-05/06 use a real FR fixture solely
  to prove it never enters the audience result; they never call `isAllowed` or
  assert an FR authorization decision. This preserves the local AD-3 rule that
  ACM-3 and ACM-4 end at audience-resolution outputs.
- AD-20 due/departure evaluation and the dismissed-target **projection** — both
  are deferred for the entire Kernel MVP (ACM-0 through ACM-5) per the local
  AD-4 scoped amendment. `ACM3-II-03` below tests `isActive = false`, not a
  scheduled Departure, and documents the deferral rather than the future
  projection behavior.
- `canAccessSection`, field projection, Project/Department/PP-HR-line
  audiences, and anything HTTP/`/users`-facing.

## CAP-3 (ACM-1) — FR schema, migration, and bootstrap seed

This story proves **CAP-3 — functional-role data foundation**: that a fresh
database ends up with exactly the canonical FR rows the Kernel MVP defines,
that the seed is idempotent, and that the underlying PostgreSQL constraints
reject the shapes the type-separation model forbids.

**No facade call and no HTTP endpoint applies here**, for the same reason
[testing-strategy.md](../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp)
gives for ACM-0: "ACM-0 sits inside the same boundary but has no facade call
to make: its subject is the deploy-time root User step, so its Stage-2
evidence runs against migrated PostgreSQL directly." ACM-1's subject is
`services/backend/src/access-control/infrastructure/bootstrap/access-control-bootstrap.ts`,
wrapped by `services/backend/scripts/bootstrap-access-control.ts` and run as
`npm run db:bootstrap:access-control`, invoked after `npm run db:seed`
(CAP-8/ACM-0). Every scenario below records that exact entrypoint (or, for
constraint-rejection scenarios that probe the migration directly, a raw SQL
insert against the migrated schema) and the resulting row-level database
state — never a response body, because there is no response.

**Precondition every CAP-3 scenario shares:** the CAP-8/ACM-0 root User step has
already created and validated exactly one active User whose normalized
`workEmail` equals normalized `ROOT_WORK_EMAIL`. This suite treats that as an
already-satisfied precondition, never as ACM-1 work — CAP-3's own success
criteria state "CAP-8 has already ensured the normalized active root User."

**Explicitly out of scope here (do not author under these IDs):**

- Any `/roles` or `/users/:id/policies` scenario — the Kernel MVP adds no
  `/roles` HTTP surface or permission-mutation port (FR-AMD-1 "MVP
  reduction"), and no User Management route changes are in scope.
- Nothing already covered by `ACM1-FB-01`..`ACM1-FB-09`. Those nine are
  approved and must not be rewritten, renumbered, or restated; the ACM-1R
  contracts add only what the audit records as Missing or Partial. The
  absent-singleton adoption table, post-bootstrap drift/rollback, concurrent-run
  convergence, and the AR-policy `targetRole='hr-admin'` cross-type collision
  were previously listed here as deferred; they are no longer deferred and are
  covered by `ACM1R-FB-20`..`ACM1R-FB-26`.
- `isAllowed` evaluation behavior (CAP-4/ACM-2) — this suite proves only that
  the data exists in the right shape, never that it is correctly evaluated.

## CAP-6 (ACM-8) — Deployable kernel composition

This story proves **CAP-6 — deployable kernel composition**: that `AppModule`
imports `AccessControlModule` so `AccessControlFacade` is resolvable from the
real production application container, while `ACCESS_CONTROL_PORT` stays
bound to `InterimAccessControlAdapter` in `user-management.module.ts` and no
User Management file, `/users` behavior, or Access Control HTTP/debug
endpoint changes. Per the scoped headless-facade gate (local AD-3), Stage-2
evidence for this story resolves `AccessControlFacade` and
`ACCESS_CONTROL_PORT` from the real bootstrapped `AppModule` — not a
standalone `AccessControlModule` test module — with real Prisma adapters and
migrated PostgreSQL, no repository fake, and no provider override.

**Precondition this suite depends on:** ACM-2, ACM-3, and ACM-5 are each
production-approved in
`_bmad-output/specs/spec-access-control-kernel-mvp/approvals.yaml`, and the
ACM-9 baseline evidence artifact (the most recent run under
`_bmad-output/test-artifacts/performance/acm9-baseline-*.json`) has
`status: PASS` under protocol `ACM9-MVP-v1`, matching the protocol this MVP
uses, per the architecture spine's conditional-dependency rule (AD-3) and the
`ACM-8-scenarios` precondition in `stories.yaml`.

**Explicitly out of scope here (do not author under these IDs):** rebinding
`ACCESS_CONTROL_PORT` away from `InterimAccessControlAdapter`; any change to
`UserManagementModule` or any other User Management file; any new route or
controller; and any change to `isAllowed`/`canAccessSection`/`resolveAudiences`
behavior itself.

## Kernel fixture (this suite)

| Persona | Role in the graph | Used by |
| --- | --- | --- |
| **Alice** | Active baseline target; direct report of Bob | all three |
| **Bob** | Alice's active direct manager | `ACM3-II-01`, `ACM3-II-02`, `ACM3-II-03` |
| **Owen** | Inactive (`isActive = false`), top of tree (`reportsToUserId` empty); Bob's manager | `ACM3-II-01` (viewer) |
| **DeadNode** | Inactive (`isActive = false`) manager one hop above Bob | `ACM3-II-02` (unusable bridge) |
| **Carol** | Active, DeadNode's manager, top of tree | `ACM3-II-02` (viewer) |
| **Dismissed** | Inactive (`isActive = false`) direct report of Bob, alongside Alice | `ACM3-II-03` (target) |

Reporting edges, all `Relationship type='direct'`:

- `ACM3-II-01`: Alice → Bob → Owen (Owen inactive, no edge above Owen)
- `ACM3-II-02`: Alice → Bob → DeadNode → Carol (DeadNode inactive)
- `ACM3-II-03`: Alice → Bob, Dismissed → Bob (Dismissed inactive; Alice unaffected control target)

No PP relationship exists for any persona above unless a scenario states one;
absence of a PP edge is itself part of each fixture (it rules out PP as an
alternate source of the audience under test).

## Kernel fixture — CAP-1 completion (this suite)

Independent, run-scoped PostgreSQL fixtures. Personas are **not** shared with
the table above except where a scenario names one explicitly (`ACM3-II-04`
Test 2 reuses Owen as an identity-invalid viewer). Every person is active
unless the table says otherwise.

| Persona | Role in the graph | Used by |
| --- | --- | --- |
| **Nora** | Viewer with at least one active direct report, so an executed graph read would be observable | `ACM3-II-04` (viewer) |
| **Mila** | Viewer, top of tree, direct manager of Dana | `ACM3-II-05` (viewer) |
| **Dana** | Direct report of Mila; no PP edge | `ACM3-II-05` (target) |
| **Rhea** | Target below a cycle the viewer is not on | `ACM3-II-06` (target) |
| **Kai**, **Lena** | Two-node cycle above Rhea (Kai ⇄ Lena) | `ACM3-II-06` |
| **Sasha** | Viewer, top of tree, not on Rhea's chain; direct manager of Tess | `ACM3-II-06` (viewer) |
| **Tess** | Clean-chain control target in the same call | `ACM3-II-06` |
| **Piotr** | Direct report of Vera, reporting-only path | `ACM3-II-07` (target) |
| **Quinn** | Direct report of Vera **and** assigned PP edge to Vera | `ACM3-II-07` (target) |
| **Vera** | Viewer, proven at hop one, sitting below a cycle | `ACM3-II-07` (viewer) |
| **Nils**, **Olek** | Two-node cycle above Vera (Nils ⇄ Olek) | `ACM3-II-07` |
| **Ivan** | Target below a viewer who is inside the cycle | `ACM3-II-08` (target) |
| **Yulia** | Viewer, one of the two cycle members | `ACM3-II-08` (viewer) |
| **Zoran** | The cycle's other member; also used as a target | `ACM3-II-08` |
| **Hana** | Target two hops below the viewer | `ACM3-II-09` (target) |
| **Grzegorz** | Hana's direct manager | `ACM3-II-09` |
| **Igor** | Viewer, top of tree, **no `direct` row at all** | `ACM3-II-09` (viewer) |
| **Jonas** | Target one hop below the viewer | `ACM3-II-10` (target) |
| **Klara** | Viewer, directly below the dead node | `ACM3-II-10` (viewer) |
| **Milo** | Inactive (`isActive = false`) node above Klara, with a live person above it | `ACM3-II-10` (unusable endpoint, and target in Test 3) |
| **Nika** | Active, above Milo — proves nothing above the dead node is reachable | `ACM3-II-10` (viewer in Test 2) |
| **Roman** | Target whose assigned PP is deactivated | `ACM3-II-11` (target) |
| **Pavlo** | Inactive (`isActive = false`) assigned PP of Roman | `ACM3-II-11` (viewer) |
| **Taras** | Inactive (`isActive = false`) target of a live PP assignment | `ACM3-II-11` (target) |
| **Solomiya** | Active assigned PP of Taras and Ulyana | `ACM3-II-11` (viewer) |
| **Ulyana** | Active control target of Solomiya | `ACM3-II-11` |
| **Ada**, **Borys** | Two targets sharing every ancestor above them | `ACM3-II-12` |
| **Cyril** | Shared direct manager of Ada and Borys | `ACM3-II-12` |
| **Dmytro** | Viewer, top of tree | `ACM3-II-12` (viewer) |
| **Eva** | Target on a separate cyclic branch in the same call | `ACM3-II-12` |
| **Fedir**, **Hlib** | Two-node cycle above Eva (Fedir ⇄ Hlib) | `ACM3-II-12` |
| **Vlad** | Viewer, direct manager of Wiktor | `ACM3-II-13` (viewer) |
| **Wiktor** | Target with a live `direct` edge, so the healthy call returns `reporting` | `ACM3-II-13` |
| **Xenia** | Viewer, top of tree, direct manager of Yaroslav | `ACM3-II-14` (viewer) |
| **Yaroslav** | Active control target | `ACM3-II-14` |
| *(missing id)* | Well-formed id asserted to match **no** `users` row before the call | `ACM3-II-14` |

Reporting edges, all `Relationship type='direct'` unless marked:

- `ACM3-II-04`: Nora ← at least one active report (edge direction irrelevant; the fixture only has to be non-trivial)
- `ACM3-II-05`: Dana → Mila
- `ACM3-II-06`: Rhea → Kai → Lena → Kai (cycle); Tess → Sasha
- `ACM3-II-07`: Piotr → Vera, Quinn → Vera, Vera → Nils → Olek → Nils (cycle); plus `people_partner` Quinn → Vera
- `ACM3-II-08`: Ivan → Yulia → Zoran → Yulia (cycle containing the viewer)
- `ACM3-II-09`: Hana → Grzegorz → Igor (no edge above Igor)
- `ACM3-II-10`: Jonas → Klara → Milo → Nika (Milo inactive)
- `ACM3-II-11`: `people_partner` only — Roman → Pavlo (Pavlo inactive), Taras → Solomiya (Taras inactive), Ulyana → Solomiya; **no `direct` edge anywhere**
- `ACM3-II-12`: Ada → Cyril, Borys → Cyril, Cyril → Dmytro; Eva → Fedir → Hlib → Fedir (cycle)
- `ACM3-II-13`: Wiktor → Vlad
- `ACM3-II-14`: Yaroslav → Xenia

The cycles above are constructible against the shipped schema:
`relationships_one_direct_per_user` permits one `direct` row per person and
`relationships_no_self_endpoint_check` forbids only self-reference, so the
smallest cycle has length two. No scenario in this group constructs a
missing-endpoint row: `relationships_shape_check` plus the `ON DELETE RESTRICT`
endpoint foreign key make it unreachable in supported operation, and CAP-1
records it as a defensive invariant rather than a scenario.

## CAP-2 (ACM-4R) — multi-audience coverage-repair fixture

All named users below are active. These are independent, UUID-scoped PostgreSQL
fixtures for the eventual direct-facade suite; names may be reused only when a
scenario explicitly declares the exact edge facts.

| Persona | Relationship facts | Used by |
| --- | --- | --- |
| **Marta** | Viewer, direct manager and assigned PP of Alice | `ACM4R-MA-01`, `ACM4R-MA-04` |
| **Alice** | `direct` and `people_partner` edges both point to Marta | `ACM4R-MA-01`, `ACM4R-MA-04` |
| **Zara** | Viewer, direct manager of Daria only | `ACM4R-MA-03` |
| **Paula** | Viewer, assigned PP of Daria only | `ACM4R-MA-03` |
| **Colin** | Active, unrelated viewer | `ACM4R-MA-03`, `ACM4R-MA-05` |
| **Mara** | Mixed-fixture viewer; has an FR attachment but no audience persistence | `ACM4R-MA-06` |
| **Taylor** | Direct report and PP assignment to Mara | `ACM4R-MA-06` |
| **Reese** | Direct report of Mara only | `ACM4R-MA-06` |
| **Carmen** | PP assignment to Mara only | `ACM4R-MA-06` |
| **Noah** | Active, unrelated to Mara | `ACM4R-MA-06` |

The ACM4R-MA-05 and ACM4R-MA-06 FR facts require completed ACM-1 production:
a real `type='FR'` permission/policy/attachment is fixture data only. It must
not be translated into an `Audience`, and the scenario never invokes
`isAllowed`.

## Layout

| ID | File | Proves |
| --- | --- | --- |
| `ACM3-II-01` | [inactive-identity/acm3-ii-01-inactive-viewer-chain-top.md](inactive-identity/acm3-ii-01-inactive-viewer-chain-top.md) | An inactive viewer at the top of an otherwise-live reporting chain gets an empty audience `Set` for every requested target, self included — the viewer-identity gate runs before any derivation and is global to the call. |
| `ACM3-II-02` | [inactive-identity/acm3-ii-02-inactive-bridge-stops-traversal.md](inactive-identity/acm3-ii-02-inactive-bridge-stops-traversal.md) | An inactive node mid-chain is an unusable bridge: the active viewer above it never gets proven, Reporting is denied for that target only, and Colleague is the floor — viewer and target identity are both fine, only the path is broken. |
| `ACM3-II-03` | [inactive-identity/acm3-ii-03-inactive-target-below-active-manager.md](inactive-identity/acm3-ii-03-inactive-target-below-active-manager.md) | An inactive target under a live, active manager gets an empty audience `Set` — not Reporting, not the Colleague floor — fail-closed for the Kernel MVP until the deferred dismissed-target projection exists; a sibling active target in the same bulk call is unaffected, proving the failure is local to that one target. |
| `ACM3-II-04` | [inactive-identity/acm3-ii-04-empty-bulk-short-circuit.md](inactive-identity/acm3-ii-04-empty-bulk-short-circuit.md) | An empty target list returns an empty map with **zero** relationship-graph port calls, and the short-circuit sits above the viewer-identity gate so an invalid viewer costs no read either. |
| `ACM3-II-05` | [inactive-identity/acm3-ii-05-duplicate-targets-collapse-to-one-key.md](inactive-identity/acm3-ii-05-duplicate-targets-collapse-to-one-key.md) | Repeated target ids — the viewer's own id included — collapse to one map key each, and deduplication happens before the graph read. |
| `ACM3-II-06` | [inactive-identity/acm3-ii-06-repeat-before-viewer-proof.md](inactive-identity/acm3-ii-06-repeat-before-viewer-proof.md) | A repeat reached before any viewer proof ends the walk and denies Reporting for that target only; records why, under one-`direct`-row-per-person, this is the only constructible shape of "before viewer proof". |
| `ACM3-II-07` | [inactive-identity/acm3-ii-07-repeat-after-viewer-proof.md](inactive-identity/acm3-ii-07-repeat-after-viewer-proof.md) | Viewer proof is provisional: a repeat above a proven viewer denies Reporting for that target, while direct PP and Self resolve independently. **Narrowing** — today's resolver grants Reporting here. |
| `ACM3-II-08` | [inactive-identity/acm3-ii-08-viewer-inside-the-cycle.md](inactive-identity/acm3-ii-08-viewer-inside-the-cycle.md) | A viewer who is herself a member of the cycle is denied rather than proven, and the target itself counts as a visited node. **Narrowing.** |
| `ACM3-II-09` | [inactive-identity/acm3-ii-09-absent-edge-is-a-clean-end.md](inactive-identity/acm3-ii-09-absent-edge-is-a-clean-end.md) | Termination case 1: an absent manager edge is a clean end, so the provisional proof becomes a Reporting grant. The positive control that stops the cycle group from being satisfiable by denying everything. |
| `ACM3-II-10` | [inactive-identity/acm3-ii-10-inactive-endpoint-after-viewer-proof.md](inactive-identity/acm3-ii-10-inactive-endpoint-after-viewer-proof.md) | Termination case 2: an inactive endpoint above a proven viewer is a clean end and Reporting is granted, while nothing above the dead node is reachable. The 2026-08-31 review repair resolved F-6: this is verified already-shipped behavior and a regression guard, not a widening. |
| `ACM3-II-11` | [inactive-identity/acm3-ii-11-inactive-pp-endpoint.md](inactive-identity/acm3-ii-11-inactive-pp-endpoint.md) | A deactivated assigned PP derives no PP audience over anyone, and a deactivated target of a live PP assignment gets an empty `Set` rather than the Colleague floor. **Narrowing on both halves.** |
| `ACM3-II-12` | [inactive-identity/acm3-ii-12-path-local-visited-state.md](inactive-identity/acm3-ii-12-path-local-visited-state.md) | Visited state is path-local: two targets sharing every ancestor both keep Reporting, while a cyclic target in the same call is denied. Guards against the one-visited-set-per-request implementation of the acyclicity rule. |
| `ACM3-II-13` | [inactive-identity/acm3-ii-13-infrastructure-error-propagates.md](inactive-identity/acm3-ii-13-infrastructure-error-propagates.md) | An unreadable relationship graph rejects the call instead of resolving to an empty or partial map. Authority is the Stage-2 dispatch text, not CAP-1 `success` — rejectable on its own without affecting the group. |
| `ACM3-II-14` | [inactive-identity/acm3-ii-14-missing-viewer-and-target.md](inactive-identity/acm3-ii-14-missing-viewer-and-target.md) | A well-formed id matching no `users` row derives no audience as viewer or as target, and a missing target still gets a map key with an empty `Set`. **Narrowing** — today both yield `colleague`. |
| `ACM4R-MA-01` | [multi-audience/acm4r-ma-01-reporting-and-pp-retained.md](multi-audience/acm4r-ma-01-reporting-and-pp-retained.md) | Reporting and direct PP are retained together for one viewer×target pair; neither is replaced by Colleague. |
| `ACM4R-MA-02` | [multi-audience/acm4r-ma-02-self-exclusive-after-confirmation.md](multi-audience/acm4r-ma-02-self-exclusive-after-confirmation.md) | A confirmed active identity receives exactly `self`, never Reporting, PP, or Colleague. |
| `ACM4R-MA-03` | [multi-audience/acm4r-ma-03-colleague-is-floor.md](multi-audience/acm4r-ma-03-colleague-is-floor.md) | Colleague is the fallback only: it appears for an unrelated active viewer and is absent for Reporting and direct-PP viewers. |
| `ACM4R-MA-04` | [multi-audience/acm4r-ma-04-duplicate-target-does-not-duplicate-audiences.md](multi-audience/acm4r-ma-04-duplicate-target-does-not-duplicate-audiences.md) | A repeated target input produces one map key and one each of the Reporting and PP labels — no key or audience duplication. |
| `ACM4R-MA-05` | [multi-audience/acm4r-ma-05-fr-permission-excluded-from-audiences.md](multi-audience/acm4r-ma-05-fr-permission-excluded-from-audiences.md) | A real FR permission attached to the viewer is never converted into an audience or used to widen the audience result. |
| `ACM4R-MA-06` | [multi-audience/acm4r-ma-06-mixed-postgresql-fixture.md](multi-audience/acm4r-ma-06-mixed-postgresql-fixture.md) | One real PostgreSQL fixture concurrently exercises Reporting, PP, Colleague, mixed Reporting+PP, and FR separation through the public facade. |
| `ACM2-IA-01` | [is-allowed/acm2-ia-01-live-fr-grant-allows.md](is-allowed/acm2-ia-01-live-fr-grant-allows.md) | An active User with the exact live FR attachment/grant/key chain receives `true`. |
| `ACM2-IA-02` | [is-allowed/acm2-ia-02-revocation-is-immediate.md](is-allowed/acm2-ia-02-revocation-is-immediate.md) | Removing an attachment or the reachable policy makes the next identical call return `false`; no stale positive is permitted. |
| `ACM2-IA-03` | [is-allowed/acm2-ia-03-inactive-user-denies.md](is-allowed/acm2-ia-03-inactive-user-denies.md) | An inactive User is denied despite an otherwise-valid FR grant. |
| `ACM2-IA-04` | [is-allowed/acm2-ia-04-missing-user-denies.md](is-allowed/acm2-ia-04-missing-user-denies.md) | A nonexistent `userId` returns `false`, not an application error. |
| `ACM2-IA-05` | [is-allowed/acm2-ia-05-unknown-key-denies.md](is-allowed/acm2-ia-05-unknown-key-denies.md) | A key absent from the catalog is denied. |
| `ACM2-IA-06` | [is-allowed/acm2-ia-06-case-variant-denies.md](is-allowed/acm2-ia-06-case-variant-denies.md) | A case-only variant of a granted key is denied. |
| `ACM2-IA-07` | [is-allowed/acm2-ia-07-ar-policy-never-grants.md](is-allowed/acm2-ia-07-ar-policy-never-grants.md) | A valid attached AR `targetRole` collision never leaks the separate FR permission. |
| `ACM2-IA-08` | [is-allowed/acm2-ia-08-nonmatching-join-denies.md](is-allowed/acm2-ia-08-nonmatching-join-denies.md) | An existing permission does not allow unless its FR grant is reachable through the caller's attachment. |
| `ACM2-IA-09` | [is-allowed/acm2-ia-09-infrastructure-error-propagates.md](is-allowed/acm2-ia-09-infrastructure-error-propagates.md) | A database connection/query failure rejects; it never becomes `false`. |
| `ACM2-IA-10` | [is-allowed/acm2-ia-10-empty-key-denies.md](is-allowed/acm2-ia-10-empty-key-denies.md) | An empty key is denied, with no invented no-round-trip requirement. |
| `ACM5-SA-01` | [section-access/acm5-sa-01-s1-self-or-colleague-read.md](section-access/acm5-sa-01-s1-self-or-colleague-read.md) | S1 returns `read` for exactly Self or Colleague, with no stronger audience present. |
| `ACM5-SA-02` | [section-access/acm5-sa-02-s1-reporting-or-pp-write.md](section-access/acm5-sa-02-s1-reporting-or-pp-write.md) | S1 returns `write` for Reporting or direct PP. |
| `ACM5-SA-03` | [section-access/acm5-sa-03-s10-all-phase-zero-audiences-read.md](section-access/acm5-sa-03-s10-all-phase-zero-audiences-read.md) | S10 returns `read`, never `write` or `none`, for every confirmed Phase-0 audience. |
| `ACM5-SA-04` | [section-access/acm5-sa-04-s11-all-phase-zero-audiences-read.md](section-access/acm5-sa-04-s11-all-phase-zero-audiences-read.md) | S11 returns `read`, never `write` or `none`, for every confirmed Phase-0 audience. |
| `ACM5-SA-05` | [section-access/acm5-sa-05-strongest-merged-audience-wins.md](section-access/acm5-sa-05-strongest-merged-audience-wins.md) | A merged Reporting+PP set receives the strongest applicable decision, `write > read > none`. |
| `ACM5-SA-06` | [section-access/acm5-sa-06-unsupported-section-returns-none.md](section-access/acm5-sa-06-unsupported-section-returns-none.md) | Any unsupported section string returns `none` successfully. |
| `ACM5-SA-07` | [section-access/acm5-sa-07-missing-target-returns-none.md](section-access/acm5-sa-07-missing-target-returns-none.md) | A missing target returns `none` successfully. |
| `ACM5-SA-08` | [section-access/acm5-sa-08-empty-audiences-return-none.md](section-access/acm5-sa-08-empty-audiences-return-none.md) | An empty Phase-0 audience set returns `none` for S1, S10, and S11. |
| `ACM5-SA-09` | [section-access/acm5-sa-09-audience-resolution-error-propagates.md](section-access/acm5-sa-09-audience-resolution-error-propagates.md) | An audience-resolution infrastructure error rejects instead of silently returning `none`. |
| `ACM8-KC-01` | [kernel-composition/acm8-kc-01-facade-resolves-from-real-container.md](kernel-composition/acm8-kc-01-facade-resolves-from-real-container.md) | `AccessControlFacade` resolves from the real bootstrapped `AppModule` and returns a live decision backed by the real Prisma adapters. |
| `ACM8-KC-02` | [kernel-composition/acm8-kc-02-interim-adapter-binding-unchanged.md](kernel-composition/acm8-kc-02-interim-adapter-binding-unchanged.md) | `ACCESS_CONTROL_PORT` still resolves to `InterimAccessControlAdapter` in the same composed container — composition does not silently rebind it. |
| `ACM8-KC-03` | [kernel-composition/acm8-kc-03-user-management-behavior-unchanged.md](kernel-composition/acm8-kc-03-user-management-behavior-unchanged.md) | `GET /users/:id` and every other existing route return byte-for-byte identical responses before and after composition. |
| `ACM8-KC-04` | [kernel-composition/acm8-kc-04-no-http-or-debug-endpoint-added.md](kernel-composition/acm8-kc-04-no-http-or-debug-endpoint-added.md) | No new route appears in the composed application's route table — `AccessControlModule` stays headless. |
| `ACM8-KC-05` | [kernel-composition/acm8-kc-05-corrected-module-header-comment.md](kernel-composition/acm8-kc-05-corrected-module-header-comment.md) | The `AccessControlModule` header comment is corrected to stop conflating DI-graph visibility with the separate, not-yet-authorized `ACCESS_CONTROL_PORT` rebinding decision. |
| `ACM1-FB-01` | [fr-bootstrap/acm1-fb-01-three-canonical-permissions-seeded.md](fr-bootstrap/acm1-fb-01-three-canonical-permissions-seeded.md) | A fresh database ends up with exactly the three canonical `Permissions` rows — no more, no fewer, no other key. |
| `ACM1-FB-02` | [fr-bootstrap/acm1-fb-02-one-hr-admin-fr-policy-seeded.md](fr-bootstrap/acm1-fb-02-one-hr-admin-fr-policy-seeded.md) | A fresh database ends up with exactly one FR `Policies` row, `targetRole='hr-admin'`. |
| `ACM1-FB-03` | [fr-bootstrap/acm1-fb-03-role-granted-exactly-three-permissions.md](fr-bootstrap/acm1-fb-03-role-granted-exactly-three-permissions.md) | The seeded `hr-admin` role is joined to exactly the three seeded permissions through `PolicyPermissions`, one grant per key. |
| `ACM1-FB-04` | [fr-bootstrap/acm1-fb-04-exactly-one-root-attachment.md](fr-bootstrap/acm1-fb-04-exactly-one-root-attachment.md) | The one pre-existing active root User (CAP-8) gets exactly one `UserPolicies` attachment to `hr-admin`, and `AccessControlBootstrap` records it as provenance. |
| `ACM1-FB-05` | [fr-bootstrap/acm1-fb-05-rerun-seed-no-duplicates.md](fr-bootstrap/acm1-fb-05-rerun-seed-no-duplicates.md) | Running the bootstrap a second time against an already-bootstrapped, undrifted database changes nothing — same ids, same counts, no duplicate rows. |
| `ACM1-FB-06` | [fr-bootstrap/acm1-fb-06-no-other-role-attachment-or-grant.md](fr-bootstrap/acm1-fb-06-no-other-role-attachment-or-grant.md) | After bootstrap, `Policies`/`Permissions`/`PolicyPermissions`/`UserPolicies` contain exactly the canonical rows and nothing else — no default AR policy, no extra grant, no non-root attachment. |
| `ACM1-FB-07` | [fr-bootstrap/acm1-fb-07-fr-policy-has-no-target.md](fr-bootstrap/acm1-fb-07-fr-policy-has-no-target.md) | The seeded FR `hr-admin` row's `targetType` and `targetId` are both `NULL` — FR rows carry no target sentinel. |
| `ACM1-FB-08` | [fr-bootstrap/acm1-fb-08-ar-fr-shape-violations-rejected.md](fr-bootstrap/acm1-fb-08-ar-fr-shape-violations-rejected.md) | An FR row carrying a target, an AR row missing one, a null `type`, and a third `type` value are each rejected by the `Policies` row-shape `CHECK`/`NOT NULL` at the database boundary. |
| `ACM1-FB-09` | [fr-bootstrap/acm1-fb-09-duplicate-keys-and-joins-rejected.md](fr-bootstrap/acm1-fb-09-duplicate-keys-and-joins-rejected.md) | A duplicate `Permissions.key`, a duplicate `PolicyPermissions` pair, and a duplicate `UserPolicies` attachment are each rejected by their respective uniqueness constraint. |
| `ACM1R-FB-10` | [fr-bootstrap/acm1r-fb-10-partial-fr-role-key.md](fr-bootstrap/acm1r-fb-10-partial-fr-role-key.md) | The FR role key is partial: a second FR `hr-admin` row is rejected while an AR row carrying the same `targetRole` is accepted. (invariant 3) |
| `ACM1R-FB-11` | [fr-bootstrap/acm1r-fb-11-grant-type-separation-boundary.md](fr-bootstrap/acm1r-fb-11-grant-type-separation-boundary.md) | The `Policies(id, type)` support key exists and is referenced; `policyType` defaults to `FR` and rejects any other value; and a grant to an AR policy is refused by PostgreSQL, not by application code. (invariants 4, 7, 8) |
| `ACM1R-FB-12` | [fr-bootstrap/acm1r-fb-12-permission-fk-and-permission-first-index.md](fr-bootstrap/acm1r-fb-12-permission-fk-and-permission-first-index.md) | A grant to an unknown `permissionId` is rejected, and the `(permissionId, policyId)` index exists in that column order. (invariants 9, 10) |
| `ACM1R-FB-13` | [fr-bootstrap/acm1r-fb-13-userpolicies-referential-integrity.md](fr-bootstrap/acm1r-fb-13-userpolicies-referential-integrity.md) | An attachment naming an unknown user or an unknown policy is rejected. (invariant 11, referential half) |
| `ACM1R-FB-14` | [fr-bootstrap/acm1r-fb-14-bootstrap-singleton-constraints.md](fr-bootstrap/acm1r-fb-14-bootstrap-singleton-constraints.md) | A second singleton, a wrong `key`, and a duplicate `rootUserId`/`policyId` reference are each rejected — the singleton is a constraint, not a convention. (invariant 12) |
| `ACM1R-FB-15` | [fr-bootstrap/acm1r-fb-15-on-delete-restrict-four-foreign-keys.md](fr-bootstrap/acm1r-fb-15-on-delete-restrict-four-foreign-keys.md) | Deleting a granted permission, a granted policy, an attached user, or a singleton-referenced row is rejected on all four foreign keys. (invariant 13) |
| `ACM1R-FB-16` | [fr-bootstrap/acm1r-fb-16-permission-key-immutability.md](fr-bootstrap/acm1r-fb-16-permission-key-immutability.md) | A renamed canonical key is *absent*, not *different*: the seed restores the canonical row and preserves the renamed one, never issuing an in-place key update. (invariant 5, immutability half) |
| `ACM1R-FB-17` | [fr-bootstrap/acm1r-fb-17-dec-um-007-normalization-at-lookup.md](fr-bootstrap/acm1r-fb-17-dec-um-007-normalization-at-lookup.md) | A whitespace- and case-variant `ROOT_WORK_EMAIL` resolves to the canonical root, and the singleton persists the normalized form. |
| `ACM1R-FB-18` | [fr-bootstrap/acm1r-fb-18-advisory-lock-and-timeout.md](fr-bootstrap/acm1r-fb-18-advisory-lock-and-timeout.md) | The common advisory lock is taken before any bootstrap-state inspection — so it covers first creation on an empty database — and a timeout fails atomically. |
| `ACM1R-FB-19` | [fr-bootstrap/acm1r-fb-19-revalidate-before-writes-and-before-commit.md](fr-bootstrap/acm1r-fb-19-revalidate-before-writes-and-before-commit.md) | A root deactivated inside the transaction window is caught by the pre-commit revalidation and the run rolls back. |
| `ACM1R-FB-20` | [fr-bootstrap/acm1r-fb-20-absent-singleton-adopts-existing-fr-policy.md](fr-bootstrap/acm1r-fb-20-absent-singleton-adopts-existing-fr-policy.md) | With no singleton, an existing FR `hr-admin` policy is adopted by natural key — but only after `operator`, `managedBy`, and null targets verify; drift refuses adoption. |
| `ACM1R-FB-21` | [fr-bootstrap/acm1r-fb-21-absent-singleton-attachment-adoption-and-preservation.md](fr-bootstrap/acm1r-fb-21-absent-singleton-attachment-adoption-and-preservation.md) | With no singleton, an attachment is adopted only when it already belongs to the located root; attachments belonging to other administrators are preserved, never transferred. |
| `ACM1R-FB-22` | [fr-bootstrap/acm1r-fb-22-absent-singleton-adopts-changed-root.md](fr-bootstrap/acm1r-fb-22-absent-singleton-adopts-changed-root.md) | With no singleton there is no provenance to contradict, so a changed configured root is adopted rather than rejected. |
| `ACM1R-FB-23` | [fr-bootstrap/acm1r-fb-23-singleton-present-email-drift-fails.md](fr-bootstrap/acm1r-fb-23-singleton-present-email-drift-fails.md) | With the singleton present, the same email change is conflicting drift: fail before writes, no transfer, no second root attachment. The deliberate asymmetry, paired with `ACM1R-FB-22`. |
| `ACM1R-FB-24` | [fr-bootstrap/acm1r-fb-24-cross-type-ar-hr-admin-preserved.md](fr-bootstrap/acm1r-fb-24-cross-type-ar-hr-admin-preserved.md) | An AR policy carrying `targetRole='hr-admin'` is never adopted, mutated, counted, or reported as drift — the bootstrap creates its own FR row and leaves the AR row and its attachment untouched. |
| `ACM1R-FB-25` | [fr-bootstrap/acm1r-fb-25-concurrent-runs.md](fr-bootstrap/acm1r-fb-25-concurrent-runs.md) | Two concurrent first runs converge on one bootstrap set; two runs with different configured roots leave one coherent set and one atomic failure. |
| `ACM1R-FB-26` | [fr-bootstrap/acm1r-fb-26-per-field-drift-restore-preserve-fail.md](fr-bootstrap/acm1r-fb-26-per-field-drift-restore-preserve-fail.md) | The FR-AMD-1 drift table, case by case: missing owned rows restored, descriptive fields and generated ids preserved, identity and authorization-bearing drift failed before any write. |
| `ACM1R-FB-27` | [fr-bootstrap/acm1r-fb-27-atomic-rollback-no-partial-state.md](fr-bootstrap/acm1r-fb-27-atomic-rollback-no-partial-state.md) | A failure injected *after* writes and before commit leaves nothing behind — the only arrangement that distinguishes one real transaction from statements that failed early. |
| `ACM1R-FB-28` | [fr-bootstrap/acm1r-fb-28-fourth-permission-and-admin-attachments-survive.md](fr-bootstrap/acm1r-fb-28-fourth-permission-and-admin-attachments-survive.md) | An approved fourth permission, its grant to the canonical policy, and a later administrator's attachment all survive a rerun untouched. |
