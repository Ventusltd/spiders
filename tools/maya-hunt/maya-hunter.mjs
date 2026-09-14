// maya-hunter.mjs — hunt every dead end (leaf node) across all registered Spider graphs and assign each
// a Maya card that explains its function, purpose, relationships and reason for existing.
// Reads only; writes maya-cards.json + MAYA-REPORT.md. Run weekly (see maya-cards.yml) or on demand.
// Usage: node maya-hunter.mjs [outDir]   (default: Dropbox/GLOBALGRID2050-LAB-FINDINGS/maya)
import fs from 'node:fs';

const OUT = process.argv[2] || 'C:/Users/vikra/Dropbox/GLOBALGRID2050-LAB-FINDINGS/maya';
fs.mkdirSync(OUT, { recursive: true });
const DASH = 'https://ventusltd.github.io/ventus-grid-engine/';
const STARS = 'https://ventusltd.github.io/stars/';
const now = () => new Date().toISOString().replace(/\.\d+Z$/, 'Z');
const get = async (u) => { const r = await fetch(u, { cache: 'no-cache' }); if (!r.ok) throw new Error(u + ' ' + r.status); return r.json(); };

const TYPE_IS = { element:'a value the code keeps', constant:'a value the whole platform must agree on', canonical:'the one true copy of a piece of code, the one others should import', copy:'a copy of code that also lives elsewhere', fragment:'a fragment of code found inside a file', reference:'a reference copy kept for comparison', cartridge:'a plug-in part of the interactive GridAtlas map', app:'a small app assembled from blocks', function:'a single function with its own permanent number', block:'a named block of related functions', module:'an engine module that does one job', engine:'an engine module that does one job', deeplink:'the contract that carries a project to its place on the map', run:'one run of a workflow', check:'a check that has to pass before anything is published', workflow:'a workflow that builds part of the estate', fault:'a recorded failure, kept so it is never hidden', decision:'an open decision waiting for a person', chapter:"a chapter of the code's story", foundation:'a foundation other code is built on', repo:'a code repository' };
const CLASS_DOES = { Data:'holds information the platform reads and writes', Computation:'works something out from numbers', Flow:'moves data from one place to another', Movement:'moves the map or the view', Structure:'holds everything in place' };
const GRID_PURPOSE = { geodesy:'turns coordinates into real distances and bearings', 'grid-network':'models substations, circuits and ratings', capacity:'decides whether a project can connect, and how much', cartridges:'a plug-in part of the map every project is seen on', layers:'a map layer the reader can turn on', pages:'a page a non-coder uses to read the estate', constants:'a value the whole platform must agree on', deeplinks:'carries a project to its place on the map', proofs:'a check that keeps published figures honest', news:'shows live grid news against the pipeline', solar:'solar, storage and cable engineering', data:'a dataset the platform reads' };

const manifest = await get(DASH + 'spider/manifest.json');
let blocks = {}, reactions = [];
try { const b = await get(STARS + 'blocks/blocks.json'); for (const x of b.blocks) blocks[x.symbol] = x; } catch (e) {}
try { const r = await get(STARS + 'blocks/reactions.json'); reactions = r.reactions || []; } catch (e) {}
const blockOf = (label) => { const m = String(label || '').match(/^([A-Z][a-z]?\d?)\s/); return m ? blocks[m[1]] : null; };
const compatOf = (sym) => reactions.filter(p => p.a === sym || p.b === sym).map(p => ({ other: p.a === sym ? p.b : p.a, verdict: p.verdict, basis: p.basis })).slice(0, 6);

const cards = {}; let leafCount = 0, nodeCount = 0; const perGraph = [];
for (const g of manifest.graphs) {
  const url = g.path.startsWith('http') ? g.path : DASH + g.path.replace(/^\.\//, '');
  let raw; try { raw = await get(url); } catch (e) { perGraph.push({ id: g.id, error: e.message }); continue; }
  const nodes = Array.isArray(raw) ? raw : raw.nodes;
  if (!Array.isArray(nodes) || !nodes.length || typeof nodes[0] !== 'object') { perGraph.push({ id: g.id, skipped: 'not a node graph' }); continue; }
  let edges = (raw.edges || raw.links || []);
  if (g.edges_path) { try { edges = await get(g.edges_path.startsWith('http') ? g.edges_path : DASH + g.edges_path.replace(/^\.\//, '')); } catch (e) {} }
  const id2i = {}; nodes.forEach((n, i) => { id2i[n.id !== undefined ? n.id : i] = i; });
  const out = new Array(nodes.length).fill(0), parents = new Array(nodes.length).fill(null);
  for (const e of edges) {
    const f = e.from !== undefined ? e.from : e.source, t = e.to !== undefined ? e.to : e.target;
    const fi = id2i[f] ?? (typeof f === 'number' ? f : null), ti = id2i[t] ?? (typeof t === 'number' ? t : null);
    if (fi != null) out[fi]++; if (ti != null && parents[ti] == null) parents[ti] = fi;
  }
  const gcards = {};
  nodes.forEach((n, i) => {
    nodeCount++;
    if (out[i] !== 0) return; // not a dead end
    leafCount++;
    const b = blockOf(n.label);
    const cls = String(n.reason || '').split('·').map(x => x.trim()).find(x => CLASS_DOES[x]);
    const parent = parents[i] != null ? nodes[parents[i]] : null;
    const compat = b ? compatOf(b.symbol) : [];
    // the four faces the card must explain
    const fn = b ? (b.description || TYPE_IS[n.type] || 'part of the estate') : (TYPE_IS[n.type] || 'part of the estate');
    const purpose = b && GRID_PURPOSE[b.category] ? GRID_PURPOSE[b.category] : (cls ? CLASS_DOES[cls] : 'part of how the estate is read and checked');
    const rel = [];
    if (parent) rel.push('classified under ' + parent.label + (out[parents[i]] ? ' (with ' + (out[parents[i]] - 1) + ' siblings)' : ''));
    if (b && (b.depends_on || []).length) rel.push('depends on ' + b.depends_on.slice(0, 4).map(d => d.symbol).join(', '));
    if (b && (b.used_by || []).length) rel.push('used by ' + b.used_by.slice(0, 4).join(', '));
    if (compat.length) rel.push('proven to work with ' + compat.map(c => c.other).join(', '));
    const reason = b
      ? `${n.type === 'canonical' ? 'The canonical home' : 'One form'} of ${b.title}; first written ${(b.first_written || '').slice(0, 10) || 'unknown'}, lives in ${(b.repos || []).map(r => r.split('/')[1]).join(', ') || 'the estate'}${b.functions ? `, ${b.functions} functions inside` : ''}.`
      : `A ${n.type || 'part'} recorded because it exists in the code; ${n.rag === 'red' ? 'currently failing, kept visible so it is not hidden' : n.rag === 'amber' ? 'not yet settled' : 'in good standing'}.`;
    const next = b ? { label: 'See it on the periodic table', href: STARS + 'table.html?block=' + b.symbol }
      : n.ext ? { label: 'Open the reference', href: n.ext }
      : n.gh ? { label: 'Read the source', href: n.gh }
      : parent ? { label: 'Back to ' + parent.label, focus: parent.label } : null;
    gcards[n.label] = {
      label: n.label, type: n.type, rag: n.rag,
      function: fn, purpose, relationships: rel, reason,
      next, backTo: parent ? parent.label : null
    };
  });
  cards[g.id] = gcards;
  perGraph.push({ id: g.id, title: g.title, nodes: nodes.length, deadEnds: Object.keys(gcards).length });
}

const outObj = { generated_utc: now(), source: 'maya-hunter.mjs', note: 'A Maya card for every dead end (leaf) in every registered graph: what it is, its function, its purpose, its relationships, and its reason for existing. The dashboard reads this to explain a leaf and offer a next click.', counts: { graphs: manifest.graphs.length, nodes: nodeCount, deadEnds: leafCount }, perGraph, cards };
fs.writeFileSync(OUT + '/maya-cards.json', JSON.stringify(outObj, null, 1));
const md = `# Maya cards — dead ends hunted and explained\n\nGenerated ${now()} by maya-hunter.mjs.\n\n**${leafCount} dead ends** across ${manifest.graphs.length} graphs (${nodeCount} nodes total) each now carry a Maya card.\n\n| graph | title | nodes | dead ends |\n|---|---|---|---|\n${perGraph.map(p => `| ${p.id} | ${p.title || ''} | ${p.nodes ?? '-'} | ${p.deadEnds ?? (p.error ? 'ERROR ' + p.error : p.skipped || '-')} |`).join('\n')}\n\nEach card explains four faces — function, purpose, relationships, reason for existing — and offers a next click (its block page, its source, or back to its parent). Data: maya-cards.json.\n`;
fs.writeFileSync(OUT + '/MAYA-REPORT.md', md);
console.log(`DONE: ${leafCount} dead ends carded across ${manifest.graphs.length} graphs; ${nodeCount} nodes scanned.`);
console.log(perGraph.map(p => `  ${p.id}: ${p.deadEnds ?? (p.error || p.skipped)}`).join('\n'));
