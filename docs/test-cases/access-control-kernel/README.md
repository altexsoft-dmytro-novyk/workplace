# Access Control Kernel — Test-Case Suite (Kernel MVP)

Stage-1 scenario documents (AD-1) for `SPEC-access-control-kernel-mvp`, following
the team-wide authoring pattern in [../README.md](../README.md) and the scoped
headless-facade variant of it defined in
[../../architecture/testing-strategy.md](../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp).

**Status:** draft, pending per-file human AD-1 Stage-1 approval. No file in
this suite has a Stage-2 test or production code behind it yet — see
`_bmad-output/specs/spec-access-control-kernel-mvp/approvals.yaml`, which is
empty by design until the first approval lands.

**Scope of this partial dispatch.** This suite currently contains **only**
the three CAP-1 (ACM-3) scenarios and the nine CAP-3 (ACM-1) scenarios listed
under [Layout](#layout) below. It is not the complete scenario set for either
story as described in
`_bmad-output/specs/spec-access-control-kernel-mvp/stories.yaml` —
for `ACM-3-scenarios`: duplicate-target collapse, the empty-bulk
short-circuit, both cycle positions relative to viewer proof, the direct-PP
inactive-endpoint variants, and the after-viewer-proof chain-termination
**grant** are still unwritten; for `ACM-1-scenarios`: the absent-singleton
adoption cases, post-bootstrap drift and rollback, concurrency, the
cross-type `hr-admin` collision, an allowed fourth permission, and the
`pg_indexes` permission-first-index assertion are still unwritten. None of
this may be inferred from what is here.

## Contract and boundary

This suite proves only **CAP-1 — fail-closed audience resolution** against the
public `AccessControlFacade.resolveAudiences(viewerId, employeeIds): Promise<Map<string, Set<Audience>>>`
method, per the scoped headless-facade gate (local AD-3): real
`AccessControlModule`, real Prisma adapters, migrated PostgreSQL, no
repository fake, no invented HTTP endpoint. Every scenario records the public
method call, its typed input, and its typed result — including which map
entries are **absent audiences** (an empty `Set`, not a missing key: every
requested id always gets a map entry per the facade contract) — instead of an
`inputURL`/`inputRequest` HTTP triad, which does not apply to a headless
facade gate.

**In scope here:** `User.isActive` fail-closed behavior for the viewer, for a
mid-chain Reporting bridge, and for the target, per CAP-1's success criteria in
[SPEC.md](../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md).

**Explicitly out of scope here (do not author under these IDs):**

- `isAllowed` / functional-role (FR) behavior — that is CAP-4, dispatched
  separately as `ACM-2-scenarios`, and depends on `ACM-1` (the FR schema and
  bootstrap) being complete. Mixing a CAP-4 scenario into this CAP-1 suite
  would misfile it against the wrong `story_id` in `approvals.yaml` and
  violates the local AD-3 rule that "ACM-3 and ACM-4 end at audience-resolution
  outputs."
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

**Precondition all nine scenarios share:** the CAP-8/ACM-0 root User step has
already created and validated exactly one active User whose normalized
`workEmail` equals normalized `ROOT_WORK_EMAIL`. This suite treats that as an
already-satisfied precondition, never as ACM-1 work — CAP-3's own success
criteria state "CAP-8 has already ensured the normalized active root User."

**Explicitly out of scope here (do not author under these IDs):**

- Any `/roles` or `/users/:id/policies` scenario — the Kernel MVP adds no
  `/roles` HTTP surface or permission-mutation port (FR-AMD-1 "MVP
  reduction"), and no User Management route changes are in scope.
- The absent-singleton adoption table, post-bootstrap drift/rollback,
  concurrent-run convergence, and the AR-policy `targetRole='hr-admin'`
  cross-type collision — all real CAP-3 requirements, deliberately deferred
  to a later dispatch and not covered by ACM1-FB-01 .. ACM1-FB-09.
- `isAllowed` evaluation behavior (CAP-4/ACM-2) — this suite proves only that
  the data exists in the right shape, never that it is correctly evaluated.

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

## Layout

| ID | File | Proves |
| --- | --- | --- |
| `ACM3-II-01` | [inactive-identity/acm3-ii-01-inactive-viewer-chain-top.md](inactive-identity/acm3-ii-01-inactive-viewer-chain-top.md) | An inactive viewer at the top of an otherwise-live reporting chain gets an empty audience `Set` for every requested target, self included — the viewer-identity gate runs before any derivation and is global to the call. |
| `ACM3-II-02` | [inactive-identity/acm3-ii-02-inactive-bridge-stops-traversal.md](inactive-identity/acm3-ii-02-inactive-bridge-stops-traversal.md) | An inactive node mid-chain is an unusable bridge: the active viewer above it never gets proven, Reporting is denied for that target only, and Colleague is the floor — viewer and target identity are both fine, only the path is broken. |
| `ACM3-II-03` | [inactive-identity/acm3-ii-03-inactive-target-below-active-manager.md](inactive-identity/acm3-ii-03-inactive-target-below-active-manager.md) | An inactive target under a live, active manager gets an empty audience `Set` — not Reporting, not the Colleague floor — fail-closed for the Kernel MVP until the deferred dismissed-target projection exists; a sibling active target in the same bulk call is unaffected, proving the failure is local to that one target. |
| `ACM1-FB-01` | [fr-bootstrap/acm1-fb-01-three-canonical-permissions-seeded.md](fr-bootstrap/acm1-fb-01-three-canonical-permissions-seeded.md) | A fresh database ends up with exactly the three canonical `Permissions` rows — no more, no fewer, no other key. |
| `ACM1-FB-02` | [fr-bootstrap/acm1-fb-02-one-hr-admin-fr-policy-seeded.md](fr-bootstrap/acm1-fb-02-one-hr-admin-fr-policy-seeded.md) | A fresh database ends up with exactly one FR `Policies` row, `targetRole='hr-admin'`. |
| `ACM1-FB-03` | [fr-bootstrap/acm1-fb-03-role-granted-exactly-three-permissions.md](fr-bootstrap/acm1-fb-03-role-granted-exactly-three-permissions.md) | The seeded `hr-admin` role is joined to exactly the three seeded permissions through `PolicyPermissions`, one grant per key. |
| `ACM1-FB-04` | [fr-bootstrap/acm1-fb-04-exactly-one-root-attachment.md](fr-bootstrap/acm1-fb-04-exactly-one-root-attachment.md) | The one pre-existing active root User (CAP-8) gets exactly one `UserPolicies` attachment to `hr-admin`, and `AccessControlBootstrap` records it as provenance. |
| `ACM1-FB-05` | [fr-bootstrap/acm1-fb-05-rerun-seed-no-duplicates.md](fr-bootstrap/acm1-fb-05-rerun-seed-no-duplicates.md) | Running the bootstrap a second time against an already-bootstrapped, undrifted database changes nothing — same ids, same counts, no duplicate rows. |
| `ACM1-FB-06` | [fr-bootstrap/acm1-fb-06-no-other-role-attachment-or-grant.md](fr-bootstrap/acm1-fb-06-no-other-role-attachment-or-grant.md) | After bootstrap, `Policies`/`Permissions`/`PolicyPermissions`/`UserPolicies` contain exactly the canonical rows and nothing else — no default AR policy, no extra grant, no non-root attachment. |
| `ACM1-FB-07` | [fr-bootstrap/acm1-fb-07-fr-policy-has-no-target.md](fr-bootstrap/acm1-fb-07-fr-policy-has-no-target.md) | The seeded FR `hr-admin` row's `targetType` and `targetId` are both `NULL` — FR rows carry no target sentinel. |
| `ACM1-FB-08` | [fr-bootstrap/acm1-fb-08-ar-fr-shape-violations-rejected.md](fr-bootstrap/acm1-fb-08-ar-fr-shape-violations-rejected.md) | An FR row carrying a target, an AR row missing one, a null `type`, and a third `type` value are each rejected by the `Policies` row-shape `CHECK`/`NOT NULL` at the database boundary. |
| `ACM1-FB-09` | [fr-bootstrap/acm1-fb-09-duplicate-keys-and-joins-rejected.md](fr-bootstrap/acm1-fb-09-duplicate-keys-and-joins-rejected.md) | A duplicate `Permissions.key`, a duplicate `PolicyPermissions` pair, and a duplicate `UserPolicies` attachment are each rejected by their respective uniqueness constraint. |
