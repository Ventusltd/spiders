// edges.mjs — evidenced, real dependency detection. Every edge this module
// returns carries the file and the pattern that produced it, because an
// unevidenced edge in a dependency map is worse than a missing one (that
// rule is enforced again, mechanically, by genome.proof.mjs).
import path from 'node:path';
import { TEXT_EXT } from './classify.mjs';

const RE_IMPORT_FROM = /\bimport\s+(?:[\s\S]*?\bfrom\s+)?['"]([^'"]+)['"]/g;
const RE_REQUIRE = /\brequire\(\s*['"]([^'"]+)['"]\s*\)/g;
const RE_FETCH_URL = /\bfetch\(\s*['"]([^'"]+)['"]/g;
const RE_ACTION_USES = /^\s*(?:-\s*)?uses:\s*([\w.-]+\/[\w.-]+)@([^\s#]+)/gm;
const RE_WORKFLOW_REPOSITORY = /\brepository:\s*['"]?([\w.-]+\/[\w.-]+)['"]?/g;
const PATH_LIKE = /^(?:\.{1,2}\/)?[\w.\-/]+\.(?:js|mjs|cjs|jsx|ts|tsx|py|json|html|htm|css)$/i;
const HEX40 = /^[0-9a-f]{40}$/;
const HEX_ANY = /^[0-9a-f]{7,64}$/;

function lineOf(text, index) {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i++) if (text[i] === '\n') line++;
  return line;
}

function snippet(text, index) {
  const start = Math.max(0, text.lastIndexOf('\n', index) + 1);
  let end = text.indexOf('\n', index);
  if (end < 0) end = text.length;
  return text.slice(start, end).trim().slice(0, 160);
}

/** Resolve a relative-looking specifier against the file's own directory,
 *  then against the repo root, returning the repo-relative path if it
 *  names a file this repo actually tracks. Returns null otherwise — a
 *  specifier that resolves to nothing is not evidence of anything. */
function resolveWithinRepo(fromRelDir, specifier, trackedSet) {
  const candidates = [];
  if (specifier.startsWith('.')) {
    candidates.push(path.posix.normalize(path.posix.join(fromRelDir, specifier)));
  } else {
    candidates.push(path.posix.normalize(specifier));
    candidates.push(path.posix.normalize(path.posix.join(fromRelDir, specifier)));
  }
  for (const c of candidates) {
    const norm = c.replace(/^(\.\.\/)+/, '').replace(/^\.\//, '');
    if (trackedSet.has(norm)) return norm;
    // extension-less import (common for .mjs written without the suffix)
    for (const ext of ['.js', '.mjs', '.cjs']) {
      if (trackedSet.has(norm + ext)) return norm + ext;
    }
  }
  return null;
}

/** import/require edges, intra-repo only (cross-repo package imports are
 *  not how this estate links code — fetch, pinned SHAs and manifest path
 *  strings are). */
export function importEdges(relPath, text, trackedSet) {
  const out = [];
  const dir = relPath.includes('/') ? relPath.slice(0, relPath.lastIndexOf('/')) : '';
  for (const re of [RE_IMPORT_FROM, RE_REQUIRE]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text))) {
      const spec = m[1];
      const resolved = resolveWithinRepo(dir, spec, trackedSet);
      if (!resolved || resolved === relPath) continue;
      out.push({
        toPath: resolved,
        type: 'imports',
        evidence: { file: relPath, line: lineOf(text, m.index), pattern: re === RE_IMPORT_FROM ? 'import ... from' : 'require(...)', snippet: snippet(text, m.index) },
      });
    }
  }
  return out;
}

/** fetch('https://...') edges to other repos in the estate, matched by
 *  raw.githubusercontent.com/OWNER/REPO/... or OWNER.github.io/REPO/... */
export function fetchEdges(relPath, text, owner, knownRepoNames) {
  const out = [];
  RE_FETCH_URL.lastIndex = 0;
  let m;
  while ((m = RE_FETCH_URL.exec(text))) {
    const url = m[1];
    let target = null;
    let mm;
    if ((mm = new RegExp(`raw\\.githubusercontent\\.com/${owner}/([\\w.-]+)/`, 'i').exec(url))) {
      target = mm[1];
    } else if ((mm = new RegExp(`${owner}\\.github\\.io/([\\w.-]+)/?`, 'i').exec(url))) {
      target = mm[1];
    } else if ((mm = new RegExp(`api\\.github\\.com/repos/${owner}/([\\w.-]+)`, 'i').exec(url))) {
      target = mm[1];
    }
    if (target && knownRepoNames.has(target)) {
      out.push({
        toRepo: target,
        type: 'fetch',
        evidence: { file: relPath, line: lineOf(text, m.index), pattern: 'fetch(url)', snippet: snippet(text, m.index) },
      });
    }
  }
  return out;
}

/** uses: owner/repo@<sha> in a workflow — pinned-action edges, and the
 *  input the pinned-actions vaccine checks (see genome.proof.mjs). */
export function workflowUsesEdges(relPath, text) {
  const out = [];
  RE_ACTION_USES.lastIndex = 0;
  let m;
  while ((m = RE_ACTION_USES.exec(text))) {
    const [, ref, pin] = m;
    out.push({
      toRepo: ref, // may be "owner/repo" or "owner/repo/subpath"
      pinned: HEX40.test(pin),
      pin,
      type: 'pinned-action',
      evidence: { file: relPath, line: lineOf(text, m.index), pattern: 'uses: owner/repo@sha', snippet: snippet(text, m.index) },
    });
  }
  RE_WORKFLOW_REPOSITORY.lastIndex = 0;
  while ((m = RE_WORKFLOW_REPOSITORY.exec(text))) {
    out.push({
      toRepo: m[1],
      type: 'workflow-checkout',
      evidence: { file: relPath, line: lineOf(text, m.index), pattern: 'checkout repository:', snippet: snippet(text, m.index) },
    });
  }
  return out;
}

/** Walk parsed JSON looking for (a) string values that look like a
 *  repo-relative source path and resolve to a tracked file — manifest
 *  composition evidence, carrying a sibling sha256/bytes when present —
 *  and (b) {repository, tree|sha|ref|commit} pairs naming a pinned
 *  cross-repo source. Both are how this estate actually declares
 *  provenance: JSON string literals, not code-level imports. */
export function jsonProvenanceEdges(relPath, jsonText, trackedSet, knownRepoNames) {
  const out = [];
  let data;
  try {
    data = JSON.parse(jsonText);
  } catch {
    return out; // not valid JSON; no evidence to extract
  }
  const dir = relPath.includes('/') ? relPath.slice(0, relPath.lastIndexOf('/')) : '';
  const seen = new Set();

  function walk(node, pointer) {
    if (node === null || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach((v, i) => walk(v, `${pointer}/${i}`));
      return;
    }
    // (a) path-like string leaves, with an optional sibling hash.
    for (const [key, val] of Object.entries(node)) {
      if (typeof val === 'string' && PATH_LIKE.test(val)) {
        const candidates = [
          path.posix.normalize(val.replace(/^\.\//, '')),
          path.posix.normalize(path.posix.join(dir, val)),
        ];
        let resolved = null;
        for (const c of candidates) {
          const norm = c.replace(/^(\.\.\/)+/, '');
          if (trackedSet.has(norm)) { resolved = norm; break; }
        }
        if (resolved) {
          const dedupeKey = `${resolved}@${pointer}/${key}`;
          if (!seen.has(dedupeKey)) {
            seen.add(dedupeKey);
            const sha256 = typeof node.sha256 === 'string' ? node.sha256 : null;
            out.push({
              toPath: resolved,
              type: 'manifest-path',
              sha256,
              evidence: { file: relPath, line: 0, pattern: `json:"${key}"`, snippet: `${pointer}/${key} = "${val}"` },
            });
          }
        }
      }
    }
    // (b) {(source_)?repo(sitory)?: "Owner/Name", (head_|source_)?(tree|sha|ref|commit): "<hex>"}
    // e.g. gridatlas/atlas/modules.json's source_patterns_from, and
    // ventus-grid-engine/sources/*-provenance.json's {source_repo,
    // source_path, head_sha} triples.
    const repoKey = Object.keys(node).find((k) => /^(source_)?repo(sitory)?$/i.test(k));
    const shaKey = Object.keys(node).find((k) => /^(head_|source_)?(tree|sha|ref|commit)$/i.test(k));
    if (repoKey && shaKey && typeof node[repoKey] === 'string' && typeof node[shaKey] === 'string') {
      const repoVal = node[repoKey];
      const shaVal = node[shaKey];
      const shortName = repoVal.includes('/') ? repoVal.split('/').pop() : repoVal;
      if (knownRepoNames.has(shortName) && HEX_ANY.test(shaVal)) {
        out.push({
          toRepo: shortName,
          type: 'json-provenance',
          pin: shaVal,
          evidence: { file: relPath, line: 0, pattern: `json:"${repoKey}"+"${shaKey}"`, snippet: `${pointer}: ${repoKey}=${repoVal}, ${shaKey}=${shaVal}${node.source_path ? ', source_path=' + node.source_path : ''}` },
        });
      }
    }
    // (c) a map whose keys are themselves repo names to a pinned sha, e.g.
    // {"globalgrid2050": "7d00781b...", "gridatlas": "64268fd0"}.
    for (const [key, val] of Object.entries(node)) {
      if (knownRepoNames.has(key) && typeof val === 'string' && HEX_ANY.test(val)) {
        out.push({
          toRepo: key,
          type: 'json-provenance',
          pin: val,
          evidence: { file: relPath, line: 0, pattern: 'json: {<repo-name>: <sha>}', snippet: `${pointer}/${key} = "${val}"` },
        });
      }
    }
    for (const [key, val] of Object.entries(node)) {
      if (val && typeof val === 'object') walk(val, `${pointer}/${key}`);
    }
  }

  walk(data, '');
  return out;
}

export function isTextFile(relPath) {
  const ext = path.extname(relPath).toLowerCase();
  return TEXT_EXT.has(ext);
}
