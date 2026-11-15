import test from 'node:test';
import assert from 'node:assert/strict';
import {dayLabels, isoDay, summarizeCommits, parseStanding, comparePinned, deriveRegistry, collect} from './build.mjs';

const SHA_A = 'a'.repeat(40);
const SHA_B = 'b'.repeat(40);
const SHA_C = 'c'.repeat(40);
const SHA_D = 'd'.repeat(40);
const when = '2026-11-15T12:00:00Z';
const days = dayLabels(when);

test('UTC calendar dates include exactly the current UTC day and previous six days', () => {
  assert.deepEqual(days, ['2026-11-09','2026-11-10','2026-11-11','2026-11-12',
    '2026-11-13','2026-11-14','2026-11-15']);
  assert.equal(isoDay('2026-11-15T00:30:00+02:00'), '2026-11-14');
  assert.equal(isoDay('not a date'), null);
});

test('commits are keyed by SHA, never double-counted; a capped response is a lower bound', () => {
  const one = {sha:SHA_A,html_url:'https://github.com/Ventusltd/stars/commit/' + SHA_A,
    commit:{committer:{date:'2026-11-15T11:00:00Z'},message:'Modular star'}};
  const old = {sha:SHA_B,html_url:'https://github.com/Ventusltd/stars/commit/' + SHA_B,
    commit:{committer:{date:'2026-11-01T10:00:00Z'},message:'Prior'}};
  const a = summarizeCommits('stars',[one,one,old],days,true);
  assert.equal(a.head_sha,SHA_A);
  assert.equal(a.sample_count,1);
  assert.equal(a.count_is_lower_bound,true);
  assert.equal(a.day_counts[6].count,1);
  assert.equal(a.recent.length,2);
});

test('pinned comparisons distinguish aligned, lagging and unavailable; they never claim failure', () => {
  const got = comparePinned([{repo:'Ventusltd/stars',head_sha:SHA_A}],
    [{repo:'Ventusltd/stars',sha:SHA_A.slice(0,12)},
      {repo:'Ventusltd/stars',sha:SHA_B},
      {repo:'Ventusltd/missing',sha:SHA_C}]);
  assert.deepEqual(got.map(x=>x.status),['aligned','lagging','unavailable']);
});

test('Kuiper measured rows and Spider manifest links require actual evidence', () => {
  const standing = parseStanding('# repo\thead\thead_unix\nstars\t' + SHA_A.slice(0,12) + '\t1794745000\n');
  assert.equal(standing.get('stars').sha_prefix,SHA_A.slice(0,12));
  assert.throws(()=>parseStanding('# no rows'),/no valid/);
  const links = deriveRegistry({graphs:[
    {id:'periodic-table',path:'https://ventusltd.github.io/stars/blocks/graph.json'},
    {id:'modular',path:'https://ventusltd.github.io/stars/modular/graph.json'},
    {id:'proof-of-work',path:'https://ventusltd.github.io/stars/proof/graph.json'},
    {id:'genome-spider',path:'https://ventusltd.github.io/spiders/species/genome-spider/data/nodes.json'}
  ]});
  assert.equal(links.filter(x=>x.registered).length,4);
  assert.ok(links.every(x=>x.served_bytes_checked===false));
  assert.equal(deriveRegistry({graphs:[]}).filter(x=>x.registered).length,0);
  assert.throws(()=>deriveRegistry({}),/missing graphs/);
});

test('full mocked crawl links exact repo SHA, Stars source and Kuiper measurements, not agent status', async () => {
  const commits = {
    stars:SHA_A, 'kuiper-belt':SHA_B, 'ventus-grid-engine':SHA_C,
    'neural-link-between-agents':SHA_D
  };
  const config={schema:'estate-activity.config.v1', owner:'Ventusltd', lookback_days:7,
    max_commit_pages:1, repos:Object.keys(commits),pr_repos:['neural-link-between-agents'],links:[]};
  const calls=[];
  async function fakeFetch(url) {
    calls.push(url);
    let payload;
    if (url.includes('/commits?since=')) {
      const repo=url.split('/repos/Ventusltd/')[1].split('/')[0];
      payload=[{sha:commits[repo],html_url:'https://github.com/Ventusltd/'+repo+'/commit/'+commits[repo],
        commit:{committer:{date:'2026-11-15T10:00:00Z'},message:'Verified public commit'}}];
    } else if(url.includes('/pulls?')) {
      payload=[{number:35,title:'Research',draft:true,html_url:'https://github.com/Ventusltd/neural-link-between-agents/pull/35',
        head:{sha:SHA_D},updated_at:'2026-11-15T11:00:00Z'}];
    } else if(url.includes('/issues/comments?')) {
      payload=[{id:123,created_at:'2026-11-15T11:20:00Z',
        html_url:'https://github.com/Ventusltd/neural-link-between-agents/issues/30#issuecomment-123',
        issue_url:'https://api.github.com/repos/Ventusltd/neural-link-between-agents/issues/30',
        body:'[AGENT 7] A comment, not proof of a running process'}];
    } else if(url.includes('/spider/manifest.json')) {
      payload={graphs:[{id:'periodic-table',path:'https://ventusltd.github.io/stars/blocks/graph.json'}]};
    } else if(url.includes('/cosmos/standing.tsv')) {
      payload='# repo\thead\thead_unix\nstars\t'+SHA_A.slice(0,12)+'\t1794745000\n';
    } else if(url.includes('/modular/source.json')) {
      payload={generated_utc:'2026-11-15T09:00:00Z',repositories:[
        {repo:'Ventusltd/stars',commit:SHA_A},{repo:'Ventusltd/kuiper-belt',commit:SHA_A}
      ]};
    } else throw Error('unrecognised mocked URL: '+url);
    return {ok:true,status:200,json:async()=>payload,
      text:async()=>typeof payload==='string'?payload:JSON.stringify(payload)};
  }
  const result=await collect(config,'mock-token',new Date(when),fakeFetch);
  assert.equal(result.repos.length,4);
  assert.equal(result.pulls.length,1);
  assert.equal(result.messages[0].declared_tag,'AGENT 7');
  assert.match(result.observation,/not individual agent process telemetry/);
  assert.equal(result.joins.kuiper.comparisons[0].status,'aligned');
  assert.equal(result.joins.stars.comparisons[1].status,'lagging');
  assert.equal(result.joins.spider_receiver.registrations[0].registered,true);
  assert.ok(calls.length>=7);
});

test('upstream HTTP failure aborts rather than publishing a fictitious empty graph', async () => {
  const config={schema:'estate-activity.config.v1',owner:'Ventusltd',lookback_days:7,
    max_commit_pages:1,repos:['stars'],pr_repos:[],links:[]};
  await assert.rejects(collect(config,'mock',new Date(when),
    async()=>({ok:false,status:403})),/HTTP 403/);
});
