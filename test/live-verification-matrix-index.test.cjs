const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { loadMatrixIndex, resolveRequirement } = require('../scripts/build-live-verification-results.cjs');

// A single Jest case can evidence several requirements: the ACM-1 foundation suite has one `it`
// listed under both ACM1-FB-01 and ACM1-FB-02..07. The producer used to index `(file, title)` to
// the first requirement only, so the others read `not_observed` although the test was green.

function writeMatrix(requirements) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'live-matrix-'));
  const file = path.join(dir, 'tea-trace-coverage-matrix.json');
  fs.writeFileSync(file, JSON.stringify({ requirements }));
  return file;
}

const shared = {
  file: 'services/backend/test/access-control/acm1r-fr-foundation.e2e-spec.ts',
  title: 'ACM1-FB-02 and ACM1-FB-07: seeds one FR hr-admin policy carrying no target',
};

test('a test shared by several requirements resolves to every one of them', () => {
  const { index } = loadMatrixIndex(
    writeMatrix([
      { id: 'ACM1-FB-01', tests: [shared] },
      { id: 'ACM1-FB-02', tests: [shared] },
      { id: 'ACM1-FB-07', tests: [shared, shared] },
    ]),
  );
  assert.equal(index.size, 1);
  const [key] = index.keys();
  const [file, title] = key.split('\u0000');
  const match = resolveRequirement({ file, title, ancestors: [] }, index, new Map());
  assert.deepEqual(match, { ids: ['ACM1-FB-01', 'ACM1-FB-02', 'ACM1-FB-07'], via: 'matrix' });
});

test('the title fallback still yields a single requirement', () => {
  const match = resolveRequirement(
    { file: 'x.spec.ts', title: 'um-rel-09 does a thing', ancestors: [] },
    new Map(),
    new Map([['UM-REL-09', 'doc.md']]),
  );
  assert.deepEqual(match, { ids: ['UM-REL-09'], via: 'title' });
});
