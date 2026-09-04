#!/usr/bin/env node
import { createHash } from 'node:crypto';
import {
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from 'node:fs';
import { dirname, relative, resolve } from 'node:path';

const REGISTRY_SCHEMA = 'spiders.estate-survey-registry.v1';
const LOCAL_SCHEMA = 'spiders.estate-survey-local.v1';
const SHARD_SCHEMA = 'spiders.estate-survey-shard.v1';
const AGGREGATE_SCHEMA = 'spiders.estate-survey-aggregate.v1';
const REQUIRED_CHECKS = [
  'repository-metadata',
  'default-branch-head',
  'workflow-inventory',
];
const MAX_REPOSITORIES = 64;
const REQUEST_TIMEOUT_MS = 20_000;

const args = process.argv.slice(2);
const mode = args.shift();
const valueAfter = flag => {
  const index = args.indexOf(flag);
  return index < 0 ? null : args[index + 1];
};
const portable = path => relative(process.cwd(), resolve(path)).replaceAll('\\', '/');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const byteCompare = (left, right) => Buffer.compare(Buffer.from(left), Buffer.from(right));
const shardFor = (owner, name, count) =>
  Number.parseInt(sha256(`${owner}/${name}`).slice(0, 8), 16) % count;

function stableWrite(path, value) {
  const output = resolve(path);
  mkdirSync(dirname(output), { recursive: true });
  const temporary = `${output}.tmp-${process.pid}`;
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  renameSync(temporary, output);
}

function parseJson(path, label) {
  const bytes = readFileSync(path);
  try {
    return { bytes, value: JSON.parse(bytes.toString('utf8')) };
  } catch (error) {
    throw new Error(`${label} JSON does not parse: ${error.message}`);
  }
}

function validateRegistry(path) {
  const errors = [];
  let parsed;
  try {
    parsed = parseJson(path, 'registry');
  } catch (error) {
    return { errors: [error.message], bytes: Buffer.alloc(0), registry: {} };
  }
  const registry = parsed.value;
  if (parsed.bytes.length > 128 * 1024) errors.push('registry exceeds 128 KiB bound');
  if (registry.schema !== REGISTRY_SCHEMA) errors.push('unknown registry schema');
  if (!/^[A-Za-z0-9-]+$/.test(registry.owner || '')) errors.push('invalid registry owner');
  if (registry.scope !== 'public-owner-repositories') errors.push('registry scope must be public-owner-repositories');
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(registry.captured_utc || '')) {
    errors.push('captured_utc must be an ISO-8601 UTC second');
  }
  if (registry.capture_method !== 'git ls-remote --symref <repository> HEAD') {
    errors.push('capture_method is not the bounded registry capture command');
  }
  if (registry.shard_count !== 4) errors.push('shard_count must be exactly 4');
  if (!Number.isInteger(registry.repository_count)
      || registry.repository_count < 1
      || registry.repository_count > MAX_REPOSITORIES) {
    errors.push(`repository_count must be between 1 and ${MAX_REPOSITORIES}`);
  }
  if (JSON.stringify(registry.checks) !== JSON.stringify(REQUIRED_CHECKS)) {
    errors.push(`checks must be exactly ${REQUIRED_CHECKS.join(', ')}`);
  }
  const repositories = Array.isArray(registry.repositories) ? registry.repositories : [];
  if (!Array.isArray(registry.repositories)) errors.push('repositories must be an array');
  if (repositories.length !== registry.repository_count) {
    errors.push(`repository_count ${registry.repository_count} does not match ${repositories.length} entries`);
  }
  const names = new Set();
  for (const [index, repository] of repositories.entries()) {
    const prefix = `repositories[${index}]`;
    const keys = repository && typeof repository === 'object'
      ? Object.keys(repository).sort().join(',') : '';
    if (keys !== 'default_branch,head_sha,name') errors.push(`${prefix} has an unexpected shape`);
    if (!/^[A-Za-z0-9._-]+$/.test(repository?.name || '')) errors.push(`${prefix} has an invalid name`);
    if (!/^[A-Za-z0-9._/-]+$/.test(repository?.default_branch || '')) errors.push(`${prefix} has an invalid default branch`);
    if (!/^[0-9a-f]{40}$/.test(repository?.head_sha || '')) errors.push(`${prefix} has an invalid head SHA`);
    const folded = String(repository?.name || '').toLowerCase();
    if (names.has(folded)) errors.push(`${prefix} duplicates repository ${repository?.name}`);
    names.add(folded);
  }
  const sorted = [...repositories].sort((a, b) => byteCompare(a.name, b.name));
  if (repositories.some((repository, index) => repository.name !== sorted[index]?.name)) {
    errors.push('repositories must be sorted by UTF-8 name bytes');
  }
  const counts = Array.from({ length: registry.shard_count || 0 }, () => 0);
  for (const repository of repositories) {
    if (counts.length) counts[shardFor(registry.owner, repository.name, counts.length)] += 1;
  }
  if (counts.some(count => count < 1 || count > 12)) {
    errors.push(`shard allocation is outside 1..12 repositories: ${counts.join(',')}`);
  }
  return { errors, bytes: parsed.bytes, registry, shardCounts: counts };
}

function localReceipt(path) {
  const checked = validateRegistry(path);
  const receipt = {
    schema: LOCAL_SCHEMA,
    registry: portable(path),
    registry_sha256: sha256(checked.bytes),
    owner: checked.registry.owner ?? null,
    repository_count: checked.registry.repository_count ?? null,
    shard_count: checked.registry.shard_count ?? null,
    shard_repository_counts: checked.shardCounts || [],
    checks: checked.registry.checks || [],
    expectations: (checked.registry.repositories || []).map(repository => ({
      name: repository.name,
      default_branch: repository.default_branch,
      head_sha: repository.head_sha,
      shard: shardFor(checked.registry.owner, repository.name, checked.registry.shard_count),
    })),
    integrity_errors: checked.errors,
    status: checked.errors.length ? 'fail' : 'pass',
  };
  return { receipt, registry: checked.registry };
}

async function fetchJson(url, token) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'spiders-bounded-estate-survey',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  let response;
  try {
    response = await fetch(url, { headers, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  } catch (error) {
    throw new Error(`transport failure for ${url}: ${error.name}: ${error.message}`);
  }
  let body;
  try {
    body = await response.json();
  } catch (error) {
    throw new Error(`non-JSON response ${response.status} for ${url}: ${error.message}`);
  }
  if (response.status === 404) return { notFound: true, body };
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status} for ${url}: ${body?.message || 'unknown response'}`);
  }
  return { notFound: false, body };
}

function fixtureReader(path) {
  if (!path) return null;
  const fixture = parseJson(path, 'fixture').value;
  if (fixture.schema !== 'spiders.estate-survey-fixture.v1'
      || !fixture.repositories
      || typeof fixture.repositories !== 'object') {
    throw new Error('fixture has unknown schema or no repository map');
  }
  return async name => {
    if (!(name in fixture.repositories)) throw new Error(`fixture lacks repository ${name}`);
    return fixture.repositories[name];
  };
}

async function liveReader(owner, token, repository) {
  const base = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository.name)}`;
  const metadata = await fetchJson(base, token);
  if (metadata.notFound) return { not_found: true };
  if (typeof metadata.body?.default_branch !== 'string') {
    throw new Error(`${repository.name} metadata lacks a default branch`);
  }
  const branch = encodeURIComponent(metadata.body.default_branch);
  const commit = await fetchJson(`${base}/commits/${branch}`, token);
  const workflowFiles = await fetchJson(`${base}/contents/.github/workflows?ref=${branch}`, token);
  if (commit.notFound) throw new Error(`${repository.name} default branch returned 404`);
  return {
    metadata: metadata.body,
    commit: commit.body,
    workflow_files: workflowFiles.notFound ? [] : workflowFiles.body,
  };
}

function normaliseObservation(repository, raw) {
  const expected = {
    default_branch: repository.default_branch,
    head_sha: repository.head_sha,
  };
  if (raw?.not_found === true) {
    return {
      name: repository.name,
      availability: 'not-found',
      expected,
      observed: null,
      findings: ['repository-not-found'],
    };
  }
  const metadata = raw?.metadata;
  const commit = raw?.commit;
  const workflowFiles = raw?.workflow_files;
  if (!metadata || typeof metadata !== 'object') throw new Error(`${repository.name} metadata is missing`);
  if (!commit || !/^[0-9a-f]{40}$/.test(commit.sha || '')) throw new Error(`${repository.name} commit response lacks a full SHA`);
  if (!Array.isArray(workflowFiles)
      || workflowFiles.some(file => !file || typeof file.name !== 'string'
        || typeof file.type !== 'string' || !/^[0-9a-f]{40}$/.test(file.sha || '')
        || !Number.isInteger(file.size))) {
    throw new Error(`${repository.name} workflow inventory is malformed`);
  }
  if (typeof metadata.default_branch !== 'string'
      || typeof metadata.private !== 'boolean'
      || typeof metadata.archived !== 'boolean'
      || typeof metadata.disabled !== 'boolean'
      || typeof metadata.fork !== 'boolean'
      || typeof metadata.has_pages !== 'boolean') {
    throw new Error(`${repository.name} metadata response is malformed`);
  }
  const workflows = workflowFiles
    .filter(file => file.type === 'file' && /\.ya?ml$/i.test(file.name))
    .map(file => ({ name: file.name, sha: file.sha, size: file.size }))
    .sort((left, right) => byteCompare(left.name, right.name));
  const observed = {
    default_branch: metadata.default_branch,
    head_sha: commit.sha,
    private: metadata.private,
    archived: metadata.archived,
    disabled: metadata.disabled,
    fork: metadata.fork,
    has_pages: metadata.has_pages,
    workflow_files_total: workflows.length,
    workflow_files: workflows,
  };
  const findings = [];
  if (observed.private) findings.push('visibility-became-private');
  if (observed.default_branch !== expected.default_branch) findings.push('default-branch-drift');
  if (observed.head_sha !== expected.head_sha) findings.push('head-drift');
  if (observed.archived) findings.push('repository-archived');
  if (observed.disabled) findings.push('repository-disabled');
  return { name: repository.name, availability: 'observed', expected, observed, findings };
}

async function surveyShard(registryPath, shardIndex, fixturePath) {
  const local = localReceipt(registryPath);
  if (local.receipt.status !== 'pass') {
    return {
      schema: SHARD_SCHEMA,
      registry_sha256: local.receipt.registry_sha256,
      shard_index: shardIndex,
      shard_count: local.receipt.shard_count,
      assigned_count: 0,
      observations: [],
      machinery_errors: local.receipt.integrity_errors,
      status: 'fail',
    };
  }
  if (!Number.isInteger(shardIndex) || shardIndex < 0 || shardIndex >= local.registry.shard_count) {
    throw new Error(`shard must be an integer from 0 to ${local.registry.shard_count - 1}`);
  }
  const assigned = local.registry.repositories.filter(repository =>
    shardFor(local.registry.owner, repository.name, local.registry.shard_count) === shardIndex);
  const fixture = fixtureReader(fixturePath);
  const observations = [];
  const machinery = [];
  for (const repository of assigned) {
    try {
      const raw = fixture
        ? await fixture(repository.name)
        : await liveReader(local.registry.owner, process.env.GITHUB_TOKEN || '', repository);
      observations.push(normaliseObservation(repository, raw));
    } catch (error) {
      machinery.push(`${repository.name}: ${error.message}`);
      observations.push({
        name: repository.name,
        availability: 'unmeasured',
        expected: {
          default_branch: repository.default_branch,
          head_sha: repository.head_sha,
        },
        observed: null,
        findings: [],
      });
    }
  }
  return {
    schema: SHARD_SCHEMA,
    registry_sha256: local.receipt.registry_sha256,
    shard_index: shardIndex,
    shard_count: local.registry.shard_count,
    assigned_count: assigned.length,
    observations,
    findings_count: observations.reduce((sum, observation) => sum + observation.findings.length, 0),
    machinery_errors: machinery.sort(byteCompare),
    status: machinery.length ? 'fail' : 'pass',
  };
}

function findingRows(observation) {
  return observation.findings.map(kind => ({
    repository: observation.name,
    kind,
    expected: observation.expected,
    observed: observation.observed,
  }));
}

function aggregate(registryPath, localPath, shardPaths) {
  const errors = [];
  const localParsed = parseJson(localPath, 'local receipt');
  const local = localParsed.value;
  const expectedLocal = localReceipt(registryPath).receipt;
  if (expectedLocal.status !== 'pass') {
    errors.push(...expectedLocal.integrity_errors.map(error => `checked-in registry: ${error}`));
  }
  if (JSON.stringify(local) !== JSON.stringify(expectedLocal)) {
    errors.push('local receipt differs from the checked-in registry receipt');
  }
  if (local.schema !== LOCAL_SCHEMA || local.status !== 'pass') errors.push('local registry receipt is not a passing receipt');
  if (!/^[0-9a-f]{64}$/.test(local.registry_sha256 || '')) errors.push('local receipt lacks a registry digest');
  if (!/^[A-Za-z0-9-]+$/.test(local.owner || '')) errors.push('local receipt lacks a valid owner');
  if (!Array.isArray(local.expectations) || local.expectations.length !== local.repository_count) {
    errors.push('local receipt expectation count is inconsistent');
  }
  if (shardPaths.length !== local.shard_count) errors.push(`expected ${local.shard_count} shard paths, received ${shardPaths.length}`);
  const shardInputs = [];
  const observations = [];
  const seenShards = new Set();
  const expectations = new Map((local.expectations || []).map(expectation => [expectation.name, expectation]));
  for (const path of shardPaths) {
    try {
      const parsed = parseJson(path, 'shard receipt');
      const shard = parsed.value;
      shardInputs.push({ shard_index: shard.shard_index, sha256: sha256(parsed.bytes) });
      if (shard.schema !== SHARD_SCHEMA) errors.push(`${portable(path)} has an unknown shard schema`);
      if (shard.registry_sha256 !== local.registry_sha256) errors.push(`${portable(path)} registry digest differs from local receipt`);
      if (shard.shard_count !== local.shard_count) errors.push(`${portable(path)} shard count differs from local receipt`);
      if (!Number.isInteger(shard.shard_index) || shard.shard_index < 0 || shard.shard_index >= local.shard_count) {
        errors.push(`${portable(path)} has invalid shard index`);
      } else if (seenShards.has(shard.shard_index)) {
        errors.push(`duplicate shard ${shard.shard_index}`);
      } else {
        seenShards.add(shard.shard_index);
      }
      if (shard.status !== 'pass' || (shard.machinery_errors || []).length) {
        errors.push(...(shard.machinery_errors || [`shard ${shard.shard_index} did not pass`]));
      }
      if (!Array.isArray(shard.observations) || shard.observations.length !== shard.assigned_count) {
        errors.push(`shard ${shard.shard_index} observation count is inconsistent`);
      } else {
        const expectedCount = [...expectations.values()].filter(expectation =>
          expectation.shard === shard.shard_index).length;
        if (shard.assigned_count !== expectedCount) {
          errors.push(`shard ${shard.shard_index} assigned count differs from local receipt`);
        }
        for (const observation of shard.observations) {
          const expectation = expectations.get(observation?.name);
          if (expectation && expectation.shard !== shard.shard_index) {
            errors.push(`${observation.name} appeared in the wrong shard`);
          }
        }
        observations.push(...shard.observations);
        const findingsCount = shard.observations.reduce((sum, observation) =>
          sum + (Array.isArray(observation?.findings) ? observation.findings.length : 0), 0);
        if (shard.findings_count !== findingsCount) {
          errors.push(`shard ${shard.shard_index} findings count is inconsistent`);
        }
      }
    } catch (error) {
      errors.push(`${portable(path)}: ${error.message}`);
    }
  }
  for (let index = 0; index < local.shard_count; index += 1) {
    if (!seenShards.has(index)) errors.push(`missing shard ${index}`);
  }
  observations.sort((a, b) => byteCompare(a.name, b.name));
  const seenRepositories = new Set();
  for (const observation of observations) {
    if (seenRepositories.has(observation.name)) errors.push(`duplicate observation ${observation.name}`);
    seenRepositories.add(observation.name);
    const expectation = expectations.get(observation.name);
    if (!expectation) {
      errors.push(`unexpected observation ${observation.name}`);
      continue;
    }
    if (JSON.stringify(observation.expected) !== JSON.stringify({
      default_branch: expectation.default_branch,
      head_sha: expectation.head_sha,
    })) errors.push(`${observation.name} expectation differs from local receipt`);
    if (expectation.shard !== shardFor(local.owner, observation.name, local.shard_count)) {
      errors.push(`${observation.name} has inconsistent deterministic shard`);
    }
    let recomputedFindings = [];
    if (observation.availability === 'not-found') {
      if (observation.observed !== null) errors.push(`${observation.name} not-found observation carries remote state`);
      recomputedFindings = ['repository-not-found'];
    } else if (observation.availability === 'observed') {
      const observed = observation.observed;
      if (!observed
          || typeof observed.default_branch !== 'string'
          || !/^[0-9a-f]{40}$/.test(observed.head_sha || '')
          || typeof observed.private !== 'boolean'
          || typeof observed.archived !== 'boolean'
          || typeof observed.disabled !== 'boolean'
          || typeof observed.fork !== 'boolean'
          || typeof observed.has_pages !== 'boolean'
          || !Number.isInteger(observed.workflow_files_total)
          || !Array.isArray(observed.workflow_files)
          || observed.workflow_files.length !== observed.workflow_files_total
          || observed.workflow_files.some(file => !file || typeof file.name !== 'string'
            || !/^[0-9a-f]{40}$/.test(file.sha || '') || !Number.isInteger(file.size))) {
        errors.push(`${observation.name} carries malformed observed state`);
      } else {
        if (observed.private) recomputedFindings.push('visibility-became-private');
        if (observed.default_branch !== expectation.default_branch) recomputedFindings.push('default-branch-drift');
        if (observed.head_sha !== expectation.head_sha) recomputedFindings.push('head-drift');
        if (observed.archived) recomputedFindings.push('repository-archived');
        if (observed.disabled) recomputedFindings.push('repository-disabled');
      }
    } else {
      errors.push(`${observation.name} has invalid availability ${String(observation.availability)}`);
    }
    if (JSON.stringify(observation.findings) !== JSON.stringify(recomputedFindings)) {
      errors.push(`${observation.name} findings do not match observed state`);
    }
  }
  for (const name of expectations.keys()) {
    if (!seenRepositories.has(name)) errors.push(`missing observation ${name}`);
  }
  const findings = observations.flatMap(findingRows).sort((a, b) =>
    byteCompare(`${a.repository}/${a.kind}`, `${b.repository}/${b.kind}`));
  const uniqueErrors = [...new Set(errors)].sort(byteCompare);
  return {
    schema: AGGREGATE_SCHEMA,
    comparison: 'cloud-observation-vs-committed-local-registry',
    registry_sha256: local.registry_sha256,
    inputs: {
      local_receipt_sha256: sha256(localParsed.bytes),
      shard_receipts: shardInputs.sort((a, b) => a.shard_index - b.shard_index),
    },
    repository_count: local.repository_count,
    observed_count: observations.length,
    findings_count: findings.length,
    findings,
    machinery_errors: uniqueErrors,
    repositories: observations,
    status: uniqueErrors.length ? 'fail' : 'pass',
  };
}

async function main() {
  const output = valueAfter('--out');
  if (!output) throw new Error('missing --out receipt path');
  if (mode === 'registry') {
    const registry = valueAfter('--registry');
    if (!registry) throw new Error('missing --registry path');
    const { receipt } = localReceipt(registry);
    stableWrite(output, receipt);
    console.log(JSON.stringify(receipt));
    return receipt.status === 'pass' ? 0 : 1;
  }
  if (mode === 'survey') {
    const registry = valueAfter('--registry');
    const rawShard = valueAfter('--shard');
    if (!registry || rawShard === null) throw new Error('survey requires --registry and --shard');
    const receipt = await surveyShard(registry, Number(rawShard), valueAfter('--fixture'));
    stableWrite(output, receipt);
    console.log(JSON.stringify(receipt));
    return receipt.status === 'pass' ? 0 : 1;
  }
  if (mode === 'aggregate') {
    const registry = valueAfter('--registry');
    const local = valueAfter('--local');
    const shards = (valueAfter('--shards') || '').split(',').filter(Boolean);
    if (!registry || !local || !shards.length) throw new Error('aggregate requires --registry, --local and --shards');
    const receipt = aggregate(registry, local, shards);
    stableWrite(output, receipt);
    console.log(JSON.stringify(receipt));
    return receipt.status === 'pass' ? 0 : 1;
  }
  throw new Error('usage: estate-survey.mjs registry|survey|aggregate ...');
}

try {
  process.exitCode = await main();
} catch (error) {
  const output = valueAfter('--out');
  const receipt = {
    schema: 'spiders.estate-survey-machinery-failure.v1',
    mode: mode || null,
    machinery_errors: [`${error.name}: ${error.message}`],
    status: 'fail',
  };
  if (output) stableWrite(output, receipt);
  console.error(JSON.stringify(receipt));
  process.exitCode = 1;
}
