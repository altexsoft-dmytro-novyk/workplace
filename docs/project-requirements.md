# Test Assignment: People Management Platform — Iteration 2

**Version:** 1.5
**Previous baseline:** [v1.2](project-requirements-v1.2.md)
**Change log:** [v1.2 → v1.5](requirements-changelog-v1.2-to-v1.5.md)
**Supersedes:** Test Assignment: People Management & Resourcing MVP (Iteration 1)
**Status:** Draft for review

---

## 0. How to read this document

This is the functional and technical scope for Iteration 2 of the AI-native SDLC bootcamp.

Two differences from Iteration 1 matter most:

1. **Mock data is no longer acceptable for the one required integration.** Iteration 1 stated "no external integrations, use seed/mock data." Iteration 2 requires a working integration with the internal timetracker, running against its test environment.
2. **Access control is a first-class requirement, not a footnote.** The profile is decomposed into sections, and every section has an explicit access level per audience. Sections 2 and 3 are normative — teams do not get to redesign them.

Sections marked **[NORMATIVE]** must be implemented as specified. Sections marked **[DESIGN FREEDOM]** state the outcome required; how you get there is yours. Sections marked **[GOOD TO HAVE]** are not required for this iteration.

---

## 1. Context and goals

Build a People Management Platform for an engineering organisation (500+ employees, distributed across departments and projects). The platform is intended to eventually replace or upgrade the current internal system.

**Priority order for this bootcamp.**

1. **Learning the AI-native development process** is the primary objective.
2. **A working, quality product** is the desired side effect.

Where the two conflict, process wins. A team that ships less functionality but demonstrates a clean spec-driven workflow, real parallelisation, and a well-maintained intelligent repository scores higher than a team that ships more by abandoning the process.

Stack is at your discretion, subject to Section 8.

---

## 2. Roles **[NORMATIVE]**

The system has **two independent role dimensions**. Do not collapse them into one list of roles — this is the single most common modelling mistake in this domain and it will make the permission model unmaintainable.

- **Access roles** answer *what data can this person see about that person.* There are exactly three, and they are derived from relationships, not assigned.
- **Functional roles** answer *what features does this person get.* They are assigned, and the set of them is extensible at runtime.

Full access to every section of every profile is neither of these. It is a separate grant with its own mechanism — see 2.4.

**Both dimensions must permit an operation.** The access matrix in 3.2 says which sections an audience may read and write. The role × permission matrix says which functional roles hold which feature permissions. A write happens only where both allow it: the matrix marking a section `RW` for an audience does not mean every member of that audience holds the permission to perform every write in it.

### 2.1 Access roles — derived from hierarchy

| Access role | How it arises |
| --- | --- |
| **Employee** | Everyone. Grants access to one's own profile (Self) and the colleague view of everyone else. |
| **Manager** | Arises from a relationship. If A manages B, A holds the Manager role *with respect to B*. |
| **People Partner** | Arises from assignment. If A is the assigned people partner of B, A holds the People Partner role with respect to B. |

**Hierarchy resolution [NORMATIVE].** Manager access is the **transitive closure of three relations**:

1. **Reports to** — B reports to A.
2. **Manages the department** — B belongs to a department managed by A, including nested departments.
3. **Manages the project** — B works on a project whose PM or DM is A.

Relations 1 and 2 are the **reporting line**. Relation 3 is the **project line**, and it grants a **narrower** set of sections — see 3.2 and rule 3.3.2. All three are transitive: anyone above a manager through the same kind of path inherits what that manager sees.

Consequences, all of which must hold:

- A manager two or more levels up sees everything about every person nested beneath them, without an explicit grant.
- A manager of a department sees everyone in it and in its sub-departments. Reports-to survives alongside this, because individual exceptions to the department tree are real.
- A DM sees the people on their projects; a PM sees the people on theirs; the DM sits above the PM in the same chain.
- Access is evaluated relationship-by-relationship. The same person can be a Manager with respect to one profile, a People Partner with respect to a second, and a plain colleague with respect to a third, within one session.
- When a project assignment, a department membership or a reporting line ends, the derived access ends with it. Managerial access is not sticky.

**People Partner resolution — the "HR line" [NORMATIVE].** People Partner access extends upward through **the people partner's own reporting chain inside HR**, recursively, without limit. If a people partner is assigned to an employee and that people partner reports to a more senior person within HR, the senior person holds People Partner access to the same employee, and so on up the HR chain. It does **not** walk up the employee's own chain, which climbs the delivery hierarchy and ends outside HR. Source of record: the reports-to relation restricted to the HR department.

**Changing a relationship is a distinct class of operation [NORMATIVE].** Four fields look like reference data but are access switches: change one and access changes immediately, for everyone nested beneath.

- The employee's **manager**, the employee's **people partner**, the employee's **department**, and a **department's manager**.
- None of them is covered by the write grant on the section that displays it. They are displayed on the profile and edited elsewhere.
- Changing any of them requires the dedicated *change organisational relationships* permission (2.3), on a dedicated screen.
- **No self-assignment.** Nobody may write themselves into the manager or people partner field of another person, or make themselves the manager of a department they are not already entitled to manage, whatever permissions they hold.
- Every change is journaled per 3.4.

**Timing of revocation [NORMATIVE].** Two different guarantees, deliberately:

- **Relations the platform owns** — manager, people partner, department membership, department management — take effect on the **next request**. No grace period, no re-login, no cache that outlives the change.
- **Project assignment**, which arrives from the timetracker, takes effect **within 15 minutes**. This is an access-control window, not a display-freshness window, and it must be documented as such wherever the platform states its access guarantees. See 5.1.

### 2.2 Functional roles — assigned

| Functional role | Features |
| --- | --- |
| **Unit Manager (UM)** | Department dashboard grouped by people. Resourcing: fulfils requests routed to their department, proposes candidates. Risks, action items, mentorship assignment, CDS records for their people. |
| **Delivery Manager (DM)** | Delivery dashboard grouped by project. Resourcing: creates requests, reviews and approves or rejects proposed candidates, closes requests, and sees requests created by the PMs of their projects. Risks, action items, CDS records for their people. |
| **Project Manager (PM)** | Same dashboard as the DM, scoped to their own projects. Resourcing: creates requests for their projects. Risks, action items, CDS records for their people. |
| **People Partner (PP)** | People partner dashboard. HR functionality: profiles, career timeline maintenance, CDS, feedback, campaigns, risks, recording departures. **No resourcing functionality.** |
| **HR Admin** | **Administration of the platform itself**: custom field definitions, system dictionaries, departments, functional roles and their permissions (2.3). |

**HR Admin grants no data access [NORMATIVE].** It is a feature-administration role. Somebody who needs to create custom profile fields gets exactly that, and does not thereby acquire the ability to read 500 people's personal contacts and documents. Reading data is governed by 2.1 and 2.4, never by holding a functional role. A DM sees the people on their projects because of the hierarchy rule in 2.1, not because they are a DM.

*Unit* survives only inside the role name **Unit Manager**, which means the manager of a department. There is no separate unit entity — see 4.17.

### 2.3 Functional roles are extensible **[NORMATIVE]**

The roles in 2.2 are the starting set, not the final one. Other parts of the organisation will need to use platform features for their own purposes — the IT department running its own security-awareness campaigns, for example — without becoming managers or people partners and without a code change.

Requirements:

- Functional roles and their permissions are **data, not code**. A new functional role can be created, named, and granted a set of feature permissions **through the UI**, by HR Admin, with no deploy and no schema change.
- People are assigned to functional roles through the UI.
- Feature permissions are granular. At minimum the following must be independently grantable:
  - create form campaigns
  - create action items
  - create and edit risks
  - create resourcing requests
  - fulfil resourcing requests
  - approve or reject proposed candidates
  - close resourcing requests
  - assign and end mentorships
  - maintain CDS records
  - edit the career timeline
  - create feedback
  - record a departure
  - manage custom fields
  - manage departments
  - change organisational relationships
  - view a given dashboard
- **Access roles (2.1) are not extensible this way.** A new functional role never widens what data its holders can see about a person; it only unlocks features. Where a feature needs data, it operates within the holder's existing access role. A newly created role that can send campaigns sees its audience through the colleague view, subject to the single exception in 3.3.7.
- Removing a permission from a role takes effect immediately for everyone holding it.

**Default assignments.** Which of the starting roles holds which permission on first launch is **drafted by the team from this document and confirmed by the PO** before the roles admin screen is built. Three points need explicit confirmation, because this document does not settle them: who may manage custom fields, who may assign mentors, and the defaults for *approve or reject proposed candidates*, *edit the career timeline* and *create feedback*.

### 2.4 Full profile access

The audience that sees every section of every profile exists, but it is **not** a functional role and is not bundled with one.

- Granted by its own mechanism, separately from functional roles, and only by somebody who already holds it.
- **No self-assignment.**
- The first holder is seeded at deployment.
- Removing the last holder is blocked — the system must never reach a state where nobody holds it.
- Every grant and revocation is journaled per 3.4.

---

## 3. Access model **[NORMATIVE]**

### 3.1 Principle

The employee profile is decomposed into **sections**. Access is granted per section, per audience. There is no "profile-level" permission.

Audiences in the matrix below:

- **Self** — the employee whose profile it is
- **Reporting line** — anyone holding Manager access through *reports to* or *department management*, per 2.1, and everyone above them through those paths
- **Project line** — the PM and DM of the person's projects, and everyone above them **through the project path only**
- **PP** — the assigned people partner and the HR line above them, as defined in 2.1
- **Colleague** — any authenticated employee holding none of the above roles with respect to this profile
- **Shared link** — an authenticated, explicitly named recipient of a generated link, see 4.8
- **Full access** — holders of the grant described in 2.4

Legend: `RW` = read and write · `R` = read only · `—` = no access, section not rendered at all · `cfg` = off by default, can be enabled per link · `never` = cannot be shared under any configuration

### 3.2 Section access matrix

| # | Section | Contents | Self | Reporting line | Project line | PP | Colleague | Shared link |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S1 | **Identity card** | Full name, photo, position, department, country and city, work email, work phone, birthday (day and month), company start date, manager, people partner, mentor, current project(s) | R (photo RW) | RW¹ | RW¹ | RW¹ | **R** | **on by default** |
| S2 | **Personal contacts** | Personal phone, personal email, messengers, residential address, current place of stay | **RW** | R | **—** | RW | — | cfg |
| S3 | **Emergency contacts** | Contact person, relationship, phone | **RW** | R | **—** | RW | — | never |
| S4 | **Employment** | Employee type (FTE / Subcontractor), grade, seniority, position history, English level, probation status, employment status (4.16), contract type | R | RW | RW | RW | — | cfg |
| S5 | **Documents** | Contract, W8, cooperation form, Diia City, CV, certificates | R (own) + upload certificates | R | **R — CV and certificates only** | RW | — | cfg |
| S6 | **Risks** | Current level, trend, description, details, date, full history | **—** | RW | RW | RW | — | cfg |
| S7 | **Management notes** | Free-form notes by managers and PP, each with visibility flags | R — only records flagged *visible for employee* | RW | **DM: RW · PM: R, and only records flagged *visible for PM*** | RW | — | never |
| S8 | **Feedbacks** | Structured feedback records, including joining interview feedback, see 4.15 | R — only records flagged *shared with employee* | RW | RW | RW | — | cfg |
| S9 | **Career timeline** | System-generated event log, see 4.9 | R | RW | RW | RW | — | cfg |
| S10 | **Leaves and absences** | Vacation, sick leave, parental leave, extended leave — dates and types | R | R | R | R | **R — dates only, type hidden** | cfg |
| S11 | **Projects** | Project, PM, DM, period | R | R | R | R | R (project name only) | cfg |
| S12 | **CDS** | Skills matrix link, assessment log, results, final conclusion, IDP | R (+ complete own IDP) | RW | RW | RW | — | cfg |
| S13 | **Mentorship** | Open-to-mentor flag, assigned mentor, assigned mentees, ended pairs, closure notes | RW (own flag), R (pairs) | RW | RW | RW | — | never |
| S14 | **Action items and tasks** | Tasks assigned to the person, including form tasks, see 4.5 | R (own) + mark complete | RW | RW | RW | — | never |
| S15 | **Request history** | Resourcing requests the person was proposed for: proposed → approved/rejected with feedback | — | R | R | R | — | cfg |
| S16 | **Custom fields** | See 4.1 | per field visibility | RW | RW | RW | per field visibility | cfg |

¹ The *manager*, *people partner* and *department* fields are displayed in S1 but are **not** writable through it. Changing them is a separate operation with its own permission — see 2.1.

### 3.3 Rules that follow from the matrix

**[NORMATIVE]**

1. **Every cell in the matrix is strict.** A section marked `—` for an audience must not reach that audience through any surface: not the UI, not the API, not an export, not a notification, not a search result, not an error message. The same applies to flag-gated records and to the narrowed cells. A leak is a critical defect, whichever section it happens in.
2. **Manager access comes in two tiers.** The reporting line sees everything a manager sees. The project line sees a **narrower** set: no S2, no S3, and S5 limited to CV and certificates. Everything else is identical, including S6 risks, which a delivery manager genuinely needs. Rationale: a delivery role needs skills, availability, risks and history; a residential address and an emergency contact serve line management and HR, and nothing in running a project requires them.
3. **S7 defaults to invisible to the employee and to PMs.** Every management note carries two independent flags, both off by default:
   - *visible for employee* — when set, the employee can read that record. Only that record.
   - *visible for PM* — when set, PMs in this person's project chain can read that record, read-only.
   The reporting line, DMs and PP can create, read and edit notes about the people they are responsible for, regardless of flags.
4. **Colleague view is a whitelist, not a blacklist.** A colleague sees exactly S1, the **dates** in S10 without the leave type, and the S11 project name. Everything else is absent. Do not implement this by hiding fields in the frontend — the API must not return them. A colleague sees that somebody is away from 12 to 19 August; they do not learn whether it is vacation, sick leave or parental leave.
5. **Access is evaluated server-side per section on every request.** A profile response is assembled from the sections the requester is entitled to, after resolving the requester's access role per 2.1.
6. **Custom fields carry their own visibility.** When a custom field is created, its visibility level is set: *management* (default), *employee* (also visible to Self), or *colleague* (also visible to everyone). Filters and list columns respect it: a user filtering the All Employees list must not be able to infer a value they cannot see.
7. **Campaign senders are the one exception to the colleague whitelist.** Whoever created a form campaign (4.12) sees, **for that campaign only**, each recipient by name together with the status of that campaign's action item. Deliberately narrow:
   - that campaign's own recipients and nobody else;
   - the status of that campaign's action item and nothing else from S14 — no other task, no unrelated due date, no other campaign;
   - nothing in any other section: the sender still sees these people through the colleague view everywhere else;
   - it ends when the campaign is closed.
   No other feature may widen the colleague view. If a second such need appears, that is a product decision, not an implementation detail.

There are exactly **two** documented exceptions to "a manager sees everything": the narrowed set for the project line (rule 2) and the PM's flag-gated read of S7 (rule 3).

### 3.4 Relationship and grant journal

A narrow journal, not a general audit log. It records exactly the events that change who can see what:

- a change to a person's **manager**;
- a change to a person's **people partner**;
- a change to a person's **department**;
- a change to a **department's manager**;
- a grant or revocation of **full profile access** (2.4);
- an **access via a shared link** (4.8).

Each entry holds the actor, the subject, the before and after values, and the timestamp. Readable by holders of full profile access, and by the current manager and people partner of the subject.

---

## 4. Functional scope

### 4.1 All Employees / Our Team

A single list page that serves managers, people partners and ordinary employees. What differs is not the page but the data each audience is entitled to (Section 3).

**Requirements:**

- Tabular list of employees with sortable columns.
- **Any field that exists on a profile can be used as a filter and as a column.** Country, join year, years with the company (derived), gender, department, grade, position, employee type, English level, risk level, mentorship status, project, employment status, and every custom field.
- Derived fields count: "years with company" is filterable as a number even though only the join date is stored.
- **Custom fields**: new fields can be defined on the employee profile (text, number, date, single-select, multi-select, boolean) by whoever holds the *manage custom fields* permission, values set on profiles, and those fields used immediately as filters and columns. No deploy, no schema migration, no developer involvement.
- **Inline editing**: a column may be inline-editable; editing a cell writes through to the underlying field on the profile, subject to the access matrix. The manager, people partner and department fields are not inline-editable — see 2.1.
- **Saved views**: a filter and column configuration can be saved as a named view and appears as a tab. Multiple views coexist. Views are owned by their creator and can be shared with other managers. Example views (for reference, not for implementation): a manually-maintained "bench" list, a "needs a conversation" list, "everyone who joined this year in Poland", "all people open to mentoring".
- **Export**: the current view may be exported to an `.xlsx` file, containing only the columns the exporter is entitled to see.
- **Colleague mode**: same page, whitelist columns only. Clicking a row opens the limited profile view.

### 4.2 Employee Profile

The detail page for a person, assembled from the sections in 3.2 according to the viewer's resolved access role. A section the viewer has no access to is not rendered and not returned by the API.

The profile header shows the manager, the people partner and the mentor.

### 4.3 Self-service

The employee's own view of themselves.

An employee can:

- see their own grade, position, seniority, employment type, English level;
- see and edit personal contacts, residential address, place of stay, emergency contacts — without asking HR;
- upload a photo;
- see their own career timeline;
- see their own leaves, with a link to the timetracker page where they are managed;
- see their own projects;
- see their own CDS section: the current skills matrix of their department, past assessments, and their IDP, which they can mark as complete;
- see and manage their mentorship status;
- see feedback about themselves that has been explicitly shared with them, and management notes explicitly flagged visible for employee;
- see their own action items and form tasks, and mark them complete;
- upload certificates.

An employee **cannot** see their risk level, or any management note without the *visible for employee* flag. See 3.3.

### 4.4 Dashboards

Four dashboards. They share components and differ in grouping and in which functional blocks appear. Build one dashboard engine, not four pages.

#### 4.4.1 Unit Manager dashboard — grouped by people

- Summary counters: headcount of their people, **active risks by level** (active means any level above `low`, see 4.6), open action items, overdue action items, active resourcing requests, open form campaigns.
- Table of their people with risk status and trend, project, leave status, links to profiles.
- The manager's own action items sorted by due date, with overdue highlighted.
- Quick navigation to All Employees, saved views, resourcing, risk dashboard, mentorship hub, campaigns.

#### 4.4.2 Delivery Manager dashboard — grouped by project

The organising dimension is the project, not the person.

When the DM opens the page, it shows **one table per project** they are responsible for. Each table lists the people on that project with links to their profiles, their risk status and leave status. The counters at the top of the page — number of people, number of active risks broken down by level, number of open resourcing requests — are calculated across **all** the DM's projects.

At the top of the page there is a **project selector**, set to *All projects* by default. Selecting a specific project filters the whole page: only that project's table remains, and every counter is recalculated for that project alone. Clearing the selection returns to the all-projects view.

**Requests with no project** are a normal state (4.7), so they get an explicit **Unassigned** bucket. It behaves like any other group in the selector and is included in the all-projects counters, so the totals always add up to what the DM actually created.

The page also shows the DM's own resourcing requests and their state, including requests created by the PMs of their projects.

#### 4.4.3 Project Manager dashboard

Identical to the DM dashboard, scoped to the PM's own projects.

#### 4.4.4 People Partner dashboard

Same building blocks, scoped to the people the PP is assigned to, groupable by department or project. **No resourcing block.**

**[DESIGN FREEDOM]** HR-specific widgets are open for the team's own ideas. Suggestions to start from: incomplete profile data, upcoming CDS assessments, IDPs approaching their deadline, campaign completion rates, joiners and departures in the period. Better ideas are welcome and will be judged on usefulness to a real people partner.

### 4.5 Action items and tasks

Action items are the single task entity in the system. They appear on the employee's profile (S14), in self-service, and on the dashboards of the people responsible for them.

**Where they come from:**

1. **Created manually** by a manager or a PP, from the employee's profile or from their own dashboard, for any person they hold Manager or People Partner access over. Any additional functional role granted the *create action items* permission (2.3) can do the same, within its own access scope.
2. **Generated automatically by a form campaign** (4.12) — one action item per recipient when the campaign is activated, carrying the campaign's link and due date.

**Fields:** title, short description, assignee, author, due date, optional link, status, completion date, and the source (manual or campaign).

**Lifecycle:** `open` → `completed`. The assignee marks their own items complete, and the completion date is recorded and displayed. The author can cancel an item with a reason. An item past its due date is shown as overdue wherever it appears.

Visibility follows S14. The single exception is a campaign author's view of their own campaign's items, per 3.3.7.

### 4.6 Risks and Risk Dashboard

Deliberately simple.

**Per employee:** a risk record with a level, plus a description of the situation, details, and a date. History is retained; the current level is the most recent record.

**Levels, in ascending severity:** `low` < `need attention` < `medium` < `high` < `leaver`.

**A risk cannot be closed.** There is no resolved or terminal state. The level moves **from any state to any state, including down to `low`**.

**"Active" means any level above `low`.** A person sitting at `low` is not counted in the active-risk counters on any dashboard.

**Trend:** alongside the current level, show an arrow indicating whether the level has gone up or down compared with the previous record. No arrow when the level is unchanged or when this is the first record.

**`leaver` is a prediction, not a fact.** It means the person is likely to leave and is worth retaining; they are still working. The *fact* of having left is employment status (4.16), whose value is `dismissed`. The two must never be conflated in the UI, in reports or in queries — "we had 14 leavers last quarter" has to mean exactly one thing.

**Risk Dashboard** (separate page):

- Counts by level, with `medium`, `high` and `leaver` emphasised.
- A table of all people with risks, sorted by severity descending, then by date, showing the trend arrow.
- Filterable by department, project, PP, manager.
- Drill-through from a count to the filtered table, and from a row to the profile.
- Scoped to the people the viewer holds Manager or People Partner access over.

Never visible to the employee.

### 4.7 Resourcing

Available to UM, DM and PM, and to any functional role granted the corresponding permissions (2.3).

**There is one vacancy entity and it lives here.** A resourcing request is created and owned by this platform. It is not a copy, a projection or a mirror of anything in the recruiting system, and vacancies are not synchronised with PeopleForce in either direction.

**Request creation (DM, PM):** vacancy details and requirements, expected compensation level, duration, workload, **headcount** (default 1), and a **department**.

- The **department field determines which unit manager is responsible** for the request. This is how a request is routed.
- The **project reference is optional.** Requests are often created before the project exists in the system, and an unattached request is a normal state that surfaces in the Unassigned bucket on the dashboard (4.4.2).
- A DM sees both their own requests and those created by the PMs of their projects.

**Expected compensation level.** The compensation item in Section 10 concerns **employee compensation on a profile** — salary data, which lives in the financial system. A band on a vacancy is a different object and belongs here. It is visible to the request author, the routed UM and the reviewing DM. Not to the PP, who has no resourcing functionality and therefore no surface where it would appear. **Never in the S15 request history on a profile, never in a shared link, never in an export.**

**Request fulfilment (UM):** the UM sees incoming requests routed to their department and can

- select specialists from their department;
- **or** attach an external candidate, identified by their **PeopleForce candidate ID** and a link to that candidate;
- attach one or more candidates and submit for DM approval.

**Store the candidate ID.** Whatever else is or is not built, an external candidate on a request carries their PeopleForce candidate ID. It costs nothing to store, it is what makes 5.2 implementable later without a migration, and it is what lets a candidate who is eventually hired be linked back to the request they came from.

**Sharing happens on submission.** When an internal employee is submitted as a candidate, the platform **automatically generates a shared link** (4.8) to their profile and attaches it to the request, **naming the reviewing DM as its recipient**. Without it the journey does not work: the reviewing DM has no access to somebody who is not on their projects, and would see only an identity card. The link is created by the act of submitting, not by remembering to press a button, and its lifetime is **bound to the request** — it dies when the request is approved, rejected or withdrawn, rather than running on a fixed clock.

The evaluation view on that link contains **S1, S4, S11, S12, and S5 limited to CV and certificates**. **S6 risks** are excluded by default and may be enabled by the UM. **Never** S2, S3, S7, S8.

**Request review and closing (DM):** the DM sees the proposed candidates and, for each, approves the assignment or rejects it with a written reason. Approving a candidate fills one slot of the headcount; the request displays filled and remaining. **Only the DM's explicit close ends the request** — successfully or unsuccessfully. It does not auto-close when the last slot fills.

**Request history:** every attempt (proposed → approved/rejected, with feedback) is recorded and appears both in Resourcing → Requests and in the employee's profile section S15. Approval does not create a project record here: the person is assigned to the project in the timetracker, and the project appears on their profile after the next sync.

### 4.8 Profile sharing

A manager generates a shareable view of an employee's profile for somebody who does not hold Manager or People Partner access over that person — typically a DM evaluating a proposed candidate. Links are also generated automatically by resourcing (4.7).

**Links are not anonymous [NORMATIVE].**

- A link works **only for an authenticated user**.
- The **recipient is explicitly named when the link is created**, and only that person can open it. There is no "anyone with the link" mode.

Section rules:

- **Every `cfg` section is off by default. Only S1 is on by default.** The creator enables the rest per link.
- Sensitive sections — S2, S5, S6, S8 — must be re-enabled **explicitly on every link**. Being off by default and requiring explicit re-enabling are two different things and both apply to these four.
- **The never-share set is {S3, S7, S13, S14}.** These cannot be included under any configuration.
- **The career timeline (S9) is shareable but off by default.** It carries grade and transition history, so enabling it is a deliberate act. The matrix governs this; no other part of the platform may open or close it independently.

Lifecycle:

- The link expires. Default 24 hours, configurable at creation. Links generated by resourcing live until the request is decided.
- **The creator's own access is re-checked on every view.** A link is issued on the authority of a relationship, so when that relationship ends the link stops working immediately — no background job, no cleanup task. A recipient may lose access mid-task; that is intended, not a defect.
- **Revocation and journal rights follow the relationship, not the creator.** Whoever currently holds Manager or People Partner access over the subject can revoke any link to that profile and see who opened it. Holders of full profile access (2.4) are the backstop. The creator keeps nothing once their own access ends. There must never be a link nobody can revoke.
- A shared link never grants write access.
- Every access via a link is journaled per 3.4.

### 4.9 Career timeline

**Implementation model [NORMATIVE]:** the career timeline is a **system-generated event log**. The system writes an event whenever one of the tracked changes occurs; it is not a separately maintained record that somebody has to remember to update.

Tracked events: joining the company, grade change, position change, **department change**, FTE ↔ subcontractor transition, extended leave, mentorship pair start and end.

**Leaving the company is not a timeline event.** It is a fact about employment rather than about development, and it lives in employment status (4.16). Do not add a "left" event type here.

**Manual override:** whoever holds the *edit the career timeline* permission can **edit, delete and manually add** timeline events. Manual entries are needed for historical backfill — the current data lives only in a separate Excel headcount change record — and to correct events the system inferred wrongly.

Presentation: a visual chronological timeline on the profile. Events are typed and categorised, and must be readable as a timeline in their own right.

### 4.10 CDS — Career Development System

**Scope boundary, read this first:** assessments happen **outside** the system. The system does not implement the assessment, does not host the competency matrix, and does not compute scores. It is a registry and a hub. The matrix changes shape frequently and must never be encoded in the schema.

The CDS section on a profile contains:

- **A link to the current skills matrix file** for that person's department and position. The mapping keys off the **department entity** (4.17) and the position, and is maintained as a dictionary; the profile resolves and displays the correct current link. When the matrix file is updated centrally, every profile pointing at it reflects the change — which is why the key is the entity and not a free-text string.
- **An assessment log**: each completed CDS assessment with date, assessor, a link to the result file, and a **final conclusion** entered as text in the system.
- **An IDP**: one record per plan — a short description, a deadline, a link to the external IDP file, and a single **complete** checkbox. When the employee ticks it, the completion date is recorded and displayed alongside the deadline. An IDP with no completion date is *open*.

Whoever holds the *maintain CDS records* permission can create assessment records, edit conclusions, and create or update IDPs. The employee can read the section and mark their own IDP complete.

**Filtering from All Employees:**

- **Date of last assessment** — a date comparison offering *assessed before* a given date, *assessed after* a given date, and *between* two dates. The practical use is finding people not assessed for a long time, so *assessed before* is the primary case, and **never assessed** must be selectable as a distinct option rather than being lost as an empty value.
- **Has an open IDP** — yes or no.

### 4.11 Mentorship Hub

**On the employee's own profile (self-service):**

- Mark themselves as **open to mentoring**.
- See their assigned mentor, if one is assigned.
- See their assigned mentee(s), if any.

**For the manager line and PP:**

- A list of everyone who has flagged themselves as open to mentoring. **The pool is company-wide** — a good mentor for somebody in one department frequently sits in another, which is the point of a pool. The list shows identity-card data plus the flag; it does not expose anyone's S13 section. Visible to holders of the *assign and end mentorships* permission.
- Clicking a willing mentor opens an assignment flow. **Mentee selection is scoped** to people the assigner holds access over.
- On creation of the first pair, the person's mentorship status changes from **open to mentoring** to **mentor**. This status is a filterable field on All Employees.
- A view of all mentor–mentee pairs, active and ended, with start date, end date and status.

**Ending a mentorship:** a manager or PP ends a pair explicitly. The end date is recorded, and **a closure note is required to close it** — a pair cannot be ended without one. The closure note is a **field on the pair record, not a feedback record**: S8 has a single subject, and this note is about a pairing rather than a person. It is readable by the reporting line, the project line and PP; not by the mentor, not by the mentee, not by colleagues. Ended pairs remain visible in history on both profiles, and an end event is written to the career timeline (4.9). If the mentor has no other active mentees, their status returns to *open to mentoring*.

**Un-flagging.** A person may clear their open-to-mentoring flag while holding an active mentee. Doing so removes them from the pool for future assignments and does not touch active pairs; their status stays `mentor` while any pair is active.

**On any profile:** the mentor is displayed alongside the manager and the people partner in the profile header.

Not in scope for this iteration: mentoring goals, session logs, progress tracking.

### 4.12 Forms and Surveys as tasks

A simple flow. Do not build more than this.

1. A PP or a manager creates a **form** in the system: title, short description, purpose, a link to the external form, and a due date. The form itself lives outside the system — Microsoft Forms, Google Forms, or anything else.
2. They select the **audience** using the All Employees filter engine (4.1): build a filter, preview the resulting people, confirm. A saved view can be used as an audience. Individual people can be added or removed after the filter resolves. The resolved list is frozen when the campaign is activated; people who join later are not added.
3. Each recipient gets an **action item** (4.5) on their profile with the title, the sender, the due date and the link. Following the link opens the external form.
4. The recipient marks the action item complete when they have filled the form in. That is the completion signal — the system does not read the external form and does not verify anything.
5. The sender sees the campaign with a per-person table: who has completed, who has not, who is overdue. This is the documented exception in 3.3.7, limited to this campaign's recipients and this campaign's task status.

**The campaign is the only mechanism for distributing a form.** Requested feedback (4.15) uses it too. Do not build a second distribution path.

**Who can create campaigns:** PP and managers by default, plus any functional role granted the *create form campaigns* permission (2.3). This is the primary case for the extensible role model: the IT department should be able to run its own security-awareness campaigns without being given managerial access to anyone. A role that can create campaigns selects its audience within its own access scope.

### 4.13 Notifications **[GOOD TO HAVE]**

Not required for this iteration. If built: an in-app notification centre plus email, for action item assigned and overdue, risk created or escalated, IDP deadline approaching, resourcing request routed, candidate approved or rejected, mentorship pair created or ended.

Notification content respects the access matrix. A notification must never reveal a section the recipient cannot access — an employee never receives a notification about their own risk record, and a PM never receives one derived from a management note not flagged for them.

**Definition of done for this section**, if built: a negative-test metric modelled on the access-control tests in Section 9 — *no notification contains a fact from a section closed to its recipient*, asserted per notification type and per audience. Delivery statistics are not the measure. A notification is the one surface that reaches a person bypassing every screen where access is normally enforced, which makes it the leakiest part of the platform.

### 4.14 Analytics and reports **[GOOD TO HAVE]**

Analytics does not reuse the All Employees filter engine (4.1), because it does not operate on the employee entity alone. It has at least two kinds of subject:

- **People — current state.** Headcount by country, department, grade, position, employee type, gender, join year. Load per people partner and per manager.
- **Events — what happened in a period.** Joiners, departures, grade changes, department changes, risk changes, mentorship starts and ends. The data already exists as typed, dated events in the career timeline (4.9), risk history (4.6) and employment status (4.16) — reuse it rather than inventing a parallel store.

**One definition of a departure.** Analytics counts departures from employment status (4.16) and defines nothing of its own. Two definitions produce two different numbers for the same quarter, both "correct" by their own criterion.

**[DESIGN FREEDOM]** Suggested shape: one report page with a subject selector, a period picker for event-based subjects, a group-by dimension, and a chart plus a table. Every report exports to `.xlsx`. Adding a new report should mean registering a new subject and its dimensions, not building another page.

### 4.15 Feedback

- Feedback records are added on the employee's profile page by the manager line and PP, and by anyone holding the *create feedback* permission within their own access scope.
- A record contains: subject (the employee), author, date, context (project, event, period), and the feedback body.
- Each record carries a visibility flag: **management only** (default) or **shared with employee**.
- **Joining interview feedback is a feedback record**, not a document. It lives here rather than in S5 so that the employee sees it only if somebody deliberately shares it.
- **Requested feedback:** the requester runs a form campaign (4.12) targeted at named individuals. The campaign tracks who responded; **the requester then enters the received feedback manually as records here.** The system does not read the external form, so nothing becomes a record by itself.
- Records are listed chronologically and filterable by period. There is no comparison between periods — the body is free text and there is nothing to compare.
- Access per S8. A colleague cannot browse feedback about another person.

### 4.16 Employment status

Departure has to be recorded somewhere, or six months later the platform cannot answer how many people left in Q3. It is recorded here, and nowhere else.

- Employment status is a **time-bounded fact** with a start date and an end date — the same shape as the other temporal records in Section 6, not a flag on the profile.
- Values: `active` and `dismissed`. **`dismissed` is the fact of a person having left.** It is unrelated to the `leaver` risk level (4.6), which is a prediction about somebody still working.
- It is the **single source** for every consumer: the departures figure in analytics, exclusion from the default All Employees view, dashboard counters. Nothing computes its own definition.
- Filterable from All Employees, so "everyone who left in 2026" is a view like any other.

**Recording a departure.** HR records it in the platform, with an **effective date and a reason**, under the *record a departure* permission. On the effective date:

- the profile becomes read-only and drops out of the default employee list, while staying filterable;
- open action items close as *cancelled — departed*;
- active mentorship pairs end automatically with a system-generated closure note, **bypassing the mandatory-closure-note gate** in 4.11 — a departed person cannot supply one;
- the departed person's own account is deactivated;
- **all access that person held ends immediately** — the revocation rule in 2.1 covers departure as well as a relationship ending.

**When the departing person is a manager or people partner**, the platform **blocks recording the departure** while they still manage or partner anybody, and prompts to re-parent first, offering re-parenting to their own manager as a one-click default on the same screen. This prevents orphaned reports and lingering access in one step.

### 4.17 Population, departments and authentication

**Creating employees is out of scope for this iteration.** There is no provisioning flow to build, from Active Directory or anywhere else.

- **The initial population is a seeded list.** A test user list has been generated and imported into the timetracker test environment, and is delivered on **26 August**. Import it into the platform; those users are the population you work with, and leave and project data is synchronised from the timetracker for them (5.1).
- **No SSO.** Entra ID is not part of this scope. Authentication is your own implementation over the seeded population, and the seeded record is the identity anchor.
- **Do not import real employee data beyond the list you are given.** The delivered list is test data; that is what keeps Section 7's rule satisfied.

**Departments.** Every employee belongs to **exactly one department**. Departments **nest**. A manager can be the manager of a department, and that relation grants Manager access to everyone in it and in its sub-departments (2.1). There is no separate "unit" entity; *Unit Manager* is the role name for the manager of a department.

Departments are maintained under the *manage departments* permission. Changing a person's department, or a department's manager, is an access switch and follows the rules in 2.1: dedicated screen, dedicated permission, no self-assignment, journaled.

---

## 5. Integrations

### 5.1 Internal timetracker — leaves and projects **[REQUIRED]**

Two APIs are provided:

1. **Leaves** — vacation, sick leave, parental and other leave types, with dates and status.
2. **Projects and people** — projects, the people working on them, PM and DM.

Documentation and the test environment: **[TT-Bootcamp Data](https://asft-my.sharepoint.com/:f:/g/personal/nataliia_musiienko_altexsoft_com/IgBGylM7-nZ0Rpf5b7rtkbVUAROSwUubJ7Pq5L550_gQST0?e=zqbMhy)**. The seeded user list (4.17) is already imported there; synchronise for those users.

The second API is load-bearing beyond display: **project assignment is an input to the permission model** (2.1), so a person's PM and DM derive their access from it. Somebody assigning a person to a project in the timetracker is granting access inside this platform, having passed no gate here. Treat its correctness as a security concern rather than a data-quality nicety, and establish from the documentation whether the platform receives **events** or only **state at sync time** — that decides whether "why did this person have access on 14 August" is answerable at all.

**Freshness is an access-control window.** Project-assignment changes take effect within **15 minutes**, and the platform states that bound explicitly as an access guarantee.

**When the timetracker is unavailable**, the platform serves the **last known data**, behind a visible banner saying the data is not fresh, and **withdraws project-derived access after four hours** of failed sync, falling back to the relations it owns. Be clear-eyed about the trade-off: inside that window the platform may serve an access that no longer exists. That is a deliberate choice over hard-failing every access decision during each interruption — which is why the banner has to be visible rather than decorative.

### 5.2 PeopleForce — candidate prefill **[GOOD TO HAVE]**

Not required for this iteration. Build it only once the timetracker integration and the required functional scope are done.

**What this is, and what it is not.** The whole integration is **one button on an employee profile that prefills fields from a candidate record in PeopleForce, by candidate ID**. That is the entire scope. There is no synchronisation, no webhooks, no scheduled job, no background reconciliation, no writing back to PeopleForce, and no vacancy exchange in either direction. Somebody presses a button, data is proposed, a human confirms it.

The problem it solves is retyping. When a person is hired, recruiting already holds their name, contacts, links, CV and education.

**The flow:**

1. On an employee profile, a user with write access to the relevant sections presses **Prefill from PeopleForce**.
2. They supply the **PeopleForce candidate ID**. If this person was proposed as an external candidate on a resourcing request (4.7), the ID recorded there is offered as the default.
3. The platform fetches that candidate and shows a **preview of the mapping**: each incoming value next to the profile field it would land in, and next to whatever is currently in that field.
4. The user accepts or rejects **each field individually**. Nothing is written before confirmation.
5. On confirm, only the accepted fields are written. A field that already holds a value is never silently overwritten — a conflict is shown as a choice, not resolved for the user.
6. The candidate ID is stored on the profile as the permanent link back to the ATS record.

**Fields in scope for prefill** — candidate attributes only: full name, personal email, phone numbers, external links, country and city, CV and other candidate documents, education, previous experience, source, and candidate custom fields for which a mapping has been configured.

**Fields that must never be prefillable** — everything that is an internal decision rather than a fact about the candidate: grade, seniority, employee type, department, manager, people partner, contract data, employment status, risk. It must be structurally impossible to import them.

**Constraints:**

- Strictly one-way and read-only towards PeopleForce.
- The field mapping, including custom fields, is **configuration rather than hard-coded** — the candidate side changes without notice.
- Prefill writes through the normal access rules. The actor needs write access to a section to prefill into it; the button is not a way around 3.2.
- Pressing it twice with the same ID and the same choices changes nothing.

**The minimum viable version is the ID field alone** — a place to record the candidate ID with a link to PeopleForce, and no API call at all. That is genuinely useful on its own, and it is required regardless (4.7).

The API is documented at `https://developer.peopleforce.io`, including a machine-readable index at `https://developer.peopleforce.io/llms.txt` worth putting into the intelligent repository. Investigate authentication, the candidate endpoints, custom fields and rate limits yourselves, and record what you find as decisions in the repository.

---

## 6. Data model notes

Points where a naive model will not survive the requirements. Resolve these during the foundation phase.

- **Custom fields and arbitrary filtering** (4.1). Any field, including fields that do not exist yet, must be filterable and sortable. A column-per-field schema will not survive this.
- **The role model has three parts, not one** (Section 2). Access roles are computed from relationships; functional roles and their permissions are stored data that changes at runtime; full profile access is a separate grant again. Storing "is a DM" as a permission is the wrong answer.
- **Transitive access resolution over three graphs** — the reporting tree, the department tree, and project assignment — evaluated per request, per section, at acceptable cost, with the project path resolving to a narrower section set than the other two. Cache carefully: a stale permission cache is a data leak.
- **Temporal data.** Grade, position, department, employment type and employment status all change over time, and the history is required for the career timeline and for analytics. Model these as time-bounded records, not as scalar fields with an audit log bolted on.
- **Section-level access** (Section 3) is a property of the model, not a UI concern.
- **Identity across systems.** A person exists as a seeded platform record, as a timetracker user, and possibly as a PeopleForce candidate. Decide how identity is resolved and stored — email alone is not sufficient — and keep the candidate ID so a hired candidate can be linked to the request they came from.

---

## 7. Non-functional requirements

- **Access control correctness** is the primary quality attribute. Test it directly: for each audience, each relationship path and each section, assert what the API returns.
- **Personal data.** Work with the seeded test population (4.17) and nothing else. Do not import real employee data, and do not paste real personal data into agent contexts, logs, screenshots, or the repository.
- Performance: the All Employees list with 500+ records, arbitrary filters and derived fields responds within 2 seconds, including permission resolution.
- Availability: external integration failures degrade gracefully and never take down the application, within the limits stated in 5.1.
- Accessibility and responsive layout for the list, profile and dashboard pages.

---

## 8. Engineering process requirements **[NORMATIVE]**

These are the rules the bootcamp is actually testing. They are not optional and they are graded.

1. **BMAD is the framework**, at least for the start of the project. Migration to other tools and customisations may be considered by the team once work is under way, as a deliberate decision recorded in the repository rather than a drift.
2. **Parallel work over features is a strict rule.** Teams decompose so that members work in parallel on their own features. A situation where one person waits for another is unacceptable and will be treated as a process defect regardless of the output. Configure BMAD decomposition, the workspace, and submodules to make parallelism possible.
3. **Intelligent repository is mandatory.** You work with a workspace holding full context, not a single code repo: specs, decisions, call transcripts, external API documentation, agent rules and skills all live there.
4. **Start with a foundation phase.** Before development begins, the team researches and aligns on the things that are expensive to change later: prototyping and design approach, best practices and technology choices, testing architecture, and anything else the team identifies as foundational. Work in this phase runs in parallel across the team, with named owners per topic; the point is that findings are **aligned and written down** before implementation starts, not that there is a fixed number of streams. Prototyping is expected to produce HTML prototypes rather than generated design artefacts, because HTML transforms into real components. Best practices are found by the team via AI and written up as rules and skills — nobody hands you a curated list.
5. **Communication is captured.** Inter-team communication and status are collected for analysis. Expect the problems you hit to become the input for the next iteration.

---

## 9. Definition of Done

A module is done when:

- functionality matches this document, including the role model in Section 2 and the access matrix in Section 3;
- access control is covered by tests per audience, per relationship path and per section, including negative tests for every `—` cell, for the narrowed project-line cells, for unflagged S7 records against both the employee and a PM, and for the colleague whitelist including the campaign-sender exception in 3.3.7;
- a new functional role can be created and granted permissions through the UI, without a deploy;
- organisational relationship changes and full-access grants cannot be self-assigned, and appear in the journal (3.4);
- a shared link works only for its named authenticated recipient, stops working when its creator's access ends, and can always be revoked by whoever currently holds the relationship;
- the timetracker integration runs against the test environment, over the seeded population;
- the test architecture agreed in the foundation phase is actually applied — not an afterthought;
- specs in the intelligent repository match the shipped behaviour;
- the module is deployed and demonstrable, not running on somebody's laptop.

---

## 10. Out of scope

- **Employee provisioning.** No creation flow, no Active Directory integration. The population is seeded (4.17).
- **SSO.** No Entra ID; authentication is over the seeded population.
- **Compensation and salary data.** There is no compensation section on the profile. The expected compensation level on a resourcing request is a different object (4.7).
- **Leave balances.** Not shown in the platform; the employee's view links to the timetracker.
- **Pre-onboarding.** Creating a person before their first working day, and pulling their data from the ATS on offer acceptance, is deferred to a later iteration.
- **Email template management** (eSender replacement). Deferred.
- **Performing competency assessments.** The system links to matrices and records outcomes; assessment happens outside (4.10).
- **Learning management.** LMS functionality is a separate track and must not be duplicated here.
- **Mentorship goals, session logs and progress tracking.** Pair formation, ending and visibility only.
- **Project allocation percentages.** Projects are shown; workload distribution is not modelled in this iteration.
- **Vacancy synchronisation with PeopleForce.** The resourcing request is a platform entity with no counterpart in the recruiting system.
