"""Validate resumable build checkpoints. Receipt integrity is not product certification."""
import argparse
import hashlib
import json
import re
from pathlib import Path

STATES = {'planned', 'in_progress', 'blocked', 'completed'}
SHA = re.compile(r'^[0-9a-f]{40}$')
HASH = re.compile(r'^[0-9a-f]{64}$')
RELEASE_KEYS = ('generation', 'sourceCommit', 'engineCommit', 'buildSha256')


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def beneath(root, relative):
    path = (root / relative).resolve()
    if not path.is_relative_to(root.resolve()) or Path(relative).is_absolute():
        raise ValueError('receipt path must stay beneath its supplied evidence root')
    return path


def validate(plan, root=None):
    errors = []
    def require(condition, message):
        if not condition:
            errors.append(message)
    require(plan.get('schema') == 'spiders.build-plan.v1', 'unsupported schema')
    tasks = plan.get('tasks', [])
    by_id = {t.get('id'): t for t in tasks}
    require(len(by_id) == len(tasks), 'duplicate task ID')
    release = plan.get('baselineRelease', {})
    require(bool(re.fullmatch(r'\d{12}', release.get('generation', ''))), 'invalid baseline generation')
    for key in ('sourceCommit', 'engineCommit'):
        require(bool(SHA.fullmatch(release.get(key, ''))), 'invalid baseline ' + key)
    require(bool(HASH.fullmatch(release.get('buildSha256', ''))), 'invalid baseline build hash')
    if root is not None:
        for ref in plan.get('handoverEvidence', []):
            try:
                require(digest(beneath(root, ref['path'])) == ref['sha256'], 'handover evidence changed: ' + ref['path'])
            except (OSError, ValueError, KeyError) as error:
                errors.append('handover evidence unavailable: ' + str(error))
    # Dependency cycles prevent any trustworthy resume order.
    def visit(task_id, stack):
        if task_id in stack:
            require(False, 'dependency cycle: ' + ' -> '.join(stack + [task_id]))
            return
        for dep in by_id[task_id].get('dependsOn', []):
            if dep in by_id:
                visit(dep, stack + [task_id])
    for task_id in by_id:
        visit(task_id, [])
    for task in tasks:
        tid = task.get('id', '<missing>')
        require(task.get('status') in STATES, tid + ': invalid status')
        for key in ('owner', 'nextAction', 'acceptance'):
            require(bool(task.get(key)), tid + ': missing ' + key)
        for dep in task.get('dependsOn', []):
            require(dep in by_id, tid + ': unknown dependency ' + dep)
            if task.get('status') == 'completed':
                require(by_id.get(dep, {}).get('status') == 'completed', tid + ': incomplete prerequisite ' + dep)
        if task.get('status') == 'blocked':
            require(bool(task.get('blockers')), tid + ': blocked without blocker')
        if task.get('status') != 'completed':
            continue
        require(root is not None, tid + ': completion requires local evidence validation')
        required = set(task.get('requiredProofs', []))
        require(bool(required), tid + ': completion has no required proof categories')
        proved = set()
        for ref in task.get('proofs', []):
            try:
                require(bool(HASH.fullmatch(ref.get('sha256', ''))), tid + ': invalid receipt digest')
                if root is None:
                    continue
                path = beneath(root, ref['path'])
                require(digest(path) == ref['sha256'], tid + ': receipt bytes changed')
                receipt = json.loads(path.read_text(encoding='utf8'))
                require(receipt.get('schema') == 'spiders.build-proof.v1', tid + ': unsupported proof schema')
                require(receipt.get('taskId') == tid, tid + ': proof belongs to another task')
                require(receipt.get('result') == 'pass', tid + ': non-passing proof')
                require(receipt.get('verification') == 'measured', tid + ': recorded claim cannot complete task')
                require(bool(receipt.get('checkedAt')), tid + ': missing proof time')
                require(bool(receipt.get('environment')), tid + ': missing environment')
                expected_environment = task.get('targetEnvironments', {}).get(receipt.get('kind'))
                require(bool(expected_environment) and receipt.get('environment') == expected_environment, tid + ': wrong environment identity')
                expected = task.get('targetRelease')
                require(bool(expected), tid + ': completed task lacks explicit target release')
                require(receipt.get('release') == expected, tid + ': wrong release identity')
                require(set((expected or {}).keys()) == set(RELEASE_KEYS), tid + ': incomplete target release tuple')
                if expected:
                    require(bool(re.fullmatch(r'\d{12}', expected.get('generation', ''))), tid + ': invalid target generation')
                    require(all(SHA.fullmatch(expected.get(k, '')) for k in ('sourceCommit', 'engineCommit')), tid + ': invalid target commits')
                    require(bool(HASH.fullmatch(expected.get('buildSha256', ''))), tid + ': invalid target build hash')
                commits = receipt.get('commits', {})
                require(bool(commits) and all(SHA.fullmatch(v) for v in commits.values()), tid + ': missing exact owning commits')
                require(bool(task.get('targetCommits')) and commits == task.get('targetCommits'), tid + ': wrong owning commit identity')
                artifacts = receipt.get('artifacts', [])
                require(bool(artifacts), tid + ': no underlying artifacts')
                for artifact in artifacts:
                    artifact_path = beneath(root, artifact['path'])
                    require(digest(artifact_path) == artifact.get('sha256'), tid + ': underlying artifact changed')
                proved.add(receipt.get('kind'))
            except (OSError, ValueError, KeyError, TypeError) as error:
                errors.append(tid + ': unreadable proof: ' + str(error))
        require(required <= proved, tid + ': missing proof categories ' + ', '.join(sorted(required - proved)))
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--plan', type=Path, default=Path(__file__).with_name('plan.json'))
    parser.add_argument('--evidence-root', type=Path)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    plan = json.loads(args.plan.read_text(encoding='utf8'))
    errors = validate(plan, args.evidence_root)
    # Deliberately excludes artifact paths, machine paths and arbitrary evidence content.
    result = {'schema': 'spiders.plan-validation.v1', 'planSha256': digest(args.plan),
              'ok': not errors, 'errors': errors,
              'scope': 'Checkpoint structure and supplied receipt integrity; not a product pass.',
              'tasks': [{k: t[k] for k in ('id', 'status', 'owner', 'dependsOn', 'nextAction')} for t in plan['tasks']]}
    args.out.mkdir(parents=True, exist_ok=True)
    (args.out / 'validation.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf8')
    lines = ['# Build plan resume', '', 'Plan SHA-256: ' + result['planSha256'], '', result['scope'], '']
    for task in result['tasks']:
        lines.extend([f"- {task['id']} | {task['status']} | {task['owner']}: {task['nextAction']}"])
    (args.out / 'RESUME.md').write_text('\n'.join(lines) + '\n', encoding='utf8')
    print(json.dumps({'ok': result['ok'], 'tasks': len(plan['tasks']), 'errors': errors}))
    raise SystemExit(0 if not errors else 1)


if __name__ == '__main__':
    main()
