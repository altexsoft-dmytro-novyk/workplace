# S4.2a-OP-06 · A delegated HR Admin can write any employee's career timeline — a known accepted deviation

> **SUPERSEDED 2026-09-07 (PO, Dmytro Novyk) — AF-2 partially reversed.**
> `profile:timeline:write` is being **removed** from the canonical `hr-admin`
> set; career timeline is a profile section (§3.2 S9), and `canEditTimeline`
> gains its audience half (dual gate), narrowed to the target's direct Unit
> Manager and assigned People Partner (DEC-UM-001). HR Admin then holds nothing
> here. The deviation this scenario records is **closed, not accepted.** This
> file is retired in place — not rewritten — per its own dated-pointer rule
> below; the follow-on AD-1 increment (the deferred `profile:timeline`
> `canAccessSection` item) replaces it with a scenario asserting the dual gate.
> Decision + rationale: SCP
> `sprint-change-proposal-2026-09-04-section-access-consolidation.md` §9.1;
> `project-requirements.md` §2.3 (*edit the career timeline*, confirmed
> 2026-09-07).

> ### Recorded consequence of AF-2 — PLAT-E4-S4.2a, 2026-09-06
>
> **The Product Owner ruled that `profile:timeline:write` IS included in the
> canonical `hr-admin` set.** The decision is Dmytro Novyk's, dated 2026-09-06,
> and it **overrides the 4.2a spec's own recommendation to exclude the key**.
> This file exists to record the consequence rather than let it ship silently.
>
> `canEditTimeline` discards its target
> (`career-timeline-access-facade.adapter.ts` — `void targetUserId`, then
> `isAllowed(viewerId, TIMELINE_WRITE_PERMISSION)` alone at `:75`). Granting
> `profile:timeline:write` to the canonical `hr-admin` role therefore gives
> **every present and future holder of that role org-wide write access to every
> employee's career timeline, with no relationship to the target required.**
>
> This is a functional role widening data access, which
> [`access-control.md` line 19](../../../architecture/access-control.md) and
> [`docs/project-requirements.md` §2](../../../project-requirements.md) mark
> **NORMATIVE** against. It is being seeded **deliberately**, by a dated PO
> ruling, with the trade-off understood: the alternative leaves the manual
> timeline-write route closed to everyone on a clean production install.
>
> It is therefore a **known, accepted deviation from a NORMATIVE invariant in
> permanent production configuration** — not an oversight, and not something a
> later reviewer should silently "fix". It stops being a deviation when
> `canEditTimeline` gains its audience half (the deferred DEC-UM-001 narrowing
> to assigned PP + direct Unit Manager), at which point this grant becomes
> legitimate. The deviation must be raised in the AF-4 architect pass and
> registered as a blocker entry there if that pass agrees.
>
> **Do not "fix" this file by inverting its expected results.** A future
> increment that narrows `canEditTimeline` supersedes it with a dated pointer,
> the way [`umac-10`](./umac-10-write-fr-grant-override.md) was superseded —
> it does not rewrite it.

**Trace:**

- **AF-2**, spec [`spec-4-2a-root-operator-permission-set.md`](../../../../_bmad-output/implementation-artifacts/platform/spec-4-2a-root-operator-permission-set.md) — the ruling, and the "Recorded consequence of AF-2" blockquote whose substance is carried above.
- `career-timeline-access-facade.adapter.ts:22` `TIMELINE_WRITE_PERMISSION = 'profile:timeline:write'`, consumed at `:57` (`canReadTimeline`'s "edit implies read" fallback) and `:75` (`canEditTimeline`, `isAllowed` **alone**, `void targetUserId`).
- `career-timeline-access.port.ts` — the contract: *"`isAllowed(viewer, 'profile:timeline:write')` ALONE — a feature action, NO data-audience half ... `targetUserId` is unused at this stage."* Its neighbouring claim *"The only seeded holder is `hr-admin`, which carries no S9 write audience at all"* was **false against the canonical set** before this increment — `hr-admin` held the key only after `scripts/dev-grant-root.ts` ran. From this increment the claim becomes true of the shipped bootstrap, and the safety argument it rests on becomes circular: it argued the interim was safe *because* `hr-admin` was the sole holder, while this increment is what makes `hr-admin` a seeded, delegable holder in production.
- `users.controller.ts:185` `POST /users/:id/events` and `:200` `DELETE /users/:id/events/:eventId` — no `@RequireFeature`; the write gate is inside the action, which is why this reaches no section matrix and no audience.
- [`access-control.md` line 19](../../../architecture/access-control.md) and [`docs/project-requirements.md` §2](../../../project-requirements.md) — the NORMATIVE invariant this deviates from.
- [`S4.2a-OP-05`](./s42a-op-05-delegated-hr-admin-gets-no-data-access.md) — the invariant this file is the dated exception to; [`ACM1-FB-01`](../../access-control-kernel/fr-bootstrap/acm1-fb-01-three-canonical-permissions-seeded.md) — the full amendment record.
- [`um-ct-09`](../career-timeline/um-ct-09-permission-without-s9-write-denied.md) — the existing career-timeline scenario for a permission holder without the timeline write audience; read it alongside this file, because after this increment the *holder* is no longer hypothetical.

## Scenario

**Given** a database provisioned by the production path alone (`db:deploy` →
`db:seed` → `db:bootstrap:access-control`, with `db:dev:grant-root` **not**
run), and an administrator has attached a second active employee, **Nadia**, to
the one canonical `hr-admin` FR policy. Nadia holds all six canonical keys,
including `profile:timeline:write`. She has **no** `direct` and no
`people_partner` edge to the active employee **T** in either direction; her
only audience over T is `colleague`, and `canAccessSection(Nadia,
'profile:identity', T)` resolves `read`.

**When** Nadia adds a manual career-timeline event to T, and then deletes one.

**Then** both **succeed**. `POST /users/<T>/events` returns `201` with the
created event, the event is persisted against T, and
`DELETE /users/<T>/events/<eventId>` returns `204` and soft-deletes it. She is
also able to read T's timeline back, through `canReadTimeline`'s "edit implies
read" fallback at `:57`.

This is the deviation, asserted rather than left latent. The same viewer, in
the same request cycle, is refused `PATCH /users/<T>` with `403` and reports
`canEdit: false` — because the identity card is gated audience-first and the
timeline is not. Putting both answers in one scenario is the point: it makes
the inconsistency a visible, dated fact in the test record instead of a
surprise a later reader has to reconstruct from two files that each look
correct alone.

**Preconditions:** identical to
[`S4.2a-OP-05`](./s42a-op-05-delegated-hr-admin-gets-no-data-access.md) steps
1–5 — production bootstrap only, `Permissions` asserted at `6`, Nadia attached
to the bootstrap's own canonical policy resolved by natural key, no
`Relationship` row between Nadia and T, and real seeded-uuid sessions. Nothing
in this scenario grants Nadia anything beyond the canonical role: if it did,
the deviation being recorded would not be the shipped one.

## Test

- **Test 1 — the delegated holder writes a stranger's career timeline**
  - **inputURL:** `POST /users/<T-uuid>/events`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:<nadia-uuid>>" },
      "body": { "type": "position_change", "eventDate": "2026-03-01" }
    }
    ```
  - **expectedResult:** `201`; the event is persisted against T — asserted
    against the database, not inferred from the status. **Expected red before
    Stage 3:** `403`, because `profile:timeline:write` has no holder at all on
    a pure production bootstrap at the baseline commit. The red→green flip here
    **is** the deviation being introduced.
- **Test 2 — she deletes an event on the same stranger's timeline**
  - **inputURL:** `DELETE /users/<T-uuid>/events/<eventId>` with
    `Bearer <token:<nadia-uuid>>`, where `<eventId>` is threaded from Test 1's
    response
  - **expectedResult:** `204`; the event is soft-deleted and absent from a
    follow-up read of T's timeline.
- **Test 3 — the same viewer is still refused T's identity card**
  - **inputURL:** `PATCH /users/<T-uuid>` with `Bearer <token:<nadia-uuid>>`,
    body `{ "city": "Berlin" }`; then `GET /users/<T-uuid>` as the same viewer
  - **expectedResult:** `403` with T's row unchanged, and `canEdit: false` on
    the follow-up read. Green before and after. The contrast with Tests 1 and 2
    is the record: one section is audience-gated and closed, one is
    permission-gated and open, for the same viewer over the same target.
- **Test 4 — the deviation is bounded to the timeline**
  - **inputURL:** the write surface of the other profile sections routed at the
    baseline commit, as `Bearer <token:<nadia-uuid>>` against `<T-uuid>`
  - **expectedResult:** `403` on every one, records unchanged. The accepted
    deviation is `profile:timeline` and nothing else; a second open section
    would mean a second data-write key entered the canonical set, which
    [`ACM1-FB-01`](../../access-control-kernel/fr-bootstrap/acm1-fb-01-three-canonical-permissions-seeded.md)
    forbids.
