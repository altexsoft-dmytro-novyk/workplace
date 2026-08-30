# UM-SEED-03 · Import assigns exactly one bootstrap HR Admin

**Trace:** PRD FR-1 ("the very first User in the system is created by the population seed/import script and assigned the HR Admin functional role directly"); spine AD-9 (functional roles are data)

## Scenario

**Given** a fresh, empty database and the delivered seeded timetracker list.

**When** the population import script runs.

**Then** exactly one imported `User` holds the HR Admin functional role via a `UserPolicy` row written by the seed script itself — no other path in this bounded context grants a functional role. Whether that assignment actually *behaves* as an ordinary, revocable functional-role attachment (not a hard-coded special case) is proven by access-control's own suite (`fc-03`), not duplicated here — this scenario only proves the seed step wrote the attachment.

**Preconditions:** [fixture](../README.md#canonical-personas); no prior seed run in this test's isolated schema/namespace (DEC-UM-010).

## Test

- **stateChange:** the population import script runs against the seeded list (not an HTTP request — see [../README.md](../README.md), "Deliberately not covered here").

### Test 1 — role catalog shows exactly one HR Admin holder

- **inputURL:** `GET /roles`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" }
  }
  ```
- **expectedResult:** `200`; the `HR Admin` policy's holder count is exactly `1`, and that holder is the bootstrap `User` the seed script created first (matched by `workEmail` against the seeded list's first row).
