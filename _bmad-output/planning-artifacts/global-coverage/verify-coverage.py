#!/usr/bin/env python3
"""Mechanical completeness check for the People Management coverage model.

Run from _bmad-output/planning-artifacts/ :   python3 global-coverage/verify-coverage.py
Exit code 0 = all checks pass, 1 = at least one FAIL.

Checks what a human cannot hold in their head: that every requirement has an
owning slice and an owning epic, every story ID resolves in BOTH directions
inside its OWN slice file, epics[] is neither missing nor narrower than the
epics its stories imply, every gate resolves in blockers.yaml, and every
normative section has at least one requirement. It does NOT check semantic
adequacy — see README.md.\n\nCheck 8 adds the missing direction: every scenario document must resolve to a\ncanonical requirement. Checks 1-7 are all top-down and cannot see a capability\nthat exists in code and tests but in no PM-FR.

Known limitation: check 7 reads only dotted subsection headings, so the
top-level `## N.` sections of project-requirements.md — including §7
Non-functional requirements and §8 Engineering process requirements
[NORMATIVE] — are outside its scope. NFRs are not in this model at all;
each slice asserts NFR-1..NFR-7 in its own epic file with no global rollup.
"""
import yaml, re, os, sys, glob
from collections import Counter, defaultdict

FAIL = []
def check(name, ok, detail=""):
    print(f"  {'PASS' if ok else 'FAIL'}  {name}" + (f"  — {detail}" if detail else ""))
    if not ok: FAIL.append(name)

d = yaml.safe_load(open('global-coverage/global-fr-epic-story-coverage.yaml'))
reqs = d['requirements']
reg = {s['id']: s['path'].replace('_bmad-output/planning-artifacts/', '') for s in d['source_slices']}

print("\n1. REQUIREMENT INVENTORY")
ids = [r['id'] for r in reqs]
nums = sorted(int(i.rsplit('-', 1)[1]) for i in ids)
check("exactly 42, no duplicates, no gaps",
      len(ids) == 42 and not [k for k, v in Counter(ids).items() if v > 1] and nums == list(range(1, 43)),
      f"{len(ids)} entries")

print("\n2. COVERAGE STATUS <-> STORIES")
bad = []
for r in reqs:
    st, s = r['coverage_status'], r.get('stories') or []
    if st in ('uncovered', 'deferred') and s: bad.append(f"{r['id']} {st} has stories")
    if st in ('specified', 'in-progress', 'implemented') and not s: bad.append(f"{r['id']} {st} has none")
check("uncovered/deferred empty, specified+ non-empty", not bad, str(bad) if bad else
      str(dict(Counter(r['coverage_status'] for r in reqs))))

print("\n3. SLICE REGISTRATION")
missing_file = [f"{k}:{p}" for k, p in reg.items() if not os.path.exists(p)]
check("every registered slice file exists", not missing_file, str(missing_file))
on_disk = sorted(glob.glob('*/epics.md'))
unreg = [f for f in on_disk if f not in reg.values()]
check("every epics.md on disk is registered", not unreg, str(unreg) if unreg else f"{len(on_disk)} files")
ns = {v.replace('-E*', '') for v in d['namespace_rules'].values() if isinstance(v, str) and v.endswith('-E*')}
check("every slice id has a namespace rule", not (set(reg) - ns), str(sorted(set(reg) - ns)))

print("\n4. STORY IDS — BIDIRECTIONAL, WITHIN THE OWNING SLICE")
pat = re.compile(r'\b([A-Z]{1,5})-E\d+-S\d+\.\d+\b')
own = {sid: {m.group(0) for m in pat.finditer(open(p).read()) if m.group(1) == sid}
       for sid, p in reg.items()}
in_yaml = defaultdict(set)
for r in reqs:
    for s in (r.get('stories') or []):
        in_yaml[s['id'].split('-E')[0]].add(s['id'])
orphans = {sid: sorted(in_yaml.get(sid, set()) - own[sid]) for sid in reg}
orphans = {k: v for k, v in orphans.items() if v}
check("every yaml story ID has an ID literal in its own slice file", not orphans, str(orphans))
# The reverse direction: a story in a slice file that no requirement maps to.
# Infra/evidence/superseded stories legitimately live here — but only when SAID SO.
# An unexplained entry is a real coverage hole (UM-E2, the magic-link login epic,
# sat in this bucket unnoticed), so it fails rather than prints.
exempt = set(d.get('unmapped_story_exemptions') or [])
extra = {sid: sorted(own[sid] - in_yaml.get(sid, set())) for sid in reg}
extra = {k: v for k, v in extra.items() if v}
declared = {k: [s for s in v if s in exempt] for k, v in extra.items()}
unexplained = {k: [s for s in v if s not in exempt] for k, v in extra.items()}
unexplained = {k: v for k, v in unexplained.items() if v}
print("  INFO  stories in a slice with no FR mapping, declared exempt:")
for k, v in sorted(declared.items()):
    if v: print(f"          {k:5} {v}")
check("every unmapped story is declared in unmapped_story_exemptions",
      not unexplained, str(unexplained))

print("\n5. EPIC REFERENCES")
epic_refs = {e for r in reqs for e in (r.get('epics') or [])}
text = {p: open(p).read() for p in reg.values()}
unres = [e for e in sorted(epic_refs) if not any(re.search(rf'\b{re.escape(e)}\b', t) for t in text.values())]
check("every epics[] reference resolves in a slice file", not unres, str(unres))

# epics[] is the ONLY place epic-level coverage is recorded, so it must be present on
# every requirement rather than inferred by a reader from story-ID prefixes.
nokey = [r['id'] for r in reqs if 'epics' not in r]
check("every requirement declares an epics[] key (may be empty)", not nokey, str(nokey))

# A requirement claimed as specified or better must name an owning epic. uncovered and
# deferred may be empty — that is the state those two statuses exist to record.
noepic = [f"{r['id']} {r['coverage_status']}" for r in reqs
          if r['coverage_status'] in ('specified', 'in-progress', 'implemented')
          and not (r.get('epics') or [])]
check("every specified/in-progress/implemented requirement names an epic", not noepic, str(noepic))

# epics[] must not be narrower than stories[]: an epic that owns a mapped story and is
# absent from epics[] makes the epic-level rollup silently wrong.
epat = re.compile(r'^[A-Z]{1,5}-E\d+')
narrow = {}
for r in reqs:
    implied = {epat.match(s['id']).group(0) for s in (r.get('stories') or []) if epat.match(s['id'])}
    gap = sorted(implied - set(r.get('epics') or []))
    if gap: narrow[r['id']] = gap
check("epics[] covers every epic implied by stories[]", not narrow, str(narrow))

# An epic assignment is not story coverage (PMC SD-7). Listed so the distinction stays
# visible in the report; never failed, because it is a legitimate recorded state.
epic_only = [f"{r['id']} {r['coverage_status']} {r['epics']}" for r in reqs
             if (r.get('epics') or []) and not (r.get('stories') or [])]
print("  INFO  epic-assigned but story-uncovered (an epic assignment is not coverage):")
for x in epic_only: print(f"          {x}")

# Coverage that rests entirely inside a slice whose own epic file is not final.
# Not a failure — a standing risk the rollup does not otherwise show.
def slice_status(path):
    fm = open(path).read().split('---')[1] if open(path).read().startswith('---') else ''
    m = re.search(r'^status:\s*(\S+)', fm, re.M)
    return m.group(1) if m else 'none'
sstat = {sid: slice_status(p) for sid, p in reg.items()}
nonfinal = {sid for sid, st in sstat.items() if st != 'final'}
draft_only = [r['id'] for r in reqs if (r.get('stories') or [])
              and {s['id'].split('-E')[0] for s in r['stories']} <= nonfinal]
print(f"  INFO  slice status: {sstat}")
print(f"  INFO  {len(draft_only)} requirements whose entire story coverage sits in a "
      f"non-final slice: {draft_only}")

print("\n6. GATES")
b = yaml.safe_load(open('architecture/architecture-people-management-ratification-2026-09-02/blockers.yaml'))
bids = {x['id'] for x in b['blockers']}
ung = [f"{r['id']}:{g}" for r in reqs for g in (r.get('gates') or []) if g not in bids]
check("every gate ID resolves in blockers.yaml", not ung, str(ung))

print("\n7. NORMATIVE SECTION COVERAGE")
refs = {n.replace('§', '').split()[0] for r in reqs for n in (r.get('normative_refs') or [])}
heads = []
for ln in open('../../docs/project-requirements.md'):
    m = re.match(r'^#{2,4}\s+(\d+(?:\.\d+)*)\s+(.+)', ln.strip())
    if m: heads.append((m.group(1), m.group(2)))
def covered(sec):
    return any(sec == r or sec.startswith(r + '.') or r.startswith(sec + '.') for r in refs)
un = [(s, t) for s, t in heads if not covered(s)]
allowed = all('GOOD TO HAVE' in t or 'OPTIONAL' in t.upper() for _, t in un)
check("every normative section has >=1 requirement (or is GOOD TO HAVE)", allowed,
      "; ".join(f"§{s} {t[:40]}" for s, t in un) or f"{len(heads)} sections")

print("\n8. BOTTOM-UP — SCENARIO DOCUMENTS RESOLVE TO A REQUIREMENT")
# Top-down checks (1-7) prove every PM-FR has an epic and a story. They never ask the
# reverse: that an acceptance-criteria document resolves back to a canonical requirement.
# Nothing else in the repo asks it either, which is how 244 of 387 scenario documents
# came to cite vocabularies (AD-n, CAP-n, bare FR-n) the model cannot resolve.
alias_map = defaultdict(set)
for r in reqs:
    for a in (r.get('aliases') or []): alias_map[a].add(r['id'])

# Documented normalizations: scenario prose and the model disagree on where the slice
# letter sits. Declared here so the rewrite is auditable rather than implicit.
def candidates(tok, area):
    yield tok
    m = re.fullmatch(r'FR-M(\d+)', tok)
    if m: yield f"M-FR-{m.group(1)}"                      # FR-M1  -> M-FR-1
    m = re.fullmatch(r'FR-(\d+[a-z]?)', tok)
    if m:
        pfx = {'user-management': 'UM', 'mentorship': 'M'}.get(area)
        if pfx: yield f"{pfx}-FR-{m.group(1)}"            # FR-16  -> UM-FR-16

TOK = re.compile(r'\b(?:PM-FR-\d+|FR-M?\d+[a-z]?)\b')
docs = sorted(glob.glob('../../docs/test-cases/**/*.md', recursive=True))
docs = [p for p in docs if os.path.basename(p).upper() != 'README.MD']
unresolved = defaultdict(list)
for p in docs:
    area = p.split('docs/test-cases/')[1].split('/')[0]
    head = open(p, errors='replace').read().split('## Scenario')[0]
    hit = False
    for tok in TOK.findall(head):
        if tok.startswith('PM-FR-') or any(c in alias_map for c in candidates(tok, area)):
            hit = True; break
    if not hit: unresolved[area].append(os.path.basename(p))
tot = sum(len(v) for v in unresolved.values())
check("every scenario document resolves to >=1 PM-FR",
      not unresolved,
      f"{tot} of {len(docs)} unresolved: " +
      ", ".join(f"{k}={len(v)}" for k, v in sorted(unresolved.items())))

print("\n" + "=" * 60)
print(f"{'ALL CHECKS PASS' if not FAIL else 'FAILED: ' + ', '.join(FAIL)}")
sys.exit(1 if FAIL else 0)
