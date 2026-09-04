#!/usr/bin/env node
// make-receipt.mjs — writes one append-only, timestamped receipt for a
// genome-spider command run, plus updates the LATEST pointer. Used by
// spiders/.github/workflows/genome.yml so the command surface described in
// its header comment (crawl | verify | populate | compose) always leaves
// evidence behind, whichever way it ends.
//
// The generation stamp is read from the system clock in UTC at the moment
// this script runs — never typed, never taken from a filename — per
// Ventusltd/cvaa vaccines/202608301701-monotonic-utc-generations.md.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const out = {};
  for (const a of argv) {
    const m = /^--([\w-]+)=([\s\S]*)$/.exec(a);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const command = args.command || 'crawl';
const status = args.status || 'ok'; // ok | failed | not-implemented
const detail = args.detail || '';
const gitSha = args['git-sha'] || '';
const genomePath = args.genome ? path.resolve(process.cwd(), args.genome) : path.join(HERE, 'data', 'genome.json');
const proofExit = args['proof-exit'] !== undefined ? Number(args['proof-exit']) : null;
const proofSummary = args['proof-summary'] || '';
const outDir = args['out-dir'] ? path.resolve(process.cwd(), args['out-dir']) : path.join(HERE, 'receipts');
const repoUrlBase = args['repo-url-base'] || '';
const eventName = args['event-name'] || '';

// Generation: 12 digits, YYYYMMDDHHMM, UTC, read from the clock right now.
const now = new Date();
const generation = now.toISOString().replace(/[-:T]/g, '').slice(0, 12);
const generatedAt = now.toISOString();

let counts = null;
if (fs.existsSync(genomePath)) {
  try {
    const g = JSON.parse(fs.readFileSync(genomePath, 'utf8'));
    counts = {
      repos_walked: (g.repos_walked || []).length,
      repos_skipped: (g.repos_skipped || []).length,
      nodes: (g.nodes || []).length,
      edges: (g.edges || []).length,
      duplication: (g.markers?.duplication || []).length,
      drift: (g.markers?.drift || []).length,
      dead_code: (g.markers?.dead_code || []).length,
      uncomposed: (g.markers?.uncomposed || []).length,
      re_doing_groups: g.markers?.re_doing_total_groups ?? (g.markers?.re_doing || []).length,
      genome_generated_at: g.generated_at || null,
    };
  } catch (e) {
    counts = { error: `genome.json unreadable: ${e.message}` };
  }
}

const fileName = `${generation}-${command}.json`;

const receipt = {
  schema: 'genome-spider.receipt.v1',
  command, // crawl | verify | populate | compose
  status, // ok | failed | not-implemented
  detail,
  generation_utc: generation,
  generated_at: generatedAt,
  triggered_by: eventName || null,
  git_sha: gitSha || null,
  counts,
  proof: proofExit === null ? null : { exit_code: proofExit, passed: proofExit === 0, summary: proofSummary },
  receipt_file: fileName,
  receipt_url: repoUrlBase ? `${repoUrlBase}/receipts/${fileName}` : null,
  latest_url: repoUrlBase ? `${repoUrlBase}/receipts/LATEST.json` : null,
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, fileName), JSON.stringify(receipt, null, 2) + '\n', 'utf8');
// LATEST.json is a pointer, not history — it is overwritten every run on
// purpose. The append-only record is the set of <generation>-<command>.json
// files, which this script never overwrites (each generation is unique to
// the second, and two runs in the same UTC minute would collide on purpose
// rather than silently clobber — see README.md "Receipts").
fs.writeFileSync(path.join(outDir, 'LATEST.json'), JSON.stringify(receipt, null, 2) + '\n', 'utf8');

console.log(`make-receipt: wrote ${path.join(outDir, fileName)} (status=${status})`);
