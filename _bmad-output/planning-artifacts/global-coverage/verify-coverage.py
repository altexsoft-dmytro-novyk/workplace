#!/usr/bin/env python3
"""Mechanical completeness check for the People Management coverage model.

Run from _bmad-output/planning-artifacts/ :   python3 global-coverage/verify-coverage.py
Exit code 0 = all checks pass, 1 = at least one FAIL.

Checks what a human cannot hold in their head: that every requirement has an
owning slice, every story ID resolves in BOTH directions inside its OWN slice
file, every gate resolves in blockers.yaml, and every normative section has at
least one requirement. It does NOT check semantic adequacy — see README.md.
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
# the reverse direction is informational: infra/evidence/superseded stories legitimately
# live in a slice without an FR mapping. Listed, never failed.
extra = {sid: sorted(own[sid] - in_yaml.get(sid, set())) for sid in reg}
extra = {k: v for k, v in extra.items() if v}
print(f"  INFO  stories in a slice with no FR mapping (expected: infra, evidence, superseded):")
for k, v in sorted(extra.items()): print(f"          {k:5} {v}")

print("\n5. EPIC REFERENCES")
epic_refs = {e for r in reqs for e in (r.get('epics') or [])}
text = {p: open(p).read() for p in reg.values()}
unres = [e for e in sorted(epic_refs) if not any(re.search(rf'\b{re.escape(e)}\b', t) for t in text.values())]
check("every epics[] reference resolves in a slice file", not unres, str(unres))

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

print("\n" + "=" * 60)
print(f"{'ALL CHECKS PASS' if not FAIL else 'FAILED: ' + ', '.join(FAIL)}")
sys.exit(1 if FAIL else 0)
