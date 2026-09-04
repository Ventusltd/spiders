// markers.mjs — per-file extraction used to build the genome markers:
// DUPLICATION (same function/constant in >1 place), DRIFT (copies that
// disagree), DEAD CODE and RE-DOING and UNCOMPOSED (built in spider.mjs
// from these extractions plus the edge graph). This module only extracts;
// it does not decide anything is a defect on its own.
import crypto from 'node:crypto';

/** Balance-match a brace/paren/bracket starting at text[startIdx] (which
 *  must be the opening char), skipping over string/template literals and
 *  comments so braces inside a quoted string don't unbalance the scan.
 *  Returns the index of the matching closer, or -1. */
function balanceFrom(text, startIdx, open, close) {
  let depth = 0;
  let i = startIdx;
  let quote = null; // ', ", ` while inside a string/template
  let inLineComment = false;
  let inBlockComment = false;
  for (; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (ch === '*' && next === '/') { inBlockComment = false; i++; }
      continue;
    }
    if (quote) {
      if (ch === '\\') { i++; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '/' && next === '/') { inLineComment = true; i++; continue; }
    if (ch === '/' && next === '*') { inBlockComment = true; i++; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function findNextTopLevel(text, fromIdx, ch, stopChars) {
  for (let i = fromIdx; i < text.length; i++) {
    if (text[i] === ch) return i;
    if (stopChars.has(text[i])) return -1;
  }
  return -1;
}

function normalizeBody(body) {
  // Strip comments and collapse whitespace so formatting-only differences
  // (spacing, line breaks) don't register as disagreement; genuine logic
  // differences still change the hash.
  const noBlockComments = body.replace(/\/\*[\s\S]*?\*\//g, ' ');
  const noLineComments = noBlockComments.replace(/\/\/[^\n]*/g, ' ');
  return noLineComments.replace(/\s+/g, ' ').trim();
}

function hashOf(s) {
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex').slice(0, 16);
}

const RE_FUNCTION_DECL = /\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g;
const RE_ARROW_ASSIGN = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>\s*\{/g;

function lineOf(text, index) {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i++) if (text[i] === '\n') line++;
  return line;
}

/** Extract named function-shaped units: classic `function name(...) {...}`
 *  and `const name = (...) => {...}`. Excludes anonymous/inline callbacks
 *  on purpose — those can't recur "by name" so they're not evidence of
 *  duplication in the sense this genome marker means. */
export function extractFunctions(text) {
  const out = [];
  for (const re of [RE_FUNCTION_DECL, RE_ARROW_ASSIGN]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text))) {
      const name = m[1];
      let braceStart;
      if (re === RE_FUNCTION_DECL) {
        const parenIdx = text.indexOf('(', m.index);
        if (parenIdx < 0) continue;
        const parenEnd = balanceFrom(text, parenIdx, '(', ')');
        if (parenEnd < 0) continue;
        braceStart = findNextTopLevel(text, parenEnd + 1, '{', new Set([';']));
      } else {
        braceStart = m.index + m[0].length - 1; // regex ends on the '{'
      }
      if (braceStart == null || braceStart < 0 || text[braceStart] !== '{') continue;
      const braceEnd = balanceFrom(text, braceStart, '{', '}');
      if (braceEnd < 0) continue;
      const body = text.slice(braceStart, braceEnd + 1);
      // Skip trivial one-line pass-throughs; too small to mean anything as
      // "duplication" and they inflate the marker with noise.
      if (body.length < 24) continue;
      const normalized = normalizeBody(body);
      out.push({
        name,
        line: lineOf(text, m.index),
        length: body.length,
        hash: hashOf(normalized),
      });
    }
  }
  return out;
}

// Curated, cited constant families: a value known, from the estate's own
// documentation, to have drifted. See grid-distance-maths/docs/EARTH-MODEL.md
// and README.md for the citation this table encodes.
export const KNOWN_CONSTANT_FAMILIES = [
  {
    id: 'earth-radius-km',
    description: 'Earth radius (km) used in a haversine/geodesy distance calculation',
    pattern: /\b(6378\.137|6371\.0088|6384\.7272|6367\.4|6366\.707)\b/g,
    citation: 'Ventusltd/grid-distance-maths README.md and docs/EARTH-MODEL.md',
  },
];

export function extractKnownFamilyHits(text) {
  const out = [];
  for (const family of KNOWN_CONSTANT_FAMILIES) {
    const re = new RegExp(family.pattern.source, family.pattern.flags);
    let m;
    while ((m = re.exec(text))) {
      out.push({ family: family.id, value: m[1], line: lineOf(text, m.index) });
    }
  }
  return out;
}

// Generic: a SCREAMING_CASE constant assignment, by name, wherever declared.
const RE_CONST_DECL = /^[ \t]*(?:export\s+)?(?:const|let|var)\s+([A-Z][A-Z0-9_]{2,})\s*=\s*([0-9]+(?:\.[0-9]+)?)\s*;/gm;

export function extractNamedConstants(text) {
  const out = [];
  RE_CONST_DECL.lastIndex = 0;
  let m;
  while ((m = RE_CONST_DECL.exec(text))) {
    out.push({ name: m[1], value: m[2], line: lineOf(text, m.index) });
  }
  return out;
}
