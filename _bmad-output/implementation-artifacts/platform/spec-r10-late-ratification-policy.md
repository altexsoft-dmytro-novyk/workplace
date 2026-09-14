---
title: 'R10 late-ratification policy correction'
type: 'chore'
created: '2026-09-12'
status: 'done'
route: 'one-shot'
---

# R10 late-ratification policy correction

## Intent

**Problem:** The UMAC-1 late Stage-3 record exposed a contradiction: the R10 validator expected a persisted approval statement while the governing AD-1 amendment prohibited new approval-ledger entries.

**Approach:** Preserve approval rows as non-gating history and define a separately typed, evidence-backed late-ratification record that documents out-of-order work without making it a compliant gate pass.

## Suggested Review Order

**Policy authority**

- Establishes the governing distinction between historical records and live gates.
  [`ARCHITECTURE-SPINE.md:67`](../../planning-artifacts/architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md#L67)

- Applies the parent rule to the Kernel MVP’s scoped architecture.
  [`ARCHITECTURE-SPINE.md:103`](../../planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md#L103)

- Makes the operational rule readable where teams execute AD-1.
  [`testing-strategy.md:41`](../../../docs/architecture/testing-strategy.md#L41)

**Recorded evidence**

- Keeps legacy approvals immutable and adds seven explicitly non-gating classifications.
  [`approvals.yaml:1`](../../specs/spec-user-management-access-control-adoption/approvals.yaml#L1)

- Records the user-approved policy decision in the adopted Kernel companion log.
  [`_memlog.md:1`](../../specs/spec-access-control-kernel-mvp/.memlog.md#L1)

**Mechanical enforcement**

- Validates the policy anchors, schema, independence, and resolvable UMAC evidence.
  [`validate.py:399`](../../specs/spec-access-control-kernel-mvp/validate.py#L399)
