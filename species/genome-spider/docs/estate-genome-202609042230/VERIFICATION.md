# Verification of the genome findings — by the coordinating session, 2026-09-04

Read this BEFORE `fleet-findings.md` and `genome.md`. The agent that wrote them
ran the cvaa antibodies against a Windows working copy. Three of its headline
findings are artefacts of that, not defects in the estate. They fail in the
same direction, which is itself the finding.

## Did not survive verification

| finding as written | what is actually true | how checked |
|---|---|---|
| **#1 LIVE — gridatlas release checksums do not verify** | The release is intact. 22 of 22 files fail `sha256sum -c` on raw bytes and **0 of 22** fail after CRLF→LF normalisation. The composition manifest declares LF-normalised hashes; the working copy has CRLF. | `sha256sum -c` raw, then per-file `sed 's/\r$//' \| sha256sum` against `sha256sums.txt` in `atlas/releases/202608300453-atlas-v9/` |
| **#6 LATENT — no repo pins line endings (no `.gitattributes`)** | gridatlas has one (121 lines), cvaa (72), pipelinenews (72), ventus-grid-engine (2). The antibody's detector is wrong, or was run from the wrong directory. | `ls .gitattributes` in each |
| **#3 — ventus-grid-engine generation 60 minutes off UTC** | Stamp `202609041500`; commit time in UTC `202609041500`. Exact. The antibody's code IS UTC-correct (`toISOString`, `Date.UTC`), so this is not a timezone bug in the vaccine; the specific finding on this repo is unexplained and unverified. | `TZ=UTC git log -1 --date=format:%Y%m%d%H%M` |

The wider #3 claim — generation stamps out of order across repos — is
**partly real**: gridatlas `4b3fd52` is stamped `202609021625` and sits after
`202609040337` in history (a September-2 stamp landing after a September-4 one).
The *ordering* violations hold. The *minutes-off* counts should be re-run in CI
on the repository's own bytes before being quoted.

## Survived, and were understated

| finding | verified value |
|---|---|
| redo-by-clone: `repd_grid_atlasvN` cloned "4 times" | **6** — v3, v4, v5, v6, v7, v8 present in `globalgrid2050` |
| `uk_energy_tracking` forked "6 times" | **7** — `uk_energy_tracking`, `_v2` … `_v6`, `_v6_2` |
| a deleted directory later reappeared as the `gridatlas` repo | confirmed: `4a63a99f` 2026-05-09 "Delete repd_grid_atlasv9 directory"; `gridatlas` (atlas-v9) first commit 2026-08-29 |
| cvaa runner fixed upstream `9065d727` 2026-08-31 | consistent with `inoculate`/`fleet` running here |
| `replay.mjs` broken | true, but it fails **loudly** — exit 1, 2,338 bytes of stderr — not silently as written. Cause: `catch (e) { out = e.stdout.toString() }` throws when `e.stdout` is null |
| 2026-08-31 homepage outage documented in vaccine `202608312045-page-data-block-parses.md` | not re-verified; the vaccine text is the record |

## What this means

cvaa's antibodies are trustworthy **only when run in CI on the repository's own
bytes**. This laptop's working copy carries CRLF line endings and the
antibodies read it raw. The same trap already put a permanently-red check into
gridatlas (fixed today in `202609041330-substation-intelligence.proof.mjs`).
The genome spider's CI runner is the right instrument for antibodies; the
laptop is the right instrument for writing them.

The most fragile thing in the estate is therefore not the timestamp scheme the
agent named. It is **redo-by-clone**: six atlases, seven trackers, and a v9
deleted in May that came back in August as a new repository. Timestamps make
that recoverable; they do not stop it. `ventus-grid-engine` exists to stop it
for the grid maths, and the population spider is the mechanism.
