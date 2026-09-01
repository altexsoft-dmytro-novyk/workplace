# MEN-VIEW-02 · All-pairs view lists active and ended pairs with dates and status

**Trace:** §4.11 ("A view of all mentor–mentee pairs, active and ended, with start date, end date and status.") · §3.2 S13 · PRD FR-M8 · epics.md Story 1.5 · AD-14 (`GET /mentorship-pairs`)

> Stage-2 blocked on G-CTX. **Unapproved draft** — AD-1 approval required; no
> `approvals.yaml`.

## Scenario

**Given** an active pair (Mona → Alice) and an ended pair (Nina → Colin, closed
with a note).

**When** an entitled viewer (Paula, PP over both mentees — or Root) reads
`GET /mentorship-pairs`.

**Then** the response lists **both** pairs, each with mentor, mentee, start date,
end date (null for the active one), and status.

**Preconditions:** [fixture](../README.md#canonical-personas); one active and one ended pair exist; the viewer is entitled to both.

## Test

- **inputURL:** `GET /mentorship-pairs`
- **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
- **expectedResult:** `200`; the list contains the active Mona → Alice pair (status `active`, `endDate` absent) and the ended Nina → Colin pair (status `ended`, `endDate` set). `?status=active` / `?status=ended` narrow it.
