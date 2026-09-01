---
title: Mentorship — architecture notes (pre-spec)
date: 2026-09-01
status: draft
author: Winston (System Architect)
companions:
  - ../../../docs/architecture/mentorship.md
  - ./architect-handoff.md
  - ./epics.md
  - ../prds/prd-mentorship-2026-09-01/prd.md
  - ../../../docs/test-cases/mentorship/README.md
---

# Mentorship — architecture notes (why there is no spec package yet)

**Nothing here is approved.** The technical design of the `mentorship` bounded
context is done and binding: **`docs/architecture/mentorship.md`** (`status:
draft`). It answers all ten questions in `architect-handoff.md`, fixes the three
provisional routes, and defines every aggregate, index, and cross-context seam.

A **spec package** (`_bmad-output/specs/spec-mentorship-hub/`) is **not created
now**. A spec package's job is to authorize AD-1 three-stage dispatch
(`stories.yaml` with `spec_checkpoint`/`done_checkpoint`, `invoke_dev_with`
lines, an `approvals.yaml` ledger). That is premature while the dispatch entries
for every story would be either **CONDITIONAL** or **BLOCKED** on decisions
outside mentorship's control:

| Gate | What must land first | Owner |
| --- | --- | --- |
| **Decision 1 — `mentorship:assign` permission** | option (a) a new Access Control kernel-seed AD-1 sequence adds the key + grant, **or** option (b) an interim rule + expiry trigger | Product Owner + Access Control |
| **Decision 3 — S13 `canAccessSection`** | a new Access Control increment adds `'S13'`, **or** an interim `resolveAudiences`-derived rule + expiry trigger (tracked in `implementation-artifacts/access-control/deferred-work.md`) | Access Control |
| **G-CT — career-event boundary** | UM Epic 3 Story 3.1 builds and exports `appendCareerEvent({tx, …})` with the contract in `mentorship.md` §5.1 | User Management |
| **G-DEP — departure executor** | CC-06 / the AD-20 executor exists and calls `applyDepartureEffects({…tx})` (`mentorship.md` §5.2) | Product Owner + Architect (CC-06) |
| Decisions 4–7 | recurring-pair policy, one-mentor-per-mentee, both-profiles career event, end-pair audience | Product Owner |

Two of these (G-CT, G-DEP) are **boundaries that do not exist even as an approved
contract**. Decisions 1 and 3 are the same class of open Product/Access-Control
call the User Management adoption package left as `Open decisions` — and that
package only shipped a SPEC because it had exactly one such call and both facade
methods already existed.

## What can proceed now (AD-1 stage 1 only)

- **All 27 scenario files** in `docs/test-cases/mentorship/` can pursue per-file
  human approval under AD-1 stage 1. `mentorship.md` §3 fixes the three
  provisional routes — the scenario files update to match (`POST
  /mentorship-pairs/:id/end`, `GET /mentorship-pool`, `PATCH
  /users/:id/mentorship-availability`) as part of that approval, not before.
- Scenario prose for a story whose stage-2 is gated is still allowed
  (`epics.md` Epic Sequencing) — the gate stops stage-2, not stage-1.

## When a spec package becomes meaningful

Create `_bmad-output/specs/spec-mentorship-hub/` once **Decision 1 and Decision
3 are taken** (option (a) or (b) each) and **the G-CT career-event boundary
contract is approved**. At that point the dispatch entries can be written without
"CONDITIONAL on an undecided call":

- one AD-1 three-stage sequence per `epics.md` story (1.1–1.6),
- `invoke_dev_with: "services/backend only"` for the code stages,
- Story 1.6 flagged BLOCKED on G-DEP until CC-06,
- Stories 1.2/1.3/1.4 flagged on the Decision 1 outcome,
- Stories 1.4/1.5 flagged on the Decision 3 outcome,
- companions: `mentorship.md`, the PRD, `epics.md`, the scenario README,
- no `approvals.yaml` until the first real approval.

Until then, `mentorship.md` is the binding contract and this note records why the
package is deferred.
