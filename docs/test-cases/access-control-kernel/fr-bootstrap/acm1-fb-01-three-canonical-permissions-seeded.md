# ACM1-FB-01 · A fresh database seeds exactly the six canonical permission rows

> ### Amended 2026-09-06 — PLAT-E4-S4.2a, the root-operator permission set
>
> **The canonical ACM-1 `hr-admin` set grows from three keys to six.** Approved
> at the AD-1 Stage-1 gate for
> [`spec-4-2a-root-operator-permission-set.md`](../../../../_bmad-output/implementation-artifacts/platform/spec-4-2a-root-operator-permission-set.md)
> (Story 4.2 scope item 2, [`story-4-2-default-org-relationship-seed.md`](../../../../_bmad-output/implementation-artifacts/platform/story-4-2-default-org-relationship-seed.md)).
> Ask First AF-1..AF-5 were resolved 2026-09-06; **AF-2 was decided by Dmytro
> Novyk, Product Owner**. This blockquote is the record every other amended
> `fr-bootstrap` file points at.
>
> **The six canonical keys, and the live gate that reads each one** — a key
> enters the set only with a named live consumer, cited at `file:line` read at
> `services/backend` HEAD `ef03c88`:
>
> | Key | Live consumer |
> |---|---|
> | `user-management:create` | `users.controller.ts:58` `IMPORT_POPULATION_FEATURE`, declared on `POST /users/import` at `:139` |
> | `user-management:deactivate` | `users.controller.ts:64` `DEACTIVATE_USER_FEATURE`, declared on `DELETE /users/:id` at `:260` |
> | `user-management:list` | `users.controller.ts:65` `LIST_USERS_FEATURE`, declared on `GET /users` at `:106` |
> | `org:relationships:write` | `relationships.controller.ts:46`, declared at `:65`, `:100`, `:113`, `:126`, `:140`, `:153`; `departments.controller.ts:33`, declared at `:47`, `:59`; and the in-action read gate `org-relationships-read-access-facade.adapter.ts:20`, consumed at `:48` |
> | `employee:departure:record` | `departures.controller.ts:38` `RECORD_A_DEPARTURE_FEATURE`, declared at `:52`, `:68`, `:83`, `:96` |
> | `profile:timeline:write` | `career-timeline-access-facade.adapter.ts:22` `TIMELINE_WRITE_PERMISSION`, consumed at `:57` (`canReadTimeline`'s "edit implies read" fallback) and `:75` (`canEditTimeline`) |
>
> **This Stage-1 approval is the recorded PO confirmation that
> [`access-control.md` line 11](../../../architecture/access-control.md)
> requires** — *"do not hard-code defaults until that confirmation is
> recorded"* — for the three added keys, each named above with the gate that
> reads it. Without that sentence this amendment would read as a violation of
> line 11 rather than as its satisfaction.
>
> **AF-3 — the added keys use the `user-management:*` / `org:*` / `employee:*` /
> `profile:*` names the live gates check today.** The `directory:*` rename
> proposed in `fr-permission-matrix-draft-2026-09-02.md` is `status: draft`,
> PO-unconfirmed, and out of scope here; seeding it would grant keys that no
> gate reads.
>
> ### AF-2 — `profile:timeline:write` is in the set, and that is a known accepted deviation
>
> The Product Owner ruled on 2026-09-06 that `profile:timeline:write` **is**
> included in the canonical `hr-admin` set. This **overrides the 4.2a spec's own
> recommendation to exclude it**, and the consequence is recorded here rather
> than softened:
>
> `canEditTimeline` discards its target
> (`career-timeline-access-facade.adapter.ts` — `void targetUserId`, then
> `isAllowed(viewerId, TIMELINE_WRITE_PERMISSION)` alone at `:75`). Granting
> `profile:timeline:write` to the canonical `hr-admin` role therefore gives
> **every present and future holder of that role org-wide write access to every
> employee's career timeline, with no relationship to the target required.**
>
> This is a functional role widening data access, which
> [`access-control.md` line 19](../../../architecture/access-control.md) and
> [`docs/project-requirements.md` §2](../../../project-requirements.md) mark
> **NORMATIVE** against. It is being seeded **deliberately**, by a dated PO
> ruling, with the trade-off understood: the alternative leaves the manual
> timeline-write route closed to everyone on a clean production install.
>
> It is therefore a **known, accepted deviation from a NORMATIVE invariant in
> permanent production configuration** — not an oversight, and not something a
> later reviewer should silently "fix". It stops being a deviation when
> `canEditTimeline` gains its audience half (the deferred DEC-UM-001 narrowing
> to assigned PP + direct Unit Manager), at which point this grant becomes
> legitimate. The deviation must be raised in the AF-4 architect pass and
> registered as a blocker entry there if that pass agrees. The deviation's
> observable behaviour is asserted, deliberately, by
> [`S4.2a-OP-06`](../../user-management/access-control-adoption/s42a-op-06-delegated-hr-admin-timeline-write-accepted-deviation.md).
>
> ### AF-4 — the ratified architecture text is NOT amended here, and contradicts this file
>
> This increment changes code and seed data only. Recorded as known and dated,
> 2026-09-06: the following architect-owned records still say the canonical set
> is *exactly three* keys, and will **contradict shipped behaviour** until a
> separate architect pass runs. They are deliberately left unedited — do not
> read this file as agreeing with them, and do not quietly edit them:
>
> - [`database-schema.md` § Permissions](../../../architecture/database-schema.md)
>   — *"**MVP reduction:** the deploy-time permission catalog ... contains
>   exactly:"* followed by the three keys.
> - ...same file, § Kernel MVP seed contract — *"exactly the three permission
>   rows above, exactly one `hr-admin` FR policy, exactly its three
>   `PolicyPermissions` grants..."*
> - `fr-architecture-amendment.md` — *"1. Exactly the three permission keys
>   above."* (dated record)
> - `spec-access-control-kernel-mvp/SPEC.md` — *"ACM-1 ensures the three
>   permissions, one FR policy, three grants, and one attachment."* (dated
>   record)
>
> Every **Trace** line in this folder that quotes one of those four sentences
> quotes it **verbatim and unchanged**, because the source is unchanged. The
> quote is the historical record; the Scenario and Test sections below it are
> the shipped contract, and where they disagree the disagreement is this note.
>
> ### Counts this amendment moves
>
> | Assertion | Was | Now |
> |---|---|---|
> | `Permissions` after a fresh bootstrap | 3 | **6** |
> | `PolicyPermissions` after a fresh bootstrap | 3 | **6** |
> | `Policies` (`type='FR'`) | 1 | 1 — unchanged |
> | `UserPolicies` | 1 | 1 — unchanged |
> | `AccessControlBootstrap` | 1 | 1 — unchanged |
>
> Nothing about how the bootstrap behaves changes: the FR row shape, the
> advisory lock, `locateRoot`, the singleton, the adoption rules and the
> "restore missing, preserve extra" drift dispositions are all untouched. Only
> the **size of the canonical set** moves.
>
> **Filenames are unchanged on purpose.** `acm1-fb-01-three-canonical-...`,
> `acm1-fb-03-role-granted-exactly-three-...` and
> `acm1r-fb-28-fourth-permission-...` still encode the retired count. Scenario
> slugs are stable workboard ids and are never renumbered; the project
> precedent is to keep the slug and correct the content.

**Trace:**

- SPEC [CAP-3](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — "the three permissions" is item 1 of the seed contract: "ACM-1 ensures the three permissions, one FR policy, three grants, and one attachment."
- FR-AMD-1 [Seed Contract](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — "seed atomically and idempotently: 1. Exactly the three permission keys above."
- FR-AMD-1 Fixed Kernel Inputs — "The kernel seeds exactly three canonical permission keys: `user-management:create`, `user-management:deactivate`, and `user-management:list`."
- [database-schema.md § Permissions](../../../architecture/database-schema.md) — "**MVP reduction:** the deploy-time permission catalog is seed/migration-owned, has no HTTP mutation surface, and contains exactly" the three keys above.
- [testing-strategy.md § Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp) — "ACM-0 sits inside the same boundary but has no facade call to make: its subject is the deploy-time root User step, so its Stage-2 evidence runs against migrated PostgreSQL directly." ACM-1's bootstrap step is the same shape: no facade call, direct database evidence.
- **U-19 normative coverage:** Weak/partial evidence for `TR-2.3-04` (v1.5 §2.3 — HR Admin default starting-role permission assignments) — this file records the default `hr-admin` permission set and the PO ruling (AF-2) approving it, but is seed-time evidence only, not the configuration-review/UI mechanism the row otherwise implies. See `test-design-qa.md` § Normative coverage map.

## Scenario

**Given** a freshly migrated Access Control schema with an empty `Permissions`
table, and the deploy-time root User step (CAP-8/ACM-0) has already created
and validated exactly one active User whose normalized `workEmail` equals
normalized `ROOT_WORK_EMAIL`.

**When** `npm run db:bootstrap:access-control` runs to completion.

**Then** `Permissions` holds exactly six rows, and their `key` values are
exactly `{user-management:create, user-management:deactivate,
user-management:list, org:relationships:write, employee:departure:record,
profile:timeline:write}` — no more, no fewer, no other key. Each row's `id` is a
freshly assigned uuidv7; no permission id is hardcoded by the seed.

The three added keys are the **root-operator half** of the set: without them a
fresh production deployment comes up with a root who can list, import and
deactivate and cannot wire a single manager edge, record a single departure, or
write a single timeline entry. `profile:timeline:write` is in the set by the
AF-2 ruling above and carries the accepted NORMATIVE deviation recorded there;
the other two are pure feature keys with no data-audience consequence.

**No section-access key enters the set.** `profile:identity:write` is supplied
per-person to every active employee by `DEFAULT_PERMISSIONS` (4.1a) and is not
seeded here; `profile:leave:*`, `profile:projects:*`,
`profile:personal-contacts:*`, `profile:emergency-contacts:*` and
`profile:documents:*` are read-only for the reporting-line audience by
deliberate privacy design and belong in no functional role. The retired
`user-management:edit` key is **not** re-added: 4.1c moved `PATCH /users/:id`
onto `@RequireSectionAccess('profile:identity','write')` and 4.1d deleted
`canEditS1`, so the key is inert and seeding it would put a known-dead key into
an append-only production catalog.

**Preconditions:** freshly migrated database (post-`db:deploy`); `Permissions`
empty; the CAP-8 root User exists and is active. This story treats the CAP-8
root User as an already-satisfied precondition, not as ACM-1 work.

## Test — bootstrap seeds the permission catalog

- **entrypoint:** `npm run db:bootstrap:access-control` (invokes
  `access-control-bootstrap.ts`)
- **preconditionState:** `SELECT count(*) FROM "Permissions"` → `0`
- **expectedDatabaseState:**
  ```sql
  SELECT key FROM "Permissions" ORDER BY key;
  -- 'employee:departure:record'
  -- 'org:relationships:write'
  -- 'profile:timeline:write'
  -- 'user-management:create'
  -- 'user-management:deactivate'
  -- 'user-management:list'
  SELECT count(*) FROM "Permissions"; -- 6
  ```
  No seventh row, no missing row, no key outside the canonical six.
