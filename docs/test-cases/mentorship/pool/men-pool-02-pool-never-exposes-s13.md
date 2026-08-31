# MEN-POOL-02 · The pool never exposes anyone's S13 section

**Trace:** §4.11 ("it does not expose anyone's S13 section") · §3.2 S13 · PRD FR-M4 · epics.md Story 1.2 · NFR-M2

> **PROVISIONAL ROUTE** (`GET /willing-mentors`). Stage-2 blocked on
> G-CTX + G-PERM. **Unapproved draft** — AD-1 approval required; no
> `approvals.yaml`. Leak negative, first-class.

## Scenario

**Given** Mona is a willing mentor who **already has** an active mentee (Alice)
and an ended pair with a closure note.

**When** Bob (holding *assign and end mentorships*) reads the willing-mentor pool.

**Then** Mona's pool entry shows her S1 identity data and the flag **only** — it
does **not** contain her assigned mentees, her ended pairs, or any closure note.
The pool is a mentor-availability list, not an S13 projection.

**Preconditions:** [fixture](../README.md#canonical-personas); Mona has one active pair (Mona → Alice) and one ended pair with a stored closure note; Mona's flag is set.

## Test

- **inputURL:** `GET /willing-mentors`
- **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Bob>" } }`
- **expectedResult:** `200`; Mona's entry carries S1 fields + `openToMentoring: true`;
  keys for assigned mentees, pairs, and closure notes are **absent** (not `null`,
  not empty — absent).
