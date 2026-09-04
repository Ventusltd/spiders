// git.mjs — thin, evidenced wrapper over the git CLI. No network, no auth,
// no dependency outside Node's stdlib. Every call is against a local
// checkout already on disk; genome-spider never clones or fetches.
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const MAX_BUFFER = 64 * 1024 * 1024; // 64MB — globalgrid2050's log is large but text.

function run(cwd, args) {
  const r = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    maxBuffer: MAX_BUFFER,
    windowsHide: true,
  });
  if (r.error) {
    return { ok: false, stdout: '', stderr: String(r.error.message || r.error), status: -1 };
  }
  return {
    ok: r.status === 0,
    stdout: r.stdout || '',
    stderr: r.stderr || '',
    status: r.status,
  };
}

export function isGitRepo(dir) {
  const r = run(dir, ['rev-parse', '--is-inside-work-tree']);
  return r.ok && r.stdout.trim() === 'true';
}

/** Repo-wide facts: first/last commit, commit count. One `git log`. */
export function repoStats(dir) {
  const log = run(dir, ['log', '--date=iso-strict', '--pretty=format:%H|%ad']);
  if (!log.ok || !log.stdout.trim()) {
    return { ok: false, reason: log.stderr.trim() || 'git log returned nothing', commits: [] };
  }
  const commits = log.stdout.trim().split('\n').map((line) => {
    const i = line.indexOf('|');
    return { sha: line.slice(0, i), date: line.slice(i + 1) };
  });
  // git log is newest-first.
  return {
    ok: true,
    commit_count: commits.length,
    last_commit: commits[0],
    first_commit: commits[commits.length - 1],
  };
}

/** Every path git currently tracks (respects .gitignore already, since
 *  ls-files only lists what's indexed). Forward-slash separated. */
export function lsFiles(dir) {
  const r = run(dir, ['ls-files', '-z']);
  if (!r.ok) return { ok: false, files: [], reason: r.stderr.trim() };
  const files = r.stdout.split('\0').filter(Boolean);
  return { ok: true, files };
}

/** Top-N most-revised tracked files by commit count touching them. One
 *  `git log --name-only` walk, counted in JS (avoids a shell pipeline so
 *  this runs the same on Windows and in CI). */
export function topRevisedFiles(dir, limit = 8) {
  const r = run(dir, ['log', '--pretty=format:', '--name-only']);
  if (!r.ok) return { ok: false, files: [], reason: r.stderr.trim() };
  const counts = new Map();
  for (const line of r.stdout.split('\n')) {
    const p = line.trim();
    if (!p) continue;
    counts.set(p, (counts.get(p) || 0) + 1);
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
  return { ok: true, files: sorted.map(([file, commits]) => ({ path: file, commits })) };
}

/** The last commit (sha + ISO date) that touched a specific tracked path.
 *  This is the clock genome-spider trusts for UNCOMPOSED — the file's own
 *  git history, not any timestamp encoded in its filename. */
export function fileLastCommit(dir, relPath) {
  const r = run(dir, ['log', '-1', '--date=iso-strict', '--pretty=format:%H|%ad', '--', relPath]);
  if (!r.ok || !r.stdout.trim()) return null;
  const line = r.stdout.trim();
  const i = line.indexOf('|');
  if (i < 0) return null;
  return { sha: line.slice(0, i), date: line.slice(i + 1) };
}

/** first_commit, last_commit and commit_count for one tracked path, in a
 *  single `git log` call. This is the per-unit-node equivalent of
 *  repoStats(). */
export function fileHistory(dir, relPath) {
  const r = run(dir, ['log', '--date=iso-strict', '--pretty=format:%H|%ad', '--', relPath]);
  if (!r.ok || !r.stdout.trim()) return null;
  const commits = r.stdout.trim().split('\n').map((line) => {
    const i = line.indexOf('|');
    return { sha: line.slice(0, i), date: line.slice(i + 1) };
  });
  return {
    commit_count: commits.length,
    last_commit: commits[0],
    first_commit: commits[commits.length - 1],
  };
}

export function resolveRepoRoot(baseDir, relPath) {
  return path.join(baseDir, ...relPath.split('/'));
}
