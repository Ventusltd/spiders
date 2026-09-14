# Maya hunt — explain every dead end

Added 2026-09-14 15:05:51 UTC. Companion to `docs/doctrine/SPIDER_MAYA_REMOVER.md` and `spider_maya/`: that doctrine refuses false
certainty (unknown stays unknown); the Maya hunt refuses a **false ending**. On a Spider graph a leaf card — a node
nothing else depends on — looks like a dead end, but it has a function, a purpose, relationships and a reason for
existing, all recorded in the estate. The hunt finds every leaf and assigns it a Maya card that explains those four
faces and offers a next click.

## What it does

`maya-hunter.mjs` (read-only, no network writes) reads the VENTUS GRID ENGINE manifest
(https://ventusltd.github.io/ventus-grid-engine/spider/manifest.json) and every registered graph, finds every leaf
(out-degree 0), and writes `data/maya-cards.json`: for each dead end, its **function**, **purpose**,
**relationships** and **reason for existing**, plus a **next** click (its periodic-table block, its source, or back to
its parent). It enriches from stars `blocks/blocks.json` and `blocks/reactions.json`.

Run: `node maya-hunter.mjs [outDir]`. Latest run: see `data/MAYA-REPORT.md` (899 dead ends across 16 graphs).

## How the dashboard uses it

The ventus-grid-engine page reads `spider/maya-cards.json` (published there by the receiver) and shows the assigned
card on any leaf, keyed by the node label. The lab prototyped that additive page change; the receiver publishes the
data and the small reader. A weekly workflow re-runs the hunt so new dead ends are always explained.

## Rules (from the doctrine)

Nothing invented: a card with no data says what is unknown, it does not paint a fake explanation. Numbers are permanent.
The hunt reads; it never rewrites a graph or the Spider page.
