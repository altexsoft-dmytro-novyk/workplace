---
title: 'Story 4.1: HR Admin Assigns or Revokes Reports-To — SUPERSEDED'
type: 'superseded-pointer'
status: superseded
superseded: 2026-09-01
superseded_by: ./spec-4-1-change-an-employee-s-manager.md
---

# SUPERSEDED — see `spec-4-1-change-an-employee-s-manager.md`

v1.5 reframes this as **"Change an Employee's Manager"**, one of the four
organisational-relationship operations on a dedicated screen (§2.1). The gate is
the `change organisational relationships` permission (not "HR Admin"),
self-assignment is rejected, and the change is **journaled atomically** — the
journal-writing stage is blocked on **CC-07** (AD-19 Journal gate). DEC-UM-005
(explicit `DELETE` then `POST`; second `POST` → `409`) still applies.
Regenerated 2026-09-01 from `epics.md` v1.5. `baseline_commit 6254ed50…` is
stale.
