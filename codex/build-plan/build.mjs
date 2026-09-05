import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {compilePlan} from './federation.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const mode=process.argv.includes('--apply')?'apply':'audit';
const outputArg=process.argv.find(x=>x.startsWith('--out='));
const out=path.resolve(outputArg?outputArg.slice(6):path.join(here,'reports'));
const raw=await fs.readFile(path.join(here,'master-plan.geojson'));
const sha=createHash('sha256').update(raw).digest('hex');
await fs.mkdir(out,{recursive:true});
let report={schema:'ventus.build-plan-run.v1',mode,planSha256:sha,checkedAt:new Date().toISOString(),ok:false,changes:[],scope:'Plan validation and declared graph compilation; no application release, source migration or API activation.'};
try {
  const plan=JSON.parse(raw);
  if(!/^\d{12}$/.test(plan.metadata?.revision))throw Error('Plan revision must be a UTC YYYYMMDDHHmm identifier');
  const graph=compilePlan(plan);
  const products={'nodes.json':graph.nodes,'edges.json':graph.edges,'evidence.json':graph.evidence,'manifest.json':graph.manifest};
  report={...report,ok:true,builds:plan.features.length,nodes:graph.nodes.features.length,edges:graph.edges.edges.length};
  const lines=['# Modular build programme','',`Plan revision: ${plan.metadata.revision}. All 100 increments are planned; no release timestamp has been allocated.`, '', 'Canonical input: master-plan.geojson. Historical releases remain in ../reload/plan-tracker/.', '', 'Transfers require a destination owner and pinned workflow/script dependency closure. Collectors stay outside GlobalGrid2050. Weekly refresh is independent of observation resolution.', ''];
  for(const f of plan.features){const p=f.properties;lines.push(`## ${f.id}: ${p.title}`,'',`Owner: ${p.ownerRepository}; proposed module: ${p.modulePath}.`,`Change: ${p.change}`,`Dependencies: ${p.dependsOn.join(', ')||'none within this programme'}.`,`Sources: ${p.sourceFeeds.join(', ')||'repository inputs and user requirements'}.`,`Local acceptance: ${p.acceptance.local}`,`Chrome: ${p.acceptance.chrome}`,`CI: ${p.acceptance.ci}`,`Publication: ${p.acceptance.deployed}`,`Rollback: ${p.rollback}`,'');}
  await fs.writeFile(path.join(out,'BUILD-PLAN.md'),lines.join('\n')+'\n');
  for(const [name,value] of Object.entries(products))await fs.writeFile(path.join(out,name),JSON.stringify(value,null,2)+'\n');
  if(mode==='apply'){
    const version=path.join(here,'versions',plan.metadata.revision);
    await fs.mkdir(version,{recursive:true});
    const archived=path.join(version,'master-plan.geojson');
    try{const prior=await fs.readFile(archived);if(!prior.equals(raw))throw Error('Immutable plan revision already contains different bytes');}catch(e){if(e.code!=='ENOENT')throw e;await fs.writeFile(archived,raw,{flag:'wx'});}
    const data=path.join(here,'data');await fs.mkdir(data,{recursive:true});
    for(const [name,value] of Object.entries(products)){await fs.writeFile(path.join(data,name),JSON.stringify(value,null,2)+'\n');report.changes.push(`data/${name}`);}
    await fs.writeFile(path.join(here,'BUILD-PLAN.md'),lines.join('\n')+'\n');
    await fs.writeFile(path.join(here,'CURRENT.json'),JSON.stringify({revision:plan.metadata.revision,planSha256:sha,manifest:'data/manifest.json',status:'planned'},null,2)+'\n');
  }
}catch(e){report.error=String(e);process.exitCode=1;}
await fs.writeFile(path.join(out,'LATEST.json'),JSON.stringify(report,null,2)+'\n');
await fs.writeFile(path.join(out,'LATEST.md'),`# Build-plan ${mode}\n\nResult: ${report.ok?'PASS':'FAIL'}\n\nPlan SHA256: ${sha}\n\n${report.error||report.scope}\n`);
console.log(JSON.stringify(report));
