// classify.mjs — turns a repo-relative path into a genome node "kind" and a
// "logical name" (the filename with its leading generation timestamp, if
// any, stripped off). This is heuristic, not certified: it reads directory
// and filename conventions actually observed across the estate (see
// genome-spider/README.md "What this deliberately does not claim").

const TIMESTAMP_PREFIX = /^(\d{8,14})-(.+)$/; // e.g. 202609011950-geodesy.js -> geodesy.js

const DIR_KIND_RULES = [
  [/(^|\/)\.github\/workflows(\/|$)/i, 'workflow'],
  [/(^|\/)modules(\/|$)/i, 'module'],
  [/(^|\/)parts(\/|$)/i, 'part'],
  [/(^|\/)cartridges(\/|$)/i, 'cartridge'],
  [/(^|\/)manifests(\/|$)/i, 'manifest'],
  [/(^|\/)proofs?(\/|$)/i, 'proof-suite'],
  [/(^|\/)test(s)?(\/|$)/i, 'proof-suite'],
  [/(^|\/)(engine|src)(\/|$)/i, 'source-unit'],
  [/(^|\/)sources(\/|$)/i, 'pinned-source'],
  [/(^|\/)(data|scopes)(\/|$)/i, 'data-product'],
  [/(^|\/)scripts(\/|$)/i, 'tool-script'],
  [/(^|\/)tools(\/|$)/i, 'tool-script'],
  [/(^|\/)docs(\/|$)/i, 'doc'],
];

export function classifyPath(relPath) {
  // Filename conventions are checked first and win over directory
  // location: a file named *.proof.mjs is a proof suite even when it
  // lives under a path that also matches /modules/ (gridatlas groups its
  // proofs as tools/proofs/modules/<name>.proof.mjs — the "modules" there
  // names which module the proof is *for*, not what the proof file *is*).
  // An earlier version of this function checked directory rules first and
  // misclassified all 18 of those proof files as kind 'module', which
  // then made them look like dead code (a proof file run directly from
  // the CLI is never imported by anything — that is not evidence of
  // abandonment, it's how proofs are always run).
  const base = relPath.split('/').pop() || relPath;
  if (/\.proof\.mjs$/.test(base)) return 'proof-suite';
  if (base === 'manifest.json' || /-composition\.json$/.test(base) || /-parts\.json$/.test(base)) {
    return 'manifest';
  }
  if (base === 'index.html') return 'entry-point';
  for (const [re, kind] of DIR_KIND_RULES) {
    if (re.test(relPath)) return kind;
  }
  return 'file';
}

export function stripTimestamp(basename) {
  const m = TIMESTAMP_PREFIX.exec(basename);
  return m ? m[2] : basename;
}

export function logicalGroupKey(relPath) {
  const dir = relPath.includes('/') ? relPath.slice(0, relPath.lastIndexOf('/')) : '';
  const base = relPath.split('/').pop();
  return `${dir}::${stripTimestamp(base)}`;
}

// Kinds that are expected to be *composed into* something else (an artefact
// or a manifest) rather than being terminal, load-bearing files themselves.
// Only these are eligible dead-code / uncomposed candidates — flagging a
// README or a workflow as "dead" because nothing imports it is a false
// positive class this list exists to avoid.
//
// 'pinned-source' (anything under a sources/ directory) is deliberately
// excluded even though the name suggests it should qualify: across this
// estate sources/ holds reference and provenance material — extraction
// snapshots, provenance manifests, docs about upstream data sources — not
// code a manifest is expected to pull back in. A first version of this
// detector included it and flagged 20 files this way (ventus-grid-engine's
// sources/deeplink-extracts/*, spiders/docs/sources/*.md, data-grid-gb's
// sources/*-manifest.json) that are working as designed, not abandoned.
export const COMPOSABLE_KINDS = new Set(['module', 'part']);

// Extensions genome-spider will read into memory and pattern-match. Binary
// or vendored-format files are never opened.
export const TEXT_EXT = new Set([
  '.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.py',
  '.json', '.yml', '.yaml', '.html', '.htm', '.md', '.css',
]);

// Segments excluded from *content scanning* (function/constant extraction,
// import/JSON parsing). They are still counted, by filename only, for the
// RE-DOING marker — a "releases" directory full of timestamped rebuilds is
// exactly the evidence that marker exists to surface.
export const SKIP_SEGMENT = new Set([
  '.git', 'node_modules', '__pycache__', 'dist', 'vendor', 'site-packages',
  'coverage', 'homepage_versions', 'site_versions', 'nightly', 'releases',
  '.claude-worktrees', 'pipelinenews-worktrees',
]);

export function pathIsSkipped(relPath) {
  const segs = relPath.split('/');
  return segs.some((s) => SKIP_SEGMENT.has(s));
}
