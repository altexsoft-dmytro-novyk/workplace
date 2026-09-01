# Mentorship — Architect Hand-off

**From:** John (PM) · **Date:** 2026-09-01 · **Status:** hand-off, nothing approved

The requirements decomposition for the `mentorship` bounded context is done
(`prd-mentorship-2026-09-01/prd.md`, `mentorship/epics.md`,
`docs/test-cases/mentorship/`). This note lists the **technical** questions the
architect pass must resolve. The PM did **not** design the aggregate, the schema,
or any endpoint contract — those are yours.

## What the PM decided (behaviour only — do not re-open without a product reason)

- `MentorshipPair` is a **durable workflow record** (AD-17): active + ended pairs
  retained, closure note on the pair, never a `Relationship` row, never an access
  edge, never an audience-resolution input.
- Closure-note visibility (FR-M10) is a **matrix exception** in the DEC-UM-001
  pattern: reporting line + project line + PP only — **not** mentor, mentee, or
  colleague. Narrower than the S13 `RW` cell.
- Career events (`mentorship_start` / `mentorship_end`) are emitted through
  `user-management`'s application boundary **in the same transaction** as the
  pair mutation (AD-11). Mentorship never writes `UserEvents`.
- Departure auto-close is **executor-driven** (AD-20) — the departure executor
  calls this context's exported application service; bypasses the manual-note
  gate with a system note.
- The open-to-mentoring flag is **independent of any pair** (AD-17): true with no
  pair, false with an active pair.

## Technical questions to resolve

1. **Confirm `mentorship` as a `src/mentorship/` bounded context** (AD-5 — it is
   currently "pending context-boundary confirmation") with the standard
   `application/domain/infrastructure` layout.

2. **The `MentorshipPair` aggregate.** Columns, mentor/mentee FKs, indexes for:
   the all-pairs view, "active pairs where person = mentor" (the status query),
   the `?participant=<id>` departure lookup, and both-profiles history. How
   "ended" is represented — a `status` field vs `endDate` presence (pick one,
   don't carry both as independent truth). The **system-closed marker** for
   departure auto-close (FR-M14) vs a manual close.

3. **The open-to-mentoring flag's owning aggregate and endpoint** — the spine
   Deferred open question ("S13 mentorship self-visibility flag's exact endpoint
   … its owning aggregate and endpoint remain unresolved. Do not infer it as a
   relationship patch."). Decide: does it live on a `MentorshipAvailability`
   aggregate in this context? What is the write route (the scenarios use a
   provisional `PUT /users/:id/mentorship-availability`)? How does S13's "own
   flag `RW`" cell map to it, given `canAccessSection` has no `S13` support yet
   (question 6)?

4. **Mentorship status (`open to mentoring` / `mentor`)** — stored or derived
   from (availability fact, active-pair-as-mentor count)? And how does the **All
   Employees directory** (platform scope, §4.1) read it as a filter/column
   without a cross-context domain reach — a mentorship `application/` read
   export, a denormalised projection, or a directory-owned join contract?

5. **The S13 inline "mentor" field on `GET /users/:id`** (S1 identity card,
   §3.2) and the S13 inline summary — served how without `user-management`
   reaching into `mentorship`'s domain (AD-2 entry-point rule)? Define the
   `application/` read export `user-management` (or a profile assembler)
   consumes.

6. **The closure-note restricted projection** needs `canAccessSection('S13',
   viewerId, targetId)`, which **does not exist** — `AccessControlFacade`
   supports `S1` / `S10` / `S11` only (ACM-5). Is closing this a new Access
   Control increment that `mentorship` depends on (recommended — same class as
   the career-timeline S9 gap), or an interim narrowing rule with a recorded
   expiry? The projection must only *narrow* the facade result, never read
   policy tables (`access-control.md`).

7. **Cross-context seams:**
   - The **career-event boundary** (FR-M7 / FR-M11) — the same-transaction
     `application/` operation `user-management` Epic 3 Story 3.1 owns building;
     confirm the call shape mentorship uses (append `mentorship_start` /
     `mentorship_end` in a caller-supplied `tx`).
   - The **AD-20 departure executor** call — this context exposes an
     `applyDepartureEffects({departureId, leaseToken, tx})`-shaped operation per
     `domain-driven-design.md`; it must not open a nested transaction, must use
     a departure-mutation idempotency key, and must no-op for a stale executor
     token.
   - The **`resolveAudiences` consumption** for mentee scoping (FR-M5) — shipped
     (ACM-4R); confirm mentorship calls the facade and never resolves audiences
     itself, and that pairs never feed audience resolution (AD-17).

8. **The *assign and end mentorships* FR permission is unseeded.** The kernel
   catalog is exactly `user-management:create/deactivate/list`. Same gap as the
   missing `user-management:edit` permission (alignment proposal §7 (i)):
   option (a) a new three-stage AD-1 kernel seed sequence adds e.g.
   `mentorship:assign`, this context consumes it; option (b) an interim rule
   with an expiry trigger. This is a Product Owner + Access Control decision;
   flag it, do not default it. Related: `docs/project-requirements.md` line ~131
   lists **who may assign mentors** as a PO-confirm item (the *default role
   assignment*, not the code path).

9. **Migrations / deploy order.** The `MentorshipPair` table and the availability
   store are additive schema. Confirm they land before any mentorship worker
   path (there is no worker except the shared departure executor). No production
   data migration is implied — the seeded population is the only data.

10. **Spine amendments likely needed:**
    - AD-5 — confirm `mentorship` as a context (move it off the "pending" list).
    - AD-17 — any refinement once the aggregate is real (e.g. the system-closed
      marker, the availability aggregate).
    - Retire the Deferred entry **"S13 mentorship self-visibility flag's exact
      endpoint"** once question 3 is resolved.
    - The Deferred entry **"S10 leaves / S15 request-history write paths"**
      currently also says "Mentorship context boundaries and endpoint details
      remain pending" — update once the routes are fixed.
    - `api-conventions.md` §3.2 S13 row — fill in the closure action route and
      add the willing-pool route and the availability-flag route once named.

## Files created / changed by this PM pass (so you don't collide)

**Created:**

- `_bmad-output/planning-artifacts/prds/prd-mentorship-2026-09-01/prd.md` (+ `.memlog.md`)
- `_bmad-output/planning-artifacts/mentorship/epics.md` (+ `.memlog.md`)
- `_bmad-output/planning-artifacts/mentorship/architect-handoff.md` (this file)
- `_bmad-output/implementation-artifacts/mentorship/sprint-status.yaml`
- `docs/test-cases/mentorship/README.md` + 27 scenario files under
  `flag/` (4), `pool/` (3), `pair/` (5), `end/` (8), `view/` (5), `departure/` (2)

**Edited (pointers / reconciliation only — no substantive rewrite):**

- `_bmad-output/planning-artifacts/user-management/epics.md` — "Mentorship
  Handoff" section replaced with a pointer to this package
- `_bmad-output/implementation-artifacts/user-management/sprint-status.yaml` — no
  change needed (already carries the `# retired:` note for old Story 4.2); left
  as-is
- `_bmad-output/planning-artifacts/prds/prd-people-management-2026-08-24/prd.md`
  — one pointer line under FR-34 (§4.12) (+ `.memlog.md` line)
- `_bmad-output/planning-artifacts/sprint-change-proposal-2026-09-01-user-management-access-control-alignment.md`
  — new §4.8 subsection, a §2 artifact-impact row, a §5 dependency-graph note
- `docs/test-cases/user-management/relationships/README.md` and
  `um-rel-04/05/06` headers — pointer updated to name `docs/test-cases/mentorship/`
- `_bmad-output/planning-artifacts/prds/prd-user-management-2026-08-20/.memlog.md`
  — one line

**Not touched:** `services/backend/` (submodule), the architecture spine, any
`approvals.yaml`, any migration/seed/test/production file.
