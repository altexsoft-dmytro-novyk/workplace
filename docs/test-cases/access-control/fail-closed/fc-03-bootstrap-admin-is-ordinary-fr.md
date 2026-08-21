# AC-FC-03 · Bootstrap admin power is an ordinary, delegable, revocable functional role

**Trace:** AD-12 (no superuser derived from data shape; seeded HR Admin FR)

## Scenario

**Given** Root's power comes only from the seeded HR Admin role.

**When** Root delegates the role to Ida through the ordinary membership API, and Ida then revokes Root.

**Then** both operations succeed, and afterwards Root can neither manage roles (403) nor see more than a colleague — no superuser hides in the data shape.

**Preconditions:** [fixture](../README.md); Root holds the seed-assigned HR Admin role; Ida holds no role

## Test 1 — delegable: Root grants HR Admin to Ida

- **inputURL:** `POST /users/roles/hr-admin/members`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:root>"
    },
    "body": {
      "userId": "ida"
    }
  }
  ```
- **expectedResult:** `200`; Ida is an HR Admin through the ordinary assignment path

## Test 2 — revocable: Ida revokes the seed user

- **inputURL:** `DELETE /users/roles/hr-admin/members/root`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:ida>"
    }
  }
  ```
- **expectedResult:** `200`; Root is no longer a member — nothing special protects the bootstrap user

## Test 3 — admin feature gone

- **inputURL:** `POST /users/roles`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:root>"
    },
    "body": {
      "title": "X"
    }
  }
  ```
- **expectedResult:** `403 Forbidden` — no residual power once the role is gone

## Test 4 — data access gone

- **inputURL:** `GET /users/alice/profile`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:root>"
    }
  }
  ```
- **expectedResult:** `200`; Colleague view — being first, or top-of-tree, grants nothing by itself
