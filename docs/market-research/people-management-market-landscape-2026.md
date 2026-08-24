---
title: People Management, Talent, and Engineering Resourcing Market Landscape, 2026
document_type: market-research
status: draft-for-review
normative: false
prepared_by_role: Business Analyst
research_cutoff: 2026-08-20
added_to_repository: 2026-08-21
requirements_baseline: ../project-requirements.md
review_required_from:
  - Business Analysis
  - Engineering
---

# People Management, Talent, and Engineering Resourcing Market Landscape, 2026

## Competitive intelligence, capability benchmark, and target-platform architecture assessment

**Document version:** 1.0, Elaborated Proof Edition  
**Research cut-off:** 20 August 2026  
**Industry scope:** people management, HRIS/HCM, talent development, employee experience, skills, project staffing, professional-services resource management, HR workflow, employee data security, and open-source HR platforms  
**Target context:** an engineering organization of 500+ employees requiring relationship-derived access, section-level profile security, configurable functional roles, employee self-service, risks, feedback, career history, CDS/IDP, mentorship, form campaigns, task management, resourcing, and timetracker/PeopleForce integration.

> **Non-normative research artifact.** This document provides market evidence, benchmarks, and recommendations. It does not override the normative requirements in [`docs/project-requirements.md`](../project-requirements.md). Adopted product or architecture conclusions must be recorded separately as approved decisions.


---

## Executive summary

The target is not a conventional HRIS and not merely a talent-management application. It combines four product categories that the market normally sells separately:

1. **Core HR and employee-data platform:** employee profiles, personal data, documents, custom fields, history, leave, organization structure, self-service, reporting, and security.
2. **Talent and people-development platform:** feedback, performance records, development plans, skills, career journeys, surveys, campaigns, mentorship, and manager workflows.
3. **Engineering/professional-services resource management:** project demand, staffing requests, candidate matching, availability, project assignments, approval workflows, and request history.
4. **Relationship-aware authorization platform:** access derived from reporting lines, project leadership, People Partner assignment, profile section, record visibility flags, and temporary sharing.

No reviewed commercial off-the-shelf product publicly demonstrates the entire target. **Workday, SAP SuccessFactors, and Oracle Fusion Cloud HCM** provide the deepest enterprise HCM foundations, security administration, talent modules, analytics, and integration ecosystems. **HiBob, Personio, BambooHR, PeopleForce, and Leapsome** provide more approachable mid-market people operations, customization, workflow, performance, and engagement capabilities. **Kantata** is the strongest reviewed specialist for skills-aware project staffing and resource requests; **Runn** is strong for capacity and project-demand visibility. **SAP Opportunity Marketplace** and **Workday Skills Cloud/Career Hub** are the closest enterprise references for internal opportunities, mentoring, skills, and project/gig matching.

The principal gap is authorization. The assignment requires contextual access to be recalculated for each viewer-target pair across both the reporting hierarchy and project-management graph, with a section and sometimes record-level policy. Mainstream HCM suites commonly separate functional roles from data scopes, but public evidence does not establish the exact union of transitive reporting and project relationships, the S7 PM exception, field-safe list filtering, and expiring configurable profile shares as a standard packaged capability. Oracle distinguishes roles from security profiles and supports person, organization, and position data scopes; HiBob organizes API-visible fields into permission categories; BambooHR supports custom access levels; these are useful patterns, but each requires a detailed configuration proof.

### Primary conclusion

The most defensible solution pattern is a **composable people platform**:

- retain PeopleForce as recruiting system of record where already mandated;
- retain the internal timetracker as the source of leave and project relationships;
- implement a purpose-built authorization and employee-profile aggregation layer;
- buy or integrate specialist components only where their workflow materially exceeds the custom build;
- consider Kantata for mature resource planning, or implement the narrower request/propose/approve workflow natively;
- use external Microsoft or Google forms as required, with campaigns represented internally as frozen audiences and action items;
- keep the normative policy matrix and its automated negative tests in the intelligent repository.

### Best-fit market options

- **Enterprise suite shortlist:** Workday HCM, SAP SuccessFactors, Oracle Fusion Cloud HCM.
- **Mid-market HR platform shortlist:** HiBob, PeopleForce, Personio, Leapsome.
- **Resource-management shortlist:** Kantata, Runn.
- **Open-source/reference shortlist:** Frappe HR, OrangeHRM, MintHCM, Odoo/OCA HR.
- **Likely architecture outcome:** hybrid platform or custom core, not a single-vendor replacement.

---

## 1. Research method and evidence standard

This study uses the supplied test assignment as the normative requirements baseline and follows the structure of the provided car-rental technology-landscape example. Public vendor pages, product documentation, API documentation, help centers, and public source repositories were reviewed. Product claims are treated as vendor-reported unless independently demonstrated.

### Evidence classifications

- **Publicly documented:** described in official product or technical documentation.
- **Vendor-reported:** a supplier claim not independently audited.
- **Partially evidenced:** a related capability is documented, but its depth or exact fit is unclear.
- **Configuration/customization required:** the product has primitives to implement the need, but not the stated workflow out of the box.
- **Undisclosed:** sufficient public evidence was not found; this is not proof of absence.
- **RFP validation required:** acceptance requires a tenant demonstration, configuration workshop, API test, security review, or proof of value.

### Scoring legend used in the capability matrix

- **● Strong:** substantial public evidence of a native capability.
- **◐ Partial:** relevant capability exists, but scope differs or material configuration is needed.
- **△ Extension:** likely achievable through workflow, low-code, partner product, or custom development.
- **○ Not evidenced:** no sufficient public evidence identified.
- **N/A:** not applicable to that product category.

### GitLab validation rule

The requested GitLab column includes only a repository that could be publicly verified. Most commercial vendors do not publish their product source code on GitLab. “None verified” must not be interpreted as absence of private GitLab use. Several open-source products publish on GitHub rather than GitLab; those repositories are listed in the deep dives and source register, while the GitLab column remains accurate.

---

## 2. Why this is a distinct people-platform problem

Most HRIS products assume that a manager sees a defined worker population and HR sees a broader population. The target introduces a matrixed engineering organization where the viewer's access can arise from several paths:

- direct or indirect reporting hierarchy;
- project assignment under a PM;
- project assignment under a DM;
- People Partner assignment and HR hierarchy;
- self access;
- authenticated colleague access;
- temporary shared-link access.

The same viewer can therefore hold different access relationships to different employees in one session. Functional permissions are independent: the ability to create campaigns or resourcing requests does not itself widen employee-data visibility. This is closer to a combined relationship-, attribute-, and role-based policy model than conventional role-only access.

The operational process is also cross-domain. Timetracker project assignments drive both profile display and authorization. PeopleForce candidate and vacancy data supports external resourcing. Employee filters become campaign audiences, saved views, dashboard inputs, and exports. Career history must be system-generated from temporal changes but remain manually correctable. Any product assessment that evaluates only HR records or performance reviews will miss these system-level dependencies.

---

## 3. Market landscape and maturity snapshot

### 3.1 Market categories

1. **Enterprise HCM suites:** Workday, SAP SuccessFactors, Oracle Fusion Cloud HCM.
2. **Modern mid-market HRIS/HCM:** HiBob, Personio, BambooHR, PeopleForce.
3. **People enablement and talent suites:** Leapsome, Lattice, Culture Amp and 15Five adjacent to the core requirement.
4. **Professional-services automation and resource management:** Kantata, Runn, Float, Resource Guru and Forecast.
5. **Open-source HRMS/ERP frameworks:** Frappe HR, OrangeHRM, MintHCM, Odoo/OCA HR, IceHrm.
6. **Custom policy and aggregation layer:** purpose-built application over timetracker, PeopleForce, document storage, and external forms.

### 3.2 Capability maturity

| Capability | Current market maturity | Target benchmark | Interpretation |
|---|---:|---:|---|
| Employee system of record and self-service | High | High | Commodity in HCM/HRIS suites. |
| Custom profile fields and reports | High | High | Common, but visibility and API treatment vary. |
| Temporal job and organization history | Medium-High | High | Enterprise suites are strongest; timeline UX and manual correction must be tested. |
| Documents and certificates | High | High | Common, but document-level sharing, scanning, retention, and download policy require validation. |
| Leave and absence | High | Integration only | Target reads from timetracker, so reconciliation matters more than native leave depth. |
| Performance and structured feedback | High | Medium | Target is narrower than full performance suites. |
| Surveys and campaigns | High in talent suites | Medium | External forms plus frozen-audience tasks is unusual but easy to build. |
| Mentorship | Medium | Medium | SAP and talent marketplaces are strong references; exact pair-closing workflow is uncommon. |
| Skills/CDS/IDP registry | High in talent suites | Medium | Target deliberately keeps assessment and matrix files external. |
| Project resource planning | High in PSA specialists | Medium | Kantata and Runn materially exceed the target in capacity planning. |
| Internal/external candidate proposal and approval | Medium | High | Usually split across HRIS, ATS, and PSA products. |
| Relationship-derived, section-level authorization | Low | Very High | Largest product and security gap. |
| Runtime-configurable functional roles | Medium-High | High | Enterprise suites support roles, but exact UI delegation and immediate effect need proof. |
| Field-safe arbitrary filtering and export | Medium | Very High | Hidden values must not leak through filters, counts, sort, export, search, or errors. |
| Expiring configurable profile sharing | Low | High | Common in document platforms, uncommon as an HCM profile capability. |
| Machine-readable authorization regression matrix | Low | Very High | Usually a customer engineering responsibility. |

---

## 4. Comprehensive vendor landscape

### Repository-column interpretation

The requested GitLab/repository field is retained, but it is not used as a proxy for product quality. Entries are classified as:

- **Product source:** source code for the reviewed product or its open-core edition.
- **Official developer asset:** API specifications, SDKs, connectors, examples, or documentation maintained by the provider.
- **Adjacent open source:** provider-maintained open source not implementing the reviewed HCM product.
- **None verified:** no relevant public repository was identified. This says nothing about private source control or internal CI/CD.

SAP has a public GitLab developer group and substantial official GitHub open source, but these assets do not expose SuccessFactors product source and therefore do not improve SuccessFactors capability scoring. Odoo's official product source is publicly maintained on GitHub; public GitLab projects found under the Odoo topic are predominantly third-party mirrors, add-ons, or educational projects and are not treated as authoritative product repositories.


| Vendor/platform | Category and target tier | Core strengths relevant to target | Main gaps against target | Integration readiness | Commercial model | Provider URL | Public GitLab repository |
|---|---|---|---|---|---|---|---|
| **Workday HCM** | Enterprise HCM; global organizations | Core HR, skills, talent, internal mobility, learning, analytics, enterprise security | Exact dual-graph section/record policy and custom resourcing workflow not publicly demonstrated | High, enterprise implementation | Quote-based enterprise SaaS | https://www.workday.com | None verified |
| **SAP SuccessFactors** | Enterprise HCM and talent suite | Employee Central, role-based permissions, career development, mentoring, Opportunity Marketplace, assignments and internal jobs | Target-specific profile matrix, project-derived manager access and shared links require extension | High through SAP ecosystem | Quote-based enterprise SaaS | https://www.sap.com/products/hcm.html | None verified |
| **Oracle Fusion Cloud HCM** | Enterprise HCM | Strong role/data-scope separation, person security profiles, talent profiles, workforce and talent modules | Relationship union and per-section assembly require configuration/custom policy | High, implementation-intensive | Quote-based enterprise SaaS | https://www.oracle.com/human-capital-management/ | None verified |
| **HiBob (Bob)** | Modern mid-market/enterprise HRIS | Core HR, workflows, documents, performance, surveys, analytics, configurable field categories and API permissions | PSA-style resourcing, CDS registry, S7 flags and dual-graph access not native evidence | Strong public API and service-user model | Quote-based SaaS | https://www.hibob.com | None verified |
| **PeopleForce** | Mid-market all-in-one HR platform | Core HR, ATS, onboarding, tasks, leave, performance, surveys, e-sign, custom fields, REST API/webhooks | Normative target authorization and project staffing remain custom; candidate integration is strongest because it is the mandated source | Strong, documented REST API | Per-employee SaaS/quote | https://peopleforce.io | None verified |
| **Personio** | European SMB/mid-market HRIS | Employee records, absence, recruiting, workflow, performance, API attribute whitelist and webhooks | Limited public evidence for project resourcing, mentorship and section-level relationship security | Strong public APIs, API changes must be managed | Tiered/quote SaaS | https://www.personio.com | None verified |
| **BambooHR** | SMB and mid-market HRIS | Employee records, self-service, documents, unlimited custom fields/tables, custom access levels, performance | Resource requests, project hierarchy and record flags are not core strengths | API/integration marketplace; custom-field sync caveats | Quote-based SaaS | https://www.bamboohr.com | None verified |
| **Leapsome** | Mid-market people enablement plus HRIS | Reviews, feedback, goals, competencies, surveys, learning, HRIS/workflows | Resourcing and target access model absent; deeper HR record controls require validation | Integrates with major HRIS/work tools | Modular quote-based SaaS | https://www.leapsome.com | None verified |
| **Lattice** | Performance, engagement and growth platform | Reviews, OKRs, surveys, career growth, competency matrices, IDPs, compensation | Not a complete match for project-driven access/resourcing and transactional HR integration | Broad HRIS/work-tool integrations | Modular per-seat SaaS | https://lattice.com | None verified |
| **Kantata** | PSA and enterprise resource management | Resource requests, skills inventory, recommendations, team builder, allocations, custom fields, availability and cost impact | Not an HR profile/privacy platform; risks, documents, PP access and self-service need another system | API-first proposition and enterprise connectors | Quote-based SaaS | https://www.kantata.com | None verified |
| **Runn** | Resource and capacity planning | People/project capacity, placeholders, tentative demand, skills/tags, leave-aware availability and scenario planning | No deep people-management, talent, ATS or section security | API and integrations | Public tiers plus enterprise | https://www.runn.io | None verified |
| **Frappe HR** | Open-source HR/payroll | Employee lifecycle, leave, onboarding, history, goals, appraisals, 360 feedback, workflows and extensible framework | Authorization and resourcing need substantial development; payroll is extra scope | Highly extensible Frappe/ERPNext ecosystem | Open source plus hosted/support | https://frappe.io/hr | None verified; source on GitHub |
| **OrangeHRM** | Open-source and commercial HRMS | Employee data, leave, recruitment, performance, reports, self-hosting and source customization | Target policy model, mentorship and resourcing require custom modules | Connectors and source access | Free Starter plus paid editions | https://orangehrm.com | None verified; source on GitHub |
| **MintHCM** | Open-source HCM | Profiles, skills, employment history, performance, recruitment, onboarding, analytics, roles and permissions | Smaller ecosystem and limited enterprise proof; target workflows need custom engineering | Open code, API/agent-oriented architecture | AGPL self-hosted plus services | https://minthcm.org | None verified; source on GitHub |
| **Odoo + OCA HR** | Open-core ERP and community HR modules | Employees, recruitment, time off, planning, appraisals, documents, workflows and broad ERP extensibility | Exact profile matrix and resourcing approval history require design; edition/module boundaries matter | Strong module/API ecosystem | Community/open-core plus Enterprise | https://www.odoo.com | None verified; OCA source on GitHub |
| **IceHrm** | Open-source/commercial HRMS | Employee profiles, organization, documents, projects/timesheets, custom fields, permissions, audit; paid extensions add performance/recruitment | Open edition lacks some relevant modules; target policy/resourcing require major work | REST/API and self-hosting | Open source plus Pro/Cloud | https://icehrm.com | None verified; source on GitHub |
| **Custom composable platform** | Purpose-built | Exact normative access model, timetracker graph, PeopleForce candidates, target workflows and tests | Highest engineering ownership; must build admin, audit, UX and operational maturity | Designed around required APIs/events | Internal build and run cost | Internal | Internal project repository |

Product evidence: Workday connects skills to recruiting, learning, internal mobility and analytics; SAP Opportunity Marketplace supports assignments, internal jobs, learning and mentoring; Oracle documents separate HCM roles and data-security profiles; HiBob documents category-based API permissions; PeopleForce documents REST access to employee and recruiting entities.

Open-source evidence: Frappe HR publishes an active GPL repository and employee-lifecycle/performance modules; OrangeHRM publishes its product source; MintHCM publishes an AGPL repository; OCA maintains HR add-ons for Odoo; IceHrm publishes its core repository.

---

## 5. Target capability and requirements matrix

### 5.1 Product capability comparison

The matrix compares whether each platform provides a usable starting point. It does **not** certify that the assignment's normative behavior is available without configuration or customization.

| ID | Capability / requirement | Workday | SAP SF | Oracle HCM | HiBob | PeopleForce | Personio | BambooHR | Leapsome | Lattice | Kantata | Runn | Frappe HR | OrangeHRM | MintHCM | Odoo/OCA | Custom |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| C01 | Employee master profile and org hierarchy | ● | ● | ● | ● | ● | ● | ● | ◐ | ◐ | ◐ | ◐ | ● | ● | ● | ● | ● |
| C02 | Self-service personal and emergency contacts | ● | ● | ● | ● | ● | ● | ● | ◐ | ◐ | ○ | ○ | ● | ● | ● | ● | ● |
| C03 | Custom fields without schema deployment | ● | ● | ● | ● | ● | ● | ● | ◐ | ◐ | ● | ● | ● | ● | ● | ● | ● |
| C04 | Field/section visibility and scoped edit rights | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ● | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ● |
| C05 | Relationship-derived transitive manager access | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | △ | △ | △ | △ | ● |
| C06 | Project PM/DM relationship grants profile access | △ | △ | △ | △ | △ | △ | △ | ○ | ○ | ◐ | ◐ | △ | △ | △ | △ | ● |
| C07 | Runtime-configurable functional roles/permissions | ● | ● | ● | ● | ◐ | ◐ | ● | ◐ | ◐ | ● | ◐ | ● | ● | ● | ● | ● |
| C08 | Per-record visibility flags for notes/feedback | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ○ | ○ | ◐ | ◐ | ◐ | ◐ | ● |
| C09 | Employee documents and certificate uploads | ● | ● | ● | ● | ● | ● | ● | ◐ | ○ | ○ | ○ | ● | ● | ● | ● | ● |
| C10 | Temporal employment history and career timeline | ● | ● | ● | ● | ◐ | ● | ● | ◐ | ◐ | ○ | ○ | ● | ◐ | ● | ◐ | ● |
| C11 | Leave/absence profile view and integration | ● | ● | ● | ● | ● | ● | ● | ● | ○ | ◐ | ● | ● | ● | ● | ● | ● |
| C12 | Risk records, severity, trend and scoped dashboard | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ○ | ○ | △ | △ | △ | △ | ● |
| C13 | Management notes with PM/employee flags | △ | △ | △ | △ | △ | △ | △ | △ | △ | ○ | ○ | △ | △ | △ | △ | ● |
| C14 | Structured feedback history and sharing | ● | ● | ● | ● | ● | ● | ● | ● | ● | ○ | ○ | ● | ● | ● | ● | ● |
| C15 | CDS registry, skills matrix links and IDPs | ● | ● | ● | ◐ | ● | ◐ | ◐ | ● | ● | ● | ◐ | ● | ◐ | ● | ◐ | ● |
| C16 | Mentorship opt-in, matching, pairs and closure | ● | ● | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ○ | ○ | △ | △ | △ | △ | ● |
| C17 | Action items/tasks with due/overdue/completion | ● | ● | ● | ● | ● | ● | ● | ● | ◐ | ● | ◐ | ● | ● | ● | ● | ● |
| C18 | Forms/surveys with filtered frozen audience | ◐ | ◐ | ◐ | ● | ● | ◐ | ◐ | ● | ● | ○ | ○ | △ | ◐ | ◐ | ◐ | ● |
| C19 | All-employees arbitrary filter/columns/saved views | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| C20 | Visibility-safe filter, sort, count and export | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | △ | △ | △ | △ | ● |
| C21 | UM/DM/PM/PP dashboards from one component model | △ | △ | △ | △ | △ | △ | △ | △ | △ | ◐ | ◐ | △ | △ | △ | △ | ● |
| C22 | Resource request creation and fulfilment | ◐ | ● | ◐ | ○ | ◐ | ○ | ○ | ○ | ○ | ● | ◐ | △ | △ | △ | ◐ | ● |
| C23 | Skills-/availability-based candidate suggestions | ● | ● | ● | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ● | ● | ◐ | ◐ | ● | ◐ | ● |
| C24 | Internal and external candidate proposal/approval | ◐ | ◐ | ◐ | ○ | ◐ | ◐ | ◐ | ○ | ○ | ◐ | ○ | △ | △ | △ | △ | ● |
| C25 | Request history on employee profile | △ | △ | △ | ○ | △ | ○ | ○ | ○ | ○ | ◐ | ○ | △ | △ | △ | △ | ● |
| C26 | Expiring, revocable section-configured profile share | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | △ | △ | △ | △ | ● |
| C27 | Timetracker projects/leaves as authoritative source | △ | △ | △ | △ | △ | △ | △ | △ | △ | △ | △ | △ | △ | △ | △ | ● |
| C28 | PeopleForce candidate/vacancy integration | △ | △ | △ | △ | ● | △ | △ | △ | △ | △ | △ | △ | △ | △ | △ | ● |
| C29 | API/webhooks and graceful synchronization | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| C30 | Authorization matrix regression-test ownership | △ | △ | △ | △ | △ | △ | △ | △ | △ | △ | △ | △ | △ | △ | △ | ● |

Supporting examples: BambooHR publishes unlimited custom fields, tabs and tables and employee self-service; Personio exposes system and custom employee attributes and supports attribute whitelisting; Kantata supports weighted recommendations using role, availability, skills, cost impact and custom fields; Runn supports placeholders, real-time capacity, time off and scenario planning.

### 5.2 Score-change rationale and normative traceability

| Item | V3 treatment | Reason | Acceptance basis |
|---|---|---|---|
| **PeopleForce C24** | **◐ Partial** | PeopleForce documents candidate and vacancy APIs, but the target's internal/external proposal, UM submission, per-candidate DM decision, written rejection and profile request history require orchestration outside the documented ATS flow. | Target specification §4.7 and §5.2; PeopleForce recruiting API documentation. |
| **HiBob C12** | **◐ Partial** | Bob has workflow, analytics and configurable-data primitives, but no reviewed official source establishes the normative risk entity, five severity levels, trend comparison, manager/PP-only visibility and scoped Risk Dashboard. | Target specification §4.6. |
| **Leapsome/Lattice C08** | **◐ Partial** | Both support feedback-related processes, but no reviewed official source establishes the exact record-level visibility semantics required for S7/S8. Generic confidentiality or review visibility is insufficient evidence. | Target specification §3.2 to §3.3 and §4.15. |
| **C26 all commercial vendors** | **○ Not evidenced** | This means the research did not identify sufficient public proof of an expiring, revocable, per-section profile share matching §4.8. It is not a claim that every possible edition or custom configuration lacks the feature. | Target specification §4.8; scripted RFP demonstration required. |
| **C27** | Mostly **△ Extension** | The requirement is not generic integration. The internal timetracker must authoritatively supply leaves, projects, PM and DM, and project data must drive authorization. | Target specification §5.1, §2.1 and Definition of Done §9. |
| **C30** | Mostly **△ Extension** | Vendors may provide security testing, but the customer must own a machine-readable matrix covering every audience, relationship path, section and negative case. | Target specification §7, §8 and Definition of Done §9. |

### 5.3 Normative authorization fit matrix

| Authorization requirement | Market availability | Best starting points | Required validation or build |
|---|---|---|---|
| Functional permission separated from worker-data scope | Medium-High | Oracle data roles/security profiles; SAP role permissions; HiBob permission groups | Prove that feature grant never broadens target population. |
| Direct and indirect manager hierarchy | High | Workday, SAP, Oracle, HiBob, BambooHR | Validate effective dates, temporary managers, cycles and cache invalidation. |
| PM and DM as managerial paths for assigned project staff | Low-Medium | Kantata project roles; custom graph from timetracker | Usually requires custom relationship ingestion and policy evaluation. |
| Union of reporting and project graphs | Low | Custom policy engine | Preserve relationship subtype because PM is restricted in S7. |
| Section-level response assembly | Medium | Oracle/HiBob/BambooHR primitives | Ensure the API never returns denied sections. |
| Record flags for employee/PM visibility | Low | Talent feedback modules as reference | Custom flags and policy predicates likely required. |
| Colleague whitelist | Medium | Public profile/directory functions | Implement allowlist server-side, not frontend hiding. |
| Custom-field visibility in filters and columns | Medium-Low | HiBob categories; BambooHR custom access; enterprise HCM security | Test inference through filter result, count, sort, saved view and export. |
| Anonymous/shared-link section whitelist | Low | Custom tokenized share service | Hash token, enforce expiry/revocation, log access, protect document downloads separately. |
| Immediate revocation after permission/project change | Medium | Enterprise HCM platforms | Prove cache TTL, event invalidation and open-session behavior. |

Oracle's published model explicitly distinguishes job/abstract/duty roles from HCM data roles and security profiles that identify which people and organizations users can access. HiBob's public API follows platform permission logic and grants fields through categories rather than arbitrary individual API fields. These are the closest documented patterns, but neither public source establishes the assignment's exact policy.

---

## 6. Vendor deep dives

### 6.1 Workday HCM

**Website:** https://www.workday.com  
**Public GitLab:** none verified

Workday is a leading enterprise reference for a unified worker model, talent, skills, recruiting, learning and analytics. Skills Cloud links skills to recruiting, learning, personalized development, job recommendations, networking and talent-marketplace experiences. People Analytics provides secure, personalized workforce insights and covers organization composition, retention, hiring, talent, performance and skills.

**Strengths**

- enterprise worker and organization foundation;
- effective-dated business processes and broad security administration;
- skills taxonomy, internal mobility and development;
- analytics, dashboards and external-data combination;
- mature enterprise integration and implementation ecosystem.

**Limitations and validation questions**

- demonstrate project-assignment-derived profile access, not simply project staffing;
- demonstrate the S7 PM exception and independent employee/PM record flags;
- prove that custom-field filtering and exports cannot infer forbidden values;
- clarify whether the narrow CDS registry can avoid over-implementing Workday talent processes;
- quantify licensing and implementation effort for 500 employees.

**Best fit:** an organization already standardized on Workday or planning a broad HCM transformation, not a lightweight target-specific build.

### 6.2 SAP SuccessFactors

**Website:** https://www.sap.com/products/hcm.html  
**Public GitLab:** none verified

SuccessFactors is particularly relevant because Opportunity Marketplace combines internal assignments, jobs, learning and mentoring. Managers can source talent for projects, employees can apply for temporary assignments, and recommendations use skills/interests or Growth Portfolio attributes. Career Development Planning also includes formal mentoring program configuration and participant experiences.

**Strengths**

- deep Core HR and talent suite;
- internal opportunity and assignment marketplace;
- mentoring and career-development reference workflows;
- broad enterprise permissions, analytics and integration ecosystem;
- strong fit for skills-based internal mobility.

**Limitations**

- the target resourcing flow is request/propose/DM approve, not an employee opportunity marketplace;
- PeopleForce remains the external candidate source;
- profile section matrix and temporary sharing need a configuration proof;
- likely too broad and implementation-heavy if only this bootcamp platform is required.

**Best fit:** enterprise buyers wanting full talent transformation and internal mobility, especially in an existing SAP landscape.

### 6.3 Oracle Fusion Cloud HCM

**Website:** https://www.oracle.com/human-capital-management/  
**Public GitLab:** none verified

Oracle is the clearest reviewed enterprise reference for separating functionality from data scope. Its HCM security documentation covers role-based security, HCM data roles, person security profiles, organization/position/document-type profiles, application-user provisioning and security-console administration. Talent Profile Management provides a configurable profile foundation.

**Strengths**

- strong security vocabulary and administration;
- enterprise profile, talent and workforce data;
- mature roles, security profiles, reporting and integration;
- suitable for complex organization and legal-entity boundaries.

**Limitations**

- public evidence does not prove the two-graph relationship union;
- widespread data roles can become operationally complex;
- S7, profile-sharing and target resourcing remain custom processes;
- implementation cost and governance burden may be disproportionate.

**Best fit:** an enterprise Oracle environment where the target can be implemented as governed extensions around a mature HCM core.

### 6.4 HiBob

**Website:** https://www.hibob.com  
**Public GitLab:** none verified

Bob combines core HR, workflows, e-signature/documents, performance, surveys, talent analytics and people analytics. Its public API permission model is important: API service users receive permission groups, and fields are organized into categories that form the permission unit. People Analytics supports custom reports, scheduled sharing, attrition indicators and slicing by organizational dimensions.

**Strengths**

- modern employee experience and mid-market usability;
- strong employee records, workflows, documents and analytics;
- useful category-level permission and service-user model;
- custom reporting and broad HR workflows.

**Limitations**

- categories are not the exact 16-section matrix;
- no public evidence of project PM/DM paths driving sensitive profile access;
- resourcing requests and candidate approval need another component;
- S7 and shared profile links require custom development.

**Best fit:** a modern HRIS foundation with a separate authorization/profile and resourcing layer.

### 6.5 PeopleForce

**Website:** https://peopleforce.io  
**Developer portal:** https://developer.peopleforce.io  
**Public GitLab:** none verified

PeopleForce is strategically unavoidable because the specification explicitly identifies it as the recruiting system of record. The platform covers Core HR, ATS, onboarding, tasks, leave, performance, surveys, custom fields, e-signature and reporting. Its REST API supports employee, candidate, vacancy, leave, department, division and position entities; API keys are passed over HTTPS, and webhooks are available for employee and recruiting events.

**Strengths**

- mandated external-candidate and vacancy source;
- strong API documentation and recruiting data model;
- adequate all-in-one HR capabilities for many target functions;
- familiar local/regional fit and actionable integration route.

**Limitations**

- company API keys can provide broad employee-data access and require strict secret handling and intermediary filtering;
- target normative authorization should not be delegated without proof;
- project-based access depends on the internal timetracker;
- a complete replacement would duplicate rather than simplify existing source-of-truth responsibilities.

**Best fit:** retain as ATS/recruiting source and integrate candidates/vacancies; evaluate selectively as the broader HR core.

### 6.6 Personio

**Website:** https://www.personio.com  
**Developer portal:** https://developer.personio.de  
**Public GitLab:** none verified  
**Public source artifact:** https://github.com/personio/api-docs

Personio targets European small and mid-sized companies with employee data, absence, attendance, recruiting, workflows, performance and APIs. API credentials can whitelist readable employee attributes; employee endpoints support system and custom attributes, while separate recruiting credentials and person webhooks support integration. Personio has active v1/v2 API evolution, so consumers must manage deprecations contractually and technically.

**Best fit:** European HR operations where usability and API integration matter more than advanced project staffing.

### 6.7 BambooHR

**Website:** https://www.bamboohr.com  
**Public GitLab:** none verified

BambooHR provides a strong employee-record and self-service baseline, including an org chart, documents and unlimited custom fields, tabs and tables. It markets highly specific custom access levels and configurable performance cycles. A material integration caveat is that custom tables or fields may not automatically synchronize with partner integrations built around standard fields.

**Best fit:** a simpler HRIS foundation for a smaller or mid-market organization. It is not the strongest match for matrixed engineering resourcing.

### 6.8 Leapsome and Lattice

**Websites:** https://www.leapsome.com and https://lattice.com  
**Public GitLab:** none verified

Leapsome is strong in configurable reviews, project-based/360 feedback, goals, competencies, surveys and HR workflows. Lattice is strong in performance, OKRs, engagement, career growth, competency matrices, IDPs and compensation. These products provide useful UX and process benchmarks for S8 feedback, CDS/IDP, campaigns and manager dashboards, but neither publicly demonstrates the target's project-driven profile authorization or resourcing process.

**Best fit:** talent layer integrated with a separate HRIS and resource-management platform.

### 6.9 Kantata

**Website:** https://www.kantata.com  
**Public GitLab:** none verified

Kantata is the closest reviewed commercial analogue to the assignment's resourcing domain. It supports resource needs, skills and skill levels, approval-oriented fulfilment, custom-field filtering, weighted recommendations, Team Builder, tentative and hard allocations, availability, cost impact, resource requests and saved views.

**Strengths**

- deep staffing, capacity and project-demand workflows;
- skills inventory and recommendation criteria;
- resource requests and role-based staffing;
- strong professional-services operational model.

**Limitations**

- much broader PSA economics than the target requires;
- not a sensitive employee-profile system;
- external PeopleForce candidates and DM approval history require integration/customization;
- assignment approval in the target does not itself create the timetracker project relationship.

**Best fit:** buy when resource management is strategically broader than this iteration. Otherwise use as a process/design benchmark.

### 6.10 Runn

**Website:** https://www.runn.io  
**Public GitLab:** none verified

Runn provides clear capacity, demand, workload, placeholder, role, skills/tag, time-off and scenario-planning views. It is easier to adopt than a full PSA but is primarily a planning tool, not an HR or authorization platform.

**Best fit:** lightweight capacity planning where staffing visibility matters more than structured candidate approval.

### 6.11 Frappe HR

**Website:** https://frappe.io/hr  
**Source:** https://github.com/frappe/hrms  
**Public GitLab:** none verified

Frappe HR provides an active open-source HR/payroll foundation with employee lifecycle, onboarding, promotions/transfers, work history, leave, documents, goals, appraisal cycles, formula-driven scoring, self-appraisal and 360 feedback. Its extensible DocType and workflow model makes it a credible build accelerator, but implementing the normative access graph and leak-safe filter engine remains a major custom effort.

**Best fit:** teams prepared to own a Python/Frappe platform and security-hardening program.

### 6.12 OrangeHRM

**Website:** https://orangehrm.com  
**Source:** https://github.com/orangehrm/orangehrm  
**Public GitLab:** none verified

OrangeHRM covers employee management, recruitment, onboarding, leave, performance, career development, training, surveys and reporting. Its Starter edition is downloadable and modifiable, while commercial editions add broader capability and support. It is a useful conventional HRMS base but not a direct implementation of the target's relationship authorization or resourcing workflow.

### 6.13 MintHCM

**Website:** https://minthcm.org  
**Source:** https://github.com/minthcm/minthcm  
**Public GitLab:** none verified

MintHCM is an AGPL HCM with recruitment, profiles, skills, employment history, performance, leave, onboarding/offboarding, analytics and roles/permissions. Its open data model and current agent-oriented direction make it interesting for intelligent-repository experiments, but it has a smaller ecosystem and needs stronger enterprise-scale, security and reference validation.

### 6.14 Odoo and OCA HR

**Website:** https://www.odoo.com  
**Community source:** https://github.com/OCA/hr  
**Public GitLab:** none verified

Odoo supplies employees, recruitment, time off, planning, documents, appraisals and a general workflow/ERP framework. OCA adds community HR modules including appraisal, contract documents, collective agreements and employee extensions. The modular architecture is powerful, but edition boundaries, community-module quality and upgrade compatibility must be governed.

### 6.15 IceHrm

**Website:** https://icehrm.com  
**Source:** https://github.com/gamonoid/icehrm  
**Public GitLab:** none verified

IceHrm Open Core includes employees, hierarchy, documents, projects/timesheets, custom fields, permissions and audit logging. Performance and recruitment are paid extensions rather than open-core features. This makes it a possible foundation for conventional HR administration, but not a close fit to the complete target.

---

## 7. Functional and technical benchmark

### 7.1 Employee-data platform

Minimum proof should include:

- stable cross-system employee identifier, not email-only matching;
- effective-dated reporting, department, position, employment type and project relationships;
- self-service field ownership and approval behavior;
- custom field types, lifecycle, visibility and API behavior;
- document access, scanning, retention, versioning and download audit;
- pseudonymized non-production data;
- exports, search and reporting that reuse the same authorization policy.

### 7.2 Authorization and security

The target decision can be represented as:

```text
ALLOW(actor, action, target, section, record, context)
  = feature_permission(actor, action)
    AND relationship_scope(actor, target, context)
    AND section_policy(audience, section, action)
    AND record_flags(record, audience)
    AND field_visibility(field, audience)
```

The policy must retain **why** manager access exists. A PM and DM are both managers for most sections, but a PM is restricted for management notes. A flattened boolean such as `is_manager=true` is insufficient.

Minimum tests:

- self, colleague, direct manager, indirect manager, PM, DM, PP, HR line and HR Admin;
- all 16 sections and read/write actions;
- positive and negative tests for each matrix cell;
- S7 employee and PM flags independently on and off;
- multiple relationship paths and strongest-permission resolution;
- ended project assignment and revoked role during an active session;
- filter, count, sort, saved view, export, notification, search and error-message leakage;
- direct object-reference and document-download attempts.

### 7.3 Custom-field and filtering engine

A credible product must demonstrate:

- text, number, date, single-select, multi-select and boolean fields;
- stable field identifiers independent of display labels;
- per-field visibility;
- immediate appearance in list columns and filters;
- numeric derived fields such as years with company;
- inline edit with optimistic locking and audit;
- saved-view behavior after field rename, deletion or visibility change;
- exports recomputed under current permissions;
- no unauthorized inference through zero/non-zero counts.

### 7.4 Career timeline and temporal data

The timeline is not a manually maintained biography. It is a projection of typed changes, with controlled manual correction. Required engineering behaviors include:

- source event reference;
- effective date and recorded-at timestamp;
- idempotent generation;
- correction without duplicate regeneration;
- manual-add/edit/delete attribution and reason;
- overlapping-period validation;
- backfill import from historical spreadsheets;
- reconciliation when source history changes later.

### 7.5 Resourcing

Minimum target flow:

```text
DM/PM creates request
  -> UM receives/accepts request
  -> UM proposes one or more internal employees or PeopleForce candidates
  -> DM approves or rejects each proposal with reason
  -> immutable attempt history
  -> no direct project assignment
  -> next timetracker sync establishes the project and access relationship
```

Kantata can inspire resource needs, weighted matching, Team Builder and saved views; Runn can inspire demand/capacity and placeholder visualization. Neither should overwrite the target's source-of-truth boundary.

### 7.6 Campaigns and action items

Campaign activation must freeze the audience, create one action item per recipient and accept self-declared completion without reading the external form. Products with sophisticated survey engines may tempt the team to exceed scope. The appropriate benchmark is reliable audience resolution, due dates, reminders, status and per-recipient progress, not form-authoring depth.

---

## 8. Enterprise reference architecture

```text
PeopleForce ATS             Internal Timetracker          Identity Provider
(candidates/vacancies)      (leaves/projects/PM/DM)       (users/groups/SSO)
        |                             |                           |
        +--------- API/webhook ingestion and reconciliation -----+
                                      |
                         Canonical identity and relationship model
                                      |
             Reporting graph + project graph + PP assignments
                                      |
                    Authorization policy decision service
                                      |
 Employee profile | Custom fields | Timeline | Risks | Feedback | CDS
                                      |
 Campaigns/tasks | Mentorship | Resourcing | Shared links | Documents
                                      |
        Policy-filtered APIs, searches, dashboards, exports and notifications
                                      |
            Immutable audit | Metrics | Alerts | Regression-test matrix
```

### Required integration controls

- idempotency and replay;
- schema-version handling;
- dead-letter queue or recoverable failure store;
- source timestamps and effective dates;
- reconciliation jobs in addition to webhooks;
- quarantine for unresolved identities;
- bounded stale-data behavior;
- access revocation after ended assignment;
- no personal data in logs or agent context;
- secrets manager for PeopleForce and timetracker credentials.

### Build-versus-buy boundary

**Buy/integrate:** identity provider, secure object storage, malware scanning, e-signature if needed, external forms, and possibly resource planning.  
**Build/control:** policy evaluation, target profile composition, source reconciliation, custom-field visibility, target resourcing state machine, career event projection, shared-profile service and authorization tests.

---

## 9. Solution patterns and fit assessment

### Pattern A: Enterprise HCM as the primary platform

**Candidates:** Workday, SAP SuccessFactors, Oracle Fusion Cloud HCM.  
**Advantages:** enterprise security, data governance, talent, analytics and integration.  
**Risks:** cost, implementation duration, process overreach, and difficult target-specific authorization.  
**Fit:** medium, unless the organization already owns the suite.

### Pattern B: Modern HRIS plus custom target layer

**Candidates:** HiBob, PeopleForce, Personio or BambooHR, plus a custom policy/profile/resourcing application.  
**Advantages:** faster HR core, modern UX, simpler implementation.  
**Risks:** duplicate profiles, policy mismatch and integration consistency.  
**Fit:** high if one HRIS becomes the worker master and timetracker remains project/leave master.

### Pattern C: Talent suite plus HRIS and PSA

**Candidates:** Leapsome or Lattice + HRIS + Kantata/Runn.  
**Advantages:** strongest specialist workflows.  
**Risks:** three systems, fragmented authorization, duplicate tasks and expensive integration.  
**Fit:** low-medium for the assignment; more suitable for mature enterprise operating models.

### Pattern D: Open-source foundation plus custom modules

**Candidates:** Frappe HR, OrangeHRM, MintHCM or Odoo/OCA.  
**Advantages:** source control, extensibility and data sovereignty.  
**Risks:** security ownership, upgrade burden, UI consistency and enterprise support.  
**Fit:** medium-high for a learning bootcamp if the foundation is selected deliberately and hardened.

### Pattern E: Purpose-built composable platform

**Advantages:** exact normative behavior, clean source boundaries, best traceability and testability.  
**Risks:** most engineering work and long-term ownership.  
**Fit:** highest for the bootcamp's learning objective, provided scope is disciplined.

---

## 10. Concepts to master

### 10.1 Weighting sensitivity

| Organization profile | Increase weighting | Reduce weighting | Decisive proof point |
|---|---|---|---|
| Existing enterprise HCM customer | Native extension, security, integration and upgrade safety | Greenfield simplicity | Configured proof of the complete access matrix in the existing tenant. |
| 500-2,000 employee engineering company | UX, API, custom fields, project graph and manager workflows | Global payroll breadth | Timetracker event changes PM/DM access correctly within the agreed SLO. |
| Professional-services organization | Skills, capacity, requests, allocation and utilization | Deep payroll | Candidate request through approval and eventual source-of-truth project sync. |
| Privacy-sensitive multinational | section/field policy, legal boundaries, audit and data residency | Lightweight setup | Negative tests prove no leak through API, report, export, document or search. |
| Bootcamp/learning program | architecture clarity, parallel delivery, intelligent repository and tests | feature breadth | Machine-readable policy generates repeatable authorization tests. |

### 10.2 Ten questions for the first vendor meeting

1. Configure a PM, DM, UM and PP who each reach the same employee through different relationships; show the exact profile sections and actions each receives.
2. End a project assignment and show when access disappears from API, search, dashboard, export and an already-open session.
3. Add a custom field, set it to management-only and prove that a colleague cannot infer it through filters, sort order, saved views, counts or exports.
4. Demonstrate two independent record flags on a management note: visible to employee and visible to PM.
5. Show how direct and indirect reporting access combines with project assignment without duplicating users or roles.
6. Export the complete audit decision for a denied and allowed profile request, including relationship path and policy version.
7. Show an expiring, revocable profile share with selected sections and protected document downloads.
8. Demonstrate API/webhook replay, duplicate events, out-of-order updates and reconciliation after an outage.
9. Show how functional permissions can be created through the UI without widening employee-data scope.
10. Provide three customer references using matrix/project organizations and field-level privacy at comparable scale.

### 10.3 Minimum data-readiness audit

| Audit area | Minimum evidence | Common failure mode |
|---|---|---|
| Identity | Stable IDs for platform, PeopleForce and timetracker; merge/split process | Email changes create duplicate people. |
| Reporting relationships | Effective-dated manager edges and cycle detection | Current scalar manager overwrites history. |
| Project access | Membership, PM, DM, start/end, source timestamps | Ended assignments remain authorized. |
| PP assignments | Effective dates, HR hierarchy and delegation | PP scope is maintained manually in several systems. |
| Employee fields | Dictionary, owner, sensitivity, visibility and history | Fields are added without security classification. |
| Documents | Category, owner, retention, version, scan status and access log | Storage URL bypasses application policy. |
| Timeline | Source changes, historical backfill and correction reason | Duplicate events after replay or correction. |
| Resourcing | Request, proposal, candidate source, decision and reason | Approval is confused with actual project assignment. |
| Authorization | Machine-readable matrix and relationship fixtures | UI hides data that the API still returns. |
| Non-production data | Pseudonymization method and safe screenshots/logging | Real employee data enters repositories or agent prompts. |

---

## 11. Mandatory proof-of-value evidence

### Access and privacy

- Execute the complete 16-section matrix for every audience.
- Demonstrate PM-specific S7 behavior and multiple simultaneous relationships.
- Prove server-side denial for search, API, export, reports, documents, notifications and errors.
- Show cache invalidation and immediate permission removal.
- Show audit logs without logging sensitive record content.

### Employee platform

- Add, rename, change visibility and delete a custom field.
- Demonstrate effective-dated position, grade, department and employment-type changes.
- Generate timeline events and manually correct one with an audit reason.
- Upload a certificate and test content scanning, expiry and access.

### Resourcing and integrations

- Create an unattached request.
- Propose an internal employee and a PeopleForce candidate.
- Approve one and reject another with reason.
- Show that approval does not create a project assignment.
- Simulate timetracker and PeopleForce outages, duplicates and delayed events.

### Architecture and operations

- Export API definitions, data dictionary and configuration.
- Demonstrate SSO, user deactivation, secret rotation and least-privilege service accounts.
- Provide p50/p95/p99 API and list performance using 500+ pseudonymized employees.
- Show backup/restore, audit retention, deletion and incident response.
- Define ownership and portability of custom fields, documents, workflow history and audit records.

---

## 12. Vendor shortlists

### Enterprise HCM shortlist

- **Oracle Fusion Cloud HCM** for the clearest documented distinction between functional roles and person/organization data scopes.
- **SAP SuccessFactors** for internal opportunities, assignments, career development and mentoring.
- **Workday HCM** for skills, talent mobility, analytics and enterprise HCM breadth.

### Mid-market HR platform shortlist

- **HiBob** for modern HR core, workflows, analytics and permission categories.
- **PeopleForce** for direct alignment with the mandated recruiting source and broad HR workflow.
- **Personio** for European mid-market HR operations and attribute-whitelisted APIs.
- **Leapsome** where talent, feedback, surveys and development are more important than deep resourcing.

### Resource management shortlist

- **Kantata** for resource requests, skills, weighted recommendations and project staffing.
- **Runn** for transparent capacity, placeholders, demand and scenario planning.

### Open-source shortlist

- **Frappe HR** as the strongest general build accelerator among the reviewed open-source products.
- **OrangeHRM** as a mature conventional HRMS reference with source access.
- **MintHCM** for open HCM, skills/history and experimentation with agent-oriented integration.
- **Odoo/OCA HR** when a broader ERP framework and modular business workflows are desirable.

### Recommended target pattern

For this assignment, prioritize a **purpose-built modular application** with:

1. canonical person and relationship model;
2. centralized policy decision and profile composition service;
3. PeopleForce recruiting adapter;
4. timetracker project/leave adapter;
5. generic custom-field/filter/view engine;
6. event-based career timeline;
7. narrow resourcing workflow;
8. campaign-to-action-item workflow;
9. secure document and shared-link services;
10. machine-readable authorization regression tests.

Use commercial and open-source products as capability and UX references unless a broader organizational procurement decision already exists.

---

## 13. Final conclusion

The broad HCM market can satisfy most individual requirements, but not the complete combination as a single publicly evidenced package. Enterprise suites are strongest in worker records, talent, enterprise security and analytics. Modern HRIS platforms are strongest in usability, custom profiles, workflows and self-service. Talent platforms are strongest in feedback, surveys and development. PSA products are strongest in project staffing and capacity. Open-source HRMS products provide useful acceleration but transfer security, upgrade and operational responsibility to the team.

The requirement that changes the answer is the authorization model. It treats organizational and project relationships as live inputs to section- and record-level policy. That access must govern every surface, including filters, exports, documents, notifications and errors. This is not a normal configuration footnote; it is the system's primary quality attribute.

A single-vendor selection would therefore either over-buy a broad enterprise suite or under-deliver the normative policy. A composable architecture is more credible: use source systems for what they own, build the relationship-aware policy and workflow core, and adopt specialist components only where they produce demonstrable value without fragmenting access control.

---

## Source register and traceability links

### Target specification

- [`docs/project-requirements.md`](../project-requirements.md), the normative requirements baseline in this repository.

### Enterprise HCM

- Workday Skills Cloud: https://www.workday.com/en-us/products/human-capital-management/skills-cloud.html
- Workday People Analytics: https://www.workday.com/en-us/products/analytics-reporting/augmented-analytics.html/
- SAP Opportunity Marketplace overview: https://help.sap.com/docs/successfactors-opportunity-marketplace/implementing-opportunity-marketplace/overview-of-sap-successfactors-opportunity-marketplace
- SAP Mentoring learning content: https://learning.sap.com/courses/sap-successfactors-career-development-planning-and-mentoring-academy/using-sap-successfactors-mentoring_e587fc09-2103-4053-b413-b04e746c0919
- Oracle HCM security: https://docs.oracle.com/en/cloud/saas/human-resources/ochus/overview-of-securing-oracle-hcm-cloud.html
- Oracle HCM Profile Management: https://docs.oracle.com/en/cloud/saas/talent-management/fauep/oracle-cloud-hcm-profile-management.html

### Modern HR and talent platforms

- HiBob platform: https://www.hibob.com/
- HiBob API permissions: https://apidocs.hibob.com/reference/permissions
- PeopleForce platform: https://peopleforce.io/
- PeopleForce API introduction: https://developer.peopleforce.io/docs/getting-started
- Personio API: https://developer.personio.de/docs/getting-started-with-the-personio-api
- BambooHR employee records: https://www.bamboohr.com/platform/hr-data-and-reporting/employee-records
- Leapsome performance: https://www.leapsome.com/product/performance-management-software
- Lattice platform: https://lattice.com/platform

### Resource management

- Kantata skills management: https://www.kantata.com/psa/resource-management-software/skills-management-software
- Kantata resource recommendations: https://knowledge.kantata.com/hc/en-us/articles/360052133933-Resource-Recommendations-Overview
- Runn: https://www.runn.io/
- Runn capacity planning: https://www.runn.io/features/capacity-management

### Open source

- Frappe HR source: https://github.com/frappe/hrms
- Frappe HR employee lifecycle: https://frappe.io/hr/employee-lifecycle
- OrangeHRM source: https://github.com/orangehrm/orangehrm
- OrangeHRM Starter: https://orangehrm.com/orangehrm-starter-open-source-software
- MintHCM source: https://github.com/minthcm/minthcm/
- OCA HR add-ons: https://github.com/OCA/hr
- IceHrm source: https://github.com/gamonoid/icehrm/


---

## Research caveat

This report reflects public information accessible up to 20 August 2026. Vendor feature names, packaging, licensing and APIs change. A capability marked partial or not evidenced may exist privately or in a different edition. Conversely, a public product page does not establish that a feature meets the assignment's exact security semantics. Every shortlisted product should therefore be tested with pseudonymized relationship fixtures, the machine-readable access matrix, integration failure scenarios, customer references and a controlled proof of value. Vendor-reported outcomes and AI claims should not be treated as independently audited evidence.


---

## 14. Independent-feedback review and corrections

The external review was directionally useful and improves the report in four ways.

### 14.1 Feedback accepted

1. **Non-portable citation tokens were a credibility defect.** References such as internal retrieval identifiers were retrieval-session identifiers, not durable external citations. They have been removed from this revision. Durable URLs are now listed in the evidence ledger below.
2. **Some mid-market and open-source scores were too optimistic.** HiBob's category permissions, Personio's attribute whitelist, BambooHR's custom access levels, and open-source role systems are useful primitives, but none is evidence of the target's complete section-, relationship-, and record-aware authorization policy. Related scores remain partial or extension-level.
3. **The custom/composable recommendation needed stronger qualification.** It is an architectural fit conclusion, not a production-reference claim. It becomes defensible only when supported by policy tests, integration spikes, operational controls, and a deployed proof of value.
4. **Repository links must distinguish source code from documentation.** Personio's public repository contains API documentation, not the commercial product source. The PeopleForce API Evangelist repository is a third-party API catalog, not PeopleForce product source. Neither should be presented as an open-source product repository.


---

## 15. Validated evidence ledger

| Provider / topic | Precisely supported proposition | Evidence status | Durable source |
|---|---|---|---|
| SAP public GitLab developer group | SAP maintains a public GitLab group for developer tutorials; it is not SuccessFactors source and does not evidence HCM capability. | Verified public developer asset; excluded from product scoring. | https://gitlab.com/sap-developers |
| SAP official GitHub open source | SAP publishes official open-source projects and an open-source manifesto; these are adjacent to, not source for, SuccessFactors. | Verified adjacent vendor open source. | https://github.com/SAP |
| Odoo official source | Odoo maintains the open-source ERP/product repository on GitHub, including Human Resources among its integrated app domains. | Verified product source for the open-source edition; Enterprise modules remain separately licensed. | https://github.com/odoo/odoo |
| Workday Skills Cloud | Skills intelligence supports recruiting, learning, internal mobility/talent marketplace, and workforce insight use cases. | Official vendor documentation; does not prove target authorization. | https://www.workday.com/en-us/products/human-capital-management/skills-cloud.html |
| SAP SuccessFactors Opportunity Marketplace | Employees and managers can use assignments, internal jobs, learning and mentoring opportunities; managers can source talent for projects. | Official SAP Help; different workflow from target request/propose/approve. | https://help.sap.com/docs/successfactors-opportunity-marketplace/implementing-opportunity-marketplace/overview-of-sap-successfactors-opportunity-marketplace |
| Oracle HCM data roles | HCM data roles combine a job role with data selected through security profiles. | Official Oracle documentation; strongest verified analogue for feature versus data-scope separation. | https://docs.oracle.com/en/cloud/saas/human-resources/faqbs/data-roles.html |
| Oracle security profiles | Security profiles identify HCM object instances, including managed/public person, organization, position and document type. | Official Oracle documentation; does not establish the target dual graph or 16-section policy. | https://docs.oracle.com/en/cloud/saas/human-resources/faqbs/security-profiles.html |
| HiBob API permissions | API permissions follow Bob platform permissions; categories, not individual fields, are the primary permission unit. | Official API documentation; category permission is not field-level or target-section equivalence. | https://apidocs.hibob.com/reference/permissions |
| PeopleForce authentication | Company API keys provide broad API and employee-data access; Career keys are narrower; requests use `X-API-KEY` over HTTPS. | Official developer documentation; requires secrets management and intermediary filtering. | https://developer.peopleforce.io/reference/api-reference-guide |
| PeopleForce recruiting integration | Public v3 recruiting endpoints support retrieving vacancies and submitting candidates linked to vacancies. | Official integration guide; exact tenant fields and plan availability require testing. | https://developer.peopleforce.io/docs/job-boards-integration |
| Personio API visibility | Employee API credentials require selecting readable employee attributes; employee endpoints support system and custom attributes. | Official developer documentation; applies to integration credentials, not full target runtime policy. | https://developer.personio.de/docs/getting-started-with-the-personio-api |
| Personio public repository | Repository contains Swagger/OpenAPI documentation and Postman material. | Verified public repository; documentation only, not product source. | https://github.com/personio/api-docs |
| BambooHR customization | Supports custom fields/tables and custom access levels; custom fields/tables may not synchronize through partner integrations built around standard fields. | Official help/learning material; configured tenant proof still required. | https://help.bamboohr.com/s/article/960685 |
| Kantata recommendations | Recommendations can weight role, availability, skills, cost impact and selected custom fields; Team Builder supports staffing. | Official product/knowledge documentation; PSA workflow, not employee-profile authorization. | https://knowledge.kantata.com/hc/en-us/articles/360052133933-Resource-Recommendations-Overview |
| Kantata skills | Skills and proficiency levels can support resource search and project demand. | Official documentation. | https://knowledge.kantata.com/hc/en-us/articles/219534748-Skills-Overview |
| Frappe HR repository | Public GPL HRMS source repository. | Verified public source; capability/security fitness requires code and deployment review. | https://github.com/frappe/hrms |
| OrangeHRM repository | Public OrangeHRM source repository. | Verified public source; edition and module coverage require validation. | https://github.com/orangehrm/orangehrm |
| MintHCM repository | Public AGPL HCM source repository. | Verified public source; scale, security and maintenance evidence required. | https://github.com/minthcm/minthcm |
| OCA HR repository | Community-maintained HR add-ons for Odoo. | Verified community source; not the complete Odoo Enterprise product. | https://github.com/OCA/hr |
| IceHrm repository | Public core repository. | Verified public source; commercial extensions are separate. | https://github.com/gamonoid/icehrm |

### Validation implications

- A vendor page establishes that the vendor **claims or documents a capability**, not that the capability satisfies the normative acceptance criteria.
- A public repository establishes inspectable source availability only for that repository and license. It does not establish security, support, deployment readiness, or fit.
- An integration API establishes a technical access path, not data completeness, licensing entitlement, rate-limit tolerance, or legal permission to persist data.
- A matrix score is therefore a **screening score**, never procurement acceptance.

---

## 16. Generic industry glossary

### 16.1 People and organization data

| Term | Precise generic definition | Application to the target |
|---|---|---|
| **HRIS** | Human Resources Information System focused on employee records and HR administration. | Profile, contacts, employment data, documents, leave display and self-service. |
| **HCM** | Human Capital Management suite covering core HR plus talent, workforce, learning, compensation or related processes. | Enterprise-suite comparison category; broader than the target. |
| **System of record (SoR)** | Authoritative source for a defined data domain. | Timetracker for leaves/projects; PeopleForce for recruiting candidates/vacancies. |
| **Employee master data** | Relatively stable identifying and employment attributes used across processes. | Person identity, position, department, manager and employment type. |
| **Effective dating** | Recording when a value or relationship becomes and ceases to be valid. | Reporting, project, department, position and employment history. |
| **Organizational hierarchy** | Structured reporting or organizational relationship between workers and units. | Direct and transitive manager access. |
| **Matrix organization** | Organization in which a worker has simultaneous line and project relationships. | A person can be under a unit manager and one or more PM/DM chains. |
| **Employee self-service (ESS)** | Employee ability to view or maintain permitted personal information and complete assigned actions. | Contacts, emergency contacts, photo, certificates, IDP completion and tasks. |
| **Manager self-service (MSS)** | Manager ability to perform authorized actions for workers in scope. | Profile updates, risks, feedback, notes, tasks and staffing activity. |
| **Custom field** | Administrator-defined data attribute added without changing application source code. | Filterable profile attributes with independent visibility. |
| **Saved view** | Named, reusable combination of filters, columns and usually sort settings. | Manager-created employee-list tabs, optionally shared. |

### 16.2 Talent and development

| Term | Precise generic definition | Application to the target |
|---|---|---|
| **Talent profile** | Structured representation of a person's skills, experience, qualifications and development data. | Employment, CDS, certificates and mentorship-related attributes. |
| **Competency** | Observable knowledge, skill, behavior or capability used to assess role effectiveness. | External matrix linked through CDS; not encoded as a fixed schema. |
| **Skills taxonomy** | Governed vocabulary and relationships among skills. | Useful vendor concept, but the target only requires links to current matrices and assessment records. |
| **Individual Development Plan (IDP)** | Time-bounded development plan containing development objectives or actions. | Description, deadline, external file link, completion flag and date. |
| **Continuous feedback** | Feedback recorded outside a periodic formal review cycle. | Structured feedback records with visibility controls. |
| **360-degree feedback** | Feedback collected from multiple relationship groups, such as manager, peers and direct reports. | Adjacent benchmark; target requests feedback from selected colleagues through campaigns. |
| **Mentoring** | Development relationship in which a mentor supports a mentee. | Opt-in, assignment, active/ended pairs and mandatory final feedback. |
| **Talent marketplace** | Platform matching people to internal jobs, projects, assignments, learning or mentoring opportunities. | Adjacent to resourcing; SAP/Workday examples do not equal the target approval workflow. |

### 16.3 Resource and project management

| Term | Precise generic definition | Application to the target |
|---|---|---|
| **Resource management** | Planning and assigning people to work based on demand, availability, role and skills. | Request, candidate proposal and approval. |
| **PSA** | Professional Services Automation combining projects, resources, time, financials and delivery operations. | Kantata category; broader than the target. |
| **Capacity** | Work volume a person or pool can perform over a period. | Adjacent planning metric; allocation percentages are explicitly out of scope. |
| **Availability** | Portion of capacity not already unavailable or committed. | Useful for candidate selection, though detailed allocation is not normative. |
| **Resource request** | Formal statement of demand for a person or capability over a period. | Created by DM/PM, fulfilled by UM, with optional project reference. |
| **Placeholder resource** | Unnamed planning position representing demand before a person is selected. | Useful PSA analogue for an unattached request, but not required terminology. |
| **Internal mobility** | Movement of employees among jobs, assignments, projects or career opportunities within the organization. | Adjacent to project staffing and career development. |

### 16.4 Identity, access and privacy

| Term | Precise generic definition | Application to the target |
|---|---|---|
| **Authentication** | Verification of an actor's identity. | Usually SSO/session/token validation before policy evaluation. |
| **Authorization** | Decision whether an authenticated or anonymous actor may perform an action on a resource. | Every section, field, record, export and download. |
| **RBAC** | Role-Based Access Control, assigning permissions through roles. | Runtime functional roles and feature permissions. |
| **ABAC** | Attribute-Based Access Control, using subject, resource, action and context attributes. | Section, visibility flags, viewer type and link expiry. |
| **ReBAC** | Relationship-Based Access Control, deriving access from relationships between entities. | Reporting, project and PP relationships. |
| **Data scope** | Set of records or people against which an actor may use authorized functionality. | Distinct from the feature permission itself. |
| **Least privilege** | Granting only the minimum access needed for a legitimate purpose. | Colleague whitelist and narrow integration credentials. |
| **Deny by default** | Rejecting access unless a policy explicitly allows it. | Unlisted sections/fields and failed relationship resolution. |
| **Policy decision point (PDP)** | Component that evaluates authorization policy and returns a decision. | Central relationship/section policy service. |
| **Policy enforcement point (PEP)** | Component that enforces the authorization decision. | API gateway, service method, query layer, export and document endpoint. |
| **Segregation of duties (SoD)** | Separation of incompatible responsibilities to reduce error or abuse. | Relevant to HR Admin role/permission management and sensitive changes. |
| **PII / personal data** | Information relating to an identified or identifiable person. | Nearly every profile section, with varying sensitivity. |
| **Pseudonymization** | Replacing identifying values with substitutes while retaining controlled re-identification capability. | Required for realistic non-production data. |
| **Data minimization** | Processing only data necessary for the stated purpose. | Profile responses, exports, logs, integration payloads and shared links. |
| **Audit trail** | Tamper-resistant record of actor, action, target, time and outcome. | Shared-link access, administrative changes and sensitive operations. |

### 16.5 Integration and platform operations

| Term | Precise generic definition | Application to the target |
|---|---|---|
| **API** | Machine-to-machine interface exposing operations and data contracts. | Timetracker and PeopleForce communication. |
| **Webhook** | Outbound event notification sent when a source-system event occurs. | Candidate/vacancy and selected employee events where available. |
| **Idempotency** | Property that repeated processing of the same command/event does not create additional effects. | Prevent duplicate project links, timeline events and candidates. |
| **Reconciliation** | Comparison of systems to detect and repair missing or inconsistent state. | Complements webhooks and handles outages or missed events. |
| **Canonical model** | Internal normalized representation independent of source-specific schemas. | Person, relationship, project, leave and candidate mappings. |
| **Identity resolution** | Matching records that represent the same real-world person across systems. | Must use durable mappings, not email alone. |
| **Graceful degradation** | Continuing safe partial service when a dependency fails. | Local profiles remain available while PeopleForce/timetracker is unavailable, without inventing fresh data. |
| **Eventual consistency** | State becomes consistent after asynchronous propagation delay. | Project/leave changes after integration sync. |
| **Service-level objective (SLO)** | Measurable reliability or performance target. | List response under two seconds and bounded access-revocation propagation. |

---

## 17. User-flow and process terminology validation

| User flow | Generic industry process | Authoritative inputs | Target-specific variation | Control points |
|---|---|---|---|---|
| Employee opens own profile | Employee self-service | Platform profile plus timetracker leave/project data | Risk is hidden; only flagged notes/feedback are visible | Self relationship, section policy, record flags |
| Colleague opens another profile | Employee directory / colleague profile | Platform profile | Strict whitelist, not a conventional broadly visible directory | Server-side allowlist; no inference through search |
| Manager opens a worker profile | Manager self-service | Reporting and project relationship graph | PM differs from UM/DM for management notes | Relationship subtype and transitive path retained |
| HR/PP maintains profile | HR case/employee-data administration | PP assignment and HR hierarchy | PP is a relationship-based access role and a separate functional role | Scope resolution plus feature permission |
| HR Admin creates a role | Role administration | Runtime role/permission data | New role unlocks features but never widens worker-data scope | Segregation of duties, immediate revocation, audit |
| User filters All Employees | People directory/workforce reporting | Profile and custom-field index | Every field can be a column/filter only if viewer may see it | Query-time policy, visibility-safe aggregation/export |
| DM/PM raises staffing demand | Resource request | Request details; project optional | Request may validly exist before project creation | Functional permission and creator scope |
| UM proposes candidates | Resource fulfilment | Internal employee scope and PeopleForce candidate data | External and internal candidates coexist in one proposal flow | Candidate-source label, sharing rules, audit |
| DM approves/rejects | Staffing decision | Proposal and appropriate profile/candidate view | Approval does not create project assignment | Written rejection reason; immutable attempt history |
| Timetracker creates assignment | System-of-record synchronization | Timetracker project/person/PM/DM data | Assignment changes authorization after sync | Idempotency, effective date, cache invalidation, reconciliation |
| PP/manager launches form | Campaign management | Saved view/filter plus manual edits | Audience freezes at activation; external form remains external | Authorization at resolution and activation; one task per recipient |
| Employee completes form task | Task completion | Internal action item | Completion is self-declared; external response is not verified | Actor must be assignee; completion timestamp recorded |
| Manager assigns mentor | Mentoring administration | Open-to-mentor population and scoped mentee list | Ending requires final feedback and timeline event | Active-pair constraints, feedback required, history retained |
| Manager shares profile | Secure external/temporary sharing | Selected shareable sections | Sensitive sections opt-in; prohibited sections never shareable | Opaque token, expiry, revocation, access log, read-only PEP |

### Flow consistency conclusions

1. **Employee directory** is the correct generic term for colleague browsing, but the target's whitelist is stricter than many directory defaults.
2. **Resource request**, **candidate proposal**, **staffing decision**, and **project assignment** are separate states and must not be collapsed.
3. **Talent marketplace** is an adjacent pattern, not a synonym for the target resourcing flow.
4. **Feedback campaign** and **feedback record** are separate entities. The campaign asks for input; a feedback record is the governed result attached to a subject.
5. **Functional role** is an assigned feature bundle. **Access role/audience** is a contextual result of actor-target relationships. Calling both simply “roles” causes design ambiguity.
6. **Career timeline** is an event projection with manual correction, not a manually curated profile section.
7. **Shared link** is a temporary read authorization mechanism, not a permanent relationship or user role.

---

## 18. Revised precision statement

The following findings are sufficiently supported for landscape and architecture screening:

- Enterprise HCM suites provide stronger worker, organization, skills, talent and security foundations than mid-market HRIS products.
- Oracle publicly documents a useful separation between functional job roles and data instances selected through security profiles.
- SAP Opportunity Marketplace and Workday Skills Cloud are strong adjacent references for internal opportunities and skills-based mobility.
- Kantata is a strong adjacent reference for resource recommendations and staffing based on role, availability, skills and cost impact.
- PeopleForce exposes authenticated APIs for candidate and vacancy integration and must be treated carefully because broad company keys can expose employee data.
- No reviewed official public source establishes complete out-of-the-box compliance with the target's dual relationship graph, 16-section access matrix, S7 PM exception, visibility-safe arbitrary filtering, and configurable expiring profile shares.

The final point is an **absence-of-evidence conclusion**, not proof that no vendor can be configured to meet the requirement. Procurement acceptance requires a scripted tenant demonstration using the target's own pseudonymized policy fixtures.


---
