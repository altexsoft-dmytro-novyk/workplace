# Adversarial Review — CC-04 / CC-06 (AD-19 and AD-20)

**Reviewer lens:** construct independently owned units which comply with the stated ADs, then look for incompatible interpretations, privilege persistence, duplicate side effects, and loss of required evidence.

**Scope reviewed:** `ARCHITECTURE-SPINE.md` (AD-19/AD-20 and their AD-10/AD-11/AD-16 dependencies), plus the projections in `docs/architecture/access-control.md`, `api-conventions.md`, `database-schema.md`, `domain-driven-design.md`, and `testing-strategy.md`. `docs/project-requirements.md` is used only as the spine's stated normative source where it supplies a required fact (not to introduce new scope).

**Method:** the findings below are not claims that an implementation must be bad. Each gives two independently reasonable units that can each satisfy the written architecture but cannot safely compose. That is the failure mode for a build substrate intended for parallel owners.

---

## Finding 1 — The effective-date cutoff protects the departing *actor* but leaves every audience edge involving that person undefined until the worker happens to finish

**Severity: Critical — authorization/data-integrity.**

AD-20 provides a very strong request-time rule, but only in actor form: authentication and AccessControl “deny an actor with a due departure on every request regardless of worker state.” `access-control.md` repeats that the check occurs “before any feature or audience decision” and that a due departure makes “the actor” inactive. The same timing table then says only: “Access others held **over** the profile follows dismissed-target rules.” No such rules are defined in any scoped document.

This distinction matters because `Relationship` is directional and live:

- a direct report is `employee.userId -> manager.reportsToUserId`;
- a PP assignment is `employee.userId -> pp.reportsToUserId`;
- reporting and PP recursion use those rows per request; and
- the AD-20 worker may be delayed/retrying while all of those rows still exist.

Construct a due departure for **D**, who manages **E** and reports to **M**. At midnight D can no longer act, but E's `direct` edge to D and D's edge to M are still ordinary live facts until a worker transaction succeeds.

- **Owner A (graph hygiene)** rejects any traversal through a due/dismissed subject. M's reporting path to E ends at D immediately. It also prevents a due PP from being a bridge to the senior HR audience.
- **Owner B (literal actor cutoff)** applies the due check only when `viewerId` is D, as the AD words say. M continues to gain reporting-line access to E through D, and senior HR users may retain PP audience through a due/deactivated PP, until the worker cleans up rows.

Neither choice violates the written actor cutoff, and both can say they never persist an audience. They produce materially different profile, list, export, shared-link-revocation, and future-context behavior. B is a privacy leak whenever the intended dismissal/offboarding should sever those derived audiences immediately; A may remove access that product intended to retain temporarily. The phrase “ends every access relation the person holds” does not resolve it: it neither defines which directional rows are held by the actor nor the request-time behavior before that transaction.

The normal blocker gate does not close the hole. AD-20 explicitly permits a **legacy blocker** to survive scheduling and says it must not delay the security cutoff. That is exactly the state in which the unresolved graph behavior is security-sensitive. The existing required scenario list tests “request-time access cutoff while the worker is delayed,” but it does not name a target or a third-party path; an actor-only test passes under both implementations.

**Recommendation:** add an AD-20 table that defines request-time treatment, independently for each relationship direction and each audience role, for `scheduled-but-not-due`, `due-but-unapplied`, and `applied`. State whether an otherwise-live edge with a due/dismissed endpoint is excluded from (a) viewer qualification, (b) target traversal, and (c) shared-link creator/revoker checks. Include D→E→M and employee→PP→senior-HR fixtures in the AD-20 approved scenarios, plus the required behavior for legacy blockers. Make the worker's physical cleanup converge to that same declared projection rather than being the thing that defines it.

---

## Finding 2 — A lease without an ownership/fencing value cannot make expired-claim recovery safe, and the “key every effect by Departure.id” rule has no cross-context contract

**Severity: High — duplicate/offboarding corruption.**

The `Departure` schema contains `state`, `attempts`, `nextAttemptAt`, and `leaseUntil`, while AD-20 requires PostgreSQL `SKIP LOCKED` claims, recoverable expired leases, and a short claim before a single cross-context transaction. It does **not** carry `claimedBy`, a monotonically increasing claim/fencing token, or an execution token. It also does not require every subsequent read/update to predicate on the still-owned claim.

That leaves a valid split-brain execution:

1. Worker W1 claims departure X and commits `processing, leaseUntil=T`.
2. W1 pauses or its transaction takes longer than the short lease.
3. W2 sees the expired lease, reclaims X, and applies it.
4. W1 resumes. No schema field lets its application transaction prove that it still owns the claim before it writes `retry_wait`, diagnostics, `applied`, or any effect in another context.

The architecture's `Departure.id` idempotency intention is necessary but not sufficient. “Every effect is keyed or constrained by `Departure.id`” does not name the effect records, their unique key, or the public application-service contract future owners must implement. In particular, `action-items`, `mentorship`, and future contexts are only named as calls from the user-management orchestrator; their tables and their `cancel/close/end` idempotency markers are absent from this contract.

Two teams can therefore both follow AD-20:

- **Owner A** treats `leaseUntil` as advisory. Its worker updates departure state and invokes exported cleanup actions after claiming; those actions deduplicate only the effects they happen to own.
- **Owner B** adds a local conditional state transition (or keeps an execution-row lock throughout the work) and asks all exported actions to require a matching claim token before writing.

Both use PostgreSQL leases, `SKIP LOCKED`, retry, and `Departure.id`; their public APIs and correctness properties are incompatible. A failed or stale W1 can overwrite W2's attempt/error state, schedule a needless retry after `applied`, or call a future context whose effect has not been uniquely constrained. The single local transaction prevents partial effects only *within one execution*; it does not make two independently claimed executions one execution.

**Recommendation:** define the claim protocol in schema and application contracts: an immutable worker/claim identity plus incrementing fencing token (or an equivalently explicit `FOR UPDATE` ownership model), the exact `WHERE` predicates required at apply/fail/renew, lease-renewal policy, and which state is eligible for re-claim. Define an exported, transaction-enrolled `applyDepartureEffects({ departureId, claimToken, tx })` style contract for every owning context and require a unique `departureId` effect marker in each. A stale executor must receive no-op/ownership-lost rather than write a retry or side effect. Add a delayed-W1-after-W2-applied scenario, not merely duplicate-workers and expired-leases independently.

---

## Finding 3 — The PP “HR line” is bound to an undeclared HR-membership predicate, so the same PP fact can safely grant either too much or too little access

**Severity: High — systematic PII overexposure or denial.**

AD-19 correctly pins the organisational fact and its direction: `Relationship(type='people_partner')` is employee `userId` to PP `reportsToUserId`, zero-or-one per employee, with a PP able to partner many. `database-schema.md` supplies the two partial uniqueness rules and the typed-check constraints. This portion is compatible.

The propagation boundary is not. AD-10 and `access-control.md` say to use the assigned PP's own `direct` “HR line above” / “inside HR.” The normative source is sharper: it is “the reports-to relation **restricted to the HR department**.” Yet the schema's only department statement says the exact membership/parent/manager edge model is pending and department-targeted resolution is fail-closed. No projection defines:

- how a person is recognized as being in HR;
- whether the PP itself must be in HR;
- whether the recursive CTE tests each ancestor's current HR membership, stops before the first non-HR ancestor, or relies on a designated HR-root;
- the behavior while that department edge model is still Deferred.

Consider employee E assigned to PP P, P reports to HR director H, and H reports to CEO C outside HR.

- **Owner A** implements the stated `direct` chain literally, returning P, H, and C. It can cite “own `direct` manager chain,” use only the already-indexable Relationship table, and never touch the Deferred department schema.
- **Owner B** reads “inside HR” literally and stops at H, but must invent or rely on a Department/HR-membership predicate which the architecture says is still pending.

Both preserve PP direction, cardinality, the matrix projection, and per-request access. A gives C PP access to E's HR-sensitive profile; B may fail closed and omit H/P while HR membership has no approved storage. The generic fail-closed note cannot decide the desired graph because it says nothing about whether lack of the *classification* means an empty PP chain or whether a PP assignment itself should be rejected until HR membership exists.

**Recommendation:** make HR membership and traversal a prerequisite contract for AD-19: name the source (`Department` membership, an immutable HR-department identifier/configuration, and an indexed current-membership relation), require the PP and every traversed ancestor to satisfy it, and specify the first non-HR-node stop rule. Until that contract exists, explicitly choose either “PP propagation beyond the directly assigned PP is unavailable/fail-closed” or block PP assignment — do not leave an unbounded all-company `direct` walk as the easiest implementation. Add a PP→HR director→non-HR executive negative E2E case.

---

## Finding 4 — The required PP/access journal has behavior and ACL requirements but no durable aggregate, payload, or transaction-enrolment contract

**Severity: High — required evidence can be lost or disclosed inconsistently.**

AD-19 requires PP replacement to atomically write *one* old→new journal record in the same transaction as the edge, and deletion to write old→none. AD-10 extends that same-transaction requirement to all tier-input changes. The requirements document further fixes each journal entry's fields — actor, subject, before value, after value, timestamp — and its readers: full-profile holders plus the current manager and PP of the subject.

The scoped database schema has no Journal table/entity, no journal primary key or immutability rule, no before/after encoding, and no foreign-key/lifecycle policy for hard-deleted `Relationship` rows. The stated audit-column convention expressly discourages unspecified audit fields. `access-control.md` owns the journal prose while `user-management` owns the relationship command, and `domain-driven-design.md` only says `UserEvents` writes are synchronous for *career-timeline* changes. It does not say the access journal is `UserEvents` (and that table lacks the needed type/payload/access model) or identify an owning application service.

Two independently compliant implementations can result:

- **Owner A** creates a user-management `RelationshipJournal` row with `oldRelationshipId`/`newRelationshipId`. Because Relationship is hard-deleted, its foreign-key choice either makes deletion fail or loses the required before-value unless it snapshots it.
- **Owner B** puts a generic `AccessJournal` in access-control, stores JSON before/after snapshots, and asks the relationship command to call an exported action in the same transaction.

Both write a record atomically in ordinary success cases, but readers, retention after hard delete, tamper behavior, shared-link entries, migrations, and the cross-context API differ. More dangerously, either side can make the PP edge commit but the independently owned journal insert happen in another transaction because the architecture names the outcome without a shared transaction-enrolment interface. Testing only “journal rollback” does not establish a durable, queryable, correctly-authorized record.

**Recommendation:** add a canonical immutable `RelationshipAccessJournal` schema and owner. Use value snapshots (not only Relationship IDs) for hard-delete resilience; enumerate the event type, actor, subject, before/after JSON shape, timestamp/clock source, and unique mutation key; and specify reader authorization as a current-time AccessControl check. Publish one transaction-enrolled application contract for relationship mutation plus journal write, so the same transaction actually has a mechanically shareable owner. Tests should prove PP replacement produces exactly one row, transaction rollback produces zero, hard-delete preserves the old value, and a former/current PP or manager cannot read outside the product rule.

---

## Finding 5 — A DATE plus mutable deployment configuration is not one canonical effective instant for auth, AccessControl, and workers

**Severity: Medium-High — early/late offboarding at the security boundary.**

AD-20 intentionally declares `effectiveDate` as PostgreSQL `DATE`, due at `00:00` in “one deployment-configured IANA `businessTimeZone`.” The schema persists only the date; it does not persist the zone, the resolved due instant, or a configuration version. `access-control.md` tells authentication/AccessControl to evaluate due in the configured zone while worker selection separately uses “due or overdue” rows.

Two implementations can conform but disagree after a configuration/rollout change or a mixed-version deployment:

- **Owner A** converts `effectiveDate` against the zone configuration at each request/worker poll. A date scheduled while the zone was `Europe/Kyiv` changes its UTC cutoff if the setting later becomes `America/New_York`.
- **Owner B** resolves and stores a UTC `dueAt` at scheduling time, preserving the old zone for the command. This is safer operationally but adds a field the canonical schema does not define.

Because authentication, AccessControl, and the worker are separate units, rolling one unit onto a new environment variable can deny the employee while the older worker does not claim the row (or vice versa). Both still use a valid IANA zone and a calendar date. The required business-timezone boundary test cannot distinguish them unless it includes configuration stability/version behavior.

**Recommendation:** state that the configured business timezone is an immutable deployment-wide invariant for the lifetime of every scheduled Departure, or persist `effectiveTimeZone` and a canonical `dueAt timestamptz` calculated when it is created. Make all three callers use the same stored value/query, reject mixed configuration at startup, and add a migration/config-change test. The display date can remain a `DATE`; the security cutoff must not be reinterpreted per process.

---

## Additional constrained watch item — idempotency replay is not principal-scoped

`Departure.idempotencyKey` is globally unique and `requestHash` is unspecified. `POST /users/:id/departures` says a repeated same key/payload returns the original result, but neither the schema nor API convention binds an idempotency record to the authenticated principal, path user, authorization re-check, or canonical hash input. This is not elevated to a full finding because ordinary endpoint authorization might be implemented first, but it should be fixed with the create contract: define normalized hash inputs (including user ID and effective date), key scope, whether the original actor is required for replay, and a replay response that cannot disclose departure diagnostics to a now-unauthorized caller.

## Verdict

**Not ready for parallel AD-19/AD-20 implementation without tightening.** The PP edge itself is well constrained, but its HR traversal and required journal are not. The departure command has the right fail-closed goal, but an actor-only cutoff, unfenced recovery leases, and a non-canonical date-to-instant conversion still permit incompatible implementations and, in the first two cases, security-sensitive divergence. Resolve Findings 1–4 before delegating implementation; resolve Finding 5 before using the effective-date cutoff as an operational access guarantee.
