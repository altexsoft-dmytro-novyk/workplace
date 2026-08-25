# Dashboards & Widget Engine — Test-Case Suite

Stage-1 quality-gate scenario documents (AD-1), following the team-wide authoring pattern in [../README.md](../README.md): **one test case per file**, each opening with a plain-language **Scenario** (Given/When/Then) followed by the explicit request spec — `inputURL`, `inputRequest` (headers + body), `expectedResult` with HTTP status — traced to `docs/project-requirements.md` (§4.4) and architecture decisions (AD-14…AD-19 in `docs/architecture/dashboards.md`).

**Status: draft — each file needs developer approval before its E2E is written.**

## Conventions (apply to every file)

- **Authorization header:** `"Bearer <token:persona>"` = a valid session token for that persona; `""` (empty) = unauthenticated. **Global rule: every endpoint rejects a missing or invalid token with `401`**.
- **Denial convention:** valid token without the required feature permission (`view-dashboard`, etc.) → `403 Forbidden`.
- **Per-widget data isolation:** `GET /api/dashboards` returns structure only (dashboard metadata + widget list with `type` and `config`); business payloads are fetched by widgets individually via `GET /api/widgets/:type/data`.
- **Tier boundary invariant:** widget data providers resolve visibility through the `AccessControl` facade (AD-9..AD-12). A dashboard never widens data access.
- **Absence is absence:** nonexistent or unauthorized entities/fields are absent from the JSON payload (never `null` or empty-stubbed).
- **Temporary auth strategy (AD-19):** Until User Management auth is fully integrated, the test environment principal is mocked with HR Admin functional role permissions.

## Canonical personas

Seeded fixtures aligned with the org-graph personas in `access-control/README.md`:

| Persona | Role / Position in Org Graph |
| --- | --- |
| **Bob** | Alice's Unit Manager (direct reporting line). Holds `unit-manager` preset. |
| **Dave** | Delivery Manager for project **Phoenix** (Alice is a team member). Holds `delivery-manager` preset. |
| **Pete** | Project Manager for project **Phoenix**. Holds `project-manager` preset. |
| **Paula** | Alice's assigned People Partner. Holds `people-partner` preset. |
| **Colin** | Colleague with no managerial or PP relationship over Alice. |
| **Alice** | Team member on project Phoenix, reporting to Bob; PP is Paula. |
| **Root** | HR Admin principal (full administrative permissions). |
| **Eve** | User with no relationships and no permissions — fail-closed probe. |

## Layout

| Folder | Covers | Files |
| --- | --- | --- |
| `auth/` | Authentication and authorization checks: 401 unauthenticated, 403 missing permission, mock HR Admin verification | 5 |
| `dashboards-crud/` | Dashboard retrieval, custom dashboard creation, input validation, and user dashboard isolation | 4 |
| `presets/` | Pre-seeded role dashboards (§4.4): UM, DM, PM, and PP preset widget compositions (including PP resourcing exclusion) | 4 |
| `widgets/` | Individual widget data endpoints (`GET /api/widgets/:type/data`), scoping, filtering, tier boundaries, and unknown type 404s | 7 |

Total: **20 test cases**.
