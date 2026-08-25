---
title: 'Story 1.3: Self Uploads Own Photo'
type: 'feature'
created: '2026-08-24'
status: 'ready-for-dev'
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/user-management/epic-1-context.md']
baseline_commit: '6254ed50d910acb4bfa8f046e3cf0b72f3153934'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `photo` is the one identity-card field an employee can write on themselves (`epic-1-context.md`), but no endpoint exists for it yet. It must not be folded into the general S1 field-edit endpoint (`PATCH /users/:id`, Story 1.2): `api-conventions.md` gives photo a deliberately separate route — `PUT /users/:id/photo`, multipart content type, full-replace semantics, "no partial-update meaning for a single photo" — precisely because a generic PATCH body has no natural way to carry a file upload alongside scalar fields.

**Approach:** Add a dedicated multipart `PUT /users/:id/photo` handler inside the existing `src/user-management/{application,domain,infrastructure}` hexagonal skeleton (built by Story 1.1; currently only in the stashed, not-yet-merged implementation). Reuse the `User` entity, repository, and the session-resolver/AccessControl ports as-is — no module rebuild. The one new piece the architecture docs don't already answer is where the uploaded file itself lands: neither `database-schema.md` (which only says `photo` is a nullable string reference on `User`) nor `api-conventions.md` names a storage mechanism. Following Story 1.1's precedent for undecided externals (magic-link dispatch, session resolution — each a port + fixture fake), this story introduces a `photo-storage` port and a fixture-backed fake that returns a deterministic string reference; a real storage adapter is explicitly out of scope pending an architect decision.

## Boundaries & Constraints

**Always:**
- AD-1 gate: get `docs/test-cases/user-management/profile/um-pf-02-self-upload-photo.md` approved (currently draft, pending), then reconcile/extend the existing E2E coverage for `um-pf-02` to a faithful, passing translation, then implement — never code before that stage-2 checkpoint is real and human-reviewed.
- `domain/` imports nothing from Prisma, NestJS transport, or HTTP.
- Route is exactly `PUT /users/:id/photo`, multipart content type, full-replace semantics — matches `api-conventions.md`.
- Every entitlement check routes through the shared AccessControl facade (AD-9, the Self-write-own-photo carve-out) — never a hand-rolled role/ownership check in the controller.
- This handler writes only the `photo` field on `User`. No other field is accepted, read from the request, or modified here, even if present in the multipart payload.
- Reuse Story 1.1's hexagonal skeleton (`User` entity, repository, session-resolver port, access-control port, and their fakes) as-is. Do not recreate the module.

**Ask First:**
- Whether a `photo-storage` port + fixture fake (mirroring Story 1.1's port-and-fake treatment of undecided externals) is the right shape for "where does the uploaded file land" — confirm with the architect before building any adapter beyond the fake; no doc specifies local disk vs. object storage.
- Any change to `test/user-management/profile.e2e-spec.ts` beyond the `um-pf-02` describe block — the file is shared with Story 1.2 (`um-pf-01`/`03`/`04`); coordinate rather than unilaterally rewrite shared setup.

**Never:**
- Don't accept or persist any `User` field other than `photo` through this endpoint.
- Don't add `updatedAt`/`updatedBy` — no named consumer (`epic-1-context.md`, `database-schema.md` Conventions).
- Don't build a real object-storage/CDN adapter in this story — port + fixture fake only, matching how Story 1.1 treated the magic-link and session ports.
- Don't duplicate entitlement/authorization scenarios (401/403, "only photo is Self-writable") in this story's own tests — that's proven in access-control's own suite (`docs/test-cases/access-control/matrix/s01-identity/self-photo-upload.md`, `self-write-denied.md`) per `epic-1-context.md`'s explicit division of labor; this suite covers workflow/data correctness only.

## I/O & Edge-Case Matrix

Source: `epics.md` lines 199-202 (Story 1.3 acceptance criteria, traces `um-pf-02`) and `docs/test-cases/user-management/profile/um-pf-02-self-upload-photo.md`.

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Upload (the write) | Alice, own profile, `photo: null`; `PUT /users/<aliceId>/photo` with a new photo file | `200`; body includes a non-null `photo` reference | N/A |
| Persisted read (observing the change) | Follow-up `GET /users/<aliceId>` | `200`; `photo` matches the value returned by the upload | N/A |

Entitlement-boundary scenarios (unauthenticated, unauthorized, non-Self attempting the write) are deliberately out of this matrix — they belong to access-control's own suite, not this story's.

</frozen-after-approval>

## Code Map

- `docs/test-cases/user-management/profile/um-pf-02-self-upload-photo.md` -- EXISTS (status: draft, pending approval) -- get approved as AD-1 stage 1; do not rewrite unless approval feedback requires changes
- `services/backend/test/user-management/profile.e2e-spec.ts` -- EXISTS on backend branch `user-management` (commit `865df5f243a88b43836996cfee909a8e1c37fd68`) -- reconcile/extend, do not recreate. Shared with Story 1.2: it covers `um-pf-01..04` in one file, and this story owns only the `um-pf-02` describe block. Note for stage-2 reconciliation: as currently written that block does `.send({ photo: '<binary-or-uploaded-file-ref>' })` — a JSON string field, not an actual multipart file upload — which doesn't yet match `api-conventions.md`'s multipart requirement; don't assume it's already a faithful translation, reconcile it during the human-reviewed stage-2 checkpoint
- `services/backend/src/user-management/{domain,application,infrastructure}/**` -- REUSE Story 1.1's hexagonal skeleton (`User` entity, `user-repository.port.ts` + Prisma repository, `session-resolver.port.ts`, `access-control.port.ts`, and their fakes). Currently only present in stash `story-1.1-premature-implementation`, not yet merged to this branch -- this story is blocked on that skeleton landing; do not recreate it
- `services/backend/src/user-management/domain/interfaces/photo-storage.port.ts` -- NEW: `{ store(userId, file): Promise<string> }`, returns the reference string that gets persisted to `User.photo` -- needed because no architecture doc names a storage mechanism for the uploaded file itself, only that `User.photo` is a nullable string reference (`database-schema.md`); shape needs architect confirmation ("Ask First" above) before a real adapter is built
- `services/backend/src/user-management/infrastructure/fakes/fake-photo-storage.adapter.ts` -- NEW: fixture-backed fake bound only in the test module (AD-3), returns a deterministic string reference
- `services/backend/src/user-management/application/dtos/upload-photo.dto.ts` -- NEW: multipart file field only, no other `User` fields
- `services/backend/src/user-management/application/actions/upload-user-photo.action.ts` -- NEW: session-resolver -> AccessControl facade -> photo-storage port -> repository update, scoped strictly to `photo`
- `services/backend/src/user-management/application/controllers/users.controller.ts` -- EXTEND (do not recreate): add the `PUT /users/:id/photo` multipart handler (e.g. `FileInterceptor`) alongside the existing `POST /users` handler
- `services/backend/prisma/schema.prisma` -- no change expected: `photo` (nullable string) is already part of the `User` model per Story 1.1's Code Map; confirm during implementation rather than assume a migration is needed

## Tasks & Acceptance

**Execution:**
- [ ] Get `um-pf-02-self-upload-photo.md` approved -- AD-1 stage 1, real human checkpoint
- [ ] Reconcile `test/user-management/profile.e2e-spec.ts`'s `um-pf-02` block against the approved scenario doc (including the multipart-vs-JSON-string gap noted above) -- AD-1 stage 2, real human checkpoint; coordinate with whoever owns Story 1.2 since the file is shared
- [ ] Confirm the `photo-storage` port shape with the architect before building beyond a fake -- "Ask First"
- [ ] `domain/interfaces/photo-storage.port.ts` -- NEW
- [ ] `infrastructure/fakes/fake-photo-storage.adapter.ts` -- NEW, bound only in the test module
- [ ] `application/dtos/upload-photo.dto.ts` -- NEW
- [ ] `application/actions/upload-user-photo.action.ts` -- NEW
- [ ] `application/controllers/users.controller.ts` -- add `PUT /users/:id/photo` handler
- [ ] Verify `PATCH /users/:id` (Story 1.2's endpoint) remains unaffected -- this story adds a sibling route, never modifies that handler

**Acceptance Criteria:**
- Given the 2 E2E scenarios in the I/O matrix above, when `npm run test:e2e` runs, then both pass with no real file-storage calls (fake adapter only)
- Given `src/user-management/application/controllers/users.controller.ts`, when `npm run build` runs, then it succeeds with no dangling imports

## Design Notes

The `photo-storage` port is this story's only genuinely new architectural surface; everything else (entity, repository, session/access-control ports) is reused verbatim from Story 1.1. It follows the same pattern Story 1.1 established for externals the epic doesn't want to block on: a domain-owned interface, a fixture-backed fake bound in the e2e test module, and a real adapter deferred to whoever owns that decision later — here, that's an open architecture question (local disk vs. object storage) rather than another epic, so it needs an explicit architect confirmation before the real adapter is built, not just a later-epic handoff.

Entitlement is deliberately not re-tested here: `epic-1-context.md` assigns "who is entitled to do it" to access-control's own suite, which already has both the positive case (`self-photo-upload.md`) and the negative case for non-photo fields (`self-write-denied.md`). This story's own E2E coverage stays scoped to the workflow claim in `um-pf-02`: the write persists, and a subsequent read reflects it.

The shared E2E file (`profile.e2e-spec.ts`) currently sends the photo as a plain JSON string rather than a real multipart upload. That's a pre-existing gap between the checked-in test and the multipart contract in `api-conventions.md` — flagging it here rather than quietly implementing around it, since closing that gap is properly part of the AD-1 stage-2 human review, not a unilateral call by whoever codes this story.

## Verification

**Commands:**
- `npm run db:migrate` -- confirm no new migration is actually needed (schema already carries `photo`)
- `npm run test:e2e` -- `user-management/profile` `um-pf-02` block passes, `um-pf-01/03/04` remain unaffected
- `npm run build` -- no TS errors
- `npm run lint` -- clean
