# UM-SEED-01 · Population import creates User rows and a joined_company event

**Trace:** §4.17 ("the initial population is a seeded list... import it into the platform"); PRD FR-1/FR-4a/FR-5a; spine AD-19 (career-timeline sync write)

## Scenario

**Given** a fresh, empty database and the delivered seeded timetracker list.

**When** the population import script runs against that list.

**Then** one `User` row exists per seeded employee with S1 identity-card fields populated from the list (`firstName`, `lastName`, `position`, `country`, `city`, `workEmail`, `workPhone`, `birthDay`, `birthMonth`, `companyJoinDate`, `ttId` where present), `workEmail` and `ttId` are unique across imported rows, and each imported employee has a system-generated `UserEvents` row (`type: "joined_company"`, `source: "system"`, `eventDate` matching `companyJoinDate`) — observed by Alice reading her own profile and her own timeline after the import.

**Preconditions:** [fixture](../README.md#canonical-personas); no prior seed run in this test's isolated schema/namespace (DEC-UM-010).

## Test

- **stateChange:** the population import script runs against the seeded list (not an HTTP request — see [../README.md](../README.md), "Deliberately not covered here": seed-script bootstrap itself is not HTTP-driven).

### Test 1 — S1 fields observable via Self read

- **inputURL:** `GET /users/<aliceId>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Alice>" }
  }
  ```
- **expectedResult:** `200`; body's S1 fields (`firstName`, `lastName`, `position`, `country`, `city`, `workEmail`, `workPhone`, `birthDay`, `birthMonth`, `companyJoinDate`) match the seeded list exactly for Alice's row; `ttId` and `isActive` are absent (never public/self-facing technical filters, per FR-15).

### Test 2 — joined_company event observable via Self timeline read

- **inputURL:** `GET /users/<aliceId>/events`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Alice>" }
  }
  ```
- **expectedResult:** `200`; body includes exactly one event with `type: "joined_company"`, `source: "system"`, `eventDate` equal to Alice's `companyJoinDate`.
