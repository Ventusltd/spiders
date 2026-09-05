#!/usr/bin/env node
// spider.mjs — genome-spider. Walks a list of local git repositories and
// emits the estate's genome: nodes (repos + significant internal units),
// evidenced edges, and genome markers (duplication, drift, dead code,
// re-doing, uncomposed). ESM, Node stdlib only — see README.md for the
// full contract and what this deliberately does not claim.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import * as git from './lib/git.mjs';
import { classifyPath, stripTimestamp, logicalGroupKey, COMPOSABLE_KINDS, pathIsSkipped, TEXT_EXT } from './lib/classify.mjs';
import { importEdges, fetchEdges, workflowUsesEdges, jsonProvenanceEdges, isTextFile } from './lib/edges.mjs';
import { extractFunctions, extractNamedConstants, extractKnownFamilyHits, KNOWN_CONSTANT_FAMILIES } from './lib/markers.mjs';
import { buildNodesDoc, buildEdgesDoc, buildManifestDoc } from './lib/schema.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------- args

function parseArgs(argv) {
  const out = { root: null, out: null, repos: null, maxFilesPerRepo: 500, maxBytesPerRepo: 24 * 1024 * 1024 };
  for (const a of argv) {
    if (a.startsWith('--root=')) out.root = a.slice('--root='.length);
    else if (a.startsWith('--out=')) out.out = a.slice('--out='.length);
    else if (a.startsWith('--repos=')) out.repos = a.slice('--repos='.length).split(',').map((s) => s.trim()).filter(Boolean);
    else if (a.startsWith('--max-files-per-repo=')) out.maxFilesPerRepo = Number(a.split('=')[1]) || out.maxFilesPerRepo;
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));

const configPath = path.join(HERE, 'config', 'repos.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const OWNER = config.owner;
const ROOT = path.resolve(HERE, args.root || process.env.GENOME_SPIDER_ROOT || config.root);
const REPO_NAMES = args.repos || config.repos;
const OUT_DIR = args.out ? path.resolve(process.cwd(), args.out) : path.join(HERE, 'data');
const KNOWN_REPO_NAMES = new Set(REPO_NAMES);

function sha256(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

function inferRepoKind(name) {
  if (name === 'globalgrid2050') return 'source_archive';
  if (name === 'spiders' || name === 'cvaa') return 'governance';
  if (name.startsWith('data-') || name === 'grid-distance-maths') return 'data';
  if (name.endsWith('-ui')) return 'ui';
  return 'repo';
}

function firstParagraph(readmeText) {
  if (!readmeText) return '';
  const lines = readmeText.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (!l || l.startsWith('#')) continue;
    return l.slice(0, 220);
  }
  return '';
}

// ---------------------------------------------------------------- state

const nodes = []; // {id, kind, label, repo, path, purpose, first_commit, last_commit, commit_count, top_revised_files, rag, status_reason, importance_score}
const nodeIndex = new Map(); // id -> node
const rawEdges = []; // {from, to, type, evidence, sha256?}
const reposSkipped = [];
const scanLimits = []; // {repo, reason, filesConsidered, filesScanned, bytesScanned}

const functionsByName = new Map(); // name -> [{repo, path, line, hash, length}]
const constantsByName = new Map(); // name -> [{repo, path, line, value}]
const familyHits = []; // [{family, value, repo, path, line}]
const manifestPathRefs = []; // [{fromRepo, manifestPath, toPath, sha256, evidence}]
const reDoingGroups = []; // [{repo, dir, logical_name, count, first_path, last_path, method}]

function addNode(n) {
  if (nodeIndex.has(n.id)) return nodeIndex.get(n.id);
  nodes.push(n);
  nodeIndex.set(n.id, n);
  return n;
}

function addEdge(from, to, type, evidence, extra = {}) {
  if (!from || !to || from === to) return;
  rawEdges.push({ from, to, type, evidence, ...extra });
}

// An edge target inside the repo that wasn't picked up by the "significant
// files" content scan (e.g. a build script under a directory with no kind
// rule) still gets a real node — a stub, minimal purpose, but with the
// same real git history as any other unit node. This is what keeps every
// edge pointing at a node genome.json actually declares (checked by
// genome.proof.mjs) instead of silently dropping the reference.
function ensureUnitNode(repoId, repoDir, repoName, relPath) {
  const id = `${repoId}::${relPath}`;
  if (nodeIndex.has(id)) return id;
  const hist = git.fileHistory(repoDir, relPath);
  addNode({
    id, kind: classifyPath(relPath), label: relPath.split('/').pop(),
    repo: repoName, path: relPath,
    purpose: '(referenced by another file; not itself content-scanned)',
    first_commit: hist ? hist.first_commit : null,
    last_commit: hist ? hist.last_commit : null,
    commit_count: hist ? hist.commit_count : null,
    top_revised_files: [], rag: 'grey', status_reason: 'stub node — edge target outside the content-scanned set', importance_score: 0.2,
  });
  return id;
}

function externalNodeId(specifier) {
  // "owner/repo" or "owner/repo/subpath" from a workflow `uses:` — the node
  // is the owner/repo pair; deeper path segments (e.g. a reusable workflow
  // file) are not a separate node, just noted in evidence.
  const parts = specifier.split('/');
  const short = parts.slice(0, 2).join('/');
  return `external/${short}`;
}

function ensureExternalNode(specifier) {
  const id = externalNodeId(specifier);
  if (!nodeIndex.has(id)) {
    addNode({
      id, kind: 'external', label: specifier.split('/').slice(0, 2).join('/'),
      repo: null, path: null, purpose: 'Third-party GitHub Action or reusable workflow, referenced by a pinned SHA.',
      first_commit: null, last_commit: null, commit_count: null, top_revised_files: [],
      rag: 'blue', status_reason: 'external dependency, not part of the estate', importance_score: 0.3,
    });
  }
  return id;
}

// ---------------------------------------------------------------- walk

console.log(`genome-spider: root ${ROOT}`);
console.log(`genome-spider: repos configured ${REPO_NAMES.length}`);

for (const name of REPO_NAMES) {
  const dir = path.join(ROOT, name);
  const repoId = `${OWNER}/${name}`;
  if (!fs.existsSync(dir)) {
    reposSkipped.push({ repo: name, reason: `directory not found at ${dir}` });
    continue;
  }
  if (!git.isGitRepo(dir)) {
    reposSkipped.push({ repo: name, reason: 'not a git working tree (no .git)' });
    continue;
  }
  const stats = git.repoStats(dir);
  if (!stats.ok) {
    reposSkipped.push({ repo: name, reason: `git log failed: ${stats.reason}` });
    continue;
  }
  const filesRes = git.lsFiles(dir);
  if (!filesRes.ok) {
    reposSkipped.push({ repo: name, reason: `git ls-files failed: ${filesRes.reason}` });
    continue;
  }
  const allFiles = filesRes.files; // forward-slash, repo-relative, git-tracked only
  const trackedSet = new Set(allFiles);
  const topFiles = git.topRevisedFiles(dir, 8);

  let readme = '';
  try {
    const readmePath = allFiles.find((f) => /^readme\.md$/i.test(f));
    if (readmePath) readme = fs.readFileSync(path.join(dir, readmePath), 'utf8');
  } catch { /* README unreadable is not fatal */ }

  addNode({
    id: repoId,
    kind: inferRepoKind(name),
    label: name,
    repo: name,
    path: null,
    purpose: firstParagraph(readme),
    first_commit: stats.first_commit,
    last_commit: stats.last_commit,
    commit_count: stats.commit_count,
    top_revised_files: topFiles.ok ? topFiles.files : [],
    rag: 'green',
    status_reason: '',
    importance_score: 0.7,
  });

  // --- RE-DOING: cheap, filename-only, over every tracked file. ---
  const groups = new Map(); // logicalGroupKey -> [{path, base}]
  for (const f of allFiles) {
    const base = f.split('/').pop();
    if (!/^\d{8,14}-/.test(base)) continue; // only files that carry a generation stamp
    const key = `${name}::${logicalGroupKey(f)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(f);
  }
  for (const [key, members] of groups) {
    if (members.length < 2) continue;
    members.sort();
    reDoingGroups.push({
      repo: name,
      dir: members[0].includes('/') ? members[0].slice(0, members[0].lastIndexOf('/')) : '',
      logical_name: stripTimestamp(members[0].split('/').pop()),
      count: members.length,
      first_path: members[0],
      last_path: members[members.length - 1],
      method: 'filename-timestamp-prefix, not a git commit date',
    });
  }

  // --- select significant files for content scanning ---
  const candidates = allFiles.filter((f) => {
    if (pathIsSkipped(f)) return false;
    const ext = path.extname(f).toLowerCase();
    if (!TEXT_EXT.has(ext)) return false;
    const kind = classifyPath(f);
    return kind !== 'file' && kind !== 'doc';
  });

  // Cap cartridge-kind files to the latest per logical group; older
  // generations are still counted for RE-DOING above but not re-scanned.
  const byLogical = new Map();
  const significant = [];
  for (const f of candidates) {
    const kind = classifyPath(f);
    if (kind !== 'cartridge') { significant.push(f); continue; }
    const key = logicalGroupKey(f);
    const prev = byLogical.get(key);
    if (!prev || f > prev) byLogical.set(key, f);
  }
  significant.push(...byLogical.values());

  let filesScanned = 0, bytesScanned = 0, cappedOut = 0;
  for (const relPath of significant) {
    if (filesScanned >= args.maxFilesPerRepo || bytesScanned >= args.maxBytesPerRepo) { cappedOut++; continue; }
    const abs = path.join(dir, ...relPath.split('/'));
    let text;
    try {
      const stat = fs.statSync(abs);
      if (stat.size > 2 * 1024 * 1024) { cappedOut++; continue; } // 2MB single-file guard
      text = fs.readFileSync(abs, 'utf8');
    } catch {
      continue; // tracked but unreadable (rare) — not fatal
    }
    filesScanned++; bytesScanned += text.length;

    const kind = classifyPath(relPath);
    const hist = git.fileHistory(dir, relPath);
    const unitId = `${repoId}::${relPath}`;
    addNode({
      id: unitId,
      kind,
      label: relPath.split('/').pop(),
      repo: name,
      path: relPath,
      purpose: '',
      first_commit: hist ? hist.first_commit : null,
      last_commit: hist ? hist.last_commit : null,
      commit_count: hist ? hist.commit_count : null,
      top_revised_files: [],
      rag: 'green',
      status_reason: '',
      importance_score: 0.4,
    });

    // edges: imports/require (intra-repo)
    for (const e of importEdges(relPath, text, trackedSet)) {
      ensureUnitNode(repoId, dir, name, e.toPath);
      addEdge(unitId, `${repoId}::${e.toPath}`, e.type, e.evidence);
    }
    // edges: fetch to another known repo
    for (const e of fetchEdges(relPath, text, OWNER, KNOWN_REPO_NAMES)) {
      addEdge(repoId, `${OWNER}/${e.toRepo}`, e.type, e.evidence);
    }
    // edges: workflow uses:/checkout
    if (kind === 'workflow') {
      for (const e of workflowUsesEdges(relPath, text)) {
        if (e.type === 'pinned-action') {
          const shortName = e.toRepo.split('/').slice(0, 2).join('/');
          const targetShort = shortName.split('/')[1];
          if (KNOWN_REPO_NAMES.has(targetShort) && shortName.split('/')[0].toLowerCase() === OWNER.toLowerCase()) {
            addEdge(repoId, `${OWNER}/${targetShort}`, 'pinned-workflow', e.evidence, { pinned: e.pinned, pin: e.pin });
          } else {
            const extId = ensureExternalNode(e.toRepo);
            addEdge(repoId, extId, 'pinned-action', e.evidence, { pinned: e.pinned, pin: e.pin });
          }
        } else {
          const targetShort = e.toRepo.split('/')[1];
          if (KNOWN_REPO_NAMES.has(targetShort)) addEdge(repoId, `${OWNER}/${targetShort}`, e.type, e.evidence);
        }
      }
    }
    // edges + provenance: JSON manifests
    if (path.extname(relPath) === '.json') {
      for (const e of jsonProvenanceEdges(relPath, text, trackedSet, KNOWN_REPO_NAMES)) {
        if (e.type === 'manifest-path') {
          ensureUnitNode(repoId, dir, name, e.toPath);
          addEdge(unitId, `${repoId}::${e.toPath}`, e.type, e.evidence);
          manifestPathRefs.push({ fromRepo: name, manifestPath: relPath, toPath: e.toPath, sha256: e.sha256, evidence: e.evidence });
        } else if (e.type === 'json-provenance') {
          if (KNOWN_REPO_NAMES.has(e.toRepo)) addEdge(repoId, `${OWNER}/${e.toRepo}`, e.type, e.evidence, { pin: e.pin });
        }
      }
    }

    // markers: functions, constants, known families (skip JSON/HTML for these — code files only)
    if (/\.(js|mjs|cjs|py)$/.test(relPath)) {
      for (const fn of extractFunctions(text)) {
        if (!functionsByName.has(fn.name)) functionsByName.set(fn.name, []);
        functionsByName.get(fn.name).push({ repo: name, path: relPath, line: fn.line, hash: fn.hash, length: fn.length });
      }
      for (const c of extractNamedConstants(text)) {
        if (!constantsByName.has(c.name)) constantsByName.set(c.name, []);
        constantsByName.get(c.name).push({ repo: name, path: relPath, line: c.line, value: c.value });
      }
      for (const h of extractKnownFamilyHits(text)) {
        familyHits.push({ ...h, repo: name, path: relPath });
      }
    }
  }

  if (cappedOut > 0 || significant.length > candidates.length) {
    scanLimits.push({
      repo: name,
      files_considered: candidates.length,
      files_scanned: filesScanned,
      bytes_scanned: bytesScanned,
      files_capped_out: cappedOut,
      cartridge_logical_groups_kept_latest_only: byLogical.size,
    });
  }
}

// ---------------------------------------------------------------- markers

// DUPLICATION (function): any name with >1 recorded body, across the whole
// estate, cross-repo included.
const duplicationFunctions = [];
for (const [name, copies] of functionsByName) {
  if (copies.length < 2) continue;
  const hashes = new Set(copies.map((c) => c.hash));
  duplicationFunctions.push({
    name,
    kind: 'function',
    copies: copies.map((c) => ({ repo: c.repo, path: c.path, line: c.line, hash: c.hash })),
    agree: hashes.size === 1,
  });
}

// DUPLICATION (named constant) + DRIFT (named constant, values disagree).
const duplicationConstants = [];
const driftNamedConstants = [];
for (const [name, copies] of constantsByName) {
  if (copies.length < 2) continue;
  const values = new Set(copies.map((c) => c.value));
  const entry = {
    name,
    kind: 'constant',
    copies: copies.map((c) => ({ repo: c.repo, path: c.path, line: c.line, value: c.value })),
    agree: values.size === 1,
  };
  duplicationConstants.push(entry);
  if (values.size > 1) {
    driftNamedConstants.push({
      method: 'named-constant, same identifier different value',
      name,
      distinct_values: [...values],
      occurrences: entry.copies,
    });
  }
}

// DRIFT (known family, e.g. earth-radius-km) — cited from grid-distance-maths.
const driftFamilies = [];
for (const family of KNOWN_CONSTANT_FAMILIES) {
  const hits = familyHits.filter((h) => h.family === family.id);
  if (hits.length === 0) continue;
  const distinct = [...new Set(hits.map((h) => h.value))];
  driftFamilies.push({
    method: `known-family:${family.id}`,
    description: family.description,
    citation: family.citation,
    distinct_values: distinct,
    is_drift: distinct.length > 1,
    occurrences: hits.map((h) => ({ repo: h.repo, path: h.path, line: h.line, value: h.value })),
  });
}

// DEAD CODE — composable-kind nodes with zero inbound imports/manifest-path
// edges among the files genome-spider actually scanned.
const inboundByTarget = new Map();
for (const e of rawEdges) {
  if (e.type !== 'imports' && e.type !== 'manifest-path') continue;
  if (!inboundByTarget.has(e.to)) inboundByTarget.set(e.to, []);
  inboundByTarget.get(e.to).push(e);
}
const deadCode = [];
for (const n of nodes) {
  if (!COMPOSABLE_KINDS.has(n.kind)) continue;
  const inbound = inboundByTarget.get(n.id) || [];
  if (inbound.length === 0) {
    deadCode.push({
      node: n.id,
      repo: n.repo,
      path: n.path,
      kind: n.kind,
      reason: 'no inbound import or manifest-path reference found among the files scanned in this repo',
    });
  }
}

// UNCOMPOSED — a composable-kind node that IS referenced by at least one
// manifest, but whose current content (sha256) or whose last commit date
// postdates the most recent manifest reference to it.
const uncomposed = [];
const refsByTarget = new Map(); // repoId::path -> [{manifestPath, sha256, evidence, repo}]
for (const r of manifestPathRefs) {
  const targetId = `${OWNER}/${r.fromRepo}::${r.toPath}`;
  if (!refsByTarget.has(targetId)) refsByTarget.set(targetId, []);
  refsByTarget.get(targetId).push(r);
}
for (const [targetId, refs] of refsByTarget) {
  const node = nodeIndex.get(targetId);
  if (!node || !COMPOSABLE_KINDS.has(node.kind)) continue;
  const dir = ROOT ? path.join(ROOT, node.repo) : null;

  // Every referencing manifest, with its own git history — not any
  // timestamp embedded in a filename (see UNCOMPOSED design note in
  // README.md: manifests cut in the same commit share a commit date, so
  // "the most recent one" is not well-defined by date alone).
  const withHistory = refs
    .map((r) => ({ ...r, manifestCommit: dir ? git.fileHistory(dir, r.manifestPath) : null }))
    .filter((r) => r.manifestCommit);
  if (withHistory.length === 0) continue;

  const refsWithHash = withHistory.filter((r) => r.sha256);
  if (refsWithHash.length > 0) {
    // sha256 is decisive: if the file's current content matches what ANY
    // referencing manifest recorded, it has been composed (that manifest
    // proves it), regardless of which manifest is "newest". Only flag
    // uncomposed when NO referencing manifest — including the newest —
    // ever recorded the content as it exists right now.
    const abs = path.join(dir, ...node.path.split('/'));
    let currentSha = null;
    try { currentSha = sha256(fs.readFileSync(abs, 'utf8')); } catch { /* unreadable */ }
    const matched = currentSha && refsWithHash.some((r) => r.sha256 === currentSha);
    if (currentSha && !matched) {
      // Cite the most recently committed reference; break ties on the
      // manifest's own filename (these are generation-stamped, so the
      // lexicographically greatest name is the latest generation cut in
      // that same commit).
      const best = withHistory.slice().sort((a, b) => {
        const d = a.manifestCommit.last_commit.date.localeCompare(b.manifestCommit.last_commit.date);
        return d !== 0 ? d : a.manifestPath.localeCompare(b.manifestPath);
      }).pop();
      uncomposed.push({
        node: targetId, repo: node.repo, path: node.path,
        method: 'sha256-mismatch',
        manifest: best.manifestPath,
        manifest_recorded_sha256: best.sha256 || null,
        current_sha256: currentSha,
        manifests_checked: refsWithHash.length,
        note: `${node.path}'s current content matches no sha256 recorded for it by any of the ${refsWithHash.length} referencing manifest(s) checked, including the most recent, ${best.manifestPath}`,
      });
    }
    continue;
  }

  // Fallback for manifests with no sha256 field at all: commit-date
  // comparison against the most recently committed reference.
  const best = withHistory.slice().sort((a, b) => {
    const d = a.manifestCommit.last_commit.date.localeCompare(b.manifestCommit.last_commit.date);
    return d !== 0 ? d : a.manifestPath.localeCompare(b.manifestPath);
  }).pop();
  const sourceDate = node.last_commit ? node.last_commit.date : null;
  if (sourceDate && best.manifestCommit && sourceDate > best.manifestCommit.last_commit.date) {
    uncomposed.push({
      node: targetId, repo: node.repo, path: node.path,
      method: 'commit-date-after-last-composition',
      manifest: best.manifestPath,
      manifest_last_commit: best.manifestCommit.last_commit,
      source_last_commit: node.last_commit,
      note: `${node.path} was committed at ${sourceDate}, after ${best.manifestPath} was last committed at ${best.manifestCommit.last_commit.date}`,
    });
  }
}

reDoingGroups.sort((a, b) => b.count - a.count);

// ---------------------------------------------------------------- rag colouring

const dupPaths = new Set();
for (const d of [...duplicationFunctions, ...duplicationConstants]) for (const c of d.copies) dupPaths.add(`${OWNER}/${c.repo}::${c.path}`);
const deadIds = new Set(deadCode.map((d) => d.node));
const uncomposedIds = new Set(uncomposed.map((u) => u.node));
const reposWithFindings = new Set([
  ...deadCode.map((d) => d.repo),
  ...uncomposed.map((u) => u.repo),
  ...driftNamedConstants.flatMap((d) => d.occurrences.map((o) => o.repo)),
  ...driftFamilies.filter((f) => f.is_drift).flatMap((f) => f.occurrences.map((o) => o.repo)),
]);

for (const n of nodes) {
  if (n.kind === 'external') continue;
  if (n.repo === null) continue;
  if (!n.path) { // repo node
    if (reposWithFindings.has(n.repo)) { n.rag = 'amber'; n.status_reason = 'one or more genome markers found in this repository'; }
    continue;
  }
  if (deadIds.has(n.id)) { n.rag = 'red'; n.status_reason = 'dead code: no inbound reference found among scanned files'; }
  else if (uncomposedIds.has(n.id)) { n.rag = 'red'; n.status_reason = 'uncomposed: edited after the artefact that should include it was last built'; }
  else if (dupPaths.has(n.id)) { n.rag = 'amber'; n.status_reason = 'contains a function or constant duplicated elsewhere in the estate'; }
}

// ---------------------------------------------------------------- assemble + write

const generatedAt = new Date().toISOString();
const genome = {
  schema: 'genome-spider.genome.v1',
  generated_at: generatedAt,
  generator: 'spiders/species/genome-spider/spider.mjs',
  estate_root: ROOT,
  repos_configured: REPO_NAMES.length,
  repos_walked: nodes.filter((n) => !n.path && n.kind !== 'external').map((n) => n.repo),
  repos_skipped: reposSkipped,
  scan_limits: scanLimits,
  nodes,
  edges: rawEdges,
  markers: {
    duplication: [...duplicationFunctions, ...duplicationConstants],
    drift: [...driftNamedConstants, ...driftFamilies],
    dead_code: deadCode,
    re_doing: reDoingGroups.slice(0, 60),
    re_doing_total_groups: reDoingGroups.length,
    uncomposed,
  },
};

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'genome.json'), JSON.stringify(genome, null, 2) + '\n', 'utf8');

const nodesDoc = buildNodesDoc(nodes.filter((n) => n.kind !== 'external' || rawEdges.some((e) => e.to === n.id)));
// A declared plan is a separate child scope, never mixed into observed genome edges.
const planRoot = path.resolve(HERE, '../../codex/build-plan');
const planPointer = path.join(planRoot, 'CURRENT.json');
if (fs.existsSync(planPointer)) {
  const current = JSON.parse(fs.readFileSync(planPointer, 'utf8'));
  const planBytes = fs.readFileSync(path.join(planRoot, 'master-plan.geojson'));
  if (sha256(planBytes) !== current.planSha256) throw new Error('Build-plan projection is stale; run codex/build-plan/build.mjs --apply');
  const owner = nodesDoc.features.find(f => f.id === 'Ventusltd/spiders');
  if (owner) owner.properties.child_manifest = '../../../codex/build-plan/data/manifest.json';
}
const { doc: edgesDoc, droppedUnresolved } = buildEdgesDoc(nodesDoc.features.map((f) => ({ id: f.id })), rawEdges);
const manifestDoc = buildManifestDoc({ generatedAt, nodeCount: nodesDoc.features.length, edgeCount: edgesDoc.edges.length });

fs.writeFileSync(path.join(OUT_DIR, 'nodes.json'), JSON.stringify(nodesDoc, null, 2) + '\n', 'utf8');
fs.writeFileSync(path.join(OUT_DIR, 'edges.json'), JSON.stringify(edgesDoc, null, 2) + '\n', 'utf8');
fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifestDoc, null, 2) + '\n', 'utf8');

console.log(`genome-spider: repos walked ${genome.repos_walked.length}, skipped ${reposSkipped.length}`);
console.log(`genome-spider: nodes ${nodes.length}, edges ${rawEdges.length} (${droppedUnresolved.length} unresolved, dropped from nodes.json/edges.json only)`);
console.log(`genome-spider: duplication groups ${genome.markers.duplication.length}, drift groups ${genome.markers.drift.length}`);
console.log(`genome-spider: dead code ${deadCode.length}, uncomposed ${uncomposed.length}, re-doing groups ${reDoingGroups.length} (top ${genome.markers.re_doing.length} kept)`);
console.log(`genome-spider: wrote ${OUT_DIR}`);

