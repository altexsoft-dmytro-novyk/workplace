# MEN-DEP-02 · The departure closure note bypasses the mandatory-note gate

**Trace:** §4.16 ("bypassing the mandatory-closure-note gate in 4.11 — a departed person cannot supply one") · §4.11 · PRD FR-M14 · epics.md Story 1.6 · AD-17 ("departure auto-closure stores a system note and bypasses the manual-note gate") · AD-20

> **STAGE-2 BLOCKED on G-DEP (CC-06 / the AD-20 executor).** Scenario prose only.
> **Unapproved draft** — AD-1 approval required; no `approvals.yaml`.
> Contrast with `men-end-02` (manual close with no note → rejected).

## Scenario

**Given** an active pair (Mona → Alice) and a recorded departure for Alice that
reaches its effective date. No human supplies a closure note.

**When** the AD-20 executor system-closes the pair as part of applying Alice's
departure.

**Then** the pair is closed **without** any human-supplied note — the FR-M9
mandatory-note gate is **bypassed** — and the pair carries a **system-generated**
closure note plus the system-closed marker. The manual closure path
(`men-end-02`) would have rejected a note-less close; the departure path does not.

**Preconditions:** [fixture](../README.md#canonical-personas); active Mona → Alice pair; recorded departure for Alice at a passed effective date.

## Test

- **stateChange:** Alice's departure reaches its effective date; the AD-20 executor invokes `mentorship.applyDepartureEffects(...)` in the shared transaction (CC-06).
- **Test 1 — the pair is closed with a system note, no human input**
  - **inputURL:** `GET /mentorship-pairs/<pairId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Bob>" } }`
  - **expectedResult:** `200`; status `ended`, `endDate` set, `closureNote` is the system-generated text, `systemClosed: true`. No `422`/`400` was ever raised for the missing manual note.
