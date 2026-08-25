# API Conventions — Router Tree

Binding rules for the HTTP surface. Spine: AD-14. Applies to every context; this is the canonical mapping stage-2 authors bind test-case placeholder URLs against.

## No `/sections/:sN` wrapper

Earlier test-case drafts used `GET /users/:id/sections/s07` as documentation shorthand for "the S07 matrix cell." It was never a real route. There is no generic sections endpoint — every resource is addressed directly.

## The four shapes

1. **The `User` resource itself** — `S1 Identity` and `S16 custom fields`' scalar core, i.e. fields that live directly on the `User` row (`database-schema.md`):
   - `POST /users` (create), `GET /users` (list, `?columns=`/`?filter[key]=value`), `GET /users/export`
   - `GET /users/:id` (read — response body is audience-filtered per viewer, §3.3.4), `PATCH /users/:id` (update), `DELETE /users/:id` (soft-delete: flips `isActive`, AD-12 style — never a real row delete)
   - **Route ordering:** `export` sits at the same depth as `:id`. NestJS/Express matches in controller-declaration order, so a `:id` handler declared first silently swallows `GET /users/export` (`id = 'export'`) — no error, wrong behavior. Declare `export` (and any future literal sibling) **before** `:id` in every controller.
   - `PUT /users/:id/photo` — the one field needing a distinct content type (multipart upload). `PUT`, not `PATCH`: full-replace semantics, no partial-update meaning for a single photo.

2. **Owned collections** — rows with their own identity and lifecycle, independent of the `User` row: `POST /users/:id/<collection>` to create, `GET/PATCH/DELETE /users/:id/<collection>/:itemId` for one row, `GET /users/:id/<collection>` to list.
   - `events` (`UserEvents`/career-timeline — settles the earlier `events` vs `timeline-events` split in favor of `events`, matching the entity name), `documents`, `notes` (management notes), `feedbacks`, `assessments` + `idps` (CDS), `risks`, `leaves`, `request-history` (read-only — no write path exists in any scenario today)
   - Cross-user collections that were never user-scoped stay top-level, unchanged: `action-items`, `campaigns`, `resourcing/requests`, `share-links` (+ the public unauthenticated `share/:token` consume path)

3. **Field-group resources** — no independent row identity, just a named bag of fields not yet on `User` (their owning context is still pending per `domain-driven-design.md`): `GET/PATCH /users/:id/<name>` only, no item id, no POST/DELETE. `PATCH` is **full-replace** for every field-group, uniformly — omitted fields are cleared, not merged; no owner picks partial-merge for their own.
   - `personal-contacts` (S2), `emergency-contacts` (S3), `employment` (S4), `custom-fields` (S16 — kept separate from the `User` row's `customFields` jsonb column so the route survives the dynamic custom-fields system landing, `custom-fields.md`). **Sequencing hazard:** this is the router *shape* only, fixed ahead of the still-open custom-fields *storage* decision (spine Deferred: EAV vs JSONB). If storage lands on EAV, custom fields gain row identity per field-per-user and belong in shape 2 instead — don't build persistence against shape 3 until storage is decided.
   - `S11 projects` is **read-only inline** on `GET /users/:id` (a derived view over `Relationship`, not its own fetch) — see shape 4 for how it's *written*.
   - **Classifying a resource not yet in this list**: shape 2 (collection) iff members can be created/deleted independently without replacing the whole set; shape 3 (field-group) iff cardinality is fixed at one-per-user even when internally multi-field ("a bag of fields" is not license to model a variable-cardinality list as shape 3). Add the row to this table as part of that feature's AD-1 scenario doc, before the endpoint is built — this table, not a new invention per feature-owner, is what keeps two builders from picking differently for the same kind of data.

4. **Generic attachment endpoints** — mirrors AD-7's one-policy-engine and AD-11's one-`Relationship`-table decisions at the HTTP layer, instead of a bespoke endpoint per assignable fact:
   - `POST /users/:id/relationships {type: 'direct'|'project'|'mentorship', targetId}` — reports-to, project membership, or mentor pairing. `DELETE /users/:id/relationships/:relationshipId` revokes (hard delete, `database-schema.md`).
   - `POST /users/:id/policies {type: 'AR'|'FR', targetType, targetId, targetRole}` — PP assignment, project-manager assignment, functional-role grant to this user. `targetType:'department'` is accepted by the schema but **not yet honored** by tier resolution (`access-control.md`, AD-10) — don't build a department-manager feature against it yet. `DELETE /users/:id/policies/:policyId` revokes.
   - Role/permission **catalog** management (defining a functional role and its permission set — not attaching a user to one) is cross-user, so it's top-level, never nested under `/users`: `GET/POST /roles`, `PATCH /roles/:roleId/permissions`, `DELETE /roles/:roleId`. Full request/response shapes for this catalog aren't specified yet — pending its own AD-1 scenario doc.
   - `mentorship-pairs` as a standalone resource is retired — mentor pairing is `type: 'mentorship'` on `/users/:id/relationships` (AD-11).

## §3.2 section → route mapping

Human-readable names, taken from the section folders' own existing names (`docs/test-cases/access-control/matrix/`) — never the `sNN` id in a URL. `sNN` survives only inside the tier→section mapping table (`access-control.md`) as a cross-reference to the requirements doc.

| § | Name | Read | Write |
| --- | --- | --- | --- |
| S1 | Identity | `GET /users/:id` | `PATCH /users/:id` |
| S2 | Personal contacts | `GET /users/:id/personal-contacts` | `PATCH /users/:id/personal-contacts` |
| S3 | Emergency contacts | `GET /users/:id/emergency-contacts` | `PATCH /users/:id/emergency-contacts` |
| S4 | Employment | `GET /users/:id/employment` | `PATCH /users/:id/employment` |
| S5 | Documents | `GET /users/:id/documents[/:id]` | `POST /users/:id/documents`, `DELETE .../:id` |
| S6 | Risks | `GET /users/:id/risks` | `POST /users/:id/risks` |
| S7 | Management notes | `GET /users/:id/notes[/:id]` | `POST /users/:id/notes`, `PATCH .../:id` |
| S8 | Feedbacks | `GET /users/:id/feedbacks[/:id]` | `POST /users/:id/feedbacks`, `PATCH .../:id` |
| S9 | Career timeline | `GET /users/:id/events` | `POST /users/:id/events`, `DELETE .../:id` |
| S10 | Leaves | `GET /users/:id/leaves` | *(no write path in any scenario yet)* |
| S11 | Projects | `GET /users/:id` (inline) | `POST/DELETE /users/:id/relationships` (`type:'project'`) |
| S12 | CDS | `GET /users/:id/assessments`, `/idps` | `POST/PATCH .../assessments[/:id]`, `POST .../idps[/:id]/complete` |
| S13 | Mentorship | `GET /users/:id` (inline) | pairing via `/relationships` (`type:'mentorship'`); the S13 self-visibility flag via `PATCH /users/:id/relationships/:id` **[inferred — not directly sourced, flagging for confirmation]** |
| S14 | Action items | `GET /action-items` | `POST /action-items`, `.../:id/complete`, `.../:id/cancel` (top-level, unchanged) |
| S15 | Request history | `GET /users/:id/request-history` | *(no write path in any scenario yet)* |
| S16 | Custom fields | `GET /users/:id/custom-fields` | `PATCH /users/:id/custom-fields` |

## Deliberately unchanged

`share-links`/`share/:token`, `action-items`, `campaigns`, `resourcing/requests` were already top-level and already consistent with "cross-user resources never nest under `/users`" — nothing to fix there.
