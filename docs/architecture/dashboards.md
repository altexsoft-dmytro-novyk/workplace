# Dashboards (PM/AD-33)

**Status: design approved 2026-09-02. No generic widget/dashboard framework in v1.5.**

## Binding rule

The `dashboards` context composes four **fixed** read models — UM, DM, PM, PP — from owning-context application queries. AccessControl resolves authorized target ids **before** any aggregation. A dashboard never widens section access. *View a given dashboard* remains an independently grantable functional permission (§2.3).

This is one composer, not four unrelated apps, and not a shareable widget engine.

## Fixed facts (AD-18)

- Active risk excludes `low`.
- Unattached resourcing requests appear in `Unassigned` and are included in all-project counters.
- PP dashboard has no resourcing block.
- DM counters span the viewer's projects; PM is the same model scoped to own projects.

## Implementation

Absent. Do not introduce a generic dashboard framework while this AD stands.
