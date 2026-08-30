# Review — ARCHITECTURE-SPINE.md (user-management & access-control, 2026-08-30)

**Reviewer basis:** ARCHITECTURE-SPINE.md + .memlog.md, docs/project-requirements.md v1.5 (§2, §3, §6, plus §4.9/§4.16/§4.17/§5.1/§9 as they bear on the spine), services/backend/CLAUDE.md + `.claude/rules/*.md`, both access-control SPEC.md kernels, and the docs/architecture/* companion set (domain-driven-design.md, database-schema.md, api-conventions.md, nestjs-di-tokens.md, testing-strategy.md, user-management-test-decisions.md, custom-fields.md, dashboards.md, README.md).

## Verdict

**Conditional pass — strong on mechanism, incomplete on reconciliation.** The 25 ADs are individually well-formed (real divergence point, enforceable rule, stated prevention) and the hexagonal/AD-1 paradigm correctly ratifies the existing repo convention. But the spine has two classes of real gap: (1) it does not reconcile against `user-management-test-decisions.md`, a document its own front matter cites as a source and that `docs/architecture/README.md` says must be "reconciled once new decisions land" — at least one already-approved decision (DEC-UM-001) is silently dropped; (2) a whole dimension the altitude owns — the operational/environmental envelope — is not decided, deferred, or raised as an open question anywhere, despite the DoD (§9) requiring "deployed and demonstrable, not running on somebody's laptop." Neither is a paradigm-level defect; both are exactly the kind of silent gap that lets two units diverge incompatibly.

---

## Critical

### C1 — DEC-UM-001's career-timeline write-authorization narrowing is missing from every AD

`docs/architecture/user-management-test-decisions.md` is listed as a spine source and is NORMATIVE ("binding for scenario documents, E2E tests, and implementation unless explicitly reopened through the architecture change process"). DEC-UM-001 states:

> **Write (§4.9 manual override):** Only the **assigned PP** and the employee's **direct Unit Manager** may manually add, correct, or delete timeline entries. Project-derived DM/PM and transitive managers are read-only for manual mutation.

This is *narrower* than what the generic section-matrix write rule (AD-11's base matrix, S9 = RW for Reporting line and PP) would produce on its own. AD-19 and AD-20 (the two ADs the Capability → Architecture Map assigns to Epic 3) describe *how* timeline events are written (sync, in-transaction, append+soft-delete) — neither says *who* may manually write one, and neither cites DEC-UM-001.

**Risk:** a story built straight from AD-11 + AD-19/20 will grant manual-timeline-write to the full transitive Reporting line and PP (matching the base matrix), directly contradicting an already-approved, currently-binding decision that restricts it to direct UM + assigned PP only. Two implementers reading only the spine (not independently cross-checking test-decisions.md) will diverge exactly at this point.

**Fix:** add an AD (or extend AD-19) stating the DEC-UM-001 restriction explicitly as a spine-level rule — e.g. "AD-19a — Career-timeline manual-write scope: manual add/edit/delete of `UserEvents` is restricted to the target's assigned PP and direct Unit Manager; transitive/project-derived managers hold S9 read only, never manual write, regardless of the base matrix's RW cell. [ADOPTED, DEC-UM-001]." Update the Capability → Architecture Map's Epic 3 row accordingly.

### C2 — Operational/environmental envelope is entirely silent

Nothing in the spine — not an AD, not the Stack table, not Deferred, not an Open Question — addresses deployment target, environments (dev/staging/prod), infra/provider strategy, or operations (how the AD-16 scheduled task actually runs in production, log/monitoring strategy, migration-deploy ownership). The Stack table lists library versions only.

This matters concretely: §9's Definition of Done requires "the module is deployed and demonstrable, not running on somebody's laptop," and AD-16's departure executor is explicitly designed to be safe under multiple concurrent instances (`SELECT ... FOR UPDATE SKIP LOCKED`) — a design choice that only makes sense if the spine has an opinion on whether the app runs as one instance or several, which it never states. Two epics could each assume a different deployment shape (single long-lived process vs. horizontally-scaled container) without anything in the spine forcing them to agree.

**Fix:** add a minimal AD or an explicit Deferred/Open-Question entry naming the deployment target, instance count assumption for the scheduled task, and environment strategy — even a one-line "single container, single instance, Docker Compose, out of scope beyond that" is a valid answer, but the spine currently gives none.

---

## High

### H1 — Full-profile-access × section-matrix interaction is undecided, and isn't even carried into Deferred

The facade SPEC (a spine source) lists as an **Open Question**: "Which matrix column does full-profile access map to, and how does that overlay interact with Self?" AD-10 already specifies `FullProfileAccessGrant`'s schema, self-grant block, and last-holder block — i.e., the spine has already committed to *how the grant is stored and protected* without deciding *what it produces at authorization time*. The spine's own Deferred section lists five other open items but drops this one entirely, even though it's flagged by name in a cited companion.

**Risk:** one story could implement full access as "bypass the matrix entirely, RW every section for every target," another as "still respects Self's exclusive columns (e.g., S2/S3 RW is Self-only per the matrix) and only widens Colleague-level sections" — genuinely different behavior for the same grant, with nothing in the spine to arbitrate.

**Fix:** either decide it now (a one-line AD: "full access resolves to `read` — or `write`, matching the matrix's per-section ceiling — for every section regardless of Self exclusivity") or explicitly carry it into Deferred/Open Questions with the same "confirm before building" treatment AD-13's `isHrDepartment` assumption gets.

### H2 — AD-7's journal doesn't cover full-profile-access grants, and AD-10 doesn't say where they go

§3.4 lists six event classes that must be journaled together, including "a grant or revocation of full profile access." AD-7's `RelationshipJournal` schema has a `fieldType` enum with exactly four values (`manager`, `people_partner`, `department`, `department_manager`) — structurally, a full-profile grant/revocation cannot be written into it. AD-10 (which owns `FullProfileAccessGrant`) never states where its grant/revoke events are journaled — `grantedBy`/`grantedAt`/`revokedAt` columns on the grant table itself are not "the journal," they're just audit fields on that table, and §3.4 requires this event be readable through the same journal mechanism as the other five, by "holders of full profile access, and by the current manager and people partner of the subject."

**Risk:** one implementer treats `FullProfileAccessGrant`'s own columns as satisfying §3.4 (no journal write at all); another bolts a fifth `fieldType` value onto `RelationshipJournal` ad hoc. Both are plausible readings of a spine that doesn't say.

**Fix:** extend AD-7's `fieldType` enum (or AD-10's rule) to explicitly state that grant/revoke writes a `RelationshipJournal` row too, or state a deliberate reason the two mechanisms differ.

### H3 — testing-strategy.md's AD cross-references are now stale against this spine's numbering

`docs/architecture/README.md` states testing-strategy.md is "kept as-is, not part of this reset... remains in force for all new work." testing-strategy.md's own header reads "Spine: AD-1, AD-3, AD-4, AD-15, AD-19, AD-20," and its "Done means built for real, not merely green (AD-15)" section describes a fakes/mocks scope-test rule with a dead anchor link to `domain-driven-design.md#fakes-mocks-and-stubs-scope-test-ad-15` (that file is now a one-line stub with no such section). In the *new* spine, AD-15 is "Departure scheduling vs. applying" — a completely different topic.

**Risk:** this is not cosmetic. testing-strategy.md is a currently-binding process document every feature owner reads before writing a scenario doc (AD-1 gate). A developer who looks up "AD-15" there and then in the new spine will land on the wrong rule, or conclude the fakes/mocks scope rule was silently dropped (it wasn't restated anywhere in the new spine either — see L-list below).

**Fix:** either renumber testing-strategy.md's citations to match the new spine (and restate the fakes/mocks scope-test rule as a new AD, since it no longer has a home), or have the spine explicitly note in Deferred/companions that this reconciliation is outstanding.

### H4 — AD-17 conflates "actor departed" with "target departed"; §4.16 requires read-only, not zero-access, for the latter

§4.16: on a departed person's effective date, "the profile becomes **read-only** and drops out of the default employee list, while staying filterable." That is a *write* restriction on the target's own profile, not a removal of read access for whoever already had it. AD-17's rule text is symmetric — "authorization checks treat an actor **or target** as departed... [access] loss is immediate" — worded as if departure uniformly means "loses access," which is correct for a departed *actor* (their derived manager/PP access over others must vanish) but is a stronger statement than the requirement makes for a departed *target* (only writes should be blocked; existing readers keep reading).

**Risk:** an implementer following AD-17 literally could make a departed person's profile fully inaccessible (404/`—`) to their former manager/PP instead of read-only, which breaks the explicit requirement and would also break S15/history-style reads that need to keep working after departure.

**Fix:** split AD-17 into two explicit sub-rules — actor-departed (full derived-access loss, as currently written) and target-departed (section writes downgrade to denied, section reads unaffected for whoever already held them).

### H5 — Project/ProjectAssignment ownership and the timetracker sync mechanism are used structurally but never assigned an owner, and aren't in Deferred either

The spine's own ER diagram includes `Project ||--o{ ProjectAssignment` and `User ||--o{ ProjectAssignment`; AD-24 references "project-assignment foreign keys are indexed"; AD-12 depends on project-line resolution reading assignment data; the Capability Map's CAP-2 row says "+ Project line structurally." But no AD says which bounded context owns the `Project`/`ProjectAssignment` tables, and the Structural Seed's directory layout has no home for them under either `user-management/` or `access-control/`. The requirements (§5.1) call the timetracker sync a security-relevant integration (event vs. state-at-sync-time semantics, 15-minute freshness, 4-hour degraded-mode withdrawal) — none of that appears in the spine at all, and — unlike shared-link overlay or the other explicitly-named deferred contexts — it isn't listed in Deferred either. It's simply absent.

**Risk:** whichever epic eventually builds Project/ProjectAssignment will have to invent its home, its freshness/withdrawal mechanics, and its relationship to the two contexts this spine governs, with zero spine guidance — exactly the "silent dimension" failure mode.

**Fix:** either add the tables + sync worker's home explicitly (even naming a placeholder context), or add an explicit Deferred entry: "Project/ProjectAssignment persistence and timetracker sync: not designed here; [owning context] is picked when Project-line implementation timing (already Deferred) is scheduled." The latter is cheap and closes the gap without expanding scope.

---

## Medium

### M1 — AD-12's project-line narrowing misses the DM/PM sub-distinction on S7

§3.2's S7 cell text and §3.3 rule 3 are explicit: within Project line, **DM gets RW, PM gets read-only and only flag-gated (`visible for PM`) records** — this is one of only two documented exceptions to "manager sees everything," called out by name in the requirements. AD-12's rule ("no S2, no S3, S5 limited to CV+certificates... everything else is identical, including S6") doesn't mention it, treating Project line as a uniform audience for every section except the three it names. Since Project line's positive-grant implementation is already Deferred (staging decision), this is lower urgency than C1/H-items, but the *structural* fact — that Project line isn't just "a narrower section set," it also needs a DM/PM actor-role distinction for S7 specifically — belongs in the same AD that fixes the rest of Project line's structure.

**Fix:** add a clause to AD-12 (or a new AD-12a) naming the S7 DM/PM split alongside the section-list narrowing, so whoever eventually builds Project line doesn't have to rediscover it from the requirements doc alone.

### M2 — No route for Department entity management

AD-25 lists route resources for users, relationships, auth, and roles, but Department is a first-class schema entity in this spine (AD-6, ER diagram) with its own requirement (§4.17: "Departments are maintained under the *manage departments* permission... dedicated screen, dedicated permission... journaled"). Changing *a person's* department goes through the relationships endpoint (covered), but creating/renaming/nesting departments themselves has no named resource in AD-25.

**Fix:** add `/departments` (or equivalent) to AD-25's route list, even just naming the resource root.

### M3 — DEC-UM-012 is cited as flatly "[ADOPTED]" though its own source marks it draft

AD-22's provenance tag reads "[ADOPTED, DEC-UM-004 + DEC-UM-012]." `user-management-test-decisions.md` itself labels DEC-UM-012: "**Status:** Proposed 2026-08-25... not covered by the 2026-08-25 product approval that settled DEC-UM-001..011; treat as draft until explicitly confirmed." The spine presents it as settled without flagging that its own source calls it draft.

**Fix:** either get the PO confirmation DEC-UM-012 is waiting on and note it, or tag AD-22 "[ADOPTED, DEC-UM-004; DEC-UM-012 pending PO confirmation, tracked as draft]" so a reader doesn't inherit false confidence.

### M4 — DEC-UM-008's "durable dispatch intent... observable (pending/failed) and retryable" isn't reflected in AD-21's schema

AD-21's `MagicLinkToken` has `userId`, `tokenHash`, `expiresAt`, `consumedAt` — no field for dispatch status. DEC-UM-008 (also a spine-cited-source decision, via user-management-test-decisions.md) requires registration's magic-link dispatch to be durably tracked as pending/failed and retryable. Either this state lives elsewhere (unstated) or the schema is incomplete.

**Fix:** either add a dispatch-status field/table to AD-21 or note explicitly that dispatch-intent tracking is a separate mechanism outside `MagicLinkToken` and where it lives.

### M5 — Fail-closed-on-malformed-data isn't restated as an explicit rule, only implied

The audience-foundation SPEC's CAP-2 is literally "Fail-closed resolution," and the facade SPEC's Constraints state "Missing, orphaned, broken, stale, or due-person data can only reduce access." The spine's Capability Map marks this "superseded by AD-4, AD-5" — but neither AD states a fail-closed guarantee; AD-4 is about liveness/no-caching, AD-5 is about the Relationship entity's CAS write contract. The behavior is *probably* implied (no matching row → resolver naturally finds no audience), but a spine that elsewhere goes out of its way to state guarantees explicitly (AD-14's merge rule, AD-23's denial convention) leaves this one as an inference.

**Fix:** a one-line addition to AD-4 or a new short AD: "resolution treats any missing, orphaned, or malformed relationship/policy row as absence of the audience/permission it would have granted — never an error, never a default grant."

---

## Low

### L1 — AD-20 bundles "correction" (soft-delete + append) with "delete"; §4.9 lists delete as its own action

§4.9: "whoever holds the *edit the career timeline* permission can **edit, delete and manually add**" — three verbs. AD-20's rule frames every removal as a correction ("soft-deletes the wrong row and appends a new correct row") without confirming a pure delete (no replacement) is also legitimate. Likely a non-issue in practice (a delete-with-no-replacement is just a correction with zero new rows), but worth a one-clause confirmation since the rule as literally written pairs the two.

### L2 — Dangling companion reference to `docs/architecture/access-control.md`

Both SPEC.md files list `../../../docs/architecture/access-control.md` in `companions:`; the file doesn't exist (not even as a stub, unlike its siblings). Predates this spine, but worth cleaning up since the spine treats these SPECs as canonical sources.

### L3 — Stack versions explicitly unverified, flagging for the dedicated tech-verification pass

The spine itself is honest that the stack table is "[ADOPTED — existing infra investment... not re-verified]." Flagging per this review's scope only — NestJS 11 / Prisma 7 (with `@prisma/adapter-pg`) / PostgreSQL 18 / Node ≥24 are the versions to have the dedicated verification pass confirm are real, current, and mutually compatible (Prisma 7 in particular is a recent major-version jump worth double-checking against `nest-prisma.md`'s Prisma-7-specific notes, which do read as internally consistent — `prisma.config.ts` datasource, WASM client `NODE_OPTIONS` flag — so this is a low-confidence flag, not a specific objection).

---

## What the spine gets right (for balance)

- Every AD has a real, stated divergence it prevents, not a restatement of the requirement — AD-5/6's edge-vs-FK split, AD-11/12's two-extensibility-models split, and AD-16's `SKIP LOCKED` single-transaction executor (resolving CC-06 without new infra) are all genuinely load-bearing decisions, not filler.
- AD-1/AD-2 correctly ratify the existing `domain/`-purity and actions-never-inject-ports conventions rather than reinventing them.
- The Capability → Architecture Map covers every CAP-1..5 from the facade SPEC and both CAPs from the audience-foundation SPEC (the latter explicitly marked superseded, which is the right call given it's the earlier, narrower slice).
- Deferred items that *are* listed are each low-risk: they're either genuinely out of scope (other bounded contexts) or carry a concrete resolution path (`isHrDepartment`, call-sequence detail) rather than an ambiguous shrug.
