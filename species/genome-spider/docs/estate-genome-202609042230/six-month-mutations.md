# Six-Month Mutations

Evidence base: `globalgrid2050` (4524 commits, first commit `880110b1` 2026-03-12 16:26 UTC, HEAD `7d00781b` 2026-09-04) plus first-commit dates for the seven younger repos, gathered via `git log`/`git rev-list` on 2026-09-04. All repos read-only; no writes made to any repo.

## 1. Major architectural eras

Sampled `git log --format="%ad %s" --date=format:%Y-%m-%d` at ~monthly checkpoints and by grepping version tokens (`grep -oiE '\bv[0-9]+\b'` on commit subjects → V6: 714+21, V5: 493+6, V3: 151+3, V4: 120+1, V7: 93+3, V9: 64+10, V8: 53).

- **Bootstrap era (2026-03-12 → ~04-05)**: raw content commits — `Update index.md`, `Add files via upload` (`00d71af1`, `a5e6b813`, both 2026-03-15). No "V" numbering yet. `ventus-core.js` created 2026-04-05 (`d4142e41`).
- **Sandbox-clone era / "V" proliferation (2026-04-24 → 05-17)**: each experiment gets a full-directory clone named `vN`. `d398045e` "Create V6 experimental sandbox - clean copy of V5" (2026-04-24), `6c702cca` "Create V7 as full clone of stable V6" (same day), `78a0b283` "Homepage: promote V7 to stable, add V8 entry" (2026-04-25), `6ce49aa4` "Add repd_grid_atlasv9 — isolated copy of V8" (2026-04-27). Later "Add V4 to V5 clone script" (`23d28301`, 2026-05-17) shows the clone pattern being formalized as tooling.
- **Automated gridbot era (2026-05 → 06)**: scheduled-workflow commits dominate — `Automated price update:`, `Automated EV charger update:`, `Automated UK grid update V6 (both):`. "gridbot" mentions: 37 in 2026-04, 287 in 2026-05, 631 in 2026-06 (`git log --grep=gridbot -i`). This is the highest-volume period (see §3).
- **Quiet/manual-content era (2026-07-06 → 07-29)**: near-silence punctuated by bursts — homepage restore-point protocol (`1b00508c`, `f3a93ae5`, 2026-07-08: "Add homepage version control protocol", "Document homepage restore point workflow"), article publishing (2026-07-24), spider-tool linking (`9673c7a7`, 2026-07-06).
- **V11 validation-authority era (2026-08-03 → 08-04)**: short, dense burst — `a96883d6` "publish V11 live build monitor", `d1616318` "pin V11 monitor to validated full-array build", `5d57cf49` "fix: expose immutable V11 validation authority" — introduces "validation authority" / "immutable" vocabulary not seen earlier.
- **V5→V9 UI-parity rebuild burst (2026-08-22 → 08-23)**: 110 commits on 08-22 alone. Subjects show forced reconciliation across versions: `d1... "Publish V7 MVP from V5 baseline"`, `"Generate V6 dashboard from complete V5 source"`, `"V9.2: restore V5 UI and mobile without losing V9 features"`, `"V9.3: restore proven V5/V7.1 UI without losing V9 features"`.
- **Multi-repo split / "GridAtlas V8 sentinel" era (2026-08-24 → present)**: globalgrid2050 starts hosting *sync* workflows pointing at external repos rather than the atlas code itself — `.github/workflows/202608300232-sync-promoted-gridatlas-v9.yml`, `catalogue-gridatlas-v9.yml`. Commit style shifts to timestamp-prefixed narrative messages, e.g. `1f8ecfe9` "202608312339: withdraw the non-answers, and give the pipeline its electricity context" (2026-08-31), `d48f243e` "homepage: feature current verified Grid Atlas V9 202608292311" (2026-08-30). "sentinel" itself does not appear as a literal token in commit subjects (0 hits); "snapshot" appears 24 times, "homepage" 97 times — this era is dominated by homepage-as-index-of-record language.

## 2. Added, abandoned, redone

- **Added and never removed**: `REPO_STRUCTURE.txt` (added once, 550 revisions, never deleted), `index.html` (added once `git log --diff-filter=A` = 1 hit, 227 revisions, never deleted).
- **Redone ≥3 times (the `vN` clone pattern)**: `repd_grid_atlasv6` (100 touching commits), `v7` (107), `v8` (109), `v9` (109) — each created as "full clone of stable" predecessor rather than an in-place upgrade (`d398045e`, `6c702cca`, `78a0b283`, `6ce49aa4`). `uk_energy_tracking` was similarly re-forked: `uk_energy_tracking` (7 commits, earliest) → `_v2` (10) → `_v3` (16) → `_v4` (22) → `_v5` (35, plus 61-186 revisions per constituent file) → `_v6` (137, plus a further fork `_v6_2` created `2fb56b36` "Clone Generation History V6 to V6 2", 2026-06-09; 49 commits). Six generations of the same directory concept.
- **Abandoned and deleted, not re-created in place**: `repd_grid_atlasv9` inside globalgrid2050 was deleted `4a63a99f` "Delete repd_grid_atlasv9 directory" (2026-05-09), four months before V9 reappeared as the standalone `gridatlas` repo (see §5).
- **Explicit retire/deprecate language**: "retire" 11 hits, "deprecat" 3 hits, "revert" 7 hits (`git log --grep` counts) — small relative to 4524 total commits; abandonment in this repo is done mostly by silent supersession (new `vN` clone) rather than explicit deprecation commits.

## 3. Commit velocity by month (`git log --format=%ad --date=format:%Y-%m | sort | uniq -c`)

| Month | Commits |
|---|---|
| 2026-03 | 733 |
| 2026-04 | 479 |
| 2026-05 | 1443 |
| 2026-06 | 1560 |
| 2026-07 | 46 |
| 2026-08 | 235 |
| 2026-09 (to 09-04) | 28 |

Discontinuities: a **~30x drop** from June (1560) to July (46) — July's activity is clustered into five isolated bursts (07-06, 07-08, 07-10, 07-24, 07-26 to 07-29) with long silent gaps between, e.g. no commits 07-11 → 07-23. A second within-August discontinuity: near-silence 08-05 → 08-21, then **110 commits in a single day (2026-08-22)** and 45 more on 08-23 — the V5/V9 UI-parity burst in §1. From 08-24 onward, globalgrid2050's own daily volume drops again (single digits to low tens) as the newer standalone repos (pipelinenews 08-24, gridatlas 08-29, cvaa 08-30, grid-distance-maths 08-31, data-grid-gb 09-01) absorb the work — pipelinenews alone logs 269 commits in 08-2026 and 134 in 09-2026 to date; gridatlas logs 158 in 08-2026 and 178 in 09-2026 to date.

## 4. Files with the most revisions (`git log --format=format: --name-only | sort | uniq -c | sort -rn`)

1. `REPO_STRUCTURE.txt` — 550. A generated repo map; churns on every structural change, i.e. every clone/delete of a `vN` directory.
2. `index.html` — 227. The homepage; rewritten each time a new atlas/pipeline version is promoted or a link is fixed.
3. `uk_energy_tracking_v5/live_grid_frequency.json` — 186. Scheduled data feed, rewritten on every automated grid-frequency poll.
4. `uk_energy_tracking_v5/grid_frequency_history.csv` — 186. Same feed, append/rewrite pattern.
5. `uk_energy_tracking_v5/live_grid_frequency_weekly_health.json` — 185.
6. `uk_energy_tracking_v5/grid_frequency_weekly_health.csv` — 185.
7. `gridbot_reports/uk_frequency_v5_report.md` — 185. Auto-generated report paired with the above feed.
8. `33kv_uk_dap_price_estimator/index.md` — 176. Manually curated pricing content, edited repeatedly.
9. `uk_energy_tracking_v6/live_grid_frequency_weekly_health.json` — 148 (the V6 generation of item 5/6).
10. `uk_energy_tracking_v6/live_grid_frequency.json` — 148.
11. `uk_energy_tracking_v6/grid_frequency_weekly_health.csv` — 148.
12. `uk_energy_tracking_v6/grid_frequency_history.csv` — 148.
13. `gridbot_reports/uk_frequency_v6_report.md` — 148.
14. `uk_energy_tracking_v6/live_grid_price.json` — 138.
15. `uk_energy_tracking_v6/live_grid_energy.json` — 138.
16. `uk_energy_tracking_v6/electricity_price_history.csv` — 138.
17. `uk_energy_tracking_v6/electricity_price_history.json` — 137.
18. `data/confirmed/pvlive_solar_daily_BACKFILL_PROGRESS.json` — 125, and `data_science_protocol/audit_reports/SOLAR_MONTHLY_BACKFILL_LATEST.md` — 125: a long-running backfill job.
19. `lv_ac_dc_price_estimator/index.md` — 112. Sibling estimator to item 8.
20. `copper_and_aluminium_prices_historic_trends.md` — 111, revised 2026-03-22 through 2026-06-18 (spot-checked via `git log -- copper_and_aluminium_prices_historic_trends.md`) — a long-lived manually-maintained content page, not a bot feed.

Interpretation: the top of the list is split between (a) a bot-driven data-feed family (`uk_energy_tracking_vN/*`, duplicated per version generation, §2) and (b) two structural bookkeeping files (`REPO_STRUCTURE.txt`, `index.html`) that must be touched on almost every organizational change.

## 5. Duplication by migration (best-effort; marked where unconfirmed)

- **Confirmed, direct**: `ventus-core.js` (`d4142e41`, 2026-04-05) → cloned to `ventus-corev6engine.js` (`f841ac89` "V6: Copy engine files locally", 2026-04-24) → `ventus-corev9engine.js` (present by `d98ac54c` "Update ventus-corev9engine.js", 2026-04-27, inside `repd_grid_atlasv9` which was deleted `4a63a99f` 2026-05-09) → geodesy/nearest-search logic re-extracted 2026-09-04 into the brand-new standalone repo `ventus-grid-engine` as `engine/v9-geodesy.js`, `engine/v9-nearest-search.js`, with explicit `docs/v8-duplication.md` and `docs/v9-duplication.md` files documenting the duplication itself (`git ls-files` on `ventus-grid-engine`, commit `3589fac` "isolate the grid engine maths and the deep-link contract, with proofs that can fail", 2026-09-04).
- **Confirmed, atlas migration**: `repd_grid_atlasv9` deleted from globalgrid2050 2026-05-09 (`4a63a99f`); by 2026-08-29 a same-named concept ("Atlas V9") reappears as the initial content of the new standalone `gridatlas` repo (`a35daa1` "add Atlas V9 REPD REPD CI/CD control plane", `0777dc7` "publish verified Atlas V9 address search" — both 2026-08-29); globalgrid2050 then adds sync-only workflows referencing it (`202608300232-sync-promoted-gridatlas-v9.yml`).
- **Confirmed, explicit importer**: `pipelinenews` repo's second commit is `9e402c8` "Add one-time V1-V9 legacy importer" and third is `691175e` "Import V1-V9 legacy lessons from GlobalGrid2050" (both 2026-08-24) — a self-declared migration of globalgrid2050 lessons/logic into the new repo.
- **Candidate, not confirmed**: `gridatlas`'s `.github/workflow-archive/202608301321-hostile-amnesia/*` and `pipelinenews`'s `.github/workflow-archive/20260830-email-storm/*` directories both contain many timestamp-named `build-verify-publish-atlas-v9*.yml` variants — the naming suggests both repos independently regenerated near-identical CI workflows for the same "Atlas V9" concept in the same 48-hour window (2026-08-29 to 08-30), but a byte-level diff between the two archives was not performed — flagged as unverified duplication, not confirmed identical.
