# ACM1R-FB-28 · An approved fourth permission and later administrator attachments survive a rerun

**Trace:**

- [ACM-1 Stage-1 coverage audit](../../../../_bmad-output/implementation-artifacts/access-control/acm-1-stage1-coverage-audit.md) — behavioral rows "An approved fourth permission survives a rerun" and "Later administrator attachments remain distinct and are never deleted or rewritten", both named in `ACM-1-scenarios.invoke_dev_with`.
- SPEC Constraints — "Reruns ... never delete or rewrite administrator-added rows, grants, or attachments; an approved fourth permission or grant survives."
- SPEC [CAP-3](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — "later administrator attachments remain distinct."
- FR-AMD-1 [Seed-owned drift disposition](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — `PolicyPermissions`/non-canonical pairs: "preserve — an approved fourth permission granted to `hr-admin` survives"; `UserPolicies`/later `hr-admin` attachments for other users: "preserve — they are not bootstrap state".

## Scenario

**Given** a fully bootstrapped database to which an administrator has since
added, under a later approved catalog contract:

1. a fourth `Permissions` row with a non-canonical key, e.g.
   `user-management:export`;
2. a `PolicyPermissions` grant of that fourth permission to the **canonical FR
   `hr-admin` policy**;
3. an `hr-admin` `UserPolicies` attachment for a second active administrator,
   **Nadia**, who is not the root.

**When** `npm run db:bootstrap:access-control` runs again with unchanged
configuration.

**Then** the run exits zero and all three additions survive exactly as they
stand. `Permissions` holds four rows, `PolicyPermissions` four, `UserPolicies`
two. The seed deletes nothing, rewrites nothing, and reports none of it as
drift. The singleton still names the root and the canonical policy, unchanged.

The bootstrap's ownership is a **set of specific rows**, not the contents of
these tables. Its contract is "the three canonical keys, the FR `hr-admin`
policy, their three canonical grant pairs, the normalized root attachment, and
the singleton" — everything else in the same tables is out of its scope by
construction. A rerun that pruned back to the canonical set would revoke
approved access on every deployment, which is why the drift table dispositions
non-canonical pairs and other users' attachments as *preserve* rather than
leaving them unstated.

Addition 2 is the sharper half: it grants a non-canonical permission to the very
policy the seed owns. A rerun that verifies its grants by comparing the policy's
full grant set against the canonical three would delete it. The correct check is
that the three canonical pairs are **present**, not that they are the only ones.

**Preconditions:** fully bootstrapped, undrifted database; the three additions
applied; all four `Permissions` ids, all four grant pairs, both attachment
pairs, and the singleton's three columns captured before the rerun.

## Test — a rerun over administrator additions changes nothing

- **entrypoint:** `npm run db:bootstrap:access-control`
- **preconditionState:**
  ```sql
  SELECT count(*) FROM "Permissions";        -- 4
  SELECT count(*) FROM "PolicyPermissions";  -- 4
  SELECT count(*) FROM "UserPolicies";       -- 2
  ```
- **expectedDatabaseState:** the run exits zero, and afterwards
  ```sql
  SELECT count(*) FROM "Permissions";                                    -- 4
  SELECT count(*) FROM "Permissions" WHERE key = 'user-management:export'; -- 1, same id
  SELECT count(*) FROM "PolicyPermissions";                              -- 4
  SELECT count(*) FROM "UserPolicies";                                   -- 2
  SELECT "userId" FROM "UserPolicies" ORDER BY "userId";                 -- :nadiaId and :rootId
  SELECT "normalizedRootEmail", "rootUserId", "policyId" FROM "AccessControlBootstrap";
  -- all three unchanged
  ```
  and every captured id is identical to its pre-run value
