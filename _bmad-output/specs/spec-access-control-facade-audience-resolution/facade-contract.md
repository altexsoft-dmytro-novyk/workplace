# Facade Contract

Authentication establishes a valid session before calling the facade. Controllers map decisions to the denial conventions in `SPEC.md`; they never infer audiences from flags or policy rows.

## Methods

| Method | Output | Required behavior |
| --- | --- | --- |
| `isAllowed(userId, feature)` | `boolean` | Read only live FR policy, permission, and user attachments. Return `false` for no matching permission or a due actor. Never supply target-data access. |
| `resolveAudiences(viewerId, employeeIds)` | Map keyed by every requested target ID | Record only applicable `self`, `reporting`, `project`, `pp`, or fallback `colleague` audiences. Empty input returns an empty map without queries. Self excludes manager columns. Reporting and Project are separate passes. Return no section/feature permission or cached decision. |
| `canAccessSection(viewerId, section, targetEmployeeId)` | `'none' \| 'read' \| 'write'` | Resolve live audiences and merge their base S1–S16 matrix cells by `write > read > none`. Do not serialize fields, decide record visibility, or supply the feature half of a mutation. |

## Request sequence

1. Validate the session and AD-20 due-departure cutoff.
2. Call the relevant facade method or methods.
3. Apply an approved owning-context field/record projection, when the endpoint has one.
4. Map denial without revealing hidden data.

A mutation requires `isAllowed(viewerId, feature) === true`, `canAccessSection(...) === 'write'`, and every narrower command rule. A read must not invoke `isAllowed` merely to turn a data-access denial into a feature denial.

## Phase 1 resolution

- **Self:** `viewerId === targetEmployeeId`; evaluate first and do not merge manager columns.
- **Reporting:** recursively follow only `Relationship.type = 'direct'` reports-to edges through all live ancestors.
- **PP:** resolve only the target's directly assigned `Relationship.type = 'people_partner'` endpoint.
- **Colleague:** fallback for an authenticated employee with no applicable audience above.
- **Project:** return no audience until the timetracker assignment/freshness contract and its AD-1 suite are approved.
- **Department and PP HR line:** return no audience until the Department/HR-boundary contract and its AD-1 suite are approved.

Where non-Self audiences overlap, compute each base matrix cell independently and take the best result. Field and record rules—Project S5, colleague S10/S11, S7/S8 flags, S16 visibility, campaign-author scope, list/export projection—belong to owning-context projection contracts and may only narrow the base result.

## Edge-case matrix

| Scenario | Input/state | Required outcome |
| --- | --- | --- |
| Self wins | Viewer is target and also appears in own reporting chain | Use Self only; do not merge manager cells. |
| Colleague no-access cell | Authenticated unrelated viewer requests S2 | Omit the key and return leak-free `404`. |
| Project withheld | PM shares a project with target, with no other relation | Resolve no Project audience; fall back to Colleague; S2/S3 denied `404`. |
| No cross-kind inheritance | A reports-to-manages a DM who manages project P | A receives no Project reach into P. |
| Broken reports-to edge | Endpoint missing, deleted, or due | Stop the walk; grant neither endpoint nor ancestor through it. |
| Orphan policy | Policy target identifies a deleted project | Join zero members and grant nothing; baseline must prove live join before orphan (FC-02). |
| Department policy | A `targetType: 'department'` row exists | Grant nothing pending the Department contract. |
| Reporting transitivity | Alice reports to Bob; Bob reports to Carol | Carol resolves Reporting for Alice through `direct` edges. |
| PP HR line withheld | Paula is assigned PP and reports to Hana | Paula resolves PP; Hana receives no inherited PP grant. |
| Empty bulk | `resolveAudiences(viewerId, [])` | Return empty map with zero queries; list transport `GET /users?ids=` → `200` `{ "items": [] }`. |
| Integration unavailable | No approved timetracker freshness contract | Project contributes nothing; Self, Reporting, PP, and Colleague continue. |
| Audience merge | Viewer holds Reporting and PP, and later Project after its gate | Per section choose `write > read > none`. |
| Dual gate | Matrix permits write but feature permission is absent | Deny mutation with `403`. |
| FR is not audience | Viewer has feature permission but no target audience | `isAllowed` is true; hidden target section remains `404`. |
| Bootstrap role | Fresh seed | Exactly one user holds the bootstrap HR Admin FR attachment. |
| HR Admin is not data access | Viewer holds the HR Admin functional role and no relationship to the target | `resolveAudiences` grants **no** audience from the FR — HR Admin is configuration-only (v1.5 §2.2); the viewer falls back to Colleague. Data access comes only from §2.1 (relationship-derived audiences) and the separate §2.4 full-profile grant, never from holding a functional role. |
| Due actor | Viewer has a due departure | Deny with `403` before feature or audience resolution (valid session, due cutoff). |
| Due target | Target has a due departure | Current manager/PP gets read-only dismissed-target projection (`firstName`, `lastName`, `workEmail`, `employmentStatus: dismissed`); target absent from `GET /users?status=active`; writes `403`. |
| Due manager/PP endpoint | A walk reaches a due manager or PP | Grant no audience and do not bridge to an ancestor. |
| Due recursion node | Reporting/PP recursion reaches a due intermediate node | Stop at that node; do not grant an ancestor through it. |
| Due share-link authority | Link creator or revoker is due | Recheck fails and the dependent link is leak-free `404`. |

## Project-line gate

**Fixed v1.5 reach (§3.2, §3.3.2):** Reporting line and Project line are **separate matrix columns and separate graph passes** — never merged into one "Manager line." The Project line grants a **strictly narrower** set of sections than Reporting: a Project-line PM/DM sees **no S2 and no S3 at all**, sees **S5 as CV + certificates only**, and sees the rest identically (S6 included). These narrowed positive cells (S2/S3-absent, S5-narrowed) are **out of the Phase-1 stage-1 contract** — Phase 1 only asserts the *withhold* negatives (PM with no other relation resolves no Project audience). Deeper Project-line cell coverage is Platform Epic 6 / `AC-SECTION-MATRIX-01`.

**Fixed v1.5 revocation:** project-derived access withdraws within **15 minutes** of assignment end and after **four hours** of failed sync (§2.1, §5.1).

The future Project pass must consume a separately approved narrow freshness/query seam. That contract must define event versus current-state input, persisted assignment-end and last-successful-sync times, partial/intermittent-sync semantics, and dedicated E2E. It must not widen another audience.

## Department and PP HR-line gate

**Fixed v1.5 behavior:** department management is a **Reporting-line** relation (§2.1); PP HR-line propagation stays within the HR boundary — never an unrestricted `direct` walk labeled “inside HR.”

The future contract must define nested Department membership, manager edges, an indexed traversal, the HR root/boundary predicate, and boundary-negative AD-1 scenarios. Unrestricted `direct` recursion is not an acceptable substitute for “inside HR.”
