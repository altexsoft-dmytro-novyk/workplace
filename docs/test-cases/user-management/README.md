# User Management — Test-Case Suite

Stage-1 quality-gate scenario documents (AD-1), following the team-wide authoring
pattern in [../README.md](../README.md): **one test case per file**, each opening
with a plain-language **Scenario** (Given/When/Then) followed by the explicit
request spec — `inputURL`, `inputRequest` (headers + body), `expectedResult` with
HTTP status — traced to `docs/project-requirements.md` (§), the
[user-management PRD](../../../_bmad-output/planning-artifacts/prds/prd-user-management-2026-08-20/prd.md)
(FR-n), architecture decisions (AD-n), and/or
[user-management-test-decisions.md](../../architecture/user-management-test-decisions.md)
(DEC-UM-n).

## Status — v1.5 refresh is UNAPPROVED DRAFT

**This suite was refreshed for spec v1.5 on 2026-09-01** (sprint-change-proposal
`sprint-change-proposal-2026-09-01-user-management-access-control-alignment.md`,
Phase A architect + Phase B PM + this TEA phase). The pre-2026-08-25 "Approved
baseline" no longer holds for the changed files:

- `seed/`, `access-control-adoption/`, `departure/` are **new** folders — **no
  file is approved**; per-file human approval under the AD-1 stage-1 gate is
  required before any stage-2 E2E.
- `registration/` and `deactivation/` are **RETIRED** — folder `README.md`
  pointers; the individual files are retained as history only (do not translate,
  cite, or approve).
- `relationships/` was **split** to v1.5 Epic 4 — some files retraced (fresh
  approval required), three mentorship files retired (superseded header).
- `career-timeline/` traces were **realigned** to DEC-UM-001 / Stories 3.2–3.3
  (fresh approval required); two dual-gate negatives added.
- `profile/` and `auth/` got **header notes** (fresh approval required).
- `list/` gained `um-list-05` (new).

**No `_bmad-output/specs/*/approvals.yaml` records any of this refresh.** An
agent's review of its own output is never a substitute for human approval
([testing-strategy.md](../../architecture/testing-strategy.md)).

The Access Control test-case suite **now exists on disk**
([../access-control/](../access-control/), 171 draft files, and
[../access-control-kernel/](../access-control-kernel/)) — the older "not yet
authored" caveats are removed. Entitlement for `/users/:id` specifically is
**Epic 0's** — see [`access-control-adoption/`](access-control-adoption/).

Spec contract: `_bmad-output/specs/spec-user-management-test-cases/SPEC.md`.

## Scope — read this before adding a file

This suite tests **workflow and data correctness**, plus — new in v1.5 — the
**adoption** of the real Access Control facade for the `/users/:id` routes
(`access-control-adoption/`, Epic 0). The base access-control model (audience
derivation, §3.2 matrix cells, fail-closed) is proved in
[../access-control/](../access-control/) and
[../access-control-kernel/](../access-control-kernel/); the `profile/`,
`career-timeline/`, and `relationships/` files here assume an already-entitled
actor and assert what the feature does.

The `User` entity carries only S1-identity-card fields
([database-schema.md](../../architecture/database-schema.md)) plus `UserEvents`.
No S2/S3/S4/S5 field appears in any request or response body here.

## Conventions (apply to every file)

- **Authorization header.** `"Bearer <token:persona>"` = a valid session for that
  persona; `""` = unauthenticated. Every endpoint rejects a missing/invalid token
  with `401` (global rule, [../README.md](../README.md)).
- **Real-audience cases use a seeded UUID, not a persona literal.** Where a
  scenario's outcome depends on a real Phase-0 audience (all of
  `access-control-adoption/`, and the entitlement half of `career-timeline/`),
  the header is `"Bearer <token:<seeded-uuid>>"` and stage 2 seeds real `User` +
  `Relationship` rows. `Bearer <token:Bob>` resolves to the non-existent string
  id `'Bob'` → empty audience → `403` under the real facade
  (`um-integration-contract-response.md` Q6).
- **Denial convention.** Valid token, no feature permission → `403`. Write to
  readable-only data → `403`. Touching a `—` cell or hidden field → `404`
  leak-free. Absence is absence (key missing, never `null`).
- **Permission-negative probes (DEC-UM-002).** Use **Ida** for generic
  feature-capability denials; **Colin**/**Eve** for an unrelated active session;
  Bob only for a manager-specific probe unrelated to the capability under test.
  Never a role-name or `User.position` check — the facade's no-target `isAllowed`
  is the gate.
- **Endpoints** bind to the canonical router-tree convention
  ([api-conventions.md](../../architecture/api-conventions.md), AD-14): resource
  root `/users` (read/update only — **no `POST /users`**, no generic delete),
  auth root `/auth`, owned collections `/users/:id/events`, attachment endpoints
  `/users/:id/relationships`, `/users/:id/relationships/people-partner`,
  `/users/:id/departures`. Section addressing uses human-readable names, never
  `sNN` ids in a URL.
- **`UserEvents` immutable-fact model.** A correction is soft-delete-then-append,
  never an in-place PATCH.
- **Isolation (DEC-UM-010).** One test worker + UUID-owned data initially;
  schema-per-worker before parallel CI. `@concurrency` scenarios use parallel
  HTTP inside one test.

## Canonical personas

From the **seeded population import** (Story 1.1 / `seed/`). There is no
`POST /users`. Reconcile against
[access-control/README.md](../access-control/README.md)'s fixture where the
graphs overlap.

| Persona | Role in this suite |
| --- | --- |
| **Root** | Seeded bootstrap `User` holding the `hr-admin` FR policy (`user-management:create` / `:deactivate` / `:list`). ACM-0 creates the row; ACM-1 attaches the policy. Also holds *change organisational relationships* and *record a departure* where those scenarios need an entitled actor. |
| **Alice** | Seeded employee. Reports to Bob; assigned PP Paula. Subject of profile-edit, auth, career-timeline, relationship, and departure scenarios. |
| **Bob** | Alice's **direct** Unit Manager (Reporting line). Edits Alice's S1 fields (entitlement asserted by Epic 0); manual career-timeline add/correct/delete under DEC-UM-001. |
| **Paula** | Alice's assigned People Partner. Manual career-timeline add/correct/delete under DEC-UM-001. |
| **Nina** | Seeded employee used where a scenario needs a fresh target or a new PP/manager. |
| **Colin** | Unrelated seeded employee, no FR policy. Holds the in-use `workEmail`/`ttId` the uniqueness cases collide against. Used for unrelated-session denial. |
| **Ida** | Holds a custom functional role whose only permission is unrelated (*create form campaigns*). Generic feature-permission `403` probes (DEC-UM-002). |
| **Eve** | Authenticated seeded employee with no edges to Alice — colleague-floor / unrelated-session probes. |

Retired personas: the registration-only "Tomas" / "create target" personas are
gone with `registration/`.

## Layout

| Folder | Covers | Files | State |
| --- | --- | --- | --- |
| `seed/` | FR-1/FR-4/FR-5a/FR-7 — population import, no `POST /users`, bootstrap HR Admin + ACM-0 root-id reuse (Story 1.1) | 3 | new draft |
| `access-control-adoption/` | FR-16 — real facade adoption for `GET/PATCH /users/:id`, `PUT .../photo`; port rebind; two-state colleague rule (Epic 0, `UMAC-1/2/3`) | 9 | new draft |
| `auth/` | FR-2/FR-3/FR-8 — magic-link request/consume, security edge cases (Epic 2) | 6 | header-noted draft |
| `profile/` | FR-9 — S1 data correctness given an entitled actor (entitlement is Epic 0's) (Epic 1 Story 1.2/1.3) | 4 | header-noted draft |
| `list/` | FR-15 — pagination, S1-field filters, dismissed-employee visibility (Epic 1 Story 1.5) | 5 | draft (`um-list-05` new) |
| `career-timeline/` | FR-5/FR-11/FR-12/FR-13 — system events; DEC-UM-001 manual mechanics (assigned PP + direct UM); dual gate; edit-immutability (Epic 3) | 10 | retraced draft (`um-ct-09/10` new) |
| `relationships/` | FR-10 — Epic 4 organisational facts: manager (4.1, retraced), PP (4.2, blocked stubs), department (4.3, blocked stubs) | 11 | split; see folder README |
| `departure/` | FR-6 — Epic 5 employment lifecycle (record / blocked / apply / retry) | 4 | new draft, **all BLOCKED — CC-06** |
| `registration/` | **RETIRED (v1.5)** — `um-reg-01..15` `POST /users` HTTP create. See folder README. | 15 | history only |
| `deactivation/` | **RETIRED (v1.5)** — `um-deact-01..03` generic `DELETE /users/:id`. See folder README. | 3 | history only |

**Live stage-1 scenario files (v1.5, subject to per-file approval):** 52.
**Retained as history (retired, do not approve):** 21 (`registration/` 15,
`deactivation/` 3, `relationships/um-rel-04..06` 3).

## What blocks stage-2

| Blocker | Blocks |
| --- | --- |
| Epic 0 Story 0.1 not yet landed (port rebind) | `access-control-adoption/umac-01..06` E2E is committed-red until the rebind |
| Missing `user-management:edit` permission (Open Decision i) | `access-control-adoption/umac-07` (CONDITIONAL) |
| Profile Projection story (FR-17) reaching production | flips `umac-04` colleague `403` → `200`-narrowed (`umac-03` / `UMAC-3`) |
| S9 `canAccessSection` — a **pending Access Control increment** (ACM-5 ships S1/S10/S11 only) | the S9-write half of the `career-timeline/` dual gate (`um-ct-03..10`) |
| CC-04 (PP persistence) + CC-07 (AD-19 journal) | `relationships/um-rel-09..11` (PP), and the atomic-journal Then-clause of `um-rel-01/02` |
| CC-07 + Department edge contract | `relationships/um-rel-12..14` (department) |
| CC-06 (scheduled-departure state + executor) | all of `departure/` |

## Normative decisions

[user-management-test-decisions.md](../../architecture/user-management-test-decisions.md)
(DEC-UM-001..012). DEC-UM-006 and DEC-UM-008 are **RETIRED** (no `POST /users`).
DEC-UM-007 and DEC-UM-009 are reconciled to the seed/import writer + ACM-0.
