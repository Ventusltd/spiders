# Next GlobalGrid builds: release gates, cartridges and recoverable context

Prepared 5 September 2026 from repository source, current CI observations, direct Chrome interaction and the completed handover at offline-screenshots/handover-202609051831. The first sections retain the historical1623/1820 diagnosis; use the current checkpoint below before resuming. Generate each release timestamp from UTC when building; the stages below are not invented version numbers.

## Current checkpoint: 1906 print campaign and scoped N01?N09 progress

The settled1906 campaign completed50/50 installed-Chrome visits and50 downloads through app-only printing; independent audit passed all25 source downloads. Original GIS, Module Layout and Cable controls passed desktop/mobile browser cases. The geometry and clone defects described below are historical findings with tested corrections in1844/1845 and1906; do not reopen them simply because the old baseline text is retained. First failed and timing-sensitive runs remain evidence.

Homepage promotion was pushed at `a9474d74d0a4366357baacbadb2eef86da86cee3` after the successful restore-point workflow. Both homepage and release record matched that commit in the independent 19:32:46 UTC served-byte receipt. Candidate1927 subsequently passed198/198 served-file checks and desktop/mobile controls with dedicated Cable producer provenance. Source/print claims cover Atlas/Pipeline, not standalone iframe printing; no physical-device or automatic obstacle-routing proof is implied. The estate fleet and additional legacy homepage gates still have real failures, so this is no blanket green/design-freeze claim.

The authoritative queue is [NEXT-50.md](plan-tracker/NEXT-50.md), with current states in its JSON and hashed offline checkpoints. N01?N05 passed their scoped served/live checks. N06/1948 retains its failed phone readiness run; N07/1953 subsequently passed real desktop/mobile restart and fault-injected recovery. N08/1958 passed the delayed-map Module guard with exact producer parity. N09/2008 passed the Cable render observer and snapshot identity checks. These feature checks do not extend the1906 print campaign automatically. N10/2011 and N11/2015 await their own served/live proof; N12 source-scope indexing is implemented locally with negative fixtures and no source concatenation.

The2011 Pages build/upload succeeded but deployment failed when the OIDC ID-token endpoint timed out. The workflow already declares id-token:write; the generic action advice does not prove missing permission. Preserve the failed job log and follow the newer publication's exact served bytes before retrying or changing configuration. At the last observation2015 deployment was still running. The offline ledger records exact tuples and keeps scheduling/deployment failures separate from product behavior.

## Historical starting point (1623/1820, not current blocker status)

Homepage: tested-but-unsuitable normal print path in 202609051623. Staged candidate: 202609051820, source faa66443a7754878f51b2cc5155a21692dbdaecf, Teleprinter 15e85b6d1444967005fb825d5d1d8439667ffcd5, inventory hash 42782185656a1db608411afaaa7ba8ce1aa8dda604d3783d6ff8e8f6df8f34d2. Candidate deployment commit: 30df31f371740e354f4b3b307b97a7de0b914911.

The adjacent handover is complete; the PDF release is not. Endpoint repair landed in Testcode ab632e5 and CVAA a1fae46. The old local campaign remains failed despite 50 saved downloads. Two deployed visits and two corrected-local visits passed. Independent reruns during this architecture session passed the nine endpoint-vaccine tests and the server's HTTP regression test, including static-server negative controls.

A direct installed-Chrome check during this session found a new normal-print refusal: "The app print dimensions changed during capture." Actual viewport was 2048 x 972 with DPR 1.875. Vendored html2canvas floors backing dimensions, while app-frame.js rounds its expectations: 972 x 1.875 = 1822.5, yielding 1822 versus 1823. This source/geometry mismatch explains the observed refusal; a focused regression must prove the correction before closing it.

## Build sequence

| Stage / plan ID | Owner and deliverable | Required exit evidence | Promotion |
|---|---|---|---|
| P0: recoverable baseline | Spiders reload, federation ownership links, immutable handover references | Correct checkout/branch/commit, dirty anchor detection, completed handover hashes, retained failed receipts, usable resume checkpoint | No product release |
| P1: reproducible environments | Testcode paths/server and CVAA endpoint contract | Required inputs materialised; corrected and negative HTTP probes; exact-build local/deployed checks; CI failures classified by job | Enables testing, not acceptance |
| P2: app PDF repair | Teleprinter small capture components and Testcode acceptance | Fractional-DPR proof; Pipeline clone-style/menu/animation fixes; app-only control path; full 25 PDF + 25 source campaign; independent region/content checks | First new candidate eligible for homepage after all gates |
| P3: identity and compute correctness | GridAtlas receiver/selection adapter + ventus-grid-engine observer | MAP and search identify the same project through requested/started/completed/drawn states; no stale badge; empty/failed/unsupported transitions covered | Separate behavioral candidate |
| P4: cartridge extraction | GridAtlas parts/modules, Pipeline UI contracts, federation edges | Same behavior before/after extraction; actual served composition references new parts; no duplicate listeners or dead modules; parity and lifecycle proofs | Several small candidates, one boundary at a time |
| P5: usable source packages | Teleprinter source graph/packaging and data-owner manifests | Complete declared closure or explicit unresolved edges; content-addressed dedup; reconstruct-and-hash proof; mobile attach/open exercise | Separate source-export candidate |
| P6: measured performance | Pipeline/data transport first, GPU repo for justified experiments | Cold/warm wall time, transferred bytes, DOM/memory budgets, equivalent CPU/GPU correctness and end-to-end timings | Only demonstrated improvements graduate |
| P7: Grid / Subs controls | GridAtlas layer-control cartridge and Testcode consumer composition | All five voltage layers and substations follow real engine controls; desktop bottom-left placement; mobile preserved; print inclusion and collision checks | Include in the next suitable candidate after P2, as a separate change |

P0 and P1 tracking work can proceed alongside the P2 fix. P3 should precede extraction of selection/compute paths. P4 is incremental and does not hold the urgent print fix hostage to a wholesale application rewrite. P5 shares the source graph with P0 but needs separate user-flow acceptance. P6 starts with measurement and only introduces a runtime GPU dependency if it wins on a real workload.

## P2 implementation contract

Split by responsibility while fixing the defects, keeping captureAppFrame as a narrow orchestrator:

| Proposed component in teleprinter/drivers/codex | Responsibility | Contract and failure behavior |
|---|---|---|
| capture/geometry.js | Read stable CSS viewport and derive one integer backing size | Explicit rounding policy shared with renderer; detect actual viewport drift separately; bounded total pixels |
| capture/map-snapshot.js | Request map render, read visible canvas pixels | Timeout and taint errors remain useful; detach listeners; await decoded replacements |
| capture/clone-visible-ui.js | Transfer supported visible UI to clone | Scoped computed styling; no global shadow stylesheet leakage; closed details/dialog content absent |
| capture/readiness.js | Coordinate fonts, map and UI readiness | Deterministic application readiness signal where available; bounded wait; do not stop live animation invisibly |
| app-frame.js | Compose above and call html2canvas | Return frame plus capture receipt; no download/UI/source concerns |
| screen-pdf.mjs | Encode supplied pixels and external furniture | Preserve tested writer behavior; independent image dimensions and metadata verification |

These are proposed source modules, not additional network services or repositories. The small current app-frame.js does not need arbitrary line-count slicing; the reason to extract is independent contracts for the bugs. The vendor file remains vendored and licensed. Update build.mjs's pinned module closure and source bundles whenever imports change.

Geometry proof matrix should include integer and fractional DPR (1, 1.25, 1.5, 1.875, 2, 3), odd CSS sizes and viewport changes during capture. Distinguish allowed integer raster rounding from genuine resize. Do not rescale a finished capture merely to satisfy an assertion.

Pipeline regressions must include styled buttons, summary and paragraphs outside the printer; a closed fallback File menu; live charts; desktop-wide, phone portrait and landscape. Capture a time-aligned independent reference without feeding it into PDF generation. Assert menu and layer text/content as well as approximate pixels; background-dominated similarity alone can conceal missing controls.

The normal File route must not call getDisplayMedia, window.print or host screenshot injection. Error receipts must remain failures even when a blob or download exists. Keep Print PDF and Print source code separate. Test actual installed Chrome plus the existing Firefox/WebKit smoke cases; physical device claims require user/device evidence.

## P3 identity before extraction

Create one selection envelope shared by receiver, engine request, drawn result and test observer: schema version, selection ID, REPD, coordinates with order declared, technology, attempt ID, producer composition and timestamp. Clearing/changing selection invalidates old completion. Treat map drawing completion as a separate event from computation completion.

Required scenarios: Pipeline MAP offshore REPD 2484; Wraysbury search REPD 1938; a second search after a completed result; unsupported technology; unloaded layer; zero candidates; aborted/replaced request. The historical phone screenshot's badge identity mismatch is a regression lead, not a sufficient proof of the exact code path. The direct main-Atlas Wraysbury observation showed a popup without a corresponding distance card during review; reproduce with identity receipts.

## P4: reuse the established cartridge mechanism

GridAtlas already has the right mechanism: tools/build-cartridge.mjs assembles ordered source parts and records per-part SHA-256; tools/recompose.mjs creates a new immutable composition and changes only named cartridges. One shell script slot can still receive one built file while maintainers edit small source modules. Do not create another full application copy to achieve modularity.

The current main composition's real extraction targets are:

| Current input actually referenced by a parts manifest | Size observed | Proposed responsibility split |
|---|---:|---|
| atlas/parts/202609041234-sld-sandbox-technology-buckets.js | 5,885 lines / 288,155 bytes | Selection state; technology/capacity model; map source/layer adapter; topology layout; panel rendering; interactions; finance adapter |
| atlas/parts/202609040229-ventus-corev8engine-exact-repd-delegation.js | 1,497 lines / 94,129 bytes | Legacy adapter lifecycle; layer availability; selection delegation; drawing integration |
| atlas/modules/202609031958-menu-bar.js | 1,805 lines / 89,938 bytes | Menu registry; menu view; keyboard/pointer behavior; export commands; engine/source catalogue |
| atlas/modules/202609051624-teleprint-controls.js | 1,238 lines / 59,117 bytes | Main-Atlas lane print controls, capture adapter and download/source UI; keep its ownership distinct from Codex Teleprinter |
| Pipeline live UI runtime | Inspected historical runtimes about 862Ã¢â‚¬â€œ900 lines | Release assembly must identify the active one first; then separate row model, table rendering, filters, charts and MAP-link adapter |

The current sld-sandbox is already assembled from grid-scope, source-registry, declared-connections, sizing-arithmetic and technology-coverage modules plus the large body. Preserve those separations. Financial assumptions and engineering screening remain distinct domains; extraction must not silently change formulas.

For each extraction:

1. Prove the selected source is referenced by the current parts manifest, and record baseline behavior from that composition.
2. Inventory captured closure variables, globals, listeners, timers, DOM IDs and map sources/layers. Introduce explicit inputs and lifecycle ownership before moving code.
3. Extract one cohesive function group without a behavior change. Add a small adapter at the original call site. Prefer existing shared grid-engine/geodesy contracts to another copied helper.
4. Provide mount/dispose or equivalent teardown for stateful UI. Repeated composition/application setup must not double-register listeners or retain stale selections.
5. Build a new cartridge from an explicit ordered part list. Hash all parts and assembled bytes. Verify shell slots, imports, load order and runtime schema versions.
6. Recompose atomically, regenerate STATE.md, run scope lint/state parity and behavioral checks against the served candidate. Keep the old immutable composition available as rollback.
7. Only move a module into a separate repository when it has a genuine owner, stable interface and at least a demonstrated consumer boundary. Record producer commit, artifact hash, schema and consumer pin in the federation map. Avoid dozens of repositories connected by unpinned main URLs.

## P5 source export and P6 performance

The current 61Ã¢â‚¬â€œ62 MB source output deserves a measured dependency graph. Separate executable code, dynamic code, data, styles and captured state. Record URL, content hash, byte count, content type, producer and discovery edge. Store repeated bodies once and reference their hashes; preserve an export that can reconstruct the original declared resources and verify every digest. Compression is packaging, not permission to omit dependencies. An index/summary plus an attached archive can improve usability only if the phone/AI attachment path supports it and incompleteness stays visible.

Do not call a source PDF complete when it truncates data to 4,000 characters. Do not infer dependency failure from strings inside captured source comments. Record unavailable and nonliteral edges explicitly. Evaluate peak browser memory while building an export, not only final file size.

For Pipeline, the earlier 7,680-row / 323,801-DOM finding suggests windowed rendering, compact data delivery and avoiding repeated HTML/JSON payloads. First reproduce on the candidate's actual data and define measured budgets; do not reuse historical counts as current measurements. Keep search data (Parquet/DuckDB) separate from browser-native drawing products as required by GridAtlas's contract.

For GPU experiments, compare equivalent CPU and GPU workloads with transfer/readback included, then also report amortised resident-buffer timing. Keep correctness and adapter receipts. Current CI's CPU stand-in is not GPU acceptance. Large throughput numbers across independent worker copies do not prove reduced single-user latency. No runtime dependency should be added merely because GPU hardware is present.

## CI/CD as durable context

The plan tracker sub-agent owns plan-tracker/ and its CI-ready validator/template. Current CI runs are observed read-only; the template is not yet installed as an active workflow. The intended runner sequence is:

1. Materialise the explicit repository graph at full commit SHAs. Record runner OS, browser version, environment profile and dependency lock hashes. Fail early on missing inputs.
2. Validate plan/checkpoint schema and previous evidence references. A status of completed requires its named proofs for the same release/environment; an unrelated green workflow cannot advance it.
3. Run appropriate contract/unit gates, cartridge assembly and candidate checks. Keep environment preconditions, product failures and skipped tests separate.
4. Emit a compact checkpoint under an immutable run/commit identity with stage, last completed action, failure, next action, artifacts and reproduction command. Upload this even when tests fail, and write a human resume summary.
5. Run browser acceptance against staged served bytes. Hardware-dependent GPU/device work is explicitly pending if a suitable runner/device is absent.
6. Allow homepage promotion only from the matching accepted candidate and verified served-byte receipt; retain previous generation links and rollback identity.

Runner artifacts hold compact public findings and hashes. Screenshots, PDFs, source downloads and personal handover material remain offline under the user's existing requirement. An offline archive reference in a public checkpoint is a reference, not a guarantee that a GitHub runner can access it. Public CI can verify its own generated proofs; local-only evidence must remain distinctly classified. Artifact expiry must not erase the only durable release summary.

Use the tracker at start of a session, after an implementation boundary, after tests, after a failed attempt and before compaction/handover. The next session reads the checkpoint plus changed anchors, not a transcript of all commands. A sub-agent is a working collaborator during this session; persistence comes from files and CI artifacts, not an assumption that the agent remains alive forever.

## Acceptance and remaining decisions

### P7: preserve the mobile Grid / Subs interaction on desktop

The identified implementation is installMobileTray in atlas/parts/202609041234-sld-sandbox-technology-buckets.js, using #gridatlas-mobile-tray. GRID_LINE_LAYERS is ['400','275','220','132','66']; the recalled 272 kV label is actually 275 kV. Subs toggles ['subs']. The chips click the real engine checkboxes under #scada-ui-container input[data-layer-id], then reflect their state through aria-pressed. Preserve that single state source.

Git commit fb8dc54c7f4c172e65d6ca854cdf3e3e8be65392 explicitly records the desktop fix, with Claude co-authorship. Main Atlas 1624 composes a successor containing it. Frozen Testcode 1623 and 1820 retain the earlier if(!trayTarget()) return, so the controls are never created on a fine-pointer desktop. Port the relevant behavior and dependencies through the source part/composition mechanism; do not copy the entire latest Atlas application over the Testcode candidate.

Direct Chrome verification on the user-specified main Atlas URL confirmed both buttons already at the bottom left of the map, and GRID checked all five voltage controls. SUBS enabled the substation points. Preserve that existing placement and behavior in the next Testcode candidate. Keep tool collapsing mobile-only. Use safe-area and attribution offsets; remain visible at normal and fractional zoom, fullscreen, open layer panel and different side-panel states. Keep at least the existing 44px hit-target convention. Scope CSS to the control container. Avoid global z-index escalation or overlaying copyright attribution.

Acceptance: GRID enables all available 400/275/220/132/66 kV layer controls, a second click disables them, partial state turns the set on, and missing/unloaded layers have explicit behavior. SUBS toggles substations independently. Manual layer changes and deep links update button state. Verify actual rendered lines/points, not just checkbox values. Desktop controls must appear after late engine initialization without duplicate listeners; mobile 393px portrait and landscape remain usable. Include both controls in an app-only PDF comparison and verify they do not obscure legends, attribution or cards.

The existing source ends by rewriting mobile_tray.tools_collapsed to true even for the desktop path; check telemetry against real behavior during the port rather than trusting that field as proof of desktop collapse. Detailed Git/CI discovery belongs in plan-tracker's feature provenance.

The first next build should repair app-only PDF behavior and prove it on both Atlas and Pipeline. Cartridge extraction then proceeds in small reviewed steps with separate releases. Do not combine all repository migration, rendering changes, financial-model edits and GPU integration into one release.

Historical planning note: the1820 failed campaign and fractional-DPR refusal blocked that baseline. Subsequent1844/1845 corrections and the settled1906 campaign resolved those observed print defects within the stated tested scope. Proposed paths below record design intent; use current manifests for implemented module names. Remaining fleet and standalone-tool print limits are separate.

## User-selected reference and integration boundary

The user supplied offline-screenshots/gridbutton.jpg and stated that the main Claude app has more bugs than the Codex final. Preserve the Codex candidate lineage as the integration base. The screenshot is the visual reference for the compact bottom-left GRID / SUBS controls, coloured grid lines, and bottom-right Layers control with the panel closed. It is not approval to replace the Codex app with the main Claude app or to import unrelated menus, print engines, layouts or model changes.

P7 must port only the control creation, existing layer-toggle adapter, scoped styling and necessary menu-retention behavior. Review dependencies individually. Test against the Codex baseline for project selection, computed/drawn connections, layer state, menus and app-only printing. The user's comparative bug assessment is recorded as feedback, not an independently measured total bug count. That statement concerned the historical1820 baseline. The observed geometry/clone defects have tested corrections in1906; separate standalone-tool printing and fleet acceptance remain open.

## Default arrival experience: map first

User requirement: the Layers panel starts collapsed on a fresh arrival so the map and bottom-left GRID / SUBS controls are immediately prominent. Keep a clear Layers control at bottom right to expand it on demand. GRID and SUBS remain visible and usable while the panel is collapsed. Collapsing or expanding the panel must not change enabled layers, selected project or computed connections. Do not automatically open the panel when either quick control is clicked. Preserve deep-link-required layer activation without expanding the panel. This requirement changes panel visibility, not the default on/off state of the grid or substations.

P7 acceptance adds a fresh-load check at desktop and mobile sizes: Layers collapsed, both quick controls visible, first GRID click renders the voltage layers without opening Layers, SUBS independently renders substations, and opening then closing Layers preserves the map state. Include the collapsed-panel view in the independent app-PDF reference.

## Maintainable cartridges and bounded source presentation

User requirement: implement features such as GRID / SUBS and collapsed-by-default Layers as cohesive cartridges, avoiding another giant maintained source file or a mandatory 591-page source document.

P7 will extract a layer-quick-controls source cartridge with explicit mount/dispose lifecycle, scoped styles and a narrow adapter to the existing engine layer controls. It owns GRID/SUBS placement, reflected state and panel-visibility policy. It must not own grid datasets, calculation algorithms, PDF encoding or the whole menu system. Register it in the existing ordered parts manifest and compose it into the supported shell slot; no new shell slot is assumed. Expose identity, dependency hashes and a contract version in the build record. Guard repeated mount and dispose against duplicate listeners, timers and controls. Avoid copying the enclosing SLD body into a new file and calling that modularity.

P5 will separate a readable source index from full source delivery. The index identifies the release, selected state, cartridge names, purpose, producer commits, hashes and unresolved dependencies. Provide per-cartridge source access and a complete dependency package with repeated bodies stored once by content hash. Reconstruct-and-hash tests must prove the package preserves every declared body. Where numbered parts are needed for attachment limits, split at resource boundaries and include a complete index. Keep completeness limitations explicit and do not silently replace the existing full-source promise with a summary.

Cartridge extraction improves maintenance; it does not by itself reduce the total bytes of a complete export. Measure source bytes, duplicate bytes, largest maintained module and mobile attachment/open behavior separately. Generated runtime bundles may remain larger than individual maintained modules when the existing composer requires one file per shell slot; their manifests must retain the mapping back to small source parts. No fixed page-count claim or arbitrary line-count slicing substitutes for cohesive responsibilities.

## Active implementation update: original GIS SLD Financial Sandbox owner

The user created Ventusltd/gis-sld-sandbox and explicitly requires the full original solar-bess-topology-v7/gis-sld-financial-sandbox/index.html UI. That repository owns the standalone sandbox. Port original runtime bytes and dependent resources into an immutable timestamped baseline, retain module load order and hash every part. Then modularise further using explicit parts manifests and behavior-parity checks, following GridAtlas's maintained-parts/generated-release pattern. GridAtlas consumes only a pinned layer launcher/integration contract, not copied calculation or finance implementations. The original already separates config, helpers, state, substations, map, calculations, finance, UI core, drawing, exports and UI; preserve those contracts before extracting more.

The temporary selected-project Layout button in candidate1850 is not completion of this requirement. It is superseded by the full GIS SLD Financial Sandbox layer. Module Layout belongs in layout-tool as its own independently versioned cartridge; Cable Geometry Visualiser stays a separate cartridge with an explicit owner. Each new timestamp introduces one major feature. Compare original versus lifted UI and calculations; test layer open/close, preserved underlying Atlas state, sizing controls, drawing and export. Public deployments and source producer identities must be retained in Git/CI receipts.


## Producer and release checkpoint, 5 September 2026

The original GIS producer baseline is `gis-sld-sandbox` commit `9fe7b2d920aaa11e95380de39b33fd98f04e9696`, release `202609051855`. Module Layout, Cable Geometry and DC/AC review belong to `layout-tool` commit `e201075e052bfc71e7fef01f1360f319808cb78f`, release `202609051858`. Runtime files were imported byte-for-byte from GlobalGrid commit `4185020ade7da01869b4ffc0ee1d2656608da716`; producer CI checks those original bytes and relative resources. GIS remains a standalone application with its seven-version history. The Atlas consumer mounts a pinned iframe through a small host cartridge; it does not acquire ownership of GIS formulas.

Eight consumer increments are recorded in `plan-tracker/plan.json` and the offline `five-version-campaign/ledger.json`: 1844 geometry, 1845 clone isolation, 1847 Grid/Subs controls, 1848 panel policy, 1850 temporary selected-layout adapter, 1901 original GIS layer, 1905 Module Layout, and 1906 Cable Geometry. The 1850 phone failure remains historical and its integration requirement is superseded. Publication, focused test results and final acceptance remain separate. Read the refreshed ledger before reporting which candidate passes:1906 has its settled50/50 and source audit, while newer increments have their own pending proofs.

**Printing boundary:** the original tools keep their original `window.print` behavior unchanged. Atlas/Pipeline's 50-visit campaign does not establish that an iframe's WebGL content prints correctly. Current source scopes pin tool owner configuration and explicitly exclude tool runtime. A future dedicated tool print/source adapter needs its own app-only PDF, canvas, state and recursive source coverage tests. It must not silently rewrite the standalone baseline.

**Routing boundary:** direct distance remains the first pass. The observed original GIS manual route has four vertices and length 0.4405921418291706 km; unchanged Ventus engine `f9531a7a36ff1b2557362bf2a61949066f393821` independently measures 0.4405921418291705 km, while retaining direct distance 0.20022376989905494 km. These are two retained results, not an implemented obstacle-aware engine. The optional second-pass plan and source limitations are in [ROUTING-SECOND-PASS.md](plan-tracker/ROUTING-SECOND-PASS.md). B-road preference is a configurable soft policy; unknown constraint coverage remains explicit, with crossings recorded separately for review.


## Cable civil-works owner

`cable-trench-or-drill` now owns new Cable Geometry development. Its immutable release `202609051921` at commit `76396fd3639dd86cddd21e392f29f43ab6d22f2d` preserves exactly seven original runtime files (121,501 bytes); manifest SHA256 `a1b96236ba223bbbb8153538961bea677513a9fe3a877b9c61cd70d61128960e`. Existing consumer1906 still pins the older layout-tool baseline; changing its owner pin requires a new consumer timestamp, not rewriting1906. Module Layout and DC/AC navigation remain separately pinned layout-tool siblings.

After owner migration, introduce trenching and directional-drilling alternatives as separate assessment cartridges. Preserve the direct first pass and its result in every case. Optional second-pass routes record graph/constraint coverage, route segments, crossings, method assumptions, infeasible cases and costs. Do not infer drilling feasibility from trench depth. B-road preference stays a soft user policy; missing coverage and manual review remain visible. See the Cable producer's DEVELOPMENT-PLAN.md. None of these future assessment stages is implemented by the original baseline import.


## Next fifty increments and engineering references

The user explicitly requested another fifty substantive versions. [NEXT-50.md](plan-tracker/NEXT-50.md) is the ordered, dependency-gated roadmap and [NEXT-50.json](plan-tracker/NEXT-50.json) records each owner, module and proof. It assigns no speculative timestamps. N01 is the dedicated Cable-owner migration; the current1927 candidate is pending its own served and browser receipts. Product bytes, source ownership and immutable proof decide progression, not the number of commits.

The dated [engineering reference catalog](plan-tracker/engineering-references.json) records all seven supplied pages and their content hashes. The [MV/HV interface page](https://globalgrid2050.com/mv_and_hv_components/) informs explicit cable/accessory/termination boundaries and installation assumptions. The [power-systems case study](https://globalgrid2050.com/power_systems_studies/) informs how calculation, thermal studies, installation and named responsibility stay distinct. Neither becomes a generic automatic engineering proof.

The [competence page](https://globalgrid2050.com/employers_competence/) is explicitly living and selective: use its evidence IDs for accountable design authority, interface ownership, assumptions and independent review. Its electrical checklist excludes civil and several other disciplines; the Cable trench/drill model therefore needs its own civil inputs. [BESS requirements](https://globalgrid2050.com/employers_requirements_BESS/) and [large-scale solar requirements](https://globalgrid2050.com/employers_requirments_large_scale_solar/) map project-specific boundaries and evidence, not automatic compliance. The latter's routing section requires supplier bend limits and is already separated into maintained sections, a useful cartridge pattern.

Solar component and deployment pages retain their published units, years and normalisation assumptions. The deployment figures have a2025 basis; GWac2500 multiplied by1.2 is a normalisation calculation, not independently measured2026 deployment. Do not use these pages to replace historical company-profile figures wholesale.

## Candidate-specific CI beside the estate fleet

Add a separate, clearly named candidate verification workflow with explicit12-digit generation and full Testcode/engine/producer revisions. It should reject missing or mismatched manifests before testing. A syntax/hash job runs `node sandbox/capsules/teleprinter/verify-candidate.mjs sandbox/<generation> <receipt>` on exact committed candidate bytes and runs the pure ownership/composer tests. A separate browser job checks the deployed-byte tuple before actual controls and print/download actions. Its installed-browser/platform and lack of physical-device evidence must remain explicit.

Retain compact receipts containing source SHA, candidate tuple, test/harness SHA, environment, artifact hashes and failed steps. Do not put screenshots, raw source attachments, user transcripts or credentials into public CI. Large browser artifacts remain offline unless separately reviewed for publication. Candidate syntax/controls/PDF/source outcomes stay separate from the existing estate fleet; do not suppress or weaken the four real fleet blockers to create a green candidate badge. Full fleet acceptance remains a separate required issue in P1 and the eventual acceptance compiler.
