# MEN-VIEW-03 · The profile header shows the mentor

**Trace:** §4.11 ("On any profile: the mentor is displayed alongside the manager and the people partner in the profile header.") · §4.2 · §3.2 S1 (identity card includes "mentor") · PRD FR-M16 · epics.md Story 1.5 · UM PRD FR-12/FR-14

> **Architect hand-off:** how the S1 `mentor` field reaches `GET /users/:id`
> without `user-management` reaching into `mentorship`'s domain (AD-2). Stage-2
> blocked on G-CTX. **Unapproved draft** — AD-1 approval required; no
> `approvals.yaml`.

## Scenario

**Given** Alice's assigned mentor is Mona.

**When** any viewer entitled to Alice's S1 identity card reads Alice's profile.

**Then** the profile header shows Mona as the mentor, alongside Alice's manager
(Bob) and people partner (Paula).

**Preconditions:** [fixture](../README.md#canonical-personas); active Mona → Alice pair; viewer has S1 read over Alice.

## Test

- **inputURL:** `GET /users/<aliceId>`
- **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Bob>" } }`
- **expectedResult:** `200`; the S1 identity card / header includes `mentor: Mona` (alongside `manager` and `peoplePartner`). When Alice has no mentor the key is absent, not `null`.
