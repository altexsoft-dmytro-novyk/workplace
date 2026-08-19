# Access Control — Test-Case Suite

Stage-1 quality-gate scenario documents (AD-1), following the team-wide authoring pattern in [../README.md](../README.md): **one test case per file**, each an explicit request spec — `inputURL`, `inputRequest` (headers + body), `expectedResult` with HTTP status — traced to `docs/project-requirements.md` (§) and/or an architecture decision (AD-n). **Status: draft — each file needs developer approval before its E2E is written.** Spec contract: `_bmad-output/specs/spec-access-control-test-cases/SPEC.md`.

## Conventions (apply to every file)

- **Authorization header:** `"Bearer <token:persona>"` = a valid session token for that persona; `""` (empty) = unauthenticated. **Global rule: every endpoint rejects a missing or invalid token with `401`** — representative scenarios per endpoint family (`au-*`, `sl-12`, `sf-07/08`, `ur-01`); stage-2 suites apply the check to each real route.
- **Denial convention:** valid token, no permission for the feature → `403`. Write to a section the viewer can read → `403`. Any request touching a section the viewer cannot see at all (`—` cell) → `404` with a leak-free body.
- **Absence is absence** (§3.3.4): "not visible" means the key is missing from the JSON body — never null, never empty-but-present. All assertions are API-level; UI behavior is out of scope.
- **Endpoints are placeholder vocabulary** (`/users/:id/sections/:sN`, `/users/roles`, `/share/:token`, …). Stage-2 authors bind them to the real routes; the semantics are the contract.
- **Path × section:** relationship paths are proven once in `tier-derivation/` (single resolver, AD-10); matrix files test sections per audience and deliberately vary the manager persona (Bob/Carol/Pete/Dave/Frank) to spread path coverage.
- A file with several `Test N` blocks is still one requirement, probed from multiple angles (e.g. a `—` cell probed via profile assembly and direct request).

## Canonical personas

Seeded once for the whole suite; files add per-case state (flags, links, custom fields) in **Preconditions**.

| Persona | Position in the graph |
| --- | --- |
| **Alice** | Target of most scenarios. Reports to Bob; works on project **Phoenix**; PP: Paula; mentor: Mia |
| **Bob** | Alice's unit manager (direct reports-to); reports to Carol |
| **Carol** | Bob's manager — transitive Manager of Alice |
| **Pete** | PM of Phoenix (policy attachment) — Manager of Alice, S7 flag-gated |
| **Dave** | DM of Phoenix (policy attachment) — Manager of Alice |
| **Frank** | Dave's reports-to manager — compound-chain Manager of Alice |
| **Paula** | Alice's assigned People Partner; reports to Hana |
| **Hana** | Paula's manager — HR line above the PP |
| **Colin** | Unrelated employee — plain Colleague of Alice |
| **Root** | Holder of the seeded HR Admin functional role; no relationships |
| **Ida** | Holder of custom role "IT Campaigns"; no relationships |
| **Eve** | No reportsTo edge, no projects, no roles — fail-closed probe |

## Layout

| Folder | Covers | Files |
| --- | --- | --- |
| `tier-derivation/` | Who resolves to which tier (§2.1): every path that grants or revokes access. TD-13 is **provisional** (departments, spec OQ4) | 13 |
| `users/roles/` | Functional roles (§2.2, §2.3): role CRUD auth (401/403/success), assignment, granular independent permissions, immediate revocation, no data-widening, AR non-extensibility | 12 |
| `fail-closed/` | Missing/orphaned data yields less access; bootstrap admin is an ordinary FR (AD-11/12) | 3 |
| `matrix/sNN-*/` | One file per §3.2 cell **per action** (read / write split), plus flag-gated records (S7, S8), field-level rules (S11 name-only, S16 visibilities) and Self carve-outs (S1 photo, S5 certificates, S12 IDP, S13 flag, S14 complete) | 148 |
| `matrix/au-*` | Unauthenticated (401) for profile/section endpoints | 3 |
| `matrix/hr-admin/` | HR Admin audience: read all, write all, access dies with the role | 3 |
| `shared-link/` | §4.8: selection, never-shareable S3/S7/S13(/S14), sensitive defaults, expiry, revocation, logging, read-only, creator auth, 401 | 12 |
| `surfaces/` | No leak through any surface (§3.3.1/.3/.5): whitelist exactness, export, list columns, filter inference, inline edit, leak-free errors, 401s | 8 |

File names state audience + behavior (`manager-write-denied.md`, `colleague-read-none.md`), so a section folder is its own index.

## Deliberately not covered here

Performance of permission resolution (§7 NFR — separate perf work), notifications (§4.13, out of scope this iteration), whether **opening** a share link needs auth (spec OQ2 — blocked), feature-workflow logic of resourcing/CDS/campaigns/dashboards beyond their access boundaries.
