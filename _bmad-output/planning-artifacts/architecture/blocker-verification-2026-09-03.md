# Blocker verification sweep — 2026-09-03

**Scope:** all 31 entries in `architecture-people-management-ratification-2026-09-02/blockers.yaml`
**Method:** each open entry's factual premise checked against `services/backend` at `e6049c8`, and its `closure_condition` checked against what exists
**Result:** **17 open · 0 closeable · 0 stale premises · 1 evidence caveat degraded**

> This sweep changed no blocker status. `blockers.yaml` states the governing rule itself: *open blockers remain fail-closed and are not resolved by ratification*. Several entries reinforce it individually — *"schema approval alone does not close implementation"*, *"a named memlog decision does not close implementation"*, *"design ratification is not implementation evidence"*.

---

## 1. Verified against backend source — premise confirmed, blocker stays open

Every claim below was checked in code. **None had gone stale.**

| Blocker | Sev | Claim in the entry | Verified |
|---|---|---|---|
| `SEC-AUTH-01` | **P0** | `isAllowedForTarget` returns `Boolean(userId)`; interim resolver self-provisions `position: 'HR Admin'` | ✅ Exact. `interim-access-control.adapter.ts:37` returns `Promise.resolve(Boolean(userId))`; `interim-session-resolver.adapter.ts:57,80` set `position: 'HR Admin'`. **And it is wired into the production module** — `user-management.module.ts:36` provides it for `ACCESS_CONTROL_PORT`. Closure asks for interim adapters to fail closed *or be removed from the production module*; neither holds |
| `AC-S9-S13` | P1 | Facade returns `none` for every section but S1/S10/S11 | ✅ `access-control.facade.ts:52-54` — literal early return |
| `AC-SECTION-MATRIX-01` | P1 | Same facade fact, for S2–S8 / S14–S16 | ✅ Same line |
| `CC-07` | **P0** | `AccessJournal` has no table | ✅ Zero occurrences in `src/` or `prisma/` |
| `CC-09` | **P0** | `UserEvents` has no model | ✅ Zero occurrences |
| `CC-08` | **P0** | `EmploymentStatus` lifecycle unenforced | ✅ The field does not exist anywhere — nothing to enforce yet |
| `DEPARTMENT-EDGE` | P1 | No `Department` table | ✅ `schema.prisma` has 8 models; `Department` and `UserDepartment` are not among them |
| `CC-10-MENTORSHIP` | P1 | `src/mentorship` does not exist | ✅ No such directory |
| `ARCH-PROJ-WRITER-01` | P1 | TimeTracker sync must be sole writer of `Relationship type=project` | ✅ There is **no** application writer at all — only generated Prisma client code. Implementation absent as recorded |
| `CONFLICT-UM-01` | P1 | Runtime diverges from the PM/AD-24 401/404/403 oracle | ✅ `NotFoundException` covers missing records, but hidden-target `404` needs the tier walk that `isAllowedForTarget` stubs out. Divergence is structural, not incidental |
| `CC-04` | P2 | Blocked behind `CC-07` | ✅ Transitively confirmed — `CC-07` is absent |
| `CC-06` | P1 | AD-23 participants must share one transaction signature | ✅ The participant contexts (`mentorship`, journal, events) do not exist to participate |

**Conclusion:** all twelve require production code plus independently approved AD-1 Stage-2 evidence. None is a documentation state that a planning pass can change.

## 2. Decision blockers — no code required, but the decision is not mine

These five close on an **approval**, not an implementation. They are the only entries actionable today, and each needs a named owner to decide.

| Blocker | Sev | Owner | What closing it requires |
|---|---|---|---|
| `OQ-PERM-01` | P1 | Product Owner | An approved default role-to-permission assignment matrix |
| `OQ-AC-EDIT` | P1 | Architect + Access Control | `user-management:edit` and `mentorship:assign` present in an approved permission catalog — **or** the design references removed |
| `TT-IDENTITY-01` | **P0** | Architect + Integration owner | An approved durable identity source for project members, or an approved amendment to the AD-13 identity rule |
| `TT-PMDM-01` | P1 | Architect + Integration owner | An approved resolvable identifier for `projectManager` / `deliveryManager` |
| `OPERATIONAL-ENVELOPE` | **P0** | Architect | Each dimension decided **or explicitly deferred with a named owner**, without weakening AD-20 |

`OPERATIONAL-ENVELOPE` is the cheapest of the five: its closure condition explicitly accepts *deferred with a named owner* as a valid outcome. It does not require solving anything — only assigning.

## 3. New finding — evidence degraded further

`blockers.yaml`'s `evidence_caveat` records that `docs/integrations/timetracker-external-api.json` was **UNTRACKED** and absent at the pinned workplace SHA on 2026-09-02, making `TIMETRACKER-CONTRACT`, `TT-IDENTITY-01`, `TT-PMDM-01` and part of `OPERATIONAL-ENVELOPE` working-tree observations rather than reproducible claims.

**As of 2026-09-03 the file is not in the working tree either — `docs/integrations/` does not exist.** The caveat said committing the contract was *"a precondition for those four entries being auditable by anyone else"*. That precondition has moved further away, not closer: the evidence is now absent from both the index and the working tree, so nobody — including this repository — can re-derive those findings.

**This does not change any blocker's status.** It is recorded because two of the four affected entries are P0.

## 4. Already closed or superseded — 14 entries, unchanged

`CC-05`, `QUALITY-GATE-AC`, `QUALITY-GATE-AC-NFR`, `OQ-114`, `OQ-115`, `OQ-116`, `OQ-117`, `OQ-105`, `ARCH-GOV-01`, `ARCH-ENV-01` (closed) · `TIMETRACKER-CONTRACT`, `CC-10`, `CC-11`, `OQ-118` (superseded).

Several carry a deliberate split worth preserving: `OQ-114`, `OQ-105` and `ARCH-ENV-01` are **closed at design with implementation still absent or transition debt**. `ARCH-ENV-01` states it outright — *do not treat design closure as production-ready projection*. Reading these as "done" is the specific misreading the fields exist to prevent.

`QUALITY-GATE-AC-NFR`'s closure is pinned to resolver revision `f89e034`; any `access-control/**` change invalidates it and requires an ACM-9 rerun. `PLAT-E6`, `RISK-E*` and the CDS slice all modify that path.

---

## What would actually move the number

The 17 reduce to two workstreams, and neither is a planning pass:

1. **Five decisions** (§2) — available today, no code. Assigning `OPERATIONAL-ENVELOPE`'s dimensions and resolving `OQ-PERM-01` unblocks permission-key work across risk, feedback, CDS and mentorship.
2. **Backend implementation** (§1) — `SEC-AUTH-01` is the root: while `isAllowedForTarget` returns `Boolean(userId)` in the production module, every target-scoped entitlement claim in the product is unenforced, and no section, journal, or event blocker can produce trustworthy evidence on top of it.
