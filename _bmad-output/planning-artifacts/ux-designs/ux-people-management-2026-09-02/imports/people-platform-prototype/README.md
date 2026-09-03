# People Management Platform — interactive prototype

A multi-artboard design canvas for the platform UI: the employee directory,
configurable dashboards, roles & permissions, custom fields, the HR-Admin access
preview, self-service time off, and the organisation-wide absence calendar.

Design system: shadcn / Geist / zinc + blue, matching `services/frontend` tokens,
with a "stretch" layer on top (Geist Mono for data, mono eyebrows, provenance
tags, per-screen accents, richer states). See `design-notes.md` for the rationale.

## Live canvas

Published as a Claude Design canvas (Artifact), editable in the browser:

<https://claude.ai/code/artifact/c7ac600f-7bdb-4a01-906e-d9364adc14b9>

The published version is the source of truth for review and hand-off. Edits saved
there are not automatically mirrored back into this folder — re-export when it
changes (below).

## What's in this folder

| File | What it is |
|---|---|
| `*.dc.html` | The seven artboards — Design Component source (holes, `<sc-for>`, a `renderVals()` logic class). Not standalone-viewable; they render inside the canvas. |
| `canvas.json` | Canvas layout — artboard positions, sticky notes, launch view. |
| `canvas.html` | The seeded, self-contained canvas (~2.6 MB: the editor payload + all artboard content). Open directly in a browser for a view-and-export copy. |
| `design-notes.md` | Design plan and guardrails for the stretch pass. |

## Editing

The canvas editor baked into `canvas.html` does not update after publish, so
substantive changes go through the `design` skill in Claude Code:

1. `/design` — re-extracts the skill's helper + payload template.
2. Extract the current published canvas into a fresh dir:
   `node <skill>/seed-canvas.mjs --extract canvas.html --to <newdir>`
3. Edit the `.dc.html` / `canvas.json` working files.
4. Re-seed: `node <skill>/seed-canvas.mjs --template <payload> --out canvas.html --title "People Management Platform" --artboard Main.dc.html … --canvas canvas.json`
5. Publish to the same Artifact URL, then copy the updated files back here.
