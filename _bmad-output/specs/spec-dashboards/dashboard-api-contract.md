# Dashboard API & Read Model Contract

> **Contract Authority.** This companion defines the domain-level read model contract, projection boundaries, availability semantics, and frontend data-source interface for the People Management Dashboards (Unit Manager and People Partner presets). It preserves all binding architectural invariants (PM/AD-9, PM/AD-10, PM/AD-16, PM/AD-20, PM/AD-22, PM/AD-24, PM/AD-25, PM/AD-33, PM/AD-34).

---

## 1. Architectural Principles & Boundaries

1. **Fixed Read Models, No Generic Engine (PM/AD-33):** The `dashboards` bounded context composes four fixed read models (UM, DM, PM, PP) from owning-context queries. There is no generic dashboard/widget framework, no widget catalog, and no drag-and-drop customization in v1.5 (SD-1).
2. **Pre-Aggregation Authorization (PM/AD-33, PM/AD-9):** AccessControl resolves authorized target employee IDs **before** any count or table aggregation occurs. A dashboard widget can never widen section access or disclose employees outside the viewer's live entitlement.
3. **Application Contract vs. Wire Contract Decoupling (SD-2, PM/AD-25):** The TypeScript Dashboard read models (`UnitManagerDashboardReadModel`, `PeoplePartnerDashboardReadModel`) and the `IDashboardDataSource` interface define the **application/frontend domain contract**. They govern what data, metadata, availability indicators, and provenance footers the UI consumes. These read-model interfaces **do NOT require the eventual HTTP wire DTO or response envelope to serialize the same structure 1:1** (e.g., an HTTP transport layer may introduce specific envelope wrappers, transport DTOs, or serialization conventions). The React UI depends strictly on this agreed application read-model contract via typed query hooks and data-source interfaces, enabling frontend development and verification against mock/local data sources before production backend HTTP endpoints exist.

```text
[ Dashboard UI Components ]
            │
            ▼
[ useDashboardQuery(preset, options) ]
            │
            ▼
[ IDashboardDataSource (Interface) ]
      │                         │
      ▼                         ▼
[ MockDashboardDataSource ]   [ HttpDashboardDataSource ]
   (Development / Mock)          (Production Backend API)
```

---

## 2. Conceptual Read Models

### 2.1 Unit Manager Dashboard Read Model (`UnitManagerDashboardReadModel`)

Scoped to the viewer's **Reporting line** (transitive closure of `Relationship type='direct'`).

```ts
export interface UnitManagerDashboardReadModel {
  /** Page header chrome and live provenance metadata */
  header: DashboardHeaderMetadata;

  /** Scope resolution metadata for the current request */
  evaluatedScope: {
    type: 'REPORTING_LINE';
    viewerUserId: string;
    targetCount: number;
    evaluatedAt: string; // ISO 8601 UTC
    policyLabel: 'SCOPE: REPORTING_LINE (TRANSITIVE)';
  };

  /** Headcount metric */
  headcount: AvailableWidgetState<{
    count: number;
    wscope: 'SCOPE: REPORTING_LINE';
  }>;

  /** People table projected per target employee */
  peopleTable: AvailableWidgetState<{
    rows: DashboardPersonRow[];
    totalCount: number;
    wscope: 'SCOPE: REPORTING_LINE';
  }>;

  /** Navigation shortcuts to related modules */
  navigation: {
    allEmployeesUrl: string;
    savedViewsUrl: string;
    resourcingUrl: string;
    riskDashboardUrl: string;
    mentorshipHubUrl: string;
    campaignsUrl: string;
  };

  /** Slot widgets with explicit availability declarations */
  widgets: {
    /** Risk counts (PM-FR-21) — UNCOVERED */
    riskCounts: UnavailableWidgetState;

    /** Unit open & overdue action items (PM-FR-19) — UNCOVERED */
    unitActionItems: UnavailableWidgetState;

    /** Manager's own action items (PM-FR-19) — UNCOVERED */
    myActionItems: UnavailableWidgetState;

    /** Active resourcing requests (PM-FR-23) — UNCOVERED */
    resourcingRequests: UnavailableWidgetState;

    /** Open campaigns (PM-FR-20) — UNCOVERED */
    openCampaigns: UnavailableWidgetState;
  };
}
```

---

### 2.2 People Partner Dashboard Read Model (`PeoplePartnerDashboardReadModel`)

Scoped to the viewer's **assigned People Partner caseload** (`Relationship type='people_partner'`).

```ts
export interface PeoplePartnerDashboardReadModel {
  /** Page header chrome and live provenance metadata */
  header: DashboardHeaderMetadata;

  /** Scope resolution metadata for the current request */
  evaluatedScope: {
    type: 'PEOPLE_PARTNER_ASSIGNMENT';
    viewerUserId: string;
    targetCount: number;
    evaluatedAt: string; // ISO 8601 UTC
    policyLabel: 'SCOPE: PEOPLE_PARTNER_ASSIGNMENT (DIRECT)';
  };

  /** Headcount metric */
  headcount: AvailableWidgetState<{
    count: number;
    wscope: 'SCOPE: PEOPLE_PARTNER_ASSIGNMENT';
  }>;

  /** People table projected per target employee */
  peopleTable: AvailableWidgetState<{
    rows: DashboardPersonRow[];
    totalCount: number;
    wscope: 'SCOPE: PEOPLE_PARTNER_ASSIGNMENT';
  }>;

  /** Navigation shortcuts */
  navigation: {
    allEmployeesUrl: string;
    savedViewsUrl: string;
    campaignsUrl: string;
    departuresUrl: string;
  };

  /** Slot widgets with explicit availability declarations */
  widgets: {
    /** Incomplete profile tracking (PRD §4.5 HR widget) */
    incompleteProfiles: AvailableWidgetState<{
      count: number;
      wscope: 'SCOPE: PEOPLE_PARTNER_ASSIGNMENT';
    }> | UnavailableWidgetState;

    /** Risk records (PM-FR-21) — UNCOVERED */
    riskCounts: UnavailableWidgetState;

    /** Assigned action items (PM-FR-19) — UNCOVERED */
    assignedActionItems: UnavailableWidgetState;

    /** CDS milestones (PM-FR-30) — UNCOVERED */
    cdsMilestones: UnavailableWidgetState;

    /** HR form campaigns (PM-FR-20) — UNCOVERED */
    campaignCompletion: UnavailableWidgetState;
  };

  /**
   * CRITICAL INVARIANT: Resourcing is ABSENT BY CONSTRUCTION.
   * No resourcing property, counter, slot, placeholder, or unavailable state
   * exists in the People Partner read model or component tree (PM/AD-33, PRD §4.5, FR-18).
   */
}
```

---

## 3. Headcount Semantics

1. **Scope Definition:**
   - **Unit Manager:** Transitive closure of `Relationship type='direct'` where `reportsToUserId = viewerUserId` (recursively walking up the direct reports graph per PM/AD-10).
   - **People Partner:** Direct `Relationship type='people_partner'` where `reportsToUserId = viewerUserId` (direct assignment caseload per PM/AD-10, PM/AD-19).
2. **Active Filtering:**
   - Headcount counts strictly active employees within the resolved audience.
   - **Dismissed Employees Excluded:** Employees with `EmploymentStatus = 'dismissed'` or inactive account status (`User.isActive = false`) are excluded from headcount (PM/AD-16, PM/AD-22).
   - **Request-Time Due Cutoff:** Employees with an effective departure due (`dueAt <= now()`) are excluded from active headcount at request time (PM/AD-20).
3. **Presentation:**
   - Value rendered in `{typography.data-stat}` mono font.
   - Displayed with `.wscope` footer (`SCOPE: REPORTING_LINE` or `SCOPE: PEOPLE_PARTNER_ASSIGNMENT`).

---

## 4. People-Table Projection Requirements

The dashboard people table consumes Epic 1's shared row read model and applies per-target tier projection (PM/AD-34, PMC-E2-S2.1).

```ts
export interface DashboardPersonRow {
  id: string; // Target employee UUID
  firstName: string;
  lastName: string;
  workEmail: string;
  avatarUrl: string | null;
  position: string | null;
  grade: string | null;
  employmentType: string | null;

  /** Columns with uncovered source FRs */
  project: UnavailableColumnState;    // PM-FR-37 / TT-IDENTITY-01 uncovered
  leaveStatus: UnavailableColumnState; // PM-FR-36 uncovered
  riskLevel: UnavailableColumnState;   // PM-FR-21 uncovered

  /** Tier projection metadata */
  tier: 'self' | 'reporting' | 'pp' | 'colleague';
}
```

- **Per-Target Audience Resolution:** Target employees are evaluated individually via `resolveAudiences(viewerId, [targetId])`. Each row receives the exact field projection permitted for the viewer's resolved tier on that target.
- **Leak Verification Delegation:** Leak testing for profile fields is established by Epic 1's projection-level negative test matrix; the dashboard asserts delegation to the shared read model (PMC-E2-S2.1).
- **Unavailable Column Rules:** Columns whose source capabilities are uncovered (`project`, `leaveStatus`, `riskLevel`) must be declared unavailable or omitted; they must **never** be rendered blank as if the data were legitimately empty.

---

## 5. Evaluated Scope & Provenance Metadata

To maintain total transparency regarding authorization, the UI chrome and widgets carry explicit provenance markings (DESIGN.md, EXPERIENCE.md, UX-DR9–UX-DR13):

1. **Page Header Band (`.pghd`):**
   - Eyebrow: `WORKSPACE / DASHBOARDS`
   - Accent Tick: `{colors.stretch-blue}` (`oklch(0.52 0.20 264)`)
   - Provenance Tag (`.prov`): Displayed in mono: `SCOPE RESOLVED LIVE PER REQUEST`
2. **Widget Scope Footer (`.wscope`):**
   - Component: `{components.widget-scope-footer}`
   - Rendered in mono uppercase below each widget (e.g. `SCOPE: REPORTING_LINE (TRANSITIVE)`, `SCOPE: PEOPLE_PARTNER_ASSIGNMENT (DIRECT)`).
   - Replaces ambiguous access tooltips with explicit, human-readable policy statements.

```ts
export interface DashboardHeaderMetadata {
  eyebrow: 'WORKSPACE / DASHBOARDS';
  accentColor: string; // oklch(0.52 0.20 264)
  provenanceTag: string; // "SCOPE RESOLVED LIVE PER REQUEST"
  lastResolvedAt: string; // ISO 8601 UTC
}
```

---

## 6. Available vs. Unavailable Widget-State Semantics

Availability is determined by the implementation state of the source Functional Requirement (`sourceFr`), **never by the returned numeric value** (SD-2, PMC-E2-S2.2).

### 6.1 State Definitions

```ts
export type WidgetAvailabilityState = 'available' | 'unavailable';

export interface AvailableWidgetState<TData> {
  status: 'available';
  data: TData;
  sourceFr?: string;
}

export interface UnavailableWidgetState {
  status: 'unavailable';
  missingCapability: string;
  sourceFr: string;
  unavailableReason: string;
}

export interface UnavailableColumnState {
  status: 'unavailable';
  sourceFr: string;
  label: string;
}
```

### 6.2 Rendering Rules

| Source FR Status | Widget State | Rendering Outcome |
|---|---|---|
| **Covered** (e.g. Headcount, People Table) | `available` | Render metric/table with real data, `{typography.data-stat}` mono, and `.wscope` footer. |
| **Uncovered** (e.g. Risks `PM-FR-21`, Action Items `PM-FR-19`, Resourcing `PM-FR-23`, Campaigns `PM-FR-20`) | `unavailable` | Render explicit unavailable banner/slot stating the missing capability in permission-literate register. **NEVER** render `0`, `—`, empty chart, or mock values. |
| **Zero Measured Population** (e.g. 0 direct reports) | `available` (`data.count = 0`) | Render `0` as a normal measured value in `{typography.data-stat}` mono with `.wscope` footer. |
| **Empty Resolved Scope** | `available` (`data.rows = []`) | Render `.emptyst` empty state (`{components.empty-state}`) with guidance; visually distinct from unavailable state. |

---

## 7. Measured-Zero Semantics

- **Distinction from Unavailable:** A measured zero represents a verified fact (e.g., a Unit Manager with no direct reports, or a People Partner with no active assignments).
- **Display Guarantee:** A measured zero must display as `0` in `{typography.data-stat}` mono font accompanied by its `.wscope` footer.
- **No Suppression:** A measured zero must never be suppressed, replaced with dashes (`—`), or converted to an unavailable placeholder. Suppressing zero would make an empty scope indistinguishable from a broken or missing integration.

---

## 8. Error & Denied-State Expectations

1. **Functional Permission Denial (`isAllowed` returns `false`):**
   - Access to the dashboard is gated fail-closed on the dashboard-view permission.
   - If the caller does not hold the functional permission, the API returns `403 Forbidden` and the UI renders the access-denied state without relationship-derived fallback.
2. **Unauthenticated / Inactive Session:**
   - Unauthenticated callers or sessions belonging to inactive/departed users receive `401 Unauthorized` (PM/AD-24).
3. **Hidden Target Omission:**
   - Employees hidden from the viewer's scope are omitted from list/table arrays rather than generating per-row errors or existence leaks (PM/AD-24).

---

## 9. Frontend Data-Source Boundary & Interface

To allow frontend implementation and automated testing without waiting for backend HTTP deployments, frontend consumers interact via an abstract data-source contract.

```ts
export interface IDashboardDataSource {
  /** Fetch Unit Manager Dashboard Read Model */
  getUnitManagerDashboard(): Promise<UnitManagerDashboardReadModel>;

  /** Fetch People Partner Dashboard Read Model */
  getPeoplePartnerDashboard(): Promise<PeoplePartnerDashboardReadModel>;
}
```

### 9.1 TanStack Query Hook Contract

```ts
export function useDashboardQuery<T extends 'unit-manager' | 'people-partner'>(
  preset: T,
  options?: {
    dataSource?: IDashboardDataSource;
  }
): {
  data: T extends 'unit-manager' ? UnitManagerDashboardReadModel : PeoplePartnerDashboardReadModel | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
};
```

- **Query Key Convention (PM/AD-25):** `['dashboards', actorUserId, preset]` — query keys must include actor identity to prevent cross-session cache leaks.
- **Cache Stale Time (PM/AD-25):** `staleTime: 0` for permission-sensitive dashboard data; refetches on window focus and reconnect.
- **No Local Storage Persistence (PM/AD-25):** Dashboard queries must not be persisted into `localStorage` or other client-side storage.

---

## 10. Unresolved Transport Architecture & Open Questions

The following transport and authorization details cannot be derived from authoritative existing specifications and are deliberately marked as **UNRESOLVED OPEN QUESTIONS** rather than fabricated:

1. **`OQ-PERM-01` — Default Role-to-Permission Matrix:**
   - *Status:* UNRESOLVED.
   - *Detail:* PRD §2.3 default functional permissions for dashboard access have not been formally confirmed by the Product Owner. No grants are seeded. AccessControl evaluates fail-closed.
2. **`OQ-DASH-ROUTE-01` — Concrete REST Endpoint Paths:**
   - *Status:* UNRESOLVED.
   - *Detail:* `api-conventions.md` does not specify whether dashboard read models are served via `GET /dashboards/unit-manager` & `GET /dashboards/people-partner` or via a parameterized `GET /dashboards/:preset` route. Concrete REST route paths remain unresolved until an architecture/spec decision establishes them. Frontend Stage-1 scenarios may proceed without resolving this question because frontend implementation is based on the agreed Dashboard read-model and `IDashboardDataSource` contract. When backend HTTP implementation begins, unresolved transport route decisions must first be resolved through the appropriate architecture/spec amendment, which backend scenarios will then consume.
3. **`OQ-DASH-DTO-01` — Wire Transport DTO Shapes & Response Envelopes:**
   - *Status:* UNRESOLVED.
   - *Detail:* Concrete backend HTTP response envelopes (e.g. `{ data: ... }` wrapper vs direct serialization) and wire DTO property naming are unspecified in the architecture spine and remain unresolved until an architecture/spec decision establishes them. Frontend Stage-1 scenarios may proceed without resolving wire transport details because frontend implementation is based on the agreed Dashboard read-model contract. When backend HTTP implementation begins, unresolved wire DTO/envelope decisions must first be resolved through the appropriate architecture/spec amendment, which backend scenarios will then consume.
4. **`OQ-DASH-QUERYKEY-01` — Exact Frontend Query-Key Hierarchy:**
   - *Status:* UNRESOLVED.
   - *Detail:* Exact nested query key structure across future preset variations beyond the required `['dashboards', actorId, preset]` minimum.
