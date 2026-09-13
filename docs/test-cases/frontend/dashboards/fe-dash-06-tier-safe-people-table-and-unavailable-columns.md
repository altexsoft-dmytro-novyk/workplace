# FE-DASH-06 · Tier-safe people table projection delegates field visibility and handles uncovered columns via unavailable indicators or omission

**Trace:** `PMC-E2-S2.1` · `PMC-E2-S2.2` · PM/AD-34 · `dashboard-api-contract.md §4, §6.2`

## Scenario

**Given** scoped employee rows assembled via Epic 1's shared row read model.

**When** the people table renders.

**Then** each row displays fields permitted for the viewer's evaluated tier on that target (name, work email, avatar, position, grade, employment type); uncovered columns (`project` PM-FR-37, `leaveStatus` PM-FR-36, `riskLevel` PM-FR-21) either display explicit unavailable indicators OR are omitted entirely from table columns; uncovered columns must **never** appear as silently blank cells or fabricated mock values, and no unpermitted tier fields are fabricated.

## Test

Covered by these cases in `services/frontend/e2e/flows/dashboards/dashboards.spec.ts`:

- renders shared read model fields permitted for reporting tier
- handles uncovered project, leave, and risk columns via explicit unavailable states or column omission
- does not render silently blank cells or fabricated values for missing source capabilities

**Preconditions:** Scoped rows conform to `DashboardPersonRow`. Field leak testing delegates to Epic 1's projection-level negative matrix. Assertions verify column headers and cell rendering, confirming that uncovered columns either display explicit unavailable badges/tags or are omitted from the table, and never render as silently blank empty cells.
