# Estate Activity Spider

A **read-only, bounded public GitHub observer** in the Ventus Spider species lab. It crosslinks current repo/PR/comment activity with **Stars' periodic table**, the existing **ventus-grid-engine Spider graph receiver** and **Kuiper's six-hourly pinned estate measurement**.

## Open the linked instruments

- [Activity Spider](https://ventusltd.github.io/spiders/species/estate-activity/)
- [Periodic table](https://ventusltd.github.io/stars/table.html)
- [Periodic graph in the Spider receiver](https://ventusltd.github.io/ventus-grid-engine/?graph=periodic-table)
- [Stars proof-of-work graph](https://ventusltd.github.io/ventus-grid-engine/?graph=proof-of-work)
- [Kuiper Belt](https://ventusltd.github.io/kuiper-belt/)
- [Agent coordination](https://github.com/Ventusltd/neural-link-between-agents/issues/30)

These are **navigation links**, not invented code dependencies. The existing receiver already registers the published Stars graphs, verified against the pinned receiver manifest. This plugin does not copy/re-register graph payloads or modify Stars, Kuiper, the receiver, GridAtlas, Neural Link or an agent branch.

## Evidence contract

- **Observed:** GitHub's public default-branch commit SHA, UTC committer time and original commit URL; newest open PR's exact head SHA and last-updated clock; public issue-comment URL and *self-declared* bracket label.
- **Measured joins:** current public Kuiper cosmos/standing.tsv pinned to Kuiper HEAD; Stars modular/source.json pinned to Stars HEAD; and receiver spider/manifest.json pinned to receiver HEAD.
- **Comparison:** aligned only when SHA prefix matches; lagging means two independently scheduled readers differ, **not** a CI failure; unavailable is not green.
- **Not claimed:** a running agent from a comment, CI acceptance from a PR, licensed source rights, a live Pages byte fetch, electrical connection from a link, or an independent proof of correctness from a summary.
- **Bound:** 15 explicitly configured public repositories; seven UTC calendar days; at most three GitHub commit-result pages per repo (300 sampled SHAs). A capped count is shown as **≥**. Only the latest 60 open PRs per selected repo and 100 recent neural-link comments are queried. Hidden/private activity is outside scope.
- **Fail closed:** if GitHub API, Stars pin, Kuiper pin or receiver manifest cannot be read, the job fails; it does not replace the last successful activity record with an empty/green result.

## How it works

The single [workflow](https://github.com/Ventusltd/spiders/blob/main/.github/workflows/estate-activity.yml) runs every three hours, on demand, and on relevant code pushes. Pull requests run **offline tests only**; they never write a data snapshot. The scheduled job reads external GitHub repositories and writes **only** species/estate-activity/data/activity.json inside Ventusltd/spiders if bytes changed. Changes to that data file do not retrigger the scheduled observer.

There is **no web API token in the public browser**, no cross-repository write permission, no release action and no dependency on an LLM.

To test locally, from the Spider repository, run:

    node --test species/estate-activity/tools/build.test.mjs
    node --check species/estate-activity/app.mjs

For a manual live crawl, set a read-only GITHUB_TOKEN and run the build.mjs script. Do not include tokens in public files or comments.

The UI remains usable as a static instrument directory if the first successful scheduled snapshot has not arrived. Its missing-data state says so explicitly.

## Other observer species

The [genome-spider](https://github.com/Ventusltd/spiders/tree/main/species/genome-spider) maps **evidenced code dependencies** and spider_printer_v1 draws the topology of **written repository references**. This activity species deliberately keeps **temporal observation** separate. A link does not become a dependency or a certified conclusion merely because it has been drawn.

**Ownership:** ChatGPT Agent 2, spiders-only work; do not interfere with Agent 4/5/7 production, editorial or research branches. This is screening-grade estate intelligence, not an approved Pipeline News release.
