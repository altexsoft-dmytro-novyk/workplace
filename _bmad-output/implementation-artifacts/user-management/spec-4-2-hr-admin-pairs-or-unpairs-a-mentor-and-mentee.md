---
title: 'Story 4.2: HR Admin Pairs or Unpairs a Mentor and Mentee — SUPERSEDED'
type: 'superseded-pointer'
status: superseded
superseded: 2026-09-01
superseded_by: ./spec-4-2-change-an-employee-s-people-partner.md
---

# SUPERSEDED — mentorship handed off; slot reused for People Partner

Two separate v1.5 changes land on this file:

1. **Mentorship is retired from User Management** (AD-17): pair/unpair, closure
   notes, the willing pool, availability, and departure auto-close belong to a
   future dedicated **Mentorship** bounded context. User Management receives
   only the resulting `mentorship_start`/`mentorship_end` career events through
   an approved cross-context application boundary. See the "Mentorship Handoff"
   section of `epics.md`.
2. **Epic 4 Story 4.2 is now "Change an Employee's People Partner"** —
   regenerated at `spec-4-2-change-an-employee-s-people-partner.md`. PP is
   `Relationship type='people_partner'` (AD-19), atomic
   `PUT /users/:employeeId/relationships/people-partner`, blocked on **CC-04**
   (persistence/cardinality) **AND CC-07** (journal schema).

`baseline_commit 6254ed50…` is stale.
