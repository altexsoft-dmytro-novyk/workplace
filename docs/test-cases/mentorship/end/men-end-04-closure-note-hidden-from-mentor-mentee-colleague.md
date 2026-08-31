# MEN-END-04 · Closure note is hidden from the mentor, the mentee, and colleagues

**Trace:** §4.11 ("not by the mentor, not by the mentee, not by colleagues") · PRD FR-M10 · epics.md Story 1.4 · access-control.md §3.3 matrix exceptions — **narrower than the S13 `RW` cell** (which would otherwise let Self/mentee read it)

> **PROVISIONAL** read shape. Stage-2 blocked on G-CTX + **G-S13**.
> **Unapproved draft** — AD-1 approval required; no `approvals.yaml`.
> Negative case, first-class. One requirement (FR-M10 exclusion), probed from
> three audiences per [../README.md](../../README.md) granularity rule 5.

## Scenario

**Given** an ended pair (Mona → Alice) with a stored closure note.

**When** the note is read by the **mentor** (Mona), the **mentee** (Alice), or a
**colleague** (Colin — no reporting/project/PP relation to Alice).

**Then** the closure note is **not returned** to any of them. The pair itself
(dates, status, participants) may be visible to Self per S13, but the
`closureNote` key is **absent** — this projection is narrower than the S13 `RW`
cell.

**Preconditions:** [fixture](../README.md#canonical-personas); ended Mona → Alice pair with a stored closure note; Colin has no relation to Alice.

## Test

- **Test 1 — the mentee (Self)**
  - **inputURL:** `GET /mentorship-pairs/<pairId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Alice>" } }`
  - **expectedResult:** `200`; the pair is visible (participants, dates, status), `closureNote` key **absent**.
- **Test 2 — the mentor**
  - **inputURL:** `GET /mentorship-pairs/<pairId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Mona>" } }`
  - **expectedResult:** `200`; the pair is visible, `closureNote` key **absent**.
- **Test 3 — a colleague**
  - **inputURL:** `GET /mentorship-pairs/<pairId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Colin>" } }`
  - **expectedResult:** `404` leak-free — a colleague has no S13 access to Alice's pair at all (S13 Colleague cell is `—`).
