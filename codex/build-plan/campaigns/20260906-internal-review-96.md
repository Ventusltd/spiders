# Internal engineering review backlog

Moved off the public homepage at the user's request. The original 96 acceptance criteria and dependency order are retained in `20260906-internal-review-96.json`. This backlog is separate from the 30 feature publications and the canonical 100-increment graph.

The last scheduler record at 2026-09-06 02:24 UTC still has eight identity receipts and 88 pending steps. Its hourly refresh only validates receipt files; it does not perform engineering reviews. Historical identity receipts pin earlier commits, so new application evidence must state its own exact source and cannot silently upgrade those receipts.

| Track | Review IDs | Current evidence to reconcile, not automatic completion |
|---|---|---|
| Release composition | R01-R12 | Owner PR16 restores the payload budget without changing executable tokens. R01 review reproduced required-cartridge omissions accepted by two composition checks; owner17b3d41 adds an explicit contract and rejects12/12 actual command/omission fixtures. Full CI acceptance remains separate. |
| Cable geometry | R13-R24 | Legacy /cable_geometry/ reproduced three syntax errors and three blank canvases on desktop/phone at source9d364a21. Owner8666179 restores syntax and a reachable Drawing View exit;30 actual browser checks plus14 existing owner tests pass. New0432 TestCode publication is separate from the working modular v7 Cable layer. |
| GRID / SUBS controls | R25-R36 | Atlas0401 passed106 live desktop/phone/touch checks;0418 additionally passes Firefox/WebKit polygon interactions. Candidate0435 adds native keyboard collapse/expand, focus restoration and44px controls, with116 local checks; acceptance requires its exact CI and live receipt. |
| Project deep links | R37-R48 | TestCode0300 corrects offshore highway-factor application. Owner draft PR17 (cc809cb) renders the actual measured transmission endpoint beyond40km without duplicate links; Bellrock/Berwick actual browser geometry checked. Owner main remains separate. |
| App-only PDF | R49-R60 | Actual0418 File Print invokes Teleprinter app-render download, not the inherited window.print handler. Chromium/Firefox DPR1 and WebKit DPR3 phone/desktop downloads preserve the polygon; independently rendered PDF visibly retains measurements. Rejected driver assumption and exact entrypoint closure are recorded in TestCode160f406 sandbox/reports/202609060428-print-source-review.md. |
| GIS SLD isolation | R61-R72 | Existing SLD proof fixtures being reconciled with current composition; independent failure behavior remains part of acceptance. |
| Source print integrity | R73-R84 | Actual0418 source download independently verifies56 complete resource bodies and all4 pinned executable cartridges, with exact polygon state. Browser discovery correctly remains incomplete: one local diagnostic404 and11 discovery warnings are disclosed. No claim that all dormant/server dependencies are captured; see TestCode160f406 review report. |
| GPU evidence | R85-R96 | 108 study executions are not GPU correctness evidence; adapter/input attribution and GPU numerical validation remain separate. |

Each track retains twelve phases: identity, entrypoints, dependencies, contracts, implementation trace, baseline, alternative explanation, negative fixture, boundaries, independent cross-check, minimal change, decision card. Attach hashed evidence for the selected commit before marking a phase verified. No elapsed time, publication count, or unrelated green CI substitutes for these criteria.

The public calendar clocks remain presentation content. Internal counters, pending-review counts and the review snapshot are removed from the homepage.
