---
title: 'Functional Role â permission matrix â DRAFT for PO confirmation'
type: 'draft-proposal'
created: 2026-09-02
status: draft
resolves: 'OQ-PERM-01 (do-not-invent-a-default-matrix) â via the Â§2.3 process ("drafted by the team from this document and confirmed by the PO")'
sources:
  - '{project-root}/docs/project-requirements.md Â§2.1, Â§2.2, Â§2.3, Â§3.2, Â§3.3, Â§4.16'
  - '{project-root}/docs/architecture/access-control.md (AD-4, AD-6, AD-7, Â§"Two dimensions")'
  - '{project-root}/docs/architecture/user-management-test-decisions.md (DEC-UM-001)'
  - '{project-root}/_bmad-output/specs/spec-functional-roles-catalog/SPEC.md'
  - '{project-root}/_bmad-output/implementation-artifacts/access-control/user-management-edit-permission-options.md'
companions:
  - './user-management-edit-permission-options.md'
---

# FR â permission matrix â draft

> **This is the artifact `docs/project-requirements.md` Â§2.3 mandates:** *"Which
> of the starting roles holds which permission on first launch is drafted by the
> team from this document and confirmed by the PO before the roles admin screen
> is built."* It is also the resolution path for **OQ-PERM-01** ("do not invent a
> default role-to-permission matrix" â the prohibition is on inventing *without*
> this drafted-and-confirmed process, which this document starts).
>
> **Nothing here is confirmed.** Every cell is marked **[S]** sourced (a
> requirements clause states it) or **[P]** proposed (a team judgment call the PO
> must confirm). Do not hard-code any of this until the PO sign-off is recorded
> (`access-control.md:11`).

---

## 1. Why this is only half the gate

Authorization is **two orthogonal axes** (AD-6, `access-control.md` Â§"Two dimensions", requirements Â§2.2 line 49):

| Axis | What it answers | Mechanism | Derived from |
| --- | --- | --- | --- |
| **A â Audience / section** (Â§3.2 matrix) | "Does *my relationship to this person* let me reach section S for read / write?" | `canAccessSection(viewer, section, target) â none \| read \| write` | live `Relationship` edges (self / reporting line / project line / assigned PP / colleague) |
| **B â Functional role â permission** (*this document*) | "Is *my role* permitted to perform this class of action at all?" | `isAllowed(viewer, permissionKey) â bool` | assigned FR data (`UserPolicies â Policies(type='FR') â PolicyPermissions â Permissions.key`) |

**A write happens only where BOTH allow it** (Â§2.2). A feature action with no
target (create a campaign, view a dashboard, import the population) needs **only
axis B**.

**Critical constraint â axis B never widens data reads** (Â§2.3 NORMATIVE):

> *"A new functional role never widens what data its holders can see about a
> person; it only unlocks features. Where a feature needs data, it operates
> within the holder's existing access role."*

So this matrix is about **writes and feature-actions**, never reads. A
People-Partner FR does not "grant read of S2"; the *assigned-PP audience* (axis A)
does. **`HR Admin` grants no data access at all** (Â§2.2 NORMATIVE) â it is a
feature-administration role.

---

## 2. Naming scheme (proposal â supersedes `user-management:*`)

`access-control.md:143` fixes the shape as `context:action`. It is too coarse:
`user-management:edit` does not say *what* is edited. **Proposed shape:**

```
<domain>:<object-or-section>:<operation>
```

- `<domain>` â `profile` (per-person section data), `org` (org facts),
  `directory` (the population), `resourcing`, `campaigns`, `action-items`,
  `mentorship`, `employee` (lifecycle), `admin` (platform config), `dashboard`.
- `<operation>` â `read` is almost never an FR permission (axis A owns reads);
  `write` / `create` / `manage` / `record` / `approve` / `close` / `fulfil` /
  `view`.

Per-section data writes therefore read as `profile:<section-name>:write` â the
S-number is an internal label; the key uses the human section name.

**Migration of the 3 seeded kernel keys** (a separate kernel AD-1 change â do
NOT do it inside Story 1.2):

| Seeded now (ACM-1) | Proposed | Gates |
| --- | --- | --- |
| `user-management:create` | `directory:import` | `POST /users/import` |
| `user-management:list` | `directory:list` | `GET /users` |
| `user-management:deactivate` | `directory:deactivate` | (AD-16: generic deactivation retired â this key has no v1.5 consumer; keep or drop is a PO call) |

---

## 3. Permission catalog (proposed keys)

Rows are the **minimum** Â§2.3 list (explicitly "a minimum, not a closed set")
plus the section-write keys implied by the Â§3.2 `RW` cells + line 49, plus the
kernel keys. **[S]** = named/implied by a requirements clause. **[P]** = this
draft is naming it.

### Directory & lifecycle
| Key | Source | Gates |
| --- | --- | --- |
| `directory:import` | [S] Â§4.17 / kernel | `POST /users/import` (population load) |
| `directory:list` | [S] Â§3.2 (directory), kernel | `GET /users` list/filter |
| `employee:departure:record` | [S] Â§2.3 "record a departure", Â§4.16 | schedule/apply a departure (AD-20 routes) |

### Per-person section writes (axis B half of the Â§3.2 `RW` cells)
| Key | Â§3.2 section | Source |
| --- | --- | --- |
| `profile:identity:write` | S1 identity card (scalar fields) | **SUPERSEDED 2026-09-04 (SCP `sprint-change-proposal-2026-09-04-section-access-consolidation.md` §2 D1/D2): in `DEFAULT_PERMISSIONS`; identity-card edit is a §2.2 dual gate (`isAllowed('profile:identity:write')` AND `canAccessSection('profile:identity') === 'write'`). Every key in this table is a `DEFAULT_PERMISSIONS` member unless a narrowing decision moves it to an explicit tighter role.** Historical (2026-09-02, now reversed): **RESOLVED (Variant A): NO functional permission.** Identity-card edit is gated by S1 write-audience alone (`canAccessSection('S1') === 'write'` â reporting-line manager or assigned PP). Line 49's functional half is deliberately not applied to this one section. A narrower FR grant may be added later via the roles admin. See `user-management-edit-permission-options.md`. |
| `profile:personal-contacts:write` | S2 | [S] Â§3.2 S2 `RW` = Self, PP only |
| `profile:emergency-contacts:write` | S3 | [S] Â§3.2 S3 `RW` = Self, PP only |
| `profile:employment:write` | S4 employment / grade / seniority | [S] Â§3.2 S4 `RW` = reporting / project / PP |
| `profile:documents:write` | S5 | [S] Â§3.2 S5 `RW` = PP; reporting `R`; project `R` (CV+certs); Self uploads own certificates |
| `profile:risks:write` | S6 | [S] Â§2.3 "create and edit risks"; Â§3.2 S6 `RW` = reporting / project / PP |
| `profile:management-notes:write` | S7 | [S] Â§3.2 S7 `RW` = reporting / PP; DM `RW`; PM `R` (flagged) |
| `profile:feedback:create` | S8 | [S] Â§2.3 "create feedback" (**default holder unsettled â Â§2.3**) |
| `profile:timeline:write` | S9 career timeline | [S] Â§2.3 "edit the career timeline" (**default holder unsettled â Â§2.3**); DEC-UM-001 narrows the *audience* to assigned PP + **direct** Unit Manager |
| `profile:cds:write` | S12 CDS | [S] Â§2.3 "maintain CDS records" |
| `profile:custom-field-values:write` | S16 values | [S] Â§3.2 S16 `RW` = reporting / project / PP (per-field visibility still applies) |

### Mentorship & org
| Key | Source | Gates |
| --- | --- | --- |
| `mentorship:assign` | [S] Â§2.3 "assign and end mentorships"; Â§2.2 UM "mentorship assignment" (**who assigns is a Â§2.3 unsettled point**) | create / end `MentorshipPair`, manage the pool |
| `org:relationships:write` | [S] Â§2.3 "change organisational relationships"; Â§2.1 | change manager / assigned PP / department membership (dedicated screen, no self-assignment, journaled) |
| `org:departments:manage` | [S] Â§2.3 "manage departments"; Â§4.17 | create/rename/nest departments, set a department's Unit Manager |

### Resourcing (feature actions â no per-person target)
| Key | Source |
| --- | --- |
| `resourcing:request:create` | [S] Â§2.3 |
| `resourcing:request:fulfil` | [S] Â§2.3 |
| `resourcing:candidate:approve` | [S] Â§2.3 (**default holder unsettled â Â§2.3**) |
| `resourcing:request:close` | [S] Â§2.3 |

### Other feature actions
| Key | Source |
| --- | --- |
| `campaigns:create` | [S] Â§2.3 "create form campaigns" (+ Â§3.3.7 scoped-recipient read exception) |
| `action-items:create` | [S] Â§2.3 "create action items" |
| `dashboard:<name>:view` | [S] Â§2.3 "view a given dashboard" â one key per dashboard: `dashboard:unit:view`, `dashboard:delivery:view`, `dashboard:people-partner:view`, `dashboard:admin:view` |
| `dashboard:create` | [P] PO decision 2026-09-02 â beyond the Â§2.3 minimum (allowed: "a minimum, not a closed set"). Create and configure your **own** custom board / dashboard. |

### Platform admin (HR Admin only)
| Key | Source |
| --- | --- |
| `admin:custom-fields:manage` | [S] Â§2.2, Â§2.3, Â§4.1 â field **definitions** (distinct from `profile:custom-field-values:write`) |
| `admin:dictionaries:manage` | [S] Â§2.2 "system dictionaries" |
| `admin:roles:manage` | [S] Â§2.2, Â§2.3 â the FR catalog + assigning people to FRs |

---

## 4. FR â permission matrix (DRAFT)

Columns = the 5 starting FRs (Â§2.2) + the **Employee baseline** (held by every
active `User`). `â` = held **[S]** sourced Â· `â` = held **[P]** proposed Â·
`?` = **unsettled, PO must confirm** (Â§2.3) Â· blank = not held.

Reminder: a `â`/`â` here is the *functional* half only. The *reach* still comes
from axis A â e.g. a Unit Manager holding `profile:risks:write` can only write
S6 for people on **their** reporting line, because that is where
`canAccessSection('S6', target)` returns `write`.

| Permission | Employee | Unit Mgr | Delivery Mgr | Project Mgr | People Partner | HR Admin |
| --- | :---: | :---: | :---: | :---: | :---: | :---: |
| `directory:import` | | | | | | â |
| `directory:list` | â | â | â | â | â | â |
| `directory:deactivate` | | | | | | ? |
| `employee:departure:record` | | | | | â | |
| ~~`profile:identity:write`~~ | — | — | — | — | — | — | Variant A: no FR permission — audience-only gate |
| `profile:personal-contacts:write` | â (own) | | | | â | |
| `profile:emergency-contacts:write` | â (own) | | | | â | |
| `profile:employment:write` | | â | â | â | â | |
| `profile:documents:write` | â (own certs) | | | | â | |
| `profile:risks:write` | | â | â | â | â | |
| `profile:management-notes:write` | | â | â | | â | |
| `profile:feedback:create` | ? | ? | ? | ? | ? | |
| `profile:timeline:write` | | ? (direct UM) | ? | | ? (assigned PP) | |
| `profile:cds:write` | â (own IDP) | â | â | â | â | |
| `profile:custom-field-values:write` | | â | â | â | â | |
| `mentorship:assign` | | ? | | | ? | |
| `org:relationships:write` | | | | | â | â |
| `org:departments:manage` | | | | | | â |
| `resourcing:request:create` | | â | â | â | | |
| `resourcing:request:fulfil` | | â | | | | |
| `resourcing:candidate:approve` | | ? | ? | ? | | |
| `resourcing:request:close` | | | â | | | |
| `campaigns:create` | | | | | â | â |
| `action-items:create` | | â | â | â | â | |
| `dashboard:unit:view` | | â | | | | |
| `dashboard:delivery:view` | | | â | â (own projects) | | |
| `dashboard:people-partner:view` | | | | | â | |
| `dashboard:admin:view` | | | | | | â |
| `dashboard:create` | | â | â | â | ? | |

### Row notes
- **`profile:personal-contacts:write` / `emergency-contacts:write` / `documents:write` â "own"**: an employee editing their own S2/S3/S5 is the **Self audience** on axis A, not an FR grant. Modelled as an identity check (like photo, Story 1.3), OR as a baseline permission whose axis-A `write` cell only ever holds for `viewer == target`. Recommend the identity check (no permission) â flagged.
- **`profile:identity:write` â Employee blank**: an employee can write only their *photo* (Self, identity check, Story 1.3). The scalar S1 fields (position, country, city, workPhone) are `R` for Self in Â§3.2 â an employee cannot self-edit them. So no baseline grant.
- **`profile:risks:write` â PM `â`**: Â§3.2 S6 project-line is `RW`; rule 3.3.2 keeps S6 for the project line. So a PM *can* write risks for their project members. If Product wants risks to be a DM-only responsibility, drop the PM `â` â flagged.
- **`profile:management-notes:write` â PM blank**: rule 3.3.3 gives PM **read-only** S7 and only *visible-for-PM* records. PM does not write notes.
- **`profile:timeline:write` â all `?`**: Â§2.3 says the default holder is unsettled. DEC-UM-001 (career-timeline test decision) narrows the *manual* write audience to **assigned PP + the employee's direct Unit Manager** â project-derived DM/PM and transitive managers are read-only for manual mutation. So the FR grant should sit on **UM + PP**, and axis A (`canAccessSection('S9')` + a "direct only" predicate) enforces the narrowing. Not DM. **Confirm.**
- **`mentorship:assign` â UM + PP `?`**: Â§2.2 lists "mentorship assignment" under **Unit Manager**; Â§2.3 flags "who may assign mentors" as explicitly unsettled. Draft: UM + PP. **Confirm.**
- **`org:relationships:write` â PP + HR Admin `â`**: Â§2.1 gates manager/PP/department changes behind the *change organisational relationships* permission on a dedicated screen. PP records these as HR. HR Admin can (platform admin). A line manager does **not** get it by default (no self-assignment; changing your own reports is an access switch). **Confirm whether UM should hold it for their own department.**
- **`campaigns:create` â HR Admin `â`**: Â§2.3's own example is "the IT department running its own security-awareness campaigns â¦ without becoming managers". That is a *new* FR, not HR Admin. HR Admin `â` only if Product wants platform admins to also send campaigns; otherwise blank. **Confirm.**
- **`directory:list` â Employee `â`**: can every authenticated employee browse the All-Employees directory (colleague-view projection, Â§3.2)? Requirements imply yes (the directory is a core surface). If it should be role-gated, drop the `â`. **Confirm.**
- **`dashboard:create` â UM/DM/PM `â` (PO decision 2026-09-02: "all managers may create their own boards")**: Unit / Delivery / Project managers can create and configure a personal board. Beyond the Â§2.3 minimum list â a deliberate addition. **`?` for People Partner** â PP has a fixed people-partner dashboard (Â§2.2); does PP also get to build custom boards? Confirm. HR Admin: blank (feature admin, not an operational dashboard user) â confirm if wrong. A created board still shows only data its owner can reach via axis A (Â§2.3 â a new surface never widens reads).
- **HR Admin has zero `profile:*` and zero audience** â by Â§2.2 NORMATIVE. Even `org:relationships:write` and `directory:import` are *feature* actions (no section read). This is the "HR Admin grants no data access" rule made concrete.

---

## 5. Where this draft ADJUSTS the raw Â§3.2 / Â§2.2 for our implementation

| Raw reading | Our implementation | Why |
| --- | --- | --- |
| Â§3.2 columns look like roles ("Reporting line", "PP") | They are **audiences** (axis A), not FRs. The FR a reporting-line manager also holds is `Unit Manager` / `Delivery Manager` / `Project Manager`. | AD-6 / AD-10 â audiences are computed from `Relationship`, not assigned. |
| Â§3.2 S1 `RW` for reporting/project/PP â "managers edit identity cards" | `profile:identity:write` is a **baseline-ish** grant (UM/DM/PM/PP), and the Â§3.2 `RW` cell (axis A) does the narrowing to *their* people. | Line 49: the `RW` cell is the audience half; a permission is still required. Â§3.2 names no FR narrowing for S1 (unlike S9). |
| Â§3.2 S9 `RW` for reporting/project/PP | `profile:timeline:write` FR sits on **UM + PP only**; axis A additionally restricts to **direct** UM + **assigned** PP. | DEC-UM-001 â manual timeline writes are narrower than the raw matrix. |
| "HR Admin" appears to be a powerful role | HR Admin holds `admin:*` + `directory:import`/`list` + `org:*` (feature actions) and **nothing that reads a person's section data**. | Â§2.2 NORMATIVE "HR Admin grants no data access". |
| Kernel seeded `user-management:create/deactivate/list` on `hr-admin` | Rename to `directory:*`; `directory:deactivate` may have no v1.5 consumer (AD-16). | AD-16 retired generic deactivation; import replaced create. |
| Â§2.3 "16 permissions â¦ a minimum" | We add ~11 `profile:<section>:write` keys + split `admin:custom-fields:manage` (definitions) from `profile:custom-field-values:write` (values). | Line 49 requires a permission per writable section; Â§4.1 distinguishes field definitions from values. |
| Photo / own-S2 / own-S3 / own-certs "writes" | **Identity check** (`viewer == target`), not a permission. | Consistent with Story 1.3's `@SelfOnly` decision; keeps the FR catalog about *other people*. |

---

## 6. Explicitly needs PO confirmation

The `?` cells above, gathered â these are the points requirements Â§2.3 says
"this document does not settle":

1. **Who may `manage custom fields`** (definitions) â draft: HR Admin only.
2. **Who may `assign mentors`** (`mentorship:assign`) â draft: Unit Manager + People Partner.
3. **Default holder of `resourcing:candidate:approve`** â draft: Delivery Manager (approves), not PM/UM. Confirm.
4. **Default holder of `profile:timeline:write`** (`edit the career timeline`) â draft: Unit Manager + People Partner (with the DEC-UM-001 direct/assigned narrowing on axis A). Confirm DM is excluded.
5. **Default holder of `profile:feedback:create`** (`create feedback`) â draft: Unit Manager + Delivery Manager + People Partner. Confirm whether an employee can leave feedback (peer feedback, Â§4.15).

Plus draft-introduced questions:

6. Is `profile:identity:write` a real FR grant on UM/DM/PM/PP, or is S1 scalar
   edit **not** something line managers do at all (only PP + a possible future
   HR-editor role)? (`user-management-edit-permission-options.md` recommends a
   broad grant + axis-A narrowing; this matrix follows that.)
7. Does `directory:list` need any role, or is the All-Employees directory open to
   every authenticated employee?
8. Should `org:relationships:write` also sit on Unit Manager for their own
   department, or stay PP/HR-Admin only?
9. Keep or drop `directory:deactivate` (no v1.5 consumer after AD-16).
10. Rename the 3 kernel keys now (a kernel AD-1 change) or after this matrix is
    confirmed?
11. `dashboard:create` (added 2026-09-02, "all managers create own boards") â
    does **People Partner** also hold it? Does the board feature need its own
    spec/epic (it is beyond the current Â§2.3 catalog)?

---

## 7. Scope split â what we build NOW vs catalog-only

The full matrix above is the **Â§2.3-mandated reference** (the target the roles
admin screen and every context will implement against). But most keys gate
features that **do not exist in this codebase** (resourcing, campaigns, action
items, risks UI, CDS, feedback, dashboards/boards). Per
`spec-functional-roles-catalog` â *"this slice delivers the engine and the
catalog; enforcing the resulting permissions on existing endpoints is a separate
step owned by each endpoint's context."*

**Build / seed now (has a live consumer):**

| Key | Consumer | Status |
| --- | --- | --- |
| `directory:import`, `directory:list` | `POST /users/import`, `GET /users` | already seeded (`user-management:create/list`); rename is optional |
| **`profile:identity:write`** | **UM Epic 1 Story 1.2 `PATCH /users/:id` + UMAC-2** (Epic 0 write path) | **the immediate blocker** â needs a kernel-seed AD-1 sequence (Open Decision (i) option (a)). Grant per the matrix row: UM/DM/PM/PP. |
| `org:relationships:write` | UM Epic 4 (`4-1` in progress) | needed soon |
| `profile:timeline:write` | UM Epic 3 (`3-1`â`3-3` in progress) | needed soon; default holder still `?` (Â§6.4) |
| `mentorship:assign` | Mentorship context | needed for its stage-2 |
| `employee:departure:record` | UM Epic 5 / AD-20 routes (named in `api-conventions.md`) | needed for Epic 5 |
| `org:departments:manage` | the Â§4.17 department model (blocks dept-derived access) | needed for the department contract |

**Catalog-only for now (define the key, defer enforcement to the feature):**
`dashboard:*:view`, **`dashboard:create`** (boards are a separate effort â PO
2026-09-02), `resourcing:*`, `campaigns:create`, `action-items:create`,
`profile:risks:write`, `profile:cds:write`, `profile:feedback:create`,
`profile:management-notes:write`, `profile:employment:write`,
`profile:documents:write`, `profile:personal-contacts:write`,
`profile:emergency-contacts:write`, `profile:custom-field-values:write`,
`admin:custom-fields:manage`, `admin:dictionaries:manage`, `admin:roles:manage`.
These go in the `Permissions` catalog so a role can be granted them through the
UI, but no endpoint checks them until that feature is built.

## 8. What this unblocks once confirmed

- `spec-functional-roles-catalog` gets its default-grant table (currently `OQ-PERM-01` blocks it).
- The `user-management:edit` / `profile:identity:write` kernel-seed AD-1 sequence
  (Open Decision (i) option (a)) â needed by **UM Epic 1 Story 1.2** (`PATCH
  /users/:id`) and **UMAC-2** (Epic 0 write path). See
  `user-management-edit-permission-options.md`.
- `mentorship:assign` seed â needed by the Mentorship context.
- Every per-endpoint enforcement step (each context wires its own `@RequireFeature`, AD-2/AD-4).
