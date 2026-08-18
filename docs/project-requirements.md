# Test Assignment: People Management Platform — Iteration 2

**Version:** 1.2
**Supersedes:** Test Assignment: People Management & Resourcing MVP (Iteration 1)
**Status:** Draft for review

---

## 0. How to read this document

This is the functional and technical scope for Iteration 2 of the AI-native SDLC bootcamp.

Two differences from Iteration 1 matter most:

1. **Mock data is no longer acceptable for integrations.** Iteration 1 stated "no external integrations, use seed/mock data." Iteration 2 requires a working integration with the internal timetracker, and candidate data pulled from PeopleForce where the API allows.
2. **Access control is a first-class requirement, not a footnote.** The profile is decomposed into sections, and every section has an explicit access level per audience. Sections 2 and 3 are normative — teams do not get to redesign them.

Sections marked **[NORMATIVE]** must be implemented as specified. Sections marked **[DESIGN FREEDOM]** state the outcome required; how you get there is yours. Sections marked **[GOOD TO HAVE]** are not required for this iteration.

---

## 1. Context and goals

Build a People Management Platform for an engineering organisation (500+ employees, distributed across units and projects). The platform is intended to eventually replace or upgrade the current internal system.

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

### 2.1 Access roles — derived from hierarchy

| Access role | How it arises |
| --- | --- |
| **Employee** | Everyone. Grants access to one's own profile (Self) and the colleague view of everyone else. |
| **Manager** | Arises from a relationship. If A manages B, then A holds the Manager role *with respect to B* and sees everything a manager is entitled to see about B. |
| **People Partner** | Arises from assignment. If A is the assigned people partner of B, A holds the People Partner role with respect to B. |

**Hierarchy resolution [NORMATIVE].** Manager access is the **transitive closure of two relations**:

1. **Reports to** — B reports to A.
2. **Is assigned to a project managed by** — B works on a project whose PM or DM is A.

Consequences, all of which must hold:

- A manager two or more levels up sees everything about every person nested anywhere beneath them, without needing an explicit grant.
- A DM sees full information about every person on their projects, at the same level as that person's own unit manager. Project assignment grants managerial access.
- A PM sees the people on their projects; the DM sits above the PM in the same chain and therefore sees everything the PM sees, plus the rest of their projects.
- Access is evaluated relationship-by-relationship. The same person can be a Manager with respect to one profile, a People Partner with respect to a second, and a plain colleague with respect to a third, within a single session.
- When a project assignment ends, the derived access ends with it. Managerial access is not sticky.

There is exactly one documented exception to "Manager sees everything": management notes visible to a PM (S7). See 3.3.

### 2.2 Functional roles — assigned

| Functional role | Features |
| --- | --- |
| **Unit Manager (UM)** | Unit dashboard grouped by people. Resourcing: fulfils requests, proposes candidates. Risks, action items, mentorship assignment, CDS records for their people. |
| **Delivery Manager (DM)** | Delivery dashboard grouped by project. Resourcing: creates requests, reviews and approves or rejects proposed candidates, and sees the requests created by the PMs of their projects. Risks, action items, CDS records for their people. |
| **Project Manager (PM)** | Same dashboard as the DM, scoped to their own projects. Resourcing: creates requests for their projects. Risks, action items, CDS records for their people. |
| **People Partner (PP)** | People partner dashboard. All HR functionality: profiles, career timeline maintenance, CDS, feedback, campaigns, risks. **No resourcing functionality.** |
| **HR Admin** | Everything a PP has, plus custom field definitions, system dictionaries, and management of functional roles and their permissions (2.3). |

Functional roles never grant data access on their own. A DM sees the people on their projects because of the hierarchy rule in 2.1.

### 2.3 Functional roles are extensible **[NORMATIVE]**

The roles in 2.2 are the starting set, not the final one. Other parts of the organisation will need to use platform features for their own purposes — for example, the IT department creating its own security-awareness campaigns for a chosen audience — without becoming managers or people partners and without a code change.

Requirements:

- Functional roles and their permissions are **data, not code**. A new functional role can be created, named, and granted a set of feature permissions **through the UI**, by HR Admin, with no deploy and no schema change.
- People are assigned to functional roles through the UI.
- Feature permissions are granular. At minimum the following must be independently grantable: create form campaigns, create action items, create and edit risks, create resourcing requests, fulfil resourcing requests, assign mentors, maintain CDS records, manage custom fields, view a given dashboard.
- **Access roles (2.1) are not extensible this way.** A new functional role never widens what data its holders can see about a person; it only unlocks features. Where a feature needs data, it operates within the holder's existing access role. A newly created role that can send campaigns sees the audience through the colleague view unless it also holds a Manager or People Partner relationship.
- Removing a permission from a role takes effect immediately for everyone holding it.

---

## 3. Access model **[NORMATIVE]**

### 3.1 Principle

The employee profile is decomposed into **sections**. Access is granted per section, per audience. There is no "profile-level" permission.

Audiences in the matrix below:

- **Self** — the employee whose profile it is
- **Manager line** — anyone holding the Manager access role with respect to this employee, per 2.1: their UM, the PM and DM of their projects, and everyone above any of those
- **PP** — the assigned people partner and the HR line above them
- **Colleague** — any authenticated employee who holds none of the above roles with respect to this profile
- **Shared link** — a viewer accessing via a generated link, see 4.8
- **HR Admin** — full access to everything

Legend: `RW` = read and write · `R` = read only · `—` = no access, section not rendered at all · `cfg` = off by default, can be enabled per link

### 3.2 Section access matrix

| # | Section | Contents | Self | Manager line | PP | Colleague | Shared link |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S1 | **Identity card** | Full name, photo, position, department/unit, country and city, work email, work phone, birthday (day and month), company start date, manager, people partner, mentor, current project(s) | R (photo RW) | RW | RW | **R** | on by default |
| S2 | **Personal contacts** | Personal phone, personal email, messengers, residential address, current place of stay | **RW** | R | RW | — | cfg |
| S3 | **Emergency contacts** | Contact person, relationship, phone | **RW** | R | RW | — | — |
| S4 | **Employment** | Employee type (FTE / Subcontractor), grade, seniority, position history, English level, probation status, employment status, contract type | R | RW | RW | — | cfg |
| S5 | **Documents** | Contract, W8, cooperation form, Diia City, CV, joining interview feedback, certificates | R (own) + upload certificates | R | RW | — | cfg |
| S6 | **Risks** | Current level, trend, description, details, date, full history | **—** | RW | RW | — | cfg |
| S7 | **Management notes** | Free-form notes by managers and PP, each with visibility flags | R — only records flagged *visible for employee* | RW. **PM exception: R, and only records flagged *visible for PM*** | RW | — | — |
| S8 | **Feedbacks** | Structured feedback records, see 4.15 | R — only records flagged *shared with employee* | RW | RW | — | cfg |
| S9 | **Career timeline** | System-generated event log, see 4.9 | R | RW | RW | — | cfg |
| S10 | **Leaves and absences** | Vacation, sick leave, parental leave, extended leave — dates and types | R | R | R | **R, including type** | cfg |
| S11 | **Projects** | Project, PM, DM, period | R | R | R | R (project name only) | cfg |
| S12 | **CDS** | Skills matrix link, assessment log, results, final conclusion, IDP | R (+ complete own IDP) | RW | RW | — | cfg |
| S13 | **Mentorship** | Open-to-mentor flag, assigned mentor, assigned mentees, ended pairs | RW (own flag), R (pairs) | RW | RW | — | — |
| S14 | **Action items and tasks** | Tasks assigned to the person, including form tasks, see 4.5 | R (own) + mark complete | RW | RW | — | — |
| S15 | **Request history** | Resourcing requests the person was proposed for: proposed → approved/rejected with feedback | — | R | R | — | cfg (a DM sees their own requests natively) |
| S16 | **Custom fields** | See 4.1 | per field visibility | RW | RW | per field visibility | cfg |

### 3.3 Rules that follow from the matrix

**[NORMATIVE]**

1. **Every cell in the matrix is strict.** A section marked `—` for an audience must not reach that audience through any surface: not the UI, not the API, not an export, not a notification, not a search result, not an error message. The same applies to flag-gated records. A leak is a critical defect, whichever section it happens in.
2. **S7 defaults to invisible to the employee and to PMs.** Every management note carries two independent flags, both off by default:
   - *visible for employee* — when set, the employee can read that record. Only that record.
   - *visible for PM* — when set, PMs in this person's project chain can read that record, read-only.
   UM, DM and PP can create, read and edit notes about the people they are responsible for, regardless of flags. This is the one documented exception to "a Manager sees everything" in 2.1: a PM is a Manager for every other section but a flag-gated reader for S7.
3. **Colleague view is a whitelist, not a blacklist.** A colleague sees exactly S1, S10 including leave type, and the S11 project name. Everything else is absent. Do not implement this by hiding fields in the frontend — the API must not return them.
4. **Access is evaluated server-side per section on every request.** A profile response is assembled from the sections the requester is entitled to, after resolving the requester's access role per 2.1.
5. **Custom fields carry their own visibility.** When a custom field is created, its visibility level is set: *management* (default), *employee* (also visible to Self), or *colleague* (also visible to everyone). Filters and list columns respect it: a user filtering the All Employees list must not be able to infer a value they cannot see.

---

## 4. Functional scope

### 4.1 All Employees / Our Team

A single list page that serves managers, people partners and ordinary employees. What differs is not the page but the data each audience is entitled to (Section 3).

**Requirements:**

- Tabular list of employees with sortable columns.
- **Any field that exists on a profile can be used as a filter and as a column.** Country, join year, years with the company (derived), gender, department, grade, position, employee type, English level, risk level, mentorship status, project, and every custom field.
- Derived fields count: "years with company" is filterable as a number even though only the join date is stored.
- **Custom fields**: HR Admin and managers can define new fields on the employee profile (text, number, date, single-select, multi-select, boolean), set values on profiles, and immediately use those fields as filters and columns. No deploy, no schema migration, no developer involvement.
- **Inline editing**: a column may be inline-editable; editing a cell writes through to the underlying field on the profile, subject to the access matrix.
- **Saved views**: a filter and column configuration can be saved as a named view and appears as a tab. Multiple views coexist. Views are owned by their creator and can be shared with other managers. Example views (just for reference, not for the implementation): a manually-maintained "bench" list, a "needs a conversation" list, "everyone who joined this year in Poland", "all people open to mentoring".
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
- see their own leaves and balances, with a link to the timetracker page to manage them;
- see their own projects;
- see their own CDS section: the current skills matrix of their actual department, past assessments, and their IDP, which they can mark as complete;
- see and manage their mentorship status;
- see feedback about themselves that has been explicitly shared with them, and management notes explicitly flagged visible for employee;
- see their own action items and form tasks, and mark them complete;
- upload certificates.

An employee **cannot** see their risk level, or any management note without the *visible for employee* flag. See 3.3.

### 4.4 Dashboards

Four dashboards. They share components and differ in grouping and in which functional blocks appear. Build one dashboard engine, not four pages.

#### 4.4.1 Unit Manager dashboard — grouped by people

- Summary counters: headcount of subordinates, active risks by level, open action items, overdue action items, active resourcing requests, open form campaigns.
- Table of subordinates with risk status, project, leave status, links to profiles.
- The manager's own action items sorted by due date, with overdue highlighted.
- Quick navigation to All Employees, saved views, resourcing, risk dashboard, mentorship hub, campaigns.

#### 4.4.2 Delivery Manager dashboard — grouped by project

The organising dimension is the project, not the person.

When the DM opens the page, it shows **one table per project** they are responsible for. Each table lists the people on that project with links to their profiles, their risk status and leave status. The counters at the top of the page — number of people, number of risks broken down by level, number of open resourcing requests — are calculated across **all** the DM's projects.

At the top of the page there is a **project selector**, set to *All projects* by default. Selecting a specific project filters the whole page: only that project's table remains, and every counter is recalculated for that project alone. Clearing the selection returns to the all-projects view.

The page also shows the DM's own resourcing requests and their state, including requests created by the PMs of their projects.

#### 4.4.3 Project Manager dashboard

Identical to the DM dashboard, scoped to the PM's own projects.

#### 4.4.4 People Partner dashboard

Same building blocks, scoped to the people the PP is assigned to, groupable by department or project. **No resourcing block.**

**[DESIGN FREEDOM]** HR-specific widgets are open for the team's own ideas. Suggestions to start from: incomplete profile data, upcoming CDS assessments, IDPs approaching their deadline, campaign completion rates, joiners and leavers in the period. Better ideas are welcome and will be judged on usefulness to a real people partner.

### 4.5 Action items and tasks

Action items are the single task entity in the system. They appear on the employee's profile (S14), in self-service, and on the dashboards of the people responsible for them.

**Where they come from:**

1. **Created manually** by a manager (UM, DM, PM) or a PP, from the employee's profile or from their own dashboard, for any person they hold Manager or People Partner access over. Any additional functional role granted the *create action items* permission (2.3) can do the same, within its own access scope.
2. **Generated automatically by a form campaign** (4.12) — one action item per recipient when the campaign is activated, carrying the campaign's link and due date.

**Fields:** title, short description, assignee, author, due date, optional link, status, completion date, and the source (manual or campaign).

**Lifecycle:** `open` → `completed`. The assignee marks their own items complete, and the completion date is recorded and displayed. The author can cancel an item with a reason. An item past its due date is shown as overdue wherever it appears.

### 4.6 Risks and Risk Dashboard

Deliberately simple.

**Per employee:** a risk record with level — `low`, `need attention`, `medium`, `high`, `leaver` — plus a description of the situation, details, and a date. Risk history is retained; the current level is the most recent record.

**Trend:** alongside the current level, show an arrow indicating whether the risk has gone up or down compared with the previous record. No arrow when the level is unchanged or when this is the first record.

**Risk Dashboard** (separate page):

- Counts by level, with `medium`, `high` and `leaver` emphasised.
- A table of all people with risks, sorted by severity descending, then by date, showing the trend arrow.
- Filterable by unit, department, project, PP, manager.
- Drill-through from a count to the filtered table, and from a row to the profile.
- Scoped to the people the viewer holds Manager or People Partner access over.

Never visible to the employee.

### 4.7 Resourcing

Available to UM, DM and PM, and to any functional role granted the corresponding permission (2.3).

**Request creation (DM, PM):** vacancy details and requirements, expected compensation level, duration, workload. A request **may** reference a project, but does not have to — requests are often created before the project exists in the system, and an unattached request is a normal state. A DM sees both their own requests and those created by the PMs of their projects.

**Request fulfilment (UM):** the UM sees incoming requests assigned to them and can

- select specialists from their unit;
- **or** attach an external candidate from PeopleForce (5.2);
- attach one or more candidates and submit for DM approval.

**Request review (DM):** the DM sees proposed candidates. For an internal employee, the link leads to their profile — which the DM may not yet have access to, so profile sharing (4.8) applies. For an external candidate, the link leads to the candidate's data pulled from PeopleForce, or, where that integration is not implemented, simply to an external link to the candidate in PeopleForce. For each candidate, the DM approves the assignment or rejects it with a written reason.

**Request history:** every attempt (proposed → approved/rejected, with feedback) is recorded and appears both in Resourcing → Requests and in the employee's profile section S15. Approval does not create a project record here: the person is assigned to the project in the timetracker, and the project appears on their profile after the next sync.

### 4.8 Profile sharing

A manager generates a shareable view of an employee's profile for someone who does not hold Manager or People Partner access over that person — typically a DM evaluating a proposed candidate.

- The manager selects which sections are included, per section, per the `cfg` column in 3.2.
- Sensitive sections (S2, S5, S6, S8) are excluded by default and must be explicitly enabled each time. S3, S7 and S13 can never be shared.
- The link expires. Default 24 hours, configurable at creation.
- Every access via the link is logged: when, from where.
- Revocable before expiry.
- A shared link never grants write access.

### 4.9 Career timeline

**Implementation model [NORMATIVE]:** the career timeline is a **system-generated event log**. The system writes an event whenever one of the tracked changes occurs; it is not a separately maintained record that someone has to remember to update.

Tracked events: joining the company, grade change, position change, department change, FTE ↔ subcontractor transition, extended leave, mentorship pair start and end.

**Manual override:** PP and UM can **edit, delete and manually add** timeline events. Manual entries are needed for historical backfill — the current data lives only in a separate Excel headcount change record — and to correct events the system inferred wrongly.

Presentation: a visual chronological timeline on the profile. Events are typed and categorised, and must be readable as a timeline in their own right.

### 4.10 CDS — Career Development System

**Scope boundary, read this first:** assessments happen **outside** the system. The system does not implement the assessment itself, does not host the competency matrix, and does not compute scores. It is a registry and a hub. This is a deliberate decision — the matrix changes shape frequently and must never be encoded in the schema.

The CDS section on a profile contains:

- **A link to the current skills matrix file** for that person's department and position. The mapping department + position → matrix file is maintained as a dictionary; the profile resolves and displays the correct current link. When the matrix file is updated centrally, every profile pointing at it reflects the change.
- **An assessment log**: each completed CDS assessment with date, assessor, a link to the result file, and a **final conclusion** entered as text in the system.
- **An IDP**: one record per plan, consisting of a short description, a deadline, a link to the external IDP file, and a single **complete** checkbox. When the employee ticks it, the completion date is recorded and displayed alongside the deadline. An IDP with no completion date is *open*.

Manager and PP can create assessment records, edit conclusions, and create or update IDPs. The employee can read the section and mark their own IDP complete.

**Filtering from All Employees:**

- **Date of last assessment** — a date comparison, offering *assessed before* a given date, *assessed after* a given date, and *between* two dates. The practical use is finding people not assessed for a long time, so *assessed before* is the primary case, and **never assessed** must be selectable as a distinct option rather than being lost as an empty value.
- **Has an open IDP** — yes or no.

### 4.11 Mentorship Hub

**On the employee's own profile (self-service):**

- Mark themselves as **open to mentoring**.
- See their assigned mentor, if one is assigned.
- See their assigned mentee(s), if any.

**For manager and PP:**

- A list of everyone who has flagged themselves as open to mentoring.
- Clicking a willing mentor opens an assignment flow: pick a mentee from the list of employees available to that manager, and create the pair.
- On creation of the first pair, the person's mentorship status changes from **open to mentoring** to **mentor**. This status is a filterable field on All Employees.
- A view of all mentor–mentee pairs, active and ended, with start date, end date and status.

**Ending a mentorship:** a manager or PP ends a pair explicitly. The end date is recorded, and **final feedback on the mentorship is required to close it** — a pair cannot be ended without it. Ended pairs remain visible in history on both profiles, and an end event is written to the career timeline (4.9). If the mentor has no other active mentees, their status returns to *open to mentoring*.

**On any profile:** the mentor is displayed alongside the manager and the people partner in the profile header, visible to manager line and PP.

Not in scope for this iteration: mentoring goals, session logs, progress tracking.

### 4.12 Forms and Surveys as tasks

A simple flow. Do not build more than this.

1. A PP or a manager creates a **form** in the system: title, short description, purpose, a link to the external form, and a due date. The form itself lives outside the system — Microsoft Forms, Google Forms, or anything else.
2. They select the **audience** using the All Employees filter engine (4.1): build a filter, preview the resulting people, confirm. A saved view can be used as an audience. Individual people can be added or removed after the filter resolves. The resolved list is frozen when the campaign is activated; people who join later are not added.
3. Each recipient gets an **action item** (4.5) on their profile with the title, the sender, the due date and the link. Following the link opens the external form.
4. The recipient marks the action item complete when they have filled the form in. That is the completion signal — the system does not read the external form and does not verify anything.
5. The sender sees the campaign with a per-person table: who has completed, who has not, who is overdue.

**Who can create campaigns:** PP and managers by default, plus any functional role granted the *create form campaigns* permission (2.3). This is the primary case for the extensible role model: the IT department, for example, should be able to run its own security-awareness campaigns without being given managerial access to anyone. A role that can create campaigns selects its audience within its own access scope.

### 4.13 Notifications **[GOOD TO HAVE]**

Not required for this iteration. If built: an in-app notification centre plus email, for action item assigned and overdue, risk created or escalated, IDP deadline approaching, resourcing request assigned, candidate approved or rejected, mentorship pair created or ended.

Notification content respects the access matrix. A notification must never reveal a section the recipient cannot access — in particular, an employee never receives a notification about their own risk record, and a PM never receives one derived from a management note not flagged for them.

### 4.14 Analytics and reports **[GOOD TO HAVE]**

Analytics does not reuse the All Employees filter engine (4.1), because it does not operate on the employee entity alone. It has at least two different kinds of subject:

- **People — current state.** Headcount by country, department, grade, position, employee type, gender, join year. Load per people partner and per manager.
- **Events — what happened in a period.** Joiners, leavers, grade changes, department changes, risk changes, mentorship starts and ends. The data already exists as typed, dated events in the career timeline (4.9) and risk history (4.6) — reuse it rather than inventing a parallel store.

**[DESIGN FREEDOM]** Suggested shape: one report page with a subject selector, a period picker for event-based subjects, a group-by dimension, and a chart plus a table. Every report exports to `.xlsx`. Adding a new report should mean registering a new subject and its dimensions, not building another page.

### 4.15 Feedback

- Feedback records are added on the employee's profile page by managers and PP.
- A record contains: subject (the employee), author, date, context (project, event, period), and the feedback body.
- Each record carries a visibility flag: **management only** (default) or **shared with employee**.
- PP and managers can request feedback about a person from specific colleagues — implemented as a form campaign (4.12) targeted at named individuals.
- Records are viewable over time, with comparison between periods.
- Access per S8. A colleague cannot browse feedback about another person.

---

## 5. Integrations

### 5.1 Internal timetracker — leaves and projects

Two APIs are being provided by the timetracker architect:

1. **Leaves** — vacation, sick leave, parental and other leave types, with dates and status.
2. **Projects and people** — projects, the people working on them, PM and DM.

The second one is load-bearing beyond display: project assignment is an input to the permission model (2.1), so a person's PM and DM derive their access from it.

### 5.2 PeopleForce — recruiting

PeopleForce is the recruiting system of record. The platform uses it to pull candidate information for external candidates proposed in resourcing (4.7), and as the source of truth for vacancies.

The API is documented at `https://developer.peopleforce.io`, including a machine-readable index at `https://developer.peopleforce.io/llms.txt` that is worth putting into the intelligent repository. Investigate authentication, the candidate and vacancy endpoints, custom fields, rate limits and webhooks yourselves, and record what you find as decisions in the repository.

Where this integration cannot be completed in time, an external link to the candidate in PeopleForce is an acceptable fallback for this iteration.

---

## 6. Data model notes

Points where a naive model will not survive the requirements. Resolve these during the foundation phase.

- **Custom fields and arbitrary filtering** (4.1). Any field, including fields that do not exist yet, must be filterable and sortable. A column-per-field schema will not survive this.
- **The two-dimensional role model** (Section 2). Access roles are computed from relationships; functional roles and their permissions are stored data that changes at runtime. Storing "is a DM" as a permission is the wrong answer.
- **Transitive access resolution over two graphs** — the reporting tree and project assignment — evaluated per request, per section, at acceptable cost. Cache carefully: a stale permission cache is a data leak.
- **Temporal data.** Grade, position, department and employment type all change over time and the history is required for the career timeline. Model these as time-bounded records, not as scalar fields with an audit log bolted on.
- **Section-level access** (Section 3) is a property of the model, not a UI concern.
- **Identity across systems.** A person exists as a PeopleForce candidate, then as an employee here, and separately as a timetracker user. Decide how identity is resolved and stored — email alone is not sufficient.

---

## 7. Non-functional requirements

- **Access control correctness** is the primary quality attribute. Test it directly: for each audience, each relationship path and each section, assert what the API returns.
- **Personal data.** The system holds personal data of real people. Use pseudonymised data in all non-production environments: real structure and volume, substituted names and contacts. Do not paste real personal data into agent contexts, logs, screenshots, or the repository.
- Performance: the All Employees list with 500+ records, arbitrary filters and derived fields responds within 2 seconds, including permission resolution.
- Availability: external integration failures degrade gracefully and never take down the application.
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
- access control is covered by tests per audience, per relationship path and per section, including negative tests for every `—` cell, for unflagged S7 records against both the employee and a PM, and for the colleague whitelist;
- a new functional role can be created and granted permissions through the UI, without a deploy;
- the timetracker integration runs against the real API;
- the test architecture agreed in the foundation phase is actually applied — not an afterthought;
- specs in the intelligent repository match the shipped behaviour;
- the module is deployed and demonstrable, not running on someone's laptop.

---

## 10. Out of scope

- **Compensation and salary data.** There is no compensation section on the profile.
- **Pre-onboarding.** Creating a person in the system before their first working day, and pulling their data from the ATS on offer acceptance, is deferred to a later iteration.
- **Email template management** (eSender replacement). Deferred.
- **Performing competency assessments.** The system links to matrices and records outcomes; assessment happens outside (4.10).
- **Learning management.** LMS functionality is a separate track and must not be duplicated here.
- **Mentorship goals, session logs and progress tracking.** Pair formation, ending and visibility only.
- **Project allocation percentages.** Projects are shown; workload distribution is not modelled in this iteration.
