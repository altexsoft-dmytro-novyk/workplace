#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const { execFile, execFileSync } = require('node:child_process');
const { promisify } = require('node:util');
const { newestRun } = require('./readiness-map.cjs');
const { build, writeMap } = require('./build-readiness-map.cjs');
const ROOT = path.resolve(__dirname, '..');
const runFile = promisify(execFile);
const github = async args => (await runFile('gh', args, {
  cwd: ROOT, timeout: 30000, maxBuffer: 8*1024*1024,
})).stdout;

async function syncOnce({repo, branch, output, state, gh = github, root = ROOT}) {
  let temp;
  try {
    const runs = JSON.parse(await gh(['run','list','--repo',repo,'--workflow','tests.yml',
      '--branch',branch,'--status','completed','--limit','20',
      '--json','databaseId,headSha,headBranch,status,conclusion,createdAt,url']));
    const run = newestRun(runs, branch);
    const artifacts = JSON.parse(await gh(['api',`repos/${repo}/actions/runs/${run.databaseId}/artifacts?per_page=100`]));
    const artifact = artifacts.artifacts.filter(a => a.name === 'live-verification-results' && !a.expired)
      .sort((a,b) => b.id-a.id)[0];
    if (!artifact) throw new Error(`Run ${run.databaseId}: live-verification-results is missing or expired`);
    const key = `${run.databaseId}:${artifact.id}`;
    if (key !== state.artifactKey) {
      temp = fs.mkdtempSync(path.join(os.tmpdir(),'workplace-readiness-'));
      await gh(['run','download',String(run.databaseId),'--repo',repo,
        '--name','live-verification-results','--dir',temp]);
      const evidence = JSON.parse(fs.readFileSync(path.join(temp,'live-verification-results.json'),'utf8'));
      const result = build(evidence, run, root);
      writeMap(output,result);
      state.revision = crypto.createHash('sha256').update(result.html).digest('hex');
      state.artifactKey = key;
      state.runUrl = run.url;
      state.observedAt = evidence.observed_at;
      state.sourceSha = evidence.source_sha;
      state.updatedAt = new Date().toISOString();
    }
    state.error = null;
    return true;
  } catch (error) {
    // Never publish an old report as if it came from the new run.
    // Error text is intentionally bounded; no credentials or environment are sent to the browser.
    state.error = `Failed to refresh the CI report (${error.code || error.message.slice(0,180)}). Showing the last data received.`;
    return false;
  } finally {
    state.checkedAt = new Date().toISOString();
    if (temp) fs.rmSync(temp,{recursive:true,force:true});
  }
}

function createServer({output,state}) {
  return http.createServer((req,res) => {
    const url = new URL(req.url,'http://localhost');
    res.setHeader('Cache-Control','no-store');
    res.setHeader('X-Content-Type-Options','nosniff');
    if (req.method !== 'GET') {res.writeHead(405);res.end();return;}
    if (url.pathname === '/status') {
      res.setHeader('Content-Type','application/json');
      res.end(JSON.stringify(state));return;
    }
    if (url.pathname !== '/') {res.writeHead(404);res.end();return;}
    if (!fs.existsSync(output)) {
      res.writeHead(503,{'Content-Type':'text/html; charset=utf-8'});
      res.end('<meta http-equiv="refresh" content="15"><p>Waiting for the CI report. The page will retry automatically.</p>');return;
    }
    let html = fs.readFileSync(output,'utf8');
    // A plain string replace no-ops silently if the template's CSP text is ever reformatted, which
    // would leave the page unable to fetch('/status') and break live-reload with no visible cause
    // beyond a browser-console CSP violation. Warn server-side so that's diagnosable.
    const cspSource='connect-src blob: data:', cspTarget="connect-src 'self' blob: data:";
    if (!html.includes(cspSource)) console.error(`readiness map template CSP text not found ("${cspSource}"); live-reload polling will be blocked by CSP`);
    html = html.replace(cspSource, cspTarget);
    const revision = JSON.stringify(state.revision || '');
    const client = `<script>
    (()=>{const revision=${revision};let busy=false;
    async function check(){if(busy)return;busy=true;const el=document.getElementById('sync-status');
      try{const response=await fetch('/status',{cache:'no-store'});if(!response.ok)throw Error('status');const s=await response.json();
      if(s.revision && s.revision!==revision){location.reload();return;}
      if(el){el.textContent=s.error||('Auto-refresh CI · checked '+(s.checkedAt||'pending')+' · branch '+s.branch);el.classList.toggle('text-destructive',Boolean(s.error));}}
      catch{if(el){el.textContent='Auto-refresh unavailable: the local process stopped or the connection was lost. Showing the last snapshot.';el.classList.add('text-destructive');}}
      finally{busy=false;}}
    check();setInterval(check,5000);})();</script>`;
    if (!html.includes('</body>')) console.error('readiness map output has no </body> tag; live-reload client script was not injected');
    html = html.replace('</body>',client+'</body>');
    res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);
  });
}

async function main() {
  const args=process.argv.slice(2);
  const value=(key,fallback)=>args.includes(key)?args[args.indexOf(key)+1]:fallback;
  const remote=execFileSync('git',['remote','get-url','origin'],{cwd:ROOT,encoding:'utf8'}).trim();
  const repo=value('--repo',remote.replace(/^https:\/\/github.com\//,'').replace(/^git@github.com:/,'').replace(/\.git$/,''));
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) throw Error('Use --repo OWNER/REPO for a GitHub repository');
  const branch=value('--branch',execFileSync('git',['branch','--show-current'],{cwd:ROOT,encoding:'utf8'}).trim());
  if (!branch) throw Error('Use --branch with a detached checkout');
  const output=path.resolve(value('--out',path.join(ROOT,'docs/demo/workplace-readiness-2026-09-07.html')));
  const interval=Number(value('--interval','60'));
  const port=Number(value('--port','4399'));
  if (!Number.isFinite(interval)||interval<15||!Number.isInteger(port)||port<1||port>65535) throw Error('Invalid interval (min 15 seconds) or port');
  const state={branch,repo,error:null};
  const options={repo,branch,output,state};
  const ok=await syncOnce(options);
  console.log(JSON.stringify(state));
  if (!args.includes('--serve')) {if(!ok)process.exitCode=1;return;}
  const server=createServer({output,state});
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});
  console.log(`Live map: http://127.0.0.1:${port} (CI check every ${interval}s)`);
  let timer;
  const tick=async()=>{await syncOnce(options);timer=setTimeout(tick,interval*1000);};
  timer=setTimeout(tick,interval*1000);
  const stop=()=>{clearTimeout(timer);server.close(()=>process.exit());};
  process.on('SIGINT',stop);process.on('SIGTERM',stop);
}
if(require.main===module)main().catch(error=>{console.error(error.message);process.exitCode=1;});
module.exports={syncOnce,createServer};
