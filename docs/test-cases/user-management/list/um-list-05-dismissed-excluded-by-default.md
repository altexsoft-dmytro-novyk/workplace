# UM-LIST-05 · Dismissed employees excluded by default, findable via filter

**Trace:** epics.md Story 1.5 AC ("Colin's effective employment status is dismissed... absent by default but can be found through an authorized employment-status filter") · FR-15/FR-6 · §4.16 ("filterable from All Employees, so 'everyone who left in 2026' is a view like any other")

## Scenario

**Given** Colin's effective employment status is `dismissed` (his recorded departure's effective date has passed and the executor has applied it — spine AD-16).

**When** an entitled actor opens the default employee list.

**Then** Colin is absent from the default results — but the same actor can find him by explicitly filtering on employment status, proving the exclusion is a default-view behavior, not a data-visibility denial.

**Preconditions:** [fixture](../README.md#canonical-personas); Colin's departure recorded and applied prior to this scenario (see the Employment Lifecycle suite for how that state is reached — this scenario takes it as a precondition, not something it re-derives).

## Test

### Test 1 — default list excludes Colin

- **inputURL:** `GET /users`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:Root>" } }
  ```
- **expectedResult:** `200`; results do not include Colin's record.

### Test 2 — explicit employment-status filter finds Colin

- **inputURL:** `GET /users?employmentStatus=dismissed`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:Root>" } }
  ```
- **expectedResult:** `200`; results include Colin's record with `employmentStatus: "dismissed"`. Whether this filter is open to any authenticated actor or gated to a specific permission is an implementation open question — not settled by requirements §4.16 or by epics.md's Story 1.5 AC text, which only says "authorized." Confirm during stage-2 translation.
