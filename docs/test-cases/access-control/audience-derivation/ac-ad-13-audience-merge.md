# AC-AD-13 · Multi-audience merge (Reporting + PP)

**Trace:** §3.2 · AD-10 · facade-contract.md (Audience merge)

## Scenario

**Given** **Morgan** is MergeAlice's direct unit manager **and** assigned people partner — both Reporting line and PP audiences apply.

**When** Morgan reads and writes sections where the two columns differ (S2: Reporting **R**, PP **RW**).

**Then** per-section merge chooses the best permission: read succeeds from either column; write succeeds because PP **RW** wins over Reporting **R**.

**Preconditions:** [fixture](../README.md#canonical-personas); MergeAlice → Morgan on both `direct` and `people_partner` edges.

## Test 1 — merged read (Reporting R sufficient)

- **inputURL:** `GET /users/<merge-alice-id>/personal-contacts`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Morgan>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; `personalcontacts` present; `personalPhone` or `residentialAddress` present

## Test 2 — merged write (PP RW wins)

- **inputURL:** `PATCH /users/<merge-alice-id>/personal-contacts`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Morgan>" },
    "body": { "personalPhone": "+10000000099" }
  }
  ```
- **expectedResult:** `200`; `personalPhone` updated — merged best-of RW from PP over Reporting R

## Test 3 — section where Reporting is RW but PP is R (S6)

- **inputURL:** `POST /users/<merge-alice-id>/risks`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Morgan>" },
    "body": { "level": "medium", "description": "Merge proof risk" }
  }
  ```
- **expectedResult:** `201`; risk persisted — Reporting-line RW wins over PP R on S6
