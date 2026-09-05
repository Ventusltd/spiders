"""Read exact public GitHub Actions runs; never dispatch, rerun or promote a release."""
import argparse
import concurrent.futures
import datetime
import json
import urllib.request
from pathlib import Path


def fetch(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'spiders-build-context', 'Accept': 'application/vnd.github+json'})
    with urllib.request.urlopen(request, timeout=20) as response:
        return json.load(response)


def inspect(target):
    repo, run_id = target['repository'], target['runId']
    base = f'https://api.github.com/repos/{repo}/actions/runs/{run_id}'
    record = {'repository': repo, 'runId': run_id, 'taskId': target['taskId'], 'scope': target['scope']}
    try:
        run = fetch(base)
        record.update({key: run.get(key) for key in ('head_sha', 'status', 'conclusion', 'html_url', 'updated_at')})
        record['expectedCommit'] = target['commit']
        record['identityMatches'] = run['head_sha'] == target['commit']
        jobs = fetch(base + '/jobs?per_page=100')
        record['jobsComplete'] = jobs['total_count'] <= 100
        record['jobs'] = [{'name': job['name'], 'conclusion': job['conclusion'], 'steps': [
            {'name': step['name'], 'status': step['status'], 'conclusion': step['conclusion']}
            for step in job.get('steps', [])]} for job in jobs['jobs']]
    except Exception as error:
        record['error'] = type(error).__name__ + ': ' + str(error)
    return record


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--plan', type=Path, default=Path(__file__).with_name('plan.json'))
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    targets = json.loads(args.plan.read_text(encoding='utf8'))['ciWatch']
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        records = list(pool.map(inspect, targets))
    result = {'schema': 'spiders.ci-context.v1', 'observedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
              'scope': 'Read-only historical exact-run observations, not latest-head or product certification.', 'runs': records}
    args.out.mkdir(parents=True, exist_ok=True)
    (args.out / 'ci-context.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf8')
    errors = sum(bool(r.get('error')) or not r.get('identityMatches', False) or not r.get('jobsComplete', False) for r in records)
    print(json.dumps({'observed': len(records), 'observationErrors': errors, 'productFailures': sum(r.get('conclusion') == 'failure' for r in records)}))
    # Product failures stay visible in the receipt; this exit reports observer health.
    raise SystemExit(1 if errors else 0)


if __name__ == '__main__':
    main()
