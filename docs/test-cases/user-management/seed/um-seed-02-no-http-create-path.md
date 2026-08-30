# UM-SEED-02 · No HTTP create path for User

**Trace:** §4.17 ("creating employees via API or UI is out of scope"); spine AD-25 (no `POST /users`)

## Scenario

**Given** the application is running after the population import has completed.

**When** any client, authenticated or not, calls `POST /users`.

**Then** the route is absent or permanently rejected — there is no product create-path, regardless of caller identity or permissions.

**Preconditions:** [fixture](../README.md#canonical-personas); population already imported (UM-SEED-01).

## Test

### Test 1 — unauthenticated

- **inputURL:** `POST /users`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "" },
    "body": { "firstName": "Nina", "lastName": "New", "workEmail": "nina.new@company.example" }
  }
  ```
- **expectedResult:** `404` (route does not exist) — never `401`, since that would imply a route the caller merely lacks credentials for.

### Test 2 — HR Admin (Root)

- **inputURL:** `POST /users`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" },
    "body": { "firstName": "Nina", "lastName": "New", "workEmail": "nina.new@company.example" }
  }
  ```
- **expectedResult:** `404`; no `User` row is created for the submitted email — holding the HR Admin functional role does not unlock a create path, because none exists (§2.2: HR Admin grants no data access, and this isn't a data-access question at all — the capability itself was never built).
