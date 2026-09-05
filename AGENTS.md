# Spiders agent restart guide

## Start with current state

Read `codex/build-plan/CURRENT.json`, `master-plan.geojson`, `README.md`, `PLUGIN-BOUNDARY.md` and `CI-TRACKER.json`. Read the offline handover at `C:/Users/vikra/OneDrive/Desktop/offline-screenshots/architecture-reload-20260905/master-100/HANDOVER.md` when available. If a file is missing, report that gap and use tracked evidence; do not invent its contents.

Run `git status --short`, `git branch --show-current`, and `git log -5 --oneline` in each target checkout. Inspect remote state before publishing. Old handover SHAs are checkpoints, not automatically current heads. Read that repo's AGENTS and scope documents before editing it.

## Programme and priority

- Pipeline News and GridAtlas core reliability comes first. The GeoJSON describes 50 planned increments for each app, not 100 completed releases.
- Optional electricity, market, storage and engineering discussion layers must not block core search, GRID/SUBS, printing or straight-line distance.
- The last unresolved user report was “the menu layers go over the n…”; reproduce the overlap in Chrome without guessing the obscured target.
- When implementation resumes, use at most one keeper subagent for a concrete independent check or CI/evidence task. Durable files and CI receipts preserve context; a subagent is not a permanent background memory service.

## Existing architecture

Reuse Atlas's existing `ukConfig` / `GRID_CONFIG` layer controls and preload mechanism. `atlas/current.json` pins executable cartridges. Inspect these before adding anything; do not create a competing registry or copy tools into a giant Core closure.

Keep original apps and data in their owners:

| Responsibility | Repository |
|---|---|
| Original electricity chart UI | gb-electricity-ui |
| Electricity Parquet/DuckDB products | data-gb-electricity |
| GIS SLD Financial Sandbox | gis-sld-sandbox |
| Module Layout | layout-tool |
| Cable geometry, trench/drill scenarios | cable-trench-or-drill |
| Pure grid computation | ventus-grid-engine |
| Observation species and build-plan projection | spiders |
| Regression vaccines | cvaa |

The V6 electricity UI was already developed; its data federation is unfinished. Preserve original design and controls. Half-hour data is allowed in compact owner products, with bounded weekly collection and pre-write growth checks. Do not duplicate full archives or create more repos without evidence of need.

Preserve straight-line computation as first pass. Published fault levels are attributed records, not computed headroom. Respect Claude's unfinished owner work and inspect its current commits before integration.

## Migration and release rules

Before transferring GlobalGrid2050 YAML or Python, confirm its destination home and record exact source commits, hashes, workflow-to-script calls, imports, data inputs, environment and outputs in the Spider graph. Prove the destination works independently. Reading history is allowed; do not execute captured source or re-enable old monolith schedules as a shortcut.

Make one substantive feature change per unique immutable release timestamp. Never rewrite a historical release to disguise a failed test. Preserve dirty worktrees; use isolated worktrees when necessary and stage only owned files. An optional plugin should have an independent failure state and a pinned owner version.

Test actual browser interactions. Do not substitute screenshots into the print engine and call that proof of the user's printing experience. Save raw screenshots, PDFs, downloads and failure evidence under `C:/Users/vikra/OneDrive/Desktop/offline-screenshots`; keep concise code/provenance reports in Git. Verify source, data, module and served-byte identities before declaring a deployment accepted.

## Plan validation and context checkpoints

Run `node --test codex/build-plan/federation.test.mjs` and `node codex/build-plan/build.mjs --out=<offline-evidence-directory>` for plan changes. The latter defaults to audit. Use a new plan revision before `--apply` when canonical bytes change; archived revisions are immutable. Keep planned graph relationships separate from observed genome dependencies.

The existing `.github/workflows/genome.yml` validates and composes the plan child cartridge. Observe exact commit/run IDs and inspect failures; do not trigger redundant runs or infer product correctness from a green unrelated job.

Before stopping, write a short handover containing current branches/SHAs, dirty files, accepted versus staged releases, evidence locations, unresolved issues and the next bounded action. Refresh the Git/CI tracker. Do not resume work merely because this file lists pending tasks; follow the user's current instruction.
