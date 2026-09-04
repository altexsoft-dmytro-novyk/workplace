# Authentication and the canonical requirement set — decision paper

**Status: PROPOSAL. Nothing here has been applied.** No coverage YAML, no
`verify-coverage.py`, no PRD, no `docs/project-requirements.md`, no
`approvals.yaml`, no scenario document and no test file was edited to produce
it. Every line number below was read from the working tree.

Date: 2026-09-04 · workspace `0114d1c` · backend `25afb15`
Companion to `BRIEFING.md`. Blocks the `auth/` cluster in `um-decisions.md`.

---

## 1. Headline — CONFIRMED, and it is the more serious of the two cases

**A normative section exists. No `PM-FR` was derived from its authentication
clause.** This is a derivation failure in the coverage model, not a product that
forgot to write authentication down.

The normative sentence is one line:

> `docs/project-requirements.md:519`
> `- **No SSO.** Entra ID is not part of this scope. Authentication is your own implementation over the seeded population, and the seeded record is the identity anchor.`

It sits under `docs/project-requirements.md:514`, `### 4.17 Population,
departments and authentication` — a section whose own heading names
authentication as one of its three subjects. It is restated as a scope boundary
at `docs/project-requirements.md:633` (`- **SSO.** No Entra ID; authentication is
over the seeded population.`).

That is a positive instruction to build something: *implement authentication
yourself, anchored on the seeded record.* It is not merely an exclusion.

### 1.1 The twist that made this invisible — check 7 already "passes" on §4.17

§4.17 **is** cited in the coverage model, exactly once:

```
global-fr-epic-story-coverage.yaml:839-847
  - id: PM-FR-42
    normative_refs: ["§4.17"]
    summary: Nested department management and exactly-one membership
```

`PM-FR-42` covers the **departments** half of §4.17 (lines 522-524) and nothing
else. Check 7 (`verify-coverage.py:139-150`) matches a *section number* against
`normative_refs`; it has no concept of a clause. So §4.17 reports as covered
while the authentication clause at line 519 has no owning requirement. Check 7
is structurally unable to see this, and it is not a defect I am asking anyone to
fix here — it is the reason the gap survived every prior pass.

### 1.2 The original claim, re-verified

Searching `global-fr-epic-story-coverage.yaml` for
`auth|login|sign.?in|session|magic|password|identity|credential` returns only:

- `PM-FR-4` — *"Assemble authorized responses server-side on every request"* (line 160)
- `PM-FR-27` — *"Authenticated named-recipient profile sharing"* (line 555)
- the gate ID `SEC-AUTH-01` in nine `gates:` lists, and `TT-IDENTITY-01`
- incidental words: "author", "authorized actor", "identity card"

All authorization or naming. **Nothing about how a person signs in.** No
`UM-FR-2`, `UM-FR-3` or `UM-FR-8` appears anywhere in the model
(`chain-fix/alias-map.json` has 26 aliases; none of the three).

### 1.3 One precision the claim did not carry — the magic link is *not* normative

`docs/project-requirements.md` never says "magic link". Grepping the whole file
for `magic` returns nothing. What §4.17 mandates is *own-implementation
authentication over the seeded population, with the seeded record as identity
anchor, and no SSO*. The magic-link mechanism is the **team's design decision**,
first written down in the User Management PRD:

- `prds/prd-user-management-2026-08-20/prd.md:111` — FR-2 (passwordless, magic
  link to `workEmail` is the sole login mechanism, no password stored)
- `prds/prd-user-management-2026-08-20/prd.md:112` — FR-3 (first and subsequent
  logins share the request/consume flow; import does not establish a session)
- `user-management/epics.md:40` — FR-8, explicitly labelled *derived* from PRD
  FR-2 mechanics, not literally numbered in the PRD

This matters for drafting. A `PM-FR-43` should be written at the **requirement**
altitude (§4.17's mandate), with the magic link recorded as the delivery
mechanism in `notes`. Writing "magic-link authentication" as the canonical
requirement summary would promote a design choice to a normative one and make
the model wrong in the opposite direction.

### 1.4 The capability exists at every other layer

| Layer | Evidence |
| --- | --- |
| Epic | `user-management/epics.md:334` — *## Epic 2: Magic-Link Authentication*, **FRs covered:** FR-2, FR-3, FR-8 |
| Stories | `user-management/epics.md:340` `UM-E2-S2.1`, `:359` `UM-E2-S2.2` |
| FR→Epic map | `user-management/epics.md:94-96` — FR-2/FR-3/FR-8 → Epic 2 |
| Scenarios | 6 documents in `docs/test-cases/user-management/auth/` (`um-auth-01`…`um-auth-06`) |
| Tests | `services/backend/test/user-management/epic-2/{request,consume}-magic-link.e2e-spec.ts` + `fixtures.ts` — AD-1 Stage 2, **committed red**, route absent |
| Partial code | `src/user-management/domain/interfaces/magic-link-dispatcher.port.ts`, `infrastructure/magic-link-dispatcher.fake.ts`, `domain/services/user.service.ts:61` `dispatchMagicLink`, bound at `user-management.module.ts:48` |
| Gate | `blockers.yaml:398` `SEC-AUTH-01`, P0 open — the interim session resolver standing in for this requirement |
| Transition debt | `transition-debt.yaml` TD-02 and TD-05, both `owner: UM-E2`, TD-02 `expiry_trigger: Magic-link session implementation reaches approved production` |
| Sprint status | `implementation-artifacts/user-management/sprint-status.yaml:63-65` — `epic-2: backlog`, both stories `backlog` |

There is **no `AuthController` and no `/auth` route** in `services/backend/src/`
(only `users.controller.ts` and `health.controller.ts`). The three test files say
so themselves and classify every case *red-because-route-missing*.

### 1.5 Two canonical documents already assert a rollup that does not exist

This is the part that turns "omission" into "contradiction", and it is the
strongest single argument in the paper:

- `_bmad-output/specs/spec-user-management-domain/SPEC.md:114`
  `| Magic-link authentication | PM-FR-12–13 | UM-FR-2, UM-FR-3 | UM-E2 | specified |`
- `prds/prd-people-management-2026-08-24/prd.md:199` — user-management's product
  responsibility is listed as *"Seeded identity, **authentication**, profile
  identity, …"* with canonical FRs *"PM-FR-12–14, PM-FR-28–29, PM-FR-41–42"*
- `prds/prd-people-management-2026-08-24/prd.md:578` — *"User Management owns the
  seeded `User` identity anchor, **magic-link authentication**, …"*

Now read the requirements those documents point at:

```
PM-FR-12  normative_refs ["§4.2", "§3.2 S1"]  Section-based profile rendering
PM-FR-13  normative_refs ["§4.3"]             Employee self-service across authorized profile capabilities
PM-FR-14  normative_refs ["§3.2 S1","§4.2","§5.1"]  Source manager, People Partner, mentor, and projects from owning contexts
```

None of the three is about signing in, and none of their `stories:` includes a
`UM-E2` story. The rollup claim in SPEC.md and the canonical PRD is written but
false. **Whichever option is chosen below, one of these two documents has to
change** — either PM-FR-43 lands and both should point at it, or authentication
is declared out of the model and both should stop claiming a canonical parent.
Doing nothing leaves a false traceability statement in two canonical artifacts.

### 1.6 What check 4 currently says, and why it stopped being silent

`verify-coverage.py:68-82` now fails on unmapped stories. `UM-E2-S2.1` and
`UM-E2-S2.2` are two of the five UM entries in the current FAIL:

```
FAIL  every unmapped story is declared in unmapped_story_exemptions
      {'UM': ['UM-E0-S0.2', 'UM-E1-S1.1', 'UM-E1-S1.5', 'UM-E2-S2.1', 'UM-E2-S2.2'], …}
```

The `unmapped_story_exemptions:` key **does not exist in the YAML today** —
`verify-coverage.py:72` reads it with `d.get(...) or []`. Option (b) would create
it. Note this check cannot currently pass under *either* option without also
handling the other nine unmapped stories (PLAT ×6, UM ×3 others, PMC ×2, ENG ×8,
RA ×1) — that is a separate task's problem, and PM-FR-43 removes exactly two
names from it.

---

## 2. Option (a) — add `PM-FR-43`

### 2.1 The exact YAML entry

Insert after `global-fr-epic-story-coverage.yaml:847` (the last line of the
`PM-FR-42` block), immediately before `superseded_work:` at line 848. Two-space
list indent, matching every neighbour:

```yaml
  - id: PM-FR-43
    normative_refs: ["§4.17"]
    summary: Own-implementation authentication over the seeded population
    coverage_status: specified
    aliases: [UM-FR-2, UM-FR-3, UM-FR-8]
    stories:
      - {id: UM-E2-S2.1, sprint_key: 2-1-request-a-magic-link-by-work-email, status: specified}
      - {id: UM-E2-S2.2, sprint_key: 2-2-consume-a-magic-link-token-to-establish-a-session, status: specified}
    epics: [UM-E2]
    gates: [SEC-AUTH-01]
    notes: >
      §4.17 mandates the platform's own authentication over the seeded population with the
      seeded record as identity anchor and no SSO; the requirement is the mandate, not the
      mechanism. Passwordless magic-link request/consume is the team's design choice
      (UM PRD FR-2/FR-3, epics.md derived FR-8) and is recorded here as the delivery, not
      as normative text. No production route exists — there is no AuthController and no
      /auth route in services/backend/src; the outbound dispatcher port and its AD-15 fake
      are bound in the production module (TD-05) and the Epic 2 e2e suites are committed
      red. SEC-AUTH-01 (P0) is the interim session resolver standing in until this lands;
      TD-02 and TD-05 both name UM-E2 as owner. §4.17 is also referenced by PM-FR-42,
      which covers only that section's departments clause.
```

Every field was read from source, not inferred:

- `sprint_key` values are the literals in `sprint-status.yaml:64-65` and in the
  story headings at `user-management/epics.md:340` and `:359`.
- `status: specified` follows the model's own convention — `backlog` in
  `sprint-status.yaml` maps to `specified` here (cf. `UM-E1-S1.2`, `UM-E5-S5.1`).
- `coverage_status: specified` follows check 2's rule (`verify-coverage.py:41-44`)
  and the `PM-FR-41` precedent: stories exist, none implemented.
- `gates: [SEC-AUTH-01]` — the only blocker in `blockers.yaml` that concerns
  authentication. TD-02/TD-05 are transition debt, not blocker IDs, so they
  belong in `notes` and would fail check 6 if put in `gates`.
- **No `workboard_id`.** `stable_workboard_ids` is `[ACF-*, ACM-*, UMAC-*]`
  (`global-fr-epic-story-coverage.yaml:29`) — all access-control. `UM-E2` appears
  in exactly four places outside `chain-fix/` (`transition-debt.yaml:31,126`,
  `SPEC.md:114`, `epics.md:340,359`) and carries no workboard id in any of them.
  Unlike the ACM-0/2/4/8/9 items the sibling access-control task found missing,
  there is no execution-layer id here to bridge to, so the field is correctly
  absent rather than overlooked.

### 2.2 `verify-coverage.py` check 1 — the hard assert, quoted

`verify-coverage.py:32-37`, verbatim:

```python
print("\n1. REQUIREMENT INVENTORY")
ids = [r['id'] for r in reqs]
nums = sorted(int(i.rsplit('-', 1)[1]) for i in ids)
check("exactly 42, no duplicates, no gaps",
      len(ids) == 42 and not [k for k, v in Counter(ids).items() if v > 1] and nums == list(range(1, 43)),
      f"{len(ids)} entries")
```

Adding a 43rd requirement without touching this makes check 1 FAIL on two
clauses at once (`len(ids) == 42` and `nums == list(range(1, 43))`). The precise
edit is three literals on lines 35-37:

```python
check("exactly 43, no duplicates, no gaps",
      len(ids) == 43 and not [k for k, v in Counter(ids).items() if v > 1] and nums == list(range(1, 44)),
      f"{len(ids)} entries")
```

Nothing else in the file is arithmetic on the count. Two comments go stale and
should be corrected in the same commit, though neither changes behaviour:

- `verify-coverage.py:70-71` — *"(UM-E2, the magic-link login epic, sat in this
  bucket unnoticed)"* — becomes a past-tense example rather than a live one.
- `global-coverage/README.md:51` — *"Every `PM-FR-1` through `PM-FR-42` appears
  exactly once"*.

Also carrying the `1..42` phrasing, lower priority and arguably historical
record that should *not* be rewritten: `global-coverage/.memlog.md:7`,
`sprint-change-proposal-2026-09-02-people-management-rebaseline.md:115`,
`gap-validation-2026-09-02.md:14`.

### 2.3 Check 7 — no new section in `docs/project-requirements.md` is required

Check 7 (`verify-coverage.py:139-150`) collects `normative_refs` and asserts every
dotted heading in `docs/project-requirements.md` is covered by one of them.
`§4.17` is already in that set via `PM-FR-42`, so `PM-FR-43` carrying
`normative_refs: ["§4.17"]` leaves check 7 **byte-identical** — it will keep
reporting only the two `[GOOD TO HAVE]` sections (§4.13, §4.14).

**`docs/project-requirements.md` needs no edit.** The normative text already
exists at line 519; the failure was never that the requirement was unwritten, it
was that nothing derived a `PM-FR` from it. Adding a new §4.18 would invent
normative product text an agent has no authority to write, and would gain
nothing — check 7 would then demand a requirement for it, which `PM-FR-43`
already is. If a human later wants the authentication clause promoted out of
§4.17 into its own subsection so it stops sharing a section number with
departments, that is a product-authoring decision, separable from this one, and
it would then want `PM-FR-42` and `PM-FR-43` re-pointed at the split refs.

Optional and not recommended without a ruling: adding `"§3.3"` to `PM-FR-43`'s
`normative_refs` for the `401` half of the denial oracle
(`docs/project-requirements.md:206`, *"Invalid or inactive session → `401`"*).
It would not break check 7, but §3.3 is already owned by the authorization
requirements and double-claiming it blurs the boundary this paper is trying to
draw.

### 2.4 What actually moves

Simulated against the real corpus by running check 8's own resolution logic with
the three aliases added (no file was modified):

| Check | Before | After (a) |
| --- | --- | --- |
| 1 inventory | PASS (42) | PASS (43) **only with the `verify-coverage.py` edit above** |
| 2 status↔stories | PASS | PASS — `specified` + 2 stories |
| 4 forward (yaml→slice) | PASS | PASS — both IDs are literals at `epics.md:340,359` |
| 4 reverse (unmapped) | FAIL, UM list of 5 | still FAIL, UM list of **3** |
| 5 epic refs | PASS | PASS — `\bUM-E2\b` matches inside `UM-E2-S2.1` |
| 6 gates | PASS | PASS — `SEC-AUTH-01` is at `blockers.yaml:398` |
| 7 normative sections | PASS | PASS, unchanged |
| 8 bottom-up | FAIL 317/387 | FAIL **307**/387 · user-management 64 → **54** |

The check-8 movement of 10 breaks down as:

- **5 auth documents resolve with no Trace-line edit at all.** `um-auth-01`…`05`
  cite bare `FR-2`; check 8's own documented normalization
  (`verify-coverage.py:167-170`) rewrites `FR-2` → `UM-FR-2` for a
  `user-management` document, which the new alias then resolves.
- **5 retired `registration/` documents also resolve** — `um-reg-01`, `-04`,
  `-08`, `-09` (cite `FR-2`) and `um-reg-05` (cites `FR-3`). Stated plainly
  because it is a side effect, not a goal. It is *semantically* correct — those
  Trace lines cite FR-2/FR-3 in the same sense (`um-reg-01`: *"no password is
  ever stored"*; `um-reg-05`: *"Registration does not establish a session"*) — but
  the documents are in `um-decisions.md`'s 27-strong `RETIRED_OR_SUPERSEDED` set
  and would ideally be excluded from the oracle rather than resolved by it.
- **`um-auth-06` does not resolve.** It cites no `FR-n` token at all
  (`doc-resolution-table.json` status `NO_TOKENS`; its Trace line names only
  `epics.md Story 2.2`, `DEC-UM-004`, `DEC-UM-012`). It needs one Trace-line
  addition — the ordinary `chain-fix` edit, owned by whoever executes the UM
  trace pass, not by this proposal.

### 2.5 The full edit set for option (a)

1. `global-fr-epic-story-coverage.yaml` — insert the block from §2.1 after line 847.
2. `verify-coverage.py:35-37` — `42`→`43`, `range(1, 43)`→`range(1, 44)`, label text.
3. `verify-coverage.py:70-71` — comment, past-tense the `UM-E2` example. *(cosmetic)*
4. `global-coverage/README.md:51` — `PM-FR-42` → `PM-FR-43`. *(cosmetic)*
5. `spec-user-management-domain/SPEC.md:114` — canonical parent `PM-FR-12–13` → `PM-FR-43`;
   add `PM-FR-43` to that file's `parent_requirements` front matter (lines 7-14).
6. `prd-people-management-2026-08-24/prd.md:199` — add `PM-FR-43` to
   user-management's canonical FR list.
7. `docs/test-cases/user-management/auth/um-auth-06-…md` — one `**Trace:**` line
   addition. *(belongs to the UM trace task, listed for completeness)*

Items 1-2 are load-bearing; 5-6 are the correction of the false rollup in §1.5.
**Nothing else changes**, and no test, no `approvals.yaml`, and no
`docs/project-requirements.md` edit is required.

---

## 3. Option (b) — declare authentication out of the model

Record `UM-E2`'s two stories in a new top-level key:

```yaml
unmapped_story_exemptions:
  - UM-E2-S2.1
  - UM-E2-S2.2
```

The key does not exist yet; check 4 reads it defensively
(`verify-coverage.py:72`). Note that the shipped shape is a **flat list of story
IDs with no reason field** — the check does `s in exempt` — so "recorded with a
reason" means a YAML comment, or a schema change to a mapping. If the reason has
to be machine-readable, option (b) is not free either.

The argument for it: authentication is platform infrastructure. §4.17 spends one
sentence on it and mostly says what *not* to build (no SSO, no Entra ID, no
provisioning). The project has a live precedent for restraint — `.memlog.md:22`
records *"SD-9 escalation: S7 management notes … no owning requirement in
PM-FR-1..42. Product-model gap; no FR was invented."* A team that declined to
invent an FR for S7 might reasonably decline here too.

The costs, stated without softening:

- **The model would permanently report nothing about the login path.** "Is
  authentication covered?" gets no answer from any tool in this repo. `PM-FR-*`
  is the only vocabulary the coverage model, the gate and check 8 speak.
- **The 6 `auth/` scenario documents stay permanently unresolvable.** They cannot
  be exempted the way stories can — check 8 has no exemption mechanism at all
  (`verify-coverage.py:152-188`). They would sit in the check-8 failure count
  forever, or force a second exemption mechanism to be built for documents.
- **`SEC-AUTH-01`, an open P0, would hang off no requirement.** It is currently
  cited as a `gate` on nine *authorization* requirements, none of which owns the
  thing it is actually about. The one blocker whose closure condition is
  literally *"Interim adapters fail closed, or are removed from the production
  module"* would have no requirement to close against.
- **It contradicts two canonical documents** (§1.5). SPEC.md:114 and
  prd-people-management:199/578 both assert authentication has canonical parents.
  Under (b) both statements must be deleted, not merely re-pointed — a larger
  documentation change than option (a) requires.
- **The precedent is not as close as it looks.** S7 management notes have a
  §3.2 matrix row and §3.3 rules but *no epic, no story, no scenario and no
  test*. Authentication has an epic, two stories, six scenarios, three test files
  and partially-landed code. Exempting a story bucket that carries a whole
  delivered-shaped capability is a different act from declining to invent an FR
  for undelivered prose.

Option (b) is cheaper by exactly one line of `verify-coverage.py`. That is the
entire saving.

---

## 4. Recommendation

**Option (a).** The choice is the product owner's and nothing here is applied.

Reasoning, in the order I weight it:

1. The normative text exists (`docs/project-requirements.md:519`). A requirement
   derived from an existing normative sentence is a derivation, not an invention
   — which is the line `BRIEFING.md` rule 3 draws, and this stays on the safe
   side of it.
2. Two canonical documents already claim authentication rolls up to a `PM-FR`.
   Option (a) makes that claim true; option (b) requires deleting it from both.
   Between "make the written claim correct" and "delete the written claim", the
   first is the smaller lie to unwind.
3. An open P0 (`SEC-AUTH-01`) needs a requirement to close against.
4. It is the only option that ever lets the `auth/` scenario documents resolve.
5. The mechanical cost is one YAML block and three literals in one Python line.

**Where option (a) still needs a human ruling, and I did not decide it:** the
`summary` wording in §2.1 deliberately says *"Own-implementation authentication
over the seeded population"* rather than *"Magic-link authentication"*, because
the magic link is a design choice and not normative (§1.3). If the product owner
prefers the requirement to name the mechanism, that is a legitimate call — it
just changes what the canonical set means by "requirement", and it should be
made knowingly rather than by copying the epic's title.

---

## 5. Knock-on — what is waiting on this decision

- **Three aliases are blocked.** `UM-FR-2`, `UM-FR-3` and `UM-FR-8` exist in the
  UM PRD and `epics.md` but in no `PM-FR`. `chain-fix/alias-map.json` has 26
  entries and none of the three. They have nothing to point at until this is
  ruled on.
- **The `auth/` cluster in `chain-fix/um-decisions.md` is marked
  `BLOCKED, not merely missing`** and names this file as the reason. 5 of its 6
  documents resolve automatically the moment the aliases land (§2.4); the sixth,
  `um-auth-06`, needs one Trace-line addition either way.
- **The unmapped-story classification task has `UM-E2-S2.1` / `UM-E2-S2.2`
  pending on it.** Under (a) they leave that task's scope entirely; under (b)
  they become its first two exemption entries. That task cannot close either
  story without this ruling. It has nine other unmapped stories that are
  unaffected.
- **Not blocked, but adjacent:** `docs/test-cases/access-control/auth/ac-au-01…03`
  (unauthenticated `401` denials) are `NO_TOKENS` and belong to the
  access-control mapping task. They test the §3.3 rule-8 oracle rather than the
  login flow, so they should resolve to the authorization requirements, **not**
  to `PM-FR-43`. Flagged so nobody sweeps them into this decision by folder name.

---

## 6. What was deliberately not done

No requirement was written into the coverage model. No `verify-coverage.py`
literal was changed. No Trace line was edited. The check-8 numbers in §2.4 come
from re-running the check's own resolution logic against an in-memory copy of the
model with three aliases added — the file on disk is untouched, and
`python3 global-coverage/verify-coverage.py` still reports exactly what it
reported before this file existed.
