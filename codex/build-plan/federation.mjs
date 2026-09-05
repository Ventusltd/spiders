import {createHash} from 'node:crypto';
const record=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const text=x=>typeof x==='string'&&x.trim().length>0;
const safePath=x=>text(x)&&!/[\\:%?#]/.test(x)&&!x.startsWith('/')&&!x.split('/').some(p=>!p||p==='.'||p==='..');
const canonical=x=>Array.isArray(x)?'['+x.map(canonical).join(',')+']':record(x)?'{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canonical(x[k])).join(',')+'}':JSON.stringify(x);
const hash=x=>createHash('sha256').update(canonical(x)).digest('hex');
export function validatePlan(plan){
 const errors=[],check=(ok,message)=>{if(!ok)errors.push(message);};
 check(record(plan)&&plan.type==='FeatureCollection'&&plan.schema==='ventus.build-plan.v1','Expected ventus.build-plan.v1 FeatureCollection');
 check(record(plan?.metadata),'Metadata object required');
 if(!Array.isArray(plan?.features))return {ok:false,errors:[...errors,'Features array required']};
 check(plan.features.length===100,'Exactly100 builds required');
 const ids=new Set(),counts={gridatlas:0,pipelinenews:0},deps=new Map(),migrationPins=new Map();
 for(const [i,f] of plan.features.entries()){
  const p=f?.properties,id=f?.id,label=text(id)?id:'feature'+i;
  check(f?.type==='Feature'&&f.geometry===null,label+': geometry must be null Feature');
  check(text(id)&&!ids.has(id),label+': missing or duplicate ID');if(text(id))ids.add(id);
  if(!record(p)){errors.push(label+': properties required');continue;}
  check(Object.hasOwn(counts,p.app),label+': unsupported app');if(Object.hasOwn(counts,p.app))counts[p.app]++;
  for(const k of ['title','change','rollback'])check(text(p[k]),label+': '+k+' required');
  check(/^Ventusltd\/[A-Za-z0-9_.-]+$/.test(p.ownerRepository||''),label+': ownerRepository invalid');
  check(safePath(p.modulePath),label+': unsafe modulePath');
  check(p.status==='planned'&&p.generation===null,label+': only planned unreleased builds allowed; acceptance requires separate proofs');
  check(Array.isArray(p.evidence),label+': evidence array required');
  check(record(p.acceptance)&&['local','chrome','ci','deployed'].every(k=>text(p.acceptance[k])||(Array.isArray(p.acceptance[k])&&p.acceptance[k].length>0&&p.acceptance[k].every(text))),label+': four acceptance contracts required');
  check(Array.isArray(p.sourceFeeds)&&p.sourceFeeds.every(text)&&new Set(p.sourceFeeds).size===p.sourceFeeds.length,label+': sourceFeeds must be unique strings');
  if(Object.hasOwn(p,'migration')){
   const m=p.migration;
   check(record(m)&&/^Ventusltd\/[A-Za-z0-9_.-]+$/.test(m.sourceRepository||'')&&/^[a-f0-9]{40}$/.test(m.sourceCommit||''),label+': migration source pin invalid');
   if(record(m)){
    check(m.destinationRepository===p.ownerRepository&&safePath(m.destinationPath),label+': migration destination must match owner');
    check(m.transferStatus==='blocked_pending_dependency_audit',label+': migration cannot claim completed transfer');
    const files=Array.isArray(m.files)?m.files:[],names=new Set();
    check(files.length>0,label+': migration files required');
    for(const f of files){check(record(f)&&safePath(f.path)&&/^[a-f0-9]{64}$/.test(f.sha256||'')&&['workflow','script'].includes(f.kind)&&!names.has(f.path),label+': invalid migration file');if(record(f)){names.add(f.path);const key=m.sourceRepository+'@'+m.sourceCommit+'::'+f.path;check(!migrationPins.has(key)||migrationPins.get(key)===f.sha256,label+': conflicting migration file digest');migrationPins.set(key,f.sha256);}}
    check(Array.isArray(m.dependencies),label+': migration dependencies required');
    for(const d of Array.isArray(m.dependencies)?m.dependencies:[])check(record(d)&&names.has(d.from)&&names.has(d.to)&&d.type==='runs_script'&&files.find(f=>f.path===d.from)?.kind==='workflow'&&files.find(f=>f.path===d.to)?.kind==='script'&&text(d.evidence),label+': unresolved migration dependency');
   }
  }
  const validDeps=Array.isArray(p.dependsOn)&&p.dependsOn.every(text)&&new Set(p.dependsOn).size===p.dependsOn.length;
  check(validDeps,label+': dependsOn must be unique IDs');deps.set(id,validDeps?p.dependsOn:[]);
 }
 check(counts.gridatlas===50&&counts.pipelinenews===50,'Exactly50 GridAtlas and50 PipelineNews builds required');
 for(const [id,list] of deps)for(const dep of list)check(ids.has(dep),id+': dangling dependency '+dep);
 const visiting=new Set(),done=new Set();
 function visit(id){if(visiting.has(id)){errors.push('Dependency cycle at '+id);return;}if(done.has(id))return;visiting.add(id);for(const dep of deps.get(id)||[])if(ids.has(dep))visit(dep);visiting.delete(id);done.add(id);}
 for(const id of ids)visit(id);
 return {ok:errors.length===0,errors};
}
export function compilePlan(plan){
 const validation=validatePlan(plan);if(!validation.ok)throw Error(validation.errors.join('\n'));
 const planSha256=hash(plan),nodesById=new Map(),links=[],records=[];
 function node(id,label,kind,extra={}){if(!nodesById.has(id))nodesById.set(id,{type:'Feature',id,geometry:null,properties:{label,repo_type:kind,scope_type:kind,status:'planned',rag:'grey',status_reason:'Declared build plan; not observed implementation or acceptance',child_manifest:null,...extra}});return id;}
 function edge(from,to,kind,buildId,pointer,detail={}){links.push({from,to,kind});records.push({from,to,kind,buildId,classification:'declared_plan',planSha256,jsonPointer:pointer,...detail});}
 for(const [i,f] of plan.features.entries()){
  const p=f.properties,base='/features/'+i,build=node('build:'+f.id,p.title,'build',{build_id:f.id,app:p.app}),repo=node('repo:'+p.ownerRepository,p.ownerRepository,'repository'),module=node('module:'+p.ownerRepository+'::'+p.modulePath,p.modulePath,'module',{owner_repository:p.ownerRepository});
  edge(repo,build,'plans',f.id,base+'/properties/ownerRepository');edge(build,module,'proposes_module',f.id,base+'/properties/modulePath');
  for(const [j,feed] of p.sourceFeeds.entries())edge(node('source:'+feed,feed,'source'),build,'planned_source_input',f.id,base+'/properties/sourceFeeds/'+j);
  if(p.migration){
   const m=p.migration,sourceIds=new Map();
   for(const [j,file] of m.files.entries()){
    const id=node('migration:'+m.sourceRepository+'@'+m.sourceCommit+'::'+file.path,file.path,file.kind,{source_repository:m.sourceRepository,source_commit:m.sourceCommit,sha256:file.sha256});sourceIds.set(file.path,id);
    edge(id,build,'migration_source',f.id,base+'/properties/migration/files/'+j,{sourceCommit:m.sourceCommit,sourceRepository:m.sourceRepository});
   }
   for(const [j,d] of m.dependencies.entries())edge(sourceIds.get(d.from),sourceIds.get(d.to),'runs_script',f.id,base+'/properties/migration/dependencies/'+j,{classification:'declared_from_source',sourceCommit:m.sourceCommit,sourceRepository:m.sourceRepository,evidence:d.evidence});
   edge(build,repo,'planned_destination',f.id,base+'/properties/migration/destinationRepository',{destinationPath:m.destinationPath,transferStatus:m.transferStatus});
  }
  for(const [j,dep] of p.dependsOn.entries())edge('build:'+dep,build,'planned_prerequisite',f.id,base+'/properties/dependsOn/'+j);
 }
 const features=[...nodesById.values()].sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0),indices=new Map(features.map((f,i)=>[f.id,i]));
 const edges=[...new Map(links.map(e=>{const triple=[indices.get(e.from),indices.get(e.to),e.kind];return [JSON.stringify(triple),triple];})).values()].sort((a,b)=>a[0]-b[0]||a[1]-b[1]||a[2].localeCompare(b[2]));
 const nodes={type:'FeatureCollection',features},edgeDoc={edge_format:'index-array-v1',status_note:'Declared planned dependencies only; no geography, Git history or acceptance inferred.',edges};
 const evidence={schema:'ventus.build-plan-evidence.v1',planSha256,records,sourceEvidence:plan.features.map(f=>({buildId:f.id,evidence:structuredClone(f.properties.evidence),...(Object.hasOwn(f.properties,'migration')?{migration:structuredClone(f.properties.migration)}:{})}))};
 const manifest={schema_version:'atlas-cartridge-v0.2',public_title:'Ventus100-build plan',public_strapline:'Fifty PipelineNews and fifty GridAtlas planned increments',scope:{id:'ventus-build-plan',label:'Declared product build plan',scope_type:'repository_federation',parent_manifest:null},counts:{nodes:features.length,edges:edges.length,sectors:0},key_law_status:'PLANNED_NOT_ACCEPTED',key_note:'Geometry is null. Relations are declared proposals, not observed Git history or engineering verification.',tier:'geojson',sources:{nodes:'nodes.json',edges:'edges.json',evidence:'evidence.json',layers:null,sectors:null},provenance:{schema:'canonical-json-sha256-v1',planSha256,nodesSha256:hash(nodes),edgesSha256:hash(edgeDoc),evidenceSha256:hash(evidence)}};
 return {nodes,edges:edgeDoc,evidence,manifest};
}
