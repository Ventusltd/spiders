# Optional constrained routing after the direct baseline

The straight-line engine remains the first pass. Direct connection and distance are available before constraint data loads and remain available when an optional route succeeds, fails, is cancelled or lacks coverage. Keep the direct and constrained results separately labelled, bound to the same selected project and attempt. A constrained route is not a replacement baseline or a permission to construct.

## What the inspected sources establish

The [NGED connection-costs FAQ](https://connections.nationalgrid.co.uk/connection-costs-faqs) describes an indicative connection-cost tool limited to connections up to 210 kVA. It explains that routes crossing watercourses, protected areas or unsuitable surfaces may be rejected by that tool. This supports recording route constraints and escalation for that tool's scope. It does not create a universal rule for transmission routes or establish that a particular B-road permits installation. Independently read during this session on 5 September 2026.

The [UK Power Networks Willesborough project page](https://www.ukpowernetworks.co.uk/willesborough) describes a 5.3 km underground cable route between substations, with ducts installed and cables pulled through, including the A2070 and work coordinated with the local authority. It demonstrates a project-specific designed route and highways coordination. It does not justify a blanket ban on A-roads or general permission to follow B-roads. Independently read during this session on 5 September 2026.

The root agent's review of [National Grid document 336886](https://www.nationalgrid.com/document/336886/download) identifies HVDC context, avoidance considerations and specific horizontal directional drilling crossings. Preserve that source's project and technology context; do not copy its trench dimensions into a general solar/distribution routing model. The tracker agent's independent retrieval hit the web tool's 29.6 MB document limit and a direct HTTP 403, so that document's detailed interpretation remains attributed to the root review until a cached extract is attached. No numerical engineering rule is derived from the inaccessible extract here.

None of the inspected evidence establishes blanket B-road permission. A preference for B-roads is the user's **soft routing policy**, represented as a configurable cost or preference. It must not silently turn into an eligibility flag, highway consent or assumption of empty verges.

## Component boundary and data contract

`ventus-grid-engine` should own the optional routing calculation contract; data owners provide explicit graph and constraint products. The standalone GIS application consumes that result through a separate adapter. Drawing belongs to the application. Preserve the current distance model and raw result independently rather than changing the first-pass calculation to make a constrained route look consistent.

Each optional result should record the selected entity/location/attempt, direct-baseline identity, graph and constraint revisions, coverage footprint and timestamp, route geometry and length, cost terms, crossings, exclusion reasons, warnings and result status. Distinguish no route found, missing or incomplete data, computation failure and a route requiring review. Missing constraint data is unknown coverage, not evidence of an unconstrained corridor.

Treat crossings separately from following a road. Watercourse, railway and major-road crossings need their own identified events, cost/penalty terms and review status. Do not infer a construction method such as HDD solely from an intersecting polyline, or transfer dimensions from a different voltage and project. The first implementation may be an explicit research comparison with manual review points while those models are incomplete.

Road classification must come from an identified routable graph, with connectivity and classification checked. The visible basemap alone does not establish a complete graph or legal access. Keep B-road preference, protected-ground avoidance and crossing penalties distinguishable so the user can see why alternatives differ.

## Acceptance before a new routing feature is promoted

- Direct baseline remains usable with no routing graph or constraint datasets loaded.
- An optional second pass retains both results, with identical selected entity and attempt identity.
- Missing coverage is reported explicitly; no silent conversion to zero constraints or a claimed feasible route.
- Second-pass failure/cancellation does not remove, overwrite or relabel the direct result.
- B-road preference can alter ranking without conferring permission; disabling the preference restores the underlying cost comparison.
- Known crossing fixtures identify separate crossing events and review requirements instead of treating all roads as equivalent.
- Selecting another project prevents stale routing or distance badges from being displayed as current.
- Independent raw geometry/length checks use stated units and Earth model; visual drawing and calculated values are checked separately.

This is P9 research and implementation planning. No new routing engine, constraint dataset, construction authorization or accepted route is claimed by this document.


## Existing manual-route parity evidence

The offline `original-gis-engine-comparison.json` records unchanged engine `f9531a7a36ff1b2557362bf2a61949066f393821`: direct first pass 0.20022376989905494 km and four-vertex manually drawn route 0.4405921418291705 km. The original GIS export reports 0.4405921418291706 km, a difference of approximately 1.1e-16 km. Both results are retained. This supports distance parity for this manual example; it does not prove an automatic route, obstacle avoidance, complete constraint data or construction permission.
