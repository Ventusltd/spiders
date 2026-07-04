# spider_maya v1

`spider_maya` is the versioned graph-scanner line for the Ventus and GlobalGrid2050 estate.

This v1 folder is additive. It does not edit the loved Spider page in the federation repository.

The loved working page remains:

`https://ventusltd.github.io/data-federation-map-for-globalgrid2050-all-repos/dashboard/sandbox/spider_full_po_test.html`

The first v1 task is deliberately small:

1. Read the declared `AREAS` menu from `Ventusltd/globalgrid2050/index.html`.
2. Convert the menu into a labelled property graph.
3. Emit deterministic `nodes.json` and `edges.json` under `data/derived/`.
4. Emit an audit receipt under `audit/`.
5. Keep every row marked as `declared` because the `AREAS` menu is hand-authored committed source.

Later v1 work may add derived git-tree discovery, live URL probing and DuckDB/Parquet catalogue output, but those are not part of this first bootstrap.

Core invariant:

`spider_maya` may observe and derive, but it must never silently promote derived findings into declared facts.

Current v1 files:

- `config/sources.json` records source repositories and the loved page recovery anchor.
- `scripts/scan_areas_menu.py` extracts the declared homepage menu into graph JSON.
- `scripts/validate.py` checks graph shape, provenance and uniqueness.
- `data/derived/` receives renderer-ready graph payloads.
- `audit/` receives a Markdown and JSON receipt per scan.
