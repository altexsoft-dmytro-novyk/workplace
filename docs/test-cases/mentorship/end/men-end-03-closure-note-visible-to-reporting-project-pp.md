# MEN-END-03 · Closure note is visible to reporting line, project line, and PP

**Trace:** §4.11 ("It is readable by the reporting line, the project line and PP") · PRD FR-M10 · epics.md Story 1.4 · access-control.md §3.3 matrix exceptions (DEC-UM-001 pattern)

> **PROVISIONAL** read shape. Stage-2 blocked on G-CTX + **G-S13** — the
> closure-note restricted projection needs `canAccessSection('S13', …)`, which
> does not exist yet (ACM-5 ships S1/S10/S11 only); this is a pending Access
> Control increment, same class as the career-timeline S9 gap. **Unapproved
> draft** — AD-1 approval required; no `approvals.yaml`.

## Scenario

**Given** an ended pair (Mona → Alice) whose closure note is stored, where Bob is
Alice's direct Unit Manager (reporting line), Carol is Bob's manager (reporting
line, transitive), Pete is the PM of Alice's project (project line), and Paula is
Alice's PP.

**When** each of Bob, Carol, Pete, and Paula reads the pair.

**Then** the closure note **is returned** to all four — the reporting line, the
project line, and PP are the entitled audiences for the note.

**Preconditions:** [fixture](../README.md#canonical-personas); ended Mona → Alice pair with a stored closure note; Bob/Carol reporting line, Pete project line, Paula PP over Alice.

## Test

- **Test 1 — reporting line (direct)**
  - **inputURL:** `GET /mentorship-pairs/<pairId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Bob>" } }`
  - **expectedResult:** `200`; `closureNote` present.
- **Test 2 — reporting line (transitive)**
  - **inputURL:** `GET /mentorship-pairs/<pairId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Carol>" } }`
  - **expectedResult:** `200`; `closureNote` present.
- **Test 3 — project line**
  - **inputURL:** `GET /mentorship-pairs/<pairId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Pete>" } }`
  - **expectedResult:** `200`; `closureNote` present.
- **Test 4 — PP**
  - **inputURL:** `GET /mentorship-pairs/<pairId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Paula>" } }`
  - **expectedResult:** `200`; `closureNote` present.
