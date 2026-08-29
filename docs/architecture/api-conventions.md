# API Conventions — Router Tree

Binding rules for the HTTP surface. Spine: AD-14, AD-19, AD-20. Applies to every context; this is the canonical mapping stage-2 authors bind test-case placeholder URLs against.

## No `/sections/:sN` wrapper

Earlier test-case drafts used `GET /users/:id/sections/s07` as documentation shorthand for "the S07 matrix cell." It was never a real route. There is no generic sections endpoint — every resource is addressed directly.

## The four shapes

1. **The `User` resource itself** — `S1 Identity` and `S16 custom fields`' scalar core, i.e. fields that live directly on the `User` row (`database-schema.md`):
   - `GET /users` (list, `?columns=`/`?filter[key]=value`), `GET /users/export`
   - `GET /users/:id` (read — response body is audience-filtered per viewer, §3.3.4), `PATCH /users/:id` (update). There is no generic user delete/deactivate route; departure is the §4.16 workflow gated by `record a departure`, effective date, reason, and re-parenting precondition (AD-16).
   - **Route ordering:** `export` sits at the same depth as `:id`. NestJS/Express matches in controller-declaration order, so a `:id` handler declared first silently swallows `GET /users/export` (`id = 'export'`) — no error, wrong behavior. Declare `export` (and any future literal sibling) **before** `:id` in every controller.
   - `PUT /users/:id/photo` — the one field needing a distinct content type (multipart upload). `PUT`, not `PATCH`: full-replace semantics, no partial-update meaning for a single photo.

2. **Owned collections** — rows with their own identity and lifecycle, independent of the `User` row: `POST /users/:id/<collection>` to create, `GET/PATCH/DELETE /users/:id/<collection>/:itemId` for one row, `GET /users/:id/<collection>` to list.
   - `events` (`UserEvents`/career-timeline — settles the earlier `events` vs `timeline-events` split in favor of `events`, matching the entity name), `documents`, `notes` (management notes), `feedbacks`, `assessments` + `idps` (CDS), `risks`, `leaves`, `request-history` (read-only — no write path exists in any scenario today), `departures` (AD-20)
   - Cross-user collections that were never user-scoped stay top-level: `action-items`, `campaigns`, `resourcing/requests`, `share-links`, and `mentorship-pairs`. Share-link consumption is authenticated and recipient-bound; there is no public or anonymous consume path (§4.8).

3. **Field-group resources** — no independent row identity, just a named bag of fields not yet on `User` (their owning context is still pending per `domain-driven-design.md`): `GET/PATCH /users/:id/<name>` only, no item id, no POST/DELETE. `PATCH` is **full-replace** for every field-group, uniformly — omitted fields are cleared, not merged; no owner picks partial-merge for their own.
   - `personal-contacts` (S2), `emergency-contacts` (S3), `employment` (S4), `custom-fields` (S16 — kept separate from the `User` row's `customFields` jsonb column so the route survives the dynamic custom-fields system landing, `custom-fields.md`). **Sequencing hazard:** this is the router *shape* only, fixed ahead of the still-open custom-fields *storage* decision (spine Deferred: EAV vs JSONB). If storage lands on EAV, custom fields gain row identity per field-per-user and belong in shape 2 instead — don't build persistence against shape 3 until storage is decided.
   - `S11 projects` is **read-only inline** on `GET /users/:id` (a derived view over `Relationship`, not its own fetch) — see shape 4 for how it's *written*.
   - **Classifying a resource not yet in this list**: shape 2 (collection) iff members can be created/deleted independently without replacing the whole set; shape 3 (field-group) iff cardinality is fixed at one-per-user even when internally multi-field ("a bag of fields" is not license to model a variable-cardinality list as shape 3). Add the row to this table as part of that feature's AD-1 scenario doc, before the endpoint is built — this table, not a new invention per feature-owner, is what keeps two builders from picking differently for the same kind of data.

4. **Generic attachment endpoints** — mirrors AD-7's one-policy-engine and AD-11's one-`Relationship`-table decisions at the HTTP layer, instead of a bespoke endpoint per assignable fact:
   - `POST /users/:id/relationships {type: 'direct'|'project', targetId}` — reports-to or project membership. `DELETE /users/:id/relationships/:relationshipId` revokes (hard delete, `database-schema.md`).
   - `PUT /users/:id/relationships/people-partner {targetId, expectedCurrentTargetId}` atomically creates/replaces the fixed-cardinality PP edge; `DELETE` carries the expected current PP as `If-Match: "<pp-user-id>"`. Stale expected state or a losing concurrent absent-row insert returns `409`; the edge and one before/after journal record commit together (AD-19, with CC-07 as the journal-schema gate).
   - `POST /users/:id/policies {type: 'AR'|'FR', targetType, targetId, targetRole}` — project/department-manager assignment or functional-role grant to this user. `targetType:'department'` is accepted by the schema but **not yet honored** by tier resolution (`access-control.md`, AD-10) — don't build a department-manager feature against it yet. `DELETE /users/:id/policies/:policyId` revokes.
   - Role/permission **catalog** management (defining a functional role and its permission set — not attaching a user to one) is cross-user, so it's top-level, never nested under `/users`: `GET/POST /roles`, `PATCH /roles/:roleId/permissions`, `DELETE /roles/:roleId`. Full request/response shapes for this catalog aren't specified yet — pending its own AD-1 scenario doc.
   - Organisational changes to manager, people partner, department, or department manager use these attachment operations only from the dedicated organisational-relationship screen. They require the dedicated feature permission, reject self-assignment, and journal the fact mutation in the same transaction; S1 PATCH never invokes them (§2.1, AD-10).

## Seeded-population import (AD-16)

There is **no `POST /users` employee-creation route**. The supplied seeded population is imported as an idempotent administrative workflow keyed by `ttId`; it is not a per-employee registration surface and it cannot import arbitrary real employee data. The exact batch transport and operator endpoint are an explicit follow-up contract: they must be fixed in an AD-1 scenario before import implementation begins. Until then, do not substitute `POST /users`.

## Departure command and status (AD-20)

- `POST /users/:id/departures` with `Idempotency-Key` and `{effectiveDate, reason}` records a scheduled departure after the authoritative blocker check and returns `201`.
- Active direct-report, department-manager, PM/DM, or PP responsibilities return `409` before any schedule is written. The response contains leak-safe blocker summaries the caller may administer and, when available, the departing person's own manager as a default remediation target.
- `POST /users/:id/departure-reparenting {targetId, expectedBlockerVersion}` is the explicit one-click remediation command for platform-owned direct, department-manager, and PP blockers. `expectedBlockerVersion` is the opaque server-computed digest returned by the blocker response over the sorted current blocker identities/targets. The command atomically reassigns exactly that still-current platform-owned set and journals every change; any changed digest returns `409`. Timetracker-owned PM/DM blockers are returned as external-remediation items and remain blocking until sync confirms removal; no platform shadow policy is written. The command never records departure automatically.
- Repeating the same key and payload returns the original result; the same key with different payload, or a different key while a non-applied departure exists, returns `409`.
- The canonical idempotency hash covers API contract version, path user id, normalized ISO `effectiveDate`, normalized reason, and authenticated creator id. Replay always rechecks current authorization and never discloses status to a caller who has since lost access.
- `GET /users/:id/departures/:departureId` exposes authorized execution status and sanitized diagnostics.
- `POST /users/:id/departures/:departureId/retry` requires the `record a departure` capability, accepts only `retry_wait`, returns `202`, and makes the row immediately eligible without bypassing claim/fencing. `processing` or `applied` returns `409`; the action is operationally logged without exposing raw errors.
- No `PATCH`, `DELETE`, cancellation, or rescheduling route exists until Product defines that lifecycle.

## §3.2 section → route mapping

Human-readable names, taken from the section folders' own existing names (`docs/test-cases/access-control/matrix/`) — never the `sNN` id in a URL. `sNN` survives only inside the tier→section mapping table (`access-control.md`) as a cross-reference to the requirements doc.

| § | Name | Read | Write |
| --- | --- | --- | --- |
| S1 | Identity | `GET /users/:id` | `PATCH /users/:id` |
| S2 | Personal contacts | `GET /users/:id/personal-contacts` | `PATCH /users/:id/personal-contacts` |
| S3 | Emergency contacts | `GET /users/:id/emergency-contacts` | `PATCH /users/:id/emergency-contacts` |
| S4 | Employment | `GET /users/:id/employment`; `GET /users/:id/departures/:departureId` | `PATCH /users/:id/employment`; `POST /users/:id/departure-reparenting`; `POST /users/:id/departures[/:departureId/retry]` |
| S5 | Documents | `GET /users/:id/documents[/:id]` | `POST /users/:id/documents`, `DELETE .../:id` |
| S6 | Risks | `GET /users/:id/risks` | `POST /users/:id/risks` |
| S7 | Management notes | `GET /users/:id/notes[/:id]` | `POST /users/:id/notes`, `PATCH .../:id` |
| S8 | Feedbacks | `GET /users/:id/feedbacks[/:id]` | `POST /users/:id/feedbacks`, `PATCH .../:id` |
| S9 | Career timeline | `GET /users/:id/events` | `POST /users/:id/events`, `DELETE .../:id` |
| S10 | Leaves | `GET /users/:id/leaves` | *(no write path in any scenario yet)* |
| S11 | Projects | `GET /users/:id` (inline) | `POST/DELETE /users/:id/relationships` (`type:'project'`) |
| S12 | CDS | `GET /users/:id/assessments`, `/idps` | `POST/PATCH .../assessments[/:id]`, `POST .../idps[/:id]/complete` |
| S13 | Mentorship | `GET /users/:id` (inline summary); `GET /mentorship-pairs` | `POST /mentorship-pairs`; closure via a pair action carrying the required note; exact action route follows its approved AD-1 scenario |
| S14 | Action items | `GET /action-items` | `POST /action-items`, `.../:id/complete`, `.../:id/cancel` (top-level, unchanged) |
| S15 | Request history | `GET /users/:id/request-history` | *(no write path in any scenario yet)* |
| S16 | Custom fields | `GET /users/:id/custom-fields` | `PATCH /users/:id/custom-fields` |

## Deliberately unchanged

`share-links`, authenticated recipient-bound share consumption, `action-items`, `campaigns`, and `resourcing/requests` remain top-level and consistent with “cross-user resources never nest under `/users`.” Mentorship pairs now follow that same top-level rule under AD-17.
