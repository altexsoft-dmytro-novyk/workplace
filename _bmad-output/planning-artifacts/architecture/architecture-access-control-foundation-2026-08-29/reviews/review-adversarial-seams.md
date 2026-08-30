# Adversarial Seam Review — Access Control Foundation

## Final authority re-review — 2026-08-30

**Final verdict:** **Ready to finalize the headless Kernel MVP architecture.**
There are no remaining Critical or High findings blocking ACM-1/ACM-2.

The last High artifact-authority finding is resolved. AD-4 now explicitly
supersedes contrary or incomplete FR wording in the Kernel SPEC, stories, and
sprint proposal. FR-AMD-1 repeats that authority rule, explicitly includes the
“closed kernel compatibility set” phrase, and requires every ACM-1/ACM-2
Stage-1 dispatch to load both architecture artifacts until `bmad-spec`
synchronizes the stale delivery inputs.

That rule removes the prior two-unit ambiguity: a Stage-1 unit may no longer
treat the stale SPEC/story/proposal clauses as an alternative contract. It must
apply the open permission-key input, due-departure eligibility, not-due root
selection, non-destructive seed reruns, and reviewed PostgreSQL constraints
from AD-4 and FR-AMD-1.

Future User Management FR attachment, `/roles`, runtime catalog mutation,
database-level key-immutability enforcement, and the complete §2.3 catalog
remain explicit future-contract items. They keep their own future gates open
but do not block finalizing or dispatching the scoped Kernel MVP through AD-1.

**Remaining Critical/High findings:** none.

---

## Prior re-review after reviewer-gate fixes — superseded

**Reviewer lens:** construct two units one level below the spine that each obey
every adopted decision literally, then test whether they can still produce
incompatible contracts or state.

**Scope reviewed:** the updated `ARCHITECTURE-SPINE.md`,
`fr-architecture-amendment.md`, `spec-access-control-kernel-mvp`,
`spec-functional-roles-catalog`, and canonical `access-control.md`,
`database-schema.md`, `domain-driven-design.md`, and `api-conventions.md`.

**Final verdict:** **Not yet safe to finalize; one High artifact-authority
blocker remains.** The reviewer-gate fixes resolve the original architectural
seams for ACM-1/ACM-2. The future User Management attachment contract, runtime
catalog, catalog mutation port, permission-key persistence enforcement, and
full §2.3 catalog are explicitly deferred and do **not** block the headless
Kernel MVP. Finalization is blocked only because the approved Kernel SPEC,
stories, and sprint proposal still carry acceptance language that conflicts
with or omits the corrected binding rules that Stage-1 authors are expected to
translate.

### Remaining Finding — Kernel dispatch artifacts do not contain the corrected AD-4 contract

**Severity: High — current ACM-1/ACM-2 gate ambiguity.**

The updated spine, FR-AMD-1, `access-control.md`, and `database-schema.md` now
agree on the material Kernel contract:

- `isAllowed` accepts an open, case-sensitive lowercase `context:action`
  string, not a closed three-value type.
- Runtime eligibility joins both `User.isActive` and the AD-20 due-departure
  cutoff.
- The bootstrap user must be active **and not due**.
- Seed reruns are non-destructive ensure operations, fail before writes on
  conflicting seed-owned drift, and preserve all later non-bootstrap state.
- The FR check and unique role-key index are reviewed custom PostgreSQL
  migration obligations.

The approved Kernel delivery artifacts have not been synchronized:

- `spec-access-control-kernel-mvp/SPEC.md` CAP-3 rejects only an inactive root
  and says only “seed exactly”; it does not require not-due selection or
  non-destructive reruns.
- Its CAP-4 denies inactive/missing users but omits the due-departure cutoff and
  does not pin the public key parameter as an open string.
- `spec-access-control-kernel-mvp/stories.yaml` repeats those omissions in the
  ACM-1 and ACM-2 acceptance lists.
- The approved sprint proposal still calls the three permission keys a
  “closed kernel compatibility set,” while corrected AD-4 explicitly says that
  typed constants never define the accepted key universe.

Construct two possible Stage-1 units after dispatch is authorized:

- **Unit A follows the updated architecture:** writes not-due seed and
  evaluator scenarios, a fourth-key compatibility scenario, and a
  non-destructive rerun scenario.
- **Unit B follows the approved Kernel SPEC/stories/proposal:** tests only
  `isActive`, treats the three keys as the accepted set, and proves idempotency
  only on an otherwise fresh FR dataset.

Both can cite governing project artifacts, but their approved-red evidence
would not be equivalent. Unit B can pass while a due actor remains authorized,
future permission rows are uncallable, or a deployment seed damages later
catalog state.

**Required before finalization:** synchronize CAP-3/CAP-4, ACM-1/ACM-2 story
acceptance, and the “closed compatibility set” wording with corrected AD-4 and
FR-AMD-1, or add an explicit authority statement that supersedes those exact
clauses and is mandatory input to every Stage-1 dispatch. The safer option is
to update the dispatch artifacts so approved scenarios cannot silently omit
security behavior.

### Disposition of the original five findings

1. **FR attachment identity — deferred, not a Kernel blocker.** The updated
   spine and FR-AMD-1 require a future attachment command to reference existing
   `Policies.id`/`roleId`, explicitly supersede the inline FR body, and require
   synchronization before that User Management story enters Stage 1.
2. **Seed reconciliation — resolved for the Kernel.** Fresh-database exactness,
   bootstrap-owned drift, atomic failure, and preservation of future
   non-bootstrap state are now explicit.
3. **Closed permission-key type — resolved in architecture.** The facade input
   is now an open syntax-constrained string; typed constants are convenience
   only. The stale dispatch wording is captured in the remaining finding.
4. **Key immutability — future-contract item, not a Kernel blocker.** The MVP
   has no mutation surface, and all writers are barred from in-place update or
   bypassing the Access Control boundary. The concrete persistence enforcement
   mechanism must be fixed before a future catalog mutation story, not before
   ACM-1/ACM-2.
5. **Repository/evaluator seam — resolved for current sequencing.** ACM-2
   depends on ACM-1, the facade delegates to one evaluator, and any future
   mutation port is explicitly separate from the evaluator query port. Exact
   internal method shapes may be established during the gated Kernel design;
   they no longer force the future catalog to duplicate or broaden the hot-path
   port.

---

## Initial review — superseded by the final re-review above

The findings below preserve the original adversarial evidence and
recommendations. Their current dispositions are authoritative only in the
final re-review above.

---

## Finding 1 — The canonical User Management attachment request cannot identify the existing FR role the kernel requires

**Severity: Critical — authorization ownership and integration.**

The approved amendment fixes the persistence model:

- `Policies.id` is the FR `roleId`.
- `UserPolicies.policyId` references an **already-defined** role.
- The future catalog must consume that schema and must not define a second one.

The canonical HTTP contract still says:

`POST /users/:id/policies {type: 'AR'|'FR', targetType, targetId, targetRole}`

It contains no `policyId` or `roleId`. For FR, the approved row shape also
requires `targetType` and `targetId` to be null, while the canonical request
shape presents both as ordinary attachment inputs. The spine defers the
consumer contract to User Management and expressly allows User Management to
choose its route and projection, but it also cites `api-conventions.md` as a
canonical source. Deferral does not say whether this already-published shape is
superseded.

Construct two compliant units:

- **Unit K — Access Control FR foundation:** exposes
  `assignFunctionalRole(userId, roleId)` and inserts
  `UserPolicies(userId, policyId)`. It refuses to create a policy while
  attaching it, because FR-AMD-1 says the attachment references an already
  defined role and the catalog owns role definition.
- **Unit U — User Management consumer:** follows the canonical route literally
  and sends `{type:'FR', targetRole:'hr-admin', targetType:null,
  targetId:null}`. It either expects Access Control to resolve a mutable role
  key or treats the request as policy definition-at-attachment, because no
  role id is available.

Both respect AD-2 ownership: K does not invent a `/users` route, and U owns the
route and adapter. They cannot compose. Resolving by `targetRole` would also
reintroduce a name/key lookup at the privilege-mutation boundary even though
authorization itself is required to join by ids.

**Consequence:** the first non-seed role assignment either cannot be expressed,
creates duplicate policies, or attaches the wrong row after a role-key rename
or race.

**Required tightening:** amend `api-conventions.md` or explicitly supersede its
FR branch. Fix one cross-context application command and request mapping, for
example `assignFunctionalRole({userId, roleId})`, with Access Control validating
that `roleId` names an FR policy. Keep AR policy creation/attachment semantics
separate if they genuinely require the current polymorphic body. The future
User Management Stage-1 contract must cite this decision.

---

## Finding 2 — “Seed exactly” has no reconciliation boundary and can destroy or reject the future normative catalog

**Severity: Critical — production data loss or deployment failure.**

FR-AMD-1 and the spine require the seed to produce exactly:

- three permission rows;
- one `hr-admin` FR policy;
- three grants;
- one bootstrap attachment; and
- no other default grants.

The same sources say the MVP reduction does not close the normative §2.3
catalog, future permissions are append-only through a separately approved
contract, and runtime role administration remains future work. The canonical
architecture therefore expects legitimate post-MVP rows to coexist with a
seed that may run again during deployment.

Construct two compliant units:

- **Unit S — kernel seed:** interprets “exactly” as a global postcondition. On
  every run it reconciles the FR tables back to three permissions, one role,
  three grants, and one attachment. Once the catalog exists it deletes its
  additional roles and permissions; with the required `ON DELETE RESTRICT`
  keys it may instead fail the deployment.
- **Unit C — normative catalog:** appends permission rows and creates runtime
  roles because canonical `access-control.md` says the product catalog remains
  open and runtime-editable. It never changes the bootstrap objects.

Both satisfy their local scope literally. They become incompatible on the
second production seed run. “No other default grants” does not distinguish
seed-owned defaults from administrator-created state, and “exactly three rows”
does not say whether it is a fresh-database assertion or an all-time invariant.

**Consequence:** a routine deploy can erase administrator-defined
authorization, fail midway, or leave availability dependent on whether the
seed runner chose destructive reconciliation.

**Required tightening:** define the seed as a non-destructive, transactional
ensure operation over immutable, seed-owned identifiers. State explicitly:

1. “Exactly” is asserted for a fresh database and for the bootstrap objects,
   not for all future FR rows.
2. Reruns may insert missing bootstrap objects and verify their exact grants,
   but must not delete or rewrite non-bootstrap catalog state.
3. Drift in a bootstrap object either fails before writes or is repaired under
   a named rule; choose one.
4. The root attachment rule applies to the seed-owned `hr-admin` role only and
   does not remove later administrator-created attachments.

---

## Finding 3 — The MVP permits a closed three-key type while the normative evaluator requires an open data-driven key space

**Severity: High — future catalog silently cannot authorize its own rows.**

AD-4 says `isAllowed` accepts the immutable `Permissions.key` string and that
call sites **may use typed constants**. The Kernel proposal calls the three keys
a “closed kernel compatibility set.” Canonical `access-control.md` and
`database-schema.md` simultaneously preserve an append-only normative catalog,
and the evaluator is required to be data-driven and branch on no key.

Construct two compliant units:

- **Unit E — ACM-2 evaluator:** publishes
  `isAllowed(userId, permissionKey: KernelPermissionKey)`, where
  `KernelPermissionKey` is a union of the three approved constants. Its SQL is
  data-driven and contains no key branch, so it obeys AD-4 literally.
- **Unit C — future catalog:** appends `mentorship:assign` (after its separate
  approval) and expects the existing evaluator to accept the stored canonical
  key without an Access Control code release. The row is valid under the
  append-only normative model, but no typed caller can pass it to Unit E.

The database and evaluator can both be correct while the public application
contract makes new permission data unusable. This is especially likely because
“typed constants” and “closed compatibility set” encourage a closed TypeScript
union even though runtime extensibility requires an open value space.

**Consequence:** the later catalog appears operational—rows, grants, and
attachments persist—but every new feature requires a kernel type edit and
deployment. That contradicts the normative “adding a row requires no evaluator
change” outcome without violating the MVP's literal three-key scope.

**Required tightening:** pin the public signature to an open canonical string
or a value object that validates only stable syntax (`lowercase context:action`)
rather than membership in the MVP set. Typed constants may be conveniences,
not the accepted key universe. Require a compatibility scenario that inserts a
fourth approved key as data and proves the unchanged evaluator can grant it.

---

## Finding 4 — Permission-key immutability is an application convention, not a shared persistence invariant

**Severity: High — grant meaning can change without changing the grant.**

The spine calls `Permissions.key` immutable and unique. FR-AMD-1 narrows the
mechanism to “the permission repository exposes no key-update operation in the
Kernel MVP.” `database-schema.md` defines only `key string UNIQUE` and repeats
that future catalog changes are append-only. A unique index prevents duplicate
keys; it does not prevent `UPDATE Permissions SET key = ...`.

Construct two compliant units:

- **Unit D — ACM-1 persistence:** creates a normal unique text column and a
  repository with create/find methods only. It considers immutability satisfied
  because no MVP port exposes an update.
- **Unit C — future catalog/infrastructure:** uses its own Prisma write adapter
  for catalog administration. It does not create a second schema, seed, port,
  or evaluator, and its role-permission mutation is within the later normative
  surface. Without a database rule or shared write contract, a DTO mapping,
  repair script, or generic update can rename a permission key in place.

Unit D has followed every stated MVP mechanism. Unit C has consumed the same
tables and can still mutate the canonical identity because the prohibition is
not enforced at the shared seam. An in-place rename changes what all existing
`PolicyPermissions` grants mean while retaining the same `permissionId`.

**Consequence:** authorization behavior can change globally without an explicit
grant migration, and callers using the old key fail closed with little evidence
that the privilege was renamed rather than revoked.

**Required tightening:** choose and record one enforceable lifecycle:

- database-enforced immutable keys (for example a narrowly scoped trigger),
  with append/new-key plus explicit grant migration for corrections; or
- a single Access Control-owned catalog write service that is the only allowed
  writer, backed by an architecture test that blocks direct Prisma writes and
  an approved rename protocol.

The current repository-only statement is insufficient once a second
administrative unit writes the same table.

---

## Finding 5 — ACM-1 owns “the FR repository port,” but no contract says what ACM-2 or the future catalog actually consumes

**Severity: High — parallel units can compile separately and fail at assembly.**

The spine says ACM-1 owns data and ACM-2 owns the evaluator. FR-AMD-1 says the
functional-role slice owns “the FR repository port, schema contract, seed
contract, and `isAllowed` domain service,” while the future catalog must not
create a second repository port or evaluator. `domain-driven-design.md`
requires only domain services to inject ports, and the facade must delegate to
the evaluator.

No reviewed artifact fixes:

- the repository operations and return types;
- whether active-user validation is part of the same query;
- whether the port returns domain entities, ids, keys, or a boolean;
- which mutation operations the later catalog is allowed to add to the same
  port;
- transaction enrolment for role/grant/attachment changes; or
- whether infrastructure failures throw while unknown/orphaned data returns
  `false`.

Construct two compliant units:

- **Unit A — ACM-1:** publishes
  `loadActiveUserPermissionKeys(userId): Promise<ReadonlySet<string>>`.
  ACM-1 owns one FR-only port and returns no audience data.
- **Unit B — ACM-2:** is independently designed around
  `hasActiveGrant(userId, permissionKey): Promise<boolean>` so evaluation is one
  indexed join. Its domain service owns `isAllowed` and delegates through an
  FR-only port.

Both are type-separated, live, fail closed for named data conditions, and
contain no role-name or permission-name branch. They are nevertheless different
ports. If B introduces the operation it needs, it violates “must not create a
second port”; if it consumes A, the query shape and failure semantics have
already been chosen by the wrong unit. The future catalog has the same problem:
“consume the port” does not say whether a read-only evaluator port may grow
administrative writes or whether those writes use a separate port—which the
draft implementation constraints currently forbid it from creating.

**Consequence:** one team must redesign after Stage-2 evidence is approved, or
the project produces a broad mixed read/write policy repository that weakens
the intended FR/AR and hot-path/admin separation.

**Required tightening:** add a small reviewed shared contract before ACM-1
Stage-1:

- one evaluator-query port with exact methods, types, and error semantics;
- a separately named FR catalog mutation port if/when normative catalog work is
  approved (separate from AR and from the evaluator hot path);
- the transaction boundary for grant and attachment mutations; and
- the exact `AccessControlFacade.isAllowed` signature.

Clarify that “no second port” means no duplicate implementation of the same
responsibility, not that read evaluation and catalog mutation must share one
broad interface.

---

## Validation obligations after tightening

**Automation candidates**

- Contract test: the User Management adapter maps one `roleId` to one existing
  FR `Policies.id`; it cannot define or resolve a role by mutable name.
- Seed test: seed twice after adding a non-bootstrap permission, role, grant,
  and attachment; all administrator-created rows survive unchanged.
- Extensibility test: an unchanged evaluator grants a fourth approved
  lowercase `context:action` key inserted through the catalog.
- Immutability test: in-place key update is rejected through every supported
  persistence path.
- Architecture/DI test: facade delegates to exactly one evaluator service;
  evaluator reads only the FR query port; catalog writes use the approved
  mutation port; no other context imports Access Control domain or
  infrastructure.
- Failure-semantics test: missing/inactive/orphaned/unknown data returns
  `false`, while a PostgreSQL outage follows the explicitly selected
  fail-closed operational contract and remains observable.

**Manual validation**

- User Management owner approves the role-attachment request and application
  command before its Stage-1 scenarios.
- Database reviewer approves non-destructive seed reconciliation and the
  immutable-key enforcement mechanism.
- Access Control and future catalog owners jointly approve the shared port and
  facade signatures; passing isolated unit tests is not evidence that the seams
  compose.

