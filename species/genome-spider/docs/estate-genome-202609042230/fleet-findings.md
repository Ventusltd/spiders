# Fleet findings — antibodies run across the estate

**Method**: `cvaa/tools/fleet.mjs` and `cvaa/inoculate.mjs` (the working, real tooling — see `runner-status.md`) run directly, per-repo, from the local `cvaa` checkout (27 vaccines, 26 committed + 1 uncommitted local file — see `antibody-inventory.md` Part A). Not simulated, not hand-implemented. Command:
```
cd cvaa && node tools/fleet.mjs <repo1> <repo2> ... --json-out fleet-core.json
```
run against the 8 repos with measured history depth: `globalgrid2050`, `pipelinenews`, `gridatlas`, `spiders`, `cvaa`, `data-grid-gb`, `grid-distance-maths`, `ventus-grid-engine`. Full per-vaccine detail additionally pulled with `node inoculate.mjs <repo> --no-lock --no-write` for `gridatlas`, `globalgrid2050`, `pipelinenews`. `--no-write`/`--no-lock` used throughout — no repo file was modified by these runs (only `cvaa`'s own `vaccines/last-fired.json` sidecar is written when `--no-write` is *not* passed, which is why it was avoided).

Note: `unshare` is unavailable on Windows, so every run printed `warning: unshare -rn unavailable; antibodies run without a network namespace` — antibodies still ran fully sandboxed by Node's `--permission`/`--allow-fs-read` flag, just without the extra Linux network-namespace layer. This does not affect the validity of the findings below (all antibodies here are pure data-only checks, verified to contain no network/shell/eval code by `no-dangerous-apis`, which reports `immune` on the registry itself in every run).

## Estate-wide summary

| repo | errors (FAIL) | warnings (WARN, baselined) |
|---|---:|---:|
| globalgrid2050 | 96 | 620 |
| pipelinenews | 154 | 124 |
| gridatlas | 58 | 0 |
| spiders | 3 | 4 |
| cvaa (self) | 5 | 4 |
| data-grid-gb | 8 | 2 |
| grid-distance-maths | 2 | 0 |
| ventus-grid-engine | 2 | 4 |

## Findings ranked by potential harm to a reader of the live product

### 1. LIVE — gridatlas: the current release's checksums do not verify (`pointer-verifies`)

```
FAIL   pointer-verifies
         - atlas/releases/202608300453-atlas-v9 checksums do not verify
```
The release pointer names `atlas/releases/202608300453-atlas-v9` as the live release, and `sha256sum -c sha256sums.txt` against that directory fails. This is the disease `pointer-verifies` exists to catch: nothing else in the pipeline cross-checks that the release the pointer names is actually intact on disk. **LIVE** in the sense that this is the release currently pointed to as authoritative; whether the *served* bytes (vs. the working-copy bytes) differ is a separate, unverified question — see finding 6 below (`disk-is-not-what-ships`) for why "on disk" and "what ships" are explicitly different questions in this registry's own model.

### 2. LIVE — globalgrid2050: a real navigation-emptying outage already happened, and its vaccine (`page-data-block-parses`) is currently immune

The vaccine's own Symptom section (`cvaa/vaccines/202608312045-page-data-block-parses.md`) documents a real incident: on 2026-08-31, a release-promotion edit in globalgrid2050's `index.html` closed a `note:` string early, leaving the rest of the line outside the string; the `AREAS` JS array threw a `SyntaxError`, and the entire public homepage directory rendered empty — live for several minutes — despite serving HTTP 200 and passing a superficial glance. Current run: `immune page-data-block-parses` on both globalgrid2050 and gridatlas/pipelinenews — i.e. the specific class of defect is not currently present, but the mechanism (string-surgery edits to inline JS data blocks) is structural to how these repos publish, so this is a **live-risk pattern**, not a closed incident.

### 3. LATENT but estate-wide — clocks disagree with commit history on every single repo tested (`monotonic-utc-generations`)

`monotonic-utc-generations` **FAILs on all 8 repos tested, with no exception**, including a brand-new repo created today (`ventus-grid-engine`, 1 finding, 60 minutes off) and the immune-system repo itself (`cvaa`, 4 findings). Worst: `pipelinenews` (103 findings), `gridatlas` (40), `globalgrid2050` (34). Pattern: generation timestamps embedded in commit subjects are consistently tens to hundreds of minutes off the commit's actual UTC time (`date -u`), and several commits' generations run *earlier* than the previous commit's generation (e.g. gridatlas `4b3fd52 generation 202609021625 is earlier than previous 202609040337` — a 2435-minute, i.e. ~40-hour, discrepancy). Since 12-digit generation IDs are this estate's *only* ordering/identity mechanism across repos (used in release names, scope-of-works filenames, workflow filenames), a mechanism that is wrong on every single repo tested is a genome-level, not repo-level, defect. **LATENT** in the sense that nothing crashes today because of it, but it directly undermines any tooling (including CVAA's own `replay.mjs`/`score.mjs`) that trusts generation ordering as a proxy for commit time.

### 4. LATENT — gridatlas: 8 scope-of-works entries with no declared executor (`executor-declared`)
```
FAIL   executor-declared
         - 202608301321-01-move-atlas-into-atlas-folder.md: no executor field (agent|script|human)
         ... (7 more, one per scope file 202608301321 through 202608301525)
```
The ledger cannot currently distinguish which of these 8 scope entries were done by an agent, a script, or a human — the exact ambiguity `executor-declared`'s Disease section warns about (a script replaying pre-written payloads can misdescribe itself as agent work, or vice versa). Affects trust in gridatlas's own build history, not the served product directly.

### 5. LATENT — gridatlas: the perpetual scope-loop has no schedule (`loop-exists`)
```
FAIL   loop-exists
         - 202608301321-scope-loop.yml has no schedule; the loop is not perpetual
```
The workflow that is supposed to be gridatlas's perpetual advancement loop now runs only on manual dispatch — the cron was removed at some point. The ledger structure still implies an active perpetual loop; it is not one.

### 6. LATENT, estate-wide — no repo pins line endings (`disk-is-not-what-ships`)

**FAILs identically on all 8 repos tested** (globalgrid2050, pipelinenews, gridatlas, spiders, cvaa, data-grid-gb, grid-distance-maths, ventus-grid-engine): none has a `.gitattributes` file, so nothing guarantees the working-copy bytes any check reads equal the bytes actually committed/served. This is a structural gap in every repo's foundations, not a specific bug — but it is the same principle finding 1's harm (checksum verification) depends on, and it is universal.

### 7. LATENT — globalgrid2050 and pipelinenews: workflows carry wall-clock gates (`no-time-based-gates`)
```
globalgrid2050: catalogue-gridatlas-v9.yml carries a wall-clock gate
pipelinenews:  202608300232-sync-atlas-v9-deep-links.yml carries a wall-clock gate;
               cron "20 4-8 30 8 *" is pinned to one calendar day (2026-08-30)
```
Automation tied to a specific calendar day will silently stop doing anything once that day has passed — exactly the disease this vaccine documents (`MISSION_EXPIRES_AT`-style expiry baked into a workflow). `pipelinenews`'s cron is pinned to 30 August specifically, already in the past relative to today (2026-09-04); this workflow is likely already dormant.

### 8. LATENT, estate-wide — every workflow-bearing repo pushes with the default token and can't chain (`chaining-token`)

FAILs on 6 of 8 repos (all except cvaa and grid-distance-maths), from 1 finding (spiders, data-grid-gb) to 58 (globalgrid2050) and 34 (pipelinenews). Downstream automation that depends on one workflow's push triggering the next will not fire — this is the mechanism the estate's own `no-per-release-workflows` finding (below) is partly compensating for by giving each release its own bespoke workflow instead of relying on chaining.

### 9. LATENT, three repos — one workflow per release instead of one reusable workflow (`no-per-release-workflows`)

`pipelinenews`: 43 timestamped workflows exceed baseline 0. `globalgrid2050`: 9. `gridatlas`: 3. Each hard-codes one release id; the workflow folder accretes rather than staying stable. This is the exact disease `no-per-release-workflows`'s own Symptom section describes as already having happened once in gridatlas history (25 timestamped workflows on 2026-08-30) — the pattern recurred rather than being closed off.

### 10. Baselined/lower-severity, estate-wide — unpinned actions and excess permissions (`pinned-actions`, `least-permissions`)

Warn-level (not fail) on nearly every repo: third-party GitHub Actions referenced by movable tag (`@v4` etc.) rather than a pinned commit SHA, and workflows with unused write permissions or no `timeout-minutes`. Largest: globalgrid2050 (442 + 178), pipelinenews (123 + 1). `cvaa.json`'s own baseline currently allows up to 6 `pinned-actions` findings and 2 `monotonic-utc-generations` findings before these escalate from warning to error, expiring 2026-09-30 — i.e. the registry's own baseline is presently *wider* than what several repos actually need (cvaa itself has exactly 4 pinned-actions findings, under its own 6-item allowance).

## Confirmed antibody blind spot: `no-app-copies` does not see copy-by-sibling-repo

The GitHub root holds 5 non-git directories that are full-application copies sitting beside their originals: `gridatlas-codex-202609020010-r2`, `gridatlas-v9104-fullscreen`, `pipelinenews-codex-202609020010-r2`, `pipelinenews-codex-202609020100-r3`, `pipelinenews-worktrees` — this is structurally exactly the disease `no-app-copies` describes ("An AI that cannot see how the last release was built copies the whole application into a new timestamped folder"), just one directory level up (sibling repos at `C:\...\GitHub\`, not sibling folders inside one repo).

Tested directly: `node inoculate.mjs "C:/Users/vikra/OneDrive/Documents/GitHub/gridatlas-v9104-fullscreen" --no-lock --no-write` and the same against `pipelinenews-worktrees` — **both report `immune no-app-copies`**. Confirmed by reading the vaccine's antibody code and its own fixture (`tools/selftest.mjs`'s `no-app-copies` fixture creates sibling folders *inside* the target repo's root, e.g. `mkdirSync(join(r, 'atlas'))` + `mkdirSync(join(r, '202608300453-atlas-v9'))` — the check only ever looks inside the one repo it's pointed at). **This is a real, confirmed blind spot, not a hypothetical**: the exact failure mode this vaccine exists to prevent is currently present in the estate at the repo-sibling level, and the vaccine cannot see it because nothing runs `inoculate.mjs` pointed one directory higher, at `C:\Users\vikra\OneDrive\Documents\GitHub\` itself, treating the whole estate as one target.

## Repos not run through fleet.mjs this session

`data-gridatlas`, `data-gb-electricity`, `data-centres-gb`, `data-interconnectors`, `companies`, `claude`, `gb-electricity-ui`, `gemini`, `codex-chatgpt`, `chatgpt-audits`, `data-federation-map-for-globalgrid2050-all-repos` were not inoculated — out of the task's named 8-repo history-depth set, and out of time budget.
