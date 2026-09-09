#!/usr/bin/env bash
# Guarded entry point for sprint-status generation.
#
# Three things sprint_plan.py does not do for itself:
#
# 1. See an Epic ID collision. parse_epics() groups stories under
#    `epics.setdefault(int(n), [])` and only rejects a repeat when the whole
#    title slug matches, so two epics sharing a number merge into one tracking
#    block instead of failing.
#
# 2. Restrict itself to the repository. It parses whatever --epic-file it is
#    given, so checking "the repo is clean" proves nothing about the run: a
#    colliding file from outside the tree produced a tracking file containing
#    both Epic 4 story sets while the guard reported OK on 13 repository files.
#    So the guard is pointed at exactly the files this invocation passes.
#
# 3. Protect existing statuses. `--fresh` recomputes every status from scratch
#    and reports NO dropped orphans while doing it: on a copy of the real
#    user-management file it downgraded 21 entries (thirteen stories and five
#    epics from `done`, epic-0/epic-6 from `in-progress`) and dropped seven
#    more, including 6.1's `review`. A dropped-orphans check cannot see that.
#    So the generator is run against a COPY first and the candidate is compared
#    with the live file, key by key and status by status.
#
# Patching the script is not durable: it lives under
# .agents/skills/bmad-sprint-planning/scripts/ and is replaced wholesale on every
# skill update. So all three checks run here, in repo-owned code, and the skill
# is pointed at this wrapper through _bmad/custom/bmad-sprint-planning.toml.
#
# Usage: scripts/sprint-status-generate.sh <sprint_plan.py args...>
# Arguments are forwarded verbatim.
#
# On refusal the real --status-file is never opened for writing: the rejected
# candidate only ever existed in a temporary directory.
#
# SPRINT_STATUS_ALLOW_UNSAFE=1 proceeds anyway. That is a reviewed migration
# decision, never a way past an unexpected diff.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SPRINT_PLAN="${SPRINT_PLAN_SCRIPT:-$ROOT_DIR/.agents/skills/bmad-sprint-planning/scripts/sprint_plan.py}"
# How the generator is invoked. Overridable so the wrapper's own behaviour can
# be tested against a stub generator without a Python toolchain.
read -r -a SPRINT_PLAN_RUNNER <<< "${SPRINT_PLAN_RUNNER:-uv run}"

if [[ ! -f "$SPRINT_PLAN" ]]; then
  echo "sprint_plan.py not found at $SPRINT_PLAN" >&2
  exit 1
fi

# ── Normalise the invocation ──────────────────────────────────────────────
# argparse accepts `--flag value` and `--flag=value` interchangeably, so a
# wrapper that understands only the first form reads `--status-file=path` as an
# opaque token, finds no status file, and skips every check while passing the
# argument through to a generator that understands it perfectly well. Both forms
# are folded into one here, and the normalised vector is what gets checked AND
# what gets executed — so the two can never disagree about the invocation.
normalized=()
for arg in "$@"; do
  if [[ "$arg" == --?*=* ]]; then
    normalized+=("${arg%%=*}" "${arg#*=}")
  else
    normalized+=("$arg")
  fi
done
set -- "${normalized[@]}"

is_generate=0
already_dry_run=0
status_file=""
epic_file_args=()
set_args=()

previous=""
for arg in "$@"; do
  case "$previous" in
    --epic-file) epic_file_args+=(--epic-file "$arg") ;;
    --status-file) status_file="$arg" ;;
    --set) set_args+=(--set "$arg") ;;
  esac
  [[ "$arg" == "generate" ]] && is_generate=1
  [[ "$arg" == "--dry-run" ]] && already_dry_run=1
  previous="$arg"
done

# If we cannot tell which file a generate would write, we cannot promise
# anything about it. Refuse rather than fall through to an unchecked write.
if [[ "$is_generate" == "1" && "$already_dry_run" == "0" && -z "$status_file" ]]; then
  echo "sprint-status generate refused: no --status-file was found in the arguments," >&2
  echo "so the candidate cannot be compared with the file it would replace." >&2
  exit 1
fi

# ── 1 + 2. Identity, on the repository and on this run's actual inputs ─────
node "$ROOT_DIR/scripts/epic-id-guard.cjs" --root "${SPRINT_STATUS_GUARD_ROOT:-$ROOT_DIR}" >&2
if [[ ${#epic_file_args[@]} -gt 0 ]]; then
  echo "Checking the ${#epic_file_args[@]} argument(s) actually passed to the generator:" >&2
  # A missing output is a valid first-generation target.  It has no existing
  # tracking state to inspect, so do not ask the guard to read it; the passed
  # epic files still undergo the same identity check below.
  if [[ -n "$status_file" && -f "$status_file" ]]; then
    node "$ROOT_DIR/scripts/epic-id-guard.cjs" \
      --root "${SPRINT_STATUS_GUARD_ROOT:-$ROOT_DIR}" \
      "${epic_file_args[@]}" \
      --status-file "$status_file" >&2
  else
    node "$ROOT_DIR/scripts/epic-id-guard.cjs" \
      --root "${SPRINT_STATUS_GUARD_ROOT:-$ROOT_DIR}" \
      "${epic_file_args[@]}" >&2
  fi
fi

# ── 3. Candidate vs current ───────────────────────────────────────────────
if [[ "$is_generate" == "1" && "$already_dry_run" == "0" && "${SPRINT_STATUS_ALLOW_UNSAFE:-0}" != "1" && -f "$status_file" ]]; then
  preview_dir="$(mktemp -d)"
  trap 'rm -rf "$preview_dir"' EXIT
  candidate="$preview_dir/candidate.yaml"
  cp "$status_file" "$candidate"

  # Same arguments, pointed at the copy. Whatever --fresh, --set and story-file
  # detection would do to the real file, they do to this one instead.
  candidate_args=()
  previous=""
  for arg in "$@"; do
    if [[ "$previous" == "--status-file" ]]; then
      candidate_args+=("$candidate")
    else
      candidate_args+=("$arg")
    fi
    previous="$arg"
  done

  if ! "${SPRINT_PLAN_RUNNER[@]}" "$SPRINT_PLAN" "${candidate_args[@]}" >/dev/null; then
    echo "sprint-status generate refused: the generator failed on a copy, so the real file was left untouched." >&2
    exit 1
  fi

  if ! node "$ROOT_DIR/scripts/sprint-status-diff.cjs" \
      --before "$status_file" --after "$candidate" "${set_args[@]+"${set_args[@]}"}" 2>"$preview_dir/diff.txt"; then
    {
      echo "sprint-status generate refused: the candidate does not preserve the current tracking state."
      cat "$preview_dir/diff.txt"
      echo
      echo "A dropped entry loses its status, and an unrequested status change rewrites"
      echo "recorded progress: a 'done' story reappears as 'backlog' with no change ever"
      echo "reported. Reconcile the keys, state the intended changes with --set, or set"
      echo "SPRINT_STATUS_ALLOW_UNSAFE=1 if this migration is intended and reviewed."
      echo
      echo "$status_file was not modified."
    } >&2
    exit 1
  fi
fi

exec "${SPRINT_PLAN_RUNNER[@]}" "$SPRINT_PLAN" "$@"
