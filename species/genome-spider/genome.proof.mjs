/**
 * genome-spider — proof.
 *
 * Reads a genome.json (default: ./data/genome.json, the output of a real
 * run against the estate) and checks plain-English sentences about it.
 * Every check accumulates; nothing short-circuits, so one failure doesn't
 * hide the next. Exits non-zero on any failure.
 *
 *   node genome.proof.mjs [path/to/genome.json]
 *
 * No dependencies.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const genomePath = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : path.join(HERE, 'data', 'genome.json');

const checks = [];
const ok = (name, pass, detail = '') => checks.push({ name, pass: Boolean(pass), detail });

if (!fs.existsSync(genomePath)) {
  console.error(`genome.proof.mjs: no genome.json at ${genomePath}. Run spider.mjs first.`);
  process.exit(2);
}

let genome;
try {
  genome = JSON.parse(fs.readFileSync(genomePath, 'utf8'));
} catch (e) {
  console.error(`genome.proof.mjs: ${genomePath} is not valid JSON: ${e.message}`);
  process.exit(2);
}

const nodes = Array.isArray(genome.nodes) ? genome.nodes : [];
const edges = Array.isArray(genome.edges) ? genome.edges : [];
const nodeIds = new Set(nodes.map((n) => n.id));

/* ---- shape --------------------------------------------------------------- */
ok('genome.json declares its schema', genome.schema === 'genome-spider.genome.v1', String(genome.schema));
ok('genome.json names the generator that produced it', genome.generator === 'spiders/species/genome-spider/spider.mjs');
ok('at least one repository was actually walked', (genome.repos_walked || []).length > 0, `${(genome.repos_walked || []).length} repos`);
ok('every repository skipped carries a reason, not a silent drop',
  (genome.repos_skipped || []).every((r) => typeof r.reason === 'string' && r.reason.length > 0));

/* ---- the rule that matters most: no edge without evidence ---------------- */
const edgesWithoutEvidence = edges.filter((e) => {
  const ev = e.evidence;
  if (!ev || typeof ev !== 'object') return true;
  if (typeof ev.file !== 'string' || ev.file.length === 0) return true;
  if (typeof ev.pattern !== 'string' || ev.pattern.length === 0) return true;
  return false;
});
ok('every edge cites the file and pattern that detected it',
  edgesWithoutEvidence.length === 0,
  edgesWithoutEvidence.length ? `${edgesWithoutEvidence.length} edges with no usable evidence, e.g. ${JSON.stringify(edgesWithoutEvidence[0])}` : '');

const edgesWithDanglingEndpoints = edges.filter((e) => !nodeIds.has(e.from) || !nodeIds.has(e.to));
ok('every edge in genome.json points at a node genome.json also declares',
  edgesWithDanglingEndpoints.length === 0,
  edgesWithDanglingEndpoints.length ? `${edgesWithDanglingEndpoints.length} dangling, e.g. ${JSON.stringify(edgesWithDanglingEndpoints[0])}` : '');

/* ---- the other rule that matters: no node without commit history --------- */
const reposByName = new Set(nodes.filter((n) => !n.path).map((n) => n.repo));
const nodesWithoutHistory = nodes.filter((n) => n.kind !== 'external' && (!n.last_commit || !n.last_commit.sha || !n.last_commit.date));
ok('every non-external node carries a real last commit (sha + date)',
  nodesWithoutHistory.length === 0,
  nodesWithoutHistory.length ? `${nodesWithoutHistory.length} nodes with no last_commit, e.g. ${nodesWithoutHistory[0].id}` : '');

const nodesWithoutCount = nodes.filter((n) => n.kind !== 'external' && (n.commit_count === null || n.commit_count === undefined));
ok('every non-external node carries a commit_count',
  nodesWithoutCount.length === 0,
  nodesWithoutCount.length ? `${nodesWithoutCount.length} nodes, e.g. ${nodesWithoutCount[0].id}` : '');

/* ---- node ids are unique and every repo-unit node names a real repo ------ */
const dupIds = nodes.map((n) => n.id).filter((id, i, arr) => arr.indexOf(id) !== i);
ok('no two nodes share an id', dupIds.length === 0, dupIds.length ? dupIds.slice(0, 3).join(', ') : '');

const unitsWithBadRepo = nodes.filter((n) => n.path && !reposByName.has(n.repo));
ok('every unit node (one with a path) names a repository node genome.json also declares',
  unitsWithBadRepo.length === 0,
  unitsWithBadRepo.length ? `${unitsWithBadRepo.length}, e.g. ${unitsWithBadRepo[0].id}` : '');

/* ---- markers are internally consistent ------------------------------------ */
const markers = genome.markers || {};

const dup = markers.duplication || [];
ok('every duplication group actually has more than one copy',
  dup.every((d) => Array.isArray(d.copies) && d.copies.length > 1),
  `${dup.filter((d) => !(d.copies && d.copies.length > 1)).length} malformed`);
ok('every duplication group declares whether its copies agree',
  dup.every((d) => typeof d.agree === 'boolean'));

const drift = markers.drift || [];
ok('every drift entry names the method that found it',
  drift.every((d) => typeof d.method === 'string' && d.method.length > 0));

const dead = markers.dead_code || [];
ok('every dead-code finding names the node, repo and path it concerns',
  dead.every((d) => d.node && d.repo && d.path));
ok('every dead-code finding names a node genome.json actually declares',
  dead.every((d) => nodeIds.has(d.node)),
  dead.filter((d) => !nodeIds.has(d.node)).map((d) => d.node).join(', '));

const uncomposed = markers.uncomposed || [];
ok('every uncomposed finding names the manifest it is stale against',
  uncomposed.every((u) => typeof u.manifest === 'string' && u.manifest.length > 0));
ok('every uncomposed finding uses a declared method (sha256-mismatch or commit-date-after-last-composition)',
  uncomposed.every((u) => u.method === 'sha256-mismatch' || u.method === 'commit-date-after-last-composition'));

const reDoing = markers.re_doing || [];
ok('every re-doing group was rebuilt more than once',
  reDoing.every((g) => g.count > 1),
  `${reDoing.filter((g) => !(g.count > 1)).length} malformed`);

/* ---- ground truth: the estate defects genome-spider was built to find ---- */
// These are informational, not hard failures — a fixed defect (see
// gridatlas commit b7a40d1, 2026-09-04) disappearing from a later run is
// success, not proof breakage. They are still printed so a human can see
// whether the detectors are exercised at all, which a silently-empty
// marker list would hide.
const groundTruth = [];
const gt = (name, pass, detail) => groundTruth.push({ name, pass, detail });
gt('gridatlas/atlas/modules/202609011950-substation-lookup.js is flagged dead code',
  dead.some((d) => d.path === 'atlas/modules/202609011950-substation-lookup.js' && d.repo === 'gridatlas'));
gt('an earth-radius drift (6378.137 / 6371.0088 / 6384.7272) was detected somewhere in the estate',
  drift.some((d) => d.method === 'known-family:earth-radius-km' && d.is_drift));
gt('ventus-grid-engine is present as a node',
  nodes.some((n) => n.repo === 'ventus-grid-engine' && !n.path));

/* ---- gridatlas-lineage.json, if this run produced one -------------------- */
const lineagePath = path.join(path.dirname(genomePath), 'gridatlas-lineage.json');
if (fs.existsSync(lineagePath)) {
  const lineage = JSON.parse(fs.readFileSync(lineagePath, 'utf8'));
  const lNodeIds = new Set((lineage.nodes || []).map((n) => n.id));
  ok('gridatlas-lineage.json declares its schema', lineage.schema === 'genome-spider.gridatlas-lineage.v1');
  const lEdgesNoEvidence = (lineage.edges || []).filter((e) => !e.evidence || !e.evidence.file || !e.evidence.pattern);
  ok('every lineage edge cites the file and pattern that detected it', lEdgesNoEvidence.length === 0,
    lEdgesNoEvidence.length ? `${lEdgesNoEvidence.length} edges` : '');
  const lDangling = (lineage.edges || []).filter((e) => !lNodeIds.has(e.from) || !lNodeIds.has(e.to));
  ok('every lineage edge points at a node the lineage file also declares', lDangling.length === 0,
    lDangling.length ? `${lDangling.length}, e.g. ${JSON.stringify(lDangling[0])}` : '');
  ok('the lineage walk did not silently truncate — generations_walked and compositions_available_on_disk are both recorded',
    typeof lineage.generations_walked === 'number' && typeof lineage.compositions_available_on_disk === 'number');
}

/* ---- report --------------------------------------------------------------- */
const failed = checks.filter((c) => !c.pass);
for (const c of checks) {
  console.log(`  [${c.pass ? 'PASS' : 'FAIL'}] ${c.name}${c.detail ? '  ' + c.detail : ''}`);
}
console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);

console.log('\nGround truth (informational — see comment above, not a pass/fail gate):');
for (const g of groundTruth) {
  console.log(`  [${g.pass ? 'FOUND' : 'not found this run'}] ${g.name}${g.detail ? '  ' + g.detail : ''}`);
}

process.exit(failed.length ? 1 : 0);
