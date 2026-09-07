# Dashboards (PM/AD-33)

**Status: design approved 2026-09-02. No generic widget/dashboard framework in v1.5.**

## Binding rule

The `dashboards` context composes four **fixed** read models — UM, DM, PM, PP — from owning-context application queries. AccessControl resolves authorized target ids **before** any aggregation. A dashboard never widens section access. *View a given dashboard* remains an independently grantable functional permission (§2.3).

This is one composer, not four unrelated apps, and not a shareable widget engine.

## Fixed facts (AD-18)

These are settled **product** decisions from `docs/project-requirements.md` v1.5. They constrain any
future engine design; none of them is an implementation, a schema or a widget spec. Each product
fact cites the `project-requirements.md` v1.5 section it comes from.

### Risk counters and trend display

- **"Active" risk excludes `low`.** Active means any level above `low` in the fixed ascending order
  `low` < `need attention` < `medium` < `high` < `leaver`. A person sitting at `low` is not counted
  in the active-risk counters on any dashboard. (§4.6; §4.4.1)
- **Trend arrow is relative to the previous risk record.** Show an up or down arrow when the current
  level differs from the immediately preceding record; show **no arrow** when the level is unchanged
  or when this is the first record. `project-requirements.md` v1.5 places this arrow on the UM people
  table (§4.4.1) and the Risk Dashboard table (§4.6); wherever else a dashboard shows a person's risk
  level and trend, the same rule holds. (§4.6; §4.4.1)
- **`leaver` (risk level) and `dismissed` (employment status) are never the same fact.** `leaver` is
  a prediction about someone still working; `dismissed` is the fact of having left. A dashboard
  counter, table, filter, report or query must never conflate them — a phrase like "N leavers" must
  resolve to exactly one of the two. (§4.6; §4.16)
- Risks have **no closed or terminal state**; the current level is the most recent record and may
  move to any level, including back down to `low`, at which point the person drops out of the active
  counters. (§4.6)
- Departure counts (`dismissed`) derive from **employment status only** — the single source for the
  analytics departures figure, exclusion from the default employee list, and dashboard counters. A
  dashboard never computes its own departure definition. (§4.16)

### Resourcing counters and the Unassigned bucket

- **Unassigned is a first-class bucket.** A resourcing request with no project reference is a normal
  state. It appears in an explicit **Unassigned** bucket that behaves like any other group in the
  DM/PM project selector and is included in the all-projects counters, so the counters always
  reconcile to every request the DM actually created. (§4.4.2; §4.7)
- **DM/PM counter scope and the project selector.** Counters (people, active risks by level, open
  resourcing requests) span **all** of the viewer's projects by default. The project selector
  defaults to *All projects*; selecting one project filters the whole page and recomputes every
  counter for that project alone; clearing the selection returns to the all-projects view. The PM
  dashboard is the same model scoped to the PM's own projects. (§4.4.2; §4.4.3)
- A DM's resourcing view also includes requests created by the PMs of their projects. (§4.4.2; §4.7)
- **PP dashboard has no resourcing block** — and therefore no Unassigned bucket and no resourcing
  counters. It is scoped to the PP's assigned people, groupable by department or project. (§4.4.4)

### Engine/widget model — TBD

- v1.5 adds **no** generic widget or dashboard framework. The four dashboards (UM, DM, PM, PP) are
  fixed read models that share components and differ only in grouping and in which functional blocks
  appear (§4.4). *View a given dashboard* is an independently grantable functional permission (§2.3).
- No aggregation engine, schema, widget contract or dashboard-definition format is specified. See
  **Implementation** below — it remains deliberately absent.

## Implementation

Absent. Do not introduce a generic dashboard framework while this AD stands.
