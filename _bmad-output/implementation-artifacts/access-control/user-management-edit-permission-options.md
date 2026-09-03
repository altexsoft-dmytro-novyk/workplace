# `user-management:edit` — who holds it?

> **SUPERSEDED 2026-09-04 (SCP `sprint-change-proposal-2026-09-04-section-access-consolidation.md`,
> Dmytro + Winston).** Variant A is reversed. The identity card **is** a §2.2
> dual gate: `isAllowed(viewer, 'profile:identity:write')` **AND**
> `canAccessSection(viewer, 'profile:identity', target) === 'write'`. The
> feature half is satisfied by the code constant `DEFAULT_PERMISSIONS` — the
> per-person section-write keys every active employee implicitly holds — union'd
> with the explicit FR grant chain (SCP §2 D1/D2). This is **Option 2 below,
> realised as a code baseline rather than a DB `employee` policy row** (no
> policy row, no `UserPolicies` attachment, no seed/bootstrap change). The
> audience half still does all the narrowing; a holder with only
> `colleague`/`self` audience cannot edit. Carried by Platform Epic 4 Story 4.1.
> The Variant A write-up and Options 1–4 stay as the historical record of how
> the decision moved.

> **RESOLVED 2026-09-02 (Dmytro) — Variant A: there is NO separate functional
> permission for the identity card.** *(Superseded 2026-09-04 — see the banner
> above.)* The whole gate on `GET /users/:id`
> `canEdit` and on `PATCH /users/:id` is `canAccessSection(viewer, 'S1',
> target) === 'write'` — i.e. the reporting-line manager or the assigned People
> Partner. §2.2's functional half is not applied to this section. No kernel-seed
> AD-1 sequence for `user-management:edit`; the string `user-management:edit`
> survives only as the adapter's routing key for the `PATCH` gate (mapping to
> the S1 write-access check, not to `isAllowed`). HR Admin can introduce a
> *narrower* FR grant later through the roles admin screen if finer control is
> ever needed (§2.3). This supersedes adoption Open Decision (i) option (a) for
> the identity-card section — the S9 career-timeline and other sections that
> §2.3 flags may still carry a functional layer; that is the FR-matrix draft's
> concern (`fr-permission-matrix-draft-2026-09-02.md`).
>
> The options analysis below is kept as the record of how the decision was
> reached. Options 1–4 and the "recommended Option 2" are HISTORICAL.

**Status:** decision doc for Dmytro. Prose only — no schema, no `seed.ts`, no
`approvals.yaml`, no code. **Not an AD-1 approval.**

**Date:** 2026-09-02
**Author:** Claude Code agent (autonomous run, `dn-um-implementation`)

---

## 1. What is already decided, and what is not

**Decided** (adoption SPEC Open Decision (i) = option (a), Dmytro, 2026-09-01):
Access Control adds the `user-management:edit` **functional permission** to the
Kernel bootstrap catalog and grants it, via a **new three-stage kernel-seed
AD-1 sequence** owned by the Architect in `spec-access-control-kernel-mvp`. The
adoption slice's write path (`UMAC-2` / Story 0.2) blocks on that sequence
reaching `stage-3-production`. Photo is **not** a separate key — it is covered by
`user-management:edit` (Open Decision (vi)); photo write is additionally
Self-only by identity (Open Decision (v)) and does not consult this permission.

**Not decided — this doc:** *which policy (or policies) receive the grant, i.e.
who holds `user-management:edit`.* The alignment proposal and the architect
handoff both say "catalog **+ grant**" without naming a grant target. The Kernel
seed sequence cannot be written until that target is fixed.

---

## 2. How the permission composes — the frame for every option

`PATCH /users/:id` (S1 identity card) is behind the **§2.2 dual gate**
(`access-control.md:163`, umac-07):

```
allow  ⇔  AccessControlFacade.isAllowed(viewer, 'user-management:edit') === true
     AND  AccessControlFacade.canAccessSection(viewer, 'S1', target)   === 'write'
```

The **section half is already the audience narrowing.** Per ACM-5 / CAP-5,
`canAccessSection(v, 'S1', t)` returns:

| viewer's audience over target | S1 result | can `PATCH`? |
| --- | --- | --- |
| `reporting` (reports-to / dept-mgmt line, transitive) | `write` | yes (if functional half holds) |
| `pp` (assigned People Partner + HR line) | `write` | yes (if functional half holds) |
| `self` | `read` | **no** — S1 scalars are read-only for Self; only the photo is Self-writable (umac-07 Test 4) |
| `colleague` | `read` | no |
| empty (unrelated / inactive) | `none` | no |
| `project` (PM/DM) | *matrix says `RW¹`, but ACM-5 does not ship project-line S1 write — deferred with all project-line audience resolution* | not yet |

So the **functional** half (`isAllowed`) is **not** the place to express "is a
manager / is a PP" — that is an **access-role** fact, the section half already
computes it, and `access-control.md:20-21` bars FR evaluation from reading
relationship rows or entering the AR hot path. The only question the functional
half answers is: **"is *editing employee identity cards* a function this
person's job includes at all?"**

Today the seeded FR catalog is exactly `user-management:create` /
`:deactivate` / `:list`, granted to the one `hr-admin` FR policy attached to the
root user (`access-control.md:51-58`, ACM-1). `isAllowed(anyone,
'user-management:edit')` is `false` for everyone, so `canEdit` is `false` on
every `GET /users/:id` and every `PATCH` dual gate fails its functional half.

---

## 3. What the requirements say about who edits S1

- **§3.2 matrix, S1 row:** `Self R (photo RW)` · `Reporting line RW¹` ·
  `Project line RW¹` · `PP RW¹` · `Colleague R`.
- **Footnote 1:** *manager, people partner, department* are shown in S1 but are
  **not writable through it** — separate operation, separate permission (§2.1).
  This narrows *which fields*, not *which actors*.
- There is **no functional-role gate** in §3.2 or §2.3 that narrows S1 scalar
  edit below the matrix cell. Any actor with a managerial/PP **data
  relationship** has S1 `RW`.
- **§2.3 / §2.2:** "Other parts of the organisation will need to use platform
  features for their own purposes ... without becoming managers or people
  partners and without a code change." Functional roles are the extension point.
- **`access-control.md:11`:** the changelog's team-drafted permission **defaults
  are a process follow-up** — "do not hard-code defaults until that confirmation
  is recorded." **Choosing an option here IS that recorded confirmation, for
  this one key.**

### S9 career-timeline precedent (DEC-UM-001)

S9 manual add/correct/delete is limited to **assigned PP + the employee's direct
Unit Manager only** — *narrower* than the S9 read cell (full manager line + PP).
Crucially, DEC-UM-001 implements that narrowing as a **§3.3 matrix / command
exception on the audience side** — "the actor needs **both** the runtime *edit
the career timeline* permission **and** the narrowed S9 write audience." The
*permission* "edit the career timeline" is **not** what does the narrowing; it is
held by the broad set and the **audience exception** cuts it down.

**Is S1 edit as narrow as S9?** **No.** §4.9 gives S9 an explicit narrower
workflow rule; §3.2 gives S1 a plain `RW` cell for the whole reporting line +
project line + PP with only the fn-1 *field* restriction. **S1 edit is broader
than S9** — the whole reporting line, not just the direct manager. So the S1
functional permission should follow the same shape as the S9 one: **held
broadly; narrowed by the section gate, not by holdership.**

---

## 4. The options

### Option 1 — grant to the `hr-admin` policy only *(minimal seed)*

- **Seed shape:** one `Permissions` row `user-management:edit`; one
  `PolicyPermissions` grant to the **existing** `hr-admin` FR policy. No new
  policy, no new `UserPolicies` attachment. Smallest possible change — identical
  pattern to the three keys ACM-1 already seeds.
- **Who holds it:** only holders of the `hr-admin` grant chain — today, the root
  user.
- **Composition:** functional half is `true` only for HR-Admin. But **HR-Admin
  has no relationship-derived audience** (`access-control.md:187`: "HR Admin ...
  has **no default data access**"), so `canAccessSection(hrAdmin, 'S1', anyone)`
  → `none` → the dual gate **denies even the root user**. A line manager (Bob)
  is not an HR-Admin, so the functional half denies **him** too.
- **Requirement satisfied:** none, in the near term. Directly contradicts §3.2
  S1 `RW` for the reporting line and PP. `PATCH /users/:id` stays effectively
  dead until (a) the grant is widened *and* (b) relationships exist.
- **Verdict:** reject as a standalone answer. It is really "keep the write path
  blocked" (adoption option (b)) wearing a seed's clothing.

### Option 2 — universal baseline FR role `employee` holds it *(recommended)*

- **Seed shape:** one new **seed/bootstrap-owned** FR `Policies` row
  (`targetRole = 'employee'`, `type = 'FR'`, `targetType = NULL`,
  `targetId = NULL`); one `Permissions` row `user-management:edit`; one
  `PolicyPermissions` grant of that key to the `employee` policy; and a
  `UserPolicies` attachment of the `employee` policy **to every active `User`**.
  The Kernel bootstrap backfills all existing active users; the **UM
  population-import writer** attaches it to each imported row going forward.
- **Who holds it:** every active employee.
- **Composition:** functional half is `true` for every active employee; the
  **section half is the sole discriminator** — `reporting` / `pp` → `write` →
  `PATCH` allowed; `self` / `colleague` → `read` → `canEdit = false`,
  `PATCH` → `403`; empty → `403`. This reproduces the §3.2 S1 matrix cell
  exactly (minus project-line, deferred everywhere).
- **Requirements satisfied:** §3.2 S1 `RW` for reporting line + PP; umac-07
  Test 1 (Bob edits Alice's `position` → `200`); Story 1.2's happy path;
  §2.3's "other org units get features without becoming managers" gets a real
  attachment point (the `employee` baseline is where a future §2.3 rollout hangs
  the broadly-held keys). Keeps FR/AR **type-separation** clean — no
  manager-detection in the FR tier.
- **Cost:** introduces the "baseline role attached to every user" concept (new,
  but small and inspectable — a real policy row per user, not an implicit
  evaluator floor); one `UserPolicies` row per user; **one cross-context seam**
  — the Kernel seed owns the `employee` policy + grant, the UM import writer
  owns the per-row attach (and the Kernel bootstrap owns the one-time backfill
  of existing rows). A later §2.3 default-grant rollout may reshape the
  `employee` role's permission set; the *shape* (a universal baseline role) is
  forward-compatible.
- **Rejected sub-variant:** "let the `isAllowed` evaluator treat a set of keys
  as held by every active user" — needs an Access Control **evaluator change**,
  which the adoption SPEC forbids ("no AC file/test/seed/migration change") and
  the Kernel MVP does not include. The attached-policy form is the only one
  expressible today.

### Option 3 — grant to `hr-admin` **and** to the `employee` baseline

- **Seed shape:** Option 2 plus a redundant `PolicyPermissions` grant to
  `hr-admin`.
- **Effect:** the root user is also an active `User` row and already receives
  the `employee` baseline, so the extra `hr-admin` grant changes **no**
  behaviour in the seeded system. It only documents "HR-Admin's configuration
  function includes card edits."
- **Verdict:** not worth the extra seed-owned row and the "two places grant this
  key" drift risk. If Dmytro wants the documentation value, fold it into a
  comment on the seed, not a second grant.

### Option 4 — dedicated `user-management-editor` FR role, attached on appointment

- **Seed shape:** one `Permissions` row + one FR `Policies` row
  (`targetRole = 'user-management-editor'`) + grant; **no** seed-time
  attachment. The org-relationship screen (Epic 4) attaches the role to a user
  when they are made someone's manager / PP, and detaches on
  reassignment / departure.
- **Composition:** functional half `true` only for appointed managers/PPs; the
  section half still narrows to the specific targets they manage.
- **Cost:** double bookkeeping — the appointment already writes the
  `Relationship` row the section gate reads; now it must also write and later
  revoke a `UserPolicies` row, kept in sync forever. This **re-encodes
  managerial status as FR data** — exactly the AR/FR coupling
  `access-control.md:20-21` forbids — and adds a revocation-sync burden
  (a missed detach = a stale grant, though the section gate still fails closed).
- **Verdict:** reject. The section gate already does this, correctly and
  without the sync burden.

---

## 5. Recommendation — Option 2

**S1 identity-card edit is a full reporting-line + PP `RW` cell with no
functional-role narrowing** (unlike S9, which §4.9 / DEC-UM-001 narrows on the
*audience* side, never by permission holdership), so the functional half of the
dual gate must never be the binding constraint for a legitimate editor — the
section gate should do all the narrowing. A **universal baseline `employee` FR
role** holding `user-management:edit` keeps FR/AR type-separation clean (no
manager-detection in the FR tier), reproduces the §3.2 matrix exactly, and gives
§2.3's "other org units use features without becoming managers" an actual home.
The one thing to get right is the **cross-context seam**: the Kernel seed
sequence owns the `employee` policy + grant + one-time backfill of existing
active users; the UM population-import writer owns attaching the `employee`
policy to each row it creates from then on.

Adopting Option 2 **is** the recorded §2.3 default-grant confirmation for this
one key (`access-control.md:11`) — please confirm that explicitly when you
approve, so the Kernel seed's Stage-1 scenario can cite it.

### Secondary flag while here — `canEdit` for `self`

`access-control.md:210` says `canEdit` "becomes `true` for `self` / `reporting`
/ `pp` viewers once ... seeded." That contradicts ACM-5 (S1 is `read` for Self)
and umac-07 Test 4 (Self `PATCH` of an S1 scalar → `403`). Under **every**
option above, a Self viewer's `canEdit` is `false` (section half returns
`read`). The doc line should read "`reporting` / `pp`" only. Worth a one-line
correction to `access-control.md` when the Kernel seed lands — no behaviour
change, the code (`IdentityCardAccessService.canEdit`) already ANDs the section
half.

---

## 6. What this unblocks once the Kernel seed reaches `stage-3-production`

| Blocked item | Where | How it unblocks |
| --- | --- | --- |
| `UMAC-2` write path (Story 0.2) | `spec-user-management-access-control-adoption` CAP-2 write | the dual gate's functional half can pass; `umac-07` stops being CONDITIONAL |
| `write-adoption.e2e-spec.ts` UMAC-07 reds | `test/user-management/access-control-adoption/` | Test 1 (granted reporting-line manager `PATCH` → `200`) has a real seeded grant instead of the per-test `fx.grantFunctionalRole` shim; Tests 3/4/5 negatives already exercise the section half |
| `write-adoption.e2e-spec.ts` UMAC-08 reds | same file | `UpdateUserDto` gains explicit `@IsEmpty()` on `manager`/`peoplePartner`/`department` (§3.2 fn 1) — Story 1.2's `um-edit-05` and Epic 0's `umac-08` share the assertion |
| Story 1.3 `um-photo-09` Test 1 | `test/user-management/epic-1/photo-v15.e2e-spec.ts` | `PATCH /users/:id` with a `photo` field → `400` needs the `AccessControlGuard` to pass first (an entitled actor), which needs `user-management:edit` seeded; the `@IsEmpty() photo` rejection itself already exists |
| Story 1.2 Stages 2-3 | `docs/test-cases/user-management/profile/um-edit-*` | data-correctness E2E for authorized `PATCH` can seed a really-entitled actor; Stage-1 scenarios are authored now and note this block |
| `canEdit: true` on `GET /users/:id` | `IdentityCardAccessService` | for `reporting` / `pp` viewers over an active target |

Story 1.2's **data-correctness** assertions that need no entitled actor
(`409` wholesale-reject on duplicate `workEmail`/`ttId`, read-back, DTO
rejections) do **not** depend on this seed and can be written red now.
