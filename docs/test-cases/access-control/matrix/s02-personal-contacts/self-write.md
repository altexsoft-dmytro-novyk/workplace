# AC-M-S02-02 · S2 Personal contacts — Self: write (no HR involved)

**Trace:** §3.2 S2 / Self `RW` · §4.3

## Scenario

**Given** Alice moved to another city.

**When** she updates her current place of stay herself.

**Then** the change persists without any HR involvement — Self holds RW on S2.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/personal-contacts`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    },
    "body": {
      "currentPlaceOfStay": "Lviv"
    }
  }
  ```
- **expectedResult:** `200`; persisted
