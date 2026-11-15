// Public, read-only chart. Never interpret agent tags as proof of running processes.
const $ = id => document.getElementById(id);
const allowedHosts = new Set(['github.com','ventusltd.github.io','globalgrid2050.com']);
function safeLink(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && allowedHosts.has(parsed.hostname) ? parsed.href : null;
  } catch { return null; }
}
function el(tag, text, css) {
  const node = document.createElement(tag);
  if (text !== undefined && text !== null) node.textContent = String(text);
  if (css) node.className = css;
  return node;
}
function link(text, href, css) {
  const uri = safeLink(href);
  if (!uri) return el('span', text, css);
  const a = el('a', text, css);
  a.href = uri; a.rel = 'noopener noreferrer'; a.target = '_blank';
  return a;
}
function shortSha(sha) { return typeof sha === 'string' ? sha.slice(0, 12) : 'unavailable'; }
function utc(value) {
  if (!value || !Number.isFinite(Date.parse(value))) return 'unknown';
  return new Date(value).toISOString().slice(0, 16).replace('T',' ') + ' UTC';
}
function noData(root, message) {root.replaceChildren(el('p', message));}
function metrics(data) {
  const root = $('metrics'); root.replaceChildren();
  const samples = data.repos.reduce((n,r)=>n+(Number(r.sample_count)||0),0);
  const lower = data.repos.some(r=>r.count_is_lower_bound);
  const values = [
    [data.repos.length, 'Public repositories observed'],
    [(lower ? '≥' : '') + samples, 'Default-branch commits observed'],
    [data.pulls.length, 'Open PR snapshots'],
    [data.messages.length, 'Recent agent-repo comments']
  ];
  for (const [value, label] of values) {
    const div = el('div', null, 'metric');
    div.append(el('b', value),el('span',label)); root.append(div);
  }
}
function spark(values,days) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns,'svg');
  svg.setAttribute('viewBox','0 0 210 40');
  svg.setAttribute('class','spark');
  svg.setAttribute('role','img');
  const counts = values.map(x=>Math.max(0,Number(x.count)||0));
  svg.setAttribute('aria-label',days.map((d,i)=>d+': '+counts[i]).join('; '));
  const localMax = Math.max(1,...counts);
  counts.forEach((count,i)=>{
    const rect = document.createElementNS(ns,'rect');
    const h = count ? Math.max(3,Math.round(27*count/localMax)) : 2;
    rect.setAttribute('x',String(i*30+4));
    rect.setAttribute('y',String(32-h));
    rect.setAttribute('width','22');rect.setAttribute('height',String(h));
    rect.setAttribute('rx','2');rect.setAttribute('fill',count?'#46e8a4':'#244555');
    const title = document.createElementNS(ns,'title');
    title.textContent = days[i] + ': ' + count + ' commits';
    rect.append(title);svg.append(rect);
  });
  return svg;
}
function chart(data) {
  const root = $('chart');root.replaceChildren();
  const table = el('table');const head=el('thead');const hrow=el('tr');
  for(const h of ['Repository','Sampled commits','Daily activity (scaled within repository)','Observed head'])hrow.append(el('th',h));
  head.append(hrow);table.append(head);
  const body=el('tbody');
  const sorted=[...data.repos].sort((a,b)=>b.sample_count-a.sample_count || a.repo.localeCompare(b.repo));
  for (const r of sorted) {
    const row=el('tr');
    const repo=el('td',null,'reponame');repo.append(link(r.repo.split('/')[1],r.url));
    const count=el('td',(r.count_is_lower_bound?'≥':'')+r.sample_count);
    const bar=el('td');bar.append(spark(r.day_counts,data.day_labels));
    const sha=el('td');sha.append(link(shortSha(r.head_sha),r.head_commit_url||r.url,'label'));
    sha.append(el('div',utc(r.head_commit_utc),'label'));
    row.append(repo,count,bar,sha);body.append(row);
  }
  table.append(body);root.append(table);
  root.append(el('p','Bars: '+data.day_labels.join(' · ')+'; heights are normalised per repository. Counts and source SHAs are the auditable values.','label'));
}
function items(rootId,rows,kind) {
  const root=$(rootId);root.replaceChildren();
  if (!rows.length) return noData(root,kind==='pr'?'No open PRs in the monitored set.':'No recent comments in the seven-day evidence window.');
  for(const r of rows.slice(0,kind==='pr'?24:22)) {
    const card=el('div',null,'item');
    if(kind==='pr') {
      const title=(r.draft?'Draft ':'')+r.repo.split('/')[1]+' #'+r.number+': '+r.title;
      card.append(link(title,r.url));
      card.append(el('div','Updated '+utc(r.updated_utc)+' · head '+shortSha(r.head_sha),'meta'));
    } else {
      const tag=r.declared_tag||'Unlabelled GitHub comment';
      card.append(link(tag+' · '+utc(r.utc),r.url));
      card.append(el('div','Public GitHub comment; body intentionally not copied; agent runtime status unknown.','meta'));
    }
    root.append(card);
  }
}
function joinColumn(root,title,sourceUrl,comparisons) {
  const div=el('div');
  const heading=el('h3');heading.append(link(title,sourceUrl));div.append(heading);
  const totals={aligned:0,lagging:0,unavailable:0};
  for (const c of comparisons) totals[c.status]=(totals[c.status]||0)+1;
  div.append(el('p',totals.aligned+' aligned · '+totals.lagging+' behind latest observed head · '+totals.unavailable+' unavailable'));
  const ul=el('ul');
  for (const c of comparisons.filter(c=>c.status!=='aligned').slice(0,14)) {
    const li=el('li');
    li.append(link(c.repo.split('/')[1],'https://github.com/'+c.repo),
      el('span',' — '+c.status+' ('+shortSha(c.pinned_sha)+' vs '+shortSha(c.observed_sha)+')','label'));
    ul.append(li);
  }
  if(!ul.children.length)ul.append(el('li','All compared repository heads align at this snapshot.'));
  div.append(ul);root.append(div);
}
function joins(data) {
  const root=$('joins');root.replaceChildren();
  const wrapper=el('div',null,'two');
  const j=data.joins;
  joinColumn(wrapper,'Stars source pins',
    'https://github.com/Ventusltd/stars/blob/'+j.stars.source_commit+'/'+j.stars.file,j.stars.comparisons);
  joinColumn(wrapper,'Kuiper measured heads',
    'https://github.com/Ventusltd/kuiper-belt/blob/'+j.kuiper.source_commit+'/'+j.kuiper.file,j.kuiper.comparisons);
  root.append(wrapper);
  const reg=el('div');reg.append(el('h3','Spider receiver graph registrations'));
  for (const g of j.spider_receiver.registrations) {
    const line=el('div',null,'item');
    line.append(link(g.id,g.receiver),el('span',g.registered?' · registered in pinned manifest':' · NOT REGISTERED','label'));
    reg.append(line);
  }
  reg.append(el('p','Receiver manifest pinned at '+shortSha(j.spider_receiver.manifest_commit)+
    '. Source graph registrations checked; public served bytes not independently checked.','label'));
  root.append(reg);
  const cvaa=j.cvaa;
  const block=el('div');block.append(el('h3','CVAA vaccines and exact-head audit'));
  if (!cvaa) {
    block.append(el('p','CVAA evidence unavailable. No protection or green status inferred.','note'));
  } else {
    const vaccine=el('div',null,'item');
    vaccine.append(link('Pinned observed-before-asserted vaccine',cvaa.vaccine_url),
      el('span',' · '+cvaa.vaccine.status+' · registry SHA '+shortSha(cvaa.source_commit),'label'));
    vaccine.append(el('div','Policy reference only: a vaccine existing in a verified registry does not mean Spider executed its antibody.','meta'));
    block.append(vaccine);
    const registry=el('div',null,'item');
    registry.append(link('CVAA vaccines.lock at pinned head',cvaa.registry_url));
    block.append(registry);
    const audit=el('div',null,'item');
    const result=cvaa.audit;
    const title='CVAA full-history audit PR #'+result.pr+': '+result.status;
    audit.append(link(title,result.run_url||result.pr_url),
      el('div','Exact reviewed head '+shortSha(result.pr_head_sha)+
        ' · '+utc(result.run_updated_utc)+
        ' · conclusion '+String(result.workflow_conclusion||'not observed'),'meta'));
    if(result.status!=='PASSED_AT_HEAD')audit.append(el('p','No overall CVAA green acceptance is claimed.','note'));
    audit.append(el('p','Consumer vaccine execution in Spider: '+result.consumer_inoculation+'.','meta'));
    block.append(audit);
  }
  root.append(block);
}
function routes(data) {
  const root=$('routes');root.replaceChildren();
  for(const r of data.links){
    const uri=safeLink(r.url);if(!uri)continue;
    const card=link('',uri,'route');
    card.append(el('strong',r.name),el('small',r.kind+' · '+r.relation));
    root.append(card);
  }
}
async function load() {
  const status=$('status');
  try {
    const response=await fetch('./data/activity.json',{cache:'no-store'});
    if(!response.ok)throw Error('No successful published snapshot yet (HTTP '+response.status+').');
    const data=await response.json();
    if(data?.schema!=='estate-activity-spider.v1' || !Array.isArray(data.repos) ||
       !Array.isArray(data.pulls) || !Array.isArray(data.messages) || !data.joins)
      throw Error('Invalid Spider data contract; refused to chart.');
    status.textContent='Evidence window starts '+data.window_start_utc+' · latest recorded event '+utc(data.latest_event_utc)+
      ' · collector observed '+utc(data.observed_at_utc)+' · rendered '+utc(new Date().toISOString())+
      ' · collection is scheduled; this display does not poll GitHub live.';
    metrics(data);chart(data);items('prs',data.pulls,'pr');items('messages',data.messages,'message');
    joins(data);routes(data);
    $('limits').textContent=(data.qualifications||[]).join(' ') +
      ' The observed counts are bounded to the configured public-repository sample, not all private work or all estate commits.';
  } catch(error) {
    status.textContent='Snapshot unavailable — '+error.message+' Static navigation routes above remain usable; no results are inferred.';
    status.className='note';
  }
}
load();
