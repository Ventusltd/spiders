# genome-spider

genome-spider walks a list of local git repositories and emits the
estate's **genome**: every repository and every significant internal unit
as a node, every dependency it could actually evidence as an edge, and five
**genome markers** — duplication, drift, dead code, re-doing, and
uncomposed source — derived from git history and file content, not
asserted from memory.

It is a living instrument, not a one-off report: run it again after the
estate changes and the genome changes with it. `spiders/.github/workflows/genome.yml`
runs it in CI on a schedule and on demand, and commits the result only when
it materially changes.

ESM, Node stdlib only — no npm install, nothing to pin but Node itself.

```
node spider.mjs                     # walk the estate, write ./data/*.json
node genome.proof.mjs               # check the output; exits non-zero on failure
node spider.mjs --root=<path>       # walk a different checkout layout
node spider.mjs --repos=gridatlas,cvaa   # walk a subset
```

By default `spider.mjs` reads `config/repos.json` for the repo list and the
estate owner, and resolves `root` relative to its own directory (three
levels up from `spiders/species/genome-spider/` lands on the parent that
holds every sibling checkout — the same layout this machine already uses).
Override with `--root=`, `GENOME_SPIDER_ROOT`, or `--repos=`.

## What it found, on a real run

19 repositories, 2026-09-04, ~72 seconds:

| | |
|---|---|
| repos walked / skipped | 19 / 0 |
| nodes (repos + significant units) | 1,184 |
| edges (all evidenced) | 2,424 |
| duplication groups | 519 (roughly 480 functions, 38 constants — moved slightly between runs; see "A live estate") |
| drift groups | 1 family, 3 distinct values, spanning 5 repos |
| dead code | 3 |
| uncomposed | 1 (gridatlas kept changing under this run — see "A live estate" below) |
| re-doing groups (rebuilt >1×) | 223 |

The committed `data/genome.json`, `data/nodes.json`, `data/edges.json` and
`data/manifest.json` in this directory are that exact run's output, so the
numbers above can be checked against real data, not just this description.

### A live estate

Several of these repositories — `gridatlas` especially — were being edited
by other processes while this was built and run. That is the point of a
*living instrument* rather than a one-off report: the uncomposed count
above moved from 3 to 4 to 1 across three runs made minutes apart, purely
because other work landed on `gridatlas` in between. Every number in this
README is what one specific run found, timestamped in that run's
`generated_at`; running it again against a moving estate will not
reproduce it exactly, and shouldn't be expected to.

## The schema this loads into: the Spider Sandbox

federation-spider's Spider Sandbox already renders a node/edge graph — FOCUS
selector, Both/Outgoing/Incoming, Explore/GitHub/External/Status tabs, a
Spider/Column canvas toggle. genome-spider emits data that sandbox can load
unmodified. The shape below was read out of the running sandbox, not
invented:

- **Loader.** `data-federation-map-for-globalgrid2050-all-repos/dashboard/sandbox/spider_full_po_test.html:196-200`,
  function `loadRoot()` — fetches `nodes.json` and `edges.json` from a
  sibling `data/` directory.
- **Node shape.** `spider_full_po_test.html:198`, function `reshapeNodes(fc)`
  — reads `fc.features[].properties.{label, repo_type|scope_type,
  rag|status, status_reason, child_manifest}` from a GeoJSON
  `FeatureCollection`. `geometry`/`coordinates` are present in the real
  data but **not read** by this function; genome-spider fills them in for
  shape-fidelity only (a cosmetic circle layout), never as real geography.
- **Edge shape.** `spider_full_po_test.html:200` — `(ef.edges||[]).map(e =>
  [e[0], e[1], e[2]])`: edges are `[fromIndex, toIndex, type]`, referencing
  **array position** in the nodes list, not a stable id.
- **Confirmed against the live cartridge**, byte-inspected, not assumed
  from the loader code alone:
  `data-federation-map-for-globalgrid2050-all-repos/live_sandbox/federation_control_ledger/data/nodes.json`
  is exactly that FeatureCollection shape, and
  `.../data/edges.json:2` declares `"edge_format": "index-array-v1"`,
  confirming the index-array reading is the sandbox's actual declared
  contract, not an accident of one file.
- **manifest.json** is descriptive metadata the sandbox does not load for
  the root scope (`loadContents()` reads one field, `scannedMonolithSHA`,
  from a *different*, nested manifest — see `spider_full_po_test.html:204`).
  genome-spider still emits one, shaped like
  `.../live_sandbox/federation_control_ledger/data/manifest.json`, for
  documentation and for any future consumer that does read it.

This shape is built in `lib/schema.mjs`, which repeats these same citations
next to the code that acts on them.

To actually view a run: copy (or symlink) this directory's `data/nodes.json`
and `data/edges.json` next to a copy of `spider_full_po_test.html` — or open
the sandbox and point its `DATA_BASE` at this `data/` directory — and the
existing sandbox renders the estate genome with no changes to the sandbox
itself. genome-spider does not do this copying itself: it does not write
outside `spiders/species/genome-spider/` (see "Write scope" below).

### genome.json: the schema the sandbox doesn't have

`nodes.json`/`edges.json` carry only what the sandbox already knows how to
render. Everything the task actually asked for — git history, evidence
citations, and the five genome markers — lives in `genome.json`:

```
{
  schema, generated_at, generator, estate_root,
  repos_configured, repos_walked, repos_skipped, scan_limits,
  nodes: [{ id, kind, label, repo, path, purpose,
             first_commit, last_commit, commit_count,
             top_revised_files, rag, status_reason }],
  edges: [{ from, to, type, evidence: { file, line, pattern, snippet } }],
  markers: { duplication, drift, dead_code, re_doing, uncomposed,
             re_doing_total_groups }
}
```

Every edge's `evidence` names the file and the pattern that produced it —
`import ... from`, `require(...)`, `fetch(url)`, `uses: owner/repo@sha`,
`checkout repository:`, or a JSON key like `json:"path"` — plus a snippet.
An edge with no evidence, or a node with no commit history, is a proof
failure (`genome.proof.mjs` checks this mechanically; see below).

## The five genome markers

**DUPLICATION** — the same function name or `SCREAMING_CASE` constant
declared in more than one file, anywhere in the estate (cross-repo
included). Each copy is hashed (comments and whitespace stripped, logic
kept) so `agree: true/false` reflects real code difference, not
formatting. 515 groups found; 115 of the 477 function-name groups disagree.
Examples from the real run: `distanceKm`, `normalise` and `haversine` each
recur across `gridatlas`, `ventus-grid-engine` and (for `distanceKm`)
`grid-distance-maths`, and none of the three agree byte-for-byte — the
"four hand-rolled nearest-neighbour searches" the estate already knows
about, rediscovered generically, by name collision and hash, not by
hard-coding those four files.

**DRIFT** — a duplication where the copies' *values* disagree. Two
detection paths: (a) a named constant (`const X = ...;`) whose value
differs across its copies, and (b) a curated, cited family — right now just
`earth-radius-km`, matching `6378.137` / `6371.0088` / `6384.7272`
literally, cited to `grid-distance-maths/README.md` and
`docs/EARTH-MODEL.md`. The real run found this family in 5 repos
(`claude`, `gemini`, `grid-distance-maths`, `gridatlas`,
`ventus-grid-engine`) with all three values present — `grid-distance-maths`
itself exports all three *on purpose* (it's the fix, not a defect), so its
presence in this list is expected, not damning; the marker reports where a
value appears, not whether that appearance is a mistake.

**DEAD CODE** — a `module` or `part` file (gridatlas's own vocabulary for
composable units) with zero inbound `imports`/`manifest-path` edges among
the files genome-spider scanned. 3 found, all in `gridatlas`:
`atlas/modules/202609011950-substation-lookup.js` (the estate's own known
case), plus two more genome-spider surfaced on its own:
`atlas/modules/202609012010-grid-scope.js` and
`atlas/modules/202609012230-map-click-network.js`. All three are committed,
none appear in any of gridatlas's ~80 `*-parts.json` composition manifests
(checked directly, not sampled).

**RE-DOING** — files whose name, once you strip the leading
`YYYYMMDDHHMM-` generation stamp, recurs in the same directory: literal
evidence of the same logical thing rebuilt more than once, read straight
off `git ls-files` (cheap — no content is read for this marker). 223
groups. The largest: `gridatlas/atlas/manifests/composition.json` rebuilt
57 times, `atlas/cartridges/sld-sandbox-v9-8.js` 47 times,
`atlas/cartridges/substation-intelligence-v9-63.js` 36 times.

**UNCOMPOSED** — this is the one that matters most, and the one built
directly against a real, documented gridatlas defect (a complete iOS fix
that sat in `atlas/parts/` and never reached the composed cartridge — fixed
in gridatlas commit `b7a40d1`, 2026-09-04, message: *"the iPhone arrival
that was written and never composed..."*). gridatlas's own `*-parts.json`
manifests record a `sha256` for every source file they assembled. For every
`module`/`part` file referenced by at least one manifest, genome-spider
checks whether the file's **current** content hash matches the hash
recorded by **any** manifest that ever referenced it — not just the most
recent one, because two manifest generations landing in the same commit
share a commit timestamp and "most recent" isn't well-defined by date
alone (this was a real bug during development — see the comment above the
UNCOMPOSED loop in `spider.mjs`). If no manifest, including the newest,
ever recorded the current hash, the file is flagged, with the manifest, the
recorded hash and the current hash all cited. No manifest with a sha256 at
all falls back to comparing real git commit dates instead.

Across three runs made minutes apart, this detector caught **3, then 4,
then 1** currently-live instances of this exact defect class in
`gridatlas` — not the same instances each time: `gridatlas` was being
actively edited by another process throughout (see "A live estate" above),
and the count moved as those edits landed. Files it caught at various
points: `atlas/modules/202609030048-pipeline-news-layers.js`,
`atlas/modules/202609031958-menu-bar.js`, and
`atlas/parts/202609041234-sld-sandbox-technology-buckets.js` — each checked
against gridatlas's genuinely latest manifest generation for its target
cartridge, not an earlier one. The frozen `data/genome.json` in this
directory reflects one specific run (`generated_at` inside it is
authoritative); `gridatlas-lineage.json` (below) narrows the same check to
just the current composition's cartridges and found one live instance at
freeze time, `pipeline-news-layers.js`.

## Sibling instrument: the estate survey

`spiders/tools/estate-survey.mjs` (landed on `origin/main` while this was
being built — not yet in this working tree; read via `git show
origin/main:...`, never merged or modified) is a different observer over
the same estate, and the two are not duplicates:

|  | estate-survey | genome-spider |
|---|---|---|
| reads | GitHub's remote API, four cloud shards | a local git checkout, no network |
| compares | live remote state vs. a checked-in registry (`control/20260904-estate-survey-registry.json`) | current file content vs. what a manifest recorded, and copies of code against each other |
| unit | a repository: does it still exist, is the branch head where the registry says, what workflows does it declare | a file inside a repository: is it imported anywhere, does it agree with its duplicates, does it match what built it |
| finds | head drift, archival, disablement, a repo gone missing, workflow inventory changes | dead code, uncomposed source, duplicated functions/constants, drifted constant values, files rebuilt repeatedly |
| scope | the 33 *public* `Ventusltd` repositories at capture time | 19 repositories present on this machine, public and private, including this one |
| record shape | one immutable registry, refreshed deliberately; per-shard receipts compared against it | an ever-growing, append-only receipt per command run |

Nothing estate-survey checks — remote branch heads, workflow inventories,
repository existence — is something genome-spider re-derives, and nothing
genome-spider checks — a function's actual body, whether a manifest's
recorded hash still matches a file, whether two constants agree — is
something estate-survey has the local checkout needed to see. The registry
format is deliberately **not** reused for genome-spider's receipts: 
`control/20260904-estate-survey-registry.json` is a fixed baseline meant to
change only when someone deliberately recaptures it (the survey fails loud
on any registry it didn't expect), while a genome-spider receipt is written
fresh on every run by design — folding one into the other would make
either the registry non-immutable or the receipts non-append-only. They
stay two records because they answer two different questions, the same way
`genome.json` and `gridatlas-lineage.json` stay two files above.

## What this deliberately does not claim

- **Screening-grade, not certification.** Per `spiders/README.md`'s
  operating law: this is a view, not an audit.
- **Regex/text detection, not an AST.** Function and constant extraction is
  brace-balanced but pattern-based; an unusual formatting style could evade
  it. Every hit still cites file+line so a human can check it in seconds.
- **A dead-code finding is "not found among files scanned", not "provably
  unreferenced".** genome-spider does not read every byte of every repo
  (see "Scan limits" below); a reference living in an unscanned file would
  be missed. `genome.proof.mjs` does not gate on this uncertainty — it's
  recorded in `dead_code[].reason` verbatim.
- **No semantic judgement.** DUPLICATION and DRIFT report that copies exist
  and whether they agree; they do not decide which copy is "right" — that
  judgement belongs to a human, or to a repo like `grid-distance-maths`
  that has already made and documented it.
- **No network, no GitHub API, no auth.** Every fact comes from a local
  `git` invocation against a checkout already on disk. CI checks out each
  repo first (see `genome.yml`); genome-spider itself never fetches or
  clones.
- **Intra-repo import edges only.** `imports`/`require` edges are resolved
  within a single repo's tracked files; cross-repo linkage is evidenced
  through `fetch`, pinned SHAs (`uses:`, JSON provenance objects) and
  manifest path strings instead, because that is how this estate actually
  links repos together — none of the repos walked import each other as
  packages.
- **RE-DOING's dates are filename-encoded, not git commit dates.** A
  group's `first_path`/`last_path` come from sorting the generation-stamped
  filenames; the field says so (`method`) rather than presenting a
  filename as if it were verified git history.
- **Not exhaustive across the whole estate.** `config/repos.json` lists 19
  repositories present on this machine on 2026-09-04. A repo added later,
  or one outside `Ventusltd`, is invisible until added to that list.

### Scan limits

Every file `git ls-files` tracks is used for RE-DOING (filename only, no
content read). Content is only read — for imports, JSON provenance,
functions and constants — from files under a curated set of directory/
filename conventions (`modules/`, `parts/`, `cartridges/`, `manifests/`,
`proofs/`, `test/`, `engine/`, `src/`, `sources/`, `data/`, `scripts/`,
`tools/`, `.github/workflows/`, plus `*.proof.mjs` and `index.html`
wherever they live) — see `lib/classify.mjs`. `releases/`, `dist/`,
`node_modules/`, `.claude-worktrees/` and similar archive/vendor
directories are excluded from content scanning outright (still counted for
RE-DOING). Where a directory holds many timestamped generations of the
same cartridge, only the lexicographically latest is content-scanned;
older generations are still counted for RE-DOING. Per-repo caps
(`--max-files-per-repo`, default 500; 24 MB total; 2 MB per file) exist so
one oversized repo can't stall a run — any repo that hits a cap is listed,
honestly, in `genome.json#scan_limits`, never silently truncated.

## gridatlas-lineage.json — a second, focused graph

The ventus-grid-engine receiver (live at
`https://ventusltd.github.io/ventus-grid-engine/`) is manifest-driven: it
reads `spider/manifest.json`'s `graphs[]` and, for any entry whose `id` is
`"engine-graph"` or `"genome-spider"`, fetches `entry.path` and normalises
it with its own `normaliseGenericGraph()` — see
`ventus-grid-engine/index.html:229-236` (reads `raw.nodes`/`raw.edges`, or
`raw.features` as a GeoJSON fallback; edges may reference nodes by `id`
string via `resolveRef()` at `index.html:228`, not only by array index).
`lineage.mjs` targets that contract directly: `data/gridatlas-lineage.json`
is a single file, `{nodes: [...], edges: [...]}`, id-referenced.

It is gridatlas-specific, not another view of the estate genome:

- **Nodes**: one per composition generation walked
  (`atlas/manifests/*-composition.json`), one per cartridge generation it
  names (`atlas/cartridges/`), one per part/module each cartridge is
  assembled from (from the matching `*-parts.json`).
- **Edges**, every one evidence-cited the same way as `genome.json`'s:
  - `supersedes` — composition → its `parent_generation`.
  - `composed_of` — composition → cartridge, evidenced by the
    `cartridges[].path` + `sha256` the composition itself records.
  - `assembled_from` — cartridge → part/module, evidenced by the matching
    parts manifest's `assembled_from[].path` + `sha256`.
  - `uncomposed` — part/module → cartridge, only for the *current*
    composition's cartridges: the part's current content hash doesn't
    match what that cartridge's parts manifest recorded. (Scoped to
    "current" on purpose — a stale hash on a superseded generation is
    expected, not a defect; see `lineage.mjs`'s `isCurrent` guard.)

**Scope, on purpose.** This does not enumerate gridatlas's 80+ historical
cartridge generations as first-class nodes. It walks the current
composition and its `parent_generation` ancestry, capped at 15 generations
by default (`--max-generations`) — the real total available is recorded
alongside the walked count (`compositions_available_on_disk` /
`generations_walked`) so a cap is visible, not silent. A cartridge id that
recurs across two walked generations is two distinct nodes, deliberately —
that recurrence *is* the lineage.

A real run (2026-09-04, mid-development — gridatlas was being actively
edited by another process while this ran, see "A live estate" below): 15 of
58 available composition generations walked, 74 nodes, 411 edges, 1 live
`uncomposed` edge (`atlas/modules/202609030048-pipeline-news-layers.js` →
the current `substation-intelligence` cartridge — its content has moved on
since that cartridge was last built).

```
node lineage.mjs                                # gridatlas, default 15 generations
node lineage.mjs --repo=gridatlas --max-generations=30
```

### Wiring it into the receiver (not done here — by design)

This task does not modify `ventus-grid-engine`. To make the receiver load
this graph, add the following entry to
`ventus-grid-engine/spider/manifest.json`'s `graphs[]` array by hand, and
copy (or symlink, or CI-publish) `data/gridatlas-lineage.json` to
`ventus-grid-engine/spider/data/gridatlas-lineage.json`:

```json
{
  "id": "gridatlas-lineage",
  "title": "GridAtlas cartridge lineage",
  "path": "./spider/data/gridatlas-lineage.json",
  "edges_path": null,
  "source_spider": "spiders/species/genome-spider (lineage.mjs)",
  "description": "GridAtlas's current composition and its ancestry: which cartridges it composed, which parts/modules built each cartridge, and any part whose content has moved on since that cartridge was last built."
}
```

One thing whoever wires this in should know: `wireReceiver()` currently
only auto-loads manifest entries whose `id` is exactly `"engine-graph"` or
`"genome-spider"` (`index.html:244`) — an id of `"gridatlas-lineage"` won't
be picked up without also widening that filter, which is a
`ventus-grid-engine` change and out of this task's scope. The entry above
is still correct and ready to use either way; it's a one-line filter change
away from loading automatically, or it can be reached today via `?graph=`
if `wireReceiver()`'s `SCOPES` registration is adjusted to key on it.

## Write scope

genome-spider only ever writes inside
`spiders/species/genome-spider/` (its own `data/` and `receipts/`
directories). It never modifies a file in any other repository, and the
script that walks 19 checkouts only ever opens them for reading.

## genome.proof.mjs

```
node genome.proof.mjs [path/to/genome.json]      # default: ./data/genome.json
```

Eighteen checks, each a plain-English sentence, all accumulated (nothing
short-circuits), exit non-zero on any failure. The two the task specifically
required:

- *"every edge cites the file and pattern that detected it"* — fails if any
  edge lacks `evidence.file`/`evidence.pattern`.
- *"every non-external node carries a real last commit (sha + date)"* —
  fails if any repo/unit node has no git history.

Plus structural checks (no dangling edges, no duplicate ids, every unit
names a real repo, every marker is internally consistent) and three
**informational** ground-truth checks — whether `substation-lookup.js` was
flagged dead, whether the earth-radius drift was found, whether
`ventus-grid-engine` appears — printed but not gating, because a fixed
defect correctly disappearing from a later run is success, not proof
breakage.

## Commands and receipts

`spiders/.github/workflows/genome.yml` exposes genome-spider on the same
command surface the GridAtlas menu bar issues verbs from
(`atlas/modules/202609031958-menu-bar.js`; the menu is not wired to this
workflow yet — that's a separate, future change, and this task did not
touch gridatlas):

| command | what it does | implemented |
|---|---|---|
| `crawl` | walk the estate, emit the genome, commit it if it materially changed | yes |
| `verify` | run `genome.proof.mjs` against the genome already committed here; commits nothing but a receipt | yes |
| `populate` | reserved for a future step | no — writes a `not-implemented` receipt and fails the run on purpose |
| `compose` | reserved for a future step | no — same as `populate` |

**Triggering a command by hand** (needs write access to `Ventusltd/spiders`):
open

```
https://github.com/Ventusltd/spiders/actions/workflows/genome.yml
```

and use "Run workflow", choosing `command` from the dropdown. The same run
can be started with the GitHub CLI:

```
gh workflow run genome.yml -R Ventusltd/spiders -f command=crawl
gh workflow run genome.yml -R Ventusltd/spiders -f command=verify
```

There is no token-bearing link a static page can hold (GitHub Pages can't
keep a secret), so a future menu wiring has two real options: a **prefilled
workflow_dispatch call** through the user's own GitHub auth (the `gh`
commands above, or the Actions "Run workflow" form at the URL above), or
opening a **new issue** that a separate, already-authorised workflow turns
into a `workflow_dispatch` call. Either way the trigger is GitHub's own
auth, never a secret embedded in the page.

`schedule` (`cron: '17 3 * * *'`, daily) and `push` (on changes under
`species/genome-spider/**`) both always resolve to `crawl` — only a manual
`workflow_dispatch` can choose `verify`, `populate` or `compose`.

**Receipts.** Every run — whichever command, whatever the outcome — writes
one append-only, timestamped receipt to
`species/genome-spider/receipts/<generation>-<command>.json` (generation is
a 12-digit `YYYYMMDDHHMM`, read from the system clock in UTC at the moment
the receipt is written — never typed, never taken from a filename, per
`cvaa/vaccines/202608301701-monotonic-utc-generations.md`), and overwrites
the pointer at `species/genome-spider/receipts/LATEST.json` with the same
content. An ABOUT menu (or a human) always has one stable URL to read:

```
https://github.com/Ventusltd/spiders/blob/main/species/genome-spider/receipts/LATEST.json
```

and, for the permanent audit trail, every prior run at
`.../receipts/<generation>-<command>.json`. A receipt carries: `command`,
`status` (`ok`/`failed`/`not-implemented`), `generation_utc`, `git_sha` (the
`spiders` commit the run checked out), `counts` (nodes/edges/marker totals
read from that run's `genome.json`), `proof` (exit code, pass/fail,
summary line), and `receipt_url`/`latest_url`. Schema:
`genome-spider.receipt.v1`, built by `make-receipt.mjs`.

**Why genome.json's timestamp is excluded from the change check.**
`genome.json#generated_at` is set fresh on every run, so a byte-for-byte
diff of the data files would show a change on every single run even when
nothing about the estate moved. The commit step in `genome.yml` stages the
data files, then checks whether the diff contains anything other than a
`"generated_at"` line; if not, it unstages them so only the (always-new)
receipt gets committed. This is the exit-0-when-nothing-pending path
`cvaa/vaccines/202608301325-self-terminating-loops.md` requires of a
scheduled job.

## Vaccines this satisfies

Read directly from `Ventusltd/cvaa/vaccines/`, cited by generation in
`genome.yml`'s header comment and re-checked there each time the workflow
is edited:

- `202608301442-pinned-actions.md` — every `uses:` is a 40-character commit
  SHA.
- `202608301443-least-permissions.md` — explicit `permissions: contents:
  write` (nothing broader), `timeout-minutes: 30`, and `workflow_dispatch`
  present alongside `schedule:`.
- `202608301323-no-per-release-workflows.md` — one workflow file; commands
  are an input, not a new file per run.
- `202608301325-self-terminating-loops.md` — the scheduled path's commit
  step has an explicit nothing-to-commit exit-0 branch.

## Files

```
spider.mjs              the walk: repos -> nodes, edges, markers -> data/*.json
lineage.mjs              gridatlas's composition/cartridge/part lineage -> data/gridatlas-lineage.json
genome.proof.mjs         the check: plain-English sentences, exit non-zero on failure
make-receipt.mjs         one append-only receipt per CI run
config/repos.json         the 19 repos walked by default, and the estate owner
lib/git.mjs              git plumbing (log, ls-files, per-file history) — no network
lib/classify.mjs          path -> node kind, logical-name grouping, scan-scope rules
lib/edges.mjs             import/require, fetch, pinned-action, JSON-provenance detectors
lib/markers.mjs           function/constant extraction, the earth-radius drift family
lib/schema.mjs            genome nodes/edges -> Spider-Sandbox-shaped nodes.json/edges.json
data/                     a real run's output (genome.json, nodes.json, edges.json, manifest.json, gridatlas-lineage.json)
receipts/                 CI receipts (empty until genome.yml runs; LATEST.json is the pointer)
```
