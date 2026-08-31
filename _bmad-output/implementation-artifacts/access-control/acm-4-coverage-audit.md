---
title: "ACM-4 CAP-2 coverage audit"
date: "2026-08-31"
status: "gap"
spec: "SPEC-access-control-kernel-mvp"
story: "ACM-4-scenarios"
---

# ACM-4 CAP-2 coverage audit — HALT

## Verdict

**Coverage gap found.** The historical Foundation scenarios are approved, but
they are insufficient for CAP-2. The Kernel suite explicitly contains ACM-3
and ACM-1 scenarios only, not ACM-4 coverage.

## Required coverage and evidence

| Required CAP-2 item | Status | Exact evidence |
| --- | --- | --- |
| Multi-audience retention | Missing | The approved foundation contract states “one audience per viewer×target,” not retained sets: `docs/test-cases/access-control-foundation/README.md`. |
| Self exclusivity | Missing | `ACF-AU-01` asserts a binary `200`; it does not require a confirmed active identity or `Set {'self'}` with Reporting/direct PP absent: `docs/test-cases/access-control-foundation/audience/acf-au-01-self.md`. |
| Colleague floor | Missing | `ACF-AU-05` proves Colleague for an unrelated viewer only; it does not prove Colleague is absent when Reporting or direct PP applies: `docs/test-cases/access-control-foundation/audience/acf-au-05-colleague-denied.md`. |
| Deduplication | Missing | `ACF-FC-04` proves cycle termination, not de-duplicated coexistence of Reporting and direct PP in one result: `docs/test-cases/access-control-foundation/fail-closed/acf-fc-04-cyclic-reporting-chain.md`. |
| FR separation | Missing | The Foundation suite explicitly excludes functional permissions/`isAllowed`; no scenario places an FR permission in a fixture and proves it never enters `resolveAudiences`: `docs/test-cases/access-control-foundation/README.md`. |
| Representative PostgreSQL fixture classes | Missing | Reporting, direct PP, and Colleague fixtures exist separately, but no mixed fixture exists. The Kernel fixture has no PP relationships, so it cannot cover the mixed class: `docs/test-cases/access-control-foundation/README.md`, `docs/test-cases/access-control-kernel/README.md`. |

## Mandatory halt

Do **not** dispatch `ACM-4-red-tests`, `ACM-4-production`, `ACM-5`, or their
downstream stories. This audit writes neither scenario/test/production code nor
a CAP-2 disposition: it is the trigger for the separately approved AD-1 repair
sequence in `stories.yaml`.

## Recovery condition

`ACM-4R-scenarios` must first add all six missing scenario contracts and receive
an independent Stage-1 approval. `ACM-4R-tests` then supplies real
migrated-PostgreSQL facade evidence. Only
`ACM-4R-disposition` may write
`_bmad-output/implementation-artifacts/access-control/acm-4-disposition.yaml`,
and it may record `disposition: no-gap` only after all six items are covered and
no concrete behavior gap remains.
