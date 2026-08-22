# AC-SF-06 · Direct request for a forbidden section leaks nothing, not even in the error

**Trace:** §3.3.1 (not an error message) · §3.3.4

## Scenario

**Given** Alice has a populated Risks section that Colin must not know exists.

**When** Colin requests S6 directly, requests a section that does not exist at all, and sends an invalid write to S6.

**Then** all three answers are indistinguishable 404s — no error message, count, or validation detail betrays that hidden data exists.

**Preconditions:** [fixture](../README.md); Alice has a populated S6 (high risk)

## Test 1 — forbidden section

- **inputURL:** `GET /users/alice/risks`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `404`; body carries no field names, record counts, or data fragments

## Test 2 — nonexistent item within the same forbidden collection, same shape

- **inputURL:** `GET /users/alice/risks/{nonexistentRiskId}`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `404`; status and body **indistinguishable** from Test 1. **[Route note]** rewritten from a bogus top-level path (`/users/alice/nonexistent`) that no longer exists once the generic `/sections/:sN` wrapper was removed — a genuinely unrouted path would hit the framework's default 404 handler, not the AccessControl facade, defeating the point of this test (proving the *facade's* 404 is uniform). A real item id that doesn't exist, inside the same forbidden collection Test 1 already denies, exercises the same code path instead.

## Test 3 — validation must not precede authorization

- **inputURL:** `POST /users/alice/risks`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    },
    "body": {
      "level": 12345
    }
  }
  ```
- **expectedResult:** `404`, not a validation error — the access decision runs before payload validation
