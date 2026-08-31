# ACM1R-FB-21 · With no singleton, an attachment is adopted only when it already belongs to the located root

**Trace:**

- [ACM-1 Stage-1 coverage audit](../../../../_bmad-output/implementation-artifacts/access-control/acm-1-stage1-coverage-audit.md) — behavioral rows "Absent-singleton adoption — an existing attachment **only** when it already belongs to the located root" and "attachments belonging to anyone else preserved, never adopted or transferred".
- FR-AMD-1 [Provenance when the singleton is absent](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — "Exactly one `hr-admin` attachment whose `userId` **is** the located root → **Adopt** it as bootstrap provenance and write the singleton." / "`hr-admin` attachments exist but **none** belongs to the located root → **Do not adopt and do not transfer.** Create the located root's own attachment and write the singleton. The pre-existing attachments remain non-bootstrap administrator state and are preserved."
- SPEC [CAP-3](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — "an existing attachment only when it already belongs to the located root; attachments belonging to anyone else are neither adopted nor transferred."

## Scenario A — the existing attachment is the root's

**Given** a migrated database with the CAP-8 root User active, **no**
`AccessControlBootstrap` row, a pre-existing FR `hr-admin` policy, and exactly
one `UserPolicies` row attaching **the located root** to that policy.

**When** `npm run db:bootstrap:access-control` runs.

**Then** that attachment is adopted as bootstrap provenance: no second
attachment is created, `UserPolicies` still holds exactly one row, and the
singleton records that root and that policy.

## Scenario B — the existing attachments belong to other people

**Given** the same state, except the pre-existing `hr-admin` attachments belong
to two other active administrators, **Nadia** and **Piotr**, and none belongs to
the located root.

**When** `npm run db:bootstrap:access-control` runs.

**Then** neither existing attachment is adopted, transferred, reassigned, or
deleted. The bootstrap creates the located root's **own** attachment alongside
them and writes the singleton pointing at the root. `UserPolicies` ends with
three rows: Nadia's, Piotr's, and the root's. The singleton names only the
root's.

The temptation this contract closes is treating "an `hr-admin` attachment
exists" as "bootstrap provenance exists". It is not: an administrator granting
the role to a colleague is ordinary, approved use of the system, and rewriting
one of those rows to point at the configured root would silently revoke a real
person's access. "More than one candidate attachment for the root is
impossible" holds because `UserPolicies` is keyed `(userId, policyId)` — that
key is what makes "the root's attachment" a single unambiguous row, not a
selection problem.

**Preconditions:** migrated database; CAP-8 root User active;
`AccessControlBootstrap` empty; a pre-existing FR `hr-admin` policy; the
attachment rows described per scenario, with their `(userId, policyId)` pairs
captured before the run.

## Test — adopt the root's own, preserve everyone else's

- **entrypoint:** `npm run db:bootstrap:access-control`
- **preconditionState:**
  ```sql
  SELECT count(*) FROM "AccessControlBootstrap";  -- 0
  SELECT "userId" FROM "UserPolicies";            -- A: [:rootId]  |  B: [:nadiaId, :piotrId]
  ```
- **expectedDatabaseState:**
  - **A:**
    ```sql
    SELECT count(*) FROM "UserPolicies";              -- 1
    SELECT "userId" FROM "UserPolicies";              -- :rootId (the same row, not recreated)
    SELECT "rootUserId" FROM "AccessControlBootstrap"; -- :rootId
    ```
  - **B:**
    ```sql
    SELECT count(*) FROM "UserPolicies";                       -- 3
    SELECT "userId" FROM "UserPolicies" ORDER BY "userId";     -- :nadiaId, :piotrId, :rootId all present
    SELECT "rootUserId" FROM "AccessControlBootstrap";         -- :rootId only
    ```
    and Nadia's and Piotr's rows are byte-identical to their captured state
