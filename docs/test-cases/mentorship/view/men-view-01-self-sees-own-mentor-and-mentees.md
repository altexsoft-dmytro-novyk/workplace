# MEN-VIEW-01 · Self sees own mentor and own mentee(s)

**Trace:** §4.11 (self-service — "See their assigned mentor, if one is assigned. See their assigned mentee(s), if any.") · §3.2 S13 Self `R (pairs)` · PRD FR-M2 · epics.md Story 1.5

> **PROVISIONAL** read shape. Stage-2 blocked on G-CTX + G-S13 (S13 inline
> audience narrowing). **Unapproved draft** — AD-1 approval required; no
> `approvals.yaml`.

## Scenario

**Given** Alice has an assigned mentor (Mona) and no mentees of her own.

**When** Alice reads her own profile.

**Then** the S13 inline summary shows her mentor (Mona), an empty mentee list, and
her own open-to-mentoring flag — this is the Self `R (pairs)` view.

**Preconditions:** [fixture](../README.md#canonical-personas); active Mona → Alice pair; Alice has no mentees.

## Test

- **inputURL:** `GET /users/<aliceId>`
- **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Alice>" } }`
- **expectedResult:** `200`; S13 inline summary shows `mentor: Mona`, `mentees: []`, and `openToMentoring` for Alice; no closure notes.
