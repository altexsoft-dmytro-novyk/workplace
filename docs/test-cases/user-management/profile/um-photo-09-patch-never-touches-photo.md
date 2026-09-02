# UM-PHOTO-09 · `PATCH /users/:id` never writes `photo`, and a photo upload never writes other S1 fields

**Trace:** PRD FR-9 ("`photo` needs a dedicated multipart route… separate from the scalar `PATCH /users/:id`") · `api-conventions.md` ("Don't fold photo into `PATCH /users/:id`") · `access-control.md` §3.2 fn 1 (S1 derived/other fields are governed per-audience; photo is Self's alone) · `epic-1-context.md` ("`UpdateUserDto` has no such properties and `EditUserAction` rejects them (tested)") · Story 1.2 cross-check · epics.md Story 1.3

> **Scope (v1.5).** Two halves of one boundary — the photo write path and the
> scalar write path do not bleed into each other. `UpdateUserDto.photo` is
> `@IsEmpty()` (structurally excluded, not merely whitelist-stripped — see the
> DTO comment), so a `PATCH` body carrying `photo` is a validation error, not a
> silent no-op. Entitlement for `PATCH` is Epic 0's (`umac-07`); this file uses a
> real `Bearer <token:<aliceId>>` for the photo half and, for the `PATCH` half,
> the seeded manager Bob with a real `direct` edge so the request reaches the DTO
> validator rather than being denied first — but the assertion is purely about
> which fields move.

## Scenario

**Given** Alice, a seeded employee with `photo: null`, `position: "Engineer"`,
`city: "Warsaw"`; Bob, her direct Unit Manager.

**When** (a) Bob submits `PATCH /users/<aliceId>` with a body that includes a
`photo` value; and (b) Alice submits a valid `PUT /users/<aliceId>/photo`.

**Then**:

- (a) The `PATCH` is rejected **`400`** on `photo` being a forbidden property;
  **no** field is written (the whole DTO is rejected, per the wholesale-rejection
  convention) — `position`, `city`, and `photo` are all unchanged.
- (b) The photo upload returns `200` and changes **only** `User.photo`;
  `firstName`, `lastName`, `position`, `country`, `city`, `workEmail`,
  `workPhone`, `birthDay`, `birthMonth`, `companyJoinDate`, `ttId`, `isActive`
  are byte-for-byte unchanged. (There is no `updatedAt` column to check —
  `epic-1-context.md`.)

**Preconditions:** [fixture](README.md#canonical-personas); Alice seeded with
`photo: null`, `position: "Engineer"`, `city: "Warsaw"`; a real `Relationship`
Alice→Bob `type='direct'`; LocalStack S3 reachable.

## Test

- **Test 1 — `PATCH` carrying `photo` → 400, nothing written**
  - **inputURL:** `PATCH /users/<aliceId>`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:<bobId>>" },
      "body": { "position": "Senior Engineer", "photo": "https://evil.example/x.png" }
    }
    ```
  - **expectedResult:** `400` (forbidden property `photo`); a follow-up
    `GET /users/<aliceId>` shows `data.position` still `"Engineer"` and
    `data.photo` absent/`null` — the sibling `position` change did **not** land
    either.
- **Test 2 — photo upload leaves every other S1 field alone**
  - **inputURL:** `GET /users/<aliceId>` with `Bearer <token:<aliceId>>` — capture `data` as the "before" snapshot.
  - **inputURL:** `PUT /users/<aliceId>/photo` with `Bearer <token:<aliceId>>`,
    `multipart` `photo=<valid JPEG>` → `200`, `body.photo` non-null.
  - **inputURL:** `GET /users/<aliceId>` with `Bearer <token:<aliceId>>` — "after" snapshot.
  - **expectedResult:** `after` equals `before` on every S1 field **except**
    `photo`, which went from absent/`null` to the new reference. Stage 2 may also
    read the row directly via Prisma to confirm `ttId` / `isActive` (not on the
    S1 card) are unchanged.
