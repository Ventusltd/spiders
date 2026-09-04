#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const read = file => readFileSync(file, 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const noPatchOperands = (text, file) => {
  assert(!/\+\s+(?:--|["'])/.test(text), `${file} contains a stray patch '+' shell operand`);
};
const pinnedActions = (text, file) => {
  for (const match of text.matchAll(/uses:\s*([^\s]+)@([^\s#]+)/g))
    assert(/^[0-9a-f]{40}$/.test(match[2]), `${file} action ${match[1]} is not pinned to a full commit`);
};

const llamaFile = '.github/workflows/20260904-llama-advisory.yml';
const llama = read(llamaFile);
const llamaTriggers = llama.split('\npermissions:\n', 1)[0];
noPatchOperands(llama, llamaFile);
pinnedActions(llama, llamaFile);
for (const token of [
  'workflow_dispatch:', 'default: false', 'push:', '- main', 'contents: read',
  'cancel-in-progress: true', 'timeout-minutes: 25',
  "github.event_name == 'push' || inputs.enable_advisory",
  'ff067f76dd8e9e05f0528056f1274adf01a54d70',
  '9217f5db79a29953eb74d5343926648285ec7e67',
  '74a4da8c9fdbcd15bd1f6d01d621410d31c6fc00986f5eb687824e7b93d7a9db',
  'timeout 180', '--n-predict 384', 'head -c 32768',
]) assert(llama.includes(token), `${llamaFile} missing ${token}`);
assert(!/^\s*schedule:/m.test(llamaTriggers), 'Llama workflow must not schedule itself');
assert(!/actions\/deploy|git push|permissions:\s*[\s\S]*contents:\s*write/.test(llama), 'Llama workflow acquired publication authority');

const proofFile = '.github/workflows/20260904-60x-program-proof.yml';
const proof = read(proofFile);
const proofTriggers = proof.split('\npermissions:\n', 1)[0];
noPatchOperands(proof, proofFile);
pinnedActions(proof, proofFile);
for (const token of ['workflow_dispatch:', 'pull_request:', 'push:', '- main', 'contents: read', 'cancel-in-progress: true', 'persist-credentials: false'])
  assert(proof.includes(token), `${proofFile} missing ${token}`);
assert(!/^\s*schedule:/m.test(proofTriggers), '60x proof must not schedule itself');
assert(!/actions\/deploy|git push|contents:\s*write/.test(proof), '60x proof acquired publication authority');

const surveyFile = '.github/workflows/20260904-estate-survey.yml';
const survey = read(surveyFile);
const surveyTriggers = survey.split('\npermissions:\n', 1)[0];
noPatchOperands(survey, surveyFile);
pinnedActions(survey, surveyFile);
for (const token of [
  'workflow_dispatch:', 'pull_request:', 'push:', '- main', 'contents: read',
  "- 'codex/**'",
  'cancel-in-progress: true', 'fail-fast: false', 'max-parallel: 4',
  'shard: [0, 1, 2, 3]', 'persist-credentials: false', 'if: always()',
  'tools/test-estate-survey.mjs', 'tools/test-cloud-workflows.mjs',
  'estate-survey.mjs registry', 'estate-survey.mjs survey', 'estate-survey.mjs aggregate',
]) assert(survey.includes(token), `${surveyFile} missing ${token}`);
assert(!/^\s*schedule:/m.test(surveyTriggers), 'estate survey must not schedule itself');
assert(!/actions\/deploy|git push|contents:\s*write|continue-on-error|llama|ollama|model[_ -]/i.test(survey),
  'estate survey acquired deploy, write, bypass or model authority');

console.log(JSON.stringify({ schema: 'spiders.cloud-workflow-test.v1', status: 'pass', workflows: 3 }));
