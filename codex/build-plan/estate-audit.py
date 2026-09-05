"""Read-only, bounded estate survey. Same runner locally and in Actions; never runs target code."""
import argparse
import base64
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import re
import time
import urllib.request

API = 'https://api.github.com'
MAX_RESPONSE = 24_000_000
MAX_PART = 8_000_000


def get(path):
    headers = {'Accept': 'application/vnd.github+json', 'User-Agent': 'ventus-estate-audit'}
    if os.getenv('GH_TOKEN'):
        headers['Authorization'] = 'Bearer ' + os.environ['GH_TOKEN']
    request = urllib.request.Request(API + path, headers=headers)
    with urllib.request.urlopen(request, timeout=60) as response:
        raw = response.read(MAX_RESPONSE + 1)
    if len(raw) > MAX_RESPONSE:
        raise ValueError('API response exceeds pre-read budget: ' + path)
    return json.loads(raw)


def save(out, name, value):
    raw = (json.dumps(value, ensure_ascii=False, separators=(',', ':')) + '\n').encode('utf8')
    if len(raw) > MAX_PART:
        raise ValueError('Report partition exceeds 8 MB; repartition before writing')
    (out / name).write_bytes(raw)
    return {'file': name, 'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest()}


def references(source):
    patterns = {
        'repository-reference': r'(?:github\.com/|raw\.githubusercontent\.com/)(Ventusltd/[A-Za-z0-9_.-]+)',
        'action-reference': r'(?m)^\s*-?\s*uses:\s*([^\s#]+)',
        'script-reference': r'\b(?:python3?|node|bash)\s+([\w./-]+\.(?:py|mjs|js|sh))',
    }
    return sorted({(kind, match) for kind, pattern in patterns.items() for match in re.findall(pattern, source)})


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--out', type=Path, required=True)
    p.add_argument('--shard', type=int, default=0)
    p.add_argument('--shards', type=int, default=1)
    p.add_argument('--limit', type=int, default=300)
    args = p.parse_args()
    if not 0 <= args.shard < args.shards or not 1 <= args.limit <= 300:
        p.error('Invalid shard or repository limit')
    args.out.mkdir(parents=True, exist_ok=True)
    started = time.monotonic()
    since = (dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=153)).isoformat()
    repos = []
    discovery_complete = False
    for page in range(1, 5):
        batch = get(f'/users/Ventusltd/repos?per_page=100&page={page}&sort=full_name')
        repos.extend(batch)
        if len(batch) < 100:
            discovery_complete = True
            break
    repos.sort(key=lambda r: r['full_name'].lower())
    selected = repos[:args.limit][args.shard::args.shards]
    manifest = {'schema': 'ventus.estate-audit.v1', 'startedAt': dt.datetime.now(dt.timezone.utc).isoformat(),
                'grain': 'Repository snapshot pinned by commit; references keyed by repository, commit, source path, kind and target.',
                'scope': 'API-visible public estate; current bounded source references and up to 300 default-branch commits per repo over 153 days. No execution, semantic correctness or complete runtime dependency claim.',
                'discovered': len(repos), 'discoveryComplete': discovery_complete, 'selected': len(selected),
                'repositoryCapTruncated': len(repos) > args.limit, 'shard': args.shard, 'shards': args.shards,
                'budgets': {'reportPartitionBytes': MAX_PART, 'maxSourceFilesPerRepo': 16, 'maxSourceFileBytes': 512000,
                            'maxSourceBytesPerRepo': 4000000, 'maxElapsedSeconds': 4800}, 'records': [], 'errors': []}
    save(args.out, 'discovery.json', [{'repository': r['full_name'], 'defaultBranch': r['default_branch']} for r in repos])
    for repo in selected:
        name = repo['full_name']
        if time.monotonic() - started > 4800:
            manifest['errors'].append({'repository': name, 'error': 'Shard time budget reached; remaining repositories unscanned'})
            break
        try:
            head = get(f'/repos/{name}/commits/{repo["default_branch"]}')
            sha = head['sha']
            tree = get(f'/repos/{name}/git/trees/{head["commit"]["tree"]["sha"]}?recursive=1')
            entries = tree.get('tree', [])
            candidates = [e for e in entries if e['type'] == 'blob' and e.get('size', 0) <= 512000 and
                          (e['path'].startswith('.github/workflows/') or e['path'] in ('README.md', 'AGENTS.md', 'package.json', 'atlas/current.json') or e['path'].endswith('/config/repos.json'))]
            candidates.sort(key=lambda e: (not e['path'].startswith('.github/workflows/'), e['path']))
            sources, edges, total = [], [], 0
            for entry in candidates[:16]:
                if total + entry.get('size', 0) > 4000000:
                    break
                blob = get(f'/repos/{name}/git/blobs/{entry["sha"]}')
                raw = base64.b64decode(blob['content'])
                total += len(raw)
                source = {'path': entry['path'], 'blob': entry['sha'], 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}
                sources.append(source)
                edges.extend({'source': entry['path'], 'kind': k, 'target': v} for k, v in references(raw.decode('utf8', errors='replace')))
            commits = []
            history_truncated = True
            for page in range(1, 4):
                batch = get(f'/repos/{name}/commits?sha={sha}&since={since}&per_page=100&page={page}')
                commits.extend({'sha': c['sha'], 'date': c['commit']['committer']['date'], 'subject': c['commit']['message'].splitlines()[0][:500]} for c in batch)
                if len(batch) < 100:
                    history_truncated = False
                    break
            runs = get(f'/repos/{name}/actions/runs?per_page=10')
            record = {'repository': name, 'commit': sha, 'treeTruncated': tree.get('truncated', False),
                      'treeEntriesObserved': len(entries), 'eligibleSourceFiles': len(candidates), 'sources': sources,
                      'sourceCoverageTruncated': len(sources) < len(candidates), 'references': edges,
                      'historySince': since, 'historyTruncated': history_truncated, 'commits': commits,
                      'recentCI': [{k: r.get(k) for k in ('id', 'name', 'head_sha', 'status', 'conclusion', 'html_url')} for r in runs.get('workflow_runs', [])]}
            receipt = save(args.out, name.split('/')[1] + '.json', record)
            manifest['records'].append(dict(repository=name, commit=sha, **receipt))
        except Exception as error:
            manifest['errors'].append({'repository': name, 'error': str(error)})
        save(args.out, 'manifest.json', manifest)
        print(json.dumps({'repository': name, 'scanned': len(manifest['records']), 'errors': len(manifest['errors'])}), flush=True)
    manifest['finishedAt'] = dt.datetime.now(dt.timezone.utc).isoformat()
    manifest['ok'] = not manifest['errors'] and len(manifest['records']) == len(selected)
    save(args.out, 'manifest.json', manifest)
    (args.out / 'SUMMARY.md').write_text('Estate audit: ' + str(len(manifest['records'])) + '/' + str(len(selected)) + ' selected repositories scanned.\n\n' + manifest['scope'] + '\n\nSee manifest.json for explicit omissions, hashes and errors. This is observation evidence, not a release approval.\n', encoding='utf8')
    return 0 if manifest['ok'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
