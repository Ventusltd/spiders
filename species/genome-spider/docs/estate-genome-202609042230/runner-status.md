# cvaa runner status on Node 24.19.0 / Windows

Verified with real commands, not assumed. Node: `node --version` → `v24.19.0` (checked at task start).

## Summary

- **`inoculate.mjs`, `tools/antibody-runner.mjs`, `tools/fleet.mjs`: WORK.** Verified by direct execution against the local checkout and against real estate repos, producing differentiated, plausible FAIL/WARN/immune results (not a uniform "everything fails" or "everything passes" pattern — see `fleet-findings.md`).
- **`tools/selftest.mjs`: WORKS on the repository's actual latest branch (`origin/main`, `a1678df0`), FAILS on the stale local working copy** that happens to be checked out in this clone.
- **`tools/replay.mjs`: BROKEN, confirmed on `origin/main` itself — this is current, not historical.** It fails silently: exit 0, zero stdout, zero stderr, and reports no findings for any commit, which is worse than a crash because it looks like a clean successful run.

## 1. The prior "three faults" finding — confirmed historical, confirmed fixed

The memory note "cvaa runner was dead on Node 24" refers to commit `9065d7273d7ed80726a6bb3adcc19b6caa9d7581` ("202608311459: make cvaa able to run, and vaccinate release naming", 2026-08-31 15:59 +0100), whose message states verbatim: *"cvaa has not executed a single antibody since Node 24 landed. Three faults, all fixed here."*

1. `inoculate.mjs` spawned every antibody child with `--experimental-permission`, which Node renamed to `--permission` in v23; v24 rejects the old flag and kills the child before it runs.
2. A child that never started produced empty stdout, and the close handler turned that into the finding `"antibody produced no result"` — **once per vaccine** — so a dead sandbox read as a diseased repo (fake findings for every rule, exactly as the memory note says).
3. Vaccine `.md` files were parsed with LF-anchored regexes, so a CRLF (Windows) checkout failed all 24 vaccines-of-the-day with `"missing front matter"` before the runner even reached antibody execution.

All three are fixed in `inoculate.mjs` as it stands today (verified present in both the local checkout and `origin/main`): the CRLF normalisation at `inoculate.mjs:45`, the `--permission`/`--experimental-permission` probe at `inoculate.mjs:115-117`, and the `res.fatal` short-circuit at `inoculate.mjs:145` that refuses to emit findings from a runner that never ran. Confirmed working: `cd cvaa && node inoculate.mjs . --no-lock --no-write` exits 0/1 correctly and prints real, differentiated per-vaccine results (see below).

## 2. A newer, still-live instance of the same bug class — in `tools/selftest.mjs`, now fixed upstream

Command run:
```
cd C:/Users/vikra/OneDrive/Documents/GitHub/cvaa
node tools/selftest.mjs
```
Result (local working copy, HEAD `c18cc13ef36ae5c79443a9a59e928a5404082b22`, branch `codex/202609012100-cvaa-mission`):
```
node:fs:1631
Error: ENOENT: no such file or directory, scandir 'C:\C:\Users\vikra\OneDrive\Documents\GitHub\cvaa\vaccines'
    at readdirSync (node:fs:1631:26)
    at file:///C:/Users/vikra/OneDrive/Documents/GitHub/cvaa/tools/selftest.mjs:37:23
```
Exit code 1, uncaught exception — the self-test never runs a single fixture.

**Root cause** (`tools/selftest.mjs:6` at that commit): `const here = new URL('..', import.meta.url).pathname;`. On Windows, `import.meta.url` is `file:///C:/Users/.../cvaa/tools/selftest.mjs`, and `.pathname` returns the POSIX-style string `/C:/Users/.../cvaa/`, with a leading slash before the drive letter. `path.join(here, 'vaccines')` (Windows `path.join`) turns that leading `/` into a second, bare drive root, and the whole string is re-appended after it, doubling the drive letter: `\C:\Users\...\cvaa\vaccines`. `readdirSync` then resolves that against the process's current drive, producing the observed `C:\C:\Users\...` and ENOENT. Reproduced deterministically with a standalone Node script (see method note below).

**This exact class of fault was already found and fixed once**, in commit `e1c65235` ("Make CVAA self-test portable and complete", 2026-08-31 21:51 +0100), whose diff replaces the line above with `const here = fileURLToPath(new URL('..', import.meta.url));` and adds the comment: *"URL.pathname leaves a Windows drive URL as `/C:/...`; path.join then turns that into `C:\\C:\\...`."*

**The local working copy in this clone predates that fix.** It is checked out at `c18cc13` (2026-09-01), on branch `codex/202609012100-cvaa-mission`, which branched before `e1c6523` (2026-08-31 21:51) landed on `main`/`origin/main`. Confirmed by extracting a clean snapshot of `origin/main` (`git archive origin/main`, read-only) into the scratchpad and running `node tools/selftest.mjs` there:
```
fires  one-active-scope
fires  no-app-copies
... (27 more lines, one per vaccine)
all antibodies fire on disease and stay silent on health
```
Exit code 0. **So: the runner is NOT currently broken on Node 24 for `selftest.mjs` on the estate's actual latest branch** — it is broken only in this stale, dirty local checkout.

## 3. `tools/replay.mjs` — the same bug, unfixed, confirmed on `origin/main`

`tools/replay.mjs:10` still contains the un-fixed sibling of the same anti-pattern:
```js
execSync(`node ${new URL('../inoculate.mjs', import.meta.url).pathname} . --no-write --no-lock`, ...)
```
Confirmed present verbatim in `origin/main` (`git show origin/main:tools/replay.mjs`), i.e. this is a live, current defect, not a historical one.

Verified by building a throwaway git repository from the `origin/main` snapshot (in scratchpad only, not touching any real repo) and running:
```
node tools/replay.mjs . HEAD~1
```
Result: **exit code 0, zero bytes of stdout, zero bytes of stderr.** Nothing is printed — no JSONL rows, no error. This is because `replay.mjs:9-10` wraps the (crashing) inner `node <path> . --no-write --no-lock` invocation in a `try { ... } catch (e) { out = e.stdout.toString(); }`; the child crashes with `MODULE_NOT_FOUND` on the doubled `C:\C:\...` path (reproduced directly, see below), `e.stdout` is an empty buffer, `out` becomes `''`, the per-commit regex scan over `out` finds nothing, and the loop silently emits no line for that commit. Repeated for every commit in the replay range. **A history study run with this tool on Windows would report a perfectly clean, empty result set and look like it succeeded — it never ran `inoculate.mjs` even once.**

Downstream consequence (by inspection, not executed — no labels.json exists to run it against): `tools/score.mjs` consumes `replay.mjs`'s JSONL output. Fed an empty file, `commits = []`, every per-vaccine tp/fp/fn is 0, and its precision/recall aggregation (`tools/score.mjs`, aggregate line) divides `0/(0+1||1)`, producing a clean `precision 0.00 recall 0.00` printout rather than an error — another layer of plausible-looking output built on a tool that never actually ran.

## Method note: reproducing the Windows path-doubling fault directly

```js
const { execSync } = require('node:child_process');
execSync('node /C:/Users/vikra/OneDrive/Documents/GitHub/cvaa/inoculate.mjs . --no-write --no-lock', { cwd: '.', stdio: 'pipe' });
```
fails with `Error: Cannot find module 'C:\C:\Users\vikra\OneDrive\Documents\GitHub\cvaa\inoculate.mjs'` — the exact doubling seen in both `selftest.mjs`'s ENOENT and `replay.mjs`'s silent swallow. (Note: invoking the same leading-slash path from Git Bash directly, rather than through Node's own `execSync`→`cmd.exe`, does NOT reproduce the bug, because Git Bash's MSYS layer rewrites the path first — an easy way to be fooled into thinking this is fine. The faithful reproduction has to go through `node:child_process`, as `replay.mjs`/`selftest.mjs` actually do.)

## 4. Local repository state — not something this session caused

`cvaa` has pre-existing uncommitted local state that predates this session (confirmed by mtimes: `vaccines.lock` modified 2026-08-31 23:54, `vaccines/last-fired.json` modified 2026-09-04 04:42 — both hours before this session started at ~20:50 UTC today):
- `vaccines.lock` modified (adds a hash entry for `disk-is-not-what-ships`) but not committed.
- `vaccines/last-fired.json` and `vaccines/202608312252-disk-is-not-what-ships.md` untracked.
- Local `main` (`d2893fa`, 2026-08-31) is itself stale relative to `origin/main` (`a1678df`, 2026-09-04) by many commits, including a whole batch of "autonomous release-control" vaccines merged today.

This session made no writes to any repository; all of the above was observed via `git status`/`git diff`, and confirmed pre-existing by file modification time.

## Vaccine count discrepancy — and one vaccine that isn't durable

The task brief states "28 executable vaccines." Measured, precisely:
- **Committed at local HEAD** (`c18cc13`, branch `codex/202609012100-cvaa-mission`, 2026-09-01): **26** `.md` vaccine files — confirmed via `git ls-tree -r --name-only HEAD -- vaccines`, and this matches the 26 hash entries in the *committed* `vaccines.lock` blob at that commit.
- **Physically on disk in the local checkout, right now**: **27** files — the 26 above, plus `vaccines/202608312252-disk-is-not-what-ships.md`, which is **untracked** (`git status` shows it `??`) and **has never been committed on any branch, local or remote**: `git log --all --oneline -- vaccines/202608312252-disk-is-not-what-ships.md` returns nothing. The working-tree `vaccines.lock` is correspondingly dirty (`git diff -- vaccines.lock` shows one added hash entry, uncommitted) — this is the modification noted in §4 above, and it predates this session (file mtime 2026-08-31 23:54, hours before this session started).
- **`origin/main`** (`a1678df`, current as of today, 2026-09-04): **31** `.md` vaccine files — the same 26 as the local HEAD, plus **5 different ones** added today (`202609031019-memory-store-complete.md` through `202609032338-observer-data-only.md`, merged via "Merge autonomous release-control vaccines"). Confirmed `disk-is-not-what-ships` is **not** among them: `git ls-tree -r --name-only origin/main -- vaccines | grep -i disk` returns nothing.

So there are **32 distinct vaccine files** across everything this session found: 26 shared, 1 (`disk-is-not-what-ships`) that exists only as an uncommitted local file in this one checkout, and 5 that exist only on `origin/main`. "28" was likely an accurate count at some point between these two states as the registry grew today.

The `disk-is-not-what-ships` situation is itself a small, live instance of the exact failure class CVAA exists to prevent: a vaccine — including one whose own Disease section is about the gap between working-copy bytes and what a repo actually carries — sitting only in a working copy, un-pinned in `vaccines.lock`'s committed history, and invisible to any other clone or CI run of this registry. If this checkout were discarded, that vaccine would cease to exist anywhere.

`antibody-inventory.md` and `fleet-findings.md` use the 27 files physically present in the working checkout that was actually inoculated against target repos (26 committed + the 1 uncommitted local addition, since that is what `inoculate.mjs` running from this directory picks up and what physically ran), and separately list the 5 newer ones found only on `origin/main` that this session could not exercise against real repos (they were extracted read-only via `git archive origin/main` into the scratchpad, not run via `inoculate.mjs` against a live target).
