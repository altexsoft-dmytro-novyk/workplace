---
title: 'Story 1.1: HR Admin Registers a New Hire — SUPERSEDED'
type: 'superseded-pointer'
status: superseded
superseded: 2026-09-01
superseded_by: ./spec-1-1-import-seeded-population.md
---

# SUPERSEDED — see `spec-1-1-import-seeded-population.md`

Requirements v1.5 removes employee creation entirely: there is no `POST /users`,
no registration flow, no AD, no SSO (AD-14, AD-16, §4.17). The population is a
**seeded import**. Story 1.1 is now **"Import Seeded Population"** — regenerated
at `spec-1-1-import-seeded-population.md` (compiled 2026-09-01 from
`epics.md` v1.5).

This file is retained only as a pointer. The pre-v1.5 content (a `POST /users`
registration endpoint, `um-reg-01..15` scenarios, `RegisterUserAction`, interim
adapters bound in `app.module.ts`) is retired in the v1.5 brownfield cutover
(AD-21) and must not be resumed. `baseline_commit 8368821…` is stale.
