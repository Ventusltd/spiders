#!/usr/bin/env node
// lineage.mjs — gridatlas cartridge lineage, one repo, one graph, in the
// plain {nodes,edges} shape the ventus-grid-engine receiver already
// normalises (see README.md "gridatlas-lineage.json" for the citation:
// ventus-grid-engine/index.html's normaliseGenericGraph()/resolveRef()).
// This is a separate, focused walk — not the estate-wide genome — built
// because gridatlas's own manifests already declare the exact lineage
// (composition -> cartridge -> part, each with a sha256) that spider.mjs's
// generic detectors only reconstruct heuristically.
//
// Scope, on purpose: the CURRENT composition and its ancestry via
// parent_generation, capped (--max-generations, default 15) so this does
// not enumerate gridatlas's 80+ historical cartridge generations as
// first-class nodes. Every cartridge/part node is scoped under the
// composition generation that names it — nothing is deduplicated across
// generations, so the same logical cartridge appearing in two generations
// in the walked chain is two distinct nodes on purpose (that IS the
// lineage).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import * as git from './lib/git.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const out = { root: null, out: null, repo: 'gridatlas', maxGenerations: 15 };
  for (const a of argv) {
    if (a.startsWith('--root=')) out.root = a.slice('--root='.length);
    else if (a.startsWith('--out=')) out.out = a.slice('--out='.length);
    else if (a.startsWith('--repo=')) out.repo = a.slice('--repo='.length);
    else if (a.startsWith('--max-generations=')) out.maxGenerations = Number(a.split('=')[1]) || out.maxGenerations;
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const configPath = path.join(HERE, 'config', 'repos.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const OWNER = config.owner;
const ROOT = path.resolve(HERE, args.root || process.env.GENOME_SPIDER_ROOT || config.root);
const REPO_DIR = path.join(ROOT, args.repo);
const OUT_PATH = args.out ? path.resolve(process.cwd(), args.out) : path.join(HERE, 'data', 'gridatlas-lineage.json');

function sha256(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

function readJSON(relPath) {
  return JSON.parse(fs.readFileSync(path.join(REPO_DIR, ...relPath.split('/')), 'utf8'));
}

function ghUrl(relPath) {
  return `https://github.com/${OWNER}/${args.repo}/blob/main/${relPath}`;
}

const nodes = [];
const nodeIds = new Set();
const edges = [];

function addNode(n) {
  if (nodeIds.has(n.id)) return;
  nodeIds.add(n.id);
  nodes.push(n);
}
function addEdge(from, to, type, evidence) {
  edges.push({ from, to, type, evidence });
}

if (!fs.existsSync(REPO_DIR) || !git.isGitRepo(REPO_DIR)) {
  console.error(`lineage.mjs: ${REPO_DIR} is not a checked-out git repo; nothing to walk.`);
  process.exit(2);
}

const manifestsDir = path.join(REPO_DIR, 'atlas', 'manifests');
const allManifestFiles = fs.readdirSync(manifestsDir);
const partsFilesByGeneration = new Map(); // generation -> [filenames]
for (const f of allManifestFiles) {
  const m = /^(\d{8,14})-.+-parts\.json$/.exec(f);
  if (!m) continue;
  const gen = m[1];
  if (!partsFilesByGeneration.has(gen)) partsFilesByGeneration.set(gen, []);
  partsFilesByGeneration.get(gen).push(f);
}

// Start from the lexicographically-latest composition.json (generation
// stamps sort chronologically) and walk parent_generation backwards.
const compositionFiles = allManifestFiles.filter((f) => /^\d{8,14}-composition\.json$/.test(f)).sort();
if (compositionFiles.length === 0) {
  console.error('lineage.mjs: no *-composition.json manifests found under atlas/manifests/.');
  process.exit(2);
}
let currentFile = compositionFiles[compositionFiles.length - 1];
const chain = [];
const seenGen = new Set();
while (currentFile && chain.length < args.maxGenerations) {
  const relPath = `atlas/manifests/${currentFile}`;
  let doc;
  try {
    doc = readJSON(relPath);
  } catch (e) {
    console.error(`lineage.mjs: ${relPath} unreadable (${e.message}); stopping ancestry walk here.`);
    break;
  }
  if (seenGen.has(doc.generation)) break; // guard against a cyclical parent_generation
  seenGen.add(doc.generation);
  chain.push({ file: currentFile, relPath, doc });
  currentFile = doc.parent_generation ? `${doc.parent_generation}-composition.json` : null;
  if (currentFile && !allManifestFiles.includes(currentFile)) {
    // Ancestor referenced but not present on disk (pruned, or off the
    // default branch) — the chain honestly stops; not a silent drop.
    chain.push({ missing: true, generation: doc.parent_generation });
    break;
  }
}

const totalCompositionsAvailable = compositionFiles.length;
const generationsWalked = chain.filter((c) => !c.missing).length;

for (let i = 0; i < chain.length; i++) {
  const entry = chain[i];
  if (entry.missing) continue;
  const { relPath, doc } = entry;
  const compId = `composition:${doc.generation}`;
  const isCurrent = i === 0;
  const hist = git.fileHistory(REPO_DIR, relPath);

  addNode({
    id: compId,
    label: `composition ${doc.generation}`,
    type: 'composition',
    rag: isCurrent ? 'green' : 'grey',
    reason: doc.note || `${isCurrent ? 'current composition' : 'ancestor composition'}; cut_at_utc ${doc.cut_at_utc || 'unknown'}`,
    gh: ghUrl(relPath),
    ext: null,
    first_commit: hist ? hist.first_commit : null,
    last_commit: hist ? hist.last_commit : null,
    commit_count: hist ? hist.commit_count : null,
  });

  const nextInChain = chain[i + 1];
  if (nextInChain && !nextInChain.missing) {
    addEdge(compId, `composition:${nextInChain.doc.generation}`, 'supersedes', {
      file: relPath, line: 0, pattern: 'json:"parent_generation"',
      snippet: `parent_generation = "${doc.parent_generation}"`,
    });
  } else if (nextInChain && nextInChain.missing) {
    addEdge(compId, `composition:${nextInChain.generation}`, 'supersedes', {
      file: relPath, line: 0, pattern: 'json:"parent_generation" (ancestor not present on disk)',
      snippet: `parent_generation = "${doc.parent_generation}"`,
    });
    addNode({
      id: `composition:${nextInChain.generation}`, label: `composition ${nextInChain.generation} (not on disk)`,
      type: 'composition', rag: 'grey', reason: 'referenced by parent_generation but no matching manifest file was found in this checkout',
      gh: null, ext: null, first_commit: null, last_commit: null, commit_count: null,
    });
  }

  for (const cart of doc.cartridges || []) {
    const cartId = `cartridge:${cart.id}@${cart.generation}`;
    // cart.path is written relative to atlas/ (e.g. "./cartridges/x.js" is
    // really atlas/cartridges/x.js) — confirmed against the files on disk,
    // not assumed.
    const cartRelPath = cart.path ? `atlas/${cart.path.replace(/^\.\//, '')}` : null;
    const cartHist = cartRelPath ? git.fileHistory(REPO_DIR, cartRelPath) : null;
    addNode({
      id: cartId,
      label: `${cart.id} ${cart.generation}`,
      type: 'cartridge',
      rag: isCurrent ? 'green' : 'grey',
      reason: `${cart.version || ''} ${cart.type || ''} slot=${cart.slot || ''}`.trim(),
      gh: cartRelPath ? ghUrl(cartRelPath) : null,
      ext: null,
      first_commit: cartHist ? cartHist.first_commit : null,
      last_commit: cartHist ? cartHist.last_commit : null,
      commit_count: cartHist ? cartHist.commit_count : null,
    });
    addEdge(compId, cartId, 'composed_of', {
      file: relPath, line: 0, pattern: 'json:"path"+"sha256" (cartridges[])',
      snippet: `${cart.id}: path=${cart.path}, sha256=${(cart.sha256 || '').slice(0, 16)}...`,
    });

    // Find the *-parts.json for this exact cartridge generation whose
    // own "cartridge" field names this same built file — an exact string
    // match against the composition's own cart.path, not a guess.
    const candidates = partsFilesByGeneration.get(cart.generation) || [];
    let partsDoc = null, partsRelPath = null;
    for (const pf of candidates) {
      const pRel = `atlas/manifests/${pf}`;
      try {
        const pd = readJSON(pRel);
        if (pd.cartridge && cart.path && path.posix.normalize(pd.cartridge) === path.posix.normalize(cart.path)) {
          partsDoc = pd; partsRelPath = pRel; break;
        }
      } catch { /* unreadable parts file — skip, not fatal */ }
    }
    if (!partsDoc) continue; // some cartridges (e.g. script-slot ones) have no parts manifest at all

    for (const part of partsDoc.assembled_from || []) {
      const partRelPath = part.path;
      const unitId = `unit:${partRelPath}`;
      const partHist = git.fileHistory(REPO_DIR, partRelPath);
      const kind = /\/parts\//.test(partRelPath) ? 'part' : /\/modules\//.test(partRelPath) ? 'module' : 'unit';

      let currentSha = null, mismatch = false;
      try {
        const abs = path.join(REPO_DIR, ...partRelPath.split('/'));
        currentSha = sha256(fs.readFileSync(abs, 'utf8'));
        mismatch = part.sha256 && currentSha !== part.sha256;
      } catch { /* file gone from disk — leave unresolved, not fatal */ }

      addNode({
        id: unitId,
        label: partRelPath.split('/').pop(),
        type: kind,
        rag: isCurrent && mismatch ? 'red' : 'green',
        reason: isCurrent && mismatch
          ? `current content (sha256 ${currentSha?.slice(0, 12)}...) does not match what ${partsRelPath} recorded (${part.sha256.slice(0, 12)}...) — edited since this cartridge was built`
          : `role=${part.role || 'part'}`,
        gh: ghUrl(partRelPath),
        ext: null,
        first_commit: partHist ? partHist.first_commit : null,
        last_commit: partHist ? partHist.last_commit : null,
        commit_count: partHist ? partHist.commit_count : null,
      });
      addEdge(cartId, unitId, 'assembled_from', {
        file: partsRelPath, line: 0, pattern: 'json:"path"+"sha256" (assembled_from[])',
        snippet: `role=${part.role}, path=${part.path}, sha256=${(part.sha256 || '').slice(0, 16)}...`,
      });

      // The uncomposed marker, as an edge: only meaningful for the
      // current composition — an ancestor cartridge being "stale" against
      // a part is expected (it was superseded), not a defect.
      if (isCurrent && mismatch) {
        addEdge(unitId, cartId, 'uncomposed', {
          file: partsRelPath, line: 0, pattern: 'sha256 mismatch: current file content vs. recorded assembled_from[].sha256',
          snippet: `recorded=${part.sha256.slice(0, 16)}... current=${currentSha.slice(0, 16)}...`,
        });
      }
    }
  }
}

const doc = {
  schema: 'genome-spider.gridatlas-lineage.v1',
  generated_at: new Date().toISOString(),
  generator: 'spiders/species/genome-spider/lineage.mjs',
  repo: `${OWNER}/${args.repo}`,
  compositions_available_on_disk: totalCompositionsAvailable,
  generations_walked: generationsWalked,
  max_generations: args.maxGenerations,
  note: `Focused on the current composition and its parent_generation ancestry, capped at ${args.maxGenerations} generations (${totalCompositionsAvailable} exist on disk in this checkout). Nodes are scoped per generation on purpose — the same cartridge id appearing in two generations is two distinct nodes, because the lineage between them is exactly what this graph exists to show.`,
  nodes,
  edges,
};

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(doc, null, 2) + '\n', 'utf8');

console.log(`lineage.mjs: walked ${generationsWalked}/${totalCompositionsAvailable} composition generations`);
console.log(`lineage.mjs: nodes ${nodes.length}, edges ${edges.length}, uncomposed edges ${edges.filter((e) => e.type === 'uncomposed').length}`);
console.log(`lineage.mjs: wrote ${OUT_PATH}`);
