# UM-REL-10 · Assigning yourself as an employee's People Partner is rejected

**Trace:** epics.md Story 4.2 · PRD FR-10 · access-control.md §3.3 ("Every action ... rejects self-assignment") · AD-19

> **BLOCKED — CC-04 + CC-07; scenario prose only.** Not translatable to stage-2
> or production until the PP write contract (CC-04) and the journal schema
> (CC-07) are approved.

## Scenario

**Given** Root holds the *change organisational relationships* permission and is
not currently Alice's People Partner.

**When** Root submits `PUT /users/<aliceId>/relationships/people-partner` with
`{ targetId: <rootId>, expectedCurrentTargetId: <paulaId> }` — naming itself as
the new PP.

**Then** the request is rejected (`400`/`409` per the CC-04 contract), the current
PP assignment (Paula) is unchanged, and **no journal record is written**. Self-
assignment is refused for every organisational fact regardless of the actor's
audience over the target (§3.3).

**Preconditions:** [fixture](../README.md#canonical-personas); Alice → Paula `people_partner` edge exists; Root holds *change organisational relationships*; Root is not Alice's PP.

## Test

- **inputURL:** `PUT /users/<aliceId>/relationships/people-partner`
- **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" }, "body": { "targetId": "<rootId>", "expectedCurrentTargetId": "<paulaId>" } }`
- **expectedResult:** rejected (`400` or `409`); a follow-up PP read still resolves Paula; no before/after journal record was created. **(BLOCKED: exact status owned by CC-04; journal absence owned by CC-07.)**
