# Dashboards — NOT YET DECIDED

**Status: open. Do not build, do not improvise the engine or widget model.**

The dashboard engine design (widget model, per-widget access policies, dashboard sharing/customization) is topic 5 of the architecture discussion and has not been settled with the architect yet.

## What is already fixed (will bind the design)

- **One dashboard engine, not four pages** (§4.4): UM (grouped by people), DM (grouped by project, project selector, counters across all projects), PM (DM dashboard scoped to own projects), PP (same blocks, no resourcing) are configurations of shared components.
- Direction from prior discussion (not yet an AD): dashboards composed of **widgets**, each carrying its own access policy; dashboard visibility per audience (individual / group / link); every dashboard customizable, with the §4.4 four seeded as presets. Widget/dashboard access checks will go through the `AccessControl` facade like everything else ([access-control.md](access-control.md)) — dashboards get no private permission logic.
- *View a given dashboard* is an independently grantable feature permission (§2.3).
- Whatever data a widget shows is bounded by the viewer's computed access tier — a dashboard never widens data access (§2.3).

When the design lands it will be added to the spine as new `AD-n` entries and this file will be rewritten.
