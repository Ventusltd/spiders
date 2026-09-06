#!/usr/bin/env python3
"""Build spider_printer_v1/data/topology.json from the estate as it actually is.

WHY THIS EXISTS
---------------
The first topology cartridge was hand-drawn on 30 August 2026: 38 nodes with
hand-placed coordinates and conceptual names. It was a good drawing and it went
stale immediately. By 6 September the estate had gained ventus-grid-engine,
teleprinter, gpu-drivers-for-global-grid, gis-sld-sandbox, layout-tool,
cable-trench-or-drill and more, none of which appear on it, and a map that
silently omits a third of its subject is worse than no map because it is still
believed.

So the cartridge is generated, not drawn. Nodes are the repositories that exist.
Edges are references that were actually found in committed bytes. Positions are
computed deterministically from the layer assignment, so the same input always
produces the same file and a diff means the estate moved, not that the layout
engine wandered.

WHAT COUNTS AS AN EDGE
----------------------
A reference from repository A to repository B, found by scanning A's committed
text for B's GitHub or Pages URL. That is evidence: somebody wrote that link.
It is deliberately NOT an inferred dependency -- nothing here parses imports,
guesses at intent, or connects two repositories because they sound related. An
edge you can click through to is worth more than a clever one you cannot.

The count of references is carried on the edge, because one mention in a README
and forty in a build script are different relationships.

WHAT IT REFUSES
---------------
It does not certify that the federation is correct, complete or well designed.
It does not invent an edge to make the picture connected. A repository with no
found references is drawn unconnected, because that is what the evidence says.

Two modes:
  --local <dir>   scan sibling clones on disk (fast, offline, needs the clones)
  --api           list the org's public repositories and scan their default
                  branch through the GitHub API (what CI uses)

Run:
  python3 -B tools/build_topology.py --local ../..
  python3 -B tools/build_topology.py --api --out data/topology.json
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ORG = "Ventusltd"
SCHEMA_VERSION = "0.2.0"

# Which column a repository is drawn in. A repository that matches no rule is
# placed in "application", which is stated in the output rather than hidden, so
# an unclassified repo is visible as unclassified instead of silently absorbed.
LAYER_RULES = [
    ("data", re.compile(r"^(data-|seed-data|registry)")),
    ("engines", re.compile(r"(engine|maths|geodesy|gpu-drivers|linux-for-the-power-grid)")),
    ("observation", re.compile(r"^(spiders|cvaa|chatgpt-audits|codex-chatgpt|gemini|claude)")),
    ("publication", re.compile(r"^(globalgrid2050|pipelinenews|ventusltd\.com|studies)")),
    ("tools", re.compile(r"(teleprinter|layout-tool|cable-trench|sandbox|testcode|companies)")),
]

LAYER_ORDER = ["data", "engines", "apps", "tools", "observation", "publication"]

# `kind` is the class the VIEWER already styles. The viewer's CSS vocabulary is
# data / engine / lib / appn / schema / infra / external / future, and reusing it
# is deliberate: inventing a seventh vocabulary here would mean every node
# rendered unstyled while the JSON looked perfectly correct.
LAYER_META = {
    "data":        {"label": "Data spines",           "colour": "#00ff88", "kind": "data",   "defaultOn": True},
    "engines":     {"label": "Engines",               "colour": "#bdb2ff", "kind": "engine", "defaultOn": True},
    "apps":        {"label": "Applications",          "colour": "#61d7ff", "kind": "appn",   "defaultOn": True},
    "tools":       {"label": "Tools",                 "colour": "#ffae00", "kind": "lib",    "defaultOn": True},
    "observation": {"label": "Observation and audit", "colour": "#ff8f8f", "kind": "schema", "defaultOn": True},
    "publication": {"label": "Publication",           "colour": "#4ad9c4", "kind": "infra",  "defaultOn": True},
}

TEXT_SUFFIXES = {
    ".md", ".json", ".js", ".mjs", ".py", ".yml", ".yaml", ".html", ".txt", ".css", ".sh", ".toml",
}

SKIP_DIRS = {".git", "node_modules", "__pycache__", ".venv", "dist", "releases", "archive"}

# A repository is not an edge to itself, and these names appear inside URLs for
# reasons that are not references.
MAX_FILE_BYTES = 400_000


def classify(name: str) -> str:
    for layer, pattern in LAYER_RULES:
        if pattern.search(name):
            return layer
    return "apps"


def repo_reference_pattern(names: list[str]) -> re.Pattern:
    """One pass over each file, matching any repository name in a GitHub or
    Pages URL. Sorted longest-first so `data-grid-gb` is not matched as
    `data-grid` when both exist."""
    alternation = "|".join(re.escape(n) for n in sorted(names, key=len, reverse=True))
    return re.compile(
        r"(?:github\.com/" + ORG + r"/|" + ORG.lower() + r"\.github\.io/)(" + alternation + r")\b",
        re.IGNORECASE,
    )


def scan_local(root: Path, names: list[str],
               clone_dirs: dict[str, str] | None = None) -> dict[str, dict[str, int]]:
    pattern = repo_reference_pattern(names)
    found: dict[str, dict[str, int]] = {n: {} for n in names}
    for name in names:
        repo = root / (clone_dirs or {}).get(name, name)
        if not (repo / ".git").exists():
            continue
        for dirpath, dirnames, filenames in os.walk(repo):
            dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
            for filename in filenames:
                path = Path(dirpath) / filename
                if path.suffix.lower() not in TEXT_SUFFIXES:
                    continue
                try:
                    if path.stat().st_size > MAX_FILE_BYTES:
                        continue
                    text = path.read_text(encoding="utf-8", errors="ignore")
                except OSError:
                    continue
                for match in pattern.finditer(text):
                    target = match.group(1).lower()
                    if target != name.lower():
                        found[name][target] = found[name].get(target, 0) + 1
    return found


def api_json(url: str, token: str | None):
    request = urllib.request.Request(url, headers={
        "Accept": "application/vnd.github+json",
        "User-Agent": "spider-printer",
        **({"Authorization": f"Bearer {token}"} if token else {}),
    })
    with urllib.request.urlopen(request, timeout=60) as response:
        return json.load(response)


def list_repos_api(token: str | None) -> list[dict]:
    repos, page = [], 1
    while True:
        batch = api_json(f"https://api.github.com/orgs/{ORG}/repos?per_page=100&page={page}", token)
        if not batch:
            break
        repos.extend(batch)
        if len(batch) < 100:
            break
        page += 1
    return [r for r in repos if not r.get("archived")]


def scan_api(repos: list[dict], names: list[str], token: str | None) -> dict[str, dict[str, int]]:
    """Scan each repository's default branch through the code-search-free route:
    fetch the tree, then the text blobs small enough to be worth reading."""
    pattern = repo_reference_pattern(names)
    found: dict[str, dict[str, int]] = {n: {} for n in names}
    for repo in repos:
        name = repo["name"]
        try:
            tree = api_json(
                f"https://api.github.com/repos/{ORG}/{name}/git/trees/"
                f"{repo['default_branch']}?recursive=1", token)
        except Exception as exc:                      # noqa: BLE001 - reported, not raised
            print(f"  ! {name}: tree unavailable ({exc})", file=sys.stderr)
            continue
        for entry in tree.get("tree", []):
            if entry.get("type") != "blob":
                continue
            path = entry.get("path", "")
            if Path(path).suffix.lower() not in TEXT_SUFFIXES:
                continue
            if entry.get("size", 0) > MAX_FILE_BYTES:
                continue
            if any(part in SKIP_DIRS for part in Path(path).parts):
                continue
            raw = (f"https://raw.githubusercontent.com/{ORG}/{name}/"
                   f"{repo['default_branch']}/{path}")
            try:
                request = urllib.request.Request(raw, headers={"User-Agent": "spider-printer"})
                with urllib.request.urlopen(request, timeout=30) as response:
                    text = response.read().decode("utf-8", errors="ignore")
            except Exception:                         # noqa: BLE001 - a missing blob is not fatal
                continue
            for match in pattern.finditer(text):
                target = match.group(1).lower()
                if target != name.lower():
                    found[name][target] = found[name].get(target, 0) + 1
    return found


# The viewer maps node coordinates through
#   mapPos(n) = { x: 360 + (n.x/3600)*1180,  y: 150 + (n.y/3000)*820 }
# so node coordinates live in a 3600x3000 VIRTUAL space, not in sheet pixels
# and not in the canvas the cartridge declares. The hand-drawn cartridge
# declared a 2400x1500 canvas that never matched those divisors, which is
# harmless when coordinates are hand-placed to look right and fatal the moment
# they are generated. Emit in the space the viewer actually divides by.
VIRTUAL_W, VIRTUAL_H = 3600, 3000
MAP_LEFT, MAP_TOP, MAP_W, MAP_H = 360, 150, 1240, 880
MAP_SCALE_W, MAP_SCALE_H = 1180, 820          # the divisors mapPos actually uses
SHEET_W, SHEET_H = 1920, 1080
NODE_W, NODE_H = 150, 64


def mapped(node: dict) -> tuple[float, float]:
    """The sheet position the viewer will draw this node at."""
    return (MAP_LEFT + (node["x"] / VIRTUAL_W) * MAP_SCALE_W,
            MAP_TOP + (node["y"] / VIRTUAL_H) * MAP_SCALE_H)


def layout(nodes: list[dict]) -> None:
    """Deterministic: columns are layers in a fixed order, rows are repositories
    sorted by name. No randomness, no force simulation, no hand placement — so a
    diff in this file means the estate changed.

    Bounds are chosen so that the MAPPED box, including the node's 150x64
    footprint, lands inside the map area with a gap between neighbours."""
    by_layer: dict[str, list[dict]] = {}
    for node in nodes:
        by_layer.setdefault(node["layer"], []).append(node)
    present = [layer for layer in LAYER_ORDER if layer in by_layer]

    # Work backwards from the sheet: the last column must leave room for the
    # node's width, and the last row for its height.
    max_mapped_x = MAP_LEFT + MAP_W - NODE_W - 16
    max_mapped_y = MAP_TOP + MAP_H - NODE_H - 16
    right = ((max_mapped_x - MAP_LEFT) / MAP_SCALE_W) * VIRTUAL_W
    bottom = ((max_mapped_y - MAP_TOP) / MAP_SCALE_H) * VIRTUAL_H
    left, top = 60, 60

    span_x = (right - left) / max(1, len(present) - 1) if len(present) > 1 else 0
    for column, layer in enumerate(present):
        members = sorted(by_layer[layer], key=lambda n: n["id"])
        span_y = (bottom - top) / max(1, len(members) - 1) if len(members) > 1 else 0
        for row, node in enumerate(members):
            node["x"] = round(left + column * span_x)
            node["y"] = round(top + row * span_y) if len(members) > 1 else round((top + bottom) / 2)


def outside_map(nodes: list[dict]) -> list[str]:
    """Which nodes the viewer would clip, checked on the MAPPED position rather
    than the raw one. Should always be empty; returned so the generator can
    refuse rather than publish a node nobody can see."""
    bad = []
    for node in nodes:
        x, y = mapped(node)
        if not (MAP_LEFT <= x and x + NODE_W <= MAP_LEFT + MAP_W
                and MAP_TOP <= y and y + NODE_H <= MAP_TOP + MAP_H):
            bad.append(node["id"])
    return bad


def overlapping(nodes: list[dict]) -> int:
    """How many pairs of node boxes intersect once mapped. Overlap is a
    readability defect, not a correctness one, so it is reported rather than
    refused — but it is reported, because 98 overlapping pairs is not a map."""
    boxes = []
    for node in nodes:
        x, y = mapped(node)
        boxes.append((x, y, x + NODE_W, y + NODE_H))
    pairs = 0
    for i in range(len(boxes)):
        for j in range(i + 1, len(boxes)):
            a, b = boxes[i], boxes[j]
            if a[0] < b[2] and b[0] < a[2] and a[1] < b[3] and b[1] < a[3]:
                pairs += 1
    return pairs


def build(found: dict[str, dict[str, int]], repo_meta: dict[str, dict], source: str) -> dict:
    names = sorted(found)
    canvas = {"width": VIRTUAL_W, "height": VIRTUAL_H,
              "sheet": {"width": SHEET_W, "height": SHEET_H},
              "map": {"left": MAP_LEFT, "top": MAP_TOP, "width": MAP_W, "height": MAP_H,
                      "scaleW": MAP_SCALE_W, "scaleH": MAP_SCALE_H},
              "node": {"width": NODE_W, "height": NODE_H},
              "print": {"size": "A1", "orientation": "landscape"}}

    nodes = []
    for name in names:
        meta = repo_meta.get(name, {})
        nodes.append({
            "id": name,
            "label": name,
            "subtitle": (meta.get("description") or "no description published")[:110],
            "kind": LAYER_META[classify(name)]["kind"],
            "layer": classify(name),
            "unclassified": not any(p.search(name) for _, p in LAYER_RULES),
            "x": 0, "y": 0,
        })
    layout(nodes)
    clipped = outside_map(nodes)
    if clipped:
        raise SystemExit(
            "refusing to write a cartridge with nodes outside the viewer's map area, "
            "where they would be silently invisible: " + ", ".join(clipped))

    edges = []
    for source_repo in names:
        for target, count in sorted(found[source_repo].items()):
            match = next((n for n in names if n.lower() == target), None)
            if match is None:
                continue
            edges.append({
                "from": source_repo, "to": match, "type": "reference",
                "references": count,
                "evidence": f"{count} URL reference(s) to {ORG}/{match} found in {source_repo}'s committed text",
            })

    referenced = {e["to"] for e in edges} | {e["from"] for e in edges}
    unconnected = [n for n in names if n not in referenced]

    return {
        "schemaVersion": SCHEMA_VERSION,
        "species": "spider_printer_v1",
        "title": "GlobalGrid2050 Elements",
        "methodState": "screening",
        "mapType": "topological_sld_not_geospatial",
        "generated": {
            "utc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "by": "spider_printer_v1/tools/build_topology.py",
            "source": source,
            "edgeRule": (
                "An edge is a URL reference to another repository found in committed text. "
                "Nothing is inferred: no import parsing, no guessing, and no edge added to make "
                "the picture look connected."
            ),
        },
        "canvas": canvas,
        "principles": [
            "Nodes are the repositories that exist, not the ones that were drawn once.",
            "An edge is evidence somebody wrote a link, with the count of times they wrote it.",
            "Positions are computed from the layer assignment, so a diff means the estate moved.",
            "A repository with no found references is drawn unconnected, because that is the evidence.",
            "Every node is laid out inside the viewer's map area; the generator refuses to "
            "publish one the viewer would clip.",
            "Screening-grade topology. It does not certify that the federation is correct.",
        ],
        "layers": [
            {"id": layer, **LAYER_META[layer],
             "count": sum(1 for n in nodes if n["layer"] == layer)}
            for layer in LAYER_ORDER
        ] + [{"id": "reference", "label": "Reference edges", "colour": "#61d7ff",
              "kind": "edge", "defaultOn": True,
              "count": len(edges)}],
        "edgeTypes": {
            "reference": {
                "label": "URL reference in committed text",
                "colour": "#61d7ff",
                "layer": "reference",
                "dash": "",
            }
        },
        "totals": {
            "nodes": len(nodes), "edges": len(edges),
            "unconnected": len(unconnected), "unconnectedIds": unconnected,
            "totalReferences": sum(e["references"] for e in edges),
            "overlappingPairs": overlapping(nodes),
        },
        "nodes": nodes,
        "edges": edges,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--local", metavar="DIR", help="scan sibling clones under DIR")
    parser.add_argument("--api", action="store_true", help="scan through the GitHub API")
    parser.add_argument("--out", default="data/topology.json")
    parser.add_argument("--check", action="store_true",
                        help="build and compare against --out; exit 1 if it differs")
    args = parser.parse_args()

    if not args.local and not args.api:
        parser.error("choose --local <dir> or --api")

    repo_meta: dict[str, dict] = {}
    if args.api:
        token = os.environ.get("GITHUB_TOKEN")
        repos = list_repos_api(token)
        names = sorted(r["name"] for r in repos)
        repo_meta = {r["name"]: r for r in repos}
        print(f"{len(names)} repositories from the {ORG} organisation")
        found = scan_api(repos, names, token)
        source = f"GitHub API, {ORG} organisation, {len(names)} repositories"
    else:
        root = Path(args.local).resolve()
        clones = sorted(p.name for p in root.iterdir()
                        if p.is_dir() and (p / ".git").exists())
        # A directory is not a repository. Several clones on this machine are
        # extra working copies of the SAME remote -- gridatlas-main-<stamp>,
        # pipelinenews-codex-<stamp> and so on. Counting them as separate nodes
        # would draw an estate a third larger than the one that exists, so the
        # remote decides identity and the clone whose directory name matches it
        # wins.
        by_remote: dict[str, str] = {}
        skipped: list[str] = []
        for clone in clones:
            try:
                url = subprocess.check_output(
                    ["git", "-C", str(root / clone), "remote", "get-url", "origin"],
                    text=True, stderr=subprocess.DEVNULL).strip()
            except Exception:                         # noqa: BLE001
                skipped.append(clone)
                continue
            match = re.search(r"[/:]" + ORG + r"/([^/]+?)(?:\.git)?$", url, re.IGNORECASE)
            if not match:
                skipped.append(clone)
                continue
            canonical = match.group(1)
            if canonical not in by_remote or clone == canonical:
                by_remote[canonical] = clone
        names = sorted(by_remote)
        duplicates = [c for c in clones if c not in by_remote.values() and c not in skipped]
        print(f"{len(clones)} directories under {root}: {len(names)} distinct repositories, "
              f"{len(duplicates)} extra working copies, {len(skipped)} without a {ORG} remote")
        if duplicates:
            print("  extra working copies (not drawn): " + ", ".join(sorted(duplicates)))
        if skipped:
            print("  no " + ORG + " remote (not drawn): " + ", ".join(sorted(skipped)))
        for name in names:
            repo_meta[name] = {"description": "", "clone": by_remote[name]}
        found = scan_local(root, names, {n: by_remote[n] for n in names})
        source = (f"local clones under {root.name}: {len(names)} distinct repositories "
                  f"deduplicated from {len(clones)} directories by origin remote")

    topology = build(found, repo_meta, source)
    text = json.dumps(topology, indent=2, ensure_ascii=False) + "\n"

    out = Path(args.out)
    if args.check:
        if not out.exists():
            print(f"{out} does not exist", file=sys.stderr)
            return 1
        current = json.loads(out.read_text(encoding="utf-8"))
        fresh = json.loads(text)
        for document in (current, fresh):
            document.pop("generated", None)
        if current != fresh:
            print("topology.json is out of date with the estate", file=sys.stderr)
            return 1
        print("topology.json matches the estate")
        return 0

    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(text, encoding="utf-8")
    t = topology["totals"]
    print(f"wrote {out}: {t['nodes']} nodes, {t['edges']} edges, "
          f"{t['totalReferences']} references, {t['unconnected']} unconnected, "
          f"{t['overlappingPairs']} overlapping pair(s)")
    if t["unconnectedIds"]:
        print("  unconnected: " + ", ".join(t["unconnectedIds"]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
