# Platform Test Design Validation — Supersession Notice

**Date:** 2026-08-29  
**Current validation status:** `NOT RUN`

The 2026-08-25 validation report covered the v1.2-era platform baseline and relied on the since-withdrawn, pre-v1.5 202-file Access Control acceptance-criteria suite. It is superseded as current evidence by the 2026-08-29 v1.5 Create refresh:

- Architecture: `_bmad-output/test-artifacts/test-design-architecture-platform.md`
- QA: `_bmad-output/test-artifacts/test-design-qa-platform.md`
- Platform handoff: `_bmad-output/test-artifacts/test-design/people-management-platform-handoff.md`
- Progress: `_bmad-output/test-artifacts/test-design-progress-platform.md`

The refreshed documents are **Draft — human review pending**. They contain no current validation verdict. A separate `bmad-testarch-test-design` **Validate-mode** run is required to produce a new verdict.

The current 171-file Access Control suite is a **Stage-1 draft pending per-file AD-1 approval** and is **not approved coverage**.

---

## Story 1.6 Refresh — dated addendum (2026-09-07)

*Platform Epic 1, Story 1.6 (`1-6-platform-test-design-refresh-v1-2-v1-5`), documentation-only. The 2026-08-29 notice above is preserved as a point-in-time record. Sources: `_bmad-output/planning-artifacts/platform/epics.md` Story 1.6 AC, `_bmad-output/planning-artifacts/platform/changelog-traceability-matrix.md` §9, `docs/project-requirements.md` v1.5, `_bmad-output/test-artifacts/gate-decision.json`, `_bmad-output/planning-artifacts/architecture/architecture-people-management-ratification-2026-09-02/blockers.yaml` rev 2026-09-03 ("blockers.yaml"). Full detail is in the twin supplements in `test-design-architecture-platform.md` and `test-design-qa-platform.md`.*

- **Validation status is still `NOT RUN`.** This addendum does not produce a verdict; a `bmad-testarch-test-design` Validate-mode run is still required.
- **The 171-file AC suite referenced above no longer exists (AC bullet 8; matrix G9).** It was **deleted 2026-09-04** — unapproved, never executed (`docs/architecture/access-control.md:345`). Neither the withdrawn pre-v1.5 202-file suite (line 6) nor the 171-file v1.5 draft suite (line 15) is current: **no authored AC scenario inventory exists.** Any future validation covers "no current AC coverage; authoring requires a fresh AD-1 Stage-1 dispatch."
- **SoT is `docs/project-requirements.md` v1.5** (`:3-8`, Amendment 2026-09-02); PeopleForce is **[GOOD TO HAVE]** optional prefill (vacancies platform-owned, not synced — `:348,545-575`); **TimeTracker §5.1 is the only [REQUIRED] integration** (`:530`, `:18`).
- **QUALITY-GATE-AC (P0) — current evaluated state, carried as open debt (AC bullet 4; matrix G10).** `_bmad-output/test-artifacts/gate-decision.json` (snapshot 2026-09-04T17:18:29Z, `contract_static`) reads `gate_status: FAIL`, but the breach is P1 only: `p1_status: NOT_MET` at 70% vs an 80% floor, sole cause the `MENTORSHIP` blocker (all 27 live mentorship criteria PARTIAL — no `src/mentorship/` module, no `MentorshipPair` model). The functional P0 access-control scope this AC governs is **met** in the same snapshot: `p0_status: MET`, P0 coverage 128/128 (100%); `blockers.yaml:140-161` records `QUALITY-GATE-AC` as `status: closed` (2026-09-02) on `gate_status=PASS, p0_status=MET, critical_open=0` with `ACM3-II-04` / `ACM3-II-05` / `ACM3-II-06` each independently Stage-2-approved (`ACM3-II-06` = inactive-identity fail-closed; the prior FAIL evaluated 2026-08-31 is historical). Net: the ACM3-II-06 / P0 scope is closed, but the gate as a whole is **not PASS** — `gate_status` stays `FAIL` on the unrelated P1 mentorship-coverage breach, carried here as open debt until a re-evaluated `gate-decision.json` shows `gate_status=PASS` with `p0_status=MET` and `critical_open=0`. Later snapshot `gate-decision-repo-2026-09-06.json` → `CONCERNS`, P0 still 100%/PASS, P1 81%; the debt is not cleared.
- **QUALITY-GATE-AC-NFR — ACM-9 500-target / ≤2s, tracked separately (AC bullet 5).** `blockers.yaml:163-202` — `status: closed` (2026-09-02, `implementation_status: proven`) against final `_bmad-output/test-artifacts/performance/acm9-final-acm9-1788173458416-ff94a3e685d1.json` (`ACM9-MVP-v1`, `role: final`, `PASS`, `stop_reason: completed`; 500 active targets × 32 gates; warm p95 11.603 ms, worst case 12.357 ms) compared in the same closure_evidence to baseline run `acm9-1788173258311-697e946d9f11` (file `_bmad-output/test-artifacts/performance/acm9-baseline-acm9-1788173258311-697e946d9f11.json`; `comparability: comparable`). `blockers.yaml:200-202` records that `gate-decision.json` "does not include this blocker" — this NFR neither gates nor is gated by the ACM3-II-06 functional coverage above.
- **Live/integration gates use `TT-IDENTITY-01` (P0) / `TT-PMDM-01` (P1), not `TIMETRACKER-CONTRACT`** (`superseded_by: [TT-IDENTITY-01, TT-PMDM-01]`, `blockers.yaml:120-138`; entries at `:594-615` and `:617-630`).
- **PR-B-04 / OQ-117 is re-gated** in the two twin supplements from "open blocker" to **DESIGN-CLOSED / IMPLEMENTATION-DEBT** (PM/AD-34; `blockers.yaml:304-316`). `OQ-114/115/116/105` and `CC-05` are likewise design-closed with implementation debt (flagged; full table re-gate deferred to Validate).
- **Evidence caveat — verbatim (`blockers.yaml:17-22`):** "docs/integrations/timetracker-external-api.json is UNTRACKED and does not exist at the pinned workplace SHA. Every finding resting on it - TIMETRACKER-CONTRACT, TT-IDENTITY-01, TT-PMDM-01, and part of OPERATIONAL-ENVELOPE - is a working-tree observation as of 2026-09-02, not a reproducible baseline claim. Committing the contract is a precondition for those four entries being auditable by anyone else." Committing it is a separate owner decision (`ARCHITECTURE-RATIFICATION.md:42-46`).
