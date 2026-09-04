# Today: 2026-09-04, across the estate

Repos checked: globalgrid2050, pipelinenews, gridatlas, spiders, cvaa, data-grid-gb,
grid-distance-maths, ventus-grid-engine, data-gridatlas, data-gb-electricity,
data-centres-gb, data-interconnectors, companies, claude, gb-electricity-ui, gemini,
codex-chatgpt, chatgpt-audits, data-federation-map-for-globalgrid2050-all-repos.

**5 repos had commits today**: `claude` (14), `gridatlas` (13), `pipelinenews` (6),
`globalgrid2050` (4), `ventus-grid-engine` (2, and the repo itself was created today).
The other 14 repos exist as git checkouts but had zero commits with author/commit date
2026-09-04.

All times below are commit-date local (`+01:00` BST) unless marked UTC.

---

## Headline: gridatlas version progression, v9.99 → v9.115

`gridatlas` ships via an immutable-shell/hashed-cartridge release system: every commit
that changes what's live rewrites `atlas/current.json`, whose `generation` field is a
12-digit `YYYYMMDDHHMM` id and whose `version`/`composition_version` field is the
`v9.NNN` the estate tracks. Today ran the pointer through ten steps, not the "202609041221
through 202609041957" range alone — that four-generation window (v9.108→v9.111→v9.115)
is only the last third of the day; the chain actually starts at 00:16 with v9.99.

| version | generation | time | commit | what it did |
|---|---|---|---|---|
| v9.99 | 202609032316 | 00:16 | `cef7b8f` | Fixed the cartridge-ceiling headroom gauge, which was reading the wrong limit (409,600-char composer boundary) instead of the one that actually fails the build (368,640-char cartridge ceiling) — a 1,171-fold overstatement of remaining headroom. No functional change; the number printed first is now the one that can fail the build. |
| v9.102 | 202609040047 | 01:50 | `6d2bad3` | Kept mobile layer controls hittable above the docked project card, accepted the full canonical Pipeline technology vocabulary, added transit alias hydration, and locked 8,756 immutable Pipeline map-link coordinates into a proof. v9.100–v9.101 (not separately listed) were composed and explicitly rejected as pre-promotion evidence rather than shipped. |
| v9.103 | 202609040058 | 02:07 | `03ac1fd` | Quarantined the never-live v9.100–v9.102 generations, restored the rollback lineage to point at v9.99, added rendered rejection reasons, and ran a locked 393×852 (mobile viewport) Chromium hit-target proof in CI at the exact commit head rather than a moving branch tip. |
| v9.104 | 202609040134 | 02:35 | `ab80d45` | Fixed mobile layer controls disappearing when the map entered fullscreen (the menu-bar/layer-chip DOM was not surviving the fullscreen transition on phones). |
| v9.105 | 202609040219 | 03:27 | `5cb9561` | Made unrenderable transit layers report their failure honestly instead of silently doing nothing — added a `transit-layer-availability` module and browser proof asserting the UI tells the reader when a layer genuinely can't render. |
| v9.106 | 202609040337 | 04:46 | `2d8cc7b` | Made a Pipeline News deep-link arrival that finds nothing report an honest "not found" and become retryable, instead of failing silently; added `place-global-search` and `arrival-identity` cartridges/proofs plus a UK-gazetteer flyto proof. |
| v9.107 | 202609040403 | 05:21 | `73ad1bd` | Hoisted seven SLD (single-line-diagram) styles out of the sandbox cartridge and into `substation-intelligence`, consolidating style ownership rather than duplicating it per cartridge. |
| — | — | 10:00 UTC | `4b3fd52` (author "Claude") | Non-version-bumping: pinned four past compositions (v9.68, v9.74, v9.75, v9.77-live) at their own `atlas/v/<generation>/` routes so a specific version could be tested by URL instead of argued about from memory — additive only, `current.json` and the live route untouched. |
| v9.108 | 202609041221 | 13:22 | `f70a4a6` | Fixed the OSM/CARTO/Open Charge Map map-credit attribution being visually covered by the menu bar on desktop widths — it only cleared the bar under `body.fs-active` (set automatically by the mobile touch-arrival flow), so desktop, which never sets that class, painted the credit directly under the bar where `elementFromPoint()` resolved to the ABOUT menu instead. Fix measures the bar's live height via `ResizeObserver` and writes a CSS custom property, unconditional on width or fullscreen state. |
| v9.111 | 202609041330 | 14:32 | `64268fd` | Recovered work lost when "the machine crashed" mid-composition at 13:05 UTC — v9.109 and v9.110 had been composed and hash-coherent but never shipped, so live stayed on v9.108 with a third of every REPD deep link failing (`wind_offshore`/`wind_onshore` and others 0/7 on live, measured in headless Chromium). Also fixed a phone-only defect where the v8 fullscreen letterhead and the fused menu-bar masthead both painted at once, showing two VENTUS wordmarks (measured on an iPhone-13 viewport, second wordmark at x=254 overlapping the SCOPE/GRID/ABOUT titles). |
| v9.115 | 202609041957 | 20:59 | `b7a40d1` | The big one of the day: found that an iOS Safari arrival fix (`202609041234-sld-sandbox-technology-buckets.js`) existed in the repo but had never been composed into what v9.111 actually shipped — live was still failing exactly as the architect reported twice on his own phone (menu bar/attribution/basemap fine, camera never moved off default UK view, no card, no links). Root cause: Pipeline News' MAP control opens in a background tab (`target="_blank"`) on touch devices, and iOS Safari never ticks `requestAnimationFrame` for a tab that isn't composited, so MapLibre's `flyTo()` and the engine's paint-gated boot silently never progress — the arrival burns its whole budget against a camera that never moved and nothing re-triggers it. Fix: charge the timeout budget in visible time only, never start the arrival while the document is hidden, re-run an arrival that produced no visible outcome the first time the tab is actually seen (capped at 5 attempts), bounded overall by a 10-minute absolute wall-clock ceiling so a tab never made visible doesn't poll forever. Also collapsed to one DuckDB runtime (from two) and restored the phone's layer chips to the map. |

---

## ventus-grid-engine: new repo, created today

Created today with two commits and nothing before it — this is a brand-new repo in the
estate, not a fork or import history.

- **`06c05e4` (14:03, author Ventusltd)** — bare initial commit, just a `.gitattributes`.
- **`3589fac` (15:00, author Vikram Kumar) — "v0.1.0: isolate the grid engine maths and
  the deep-link contract, with proofs that can fail"** — the substantive commit, 44 files,
  ~6,388 insertions.

**What it is**: extraction of the grid engine's pure mathematics and the Pipeline
News → GridAtlas deep-link contract out of the two applications that had each grown
their own copies. It sits alongside `data-grid-gb` (network data) and
`grid-distance-maths` (geodesy) as a third piece the estate previously lacked: an
owned, tested engine.

**Why it was created**: two problems surfaced in the same week that motivated pulling
this out on its own.

1. `ventus-corev8engine.js` (1,427 lines, one closure) had four duplicated/near-duplicate
   geometry implementations with nothing comparing them: two of three area formulas were
   byte-identical copy-pastes (verified to agree to 8 decimal places on a reference
   polygon, 0.30664823 km²) with a drift only in the acres conversion; the third
   (a spherical-cap-from-radius formula) was correctly *not* merged because it solves a
   different problem; and a fourth undetected duplication was two identical
   destination-point circle generators, differing only in vertex count.
2. The Pipeline News → GridAtlas deep link had no single owner — the emitter and
   receiver never imported a shared contract and silently drifted apart, causing a
   100% failure rate on 2,508 of 7,680 register rows (`wind_onshore`/`wind_offshore`/
   `other` technology buckets) while the arrival's own self-check reported green. This
   is the same defect gridatlas v9.109/v9.111 (above) fixed in production; this repo is
   where the correction table now lives as one importable/testable thing
   (`deeplink/contract.js`).

On the earth-radius constant specifically, the commit records that the "obvious" fix
(switching to the IUGG mean radius) would have been wrong — it follows the R_ATLAS /
R_UK / R_MEAN decision already recorded in `grid-distance-maths/docs/EARTH-MODEL.md`,
and a proof now asserts `R_MEAN < R_ATLAS < R_UK` so that trap can't be walked into
again. The repo ships 3 proof files / 69 checks and a `sources/provenance.json`
recording the origin repo, file path, line range, and commit SHA behind every extracted
function — each function is stated to be extracted verbatim, not rewritten, with any
unavoidable change marked in-file.

---

## globalgrid2050 (4 commits, 00:30–00:36)

All four commits are same-morning fixes to the automated homepage catalogue compiler
that keeps the public GridAtlas listing truthful:

- **`5efdc5e` (00:30)** — the compiler had been unable to run since 30 Aug because it
  identified its governed catalogue row by counting a substring match on an href, and a
  banner added that day happened to contain the same href as a prefix (3 matches instead
  of 2), so the compiler refused to run rather than risk editing the wrong line. Fixed by
  identifying the row structurally via `GRIDATLAS_V9_AUTOMATION` markers instead of
  counting hrefs.
- **`5c700a4` (00:31) — "the homepage names the Grid Atlas that is actually being
  served — v9.99"** — the public homepage said v9.98 while the live site had actually
  been serving v9.99 since generation 202609032315 (confirmed by fetching the live
  manifest, not the repo). Fixed by running `catalogue_gridatlas_v9.py
  refresh-composition`, which now moves the version number, note prefix, and two other
  identity fields together so they can't disagree again.
- **`ea97bf0` (00:35)** — records Pipeline News release 202609032329 going live
  (7,680 records, 3,047 carrying a grid measurement, 4,633 without one — of which 4,605
  hold a register coordinate and 28 have none at all).
- **`7d0078b` (00:36)** — a follow-up correction: when the compiler moves the version
  identity fields but the descriptive note text still describes an earlier build, it now
  says so in plain English on the public row ("notes written for v9.99 · …") rather than
  silently leaving stale prose next to a new version number, since only a human can
  rewrite the prose itself.

## pipelinenews (6 commits, 00:18–00:35)

Mostly cartridge-based issue tracking (this repo runs a "cartridge" pattern where each
defect/fix is its own JSON/markdown file under `tools/intelligence/cartridges/`):

- **`68c5fb6` (00:18)** — six cartridges marked `SPENT`, i.e. their "PATCH FAILED"
  status was reclassified as already-applied rather than genuine drift.
- **`b0a94be` (00:27)** and **`ade103a` (00:35)** — new cartridges: a dash character in
  a UI cell was being read as "a search that returned nothing" rather than "no search
  ran"; and the phone-width ACTIONS column had non-answer states that weren't reachable/
  tappable on a phone.
- **`0bc5efd` (00:28)** — a seventh SPENT note recording that `wider-fleet-proximity`
  is the one cartridge in that batch that fails when reopened (OPEN state), i.e. not
  actually resolved.
- **`5f9b4c4` (00:31)** — cartridge for a SUB-layer hover that was inventing a name for
  an unnamed layer instead of stating it has none.
- **`face863` (00:32)** — the release 202609032329 assets themselves land in the repo
  (chart/CSS/JS bundles), which is what globalgrid2050's `ea97bf0` (above) then points at
  as live.

## claude (14 commits, 00:00–00:38)

This is the estate's cross-repo coordination/ops-log repo — session logs, a
"Codex CTO control channel," a local-model triage tool, and CI workflow definitions.
All 14 commits land in a 38-minute window right at the start of the day (tail end of an
overnight session):

- **`e16832b`, `1c35da6`** — recorded Ollama env-var contention between concurrent
  lanes, then opened a "Codex CTO control channel" session log.
- **`4b7d30c`, `8d46a3f`, `ae1a340`** — coaching/audit session: a local model was run
  against 76 answers and found to have invented nothing; a 44-row "red board" was
  re-graded, including one finding the auditor's own instrument had itself invented; and
  `familiars/triage.py` (a new ~1,174-line script) was added to re-triage all 44 reds
  through the local model, rejecting any answer not traceable to the log.
- **`bf5a557`, `cf6e83f`** — replies on the CTO channel: one covering the ceiling gauge
  bug (same defect as gridatlas `cef7b8f`/v9.99 above), a merge hazard, and two counters
  that read as false alarms; the other accepting additive GridAtlas/resource protocols
  from Codex.
- **`916ebc7`, `7677a29`, `078cd0c`, `d09233b`** — a running command log opened, a
  milestone report ("Pipeline 30 and GridAtlas 10"), three rulings (a hoist authorised,
  "Actions is not a compute farm," and what "corrected across all projects" has to mean),
  and a late correction plus a data defect logged at session close.
- **`c5c25a2`, `4d0b09a`** — "Lane A" discovery: 16 measured findings plus screenshots
  reproducing the architect's own Atlas screen, added as `logs/queue/FINDINGS.md` and a
  session folder.
- **`6335304`** — added four new GitHub Actions workflows (estate-link-crawl,
  ci-history-mine, clean-clone-byte-survey, llama-cpu-benchmark), framed in the commit
  message as "Actions as a second machine" — using CI runners as a second compute lane
  alongside the local model, closing out three parallel surveys with one measured
  answer on inference.

## No activity today

`spiders`, `cvaa`, `data-grid-gb`, `grid-distance-maths`, `data-gridatlas`,
`data-gb-electricity`, `data-centres-gb`, `data-interconnectors`, `companies`,
`gb-electricity-ui`, `gemini`, `codex-chatgpt`, `chatgpt-audits`, and
`data-federation-map-for-globalgrid2050-all-repos` all exist as git repositories in the
estate but had no commits dated 2026-09-04.
