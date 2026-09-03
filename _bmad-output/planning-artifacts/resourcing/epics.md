---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-people-management-2026-08-24/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-people-management-ratification-2026-09-02/ARCHITECTURE-RATIFICATION.md
  - _bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/global-coverage/global-fr-epic-story-coverage.yaml
  - docs/project-requirements.md
  - docs/architecture/api-conventions.md
status: final
slice: resourcing
id_namespace: RS-E{epic}-S{story}
updated: 2026-09-02
---

# People Management — Resourcing — Epic Breakdown

## Overview

This document is a **new bounded-context slice** decomposing exactly **4 canonical PRD requirements** into implementable stories: the platform-owned resourcing request lifecycle (`PM-FR-23`–`PM-FR-26`).

**Canonical requirement source:** [prd.md](../prds/prd-people-management-2026-08-24/prd.md) §4.8 — `PM-FR-*` IDs and §-refs are taken from there and from [docs/project-requirements.md](../../docs/project-requirements.md) §4.7.

**User journey anchor:** UJ-1 (Carlos the DM evaluates a proposed internal candidate via a request-bound share link, or reviews an external candidate by stored PeopleForce ID).

**Selection rule:** these 4 FRs are `coverage_status: uncovered` with `stories: []` in [global-fr-epic-story-coverage.yaml](../global-coverage/global-fr-epic-story-coverage.yaml). EXPERIENCE.md records **No surface** for all four — there is no `bmad-ux` contract for resourcing. Stories therefore derive interaction from the PRD, UJ-1, sidebar IA (“resourcing” listed as a future surface), and dashboard widget contracts in the platform-capabilities slice.

**Architecture authority:** [ARCHITECTURE-RATIFICATION.md](../architecture/architecture-people-management-ratification-2026-09-02/ARCHITECTURE-RATIFICATION.md) — `ratified-with-transition-debt`. Resourcing is listed in §4.2 *Confirmed absent or incomplete*. The spine (AD-5) lists `resourcing` as a **pending** bounded context; AD-14 reserves `resourcing/requests` as a top-level collection and `GET /users/:id/request-history` for S15.

**Cross-context boundaries:**

| Context | Responsibility in this slice |
|---|---|
| `resourcing` | Request entity, state machine, candidate proposals, compensation-on-request field, routing by department |
| `access-control` | Functional permissions (`create` / `fulfil` / `approve` / `close` resourcing requests), S15 section entitlement, share-link section policy |
| `user-management` | Department entity and membership (routing input), S15 read route host, journal entries for share-link access |
| Profile sharing (`PM-FR-27`) | Request-bound share links are **created automatically** on internal-candidate submission — owned by sharing context, invoked through an approved port |

### Identifier namespace

Stories in this slice use **`RS-E{epic}-S{story}`**.

> **REGISTRATION GAP (must be closed before this slice enters a sprint):** `RS-E*` is **not** currently registered in PRD §0.2 or in `global-fr-epic-story-coverage.yaml` `namespace_rules` / `source_slices`. Closing requires a PRD §0.2 amendment plus coverage-model registration — same pattern as `PMC-E*`.

`ACF-*`, `ACM-*`, `UMAC-*` are stable workboard identifiers and are **never** reassigned by this slice.

**Out of scope for this slice:** `PM-FR-27` manual share-link creation (separate sharing slice); PeopleForce vacancy synchronisation; writing `Relationship type=project` on approval (AD-31); dashboard resourcing widgets (`PMC-E2`/`PMC-E3` consume this slice read-only once implemented); notifications (§4.13 deferred); PP-facing resourcing surfaces (PP functional role excludes resourcing per PRD §2.2).

### Scope decisions (product owner, 2026-09-02)

- **SD-1 — No UX contract; PRD + UJ-1 are the interaction authority.** EXPERIENCE.md lists resourcing as **No surface**. This slice records that gap explicitly. A future `bmad-ux` run may revise layouts; stories bind to normative behaviour, not invented chrome.
- **SD-2 — One vacancy entity, platform-owned.** There is no PeopleForce vacancy mirror. External candidates carry a stored PeopleForce candidate ID and link only — the minimum viable external path (requirements §4.7, §5.2).
- **SD-3 — Approval does not assign project membership.** Fulfilment records request outcome only. Project membership is written by TimeTracker sync (AD-31). Stories must not insert `Relationship type=project` rows.
- **SD-4 — PP is excluded from every resourcing surface.** People Partner functional role has no resourcing functionality. S15 on profile is readable by PP per §3.2 matrix — that is profile access, not a resourcing feature surface.
- **SD-5 — Expected compensation is a request-scoped field with a narrow audience.** Visible to request author, routed UM, and reviewing DM only. **Never** in S15 history, share links, exports, or PP-visible payloads.
- **SD-6 — Request-bound share links are automatic on internal submission.** The UM does not manually create a link. The platform creates it on submit, names the reviewing DM as recipient, enables the fixed evaluation section set, and binds link lifetime to the request decision (requirements §4.7, §4.8). Implementation calls the profile-sharing context through an approved port — this slice owns the *trigger* and *contract*, not the link engine internals.
- **SD-7 — Explicit close only.** Filling the last headcount slot does **not** close the request. Only the DM's explicit successful or unsuccessful close ends it. Rejected candidates may be re-proposed until close.
- **SD-8 — Department routes the request.** The required department field determines the responsible UM. `DEPARTMENT-EDGE` must be satisfied before routing stories reach production evidence.

### Slice-level preconditions

| Precondition | Severity / status | Why it precedes every epic |
|---|---|---|
| `SEC-AUTH-01` — interim target-auth cutover | **P0 open** | Interim adapter permits every operation on every target. *(2026-09-03 correct-course note: implementation evidence exists on the unmerged `dn-um-implementation` branch — see `blockers.yaml` `status_note`. Not yet merged or independently verified; this precondition stays open.)* |
| `DEPARTMENT-EDGE` | **P1 open** | Department entity and membership writer absent; routing is undefined without it |
| `OQ-PERM-01` | **P1 open** | `create` / `fulfil` / `approve` / `close` resourcing permissions are FR-6 grants; default matrix unapproved — do not seed or infer |
| S15 facade support | **P1 open** | `AccessControlFacade` supports S1/S10/S11 kernel only (ACM-5); S15 read projection needs an access-control increment |
| Profile-sharing port | **P1 open** | Auto share-link on internal submit requires `PM-FR-27` link engine — currently uncovered; port contract may be specified here, implementation may lag |
| `QUALITY-GATE-AC` | **P0 open** | Closes at `gate_status=PASS`, `p0_status=MET`, `critical_open=0` |

Owner for department routing and S15 host routes: `user-management`. Owner for permissions and S15 entitlement: `access-control`. Owner for share links: future profile-sharing context.

## Requirements Inventory

### Functional Requirements

Exactly 4, verbatim-sourced from PRD §4.8 and requirements §4.7.

- **PM-FR-23** *[PRD §4.8 FR-23]*: DM/PM create resourcing requests with vacancy details, requirements, expected compensation level, duration, workload, **headcount** (default 1), and a **required department**. Project reference is optional; unattached requests are normal. Department routes to the responsible UM. A DM sees their own requests and those created by PMs of their projects.
  - Consequence: expected compensation visible only to author, routed UM, reviewing DM — never S15, share link, export, or PP.
- **PM-FR-24** *[PRD §4.8 FR-24]*: UM sees requests routed to their department; proposes internal department members and/or external candidates; stores PeopleForce candidate ID and link for every external candidate; submits one or more candidates for DM review.
  - Consequence: internal submission **automatically** creates a request-bound share link for the reviewing DM with sections S1, S4, S11, S12, S5 (CV/certificates only), optional S6 — never S2, S3, S7, S8.
- **PM-FR-25** *[PRD §4.8 FR-25]*: DM approves or rejects each candidate with written reason. Each approval fills one headcount slot; request shows filled and remaining. Last slot filled does **not** auto-close. Rejected requests may receive new proposals until explicit close. Approval does not create a project record.
- **PM-FR-26** *[PRD §4.8 FR-26]*: S15 records proposed → approved/rejected history and written feedback for internal employees; visible to Reporting line, Project line, and PP per matrix. Expected compensation excluded.

### NonFunctional Requirements

From PRD §8, filtered to what binds this slice.

- **NFR-1** *[PRD §8 NFR-1]*: Access-control correctness is the primary quality attribute. Compensation-on-request, share-link sections, and S15 must not leak outside entitled audiences.
- **NFR-2** *[PRD §8 NFR-2]*: Seeded test population only; no real PII in fixtures, logs, or agent contexts.
- **NFR-4** *[PRD §8 NFR-4]*: PeopleForce link storage degrades gracefully when the external system is unreachable — core request flow still works with stored ID + URL text.
- **NFR-5** *[PRD §8 NFR-5]*: Responsive layout and accessibility for list, detail, and form surfaces introduced here.
- **NFR-6** *[PRD §8 NFR-6]*: English UI only.
- **NFR-7** *[PRD §8 NFR-7]*: Functional-permission revocation is immediate; a user who loses `fulfil resourcing requests` cannot submit candidates on the next request.

### Additional Requirements

**Architecture (binding)**

- **AD-5:** `resourcing` is a pending bounded context — confirm as `src/resourcing/` with `application/domain/infrastructure` layout before sprint entry.
- **AD-14:** Top-level `resourcing/requests` collection; S15 at `GET /users/:id/request-history` (read-only host route under user-management HTTP adapter).
- **AD-31:** TimeTracker sync is the **sole writer** of `Relationship type=project`. Resourcing fulfilment/approval must not write those rows.
- **PM/AD-24:** HTTP denial oracle — `401` / `404` hidden target / `403` forbidden action; lists omit invisible rows.
- **PM/AD-35 / DEPARTMENT-EDGE:** Department entity routes resourcing; no department table exists yet.

**Fixed product facts (not re-decided here)**

- Requests without a project appear in dashboard **Unassigned** bucket (PMC SD-2, requirements §4.4.2).
- Share links generated by resourcing live until the request is decided — not the default 24-hour manual-link clock (requirements §4.8).
- Every share-link access is written to the relationship and grant journal (requirements §4.8).

### UX Design Requirements

**N/A — no `bmad-ux` run for resourcing.** EXPERIENCE.md §FR gaps records **No surface** for PM-FR-23–26. Sidebar lists “resourcing” as a future item without artboards. Dashboard widgets that display resourcing counts source from this slice once implemented (PMC-E2/E3 SD-2 degraded states until then).

**Recorded UX minimum (derived, not designed):**

- **RS-DR1:** Authenticated users with the appropriate functional permission can reach a **Resourcing → Requests** list and open a request detail view — the navigation target referenced from UM/DM dashboards (requirements §4.4.1, §4.4.2).
- **RS-DR2:** Request detail shows lifecycle state, headcount filled/remaining, candidate list with approve/reject affordances for the reviewing DM, and fulfilment affordances for the routed UM.
- **RS-DR3:** External candidates display stored PeopleForce candidate ID and link; no in-app PeopleForce embed is required in v1 (UJ-1: “uses stored candidate ID data or an external PeopleForce link if integrated”).

## FR Coverage Map

| Requirement | Epic | Stories |
|---|---|---|
| PM-FR-23 | Epic 1 | RS-E1-S1.1, RS-E1-S1.2 |
| PM-FR-24 | Epic 1 | RS-E1-S1.3, RS-E1-S1.4 |
| PM-FR-25 | Epic 1 | RS-E1-S1.5, RS-E1-S1.6 |
| PM-FR-26 | Epic 2 | RS-E2-S2.1 |

## Epic List

### Epic 1: Resourcing Request Lifecycle

DM and PM create platform-owned vacancy requests; department routing delivers them to the responsible UM; the UM proposes internal or external candidates; internal submission auto-generates a request-bound profile share link for the reviewing DM; the DM approves or rejects with written feedback, tracks headcount slots, and explicitly closes the request.

**FRs covered:** `PM-FR-23`, `PM-FR-24`, `PM-FR-25`

**Audience:** DM, PM (create, review, close); UM (inbox, fulfil); any functional role granted the corresponding §2.3 permissions. **PP excluded** from all resourcing surfaces (SD-4).

**Standalone:** yes, given slice-level preconditions. Does not require dashboard widgets to function — the Requests list is the primary surface. Dashboard counters are downstream consumers.

**Enables (without depending on):** PMC dashboard resourcing widgets (`PM-FR-15` UM/DM counters, `PM-FR-16`/`PM-FR-17` request lists); optional PeopleForce prefill default candidate ID on hire (`PM-FR-38` deferred).

**Implementation notes:** State machine lives in `resourcing` domain. Cross-context calls: department lookup and employee department membership from `user-management`; share-link creation from profile-sharing port; permission checks from `access-control`. No `Relationship type=project` writes on approval (SD-3, AD-31).

### Epic 2: Profile Request History (S15)

Internal employees have a durable request-history section on their profile recording every resourcing proposal outcome and DM feedback, entitlement-gated per §3.2 S15.

**FRs covered:** `PM-FR-26`

**Standalone:** no — requires Epic 1's candidate review events as the write source. Read surface can be specified and tested independently once events exist.

**Implementation notes:** `GET /users/:id/request-history` is read-only per AD-14. Writes occur inside Epic 1 transactions as history rows, not via a public S15 POST. Expected compensation is **never** persisted in S15 rows (SD-5).

### Epic Dependency Graph

- Slice-level preconditions → **all epics**
- Epic 1 (lifecycle mutations) → Epic 2 (S15 history rows)
- `DEPARTMENT-EDGE` → Epic 1 Stories 1.1, 1.2 (routing)
- Profile-sharing port → Epic 1 Story 1.4
- S15 facade increment → Epic 2 Story 2.1

---

## Epic 1: Resourcing Request Lifecycle

**Status:** backlog
**Slice-level preconditions:** see *Slice-level preconditions*. No story may reach production evidence while `SEC-AUTH-01` is open.

DM and PM create platform-owned vacancy requests; department routing delivers them to the responsible UM; the UM proposes internal or external candidates; internal submission auto-generates a request-bound profile share link for the reviewing DM; the DM approves or rejects with written feedback, tracks headcount slots, and explicitly closes the request.

**FRs covered:** `PM-FR-23`, `PM-FR-24`, `PM-FR-25`
**NFRs engaged:** NFR-1, NFR-2, NFR-4, NFR-5, NFR-6, NFR-7
**UX-DRs covered:** RS-DR1, RS-DR2, RS-DR3 (derived)

### Story 1.1: Create a resourcing request

**ID:** `RS-E1-S1.1` · **Sprint key:** `1-1-create-a-resourcing-request`

As a Delivery Manager or Project Manager with permission to create resourcing requests,
I want to create a vacancy request with role details, compensation band, duration, workload, headcount, and department,
So that the responsible Unit Manager receives a routable staffing need.

**Gates:** `OQ-PERM-01` (create resourcing requests permission), `DEPARTMENT-EDGE` (department field references a real entity), `SEC-AUTH-01`.

**Acceptance Criteria:**

**Given** I hold *create resourcing requests* and active projects when applicable
**When** I submit a new request with vacancy details, requirements, expected compensation level, duration, workload, headcount omitted
**Then** the request is created with headcount **defaulting to 1**
**And** the response includes a stable request identifier and state `open`

**Given** I create a request with a required department and an optional project reference
**When** the request is persisted
**Then** the department is stored as the routing key
**And** a missing project reference is a valid state (not an error)

**Given** a created request
**When** the routed UM or reviewing DM reads the request
**Then** expected compensation level is present in the payload
**When** any other actor without author/UM/DM review role reads the same request
**Then** expected compensation level is **absent** from the payload (SD-5, NFR-1)

**Given** an actor without *create resourcing requests*
**When** they attempt to create a request
**Then** the response is `403` per PM/AD-24

**Given** a department id that does not exist or is not visible to the actor
**When** they attempt to create a request referencing it
**Then** the response is `404` (hidden-existence) or `403` per PM/AD-24 — never a persisted orphan route

### Story 1.2: Route requests and scope DM visibility

**ID:** `RS-E1-S1.2` · **Sprint key:** `1-2-route-requests-and-scope-dm-visibility`

As a Unit Manager,
I want incoming requests routed to my department to appear in my inbox,
And as a Delivery Manager I want to see my own requests and those created by PMs on my projects,
So that each role sees only the requests they are entitled to act on or review.

**Gates:** `DEPARTMENT-EDGE`, `OQ-PERM-01`, `TT-IDENTITY-01` (for DM visibility of PM-created requests on shared projects — specification may proceed with seeded project membership; production evidence blocked until project traversal exists).

**Acceptance Criteria:**

**Given** a request created with department D and UM Alex responsible for D
**When** Alex opens the Resourcing → Requests inbox with *fulfil resourcing requests*
**Then** the request appears in Alex's inbox
**And** UMs responsible for other departments do not see it in their list payloads

**Given** PM Pat created a request on a project managed by DM Carlos
**When** Carlos lists requests he is entitled to review
**Then** Pat's request appears alongside Carlos's own requests
**And** requests from PMs outside Carlos's projects are omitted

**Given** any list endpoint in this slice
**When** the response is built
**Then** rows the viewer may not see are omitted entirely (PM/AD-24 list rule, NFR-1)

**Given** a request with no project reference
**When** it is listed on a DM dashboard consumer or the Requests list
**Then** it is classified under the **Unassigned** project bucket (fixed product fact; PMC SD-2)

### Story 1.3: Propose internal and external candidates

**ID:** `RS-E1-S1.3` · **Sprint key:** `1-3-propose-internal-and-external-candidates`

As a Unit Manager with permission to fulfil resourcing requests,
I want to attach internal department members and/or external candidates identified by PeopleForce ID,
So that the reviewing DM can evaluate staffing options.

**Gates:** `OQ-PERM-01` (fulfil resourcing requests), `DEPARTMENT-EDGE`.

**Acceptance Criteria:**

**Given** an open request routed to UM Alex's department
**When** Alex proposes an internal employee who is a current member of that department
**Then** the proposal is recorded in state `proposed` linked to the employee
**And** the request remains open for DM review

**Given** the same request
**When** Alex proposes an external candidate with a PeopleForce candidate ID and URL
**Then** both values are persisted on the proposal row
**And** no PeopleForce API call is required for the write to succeed (SD-2, NFR-4)

**Given** Alex proposes one internal and one external candidate and submits for review
**When** the submission completes
**Then** both proposals are visible to the reviewing DM on the request detail
**And** the request state reflects `pending_review`

**Given** an actor without *fulfil resourcing requests*
**When** they attempt to propose candidates on a routed request
**Then** the response is `403`

**Given** Alex attempts to propose an internal employee who is **not** a member of the routed department
**When** the proposal is submitted
**Then** the request is rejected with a validation error — department membership is required for internal proposals (requirements §4.7)

### Story 1.4: Auto-generate request-bound share link on internal submission

**ID:** `RS-E1-S1.4` · **Sprint key:** `1-4-auto-generate-request-bound-share-link`

As a reviewing Delivery Manager,
I want an authenticated share link to an internal candidate's profile created automatically when the UM submits them,
So that I can evaluate someone outside my reporting line without manual link setup.

**Gates:** Profile-sharing port (`PM-FR-27` engine), `SEC-AUTH-01`, `OQ-PERM-01`.

**Acceptance Criteria:**

**Given** UM Alex submits internal employee Eve as a candidate on Carlos's request
**When** the submission transaction commits
**Then** the platform creates a share link naming **Carlos** as the sole authenticated recipient
**And** the link is attached to the request–proposal record
**And** Alex did not perform a separate “create link” action (SD-6)

**Given** the auto-generated link Carlos opens as recipient
**When** the evaluation view is rendered
**Then** enabled sections are exactly **S1, S4, S11, S12, and S5 limited to CV and certificates**
**And** S2, S3, S7, and S8 are **never** present in the payload
**And** S6 is absent unless Alex explicitly enabled it on submission (requirements §4.7)

**Given** the request-bound link
**When** Carlos's managerial relationship to Eve is absent
**Then** Carlos can still evaluate Eve **only** through this link — normal profile routes remain `404` for hidden existence

**Given** the link is active
**When** Carlos approves, rejects, or the request is withdrawn/closed
**Then** the link stops working immediately (request-bound lifetime; requirements §4.8)
**And** the access is recorded in the relationship and grant journal

**Given** an external candidate proposal
**When** the UM submits
**Then** **no** share link is created — Carlos uses stored candidate ID and external URL only (UJ-1, RS-DR3)

### Story 1.5: Approve or reject candidates with feedback

**ID:** `RS-E1-S1.5` · **Sprint key:** `1-5-approve-or-reject-candidates-with-feedback`

As a reviewing Delivery Manager with permission to approve or reject proposed candidates,
I want to approve or reject each candidate with a written reason,
So that headcount slots fill transparently and feedback is auditable.

**Gates:** `OQ-PERM-01` (approve or reject proposed candidates), `SEC-AUTH-01`.

**Acceptance Criteria:**

**Given** a request with headcount 2 and two proposed candidates
**When** Carlos approves candidate A with written reason R1
**Then** filled slots show **1** and remaining **1**
**And** candidate A's proposal state is `approved` with R1 stored
**And** the request state is **still open** (SD-7)

**Given** the same request after approving candidate B
**When** both slots are now filled
**Then** filled slots show **2** and remaining **0**
**And** the request state remains **open** until Carlos explicitly closes it (SD-7)

**Given** a proposed candidate
**When** Carlos rejects with written reason R2
**Then** the proposal state is `rejected` with R2 stored
**And** the UM may propose replacement candidates while the request remains open

**Given** Carlos approves an internal candidate
**When** the approval commits
**Then** **no** `Relationship type=project` row is created (SD-3, AD-31)
**And** no project appears on the employee profile from this action alone

**Given** an actor without *approve or reject proposed candidates*
**When** they attempt to approve or reject
**Then** the response is `403`

**Given** Carlos attempts to approve without a non-empty written reason
**When** the action is submitted
**Then** the request is rejected with a validation error

### Story 1.6: Explicitly close a resourcing request

**ID:** `RS-E1-S1.6` · **Sprint key:** `1-6-explicitly-close-a-resourcing-request`

As a reviewing Delivery Manager with permission to close resourcing requests,
I want to close a request successfully or unsuccessfully,
So that the staffing cycle ends deliberately and no further proposals are accepted.

**Gates:** `OQ-PERM-01` (close resourcing requests).

**Acceptance Criteria:**

**Given** an open request with zero, partial, or full headcount filled
**When** Carlos closes the request as **successful**
**Then** the request state becomes `closed_successful`
**And** no further proposals or approvals are accepted

**Given** an open request
**When** Carlos closes the request as **unsuccessful**
**Then** the request state becomes `closed_unsuccessful`
**And** no further proposals or approvals are accepted

**Given** a closed request
**When** any active request-bound share links existed
**Then** all such links are inactive (Story 1.4 lifetime rule)

**Given** an actor without *close resourcing requests*
**When** they attempt to close a request
**Then** the response is `403`

**Given** a UM attempts to close a request
**When** the close action is submitted
**Then** the response is `403` — only the reviewing DM role closes requests (requirements §4.7 review and closing)

---

## Epic 2: Profile Request History (S15)

**Status:** backlog
**Slice-level preconditions:** S15 facade increment + Epic 1 review events.

Internal employees have a durable request-history section on their profile recording every resourcing proposal outcome and DM feedback, entitlement-gated per §3.2 S15.

**FRs covered:** `PM-FR-26`
**NFRs engaged:** NFR-1, NFR-2, NFR-5, NFR-6

### Story 2.1: S15 request history on profile

**ID:** `RS-E2-S2.1` · **Sprint key:** `2-1-s15-request-history-on-profile`

As a manager, people partner, or project-line viewer entitled to S15,
I want to read an employee's resourcing proposal history on their profile,
So that staffing decisions and feedback are visible in context without opening the Requests module.

**Gates:** S15 facade support in `access-control` (beyond ACM-5 kernel), `SEC-AUTH-01`.

**Acceptance Criteria:**

**Given** internal employee Eve was proposed, rejected with reason R, then proposed again and approved on the same request
**When** a Reporting-line manager of Eve calls `GET /users/:eveId/request-history`
**Then** the response is `200` with two history entries in chronological order showing `proposed → rejected` and `proposed → approved` with feedback text
**And** expected compensation level is **absent** from every entry (SD-5, PM-FR-26)

**Given** the same history
**When** Eve (Self) calls the endpoint
**Then** the response is `403` or an empty denial per §3.2 S15 Self column (no self-read of request history — test cases AC-M-S15-SE-W-DEN)

**Given** a People Partner entitled to Eve per matrix
**When** they call the endpoint
**Then** the response is `200` with the same history entries (reporting line, project line, and PP read per PM-FR-26)

**Given** a Colleague-tier viewer of Eve
**When** they call the endpoint
**Then** the response is `404` for hidden existence or `403` per PM/AD-24 — never a partial leak

**Given** an external candidate proposal
**When** history is queried for any user
**Then** no S15 row is created for the external candidate (history applies to internal employees only, PM-FR-26)

**Given** Epic 1 approval events
**When** history rows are written
**Then** writes occur in the same transaction as the approval/rejection mutation
**And** there is no public `POST /users/:id/request-history` route (AD-14)

---

## Step 4 Validation Summary

| Check | Result |
|---|---|
| Every in-scope PM-FR has ≥1 story | **PASS** — PM-FR-23..26 mapped |
| Stories have namespaced IDs | **PASS** — `RS-E1-S*` |
| Cross-context seams explicit | **PASS** — sharing port, AD-31, department routing |
| PP excluded from resourcing surfaces | **PASS** — SD-4 |
| Compensation leak paths banned | **PASS** — SD-5 in Stories 1.1, 2.1 |
| UX gap recorded | **PASS** — SD-1, no invented artboards |
| Registration gap recorded | **PASS** — `RS-E*` unregistered |
| Gates block false production claims | **PASS** — preconditions on every story |

**Open follow-ups (not stories):**

1. Register `RS-E*` in PRD §0.2 and `global-fr-epic-story-coverage.yaml`.
2. Create `_bmad-output/implementation-artifacts/resourcing/sprint-status.yaml` before sprint entry.
3. Run `bmad-ux` when resourcing surfaces need visual contract beyond RS-DR1..3.
4. Profile-sharing slice (`PM-FR-27`) must expose the port Story 1.4 calls.
