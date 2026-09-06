# ACM1R-FB-26 · Drift is dispositioned per field: restore, preserve, or fail before writes

> **Amended 2026-09-06 — PLAT-E4-S4.2a.** The canonical ACM-1 `hr-admin` set
> grew from three keys to **six**: the three original `user-management:*` keys
> plus `org:relationships:write`, `employee:departure:record`, and
> `profile:timeline:write` — the last a **known, deliberately accepted deviation
> from a NORMATIVE invariant** (AF-2, Dmytro Novyk, Product Owner, 2026-09-06).
> The full record, the live consumer of every key, and the dated AF-4 note that
> the ratified architecture text still says *"exactly three"* and contradicts
> this file, are in
> [`ACM1-FB-01`](./acm1-fb-01-three-canonical-permissions-seeded.md).
>
> **This file's numbers change:** the clean post-bootstrap snapshot `Permissions ×3` → **`×6`** and
> `PolicyPermissions ×3` → **`×6`**. The eight R/P/F dispositions themselves are
> unchanged — restore missing, preserve descriptive fields and generated ids,
> fail before writes on identity or authorization-bearing drift. The
> *"singleton's three columns"* is unrelated to the key count.

**Trace:**

- [ACM-1 Stage-1 coverage audit](../../../../_bmad-output/implementation-artifacts/access-control/acm-1-stage1-coverage-audit.md) — behavioral row "Per-field FR-AMD-1 drift table — restore missing owned rows, preserve descriptive fields and generated ids, fail before writes on identity/authorization-bearing drift".
- FR-AMD-1 [Seed-owned drift disposition](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — "'Conflicting drift' is defined per canonical row and field, not as one blanket rule", with the field-by-field table this contract enumerates.
- SPEC Constraints — "Reruns restore missing owned rows, fail before writes when an identity or authorization-bearing field differs, preserve descriptive fields and generated ids."
- [database-schema.md § Kernel MVP seed contract](../../../architecture/database-schema.md) — "Reruns non-destructively ensure the bootstrap identities and exact bootstrap grants. Conflicting seed-owned drift fails before writes."

## Scenario

Each case below starts from a fully bootstrapped, undrifted database, applies
exactly **one** direct modification, then runs
`npm run db:bootstrap:access-control` once. The cases are independent: each
begins from the clean bootstrapped state, never from the previous case's
outcome.

### Restore — a missing owned row is recreated

| # | Modification | Required outcome |
| --- | --- | --- |
| R1 | `DELETE` one canonical `PolicyPermissions` pair | run exits zero; the pair is restored; `PolicyPermissions` count returns to 3; the other two pairs keep their original rows |
| R2 | `DELETE` the root `UserPolicies` attachment, singleton still recorded and still naming the current normalized root | run exits zero; the attachment is restored for the **recorded** root; count returns to 1 |

R2's condition is exact: the drift table restores the attachment "only while it
still matches the current normalized root, otherwise fail". Deleting the
attachment does not license re-selecting a root.

### Preserve — non-authorization-bearing state is left alone

| # | Modification | Required outcome |
| --- | --- | --- |
| P1 | `UPDATE` a canonical `Permissions.description` to arbitrary text | run exits zero; the edited description is **unchanged** — descriptive text is not authorization-bearing and the seed does not restore it |
| P2 | nothing; capture all generated ids | run exits zero; every `Permissions.id` and the FR `Policies.id` are unchanged — the seed matches on `key`/natural key and never rewrites a generated id |

### Fail before writes — identity and authorization-bearing drift

| # | Modification | Required outcome |
| --- | --- | --- |
| F1 | `UPDATE` the FR policy's `operator` to something other than `'=='` | nonzero exit naming `operator`; nothing written; the drifted value preserved |
| F2 | `UPDATE` the FR policy's `managedBy` to `'sync'` | nonzero exit naming `managedBy`; nothing written |
| F3 | `UPDATE` the singleton's `policyId` to a different existing policy's id | nonzero exit naming the policy mismatch; nothing written |
| F4 | `UPDATE` the singleton's `rootUserId` to another active User's id | nonzero exit naming the root mismatch; no attachment transferred, none added |

"Fail **before** writes" is the assertion, not merely "fail". Each F case must
leave every count and every field exactly as the modification left it — a run
that writes two of the six grants and then discovers F1 has already violated
the contract even though it exits nonzero, and ACM1R-FB-27 covers the rollback
that makes that observable.

The three dispositions are deliberately not one rule. Restoring a deleted grant
is safe because the canonical set is fully specified. Restoring an edited
description would silently revert an administrator's text for no authorization
benefit. Rewriting a drifted `operator` would let the seed change an
authorization predicate with no approval — so it fails instead.

**Preconditions:** fully bootstrapped, undrifted database; all row counts, all
generated ids, and the singleton's three columns captured before each case;
exactly one modification applied per case.

## Test — eight independent one-modification reruns

- **entrypoint:** `npm run db:bootstrap:access-control`, once per case, each
  from a freshly bootstrapped database
- **preconditionState:** per case, the clean post-bootstrap snapshot —
  `Permissions` ×6 with ids, FR `Policies` ×1 with id, `PolicyPermissions` ×6,
  `UserPolicies` ×1, `AccessControlBootstrap` ×1 with its three columns
- **expectedDatabaseState:** exactly the "Required outcome" column above, and in
  every F case all five counts and every captured field are identical to the
  pre-run snapshot
