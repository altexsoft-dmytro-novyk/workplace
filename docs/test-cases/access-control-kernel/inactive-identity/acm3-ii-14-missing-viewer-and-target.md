# ACM3-II-14 · A missing viewer or target id derives no audience

**Trace:**

- SPEC [CAP-1](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — "The kernel resolves **inactive or missing** viewers, targets, Reporting bridges, and PP endpoints without deriving access through invalid identity paths ... **inactive or missing** viewers and targets produce an empty audience `Set`, never Self and never the Colleague floor."
- [stories.yaml `ACM-3-scenarios`](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/stories.yaml) — "Author only CAP-1 scenarios for **inactive or missing** viewers, targets, Reporting bridges, and PP endpoints".
- [access-control.md § Audience columns](../../../architecture/access-control.md#audience-columns-32) — Self row: "An **unconfirmed** viewer or target yields an empty audience `Set` — never Self, never the Colleague floor." Unconfirmed covers absent as well as inactive.
- [access-control.md § Fail-closed, always (AD-11, AD-12)](../../../architecture/access-control.md#fail-closed-always-ad-11-ad-12).
- [testing-strategy.md § Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp).

## Scenario

**Given** Xenia is an active viewer and the active direct manager of Yaroslav,
and a well-formed id that matches **no `users` row at all** — an id from a
deleted record, a stale client cache, or a caller's typo.

**When** the missing id is used first as the viewer over a real target, and
then as one target among real ones under a real viewer.

**Then** both produce empty audience `Set`s. A viewer who cannot be confirmed
to exist fails validation exactly as a deactivated one does, so Yaroslav's
entry is empty. A target that cannot be confirmed to exist is likewise empty —
and, critically, **it still gets a map key**: the facade contract is that every
requested id comes back as a key, so a missing target is answered with an empty
`Set`, never by omitting the entry. Omission would force every caller to
distinguish "no audience" from "not in the response" on their own, which is the
ambiguity the map contract exists to remove.

**Preconditions:** [fixture](../README.md#kernel-fixture--cap-1-completion-this-suite); Xenia
active, `reportsToUserId` null; Yaroslav active, `direct` report of Xenia; the
missing id is generated in the same id format the fixture uses and is asserted
to have no `users` row before the call, so the test cannot pass because of a
collision.

**Current vs required (code-verified gap this scenario closes).** Neither the
resolver nor the adapter looks a user up by id: the resolver checks only
`id !== viewerId`, and the adapter's queries join `users` while filtering by
relationship rows, so an id with no rows simply produces no matches. The
result is that **absence and "no qualifying relationship" are the same input**
to `AudienceResolverService.resolve`, which then applies `labels.size === 0` →
`'colleague'`. So today:

- a **missing viewer** over an active target yields `Set {'colleague'}` — the
  resolver grants an authenticated-employee floor to an id that belongs to no
  employee;
- a **missing target** under an active viewer yields `Set {'colleague'}` — a
  colleague-level audience over a record that does not exist.

Required in both cases: an empty `Set`. This is a **narrowing**, and it is the
one identity case that no existing ACM-3 scenario touches: `ACM3-II-01` and
`ACM3-II-03` both cover `isActive = false` on a row that exists. Approving it
commits Stage 3 to an actual existence check on both parties — the same lookup
that CAP-1's "confirmed present and active" wording already requires for Self,
applied to its other half.

## Test 1 — missing viewer over a real target

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<missing-id>', employeeIds: ['<yaroslav-id>'] }
  ```
- **expectedResult:**
  ```ts
  Map {
    '<yaroslav-id>' => Set {}   // empty — not colleague
  }
  ```
  Absent members: no `'colleague'`, no `'reporting'`.

## Test 2 — missing target alongside a real one

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<xenia-id>', employeeIds: ['<missing-id>', '<yaroslav-id>'] }
  ```
- **expectedResult:**
  ```ts
  Map {
    '<missing-id>'  => Set {},              // present as a key, empty as a value
    '<yaroslav-id>' => Set {'reporting'},   // unaffected control target in the same call
  }
  ```
  Assert `audiences.has('<missing-id>')` is `true` **and** the set is empty.
  Asserting only the empty set would also pass against an implementation that
  dropped the key, since `audiences.get(missing)` would be `undefined` and a
  loose check could read that as "no audiences".

## Test 3 — missing viewer requesting the missing viewer

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<missing-id>', employeeIds: ['<missing-id>'] }
  ```
- **expectedResult:**
  ```ts
  Map {
    '<missing-id>' => Set {}   // empty — not self, even though viewerId === targetEmployeeId
  }
  ```
  The `ACM3-II-01` Test 2 assertion applied to absence rather than
  deactivation: `viewerId === targetEmployeeId` is not by itself a confirmed
  identity, so it cannot produce Self.
