---
status: approved-with-open-items
approved: 2026-09-02
approval: user-batch-sign-off
binds_spine: _bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md
spine_id: PM
spine_ads: [AD-2, AD-5, AD-9, AD-10, AD-11, AD-14, AD-15, AD-17, AD-18, AD-20, AD-23]
companions:
  - domain-driven-design.md
  - access-control.md
  - api-conventions.md
  - database-schema.md
  - nestjs-di-tokens.md
  - testing-strategy.md
sources:
  - docs/project-requirements.md            # §4.11, §3.2 S1/S13, §4.9, §4.16, §4.1
  - _bmad-output/planning-artifacts/prds/prd-mentorship-2026-09-01/prd.md
  - _bmad-output/planning-artifacts/mentorship/epics.md
  - _bmad-output/planning-artifacts/mentorship/architect-handoff.md
  - docs/test-cases/mentorship/
---

# Mentorship — Bounded Context

**Boundary, routes, and shared-transaction contracts in this document are approved** (user batch sign-off 2026-09-02, PM/AD-5, PM/AD-17, PM/AD-23). Feature delivery still runs the full AD-1 three-stage gate with independent human approval. Binding rules for the mentorship feature. Spine: **AD-5, AD-11, AD-14, AD-17, AD-20, AD-23** (plus AD-2, AD-9, AD-10, AD-15, AD-18). Normative requirements: `docs/project-requirements.md` §4.11, §3.2 (S1 "mentor", S13), §4.9, §4.16, §4.1.

---

## 1. Context boundary & layout (AD-5)

`mentorship` is a **confirmed** bounded context (AD-5 amended 2026-09-01 — moved
off the "pending context-boundary confirmation" list). Standard hexagonal layout
(AD-2, `domain-driven-design.md`):

```text
src/mentorship/
  application/
    actions/       # CreateMentorshipPairAction, EndMentorshipPairAction,
                   #   SetMentorshipAvailabilityAction,
                   #   ApplyDepartureEffectsAction   (exported to the AD-20 executor)
    controllers/   # MentorshipPairsController        -> /mentorship-pairs
                   # MentorshipPoolController         -> /mentorship-pool
                   # MentorshipAvailabilityController -> /users/:id/mentorship-availability
    dtos/          # boundary shapes
    queries/       # read models — the EXPORTED read surface (see §5.3):
                   #   GetS13MentorshipSummaryQuery, GetActiveMentorQuery,
                   #   MentorshipDirectoryStatusQuery
  domain/
    entities/      # MentorshipPair (behaviour-rich), MentorshipAvailability
    interfaces/    # MentorshipPairRepositoryPort, MentorshipAvailabilityRepositoryPort,
                   #   CareerEventPort   (consumed — see §5.1),
                   #   AccessControlReadPort (consumed — wraps the facade)
    services/      # MentorshipPairService, MentorshipAvailabilityService,
                   #   MentorshipStatusService, ClosureNoteProjectionService
  infrastructure/  # prisma-mentorship-pair.repository.ts,
                   #   prisma-mentorship-availability.repository.ts,
                   #   career-event.adapter.ts   (forwards to user-management's
                   #     exported career-timeline boundary),
                   #   access-control.adapter.ts (forwards to AccessControlFacade)
```

### What lives here vs elsewhere

| Concern | Owner | How mentorship touches it |
| --- | --- | --- |
| Willing-mentor pool, availability fact, `MentorshipPair` lifecycle, closure note, S13 read projection, profile-header mentor field, departure auto-close | **`mentorship`** | builds it |
| Career-timeline store (`UserEvents`, S9), the `mentorship_start`/`mentorship_end` write | **`user-management`** (§4.9; eventual `career-timeline` context) | calls its exported `appendCareerEvent` boundary in a caller-supplied `tx` (§5.1) — never writes `UserEvents` |
| S13 §3.2 matrix entitlement, `resolveAudiences`, `isAllowed`, `canAccessSection` | **`access-control`** | calls `AccessControlFacade` only; **never** reads policy tables, **never** derives an audience, and **pairs never feed audience resolution** (AD-17) |
| All Employees directory filter/column engine (§4.1) | **platform** (`user-management` list endpoint) | supplies the mentorship-status value through an exported bulk read model (§5.3) — the directory never queries mentorship tables |
| AD-20 departure executor / `Departure` aggregate | **`user-management`** (AD-20, CC-06) | exposes `applyDepartureEffects({...tx})` for the executor to call under the shared unit of work (§5.2) |

---

## 2. Aggregates

### 2.1 `MentorshipPair` — the durable workflow record (AD-17)

A persistent record; active **and** ended pairs retained (`AD-17` "Ended pairs
remain queryable" — no hard delete, unlike the retired `Relationship` mentorship
model). Documented shape (the *documented* schema; `database-schema.md` carries
the house-style copy — `services/backend/prisma/schema.prisma` is not touched by
this doc):

| Field | Type | Named consumer |
| --- | --- | --- |
| `id` | `uuidv7` PK | row identity — `GET /mentorship-pairs/:id`, the end action |
| `mentorUserId` | `uuid` FK → `User` | FR-M4/M6; the "active pairs where mentor = X" status query (FR-M6/M13); men-pair-*, men-view-* |
| `menteeUserId` | `uuid` FK → `User` | FR-M5/M9; the `?participant=` departure lookup; the mentee-side S13 summary; men-* |
| `status` | `'active' \| 'ended'` | **single source of truth** for lifecycle (FR-M8); the `?status=` list filter (men-view-02, men-end-08); the idempotency predicate on every close |
| `startedAt` | `date` | FR-M8 "start date"; men-pair-01, men-view-02 |
| `endedAt` | `date`, nullable | FR-M8/M9 "end date"; **null iff `status='active'`** — a derived-consistent companion of `status`, never an independent truth |
| `closureNote` | `text`, nullable | FR-M9/M10; men-end-01..04, men-dep-02; set once at the `active → ended` transition, never edited afterward |
| `endedByDepartureId` | `uuid`, nullable, **no DB FK** | FR-M14 system-closed marker **and** AD-20 idempotency provenance; men-dep-01/02 (`systemClosed: true`). FK-less by the accepted `Policies.targetId` trade-off (AD-11) so the migration does **not** depend on the `Departure` table (CC-06) landing first |

**"Ended" is one field.** `status` is the source of truth. `endedAt`,
`closureNote`, and `endedByDepartureId` are populated *by* the transition, never
set independently. DB `CHECK` (raw SQL, per the repo's constraint pattern):

```sql
CHECK ((status = 'active' AND endedAt IS NULL AND closureNote IS NULL
                          AND endedByDepartureId IS NULL)
    OR (status = 'ended'  AND endedAt IS NOT NULL AND closureNote IS NOT NULL))
CHECK (mentorUserId <> menteeUserId)          -- self-pairing rejected
```

- **Manual close** (FR-M9): `closureNote` from the human, `endedByDepartureId`
  NULL. The mandatory-note gate is an application invariant in
  `EndMentorshipPairAction` (reject empty/absent note → `422`/`400`), *and* the
  DB `CHECK` guarantees no ended pair is ever noteless.
- **System close** (FR-M14): `closureNote` = the fixed system template,
  `endedByDepartureId` set. `EndMentorshipPairAction`'s gate is **not** on this
  path (`ApplyDepartureEffectsAction` supplies the template) — the gate is
  bypassed, the `CHECK` still holds.
- **`systemClosed` in every read projection** = `endedByDepartureId IS NOT NULL`.
- **Immutable in history:** no `PATCH /mentorship-pairs/:id`; an ended pair's
  fields never change; there is no un-end transition.
- **No `closedByUserId`.** The current `database-schema.md` shape carries
  `closedBy FK → User, nullable`; no scenario consumes "who ended it". Dropped
  per `database-schema.md` Conventions / [[feedback_no_speculative_fields]] —
  see Decision 8.

**Indexes** (each tied to a scenario query):

| Index | Query it serves |
| --- | --- |
| `(mentorUserId, status)` | active-pairs-as-mentor: first-pair transition (FR-M6, men-pair-03), status roll-back (FR-M3/M13, men-end-05/06), mentor-side history (men-end-08); leading column serves the mentor-side S13 summary |
| `(menteeUserId, status)` | mentee-side S13 summary (men-view-01/04), the departure participant lookup (`menteeUserId = :id AND status = 'active'`), the one-active-mentor-per-mentee guard |
| `(status)` | the all-pairs list `GET /mentorship-pairs` and its `?status=` filter (men-view-02/08), the `?status=active` departure sweep |
| partial `UNIQUE (mentorUserId, menteeUserId) WHERE status = 'active'` | at most one **active** pair per ordered (mentor, mentee); recurrence after ending is allowed (Decision 4) |
| partial `(endedByDepartureId) WHERE endedByDepartureId IS NOT NULL` | AD-20 idempotency re-scan / departure audit |
| *(Decision 5, flagged)* partial `UNIQUE (menteeUserId) WHERE status = 'active'` | one active mentor per mentee — matches the singular "mentor" in §3.2 S1 / §4.11 |

Departure participant lookup — `WHERE (mentorUserId = :id OR menteeUserId = :id)
AND status = 'active'` — runs as two index scans (or an index-OR) over the two
composite indexes.

### 2.2 `MentorshipAvailability` — the open-to-mentoring flag (AD-17)

A per-employee boolean-shaped fact, **independent of any pair**. True with zero
pairs; false with an active pair (§4.11 "Un-flagging"). **Not** a `MentorshipPair`
field, **not** a `Relationship` row (spine Deferred: "Do not infer it as a
relationship patch").

| Field | Type | Named consumer |
| --- | --- | --- |
| `userId` | `uuid` PK, FK → `User` | 1:1 with `User`; FR-M1/M3 |
| `openToMentoring` | `boolean` NOT NULL DEFAULT `false` | FR-M1 (self set/clear); FR-M4 (pool = `WHERE openToMentoring`); FR-M13/M15 (status derivation) |

- **One row per user**, PK = `userId`. A missing row means `false`
  (fail-closed — never in the pool).
- **No `updatedAt`/`updatedBy`** — no named consumer
  ([[feedback_no_speculative_fields]]). The §3.4 relationship-and-access journal
  does not cover mentorship, and §4.9's tracked-event list is pair start/end
  only — there is no "flag changed" event.
- **Write path:** `SetMentorshipAvailabilityAction` upserts `{userId,
  openToMentoring}`. It **never** reads or writes `MentorshipPair` — AD-17's
  "clearing it never mutates an active pair" is structural (separate aggregate,
  separate action, separate table).
- **"Am I in the pool"** = `openToMentoring = true`. Nothing else.
- **Index:** partial `(userId) WHERE openToMentoring` — the company-wide pool
  scan (FR-M4) and the `mentorshipStatus=open-to-mentoring` directory filter
  (FR-M15).

**This resolves the spine Deferred entry "S13 mentorship self-visibility flag's
exact endpoint."** Owning aggregate: `MentorshipAvailability` in `src/mentorship/`.
Endpoint: `GET/PATCH /users/:id/mentorship-availability` (§4, AD-14 shape 3).

### 2.3 Mentorship status (`open to mentoring` / `mentor`) — **derived, never stored**

| Value | Definition |
| --- | --- |
| `mentor` | `EXISTS (MentorshipPair WHERE mentorUserId = :id AND status = 'active')` |
| `open to mentoring` | not `mentor` **and** `MentorshipAvailability.openToMentoring = true` |
| *(neither)* | not `mentor` **and** (`openToMentoring = false` or no row) |

Computed by `MentorshipStatusService` from two already-persisted inputs — the
availability row and the active-pair count. **Justification:**

1. FR-M6 (`open → mentor` on the first pair) and FR-M13 (`mentor → open` on the
   last pair's end) become **consequences of the query**, not writes inside the
   pair-mutation transaction — no status column to keep in sync, no drift, no
   speculative column.
2. FR-M3 ("status stays `mentor` while any pair is active even if the flag was
   cleared") is automatic — the active-pair `EXISTS` wins over the flag.
3. FR-M13's "**unless** the flag was cleared" (men-end-06) is automatic —
   `openToMentoring = false` → *(neither)*.

**Directory read contract (§4.1 — All Employees is platform / `user-management`
scope).** mentorship exports (`src/mentorship/application/queries/`):

- `MentorshipDirectoryStatusQuery.forUsers(userIds: string[])`
  `: Promise<Map<string, 'mentor' | 'open_to_mentoring' | null>>` — bulk, for the
  **column** projection over a fetched directory page.
- `MentorshipDirectoryStatusQuery.userIdsWithStatus(status)`
  `: Promise<string[]>` — for the **filter** predicate: the list action
  constrains `User.id IN (...)`.

The directory calls these; it never queries `MentorshipPair` /
`MentorshipAvailability` and never joins their tables (AD-2). Cost: one or two
bounded bulk queries per list request — the same shape `resolveAudiences` uses
for its 500-target bulk (§7 budget holds). **Rejected alternative:** a
mentorship-owned SQL view the directory `LEFT JOIN`s — one faster query plan,
but it crosses the persistence boundary (`domain-driven-design.md` bars reaching
into another context's `infrastructure/`). See Decision 9.

NFR-M3 (no leak): the status value is projected like any field — the directory
applies the viewer's row-level section rules before emitting the column, and the
`?mentorshipStatus=` filter only narrows a set the viewer could already read.

---

## 3. Endpoints (AD-14)

| Purpose | Route | Shape | Notes |
| --- | --- | --- | --- |
| All-pairs list | `GET /mentorship-pairs` `?status=active\|ended` `?participant=<uuid>` | 2 — top-level cross-user collection | FR-M8. Rows audience-projected + closure-note-narrowed per row (§5.3). `?participant` serves the departure sweep and both-profiles history |
| One pair | `GET /mentorship-pairs/:id` | 2 | FR-M8/M10. `404` (leak-free) if the viewer has no S13 base access over **either** participant (men-end-04 test 3) |
| Create a pair | `POST /mentorship-pairs` `{ mentorUserId, menteeUserId }` | 2 | FR-M5/M6/M7. Dual gate — §5.3 |
| **End a pair** | `POST /mentorship-pairs/:id/end` `{ closureNote }` | 2 — collection-member action | FR-M9/M11. **Not a fifth shape** — identical to `action-items/:id/complete`, `departures/:id/retry`: a verb sub-action on a shape-2 member with real row identity. `end` (verb) not `closure` (noun), matching `complete`/`cancel`/`retry` |
| Willing pool | `GET /mentorship-pool` | 2 — top-level, read-only | FR-M4. A projection of `MentorshipAvailability WHERE openToMentoring` joined to S1. No `:id` sub-route — you never address a pool member; membership changes via the availability flag. `mentorship-pool` over `willing-mentors`: consistent `mentorship-` prefix with `mentorship-pairs`, and the pool is a derived list, not a resource with its own lifecycle |
| Availability flag | `GET/PATCH /users/:id/mentorship-availability` `{ openToMentoring }` | 3 — field-group, full-replace | FR-M1/M3. Resolves the spine Deferred question. **`PATCH`, not `PUT`** — shape 3 is uniformly full-replace; the `PUT` in the scenario drafts is superseded. Mentorship-owned controller mounted on the `/users/:id` path — exactly the shape-3 "owning context still pending" case |
| S13 inline summary + S1 `mentor` field | `GET /users/:id` (inline) | 1 | FR-M16/M17. Served by `user-management` via mentorship's exported read models (§5.3) — **no new route** |

**Career events have no HTTP surface** — written through the `user-management`
application boundary in the pair-mutation transaction (AD-11, §5.1).

**Route ordering:** within `MentorshipPairsController` only `:id` and `:id/end`
exist — no literal-vs-`:id` collision. `/mentorship-pool` is a distinct
top-level resource.

**Provisional routes fixed** (the scenario drafts in `docs/test-cases/mentorship/`
carry `> PROVISIONAL ROUTE` notes against the first three — they are now fixed;
the scenario files, still unapproved drafts, are updated to match at stage-1
approval):

| Scenario-draft provisional | Fixed |
| --- | --- |
| `POST /mentorship-pairs/:id/closure { note }` | `POST /mentorship-pairs/:id/end { closureNote }` |
| `GET /willing-mentors` | `GET /mentorship-pool` |
| `PUT /users/:id/mentorship-availability { openToMentoring }` | `PATCH /users/:id/mentorship-availability { openToMentoring }` |

---

## 4. The availability-flag endpoint — S13 own-flag mapping

`GET/PATCH /users/:id/mentorship-availability` (AD-14 shape 3).

- **`PATCH` authorization:** allowed **iff** `session.userId === :id` — Self only,
  after identity confirmation (both viewer and target present and active, per
  the AccessControl "Self" column rules). §3.2 S13 grants Self `RW (own flag)`;
  no functional permission and no manager/PP relationship grants it
  (men-flag-04: Bob → Alice's flag → `403`). This mapping needs **no** facade
  call — it is identity equality — so it is **not** blocked by the missing
  `canAccessSection('S13')` (Decision 3).
- **`GET`:** returns `{ openToMentoring }` for a viewer with S13 base read over
  `:id` (§5.3); the value is also inlined in the S13 summary on `GET /users/:id`.
- **Full-replace:** the body is `{ openToMentoring: boolean }`; an absent key is
  a `400`, not a no-op (shape 3 uniform full-replace).
- Clearing the flag runs `SetMentorshipAvailabilityAction` only — no pair is
  read or touched (AD-17; men-flag-03).

---

## 5. Cross-context seams

### 5.1 Career events (FR-M7 / FR-M11) — consumed from `user-management`

The boundary **does not exist yet** — UM Epic 3 Story 3.1 owns building it
(gate **G-CT**). The contract mentorship requires:

```ts
// user-management application export (career-timeline boundary)
appendCareerEvent(input: {
  tx: PrismaTransactionClient;      // caller-supplied — the SAME unit of work as the pair write (AD-11)
  userId: string;                   // whose timeline
  type: 'mentorship_start' | 'mentorship_end';
  eventDate: Date;                  // pair.startedAt / pair.endedAt
  source: 'system';
  details: { pairId: string; mentorUserId: string; menteeUserId: string };
  idempotencyKey?: string;          // e.g. `${type}:${pairId}:${userId}` — the boundary
                                    //   dedupes so an AD-20 retry cannot double-write
}): Promise<void>;
```

- Called **once per participant** (mentor **and** mentee) per transition — the
  pairing is a career event for both parties (Decision 6; men-pair-04 only
  asserts the mentee side).
- **Same transaction** as the `MentorshipPair` insert/update:
  `CreateMentorshipPairAction` / `EndMentorshipPairAction` open the `tx`, write
  the pair, then call `appendCareerEvent(tx, …)` before commit. No event bus, no
  table trigger (AD-11).
- mentorship consumes it via `CareerEventPort` in `mentorship/domain/interfaces/`;
  the port is held by `mentorship/domain/services/`, injected by the infra
  adapter that forwards to UM's exported action — **actions never inject the
  port** ([[feedback_actions_never_inject_ports]]).
- **Module wiring — no cycle.** Expose the career-event boundary as an
  independently-importable provider (a `@Global` career-timeline provider inside
  `user-management`, or the eventual `career-timeline` context — AD-5) so
  `MentorshipModule` consumes it **without importing `UserManagementModule`**;
  `UserManagementModule` imports `MentorshipModule` for the read models (§5.3).
  One direction at each edge. If the boundary ships only as a plain
  `UserManagementModule` export, `forwardRef()` on both imports is the sanctioned
  fallback.
- **Until G-CT lifts:** `CareerEventPort` gets a **fake in mentorship's E2E**
  (legitimate under AD-15 — a different context/story owns the real boundary,
  and it is named here). Stage-2 for the career-event ACs of Stories 1.3/1.4
  stays blocked.

### 5.2 Departure auto-close (FR-M14, AD-20) — exported to the executor

**Blocked on CC-06 implementation / the AD-20 executor (gate G-DEP)** — design of the shared contract is PM/AD-23 (resolved). Scenario prose and production participants remain implementation-absent until then. The operation mentorship exposes:

```ts
// mentorship application export — the AD-20 departure executor calls this
applyDepartureEffects(input: {
  departureId: string;
  departingUserId: string;      // supplied by the executor — mentorship does not read Departure
  effectiveDate: Date;          // the applied effective date
  leaseToken: string;
  tx: PrismaTransactionClient;  // the one shared PostgreSQL unit of work — NO nested tx
}): Promise<void>;
```

- Selects `MentorshipPair WHERE (mentorUserId = :departingUserId OR
  menteeUserId = :departingUserId) AND status = 'active'` `FOR UPDATE` within
  `tx`.
- Per pair: `UPDATE … SET status='ended', endedAt=:effectiveDate,
  closureNote=<system template>, endedByDepartureId=:departureId
  WHERE id=:id AND status='active'`. **The `status='active'` predicate is the
  idempotency key** — a retry updates 0 rows and emits no second event
  (`domain-driven-design.md`: "a unique departure mutation key where the owning
  table can otherwise duplicate an outcome"). `endedByDepartureId` records the
  provenance and is the `systemClosed` marker.
- Per pair per participant: `appendCareerEvent(tx, { type: 'mentorship_end',
  idempotencyKey: `mentorship_end:${pairId}:${userId}`, … })` (§5.1).
- **Stale executor token:** the executor locks `Departure` and checks its token
  before calling; mentorship writes no retry state and opens no transaction of
  its own — a stale re-entry is a no-op via the `status='active'` predicate.
- **System closure-note template** (fixed): `"Auto-closed on <effectiveDate>:
  <departing participant> left the company."` No human note; the FR-M9 gate in
  `EndMentorshipPairAction` is not on this path.
- Also in the same transaction: set `MentorshipAvailability.openToMentoring=false` for the departing user. Pool and directory projections additionally require active employment (PM/AD-17). Rehire, if later introduced, requires explicit opt-in again.
- Contract shape is PM/AD-23 (user-approved 2026-09-02). The earlier note that `domain-driven-design.md` showed a three-field call is historical; both documents now use `{departureId, leaseToken, departingUserId, effectiveDate, tx}`. The executor owns claim/fencing; mentorship does not re-verify the lease beyond using the supplied `tx`.

### 5.3 AccessControl (AD-9)

**Pairs are never an input to `resolveAudiences` (AD-17).** mentorship only
*consumes* the facade.

| Surface | Facade calls | Rule |
| --- | --- | --- |
| **Mentee-scoping** (FR-M5, men-pair-02) | `resolveAudiences(assignerId, [menteeUserId])` | reject unless the set contains `self`/`reporting`/`project`/`pp` (non-empty, not colleague-only). Hidden or missing mentee → `404` (PM/AD-24). Visible mentee outside assigner scope → `403`. |
| **Create-pair gate** (§2.2 dual gate) | `isAllowed(actorId, 'mentorship:assign')` **and** mentee-scoping above | `mentorship:assign` is **unseeded** — Decision 1 |
| **End-pair gate** (§2.2 dual gate) | `isAllowed(actorId, 'mentorship:assign')` **and** `resolveAudiences(actorId, [menteeUserId])` ∩ `{reporting, pp}` ≠ ∅ | §4.11 "a manager or PP"; DEC-UM-001 S9 pattern (reporting line + PP write; project line read-only). Decision 7 |
| **S13 base read** (the inline summary, `GET /mentorship-pairs[/:id]` row visibility) | `canAccessSection(viewerId, 'S13', menteeUserId)` — **does not exist** (ACM-5 = S1/S10/S11 only) | Decision 3. Interim: derive from `resolveAudiences` ∩ `{reporting, project, pp, self}`; colleague/empty → `404`. Marked `// INTERIM` with the expiry trigger |
| **Closure-note projection** (FR-M10, men-end-03/04) | `resolveAudiences(viewerId, [menteeUserId])` | include `closureNote` **only** when the set ∩ `{reporting, project, pp}` ≠ ∅. Self / mentor / mentee / colleague → key **absent** (not `null`). Pure narrowing of the S13 base decision — never widens, reads no policy tables. Holds under both the interim and the real `canAccessSection('S13')` |
| **Pool** (FR-M4, men-pool-01/03) | `isAllowed(viewerId, 'mentorship:assign')` only | no target, no S13. Rows: S1 identity + `openToMentoring` and nothing else (men-pool-02 leak check) |
| **`GET /mentorship-pairs` list** | `resolveAudiences(viewerId, [all participant ids])` bulk | §3.3.1 list projection — a row is included only if the viewer has S13 base over a participant; `closureNote` narrowed per row |

`canAccessSection` returns only the base section decision — the closure-note
narrowing is mentorship's **projection contract** (`access-control.md`: "an
approved owning-context projection contract calls this facade and may only
narrow its result").

### 5.4 The S1 `mentor` field and the S13 inline summary on `GET /users/:id`

`user-management` (profile HTTP assembly per PM/AD-34; no separate `profile` context) consumes
two exported read models; it **never** reaches into `mentorship/domain/` or
`infrastructure/` (AD-2 entry-point rule):

```ts
// mentorship application exports, consumed by user-management's profile assembler
GetActiveMentorQuery.for(targetUserId: string)
  : Promise<{ mentorUserId: string } | null>;
//   the S1 identity-card "mentor" field (FR-M16). user-management gates S1 itself;
//   this only supplies the value, exactly like manager/PP are S1-derived fields.

GetS13MentorshipSummaryQuery.for(viewerId: string, targetUserId: string)
  : Promise<{
      openToMentoring: boolean;
      status: 'mentor' | 'open_to_mentoring' | null;
      mentor: { userId: string } | null;
      mentees: Array<{ userId: string }>;
      pairs: Array<{
        id: string; mentorUserId: string; menteeUserId: string;
        status: 'active' | 'ended';
        startedAt: string; endedAt: string | null;
        closureNote?: string;          // present only per the FR-M10 narrowing
        systemClosed: boolean;
      }>;
    } | null>;                         // null when the viewer has no S13 base access
```

- `GetS13MentorshipSummaryQuery` applies the S13 base gate **and** the
  closure-note narrowing internally (§5.3) — the assembler just inlines the
  non-null result under an `s13` / `mentorship` key.
- `GetActiveMentorQuery` takes no `viewerId` — the mentor identity is an S1
  field and S1 entitlement is the assembler's existing job (men-view-03: absent,
  not `null`, when there is no mentor).
- Wiring: `user-management/infrastructure/` owns a `MentorshipReadPort` +
  adapter that injects these exported queries **forwards** across the boundary
  (the same pattern the AccessControl-adoption adapter uses,
  `um-integration-contract-response.md` Q2). The port is held by a
  `user-management/domain/services/` class; the assembler action calls that
  service.

---

## 6. Fail-closed rules & invariants

| Invariant | Enforcement |
| --- | --- |
| Mentee outside the assigner's access scope → no pair | `CreateMentorshipPairAction` rejects (`403`) before any write (FR-M5, men-pair-02) |
| Manual end without a closure note → rejected, pair stays `active` | `EndMentorshipPairAction` app invariant (`422`/`400`) **and** the DB `CHECK` (men-end-02) |
| Self-pairing | `CHECK (mentorUserId <> menteeUserId)` |
| An ended pair is noteless | DB `CHECK` — an `ended` row always has a non-null `closureNote` (manual note or system template) |
| Status transitions | only `active → ended`; no un-end; no `PATCH` on a pair |
| Ended pairs immutable in history, retained on both profiles | no delete path; `(mentorUserId,status)` + `(menteeUserId,status)` reads (FR-M12, men-end-08) |
| Availability flag independent of pairs | separate aggregate, separate table, separate action; `SetMentorshipAvailabilityAction` never reads `MentorshipPair` (AD-17, men-flag-03) |
| No audience derived from a pair | mentorship never passes pair data to `resolveAudiences`; the facade never reads `MentorshipPair` (AD-17) |
| Pool never exposes S13 | `GET /mentorship-pool` rows are S1 + `openToMentoring` only; assigned-mentee / pairs / closure-note keys absent (FR-M4, men-pool-02) |
| Departure auto-close is idempotent | the `status='active'` UPDATE predicate + `endedByDepartureId` + per-event idempotency key (AD-20, men-dep-01) |
| Missing availability row | treated as `false` — never in the pool (fail-closed) |
| Colleague / empty audience over the mentee | `GET /mentorship-pairs/:id` → `404` leak-free (S13 Colleague cell is `—`; men-end-04 test 3) |

---

## 7. Migrations / deploy order

Additive schema, no production data migration (the seeded population is the only
data — NFR-M1):

1. `MentorshipPair` and `MentorshipAvailability` tables + their indexes and
   `CHECK` constraints land in **one additive migration** (AD-21 "additive
   migrations before enabling workers").
2. `endedByDepartureId` is a **plain nullable `uuid` with no DB FK** — the
   migration therefore does **not** depend on the `Departure` table (CC-06)
   existing. This is the accepted `Policies.targetId` trade-off (AD-11): a
   dangling id fails closed (it is only ever read back by the executor that
   wrote it).
3. There is **no mentorship worker** — the only executor path is the shared
   AD-20 departure executor (`user-management`). So the only ordering constraint
   is: the tables land before any mentorship route or the executor seam is
   enabled.
4. If Decision 1 option (a) is taken, the `mentorship:assign` permission row +
   grant land through the **Access Control kernel seed** sequence (ACM-0/ACM-1
   deploy-time entrypoint rule), not a mentorship migration.

---

## 8. Decision register / Open decisions

Recommendations are the architect's; **(P)** = Product Owner call, **(AC)** =
Access Control call, **(A)** = architecture-internal.

| # | Decision | Options / recommendation | Owner |
| --- | --- | --- | --- |
| **1** | **`mentorship:assign` FR permission is unseeded** (kernel catalog = `user-management:create/deactivate/list`). Same class as the missing `user-management:edit` gap (alignment proposal §7 (i)). | **(a) [recommended]** Access Control adds `mentorship:assign` to the bootstrap catalog + grant via a **new three-stage AD-1 kernel-seed sequence** (ACM-0/ACM-1 deploy-time entrypoint rule); mentorship consumes `isAllowed(actorId, 'mentorship:assign')`. **(b)** interim `// INTERIM` rule in mentorship with the expiry trigger "replace when `mentorship:assign` is seeded." **Not defaulted.** | **P + AC** |
| **2** | **Who holds `mentorship:assign` by default** (OQ-M2; requirements ~line 131 PO-confirm item). | The *permission key* is Decision 1(a); the *default role assignment* is a PO call, not architecture. | **P** |
| **3** | **S13 `canAccessSection` support** — ACM-5 ships S1/S10/S11 only. | **(a) [recommended]** a new Access Control increment adds `'S13'` (same class as the S9 career-timeline gap; tracked in `_bmad-output/implementation-artifacts/access-control/deferred-work.md`); mentorship's S13 base gate consumes it; the closure-note narrowing stays mentorship-owned via `resolveAudiences`. **(b)** interim narrowing rule in mentorship (`resolveAudiences` ∩ the S13 audience set) with a recorded expiry trigger. | **AC** |
| **4** | **Recurring pair after ending** — spec silent. | Recommend: allow a fresh pair for the same (mentor, mentee) after the prior one ends; bar a second **active** pair via partial `UNIQUE (mentorUserId, menteeUserId) WHERE status='active'`. | **P** |
| **5** | **One active mentor per mentee** — §3.2 S1 / §4.11 self-service say "the mentor" (singular); not explicitly a rule. | Recommend: partial `UNIQUE (menteeUserId) WHERE status='active'`. | **P** |
| **6** | **Career event on both participants' timelines vs mentee-only** — §4.9 ambiguous; men-pair-04 asserts mentee only. | Recommend: **both** (the pairing is a development event for both parties). | **P** |
| **7** | **End-pair authorization audience** — §4.11 "a manager or PP". | Recommend: reporting line + PP **write**; project line **read-only** (DEC-UM-001 S9 pattern). | **P + AC** |
| **8** | **`MentorshipPair.closedByUserId`** — the current `database-schema.md` shape has `closedBy FK → User, nullable`; no scenario consumes it. | Recommend: **drop** ([[feedback_no_speculative_fields]]); re-add only if a pair-history "ended by" display is sourced. | **A** |
| **9** | **Directory read contract** — bulk `application/` export vs a mentorship-owned SQL view. | Recommend: **bulk export** (boundary-clean, matches the `resolveAudiences` bulk precedent). Revisit only if the §7 500-record / 2-second budget fails with the extra bulk call. | **A** |
| **10** | **Departure executor contract fields** | **Resolved by PM/AD-23.** Binding signature is `{departureId, leaseToken, departingUserId, effectiveDate, tx}`. Remaining work is implementation under CC-06 (not redesign). Historical note that `domain-driven-design.md` showed a three-field call is stale. | **A (closed design)** |

---

## 9. Traceability

| Source rule | Landing |
| --- | --- |
| §4.11 self-service (flag, own mentor, own mentees) | §2.2, §4, §5.4; FR-M1/M2/M3 |
| §4.11 company-wide pool, S1 + flag only, permission-gated | §3 (`GET /mentorship-pool`), §5.3; FR-M4 |
| §4.11 scoped mentee selection | §5.3 mentee-scoping; FR-M5 |
| §4.11 first-pair status transition; status is a directory field | §2.3 (derived); FR-M6/M15 |
| §4.11 all-pairs view (active + ended) | §3 (`GET /mentorship-pairs`); FR-M8 |
| §4.11 mandatory closure note on the pair record | §2.1 `CHECK` + `EndMentorshipPairAction`; FR-M9 |
| §4.11 closure-note visibility (reporting + project + PP only) | §5.3 closure-note projection; `access-control.md` matrix-exception row; FR-M10 |
| §4.11 ended pairs on both profiles | §2.1 indexes, §6; FR-M12 |
| §4.11 status roll-back unless flag cleared | §2.3; FR-M13 |
| §4.11 mentor in the profile header | §5.4 `GetActiveMentorQuery`; FR-M16 |
| §4.9 mentorship pair start/end are tracked events | §5.1; FR-M7/M11 |
| §4.16 departure auto-close bypasses the note gate | §5.2; FR-M14 |
| §4.1 mentorship status is a filterable directory field | §2.3 directory read contract; FR-M15 |
| §3.2 S13 inline contents | §5.4 `GetS13MentorshipSummaryQuery`; FR-M17 |
| §3.2 S1 "mentor" identity-card field | §5.4; FR-M16 |
| AD-5 | §1 |
| AD-11 (durable record; same-transaction career event) | §2.1, §5.1 |
| AD-14 (router shapes) | §3 |
| AD-17 (verbatim invariant) | §2, §5.3, §6 |
| AD-20 (executor-driven, shared UoW) | §5.2 |
| PRD FR-32/33/34 (`prd-people-management-2026-08-24` §4.12) | the whole context |

**Contradiction check:** none found against §4.11, the PRD decomposition
(`prd-mentorship-2026-09-01`), the epics, or the spine. The three provisional
scenario-draft routes are *fixed* (not contradicted) by §3; the scenario files
are unapproved drafts and update at stage-1 approval.
