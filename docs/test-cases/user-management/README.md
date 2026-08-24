# User Management — Test-Case Suite

Stage-1 quality-gate scenario documents (AD-1), following the team-wide authoring pattern in [../README.md](../README.md): **one test case per file**, each opening with a plain-language **Scenario** (Given/When/Then) followed by the explicit request spec — `inputURL`, `inputRequest` (headers + body), `expectedResult` with HTTP status — traced to `docs/project-requirements.md` (§), the [user-management PRD](../../../_bmad-output/planning-artifacts/prds/prd-user-management-2026-08-20/prd.md) (FR-n), and/or an architecture decision (AD-n). **Status: draft — each file needs developer approval before its E2E is written.** Spec contract: `_bmad-output/specs/spec-user-management-test-cases/SPEC.md`.

## Scope — read this before adding a file

This suite tests **workflow and data correctness**, not **who is entitled**. Whether an actor is allowed to read/write a section is the access-control suite's job ([docs/test-cases/access-control/](../access-control/)) and is proven there — these files assume an already-entitled actor and assert what the feature actually does: does the record get created, does the constraint hold, does the derived event get written, does the correction leave the old entry intact-but-hidden.

The `User` entity in this PRD carries only S1-identity-card fields (see [database-schema.md](../../architecture/database-schema.md)) plus `UserEvents`. This is deliberate, not an oversight: employment (S4), contacts (S2/S3), documents (S5), mentorship and feedback are planned as their own tables/contexts later. Scenarios here don't reach past that boundary — no S2/S3/S4/S5 field appears in any request or response body below.

## Conventions (apply to every file)

- **Authorization header:** `"Bearer <token:persona>"` = a valid session token for that persona; `""` (empty) = unauthenticated. Every endpoint rejects a missing/invalid token with `401` — same global rule as [access-control's suite](../access-control/README.md).
- **Denial convention:** valid token, no permission for the feature → `403`.
- **Endpoints are bound to the canonical convention.** Resource root `/users`; auth root `/auth`; routes follow the router-tree convention in [api-conventions.md](../../architecture/api-conventions.md) (AD-14) — not placeholder vocabulary.
- **Absence is absence:** a soft-deleted `UserEvents` row is excluded from reads, never returned with a null/placeholder body.
- **Immutable-fact model:** a `UserEvents` correction is never a single in-place PATCH. It is shown as explicit steps — soft-delete the wrong entry, append the corrected one, then a read that observes both (old entry gone from the active view, new entry present) — per the granularity rule in [../README.md](../README.md).
- A file with several `Test N` blocks is still one requirement, probed via its cause→effect sequence (baseline → change → observation).

## Canonical personas

Reuses the cast seeded for [access-control's suite](../access-control/README.md#canonical-personas) so relationships stay consistent across both suites, plus two new hires for the registration story:

| Persona | Role in this suite |
| --- | --- |
| **Root** | HR Admin functional role. Creates users, deactivates users. |
| **Nina** | New hire. Does not exist until `registration/um-reg-01` creates her — her target id is the response of that call, not a seeded fixture. |
| **Tomas** | Second new hire, created only by `registration/um-reg-05`. Kept distinct from Nina so the no-session case does not collide with the success case over one `workEmail`. |
| **Alice** | Existing employee (reports to Bob, PP Paula). Subject of profile-edit, auth, and career-timeline scenarios. |
| **Bob** | Alice's unit manager (Manager-line). Edits Alice's identity fields; manually adds/corrects her career-timeline entries (§4.9: PP and UM only). |
| **Paula** | Alice's people partner. Also manually adds/corrects career-timeline entries. |
| **Colin** | Unrelated employee, no HR Admin role. Holds `workEmail: colin@company.example` and `ttId: "tt-1042"` — the in-use values the uniqueness cases collide against. |
| **Ida** | Holds the custom functional role *IT Campaigns*, whose only permission is *create form campaigns*. Used for the 403 probe on HR-Admin-gated actions: holding a functional role must not imply holding this one (§2.3). |

## Layout

| Folder | Covers | Files |
| --- | --- | --- |
| `registration/` | FR-3/FR-4: HR Admin creates a user on a new hire's behalf; registration triggers the magic-link flow rather than logging in directly; payload validation; `workEmail`/`ttId` uniqueness | 7 |
| `auth/` | FR-2: request a magic link by `workEmail`, consume the token to establish a session | 5 |
| `profile/` | User's own S1-field CRUD mechanics: Manager-line edits, Self photo upload, uniqueness constraints on write | 4 |
| `deactivation/` | `isActive` soft delete: the record is preserved, excluded from active-only views | 3 |
| `career-timeline/` | §4.9: system-generated events (`joined_company`, `position_change` — the only two currently triggerable, see SPEC assumptions) and PP/UM manual add/correct/delete mechanics | 7 |

File names state actor/behavior (`um-reg-01-hr-admin-create-success.md`), so a folder listing is its own index.

## Deliberately not covered here

Whether an actor is entitled to perform an action (access-control's job, entirely). S2/S3/S4/S5 section content (no schema yet). Six of `UserEvents`' eight documented types (`grade_change`, `department_change`, `employment_type_change`, `extended_leave`, `mentorship_start`, `mentorship_end`) — they reference fields/contexts that don't exist in this PRD yet. Timetracker/PeopleForce sync-driven writes (AD-13, future integration). Seed-script bootstrap behavior (not an HTTP-driven scenario; access-control's `fc-03` already covers the bootstrap admin being an ordinary revocable FR).
