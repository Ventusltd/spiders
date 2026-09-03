#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const [mode, ...args] = process.argv.slice(2);
const option = name => {
  const index = args.indexOf(name);
  if (index < 0 || !args[index + 1]) throw new Error(`missing ${name}`);
  return resolve(args[index + 1]);
};
const readBounded = (path, limit) => {
  const bytes = statSync(path).size;
  if (bytes > limit) throw new Error(`${path} is ${bytes} bytes; limit is ${limit}`);
  return readFileSync(path);
};
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const atomicJson = (path, value) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(value, null, 2) + '\n');
};

if (mode === 'prepare') {
  const programPath = option('--program');
  const validationPath = option('--validation');
  const outputPath = option('--out');
  const programBytes = readBounded(programPath, 131072);
  const validation = JSON.parse(readBounded(validationPath, 65536));
  if (validation.schema !== 'spiders.autonomous-build-receipt.v1'
      || validation.status !== 'pass'
      || validation.program_sha256 !== hash(programBytes)) {
    throw new Error('authoritative pre-validation is absent, failed, or bound to different bytes');
  }
  const program = JSON.parse(programBytes);
  const compact = program.queue.map(item => ({
    slot: item.slot, lane: item.lane, state: item.state, qualifies: item.qualifies,
    commit: item.commit, improvement: item.improvement,
    tests: item.tests.map(test => ({ command: test.command, result: test.result })),
  }));
  const prompt = [
    'You are an advisory fault finder. You have no authority to pass, fail, edit, run, or promote anything.',
    'Inspect only the supplied data. Return at most 12 concise bullets. Cite slot numbers and fields.',
    'Look for inconsistent identities, false-green claims, missing receipts, duplicate work, and broken state delivery.',
    'Treat pending review as pending. Never upgrade a state. If no issue is supported, say no supported issue.',
    '',
    JSON.stringify({
      schema: program.schema,
      program_id: program.program_id,
      program_sha256: validation.program_sha256,
      promotion: program.promotion,
      state_delivery: program.state_delivery,
      retained_attempts: program.retained_attempts,
      queue: compact,
    }),
  ].join('\n');
  const bytes = Buffer.from(prompt);
  if (bytes.length > 65536) throw new Error(`prompt is ${bytes.length} bytes; limit is 65536`);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, bytes);
  console.log(JSON.stringify({ mode, bytes: bytes.length, sha256: hash(bytes) }));
} else if (mode === 'seal') {
  const promptPath = option('--prompt');
  const outputPath = option('--output');
  const statusPath = option('--runtime-status');
  const receiptPath = option('--receipt');
  const prompt = readBounded(promptPath, 65536);
  const output = readBounded(outputPath, 32768);
  const runtimeStatus = readBounded(statusPath, 4096);
  atomicJson(receiptPath, {
    schema: 'spiders.llama-advisory-receipt.v1',
    authority: 'advisory-only',
    can_change_gate: false,
    prompt: { bytes: prompt.length, sha256: hash(prompt) },
    output: { bytes: output.length, sha256: hash(output) },
    runtime_status: { bytes: runtimeStatus.length, sha256: hash(runtimeStatus), value: runtimeStatus.toString('utf8').trim() },
  });
  console.log(JSON.stringify({ mode, receipt: receiptPath }));
} else if (mode === 'validate') {
  const receipt = JSON.parse(readBounded(option('--receipt'), 65536));
  const prompt = readBounded(option('--prompt'), 65536);
  const output = readBounded(option('--output'), 32768);
  const status = readBounded(option('--runtime-status'), 4096);
  const errors = [];
  if (receipt.schema !== 'spiders.llama-advisory-receipt.v1') errors.push('unknown receipt schema');
  if (receipt.authority !== 'advisory-only' || receipt.can_change_gate !== false) errors.push('advisory authority boundary changed');
  for (const [name, bytes] of [['prompt', prompt], ['output', output], ['runtime_status', status]]) {
    if (receipt[name]?.bytes !== bytes.length || receipt[name]?.sha256 !== hash(bytes)) errors.push(`${name} hash/size mismatch`);
  }
  if (errors.length) throw new Error(errors.join('; '));
  console.log(JSON.stringify({ mode, status: 'pass', output_sha256: receipt.output.sha256 }));
} else {
  throw new Error('usage: llama-advisory.mjs prepare|seal|validate ...');
}
