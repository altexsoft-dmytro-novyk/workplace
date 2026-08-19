# AC-UR-07 · Granted permission unlocks the feature

**Trace:** §2.3 (granular feature permissions) · §4.12
**Preconditions:** [fixture](../../README.md); Ida holds role IT Campaigns with the single permission *create form campaigns*

## Test

- **inputURL:** `POST /campaigns`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:ida>"
    },
    "body": {
      "title": "Security awareness",
      "link": "https://forms.example/x",
      "dueDate": "2026-09-15",
      "audienceFilter": {
        "department": "IT"
      }
    }
  }
  ```
- **expectedResult:** `201`; campaign created
