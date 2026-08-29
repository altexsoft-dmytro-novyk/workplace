#!/usr/bin/env python3
"""Generate non-matrix Phase 1 scenario files."""
from pathlib import Path

BASE = Path(__file__).resolve().parents[3] / "docs/test-cases/access-control"
FIXTURE = "[fixture](../README.md#canonical-personas)"

FILES: dict[str, str] = {}

# --- audience-derivation ---
AD = BASE / "audience-derivation"

FILES[str(AD / "ac-ad-01-self-exclusivity.md")] = """\
# AC-AD-01 · Self wins over Reporting line on own profile

**Trace:** §3.2 Self · AD-10 · facade-contract.md (Self wins)

## Scenario

**Given** Alice is viewing **her own** profile and also appears in her own reporting chain in seed data.

**When** Alice reads a section where Self and Reporting line cells differ (S6 is `—` for Self but RW for Reporting line).

**Then** only the **Self** column applies — S6 must be absent (`404`), proving manager columns are not merged when `viewerId === targetEmployeeId`.

**Preconditions:** {fixture}; Alice reports to Bob.

## Test

- **inputURL:** `GET /users/<alice-id>/risks`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:Alice>" }},
    "body": {{}}
  }}
  ```
- **expectedResult:** `404`; `risks` key absent — Self `—` cell wins, not Reporting line RW
""".format(fixture=FIXTURE)

FILES[str(AD / "ac-ad-02-reporting-direct.md")] = """\
# AC-AD-02 · Direct Reporting line (unit manager)

**Trace:** §2.1 · §3.2 Reporting line · AD-10

## Scenario

**Given** Bob is Alice's **direct** unit manager via `Relationship type='direct'`.

**When** Bob reads Alice's employment section (Reporting line RW).

**Then** the section is returned — direct reports-to grants Reporting line audience.

**Preconditions:** {fixture}; Bob → Alice direct edge.

## Test

- **inputURL:** `GET /users/<alice-id>/employment`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:Bob>" }},
    "body": {{}}
  }}
  ```
- **expectedResult:** `200`; employment section present
""".format(fixture=FIXTURE)

FILES[str(AD / "ac-ad-03-reporting-transitive.md")] = """\
# AC-AD-03 · Transitive Reporting line

**Trace:** §2.1 · AD-10 · facade-contract.md (Reporting transitivity)

## Scenario

**Given** Alice reports to Bob and Bob reports to Carol, both via `direct` edges.

**When** Carol reads Alice's employment section.

**Then** Carol resolves **Reporting line** for Alice through transitive `direct` recursion.

**Preconditions:** {fixture}; Alice → Bob → Carol chain.

## Test

- **inputURL:** `GET /users/<alice-id>/employment`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:Carol>" }},
    "body": {{}}
  }}
  ```
- **expectedResult:** `200`; employment section present
""".format(fixture=FIXTURE)

FILES[str(AD / "ac-ad-04-pp-direct.md")] = """\
# AC-AD-04 · Directly assigned PP only (Phase 1)

**Trace:** §2.1 · AD-19 · facade-contract.md Phase 1

## Scenario

**Given** Paula is Alice's assigned people partner via `Relationship type='people_partner'`.

**When** Paula reads Alice's personal contacts (PP RW cell).

**Then** access succeeds through the **PP** audience — Phase 1 resolves only the direct PP endpoint.

**Preconditions:** {fixture}; Paula assigned PP for Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/personal-contacts`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:Paula>" }},
    "body": {{}}
  }}
  ```
- **expectedResult:** `200`; personal-contacts section present
""".format(fixture=FIXTURE)

FILES[str(AD / "ac-ad-05-colleague-fallback.md")] = """\
# AC-AD-05 · Colleague fallback

**Trace:** §3.2 Colleague · AD-10 · facade-contract.md

## Scenario

**Given** Colin is authenticated and holds no Self, Reporting, PP, or Project audience over Alice.

**When** Colin reads Alice's identity card (Colleague **R** whitelist).

**Then** S1 is returned; S2 is denied (`404`) — Colleague is the fallback audience with whitelist-only beyond S1.

**Preconditions:** {fixture}; Colin unrelated to Alice.

## Test 1 — whitelist allowed

- **inputURL:** `GET /users/<alice-id>`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:Colin>" }},
    "body": {{}}
  }}
  ```
- **expectedResult:** `200`; identity fields present (S1 whitelist)

## Test 2 — non-whitelist denied

- **inputURL:** `GET /users/<alice-id>/personal-contacts`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:Colin>" }},
    "body": {{}}
  }}
  ```
- **expectedResult:** `404`; section absent (Colleague `—` cell)
""".format(fixture=FIXTURE)

FILES[str(AD / "ac-ad-06-project-withheld.md")] = """\
# AC-AD-06 · Project line withheld in Phase 1

**Trace:** facade-contract.md (Project withheld) · AD-10

## Scenario

**Given** Pete is PM on a project shared with Alice and has **no** Reporting, PP, or other relation to Alice.

**When** Pete requests S2 (Project line would be `—`; Colleague is also `—` for S2).

**Then** Phase 1 resolves **no Project audience**; Pete falls back to Colleague and is denied leak-free `404`.

**Preconditions:** {fixture}; Alice, Pete, Dave on same project; Pete unrelated otherwise.

## Test

- **inputURL:** `GET /users/<alice-id>/personal-contacts`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:Pete>" }},
    "body": {{}}
  }}
  ```
- **expectedResult:** `404`; personal-contacts absent — Project withheld, Colleague `—`
""".format(fixture=FIXTURE)

FILES[str(AD / "ac-ad-07-no-cross-kind-inheritance.md")] = """\
# AC-AD-07 · No cross-kind inheritance into Project line

**Trace:** §2.1 · facade-contract.md (No cross-kind inheritance)

## Scenario

**Given** Frank manages Dave by **reports-to**, and Dave is DM on Alice's project, but Frank holds **no** project-management policy for that project.

**When** Frank requests Alice's risks (Reporting line RW would apply only via reports-to path to Dave, not project members).

**Then** Frank does **not** inherit Project-line reach into Alice's project; without Reporting line to Alice, access is denied.

**Preconditions:** {fixture}; Frank → Dave reports-to; Dave DM on Alice's project; Frank not on project.

## Test

- **inputURL:** `GET /users/<alice-id>/risks`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:Frank>" }},
    "body": {{}}
  }}
  ```
- **expectedResult:** `404`; risks absent — no Reporting line to Alice, no Project line in Phase 1
""".format(fixture=FIXTURE)

FILES[str(AD / "ac-ad-08-broken-reports-to-edge.md")] = """\
# AC-AD-08 · Broken reports-to edge stops walk

**Trace:** AD-11 · facade-contract.md (Broken reports-to edge)

## Scenario

**Given** Alice's `reportsToUserId` points at a **deleted or missing** user (orphan edge).

**When** Carol (above the break) attempts to read Alice's employment via Reporting line recursion.

**Then** the walk stops at the orphan — neither the broken endpoint nor ancestors through it grant access (fail-closed).

**Preconditions:** {fixture}; Alice's direct manager edge is broken (deleted endpoint user).

## Test

- **inputURL:** `GET /users/<alice-id>/employment`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:Carol>" }},
    "body": {{}}
  }}
  ```
- **expectedResult:** `404`; employment absent — transitive Reporting line does not bridge the orphan
""".format(fixture=FIXTURE)

FILES[str(AD / "ac-ad-09-orphan-policy.md")] = """\
# AC-AD-09 · Orphan policy grants nothing

**Trace:** AD-11 · facade-contract.md (Orphan policy)

## Scenario

**Given** Dave holds a project-management **policy** whose `targetId` references a **deleted** project (zero join members).

**When** Dave requests Alice's employment.

**Then** the orphan policy contributes no audience — fail-closed zero grant.

**Preconditions:** {fixture}; Dave has PM policy row pointing at deleted project; no other relation to Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/employment`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:Dave>" }},
    "body": {{}}
  }}
  ```
- **expectedResult:** `404`; `employment` key absent
""".format(fixture=FIXTURE)

FILES[str(AD / "ac-ad-10-department-policy-withheld.md")] = """\
# AC-AD-10 · Department policy withheld in Phase 1

**Trace:** AD-10 · facade-contract.md (Department policy)

## Scenario

**Given** Eve holds a `targetType:'department'` management policy but Phase 1 does not walk department edges.

**When** Eve requests Alice's employment.

**Then** the department policy contributes **no audience** until the Department contract is approved.

**Preconditions:** {fixture}; Eve has department policy row; no reports-to/PP relation to Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/employment`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:Eve>" }},
    "body": {{}}
  }}
  ```
- **expectedResult:** `404`; employment absent — department walk withheld
""".format(fixture=FIXTURE)

FILES[str(AD / "ac-ad-11-pp-hr-line-withheld.md")] = """\
# AC-AD-11 · PP HR-line withheld in Phase 1

**Trace:** AD-19 · facade-contract.md (PP HR line withheld)

## Scenario

**Given** Paula is Alice's assigned PP and reports to Hana, but Phase 1 does **not** propagate PP audience up the HR line.

**When** Hana requests Alice's personal contacts (PP RW cell).

**Then** Hana receives **no** inherited PP grant — only Paula resolves PP in Phase 1.

**Preconditions:** {fixture}; Paula PP for Alice; Paula → Hana direct edge.

## Test

- **inputURL:** `GET /users/<alice-id>/personal-contacts`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:Hana>" }},
    "body": {{}}
  }}
  ```
- **expectedResult:** `404`; section absent — PP HR-line withheld
""".format(fixture=FIXTURE)

FILES[str(AD / "ac-ad-12-empty-bulk.md")] = """\
# AC-AD-12 · Empty bulk resolution

**Trace:** AD-10 · facade-contract.md (Empty bulk)

## Scenario

**Given** Bob is authenticated.

**When** bulk audience resolution runs with an **empty** target id list via `GET /users?ids=`.

**Then** the resolver returns an empty result immediately with **zero graph queries** — no fail-open defaults.

**Preconditions:** {fixture}; empty `ids` query parameter.

## Test

- **inputURL:** `GET /users?ids=`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:Bob>" }},
    "body": {{}}
  }}
  ```
- **expectedResult:** `200`; body exactly `{{ "items": [] }}`; stage 2 asserts zero resolver queries via query-count hook
""".format(fixture=FIXTURE)

FILES[str(AD / "ac-ad-13-audience-merge.md")] = """\
# AC-AD-13 · Multi-audience merge (Reporting + PP)

**Trace:** §3.2 · AD-10 · facade-contract.md (Audience merge)

## Scenario

**Given** **Morgan** is MergeAlice's direct unit manager **and** assigned people partner — both Reporting line and PP audiences apply.

**When** Morgan reads and writes sections where the two columns differ (S2: Reporting **R**, PP **RW**).

**Then** per-section merge chooses the best permission: read succeeds from either column; write succeeds because PP **RW** wins over Reporting **R**.

**Preconditions:** {fixture}; MergeAlice → Morgan on both `direct` and `people_partner` edges.

## Test 1 — merged read (Reporting R sufficient)

- **inputURL:** `GET /users/<merge-alice-id>/personal-contacts`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:Morgan>" }},
    "body": {{}}
  }}
  ```
- **expectedResult:** `200`; `personalcontacts` present; `personalPhone` or `residentialAddress` present

## Test 2 — merged write (PP RW wins)

- **inputURL:** `PATCH /users/<merge-alice-id>/personal-contacts`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:Morgan>" }},
    "body": {{ "personalPhone": "+10000000099" }}
  }}
  ```
- **expectedResult:** `200`; `personalPhone` updated — merged best-of RW from PP over Reporting R

## Test 3 — section where Reporting is RW but PP is R (S6)

- **inputURL:** `POST /users/<merge-alice-id>/risks`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:Morgan>" }},
    "body": {{ "level": "medium", "description": "Merge proof risk" }}
  }}
  ```
- **expectedResult:** `201`; risk persisted — Reporting-line RW wins over PP R on S6
""".format(fixture=FIXTURE)

# AD-14 through 18 - departure and integration
FILES[str(AD / "ac-ad-14-due-actor.md")] = """\
# AC-AD-14 · Due actor denied before resolution

**Trace:** AD-20 · facade-contract.md (Due actor)

## Scenario

**Given** **DueDan** has a due departure (effective date reached) but still has a valid session token.

**When** DueDan requests any profile section.

**Then** access is denied with **`403`** before feature or audience resolution — due actor cutoff (AD-20).

**Preconditions:** {fixture}; DueDan has scheduled departure at or past effective date.

## Test

- **inputURL:** `GET /users/<alice-id>`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:DueDan>" }},
    "body": {{}}
  }}
  ```
- **expectedResult:** `403`; no profile body — due actor denied before AccessControl
""".format(fixture=FIXTURE)

FILES[str(AD / "ac-ad-15-due-target.md")] = """\
# AC-AD-15 · Due target dismissed projection

**Trace:** AD-20 · §4.16 · facade-contract.md (Due target)

## Scenario

**Given** **AliceDue** has a due departure and Bob is her current direct manager.

**When** Bob reads or mutates AliceDue's profile.

**Then** Bob receives only the approved **read-only dismissed-target** projection (identity subset + dismissed employment status); AliceDue is absent from default active lists; writes are denied.

**Preconditions:** {fixture}; AliceDue has a due departure; Bob is her direct manager.

## Test 1 — dismissed read

- **inputURL:** `GET /users/<alice-due-id>`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:Bob>" }},
    "body": {{}}
  }}
  ```
- **expectedResult:** `200`; `firstName`, `lastName`, `workEmail` present; `employmentStatus: dismissed` present; `personalcontacts`, `risks`, and other non-projection sections **absent**

## Test 2 — absent from active list

- **inputURL:** `GET /users?status=active`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:Bob>" }},
    "body": {{}}
  }}
  ```
- **expectedResult:** `200`; `items` array contains no entry with id `<alice-due-id>`

## Test 3 — dismissed-target write denied

- **inputURL:** `PATCH /users/<alice-due-id>/employment`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:Bob>" }},
    "body": {{ "grade": "L5" }}
  }}
  ```
- **expectedResult:** `403`; no persisted change — dismissed target is read-only
""".format(fixture=FIXTURE)

FILES[str(AD / "ac-ad-16-due-manager-endpoint.md")] = """\
# AC-AD-16 · Due manager endpoint grants no audience

**Trace:** AD-20 · facade-contract.md (Due manager/PP endpoint)

## Scenario

**Given** Alice reports to **DueBob** whose departure is due, and Carol is above DueBob.

**When** Carol reads Alice's employment via Reporting line recursion.

**Then** the due manager endpoint grants **no** audience and cannot bridge Carol to Alice.

**Preconditions:** {fixture}; DueBob due departure; Alice → DueBob → Carol.

## Test

- **inputURL:** `GET /users/<alice-id>/employment`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:Carol>" }},
    "body": {{}}
  }}
  ```
- **expectedResult:** `404`; employment absent — due endpoint breaks walk
""".format(fixture=FIXTURE)

FILES[str(AD / "ac-ad-17-due-recursion-node.md")] = """\
# AC-AD-17 · Due intermediate node stops recursion

**Trace:** AD-20 · facade-contract.md (Due recursion node)

## Scenario

**Given** Alice reports to **DueMid** (due departure) who reports to Carol.

**When** Carol attempts Reporting line access to Alice.

**Then** traversal stops at the due node — Carol does not inherit access **through** DueMid.

**Preconditions:** {fixture}; DueMid due; Alice → DueMid → Carol.

## Test

- **inputURL:** `GET /users/<alice-id>/employment`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:Carol>" }},
    "body": {{}}
  }}
  ```
- **expectedResult:** `404`; employment absent
""".format(fixture=FIXTURE)

FILES[str(AD / "ac-ad-18-integration-unavailable.md")] = """\
# AC-AD-18 · Project integration unavailable — other audiences continue

**Trace:** facade-contract.md (Integration unavailable) · AD-10

## Scenario

**Given** No approved timetracker freshness contract exists (Phase 1 default).

**When** Bob (Reporting line) and Paula (PP) read Alice's employment while Pete (PM on shared project) is denied Project line.

**Then** Self, Reporting, PP, and Colleague resolution continue normally; Project contributes nothing.

**Preconditions:** {fixture}; standard Phase 1 seed.

## Test 1 — Reporting continues

- **inputURL:** `GET /users/<alice-id>/employment`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:Bob>" }},
    "body": {{}}
  }}
  ```
- **expectedResult:** `200`; employment present

## Test 2 — Project withheld

- **inputURL:** `GET /users/<alice-id>/employment`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:Pete>" }},
    "body": {{}}
  }}
  ```
- **expectedResult:** `404`; employment absent for PM without other audience
""".format(fixture=FIXTURE)

# --- fail-closed ---
FC = BASE / "fail-closed"
FILES[str(FC / "ac-fc-01-empty-reports-to.md")] = """\
# AC-FC-01 · Empty reportsTo grants nothing

**Trace:** AD-11 · §2.1

## Scenario

**Given** **TopLee** has no `reportsToUserId` (top of tree) and no PP assignment to Alice.

**When** TopLee requests Alice's employment.

**Then** empty reports-to grants **nothing** — TopLee has no Reporting-line path to Alice and receives leak-free `404`.

**Preconditions:** {fixture}; TopLee at tree top with empty `reportsToUserId`; Carol reaches Alice only via Bob chain below TopLee.

## Test 1 — empty reportsTo grants nothing

- **inputURL:** `GET /users/<alice-id>/employment`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:TopLee>" }},
    "body": {{}}
  }}
  ```
- **expectedResult:** `404`; `employment` key absent — empty edge grants nothing

## Test 2 — descendant walk is normal transitive Reporting line

- **inputURL:** `GET /users/<alice-id>/employment`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:Carol>" }},
    "body": {{}}
  }}
  ```
- **expectedResult:** `200`; `employment` present with `grade` and `position` — Carol reaches Alice through Bob chain, not via empty-edge magic
""".format(fixture=FIXTURE)

FILES[str(FC / "ac-fc-02-orphaned-policy-row.md")] = """\
# AC-FC-02 · Orphaned policy row after target delete

**Trace:** AD-11 · AD-12

## Scenario

**Given** Pete holds a live project-management policy joined to the shared project with Alice, granting Project-line S5 (CV and certificates only).

**When** the policy's project target is hard-deleted so the row becomes orphan.

**Then** the join yields zero members and grants zero access — fail-closed (must not fail-open).

**Preconditions:** {fixture}; Pete PM policy on live shared project with Alice membership; seeded certificate on Alice.

## Test 1 — baseline effective grant (live policy join)

- **inputURL:** `GET /users/<alice-id>/documents`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:Pete>" }},
    "body": {{}}
  }}
  ```
- **expectedResult:** `200`; `documents` present; at least one item with `type` in `{{cv, certificate}}` — sole fail-closed-suite project-line positive proving live policy join

## Test 2 — after orphan

- **stateChange:** hard-delete the policy's project target; orphan policy row remains until sweep

- **inputURL:** `GET /users/<alice-id>/documents`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:Pete>" }},
    "body": {{}}
  }}
  ```
- **expectedResult:** `404`; `documents` key absent — orphan policy fail-closed; no fail-open join
""".format(fixture=FIXTURE)

FILES[str(FC / "ac-fc-03-bootstrap-admin-revocable.md")] = """\
# AC-FC-03 · Bootstrap HR Admin is ordinary revocable FR

**Trace:** AD-12 · §2.2

## Scenario

**Given** Root holds the seeded bootstrap HR Admin FR and Ida is granted a second admin attachment.

**When** Ida revokes Root's HR Admin attachment and Root requests a configuration-only `/roles` operation.

**Then** Root loses the FR like any other holder — no superuser derived from data shape.

**Preconditions:** {fixture}; Root bootstrap admin; Ida delegated second admin.

## Test 1 — baseline configuration access

- **inputURL:** `GET /roles`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:Root>" }},
    "body": {{}}
  }}
  ```
- **expectedResult:** `200`; role catalog readable with HR Admin FR

## Test 2 — revoke Root

- **inputURL:** `DELETE /users/<root-id>/policies/<root-hr-admin-policy-id>`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:Ida>" }},
    "body": {{}}
  }}
  ```
- **expectedResult:** `204`; attachment removed

## Test 3 — Root denied

- **inputURL:** `GET /roles`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:Root>" }},
    "body": {{}}
  }}
  ```
- **expectedResult:** `403`; bootstrap admin is ordinary revocable FR
""".format(fixture=FIXTURE)

# --- auth ---
AU = BASE / "auth"
FILES[str(AU / "ac-au-01-profile-read-unauthenticated.md")] = """\
# AC-AU-01 · Profile read rejects missing token

**Trace:** §3.3.4 · AD-1 global 401 rule

## Scenario

**Given** no valid session.

**When** an unauthenticated client reads a user profile.

**Then** the API returns `401` before any audience reasoning.

**Preconditions:** {fixture}.

## Test

- **inputURL:** `GET /users/<alice-id>`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "" }},
    "body": {{}}
  }}
  ```
- **expectedResult:** `401`; no profile body
""".format(fixture=FIXTURE)

FILES[str(AU / "ac-au-02-section-read-unauthenticated.md")] = """\
# AC-AU-02 · Section read rejects missing token

**Trace:** §3.3.4 · AD-1 global 401 rule

## Scenario

**Given** no valid session.

**When** an unauthenticated client reads a owned-collection section.

**Then** `401` before tier resolution.

**Preconditions:** {fixture}.

## Test

- **inputURL:** `GET /users/<alice-id>/employment`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "" }},
    "body": {{}}
  }}
  ```
- **expectedResult:** `401`
""".format(fixture=FIXTURE)

FILES[str(AU / "ac-au-03-section-write-unauthenticated.md")] = """\
# AC-AU-03 · Section write rejects missing token

**Trace:** §3.3.4 · AD-1 global 401 rule

## Scenario

**Given** no valid session.

**When** an unauthenticated client attempts a section mutation.

**Then** `401` before tier or feature checks.

**Preconditions:** {fixture}.

## Test

- **inputURL:** `PATCH /users/<alice-id>/employment`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "" }},
    "body": {{ "grade": "L5" }}
  }}
  ```
- **expectedResult:** `401`
""".format(fixture=FIXTURE)

# --- functional-permission ---
FP = BASE / "functional-permission"
FILES[str(FP / "ac-fp-01-dual-gate-write-denied.md")] = """\
# AC-FP-01 · Dual gate — matrix write without feature permission

**Trace:** §2.2 · facade-contract.md (Dual gate)

## Scenario

**Given** Bob has Reporting line **write** on Alice's employment but lacks the feature permission required for the mutation command.

**When** Bob PATCHes employment.

**Then** mutation is denied with `403` even though the matrix cell is RW — both dimensions must permit writes.

**Preconditions:** {fixture}; Bob's FR attachment excludes the employment-edit permission (seed variant).

## Test

- **inputURL:** `PATCH /users/<alice-id>/employment`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:Bob>" }},
    "body": {{ "grade": "L5" }}
  }}
  ```
- **expectedResult:** `403`; no persisted change — dual gate
""".format(fixture=FIXTURE)

FILES[str(FP / "ac-fp-02-fr-without-audience.md")] = """\
# AC-FP-02 · Feature permission does not grant data access

**Trace:** §2.3 · facade-contract.md (FR is not audience)

## Scenario

**Given** Ida holds a functional permission (e.g. *create form campaigns*) but **no** audience over Alice.

**When** Ida requests Alice's employment section.

**Then** `isAllowed` may be true for her feature, but the hidden section remains leak-free `404` — FR never widens data access.

**Preconditions:** {fixture}; Ida custom FR only; Colin-level relationship to Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/employment`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:Ida>" }},
    "body": {{}}
  }}
  ```
- **expectedResult:** `404`; employment absent — FR is not audience
""".format(fixture=FIXTURE)

FILES[str(FP / "ac-fp-03-root-no-default-profile-access.md")] = """\
# AC-FP-03 · HR Admin has no default profile data access

**Trace:** §2.2 · §3.1 · access-control.md

## Scenario

**Given** Root holds HR Admin configuration FR only and no relationship-derived audience over Alice.

**When** Root reads Alice's employment.

**Then** access is denied like any unrelated employee — HR Admin is **not** a matrix audience.

**Preconditions:** {fixture}; Root unrelated to Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/employment`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:Root>" }},
    "body": {{}}
  }}
  ```
- **expectedResult:** `404`; employment absent — configuration FR does not imply data access
""".format(fixture=FIXTURE)

# --- S7 special negatives ---
MRL = BASE / "matrix/reporting-line"
FILES[str(MRL / "s07-unflagged-note-absent-for-employee.md")] = """\
# AC-M-S07-EMP · Employee sees only employee-flagged notes

**Trace:** §3.2 S7 · §3.3 fn 3 · §9 DoD

## Scenario

**Given** Alice is the target and a management note exists **without** *visible for employee* flag.

**When** Alice reads management notes.

**Then** the unflagged note is **absent** from the payload — not null, not empty list with placeholder.

**Preconditions:** {fixture}; seeded unflagged note on Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/notes`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:Alice>" }},
    "body": {{}}
  }}
  ```
- **expectedResult:** `200`; unflagged note id **absent** from items
""".format(fixture=FIXTURE)

FILES[str(MRL / "s07-unflagged-note-visible-to-reporting-line.md")] = """\
# AC-M-S07-RL · Reporting line sees unflagged management notes

**Trace:** §3.2 S7 · §9 DoD

## Scenario

**Given** Bob is Alice's direct manager and a note exists without *visible for employee*.

**When** Bob reads management notes.

**Then** the unflagged note is present — Reporting line RW includes manager-only notes.

**Preconditions:** {fixture}; same unflagged note as AC-M-S07-EMP.

## Test

- **inputURL:** `GET /users/<alice-id>/notes`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:Bob>" }},
    "body": {{}}
  }}
  ```
- **expectedResult:** `200`; unflagged note present in items
""".format(fixture=FIXTURE)

# S1 special
MS = BASE / "matrix/self"
FILES[str(MS / "s01-self-write-photo.md")] = """\
# AC-M-S01-SELF-W-PHOTO · Self uploads own photo

**Trace:** §3.2 S1 · Self photo RW

## Scenario

**Given** Alice views her own identity card where only **photo** is Self-writable.

**When** Alice uploads a new photo.

**Then** the upload succeeds — distinct from identity-field PATCH.

**Preconditions:** {fixture}.

## Test

- **inputURL:** `PUT /users/<alice-id>/photo`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:Alice>" }},
    "body": {{ "contentType": "image/png" }}
  }}
  ```
- **expectedResult:** `200` or `204`; `photoUrl` updated on follow-up `GET /users/<alice-id>`
""".format(fixture=FIXTURE)

FILES[str(MRL / "s01-reporting-line-write-derived-field-denied.md")] = """\
# AC-M-S01-RL-W-DER · Reporting line cannot PATCH derived S1 fields

**Trace:** §3.2 fn 1 · AD-10

## Scenario

**Given** Bob has Reporting line RW on S1 for stored identity fields.

**When** Bob PATCHes Alice's **manager** field through the identity endpoint.

**Then** the mutation is rejected — manager/PP/mentor/projects are derived read-only on S1; org changes use relationship commands.

**Preconditions:** {fixture}; Alice reports to Bob.

## Test

- **inputURL:** `PATCH /users/<alice-id>`
- **inputRequest:**
  ```json
  {{
    "headers": {{ "authorization": "Bearer <token:Bob>" }},
    "body": {{ "managerId": "<other-manager-id>" }}
  }}
  ```
- **expectedResult:** `403` or `400`; manager field unchanged — derived field immutability
""".format(fixture=FIXTURE)

# S16 visibility
for vis, actor, field, present in [
    ("management", "Bob", "managementOnlyField", True),
    ("employee", "Alice", "employeeVisibleField", True),
    ("colleague", "Colin", "colleagueVisibleField", True),
    ("colleague-hidden", "Colin", "managementOnlyField", False),
]:
    sid = f"ac-m-s16-{vis}.md"
    folder = BASE / "matrix/colleague" if actor == "Colin" else (BASE / "matrix/self" if actor == "Alice" else BASE / "matrix/reporting-line")
    if present:
        exp = f"`200`; `{field}` present when visibility allows"
        then = "the field is present for this visibility level."
    else:
        exp = f"`200`; `{field}` **absent**; `colleagueVisibleField` present — colleague cannot infer management-only value"
        then = "the management-only field is absent while colleague-visible fields remain (§3.3.6)."
    vis_label = "management" if vis == "colleague-hidden" else vis.split("-")[0]
    FILES[str(folder / sid)] = (
        f"# AC-M-S16-{vis.upper()} · S16 field visibility ({vis})\n\n"
        f"**Trace:** §3.3.6 · S16\n\n"
        f"## Scenario\n\n"
        f"**Given** {actor} reads Alice's custom fields and `{field}` has visibility *{vis_label}*.\n\n"
        f"**When** {actor} GETs custom fields.\n\n"
        f"**Then** {then}\n\n"
        f"**Preconditions:** {FIXTURE}; seeded custom field definitions per visibility.\n\n"
        f"## Test\n\n"
        f"- **inputURL:** `GET /users/<alice-id>/custom-fields`\n"
        f"- **inputRequest:**\n"
        f"  ```json\n"
        f"  {{\n"
        f'    "headers": {{ "authorization": "Bearer <token:{actor}>" }},\n'
        f'    "body": {{}}\n'
        f"  }}\n"
        f"  ```\n"
        f"- **expectedResult:** {exp}\n"
    )


def main() -> None:
    for path, content in FILES.items():
        p = Path(path)
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content, encoding="utf-8")
    print(f"Wrote {len(FILES)} hand-authored scenario files")


if __name__ == "__main__":
    main()
