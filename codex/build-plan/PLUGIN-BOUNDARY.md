# Optional VENTUS Core layer plugins

The existing monolith `ventus-core.js` and V8 engine expose `window.initVentusMap`. The inspected source does not establish a generic plugin registration API. `ventus-grid-engine/docs/v8-seams.md` already separates pure computation from MapLibre/DOM work; its README explicitly says the extracted engine is not the renderer. Do not put chart UI or API collection into that mathematics package simply because it is named an engine.

The existing layer mechanism must be reused: `globalgrid2050/repd_grid_atlasv8/index.html` defines `ukConfig`; the engine freezes it as GRID_CONFIG, generates controls from group.layers and hydrates entries with preload. The current Atlas immutable shell `atlas/releases/202608300453-atlas-v9/index.html` retains this config, while `atlas/current.json` pins executable cartridges by path and SHA256. Map data descriptors belong in that config; standalone UI tools need a compatible adapter without pretending an iframe is a GeoJSON line/point source. Do not create a second competing registry.

ATLAS-13 is the small host lifecycle adapter. It can serve as the VENTUS Core plugin boundary while remaining owned by the Atlas application shell. Optional packages stay in their established homes:

| Plugin | Owner | Product consumed |
|---|---|---|
| Electricity charts | gb-electricity-ui | Proven data-gb-electricity window/rollup manifests |
| GIS SLD Financial Sandbox | gis-sld-sandbox | Original standalone UI plus versioned route/context adapter |
| Module Layout | layout-tool | Original placement UI and explicit placement snapshot |
| Cable trench or drill | cable-trench-or-drill | Original geometry and versioned scenario inputs |
| Market observations | Spiders market species | Typed weekly observations; UI readers own their presentation |

Proposed host contract: a manifest declares plugin ID, immutable release/commit, entry URL and digest, supported context schema, required data manifests and labelled button. Lifecycle is mount/show/hide/dispose. Context is an explicit snapshot of project ID, coordinates and selection version, not shared mutable internal state. A plugin returns declared results through a validated adapter; stale selections are rejected. Optional modules have independent loading/error states and can be disabled without blocking the map, project search, GRID/SUBS or first-pass distances.

Reuse the existing iframe isolation and tool-layer readiness/focus/recovery cartridges where applicable. Preserve the original standalone app design. Do not inject source into the Core closure, duplicate calculations or silently upgrade a plugin URL behind an immutable release.

Before applying this interface, audit its exact host dependencies and prove open/close/reopen, failed load, wrong digest, incompatible context, focus return and unchanged base-app behaviour in Chrome. This document records the architecture choice; it does not claim that the general plugin adapter is implemented.
