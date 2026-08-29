#!/usr/bin/env python3
"""Generate Phase 1 matrix scenario files from §3.2 cells."""
from __future__ import annotations

import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3] / "docs/test-cases/access-control/matrix"

# cell: R, RW, —, R* (read with projection caveats noted in prose)
MATRIX = {
    "S1": {
        "self": "R*",
        "reporting-line": "RW",
        "pp": "RW",
        "colleague": "R",
        "name": "Identity",
        "read": "GET /users/{targetId}",
        "write": "PATCH /users/{targetId}",
        "write_body": {"position": "Engineer II"},
    },
    "S2": {
        "self": "RW",
        "reporting-line": "R",
        "pp": "RW",
        "colleague": "—",
        "name": "Personal contacts",
        "read": "GET /users/{targetId}/personal-contacts",
        "write": "PATCH /users/{targetId}/personal-contacts",
        "write_body": {"personalPhone": "+10000000001"},
    },
    "S3": {
        "self": "RW",
        "reporting-line": "R",
        "pp": "RW",
        "colleague": "—",
        "name": "Emergency contacts",
        "read": "GET /users/{targetId}/emergency-contacts",
        "write": "PATCH /users/{targetId}/emergency-contacts",
        "write_body": {"contactPhone": "+10000000002"},
    },
    "S4": {
        "self": "R",
        "reporting-line": "RW",
        "pp": "RW",
        "colleague": "—",
        "name": "Employment",
        "read": "GET /users/{targetId}/employment",
        "write": "PATCH /users/{targetId}/employment",
        "write_body": {"grade": "L4"},
    },
    "S5": {
        "self": "R",
        "reporting-line": "R",
        "pp": "RW",
        "colleague": "—",
        "name": "Documents",
        "read": "GET /users/{targetId}/documents",
        "write": "POST /users/{targetId}/documents",
        "write_body": {"type": "certificate", "title": "AWS SA"},
    },
    "S6": {
        "self": "—",
        "reporting-line": "RW",
        "pp": "RW",
        "colleague": "—",
        "name": "Risks",
        "read": "GET /users/{targetId}/risks",
        "write": "POST /users/{targetId}/risks",
        "write_body": {"level": "medium", "description": "Delivery slip"},
    },
    "S7": {
        "self": "R",
        "reporting-line": "RW",
        "pp": "RW",
        "colleague": "—",
        "name": "Management notes",
        "read": "GET /users/{targetId}/notes",
        "write": "POST /users/{targetId}/notes",
        "write_body": {"body": "Check-in note", "visibleForEmployee": False},
    },
    "S8": {
        "self": "R",
        "reporting-line": "RW",
        "pp": "RW",
        "colleague": "—",
        "name": "Feedbacks",
        "read": "GET /users/{targetId}/feedbacks",
        "write": "POST /users/{targetId}/feedbacks",
        "write_body": {"body": "Strong collaborator", "sharedWithEmployee": False},
    },
    "S9": {
        "self": "R",
        "reporting-line": "RW",
        "pp": "RW",
        "colleague": "—",
        "name": "Career timeline",
        "read": "GET /users/{targetId}/events",
        "write": "POST /users/{targetId}/events",
        "write_body": {"type": "manual_backfill", "title": "Prior role", "occurredAt": "2019-06-01"},
    },
    "S10": {
        "self": "R",
        "reporting-line": "R",
        "pp": "R",
        "colleague": "R",
        "name": "Leaves",
        "read": "GET /users/{targetId}/leaves",
        "write": None,
        "write_body": None,
    },
    "S11": {
        "self": "R",
        "reporting-line": "R",
        "pp": "R",
        "colleague": "R",
        "name": "Projects",
        "read": "GET /users/{targetId}",
        "write": "POST /users/{targetId}/relationships",
        "write_body": {"type": "project", "targetId": "<project-id>"},
    },
    "S12": {
        "self": "R",
        "reporting-line": "RW",
        "pp": "RW",
        "colleague": "—",
        "name": "CDS",
        "read": "GET /users/{targetId}/assessments",
        "write": "POST /users/{targetId}/assessments",
        "write_body": {"cycle": "2026-H1"},
    },
    "S13": {
        "self": "RW",
        "reporting-line": "RW",
        "pp": "RW",
        "colleague": "—",
        "name": "Mentorship",
        "read": "GET /users/{targetId}",
        "write": "POST /mentorship-pairs",
        "write_body": {"mentorId": "{targetId}", "menteeId": "<mentee-id>"},
    },
    "S14": {
        "self": "R",
        "reporting-line": "RW",
        "pp": "RW",
        "colleague": "—",
        "name": "Action items",
        "read": "GET /action-items?assigneeId={targetId}",
        "write": "POST /action-items",
        "write_body": {"assigneeId": "{targetId}", "title": "Follow up"},
    },
    "S15": {
        "self": "—",
        "reporting-line": "R",
        "pp": "R",
        "colleague": "—",
        "name": "Request history",
        "read": "GET /users/{targetId}/request-history",
        "write": None,
        "write_body": None,
    },
    "S16": {
        "self": "R",
        "reporting-line": "RW",
        "pp": "RW",
        "colleague": "R",
        "name": "Custom fields",
        "read": "GET /users/{targetId}/custom-fields",
        "write": "PATCH /users/{targetId}/custom-fields",
        "write_body": {"managementOnlyField": "updated"},
    },
}

AUDIENCE_DIR = {
    "self": "self",
    "reporting-line": "reporting-line",
    "pp": "pp",
    "colleague": "colleague",
}

ACTOR = {
    "self": ("Alice", "Alice", "Self"),
    "reporting-line": ("Bob", "Alice", "Reporting line (direct unit manager)"),
    "pp": ("Paula", "Alice", "assigned people partner"),
    "colleague": ("Colin", "Alice", "unrelated colleague"),
}

# S9 manual write limited to direct UM and assigned PP (DEC-UM-001)
S9_WRITE_ACTOR = {
    "reporting-line": ("Bob", "direct unit manager"),
    "pp": ("Paula", "assigned PP"),
}

PROJECTION_NOTE = {
    "S7": "Record-flag projection applies within the allowed section.",
    "S8": "Record-flag projection applies within the allowed section.",
    "S10": "Colleague projection shows dates only, type hidden (§3.3.4); Reporting/PP/Self see full leave type.",
    "S11": "Colleague projection shows project name only (§3.3.4).",
    "S16": "Per-field visibility may narrow the payload.",
}

SECTION_PAYLOAD_KEY = {
    "S1": "identity",
    "S2": "personalcontacts",
    "S3": "emergencycontacts",
    "S4": "employment",
    "S5": "documents",
    "S6": "risks",
    "S7": "notes",
    "S8": "feedbacks",
    "S9": "careertimeline",
    "S10": "leaves",
    "S11": "projects",
    "S12": "cds",
    "S13": "mentorship",
    "S14": "actionitems",
    "S15": "requesthistory",
    "S16": "customfields",
}

READ_FIELD_ASSERTIONS = {
    "S1": "`firstName`, `lastName`, and `workEmail` present",
    "S2": "`personalPhone` or `residentialAddress` present",
    "S3": "at least one emergency contact with `name` and `phone`",
    "S4": "`grade`, `position`, and `employmentStatus` present",
    "S5": "at least one document item with `type` and `title`",
    "S6": "risk `level` and `description` present",
    "S9": "at least one timeline event with `type` and `occurredAt`",
    "S10": "at least one leave with `startDate` and `endDate`",
    "S11": "at least one project with `name`",
    "S12": "assessment log with `cycle` present",
    "S13": "`openToMentoring` flag present",
    "S14": "at least one action item with `title` and `status`",
    "S15": "at least one request-history entry with `type` and `occurredAt`",
    "S16": "at least one custom field key present",
}

COLLEAGUE_READ_ASSERTIONS = {
    "S10": "each leave includes `startDate` and `endDate`; `type` key **absent** on every item",
    "S11": "each project includes `name`; `role`, `allocation`, `startDate`, and `endDate` **absent** on every item",
    "S16": "`colleagueVisibleField` present; `managementOnlyField` **absent**",
}

SELF_RECORD_FILTER = {
    "S7": (
        "note `0195f100-0000-7000-8000-000000000501` present in items; "
        "note `0195f100-0000-7000-8000-000000000502` **absent**"
    ),
    "S8": (
        "feedback `0195f100-0000-7000-8000-000000000601` present in items; "
        "feedback `0195f100-0000-7000-8000-000000000602` **absent**"
    ),
}

# §3.2 matrix exceptions + §4.3 self-service (narrower than base RW cell)
SELF_WRITE_EXCEPTION = {
    "S5": {
        "slug": "write-certificate",
        "title_suffix": "upload own certificate",
        "scenario": (
            "**Given** Alice is Self on her Documents section (§3.2 `R` plus §4.3 certificate upload).\n\n"
            "**When** Alice uploads a certificate document.\n\n"
            "**Then** the upload succeeds — Self may upload certificates but not other document types."
        ),
        "url": "POST /users/<alice-id>/documents",
        "body": {"type": "certificate", "title": "AWS Solutions Architect"},
        "expected": "`201`; certificate document persisted with `type: certificate`",
        "deny_body": {"type": "contract", "title": "Employment contract"},
        "deny_expected": "`403`; non-certificate document types not writable by Self",
    },
    "S12": {
        "slug": "write-idp-complete",
        "title_suffix": "complete own IDP",
        "scenario": (
            "**Given** Alice is Self on CDS (§3.2 `R` plus §4.3 IDP completion).\n\n"
            "**When** Alice marks her own IDP complete.\n\n"
            "**Then** the completion succeeds — Self may complete own IDP only, not create assessments."
        ),
        "url": "PATCH /users/<alice-id>/assessments/<alice-idp-id>",
        "body": {"complete": True},
        "expected": "`200`; IDP `complete: true` with `completedAt` recorded",
        "deny_url": "POST /users/<alice-id>/assessments",
        "deny_body": {"cycle": "2026-H1"},
        "deny_expected": "`403`; Self cannot create or edit assessment records",
    },
    "S13": {
        "slug": "write-mentor-flag",
        "title_suffix": "set own mentorship flag",
        "scenario": (
            "**Given** Alice is Self on Mentorship (§3.2 RW limited to own open-to-mentor flag).\n\n"
            "**When** Alice toggles her own `openToMentoring` flag.\n\n"
            "**Then** the flag update succeeds — Self cannot create or end mentorship pairs."
        ),
        "url": "PATCH /users/<alice-id>",
        "body": {"openToMentoring": True},
        "expected": "`200`; `openToMentoring: true` on follow-up read",
        "deny_url": "POST /mentorship-pairs",
        "deny_body": {"mentorId": "<alice-id>", "menteeId": "<mentee-id>"},
        "deny_expected": "`403`; Self cannot create mentorship pairs",
    },
    "S14": {
        "slug": "write-complete",
        "title_suffix": "mark own action item complete",
        "scenario": (
            "**Given** Alice is Self on Action items (§3.2 `R` plus §4.3 mark-complete).\n\n"
            "**When** Alice marks her own assigned action item complete.\n\n"
            "**Then** completion succeeds — Self cannot create action items for others."
        ),
        "url": "PATCH /action-items/<alice-action-item-id>",
        "body": {"status": "completed"},
        "expected": "`200`; item `status: completed` with `completedAt` recorded",
        "deny_url": "POST /action-items",
        "deny_body": {"assigneeId": "<alice-id>", "title": "New task"},
        "deny_expected": "`403`; Self cannot create action items",
    },
}

WRITE_SUCCESS_EXPECTED = "`201` or `200`; mutation persisted — observable on follow-up read"


def cell_allows_read(cell: str) -> bool:
    return cell in ("R", "RW", "R*")


def cell_allows_write(cell: str) -> bool:
    return cell == "RW"


def read_expected(section_id: str, audience: str, cell: str) -> str:
    key = SECTION_PAYLOAD_KEY.get(section_id, section_id.lower())
    if audience == "self" and section_id in SELF_RECORD_FILTER:
        return f"`200`; `{key}` present; {SELF_RECORD_FILTER[section_id]}"
    if audience == "colleague" and section_id in COLLEAGUE_READ_ASSERTIONS:
        return f"`200`; `{key}` present; {COLLEAGUE_READ_ASSERTIONS[section_id]}"
    fields = READ_FIELD_ASSERTIONS.get(section_id, f"`{key}` section data present")
    return f"`200`; `{key}` present; {fields}"


def render_self_write_exception(section_id: str, meta: dict) -> list[tuple[str, str]]:
    exc = SELF_WRITE_EXCEPTION[section_id]
    sec_name = meta["name"]
    slug = section_id.lower()
    trace = f"§3.2 {section_id} · §4.3 · AD-10"
    import json

    allowed_body = json.dumps(exc["body"], indent=2)
    denied_body = json.dumps(exc.get("deny_body", {}), indent=2)
    deny_url = exc.get("deny_url", meta["write"] or meta["read"]).replace("{targetId}", "<alice-id>")
    deny_method, deny_path = deny_url.split()[0], deny_url.split()[1]

    allowed = (
        f"# AC-M-{section_id}-SE-W-{exc['slug'].upper().replace('-', '')} · self {exc['title_suffix']}\n\n"
        f"**Trace:** {trace}\n\n"
        f"## Scenario\n\n"
        f"{exc['scenario']}\n\n"
        f"**Preconditions:** [fixture](../../README.md#canonical-personas); seeded {sec_name} data for Alice.\n\n"
        f"## Test\n\n"
        f"- **inputURL:** `{exc['url']}`\n"
        f"- **inputRequest:**\n"
        f"  ```json\n"
        f"  {{\n"
        f'    "headers": {{ "authorization": "Bearer <token:Alice>" }},\n'
        f"    \"body\": {allowed_body}\n"
        f"  }}\n"
        f"  ```\n"
        f"- **expectedResult:** {exc['expected']}\n"
    )
    denied = (
        f"# AC-M-{section_id}-SE-W-DEN · self write {slug} denied (narrower rule)\n\n"
        f"**Trace:** {trace}\n\n"
        f"## Scenario\n\n"
        f"**Given** Alice is Self on {sec_name} with a narrower §3.3/§4.3 write exception.\n\n"
        f"**When** Alice attempts a mutation outside that exception.\n\n"
        f"**Then** the API returns `403` without persisting a change.\n\n"
        f"**Preconditions:** [fixture](../../README.md#canonical-personas); seeded {sec_name} data for Alice.\n\n"
        f"## Test\n\n"
        f"- **inputURL:** `{deny_method} {deny_path}`\n"
        f"- **inputRequest:**\n"
        f"  ```json\n"
        f"  {{\n"
        f'    "headers": {{ "authorization": "Bearer <token:Alice>" }},\n'
        f"    \"body\": {denied_body}\n"
        f"  }}\n"
        f"  ```\n"
        f"- **expectedResult:** {exc['deny_expected']}\n"
    )
    return [
        (f"{slug}-self-{exc['slug']}.md", allowed),
        (f"{slug}-self-write-denied.md", denied),
    ]


def render_file(
    section_id: str,
    audience: str,
    action: str,
    cell: str,
    meta: dict,
) -> str:
    actor, target, rel = ACTOR[audience]
    sec_name = meta["name"]
    slug = section_id.lower()
    aud_slug = audience.replace("-", "-")
    trace = f"§3.2 {section_id} · AD-10"

    if action == "read":
        if not cell_allows_read(cell):
            title = f"AC-M-{section_id}-{audience.upper()[:2]}-R-DEN · {aud_slug} read {slug} denied"
            fname_action = "read-denied"
            scenario = (
                f"**Given** {actor} is an authenticated employee with **no** applicable "
                f"audience for {target}'s {sec_name} section (§3.2 cell is `—` for {audience.replace('-', ' ')}).\n\n"
                f"**When** {actor} requests {target}'s {sec_name} data.\n\n"
                f"**Then** the API returns leak-free `404` and the section key is **absent** from the body — "
                f"the viewer must not learn the section exists."
            )
            url = meta["read"].replace("{targetId}", "<alice-id>")
            expected = "`404`; response body contains no section payload and no field names from that section"
        else:
            title = f"AC-M-{section_id}-{audience.upper()[:2]}-R · {aud_slug} read {slug}"
            fname_action = "read"
            extra = PROJECTION_NOTE.get(section_id, "")
            proj = f" {extra}" if extra else ""
            scenario = (
                f"**Given** {actor} is {target}'s {rel}.\n\n"
                f"**When** {actor} reads {target}'s {sec_name} section.\n\n"
                f"**Then** the request succeeds and the section data is present in the response — "
                f"the §3.2 {audience.replace('-', ' ')} cell grants read.{proj}"
            )
            url = meta["read"].replace("{targetId}", "<alice-id>")
            expected = read_expected(section_id, audience, cell)

    else:  # write
        fname_action = "write"
        if not cell_allows_write(cell):
            fname_action = "write-denied"
            if cell == "—":
                title = f"AC-M-{section_id}-{audience.upper()[:2]}-W-DEN · {aud_slug} write {slug} denied (no access)"
                scenario = (
                    f"**Given** {actor} has no §3.2 access to {target}'s {sec_name} (`—` cell).\n\n"
                    f"**When** {actor} attempts to mutate {target}'s {sec_name}.\n\n"
                    f"**Then** the API returns leak-free `404` — same as a nonexistent section."
                )
                expected = "`404`; leak-free body"
            else:
                title = f"AC-M-{section_id}-{audience.upper()[:2]}-W-DEN · {aud_slug} write {slug} denied (read-only)"
                scenario = (
                    f"**Given** {actor} may **read** but not **write** {target}'s {sec_name} "
                    f"(§3.2 cell is `R`).\n\n"
                    f"**When** {actor} attempts a write.\n\n"
                    f"**Then** the API returns `403` without persisting a change."
                )
                expected = "`403`; no persisted change"
        else:
            w_actor = actor
            w_rel = rel
            if section_id == "S9" and audience in S9_WRITE_ACTOR:
                w_actor, w_rel = S9_WRITE_ACTOR[audience]
            title = f"AC-M-{section_id}-{audience.upper()[:2]}-W · {aud_slug} write {slug}"
            fname_action = "write"
            scenario = (
                f"**Given** {w_actor} is {target}'s {w_rel} with §3.2 write on {sec_name}.\n\n"
                f"**When** {w_actor} performs an allowed mutation.\n\n"
                f"**Then** the mutation succeeds — dual gate and narrower command rules satisfied."
            )
            expected = WRITE_SUCCESS_EXPECTED

        url = (meta["write"] or meta["read"]).replace("{targetId}", "<alice-id>")

    method = url.split()[0]
    path = url.split()[1]
    body = meta.get("write_body") if action == "write" and cell_allows_write(cell) else {}
    auth_actor = w_actor if action == "write" and cell_allows_write(cell) and section_id == "S9" and audience in S9_WRITE_ACTOR else actor

    import json

    body_str = json.dumps(body, indent=2).replace("{targetId}", "<alice-id>") if body else "{}"

    return (
        f"# {title}\n\n"
        f"**Trace:** {trace}\n\n"
        f"## Scenario\n\n"
        f"{scenario}\n\n"
        f"**Preconditions:** [fixture](../../README.md#canonical-personas); seeded {sec_name} data for Alice.\n\n"
        f"## Test\n\n"
        f"- **inputURL:** `{method} {path}`\n"
        f"- **inputRequest:**\n"
        f"  ```json\n"
        f"  {{\n"
        f'    "headers": {{ "authorization": "Bearer <token:{auth_actor}>" }},\n'
        f"    \"body\": {body_str}\n"
        f"  }}\n"
        f"  ```\n"
        f"- **expectedResult:** {expected}\n"
    ), fname_action


def main() -> None:
    count = 0
    for section_id, meta in MATRIX.items():
        for audience, cell in meta.items():
            if audience in ("name", "read", "write", "write_body"):
                continue
            folder = ROOT / AUDIENCE_DIR[audience]
            folder.mkdir(parents=True, exist_ok=True)
            slug = section_id.lower()
            aud = audience
            for action in ("read", "write"):
                if (
                    audience == "self"
                    and section_id in SELF_WRITE_EXCEPTION
                    and action == "write"
                ):
                    folder = ROOT / AUDIENCE_DIR[audience]
                    for fname, content in render_self_write_exception(section_id, meta):
                        (folder / fname).write_text(content, encoding="utf-8")
                        count += 1
                    continue
                if action == "write" and meta["write"] is None:
                    if cell == "—":
                        content, fname_action = render_file(section_id, audience, action, cell, meta)
                        path = folder / f"{slug}-{aud}-{fname_action}.md"
                        path.write_text(content, encoding="utf-8")
                        count += 1
                    elif cell in ("R", "R*"):
                        content, fname_action = render_file(section_id, audience, action, cell, meta)
                        path = folder / f"{slug}-{aud}-{fname_action}.md"
                        path.write_text(content, encoding="utf-8")
                        count += 1
                    continue
                content, fname_action = render_file(section_id, audience, action, cell, meta)
                path = folder / f"{slug}-{aud}-{fname_action}.md"
                path.write_text(content, encoding="utf-8")
                count += 1

    # project-line-gate negatives
    gate = ROOT / "project-line-gate"
    gate.mkdir(parents=True, exist_ok=True)
    gates = [
        (
            "s02-pm-colleague-read-denied.md",
            "AC-PG-01 · PM project gate — S2 denied as Colleague",
            "Pete",
            "PM on Alice's project with no Reporting, PP, or Project-line audience in Phase 1",
            "GET /users/<alice-id>/personal-contacts",
            "404",
            "Project withheld · facade-contract.md",
        ),
        (
            "s03-pm-colleague-read-denied.md",
            "AC-PG-02 · PM project gate — S3 denied as Colleague",
            "Pete",
            "same Phase 1 withhold",
            "GET /users/<alice-id>/emergency-contacts",
            "404",
            "Project withheld · facade-contract.md",
        ),
        (
            "s05-pm-no-project-audience.md",
            "AC-PG-03 · PM does not receive Project-line S5 subset in Phase 1",
            "Pete",
            "PM shares project with Alice but Project line is withheld",
            "GET /users/<alice-id>/documents",
            "404",
            "Project withheld — narrower Project S5 belongs to future gate; Colleague has —",
        ),
        (
            "s06-frank-no-cross-kind-inheritance.md",
            "AC-PG-04 · Reports-to manager of DM gets no Project reach",
            "Frank",
            "Frank reports to Dave (DM) but holds no project-management relation to Alice's project",
            "GET /users/<alice-id>/risks",
            "404",
            "No cross-kind inheritance · facade-contract.md",
        ),
    ]
    for fname, title, actor, given, url, status, why in gates:
        method, path = url.split()[0], url.split()[1]
        (gate / fname).write_text(
            f"# {title}\n\n"
            f"**Trace:** §3.2 · AD-10 · facade-contract.md Phase 1 gate\n\n"
            f"## Scenario\n\n"
            f"**Given** {actor} is authenticated and {given}.\n\n"
            f"**When** {actor} requests Alice's section via `{method} {path}`.\n\n"
            f"**Then** {why}; response is leak-free `{status}` with the section absent.\n\n"
            f"**Preconditions:** [fixture](../../README.md#canonical-personas); Alice, Pete, and Dave share project membership; Frank reports to Dave.\n\n"
            f"## Test\n\n"
            f"- **inputURL:** `{method} {path}`\n"
            f"- **inputRequest:**\n"
            f"  ```json\n"
            f"  {{\n"
            f'    "headers": {{ "authorization": "Bearer <token:{actor}>" }},\n'
            f'    "body": {{}}\n'
            f"  }}\n"
            f"  ```\n"
            f"- **expectedResult:** `{status}`; section key absent; leak-free body\n",
            encoding="utf-8",
        )
        count += 1

    print(f"Generated {count} matrix scenario files under {ROOT}")


if __name__ == "__main__":
    main()
