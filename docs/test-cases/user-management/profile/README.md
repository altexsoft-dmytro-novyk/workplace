# User Management — `profile/` (FR-9: S1 identity-card correctness)

Stage-1 scenario documents (AD-1) for the Epic 1 stories that write S1
identity-card data, following the team-wide authoring pattern in
[../../README.md](../../README.md): **one test case per file**, each opening with
a plain-language **Scenario** (Given/When/Then) followed by the explicit request
spec — `inputURL`, `inputRequest`, `expectedResult` — traced to
`docs/project-requirements.md` (§), the user-management PRD (FR-n), architecture
decisions (AD-n), and `docs/architecture/user-management-test-decisions.md`
(DEC-UM-n).

| Cluster | Story | Files | Asserts |
| --- | --- | --- | --- |
| `um-edit-*` | 1.2 — View and Edit an Employee's Identity-Card Fields | scalar S1 `PATCH /users/:id` **data correctness only** | the write persists (partial merge) and reflects on a follow-up `GET` in the `{ data, canEdit }` envelope; normalization precedes the uniqueness check; a uniqueness conflict is rejected **wholesale**; org / technical fields in the body → `400` |
| `um-photo-*` | 1.3 — Self Uploads Own Photo | `PUT /users/:id/photo` multipart full-replace + real object storage (AD-15) | the upload persists a real object + a `photo` reference, is Self-only, validates the file, and never half-applies |

`um-pf-01` / `um-pf-03` / `um-pf-04` are **superseded 2026-09-02** by the
`um-edit-*` set (the pre-v1.5 Story 1.2 edit scenarios — reframed and expanded
now that `GET /users/:id` returns the CAP-3 `{ data, canEdit }` envelope and the
edit path has explicit partial-merge / wholesale-reject / DTO-rejection rules).
`um-pf-02` is superseded by the `um-photo-*` set. All four IDs are retired **in
place** — never reused, per the ID-stability rule in
[../../README.md](../../README.md); the files are pointers only.

## Status — UNAPPROVED DRAFT

The `um-edit-*` set was authored 2026-09-02 for Epic 1 Story 1.2 against the
compiled spec
[`spec-1-2-view-and-edit-an-employee-s-identity-card-fields.md`](../../../../_bmad-output/implementation-artifacts/user-management/spec-1-2-view-and-edit-an-employee-s-identity-card-fields.md)
(`status: draft`), the Epic 1 context, `umac-07`/`umac-08` (the entitlement
side — cross-referenced, not duplicated), and DEC-UM-007. Per-file human
approval under the AD-1 stage-1 gate is required; **no `approvals.yaml` records
this set.**

> **Variant A (product decision 2026-09-02, Dmytro Novyk).** The employee
> identity card (S1) has **no separate functional permission**. The Epic 0 edit
> gate on `PATCH /users/:id` is `canAccessSection(viewer, 'S1', target) ===
> 'write'` alone — the target's reporting-line manager or assigned People
> Partner. Consequently **Story 1.2 is no longer blocked on a `user-management:edit`
> holder decision or a kernel-seed sequence**; it is pending only its own
> Stage 2 / Stage 3. `user-management:edit` survives only as the Epic 0 adapter's
> internal routing key for the PATCH-gate branch.

> **Amended 2026-09-05 (PLAT-E4-S4.1c — `@RequireSectionAccess` gate).** The
> Variant A blockquote above is kept as the historical record of the 2026-09-02
> decision and is **no longer the live rule.** SCP
> [`sprint-change-proposal-2026-09-04-section-access-consolidation.md`](../../../../_bmad-output/planning-artifacts/sprint-change-proposal-2026-09-04-section-access-consolidation.md)
> **D1** restores the identity-card edit as a **dual gate**, evaluated
> audience-first:
>
> 1. `canAccessSection(viewer, 'profile:identity', target)` must already resolve
>    to `write` — `docs/project-requirements.md` §3.2 row **S1** gives
>    `RW¹` to the Reporting line and to PP, and only `R` to Self
>    (`R (photo RW)`) and Colleague;
> 2. **then** `isAllowed(viewer, 'profile:identity:write')`, which every
>    **active** employee holds implicitly through the `DEFAULT_PERMISSIONS` code
>    constant (**D2**) — no `Policies`, `PolicyPermissions`, `UserPolicies` row,
>    no seed, no bootstrap change.
>
> The order is the invariant, not a preference: a failed audience half
> short-circuits, so the feature half can only ever turn an allow into a deny
> and never widens a resolved audience (`access-control.md` line 19).
>
> **What this changes for `um-edit-*` and `um-photo-*`: nothing observable.**
> Every persona in this file is an active employee and therefore holds the
> feature half by construction, so the audience half remains the deciding term
> and every asserted status, body and `canEdit` value stands. Story 1.2 is still
> unblocked on any kernel seed — more so, since the feature half needs none. Two
> vocabulary changes do apply throughout: the section identifier passed to the
> facade is the human key **`profile:identity`** (**D4** / PLAT-E4-S4.1b, already
> landed in code) and `S<n>` is a §3.2 matrix-row citation only; and the Epic 0
> route gate is now the single declaration
> `@RequireSectionAccess('profile:identity', 'write')` rather than a
> feature-string branch. Where the prose below still reads "audience-only" or
> `canAccessSection('S1')`, read it as this dual gate on `'profile:identity'`.
> New Epic 4 scenarios:
> [`s41c-sag-01`](../access-control-adoption/s41c-sag-01-read-gate-any-audience-allows-none-denies.md)..[`s41c-sag-05`](../access-control-adoption/s41c-sag-05-unmapped-section-fails-closed.md).

The `um-photo-*` set was authored 2026-09-02 for Epic 1 Story 1.3 against the
compiled spec
[`spec-1-3-self-uploads-own-photo.md`](../../../../_bmad-output/implementation-artifacts/user-management/spec-1-3-self-uploads-own-photo.md)
(`status: draft`), the Epic 1 context, and the Epic 0 Open Decisions **v** and
**vi** already taken by Dmytro (photo write is **Self-only**; photo is **not** a
distinct permission key). Per-file human approval under the AD-1 stage-1 gate is
required before any stage-2 E2E; **no `approvals.yaml` records this set.**
`author` must differ from `approver` — an agent's review of its own output is
never the approval ([../../../architecture/testing-strategy.md](../../../architecture/testing-strategy.md)).

## `um-edit-*` — Story 1.2 (edit S1 identity fields), authored 2026-09-02

**Story 1.2 is `PATCH /users/:id` data-correctness only.** `GET /users/:id`
already shipped (UMAC-1 / Epic 0 Story 0.1). *Who* is entitled to `PATCH` —
reporting-line manager / assigned PP allowed, self `403` on S1 scalars,
colleague `403`, `401`/`403` unresolved — is asserted **canonically by Epic 0**
against the real `AccessControlFacade` in `access-control-adoption/umac-07`
(the `profile:identity` dual gate) and `umac-08` (org-field rejection). The
`um-edit-*` files do **not** duplicate those; every `um-edit-*` Stage-2 test
**seeds an already-entitled actor** (real seeded-UUID token + real
`Relationship` edge giving `canAccessSection('profile:identity') === 'write'`,
the actor's active state supplying the feature half) and asserts only what the
write does to the data.

### Stage 2 / Stage 3 state

The Epic 0 edit gate is the `profile:identity` dual gate (audience half
`canAccessSection(v, 'profile:identity', t) === 'write'`, then the
`DEFAULT_PERMISSIONS`-backed feature half), which Epic 0 Story 0.1 and
PLAT-E4-S4.1a already ship — so
`um-edit-*` is **not** blocked on any kernel seed or permission-holder decision.
Bob's seeded reporting-line edge to Alice satisfies the gate, so a Stage-2
`PATCH` reaches `EditUserAction` / `UpdateUserDto`. The set is pending only its
own Stage 2 (committed-red E2E) and Stage 3 (production) dispatches under the
AD-1 gate.

### Also settled by Variant A (and still settled under the D1 dual gate)

`access-control-adoption/umac-07` (CONDITIONAL → reframed and green), the
`write-adoption.e2e-spec.ts` UMAC-07 group (green), and Story 1.3's
`um-photo-09` Test 1 (`PATCH` + `photo` → `400`, which needs the guard to pass
first — a reporting-line manager clears the gate: `write` audience **and** the
`DEFAULT_PERMISSIONS` feature half). The
`write-adoption.e2e-spec.ts` UMAC-08 group stays **red** until Story 1.2 Stage 3
adds the `@IsEmpty()` rejection on the org keys.

### Canonical personas (`um-edit-*`)

Reconcile against [../README.md](../README.md#canonical-personas): **Alice**
(seeded subject; reports to Bob; PP Paula), **Bob** (Alice's direct Unit
Manager — `canAccessSection(Bob, 'profile:identity', Alice) === 'write'`, the
audience half of the umac-07 dual gate; Bob holds its feature half
`profile:identity:write` implicitly as an active employee), **Paula** (Alice's assigned PP — second entitled
writer, same gate), **Colin** (unrelated seeded employee holding the in-use
`workEmail` / `ttId` the uniqueness cases collide against), **Nina** (fresh
target / second `ttId: null` row). Token convention: `Bearer <token:<bobId>>`
resolves to a **real seeded UUID** (Epic 0 fixture convention, `um-integration-contract-response.md`
Q6) — never a `Bearer <token:Bob>` literal, which resolves to the string id
`'Bob'` → empty audience → `403`.

### `PATCH /users/:id` semantics — partial merge (in-scenario decision)

`api-conventions.md` marks shape-3 field-groups and the photo `PUT` as
**full-replace**, but says nothing of the sort for shape 1's `PATCH /users/:id`.
Story 1.2 fixes it as a **partial merge**: only the S1 scalar keys present in
the body change; omitted keys are untouched; `null` explicitly clears (subject
to the birthday-pair rule). This matches the current `EditUserAction`
(`if (dto.x !== undefined) patch.x = dto.x`) and `um-edit-01` / `04` Test 2.

### Response body

The `PATCH` response is the plain `toUserResponse` shape (whole-row spread),
**not** the `{ data, canEdit }` envelope — only `GET /users/:id` returns the
CAP-3 envelope (`access-control-adoption/README.md` "Response-body scope",
`um-photo` README decision 9). The follow-up `GET` in `um-edit-01` asserts the
envelope; `canEdit` is the `profile:identity` `'write'` dual-gate hint — `true`
for a reporting-line / PP viewer (`canAccessSection(v,'profile:identity',t)` →
`write`, plus the `DEFAULT_PERMISSIONS` feature half), `false` for Self /
colleague (`canAccessSection(v,'profile:identity',t)` → `read`, which the
feature half cannot widen).

### One "produce the new state" call site (AD-11 / Epic 3 hook)

The edit path stays a single call site —
`EditUserAction.execute` → `UserService.update(id, patch)` — so Epic 3
Story 3.1's `position_change` `UserEvents` hook (AD-11 pattern, written
synchronously in the same transaction as the row update) attaches there
cleanly, exactly as Story 1.1's import attaches `joined_company`. No `um-edit-*`
scenario asserts the hook (that is Epic 3's `um-ct-*`), but none may fork the
write into multiple update paths that Epic 3 would then have to hook
separately.

### `um-edit-*` in-scenario decisions — confirm at approval

Each is the author's most docs/precedent-consistent pick for a point the sources
leave open; each is written as the expected outcome in the file that depends on
it and needs human confirmation at the AD-1 stage-1 gate.

1. **`PATCH /users/:id` is a partial merge**, not full-replace (rationale
   above). *(`um-edit-01`, `um-edit-04` Test 2)*
2. **An empty / no-op `PATCH` body → `200`**, echoing current state — not a
   `400`. No `updatedAt` column means a no-op is invisible anyway; punishing a
   client that re-submits a stripped form adds no safety. Rejected alternative:
   `400 "no editable fields"`. *(`um-edit-07`)*
3. **`workEmail` / `ttId` conflict → whole write rolled back (`409`)** — a
   sibling field in the same body is **not** applied, and the row the write
   collided with is untouched. Matches the import writer and epics.md Story 1.2
   second AC. *(`um-edit-03`, `um-edit-04`)*
4. **`null` vs `null` is not a uniqueness conflict** for `ttId` (nor for a
   nullable `workEmail`, though `workEmail` is non-null in practice).
   *(`um-edit-04` Test 2)*
5. **Org fields (`manager` / `reportsToUserId` / `managerId`, `peoplePartner` /
   `peoplePartnerId`, `department` / `departmentId`) → whole DTO `400`,
   explicit** — not silently stripped. Requires adding `@IsEmpty()` to
   `UpdateUserDto` for those keys (today they are absent → `whitelist` strips
   them → the request `200`s on the rest). Shared with `umac-08`. §3.2 fn 1.
   *(`um-edit-05`)*
6. **Technical fields (`photo`, `isActive`, `employmentStatus`, `customFields`,
   `id`, `createdAt`, `createdBy`) → `400`.** `photo` / `isActive` / `id` /
   `createdAt` / `createdBy` are already `@IsEmpty()`; `employmentStatus` and
   `customFields` must be added (their own surfaces are Epic 5 and the S16
   route). *(`um-edit-06`, cross-ref `um-photo-09` Test 1)*
7. **`birthDay` / `birthMonth` — both-or-neither on edit.** A `PATCH` that would
   leave exactly one non-null → `400`; setting or clearing both → `200`;
   changing one half while the pair is already whole → `200`. Enforced in
   `UpdateUserDto` / `EditUserAction` (no DB CHECK exists today). Consistent
   with the import writer's "never a half-pair" and the schema note "both null
   together or both set together". *(`um-edit-08`)*
8. **`workEmail` normalization (`trim().toLowerCase()`, DEC-UM-007) runs before
   the uniqueness check** on the edit path, as on the import path — a value that
   collides only once normalized is still `409`. The DTO already
   `@Transform`s `workEmail`; the scenario pins the ordering. *(`um-edit-02`)*
9. **`companyJoinDate` and `ttId` remain in the editable set** (matching the
   current `UpdateUserDto`) — `companyJoinDate` as an HR correction,
   `ttId` with its uniqueness rule (`um-edit-04`). Flagged for confirmation:
   if Product wants `companyJoinDate` / `ttId` off the S1 edit surface it is a
   DTO change and `um-edit-04` narrows.

## Scope split with Epic 0

*Who* may call `PUT /users/:id/photo` is asserted canonically against the **real
`AccessControlFacade`** in `access-control-adoption/umac-09` (Self-only) and
`umac-05` (unresolved session / non-resolvable target). The `um-photo-*` files
here re-state that expectation from the **feature-story side** so the Story 1.3
suite is self-contained, and pin the semantic Epic 0's umac-09 also settles: the
Self check is a pure **identity comparison** (`viewer id == target id`), **not** a
functional-permission check — there is **no `user-management:upload-photo`
permission key** (Open Decision vi) and Story 1.3 does **not** depend on the
`user-management:edit` kernel seed. `um-photo-01`/`02`/`08`/`09` are the
feature-owned data-correctness / real-storage cases with no Epic 0 twin.

## Canonical personas

From the **seeded population import** (Story 1.1). There is no `POST /users`.
Reconcile against [../README.md](../README.md#canonical-personas).

| Persona | Role in `um-photo-*` |
| --- | --- |
| **Alice** | Seeded employee. **Self** — the only actor entitled to write her own photo. Reports to Bob; assigned PP Paula. |
| **Bob** | Alice's **direct** Unit Manager (reporting-line `write` on Alice's S1 scalars via the umac-07 dual gate) — used to show that S1 write access does **not** extend to the photo. |
| **Paula** | Alice's assigned People Partner — second non-Self actor. |
| **Eve** | Authenticated seeded employee, no edges to Alice — colleague-floor non-Self actor. |

**Token convention.** Self-only is load-bearing for this cluster (unlike
`um-pf-*`, where entitlement is fully deferred), so the header resolves to a
**real seeded UUID**: `Bearer <token:<aliceId>>`, `Bearer <token:<bobId>>`, etc.
Stage 2 seeds real `User` rows (and, for Bob, a real `direct` `Relationship`
Alice→Bob) via Prisma and threads the returned ids;
`<aliceId>` is never a hardcoded literal. `""` = unauthenticated.

## Object-storage contract (Story 1.3 deliverable — AD-15)

- **Real port, real adapter.** `PUT /users/:id/photo` stores the uploaded bytes
  through a **real** object-storage port + adapter — the existing
  `src/storage/` `ObjectStoragePort` + `S3StorageAdapter` + LocalStack precedent
  (`domain-driven-design.md` §"Fakes, mocks, and stubs"). A fixture fake standing
  in for photo storage at the port boundary does **not** make Story 1.3 done and
  is **not** its completion path. The story reuses `storage`'s exported
  `StoreObjectAction` (AD-2 entry-point rule) — no parallel port is added.
- **Key naming.** `photos/<userId>/<uuidv7>` — one immutable key per upload,
  never overwritten. `User.photo` (nullable string) holds exactly one reference
  (the adapter's returned URL) at a time.
- **Write ordering (settled in-scenario — see below).** Object first, then row.
- **Real bucket via env** — `AWS_S3_BUCKET` / `AWS_REGION` / `AWS_ENDPOINT_URL`
  (LocalStack for local/CI, real S3 in prod). No dev-infra container is added to
  compose; LocalStack is already in the compose stack for `src/storage/`.

## Decisions made in-scenario — confirm at approval

Every item below is the author's most docs/precedent-consistent pick for a point
the sources leave open. Each is written as the expected outcome in the files that
depend on it and **needs human confirmation at the AD-1 stage-1 gate.**

1. **Self-only is an identity check, returns `403` for everyone else.**
   `feature === UPLOAD_PHOTO` → the rebound `AccessControlPort.isAllowedForTarget`
   returns `viewerId === targetUserId` — **no** facade `isAllowed` /
   `canAccessSection` call, **no** `user-management:upload-photo` key (Open
   Decision vi), **no** dependency on the `user-management:edit` seed. A
   reporting-line manager or PP who can write Alice's S1 scalars through the
   umac-07 dual gate is still `403` on her photo. Mirrors `umac-09`. The
   controller's interim `@RequireFeatureForTarget('user-management:upload-photo')`
   is replaced by this rule in the Epic 0 port rebind, not by a new decorator.
   *(`um-photo-03`)*

2. **Non-resolvable / inactive target with a real session → `403`, not `404`.**
   Self-only means `viewer id == target id`; a syntactically valid id matching no
   active `User` can never equal the caller's own resolved active id, so the
   identity check fails → `403`. No existence distinction (the "leak-free 404"
   convention was withdrawn 2026-09-01 for `/users/:id` routes — `umac-05`).
   *(`um-photo-05`)*

3. **Max file size — 5 MiB (5 242 880 bytes).** A profile avatar, not a document
   store. Enforced as a `FileInterceptor` `limits.fileSize` so an over-limit body
   is rejected before it is fully buffered. Over limit → `400`, nothing stored,
   `User.photo` unchanged. *(`um-photo-06`)*

4. **Accepted MIME types — `image/jpeg`, `image/png`, `image/webp`.** The three
   web-safe raster formats every target browser renders. Excludes `image/svg+xml`
   (script-injection vector), `image/gif` (avatar animation is unwanted), and
   `image/heic`/`image/heif` (no browser support). Validated against the multipart
   part's declared `Content-Type`; a magic-byte sniff of the buffer is
   **recommended** as defense-in-depth (a renamed non-image with a spoofed
   `Content-Type` should still be rejected) and is flagged for the implementer.
   Any other / missing type → `400`. *(`um-photo-06`)*

5. **Empty / missing file → `400`.** No multipart `photo` part, a `photo` part
   with a zero-length body, or an empty request body → `400` with a leak-free
   message. The handler already rejects a missing part; this extends it to a
   zero-byte buffer. *(`um-photo-06`)*

6. **Object-vs-row write ordering — object first, then row; no synchronous
   compensation.**
   - `StoreObjectAction.execute('photos/<id>/<uuidv7>', bytes, contentType)`
     runs first. On failure → the request fails (decision 7) and the row update
     never runs → `User.photo` is untouched. No dangling reference.
   - Only on a successful `put` is `User.photo` updated to the returned
     reference.
   - If the `put` succeeds but the row `UPDATE` then fails, an **orphan object**
     exists but `User.photo` still points at the previous valid reference (or
     `null`). The API never exposes a half-applied state (a `photo` string that
     resolves to a key that was never written). The reverse order would do
     exactly that and is rejected.
   - No cross-system transaction is attempted (the object store and Postgres
     can't share one); the compensation is "orphan object, reclaimed later"
     (decision 8), chosen as proportionate over a two-phase protocol.
   This matches the current `upload-user-photo.action.ts` sequencing.
   *(`um-photo-02`, `um-photo-07`)*

7. **Object store unreachable → `503 Service Unavailable`.** The sources don't
   specify a code. `503` signals a transient dependency outage that invites
   retry, distinct from `502` (a malformed upstream *response* — not what a
   connection failure/timeout is). `User.photo` is **not** modified (decision 6
   ordering). NFR-3 ("integration failures degrade gracefully"). Flagged: if
   Product prefers `502`, it is a one-line change. *(`um-photo-07`)*

8. **Orphan-object cleanup on replace is out of Story 1.3's runtime scope.** On
   replace, the new object is written under a fresh key and the row is
   re-pointed; the previous object is left in the bucket as a harmless orphan.
   Reclamation is a documented follow-up — a scheduled sweep that lists
   `photos/<userId>/` and deletes every key `!= User.photo`, or a bucket
   lifecycle rule — **not** built here. No `delete` verb is added to
   `ObjectStoragePort` in this story (the precedent port has only `put`; a
   synchronous delete that fails must not fail the user's request, and a
   best-effort fire-and-forget delete is an un-assertable side effect). Flagged:
   if Product wants immediate deletion, that is a follow-up story adding
   `ObjectStoragePort.delete` + its own scenario. *(`um-photo-02`)*

9. **Upload response body is the plain `toUserResponse` shape, not the
   `{ data, canEdit }` envelope.** Per `access-control-adoption/README.md`
   "Response-body scope", only `GET /users/:id` returns the CAP-3 envelope;
   `PUT /users/:id/photo` keeps the shared `toUserResponse` body, on which
   `photo` is a non-null string after a successful upload. The follow-up
   `GET /users/:id` **does** return `{ data, canEdit }` and the new `photo` is
   at `data.photo`. *(`um-photo-01`, `um-photo-02`)*

10. **`canEdit` staying `false` for Alice viewing her own card does not
    contradict her being able to upload her photo.** `canEdit` is the S1
    *scalar-field* dual-gate hint (S1 is `read`, not `write`, for the `self`
    audience — `umac-07` Test 4). Photo is a separate Self-only capability with
    no hint field today. The `um-photo-01` follow-up read asserts
    `data.photo` changed and does not assert anything about `canEdit`.
    *(`um-photo-01`)*

11. **`PUT /users/:id/photo` touches only `User.photo`.** No other S1 field is
    read from or written by the multipart handler; there is no `updatedAt` column
    (`epic-1-context.md` — no named consumer). Conversely `PATCH /users/:id`
    cannot write `photo`: `UpdateUserDto.photo` is `@IsEmpty()`, so a `PATCH`
    body carrying `photo` is rejected `400` before any write. *(`um-photo-09`)*

## Files

### `um-edit-*` — Story 1.2 (`PATCH /users/:id` data correctness)

| File | actor → request → outcome | Trace |
| --- | --- | --- |
| `um-edit-01-entitled-actor-edits-identity-fields.md` | Bob (entitled reporting-line editor) `PATCH /users/<aliceId>` `position`/`country`/`city`/`workPhone` → `200`, partial merge; follow-up `GET` → `{ data, canEdit: true }` reflecting them | §3.2 S1 · api-conventions shape 1 · CAP-3 envelope · Story 1.2 · supersedes `um-pf-01` |
| `um-edit-02-workemail-normalized-before-uniqueness-check.md` | Bob `PATCH` Alice `workEmail` with stray case/space → stored normalized; `PATCH` to a differently-cased in-use address → `409` (normalize precedes the check) | DEC-UM-007 · database-schema §User |
| `um-edit-03-duplicate-workemail-rejected-wholesale.md` | Bob `PATCH` `{ position, workEmail: <Colin's> }` → `409`, **both** unchanged; Colin's row untouched | database-schema `workEmail` unique · Story 1.2 2nd AC · supersedes `um-pf-03` |
| `um-edit-04-duplicate-ttid-rejected-wholesale.md` | Bob `PATCH` `{ workPhone, ttId: <Colin's> }` → `409` wholesale; unrelated edit while both rows' `ttId` null → `200` (null-vs-null OK) | database-schema `ttId` unique · AD-13 · supersedes `um-pf-04` |
| `um-edit-05-org-fields-in-body-rejected.md` | Bob (fully entitled) `PATCH` body with `managerId` / `peoplePartnerId` / `departmentId` (+ bare-name aliases) → whole DTO `400`; no relationship/journal change | §3.2 fn 1 · access-control.md §3.3 · §2.1/AD-10 · cross-ref `umac-08` |
| `um-edit-06-forbidden-technical-fields-rejected.md` | Bob `PATCH` body with `photo` / `isActive` / `employmentStatus` / `customFields` / `id` / `createdAt` / `createdBy` → `400` each; nothing written | Story 1.2 · Epic 1 context (AD-16) · api-conventions · cross-ref `um-photo-09` T1 |
| `um-edit-07-empty-or-no-op-patch.md` | Bob `PATCH` `{}` / already-current values → `200` no-op (in-scenario decision; rejected alt `400`) | api-conventions shape 1 · test-cases/README (define where silent) |
| `um-edit-08-birthday-pair-both-or-neither.md` | Bob `PATCH` `{ birthDay }` alone → `400`; `{ birthDay, birthMonth }` → `200`; one half while pair whole → `200`; half-clear → `400` | §3.2 S1 · database-schema (pair invariant) · DEC incomplete-pair · `um-seed-06` |

### `um-photo-*` — Story 1.3 (`PUT /users/:id/photo`)

| File | actor → request → outcome | Trace |
| --- | --- | --- |
| `um-photo-01-self-first-upload.md` | Alice (`photo: null`) `PUT /users/<aliceId>/photo` (image) → `200`, non-null `photo`; `GET` shows it at `data.photo` | FR-9 · §3.2 S1 · AD-15 · Story 1.3 |
| `um-photo-02-self-replace.md` | Alice (already has a photo) uploads a new one → `200`, `photo` reference changes; `GET` reflects the new one; old object orphaned (swept later) | FR-9 · AD-15 · Story 1.3 · decisions 6/8 |
| `um-photo-03-non-self-denied.md` | Bob (Alice's manager) and Eve (colleague) `PUT /users/<aliceId>/photo` → `403`; Alice's `photo` unchanged | FR-9 · §3.2 (Self exclusive) · Open Decision v/vi · umac-09 · decision 1 |
| `um-photo-04-unauthenticated.md` | No / malformed token `PUT /users/<aliceId>/photo` → `401`, nothing stored | global 401 rule · access-control.md denial conventions |
| `um-photo-05-target-not-active-user.md` | Alice (real session) `PUT /users/<non-resolvable-uuid>/photo` → `403` (viewer ≠ target); no object stored | Open Decision v · umac-05 · decision 2 |
| `um-photo-06-validation.md` | Alice `PUT .../photo` with a non-image type / >5 MiB / missing part / zero-byte part → `400`; nothing stored, `photo` unchanged | api-conventions.md (multipart) · AD-15 · decisions 3/4/5 |
| `um-photo-07-storage-failure.md` | Object store unreachable during a Self upload → `503`; `User.photo` NOT changed (no half-apply) | NFR-3 · AD-15 · decisions 6/7 |
| `um-photo-08-real-storage-assertion.md` | Stage-2 assertion: the Self upload hits **real LocalStack** (no fake at the port), the object lands in the bucket and is retrievable | AD-15 · testing-strategy.md "done means real" · AD-3 |
| `um-photo-09-patch-never-touches-photo.md` | `PATCH /users/<aliceId>` with a `photo` field → `400`; and a photo upload leaves every other S1 field unchanged | FR-9 · §3.2 fn 1 · Story 1.2 cross-check · decision 11 |
