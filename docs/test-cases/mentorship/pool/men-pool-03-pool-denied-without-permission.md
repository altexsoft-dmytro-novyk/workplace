# MEN-POOL-03 · Pool read denied without *assign and end mentorships*

**Trace:** §4.11 ("Visible to holders of the *assign and end mentorships* permission.") · §2.3 · access-control.md denial conventions · PRD FR-M4 · epics.md Story 1.2

> **PROVISIONAL ROUTE** (`GET /willing-mentors`). Stage-2 blocked on
> G-CTX + G-PERM. **Unapproved draft** — AD-1 approval required; no
> `approvals.yaml`. Negative case, first-class.

## Scenario

**Given** Ida holds a custom functional role whose only permission is unrelated
(*create form campaigns*), and no mentorship permission.

**When** Ida requests the willing-mentor pool.

**Then** the response is `403` — the no-target `isAllowed(actorId, <assign and end
mentorships key>)` gate fails. No role-name or `User.position` check is used.

**Preconditions:** [fixture](../README.md#canonical-personas); Ida holds no *assign and end mentorships* permission.

## Test

- **inputURL:** `GET /willing-mentors`
- **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Ida>" } }`
- **expectedResult:** `403`; leak-free body; no pool data.
