# Custom Fields — NOT YET DECIDED

**Status: open. Do not build, do not improvise a storage model.**

The storage design (EAV table vs JSONB on the profile, indexing strategy, filter integration) has not been decided with the architect yet. Any implementation before that decision will be rejected.

## What is already fixed (from the requirements — will bind the design)

- HR Admin and managers define new fields (text, number, date, single-select, multi-select, boolean) at runtime: **no deploy, no schema migration, no developer** (§4.1).
- Every custom field is immediately usable as a filter and a column on All Employees, sortable included (§4.1). A column-per-field schema will not survive this (§6).
- Each field carries its own visibility level, set at creation: *management* (default), *employee*, or *colleague* (§3.3.5). Filters and list columns respect it — a user must not be able to **infer** a value they cannot see through filtering.
- Field values on profiles are section S16 of the access matrix (§3.2).
- The All Employees list with 500+ records, arbitrary filters and derived fields must respond within 2 seconds including permission resolution (§7).

When the decision lands it will be added to the spine as a new `AD-n` and this file will be rewritten.
