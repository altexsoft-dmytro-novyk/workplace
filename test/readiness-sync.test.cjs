const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {syncOnce}=require('../scripts/sync-readiness-map.cjs');
const evidence=()=>({source_sha:'abc',observed_at:'2026-09-07T12:00:00Z',producer:'CI',
  results:[{requirement_id:'ACF-AU-01',status:'fail',title:'<script>bad()</script>',evidence:'unit: example'}],
  run_summary:{missing_reports:[],matrix_used:'_bmad-output/test-artifacts/tea-trace-coverage-matrix-repo-2026-09-06.json'}});
function fixture(t){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'readiness-test-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));return path.join(dir,'index.html');}

// Builds an isolated `root` directory carrying only the minimal files build-readiness-map.cjs
// needs (seed data, trace-coverage matrix, canonical coverage YAML, template), so these tests
// never read this repo's own live production data and never break when that data changes.
function fixtureRoot(t){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'readiness-root-'));
  t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  fs.mkdirSync(path.join(dir,'docs/demo'),{recursive:true});
  fs.writeFileSync(path.join(dir,'docs/demo/workplace-readiness-data-2026-09-07.json'),JSON.stringify({
    modules:[],product:[],areas:[],
  }));
  fs.writeFileSync(path.join(dir,'docs/demo/readiness-template.html'),
    '<!doctype html><html><body><script type="application/json" id="workplace-data">__READINESS_DATA__</script></body></html>');
  fs.mkdirSync(path.join(dir,'_bmad-output/test-artifacts'),{recursive:true});
  fs.writeFileSync(path.join(dir,'_bmad-output/test-artifacts/tea-trace-coverage-matrix-repo-2026-09-06.json'),JSON.stringify({
    generated_at:'2026-09-06',
    requirements:[{id:'ACF-AU-01',title:'Example requirement',area:'auth',priority:'P0',coverage:'FULL',impl_state:'done',doc:'',tests:[]}],
  }));
  fs.mkdirSync(path.join(dir,'_bmad-output/planning-artifacts/global-coverage'),{recursive:true});
  fs.writeFileSync(path.join(dir,'_bmad-output/planning-artifacts/global-coverage/global-fr-epic-story-coverage.yaml'),
    'baseline_date: "2026-09-01"\nrequirements:\n  - id: ACF-AU-01\n    summary: Example requirement\n');
  return dir;
}

test('sync writes new failing CI data, safely embeds titles, and retains output when the artifact later expires',async t=>{
  const output=fixture(t),root=fixtureRoot(t),state={};let expired=false;
  const gh=async args=>{
    if(args[0]==='api')return JSON.stringify({artifacts:[{id:1,name:'live-verification-results',expired}]});
    if(args[1]==='list')return JSON.stringify([{databaseId:10,headSha:'abc',headBranch:'main',status:'completed',conclusion:'failure',createdAt:'2026-09-07',url:'https://github.com/a/b/actions/runs/10'}]);
    if(args[1]==='download'){fs.writeFileSync(path.join(args.at(-1),'live-verification-results.json'),JSON.stringify(evidence()));return '';}
    throw Error('Unexpected GitHub request');
  };
  assert.equal(await syncOnce({repo:'a/b',branch:'main',output,state,gh,root}),true);
  const html=fs.readFileSync(output,'utf8');
  assert.equal(html.includes('<script>bad()</script>'),false);
  const data=JSON.parse(html.match(/id="workplace-data">([\s\S]*?)<\/script>/)[1]);
  assert.equal(data.criteria.find(c=>c.id==='ACF-AU-01').live_observation,'failing');
  assert.equal(data.ci.counts.fail,1);
  assert.equal(data.product.length,1);
  expired=true;
  assert.equal(await syncOnce({repo:'a/b',branch:'main',output,state,gh,root}),false);
  assert.match(state.error,/expired/);
  assert.equal(fs.readFileSync(output,'utf8'),html);
});

test('a rerun artifact for the same run replaces earlier evidence',async t=>{
  const output=fixture(t),root=fixtureRoot(t),state={};let artifactId=1;
  const gh=async args=>{
    if(args[0]==='api')return JSON.stringify({artifacts:[{id:artifactId,name:'live-verification-results',expired:false}]});
    if(args[1]==='list')return JSON.stringify([{databaseId:10,headSha:'abc',headBranch:'main',status:'completed',createdAt:'2026-09-07'}]);
    const e=evidence();e.results[0].status=artifactId===1?'fail':'pass';
    fs.writeFileSync(path.join(args.at(-1),'live-verification-results.json'),JSON.stringify(e));return '';
  };
  await syncOnce({repo:'a/b',branch:'main',output,state,gh,root});const revision=state.revision;
  artifactId=2;await syncOnce({repo:'a/b',branch:'main',output,state,gh,root});
  assert.notEqual(state.revision,revision);
  assert.equal(state.artifactKey,'10:2');
});
