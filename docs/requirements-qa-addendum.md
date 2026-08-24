# Requirements Q&A Addendum

**Applies to:** *People Management Platform — Iteration 2*, version 1.2  
**Source:** Start-session Q&A transcript  
**Purpose:** Capture Q&A clarifications that are not already defined in the baseline. Normative requirements remain authoritative until formally updated.

## Confirmed clarifications

| Area | Clarification |
| --- | --- |
| Product baseline | Build the platform as a greenfield system. Do not assume access to an existing database, backend, or legacy system that can be used through middleware. |
| Integrations | Only external sources and entities explicitly named in the specification are required. |
| Integration data | A dedicated timetracker test entity with non-secret or pseudonymized data will be provided. |
| Repositories | Each team works in its own repositories. The provided backend and frontend starters may be adopted, modified, or replaced. |
| Technology stack | Node.js/JavaScript is recommended because supporting templates and rules are available. Other documented and communicated choices are allowed. |
| UI/UX | The supplied prototype is a mid-fidelity reference, not a mandatory visual design. Teams define the visual system and responsive behaviour. |
| Design artifacts | Figma is optional. Prototypes define layout, hierarchy, states, and flows; custom behaviour needs a separate specification. |
| AI tooling | Cursor, Codex, Claude Code, and other approved tools may be used. No single AI coding tool is mandatory. |
| Repository guardrails | Teams may add shared rules and reusable skills. Automated Git workflows must use protected branches and prevent uncontrolled writes to `main`. |
| Delivery process | Teams organise their own workflow. Jira is optional if work, ownership, decisions, and blockers remain visible. |
| Team roles | Participants may contribute outside their usual discipline and remain accountable for the result. This does not change platform user roles. |
| Checkpoints | Intermediate meetings are progress, question, and blocker syncs, not formal acceptance demos. |
| Evaluation | There is no guaranteed winning implementation. Production potential depends on quality, maintainability, code review, and architecture review. |

## Decisions still required

| Topic | Decision needed | Interim rule |
| --- | --- | --- |
| SSO and employee sync | Confirm scope and provide the identity provider, API, and test accounts. | Not mandatory until confirmed in writing. |
| Git hosting | Confirm whether GitHub, GitLab, or corporate hosting is required. | Either GitHub or GitLab is provisionally acceptable; all repository controls still apply. |
| Final deployment | No central hosting is promised. Resolve the conflict between the oral allowance for a local demo and the Definition of Done. | Plan for external deployment until the baseline is formally changed. |
| Final demo | Publish the required format and acceptance criteria. | Calendar invitations remain the operational source for timing. |

## No new decision from the Q&A

The Manager vs People Partner question was deferred. Apply baseline sections 2.1–2.2: Manager access is derived from hierarchy or project relationships; People Partner access is assignment-based, and the functional People Partner role has HR features but no resourcing features.
