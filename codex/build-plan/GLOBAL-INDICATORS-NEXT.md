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
