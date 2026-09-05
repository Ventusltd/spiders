# Modular build programme

Plan revision: 202609052046. All 100 increments are planned; no release timestamp has been allocated.

Canonical input: master-plan.geojson. Historical releases remain in ../reload/plan-tracker/.

Transfers require a destination owner and pinned workflow/script dependency closure. Collectors stay outside GlobalGrid2050. Weekly refresh is independent of observation resolution.

## PIPELINE-01: Coverage join audit

Owner: Ventusltd/pipelinenews; proposed module: cartridges/coverage-join-audit.mjs.
Change: Report exact REPD key differences among proximity, GRID and SUB
Dependencies: none within this programme.
Sources: DESNZ-REPD.
Local acceptance: Pinned202609050309 counts4138/3047/3047 and key sets
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-02: GRID coverage successor

Owner: Ventusltd/pipelinenews; proposed module: cartridges/grid-coverage-successor.mjs.
Change: Produce GRID projection for missing covered projects using owner data
Dependencies: PIPELINE-01.
Sources: repository inputs and user requirements.
Local acceptance: No invented values; existing3047 byte/number parity
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-03: SUB coverage successor

Owner: Ventusltd/pipelinenews; proposed module: cartridges/sub-coverage-successor.mjs.
Change: Produce missing substation records or explicit unavailable states
Dependencies: PIPELINE-01.
Sources: repository inputs and user requirements.
Local acceptance: Dataset coverage and join-negative fixtures
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-04: Coverage explanation UI

Owner: Ventusltd/pipelinenews; proposed module: cartridges/coverage-explanation-ui.mjs.
Change: Show which source lacks project coverage
Dependencies: PIPELINE-02, PIPELINE-03.
Sources: repository inputs and user requirements.
Local acceptance: Missing is not zero; panel/table agree
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-05: Coverage CI contract

Owner: Ventusltd/pipelinenews; proposed module: cartridges/coverage-ci-contract.mjs.
Change: Reject falsely universal panel-column parity claims
Dependencies: PIPELINE-01, PIPELINE-02, PIPELINE-03.
Sources: repository inputs and user requirements.
Local acceptance: Deliberately drop one project and fail
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-06: Bounded table rendering

Owner: Ventusltd/pipelinenews; proposed module: cartridges/bounded-table-rendering.mjs.
Change: Extract virtualized row window preserving navigation
Dependencies: none within this programme.
Sources: repository inputs and user requirements.
Local acceptance: Measure DOM count, mobile MAP reach and keyboard rows
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-07: Pagination state cartridge

Owner: Ventusltd/pipelinenews; proposed module: cartridges/pagination-state-cartridge.mjs.
Change: Bind pager range to visible filtered cut
Dependencies: PIPELINE-06.
Sources: repository inputs and user requirements.
Local acceptance: Filter reset, end page and restored URL cases
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-08: Stable project selection

Owner: Ventusltd/pipelinenews; proposed module: cartridges/stable-project-selection.mjs.
Change: Retain selected REPD identity across virtual scroll
Dependencies: PIPELINE-07.
Sources: DESNZ-REPD.
Local acceptance: Selection survives sort and recycling
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-09: Mobile row actions

Owner: Ventusltd/pipelinenews; proposed module: cartridges/mobile-row-actions.mjs.
Change: Keep MAP action within phone hit area
Dependencies: PIPELINE-08.
Sources: repository inputs and user requirements.
Local acceptance: 393px measured click geometry, not href existence
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-10: Observable search completion

Owner: Ventusltd/pipelinenews; proposed module: cartridges/observable-search-completion.mjs.
Change: Replace fixed waits with result-state readiness
Dependencies: PIPELINE-06.
Sources: repository inputs and user requirements.
Local acceptance: Slow CPU and delayed data prove no arbitrary deadline
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-11: Canonical receiver adapter

Owner: Ventusltd/pipelinenews; proposed module: cartridges/canonical-receiver-adapter.mjs.
Change: One compiled receiver contract for nav and row links
Dependencies: none within this programme.
Sources: repository inputs and user requirements.
Local acceptance: HTML and JS source scans plus actual destination
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-12: Receiver failure state

Owner: Ventusltd/pipelinenews; proposed module: cartridges/receiver-failure-state.mjs.
Change: Separate unreadable schema from explicit withdrawal
Dependencies: PIPELINE-11.
Sources: repository inputs and user requirements.
Local acceptance: Network/schema/withdrawn cases independently imported
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-13: GeoJSON identity export

Owner: Ventusltd/pipelinenews; proposed module: cartridges/geojson-identity-export.mjs.
Change: Export current Pipeline project selection as owner-bound features
Dependencies: none within this programme.
Sources: repository inputs and user requirements.
Local acceptance: REPD keys, coordinate order and generation provenance
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-14: GeoJSON filter export

Owner: Ventusltd/pipelinenews; proposed module: cartridges/geojson-filter-export.mjs.
Change: Export only visible logical filter set, not DOM window
Dependencies: PIPELINE-13.
Sources: repository inputs and user requirements.
Local acceptance: Full selection equals export across virtual pages
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-15: GeoJSON null geometry

Owner: Ventusltd/pipelinenews; proposed module: cartridges/geojson-null-geometry.mjs.
Change: Retain projects without coordinates as explicit null geometry
Dependencies: PIPELINE-13.
Sources: repository inputs and user requirements.
Local acceptance: No0,0 substitution and missing-coordinate counts
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-16: GeoJSON partition manifest

Owner: Ventusltd/pipelinenews; proposed module: cartridges/geojson-partition-manifest.mjs.
Change: Bind every partition and schema to exact owner SHA
Dependencies: PIPELINE-13.
Sources: repository inputs and user requirements.
Local acceptance: Missing/tampered partition fails
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-17: GeoJSON bounds preview

Owner: Ventusltd/pipelinenews; proposed module: cartridges/geojson-bounds-preview.mjs.
Change: Bound map preview using valid exported geometries
Dependencies: PIPELINE-15, PIPELINE-16.
Sources: repository inputs and user requirements.
Local acceptance: Antimeridian/nonfinite/out-of-range fixtures
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-18: Weekly owner-manifest reader

Owner: Ventusltd/pipelinenews; proposed module: cartridges/weekly-owner-manifest-reader/index.mjs.
Change: Read Elexon/PV/market compact manifests with separate dataset scopes
Dependencies: none within this programme.
Sources: Sheffield-PVLive.
Local acceptance: Read Elexon/PV/market compact manifests with separate dataset scopes; negative fixture and independent served-consumer proof required
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-19: Official evidence rank

Owner: Ventusltd/pipelinenews; proposed module: cartridges/official-evidence-rank.mjs.
Change: Preserve official-source ranking over noisy news
Dependencies: none within this programme.
Sources: news-publishers.
Local acceptance: Contradictory and syndication fixtures
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-20: News canonical dedup

Owner: Ventusltd/pipelinenews; proposed module: cartridges/news-canonical-dedup.mjs.
Change: Separate publisher article identity from tracking URLs
Dependencies: PIPELINE-19.
Sources: news-publishers.
Local acceptance: Query tracking duplicates collapse without merging distinct articles
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-21: News date semantics

Owner: Ventusltd/pipelinenews; proposed module: cartridges/news-date-semantics.mjs.
Change: Separate publication, event and retrieval timestamps
Dependencies: PIPELINE-19.
Sources: news-publishers.
Local acceptance: Undated and timezone cases visible
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-22: Topic relevance cartridge

Owner: Ventusltd/pipelinenews; proposed module: cartridges/topic-relevance-cartridge.mjs.
Change: Preserve five-topic boundaries before projection
Dependencies: PIPELINE-19.
Sources: repository inputs and user requirements.
Local acceptance: Off-topic plausible keyword negatives
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-23: Project binding abstention

Owner: Ventusltd/pipelinenews; proposed module: cartridges/project-binding-abstention.mjs.
Change: Never promote ambiguous company/site mention to project fact
Dependencies: PIPELINE-19, PIPELINE-20.
Sources: companies.
Local acceptance: Same-name projects and multi-site organisation cases
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-24: Evidence freshness UI

Owner: Ventusltd/pipelinenews; proposed module: cartridges/evidence-freshness-ui.mjs.
Change: Display last retrieval independently of publication age
Dependencies: PIPELINE-21.
Sources: repository inputs and user requirements.
Local acceptance: Old source newly fetched does not become new event
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-25: Weekly ingestion checkpoint receipt

Owner: Ventusltd/data-gb-electricity; proposed module: cartridges/weekly-ingestion-checkpoint-receipt/index.mjs.
Change: Create bounded revisioned recent-week staging and checkpoint alongside immutable closed-month partitions
Dependencies: none within this programme.
Sources: repository inputs and user requirements.
Local acceptance: Bound request counts, last-success/last-attempt and unchanged stale fallback; negative fixture and independent served-consumer proof required; pre-write compressed-byte and row limits, archive hashes unchanged, bounded revision lookback and Git growth receipt; no full historical fetch by default
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-26: Source rights metadata

Owner: Ventusltd/pipelinenews; proposed module: cartridges/source-rights-metadata.mjs.
Change: Keep source-specific redistribution declarations
Dependencies: none within this programme.
Sources: repository inputs and user requirements.
Local acceptance: Open-source app does not imply publisher content rights
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-27: Company identity join

Owner: Ventusltd/pipelinenews; proposed module: cartridges/company-identity-join.mjs.
Change: Consume Companies owner manifest with legal number binding
Dependencies: none within this programme.
Sources: companies.
Local acceptance: Keyword-only match remains unresolved
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-28: Company confidence view

Owner: Ventusltd/pipelinenews; proposed module: cartridges/company-confidence-view.mjs.
Change: Expose confirmed/probable/unresolved without silent promotion
Dependencies: PIPELINE-27.
Sources: companies.
Local acceptance: Name collisions and SPV ambiguity
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-29: Financial units adapter

Owner: Ventusltd/pipelinenews; proposed module: cartridges/financial-units-adapter.mjs.
Change: Display currency scale and accounts period from source
Dependencies: PIPELINE-27.
Sources: repository inputs and user requirements.
Local acceptance: Thousands/millions and stale-account negatives
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-30: Company lazy loading

Owner: Ventusltd/pipelinenews; proposed module: cartridges/company-lazy-loading.mjs.
Change: Fetch compact summaries before selected company data
Dependencies: PIPELINE-27.
Sources: companies.
Local acceptance: Cold load network and memory measurements
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-31: PVLive interval validation cartridge

Owner: Ventusltd/spiders; proposed module: species/pvlive-spider/interval-validation/index.mjs.
Change: Repair zero/nonfinite/wrong-day parsing before federation
Dependencies: none within this programme.
Sources: Sheffield-PVLive.
Local acceptance: Repair zero/nonfinite/wrong-day parsing before federation; negative fixture and independent served-consumer proof required
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-32: Company schema gate

Owner: Ventusltd/pipelinenews; proposed module: cartridges/company-schema-gate.mjs.
Change: Validate count/number/provenance and unexpected empty corpus
Dependencies: PIPELINE-27.
Sources: companies.
Local acceptance: Empty-success and malformed company fixtures
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-33: Electricity coverage scope

Owner: Ventusltd/pipelinenews; proposed module: cartridges/electricity-coverage-scope.mjs.
Change: Retain GB/time/unit scope alongside price figures
Dependencies: none within this programme.
Sources: Elexon-Insights.
Local acceptance: Missing intervals not treated as zero
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-34: Coverage-weighted energy rollup

Owner: Ventusltd/data-gb-electricity; proposed module: cartridges/coverage-weighted-energy-rollup/index.mjs.
Change: Separate MW fromMWh and sourcegrain fromweeklycadence
Dependencies: PIPELINE-25, PIPELINE-31.
Sources: Elexon-Insights.
Local acceptance: Separate MW fromMWh and sourcegrain fromweeklycadence; negative fixture and independent served-consumer proof required; retain source half-hourly price extrema and settlement timestamps in detailed chart windows, never infer missing periods as zero
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-35: Feed freshness and revision panel

Owner: Ventusltd/pipelinenews; proposed module: cartridges/feed-freshness-and-revision-panel/index.mjs.
Change: Expose stale/partial/revised states without synthetic current values
Dependencies: PIPELINE-18, PIPELINE-34.
Sources: repository inputs and user requirements.
Local acceptance: Expose stale/partial/revised states without synthetic current values; negative fixture and independent served-consumer proof required
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-36: Runtime source index

Owner: Ventusltd/pipelinenews; proposed module: cartridges/runtime-source-index.mjs.
Change: Export hashes and owner paths without repeated large bundles
Dependencies: none within this programme.
Sources: repository inputs and user requirements.
Local acceptance: Every body matches pinned index; no eval
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-37: Release ancestry guard

Owner: Ventusltd/pipelinenews; proposed module: cartridges/release-ancestry-guard.mjs.
Change: Keep applied repair detection independent of payload registration
Dependencies: none within this programme.
Sources: repository inputs and user requirements.
Local acceptance: Already-applied idempotent repair cannot mint new release
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-38: Semantic-change gate

Owner: Ventusltd/pipelinenews; proposed module: cartridges/semantic-change-gate.mjs.
Change: Require meaningful runtime/data difference before timestamp build
Dependencies: none within this programme.
Sources: repository inputs and user requirements.
Local acceptance: Manifest-only successor refused as empty
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-39: Transport outcome receipt

Owner: Ventusltd/pipelinenews; proposed module: cartridges/transport-outcome-receipt.mjs.
Change: Separate proxy/network/HTTP/status from byte-match outcome
Dependencies: none within this programme.
Sources: repository inputs and user requirements.
Local acceptance: Proxy403 never blamed on remote host
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-40: Typed market instrument adapter

Owner: Ventusltd/pipelinenews; proposed module: cartridges/typed-market-instrument-adapter/index.mjs.
Change: Display spot/futures,exchange,currency,unit,contract and date; parentcommodityfindings anchor
Dependencies: PIPELINE-18, ATLAS-44.
Sources: repository inputs and user requirements.
Local acceptance: Display spot/futures,exchange,currency,unit,contract and date; parentcommodityfindings anchor; negative fixture and independent served-consumer proof required
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-41: Served-byte promotion gate

Owner: Ventusltd/pipelinenews; proposed module: cartridges/served-byte-promotion-gate.mjs.
Change: Compare exact candidate bytes after deployment
Dependencies: PIPELINE-37, PIPELINE-38.
Sources: repository inputs and user requirements.
Local acceptance: HTTP200 stalebody negative
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-42: Exact-commit dependency CI

Owner: Ventusltd/pipelinenews; proposed module: cartridges/exact-commit-dependency-ci.mjs.
Change: Pin all proof inputs in Pages candidate lane
Dependencies: none within this programme.
Sources: repository inputs and user requirements.
Local acceptance: Absent sibling owner fails before browser network phase
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-43: Cartridge source boundary

Owner: Ventusltd/pipelinenews; proposed module: cartridges/cartridge-source-boundary.mjs.
Change: Track maintained source to immutable output ownership
Dependencies: none within this programme.
Sources: repository inputs and user requirements.
Local acceptance: No editing historical release as repair
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-44: Print readiness cartridge

Owner: Ventusltd/pipelinenews; proposed module: cartridges/print-readiness-cartridge.mjs.
Change: Capture settled chart and selected filter state
Dependencies: PIPELINE-36.
Sources: repository inputs and user requirements.
Local acceptance: Animated chart readiness, no threshold weakening
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-45: Print geometry tests

Owner: Ventusltd/pipelinenews; proposed module: cartridges/print-geometry-tests.mjs.
Change: Cover fractional DPR and phone landscape
Dependencies: PIPELINE-44.
Sources: repository inputs and user requirements.
Local acceptance: Integer backing size plus actual PDF image geometry
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-46: Performance budget receipt

Owner: Ventusltd/pipelinenews; proposed module: cartridges/performance-budget-receipt.mjs.
Change: Record cold load/sort/scroll with exact build and browser
Dependencies: PIPELINE-06.
Sources: repository inputs and user requirements.
Local acceptance: Repeatable distributions, not one favourable run
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-47: Energy feed attribution/ownership panel

Owner: Ventusltd/pipelinenews; proposed module: cartridges/energy-feed-attribution-ownership-panel/index.mjs.
Change: Keep provider licence and attribution plus producercommit accessible
Dependencies: none within this programme.
Sources: Elexon-Insights.
Local acceptance: Keep provider licence and attribution plus producercommit accessible; negative fixture and independent served-consumer proof required
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-48: CI resume checkpoint

Owner: Ventusltd/spiders; proposed module: cartridges/ci-resume-checkpoint.mjs.
Change: Restore issue/dependency/proof context from compact artifacts
Dependencies: PIPELINE-42.
Sources: repository inputs and user requirements.
Local acceptance: Fresh session reconstructs unfinished release state
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-49: Endpoint environment vaccine

Owner: Ventusltd/cvaa; proposed module: cartridges/endpoint-environment-vaccine.mjs.
Change: Bind source checks to environment-required diagnostic endpoint
Dependencies: none within this programme.
Sources: repository inputs and user requirements.
Local acceptance: Staticserver404 differs from deployed endpoint-not-applicable
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## PIPELINE-50: Independent proof vaccine

Owner: Ventusltd/cvaa; proposed module: cartridges/independent-proof-vaccine.mjs.
Change: Reject proofs whose expected and actual bytes share same faulty producer
Dependencies: PIPELINE-49.
Sources: NESO-ETYS.
Local acceptance: Red negative control and separate expected source
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-01: App DOM frame completion

Owner: Ventusltd/gis-sld-sandbox; proposed module: cartridges/dom-frame/index.mjs.
Change: Complete checkpoint2031 viewport capture without screen permission
Dependencies: none within this programme.
Sources: repository inputs and user requirements.
Local acceptance: Original map, route, toolbar and legend present on desktop and phone; zero display-sharing calls
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-02: Layer PDF integration

Owner: Ventusltd/teleprinter; proposed module: cartridges/layer-pdf/index.mjs.
Change: Consume explicit sandbox capture contract when its layer is active
Dependencies: ATLAS-01.
Sources: repository inputs and user requirements.
Local acceptance: Selected layer PDF contains original UI; ordinary Atlas PDF remains unchanged
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-03: Pipeline print clipping

Owner: Ventusltd/teleprinter; proposed module: cartridges/pipeline-clipping/index.mjs.
Change: Isolate table clipping correction from generic renderer
Dependencies: none within this programme.
Sources: repository inputs and user requirements.
Local acceptance: Reproduce1820 failed region; preserve font and column geometry across viewports
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-04: Source byte budget

Owner: Ventusltd/teleprinter; proposed module: cartridges/source-budget/index.mjs.
Change: Report per-resource byte budgets before full source export
Dependencies: none within this programme.
Sources: repository inputs and user requirements.
Local acceptance: Oversized source identified without truncation or fabricated dependency failures
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-05: Source reader entry selection

Owner: Ventusltd/testcode; proposed module: cartridges/source-entry/index.mjs.
Change: Open small entry module before multi-megabyte data
Dependencies: ATLAS-04.
Sources: repository inputs and user requirements.
Local acceptance: Four tool readers select declared source entry and retain hash checks
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-06: Layer menu separator

Owner: Ventusltd/testcode; proposed module: cartridges/layer-menu-text/index.mjs.
Change: Replace corrupted separators in source and navigation controls
Dependencies: none within this programme.
Sources: repository inputs and user requirements.
Local acceptance: ASCII or valid Unicode labels on Chrome phone and desktop
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-07: GRID switch cartridge

Owner: Ventusltd/gridatlas; proposed module: cartridges/grid-switch/index.mjs.
Change: Lift GRID toggle into isolated control retaining current network data
Dependencies: none within this programme.
Sources: repository inputs and user requirements.
Local acceptance: 400/275/220/132/66kV palette parity; repeat toggle no duplicate map layers
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-08: SUBS switch cartridge

Owner: Ventusltd/gridatlas; proposed module: cartridges/subs-switch/index.mjs.
Change: Lift substations toggle independently of network toggle
Dependencies: ATLAS-07.
Sources: repository inputs and user requirements.
Local acceptance: GRID and SUBS states independent across repeated toggles
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-09: Collapsed layer defaults

Owner: Ventusltd/gridatlas; proposed module: cartridges/layer-defaults/index.mjs.
Change: Centralize fresh-session collapsed panel state
Dependencies: none within this programme.
Sources: NESO-ETYS.
Local acceptance: Fresh desktop and phone show map and bottom-left switches; user opening panel still works
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-10: Control safe area

Owner: Ventusltd/gridatlas; proposed module: cartridges/control-safe-area/index.mjs.
Change: Anchor GRID/SUBS above desktop and mobile safe areas
Dependencies: ATLAS-07, ATLAS-08, ATLAS-09.
Sources: repository inputs and user requirements.
Local acceptance: No overlap with map attribution or tool layer controls at four widths
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-11: Cartridge loader hash guard

Owner: Ventusltd/gridatlas; proposed module: cartridges/loader-hash/index.mjs.
Change: Verify shell entry digest alongside cartridge digests
Dependencies: none within this programme.
Sources: repository inputs and user requirements.
Local acceptance: Tampered shell refused with meaningful error; pinned good build loads
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-12: Cartridge dependency resolver

Owner: Ventusltd/gridatlas; proposed module: cartridges/cartridge-dependencies/index.mjs.
Change: Resolve explicit acyclic dependency versions before loading
Dependencies: ATLAS-11.
Sources: repository inputs and user requirements.
Local acceptance: Missing or cyclic dependency refuses only dependent layer
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-13: Layer lifecycle contract

Owner: Ventusltd/gridatlas; proposed module: cartridges/layer-lifecycle/index.mjs.
Change: Define mount show hide dispose for optional tools
Dependencies: none within this programme.
Sources: repository inputs and user requirements.
Local acceptance: Open-close cycles release listeners without map-state loss
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-14: GIS original baseline proof

Owner: Ventusltd/gis-sld-sandbox; proposed module: cartridges/original-parity/index.mjs.
Change: Maintain original V7 interaction oracle separately from extensions
Dependencies: none within this programme.
Sources: repository inputs and user requirements.
Local acceptance: Reference layout controls and calculations match imported pinned baseline
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-15: GIS route persistence

Owner: Ventusltd/gis-sld-sandbox; proposed module: cartridges/route-persistence/index.mjs.
Change: Save versioned user route GeoJSON explicitly
Dependencies: ATLAS-14.
Sources: repository inputs and user requirements.
Local acceptance: Round-trip pins and route; malformed file cannot overwrite current drawing
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-16: GIS route undo

Owner: Ventusltd/gis-sld-sandbox; proposed module: cartridges/route-undo/index.mjs.
Change: Add bounded undo for manual route changes
Dependencies: ATLAS-15.
Sources: repository inputs and user requirements.
Local acceptance: Undo restores exact previous coordinate sequence; clear reversible
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-17: Module placement adapter

Owner: Ventusltd/layout-tool; proposed module: cartridges/placement-state/index.mjs.
Change: Expose read-only original module placement snapshot
Dependencies: none within this programme.
Sources: repository inputs and user requirements.
Local acceptance: Published dimensions orientation and counts preserved; no engine reimplementation
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-18: Module export cartridge

Owner: Ventusltd/layout-tool; proposed module: cartridges/placement-export/index.mjs.
Change: Export validated placement snapshot as GeoJSON
Dependencies: ATLAS-17.
Sources: repository inputs and user requirements.
Local acceptance: Coordinate reference and units explicit; invalid placements rejected
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-19: Cable geometry snapshot

Owner: Ventusltd/cable-trench-or-drill; proposed module: cartridges/geometry-state/index.mjs.
Change: Expose original trench and drill input geometry
Dependencies: none within this programme.
Sources: repository inputs and user requirements.
Local acceptance: Snapshot preserves original values and calculations independently of Atlas
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-20: Straight-line first pass

Owner: Ventusltd/ventus-grid-engine; proposed module: cartridges/first-pass-contract/index.mjs.
Change: Pin straight-line route as immutable initial screening output
Dependencies: none within this programme.
Sources: repository inputs and user requirements.
Local acceptance: All existing distance fixtures unchanged when advanced routing unavailable
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-21: Manual route comparison

Owner: Ventusltd/ventus-grid-engine; proposed module: cartridges/route-comparison/index.mjs.
Change: Compare traced route length with straight-line baseline
Dependencies: ATLAS-20.
Sources: repository inputs and user requirements.
Local acceptance: Both distances labelled; no implied construction feasibility
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-22: Route source provenance

Owner: Ventusltd/gis-sld-sandbox; proposed module: cartridges/route-provenance/index.mjs.
Change: Attach author source date and coordinate system to route
Dependencies: ATLAS-15.
Sources: repository inputs and user requirements.
Local acceptance: User drawing distinguishable from surveyed or official network route
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-23: Road classification adapter

Owner: Ventusltd/spiders; proposed module: cartridges/road-classification/index.mjs.
Change: Normalize licensed road classes for routing constraints
Dependencies: none within this programme.
Sources: road-data-provider-pending.
Local acceptance: Unknown class remains unknown; B-road preference never grants permission
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-24: River crossing adapter

Owner: Ventusltd/spiders; proposed module: cartridges/river-crossings/index.mjs.
Change: Expose river intersections with source precision
Dependencies: none within this programme.
Sources: river-data-provider-pending.
Local acceptance: Crossing evidence and map dates retained; missing coverage not no rivers
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-25: Rail crossing adapter

Owner: Ventusltd/spiders; proposed module: cartridges/rail-crossings/index.mjs.
Change: Expose rail intersections as reviewed constraints
Dependencies: none within this programme.
Sources: rail-data-provider-pending.
Local acceptance: Crossings flagged without automatic permission or invented engineering clearance
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-26: Constraint overlay

Owner: Ventusltd/gridatlas; proposed module: cartridges/route-constraints/index.mjs.
Change: Render road river rail evidence independently of base map
Dependencies: ATLAS-23, ATLAS-24, ATLAS-25.
Sources: road-data-provider-pending, rail-data-provider-pending, river-data-provider-pending.
Local acceptance: Each source can fail independently; straight-line layer remains available
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-27: Route alternatives

Owner: Ventusltd/ventus-grid-engine; proposed module: cartridges/route-alternatives/index.mjs.
Change: Offer explicit scored corridor alternatives after first pass
Dependencies: ATLAS-20, ATLAS-21, ATLAS-26.
Sources: repository inputs and user requirements.
Local acceptance: Weights and excluded edges shown; missing data produces unassessed segments
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-28: Trench scenario inputs

Owner: Ventusltd/cable-trench-or-drill; proposed module: cartridges/trench-scenario/index.mjs.
Change: Isolate trench depth width reinstatement inputs
Dependencies: none within this programme.
Sources: repository inputs and user requirements.
Local acceptance: Units and user assumptions shown; original geometry output parity
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-29: HDD scenario inputs

Owner: Ventusltd/cable-trench-or-drill; proposed module: cartridges/hdd-scenario/index.mjs.
Change: Isolate directional-drill entry exit and bend assumptions
Dependencies: none within this programme.
Sources: repository inputs and user requirements.
Local acceptance: Geometry constraints tested; no automatic geotechnical approval
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-30: Crossing method comparison

Owner: Ventusltd/cable-trench-or-drill; proposed module: cartridges/crossing-method/index.mjs.
Change: Compare trench and drill scenario quantities
Dependencies: ATLAS-19, ATLAS-28, ATLAS-29.
Sources: repository inputs and user requirements.
Local acceptance: Quantity basis and exclusions visible; no unsupported preferred design
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-31: Route cost basis

Owner: Ventusltd/gis-sld-sandbox; proposed module: cartridges/route-cost-basis/index.mjs.
Change: Bind estimates to timestamped user rates and route quantities
Dependencies: ATLAS-21, ATLAS-30.
Sources: repository inputs and user requirements.
Local acceptance: All totals trace to explicit inputs; stale feed cannot silently refresh estimate
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-32: Published fault levels

Owner: Ventusltd/ventus-grid-engine; proposed module: cartridges/published-fault-adapter/index.mjs.
Change: Integrate Claude published-fault-level contract after handover
Dependencies: none within this programme.
Sources: NESO-ETYS.
Local acceptance: Exact metric date busbar voltage units and source; never infer headroom or calculate fault current
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-33: Fault evidence layer

Owner: Ventusltd/gridatlas; proposed module: cartridges/fault-evidence-layer/index.mjs.
Change: Show published figures as independent evidence layer
Dependencies: ATLAS-32, ATLAS-34.
Sources: NESO-ETYS.
Local acceptance: Missing figures explicit; no capacity colour inferred from fault-current magnitude
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-34: Connection point identity

Owner: Ventusltd/data-grid-gb; proposed module: cartridges/connection-identity/index.mjs.
Change: Expose exact transformer and busbar join evidence
Dependencies: none within this programme.
Sources: repository inputs and user requirements.
Local acceptance: Ambiguous voltage or site joins fail closed using existing ETYS fixtures
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-35: Network lineage panel

Owner: Ventusltd/gridatlas; proposed module: cartridges/network-lineage/index.mjs.
Change: Display dataset version and ingestion source for selected grid asset
Dependencies: ATLAS-34.
Sources: repository inputs and user requirements.
Local acceptance: Asset ID resolves pinned owner record with timestamp and licence
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-36: REPD status delta

Owner: Ventusltd/spiders; proposed module: cartridges/repd-status-delta/index.mjs.
Change: Publish dated changes in project planning status
Dependencies: none within this programme.
Sources: DESNZ-REPD.
Local acceptance: Stable project IDs; removed records not silently counted as new
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-37: User evidence intake

Owner: Ventusltd/spiders; proposed module: cartridges/user-evidence/index.mjs.
Change: Validate user observations as attributed unverified submissions
Dependencies: none within this programme.
Sources: repository inputs and user requirements.
Local acceptance: No automatic overwrite of official project or network attributes
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-38: Evidence conflict cartridge

Owner: Ventusltd/cvaa; proposed module: cartridges/evidence-conflict/index.mjs.
Change: Detect conflicting source values with provenance
Dependencies: ATLAS-37.
Sources: repository inputs and user requirements.
Local acceptance: Conflict retained as finding; newest timestamp alone cannot establish truth
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-39: Original electricity chart layer

Owner: Ventusltd/gb-electricity-ui; proposed module: cartridges/electricity-history/index.mjs.
Change: Port the original V6 electricity price chart as an independent layer consuming proven owner data products
Dependencies: PIPELINE-34.
Sources: Elexon-Insights, data-gb-electricity.
Local acceptance: Upstream data gate first: keys coverage canary rows and byte budget. Preserve original seasonal colours, negative prices, high/low callouts, date/period/day-night controls, history scroller and fullscreen. Half-hour detail loads only selected partitions; long-range aggregation retains extrema.
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-40: Weekly PV layer

Owner: Ventusltd/gridatlas; proposed module: cartridges/weekly-pv/index.mjs.
Change: Render attributed PV estimates with regional boundary version
Dependencies: PIPELINE-31.
Sources: Sheffield-PVLive.
Local acceptance: Estimate scope explicit; no double-count with Elexon series
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-41: Metals source adapter

Owner: Ventusltd/spiders; proposed module: species/market-spider/metals/index.mjs.
Change: Lift copper and aluminium collection from monolith page writers
Dependencies: none within this programme.
Sources: metal-market-provider-pending.
Local acceptance: No fixed fallback marked fresh; instrument exchange contract currency and mass unit preserved
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-42: FX source adapter

Owner: Ventusltd/spiders; proposed module: species/market-spider/fx/index.mjs.
Change: Collect weekly validated GBP USD EUR observations
Dependencies: none within this programme.
Sources: ExchangeRate-API.
Local acceptance: Positive finite rates; base currency explicit; source observation date retained
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-43: Oil source adapter

Owner: Ventusltd/spiders; proposed module: species/market-spider/oil/index.mjs.
Change: Collect bounded oil observations separating spot and futures
Dependencies: none within this programme.
Sources: EIA-FRED-oil.
Local acceptance: FRED EIA spot series not silently replaced by Yahoo futures in same series
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-44: Weekly market product

Owner: Ventusltd/spiders; proposed module: cartridges/weekly-market/index.mjs.
Change: Publish immutable compact market observations with manifest
Dependencies: ATLAS-41, ATLAS-42, ATLAS-43.
Sources: repository inputs and user requirements.
Local acceptance: Idempotent weekly keys; stale last-good distinct from failed attempt; no synthetic geometry
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-45: Financial layer feed

Owner: Ventusltd/gis-sld-sandbox; proposed module: cartridges/market-input-layer/index.mjs.
Change: Offer explicit import of dated market assumptions
Dependencies: ATLAS-31, ATLAS-44.
Sources: repository inputs and user requirements.
Local acceptance: User must choose update; saved scenario remains pinned to old observations
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-46: GPU equivalent-work benchmark

Owner: Ventusltd/gpu-drivers-for-global-grid; proposed module: cartridges/cpu-gpu-oracle/index.mjs.
Change: Compare same workload against CPU oracle with transfer costs
Dependencies: none within this programme.
Sources: repository inputs and user requirements.
Local acceptance: Adapter bytes upload compute readback and warm/cold timings reported separately
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-47: GPU optional adapter

Owner: Ventusltd/gpu-drivers-for-global-grid; proposed module: cartridges/optional-compute/index.mjs.
Change: Expose optional accelerator behind deterministic CPU fallback
Dependencies: ATLAS-46.
Sources: repository inputs and user requirements.
Local acceptance: Unavailable GPU gives identical result; benchmark does not claim end-user speedup
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-48: Cartridge isolation vaccine

Owner: Ventusltd/cvaa; proposed module: cartridges/cartridge-isolation/index.mjs.
Change: Detect app-wide failure caused by optional module rejection
Dependencies: ATLAS-12, ATLAS-13.
Sources: repository inputs and user requirements.
Local acceptance: One failed layer leaves search GRID SUBS and straight-line computation usable
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-49: Federated build-plan reader

Owner: Ventusltd/spiders; proposed module: cartridges/build-plan-reader/index.mjs.
Change: Project declared build relationships into separate federation cartridge
Dependencies: none within this programme.
Sources: repository inputs and user requirements.
Local acceptance: All100 build IDs resolve; planned edges never labelled observed runtime dependencies
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

## ATLAS-50: Release evidence gate

Owner: Ventusltd/testcode; proposed module: cartridges/release-evidence/index.mjs.
Change: Require exact source engine data and served-byte receipts per new timestamp
Dependencies: ATLAS-48, ATLAS-49.
Sources: repository inputs and user requirements.
Local acceptance: One substantive change; no accepted state before required local CI Chrome and deployed checks
Chrome: Use actual File/menu/layer interaction on desktop and phone viewport; save screenshot and action receipt. Data-only changes require consumer check. No physical-device claim.
CI: Run owner fixtures and consumer contract at exact commits; retain failed receipts; unrelated red jobs stay visible.
Publication: Unique UTC-minute candidate; served source/data/module digests match pins; repeat applicable Chrome action before acceptance.
Rollback: Keep previous immutable release and data manifest; revert current pointer only after verifying old served bytes. Never rewrite historical release.

