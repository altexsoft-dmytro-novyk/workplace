# AC-SF-01 · Colleague view is a whitelist, exact to the byte

**Trace:** §3.3.3 · §9 DoD (colleague whitelist)

## Scenario

**Given** Alice's profile is fully populated in every section — flagged notes, feedback, custom fields at all levels — and Colin is a plain colleague.

**When** Colin fetches her profile.

**Then** the response contains exactly the whitelist: S1, S10 with leave types, S11 project names; set-equality on the section keys proves nothing else leaks.

**Preconditions:** [fixture](../README.md); Alice's profile fully populated: every S1–S16 has data, incl. flagged S7/S8 records and custom fields at all three visibility levels

## Test

- **inputURL:** `GET /users/alice`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `200`; the set of section keys is **exactly** `{s01, s10, s11}` (set-equality, not spot checks); `s10` records include leave **type**; `s11` records carry project **name only**; nowhere in the body: risk, note, feedback, document, contact, employment, CDS, mentorship, action-item, request-history, or management-visibility custom-field data
