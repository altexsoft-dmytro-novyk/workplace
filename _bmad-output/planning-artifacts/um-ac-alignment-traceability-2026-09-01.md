# Traceability sweep — UM ↔ AC alignment pass (2026-09-01)

**Purpose.** Confirm every v1.5 changelog row that touches User Management, and
every Access Control Kernel MVP decision relevant to the `/users` consumer, has a
landing site in the reconciled planning corpus, and that nothing contradicts.

**Scope of this pass** (see `sprint-change-proposal-2026-09-01-user-management-access-control-alignment.md`):
the AC adoption package, the UM PRD / epics / compiled specs / sprint-status
reconcile, the `docs/test-cases/user-management/` refresh, `user-management-test-decisions.md`,
and the E2E actual-state audit. Not in scope: `docs/project-requirements.md`,
dashboards, platform test-strategy, the CC-04/CC-06/CC-07 contracts themselves.

**Verdict: aligned.** 0 contradictions. 1 code-stage nuance captured as a
scenario (`umac-08`). Open product decisions are enumerated in the proposal §7,
not resolved here.

**Amended 2026-09-01** — **Section E** added for the mentorship bounded-context
architecture pass (`docs/architecture/mentorship.md` + spine/companion
amendments + `docs/test-cases/mentorship/`). Section E scope is separate from the
UM↔AC scope above. Section E verdict: aligned, 0 contradictions, 3 open
Product/Access-Control decisions carried to proposal §7 ((vii)/(viii)/(ix)).

---

## A. v1.5 changelog rows touching User Management

| Changelog item (`requirements-changelog-v1.2-to-v1.5.md`) | Landing site | Status |
| --- | --- | --- |
| "HR Admin" is no longer an audience — configuration role, no data access (§2.2/§2.4/§3.1) | `access-control.md` denial conventions (unchanged, still correct); `user-management-test-decisions.md` DEC-UM-002 note that generic deactivation is retired but the no-role-name-check principle carries to the adoption adapter; adoption `umac-06` (root allowed via seeded FR key, not a role name) | done |
| Manager / people partner / department not writable through S1 (§2.1, §3.2 fn 1) | PRD FR-9 refinement; `epics.md` Story 1.2 third AC; adoption SPEC CAP-2 + `umac-08`; E2E audit §2 (DTO silently strips → must explicitly reject) | done (code nuance flagged) |
| Two role dimensions must both permit a write (§2) | PRD FR-9 refinement (§2.2 dual gate); adoption SPEC CAP-2 + `umac-07`; `career-timeline/` dual-gate note + new `um-ct-09/10` negatives | done |
| Changing an organisational relationship is a distinct operation — dedicated permission, dedicated screen, no self-assignment, journaled (§2.1) | `epics.md` Epic 4 (all stories); compiled specs `spec-4-1/4-2/4-3`; `relationships/` retraced (`um-rel-01/02/03/07/08`) + new `um-rel-09..14`; CC-07 Journal gate recorded on every Epic 4 story | done (implementation CC-07/CC-04-gated) |
| A journal exists — narrow, not a general audit log (§3.4) | `epics.md` Epic 4 "Journal gate (AD-19)"; PRD Open Question 3 (CC-07); every Epic 4 compiled spec "GATES" section; `um-rel-*` atomic-journal Then-clauses marked "stage-2 blocked on CC-07" | done (CC-07 owns the schema) |
| Departments — new entity, every employee in exactly one, departments nest (§4.17) | `epics.md` Story 4.3; `spec-4-3-change-employee-department-or-department-manager.md`; `um-rel-12..14` (blocked on the Department edge contract) | done (Department edge contract still open — spine Deferred) |
| A department change emits a career-timeline event (§4.9) | `epics.md` Story 4.3 AC; `spec-4-3` Intent; `spec-3-1` cross-context list | done |
| No separate "unit" entity; *Unit Manager* = the manager of a department (§2.2, §4.17) | `spec-4-3` Intent; `career-timeline/` DEC-UM-001 realignment uses "direct Unit Manager" for the S9 manual-write audience | done |
| S10 for colleagues: dates only, type hidden (§3.3.4) | Adoption SPEC CAP-2 two-state colleague rule + `umac-04`; deferred to the Profile Projection story (FR-17) for the actual field narrowing; `deactivation/` and `list/um-list-05` unaffected (that folder was about `isActive`, not S10) | done (narrowing owned by FR-17 / `deferred-work.md`) |
| Employment status is time-bounded `active`/`dismissed` (§4.16) | PRD "Data Model — EmploymentStatus" (unchanged from the 2026-08-29 course); `epics.md` Epic 5; `list/um-list-05-dismissed-employee-filterable.md` (new — supersedes retired `um-deact-02`) | done (executor CC-06-gated) |
| No SSO, no Active Directory, no employee creation — the population is a seeded list (§4.17, §10) | `epics.md` Story 1.1 "Import Seeded Population"; `spec-1-1-import-seeded-population.md` (new); `seed/um-seed-01..03` (new); `registration/` folder RETIRED (pointer); `deactivation/` folder RETIRED (pointer); `user-management-test-decisions.md` DEC-UM-003 reframed, DEC-UM-006/008 RETIRED; `api-conventions.md` create-path wording tightened (Phase A) | done |
| Departure recorded by HR with effective date + reason; blocked while the person still manages/partners anyone; on the effective date profile read-only / items cancelled / mentorships auto-close / account deactivates / all access ends immediately (§4.16) | PRD FR-6 (unchanged); `epics.md` Epic 5 Stories 5.1/5.2; `spec-5-1-record-a-departure.md` + `spec-5-2-apply-an-effective-departure.md` (new); `departure/um-dep-01..04` (new, BLOCKED — CC-06) | done (all CC-06-gated; scenario prose only) |
| Leaving is not a career-timeline event — it is employment status (§4.9) | PRD FR-5 (unchanged); `epics.md` Story 3.1 fourth AC ("no departure/left-company event"); `spec-3-1` | done |
| Mentorship pair persistence is not User Management (§4.11, AD-17) | `epics.md` "Mentorship Handoff" (unchanged); old Story 4.2 retired → `spec-4-2-hr-admin-pairs-or-unpairs-a-mentor-and-mentee.md` SUPERSEDED pointer; new `spec-4-2-change-an-employee-s-people-partner.md`; `relationships/um-rel-04/05/06` superseded headers; `um-rel-11`/`DEC-UM-011` note that `mentorship_*` reach UM only as career events via an application boundary | done |
| A new functional role creatable through the UI without a deploy (§2.3, DoD) | Out of this pass — `spec-functional-roles-catalog` (deferred) owns `/roles`; the adoption SPEC Non-goals and `access-control-foundation` spine Deferred both record it. Flagged, not closed. | deferred (recorded) |
| Timetracker is the only required integration; project-line audience is out of UM scope | PRD Scope (unchanged); `epics.md` "Project-relationship assignment … out of scope"; adoption SPEC Non-goals (Project line fail-closed) | done (unchanged) |

---

## B. Access Control Kernel MVP decisions relevant to the `/users` consumer

| Kernel decision | Source | Landing site in UM corpus | Status |
| --- | --- | --- | --- |
| ACM-0 creates + validates the normalized active root `User` at `npm run db:seed`, before import | `spec-access-control-kernel-mvp` CAP-8; `access-control.md` | PRD FR-1 + "Data Model — Root User already exists before import"; `epics.md` Story 1.1 "Kernel-reality constraints"; `seed/um-seed-03` | done |
| DEC-UM-007 — `workEmail` is canonical **at write** (stored normalized), not just at lookup; DB index is on the raw value so uniqueness is writer-side; DB functional index is deferred | kernel SPEC constraints; `deferred-work.md` | PRD "Data Model — Identity is canonical at write"; `epics.md` Story 1.1; `seed/um-seed-01`; `user-management-test-decisions.md` DEC-UM-007 reconciled from "enforced on the normalized value" → "writer-side canonical; DB functional unique index deferred" | done (reconciled) |
| DEC-UM-009 — no writer creates a second row for an existing normalized email; an import covering the root person reuses the ACM-0 root `User` id | kernel SPEC constraints | PRD FR-1; `epics.md` Story 1.1; `seed/um-seed-03`; `user-management-test-decisions.md` DEC-UM-009 reframed to the seed/import writer | done |
| `AccessControlFacade.isAllowed(userId, permissionKey)` exists (ACM-2, `stage-3-production`) — live type-separated FR decision | `approvals.yaml` ACM-2 records; `access-control.facade.ts` | adoption SPEC CAP-1 (`isAllowed` delegates straight to the facade); `umac-06`; integration-contract response Q2 | done |
| `AccessControlFacade.canAccessSection(viewerId, section, targetEmployeeId)` exists (ACM-5) for **`'S1'` / `'S10'` / `'S11'` only** — literal strings, every other returns `'none'` | `approvals.yaml` ACM-5 records; `acm5-section-access.e2e-spec.ts` | adoption SPEC CAP-2 + `umac-07` (uses `'S1'` verbatim — confirmed by the E2E audit §3c); PRD FR-9 refinement; `career-timeline/` files flag **S9 has no `canAccessSection` yet — pending AC increment** | done (S9 gap flagged, not hidden) |
| Seeded FR catalog is exactly `user-management:create` / `:deactivate` / `:list` — **no `user-management:edit`, no photo permission** | `access-control.md`; AD-4 MVP reduction; ACM-1 | adoption SPEC "Missing-edit-permission dependency" + `stories.yaml` UMAC-2 CONDITIONAL; PRD Open Question 4; `epics.md` Epic 0 Story 0.2 gate; proposal §7 decision (i); `umac-07` marked conditional; E2E audit §2 | done — surfaced as an **open decision**, not defaulted |
| Interim access-control adapter retirement + `ACCESS_CONTROL_PORT` rebind is a UM-owned AD-21 cutover, no dual-running | `um-integration-contract-request.md`; people-management spine AD-21 (amended 2026-08-31 by Phase A) | adoption SPEC CAP-1; `epics.md` Epic 0 Story 0.1; spine AD-21 amendment note + memlog; E2E audit §2 inventory; `umac-01..06` | done |
| Interim **session** resolver is a separate retirement (UM Epic 2), not the adoption slice | Phase A analysis; AD-21 amendment | adoption SPEC constraints; `epics.md` Epic 2 sequencing note + Epic 0 constraints; proposal §7 decision (iv); E2E audit §2 (KEEP row) | done — open decision (iv) |
| `AccessControlModule` already imported into `AppModule` (ACM-8, `stage-3-production`) — facade DI-resolvable now | `approvals.yaml` ACM-8; `app.module.ts` | `epics.md` Epic 0 "read path can start now"; adoption SPEC CAP-1; proposal §5 dependency graph; E2E audit §0 | done |
| `resolveAudiences` returns `Set<Audience>` per target (ACM-4R shipped) — the old single-label limitation is gone | `acm4r-multi-audience.e2e-spec.ts`; `deferred-work.md` (dispatched item) | integration-contract response Q3 (the adapter inspects the set to separate `colleague` from `self`); adoption SPEC CAP-2 | done |
| AD-20 due/departure evaluation + dismissed-target projection deferred until a Departure persistence seam exists | kernel SPEC constraints; `access-control.md` "Effective-departure cutoff" | `epics.md` Epic 5 (CC-06); adoption SPEC Non-goals; PRD FR-6; `departure/` scenarios BLOCKED | done (unchanged deferral) |
| ACM3-II-06 — Stage-1 scenario approved (`e42fd2d`); **no Stage-2 test**; false coverage comment in `acm3-termination-taxonomy.e2e-spec.ts:23` → kernel trace gate FAIL | `gate-decision.json`; `traceability-matrix.md` TRACE-1; `e2e-trace-summary.json` | E2E audit §3b — full remediation (scoped Stage-2 AD-1 sequence + comment fix) documented as a **separate code follow-up**, out of this no-code pass. Plus the two P0 MED recs (II-04 adopt `ACF-FC-03` or write canonical; II-05 extend `ACM4R-MA-04`). | documented (not executed) |

---

## C. Contradiction check

| Checked | Result |
| --- | --- |
| Phase A integration-contract answers vs Phase B PRD/epics | consistent — epics.md/PRD defer to the adoption SPEC as the binding contract; Epic 0 stories are 1:1 with `stories.yaml` `UMAC-1/2/3` |
| Phase A `'S1'` section-string placeholder vs actual kernel code | **confirmed correct** — `acm5-section-access.e2e-spec.ts` uses the literal `'S1'` (E2E audit §3c) |
| Phase B FR numbering (FR-16/FR-17) vs epics.md derived FR-7..FR-15 | no collision — derived FRs stop at FR-15; FR-16/FR-17 continue past |
| Regenerated compiled specs vs reconciled `epics.md` stories | every live `spec-*.md` maps to an `epics.md` story; retired old-slug files carry SUPERSEDED pointers to their replacement |
| `sprint-status.yaml` keys vs `epics.md` + adoption `stories.yaml` | match (Epic 0 `0-1/0-2/0-3`, Epics 1–5; retired keys carry `# retired:` comments) |
| `spec-user-management-test-cases` CAP list vs the refreshed `docs/test-cases/user-management/` folders | match (CAP-0 adoption … CAP-10 departure) |
| kernel `validate.py` after this pass | **PASS** — 1225 checks, 0 failures (no kernel story ID changed) |
| Backend commit reference | corrected from stale `865df5f` to audited `dn-um-2 @ e9d80ec` in the proposal §2, `epic-2-context.md`, `epic-3-context.md`; the E2E audit is the authority |
| `POST /users` *create* references in the reconciled corpus | none outside explicit "retired" pointers; `POST /users/:id/{events,relationships,policies}` (AD-14 owned-collection routes) are unrelated and correct; the 15 `um-reg-*.md` history files are retained untouched under a folder-level RETIRED pointer (per the TEA phase's stated retire approach) |

**One code-stage nuance (not a contradiction).** `UpdateUserDto` currently
*silently strips* `manager` / `peoplePartner` / `department` (they are not
declared fields) rather than *rejecting* them with `400`. The integration-contract
response Q3 requires an explicit, tested rejection. Captured as `umac-08` and in
the E2E audit §2; an `@IsEmpty()` addition owned by Epic 0 Story 0.2 / Epic 1
Story 1.2 at the code stage.

---

## D. Open decisions carried to human review (from proposal §7 — restated for completeness)

1. Missing `user-management:edit` (± photo) permission — option (a) new kernel seed AD-1 sequence, or (b) interim adapter rule with an expiry trigger.
2. Two-state colleague rule confirmation + the §3.3.4 whitelist scope for `GET /users/:id`.
3. Epic 0 as a dedicated epic vs a Story 1.0 inside Epic 1.
4. Interim session resolver owner — Epic 0 or Epic 2.
5. Photo write Self-only vs manager/PP-writable.
6. Is photo a distinct permission or covered by `user-management:edit`.
7. (New, minor) Whether to leave the 15 `um-reg-*.md` history files in place under the folder RETIRED pointer, or add a per-file SUPERSEDED header / move to `_retired/`.
8. (Mentorship, proposal §7 (vii)) Unseeded `mentorship:assign` permission — option (a) new kernel seed AD-1 sequence, or (b) interim rule + expiry trigger.
9. (Mentorship, proposal §7 (viii)) S13 `canAccessSection` increment — option (a) new Access Control increment, or (b) interim `resolveAudiences`-derived rule + expiry trigger.
10. (Mentorship, proposal §7 (ix)) Product decisions: recurring pair after ending; one active mentor per mentee; career event on both profiles vs mentee-only; end-pair authorization audience.

---

## E. Mentorship bounded context (§4.11 / FR-M / PRD FR-32/33/34)

**Scope of this section:** the architect pass of 2026-09-01 —
`docs/architecture/mentorship.md`, the spine + companion amendments, and
`docs/test-cases/mentorship/`. The PM decomposition
(`prd-mentorship-2026-09-01`, `mentorship/epics.md`) is the input, not re-checked
here.

### E.1 — requirements §4.11 / §3.2 / §4.9 / §4.16 / §4.1 rules

| Requirement rule | Landing site | Status |
| --- | --- | --- |
| §4.11 self-service: mark open to mentoring | `mentorship.md` §2.2 (`MentorshipAvailability`), §4; `PATCH /users/:id/mentorship-availability`; `flag/men-flag-01/02` | done |
| §4.11 self-service: see assigned mentor / mentee(s) | `mentorship.md` §5.4 (`GetS13MentorshipSummaryQuery`, `GetActiveMentorQuery`); `view/men-view-01/04` | done (G-S13 for the inline narrowing) |
| §4.11 company-wide willing-mentor pool; identity + flag only; no S13; permission-gated | `mentorship.md` §3 (`GET /mentorship-pool`), §5.3 (pool row = S1 + `openToMentoring`); `pool/men-pool-01/02/03` | done (G-PERM for the gate) |
| §4.11 mentee selection scoped to the assigner's access | `mentorship.md` §5.3 (`resolveAudiences(assignerId,[menteeUserId])`); `pair/men-pair-01/02` | done (`resolveAudiences` ships) |
| §4.11 first pair flips `open to mentoring` → `mentor`; status is a directory field | `mentorship.md` §2.3 (**derived, never stored**); `pair/men-pair-03`, `view/men-view-05` | done |
| §4.11 all mentor–mentee pairs view (active + ended) with start/end/status | `mentorship.md` §2.1, §3 (`GET /mentorship-pairs` `?status=`); `view/men-view-02` | done |
| §4.11 ending: manager or PP ends explicitly; end date recorded; **closure note required** | `mentorship.md` §2.1 `CHECK` + `EndMentorshipPairAction`, §3 (`POST /mentorship-pairs/:id/end`); `end/men-end-01/02` | done (G-PERM for the actor gate) |
| §4.11 closure note = field on the pair, not a feedback record | `mentorship.md` §2.1 (`closureNote` column); `end/men-end-01` | done |
| §4.11 closure note visible to reporting line + project line + PP; not mentor / mentee / colleague | `mentorship.md` §5.3 closure-note projection; `access-control.md` matrix-exceptions row (NEW); `end/men-end-03/04` | done (narrowing via `resolveAudiences`; base needs G-S13) |
| §4.11 ended pairs visible in history on both profiles | `mentorship.md` §2.1 indexes `(mentorUserId,status)` + `(menteeUserId,status)`, §6; `end/men-end-08` | done |
| §4.11 end event written to the career timeline (§4.9) | `mentorship.md` §5.1 (`appendCareerEvent`, same tx); `end/men-end-07` | done (G-CT — UM Epic 3 Story 3.1) |
| §4.11 if mentor has no other active mentees → status returns to *open to mentoring* | `mentorship.md` §2.3 (derived); `end/men-end-05` | done |
| §4.11 "Un-flagging": clear flag with an active mentee; pair untouched; status stays `mentor`; removed from pool for future | `mentorship.md` §2.2 (separate aggregate/action), §2.3, §6; `flag/men-flag-03`, `end/men-end-06` | done |
| §4.11 profile header shows the mentor alongside manager + PP | `mentorship.md` §5.4 (`GetActiveMentorQuery`); §3.2 S1 "mentor"; `view/men-view-03` | done |
| §3.2 S13 inline contents (flag, mentor, mentees, ended pairs, closure notes) | `mentorship.md` §5.4 (`GetS13MentorshipSummaryQuery` DTO); `view/men-view-04` | done (G-S13 for narrowing) |
| §4.9 mentorship pair start/end are tracked events | `mentorship.md` §5.1; `database-schema.md` `UserEvents` (`mentorship_start`/`mentorship_end` unchanged); `pair/men-pair-04`, `end/men-end-07` | done (G-CT) |
| §4.16 departure auto-closes active pairs with a system note, bypassing the mandatory-note gate | `mentorship.md` §5.2 (`applyDepartureEffects`), §2.1 (system template + `endedByDepartureId`); `departure/men-dep-01/02` | done (G-DEP — CC-06 / AD-20 executor) |
| §4.1 mentorship status is a filterable field / column on All Employees | `mentorship.md` §2.3 directory read contract (bulk `application/` export); `view/men-view-05` | done (directory engine is platform scope) |

### E.2 — PRD FR-M / parent PRD FR-32/33/34

| FR | Landing site | Status |
| --- | --- | --- |
| FR-M1 / FR-M3 (set/clear flag; clear with active mentee) | `mentorship.md` §2.2, §4, §6 | done |
| FR-M2 (self view mentor + mentees) | `mentorship.md` §5.4 | done (G-S13) |
| FR-M4 (company-wide pool, S1 + flag only, gated) | `mentorship.md` §3, §5.3 | done (G-PERM) |
| FR-M5 (scoped mentee selection) | `mentorship.md` §5.3 | done |
| FR-M6 (create pair; first-pair status transition) | `mentorship.md` §3, §2.3 | done (G-PERM) |
| FR-M7 / FR-M11 (`mentorship_start` / `mentorship_end`, same transaction) | `mentorship.md` §5.1 | done (G-CT) |
| FR-M8 (all-pairs view) | `mentorship.md` §2.1, §3 | done |
| FR-M9 (end pair; mandatory closure note on the pair) | `mentorship.md` §2.1, §3 | done (G-PERM) |
| FR-M10 (closure-note restricted visibility) | `mentorship.md` §5.3; `access-control.md` matrix-exceptions row | done (G-S13 base) |
| FR-M12 (ended pairs on both profiles) | `mentorship.md` §2.1, §6 | done |
| FR-M13 (status roll-back unless flag cleared) | `mentorship.md` §2.3 | done |
| FR-M14 (departure auto-close, system note bypasses gate, AD-20) | `mentorship.md` §5.2 | done (G-DEP) |
| FR-M15 (mentorship status is a directory filter/column) | `mentorship.md` §2.3 | done |
| FR-M16 (mentor in the profile header; S1 `mentor` field) | `mentorship.md` §5.4 | done |
| FR-M17 (S13 inline mentorship summary on `GET /users/:id`) | `mentorship.md` §5.4 | done (G-S13) |
| Parent PRD FR-32 (self-service mentorship) | `mentorship.md` §2.2, §4, §5.4 | done |
| Parent PRD FR-33 (pair lifecycle, scoped selection, closure note, restricted visibility) | `mentorship.md` §2.1, §3, §5.3 | done |
| Parent PRD FR-34 (pool, all-pairs view, S13 read surface, directory field) | `mentorship.md` §2.3, §3, §5.3, §5.4 | done |

### E.3 — spine / companion amendments

| Amendment | Landing | Status |
| --- | --- | --- |
| AD-5 — `mentorship` confirmed as a context | spine AD-5 "Amended 2026-09-01" note; `domain-driven-design.md` confirmed list | done |
| AD-17 — refinement (status SoT, `endedByDepartureId`, `MentorshipAvailability`, derived status) | spine AD-17 "Refined 2026-09-01" note | done |
| Deferred "S13 mentorship self-visibility flag's exact endpoint" | spine Deferred — "Resolved 2026-09-01" → `mentorship.md` §2.2/§4 | retired |
| Deferred "S10 leaves / S15 request-history write paths" mentorship clause | spine Deferred — "Updated 2026-09-01" (routes now fixed) | updated |
| Structural Seed ERD | spine ERD (`MentorshipAvailability`, `endedByDepartureId`, `startedAt`, `endedAt`); `database-schema.md` ERD | done |
| `database-schema.md` — `MentorshipPair` + `MentorshipAvailability` house-style sections | added; `closedBy` dropped; additive-migration-ordering note | done |
| `api-conventions.md` §3.2 S13 row + shape-2 / shape-3 lists | filled | done |
| `access-control.md` — closure-note matrix-exceptions row + S13 pending-increment note | added | done |
| `deferred-work.md` — "S13 `canAccessSection` support" entry | added | done |

### E.4 — contradiction check

| Checked | Result |
| --- | --- |
| `mentorship.md` routes vs `api-conventions.md` AD-14 four shapes | consistent — `mentorship-pool` is shape-2 top-level (read-only), `mentorship-availability` is shape-3 field-group, `/mentorship-pairs/:id/end` is a shape-2 collection-member action (like `action-items/:id/complete`), **no fifth shape invented** |
| Provisional scenario-draft routes vs the fixed routes | **not a contradiction** — `mentorship.md` §3 *fixes* the three provisional routes (`.../closure`→`.../end`, `/willing-mentors`→`/mentorship-pool`, `PUT`→`PATCH`); the 27 scenario files are unapproved drafts and update at stage-1 approval |
| `MentorshipPair` shape vs `database-schema.md` prior shape | reconciled — `startDate`/`endDate` renamed `startedAt`/`endedAt`, `closedBy` dropped (no consumer — [[feedback_no_speculative_fields]]), `endedByDepartureId` added; `database-schema.md` updated in the same pass |
| "pairs never feed audience resolution" (AD-17) vs the closure-note projection | consistent — the projection consumes `resolveAudiences` output and *narrows*; pair rows are never an input to the facade |
| Mentorship status **derived** vs FR-M6/M13 "status changes" language | consistent — the transitions are consequences of the derivation query, not writes; no status column |
| `mentorship:assign` unseeded vs kernel catalog (`create/deactivate/list` only) | **surfaced as Open Decision (vii)**, not defaulted — same handling as `user-management:edit` (i) |
| S13 `canAccessSection` absent (ACM-5 = S1/S10/S11) vs FR-M10/M17 | **surfaced as Open Decision (viii)** + `deferred-work.md` entry — same class as the S9 gap; not hidden |
| `endedByDepartureId` FK-less vs AD-11 "typed access edges, FK-backed" | consistent — AD-11's FK rule is about `Relationship`; the FK-less polymorphic-id trade-off is the *accepted* `Policies.targetId` pattern, chosen here so the migration does not depend on the `Departure` table (CC-06) |
| AD-20 shared-UoW / no-nested-tx / idempotency | `mentorship.md` §5.2 honors all three (caller `tx`, `status='active'` predicate = mutation key, per-event idempotency key) |
| `mentorship.md` career-event contract vs `epics.md` G-CT (UM Epic 3 Story 3.1) | consistent — the epics already name mentorship as a caller of that boundary; `mentorship.md` §5.1 specifies the call shape |

**Verdict: aligned.** 0 contradictions. 3 open Product/Access-Control decisions
carried to proposal §7 ((vii), (viii), (ix)); the architecture design does not
default any of them.
