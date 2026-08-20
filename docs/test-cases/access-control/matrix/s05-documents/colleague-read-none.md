# AC-M-S05-09 · S5 Documents — Colleague: no read path (negative)

**Trace:** §3.2 S5 / Colleague `—` · §9 DoD

## Scenario

**Given** Alice's documents exist, and Colin is a plain colleague.

**When** Colin fetches her profile, probes the section, and probes a document object directly by a known id.

**Then** no surface returns names, types, counts, or content — contracts and CVs never reach colleagues.

**Preconditions:** [fixture](../../README.md); Alice's S5 populated

## Test 1 — profile assembly

- **inputURL:** `GET /users/alice/profile`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `200`; no `s05` key

## Test 2 — direct section request

- **inputURL:** `GET /users/alice/sections/s05`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `404`; no document names, types, or counts

## Test 3 — direct object probe

- **inputURL:** `GET /users/alice/documents/{knownId}`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `404`; no file content
