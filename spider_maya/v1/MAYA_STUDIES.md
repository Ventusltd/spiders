# Wiring `spider_maya`: An Engineering Blueprint for a Versioned Graph‑Scanner over the Ventus / GlobalGrid2050 Estate

## TL;DR

- **Build the pipeline as three decoupled stages that never touch the loved page:** (1) a Python scanner that ingests the declared homepage `AREAS` menu first, then the git tree and live‑URL probes, and reconciles them into a heavy Parquet catalogue; (2) DuckDB distillation that emits tiny, deterministic `nodes.json`/`edges.json` + GeoJSON; (3) new `spider_maya/vN` copies of the Spider that read that richer data. The byte‑stable `spider_full_po_test.html` is only ever *cloned*, never edited.
- **Model the estate as a labelled property graph** (repos, apps/surfaces, files, datasets, external sources, workflows as nodes; `contains`, `serves`, `declares_launch_surface`, `depends_on`, `references_source`, `data_feed`, `child_scope` as edges), borrowing Backstage’s provider→processor→stitcher pattern, its declared‑vs‑derived (`spec` vs emitted relations) discipline, and its orphan‑handling. Cartridges are committed child‑scope subgraphs the renderer drills into.
- **For rendering, keep the renderer “dumb” and data‑driven and pick the engine per version:** stay with hand‑rolled SVG (as the loved app does) for tens of nodes; adopt Cytoscape.js (canvas, built‑in `concentric`/`breadthfirst`/`dagre` layouts) for hundreds to a few thousand; reserve Sigma.js + graphology (WebGL) for many‑thousand‑node views. Compute layouts deterministically **offline** where reproducibility matters (dagre/ELK), ship coordinates in the data, and the same node/edge schema later expresses substation single‑line‑diagram *topology* — connectivity only, **no load‑flow math**.

## Key Findings

1. **Backstage’s architecture is the single most transferable blueprint.** Its catalog runs a fixed loop — *entity providers* emit unprocessed entities from external systems, *processors* mutate them and emit relations/errors, and a *stitcher* assembles the final entity from the processed body plus all relations pointing at it (incoming and outgoing), keyed by a content hash so an entity is only re‑stitched when its hash changes. Crucially, Backstage distinguishes **declared** data (fields a human writes in `catalog-info.yaml`, e.g. `spec.owner`) from **derived** relations that processors *emit* by analysing the entity and its surroundings; where relations are produced they are treated as the authoritative, machine‑generated layer sitting *beside* the human declaration, not overwriting it. This maps exactly onto your declared‑vs‑derived doctrine.
1. **A labelled property graph (LPG), not RDF, is the right model here.** In an LPG both nodes and edges are first‑class objects that carry their own properties (so you can stamp `provenance`, `methodState`, `schemaVersion` directly on an edge); RDF forces everything into atomic subject‑predicate‑object triples and is “an order of magnitude bigger” for the same information, needing RDF‑star or reification workarounds just to attach a property to a relationship.  Use W3C **PROV‑O**‘s vocabulary (Entity / Activity / Agent, and `wasGeneratedBy`, `wasDerivedFrom`, `wasAttributedTo`) as your *provenance semantics* stamped onto LPG properties — you get PROV’s rigour without RDF’s overhead.
1. **The renderer should never compute what can be precomputed.** The loved Spider already reads a graph of nodes+edges plus cartridges and renders radial/column/spider views in self‑contained SVG. Keep that contract. For growing node counts the honest tradeoff is: **SVG** (DOM‑per‑element, easiest to style with the existing CSS skin, degrades past ~1,000–2,000 elements), **Canvas** (Cytoscape.js, vis‑network — smooth to a few thousand), **WebGL** (Sigma.js/graphology — tens of thousands). Because Sigma/WebGL “focuses on rendering and requires separate layout computation,”  and dagre/ELK are deterministic layout engines, the clean split is: **compute layout offline in Python/Node, ship `x`/`y` in the data, let the browser just draw.**
1. **DuckDB + Hive‑partitioned Parquet gives you a queryable heavy catalogue and tiny renderer inputs.** Partition by run date, node type, and repo; DuckDB pushes partition filters down into the directory structure and only reads matching files. Distillation queries (`COPY (SELECT …) TO … (FORMAT parquet)`, or `TO 'file.json'` for the renderer payloads) collapse the catalogue into compact `nodes.json`/`edges.json`. **Determinism is not automatic:** DuckDB documents that set semantics and multi‑threading reorder results; the documented workaround is `SET threads = 1` combined with an explicit `ORDER BY` — though note that per DuckDB’s Order Preservation docs even `ORDER BY` “may not use a stable algorithm” and `GROUP BY` guarantees neither input nor output order (the multi‑thread `COPY` ordering issue is tracked in duckdb/duckdb issue #14349). Bitwise‑identical Parquet is *not* a documented guarantee — so hash the *logical content* with an order‑insensitive checksum (`bit_xor(md5_number(COLUMNS(*)::VARCHAR))`) rather than the file bytes.
1. **Cartridges = committed child‑scope subgraphs; the note‑drop is a path‑filtered Actions trigger.** A cartridge is a small JSON manifest + nodes + edges with `provenance=declared` (human) or `derived` (scanner). GitHub Actions `on: push` with a `paths:` filter on a watched `notes/` folder is the “adrenaline shot”: dropping a text note triggers re‑scan → re‑emit → re‑render, all within least‑privilege, SHA‑pinned workflows writing only to `derived/`.
1. **The same wiring generalises to substation single‑line topology — as connectivity, not physics.** An SLD’s nodes are “electrically distinct” points (busbars/buses),  with feeders, transformers and breakers as further nodes and conductors as edges. That is precisely an LPG. Reusing the identical node/edge schema and renderer, a future `spider_maya` version can draw busbar/feeder/transformer/breaker connectivity with the same layout engines — **explicitly stopping at topology; no power‑flow/load‑flow computation is in scope.**

## Details

### 0. Ground rules (non‑negotiable invariants)

- **The loved page is immutable.** `dashboard/sandbox/spider_full_po_test.html` is a build artefact of record. Never edit it. Verify byte‑stability in CI by storing its SHA‑256 and failing any run that changes it.
- **All evolution is additive** under `spider_maya/vN/`. A new capability = a new version folder + richer data, never a diff to the loved app.
- **Declared never silently becomes derived and vice‑versa.** Every node/edge row carries an explicit `provenance` field. Promotion from `derived` → `declared` requires a human commit (a cartridge or a menu edit), mirroring Backstage’s rule that emitted relations are authoritative *as machine output* but do not rewrite the human `spec`.

### 1. Cataloguing the estate into a graph

#### 1.1 The graph schema (LPG)

Node kinds and the minimal property envelope every node/edge shares:

```jsonc
// node
{
  "id": "app:solar-bess-topology-v7/gis-sld-financial-sandbox",   // stable, deterministic key
  "kind": "app",              // repo | app | surface | file | dataset | external_source | workflow
  "type": "dashboard",        // sub-type (website, sld, parquet_dataset, actions_workflow, …)
  "label": "GIS SLD Financial Sandbox",
  "attrs": { "liveUrl": "https://ventusltd.github.io/…/index.html", "devStatus": "beta" },
  // ---- governance envelope (every row) ----
  "provenance": "declared",   // declared | derived
  "methodState": "menu_v3",   // which method/rule produced this
  "schemaVersion": "spider-graph/1.2.0",
  "source": "AREAS menu",     // named human/committed source, or scanner rule id
  "firstSeenRun": "2026-07-04T…", "lastSeenRun": "2026-07-04T…"
}
```

```jsonc
// edge
{
  "id": "e:contains:repo:globalgrid2050->app:uk_renewables_pipeline",
  "source": "repo:globalgrid2050",
  "target": "app:uk_renewables_pipeline",
  "rel": "contains",          // contains | serves | declares_launch_surface |
                              // depends_on | references_source | data_feed | child_scope
  "provenance": "derived",
  "methodState": "git_tree_scan",
  "schemaVersion": "spider-graph/1.2.0"
}
```

Edge semantics, aligned to Backstage’s well‑known relations (which are directional pairs — `dependsOn`/`dependencyOf`, `hasPart`/`partOf`):

- `contains` — repo→app→file hierarchy (Backstage `hasPart`/`partOf`).
- `serves` — a surface/file is served at a live GitHub Pages URL.
- `declares_launch_surface` — the `AREAS` menu names this app’s entry path (declared).
- `depends_on` — build/data dependency (Backstage `dependsOn`; can be sourced from the GitHub dependency‑graph SBOM).
- `references_source` — code/app references an external source (e.g. Elexon BMRS).
- `data_feed` — a dataset feeds an app/surface.
- `child_scope` — a parent node drills into a committed cartridge subgraph.

#### 1.2 Ingestion order — declared‑menu‑first, exactly like Backstage providers

Run providers in a fixed order and let later stages *enrich, never overwrite*:

1. **Declared provider — the `AREAS` menu.** Parse the hand‑authored homepage JS menu (11 declared apps with entry paths, groups, dev‑status). Every node/edge from here is `provenance=declared`, `source="AREAS menu"`. This is your ground truth, analogous to `catalog-info.yaml` static locations.
1. **Declared provider — cartridges.** Load any committed child‑scope cartridges (`provenance=declared` for human‑authored ones).
1. **Derived provider — git‑tree inventory.** Call the GitHub REST **Git Trees API** with `?recursive=1` per repo. Per GitHub’s REST docs, “the limit for the tree array is 100,000 entries with a maximum size of 7 MB when using the recursive parameter”; and “if `truncated` is true… use the non‑recursive method of fetching trees, and fetch one sub‑tree at a time.” This enumerates every file/folder cheaply in one request per repo without cloning. Emit `file` nodes and `contains` edges as `provenance=derived`.
1. **Derived provider — dependency graph / SBOM.** For `depends_on`, optionally pull each repo’s SPDX SBOM from the REST endpoint `GET /repos/{owner}/{repo}/dependency-graph/sbom`. Per GitHub’s REST docs, “the response is a 302 redirect to a temporary download URL for the SBOM in SPDX JSON format. The generated SBOM report may be retained for up to one week from the original request.” The SBOM is SPDX‑2.3 with `relationships[].relationshipType: "DEPENDS_ON"`. Alternatively parse the git‑native manifest files directly.
1. **Derived provider — live URL probing.** For declared entry paths and any `index.html` discovered in the tree, issue a conditional `HEAD`/`GET` to the live `ventusltd.github.io` URL, record status → `serves` edge + a status lamp value. Distinguish “live” vs “snapshot” honestly (feeds the existing source tag).
1. **Reconciliation / stitching.** Merge on stable `id`. Apply the golden rule: if a node is declared *and* derived, keep `provenance=declared` but attach a derived corroboration flag; if derived‑only, it stays derived. Compute a per‑entity content hash (Backstage‑style) so unchanged entities are stable across runs. Handle **orphans** as Backstage does: a derived node no longer reachable from any declared/committed root is marked `orphan=true` rather than deleted, so history is auditable.

Backstage’s hard‑won lesson applies directly: **sort everything before hashing.** Their stitching “spikes” were caused by processors emitting relations in nondeterministic order, changing the hash even when content was identical; the fix (released in Backstage 1.42.0) was to stop caring about array order (sort relations, tags, parents). Sort your node/edge arrays and property keys before hashing and before emission.

#### 1.3 Why LPG + PROV‑O, and what to borrow from CodeQL/Sourcegraph/SBOM

- **LPG** because edges must carry provenance properties; RDF would need reification/RDF‑star and inflates size ~10×.
- **PROV‑O** for the *meaning* of provenance: model each scan run as a `prov:Activity`, the scanner as a `prov:Agent`, each emitted `nodes.json` as a `prov:Entity` that `wasGeneratedBy` the run and `wasDerivedFrom` the catalogue; stamp `wasAttributedTo` on declared data. You are not adopting RDF — you are adopting its vocabulary as string‑valued LPG properties.
- **GitHub dependency graph / SBOM** is your model for machine‑discovered `depends_on` edges (SPDX relationships).
- **CodeQL / Sourcegraph** show the ceiling (whole‑program code graphs); you don’t need that depth — file‑level `contains` + declared launch surfaces is the right resolution for a federation‑of‑apps map.

### 2. The Spider’s diagram abilities (functional, without touching the loved app)

#### 2.1 Keep the renderer dumb and data‑driven

The loved page’s virtue is that it is self‑contained and reads a graph + cartridges. Preserve that contract as a hard interface:

```
data/spider-graph/<version>/nodes.json    // renderer-schema nodes (may include precomputed x,y)
data/spider-graph/<version>/edges.json
data/spider-graph/<version>/*.geojson      // spatial nodes as RFC 7946 FeatureCollections
data/spider-graph/<version>/cartridges/*.json
```

New capability = **new data fields + a new `spider_maya/vN` renderer**, never a change to the loved page’s logic. A version may reuse the loved page’s exact CSS/skin (copy the stylesheet verbatim) while swapping only the graph engine underneath.

#### 2.2 Library tradeoffs (honest, for a static GitHub Pages page)

|Engine                       |Renderer       |Layout                                                                                               |Sweet spot                      |Fit for `spider_maya`                                                                                                     |
|-----------------------------|---------------|-----------------------------------------------------------------------------------------------------|--------------------------------|--------------------------------------------------------------------------------------------------------------------------|
|**Hand‑rolled SVG** (current)|SVG/DOM        |manual radial/columns                                                                                |≤ ~1–2k elements                |**v1** — matches existing skin, zero deps, drag‑pan already works                                                         |
|**Cytoscape.js**             |Canvas         |built‑in `concentric`, `breadthfirst`, `circle`, `grid`, `cose` (force); `dagre`/`elk` via extensions|hundreds–few thousand           |**v2/v3** — purpose‑built graph lib, compound nodes, rich interaction; single UMD file loads via `<script>`               |
|**d3 / d3‑force**            |SVG or Canvas  |force‑directed, `d3-hierarchy`                                                                       |flexible, bespoke               |when you need custom visuals; steeper curve, “roll up your sleeves”                                                       |
|**dagre / dagre‑d3**         |(layout only)  |layered/hierarchical DAG                                                                             |dependency trees                |**layout engine of choice for `depends_on` DAGs**; deterministic, “drop‑in”                                               |
|**elkjs**                    |(layout only)  |layered, `force`, `radial`, orthogonal routing                                                       |complex/large, port routing     |most configurable, but async and complex — “we don’t often recommend it… keep the Java API reference handy”               |
|**Sigma.js + graphology**    |WebGL          |none built‑in (use graphology layouts / precomputed)                                                 |tens of thousands               |reserve for the full‑estate view; note WebGL has **no edge transparency** (fake it with thin edges) and drops old browsers|
|**vis‑network**              |Canvas         |built‑in physics + clustering                                                                        |up to a few thousand, clustering|easy but “an order of magnitude slower”; good for quick clustered views                                                   |
|**mermaid**                  |SVG (via dagre)|text‑defined flow/graph                                                                              |docs‑style static diagrams      |great for committed, human‑authored diagrams in `docs/`, loadable from CDN as an ESM module                               |

**Recommendation:** `spider_maya/v1` = the loved SVG engine on richer data (proves the pipeline). `v2` = Cytoscape.js for the property‑graph views (radial via `concentric` centred on a focus node = the “focus + context” you already have; `breadthfirst`/`dagre` for dependency DAGs). Keep WebGL (Sigma) in reserve behind a documented threshold.

#### 2.3 Handling growth: LoD, clustering, semantic zoom, edge bundling

- **Level‑of‑detail / semantic zoom:** render labels and card detail only above a zoom threshold; collapse clusters into compound nodes when zoomed out (Cytoscape compound nodes; graphology clustering).
- **Clustering:** group by repo or by declared group; expand on drill‑in (which is exactly the cartridge child‑scope mechanism).
- **Edge bundling** for dense graphs (force‑directed or hierarchical edge bundling; Cytoscape can bundle edges). Use sparingly — it trades precision for legibility.
- **Deterministic layout for reproducibility:** dagre and ELK produce the same coordinates for the same input; compute them **offline** and write `x`/`y` into `nodes.json` so the published diagram is reproducible and diff‑able, and the browser does no layout work. Force‑directed layouts are non‑deterministic unless seeded — prefer precomputed coordinates for anything you want to reproduce.
- **Drag‑pan/zoom, arrowheads, markers, legends:** already present in the loved app’s spider mode; Cytoscape provides pan/zoom/`fit`, `target-arrow-shape`, and styling out of the box.

### 3. Versioning & non‑destruction

#### 3.1 Folder shape of a version (self‑contained, additive)

```
spider_maya/
  v1/
    viewer/spider_maya_v1.html      # clone of loved skin, new engine
    viewer/skin.css                 # byte-copy of the loved CSS
    scripts/scan.py  build.py  validate.py  scaffold.py
    data/  catalogue/ (parquet, hive-partitioned)  derived/ (nodes.json, edges.json, *.geojson)
    cartridges/
    docs/  README.md  METHOD.md  CHANGELOG.md
    audit/  <run-id>.md  <run-id>.json
    recovery/  2026-07-04-known-good/   # dated snapshot of last-good outputs
  v2/ …
```

#### 3.2 The scaffolder (`scaffold.py`)

Generates `v(N+1)` by deep‑copying the *last known‑good* `vN` (viewer, scripts, docs, cartridge templates, an empty partitioned `catalogue/` and `derived/`, a fresh `recovery/` snapshot), bumping `schemaVersion`, and writing a CHANGELOG stub. It never reads or writes the loved page. Pseudocode:

```python
def scaffold(prev="v1", nxt="v2"):
    assert loved_page_sha_unchanged()             # refuse if the loved app moved
    copytree(f"spider_maya/{prev}", f"spider_maya/{nxt}", ignore=IGN_HEAVY)
    snapshot(f"spider_maya/{nxt}/recovery/{today}-known-good", src=f"spider_maya/{prev}/derived")
    bump_schema_version(f"spider_maya/{nxt}")
    write_changelog_stub(nxt)
```

#### 3.3 The validator (`validate.py`) — CI gate

Fails the build unless all hold:

1. **Schema conformance** — every node/edge validates against the JSON Schema for `schemaVersion`.
1. **Provenance present & legal** — every row has `provenance ∈ {declared, derived}`; no derived row carries a declared‑only field; no `derived` node is reachable as a declared launch surface without a committing source (no derived‑masquerading‑as‑declared).
1. **Determinism** — re‑running distillation yields the same logical content hash (`bit_xor(md5_number(COLUMNS(*)::VARCHAR))`) for `nodes.json`/`edges.json`.
1. **GeoJSON validity** — spatial outputs are RFC 7946 (`FeatureCollection` of `Feature`s; geometry ∈ the seven types Point/MultiPoint/LineString/MultiLineString/Polygon/MultiPolygon/GeometryCollection; lon,lat order; no CRS member — RFC 7946 fixes WGS‑84).
1. **Loved‑page byte‑stability** — SHA‑256 of `spider_full_po_test.html` equals the recorded value.

#### 3.4 Safe‑evolution pattern

Reuse the loved visual language by *copying* the CSS and DOM shell into the new viewer and swapping only the `<script>` graph engine and the data URL it reads. Because the skin is identical and only the engine differs, a reviewer can diff `vN` vs `v(N+1)` and see exactly what changed — and the loved app is provably untouched.

### 4. Parquet / DuckDB wiring

#### 4.1 Partitioning the heavy catalogue

Hive‑style directories so DuckDB prunes reads:

```
catalogue/
  run_date=2026-07-04/
    node_type=app/    data_0.parquet
    node_type=file/   data_0.parquet
    …
  run_date=2026-07-03/ …
```

Write with:

```sql
COPY (SELECT * FROM nodes ORDER BY id)
TO 'catalogue' (FORMAT parquet, PARTITION_BY (run_date, node_type),
                OVERWRITE_OR_IGNORE, FILENAME_PATTERN 'nodes_{i}');
```

Partition by `run_date` (time travel / audit), `node_type` (most queries filter by kind), and optionally a third level by `repo`. DuckDB auto‑detects the `key=value` folder pattern  and pushes `WHERE run_date=… AND node_type='app'` down to skip non‑matching files. Note `PARTITION_BY` cannot use expressions  — derive `run_date`/`node_type` as columns in the SELECT first.

#### 4.2 Distilling to compact renderer inputs

```sql
-- latest run only, deterministic order, minimal columns
COPY (
  SELECT id, kind, type, label, attrs, provenance, methodState, schemaVersion
  FROM read_parquet('catalogue/run_date=*/node_type=*/*.parquet', hive_partitioning=true)
  WHERE run_date = (SELECT max(run_date) FROM …)
  ORDER BY id
) TO 'derived/nodes.json' (FORMAT json, ARRAY true);
```

Keep the renderer payload small (only display‑relevant columns); keep the full catalogue queryable in place.

#### 4.3 Determinism, hashing, audit

- **Determinism:** DuckDB’s Non‑Deterministic Behavior docs state that under set semantics and multi‑threading, result order is not guaranteed, and give two workarounds — “1. Limit the number of threads… `SET threads = 1;`” and “2. Enforce ordering… `ORDER BY ALL`.” Apply both to every emission query. Be aware, per DuckDB’s Order Preservation docs, that even `ORDER BY` “may not use a stable algorithm” and `GROUP BY` guarantees “neither in‑ nor output order,” and `preserve_insertion_order` (true by default) does *not* survive GROUP BY/JOIN — so don’t rely on it alone; the multi‑thread `COPY` ordering behaviour is tracked in duckdb/duckdb issue #14349.
- **Bitwise Parquet is not guaranteed** by DuckDB docs — do not assert byte‑identical files. Instead verify **logical** reproducibility with an order‑insensitive content checksum: `SELECT bit_xor(md5_number(COLUMNS(*)::VARCHAR)) FROM nodes;` (per the DuckDB “Tricks Part 2” blog; `bit_xor` is order‑insensitive so row shuffles don’t change the checksum). Additionally SHA‑256 the *emitted JSON artefacts* (which you sort deterministically) for the audit trail.
- **Audit report per run:** a small Markdown + JSON pair in `audit/` recording run id, timestamp, counts by kind, declared‑vs‑derived tallies, orphan count, content checksums, and the SHA‑256 of each emitted file — your PROV‑O `Activity` record.

### 5. Cartridges & child‑scope drill‑in

#### 5.1 Cartridge schema

```jsonc
{
  "manifest": {
    "cartridgeId": "cart:solar-bess-topology-v7",
    "parentNode": "app:solar-bess-topology-v7/gis-sld-financial-sandbox",
    "rel": "child_scope",
    "provenance": "declared",          // declared = human-authored; derived = scanner-authored
    "schemaVersion": "spider-graph/1.2.0",
    "title": "Solar+BESS topology detail"
  },
  "nodes": [ /* renderer-schema nodes, same envelope as §1.1 */ ],
  "edges": [ /* renderer-schema edges */ ]
}
```

The renderer already supports drilling from a parent node into a committed child‑scope cartridge; the scanner simply needs to (a) emit `child_scope` edges from parents to cartridge ids and (b) commit the cartridge JSON where the renderer expects it. Human cartridges are `declared`; scanner‑generated ones are `derived` and clearly badged so they never masquerade as hand‑authored.

#### 5.2 The note‑drop “adrenaline shot”

A watched folder + a path‑filtered workflow:

```yaml
name: spider_maya-rescan
on:
  workflow_dispatch:            # phase 1: manual only
  push:
    paths:
      - 'spider_maya/**/notes/**'   # drop a text note here → trigger
  # schedule: [ { cron: '17 3 * * *' } ]   # phase 2: enable cron once trusted
permissions:
  contents: write               # least privilege; only writes derived/
jobs:
  rescan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@<full-40-char-SHA>          # SHA-pinned
      - uses: actions/setup-python@<full-40-char-SHA>
      - run: python spider_maya/v1/scripts/scan.py
      - run: python spider_maya/v1/scripts/build.py        # DuckDB distill → derived/
      - run: python spider_maya/v1/scripts/validate.py     # CI gate incl. loved-page SHA
      - run: |
          git add spider_maya/*/derived spider_maya/*/audit
          git commit -m "chore: rescan [skip ci]" && git push
```

Security posture (all from GitHub’s own guidance):

- **`workflow_dispatch` first, then `schedule`** once trusted; both run on the default branch with write access, so keep them non‑editable by untrusted PRs.
- **Least‑privilege `GITHUB_TOKEN`:** set the minimum `permissions:` block (grant `contents: write` only on the job that commits). Per GitHub’s Feb 2, 2023 changelog (“Updating the default GITHUB_TOKEN permissions to read‑only”), new repositories now default to a read‑only token — “we would like to change the default going forward to a read‑only token… This change will not impact any existing enterprises, organizations or repositories” — so repos created before that date still default to read/write and you must flip the toggle.
- **SHA‑pin every third‑party action** to a full 40‑char commit SHA, not a tag. Per the Wiz analysis of CVE‑2025‑30066: “A supply chain attack compromised the tj‑actions/changed‑files GitHub Action, impacting over 23,000 repositories. Attackers retroactively modified multiple version tags to reference a malicious commit, exposing CI/CD secrets in workflow logs.” (The malicious commit was `0e58ed8671d6b60d0890c21b07f8835ace038e67`; the compromise ran roughly 12–15 March 2025; CVSS 8.6.) Prefer GitHub‑authored actions; use Dependabot to bump pinned SHAs.
- **PAT only inside Actions**, never in client code; writes confined to `derived/` (and `audit/`).

### 6. Forward path: catalogue → substation topology diagrams (topology only, NO load flow)

The whole point of the LPG + dumb‑renderer design is that “what is a node” and “what is an edge” are just data. A single‑line diagram is, formally, a connectivity graph: its lines connect nodes that are “electrically distinct” points — for large systems, physical **busbars/buses**  — with **feeders, transformers and breakers** as further nodes and conductors as edges. That is the same structure as your software‑estate graph.

To generalise, add node `type`s (`busbar`, `feeder`, `transformer`, `breaker`, `incomer`) and edge `rel`s (`connects_to`, `feeds`) to the schema, author them as **declared** cartridges (a substation is a committed child scope), and render with the same engine — a hierarchical/orthogonal layout (dagre/ELK orthogonal routing, or ELK `layered`) reproduces the top‑down “source at top, feeders below” convention of an SLD. Mature open tools confirm the pattern is sound: PowSyBl’s diagram library generates SVG single‑line and network diagrams from node/breaker and bus/breaker topology with fully automatic or semi‑automatic layout  — i.e. topology in, SVG out, no simulation required.

**Explicit scope boundary:** this is *connectivity rendering only*. No power‑flow/load‑flow equations, no impedance/fault/arc‑flash computation, no bus voltage solving. Those belong to tools like ETAP/PowSyBl’s *analysis* layers and are **out of scope**. `spider_maya` draws the wiring diagram; it does not energise it.

## Recommendations

**Stage 0 — Prove the pipeline without risk (week 1).**

1. Record the SHA‑256 of the loved page; add a CI check that fails on any change. This is the safety interlock for everything else.
1. Write `scan.py` that ingests *only* the declared `AREAS` menu → emit `nodes.json`/`edges.json` in the loved renderer’s exact schema.
1. Scaffold `spider_maya/v1/viewer` as a byte‑copy of the loved skin pointing at the new data. **Benchmark to advance:** `v1` renders the 11 declared apps identically to the loved app’s look. If it doesn’t visually match, fix the data mapping before adding any derived data.

**Stage 1 — Add derived discovery + governance (weeks 2–3).**
4. Add the git‑tree provider (`?recursive=1`) and live‑URL prober; stamp everything `derived`. Add reconciliation + orphan flagging + content hashing (sort before hashing).
5. Stand up the DuckDB catalogue (Hive‑partitioned by `run_date`/`node_type`) and the distillation queries with `SET threads=1` + `ORDER BY`. Add the `bit_xor(md5_number(...))` determinism check and per‑run audit reports. **Benchmark:** two consecutive runs on unchanged inputs produce identical content checksums and identical sorted JSON.

**Stage 2 — Better diagrams as `v2` (weeks 4–6).**
6. Build `spider_maya/v2/viewer` on **Cytoscape.js**: `concentric` layout for the focus+context radial view, `breadthfirst`/`dagre` for `depends_on` DAGs. Compute layout **offline** and ship `x`/`y` for reproducibility. Keep the loved CSS skin.
7. Wire the note‑drop workflow: `workflow_dispatch` first, least‑privilege token, SHA‑pinned actions, writes only to `derived/`. **Benchmark to enable cron:** ten manual dispatches run clean, validator green, loved‑page SHA unchanged — then turn on `schedule:`.

**Stage 3 — Scale & generalise (as needed).**
8. Only if a single view exceeds ~2,000 visible elements, introduce a Sigma.js/graphology WebGL version (`v3`) behind that documented threshold; otherwise stay on canvas.
9. When physical topology is wanted, add the `busbar`/`feeder`/`transformer`/`breaker` node types and author substations as **declared cartridges**; render with orthogonal/layered layout. Hold the line on *topology only — no load flow*.

**Thresholds that change the plan:**

- Node count per view < 300 → keep SVG; 300–3,000 → Cytoscape canvas; > 3,000 → Sigma WebGL.
- If determinism checks ever diverge → force `threads=1`, add/verify `ORDER BY`, and sort arrays/keys before emission.
- If the loved‑page SHA check ever fails → stop the pipeline; something violated the prime invariant.

## Caveats

- **DuckDB determinism is logical, not bitwise.** DuckDB’s docs explicitly cover only set‑semantics reordering, `array_distinct` cross‑platform ordering, and floating‑point multithreaded aggregates;  they make **no promise** of byte‑identical Parquet, and even `ORDER BY` “may not use a stable algorithm.” Treat any “reproducible Parquet bytes” claim as unverified and rely on sorted JSON + order‑insensitive content checksums instead.
- **Layout determinism depends on the engine.** dagre/ELK are deterministic; force‑directed layouts (d3‑force, Cytoscape `cose`, graphology FA2) are not unless seeded. Precompute and ship coordinates for anything you need to reproduce or diff.
- **WebGL constraints:** Sigma/graphology has no native edge transparency  and drops legacy browsers; only adopt it when node counts truly demand it.
- **GitHub API limits:** the recursive Git Trees API caps at 100,000 entries / 7 MB and sets `truncated:true` beyond that (then walk sub‑trees); the contents API caps directory listings at 1,000 files (the GitHub UI itself warns “Sorry, we had to truncate this directory to 1,000 files,” and third‑party reports confirm the API “limit… at 1,000”). The dependency‑graph SBOM endpoint returns a 302 to a temporary URL and retains the generated report for up to one week. Plan for pagination and rate limits.
- **Backstage/PROV‑O are pattern donors, not runtime dependencies.** You are borrowing the provider→processor→stitcher pipeline, the declared‑vs‑derived discipline, orphan handling, and PROV‑O’s vocabulary — implemented in plain Python + JSON, not by running Backstage or an RDF triple store.
- **The live‑vs‑snapshot distinction must stay honest.** URL probing can be blocked, cached, or rate‑limited; always stamp the source tag truthfully (as the loved app already does) rather than assuming a 200 means “current”.
- **I could not read the loved page’s internal JS/CSS** (the fetch returned only rendered text: title “The Spider Sandbox”, controls Focus / Show / Both / Outgoing / Incoming / 🕷Spider / Explore / GitHub / External / Status / snapshot). The schema and CSS‑reuse recommendations assume the described contract (nodes+edges JSON + cartridges); confirm exact field names against the actual source before coding `v1`.
