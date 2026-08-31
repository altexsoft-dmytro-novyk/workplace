# Good-Spine Rubric Review — Access Control Foundation

**Final verdict: PASS**

The reviewer-gate fixes resolve H1, H2, and M1. AD-4 now carries the material
schema, key, evaluator, eligibility, and seed constraints; explicitly reconciles
its Kernel-MVP refinement with inherited AD-6/AD-7/AD-8; and leaves ACM-1
unambiguously blocked until this architecture update is finalized. No critical
or high good-spine findings remain.

## Final re-review

- **H1 — Resolved.** AD-4 now fixes restrictive role-permission foreign keys,
  composite uniqueness, the permission-first index, FR target shape and
  role-key uniqueness, open/case-sensitive lowercase permission keys,
  differently-cased denial, append-only key identity, active/not-due runtime
  eligibility, and transactional idempotent/non-destructive seed behavior.
  The companion and canonical database document carry matching detail,
  including atomic failure on invalid `ROOT_WORK_EMAIL` and conflicting
  seed-owned drift.
- **H2 — Resolved.** AD-6/AD-7/AD-8 are now in both `binds` and Inherited
  Invariants. The inheritance statement explicitly identifies AD-4 as a
  Kernel-MVP refinement of AD-7's incomplete FR schema and preserves the future
  runtime-catalog direction. The MVP reduction remains consistently and
  correctly labeled across the spine and canonical documents.
- **M1 — Resolved.** The approved amendment states that ACM-1 may enter Stage 1
  only after this architecture update is finalized, and the spine's Decision
  Register repeats that blocking condition. `[ADOPTED]` identifies the selected
  decision; it does not override the explicit draft/finalization gate.

**Remaining critical/high findings:** none.

## Evidence reviewed

Reviewed:

- `ARCHITECTURE-SPINE.md`
- `.agents/skills/bmad-architecture/references/reviewer-gate.md`
- `fr-architecture-amendment.md`
- Parent People Management `ARCHITECTURE-SPINE.md`
- Approved Access Control Kernel MVP proposal and SPEC
- Functional Roles Catalog SPEC, used only for its recorded gaps and future
  boundary (the file itself declares the catalog contract unapproved)
- Canonical `docs/architecture/access-control.md` and
  `docs/architecture/database-schema.md`

The deterministic spine linter passed with zero findings. The findings below
are semantic good-spine failures, not formatting failures.

## Initial findings — resolved on re-review

The sections below preserve the original findings and rationale as review
history. Their dispositions have been satisfied by the updated artifacts and
they are no longer active findings.

### H1 — AD-4 loses enforceable parts of the approved OQ resolutions

**Problem:** AD-4 summarizes the selected model but omits constraints that the
approved amendment and canonical database document already make explicit:

- OQ-3: foreign keys to `Policies.id` and `Permissions.id`, `ON DELETE
  RESTRICT`, and the permission-first `(permissionId, policyId)` index.
- OQ-4: `targetRole` is the FR role key, the MVP value is `hr-admin`, and a
  partial unique index on `targetRole WHERE type='FR'` prevents duplicate FR
  role keys.
- OQ-7: the key is case-sensitive lowercase `context:action`; differently cased
  input denies; no key-update operation exists.
- Seed contract supporting OQ-3/OQ-4/OQ-11: one transaction, idempotency, exact
  email matching, unique active-user selection, and atomic failure for absent,
  blank, unmatched, or inactive `ROOT_WORK_EMAIL`.

The current Rule says duplicate role-permission pairs are forbidden, the
permission key is immutable/unique, and unknown/orphaned data denies. Those are
useful but insufficient. Two units can still diverge on role-key uniqueness,
delete behavior, case matching, seed failure semantics, or whether partial seed
state can commit.

**Consequence:** authorization bootstrap can become non-deterministic, duplicate
FR identities can exist, deletion can silently revoke grants, or casing/seed
differences can produce environment-specific access.

**Disposition:** **Autofix before finalization.** Distill the omitted constraints
into AD-4's Rule/MVP reduction. The companion may retain rationale, but the
spine must carry the implementation-divergence blockers itself.

### H2 — AD-4 silently extends and partially reshapes inherited AD-7

**Problem:** The parent AD-7 defines one policy-attachment engine with
`Policies`, `Permissions`, and `UserPolicies`, describes `Permissions` as
`{id, title, description}`, and requires FR policies to be runtime-editable
through an HR Admin UI. AD-4 introduces `PolicyPermissions`, makes
`Permissions.key` the authorization identifier, permits null FR targets, and
temporarily removes runtime mutation from the Kernel MVP. These changes are
reasonable and are reflected in the amended canonical documents, but the child
spine neither lists AD-7 in Inherited Invariants nor states that AD-4
extends/amends its incomplete schema while preserving its future product
direction.

The MVP wording itself is correctly bounded: it repeatedly labels the
deploy-time three-permission set as an MVP reduction and explicitly defers,
rather than cancels, `/roles`, runtime management, and the complete §2.3
catalog. The defect is inheritance traceability, not the reduction.

**Consequence:** one implementer can follow inherited AD-7 literally while
another follows AD-4/canonical docs, producing incompatible schema and catalog
assumptions. It also weakens auditability of whether the child spine ratifies or
contradicts its parent.

**Disposition:** **Discuss, then autofix.** Add inherited AD-6/AD-7/AD-8 as
applicable and state explicitly that AD-4 is a Kernel-MVP refinement of AD-7:
it adds the normalized join and immutable key, defines FR null-target shape,
and defers—but does not repeal—the normative runtime catalog/UI direction.

## Medium finding

### M1 — Decision status and gate effect are internally ambiguous

**Problem:** AD-4 is marked `[ADOPTED]` and the register says the five OQs are
“Resolved by AD-4 / FR-AMD-1,” while the spine remains `status: draft` and the
same register says ACM-1 remains blocked until the architecture update is
approved and finalized. The amendment is approved, but the effective gate state
of the containing spine is not expressed consistently.

**Consequence:** a delivery agent may treat ACM-1 Stage 1 as authorized from the
“ADOPTED/Resolved” wording before finalization, bypassing the intended
architecture gate.

**Disposition:** **Autofix before handoff.** Use one explicit state throughout,
for example: “decision approved in FR-AMD-1; effective for ACM-1 only when this
spine is finalized.” Keep ACM-1 blocked until that condition is true.

## Initial OQ assessment — superseded

| OQ | Enforceable and complete in AD-4? | MVP label | Assessment |
| --- | --- | --- | --- |
| OQ-3 role-permission storage | Partly | Correct | Normalized relation and duplicate-pair prohibition are present; FK, delete, and lookup-index decisions are missing from the spine. |
| OQ-4 FR row shape | Partly | Correct | ID and null-target shape are present; `targetRole` meaning/value and FR-only uniqueness are missing. |
| OQ-6 catalog extensibility | Yes for Kernel MVP | Correct | Exactly three deploy-time rows and no mutation surface are clearly temporary; future normative catalog remains open. |
| OQ-7 canonical identifier | Partly | Correct | Immutable unique key and exact initial values are present; case-sensitive format and mismatch behavior are not fully stated. |
| OQ-11 ownership | Yes | Correct | The FR slice owns one live evaluator; the facade delegates; the later catalog must not create another implementation. Seed ownership/atomicity should still be pulled into AD-4 per H1. |

## Initial non-conflict assessment

- **AD-6 two role dimensions:** preserved. AD-4 forbids position, role-name, and
  `targetRole` authorization checks.
- **AD-9 facade-only entry point:** preserved. The facade exposes and delegates
  to one FR evaluator.
- **AD-12 fail-closed/bootstrap role:** preserved in intent, and strengthened by
  exact `ROOT_WORK_EMAIL` selection, but the failure/transaction rules need to
  be in the spine.
- **AD-2 hexagonal boundary:** preserved. Ownership remains in the
  `access-control` FR slice, with the facade as application boundary.
- **AD-7 runtime catalog direction:** not substantively repealed because the
  reduction is correctly MVP-labeled and future runtime management remains
  deferred. Explicit amendment/ratification language is still required by H2.

## Gate recommendation

The good-spine reviewer gate passes. The spine may proceed to finalization.
ACM-1 remains blocked until that finalization occurs, after which it may enter
its own AD-1 Stage-1 scenario gate; no test, migration, seed, or production-code
stage is authorized by this review.
