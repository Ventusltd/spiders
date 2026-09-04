# CVAA antibody inventory

Extracted from the vaccine files' own front matter and Disease/Symptom sections (`cvaa/vaccines/*.md`), not from guesses. Two sources, kept distinct — see `runner-status.md` §"Vaccine count discrepancy" for exactly why there are two lists:

- **Part A (27 files)**: physically present in the local working checkout (26 committed at HEAD `c18cc13`, plus 1 uncommitted local-only file). These are the ones this session actually ran against real repos — see `fleet-findings.md`.
- **Part B (5 files)**: exist only on `origin/main` (`a1678df`, current as of today), added today via "Merge autonomous release-control vaccines." Extracted read-only from `git archive origin/main`; not exercised against live repos this session.

"Applies to" is inferred from each vaccine's own Symptom text (which names the repo(s) the disease was observed in) plus its Disease mechanism (what kind of repo could exhibit it), since no vaccine file declares an explicit machine-readable scope field. Marked "(generic)" where the mechanism applies to essentially any repo in the federation with the relevant artefact (workflows, a scope ledger, a release pointer, etc.).

## Part A — the 27 vaccines this session actually ran

| # | Vaccine | Prevents (plain sentence) | Applies to |
|---|---|---|---|
| 1 | one-active-scope | Two sessions/agents opening parallel scope-of-works entries and mutating the same files with conflicting intentions. | Repos using the scope-of-works ledger convention: gridatlas, pipelinenews, cvaa. |
| 2 | no-app-copies | An AI copying the whole application into a new timestamped folder instead of extending the existing one. | Repos with an app tree released by generation folders: gridatlas; historically globalgrid2050. |
| 3 | no-per-release-workflows | Writing a brand-new CI workflow per release (hard-coding one RELEASE_ID) instead of reusing a generic one, turning the workflow folder into a graveyard. | Any repo with `.github/workflows`: gridatlas, pipelinenews, globalgrid2050 (all three FAIL this — see fleet-findings.md). |
| 4 | no-expiry-windows | *(superseded by no-time-based-gates)* Encoding a session's own lifetime as an expiry timestamp in automation. | (generic, workflow-bearing repos) — superseded, always skipped. |
| 5 | self-terminating-loops | A scheduled job with no "nothing to do" exit path, so it fails red forever or commits noise forever. | Any repo running cron workflows: gridatlas, pipelinenews, globalgrid2050. |
| 6 | chaining-token | A workflow pushing with the default `GITHUB_TOKEN`, which GitHub does not chain into further Actions runs, so downstream automation silently never fires. | Any repo chaining workflows via commits: gridatlas, pipelinenews, globalgrid2050 (heaviest), data-grid-gb. |
| 7 | pointer-verifies | The live-release pointer being hand-edited across several files (index.html, current.json, live-set.json, etc.) with nothing cross-checking they agree or that the named release is intact. | Repos with a release pointer: gridatlas (fails this live — see fleet-findings.md). |
| 8 | derived-state-not-authored | A hand-written state file (e.g. STATE.md) drifting from git truth because it's written once and never reconciled. | Repos with derived state files: gridatlas. |
| 9 | context-diet | Handing an AI agent the whole repo or whole history so it runs out of context and produces partial/contradictory work. | (generic) any repo briefing AI agents. |
| 10 | rollback-exists | A promotion workflow that can move the live pointer forward with no code path to move it back. | Repos with deploy/promote workflows: gridatlas. |
| 11 | registry-integrity | A malformed, duplicated, or fabricated vaccine being silently skipped instead of failing the whole registry load, so every consumer reports "immune" to a disease nobody is actually testing for. | cvaa itself only (registry-level check). |
| 12 | no-dangerous-apis | Antibody code — which is executable and pulled from a repo — reaching the network, shell, or environment, turning the vaccine registry into a supply-chain attack vector (cites CVE-2025-30066 / tj-actions). | cvaa itself only (registry-level check). |
| 13 | pinned-actions | A workflow referencing a third-party GitHub Action by a movable tag (e.g. `@v4`) instead of a pinned 40-char commit SHA, so whoever moves the tag runs code in CI with the repo's secrets. | (generic) any repo with `.github/workflows` — warns on all 8 repos tested except gridatlas and grid-distance-maths. |
| 14 | least-permissions | A workflow running with write permissions (e.g. `contents: write`) it never uses, widening blast radius if a step or a prompt-injected agent is compromised. | (generic) any repo with `.github/workflows`. |
| 15 | agent-quarantine | An AI-agent workflow step reading untrusted repo content in the same job that can push/deploy — the "lethal trifecta" (private data + untrusted input + outbound action). | Repos with AI-agent-driven workflows: gridatlas, cvaa. |
| 16 | vocabulary | Status words drifting between sessions (done/complete/closed) so the ledger loop can no longer parse state reliably. | Repos with a scope-of-works ledger: gridatlas, pipelinenews, cvaa. |
| 17 | monotonic-utc-generations | Two sessions stamping 12-digit generation IDs from two different clocks (e.g. local BST vs UTC), so the estate's only ordering mechanism runs backwards. | Any repo using 12-digit generation timestamps: gridatlas, globalgrid2050, pipelinenews, cvaa, data-grid-gb, grid-distance-maths, ventus-grid-engine — FAILS on every one of the 8 repos tested (see fleet-findings.md). |
| 18 | on-ledger-commits | Work landing on `main` without a citing scope-of-works file, so the ledger becomes a partial diary rather than the estate's actual memory. | Repos with a scope-of-works ledger: gridatlas, pipelinenews, cvaa. |
| 19 | executor-declared | The ledger claiming an agent did work that a script actually replayed (or vice versa), misdescribing how a change actually happened. | Repos with a scope-of-works ledger: gridatlas (FAILS — 8 scope files with no executor field, see fleet-findings.md). |
| 20 | loop-exists | The perpetual automation loop being quietly retired (its cron removed) while the ledger still implies it's running. | Repos with a scheduled scope-loop workflow: gridatlas (FAILS — schedule removed from scope-loop). |
| 21 | rollback-exercised | Rollback code existing on paper with no commit in history showing it was ever actually run — the first real rollback would be the first test of it. | Repos with rollback code: gridatlas. |
| 22 | attestation-freshness | A live-site attestation being trusted forever after being written once, with nothing re-verifying it. The vaccine's own Symptom section documents a measured limitation: it currently only checks that the pointer and the attestation *agree*, not that verification is actually *recent* — an "immune" result here means "pointer and attestation agree," not "this was recently re-verified." | gridatlas (has `atlas/state/live-set.json`; FAILS today — pointer changed after the last live attestation). |
| 23 | full-history-checkout | CI running on a shallow (depth-1) checkout, so every vaccine that reads git history sees nothing and the repo falsely reports immune. | cvaa's own CI, and any consumer repo's CI invoking it: gridatlas, pipelinenews, globalgrid2050. |
| 24 | no-time-based-gates | Any wall-clock gate — expiry timestamp, embargo, or a cron restricted to one calendar day — baked into automation, so the automation dies or sleeps when the authoring session ends. Supersedes no-expiry-windows. | (generic) any workflow-bearing repo — FAILS on globalgrid2050 and pipelinenews. |
| 25 | release-name-convention | An agent inventing a display name for a release instead of using the name the release manifest already declares, so the public catalogue and the machine-readable manifest disagree about what a product is called. | Catalogue/homepage repos: globalgrid2050. |
| 26 | page-data-block-parses | A published page's inline JavaScript data literal (e.g. an `AREAS` array in `index.html`) being broken by string-surgery edits rather than proper parsing, so the array silently fails to bind and navigation empties out — while the page still serves 200 and looks fine on diff. Documented real incident: globalgrid2050 `index.html`, 2026-08-31, live for several minutes. | Repos publishing HTML with inline JS data blocks: globalgrid2050, gridatlas, pipelinenews. |
| 27 | disk-is-not-what-ships | Assuming the bytes on disk in a working copy equal what actually ships/is served, when no `.gitattributes` pins line-ending behaviour, so a check that reads a file off disk is answering a different question than one that reads what ships. **Uncommitted, local-only file — see runner-status.md.** | (generic) any repo — FAILS on every one of the 8 repos tested (none has `.gitattributes`). |

## Part B — 5 more vaccines that exist only on `origin/main` (added today, not exercised live)

| # | Vaccine | Prevents (plain sentence) | Applies to |
|---|---|---|---|
| 28 | memory-store-complete | A session's transcript existing on disk but never reaching the queryable memory store, so long-term memory develops silent holes — a store missing 91% of its claimed source can still answer every query and look fine. Documented incident: `claude` repo commit `7f54795`, 1 of 11 transcripts converted. | The `claude` memory-store repo. Documented limitation: only catches a store that *lost* lines during conversion, not transcripts never offered for conversion at all. |
| 29 | serial-release-cutter | A release cutter creating a new version when its input is unchanged, or two cutters racing to promote the same parent release. | Release-cutting repos: gridatlas, pipelinenews. |
| 30 | source-receipt-classification | A classifier's receipt describing bytes it never actually classified — proving one checkout, parsing a different read, hashing a third — so the receipt can misdescribe what was actually classified. | Classification/ingestion repos: pipelinenews, spiders. |
| 31 | promotion-authority-separated | A branch build being able to promote itself, collapsing validation authority into publication authority. | Repos with separate build/promote lanes: gridatlas, pipelinenews. |
| 32 | observer-data-only | An observer/audit tool executing code owned by the system it's inspecting, or having side effects on it — observation becoming execution. | cvaa's own antibody-execution model, and any observer/audit tooling in the estate. |

## Doses (from front matter, Part A)

- `every-commit`: pinned-actions, least-permissions, agent-quarantine, monotonic-utc-generations, on-ledger-commits, loop-exists.
- `every-deploy`: rollback-exists, release-name-convention, page-data-block-parses, rollback-exercised, attestation-freshness.
- `every-loop`: everything else (the majority — structural/hygiene checks meant to run on each perpetual-loop iteration).

## Two vaccines are registry-level, not repo-level

`registry-integrity` and `no-dangerous-apis` check the CVAA registry itself (malformed vaccine files, banned APIs in antibody code) rather than a consumer repo's state. Their fixtures in `tools/selftest.mjs` are deliberately `null` with the comment "registry-level: covered by the runner's fail-closed load" — confirmed by reading `tools/selftest.mjs:28`.
