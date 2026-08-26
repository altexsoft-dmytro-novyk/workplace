# Test Assignment: People Management Platform — Iteration 2

**Version:** 1.5
**Supersedes:** v1.2 ([requirements-changelog-v1.2-to-v1.5.md](requirements-changelog-v1.2-to-v1.5.md))
**Status:** Draft for review

---

## 0. How to read this document

This is the functional and technical scope for Iteration 2 of the AI-native SDLC bootcamp.

Two differences from Iteration 1 matter most:

1. **Mock data is no longer acceptable for integrations.** Iteration 1 stated "no external integrations, use seed/mock data." Iteration 2 requires a working integration with the internal timetracker over the **seeded population** (delivered 26 August). PeopleForce is **[GOOD TO HAVE]** — a single prefill button only (§5.2).
2. **Access control is a first-class requirement, not a footnote.** The profile is decomposed into sections, and every section has an explicit access level per audience. Sections 2 and 3 are normative — teams do not get to redesign them.
3. **No employee creation, no AD, no SSO.** The population is a seeded list you import; authentication is your own implementation over that population (§4.17, §10).

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

**Hierarchy resolution [NORMATIVE].** Manager access is the **transitive closure of three relations**:

1. **Reports to** — B reports to A.
2. **Department management** — A manages a department; B belongs to that department or a sub-department. Every employee belongs to exactly one department (§4.17).
3. **Is assigned to a project managed by** — B works on a project whose PM or DM is A.

Consequences, all of which must hold:

- A manager two or more levels up in the **reporting line** sees everything about every person nested anywhere beneath them in that line, without needing an explicit grant.
- **Reporting line** and **project line** are distinct audiences in the access matrix (§3.2). Project-derived PM/DM access is narrower — see §3.3.2.
- Access is evaluated relationship-by-relationship. The same person can be a Manager with respect to one profile, a People Partner with respect to a second, and a plain colleague with respect to a third, within a single session.
- When a project assignment ends, the derived access ends with it. Managerial access is not sticky.
- **Revocation timing:** platform-owned relations (reports-to, department, people-partner assignment) take effect on the **next request**. Project-derived access must be withdrawn within **15 minutes** of assignment end (§5.1).
- **The HR line** is the people partner's own manager chain inside HR, recursive without limit — not the employee's reporting chain.

**Organisational relationship changes [NORMATIVE].** Changing manager, people partner, department, or department manager is a distinct operation: dedicated permission, dedicated screen, **no self-assignment**, journaled (§3.4). Manager, people partner, and department are **not writable through S1** — they are access switches with their own permission and screen.

There are exactly **two** documented exceptions to "a manager sees everything": the narrowed **project line** (§3.3.2), and the PM's flag-gated read of S7 (§3.3).

### 2.2 Functional roles — assigned

| Functional role | Features |
| --- | --- |
| **Unit Manager (UM)** | Unit dashboard grouped by people. Resourcing: fulfils requests, proposes candidates. Risks, action items, mentorship assignment, CDS records for their people. |
| **Delivery Manager (DM)** | Delivery dashboard grouped by project. Resourcing: creates requests, reviews and approves or rejects proposed candidates, and sees the requests created by the PMs of their projects. Risks, action items, CDS records for their people. |
| **Project Manager (PM)** | Same dashboard as the DM, scoped to their own projects. Resourcing: creates requests for their projects. Risks, action items, CDS records for their people. |
| **People Partner (PP)** | People partner dashboard. All HR functionality: profiles, career timeline maintenance, CDS, feedback, campaigns, risks. **No resourcing functionality.** |
| **HR Admin** | **Configuration only:** custom field definitions, system dictionaries, departments, and management of functional roles and their permissions (2.3). **No data access by default.** |

Functional roles never grant data access on their own. A DM sees the people on their projects because of the hierarchy rule in 2.1. **Both dimensions must permit an operation:** the access matrix (§3.2) and the functional-role permission (§2.3) must both allow a write.

There is no separate "unit" entity — *Unit Manager* is the role name for the manager of a department. S1 says "department".

### 2.3 Functional roles are extensible **[NORMATIVE]**

The roles in 2.2 are the starting set, not the final one. Other parts of the organisation will need to use platform features for their own purposes — for example, the IT department creating its own security-awareness campaigns for a chosen audience — without becoming managers or people partners and without a code change.

Requirements:

- Functional roles and their permissions are **data, not code**. A new functional role can be created, named, and granted a set of feature permissions **through the UI**, by HR Admin, with no deploy and no schema change.
- People are assigned to functional roles through the UI.
- Feature permissions are granular. At minimum the following must be independently grantable: create form campaigns, create action items, create and edit risks, create resourcing requests, fulfil resourcing requests, approve or reject candidates, close resourcing requests, assign mentors, maintain CDS records, manage custom fields, view a given dashboard, edit the career timeline, create feedback, record a departure, manage departments, change organisational relationships.
- **Access roles (2.1) are not extensible this way.** A new functional role never widens what data its holders can see about a person; it only unlocks features. Where a feature needs data, it operates within the holder's existing access role. A newly created role that can send campaigns sees the audience through the colleague view unless it also holds a Manager or People Partner relationship.
- Removing a permission from a role takes effect immediately for everyone holding it.

### 2.4 Full profile access grant **[NORMATIVE]**

Full profile access is a **separate grant**, distinct from HR Admin and from relationship-derived access:

- Only an **existing holder** may grant it to another user — no self-assignment.
- The **first holder is seeded at deployment**.
- **Removing the last holder is blocked.**
- Every grant and revocation is **journaled** (§3.4).
- Holders with full profile access are the **backstop** for shared-link revocation when the relationship holder cannot revoke.

---

## 3. Access model **[NORMATIVE]**

### 3.1 Principle

The employee profile is decomposed into **sections**. Access is granted per section, per audience. There is no "profile-level" permission.

Audiences in the matrix below:

- **Self** — the employee whose profile it is
- **Reporting line** — anyone holding Manager access via reports-to or department management with respect to this employee, including transitive managers in that line
- **Project line** — PM and DM (and their chain above) via **project assignment only** — a narrower audience; see §3.3.2
- **PP** — the assigned people partner and the HR line above them (§2.1)
- **Colleague** — any authenticated employee who holds none of the above roles with respect to this profile
- **Shared link** — an **authenticated, named recipient** accessing via a generated link (§4.8) — not anonymous

**HR Admin is not an audience column.** HR Admin is a functional configuration role (§2.2) with no default data access. Full profile access is a separate grant (§2.4).

Legend: `RW` = read and write · `R` = read only · `—` = no access, section not rendered at all · `cfg` = off by default, can be enabled per link

### 3.2 Section access matrix

| # | Section | Contents | Self | Reporting line | Project line | PP | Colleague | Shared link |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S1 | **Identity card** | Full name, photo, position, department, country and city, work email, work phone, birthday (day and month), company start date, manager, people partner, mentor, current project(s)¹ | R (photo RW) | RW² | RW² | RW | **R** | cfg (on by default) |
| S2 | **Personal contacts** | Personal phone, personal email, messengers, residential address, current place of stay | **RW** | R | **—** | RW | — | cfg |
| S3 | **Emergency contacts** | Contact person, relationship, phone | **RW** | R | **—** | RW | — | — |
| S4 | **Employment** | Employee type (FTE / Subcontractor), grade, seniority, position history, English level, probation status, employment status, contract type | R | RW | RW | RW | — | cfg |
| S5 | **Documents** | Contract, W8, cooperation form, Diia City, CV, certificates | R (own) + upload certificates | R | **R (CV and certificates only)** | RW | — | cfg |
| S6 | **Risks** | Current level, trend, description, details, date, full history | **—** | RW | RW | RW | — | cfg |
| S7 | **Management notes** | Free-form notes by managers and PP, each with visibility flags | R — only records flagged *visible for employee* | RW | RW. **PM exception: R, and only records flagged *visible for PM*** | RW | — | — |
| S8 | **Feedbacks** | Structured feedback records, including joining interview feedback (§4.15), see 4.15 | R — only records flagged *shared with employee* | RW | RW | RW | — | cfg |
| S9 | **Career timeline** | System-generated event log, see 4.9 | R | RW | RW | RW | — | cfg |
| S10 | **Leaves and absences** | Vacation, sick leave, parental leave, extended leave — dates and types | R | R | R | R | **R (dates only — type hidden)** | cfg |
| S11 | **Projects** | Project, PM, DM, period | R | R | R | R | R (project name only) | cfg |
| S12 | **CDS** | Skills matrix link, assessment log, results, final conclusion, IDP | R (+ complete own IDP) | RW | RW | RW | — | cfg |
| S13 | **Mentorship** | Open-to-mentor flag, assigned mentor, assigned mentees, ended pairs | RW (own flag), R (pairs) | RW | RW | RW | — | — |
| S14 | **Action items and tasks** | Tasks assigned to the person, including form tasks, see 4.5 | R (own) + mark complete | RW | RW | RW | — | — |
| S15 | **Request history** | Resourcing requests the person was proposed for: proposed → approved/rejected with feedback | — | R | R | R | — | cfg |
| S16 | **Custom fields** | See 4.1 | per field visibility | RW | RW | RW | per field visibility | cfg |

¹ Manager, people partner, and department on S1 are **read-only** — changes use the organisational-relationship screen (§2.1).  
² Writable fields exclude manager, people partner, and department.

### 3.3 Rules that follow from the matrix

**[NORMATIVE]**

1. **Every cell in the matrix is strict.** A section marked `—` for an audience must not reach that audience through any surface: not the UI, not the API, not an export, not a notification, not a search result, not an error message. The same applies to flag-gated records. A leak is a critical defect, whichever section it happens in.
2. **S7 defaults to invisible to the employee and to PMs.** Every management note carries two independent flags, both off by default:
   - *visible for employee* — when set, the employee can read that record. Only that record.
   - *visible for PM* — when set, PMs in this person's project chain can read that record, read-only.
   UM, DM and PP can create, read and edit notes about the people they are responsible for, regardless of flags. This is one of the two documented exceptions to "a manager sees everything" in 2.1: a PM in the **project line** is a flag-gated reader for S7.
3. **§3.3.2 — Project line is narrower.** PM and DM via project assignment lose S2 and S3 entirely, and get S5 as **CV and certificates only**. All other project-line cells match reporting line unless this section states otherwise.
4. **§3.3.4 — Colleague view is a whitelist, not a blacklist.** A colleague sees exactly S1, S10 (**dates only — leave type hidden**), and the S11 project name. Everything else is absent. Do not implement this by hiding fields in the frontend — the API must not return them.
5. **Access is evaluated server-side per section on every request.** A profile response is assembled from the sections the requester is entitled to, after resolving the requester's access role per 2.1.
6. **Custom fields carry their own visibility.** When a custom field is created, its visibility level is set: *management* (default), *employee* (also visible to Self), or *colleague* (also visible to everyone). Filters and list columns respect it: a user filtering the All Employees list must not be able to infer a value they cannot see.
7. **§3.3.7 — Campaign author exception.** A campaign author sees name and completion status for their own campaign's recipients only. Nothing else from S14, nothing in any other section; access ends when the campaign closes.

### 3.4 Relationship and access journal **[NORMATIVE]**

A narrow journal (not a general audit log) records: manager, people partner, and department changes; department-manager changes; full-profile-access grants; and shared-link accesses.

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
- see their own leaves (dates and types) with a link to the timetracker to manage them — **leave balances are not shown in the platform**;
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

**Per employee:** a risk record with level — `low`, `need attention`, `medium`, `high`, `leaver` — plus a description of the situation, details, and a date. Risk history is retained; the current level is the most recent record. **Fixed severity order:** `low` < `need attention` < `medium` < `high` < `leaver`. **Risks cannot be closed or resolved** — the level moves from any state to any state, including down to `low`. **`leaver` is a prediction**, not the fact of departure; the fact of departure is `dismissed` in employment status (§4.16).

**Trend:** alongside the current level, show an arrow indicating whether the risk has gone up or down compared with the previous record. No arrow when the level is unchanged or when this is the first record.

**"Active" risks** exclude `low` — dashboard counters ignore `low`.

**Risk Dashboard** (separate page):

- Counts by level, with `medium`, `high` and `leaver` emphasised.
- A table of all people with risks, sorted by severity descending, then by date, showing the trend arrow.
- Filterable by unit, department, project, PP, manager.
- Drill-through from a count to the filtered table, and from a row to the profile.
- Scoped to the people the viewer holds Manager or People Partner access over.

Never visible to the employee.

### 4.7 Resourcing

Available to UM, DM and PM, and to any functional role granted the corresponding permission (2.3).

**Vacancy entity:** one vacancy record lives in the platform. PeopleForce vacancies are not used in either direction.

**Request creation (DM, PM):** vacancy details and requirements, **headcount** (default 1), expected compensation level, duration, workload, and **department** (routes the request to the responsible unit manager). A request **may** reference a project; an unattached request is normal and appears in an **Unassigned** bucket on the dashboard.

**Request fulfilment (UM):** the UM sees incoming requests for their department and can propose internal specialists or external candidates. Store the PeopleForce **candidate ID** on every external candidate.

**Request review (DM):** the DM sees proposed candidates. On submission, a **shared link** is generated automatically for the reviewing DM (named recipient) and remains until the request is decided. Evaluation view: S1, S4, S11, S12, S5 as CV plus certificates; S6 optional; never S2, S3, S7, S8. Expected compensation level is visible to the request author, routed UM, and reviewing DM only — never on a profile, shared link, or export.

**Closing:** approving a candidate fills a headcount slot. **Only the DM's explicit close** ends a request — no auto-close.

**Request history:** every attempt (proposed → approved/rejected, with feedback) is recorded in Resourcing → Requests and in S15. Approval does not create a project record here: assignment happens in the timetracker and appears on the profile after sync.

### 4.8 Profile sharing

A manager generates a shareable view of an employee's profile for someone who does not hold Manager or People Partner access over that person — typically a DM evaluating a proposed candidate.

- **Authenticated, named recipient only** — the creator explicitly names the recipient at link creation. There is no anonymous "anyone with the link" mode. The recipient must authenticate.
- The manager selects which sections are included, per section, per the `cfg` column in 3.2. **All `cfg` sections are off by default; only S1 is on by default.**
- **Never-share set:** {S3, S7, S13, S14} — these sections can never be shared.
- Sensitive sections (S2, S5, S6, S8) are excluded by default and must be explicitly enabled each time.
- The link expires. Default 24 hours, configurable at creation (resourcing auto-links may differ — see §4.7).
- Every access via the link is logged: when, from where (§3.4 journal).
- **The creator's access is re-checked on every view** — the link dies with the relationship.
- **Revocation rights follow the current holder of the relationship**, not the creator. Full-profile-access holders are the backstop — there must never be a link nobody can revoke.
- Revocable before expiry.
- A shared link never grants write access.

### 4.9 Career timeline

**Implementation model [NORMATIVE]:** the career timeline is a **system-generated event log**. The system writes an event whenever one of the tracked changes occurs; it is not a separately maintained record that someone has to remember to update.

Tracked events: joining the company, grade change, position change, department change, FTE ↔ subcontractor transition, extended leave, mentorship pair start and end.

**Manual override:** PP and UM can **edit, delete and manually add** timeline events. Manual entries are needed for historical backfill — the current data lives only in a separate Excel headcount change record — and to correct events the system inferred wrongly.

**Read vs write audience [NORMATIVE, DEC-UM-001]:** §3.2 S9 grants the reporting line, project line, and PP **read** access to the career timeline. **Manual** add/correct/delete is limited to the **assigned PP** and the employee's **direct Unit Manager** only.

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

- A **company-wide** pool lists everyone flagged open to mentoring (identity-card data plus the flag only — no S13 from other profiles).
- Mentee selection is scoped to the assigner's own people.
- On creation of the first pair, status changes from **open to mentoring** to **mentor** (filterable on All Employees).
- A view of all mentor–mentee pairs, active and ended, with start date, end date and status.

**Ending a mentorship:** a manager or PP ends a pair explicitly. A **closure note** on the pair record is required (readable by reporting line, project line, and PP only — not a feedback record). Ended pairs remain in history; an end event is written to the career timeline (4.9). A person may clear their open-to-mentoring flag while holding an active mentee; active pairs are untouched.

**On any profile:** the mentor is displayed alongside the manager and the people partner in the profile header, visible to reporting line, project line, and PP.

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
- Records are viewable over time, listed chronologically and filterable by period. **"Comparison between periods" is removed.**
- Access per S8. A colleague cannot browse feedback about another person.

### 4.16 Employment status and departure **[NORMATIVE]**

**Employment status** is a time-bounded fact on the profile with values `active` / `dismissed`.

**Departure** is recorded by an authorised actor with an effective date and a reason:

- On the effective date: profile becomes read-only and is excluded from the default list but remains filterable.
- Action items close as *cancelled — departed*.
- Mentorship pairs auto-close with a system note, bypassing the closure-note gate (§4.11).
- The account deactivates; **all access that person held ends immediately**.
- **Departure is blocked** while the person still manages or partners anybody — re-parent first.
- **Leaving is not a career-timeline event** — it is employment status (§4.9).

### 4.17 Population and departments **[NORMATIVE]**

**Population:** Creating employees is **out of scope**. No provisioning flow, no Active Directory, no SSO. The population is a **seeded list**, generated and imported into the timetracker test environment (delivered 26 August). Import it; that is who you work with. Do not import real employee data beyond the list you are given. Authentication is your own implementation over the seeded population.

**Departments:** Every employee belongs to exactly one department. Departments nest. Department is a first-class entity — not a free-text field on S1. A department change emits a career-timeline event (§4.9). CDS skills-matrix mapping keys off the department entity (§4.10).

---

## 5. Integrations

### 5.1 Internal timetracker — leaves and projects **[NORMATIVE — only required integration]**

Two APIs are being provided by the timetracker architect:

1. **Leaves** — vacation, sick leave, parental and other leave types, with dates and status. **Leave balances are not stored or displayed in the platform.**
2. **Projects and people** — projects, the people working on them, PM and DM.

The second one is load-bearing beyond display: project assignment is an input to the permission model (2.1), so a person's PM and DM derive their access from it. Project-assignment correctness is a **security concern**. Establish from the documentation whether you receive **events** or only **state at sync time**.

**Outage behaviour:** serve last known data behind a visible banner, and **withdraw project-derived access after four hours** of failed sync. Project-derived access revocation must otherwise occur within **15 minutes** of assignment end (§2.1).

### 5.2 PeopleForce — recruiting **[GOOD TO HAVE]**

PeopleForce is **not required** for this iteration. If built, it is reduced to a **single prefill button**: prefill profile fields from a candidate record by candidate ID, with per-field preview and per-field confirmation — never silently overwriting a filled value.

Fields that can **never** be prefilled: grade, seniority, employee type, department, manager, people partner, contract data, employment status, risk.

Store the PeopleForce candidate ID on every external candidate in resourcing (§4.7), whether or not the integration is built. Where the integration cannot be completed, an external link to the candidate in PeopleForce remains an acceptable fallback.

---

## 6. Data model notes

Points where a naive model will not survive the requirements. Resolve these during the foundation phase.

- **Custom fields and arbitrary filtering** (4.1). Any field, including fields that do not exist yet, must be filterable and sortable. A column-per-field schema will not survive this.
- **The two-dimensional role model** (Section 2). Access roles are computed from relationships; functional roles and their permissions are stored data that changes at runtime. Storing "is a DM" as a permission is the wrong answer.
- **Transitive access resolution over three graphs** — reports-to, department management, and project assignment — evaluated per request, per section, at acceptable cost. Cache carefully: a stale permission cache is a data leak.
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
- access control is covered by tests per audience, per relationship path and per section, including negative tests for every `—` cell, for **project-line narrowed cells** (§3.3.2), for unflagged S7 records against both the employee and a PM, and for the colleague whitelist;
- a new functional role can be created and granted permissions through the UI, without a deploy;
- organisational relationship changes are journaled and not self-assignable;
- a shared link works only for its named authenticated recipient and can always be revoked;
- the timetracker integration runs against the test environment over the **seeded population**;
- the test architecture agreed in the foundation phase is actually applied — not an afterthought;
- specs in the intelligent repository match the shipped behaviour;
- the module is deployed and demonstrable, not running on someone's laptop.

---

## 10. Out of scope

- **Employee creation and provisioning.** No HR registration flow, no Active Directory, no SSO. Population is seeded (§4.17).
- **Compensation and salary data.** There is no compensation section on the profile.
- **Pre-onboarding.** Pulling ATS data on offer acceptance is deferred to a later iteration.
- **Email template management** (eSender replacement). Deferred.
- **Performing competency assessments.** The system links to matrices and records outcomes; assessment happens outside (4.10).
- **Learning management.** LMS functionality is a separate track and must not be duplicated here.
- **Mentorship goals, session logs and progress tracking.** Pair formation, ending and visibility only.
- **Project allocation percentages.** Projects are shown; workload distribution is not modelled in this iteration.
