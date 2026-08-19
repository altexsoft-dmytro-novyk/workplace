# AC-SF-01 · Colleague view is a whitelist, exact to the byte

**Trace:** §3.3.3 · §9 DoD (colleague whitelist)
**Preconditions:** [fixture](../README.md); Alice's profile fully populated: every S1–S16 has data, incl. flagged S7/S8 records and custom fields at all three visibility levels

## Test

- **inputURL:** `GET /users/alice/profile`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `200`; the set of section keys is **exactly** `{s01, s10, s11}` (set-equality, not spot checks); `s10` records include leave **type**; `s11` records carry project **name only**; nowhere in the body: risk, note, feedback, document, contact, employment, CDS, mentorship, action-item, request-history, or management-visibility custom-field data
