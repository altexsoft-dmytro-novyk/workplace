# CC-04 / CC-06 Reviewer Gate Resolution

**Date:** 2026-08-29  
**Scope:** architecture-only resolution for People Partner assignment (CC-04) and Departure lifecycle (CC-06)  
**Gate result:** resolved for AD-1 stage-1 story regeneration; implementation remains blocked by the explicit gates listed below.

This report preserves the three independent reviews as historical evidence and maps their findings to the amended binding architecture. It does not claim that AD-19 or AD-20 exists in application code.

## Rubric review

| Finding | Resolution |
| --- | --- |
| F1 — greenfield posture ignored brownfield service | Resolved by AD-21 and corrected scope metadata. Regenerated stories must remove the superseded create/delete/deactivation paths and interim authorization adapter in one v1.5 cutover; there is no compatibility mode. |
| F2 — PP “inside HR” boundary was not executable | Contained by an explicit fail-closed gate in AD-19 and `access-control.md`: the direct assigned PP may resolve, but transitive HR-line inheritance is blocked until the Department contract defines HR identity, membership, boundary predicate, indexed walk, and negative scenarios. |
| F3 — departure re-parenting diverged from requirements | Resolved by the record-time blocker contract and explicit `POST /users/:id/departure-reparenting` command. Platform-owned blockers are re-parented only after user confirmation and CAS-like blocker-version validation; sync-owned PM/DM remains an external remediation blocker. A post-scheduling legacy-corruption blocker cannot extend access. |
| F4 — retry route absent from canonical API | Resolved in `api-conventions.md`: permission, allowed state, `202`, `409`, fencing preservation, logging, and diagnostic redaction are binding. |
| F5 — operational/rule-loading envelope deferred | AD-20 now has a bounded release gate: required `BUSINESS_TIME_ZONE`, schema-before-worker ordering, same PostgreSQL source, worker health/lag/reclaim/retry/cutoff signals, alert ownership, and demonstrated manual retry. Vendor/topology choices remain deferred but may not weaken these invariants. Companions are declared in spine metadata. |

## Reality review

| Finding | Resolution |
| --- | --- |
| F1 — no transaction-propagation contract | Resolved in `domain-driven-design.md`: one offboarding coordinator owns the Prisma/PostgreSQL transaction and passes the same transaction scope to `applyDepartureEffects({departureId, leaseToken, tx})`; nested independent transactions are forbidden and rollback-at-last-write is a required integration test. |
| F2 — timezone absent/ambiguous | Resolved architecturally: `BUSINESS_TIME_ZONE` is required and startup validated; every command snapshots it and derives immutable `dueAt`; guards and workers compare that value with PostgreSQL time and never use host-local time. Application/deployment wiring remains implementation work. |
| F3 — PP CAS shape incomplete | Resolved by existing-row predicate on employee/type/expected target, partial-unique absent-row backstop, unique-conflict-to-`409`, and `If-Match` for delete. Concurrent create/create and replace/replace are mandatory scenarios. |
| F4 — claim/fence/reclaim contract incomplete | Resolved with stable due ordering, explicit eligible states, database-time leasing, fresh `leaseToken`, token-predicated apply/fail/reclaim, stale-worker no-op, and real-PostgreSQL competing-worker scenarios. The exact parameterized SQL belongs to the infrastructure story, not this architecture patch. |
| F5 — current-version drift | Resolved by pinning the architectural choice to the checked lockfile: NestJS 11.x/CommonJS and Prisma 7.x (7.10.0); NestJS 12/ESM and Prisma 8 require separate reviewed migrations. |
| F6 — idempotency normalization/conflict mapping | Resolved by a canonical request hash over endpoint version, target user, normalized ISO date/reason, and creator principal; replay rechecks authorization. Same-key/different-hash and non-applied-per-user conflicts map deliberately to `409` and have mandatory concurrency scenarios. |

## Adversarial review

| Finding | Resolution |
| --- | --- |
| 1 — due actor cutoff left inbound/outbound audience edges ambiguous | Resolved by the directional effective-departure table in `access-control.md`: actor denied, target restricted to read-only projection, due manager/PP endpoint grants nothing and cannot bridge traversal, recursion stops at a due node, and creator authority is rechecked. |
| 2 — unsafe lease recovery / cross-context effects | Resolved by fencing token ownership plus the single-transaction application contract and unique departure mutation keys. |
| 3 — PP HR predicate undeclared | Contained by the same explicit Department-boundary stage-2 gate as rubric F2; unrestricted reporting traversal is prohibited. |
| 4 — journal aggregate/schema undeclared | Not invented here. CC-07 owns the immutable journal schema, snapshot, reader authorization, and transaction-enrolment contract; AD-19 stage 2 and production release remain blocked until CC-07 is approved. |
| 5 — mutable timezone changed effective instant | Resolved through immutable persisted `effectiveTimeZone` and `dueAt`; configuration changes affect only new schedules and mixed process configuration fails deployment/startup validation. |
| Watch item — replay not principal scoped | Resolved by including creator principal in the canonical hash and rechecking current authorization before replaying the original result. |

## Remaining implementation gates

1. AD-1 stage-1 scenarios require human approval before any stage-2 E2E or application implementation.
2. PP transitive HR-line inheritance is blocked until the Department/HR-boundary contract is approved.
3. PP mutation is blocked from stage 2/production until CC-07 defines and approves the immutable relationship/access journal.
4. Departure implementation must add the required deployment configuration, migrations, real-PostgreSQL worker tests, operational signals, and release demonstration; none exists merely because this architecture is resolved.
5. The architecture spine remains `draft` because unrelated initiative-level Deferred decisions still exist.
