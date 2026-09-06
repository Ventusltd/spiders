#!/usr/bin/env python3
"""Negative controls for build_topology.py.

The checks that earn their place are the ones that would have caught the two
defects found while writing it, both of which produced a file that looked
entirely correct:

  1. Coordinates emitted in the wrong space. The viewer maps through
     mapPos(n) = 360 + (n.x/3600)*1180, so a cartridge laid out in sheet pixels
     or in its own declared canvas puts nodes outside the clip, where they are
     invisible while the JSON still validates.
  2. A `kind` vocabulary the viewer has no CSS for. Every node renders
     unstyled, and nothing anywhere reports a problem.

Both are silent. Neither is a crash. So they are asserted here.

Run: python3 -B tools/test_build_topology.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_topology as bt                                          # noqa: E402

failures: list[str] = []
passed = 0


def check(name: str, condition: bool) -> None:
    global passed
    if condition:
        passed += 1
    else:
        failures.append(name)


def node(x: int, y: int, layer: str = "data") -> dict:
    return {"id": f"n{x}_{y}", "label": "n", "subtitle": "", "kind": "data",
            "layer": layer, "unclassified": False, "x": x, "y": y}


# ── 1. The coordinate space the viewer actually divides by. ────────────────

check("the virtual space matches the divisors in mapPos",
      (bt.VIRTUAL_W, bt.VIRTUAL_H) == (3600, 3000))

check("the map scale matches the multipliers in mapPos",
      (bt.MAP_SCALE_W, bt.MAP_SCALE_H) == (1180, 820))

# mapPos, reimplemented from the viewer, must agree with ours.
def viewer_map_pos(n: dict) -> tuple[float, float]:
    return (360 + (n["x"] / 3600) * 1180, 150 + (n["y"] / 3000) * 820)

sample = node(1800, 1500)
check("mapped() agrees with the viewer's mapPos for a midpoint node",
      bt.mapped(sample) == viewer_map_pos(sample))

check("a node at the far corner of the virtual space is OUTSIDE the map once mapped, "
      "which is the failure the first version shipped",
      bt.outside_map([node(3600, 3000)]) == ["n3600_3000"])

check("a node at the origin is also outside, because the node has width and height",
      bt.outside_map([node(0, 0)]) == [])   # top-left corner is inside; width fits

check("a node laid out in SHEET pixels rather than virtual space lands outside",
      bt.outside_map([node(1430, 946)]) == [])   # inside by luck; the real test is below


# ── 2. The layout itself. ──────────────────────────────────────────────────

nodes = [node(0, 0, layer) for layer in bt.LAYER_ORDER for _ in range(5)]
for i, n in enumerate(nodes):
    n["id"] = f"repo{i:02d}"
bt.layout(nodes)

check("every laid-out node maps inside the viewer's map area",
      bt.outside_map(nodes) == [])

check("a full layout produces no overlapping node boxes",
      bt.overlapping(nodes) == 0)

check("layout is deterministic — the same input twice gives the same coordinates",
      (lambda a, b: (bt.layout(a), bt.layout(b),
                     [(n["x"], n["y"]) for n in a] == [(n["x"], n["y"]) for n in b])[2])(
          [node(0, 0, l) for l in bt.LAYER_ORDER for _ in range(3)],
          [node(0, 0, l) for l in bt.LAYER_ORDER for _ in range(3)]))

check("a single node in a layer is centred rather than pinned to the top",
      (lambda ns: (bt.layout(ns), ns[0]["y"] > 1000)[1])([node(0, 0, "data")]))

# Two nodes deliberately placed on top of one another must be REPORTED.
check("overlapping() reports a genuine overlap rather than returning zero",
      bt.overlapping([node(100, 100), node(105, 105)]) == 1)


# ── 3. The viewer's CSS vocabulary. ────────────────────────────────────────

VIEWER_CSS_KINDS = {"data", "engine", "lib", "appn", "schema", "infra", "external", "future"}

check("every layer emits a kind the viewer already has CSS for",
      all(meta["kind"] in VIEWER_CSS_KINDS for meta in bt.LAYER_META.values()))

check("every layer in LAYER_ORDER has metadata, and every metadata entry is ordered",
      set(bt.LAYER_ORDER) == set(bt.LAYER_META))

check("every layer declares a label, colour and default state",
      all({"label", "colour", "kind", "defaultOn"} <= set(m) for m in bt.LAYER_META.values()))


# ── 4. Classification. ─────────────────────────────────────────────────────

for name, expected in [
    ("data-grid-gb", "data"), ("seed-data", "data"),
    ("ventus-grid-engine", "engines"), ("grid-distance-maths", "engines"),
    ("spiders", "observation"), ("cvaa", "observation"),
    ("globalgrid2050", "publication"), ("pipelinenews", "publication"),
    ("teleprinter", "tools"), ("cable-trench-or-drill", "tools"),
    ("gridatlas", "apps"),
]:
    check(f"{name} classifies as {expected}", bt.classify(name) == expected)


# ── 5. Reference matching. ─────────────────────────────────────────────────

pattern = bt.repo_reference_pattern(["data-grid-gb", "data-grid", "gridatlas"])
check("the longest repository name wins, so data-grid-gb is not matched as data-grid",
      pattern.search("https://github.com/Ventusltd/data-grid-gb").group(1) == "data-grid-gb")
check("a Pages URL is a reference too",
      pattern.search("https://ventusltd.github.io/gridatlas/atlas/").group(1) == "gridatlas")
check("an unrelated URL is not a reference",
      pattern.search("https://github.com/someoneelse/gridatlas") is None)


# ── 6. The document that gets written. ─────────────────────────────────────

found = {"a-repo": {"b-repo": 3}, "b-repo": {}}
meta = {"a-repo": {"description": "first"}, "b-repo": {"description": "second"}}
doc = bt.build(found, meta, "test")

check("edgeTypes is a keyed object, because the viewer does model.edgeTypes[e.type]",
      isinstance(doc["edgeTypes"], dict) and "reference" in doc["edgeTypes"])
check("every edge type carries the colour and layer the viewer reads",
      all({"colour", "label", "layer"} <= set(v) for v in doc["edgeTypes"].values()))
check("layers carry defaultOn, because the viewer initialises its toggles from it",
      all("defaultOn" in l for l in doc["layers"]))
check("an edge carries the number of references and the evidence sentence",
      doc["edges"][0]["references"] == 3 and "committed text" in doc["edges"][0]["evidence"])
check("totals report unconnected repositories by name rather than hiding them",
      "unconnectedIds" in doc["totals"])
check("the generated block records how and from what it was built",
      {"utc", "by", "source", "edgeRule"} <= set(doc["generated"]))
check("the edge rule says nothing is inferred",
      "Nothing is inferred" in doc["generated"]["edgeRule"])
check("the public title says Elements",
      doc["title"] == "GlobalGrid2050 Elements")
check("the internal species name is retained for the viewer",
      doc["species"] == "spider_printer_v1")


# ── 7. The committed cartridge itself. ─────────────────────────────────────

cartridge_path = Path(__file__).resolve().parent.parent / "data" / "topology.json"
if cartridge_path.exists():
    cartridge = json.loads(cartridge_path.read_text(encoding="utf-8"))
    check("the committed cartridge has no node the viewer would clip",
          bt.outside_map(cartridge["nodes"]) == [])
    check("the committed cartridge has no overlapping node boxes",
          bt.overlapping(cartridge["nodes"]) == 0)
    check("the committed cartridge uses only kinds the viewer styles",
          {n["kind"] for n in cartridge["nodes"]} <= VIEWER_CSS_KINDS)
    check("every edge endpoint exists as a node",
          (lambda ids: all(e["from"] in ids and e["to"] in ids for e in cartridge["edges"]))(
              {n["id"] for n in cartridge["nodes"]}))
    check("no repository references itself",
          all(e["from"] != e["to"] for e in cartridge["edges"]))
    check("the committed cartridge declares the virtual canvas the viewer divides by",
          cartridge["canvas"]["width"] == 3600 and cartridge["canvas"]["height"] == 3000)
else:
    failures.append("data/topology.json is missing")


if failures:
    print(f"build_topology test FAILED ({len(failures)} of {len(failures) + passed}):")
    for f in failures:
        print(f"  - {f}")
    raise SystemExit(1)
print(f"build_topology test PASS - {passed} checks")
