# Spec changelog — v1.2 → v1.5

**Date:** 2026-08-25 · **In repository:** 2026-08-26

The spec has moved three revisions since the copy most teams were working from. This lists what changed and where. Two teams also have a full question-and-answer document; everything material from those is reflected here, so this file is sufficient on its own.

If you read nothing else, read the first section.

---

## Breaking — existing work may now be wrong

| Change | Where |
| --- | --- |
| **The access matrix has a new audience column.** "Manager line" splits into **Reporting line** and **Project line**. | §3.1, §3.2 |
| **The project line sees less.** PM and DM via project assignment lose S2 and S3 entirely, and get S5 as **CV and certificates only**. Everything else identical, including S6. | §3.3.2 |
| **Manager access derives from three relations, not two:** reports-to, **department management**, project assignment. | §2.1 |
| **"HR Admin" is no longer an audience.** It is a configuration role with no data access. Full profile access is a separate grant with its own mechanism. | §2.2, §2.4, §3.1 |
| **Manager, people partner and department are not writable through S1.** They are access switches with their own permission and screen. | §2.1, §3.2 fn 1 |
| **Shared links are not anonymous.** Authenticated recipient, explicitly named at creation. No "anyone with the link" mode. | §4.8 |
| **Every `cfg` section is off by default; only S1 is on.** Never-share set is **{S3, S7, S13, S14}**. | §4.8 |
| **Colleagues no longer see the leave type** — only the fact of an absence and its dates. | §3.3.4, S10 |
| **Risks cannot be closed.** Fixed severity order; "active" means any level above `low`. | §4.6 |
| **Joining interview feedback moves from S5 to S8.** | §4.15, S5, S8 |
| **Leave balances are removed** from the platform. | §4.3 |
| **No SSO, no Active Directory, no employee creation.** The population is a seeded list. | §4.17, §10 |
| **PeopleForce is now good-to-have**, reduced to a single prefill button. The timetracker is the only required integration. | §0, §5.2 |

---

## Roles and access

- **Two role dimensions must both permit an operation.** The access matrix says which sections an audience may read and write; the role × permission matrix says which functional roles hold which permissions. A write happens only where both allow it. — §2
- **HR Admin** is configuration only: custom fields, dictionaries, departments, roles and permissions. — §2.2
- **Full profile access** is a separate grant: only an existing holder grants it, no self-assignment, first holder seeded at deployment, removing the last holder blocked, every grant journaled. — §2.4
- **The "HR line"** is defined: the people partner's own manager chain inside HR, recursive, without limit. Not the employee's chain. — §2.1
- **Changing an organisational relationship is a distinct operation.** Four fields are covered: a person's manager, their people partner, their department, and a department's manager. Dedicated permission, dedicated screen, **no self-assignment**, journaled. — §2.1
- **Revocation timing is split.** Platform-owned relations take effect on the **next request**. Project-derived access within **15 minutes**, stated explicitly as an access guarantee. — §2.1, §5.1
- **The permission list has grown:** approve or reject candidates, close resourcing requests, edit the career timeline, create feedback, record a departure, manage departments, manage custom fields, change organisational relationships. Defaults are drafted by each team and confirmed by the PO before the roles screen is built. — §2.3
- **A journal exists** — narrow, not a general audit log. It records manager, people partner and department changes, department-manager changes, full-access grants, and shared-link accesses. — §3.4
- **One exception to the colleague whitelist:** a campaign author sees name and completion status for their own campaign's recipients only. Nothing else from S14, nothing in any other section, ends when the campaign closes. — §3.3.7
- There are now exactly **two** documented exceptions to "a manager sees everything": the narrowed project line, and the PM's flag-gated read of S7. — §3.3

## Departments

- **New entity.** Every employee belongs to exactly one department. Departments nest. — §4.17
- A manager can manage a department, and that grants Manager access to everyone in it and in its sub-departments. — §2.1
- **There is no separate "unit" entity.** *Unit Manager* is the role name for the manager of a department. S1 says "department". — §2.2, §4.17
- A **resourcing request carries a department**, and that field routes it to the responsible unit manager. — §4.7
- A department change emits a career-timeline event. The **CDS skills-matrix mapping keys off the department entity**, not a free-text string. — §4.9, §4.10

## Profile and sections

- **S10 for colleagues: dates only, type hidden.** Self, both manager lines and PP still see the type. — §3.3.4
- **Joining interview feedback is a feedback record**, governed by the *shared with employee* flag, rather than a document the employee can always read. — §4.15
- **Leave balances dropped**; self-service links to the timetracker instead. — §4.3
- **Employment status** is a time-bounded fact on the profile, values `active` / `dismissed`. — §4.16

## Risks

- Order: `low` < `need attention` < `medium` < `high` < `leaver`, with `leaver` at the top of the same scale. — §4.6
- **No resolved or terminal state.** The level moves from any state to any state, including down to `low`.
- **"Active" excludes `low`.** Dashboard counters ignore it.
- **Trend arrow** against the previous record; no arrow on the first record or an unchanged level.
- **`leaver` is a prediction**, not the fact of departure. The fact is `dismissed` in employment status. Never conflate the two.

## Resourcing

- **One vacancy entity, and it lives in the platform.** No PeopleForce vacancies anywhere in any spec, in either direction. — §4.7
- **Headcount field**, default 1. Approving a candidate fills a slot. **Only the DM's explicit close ends a request** — no auto-close.
- **Project reference is optional**; an unattached request is normal and appears in an **Unassigned** bucket on the dashboard, included in the all-projects counters. — §4.4.2
- **Expected compensation level** stays on the request. Visible to the request author, the routed UM and the reviewing DM. Not the PP. **Never on a profile, in a shared link, or in an export.**
- **The shared link is generated automatically on submission**, names the reviewing DM as recipient, and lives until the request is decided. Evaluation view: S1, S4, S11, S12, and S5 as CV plus certificates; S6 optional; never S2, S3, S7, S8.
- **Store the PeopleForce candidate ID** on every external candidate, whether or not any integration is built.

## Sharing

- Authenticated, explicitly named recipient. — §4.8
- All `cfg` off by default; only S1 on. Never-share set {S3, S7, S13, S14}.
- **The creator's access is re-checked on every view** — the link dies with the relationship.
- **Revocation and journal rights follow the current holder of the relationship**, not the creator. Full-access holders are the backstop. There must never be a link nobody can revoke.
- The career timeline is shareable but off by default.

## Mentorship and feedback

- **Closing a pair requires a closure note**, which is a **field on the pair record**, not a feedback record. Readable by the manager lines and PP only. — §4.11
- **The pool is company-wide**; it shows identity-card data plus the flag, and exposes nobody's S13. **Mentee selection stays scoped** to the assigner's own people.
- A person may **clear their open-to-mentoring flag while holding an active mentee**; active pairs are untouched.
- **Requested feedback:** the campaign tracks who responded, and the requester enters the received feedback manually as records. The campaign is the **only** distribution path for a form — do not build a second one. — §4.12, §4.15
- **"Comparison between periods" is removed.** Records are listed chronologically and filterable by period.

## Lifecycle and population

- **Creating employees is out of scope.** No provisioning flow, no AD. — §4.17, §10
- **The population is a seeded list**, generated and imported into the timetracker test environment, delivered **26 August**. Import it; that is who you work with.
- **No SSO.** Authentication is your own implementation over the seeded population.
- **Do not import real employee data** beyond the list you are given.
- **Departure** is recorded by HR with an effective date and a reason. On the effective date: profile read-only and out of the default list but still filterable; action items close as *cancelled — departed*; mentorship pairs auto-close with a system note, bypassing the closure-note gate; the account deactivates; **all access that person held ends immediately**. — §4.16
- **Departure is blocked while the person still manages or partners anybody**, with a prompt to re-parent first.
- **Leaving is not a career-timeline event.** It is employment status. — §4.9
- **One definition of a departure** — from employment status. Analytics defines nothing of its own. — §4.14

## Integrations

- **Timetracker is the only required integration.** Documentation and test environment are linked in the spec; the seeded users are already there. — §5.1
- Project assignment feeds the permission model, so its correctness is a security concern. Establish from the documentation whether you receive **events** or only **state at sync time**.
- **Outage behaviour:** serve last known data behind a visible banner, and **withdraw project-derived access after four hours** of failed sync.
- **PeopleForce is good-to-have** and reduced to one button: prefill profile fields from a candidate record by candidate ID, with a per-field preview and per-field confirmation, never silently overwriting a filled value. A fixed list of fields can never be prefilled — grade, seniority, employee type, department, manager, people partner, contract data, employment status, risk. — §5.2

## Notifications and analytics

- Both remain **good to have**, not required. — §4.13, §4.14
- If notifications are built, the definition of done is a **negative-test metric**: no notification contains a fact from a section closed to its recipient, asserted per type and per audience. Delivery statistics are not the measure.

## Process and Definition of Done

- **BMAD for the start of the project.** Migration to other tools may be considered by the team later, as a deliberate decision recorded in the repository rather than a drift. — §8.1
- **Foundation phase** is not a fixed set of streams. Research and align what is expensive to change later — prototyping approach, technology choices, testing architecture, anything else the team identifies — and write it down before implementation starts. — §8.4
- Definition of Done now also requires: negative tests for the narrowed project-line cells; a new functional role creatable through the UI without a deploy; organisational relationship changes journaled and not self-assignable; a shared link that works only for its named recipient and can always be revoked; the timetracker integration running against the test environment over the seeded population. — §9
