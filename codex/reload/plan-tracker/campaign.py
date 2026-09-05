"""Validate the five-version ledger and observe publication CI without dispatching it."""
import argparse
import datetime
import hashlib
import json
import re
import urllib.request
from pathlib import Path


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def validate(ledger, root):
    errors = []
    seen = set()
    def check(ok, message):
        if not ok:
            errors.append(message)
    for slot in ledger['versions']:
        label = slot['id']
        state = slot['status']
        check(state in {'planned', 'in_progress', 'built', 'deployed', 'tested', 'accepted', 'failed'}, label + ': unknown status')
        generation = slot.get('generation')
        if generation:
            check(bool(re.fullmatch(r'\d{12}', generation)), label + ': malformed generation')
            check(generation not in seen, label + ': duplicate generation')
            seen.add(generation)
        if state in {'built', 'deployed', 'tested', 'accepted'}:
            check(bool(generation), label + ': missing generation')
            for key in ('sourceCommit', 'engineCommit'):
                check(bool(re.fullmatch('[0-9a-f]{40}', slot.get(key) or '')), label + ': missing ' + key)
            check(bool(re.fullmatch('[0-9a-f]{64}', slot.get('buildSha256') or '')), label + ': missing buildSha256')
        if state in {'deployed', 'tested', 'accepted'}:
            check(bool(re.fullmatch('[0-9a-f]{40}', slot.get('publicationCommit') or '')), label + ': missing publicationCommit')
        kinds = set()
        for ref in slot.get('evidence', []):
            try:
                path = (root / ref['path']).resolve()
                check(path.is_relative_to(root.resolve()), label + ': evidence escapes offline root')
                if not path.is_relative_to(root.resolve()):
                    continue
                check(sha(path) == ref['sha256'], label + ': evidence bytes changed')
                # Measured record is still reviewed by the domain owner; no screenshot/string inference.
                if ref.get('result') == 'pass' and ref.get('generation') == generation:
                    expected_identity = {key: slot.get(key) for key in ('generation', 'sourceCommit', 'engineCommit', 'buildSha256')}
                    check(ref.get('release') == expected_identity, label + ': evidence release identity mismatch')
                    kinds.add(ref['kind'])
            except (KeyError, OSError) as error:
                errors.append(label + ': unavailable evidence ' + str(error))
        if state in {'deployed', 'tested', 'accepted'}:
            check('served-bytes' in kinds, label + ': missing exact served-byte receipt')
        if state in {'tested', 'accepted'}:
            check('real-app-browser' in kinds, label + ': missing real app browser receipt')
            check(set(slot['requiredProofs']) <= kinds, label + ': missing substantive change proof')
        if state == 'accepted':
            check(not slot.get('unresolvedBlockers'), label + ': accepted with unresolved blocker')
    check(len(ledger['versions']) >= 5, 'campaign requires at least five version slots')
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ledger', type=Path, required=True)
    parser.add_argument('--evidence-root', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--observe-ci', action='store_true')
    args = parser.parse_args()
    if not args.out.resolve().is_relative_to(args.evidence_root.resolve()):
        parser.error('write campaign observations only beneath the evidence folder')
    ledger = json.loads(args.ledger.read_text(encoding='utf8'))
    errors = validate(ledger, args.evidence_root)
    result = {'schema': 'spiders.five-version-checkpoint.v1',
              'observedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
              'ledgerSha256': sha(args.ledger), 'errors': errors,
              'scope': 'Receipt references and CI observations; not an independent rerun of product proofs.',
              'versions': [{k: s.get(k) for k in ('id', 'generation', 'status', 'nextAction')} for s in ledger['versions']]}
    if args.observe_ci:
        try:
            url = 'https://api.github.com/repos/Ventusltd/globalgrid2050/actions/runs?per_page=8'
            request = urllib.request.Request(url, headers={'User-Agent': 'spiders-build-context'})
            with urllib.request.urlopen(request, timeout=20) as response:
                runs = json.load(response)['workflow_runs']
            result['publicationCI'] = [{k: r.get(k) for k in ('id', 'name', 'head_sha', 'status', 'conclusion', 'html_url')} for r in runs]
        except Exception as error:
            errors.append('CI observation failed: ' + str(error))
    args.out.mkdir(parents=True, exist_ok=True)
    stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
    output = args.out / (stamp + '-checkpoint.json')
    output.write_text(json.dumps(result, indent=2) + '\n', encoding='utf8')
    print(json.dumps({'errors': errors, 'versions': result['versions'], 'receipt': str(output)}))
    raise SystemExit(bool(errors))


if __name__ == '__main__':
    main()
