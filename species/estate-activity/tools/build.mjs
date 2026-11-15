// Estate Activity Spider: read-only observation of GitHub; no external repository writes.
// No model classification, inferred code dependencies or invented releases.
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const OWNER = 'Ventusltd';

export function isoDay(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(value)) return null;
  const d = new Date(value);
  return Number.isFinite(d.getTime()) ? d.toISOString().slice(0, 10) : null;
}

export function dayLabels(now, count = 7) {
  const d = new Date(now);
  if (!Number.isFinite(d.getTime())) throw Error('invalid scan time');
  d.setUTCHours(0, 0, 0, 0);
  return Array.from({length: count}, (_, i) => {
    const day = new Date(d);
    day.setUTCDate(d.getUTCDate() - (count - i - 1));
    return day.toISOString().slice(0, 10);
  });
}

export function summarizeCommits(name, commits, days, capReached = false) {
  if (!Array.isArray(commits)) throw Error('commit response is not an array for ' + name);
  const unique = new Map();
  for (const c of commits) {
    if (!/^[a-f0-9]{40}$/i.test(c?.sha ?? '')) continue;
    if (!unique.has(c.sha)) unique.set(c.sha, c);
  }
  const rows = [...unique.values()];
  const latest = rows[0] ?? null; // API returns the current branch first; this is HEAD, not 'most recent by author date'.
  const hist = Object.fromEntries(days.map(d => [d, 0]));
  const first = days[0];
  let inWindow = 0;
  for (const c of rows) {
    const d = isoDay(c.commit?.committer?.date ?? c.commit?.author?.date);
    if (d && d >= first && d in hist) {hist[d]++; inWindow++;}
  }
  return {
    repo: OWNER + '/' + name,
    url: 'https://github.com/' + OWNER + '/' + name,
    head_sha: latest?.sha ?? null,
    head_commit_url: latest?.html_url ?? null,
    head_commit_utc: latest?.commit?.committer?.date ?? null,
    sample_count: inWindow,
    count_is_lower_bound: !!capReached,
    day_counts: days.map(day => ({day, count: hist[day]})),
    recent: rows.slice(0, 5).map(c => ({
      sha: c.sha, url: c.html_url,
      utc: c.commit?.committer?.date ?? null,
      message: String(c.commit?.message ?? '').split('\n')[0].slice(0, 160)
    }))
  };
}

export function parseStanding(tsv) {
  if (typeof tsv !== 'string') throw Error('Kuiper standing TSV missing');
  const result = new Map();
  for (const line of tsv.split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue;
    const cells = line.split('\t');
    if (cells.length < 3 || !/^[a-f0-9]{12,40}$/i.test(cells[1])) continue;
    result.set(cells[0], {sha_prefix: cells[1], timestamp_unix: Number(cells[2]) || null});
  }
  if (!result.size) throw Error('Kuiper standing has no valid measured rows');
  return result;
}

export function comparePinned(repos, pins) {
  if (!Array.isArray(repos) || !Array.isArray(pins)) throw Error('invalid pin comparison');
  const live = new Map(repos.map(r => [r.repo, r.head_sha]));
  return pins.map(p => {
    const observed = live.get(p.repo) ?? null;
    const pinned = p.sha ?? p.sha_prefix ?? null;
    const status = !observed || !pinned ? 'unavailable' : observed.startsWith(pinned) ? 'aligned' : 'lagging';
    return {repo: p.repo, pinned_sha: pinned, observed_sha: observed, status};
  });
}

export function deriveRegistry(manifest) {
  if (!Array.isArray(manifest?.graphs)) throw Error('Spider receiver manifest missing graphs');
  const targets = ['periodic-table', 'modular', 'proof-of-work', 'genome-spider'];
  return targets.map(id => {
    const entry = manifest.graphs.find(g => g.id === id);
    const path = entry?.path ?? null;
    const expected = id === 'genome-spider' ? '/spiders/' : '/stars/';
    return {id, registered: typeof path === 'string' && path.includes(expected),
      source_path: path, receiver: 'https://ventusltd.github.io/ventus-grid-engine/?graph=' + id,
      served_bytes_checked: false};
  });
}

function githubHeaders(token) {
  return {'Accept':'application/vnd.github+json', 'Authorization':'Bearer ' + token,
    'X-GitHub-Api-Version':'2022-11-28', 'User-Agent':'Ventus-Activity-Spider'};
}
async function request(url, token, fetcher = fetch) {
  const response = await fetcher(url, {headers: githubHeaders(token), signal: AbortSignal.timeout(20000)});
  if (!response.ok) throw Error('GitHub/source request HTTP ' + response.status + ': ' + url);
  return response;
}
async function api(route, token, fetcher = fetch) {
  return (await request('https://api.github.com' + route, token, fetcher)).json();
}
async function raw(name, commit, file, token, fetcher = fetch) {
  if (!/^[a-f0-9]{40}$/i.test(commit ?? '')) throw Error('unverified source head for ' + name);
  return (await request('https://raw.githubusercontent.com/' + OWNER + '/' + name + '/' + commit + '/' + file, token, fetcher)).text();
}

export async function crawlRepo(name, labels, pages, token, fetcher = fetch) {
  const since = labels[0] + 'T00:00:00Z';
  let commits = [], capped = false;
  for (let page = 1; page <= pages; page++) {
    const rows = await api('/repos/' + OWNER + '/' + name + '/commits?since=' + encodeURIComponent(since) +
      '&per_page=100&page=' + page, token, fetcher);
    if (!Array.isArray(rows)) throw Error('invalid commits response for ' + name);
    commits.push(...rows);
    if (rows.length < 100) break;
    if (page === pages) capped = true;
  }
  return summarizeCommits(name, commits, labels, capped);
}

function isoMax(values) {
  const valid = values.filter(s => typeof s === 'string' && Number.isFinite(Date.parse(s)));
  return valid.length ? valid.sort((a, b) => Date.parse(b) - Date.parse(a))[0] : null;
}

export async function collect(config, token, now = new Date(), fetcher = fetch) {
  if (config.schema !== 'estate-activity.config.v1' || config.owner !== OWNER ||
      !Array.isArray(config.repos) || !config.repos.length ||
      !Number.isInteger(config.max_commit_pages) || config.max_commit_pages < 1 || config.max_commit_pages > 5)
    throw Error('invalid bounded config');
  const days = dayLabels(now, config.lookback_days);
  const repos = [];
  // Serial reads keep GitHub API usage predictable, avoiding burst rate limiting.
  for (const name of config.repos) {
    if (!/^[A-Za-z0-9._-]+$/.test(name)) throw Error('invalid repository name');
    repos.push(await crawlRepo(name, days, config.max_commit_pages, token, fetcher));
  }
  const byName = new Map(repos.map(r => [r.repo.split('/')[1], r]));
  const pinnedSha = name => byName.get(name)?.head_sha;
  for (const name of ['stars','kuiper-belt','ventus-grid-engine']) {
    if (!pinnedSha(name)) throw Error('cannot pin essential ' + name + ' main head');
  }
  const registry = deriveRegistry(JSON.parse(await raw('ventus-grid-engine', pinnedSha('ventus-grid-engine'),
    'spider/manifest.json', token, fetcher)));
  const standing = parseStanding(await raw('kuiper-belt', pinnedSha('kuiper-belt'),
    'cosmos/standing.tsv', token, fetcher));
  const starsSource = JSON.parse(await raw('stars', pinnedSha('stars'),
    'modular/source.json', token, fetcher));
  if (!Array.isArray(starsSource.repositories)) throw Error('Stars catalogue missing pinned repositories');
  const kuiperPins = [...standing].map(([name, row]) => ({repo: OWNER + '/' + name, sha_prefix: row.sha_prefix}));
  const starsPins = starsSource.repositories.map(p => ({repo: p.repo, sha: p.commit}));
  const inspected = new Set(repos.map(r => r.repo));
  const joins = {
    spider_receiver: {manifest_commit: pinnedSha('ventus-grid-engine'), registrations: registry},
    kuiper: {source_commit: pinnedSha('kuiper-belt'), file: 'cosmos/standing.tsv',
      pinned_rows: standing.size, comparisons: comparePinned(repos, kuiperPins.filter(p => inspected.has(p.repo)))},
    stars: {source_commit: pinnedSha('stars'), file: 'modular/source.json',
      source_generated_utc: starsSource.generated_utc ?? null, pinned_rows: starsPins.length,
      comparisons: comparePinned(repos, starsPins.filter(p => inspected.has(p.repo)))}
  };
  const pulls = [];
  for (const name of config.pr_repos) {
    if (!config.repos.includes(name)) throw Error('PR repository not in measured set: ' + name);
    const ps = await api('/repos/' + OWNER + '/' + name + '/pulls?state=open&sort=updated&direction=desc&per_page=60', token, fetcher);
    if (!Array.isArray(ps)) throw Error('invalid PR response for ' + name);
    for (const p of ps) {
      if (!/^[a-f0-9]{40}$/i.test(p.head?.sha ?? '')) continue;
      pulls.push({repo: OWNER + '/' + name, number: p.number, title: String(p.title ?? '').slice(0, 140),
        url: p.html_url, draft: !!p.draft, head_sha: p.head.sha, updated_utc: p.updated_at});
    }
  }
  pulls.sort((a, b) => String(b.updated_utc).localeCompare(String(a.updated_utc)));
  const comments = await api('/repos/' + OWNER + '/neural-link-between-agents/issues/comments?sort=created&direction=desc&per_page=100', token, fetcher);
  if (!Array.isArray(comments)) throw Error('invalid agent comment response');
  const messages = comments.filter(x => isoDay(x.created_at) >= days[0]).slice(0, 35).map(c => {
    const tag = /^\s*\[([^\]\n]{3,100})\]/.exec(c.body ?? '');
    return {id: c.id, url: c.html_url, issue_url: c.issue_url, utc: c.created_at,
      declared_tag: tag ? tag[1] : null, // self-declared label, NOT authenticated agent identity
      excerpt: String(c.body ?? '').replace(/\s+/g, ' ').slice(0, 190)};
  });
  const events = repos.flatMap(r => r.recent.map(c => c.utc))
    .concat(pulls.map(x => x.updated_utc), messages.map(x => x.utc));
  return {schema:'estate-activity-spider.v1', owner: OWNER,
    observation: 'public GitHub default-branch commits, open PR head snapshots and public issue comments; not individual agent process telemetry',
    window_start_utc: days[0] + 'T00:00:00Z', day_labels: days,
    latest_event_utc: isoMax(events),
    count_rule: '7 UTC calendar days; commit counts may be lower bounds if the API page cap is reached',
    repos, pulls: pulls.slice(0, 80), messages, joins, links: config.links,
    sources: {github:'GitHub REST API, public repos, exact commits and comment URLs',
      stars:'stars/modular/source.json at pinned stars HEAD',
      kuiper:'kuiper-belt/cosmos/standing.tsv at pinned Kuiper HEAD',
      spider:'ventus-grid-engine/spider/manifest.json at pinned receiver HEAD'},
    qualifications: ['Navigation links are not measured code dependencies.',
      'GitHub account comments and their self-declared agent tags do not establish live agent status.',
      'Registered graph URLs are not independently verified served HTTP bytes.',
      'A Kuiper or Stars pin behind a newer commit is expected between independent scans, not proof of a defect.']};
}

export async function main() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) throw Error('GITHUB_TOKEN or GH_TOKEN required; do not publish an unauthenticated partial snapshot');
  const config = JSON.parse(await readFile(path.join(ROOT, 'config.json'), 'utf8'));
  const snapshot = await collect(config, token);
  const output = path.join(ROOT, 'data', 'activity.json');
  const serialised = JSON.stringify(snapshot, null, 2) + '\n';
  await mkdir(path.dirname(output), {recursive: true});
  await writeFile(output, serialised, 'utf8');
  console.log('activity snapshot: ' + snapshot.repos.length + ' repos, ' + snapshot.pulls.length +
    ' open PRs, ' + snapshot.messages.length + ' comment references, date window starts ' + snapshot.window_start_utc);
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  main().catch(e => {console.error('ACTIVITY SPIDER HOLD: ' + e.message); process.exitCode = 1;});
}
