# Global energy and human indicators — requested next

User request 2026-09-05: original terminal-style retro bars covering ALL eleven Energy-section indicators on Worldometer's homepage, then relevant population/climate/human indicators. Coronavirus content is excluded. This is a pending build request, not completed publication.

The existing homepage review bars and calendar/millisecond clocks are live at GlobalGrid2050 commit b7e8d25d6d0876b6c18c8bb5d2623da396760bad. They contain no Worldometer counters or unverified physical telemetry.

## Reuse finding

Worldometer's FAQ says its moving counters are estimates from statistical models and describes paid licensing for placing them on other websites. The site footer reserves rights. No open-source counter license was found. Do not copy its JavaScript, animations or feed. Build an original renderer and validate underlying primary datasets and their terms before publication.

- https://www.worldometers.info/faq/
- https://www.worldometers.info/disclaimer/
- https://www.worldometers.info/
- https://www.worldometers.info/energy/
- https://www.worldometers.info/world-population/

## Complete requested Energy-section scope

1. Energy consumed today, MWh.
2. Non-renewable component, MWh.
3. Renewable component, MWh.
4. Solar energy incident on Earth today, MWh.
5. Crude oil production today, barrels.
6. Reported oil reserves, barrels.
7. Oil reserves/production equivalent duration.
8. Reported dry natural-gas reserves, cubic metres.
9. Gas reserves/production equivalent duration.
10. Reported coal reserves, tonnes.
11. Coal reserves/production equivalent duration.

The three reserve-duration bars must not claim literal depletion dates. Reserves and production depend on reporting year, economics, technology and revisions. Keep stock, annual flow and projected counter separate. Distinguish total primary energy from electricity, and non-renewable from fossil-only. Primary energy accounting methodology must be consistent across components.

Worldometer's Energy page contains differing headline/narrative fossil-share figures in the inspected snapshot. Resolve definitions and primary source before importing any values. Do not average discrepancies away. Its visible homepage names differing reference years for oil, gas and coal production; do not turn those into a falsely uniform current-year dataset.

Candidate primary sources: EIA international energy statistics for energy and fuel series; NASA for incoming solar radiation and physical assumptions; UN Population Division for demographic estimates; IPCC/authoritative emissions datasets for climate context. These are source candidates, not yet verified adapters. A confirmed owner repository and source register are required before adding workflows or restarting API collectors. Do not crowd the GB electricity data repository with unrelated world indicators.

Each indicator must carry units, geography, period, value kind (observed/modelled/illustrative), source URL, retrieval date, calculation formula, time basis and uncertainty/caveat. Annual-rate animation is an explicitly labelled interpolation, not live instrument data. Missing or stale data stays visibly unavailable. Clock animation can remain fast; statistical precision must not be inferred from rapidly changing digits.

Use the existing lightweight terminal design as an independent cartridge with a small validated data manifest. Keep raw evidence offline; compact summaries in Git; keyed Parquet for large future tabular products following existing data discipline. Add component-sum, unit-conversion, UTC/day boundary, missing-data and stale-data tests before Chrome desktop/phone checks and publication.

Population and climate extensions should be selected for teaching value rather than reproducing the entire site: population estimates, emissions and energy access are candidates. Do not introduce sensitive health counters under this request.

## Restart state

The keeper subagent reported a usage-limit error at the end of this session; reported retry date 12 September 2026 02:35, timezone not provided. Root independently verified the final homepage served bytes afterward. The energy-indicator build remains pending. Review the current account usage display rather than assuming a reset.

## 2026-09-05 21:52 UTC implementation and next sources

Original first cartridge committed in GlobalGrid2050 at acbbfdf3: cartridges/202609052143-open-energy. Three average-day primary-energy counters use the same EIA 2024 table: total 606.0 and renewable 42.7 quadrillion Btu; non-renewable is the difference and includes nuclear. Five numerical/boundary/invalid-data tests passed. Chrome desktop/393/360 checks passed, including pause/resume and missing baseline. CI33993929988 passed. Pages served acceptance remains pending at this checkpoint. This is three of the eleven requested energy indicators, not completion of the entire scope.

EIA permits reuse of its own data with source/date attribution: https://www.eia.gov/about/copyrights_reuse.php . Baseline: https://www.eia.gov/tools/faqs/faq.php?id=527&t=1 . No copied Worldometer code/feed. The user prefers original models and open primary sources. Keep source data separate from model functions and DOM presentation. Tiny immutable source manifests are presentation baselines, not reactivated collector workflows.

NASA candidates: Greenland/Antarctic mass change (GRACE/GRACE-FO), sea level, and forest-cover change. https://www.earthdata.nasa.gov/engage/open-data-services-software/data-use-policy permits use of generally uncopyrighted NASA-sponsored material with attribution; non-NASA products have their own terms. https://www.nasa.gov/stem-content/antarctic-ice-mass-data-set/ supplies a small educational series. https://www.earthdata.nasa.gov/centers/lp-daac describes forest-cover and disturbance products. Tree-cover loss is not automatically deforestation; ice mass, sea-ice extent, and melt rate are different quantities. No NASA collector or counter is implemented yet.

NREL/NLR candidates: PVWatts V8 for monthly/annual yield; NSRDB for bounded location-specific solar resource; SSC for independently tested local compute. Current official APIs direct clients to developer.nlr.gov. https://developer.nlr.gov/terms/ permits developer data use, with no endorsement and other terms. https://github.com/NatLabRockies/ssc/blob/develop/LICENSE is BSD-3-Clause. https://developer.nlr.gov/docs/solar/pvwatts/v8/ and https://developer.nlr.gov/docs/solar/nsrdb/ are adapter references. The 2024 multiterawatt workshop article describes about 75 TW or more by2050 as a decarbonisation need, not observed deployment or guaranteed forecast. A target scenario must carry that distinction. Do not bulk-download NSRDB or expose API credentials in browser code. These are planned adapters, not implemented.

Ember API docs https://api.ember-energy.org/docs identify CC-BY-4.0 data and API-key registration. Record per-product license, canonical dataset ID, upstream URL and redirects, retrieval date, source period, units and content hash. Fetch to a temporary candidate, reject HTML/error bodies, validate schema and component sums, then atomically promote. Keep the last verified snapshot with its date when upstream links fail; never convert missing data to zero or switch to a semantically different mirror. Cover404, redirect, HTML200, corrupt CSV, changed schema and stale baseline in regression fixtures. Large data stays in confirmed owner Parquet products; browser counters use small summaries. Existing GB chart UI remains in gb-electricity-ui; this does not authorize global archives there.

Overnight monitor: gpu-drivers-for-global-grid commit75f56f6 adds codex/monitor-local.py and monitor-local.html, read-only loopback at http://127.0.0.1:8978/ . Active supervisor PID7896 and scheduler PID45072 verified. Monitor PID17992 records heartbeat every30seconds. All stop after the existing bounded observation window; no agent remains secretly running after chat ends. GitHub estate audit33992069499 completed successfully. Continuation reader664938b supports offset/limit partitions; 1316 previously uninspected eligible files were parsed across GlobalGrid2050, GridAtlas and PipelineNews. Two GlobalGrid2050 syntax findings require current-release tracing; neither is automatically deployed or repaired. Evidence: offline-screenshots/continuation-review-202609052151.
