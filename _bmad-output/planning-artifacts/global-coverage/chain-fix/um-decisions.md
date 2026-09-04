# User Management — trace decisions still needed

**Date:** 2026-09-04 · **Author:** TEA Agent · **Status:** decision list — no mapping was written

Companion to `BRIEFING.md`. The 43 `RESOLVED` user-management documents already carry an explicit `PM-FR` on their Trace line. This file covers the 64 that do not.

## Headline: 27 of the 64 should never be mapped

**27 of the 64 unmapped documents are `RETIRED_OR_SUPERSEDED`.** They are excluded from the coverage oracle and from the gate, so giving them a canonical requirement would be wrong, not merely wasteful. Check 8 currently counts them as failures — see the recommendation at the end.

| Folder | Retired docs |
| ------ | -----------: |
| `registration` | 14 |
| `profile` | 6 |
| `deactivation` | 2 |
| `seed` | 2 |
| `access-control-adoption` | 1 |
| `auth` | 1 |
| `relationships` | 1 |

**The real remaining work is 37 live documents**, and it is tightly clustered — every cluster is blocked on the same small set of missing aliases.

---

## The live clusters

### `seed/` — 11 documents

- **Blocked on:** `FR-1, FR-4` — no alias in `global-fr-epic-story-coverage.yaml`
- **Evidence:** FR → Epic table in `user-management/epics.md` (lines 86-103): *UM-E1 — seed-script HR Admin bootstrap + population import / seeded population import*
- **Proposed:** add an alias for `FR-1, FR-4` once a human confirms which `PM-FR` owns it. The mechanical route (same epic ⇒ same `PM-FR`) is NOT safe here: `UM-E1` spans seed, import and listing while its model-side requirements are `PM-FR-12` (section-based profile rendering) and `PM-FR-13` (employee self-service) — a poor fit for all three clusters.

  - `UM-SEED-01` — um-seed-01-import-success.md (cites FR-1, FR-4, FR-5a, FR-7)
  - `UM-SEED-03` — um-seed-03-bootstrap-hr-admin-and-root-id-reuse.md (cites FR-1)
  - `UM-SEED-04` — um-seed-04-department-create-on-import.md (cites no FR)
  - `UM-SEED-05` — um-seed-05-employment-status-mapping.md (cites no FR)
  - `UM-SEED-06` — um-seed-06-birthday-split.md (cites no FR)
  - `UM-SEED-07` — um-seed-07-null-source-fields.md (cites no FR)
  - `UM-SEED-08` — um-seed-08-idempotent-re-import.md (cites no FR)
  - `UM-SEED-09` — um-seed-09-malformed-rows-skipped.md (cites no FR)
  - `UM-SEED-11` — um-seed-11-import-unauthenticated.md (cites no FR)
  - `UM-SEED-12` — um-seed-12-deploy-script-entrypoint.md (cites no FR)
  - `UM-SEED-13` — um-seed-13-joined-company-event-in-row-transaction.md (cites no FR)

### `list/` — 10 documents

- **Blocked on:** `FR-15` — no alias in `global-fr-epic-story-coverage.yaml`
- **Evidence:** FR → Epic table in `user-management/epics.md` (lines 86-103): *UM-E1 — permission-safe public profile listing*
- **Proposed:** add an alias for `FR-15` once a human confirms which `PM-FR` owns it. The mechanical route (same epic ⇒ same `PM-FR`) is NOT safe here: `UM-E1` spans seed, import and listing while its model-side requirements are `PM-FR-12` (section-based profile rendering) and `PM-FR-13` (employee self-service) — a poor fit for all three clusters.

  - `UM-LIST-01` — um-list-01-pagination-and-metadata.md (cites FR-15)
  - `UM-LIST-02` — um-list-02-filter-country.md (cites FR-15)
  - `UM-LIST-03` — um-list-03-compound-filters.md (cites FR-15)
  - `UM-LIST-04` — um-list-04-filter-remaining-identity-fields.md (cites FR-15)
  - `UM-LIST-07` — um-list-07-endpoint-authorization.md (cites FR-15)
  - `UM-LIST-08` — um-list-08-fixed-fail-closed-projection.md (cites FR-15)
  - `UM-LIST-09` — um-list-09-unsafe-and-unknown-filters-rejected.md (cites FR-15)
  - `UM-LIST-10` — um-list-10-empty-result-set.md (cites FR-15)
  - `UM-LIST-11` — um-list-11-deterministic-default-sort.md (cites FR-15)
  - `UM-LIST-12` — um-list-12-perf-nfr2-stage2-note.md (cites no FR)

### `profile/` — 10 documents

- **Blocked on:** `FR-9, FR-7` — no alias in `global-fr-epic-story-coverage.yaml`
- **Evidence:** FR → Epic table in `user-management/epics.md` (lines 86-103): *UM-E1 — permission-safe S1 reads/writes, Self writes photo / workEmail-ttId uniqueness*
- **Proposed:** add an alias for `FR-9, FR-7` once a human confirms which `PM-FR` owns it. The mechanical route (same epic ⇒ same `PM-FR`) is NOT safe here: `UM-E1` spans seed, import and listing while its model-side requirements are `PM-FR-12` (section-based profile rendering) and `PM-FR-13` (employee self-service) — a poor fit for all three clusters.

  - `UM-EDIT-01` — um-edit-01-entitled-actor-edits-identity-fields.md (cites no FR)
  - `UM-EDIT-02` — um-edit-02-workemail-normalized-before-uniqueness-check.md (cites no FR)
  - `UM-EDIT-06` — um-edit-06-forbidden-technical-fields-rejected.md (cites no FR)
  - `UM-EDIT-07` — um-edit-07-empty-or-no-op-patch.md (cites no FR)
  - `UM-EDIT-08` — um-edit-08-birthday-pair-both-or-neither.md (cites no FR)
  - `UM-PHOTO-04` — um-photo-04-unauthenticated.md (cites no FR)
  - `UM-PHOTO-05` — um-photo-05-target-not-active-user.md (cites no FR)
  - `UM-PHOTO-06` — um-photo-06-validation.md (cites no FR)
  - `UM-PHOTO-07` — um-photo-07-storage-failure.md (cites no FR)
  - `UM-PHOTO-08` — um-photo-08-real-storage-assertion.md (cites no FR)

### `auth/` — 5 documents

- **Blocked on:** `FR-2, FR-3, FR-8` — no alias in `global-fr-epic-story-coverage.yaml`
- **Evidence:** FR → Epic table in `user-management/epics.md` (lines 86-103): *UM-E2 — passwordless magic-link login*
- **Status: BLOCKED, not merely missing.** `UM-E2` maps to no `PM-FR` because the canonical set contains no authentication requirement at all. See `authentication-requirement-proposal.md`. Do not map these until that is decided.

  - `UM-AUTH-01` — um-auth-01-request-magic-link-success.md (cites FR-2)
  - `UM-AUTH-02` — um-auth-02-request-magic-link-unknown-email.md (cites FR-2)
  - `UM-AUTH-03` — um-auth-03-consume-magic-link-success.md (cites FR-2)
  - `UM-AUTH-04` — um-auth-04-consume-expired-token-denied.md (cites FR-2)
  - `UM-AUTH-05` — um-auth-05-consume-token-single-use.md (cites FR-2)

### `access-control-adoption/` — 1 documents

- **Blocked on:** `FR-16` — no alias in `global-fr-epic-story-coverage.yaml`
- **Evidence:** FR → Epic table in `user-management/epics.md` (lines 86-103): *UM-E0 — real facade adoption + ACCESS_CONTROL_PORT rebind*
- **Proposed:** add an alias for `FR-16` once a human confirms which `PM-FR` owns it. The mechanical route (same epic ⇒ same `PM-FR`) is NOT safe here: `UM-E1` spans seed, import and listing while its model-side requirements are `PM-FR-12` (section-based profile rendering) and `PM-FR-13` (employee self-service) — a poor fit for all three clusters.

  - `UMAC-06` — umac-06-no-target-isallowed-delegates-to-facade.md (cites no FR)

---

## Recommendations

1. **Exclude retired documents from check 8.** 27 of the 64 failures are documents the project has already withdrawn. Counting them makes the check's number misleading and creates pressure to map things that should not be mapped. The retired set is identifiable from the supersession banner in the first ~15 lines of each file; a cleaner fix is an explicit `retired_scenarios:` list in the coverage YAML, since a banner is prose and prose drifts.

2. **The whole live remainder reduces to 5 alias decisions** — `FR-1`, `FR-4`, `FR-7`, `FR-9`(listing side), `FR-15`, plus `FR-16` which likely already resolves through an existing alias. Confirm those and 32 of the 37 live documents resolve at once.

3. **`auth/` (5 documents) cannot be resolved by any alias** — there is nothing to point at. It waits on the authentication decision.

## What was deliberately not done

No alias was written into the coverage model, and no Trace line was edited in these 64 files. Every candidate here rests on a same-epic inference that is demonstrably too coarse in this slice, and a wrong alias manufactures traceability that does not exist. These are human decisions.
