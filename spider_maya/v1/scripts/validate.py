#!/usr/bin/env python3
"""Validate spider_maya v1 graph artefacts.

This validator is deliberately small and strict. It validates the renderer-ready
JSON payloads emitted by scan_areas_menu.py and checks that v1 contains only
legal provenance states.
"""
from __future__ import annotations

import json
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DERIVED_DIR = ROOT / "data" / "derived"
CONFIG_PATH = ROOT / "config" / "sources.json"

LEGAL_NODE_KINDS = {"repo", "area", "app", "surface", "file", "dataset", "external_source", "workflow"}
LEGAL_RELS = {"contains", "serves", "declares_launch_surface", "depends_on", "references_source", "data_feed", "child_scope"}
LEGAL_PROVENANCE = {"declared", "derived"}
REQUIRED_NODE_KEYS = {"id", "kind", "type", "label", "attrs", "provenance", "methodState", "schemaVersion", "source"}
REQUIRED_EDGE_KEYS = {"id", "source", "target", "rel", "provenance", "methodState", "schemaVersion"}


def load(path: Path):
    if not path.exists():
        raise AssertionError(f"Missing required file: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def assert_unique(rows: list[dict], field: str, label: str) -> None:
    counts = Counter(row[field] for row in rows)
    dupes = [key for key, count in counts.items() if count > 1]
    if dupes:
        raise AssertionError(f"Duplicate {label} {field}: {dupes[:10]}")


def validate_nodes(nodes: list[dict]) -> None:
    if not isinstance(nodes, list) or not nodes:
        raise AssertionError("nodes.json must be a non-empty array")
    assert_unique(nodes, "id", "node")
    ids = [row["id"] for row in nodes]
    if ids != sorted(ids):
        raise AssertionError("nodes.json is not sorted by id")
    for row in nodes:
        missing = REQUIRED_NODE_KEYS - row.keys()
        if missing:
            raise AssertionError(f"Node {row.get('id')} missing keys {sorted(missing)}")
        if row["kind"] not in LEGAL_NODE_KINDS:
            raise AssertionError(f"Node {row['id']} has illegal kind {row['kind']}")
        if row["provenance"] not in LEGAL_PROVENANCE:
            raise AssertionError(f"Node {row['id']} has illegal provenance {row['provenance']}")
        if not isinstance(row["attrs"], dict):
            raise AssertionError(f"Node {row['id']} attrs must be an object")


def validate_edges(edges: list[dict], node_ids: set[str]) -> None:
    if not isinstance(edges, list) or not edges:
        raise AssertionError("edges.json must be a non-empty array")
    assert_unique(edges, "id", "edge")
    ids = [row["id"] for row in edges]
    if ids != sorted(ids):
        raise AssertionError("edges.json is not sorted by id")
    for row in edges:
        missing = REQUIRED_EDGE_KEYS - row.keys()
        if missing:
            raise AssertionError(f"Edge {row.get('id')} missing keys {sorted(missing)}")
        if row["rel"] not in LEGAL_RELS:
            raise AssertionError(f"Edge {row['id']} has illegal rel {row['rel']}")
        if row["provenance"] not in LEGAL_PROVENANCE:
            raise AssertionError(f"Edge {row['id']} has illegal provenance {row['provenance']}")
        if row["source"] not in node_ids:
            raise AssertionError(f"Edge {row['id']} source missing node {row['source']}")
        if row["target"] not in node_ids:
            raise AssertionError(f"Edge {row['id']} target missing node {row['target']}")


def validate_config() -> None:
    cfg = load(CONFIG_PATH)
    loved = cfg["sources"]["lovedSpiderPage"]
    if loved["path"] != "dashboard/sandbox/spider_full_po_test.html":
        raise AssertionError("Loved page source path changed")
    if not loved.get("gitBlobSha"):
        raise AssertionError("Loved page git blob SHA missing")


def main() -> int:
    validate_config()
    nodes = load(DERIVED_DIR / "nodes.json")
    edges = load(DERIVED_DIR / "edges.json")
    validate_nodes(nodes)
    validate_edges(edges, {row["id"] for row in nodes})
    print(json.dumps({"status": "pass", "nodes": len(nodes), "edges": len(edges)}, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"VALIDATION FAIL: {exc}", file=sys.stderr)
        raise
