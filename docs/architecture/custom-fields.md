# Custom Fields (PM/AD-32)

**Status: design approved 2026-09-02. Do not keep using `User.customFields` jsonb as the query path.**

## Binding rule

Column-per-field schema is forbidden (§6). New fields must be filterable and sortable on All Employees without a deploy or migration (§4.1).

## Storage

- `CustomFieldDefinition {id uuidv7, key unique, type, visibility, options jsonb, createdAt}`  
  Types: `text | number | date | single-select | multi-select | boolean`.  
  Visibility: `management` (default) | `employee` | `colleague` (§3.3.6).
- `CustomFieldValue {userId, fieldId, valueText, valueNumber, valueDate, valueBool, valueJson}`  
  One row per user×field. Multi-select uses `valueJson`. Partial unique `(userId, fieldId)`.
- Btree indexes: `(fieldId, valueText)`, `(fieldId, valueNumber)`, `(fieldId, valueDate)`, `(fieldId, valueBool)`.

Directory filter/sort reads `CustomFieldValue`, never `User.customFields`. Access Control visibility is applied **before** filter execution so a hidden value cannot be inferred.

## Transition

`User.customFields jsonb` exists in the current schema as an interim bag. It is not the target. Do not build new filters against it (TD-12).
