# Internal engineering review backlog

Moved off the public homepage at the user's request. The original 96 acceptance criteria and dependency order are retained in `20260906-internal-review-96.json`. This backlog is separate from the 30 feature publications and the canonical 100-increment graph.

The last scheduler record at 2026-09-06 02:24 UTC still has eight identity receipts and 88 pending steps. Its hourly refresh only validates receipt files; it does not perform engineering reviews. Historical identity receipts pin earlier commits, so new application evidence must state its own exact source and cannot silently upgrade those receipts.

| Track | Review IDs | Current evidence to reconcile, not automatic completion |
|---|---|---|
| Release composition | R01-R12 | Atlas241 composition/token equivalence and strict payload guard under test; full gate remains required. |
| Cable geometry | R13-R24 | Claude corridor and site-geometry views at GlobalGrid895cadcf observed; original reported app.js defect needs exact-source reproduction. |
| GRID / SUBS controls | R25-R36 | Atlas228 scoped54/54 desktop/mobile controls checks; source714d873, publication63acce00, served28/28. |
| Project deep links | R37-R48 | Berwick9873 completes in Atlas228 at desktop/mobile; Torness78.96km straight. Separate offshore highway-factor error has a draft correction. |
| App-only PDF | R49-R60 | App print action and complete visible content still require dedicated review. |
| GIS SLD isolation | R61-R72 | Existing SLD proof fixtures being reconciled with current composition; independent failure behavior remains part of acceptance. |
| Source print integrity | R73-R84 | CI dependency closure21b3e2a checked into TestCode; print-download dependency closure is a separate pending check. |
| GPU evidence | R85-R96 | 108 study executions are not GPU correctness evidence; adapter/input attribution and GPU numerical validation remain separate. |

Each track retains twelve phases: identity, entrypoints, dependencies, contracts, implementation trace, baseline, alternative explanation, negative fixture, boundaries, independent cross-check, minimal change, decision card. Attach hashed evidence for the selected commit before marking a phase verified. No elapsed time, publication count, or unrelated green CI substitutes for these criteria.

The public calendar clocks remain presentation content. Internal counters, pending-review counts and the review snapshot are removed from the homepage.
