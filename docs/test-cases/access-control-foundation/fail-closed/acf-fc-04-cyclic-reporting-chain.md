# ACF-FC-04 · A cyclic reporting chain terminates instead of hanging

**Trace:** §7 · AD-11 · AD-12 · ACF-1

**U-19 normative coverage:** Robustness evidence for `TR-2.1-02` (v1.5 §2.1 — transitive Reporting line) and meta-level support for `TR-7-01`. Already uses the resolver audience-set assertion pattern; not invalidated. See `test-design-qa.md` § Normative coverage map.

**Approved:** Anna Pikula, 2026-08-30

## Scenario

**Given** two employees form a cycle in the reporting graph — CycleA reports to CycleB and CycleB reports to CycleA — which the schema accepts today: the partial unique index allows each of them exactly one `direct` row, and the CHECK constraint only forbids pointing at yourself.

**When** an unrelated colleague reads one of their profiles.

**Then** resolution completes and returns Colleague. Bad org data must degrade to *less* access, never to an unanswered request: the recursive walk terminates on its own through deduplication, and a hard ceiling on the query means that even a shape nobody anticipated fails the request rather than holding its database connection open. §7 gives the whole request two seconds; a resolution still running past that is not slow, it is wrong.

**Preconditions:** [fixture](../README.md#foundation-fixture); the CycleA ↔ CycleB pair exists in addition to the standard graph.

## Test

- **inputURL:** `GET /users/<cycle-a-id>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:<colin-id>>" },
    "body": {}
  }
  ```
- **expectedResult:** `403` within the request budget — Colin resolves Colleague, and the cycle neither grants access nor stalls the request. The audience call underlying it must return rather than time out; a run that hangs is a failure of this scenario even if no assertion reports it.
