# Proposed fixes — coverage-chain connectivity

**Date:** 2026-09-04 · **Author:** TEA Agent · **Status:** proposal — nothing in the model was changed
**Companion:** `_bmad-output/test-artifacts/chain-consistency-audit-2026-09-04.md`

One change is already applied: `verify-coverage.py` (see §3). The model edits below are **proposals**, because each is a product-mapping decision and a wrong alias is worse than a missing one — it manufactures traceability that does not exist.

---

## 1. What the patched script now reports

Two new FAILs, both real:

```
4. FAIL  every unmapped story is declared in unmapped_story_exemptions
         PLAT×6  UM×5  PMC×2  ENG×8  RA×1
8. FAIL  every scenario document resolves to >=1 PM-FR
         317 of 387 unresolved: access-control=171, access-control-foundation=9,
                                access-control-kernel=73, user-management=64
```

`mentorship=0` — all 27 mentorship documents resolve once `FR-Mn → M-FR-n` is applied. The mechanism works; the gaps are gaps.

---

## 2. The INFO bucket was not hiding infrastructure

Check 4's old label read *"expected: infra, evidence, superseded"*. What it actually contained:

| Story | Sprint key | Really infra? |
| ----- | ---------- | ------------- |
| `UM-E2-S2.1` | `2-1-request-a-magic-link-by-work-email` | **No — the only login mechanism** |
| `UM-E2-S2.2` | `2-2-consume-a-magic-link-token-to-establish-a-session` | **No** |
| `UM-E1-S1.1` | `1-1-import-seeded-population` | **No — FR-4** |
| `UM-E1-S1.5` | `1-5-list-employees-with-pagination-and-filters` | **No — FR-15** |
| `UM-E0-S0.2` | `0-2-adopt-write-path-dual-gate` | **No — FR-9 refinement** |
| `ENG-E3-S3.1` | `3-1-record-a-risk-with-level-description-details-and-date` | **No — reads as `PM-FR-21`** |
| `PMC-E1-S1.2` | `1-2-directory-page-chrome-and-presentation-floor` | Plausibly presentation infra |
| `RA-E1-S1.6` | `1-6-standalone-capability-check-endpoint-for-target-less-actions` | Plausibly infra for `PM-FR-6` |

Six of the eight sampled are product capability. **Do not blanket-exempt this list.** Map them, and exempt only what a human confirms is infrastructure.

---

## 3. Applied — `verify-coverage.py`

Two changes, both mechanical, no semantic judgment:

1. **Check 4** — the reverse-direction bucket now splits into *declared exempt* (listed in a new optional `unmapped_story_exemptions:` key in the YAML) and *unexplained* (fails). Nothing is exempt today, so it fails loudly until each entry is either mapped or explicitly declared.
2. **Check 8 (new)** — bottom-up: every scenario document under `docs/test-cases/` must resolve to at least one `PM-FR`, directly or through an alias. Two normalizations are applied and documented inline: `FR-Mn → M-FR-n`, and `FR-n → {UM,M}-FR-n` scoped by the document's own area.

The script's docstring now records why check 8 exists: checks 1–7 are all top-down and structurally cannot see a capability that exists in code and tests but in no `PM-FR`.

---

## 4. Proposed — 8 missing `UM-FR-*` aliases

Derived from the FR → Epic table in `user-management/epics.md` (lines 86–103), cross-referenced against the model's epic assignments.

| UM FR | Epic | epics.md description | Proposed `PM-FR` | Confidence |
| ----- | ---- | -------------------- | ---------------- | ---------- |
| `FR-1` | `UM-E1` | seed-script HR Admin bootstrap + population import | — | **decision needed** |
| `FR-4` | `UM-E1` | seeded population import | — | **decision needed** |
| `FR-5a` | `UM-E1` | S1 fields at import; `joined_company` at seed | `PM-FR-28` | medium |
| `FR-7` | `UM-E1` | `workEmail`/`ttId` uniqueness on authorized writes | `PM-FR-9` | medium |
| `FR-15` | `UM-E1` | permission-safe public profile listing | `PM-FR-8`, `PM-FR-12` | medium |
| `FR-2` | `UM-E2` | passwordless magic-link is the sole login | — | **blocked, see §5** |
| `FR-3` | `UM-E2` | magic-link login; import does not establish a session | — | **blocked, see §5** |
| `FR-8` | `UM-E2` | request magic link, consume token, establish session | — | **blocked, see §5** |

I did **not** write these in. The mechanical route — "same epic ⇒ same `PM-FR`" — gives `PM-FR-12`/`PM-FR-13` for every `UM-E1` requirement, which is wrong: `UM-E1` spans seed, import and listing, while `PM-FR-12` is *Section-based profile rendering* and `PM-FR-13` is *Employee self-service*. Deriving aliases that way would encode false traceability into the canonical model. The medium-confidence rows above are semantic reads that still want a human yes.

---

## 5. Blocked — authentication has no canonical requirement

`PM-FR-1..42` contains nothing for authentication, login, session, or magic link. Grepping the catalog for `auth` returns only `PM-FR-4` (*assemble authorized responses*), `PM-FR-13` and `PM-FR-27` — all authorization, not authentication.

So `UM-E2` cannot be mapped: **there is no requirement to map it to.** The product's only login mechanism is specified (`FR-2`, `FR-3`, `FR-8`), scenario-covered (6 documents), and test-covered (3 files) — and contributes zero to canonical coverage.

Two ways out, both a product-owner call:

- **(a)** Add `PM-FR-43 — Passwordless magic-link authentication and session establishment`, normative refs into `docs/project-requirements.md`, owning epic `UM-E2`. This makes the model complete but changes the canonical 42-requirement inventory, which check 1 asserts exactly (`len(ids) == 42`) — that assertion must move to 43.
- **(b)** Declare authentication out of the `PM-FR` model as platform infrastructure, and record it in `unmapped_story_exemptions` with that reason.

**(a)** is the more honest of the two: a login is a product capability, not infrastructure. But it is not my call, and check 1 hard-codes the count, so it cannot be done quietly.

---

## 6. Proposed — `unmapped_story_exemptions` starter

Add to `global-fr-epic-story-coverage.yaml` only after each entry is confirmed:

```yaml
unmapped_story_exemptions:
  # Confirmed infrastructure / evidence stories with deliberately no PM-FR.
  # Every entry needs a reason. An entry without one is a hidden gap.
  # - id: PMC-E1-S1.2
  #   reason: presentation floor, no functional requirement of its own
```

Leaving it empty is the correct starting state: it makes all 22 unmapped stories visible until each is decided.

---

## 7. Suggested order

1. Decide §5 (authentication) — it is the largest single hole and blocks 3 aliases.
2. Confirm or correct the 5 medium/decision-needed aliases in §4.
3. Fill `unmapped_story_exemptions` for what is genuinely infra; map the rest.
4. Decide how `access-control` `AD-n` / `CAP-n` roll up to `PM-FR` — that is 253 of the 317 check-8 failures and needs its own ruling, not a rewrite rule.
