---
stepsCompleted: [1, 2, 3]
inputDocuments:
  - docs/project-requirements.md
  - _bmad-output/planning-artifacts/prds/prd-people-management-2026-08-24/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/architecture/architecture-people-management-ratification-2026-09-02/blockers.yaml
  - _bmad-output/planning-artifacts/architecture/architecture-people-management-ratification-2026-09-02/ARCHITECTURE-RATIFICATION.md
  - _bmad-output/planning-artifacts/architecture/decision-package-five-open-blockers-2026-09-03.md
  - _bmad-output/planning-artifacts/global-coverage/global-fr-epic-story-coverage.yaml
  - _bmad-output/specs/spec-functional-roles-catalog/SPEC.md
  - _bmad-output/planning-artifacts/ux-designs/ux-people-management-2026-09-02/EXPERIENCE.md
  - _bmad-output/planning-artifacts/ux-designs/ux-people-management-2026-09-02/DESIGN.md
  - docs/architecture/api-conventions.md
status: draft
slice: role-administration
id_namespace: RA-E{epic}-S{story}
updated: 2026-09-03
---

# People Management — Role Administration — Epic Breakdown

## Overview

This document decomposes exactly **one canonical PRD requirement** — runtime functional-role and permission administration (`PM-FR-6`) — into implementable epics and stories.

**Canonical requirement source:** [prd.md](../prds/prd-people-management-2026-08-24/prd.md) §4.2 **FR-6** and [docs/project-requirements.md](../../../docs/project-requirements.md) §2.3, with §2.2 (dual write gate) and §2.4 (full profile access, non-overlapping) binding.

**Why this slice exists.** `PM-FR-6` has been recorded `coverage_status: deferred` with `stories: []` since the coverage model's baseline (`gap-validation-2026-09-02.md`). Its SPEC (`spec-functional-roles-catalog/SPEC.md`) exists as a draft origin document but was never carried into an epics/stories decomposition, and no existing slice claims it: `platform/epics.md` (PLAT-E1–E7) decomposes access-control's *audience-resolution* half of §2 (Phase-0 tiers, project-line, department walk, section matrix, shared-link policy) and never mentions `PM-FR-6` or the permission catalog anywhere in its text. This is that decomposition.

**Architecture authority:** [ARCHITECTURE-SPINE.md](../architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md) AD-6, AD-7, AD-8, AD-12 (ratified); [ARCHITECTURE-RATIFICATION.md](../architecture/architecture-people-management-ratification-2026-09-02/ARCHITECTURE-RATIFICATION.md).

**SPEC authority, with a caveat that must travel with every story here.** `spec-functional-roles-catalog/SPEC.md` is the fullest existing statement of this capability's shape (CAP-1–CAP-5, constraints, non-goals) — but its own banner reads **"UNAPPROVED DRAFT — do not dispatch"** and flags itself **stale relative to the 2026-09-02 architecture batch**: it predates ACF/AD-4's correction that `Permissions.key` (not `title`) is the binding identity field. Stories in this document consume the SPEC's capability boundaries (CAP-1–CAP-5, the constraints, the non-goals) but **do not** inherit its stale physical-shape wording. **AD-1 is unchanged by this decomposition:** an independently human-approved Stage-1 scenario document, then an independently approved E2E committed red, precede any production code — this epics.md is planning input to that Stage-1 document, not a substitute for it.

### Cross-context boundaries

| Context | Responsibility in this slice |
|---|---|
| `access-control` | Owns this slice's code (`Policies`, `Permissions`, `UserPolicies`, `isAllowed`) — **not a new bounded context**. AD-5 already confirms `access-control`; this is a new decomposition *file* for an orthogonal capability inside that same confirmed context, exactly as `platform/epics.md`'s PLAT-E1–E7 already do for the audience-resolution half. |

> **Cost, named explicitly (product owner ruling, 2026-09-03).** One context, two decomposition documents, is a cost this pass consciously pays, not a default nobody examined. `platform/epics.md` decomposes access-control's audience-*resolution* half (Phase-0 tiers, project-line, department walk, section matrix, shared-link policy) across 1500+ lines and never claims `PM-FR-6` anywhere in that text — folding runtime role/permission administration in as `PLAT-E8`/`PLAT-E9` was considered and rejected specifically to avoid rewriting that document's own scope statement to retroactively admit an eighth concern it never claimed. The trade-off accepted in exchange: `RA-E1`/`RA-E2` and `PLAT-E1`–`E7` both touch `src/access-control/` without one file's index knowing the other exists, so a future reader auditing "everything access-control owns" must check both files — the same convention `spec-functional-roles-catalog/SPEC.md` itself already accepted for the *code* layer ("one context now holds a read-only hot path and a mutating admin surface... the cost is accepted"), extended here to the *planning-document* layer for the same reason.
| `user-management` | Owns the `/users/:id/policies` HTTP route (role↔user attachment) per AD-2 — this slice supplies the attachment *capability* at the domain/port level and claims no route under `/users`. Also owns `user-management:edit` enforcement once RA-E1 seeds the key (consumed, not defined, here). |
| `mentorship` | Owns `mentorship:assign` enforcement once RA-E1 seeds the key (consumed, not defined, here). |

### Identifier namespace

Stories in this slice use **`RA-E{epic}-S{story}`**.

`ACF-*`, `ACM-*`, `UMAC-*` are stable workboard identifiers (PRD §0.2) and are **never** reassigned by this slice. No story here claims one, and no story renumbers or duplicates the three-permission ACM-1 bootstrap seed — this slice's catalog work builds **on top of** ACM-1's existing reservation, per Platform SD-2's convention that E4+ decomposition stories are never assigned ACM-*/ACF-* IDs.

> **REGISTRATION:** `RA-E*` is registered in `global-fr-epic-story-coverage.yaml` `namespace_rules` and `source_slices` (role: `bounded-context-slice` — not `draft`, since `access-control` is already a confirmed context and this file proposes no new one) as part of this run, and PRD §0.2 gains a Role Administration row. `PM-FR-6` moves `deferred` → `specified`.

**Out of scope for this slice:** default role-to-permission assignments (`OQ-PERM-01` — architect-owned, PO-confirmed only, never invented here); the §3.4 journal schema (CC-07's, not this slice's); re-authoring `AC-FP-01`–`03` (existing draft functional-permission scenarios this slice's Stage-1 work must stay consistent with, not duplicate); enforcement of the new permissions on any existing endpoint outside the two named in RA-E1.5 (each endpoint's owning context adds its own check per AD-2/AD-4); any UI beyond RA-E2's screen.

### Scope decisions (product owner, 2026-09-03)

- **SD-1 — This slice never invents a default grant.** AD-12's fail-closed rule and `OQ-PERM-01`'s open status both forbid it. Every story that touches the bootstrap seed states explicitly which key it adds and why; no story adds a key "for testability" or "so QA can exercise it end-to-end." Test fixtures attach permissions directly to a fixture user — never through an assumed role default.
- **SD-2 — RA-E1 and RA-E2 are functionally independent.** RA-E1 (the catalog engine) needs no default-assignment decision to ship, per AD-12. RA-E2 (the admin screen) is the only piece §2.3 gates on `OQ-PERM-01` ("confirmed by the PO **before** the roles admin screen is built"). RA-E2's gate has no downstream dependents of its own.
- **SD-3 — `OQ-AC-EDIT`'s resolution is proposed by this slice's Stage-1 document, not pre-empted by this epics.md.** The decision-package (`decision-package-five-open-blockers-2026-09-03.md`) recommends appending `user-management:edit` and `mentorship:assign` in one combined kernel-seed sequence, and frames option (a) as "effectively already decided" — but the blocker's `status` remains `open` and its owner remains `Architect and Access Control`. RA-E1.5 proposes this seed change as a named decision inside the Stage-1 document, which already carries AD-1's independent-human-approval requirement; this document does not itself declare `OQ-AC-EDIT` closed.

## Requirements Inventory

### Functional Requirements

- **PM-FR-6** *(§2.3, §4.2)*: HR Admin can create, name, and configure functional roles; grant or revoke the sixteen §2.3 granular permissions; assign people to roles — all through the UI, with no deploy and no schema change. Revocation is immediate. A new functional role never widens an access-role tier.

### NonFunctional Requirements

- **NFR-1**: A functional-permission leak (a role widening data access beyond features) is a critical defect.
- **NFR-7**: Functional-permission revocation is immediate — no re-login, no grace period.

### Additional Requirements

- AD-6: functional roles and access roles never collapse in naming, storage, or method surface.
- AD-7: one policy-attachment engine; `Permissions.key` is the binding identity, append-only, lowercase `context:action`; `title` is not identity.
- AD-8: operator `==` only; `managedBy: 'admin'` only; no `IN`, no `!=`, no `sync` provenance for FR rows.
- AD-12: fail-closed bootstrap — the seed script is the only path granting the first role; no other path in the platform may grant one.
- AD-1: Stage-1 scenario → independently-approved E2E red → production code, in that order, each independently gated.

### UX Design Requirements

- `Roles.dc.html` (`EXPERIENCE.md` §Information Architecture, §Component Patterns): derived access roles read-only with a DERIVED tag (left rail); functional-role permission toggles with Save disabled until dirty (right panel); a `.zerogrant` info panel when a role has no permissions, stating derived access is unchanged; inline role creation.
- UX-DR23 (banned, tested as a negative): a functional role never widens data access.

### FR Coverage Map

| FR | Epic | Depth |
|---|---|---|
| `PM-FR-6` | RA-E1 (engine/API), RA-E2 (UI, gated `OQ-PERM-01`) | Full coverage only after RA-E2 |

## Epic List

Two epics, split on the exact boundary §2.3 itself draws: the engine and its API can exist the moment AD-12's fail-closed rule is satisfied; the admin screen cannot exist until the PO confirms a default matrix nobody has approved yet. Splitting here makes that gate visible at epic altitude rather than buried inside a single epic's stories.

### Epic RA-E1: Runtime Roles and the Permission Catalog

Functional roles and their sixteen §2.3 permissions exist as data — created, named, granted, and revoked through an API with no deploy and no schema change — and revocation is immediate for every holder.

**FRs covered:** `PM-FR-6` (data/API layer)

**Standalone:** yes. Needs no default-assignment decision (AD-12 forbids inventing one regardless), and delivers a real, testable engine the moment its Stage-1 scenario document is approved.

**Enables (without depending on):** RA-E2 (consumes this catalog); `user-management/epics.md` Epic UM-E6 (needs the `manage custom fields` key to exist); `platform-capabilities/epics.md` Epic 4 (needs the `user-management:edit` key and a working `isAllowed`).

### Epic RA-E2: Roles & Permissions Administration Screen

HR Admin views derived access roles read-only and manages functional-role permissions and assignments through a UI screen.

**FRs covered:** `PM-FR-6` (UI layer — completes §2.3's "through the UI" requirement)

**🛑 Gate:** `OQ-PERM-01` (P1, PO-owned) — not schedulable until the default role-to-permission matrix is confirmed. No downstream story anywhere depends on this epic; its blockage stops only itself.

### Epic Dependency Graph

- RA-E1 → RA-E2 (consumes the catalog; RA-E2's own gate is independent of RA-E1's completion)
- RA-E1 → `user-management/epics.md` Epic UM-E6 (external slice; needs `manage custom fields` key)
- RA-E1 → `platform-capabilities/epics.md` Epic 4 (external slice; needs `user-management:edit` key + `isAllowed`)
- `OQ-PERM-01` → RA-E2 only — hard sprint-entry block with no further propagation

No epic requires a later epic to function.

---

## Epic RA-E1: Runtime Roles and the Permission Catalog

Functional roles and their sixteen §2.3 permissions exist as data — created, named, granted, and revoked through an API with no deploy and no schema change — and revocation is immediate for every holder.

### Story RA-E1.1: The Permission Catalog Exists as Queryable Data

**ID:** `RA-E1-S1.1` · **Sprint key:** `1-1-the-permission-catalog-exists-as-queryable-data`

As an HR Admin,
I want the full §2.3 permission list to exist as catalog rows I can reference by name,
So that granting a feature to a role never depends on a code deploy.

**Acceptance Criteria:**

**Given** a fresh deployment
**When** the permission catalog is queried
**Then** every §2.3 feature name resolves to exactly one `Permissions` row identified by `key` (ACF/AD-4), and none resolves by `title`

**Given** the catalog
**When** a new feature needs a permission
**Then** adding a row requires no evaluator code change (CAP-1)

**Given** `type: 'FR'` rows only
**When** the catalog is read or written
**Then** no `type: 'AR'` row is touched, read, or joined (AD-7 type separation), and this story's evaluation never enters the audience-resolution hot path

### Story RA-E1.2: Create and Name a Functional Role at Runtime

**ID:** `RA-E1-S1.2` · **Sprint key:** `1-2-create-and-name-a-functional-role-at-runtime`

As an HR Admin,
I want to create a new functional role through the UI-facing API,
So that a new part of the organisation can use platform features without a code change.

**Acceptance Criteria:**

**Given** no role of the requested name exists
**When** HR Admin issues `POST /roles` (top-level, AD-2 — catalog management is cross-user, never nested under `/users`)
**Then** a role is created with an empty permission set, and no code path special-cases the five §2.2 starting role names

**Given** the role is created after deployment
**When** its holders make a request
**Then** they are granted exactly its permission set (CAP-2) and no more

**Given** a role name that already exists
**When** creation is attempted again
**Then** the request is rejected rather than silently creating a duplicate

### Story RA-E1.3: Grant and Revoke Permissions on a Role, Effective Immediately

**ID:** `RA-E1-S1.3` · **Sprint key:** `1-3-grant-and-revoke-permissions-effective-immediately`

As an HR Admin,
I want a permission change on a role to take effect immediately,
So that revoking a permission stops the feature for every holder with no re-login and no grace period.

**Acceptance Criteria:**

**Given** a role holds a permission
**When** HR Admin issues `PATCH /roles/:roleId/permissions` removing it
**Then** the next request from any holder evaluates `isAllowed` to `false` for that feature — no cache, no memoized decision (CAP-3, NFR-7)

**Given** a permission removed between two requests inside one session
**When** the second request is evaluated
**Then** the removal is already reflected — nothing about the decision survives across requests

**Given** a policy row is written
**When** its operator and provenance are set
**Then** only `==` and `managedBy: 'admin'` are used — never `IN`, never `!=`, never `'sync'` (AD-8, AD-13)

**Given** `PM/AD-25`'s TD-11 already produced exactly this bug once — a saved-view revocation criterion worded "no cache" in prose was satisfiable by a five-minute `staleTime`, and `PMC-E1-S1.6` had to be rewritten to require server-side revalidation before it actually proved anything
**When** this story's "no cache, no memoized decision" claim is tested
**Then** the test asserts there is no cache at **any** layer between the write and the next `isAllowed` call — no client `staleTime`, no request-scoped memoization, no short-lived in-process TTL cache — not only that the database row changed; a passing test that only checks the row, the way the old S1.6 wording did, does not prove this AC

### Story RA-E1.4: Functional Permission Decision, Isolated from Audience Data

**ID:** `RA-E1-S1.4` · **Sprint key:** `1-4-functional-permission-decision-isolated-from-audience-data`

As a consumer context (resourcing, mentorship, or any feature owner),
I want a global `isAllowed(userId, feature)` decision that touches no target employee and no audience data,
So that a feature check can never become a data-access channel.

**Acceptance Criteria:**

**Given** a call to `isAllowed(userId, feature)`
**When** it is evaluated
**Then** only `type: 'FR'` policy, permission, and attachment rows are read, and no relationship or audience query is issued (CAP-4)

**Given** `isAllowed` returns `true`
**When** the result is used by any consumer
**Then** it grants no profile audience — a role holding every §2.3 permission still sees only the colleague view unless its holder's access role independently grants more (§2.3, §3.1)

**Given** a user with a due departure (AD-20 cutoff)
**When** `isAllowed` is evaluated for that user
**Then** it returns `false` irrespective of held permissions, ahead of any feature-specific check

### Story RA-E1.5: Fail-Closed Bootstrap with the Combined Kernel Seed

**ID:** `RA-E1-S1.5` · **Sprint key:** `1-5-fail-closed-bootstrap-with-the-combined-kernel-seed`

As the platform,
I want a fresh deployment to carry only the approved bootstrap grant and no invented defaults,
So that no access ever originates from a default nobody confirmed.

**Acceptance Criteria:**

**Given** a fresh seed
**When** the database is inspected
**Then** exactly one HR Admin FR attachment exists and no other grant (CAP-5)

**Given** an unknown feature key, an unattached user, a role with an empty permission set, or an orphaned attachment
**When** `isAllowed` is evaluated
**Then** each returns `false` (CAP-5)

**Given** `OQ-AC-EDIT`'s open status and the decision-package's recorded recommendation (SD-3)
**When** the Stage-1 scenario document for this story is authored
**Then** it explicitly proposes appending `mentorship:assign` to this bootstrap seed as a named decision requiring the same independent human approval AD-1 already mandates for the scenario document as a whole
**And** the seed change ships only inside an approved Stage-1 document — this story does not itself declare `OQ-AC-EDIT` closed; closure is recorded separately once approval lands

> **`user-management:edit` removed from this story's seed proposal (2026-09-04).** `user-management-edit-permission-options.md` (PR #20, Dmytro Novyk) resolved 2026-09-02 on **Variant A**: `PATCH /users/:id` is gated entirely by `canAccessSection(viewer, 'S1', target) === 'write'` — no separate FR permission, no kernel seed for this specific key. That resolution stands unless Dmytro reopens it; this story does not seed a key his own decision says should not exist. `mentorship:assign` is unaffected and still proposed here.

**Given** §2.3's three explicitly unsettled points — who may manage custom fields, who may assign mentors, and the defaults for approve/reject candidates, edit timeline, and create feedback
**When** this seed is written
**Then** none receives a default grant — `OQ-PERM-01` stays open and this story does not pre-empt it

### Story RA-E1.6: Standalone Capability-Check Endpoint for Target-Less Actions

**ID:** `RA-E1-S1.6` · **Sprint key:** `1-6-standalone-capability-check-endpoint-for-target-less-actions`

*(Added 2026-09-04 — agreed synthesis with Dmytro Novyk over the `OQ-AC-EDIT` discussion on PR #20: `canEdit`-in-response and a standalone capability-check endpoint are not competing designs, they cover two different halves of §2.2's functional axis.)*

As a client rendering an action with no existing target object (create a form campaign, view a dashboard, import the population),
I want to check whether the current user holds a given permission directly,
So that a target-less feature can be gated without inventing a fake object to hang `canEdit` on.

**Acceptance Criteria:**

**Given** a feature action that has no per-object response to embed a decision in (RA-E1.4's `isAllowed`, exposed here over HTTP)
**When** a client needs to know whether the current user may perform it
**Then** a standalone endpoint answers directly from `isAllowed(userId, feature)`, with no relationship or audience query (same CAP-4 isolation as RA-E1.4)

**Given** a target *does* exist for the action (e.g. editing a specific profile field)
**When** the client renders that object
**Then** the decision travels in that object's own `canEdit` envelope (AD-34, consumed by `PMC-E4`) — this endpoint is not used, and clients do not fall back to it just because it also happens to work, to avoid the "hundred one-off permission requests" pattern this split exists to prevent

**Given** permission keys are exposed to any client (this endpoint, `canEdit`, and the `/roles` catalog)
**When** a key is named
**Then** it is domain-meaningful (`profile:identity:write`-style — coordinate the exact scheme with `fr-permission-matrix-draft-2026-09-02.md`, PR #20), never a raw section identifier (`s1`, `s2`) — those identify access-role sections on a different axis (§3.2) and must not leak into functional-permission naming

---

## Epic RA-E2: Roles & Permissions Administration Screen

HR Admin views derived access roles read-only and manages functional-role permissions and assignments through a UI screen.

### Story RA-E2.1: Roles & Permissions Screen — Specified and Dependency-Blocked

**ID:** `RA-E2-S2.1` · **Sprint key:** `2-1-roles-permissions-screen-specified-and-dependency-blocked`

🛑 **GATED — do not start.** Requires `OQ-PERM-01` (P1, PO-owned) to close. Building this screen ahead of a confirmed matrix means shipping unconfirmed defaults through the UI itself — the exact failure §2.3 names by requiring confirmation "before the roles admin screen is built."

As a planner,
I want this screen's requirements specified and its blocking dependency stated,
So that §2.3's ordering rule is not silently bypassed by treating "RA-E1 shipped" as "PM-FR-6 done."

**Acceptance Criteria:**

**Given** `OQ-PERM-01` still open
**When** scheduling is considered
**Then** this story is **not schedulable** — inventing a business rule by building the screen anyway is not an option

**Given** the matrix is eventually confirmed
**When** the screen is built
**Then** it shows derived access roles read-only tagged DERIVED (left rail) and functional-role permission toggles (right panel), Save disabled until dirty, per `Roles.dc.html`

**Given** a role with zero permissions granted
**When** HR Admin views it
**Then** a `.zerogrant` info panel states that derived access is unchanged

**Given** UX-DR23
**When** any functional-role assignment is tested through this screen
**Then** no combination of assignment and view exposes data beyond the holder's independently-resolved access role — executed as a negative test, not asserted as a property

**Given** this story ships
**When** `PM-FR-6` coverage is re-evaluated
**Then** it may move from `specified` (RA-E1 alone) to `implemented` — RA-E1 alone does not complete `PM-FR-6`
