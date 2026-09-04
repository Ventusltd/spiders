#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const args = process.argv.slice(2);
const valueAfter = flag => {
  const index = args.indexOf(flag);
  return index < 0 ? null : args[index + 1];
};
const programPath = resolve(valueAfter('--program') || 'control/20260904-60x-program.json');
const receiptPath = valueAfter('--receipt');
const bytes = readFileSync(programPath);
const sha256 = createHash('sha256').update(bytes).digest('hex');
let program;
const errors = [];
const findings = [];
try { program = JSON.parse(bytes); }
catch (error) { errors.push(`program JSON does not parse: ${error.message}`); program = {}; }

const oid = value => /^[0-9a-f]{40}$/.test(String(value || ''));
if (program.schema !== 'spiders.autonomous-build-program.v1') errors.push('unknown schema');
if (program.total_slots !== 60) errors.push('total_slots must be 60');
if (program.promotion?.authority !== 'CEO' || program.promotion?.candidate_may_promote !== false)
  errors.push('promotion must remain CEO-only and unavailable to candidate branches');
if (program.execution?.order !== 'discovery-author-serial-cutter')
  errors.push('execution order must be discovery-author-serial-cutter');
if (program.execution?.serial_cutter?.no_op !== 'reject'
    || program.execution?.serial_cutter?.same_input_replay !== 'same-release')
  errors.push('serial cutter lacks no-op or idempotence protection');

const delivery = program.state_delivery || {};
for (const key of ['identity_from_state', 'receiver_acceptance_required', 'delivered_state_readback_required', 'fallback_distinguished'])
  if (delivery[key] !== true) errors.push(`state_delivery.${key} must be true`);

const lanes = Array.isArray(program.lanes) ? program.lanes : [];
if (lanes.length !== 2) errors.push('exactly two isolated build lanes are required');
for (const lane of lanes) {
  if (!lane || typeof lane.id !== 'string' || typeof lane.repository !== 'string') errors.push('lane identity is incomplete');
  if (!lane?.isolated_branch || lane.isolated_branch === 'main') errors.push(`${lane?.id || 'lane'} is not isolated from main`);
  if (!oid(lane?.base_commit) || !oid(lane?.observed_head)) errors.push(`${lane?.id || 'lane'} lacks exact base/head identity`);
  if (lane?.target_slots !== 30) errors.push(`${lane?.id || 'lane'} must own 30 slots`);
}

const queue = Array.isArray(program.queue) ? program.queue : [];
if (queue.length !== 60) errors.push(`queue has ${queue.length} entries, expected 60`);
const slots = new Set();
for (const item of queue) {
  if (!Number.isInteger(item?.slot) || item.slot < 1 || item.slot > 60 || slots.has(item.slot))
    errors.push(`invalid or duplicate slot ${String(item?.slot)}`);
  slots.add(item?.slot);
  if (!['pipeline', 'grid'].includes(item?.lane)) errors.push(`slot ${item?.slot} has unknown lane`);
  if (!Number.isInteger(item?.lane_iteration) || item.lane_iteration < 1 || item.lane_iteration > 30)
    errors.push(`slot ${item?.slot} has invalid lane_iteration`);
  if (item?.phases?.join('>') !== 'discovery>author>serial-cutter')
    errors.push(`slot ${item?.slot} breaks the phase order`);
  if (item?.commit !== null && !oid(item.commit)) errors.push(`slot ${item?.slot} has invalid commit`);
  if (item?.parent !== null && !oid(item.parent)) errors.push(`slot ${item?.slot} has invalid parent`);
  if (!Array.isArray(item?.tests)) errors.push(`slot ${item?.slot} has no test receipt list`);
  if (typeof item?.receipt_path !== 'string' || !item.receipt_path) errors.push(`slot ${item?.slot} has no receipt path`);
  const passing = item?.state === 'passed' && item.tests.length > 0 && item.tests.every(test => test.result === 'pass');
  if (item?.qualifies !== passing) errors.push(`slot ${item?.slot} qualification disagrees with its state/tests`);
  if (!passing) findings.push(`slot ${item?.slot} remains ${item?.state || 'unknown'} and is retained but not counted`);
}
for (const laneId of ['pipeline', 'grid']) {
  const items = queue.filter(item => item.lane === laneId);
  if (items.length !== 30) errors.push(`${laneId} has ${items.length} slots, expected 30`);
  const sequence = items.map(item => item.lane_iteration).sort((a, b) => a - b);
  if (sequence.join(',') !== Array.from({ length: 30 }, (_, index) => index + 1).join(','))
    errors.push(`${laneId} lane iterations are not exactly 1..30`);
}
for (const attempt of program.retained_attempts || []) {
  if (!['failed', 'superseded'].includes(attempt?.state)) errors.push('retained attempt must be failed or superseded');
  if (attempt?.qualifies !== false) errors.push('failed/superseded attempt must not count');
  if (!oid(attempt?.commit) || !Array.isArray(attempt?.tests)) errors.push('retained attempt lacks commit/test evidence');
}

const result = {
  schema: 'spiders.autonomous-build-receipt.v1',
  program: programPath.replaceAll('\\', '/'),
  program_sha256: sha256,
  slot_count: queue.length,
  qualifying_count: queue.filter(item => item.qualifies).length,
  structural_errors: errors,
  informational_findings: findings,
  status: errors.length ? 'fail' : 'pass',
};
if (receiptPath) {
  const output = resolve(receiptPath);
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
}
console.log(JSON.stringify(result, null, 2));
process.exitCode = errors.length ? 1 : 0;
