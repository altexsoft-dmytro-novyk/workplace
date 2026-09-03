# Decision package — the five blockers that close on an approval

**Date:** 2026-09-03
**Prepared by:** planning (follow-up to `blocker-verification-2026-09-03.md`)
**Decision owners:** Product Owner (1) · Architect + Access Control (2) · Architect + Integration owner (3, 4) · Architect (5)

> **Nothing here is applied.** Of the 17 open blockers, twelve need production code. These five close on an **approval** and are the only ones actionable without implementation. Each section below states the verified current position, what the closure condition actually asks for, the options, and a recommendation. `blockers.yaml` edits are drafted, not made.

**Why this matters more than its size suggests:** `TT-IDENTITY-01` (§3) is the named trigger that unblocks `PMC-E3` and therefore `PM-FR-16` / `PM-FR-17`, the last two `uncovered` requirements with a route to coverage. `OQ-PERM-01` (§1) blocks a permission key in **five** slices at once.

---

## 1. `OQ-PERM-01` — default role-to-permission assignment matrix

**P1 · Product Owner · closure: "Approved default role-to-permission assignment matrix"**

### Verified position

Requirements §2.3 names **16** permissions that must be independently grantable, and §2.2 names **5** starting roles. The seeded catalog contains **three** keys — `user-management:create`, `user-management:deactivate`, `user-management:list` (verified in `access-control-bootstrap.ts` `CANONICAL_PERMISSIONS`). The blocker's own note is precise: *"Scope is assignment only… seeding does not establish a catalog. Architect must not invent default grants."*

§2.3 states who does this work: the matrix is *"drafted by the team from this document and confirmed by the PO"*. **Below is that draft.** Cells marked ⬜ are the ones §2.3 itself says the document does not settle.

### Drafted matrix

Two normative constraints bind every cell: **HR Admin grants no data access** (§2.2 `[NORMATIVE]` — it is feature administration only), and **a functional role never widens what its holders can see** (§2.3).

| Permission (§2.3) | UM | DM | PM | PP | HR Admin |
|---|:--:|:--:|:--:|:--:|:--:|
| create form campaigns | | | | ✅ | |
| create action items | ✅ | ✅ | ✅ | ✅ | |
| create and edit risks | ✅ | ✅ | ✅ | ✅ | |
| create resourcing requests | | ✅ | ✅ | | |
| fulfil resourcing requests | ✅ | | | | |
| approve or reject proposed candidates | | ⬜ | ⬜ | | |
| close resourcing requests | | ✅ | | | |
| assign and end mentorships | ⬜ | | | ⬜ | |
| maintain CDS records | ✅ | ✅ | ✅ | ✅ | |
| edit the career timeline | | | | ⬜ | |
| create feedback | | | | ⬜ | |
| record a departure | | | | ✅ | |
| manage custom fields | | | | | ⬜ |
| manage departments | | | | | ✅ |
| change organisational relationships | | | | ⬜ | ⬜ |
| view a given dashboard | ✅ | ✅ | ✅ | ✅ | |

**Filled cells are derived from §2.2's role table**, not invented: UM fulfils requests and proposes candidates; DM creates, approves/rejects, and closes; PM creates for their own projects; PP owns HR functionality with **no resourcing**; HR Admin owns platform administration only.

### The six cells that need you

| # | Cell | Why it is genuinely open |
|---|---|---|
| a | **approve or reject proposed candidates** — DM only, or DM + PM? | §2.2 gives approval to the DM and gives the PM only request creation, but a PM staffing their own project has an obvious claim. Naming it explicitly prevents each slice deciding separately |
| b | **assign and end mentorships** — UM, PP, or both? | §2.2 gives "mentorship assignment" to UM and general HR functionality to PP. §4.11's pool is **company-wide**, which reads toward PP; a UM assigning outside their department is the case to decide |
| c | **edit the career timeline** — PP only? | §2.2 gives PP "career timeline maintenance". §2.3 lists it among the unsettled defaults anyway, so the question is whether PP holds it **exclusively** |
| d | **create feedback** — PP only, or managers too? | §4.15 says feedback is added "by the manager line and PP, **and by anyone holding the permission**". The manager line is an *access* fact, not a role — so does the default grant go to UM/DM/PM as well? |
| e | **manage custom fields** — HR Admin only? | §2.2 gives HR Admin "custom field definitions"; §2.3 lists it as unsettled. Likely a confirmation rather than a real choice |
| f | **change organisational relationships** — PP, HR Admin, or neither by default? | Named in §2.3's list but in **no** §2.2 role. §2.1 makes it an access switch with its own screen and journal entry, which argues for a deliberate, narrow default — possibly nobody, granted per person |

### Recommendation

Approve the 10 derived rows as drafted and rule on (a)–(f). **(f) deserves the most care** — it is the only permission that changes who can see whom, so a generous default there quietly widens data access in a way §2.3 otherwise forbids.

**Not a blocker edit until the matrix is approved.** On approval, `closure_condition` is met and the entry closes; the seed sequence that materialises the catalog is `OQ-AC-EDIT`'s business (§2), not this one.

---

## 2. `OQ-AC-EDIT` — two permission keys that exist only in design

**P1 · Architect + Access Control · closure: "Both keys present in an approved permission catalog, or the design references removed"**

### Verified position

| Key | Referenced by | In catalog? |
|---|---|---|
| `user-management:edit` | `access-control-facade.adapter.ts` (`EDIT_USER_FEATURE`), the UM adoption SPEC, both PRDs, the alignment proposal | ❌ no |
| `mentorship:assign` | `mentorship.md` design, the alignment proposal §7 (vii) | ❌ no |

**The direction is already chosen and recorded in the merged code.** `access-control-facade.adapter.ts` carries the comment: *"The functional permission half of the §2.2 write dual gate. Unseeded today (Open Decision (i) = **option (a)**, pending) → `isAllowed` fails closed."*

So the runtime **fails closed** — which is the safe state, and is why this is P1 rather than P0. What is missing is the seed sequence, not the decision.

### Options

- **(a) — already the recorded direction.** A new Access Control kernel seed AD-1 sequence (scenario → red tests → production) appends both keys to the bootstrap catalog. Per AD-7, `Permissions.key` is the binding identity: unique, append-only, lowercase `context:action` — both keys already conform.
- **(b)** — interim adapter rule with a recorded expiry trigger. Explicitly rejected by the merged implementation, which chose to fail closed instead.
- **(c)** — remove the design references. Not viable: `user-management:edit` is the functional half of the §2.2 write dual gate, and `mentorship:assign` gates the willing-mentor pool. Removing them removes the gates.

### Recommendation

**Confirm (a) and schedule the seed sequence.** Add both keys in one sequence rather than two — they are the same class of gap, and AD-7's append-only rule makes a combined append no riskier than a single one.

```yaml
# on completion of the seed sequence, with AD-1 evidence:
  - id: OQ-AC-EDIT
    status: closed
    closure_evidence: >
      user-management:edit and mentorship:assign appended to CANONICAL_PERMISSIONS
      via the Access Control kernel seed AD-1 sequence (option (a)), with production
      evidence. Keys conform to AD-7 identity: unique, append-only, lowercase
      context:action. Assignment of these keys to roles remains OQ-PERM-01's scope.
```

---

## 3. `TT-IDENTITY-01` — durable identity for project members **(P0)**

**P0 · Architect + Integration owner · closure: "An approved durable identity source for project members, or an approved amendment to the AD-13 identity rule"**

### ⚠️ Read this first — the evidence is gone

The blocker cites `docs/integrations/timetracker-external-api.json`. `blockers.yaml`'s own `evidence_caveat` records that the file was **untracked and absent at the pinned SHA** on 2026-09-02. **As of 2026-09-03 `docs/integrations/` does not exist in the working tree either.** Everything below is reconstructed from the blocker's recorded notes; nobody can currently re-derive it from source.

**First action, before deciding anything: commit the contract.** The caveat already names this as *"a precondition for those four entries being auditable by anyone else"*.

### Verified position (from the recorded notes)

- Project members arrive as `AccountTalentDto {email, dateStart, dateEnd}` — **no durable id**.
- Requirements state email alone is insufficient as an identity key; **AD-13 builds `User.ttId` on that premise**.
- The seed CSV is also keyed by email with **no id column** — so `User.ttId` has no population source at all.
- A durable `Employee.id` **does** exist, but only on the **Accounting** endpoint: a different partner key, requires month and year, and returns **only employees with time entries in that period**.

The consequence is stark: the only available join is the one the requirements forbid, and the only durable id sits behind an endpoint whose result set is a function of who logged time last month.

### Options

| | Option | Cost |
|---|---|---|
| **(a)** | Approve the Accounting `Employee.id` as the identity bridge | Needs a second partner key, a month/year sweep, and an explicit rule for employees with no time entries in the queried period — who would simply be missing. Identity that depends on timesheet activity is fragile by construction |
| **(b)** | Amend AD-13 to accept **email** as the durable join | Cheapest, and matches both the Talent DTO and the seed CSV. Requires an approved amendment at the **requirements** altitude, since §6 is what forbids it — not a spine edit |
| **(c)** | Require a durable id on the Talent endpoint from the integration owner | Correct long-term and removes the contradiction at its source. External dependency with an unknown timeline |
| **(d)** | Declare project membership **platform-administered**, not synced | Contradicts AD-13/AD-31, which make sync the sole writer of `Relationship type='project'`. Would need both amended |

### Recommendation

**(c) as the target, (b) as the interim — and record it as interim with an expiry trigger.** Email is what both real data sources actually carry today, so (b) is the only option that unblocks anything this quarter. (a) buys a durable id at the price of an identity source that silently omits people, which is worse than a weaker key that omits nobody.

**Whichever is chosen, this is the trigger that fires `PMC-E3`.** Its story-creation banner names `TT-IDENTITY-01` closing **and** a project-membership writer existing. Note the second condition is separate and still open (`ARCH-PROJ-WRITER-01`; there is no application writer for `Relationship type='project'` at all today).

---

## 4. `TT-PMDM-01` — resolvable identifier for PM and DM

**P1 · Architect + Integration owner · closure: "An approved resolvable identifier for projectManager and deliveryManager"**

### Verified position

`projectManager` and `deliveryManager` are declared as **untyped strings**, while `members` in the same object are emails. The blocker's note states the risk exactly: *"Joining an authorization edge on an unformatted display name is a fail-open risk, and requirements class project assignment as a security concern rather than a data-quality nicety."*

### Options

- **(a)** Require the integration to type both fields as **emails**, matching `members`. Consistent within one payload, and rides on whatever §3 decides.
- **(b)** Platform-side mapping table from display name to user. A manual mapping that silently ages — the failure mode is an authorization edge pointing at the wrong person after a rename.
- **(c)** Treat PM/DM project-line grants as **platform-administered**, not synced: the sync writes membership, an admin writes the managerial edge.

### Recommendation

**(a), decided together with §3 and in the same conversation with the integration owner** — they are one question about one payload, and splitting them invites two different join keys in one object. If (a) is refused externally, prefer **(c)** over (b): an explicit admin-owned edge is auditable, whereas a name-matching table fails open quietly.

---

## 5. `OPERATIONAL-ENVELOPE` — eight dimensions, no owners **(P0)**

**P0 · Architect · closure: "Each listed dimension decided or explicitly deferred with a named owner, without weakening AD-20's shared-database, timezone, health, alert, or worker requirements"**

### Why this is the cheapest P0 on the board

The closure condition **explicitly accepts deferral**. It does not ask anyone to choose a hosting provider — it asks for a **named owner per dimension**. The note draws the line precisely: *"Declining to certify deployment readiness is not the same as recording the envelope as deferred with an owner."*

The note also explains why it exists at all: this dimension *"was silent across all four package files"*, and AD-20 classifies mixed process configuration as a **startup/deployment failure** — so divergence here is a runtime failure mode, not a documentation inconsistency.

### The eight dimensions — fill in the owner column

| # | Dimension | Decided / Deferred | Owner |
|---|---|---|---|
| 1 | Hosting provider | | |
| 2 | Environment topology | | |
| 3 | Observability vendor and alert ownership | | |
| 4 | Manual retry surface | | |
| 5 | `BUSINESS_TIME_ZONE` validation across environments | | |
| 6 | Worker process topology | | |
| 7 | Rollback position | | |
| 8 | Secret management for external integration keys | | |

**Two are not safely deferrable.** **#5** — AD-20 makes mixed process configuration a startup failure, so a timezone that validates differently per environment is a live defect, not a pending choice. **#8** — the note records that the only declared TimeTracker server is a **dev host authenticated by a per-partner `X-Api-Key`**, with no production topology and no secret decision; and §3 and §4 above both add a *second* partner key to that picture.

### Recommendation

Take one pass and assign all eight, deferring six with named owners and **deciding #5 and #8**. That satisfies the closure condition in a single sitting and converts a P0 from "silent" to "owned", which is the entire point of the entry.

---

## Suggested order

| | Decision | Why here |
|---|---|---|
| 1 | **Commit the TimeTracker contract** | Not a decision — a precondition. Four entries, two of them P0, are currently unauditable without it |
| 2 | `OPERATIONAL-ENVELOPE` | One sitting, closes a P0, needs no external party |
| 3 | `OQ-AC-EDIT` | Direction already chosen in code; only needs confirming and scheduling |
| 4 | `TT-IDENTITY-01` + `TT-PMDM-01` | One conversation with the integration owner. Fires the `PMC-E3` trigger |
| 5 | `OQ-PERM-01` | Six cells to rule on; unblocks permission keys across risk, feedback, CDS, mentorship and resourcing |

**What this does not do.** None of these five closes a blocker that needs code. `SEC-AUTH-01` stays P0 open while the interim session resolver is still wired into the production module, and every section, journal, and event blocker stays open behind it. These five remove the *decision* debt so that the remaining twelve are honestly just implementation.
