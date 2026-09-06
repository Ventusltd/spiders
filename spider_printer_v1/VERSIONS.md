# Elements — cartridge versions

Every version of `data/topology.json`, newest first. A superseded cartridge is
kept under `data/superseded/` so any figure quoted from it can still be found.

**Both clocks are given on every row.** Stamps are read from `date -u` at build
time and never typed, so a stamp is UTC and reads one hour behind a phone on
British Summer Time. That is correct, not drift — and it is written here twice
so two lanes' work can be compared without anyone having to do the arithmetic.

| Cartridge stamp (UTC) | Same moment (BST) | Nodes | Edges | Built by | What changed |
|---|---|---:|---:|---|---|
| `202609060229` | 03:29 | 30 | 164 | claude, generated | Generated from the estate for the first time. 30 distinct repositories deduplicated from 36 directories by origin remote; 164 edges, each one a URL reference actually found in committed text, carrying the number of times it was written. Public name changed to **Elements**. |
| `202608301949` | 20:49 | 38 | 42 | hand-drawn | The original. Conceptual node names, hand-placed coordinates. Superseded because it did not know about ventus-grid-engine, teleprinter, gpu-drivers-for-global-grid, gis-sld-sandbox, layout-tool, cable-trench-or-drill, studies or grid-distance-maths — a third of the estate was missing and the map was still believed. |

## What "Elements" is

The public name for this view. `spider_printer_v1` remains the internal species
name, the directory, and the `data-spider-species` attribute — it is how the
estate's own tooling addresses this app, and it is not shown to a reader.

## How a new version is made

```bash
python3 -B tools/build_topology.py --local ../..      # from clones on a laptop
python3 -B tools/build_topology.py --api             # from the GitHub API, in CI
python3 -B tools/test_build_topology.py              # 43 checks
python3 -B tools/build_topology.py --local ../.. --check   # is it stale?
```

Copy the outgoing cartridge into `data/superseded/topology-<its stamp>.json`
first, add a row here, and never edit a superseded file.
