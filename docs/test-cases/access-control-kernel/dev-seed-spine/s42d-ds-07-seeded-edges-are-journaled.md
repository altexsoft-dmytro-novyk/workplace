# S4.2d-DS-07 · Every edge `db:dev:seed-org` writes carries exactly one `AccessJournal` row, in the same transaction

> **New Stage-1 scenario, PLAT-E4-S4.2d follow-up (2026-09-12).** This scenario records the
> decision that supersedes `spec-4-2d` Ask First **AF-3**. Anna Pikula, acting as PO and
> Architect, **declined** the development-fixture exception on 2026-09-12. A seeded
> `direct` edge is still a change to a person's manager under
> `docs/project-requirements.md` §2.1 ("Every change is journaled per 3.4") and §3.4, and
> PM/AD-29 requires the journal row in the same transaction as the fact write. The seed
> therefore journals exactly as `OrgRelationshipRepository.assignManager` does.
> **Expected RED at Stage 2**: the script as delivered in `de508c9` writes no journal row.

**Trace:**

- Decision: `_bmad-output/planning-artifacts/platform/epics.md` `## Epic 4`, Story 4.2,
  "Development-fixture journal exception — DECLINED 2026-09-12"; supersedes
  `spec-4-2d-dev-seed-spine.md` AF-3.
- `docs/project-requirements.md` §2.1 ("Every change is journaled per 3.4") and §3.4;
  PM spine AD-29 ("Mutations that change those facts must emit the journal entry in the same
  transaction as the org-fact write").
- The write pattern to match: `services/backend/src/user-management/infrastructure/org-relationship.repository.ts`
  `assignManager`:
  - `kind: 'manager'`, `before: NULL`;
  - `after` is a `ManagerEdgeSnapshot` `{ relationshipId, userId, type: 'direct', reportsToUserId }`;
  - the key is `accessJournalIdempotencyKey(actor, subject, 'manager', relationshipId, 'create')`;
  - the edge and journal row are written in one transaction, with `skipDuplicates`.
- Actor precedent for a seed-written fact: `access-control-bootstrap.ts` `seedFullProfileGrantIfNone`
  journals the bootstrap grant with root as the actor. `AccessJournal.actorUserId` is `NOT NULL`.
- Test plan: `_bmad-output/test-artifacts/test-design-epic-platform-4.md` E4-C06 (7), risk R07.

## Scenario

**Given** the seeded-population state of
[`S4.2d-DS-02`](s42d-ds-02-two-level-spine-over-imported-population.md). Its preconditions include
the one administrator-written `betaMember → root` edge created through the real
`POST /users/:id/relationships` route before any spine run.

**When** `npm run db:dev:seed-org` runs three times:

1. first over CSV-1;
2. again with no new import;
3. again after CSV-2 adds `alphaD` and the new department Delta.

**Then:**

- **Run 1.** Each of the seven edges the script wrote (`alphaA`, `alphaB`, `alphaC`, `solo`,
  `betaLead`, `gammaLead`, `gammaMember`) has **exactly one** `access_journal` row. Each row has:
  - `kind = 'manager'`;
  - `actorUserId` = root;
  - `subjectUserId` = the edge's `userId`;
  - `before` = `NULL`;
  - `after` = `{ relationshipId: <edge id>, userId, type: 'direct', reportsToUserId: <edge target> }`.

  The administrator-written `betaMember` edge still has exactly one `manager` row, the one the
  route wrote. The script did not add a second. Across this run's users there are **8** `manager`
  rows.
- **Run 2.** The rerun writes no edge, so it writes **zero** journal rows. The run's `manager`
  rows are byte-identical to the snapshot taken before the rerun.
- **Run 3.** The three new edges (`alphaD`, `deltaLead`, `deltaMember`) each gain exactly one
  matching `manager` row. Every earlier row is untouched, for a total of **11**.

**Invariant:** every seeded `relationships` row is matched one-to-one by a `manager` journal row
whose `after.relationshipId` is that row's `id`. There is never an edge without its journal row,
and never a journal row without its edge.

## Test 1 — run 1 journals each script-written edge once, with the assignManager shape

- **entrypoint:** `npm run db:dev:seed-org` (run 1)
- **expectedDatabaseState:** the Run 1 expectations above; 8 `manager` rows across the run's users.

## Test 2 — a no-op rerun writes no journal row

- **entrypoint:** `npm run db:dev:seed-org` (run 2)
- **expectedDatabaseState:** the `manager` journal rows for the run's users are identical to the
  pre-rerun snapshot.

## Test 3 — a rerun after a new import journals only the new edges

- **entrypoint:** `npm run db:dev:seed-org` (run 3)
- **expectedDatabaseState:** exactly one matching row each for `alphaD`, `deltaLead`, and
  `deltaMember`; earlier rows are unchanged; total 11.

## Out of scope

- Atomic rollback under a mid-transaction failure is a code-structure property: one `$transaction`
  per edge-plus-journal batch. It is not fault-injected here.
- Import-time `DepartmentMembership` journaling (`db:import:population`) is a separate question and
  is not decided by this scenario.
