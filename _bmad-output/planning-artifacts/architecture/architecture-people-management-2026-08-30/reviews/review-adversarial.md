---
name: 'review-adversarial-architecture-people-management-2026-08-30'
type: review
altitude: feature
target: _bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-30/ARCHITECTURE-SPINE.md
method: adversarial-pairs (two independently-compliant builders diverge)
created: '2026-08-30'
grounding:
  - docs/project-requirements.md §2, §3, §4.16, §6
  - ARCHITECTURE-SPINE.md (AD-1..AD-25)
---

# Adversarial Review — user-management / access-control spine

Method: for each finding, construct two units one level down (two stories, two engineers, two teams) that each satisfy every relevant AD's Rule text to the letter, yet build something incompatible. Every finding ends with concrete Rule text to close the gap.

---

## Finding 1 — AD-3's "two distinct edges" is a real bidirectional NestJS module cycle, not just two capability edges [HIGH]

**AD attacked:** AD-3 (dependency direction), interacting with AD-2 (cross-context boundary) and AD-25 (every controller calls AccessControl).

**The two units:**

- **Engineer A (user-management)** builds `UserManagementModule`, whose controllers (per AD-25: "every controller/action calls `AccessControl.isAllowed`/`canAccessSection` before reading or writing") legitimately need the access-control facade. Engineer A wires `UserManagementModule { imports: [AccessControlModule] }`. This is a straight, correct reading of AD-3's edge (1): user-management → access-control.

- **Engineer B (access-control)** builds `OrgGraphReaderAdapter` in `access-control/infrastructure`, which — per AD-3's edge (2) — must call "user-management's exported application-layer query service, in-process, live." The only NestJS-idiomatic way to get that service injected is `AccessControlModule { imports: [UserManagementModule] }` (or importing whichever module exports `OrgGraphQueryService`). This is a correct reading of AD-3's edge (2).

Both engineers independently followed AD-3's Rule text exactly. The result: `UserManagementModule` imports `AccessControlModule`, and `AccessControlModule` imports `UserManagementModule`. That is a circular module dependency at the NestJS DI level — not a "cycle in what data is needed" (which AD-3 correctly argues doesn't exist), but a cycle in *which module provides which injectable*, which Nest either refuses to resolve at boot or forces into `forwardRef()` with all its footguns (double-init ordering, providers not yet available at construction time). Neither engineer discovers this alone: `UserManagementModule` compiles and unit-tests fine in isolation (its own tests mock `AccessControlModule`), and `AccessControlModule` compiles and unit-tests fine in isolation (its own tests mock `UserManagementModule`). The clash only surfaces at full-app boot / integration, i.e. exactly the class of defect AD-1's "testability" goal and the AD-1 gate are supposed to catch early but don't, because each side's tests are unit-level and green.

AD-3's mermaid diagram in the spine even draws this as two arrows between two boxes — which, read as a module graph rather than a capability graph, literally *is* a two-node cycle.

**Why the spine's Rule text doesn't close it:** AD-3 asserts "not a cycle" based on capability direction (authorize vs. supply-facts) but gives no module-boundary rule that keeps the *providers* those capabilities live in from importing each other back. AD-2's boundary rule ("consume only through application/ exports") governs *what* may be imported, not which NestJS module those exports live in — so nothing stops both contexts' single top-level application module from importing the other's.

**Fix (concrete Rule text):** Split each context's application layer into two NestJS modules instead of one:
- `UserManagementQueryModule` — exports only the read-only, guard-free query services org-graph resolution needs (`OrgGraphQueryService` or equivalent). Has zero dependency on `AccessControlModule`. This is the only module `AccessControlModule` (via `OrgGraphReaderAdapter`) is allowed to import.
- `UserManagementModule` — the controller-bearing module, imports `AccessControlModule` for its guards, and internally imports `UserManagementQueryModule` too if its own controllers need those queries.

Add to AD-3: "The application-layer query service consumed by `OrgGraphReaderPort`'s adapter MUST live in a module with no dependency, direct or transitive, on `AccessControlModule`. `AccessControlModule` imports only that narrow module, never `UserManagementModule` itself." This makes the two edges genuinely acyclic at the DI-graph level, not just at the capability-description level.

---

## Finding 2 — AD-6 has no concurrency-safety rule, so Department FK writes lose updates and corrupt the AD-7 journal (AD-5 does; AD-6 doesn't) [HIGH]

**AD attacked:** AD-6 (department FK), AD-7 (relationship journal), by comparison with AD-5's explicit CAS contract.

**The two units:** two Epic 4 stories, built independently, both satisfying their own AD to the letter.

- **Engineer A** builds the manager/PP reassignment story under AD-5. AD-5's Rule text is explicit: "at most one active edge per `(subjectUserId, type)` via a partial unique index... a conflicting concurrent write returns `409`." Engineer A implements this correctly — the unique index makes concurrent reassignment safe by construction; a losing writer gets a constraint violation, mapped to `409`.

- **Engineer B** builds the department-reassignment story under AD-6. AD-6's Rule text only fixes *shape* ("`User.departmentId` exactly one, never null... `Department.parentId`... `Department.managerId`"). It says nothing about concurrent-write safety. Engineer B, reading AD-6 to the letter, implements the straightforward thing: `SELECT current departmentId` (for the journal's `beforeValue`), then in a transaction `UPDATE User SET departmentId = :new WHERE id = :subject` and `INSERT INTO RelationshipJournal (...)`, satisfying AD-7's "written in the same transaction as the field change." Nothing in AD-6 or AD-7 required a `SELECT ... FOR UPDATE` or an expected-current-value CAS check on the `User` row, unlike AD-5's unique-index-enforced CAS.

**The clash:** two managers concurrently PATCH the same person's department to two different targets (X→Y and X→Z). Under Postgres READ COMMITTED (Prisma's default, no explicit locking), both transactions read `departmentId = X` for their `beforeValue`, both succeed, both commit. The `User.departmentId` ends at whichever committed last (silent lost update — the earlier reassignment is invisibly discarded, no `409`, no error to either caller). Worse, the journal now contains two rows both claiming `beforeValue = X`, when the true history was `X → Y → Z` — one journal row is simply wrong. This directly breaks §3.4's promise that "each entry holds the actor, the subject, the before and after values" and breaks AD-7's own stated purpose ("the single-query read the journal promises"). The same gap applies to `Department.managerId` (department-manager change), which is likewise a plain FK update with no CAS.

Because department membership is an access switch (§2.1: "the employee's department... requires the dedicated *change organisational relationships* permission... every change is journaled"), a corrupted journal here is not cosmetic — it is the audit trail for who could see whom, and it's now provably wrong.

**Fix (concrete Rule text):** Extend AD-6 (or fold into AD-7) with: "Writes to `User.departmentId` and `Department.managerId` are guarded the same way as AD-5's Relationship writes: the domain service reads the current value with `SELECT ... FOR UPDATE` inside the same transaction as the update and the journal insert, or the caller supplies the expected current value and the `UPDATE` is conditioned on it (`WHERE departmentId = :expectedCurrent`); zero rows affected returns `409`." This gives AD-6 the same CAS guarantee AD-5 already has, and makes AD-7's before/after values trustworthy.

---

## Finding 3 — Nothing stops a `/roles` admin from re-creating AD-11's fixed matrix as a data-editable Permission, collapsing two "genuinely different extensibility models" back into one [HIGH]

**AD attacked:** AD-9 (functional roles as data) vs. AD-11 (base matrix as code constant) vs. AD-10 (full-profile-access separate grant).

**The two units:**

- **Engineer A** builds audience/section resolution per AD-11/AD-12/AD-14: `resolveSectionAccess(actor, target) → Map<Section, 'none'|'read'|'write'>`, driven purely by the code-constant matrix plus the narrowing/merge passes. No `Policy`/`Permission`/`UserPolicy` table is ever consulted here. Fully compliant with AD-11's letter.

- **Engineer B** builds the `/roles` admin API per AD-9: `Policy`, `Permission` (described as "fixed catalog" in AD-9's prose, but nothing in its *Rule text* enforces that), `PolicyPermission`, `UserPolicy`, all "administrable through a `/roles` API with no deploy and no schema change" (§2.3, quoted verbatim in AD-9). Engineer B implements this as the spec literally asks: a generic CRUD screen where HR Admin types a permission `name` and `description` and it's inserted into `Permission`. Nothing in the schema or the domain service Engineer B writes restricts `name` to the closed §2.3 list ("create form campaigns," "create action items," …) — AD-9's Rule text never says the catalog is closed to admin-created rows, it only says Policy/Permission/PolicyPermission/UserPolicy "are persisted data." Fully compliant with AD-9's letter.

**The clash:** HR Admin (or a future engineer wiring a new feature) creates a Permission row named `"view_S2"` or `"full_profile_read"` through the fully-compliant admin API from Engineer B, grants it to a Policy, assigns that Policy to a user. If any future controller — built by a third engineer who reasonably assumes "AccessControl.isAllowed(actor, permission)" is the ONE generic authorization primitive, since that's literally what AD-9's facade looks like from the outside — wires a data-visibility decision through `isAllowed('view_S2')` instead of through Engineer A's `resolveSectionAccess`, S2 (personal contacts — one of §3.2's most sensitive `—`/`RW`-restricted sections) becomes admin-grantable data access, in direct contradiction of §2.3's own rule ("Access roles (2.1) are not extensible this way... a new functional role never widens what data its holders can see") and of AD-11's stated purpose. Nothing in AD-9's or AD-11's Rule text — as opposed to their prose descriptions — actually forbids this: the "fixed catalog" claim is asserted, not enforced by any mechanism (validation, allowlist, or a structurally separate facade method).

This is precisely the §3.3.1 failure mode ("a leak is a critical defect, whichever section it happens in") arising from two independently-compliant builds, not a bug in either one alone.

**Fix (concrete Rule text):**
1. AD-9: "The `Permission` catalog is seeded only from the closed §2.3 feature-permission list, expressed as a code-defined enum/allowlist; the `/roles` API's create-permission path (if built at all — §2.3 only requires *roles* to be admin-creatable, not permissions) validates any new `Permission.name` against that allowlist and rejects names that collide with a section identifier (`S1`..`S16`) or with `full_profile`/`full_access` semantics."
2. AD-3 or AD-11: "The AccessControl facade exposes two structurally distinct entry points: `isAllowed(actor, functionalPermission)` for feature gates, and `canAccessSection(actor, target, section)` for data visibility. `isAllowed` never resolves section-level read/write; no controller may substitute one for the other. This is enforced by `isAllowed`'s domain implementation querying only `Policy`/`Permission` tables and never returning a section-shaped result."

---

## Finding 4 — AD-16's departure bundle can silently overwrite a human's real mentorship/action-item closure with a generic system note (TOCTOU, not blocked by AD-17) [MEDIUM-HIGH]

**AD attacked:** AD-16 (departure executor) vs. the ordinary Epic-4/4.11/4.5 write paths, which AD-17 does *not* block for a manager acting on someone else's records.

**The two units:**

- **Engineer A** builds the ordinary "end mentorship" feature (4.11): a manager or PP ends a pair, supplying a mandatory closure note; per AD-8/AD-1 this runs entirely inside the domain service. This story is not touched by AD-17 at all — AD-17 only denies access for actors/targets who are themselves departed; the manager ending the pair is not departed, so every AD-17 check they pass through succeeds. Fully compliant.

- **Engineer B** builds AD-16's departure executor: `SELECT ... FOR UPDATE SKIP LOCKED` on due `Departure` rows, then within that same transaction, per the Rule text, "active mentorship pairs auto-closed with a system note." The natural, letter-compliant implementation is two steps — `SELECT` the user's active pairs, then `UPDATE ... SET status='ended', closureNote='system: departed', endDate=now() WHERE id IN (...)` by the ids just selected. AD-16's Rule text says nothing about *how* that update is conditioned — it only requires the whole bundle to run in one transaction and to be idempotent via `appliedAt`. Fully compliant.

**The clash:** because there is no specified polling interval for AD-16's executor (the spine never states one), and because AD-17 deliberately does *not* block a non-departed manager from touching the departing person's records in the gap between `effectiveDate` and `appliedAt`, a manager can — entirely validly — end the mentorship pair themselves, with a real closure note, moments before the executor runs. If Engineer B's executor selected the pair as "active" before the manager's commit landed, and then updates *by id* rather than re-checking `WHERE status = 'active'` at update time, its blind `UPDATE` overwrites the manager's real closure note with the generic system note — silently destroying the one thing 4.11 calls mandatory ("a closure note is required to close it") and that a real HR conversation may depend on. The identical race applies to action items (4.5's "author can cancel an item with a reason" vs. AD-16's "cancelled — departed"): whichever transaction commits last wins with no defined tie-break, and the loser's reason is gone with no trace it ever existed (RelationshipJournal doesn't cover mentorship notes or action-item cancellation reasons — those aren't among AD-7's four journaled fields).

**Why AD-17 doesn't save this:** AD-17 is a read-side (authorization) rule; it correctly makes the departing *person's own* actions fail closed, but it says nothing about serializing the executor's writes against a *manager's* concurrent writes on the same records — that's a write-path concurrency gap AD-16 leaves open.

**Fix (concrete Rule text):** Add to AD-16: "Each side-effect statement in the bundle is a conditional `UPDATE ... WHERE status = 'active'` (or equivalent optimistic check), never a blind update by id following a prior `SELECT`. A statement affecting zero rows because a human already closed/cancelled the record in the interim is treated as already-satisfied, not re-applied and not overwritten." This makes the executor idempotent against concurrent human action, not just against its own retries.

---

## Finding 5 — AD-7's before/after value shape is unspecified, so two field-type writers can produce two incompatible payload shapes in the one journal table [MEDIUM]

**AD attacked:** AD-7 (relationship journal).

**The two units:** Engineer A (manager/PP writer, AD-5) and Engineer B (department writer, AD-6) each independently decide how to populate `RelationshipJournal.beforeValue`/`afterValue`.

- Engineer A, optimizing for correctness and minimalism, stores the raw referenced id (a `userId` uuid, or `null` for "no manager") — cheapest, always in sync with the live `User`/`Department` tables at read time via a join.
- Engineer B, reading §3.4's requirement that the journal be "readable by holders of full profile access, and by the current manager and people partner" and reasoning that a department can be renamed or (per AD-6) nested/restructured later, decides raw ids make for a useless audit trail years later and instead stores a denormalized snapshot, e.g. `{"id": "...", "name": "Platform Engineering"}`, serialized as JSON text into the same `beforeValue` column.

Both satisfy AD-7's Rule text ("one `RelationshipJournal` table... `beforeValue`, `afterValue`... written in the same transaction as the field change, regardless of whether the underlying storage is a Relationship edge or a Department/User FK") — the Rule text fixes the table and the transaction boundary, not the payload encoding. The result: the same column now holds two incompatible shapes depending on which `fieldType` wrote the row. Any consumer built to AD-7's own stated purpose — "the single-query read the journal promises" — either has to special-case by `fieldType` (defeating the point of unifying the four fields into one table) or crashes attempting to parse a raw-uuid row as JSON (or vice versa).

**Fix (concrete Rule text):** Add to AD-7: "`beforeValue`/`afterValue` are always the raw referenced id (uuid string, or the literal `null` sentinel for absence) — never a denormalized snapshot. Human-readable rendering (names, department labels) is resolved by the read side via a join at query time, not stored at write time." (Or the reverse — mandate the denormalized-snapshot shape explicitly — either choice is fine; the point is the spine must pick one, since both are independently plausible readings of the current text.)

---

## Finding 6 — AD-10's "never remove the last holder" check has no concurrency guard [MEDIUM]

**AD attacked:** AD-10 (full profile access separate grant).

Not a two-engineer clash so much as a single Rule-text gap that two independent *requests* (not builders) exploit: AD-10's Rule text says "the domain service blocks revoking the last active holder," which the natural implementation reads as `COUNT(active grants) > 1` before allowing a revoke. With exactly two active holders, two concurrent revoke requests (targeting holder A and holder B respectively) each run their count-check against the pre-revoke state under READ COMMITTED, both see `count = 2`, both pass, both commit — leaving zero active holders, violating §2.4's explicit invariant ("the system must never reach a state where nobody holds it") and AD-10's own stated purpose. This is exactly the class of concurrency gap AD-5 closes for relationship edges via a unique index, but AD-10 has no analogous mechanism.

**Fix (concrete Rule text):** Add to AD-10: "The last-holder check and the revocation are executed against a row lock on the full active-holder set (`SELECT ... FOR UPDATE` over `FullProfileAccessGrant WHERE revokedAt IS NULL`) within the same transaction as the revoke, so two concurrent revokes serialize and the second one re-reads a post-first-revoke count."

---

## Finding 7 — AD-22 (enumeration safety) and AD-17 (live departure check) disagree about who counts as "departed," letting a scheduled-departure account complete magic-link login in the executor's gap window [LOW-MEDIUM]

**AD attacked:** AD-22 vs. AD-17.

**The two units:**

- **Engineer A** builds magic-link request/consume per AD-21/AD-22. AD-22's Rule text: identical response, zero email, for "an unknown OR a deactivated/dismissed `workEmail`." The natural (and only available) implementation checks the *materialized* state — `User.isActive` / `EmploymentStatus.status` — since that's what AD-21/AD-22 and DEC-UM-004/012 talk about; nothing in AD-21/AD-22 mentions `Departure` at all. Fully compliant.
- **Engineer B** builds the AD-17 departure-safe check inside AccessControl, correctly reading `Departure.effectiveDate <= now()` live, independent of `appliedAt`. Fully compliant, and correctly scoped to AccessControl's own binding ("Binds: access-control").

**The clash:** in the executor's gap window (effective date passed, `appliedAt` still null, `User.isActive` still true because AD-16 hasn't run yet), a departed-per-schedule person's `POST /auth/magic-link` is evaluated by Engineer A's code against the still-active materialized state — so a real magic-link email goes out and a valid single-use token is issued, contradicting §4.16's "all access that person held ends immediately" (login is access). Consuming it correctly yields a valid JWT per AD-21, since AD-21 doesn't consult `Departure` either. The person is only stopped at the *next* layer, when their first data request hits AD-17's live check and is denied per AD-23. So no data leaks — but a person the spec says should have zero access can still authenticate, which is a real (if narrow) violation of the stated guarantee and a DoD-relevant inconsistency between two AD's independently-correct readings of "departed."

**Fix (concrete Rule text):** Add to AD-22 (or a new cross-reference): "The magic-link request/consume flow additionally treats a `workEmail` as unknown/inactive when a `Departure` row exists with `effectiveDate <= now()`, regardless of `appliedAt` — the same live check AD-17 uses for data access applies to authentication, not only to authorization after login."

---

## Summary table

| # | Finding | Severity | ADs in tension |
| --- | --- | --- | --- |
| 1 | AD-3's two capability edges form a real NestJS module-level DI cycle | HIGH | AD-3, AD-2, AD-25 |
| 2 | AD-6 department/dept-manager FK writes have no CAS, unlike AD-5 — lost updates corrupt the AD-7 journal | HIGH | AD-6, AD-7, AD-5 |
| 3 | Nothing stops a `/roles`-created Permission from re-implementing AD-11's fixed matrix as data | HIGH | AD-9, AD-10, AD-11 |
| 4 | AD-16's bundle can blind-overwrite a human's real mentorship/action-item closure note | MEDIUM-HIGH | AD-16, AD-17 |
| 5 | AD-7's before/after value encoding is unspecified — two shapes in one column | MEDIUM | AD-7 |
| 6 | AD-10's last-holder check has no concurrency guard | MEDIUM | AD-10, AD-5 (by contrast) |
| 7 | AD-22 and AD-17 disagree on "departed," letting a scheduled departure still complete login | LOW-MEDIUM | AD-22, AD-17, AD-21 |
