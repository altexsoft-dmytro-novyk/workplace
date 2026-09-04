# Chain consistency audit — PRD → epic → story → scenario → test

**Date:** 2026-09-04 · **Evaluator:** TEA Agent · **Trigger:** verify the planning chain, part of which was authored by a different person.
**SHAs:** workspace `0114d1c` · backend `25afb15`

## Verdict

**The two ends are each sound. The join between them is convention only, and it leaks.**

| Link | Verified by | State |
| ---- | ----------- | ----- |
| PRD → epic → story | the project's own `verify-coverage.py` | **ALL CHECKS PASS** (42 requirements, 12 slices, 109 stories) |
| scenario → test | traceability run of 2026-09-04 | 364 of 387 test cases carry a scenario ID |
| **story → scenario** | *nothing* | **unverified — no tool traverses it** |

`verify-coverage.py` validates top-down (PM-FR → epic → story). It never checks that a scenario document or a test resolves back up. Nothing in the repository does.

## Finding 1 — Not one scenario document uses the canonical vocabulary

The coverage model is keyed on `PM-FR-1..42`. Across all 387 scenario documents, `PM-FR-n` appears **zero times**. Each area uses its own dialect:

| Area | Docs | Trace vocabulary used | Resolvable to `PM-FR`? |
| ---- | ---: | --------------------- | ---------------------- |
| `access-control` | 171 | `AD-n`, `§n.n` | **No** — model has no `AD-*` alias |
| `access-control-kernel` | 73 | `CAP-n`, `AD-n`, `OQ-*` | **No** — model has no `CAP-*` alias |
| `user-management` | 107 | `FR-n`, `Story n.n`, `DEC-UM-n` | Partly (9 of 15) |
| `mentorship` | 27 | `FR-Mn`, `Story n.n` | Yes (22 of 22), after transposition |

**244 of 387 scenarios (63%) have no machine-resolvable path to a canonical requirement.**

## Finding 2 — The alias table is off by a naming convention

The model stores namespaced aliases (`UM-FR-16`, `M-FR-1`); scenarios cite bare or transposed forms (`FR-16`, `FR-M1` — note the letter moves sides). Of 33 distinct `FR-n` citations in `user-management` and `mentorship`, **0 resolve as written**.

Applying the obvious rewrites (`FR-n` → `UM-FR-n` in UM docs, `FR-Mn` → `M-FR-n` in mentorship) resolves mentorship completely (22/22) and most of UM (9/15). This half is a cheap, mechanical fix.

## Finding 3 — Six User Management requirements have no bridge at all

`FR-1, FR-2, FR-3, FR-4, FR-7, FR-15` are defined in `prd-user-management-2026-08-20/prd.md` (§ FR list, lines 110-113 ff.) and cited by scenario documents, but have **no alias in the coverage model**. They are not resolvable under any rewrite.

These are not peripheral:

- **FR-1** — the first `User` is created by the ACM-0 deploy-time seed
- **FR-2** — passwordless magic link is **the sole login mechanism**
- **FR-3** — first and subsequent logins use the same request/consume flow
- **FR-4** — employee population import via `POST /users/import`

## Finding 4 — Magic-link authentication is invisible to the canonical model

`UM-E2` — the authentication epic — exists in `user-management/epics.md` as `UM-E2-S2.1` (request a magic link) and `UM-E2-S2.2` (consume a token to establish a session). It has 6 approved-path scenario documents under `docs/test-cases/user-management/auth/` and 3 test files under `test/user-management/epic-2/`.

**No `PM-FR` requirement references `UM-E2` or either story.**

`verify-coverage.py` does surface these two stories — inside an INFO bucket labelled *"stories in a slice with no FR mapping (expected: infra, evidence, superseded)"*. Authentication is none of those three. The check passes because the bucket's label assumes anything unmapped is benign, so a core product capability sits in it unnoticed.

The consequence: the system's only login mechanism is fully specified, scenario-covered and test-covered, yet contributes nothing to canonical coverage and would not be missed by any existing check.

## Finding 5 — `UM` slice status is `none`

Every other slice is `final` or `draft`; `UM` is `none`. Combined with Findings 3 and 4, the User Management slice is the least connected part of the model — and it is the largest body of implemented product code.

## Recommendations

| # | Priority | Action |
| - | -------- | ------ |
| 1 | P0 | Add the 6 missing aliases (`UM-FR-1/2/3/4/7/15`) and map `UM-E2` to a `PM-FR`, or create one for authentication. Until then, the canonical model does not know the product has a login. |
| 2 | P0 | Split the "no FR mapping" INFO bucket in `verify-coverage.py` into *declared-exempt* (listed explicitly) and *unexplained* (fails the check). The current label lets real gaps pass as expected noise. |
| 3 | P1 | Normalize scenario trace vocabulary to the canonical `PM-FR-n`, or publish an alias map covering `AD-*`, `CAP-*` and bare `FR-*`. Mentorship and most of UM are mechanical; access-control needs a decision on how `AD-n`/`CAP-n` roll up. |
| 4 | P1 | Extend `verify-coverage.py` with a bottom-up check: every scenario document resolves to ≥1 `PM-FR`. That is the check whose absence allowed all of the above. |
| 5 | P2 | Set an explicit `UM` slice status. |

## Limits

- Semantic correctness of each mapping was not audited — this checks that the chain *resolves*, not that a story faithfully implements its requirement.
- `access-control` `AD-n`/`CAP-n` roll-up is reported as unresolvable because the model declares no such aliases. It may be intentional; no artifact states either way.
