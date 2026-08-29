---
title: Sprint Change Proposal — BA Alignment to Requirements v1.5
date: 2026-08-29
status: approved
implementationStatus: applied
mode: incremental
scope: business-analysis-artifacts-only
normativeSoT: docs/project-requirements.md
baseline: docs/project-requirements-v1.2.md
changelog: docs/requirements-changelog-v1.2-to-v1.5.md
---

# Sprint Change Proposal — BA Alignment to Requirements v1.5

## 1. Issue Summary

### Change trigger

The product baseline moved from requirements v1.2 to v1.5. The normative v1.5 document and its changelog introduce breaking changes to access audiences, organisational relationships, full-profile access, departments, sharing, resourcing, mentorship, employment lifecycle, integration guarantees, and the Definition of Done.

The existing BA artifacts were partially updated, but a full comparison found remaining v1.2-era rules in the People Management PRD, the User Management bounded-context PRD, and the active User Management epic/story plan. Several affected stories are already recorded as `review` or `in-progress`, which makes the drift an active implementation risk rather than an editorial issue.

### Evidence

| Source | Evidence |
| --- | --- |
| `docs/project-requirements-v1.2.md` | Previous baseline and original Manager-line, HR Admin, sharing, mentorship, lifecycle, and integration rules |
| `docs/project-requirements.md` | Normative v1.5 scope |
| `docs/requirements-changelog-v1.2-to-v1.5.md` | Breaking-change index and detailed delta evidence |
| People Management PRD | Still states immediate project revocation, project/UM parity, old timeline authorization, incomplete sharing/resourcing/lifecycle rules |
| User Management PRD | Still models mentorship as a generic relationship and treats business departure as deferred technical deactivation |
| User Management epics and sprint status | Active stories still encode registration, generic deactivation, PP/direct-UM-only timeline writes, and hard-deleted mentorship relationships |

### Problem statement

The BA layer does not consistently represent the normative v1.5 product contract. If implementation continues from the current story contracts, the team can ship behavior that violates privacy boundaries, lifecycle requirements, and required historical retention even while the traceability matrix reports the PRD layer as aligned.

## 2. Impact Analysis

### Epic impact

| Epic | Impact |
| --- | --- |
| UM Epic 1 — Employee Record Management | Correct seeded-import, identity-write, directory-filter, and lifecycle boundaries; retire generic deactivation story |
| UM Epic 2 — Magic-Link Authentication | Preserve feature; replace generic deactivation prerequisite with effective-departure account state |
| UM Epic 3 — Career Timeline | Expand automatic events; replace PP/direct-UM-only writes with matrix access plus functional permission; exclude departure event |
| UM Epic 4 — Organisational Relationships | Expand from reports-to only to the four v1.5 access-switch operations; add no-self-assignment and journal requirements; remove mentorship |
| New UM Epic 5 — Employment Lifecycle | Add record/schedule departure and effective-date execution stories; implementation blocked on CC-06 contract |
| Future Mentorship epic | Receives durable pair workflow removed from User Management generic relationships |

### Story impact

- Story 1.1 tracker key changes from registration to seeded import.
- Story 1.4 generic deactivation is removed from the active plan.
- Stories 1.2, 1.5, 2.2, and 3.1–3.3 require contract corrections.
- Epic 4 is reorganised into manager, People Partner, and department relationship stories.
- New Stories 5.1 and 5.2 cover departure.
- The old mentorship Story 4.2 is removed from User Management and handed to a dedicated mentorship backlog.

### Artifact conflicts

| Artifact | Required adjustment |
| --- | --- |
| People Management PRD | Correct access/revocation, permissions, journal, full-profile grant, risks, resourcing, sharing, mentorship, feedback, departments, lifecycle, integrations, NFRs, and open questions |
| User Management PRD | Correct bounded-context ownership, timeline authorization, employment lifecycle, mentorship ownership, and open questions |
| User Management epics | Reorganise affected epics/stories and add employment lifecycle |
| User Management sprint status | Reconcile keys and statuses without carrying review state across superseded contracts |
| Implementation story specs and compiled epic contexts | Stale after BA correction; regeneration is a separate handoff and must pass AD-1 human approval gates |

### Architecture, UX, and technical impact

- Architecture and application code are outside this BA run.
- Existing architecture decisions CC-04 and CC-06 remain implementation gates for People Partner storage and effective-date departure execution.
- No UX artifact exists for this bounded context; UX impact is recorded for later workflow planning.
- Current registration, deactivation, timeline, and mentorship code/specs may require rework after refreshed story approval. No such rework is authorized by this proposal.

## 3. Recommended Approach

### Selected path: Direct Adjustment with backlog reorganisation

Patch the existing PRDs and epic/story plan in place. Preserve stable paths, valid content, existing approved P-2 edits, and unaffected work. Add the missing v1.5 contracts and reorganise only the stories whose acceptance criteria are no longer valid.

| Option | Evaluation |
| --- | --- |
| Direct Adjustment | **Selected.** Medium effort, medium delivery risk, preserves valid work and traceability |
| Rollback | Not viable as primary path; would discard valid identity, authentication, and planning work |
| Retire derived PRDs | Not selected; would remove useful BA decomposition and break downstream links |
| Errata-only document | Not selected; leaves contradictory binding artifacts discoverable |

### MVP and timeline impact

The v1.5 MVP is not reduced. The proposal clarifies existing normative scope rather than adding features beyond v1.5. Security-sensitive relationship, departure, mentorship, and sharing implementation must wait for refreshed story contracts and applicable architecture decisions. Unaffected authentication and photo work may continue.

### Risk assessment

- **Privacy risk if unchanged:** high — project-line narrowing and shared-link behavior can be implemented incorrectly.
- **Lifecycle risk if unchanged:** high — generic deactivation cannot satisfy scheduled departure or immediate access termination.
- **Planning risk during correction:** medium — active story statuses and existing implementation specs must not be mistaken for approval of the new contracts.
- **Mitigation:** update BA artifacts first, reconcile tracker status, then regenerate implementation specs through AD-1 gates.

## 4. Detailed Change Proposals

### Proposal 1 — People Management PRD — Approved

**Artifact:** `_bmad-output/planning-artifacts/prds/prd-people-management-2026-08-24/prd.md`

**OLD:** Immediate project-access revocation; Project line described as equivalent to reporting management; incomplete functional permission list; incomplete full-profile/journal/org-change rules; no departure contract; partial resourcing and sharing rules; final-feedback mentorship closure; pseudonymised-real-data NFR; resolved questions still active.

**NEW:**

- Split access revocation guarantees into next-request platform relations, 15-minute project changes, and four-hour failed-sync withdrawal.
- Bind the narrower Project-line matrix and the approved CC-02 multi-audience behavior.
- Require both matrix access and functional permission for writes.
- Add the complete v1.5 permission catalogue, full-profile grant lifecycle, organisational-change rules, and narrow journal.
- Add temporal employment status, departure effects, nested departments, and department-based resourcing routing.
- Correct risk, resourcing, profile-sharing, mentorship, feedback, and integration behavior to v1.5.
- Use only the delivered seeded test population.
- Clean active/resolved questions while leaving real product/architecture gates explicit.
- Preserve FR-1–FR-38 identifiers and introduce FR-39–FR-42 for missing cross-cutting contracts.

**MVP impact:** No scope expansion beyond v1.5.

### Proposal 2 — User Management PRD — Approved

**Artifact:** `_bmad-output/planning-artifacts/prds/prd-user-management-2026-08-20/prd.md`

**OLD:** Mentorship is a generic hard-deleted relationship; PP storage is prematurely fixed; timeline writers are PP/direct UM only; generic technical deactivation substitutes for employment lifecycle; employment status is deferred.

**NEW:**

- Limit the context to identity, seeded population, authentication, organisational facts, career events, and employment lifecycle.
- Move mentorship pairs to a durable mentorship context and keep only their timeline integration here.
- Keep PP persistence unresolved pending CC-04 while retaining required business behavior.
- Gate manual timeline operations by S9 access and the runtime permission.
- Retain `isActive` only as an internal account/row-retention detail and remove generic product deactivation.
- Add temporal employment status and the complete departure outcome.
- State that departure is not a career-timeline event.
- Refresh sources, timestamp, and open questions.

### Proposal 3 — User Management Epics and Stories — Approved

**Artifact:** `_bmad-output/planning-artifacts/user-management/epics.md`

**OLD:** Active registration/deactivation contracts, technical-key directory filters, partial career events, PP/direct-UM-only timeline mutation, reports-to-only organisational scope, and hard-deleted mentorship relationships.

**NEW:**

- Correct Epic 1 identity, filtering, and seeded-population boundaries; remove active generic deactivation.
- Preserve Epic 2 and bind account denial to effective departure.
- Expand Epic 3 event coverage and permission-aware manual maintenance.
- Rebuild Epic 4 around manager, PP, employee department, and department-manager changes with no-self-assignment and journal requirements.
- Remove mentorship from generic User Management relationships and hand it to a separate durable workflow epic.
- Add Epic 5 for recording and executing departure, blocked on CC-06 for implementation.

### Proposal 4 — Sprint Status Reconciliation — Approved

**Artifact:** `_bmad-output/implementation-artifacts/user-management/sprint-status.yaml`

**OLD:** Tracker keys and statuses still refer to registration, generic deactivation, PP/direct-UM contracts, and hard-deleted mentorship while those artifacts are marked review/in-progress.

**NEW:**

- Rename Story 1.1 to seeded import and keep correction work in progress.
- Remove Story 1.4 generic deactivation from the active tracker.
- Reconcile impacted story status to `in-progress`; preserve unaffected Story 1.3 at `review`.
- Replace Epic 4 keys with manager, PP, and department relationship stories.
- Remove the User Management mentorship key.
- Add Epic 5 and two departure stories as backlog.
- Preserve implementation specs untouched and list them as stale handoff inputs.

## 5. Implementation Handoff

### Scope classification

**Moderate.** The product goal is unchanged, but multiple BA artifacts and active story contracts require backlog reorganisation and PO/Developer coordination.

### Handoff recipients

| Recipient | Responsibility |
| --- | --- |
| Product Owner / BA | Approve and maintain the corrected PRDs and epic/story contracts |
| Developer owners | Stop using superseded story specs; regenerate affected implementation stories after BA approval |
| Solution Architect | Resolve CC-04 and CC-06; bind storage/executor contracts before affected implementation |
| Mentorship feature owner | Create a dedicated durable-pair epic before mentorship implementation resumes |
| QA/QE | Refresh scenarios and negative coverage only after the corrected stories pass AD-1 stage-1 human approval |

### Ordered handoff

1. Apply the four approved BA artifact proposals.
2. Review the resulting PRDs, epics, and sprint tracker for v1.5 consistency.
3. Regenerate affected epic contexts and story specs in a separate workflow.
4. Obtain explicit human approval of each changed scenario contract before E2E or production changes.
5. Implement only after CC-04/CC-06 and other named architecture gates are resolved.

### Success criteria

1. Both PRDs name v1.5 as authoritative and contain no v1.2 behavior that contradicts it.
2. User Management epics no longer treat registration, generic deactivation, or mentorship hard deletion as valid product scope.
3. Access, sharing, resourcing, mentorship, feedback, department, and lifecycle rules match v1.5.
4. Sprint status contains only current story keys and does not preserve review status for superseded contracts.
5. No architecture, UX, implementation spec, test, or application code is modified in this BA run.

## 6. Checklist Status

| Section | Status | Notes |
| --- | --- | --- |
| 1. Trigger and context | Done | Cross-artifact v1.2→v1.5 baseline change; no single trigger story |
| 2. Epic impact | Done | UM Epics 1, 3, 4 changed; Epic 2 wording only; Epic 5 added |
| 3. Artifact conflicts | Done | Four BA/tracker artifacts selected; other layers handed off |
| 4. Path forward | Done | Direct Adjustment selected; rollback/reset rejected |
| 5. Proposal components | Done | Issue, impacts, approach, edits, MVP impact, and handoff documented |
| 6. Final review and handoff | Done | Complete proposal approved; four target artifacts applied and verified; handoff recorded |

## 7. Approval

Incremental edit approvals received on 2026-08-29:

- Proposal 1 — approved
- Proposal 2 — approved
- Proposal 3 — approved
- Proposal 4 — approved

Complete-proposal implementation approval received: **yes — 2026-08-29**.

## 8. Implementation Record

Applied on 2026-08-29:

- `_bmad-output/planning-artifacts/prds/prd-people-management-2026-08-24/prd.md`
- `_bmad-output/planning-artifacts/prds/prd-user-management-2026-08-20/prd.md`
- `_bmad-output/planning-artifacts/user-management/epics.md`
- `_bmad-output/implementation-artifacts/user-management/sprint-status.yaml`

Not modified by this BA run: architecture, UX, compiled epic contexts, implementation story specs, test cases, application code, or service repositories.

Handoff: Product Owner/BA maintains the corrected contracts; Developer owners regenerate affected story specs through AD-1; Architect resolves CC-04 and CC-06; Mentorship owner creates the durable-pair epic; QA/QE refreshes scenarios only after stage-1 human approval.
