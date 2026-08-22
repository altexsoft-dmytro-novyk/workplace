# Adversarial Review — Architecture Spine (People Management Platform)

**Reviewer lens:** adversarial — construct two feature-owners, each obeying every AD to the letter, who still build incompatibly.
**Scope reviewed:** `ARCHITECTURE-SPINE.md` (as of the AD-14 addition and AD-11 mentor amendment), `docs/architecture/api-conventions.md`, `docs/architecture/database-schema.md`, `docs/architecture/access-control.md`, `docs/architecture/domain-driven-design.md`.
**Not re-litigated:** AD-14's existence/four-shape split, and AD-11's mentor-as-Relationship decision — both are today's adopted changes, not findings.

Every quote below is verbatim from the named file so the finding can be checked without re-deriving it.

---

## Finding 1 — "Owned collection" vs "field-group" has no decision rule, only a closed example list (AD-14, shape 2 vs shape 3)

**Severity: High.** This is the exact fault line the task asked to probe, and it is real.

AD-14 defines the two shapes by description, not by test:

- Shape 2: "rows with their own identity and lifecycle, independent of the `User` row"
- Shape 3: "no independent row identity, just a named bag of fields not yet on `User`"

Both descriptions are then backed only by **closed, enumerated examples** (`api-conventions.md` §"The four shapes"): `documents`/`notes`/`feedbacks`/... are told to be shape 2; `personal-contacts`/`emergency-contacts`/`employment`/`custom-fields` are told to be shape 3. For every resource named today, the ambiguity is pre-resolved by fiat — which is why the task's own suggested pair ("one building `documents`, one building `custom-fields`") does **not** actually collide: both are already pinned in the table.

The hole is what happens for the *next* resource that isn't in the table yet. Nothing in AD-14 gives a builder a structural test to classify it. Construct two developers:

- **Dev A** ships "Skills" as an owned collection: `POST /users/:id/skills`, `GET/PATCH/DELETE /users/:id/skills/:skillId` — each skill has its own id, proficiency level, and date, added/removed independently. This satisfies shape 2's description ("own identity and lifecycle").
- **Dev B**, on a different ticket touching the same conceptual data (e.g. profile-summary display), ships "Skills" as a field-group: `GET/PATCH /users/:id/skills`, PATCH replacing a JSON array of skill objects in one call, no item id. This also satisfies shape 3's description ("a named bag of fields... not yet on `User`" — nothing in the text says a "bag of fields" can't itself be an array).

Both are letter-compliant with AD-14. The result is two real, incompatible routes for one resource — precisely the antipattern AD-14 was written to prevent (its own **Prevents** clause: "endpoint shapes drifting per feature-owner").

**Sub-issue — PATCH semantics on field-groups are unspecified.** Even within the already-pinned shape-3 list, AD-14 never says whether `PATCH /users/:id/<field-group>` is full-replace or partial-merge. The four current owners (`personal-contacts`, `emergency-contacts`, `employment`, `custom-fields`) are four different feature tickets; nothing stops one from building full-replace (omitted fields nulled) and another partial-merge (omitted fields untouched) for what's supposed to be one uniform shape. A generic frontend form component built against one field-group's semantics will silently corrupt another's.

**Sub-issue — AD-14 fixed the custom-fields *router* shape ahead of the still-open custom-fields *storage* decision.** Spine Deferred: *"Custom-field storage model (EAV vs JSONB) — topic not yet discussed... Do not improvise."* Yet AD-14/`api-conventions.md` already commits `custom-fields` to shape 3 (field-group, bulk PATCH, no item id). If the storage decision lands on EAV (one row per custom-field-per-user — the natural EAV shape, and custom fields are dynamically defined by HR admins, i.e. genuinely variable-cardinality data), that data has row identity and wants collection semantics (e.g., backfilling one newly-defined field across users without touching the rest). AD-14 has already pre-empted that outcome. This is a sequencing hazard: a router-tree AD was finalized before the data-model AD it depends on.

**Recommendation:** Add an explicit, mechanical test to AD-14 (e.g., "shape 2 iff members can be created/deleted independently without replacing the whole set; shape 3 iff cardinality is fixed at one-per-user even when internally multi-field"), and require the api-conventions.md table to be updated as a checked step before a new resource is built (tie to the AD-1 gate's scenario-doc stage). Specify PATCH replace-vs-merge semantics once, for all field-groups. Flag the custom-fields router/storage sequencing to the architect explicitly.

---

## Finding 2 — AD-10 already treats department-level policy attachments as live tier-walk input, while Department modeling is explicitly Deferred and "do not extend without the architect"

**Severity: High.** This is a spine-internal contradiction between an *adopted* rule and the *Deferred* list, not a mere gap — and it lands squarely on the "two owners of one entity" pattern the task asked for.

AD-10 (spine, verbatim): *"The walk treats reports-to edges and manages-project/department policy attachments as **one** transitive graph."* `access-control.md` repeats this near-verbatim as a current, binding rule — not hedged as "once department modeling lands." `Policies.targetType` in `database-schema.md` already lists `'department'` as a live enum value today.

Against that, the spine's own Deferred section: *"Department edge modeling detail — departments group projects and extend the manager walk upward (generalizing §2.1 relation 2 over a resource tree, not a third relation); exact schema pending the non-manager-assignment answer."* And `database-schema.md`, Project/Department: *"Exact Department edge modeling is **pending**... do not extend without the architect."*

So: is "X manages department D" a mechanism a feature-owner can use **today** (AD-10's text says the walk already honors `targetType:'department'` policy rows), or is it explicitly blocked pending an architect decision (Deferred section + explicit "do not extend")? The requirements doc (`docs/project-requirements.md`) confirms Delivery Manager (DM) and Project Manager (PM) are both *project*-scoped roles today (a DM can be attached to several individual projects — "the DM sits above the PM... sees... the rest of their projects"), with no requirements-level notion of a department-level manager role yet — meaning the `'department'` targetType in the schema is currently unused by any sourced requirement, but syntactically ready and textually endorsed by AD-10.

Construct two feature-owners:

- **Owner A**, building a "department rollup" dashboard, reads AD-10 literally, ships one `Policies{targetType:'department', targetId:<deptId>, targetRole:'dm'}` row per department-level manager, and trusts the tier walk to honor it transitively down to every project in the department.
- **Owner B**, aware of the Deferred note and the explicit "do not extend without the architect," treats department-level policy targets as off-limits, and instead fans out N individual `Policies{targetType:'project', ...}` rows — one per project currently in the department — to achieve the same visible effect, and now owns an ongoing sync problem (new project added to the department ⇒ must remember to add another policy row, or access silently fails closed per AD-12).

Both comply with the letter of *some* binding text. The result is two incompatible representations of the same organizational fact, one of which (B) is a silent-drift time bomb every time department membership changes.

**Recommendation:** Either (a) strike "department" from AD-10's current-scope wording and from `Policies.targetType`'s implied-live status until the Deferred item resolves, explicitly marking department-scoped policies as not-yet-honored by the walk (mirroring how AD-11 explicitly says a `mentor` edge "grants no access tier unless/until explicitly wired into AD-10's walk"), or (b) if department-scoped policies are in fact meant to work today, remove the item from Deferred and let `database-schema.md`'s "do not extend" caution apply only to the `Department` *table's own* schema (parent/child hierarchy, not the policy-attachment mechanism). Today's text supports both readings simultaneously.

---

## Finding 3 — `Relationship.relatedUserId` sharing between `direct` and `mentor` is a structural landmine for the AD-10 recursive walk; the doc's own phrasing invites the wrong implementation

**Severity: High.** This is the (c) question, and the answer is: the "not decided today" framing is *stated* correctly but not *structurally enforced*, and one sentence in the spec actively points the wrong way.

`database-schema.md`, `Relationship` section, verbatim, two adjacent statements:

1. *"`direct` and `mentor` share `relatedUserId` because both point at `User`... **This is what lets `WITH RECURSIVE` walk the graph in one query (AD-10).**"*
2. *"A `mentor` edge grants no access tier unless/until explicitly wired into the AD-10 walk (fail-closed default, AD-12)."*

Statement 1, read on its own — and it appears first, directly under the bullet explaining the `direct`/`mentor` column-sharing — reads as if the column-sharing is *what enables* the recursive walk to traverse mentor edges alongside direct ones ("walk the graph," echoing AD-10's own "one transitive graph" language). Statement 2 then contradicts that reading. Nothing in AD-10 itself states a concrete implementation guard (e.g., "the recursive CTE's edge join MUST filter `WHERE type = 'direct'`") — AD-10 only asserts the *outcome* ("reports-to edges... one transitive graph"), not the *mechanism* that keeps mentor rows out, even though mentor rows are indistinguishable from direct rows in every column except `type`.

Concretely: a developer implementing the `WITH RECURSIVE` CTE who writes the natural, column-driven join —

```sql
... JOIN "Relationship" r ON r."userId" = prev."relatedUserId" ...
```

— without an explicit `type = 'direct'` predicate will silently walk through `mentor` rows too, because they populate the same `relatedUserId` column. A chain like *A reports to B (direct), B mentors C (mentor)* would resolve as if A were in the Manager line of C.

This is worse than an ordinary bounded tier leak, because `mentor` has **no** uniqueness constraint (AD-11 explicitly leaves it unconstrained — "no sourced one-mentor-at-a-time rule"), unlike `reportsTo`'s "tree, not a graph" guarantee. A recursive walk that accidentally admits mentor edges inherits a many-to-many, potentially cyclic structure (nothing bars mutual mentoring, A↔B) into a query that was designed and NFR-budgeted (500 records / 2s, §7) around the bounded fan-out of a strict org tree — a correctness and performance/infinite-recursion risk, not just an access leak.

**Recommendation:** State the guard explicitly and at the right altitude — either in AD-10 or AD-11 — as a MUST: *"the tier-resolution recursive query's edge-traversal join filters `Relationship.type = 'direct'` exclusively; `project` and `mentor` rows are never read by that query today."* Reword the `database-schema.md` sentence that currently reads "This is what lets `WITH RECURSIVE` walk the graph in one query" so it can't be misread as endorsing a joint direct+mentor walk — e.g., clarify it explains the *general* single-table-no-target-column pattern, not that mentor participates.

---

## Finding 4 — Relationship "active reportsTo edge" language has no backing column; DELETE semantics (hard vs soft) are genuinely undecided, and no `manager_change` event exists to recover the history either way

**Severity: Medium-High.**

`database-schema.md`'s `Relationship` table constraint, verbatim: *"UNIQUE: one **active** reportsTo edge per userId..."* — but the `Relationship` struct listed immediately above has no `deletedAt`, `isActive`, or any status column at all. Contrast this with the same file's `User` (`isActive boolean, default true // soft delete`) and `UserEvents` (`deletedAt timestamp, nullable // soft delete`) — both of which explicitly carry the column their "active"/soft-delete language depends on. `Relationship` uses the same vocabulary ("active") with no such column.

`api-conventions.md`'s `DELETE /users/:id/relationships/:relationshipId` is described only as "revokes" — a word that doesn't disambiguate hard-delete from soft-deactivate either.

Two developers implementing manager reassignment (delete old `direct` edge, insert new one) can both cite the doc:

- **Dev A** adds a `deletedAt` column and a partial unique index (`WHERE deletedAt IS NULL`), following the soft-delete precedent set by `User` and `UserEvents` in the very same file, and treats "revoke" as "deactivate."
- **Dev B** implements `DELETE` as a literal row removal with a plain unique index on `(userId) WHERE type='direct'`, since no status column is listed in the canonical schema and the endpoint verb is literally `DELETE`.

These are incompatible migrations for the same table, and they produce different query results for anyone later asking "who used to report to whom" — which matters here because there is **no `manager_change` type** in `UserEvents.type`'s enum (`joined_company | grade_change | position_change | department_change | employment_type_change | extended_leave | mentorship_start | mentorship_end`). Grade, position, department, and mentorship changes all get a durable audit trail via `UserEvents`; a reports-to change gets none, regardless of which of the two migrations wins — but Dev A's soft-delete at least leaves a queryable trace in `Relationship` itself, while Dev B's hard-delete leaves nothing.

**Recommendation:** Pin the semantics explicitly in `database-schema.md` and `api-conventions.md`: either add the missing status column and specify the partial-unique-index shape, or state plainly that `DELETE` is a hard delete and "active" in the UNIQUE clause just means "not yet deleted" (no column implied). If reports-to history matters (it plausibly does, given every sibling org-fact change is tracked), consider a `manager_change` `UserEvents` type analogous to the others, fired on `direct`-edge attach/detach the same way `mentorship_start`/`mentorship_end` now is.

---

## Finding 5 — The mechanism that fires `UserEvents` rows is named but not specified, inviting two different implementations of "one" audit pattern

**Severity: Medium.**

`domain-driven-design.md`'s own justification for keeping `UserEvents` inside `user-management` says: *"`UserEvents` writes are triggered by an **automated mechanism** reacting to changes across other contexts (grade/department/mentorship), which is cross-cutting by nature."* `database-schema.md` reinforces this for the new mentor type: *"attach/detach fires the... `UserEvents.mentorship_start`/`mentorship_end` row."*

Neither file says *how* "fires" happens mechanically: a synchronous insert inside the same use-case/transaction that writes the `Relationship` row, versus an async subscriber/listener/domain-event reacting to the write after the fact. This matters because AD-10 is explicit elsewhere about torn-read risk ("both calls run in one transaction") — the spine clearly cares about this class of problem, but doesn't extend that care to `UserEvents` writes.

Two feature owners — one building mentor attach/detach, another building a grade-change flow in a different (possibly future) context — can each invent their own "automated mechanism": one hard-codes a second insert in the same transaction as the `Relationship`/grade write; the other builds a generic listener keyed off table-change events. If both patterns end up coexisting, you risk either double-written events (an explicit insert *and* a generic listener both firing for the same change) or silently missing ones (a feature owner assumes a generic listener exists and doesn't wire their own call). This is the same "conflicting state-mutation path" pattern as Finding 4, applied to `UserEvents` instead of `Relationship`.

**Recommendation:** Name the mechanism once, at the DDD/spine level — e.g., "every `UserEvents` write happens synchronously, in the same transaction as the domain mutation that causes it, via an explicit call from that use-case; no event bus or generic listener writes `UserEvents` in iteration 1" — so every feature owner implements the same pattern instead of independently choosing one.

---

## Lower-priority watch-items (not full findings)

- **`resourcing` context and `Relationship` writes:** `resourcing` is listed "pending confirmation" in AD-5. When it's confirmed, its "request fulfilled → add user to project" flow must go through `user-management`'s application layer (per AD-2), not write `Relationship` rows directly — worth an explicit cross-context call-path note once `resourcing` is confirmed, since AD-2 makes this safe *if followed* but doesn't call out this specific seam.
- **`/roles` catalog surface is underspecified:** AD-14 gives `POST /roles`, `PATCH /roles/:roleId/permissions` but no `GET`/`DELETE` shape. Low risk given AD-1's gate will force this out per-feature, but worth noting as the catalog's only other loose thread.

---

## Verdict

The AD-14/AD-11 update closes the drift it targeted, but leaves at least one internal contradiction between an adopted rule and a Deferred item (Finding 2), one schema decision whose safety depends on an implementation discipline the text doesn't mandate (Finding 3), and a router-tree boundary that's only unambiguous for resources already named in the table (Finding 1). All five findings above are holes a second AD (or a tightened existing one) should close before more feature-owners build against this spine in parallel.
