"""Check the next fifty work items; linked receipts are pointers, not acceptance."""
import json
import re
from pathlib import Path


def validate(data):
    errors = []
    rows = data.get('items', [])
    expected = {f'N{i:02}' for i in range(1, 51)}
    ids = [row.get('id') for row in rows]
    if len(ids) != 50 or set(ids) != expected:
        errors.append('exactly fifty unique N01..N50 items required')
    by_id = {row.get('id'): row for row in rows}
    for row in rows:
        for key in ['title', 'owner', 'module', 'feature', 'requiredProof', 'nextAction']:
            if not isinstance(row.get(key), str) or not row[key].strip():
                errors.append(f'{row.get("id")}: missing {key}')
        if row.get('status') not in ['planned', 'in_progress', 'blocked', 'linked']:
            errors.append(f'{row.get("id")}: roadmap cannot declare acceptance')
        if row.get('generation') and not re.fullmatch(r'\d{12}', row['generation']):
            errors.append(f'{row.get("id")}: invalid generation')
        if row.get('status') == 'linked':
            receipt = row.get('checkpoint', {})
            if not row.get('generation') or not receipt.get('path') or not re.fullmatch('[0-9a-f]{64}', receipt.get('sha256', '')):
                errors.append(f'{row.get("id")}: linked work requires generation and hashed checkpoint')
        if any(dep not in expected for dep in row.get('dependsOn', [])):
            errors.append(f'{row.get("id")}: unknown dependency')
    visiting, visited = set(), set()
    def visit(key):
        if key in visiting:
            errors.append('dependency cycle'); return
        if key in visited or key not in by_id:
            return
        visiting.add(key)
        for dep in by_id[key].get('dependsOn', []):
            visit(dep)
        visiting.remove(key); visited.add(key)
    for key in by_id:
        visit(key)
    return errors


if __name__ == '__main__':
    errors = validate(json.loads(Path(__file__).with_name('NEXT-50.json').read_bytes()))
    print(json.dumps({'ok': not errors, 'errors': errors, 'scope': 'Roadmap structure; no product acceptance claim.'}))
    raise SystemExit(bool(errors))
