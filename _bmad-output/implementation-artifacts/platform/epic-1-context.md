# Epic 1 Context: Platform Spec v1.5 Alignment

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Bring the platform's planning, architecture, specification, and test-design documentation into alignment with the current v1.5 product contract and the ratified architecture. This is documentation and evidence work only: it must remove obsolete v1.2 assumptions without silently claiming delivery of product behavior, runtime integrations, or application code. The outcome is an accurate, traceable foundation for later feature work, particularly access control, TimeTracker integration, seeded-population operation, and release-quality evidence.

## Stories

- Story 1.1: Changelog Traceability Matrix
- Story 1.2: Platform PRD + Addendum Drift Close
- Story 1.3: Access-Control SPEC + Stage-1 Suite Alignment
- Story 1.4: Architecture Binding Updates
- Story 1.5: Dashboards + §4.4 v1.5 Fixed Facts
- Story 1.6: Platform Test-Design Refresh (v1.2 → v1.5)
- Story 1.7: UM Planning Residual (Non–Epic-2–4 Scope)
- Story 1.8: Doc Pass — Create-Path Removal from Binding Docs
- Story 1.9: Register Epic in Platform Sprint Status

## Requirements & Constraints

- Treat `docs/project-requirements.md` and the current People Management PRD as the product authority; use the v1.2→v1.5 changelog only to find deltas. Historical artifacts remain evidence, not current requirements.
- Preserve the v1.5 access model in all live documentation: Reporting line, Project line, and department-management access are distinct; a functional role never becomes a relationship audience; HR Admin is configuration-only and does not grant matrix data access. Full-profile access is a separate grant mechanism.
- Record the current HTTP denial oracle consistently: invalid or inactive session is 401; a missing or existence-hidden target is 404; a visible resource with a forbidden feature or action is 403. Lists omit invisible rows, and hidden-target denial precedes mutation permission checks.
- The product uses a seeded population. Do not describe employee creation, AD/SSO provisioning, or `POST /users` creation as current platform behavior. Keep owned `POST /users/:id/<collection>` routes outside that removal scope.
- TimeTracker is the required integration for leave and project/people data; project assignment is security-relevant and project-derived access must be withdrawn after four hours of failed sync. PeopleForce is a good-to-have, one-button prefill only: no silent overwrite, per-field confirmation, and no PeopleForce vacancies as a platform source of truth.
- Keep v1.5 fixed product facts explicit where relevant: the Project line is narrower than the Reporting line and requires negative coverage; the never-share set is S3, S7, S13, and S14; every `cfg` section defaults off except S1; active risk means above `low`; and an unattached resourcing request belongs in the Unassigned dashboard bucket.
- Test-design documentation must use the consolidated canonical architecture, QA, handoff, validation, index, and migration artifacts. When stating what a superseded artifact said, anchor that historical claim to the recorded commit rather than treating a reused filename as stable evidence.
- The functional quality gate remains open until its recorded P0 conditions actually pass: gate status PASS, P0 status MET, no critical items open, and ACM3-II-06 covered. Keep that state separate from ACM-9 performance evidence. ACM-9 measures the public Access Control facade at 500 requested active targets with warm p95 and worst case at or below two seconds; it is not evidence for directory-list performance.
- Live TimeTracker gate references use `TT-IDENTITY-01` and `TT-PMDM-01`, never the superseded `TIMETRACKER-CONTRACT`. Preserve the evidence caveat that their cited external API contract was untracked at the ratification pin; committing that contract is a separate owner decision.
- Documentation may annotate adjacent User Management and mentorship planning artifacts only where the Epic 1 acceptance criteria authorize it. Do not change application code, feature scope owned by User Management, or gate ownership merely to make a document appear complete.

## Technical Decisions

- Functional permission identity is the unique, append-only `Permissions.key`; display title is not an identity. Functional-role policies remain data-driven and distinct from access-role policy attachments.
- TimeTracker sync is the sole writer of project relationship data. Project membership cannot be edited by manual administration, HR administration, or resourcing fulfillment; its durable user join is `ttId`.
- User Management owns profile HTTP assembly and the `data` / `canEdit` envelope after Access Control section decisions. `canEdit` projects the same dual gate: feature permission plus section-write access.
- Preserve architecture namespace boundaries: PM decisions remain product-wide authority; Access Control Foundation decisions are Kernel-MVP slice scope and must not be presented as product-wide replacements.
- Architecture and test evidence distinguish ratified design from implementation. A completed documentation update never closes unresolved integration, coverage, runtime, or quality-gate debt.

## Cross-Story Dependencies

- Story 1.1 supplies the traceability and gate-alias discipline needed to assess the remaining stories; every Epic 1 story must be representable in the global coverage model or explicitly recorded as decision/gate-serving work without a product-FR owner.
- Stories 1.3 and 1.4 align access-control specifications and binding architecture around the same v1.5 audience model and denial oracle; runtime HTTP adoption remains a User Management responsibility.
- Story 1.6 depends on the canonical test-design set and must keep functional P0, ACM-9 performance, and TimeTracker contract caveats distinct. It cannot close unrelated runtime integration or directory-performance work.
- Story 1.7 is limited to planning residuals and must not re-scope User Management feature epics. Story 1.8 is a verification/documentation pass, not authorization to remove application routes. Story 1.9 provides the canonical platform tracking identities.
