#!/usr/bin/env node
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const tool = join(root, 'tools', 'estate-survey.mjs');
const registryPath = join(root, 'control', '20260904-estate-survey-registry.json');
const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
const temporary = mkdtempSync(join(tmpdir(), 'spiders-estate-survey-test-'));
let checks = 0;
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
  checks += 1;
};
const run = arguments_ => spawnSync(process.execPath, [tool, ...arguments_], {
  cwd: root,
  encoding: 'utf8',
});
const read = path => JSON.parse(readFileSync(path, 'utf8'));

try {
  const fixture = {
    schema: 'spiders.estate-survey-fixture.v1',
    repositories: {},
  };
  for (const repository of registry.repositories) {
    fixture.repositories[repository.name] = {
      metadata: {
        default_branch: repository.default_branch,
        private: false,
        archived: false,
        disabled: false,
        fork: repository.name === 'pandapower',
        has_pages: false,
      },
      commit: { sha: repository.head_sha },
      workflow_files: [],
    };
  }
  fixture.repositories.architecture.commit.sha = 'f'.repeat(40);
  fixture.repositories.architecture.metadata.archived = true;
  fixture.repositories.Mahabharata = { not_found: true };
  const fixturePath = join(temporary, 'fixture.json');
  writeFileSync(fixturePath, `${JSON.stringify(fixture, null, 2)}\n`);

  const localPath = join(temporary, 'local.json');
  let result = run(['registry', '--registry', registryPath, '--out', localPath]);
  assert(result.status === 0, `registry command failed: ${result.stderr}`);
  const local = read(localPath);
  assert(local.status === 'pass' && local.repository_count === 33, 'registry receipt is not a 33-repository pass');
  assert(local.shard_repository_counts.join(',') === '9,11,6,7', 'unexpected deterministic shard distribution');
  const repeatedLocalPath = join(temporary, 'local-repeated.json');
  result = run(['registry', '--registry', registryPath, '--out', repeatedLocalPath]);
  assert(result.status === 0, 'repeated registry command failed');
  assert(readFileSync(localPath).equals(readFileSync(repeatedLocalPath)), 'local registry receipt is not deterministic');

  const shards = [];
  for (let shard = 0; shard < 4; shard += 1) {
    const path = join(temporary, `shard-${shard}.json`);
    result = run([
      'survey', '--registry', registryPath, '--shard', String(shard),
      '--fixture', fixturePath, '--out', path,
    ]);
    assert(result.status === 0, `fixture shard ${shard} failed: ${result.stderr}`);
    assert(read(path).status === 'pass', `fixture shard ${shard} did not pass`);
    shards.push(path);
  }

  const aggregatePath = join(temporary, 'aggregate.json');
  result = run([
    'aggregate', '--registry', registryPath, '--local', localPath,
    '--shards', shards.join(','), '--out', aggregatePath,
  ]);
  assert(result.status === 0, `informational aggregation failed: ${result.stderr}`);
  const aggregate = read(aggregatePath);
  assert(aggregate.status === 'pass', 'informational findings made aggregate fail');
  assert(aggregate.observed_count === 33, 'aggregate did not observe every registry entry');
  assert(aggregate.findings.some(finding => finding.repository === 'architecture' && finding.kind === 'head-drift'), 'head drift was not reported');
  assert(aggregate.findings.some(finding => finding.repository === 'architecture' && finding.kind === 'repository-archived'), 'archival was not reported');
  assert(aggregate.findings.some(finding => finding.repository === 'Mahabharata' && finding.kind === 'repository-not-found'), 'missing repository was not informational');

  const repeatedShardPath = join(temporary, 'shard-0-repeated.json');
  result = run([
    'survey', '--registry', registryPath, '--shard', '0',
    '--fixture', fixturePath, '--out', repeatedShardPath,
  ]);
  assert(result.status === 0, 'repeated shard command failed');
  assert(readFileSync(shards[0]).equals(readFileSync(repeatedShardPath)), 'shard receipt is not deterministic');

  const incompleteFixture = structuredClone(fixture);
  delete incompleteFixture.repositories.architecture;
  const incompleteFixturePath = join(temporary, 'fixture-incomplete.json');
  const failedShardPath = join(temporary, 'shard-failed.json');
  writeFileSync(incompleteFixturePath, `${JSON.stringify(incompleteFixture, null, 2)}\n`);
  result = run([
    'survey', '--registry', registryPath, '--shard', '0',
    '--fixture', incompleteFixturePath, '--out', failedShardPath,
  ]);
  assert(result.status !== 0, 'missing fixture response passed the shard');
  assert(read(failedShardPath).status === 'fail', 'missing response did not emit a failed shard receipt');

  const corrupted = read(shards[0]);
  corrupted.registry_sha256 = '0'.repeat(64);
  const corruptedPath = join(temporary, 'shard-corrupt.json');
  writeFileSync(corruptedPath, `${JSON.stringify(corrupted, null, 2)}\n`);
  const brokenShards = [corruptedPath, ...shards.slice(1)];
  const failedAggregatePath = join(temporary, 'aggregate-failed.json');
  result = run([
    'aggregate', '--registry', registryPath, '--local', localPath,
    '--shards', brokenShards.join(','), '--out', failedAggregatePath,
  ]);
  assert(result.status !== 0, 'altered shard receipt passed aggregation');
  assert(read(failedAggregatePath).status === 'fail', 'altered shard did not produce a failed machinery receipt');

  const alteredLocal = read(localPath);
  alteredLocal.owner = 'OtherOwner';
  const alteredLocalPath = join(temporary, 'local-altered.json');
  const alteredLocalAggregatePath = join(temporary, 'aggregate-local-altered.json');
  writeFileSync(alteredLocalPath, `${JSON.stringify(alteredLocal, null, 2)}\n`);
  result = run([
    'aggregate', '--registry', registryPath, '--local', alteredLocalPath,
    '--shards', shards.join(','), '--out', alteredLocalAggregatePath,
  ]);
  assert(result.status !== 0, 'altered local receipt passed aggregation');
  const alteredLocalAggregate = read(alteredLocalAggregatePath);
  assert(alteredLocalAggregate.status === 'fail', 'altered local receipt did not fail the aggregate');
  assert(alteredLocalAggregate.machinery_errors.includes('local receipt differs from the checked-in registry receipt'),
    'altered local receipt was not reconciled against the checked-in registry');

  const invalidRegistry = structuredClone(registry);
  invalidRegistry.repositories[1] = structuredClone(invalidRegistry.repositories[0]);
  const invalidRegistryPath = join(temporary, 'registry-invalid.json');
  const invalidReceiptPath = join(temporary, 'registry-invalid-receipt.json');
  writeFileSync(invalidRegistryPath, `${JSON.stringify(invalidRegistry, null, 2)}\n`);
  result = run(['registry', '--registry', invalidRegistryPath, '--out', invalidReceiptPath]);
  assert(result.status !== 0, 'duplicated registry entry passed validation');
  assert(read(invalidReceiptPath).status === 'fail', 'invalid registry did not emit a failed receipt');

  console.log(JSON.stringify({
    schema: 'spiders.estate-survey-test.v1',
    status: 'pass',
    checks,
    repositories: 33,
    shards: 4,
  }));
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
