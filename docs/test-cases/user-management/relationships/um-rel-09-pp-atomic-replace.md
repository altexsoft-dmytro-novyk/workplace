# UM-REL-09 · Change an employee's People Partner (atomic replace + journal)

**Trace:** epics.md Story 4.2 (Change an Employee's People Partner) · PRD FR-10 · access-control.md §3.3 (PP replacement is the fixed-cardinality atomic command, AD-19) · api-conventions.md shape 4 (`PUT /users/:id/relationships/people-partner`) · DEC-UM-002

> **BLOCKED — CC-04 + CC-07; scenario prose only.** CC-04 owns PP persistence,
> cardinality, and the write contract; CC-07 owns the immutable before/after
> journal (AD-19 Journal gate). This file is stage-1 prose only — **not
> translatable to a stage-2 E2E or production code** until both are approved.
> `UserEvents` is not a journal substitute. The facade *reading* `Relationship
> type='people_partner'` to resolve the PP audience is not blocked (that is
> Epic 0's concern).

## Scenario

**Given** Alice's assigned People Partner is Paula (`Relationship
type='people_partner'`, Alice → Paula), and Root holds the *change organisational
relationships* permission.

**When** Root submits `PUT /users/<aliceId>/relationships/people-partner` with
`{ targetId: <ninaId>, expectedCurrentTargetId: <paulaId> }` from the dedicated
organisational-relationship screen.

**Then** the fixed-cardinality PP edge is atomically replaced: Paula's
directly-assigned-PP access to Alice ends and Nina's begins **on the next
request** (§2.1 revocation timing — platform-owned); and one before/after journal
record — actor `Root`, subject `Alice`, `before: Paula`, `after: Nina`, timestamp
— commits in the **same transaction** as the edge replacement (§3.4, AD-19).
Transitive PP HR-line propagation above Nina stays fail-closed to the directly
assigned PP until the Department contract identifies the HR root (AD-19
Department-boundary gate).

**Preconditions:** [fixture](../README.md#canonical-personas); Alice → Paula `people_partner` edge exists; Nina is an eligible active PP; Root holds *change organisational relationships*.

## Test

- **Test 1 — baseline: Paula is the assigned PP** *(observe via the Epic 0 PP read path once available, or the CC-04 read contract)*
  - **stateChange:** Alice → Paula `people_partner` edge is the current assignment.
- **Test 2 — the atomic replace**
  - **inputURL:** `PUT /users/<aliceId>/relationships/people-partner`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" }, "body": { "targetId": "<ninaId>", "expectedCurrentTargetId": "<paulaId>" } }`
  - **expectedResult:** `200`; body reflects the new PP assignment. **(BLOCKED: exact status/body owned by CC-04.)**
- **Test 3 — observing the change**
  - the assigned PP resolves to Nina, not Paula, on the next request; one before/after journal record exists. **(BLOCKED: journal reader owned by CC-07.)**
