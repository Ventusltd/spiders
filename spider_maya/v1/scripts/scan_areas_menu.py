#!/usr/bin/env python3
"""Build a declared spider_maya graph from the globalgrid2050 AREAS menu.

This scanner is intentionally conservative. It reads only the hand-authored
AREAS menu from the GlobalGrid2050 homepage and emits declared graph rows.
It does not perform git-tree discovery, URL probing, dependency inference or
promotion of derived facts.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "config" / "sources.json"
DERIVED_DIR = ROOT / "data" / "derived"
AUDIT_DIR = ROOT / "audit"
SCHEMA_VERSION = "spider-graph/1.0.0"

AREA_RE = re.compile(r'^\s*\{\s*name:\s*"(?P<name>[^"]+)"\s*,\s*children:\s*\[')
ROW_RE = re.compile(
    r'^\s*\{\s*name:\s*"(?P<name>[^"]+)"\s*,\s*url:\s*"(?P<url>[^"]+)"'
    r'(?:\s*,\s*note:\s*"(?P<note>[^"]+)")?\s*\}\s*,?\s*$'
)
DIRECT_RE = re.compile(r'^\s*\{\s*name:\s*"(?P<name>[^"]+)"\s*,\s*url:\s*"(?P<url>[^"]+)"')


def slug(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-") or "unnamed"


def stable_id(prefix: str, value: str) -> str:
    return f"{prefix}:{slug(value)}"


def fetch_text(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "spider-maya-v1"})
    with urllib.request.urlopen(req, timeout=30) as response:
        return response.read().decode("utf-8")


def source_url(ref: str) -> str:
    return f"https://raw.githubusercontent.com/Ventusltd/globalgrid2050/{ref}/index.html"


def extract_areas_block(html: str) -> str:
    marker = "const AREAS = ["
    start = html.find(marker)
    if start < 0:
        raise ValueError("Could not find const AREAS = [ in homepage")
    start = html.find("[", start)
    if start < 0:
        raise ValueError("Could not find opening AREAS bracket")
    depth = 0
    for idx in range(start, len(html)):
        char = html[idx]
        if char == "[":
            depth += 1
        elif char == "]":
            depth -= 1
            if depth == 0:
                return html[start : idx + 1]
    raise ValueError("Could not find closing AREAS bracket")


def parse_areas(block: str) -> list[dict]:
    areas: list[dict] = []
    current: dict | None = None
    for line in block.splitlines():
        area = AREA_RE.match(line)
        if area:
            current = {"name": area.group("name"), "children": []}
            areas.append(current)
            continue
        if current is not None:
            row = ROW_RE.match(line)
            if row:
                child = {"name": row.group("name"), "url": row.group("url")}
                if row.group("note"):
                    child["note"] = row.group("note")
                current["children"].append(child)
                continue
            if line.strip().startswith("},") or line.strip().startswith("}]}"):
                current = None
                continue
        direct = DIRECT_RE.match(line)
        if direct and current is None:
            areas.append({"name": direct.group("name"), "url": direct.group("url"), "children": []})
    return areas


def node(node_id: str, kind: str, node_type: str, label: str, attrs: dict, source: str, run_id: str) -> dict:
    return {
        "id": node_id,
        "kind": kind,
        "type": node_type,
        "label": label,
        "attrs": attrs,
        "provenance": "declared",
        "methodState": "areas_menu_v1",
        "schemaVersion": SCHEMA_VERSION,
        "source": source,
        "firstSeenRun": run_id,
        "lastSeenRun": run_id,
    }


def edge(edge_id: str, source_id: str, target_id: str, rel: str, source: str, run_id: str) -> dict:
    return {
        "id": edge_id,
        "source": source_id,
        "target": target_id,
        "rel": rel,
        "provenance": "declared",
        "methodState": "areas_menu_v1",
        "schemaVersion": SCHEMA_VERSION,
        "sourceLabel": source,
        "firstSeenRun": run_id,
        "lastSeenRun": run_id,
    }


def build_graph(areas: list[dict], pages_base_url: str, run_id: str) -> tuple[list[dict], list[dict]]:
    nodes: dict[str, dict] = {}
    edges: dict[str, dict] = {}
    root_id = "repo:globalgrid2050"
    nodes[root_id] = node(
        root_id,
        "repo",
        "monolith",
        "globalgrid2050",
        {"repository": "Ventusltd/globalgrid2050", "pagesBaseUrl": pages_base_url},
        "AREAS menu",
        run_id,
    )
    for area in areas:
        area_id = stable_id("area", f"globalgrid2050/{area['name']}")
        nodes[area_id] = node(area_id, "area", "homepage_menu_area", area["name"], {}, "AREAS menu", run_id)
        e_id = f"e:contains:{root_id}->{area_id}"
        edges[e_id] = edge(e_id, root_id, area_id, "contains", "AREAS menu", run_id)
        for child in area.get("children", []):
            url = child["url"]
            clean_path = url.replace("./", "", 1)
            app_id = stable_id("app", f"globalgrid2050/{clean_path}")
            attrs = {
                "path": clean_path,
                "declaredUrl": url,
                "liveUrl": urljoin(pages_base_url, clean_path),
            }
            if child.get("note"):
                attrs["devStatus"] = child["note"]
            nodes[app_id] = node(app_id, "app", "launch_surface", child["name"], attrs, "AREAS menu", run_id)
            contains_id = f"e:contains:{area_id}->{app_id}"
            edges[contains_id] = edge(contains_id, area_id, app_id, "contains", "AREAS menu", run_id)
            launch_id = f"e:declares_launch_surface:{app_id}->{app_id}"
            edges[launch_id] = edge(launch_id, app_id, app_id, "declares_launch_surface", "AREAS menu", run_id)
    return sorted(nodes.values(), key=lambda r: r["id"]), sorted(edges.values(), key=lambda r: r["id"])


def write_json(path: Path, value) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def logical_hash(rows: list[dict]) -> str:
    canonical = json.dumps(rows, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--globalgrid-ref", default=None, help="Git ref for Ventusltd/globalgrid2050 index.html")
    parser.add_argument("--input-html", default=None, help="Optional local index.html path for offline tests")
    args = parser.parse_args()

    cfg = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    src = cfg["sources"]["globalgrid2050Homepage"]
    ref = args.globalgrid_ref or src["defaultRef"]
    run_id = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")

    if args.input_html:
        html = Path(args.input_html).read_text(encoding="utf-8")
        source_ref = f"local:{args.input_html}"
    else:
        source_ref = source_url(ref)
        html = fetch_text(source_ref)

    areas = parse_areas(extract_areas_block(html))
    nodes, edges = build_graph(areas, src["pagesBaseUrl"], run_id)

    write_json(DERIVED_DIR / "nodes.json", nodes)
    write_json(DERIVED_DIR / "edges.json", edges)

    audit = {
        "runId": run_id,
        "source": source_ref,
        "schemaVersion": SCHEMA_VERSION,
        "areas": len(areas),
        "nodes": len(nodes),
        "edges": len(edges),
        "nodeHash": logical_hash(nodes),
        "edgeHash": logical_hash(edges),
        "provenance": {"declared": len(nodes) + len(edges), "derived": 0},
    }
    write_json(AUDIT_DIR / f"{run_id}.json", audit)
    md = [
        f"# spider_maya v1 scan receipt {run_id}",
        "",
        f"Source: `{source_ref}`",
        "",
        f"Areas: {audit['areas']}",
        f"Nodes: {audit['nodes']}",
        f"Edges: {audit['edges']}",
        "Derived rows: 0",
        f"Node logical hash: `{audit['nodeHash']}`",
        f"Edge logical hash: `{audit['edgeHash']}`",
        "",
        "This run reads only the declared GlobalGrid2050 AREAS menu.",
    ]
    (AUDIT_DIR / f"{run_id}.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    print(json.dumps(audit, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
