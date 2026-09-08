const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {syncOnce}=require('../scripts/sync-readiness-map.cjs');
const root=path.resolve(__dirname,'..');
const evidence=()=>({source_sha:'abc',observed_at:'2026-09-07T12:00:00Z',producer:'CI',
  results:[{requirement_id:'ACF-AU-01',status:'fail',title:'<script>bad()</script>',evidence:'unit: example'}],
  run_summary:{missing_reports:[],matrix_used:'_bmad-output/test-artifacts/tea-trace-coverage-matrix-repo-2026-09-06.json'}});
function fixture(t){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'readiness-test-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));return path.join(dir,'index.html');}

test('sync writes new failing CI data, safely embeds titles, and retains output on a later missing artifact',async t=>{
  const output=fixture(t),state={};let expired=false;
  const gh=async args=>{
    if(args[0]==='api')return JSON.stringify({artifacts:[{id:1,name:'live-verification-results',expired}]});
    if(args[1]==='list')return JSON.stringify([{databaseId:10,headSha:'abc',headBranch:'main',status:'completed',conclusion:'failure',createdAt:'2026-09-07',url:'https://github.com/a/b/actions/runs/10'}]);
    if(args[1]==='download'){fs.writeFileSync(path.join(args.at(-1),'live-verification-results.json'),JSON.stringify(evidence()));return '';}
    throw Error('Unexpected GitHub request');
  };
  assert.equal(await syncOnce({repo:'a/b',branch:'main',output,state,gh}),true);
  const html=fs.readFileSync(output,'utf8');
  assert.equal(html.includes('<script>bad()</script>'),false);
  const data=JSON.parse(html.match(/id="workplace-data">([\s\S]*?)<\/script>/)[1]);
  assert.equal(data.criteria.find(c=>c.id==='ACF-AU-01').live_observation,'failing');
  assert.equal(data.ci.counts.fail,1);
  assert.equal(data.product.length,42);
  expired=true;
  assert.equal(await syncOnce({repo:'a/b',branch:'main',output,state,gh}),false);
  assert.match(state.error,/expired/);
  assert.equal(fs.readFileSync(output,'utf8'),html);
});

test('a rerun artifact for the same run replaces earlier evidence',async t=>{
  const output=fixture(t),state={};let artifactId=1;
  const gh=async args=>{
    if(args[0]==='api')return JSON.stringify({artifacts:[{id:artifactId,name:'live-verification-results',expired:false}]});
    if(args[1]==='list')return JSON.stringify([{databaseId:10,headSha:'abc',headBranch:'main',status:'completed',createdAt:'2026-09-07'}]);
    const e=evidence();e.results[0].status=artifactId===1?'fail':'pass';
    fs.writeFileSync(path.join(args.at(-1),'live-verification-results.json'),JSON.stringify(e));return '';
  };
  await syncOnce({repo:'a/b',branch:'main',output,state,gh});const revision=state.revision;
  artifactId=2;await syncOnce({repo:'a/b',branch:'main',output,state,gh});
  assert.notEqual(state.revision,revision);
  assert.equal(state.artifactKey,'10:2');
});
