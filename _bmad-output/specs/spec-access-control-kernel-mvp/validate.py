# /// script
# requires-python = ">=3.11"
# dependencies = ["pyyaml"]
# ///
"""Mechanical validator for the Access Control Kernel MVP spec package.

Run from the repository root:

    uv run _bmad-output/specs/spec-access-control-kernel-mvp/validate.py

Every assertion this prints was actually executed. The script reports the count
of checks it ran; no check count or PASS claim may be made without it
(SPEC.md Constraints). Exit status is 0 when every check passes, 1 otherwise.

Known limitation, stated rather than hidden: the repair-item checks assert that
a landing site EXISTS and contains an expected substring. They verify placement,
not correctness, and rewording a checked sentence will fail the check even when
the meaning is preserved. Treat a failure here as "look at this", not as proof
of a defect — and never treat a PASS as a substitute for the human review gate.
"""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

import yaml

SPEC_DIR = Path(__file__).resolve().parent
REPO = SPEC_DIR.parents[2]

CAP_IDS = [f"CAP-{n}" for n in range(1, 9)]

STORY_IDS = [
    "ACM-9-baseline",
    "ACM-3-scenarios", "ACM-3-red-tests", "ACM-3-production",
    "ACM-4-scenarios", "ACM-4-red-tests", "ACM-4-production",
    "ACM-4R-scenarios", "ACM-4R-tests", "ACM-4R-production",
    "ACM-4R-disposition",
    "ACM-0-scenarios", "ACM-0-red-tests", "ACM-0-production",
    "ACM-1-scenarios", "ACM-1-red-tests",
    "ACM-1R-scenarios", "ACM-1R-tests",
    "ACM-1-production",
    "ACM-2-scenarios", "ACM-2-red-tests", "ACM-2-production",
    "ACM-5-scenarios", "ACM-5-red-tests", "ACM-5-production",
    "ACM-8-scenarios", "ACM-8-red-tests", "ACM-8-production",
    "ACM-9-final",
]

ALLOWED_STORY_FIELDS = {
    "id", "title", "description", "spec_checkpoint", "done_checkpoint",
    "invoke_dev_with",
}

DISPOSITION = "_bmad-output/implementation-artifacts/access-control/acm-4-disposition.yaml"
ACM4_AUDIT = "../../implementation-artifacts/access-control/acm-4-coverage-audit.md"
ACM1_AUDIT = ("../../implementation-artifacts/access-control/"
              "acm-1-stage1-coverage-audit.md")

# Repair item -> (file, one substring that must be present)
REPAIR_LANDINGS = {
    "R1 reporting-cycle sync (spec)": ("SPEC.md", "provisional"),
    "R1 reporting-cycle sync (proposal)": (
        "../../planning-artifacts/sprint-change-proposal-2026-08-30-access-control-kernel-mvp.md",
        "before or after viewer proof"),
    "R1 reporting-cycle sync (spine)": (
        "../../planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md",
        "before or after viewer proof"),
    "R1 reporting-cycle sync (access-control)": (
        "../../../docs/architecture/access-control.md", "before or\n  after viewer proof"),
    "R1 reporting-cycle sync (epics)": (
        "../../planning-artifacts/platform/epics.md", "before or\n  after viewer proof"),
    "R2 identity before Self": ("SPEC.md", "before any audience derivation"),
    "R3 bridge taxonomy": ("SPEC.md", "endpoint row is\n    missing"),
    "R5 ACM-0 creates and validates": ("SPEC.md", "npm run db:seed"),
    "R6 entrypoints + order": ("SPEC.md", "db:bootstrap:access-control"),
    "R7 normalized identity": ("SPEC.md", "counts **all** normalized\n  matches first"),
    "R8 dependency graph": ("SPEC.md", "ACM-0 → ACM-1 → ACM-2"),
    "R9 single FR gate statement": (
        "../../planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md",
        "Gate statement (the only one)"),
    "R10 approvals ledger (spec)": ("SPEC.md", "approvals.yaml"),
    "R10 approvals ledger (testing-strategy)": (
        "../../../docs/architecture/testing-strategy.md",
        "An approval is a persisted record"),
    "R11 conditional dependencies": ("SPEC.md", DISPOSITION),
    "R12 absent-singleton provenance": (
        "../../planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md",
        "Provenance when the singleton is absent"),
    "R13 cross-type collision": ("SPEC.md", "targetRole='hr-admin'"),
    "R14 CAP-3 invariant checklist": (
        "../../../docs/architecture/database-schema.md",
        "CAP-3 invariant coverage checklist"),
    "R15 ACM-9 precedence": (
        "../../../docs/architecture/testing-strategy.md",
        "Precedence between an absolute failure and a manifest mismatch"),
    "R16 validation-only exception": (
        "../../../docs/architecture/testing-strategy.md",
        "Validation-only evidence exception"),
    "R17 persisted validator": ("SPEC.md", "validate.py"),
}


class Report:
    def __init__(self) -> None:
        self.ran = 0
        self.failures: list[str] = []

    def check(self, label: str, ok: bool, detail: str = "") -> None:
        self.ran += 1
        if not ok:
            self.failures.append(f"{label}{': ' + detail if detail else ''}")


def artifact_resolves(repo: str, commit: str, artifact_path: str) -> bool:
    """True if `artifact_path` exists at `commit` in the named repo checkout."""
    repo_dir = REPO if repo == "workspace" else REPO / "services" / "backend"
    result = subprocess.run(
        ["git", "-C", str(repo_dir), "cat-file", "-e", f"{commit}:{artifact_path}"],
        capture_output=True,
    )
    return result.returncode == 0


def main() -> int:
    r = Report()
    try:
        _run_checks(r)
    except Exception as e:
        print(f"checks run: {r.ran}")
        print(f"failures:   {len(r.failures) + 1}")
        for f in r.failures:
            print(f"  FAIL  {f}")
        print(f"  FAIL  unhandled error: {e}")
        print("verdict:    FAIL")
        return 1

    print(f"checks run: {r.ran}")
    print(f"failures:   {len(r.failures)}")
    for f in r.failures:
        print(f"  FAIL  {f}")
    verdict = "PASS" if not r.failures else "FAIL"
    print(f"verdict:    {verdict}")
    return 0 if not r.failures else 1


def _run_checks(r: Report) -> None:
    spec = (SPEC_DIR / "SPEC.md").read_text(encoding="utf-8")
    stories_raw = (SPEC_DIR / "stories.yaml").read_text(encoding="utf-8")
    stories = yaml.safe_load(stories_raw)

    # --- SPEC frontmatter status ---------------------------------------
    # The package gate was approved by the user on 2026-08-31. That authorizes
    # Stage-1 dispatch only; Stage-2 and Stage-3 still need their own per-stage
    # human approvals, so `authorized` must never appear here while the ledger
    # is empty.
    r.check("SPEC status is approved", "\nstatus: approved" in spec)
    r.check("SPEC implementation_status is stage-1-authorized",
            "\nimplementation_status: stage-1-authorized" in spec)
    r.check("SPEC records who approved the package gate",
            "\npackage_review_approved_by:" in spec)
    r.check("implementation is NOT declared fully authorized",
            "\nimplementation_status: authorized" not in spec)

    # --- Capabilities ---------------------------------------------------
    for cap in CAP_IDS:
        block = re.search(
            rf"- \*\*{re.escape(cap)} — .*?(?=\n- \*\*CAP-|\n## )", spec, re.S)
        r.check(f"{cap} present", block is not None)
        if block:
            body = block.group(0)
            r.check(f"{cap} has intent", "**intent:**" in body)
            r.check(f"{cap} has success", "**success:**" in body)
            r.check(f"{cap} success is non-trivial",
                    len(body.split("**success:**")[-1].strip()) > 80)
    r.check("no CAP-9 introduced", "CAP-9" not in spec)

    # --- Kernel fields --------------------------------------------------
    for section in ("## Capabilities", "## Constraints", "## Non-goals",
                    "## Success signal"):
        r.check(f"SPEC has {section}", section in spec)

    # --- Companions exist ----------------------------------------------
    fm = spec.split("---")[1]
    companions = re.findall(r"^\s+- (\S+)$", fm, re.M)
    r.check("companions declared", len(companions) > 0)
    for c in companions:
        r.check(f"companion exists: {c}", (SPEC_DIR / c).resolve().exists())
    r.check("stories.yaml is not a companion",
            not any("stories.yaml" in c for c in companions))

    # --- Stories --------------------------------------------------------
    r.check("stories.yaml is a list", isinstance(stories, list))
    ids = [e["id"] for e in stories]
    r.check("story count is 29", len(stories) == 29, f"got {len(stories)}")
    r.check("story ids unchanged and in order", ids == STORY_IDS,
            f"got {ids}")
    r.check("story ids unique", len(ids) == len(set(ids)))
    for a in ids:
        for b in ids:
            if a != b:
                r.check(f"prefix-free {a}/{b}", not b.startswith(a + "-"))
    for e in stories:
        sid = e["id"]
        r.check(f"{sid} id quoted in source", f'- id: "{sid}"' in stories_raw)
        r.check(f"{sid} fields allowed", set(e) <= ALLOWED_STORY_FIELDS,
                str(set(e) - ALLOWED_STORY_FIELDS))
        r.check(f"{sid} has no status field", "status" not in e)
        r.check(f"{sid} spec_checkpoint true", e.get("spec_checkpoint") is True)
        r.check(f"{sid} done_checkpoint true", e.get("done_checkpoint") is True)
        for f in ("title", "description", "invoke_dev_with"):
            r.check(f"{sid} {f} non-empty",
                    isinstance(e.get(f), str) and bool(e[f].strip()))

    idx = {sid: i for i, sid in enumerate(ids)}
    r.check("ACM-0 precedes ACM-1",
            idx["ACM-0-production"] < idx["ACM-1-scenarios"])
    r.check("ACM-9 baseline precedes ACM-8",
            idx["ACM-9-baseline"] < idx["ACM-8-scenarios"])
    r.check("ACM-8 follows ACM-2/ACM-3/ACM-5",
            idx["ACM-8-scenarios"] > max(idx["ACM-2-production"],
                                         idx["ACM-3-production"],
                                         idx["ACM-5-production"]))
    r.check("ACM-9-final follows ACM-8",
            idx["ACM-9-final"] > idx["ACM-8-production"])
    r.check("ACM-4R follows the halted original ACM-4 validation",
            idx["ACM-4R-scenarios"] > idx["ACM-4-production"])
    r.check("ACM-4R disposition follows its recovery work",
            idx["ACM-4R-disposition"] > idx["ACM-4R-production"])
    # ACM-1R is dependency-ordered in place: the repair sits between the halted
    # original Stage 2 and the Stage 3 it now gates, so reading the file top to
    # bottom is reading the order the stages may actually run in.
    r.check("ACM-1R follows the halted original ACM-1 Stage 2",
            idx["ACM-1R-scenarios"] > idx["ACM-1-red-tests"])
    r.check("ACM-1R tests follow ACM-1R scenarios",
            idx["ACM-1R-tests"] > idx["ACM-1R-scenarios"])
    r.check("ACM-1 production follows the ACM-1R repair",
            idx["ACM-1-production"] > idx["ACM-1R-tests"])

    by_id = {e["id"]: e for e in stories}

    # Stage-1 dispatches cite binding sources
    for sid in [i for i in ids if i.endswith("-scenarios")]:
        r.check(f"{sid} cites SPEC capability",
                "CAP-" in by_id[sid]["invoke_dev_with"])

    # --- R11 executable preconditions ----------------------------------
    for sid in ("ACM-5-scenarios", "ACM-5-red-tests", "ACM-5-production"):
        r.check(f"{sid} names the disposition artifact",
                DISPOSITION in by_id[sid]["invoke_dev_with"])
        r.check(f"{sid} names the required value",
                "no-gap" in by_id[sid]["invoke_dev_with"])
    for sid in ("ACM-8-scenarios", "ACM-8-red-tests", "ACM-8-production",
                "ACM-9-final"):
        txt = by_id[sid]["invoke_dev_with"]
        r.check(f"{sid} requires baseline status", "`status`" in txt)
        r.check(f"{sid} requires PASS", "`PASS`" in txt)
    r.check("ACM-4 original test dispatch is explicitly halted",
            "DO NOT DISPATCH" in by_id["ACM-4-red-tests"]["invoke_dev_with"])
    r.check("ACM-4 original production dispatch is explicitly halted",
            "DO NOT DISPATCH" in by_id["ACM-4-production"]["invoke_dev_with"])
    r.check("ACM-4R scenario dispatch cites the persisted audit",
            "acm-4-coverage-audit.md" in by_id["ACM-4R-scenarios"]["invoke_dev_with"])
    r.check("ACM-4R tests wait for ACM-1 production",
            "ACM-1-production" in by_id["ACM-4R-tests"]["invoke_dev_with"])
    r.check("ACM-4R disposition writes the disposition artifact",
            DISPOSITION in by_id["ACM-4R-disposition"]["invoke_dev_with"])
    r.check("ACM-4R disposition names no-gap",
            "disposition: no-gap" in by_id["ACM-4R-disposition"]["invoke_dev_with"])
    r.check("ACM-1 original Stage-2 dispatch is explicitly halted",
            "DO NOT DISPATCH" in by_id["ACM-1-red-tests"]["invoke_dev_with"])
    r.check("ACM-1 halt cites the persisted Stage-1 audit",
            "acm-1-stage1-coverage-audit.md"
            in by_id["ACM-1-red-tests"]["invoke_dev_with"])
    r.check("ACM-1R scenario dispatch cites the persisted audit",
            "acm-1-stage1-coverage-audit.md"
            in by_id["ACM-1R-scenarios"]["invoke_dev_with"])
    r.check("ACM-1R tests require BOTH Stage-1 approvals",
            all(n in by_id["ACM-1R-tests"]["invoke_dev_with"]
                for n in ("ACM-1-scenarios", "ACM-1R-scenarios")))
    r.check("ACM-1R tests invoke the real bootstrap entrypoint",
            "db:bootstrap:access-control"
            in by_id["ACM-1R-tests"]["invoke_dev_with"])
    r.check("ACM-1 production names ACM-1R-tests as its prior stage",
            "ACM-1R-tests" in by_id["ACM-1-production"]["invoke_dev_with"])

    audit_path = (SPEC_DIR / ACM4_AUDIT).resolve()
    r.check("ACM-4 coverage audit exists", audit_path.exists(), str(audit_path))
    if audit_path.exists():
        audit = audit_path.read_text(encoding="utf-8")
        r.check("ACM-4 coverage audit records gap status", "status: \"gap\"" in audit)
        r.check("ACM-4 coverage audit names all six gaps",
                all(needle in audit for needle in (
                    "Multi-audience retention", "Self exclusivity",
                    "Colleague floor", "Deduplication", "FR separation",
                    "Representative PostgreSQL fixture classes")))

    acm1_audit_path = (SPEC_DIR / ACM1_AUDIT).resolve()
    r.check("ACM-1 Stage-1 coverage audit exists", acm1_audit_path.exists(),
            str(acm1_audit_path))
    if acm1_audit_path.exists():
        a1 = acm1_audit_path.read_text(encoding="utf-8")
        r.check("ACM-1 Stage-1 audit records gap status",
                'status: "gap"' in a1)
        r.check("ACM-1 Stage-1 audit scores every one of the thirteen "
                "invariants",
                all(f"| {n} |" in a1 for n in range(1, 14)))
        r.check("ACM-1 Stage-1 audit records the coverage score",
                "3 of 13 fully covered" in a1)
        r.check("ACM-1 Stage-1 audit halts both downstream dispatches",
                "ACM-1-red-tests" in a1 and "ACM-1-production" in a1)

    # --- R10 ledger referenced by every stage-2/stage-3 dispatch --------
    for sid in [i for i in ids
                if (i.endswith("-red-tests") or i.endswith("-tests")
                    or i.endswith("-production"))
                and i not in ("ACM-4-red-tests", "ACM-4-production",
                              "ACM-1-red-tests")]:
        r.check(f"{sid} references approvals ledger",
                "approvals.yaml" in by_id[sid]["invoke_dev_with"])
    ledger = SPEC_DIR / "approvals.yaml"
    r.check("approvals.yaml exists", ledger.exists())
    if ledger.exists():
        led = yaml.safe_load(ledger.read_text(encoding="utf-8"))
        r.check("approvals ledger has an approvals key",
                isinstance(led, dict) and "approvals" in led)
        entries = led.get("approvals") or []
        # Empty is correct while no stage artifact exists. If entries appear,
        # they must be real: eight fields, a named repo, and author != approver.
        r.check("approvals ledger entries are well-formed",
                all(isinstance(e, dict)
                    and {"story_id", "stage", "repo", "artifact_path",
                         "commit", "author", "approver", "decision",
                         "timestamp"} <= set(e)
                    and e.get("author") != e.get("approver")
                    and e.get("repo") in ("workspace", "services/backend")
                    for e in entries),
                "a stage approval is missing fields, names no repo, or was "
                "self-approved")
        r.check("approval story ids are known",
                all(e.get("story_id") in STORY_IDS for e in entries),
                "an approval names a story that does not exist")
        r.check("every approval's commit+artifact_path resolves in its repo",
                all(artifact_resolves(e["repo"], e["commit"], e["artifact_path"])
                    for e in entries),
                "an approval names a commit/artifact_path that does not resolve")

    # --- R4 no invented soft-delete behavior ---------------------------
    # `User` has no soft-delete column, so the retired taxonomy that treated a
    # soft-deleted bridge as a traversal state must appear nowhere. Statements
    # asserting its ABSENCE are correct and are not flagged.
    RETIRED = (
        "soft-deleted, or inactive bridge",
        "missing, soft-deleted, or inactive",
        "missing or soft-deleted user",
    )
    for rel in ("SPEC.md",
                "../../planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md",
                "../../../docs/architecture/access-control.md",
                "../../planning-artifacts/sprint-change-proposal-2026-08-30-access-control-kernel-mvp.md"):
        txt = (SPEC_DIR / rel).read_text(encoding="utf-8").lower()
        for phrase in RETIRED:
            r.check(f"retired soft-delete taxonomy absent from "
                    f"{Path(rel).name}: {phrase!r}", phrase not in txt)

    # --- Repair-item landing sites --------------------------------------
    for label, (rel, needle) in REPAIR_LANDINGS.items():
        path = (SPEC_DIR / rel).resolve()
        r.check(f"landing site exists for {label}", path.exists(), str(path))
        if path.exists():
            r.check(f"landing content for {label}",
                    needle in path.read_text(encoding="utf-8"))


if __name__ == "__main__":
    sys.exit(main())
