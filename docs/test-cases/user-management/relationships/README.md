# User Management — `relationships/` (v1.5 Epic 4: Organisational Relationships)

Stage-1 scenario documents (AD-1) for **Epic 4 — Organizational Relationships**:
the four organisational facts that alter access — manager, People Partner,
employee department, department manager. Every change requires the single
dedicated *change organisational relationships* permission, rejects
self-assignment, and writes the §3.4 journal in the same transaction as the fact
change.

**Status:** unapproved draft (v1.5 refresh, 2026-09-01). Files retraced or
authored this pass require fresh per-file human approval; no `approvals.yaml`
records any of them.

## Contents

| File(s) | Story | State | Trace |
| --- | --- | --- | --- |
| `um-rel-01`, `um-rel-02`, `um-rel-03`, `um-rel-08` | 4.1 Change an Employee's Manager | retraced from pre-v1.5; DEC-UM-005 (explicit `DELETE` then `POST`, 2nd `POST` → `409`) still applies; the atomic-journal Then-clause is **stage-2 blocked on CC-07** | FR-10 · DEC-UM-005 · AD-11 · §3.4 |
| `um-rel-07` | 4.1 / 4.2 / 4.3 common | retraced — denial for a session lacking *change organisational relationships* (no-target facade `isAllowed`, never a role-name check) | FR-10 · DEC-UM-002 · §3.3 |
| `um-rel-09`, `um-rel-10`, `um-rel-11` | 4.2 Change an Employee's People Partner | **BLOCKED — CC-04 + CC-07; scenario prose only** (`PUT /users/:id/relationships/people-partner` atomic replace + old→new journal, self-assignment rejected, `409` on stale expected target — AD-19) | FR-10 · AD-19 |
| `um-rel-12`, `um-rel-13`, `um-rel-14` | 4.3 Change Employee Department or Department Manager | **BLOCKED — CC-07 + Department edge contract; scenario prose only** | FR-10 · AD-19 |
| `um-rel-04`, `um-rel-05`, `um-rel-06` | — | **RETIRED (v1.5)** — mentorship pair lifecycle moved to the dedicated **Mentorship** context (AD-17), now planned at `_bmad-output/planning-artifacts/mentorship/epics.md` + `prd-mentorship-2026-09-01/`, with scenarios at **`docs/test-cases/mentorship/`**. `mentorship_start`/`mentorship_end` reach UM only as career events via an application boundary (Epic 3 Story 3.1). Retained as history; superseded header on each. | — |

## Blocked = prose only

CC-04 (PP persistence / cardinality / write contract), CC-07 (AD-19 immutable
relationship/access-journal schema, snapshot payload, reader authorization,
transaction-enrolment), and the Department edge contract (spine Deferred) are all
unapproved. Scenario prose for Stories 4.2 and 4.3 may proceed; **no stage-2 E2E
and no production code** for those stories may be written until their respective
gates are approved. `UserEvents` is not a journal substitute.
