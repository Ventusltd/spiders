# Truthful standalone-tool readiness

Read directly from immutable GIS9fe7b2d/release1855, Layout e201075/release1858 and Cable76396fd/release1921 on5September2026. These observations do not change producer runtime bytes.

| Tool | Truthful existing signal | What it does not establish |
|---|---|---|
| GIS SLD | Required interface controls exist after document loading | Map style, source data, user geometry and drawing completion remain separately unreported |
| Module Layout | Exact `#ml_status` initial Ready message is written in map load handler after sources/layers are added | No modules have been drawn yet; initial count0 is legitimate |
| Cable Geometry | All three named canvases contain meaningful nonblank/nonuniform drawing pixels after script initialisation | Static prefilled Ready text is not evidence, and drawings do not establish engineering suitability |

GIS `gis-sld-v5-map.js` declares lexical `let map`; state is lexical const. They are not window properties. `boot` wires inputs at DOMContentLoaded, then asynchronous `onMapLoad` adds topology and render layers, starts substation fetching, updates legend and recalculates summaries. Substation success text disappears after2.5seconds; blank `#fetch_status` is not success. Initial `src-subs` is empty, so source existence does not prove downloaded data. Legends and numerical summaries can also update from controls without completing map rendering.

For a future static read-only child-realm sidecar, expose explicit capabilities: interface loaded; map/style initialised; topology source and expected draw layers installed; source-data status; ready to draw; user operation and rendered revision. Keep errors, missing/unknown data and empty legitimate geometry distinct. A direct lexical read inside the child realm is possible in a dedicated static adapter; avoid parent `window.map` assumptions or dynamic string evaluation. [MapLibre's API documentation](https://maplibre.org/maplibre-gl-js/docs/API/classes/Map/) distinguishes style readiness from a source having no outstanding requests. Neither certifies the correctness or non-emptiness of application data.

Module's `mlBuildLayout` sets Rendered text and count before looking up the optional module-layout source. Thus a premature Draw can claim a count before that source exists; its subsequent map load handler resets counts to0. Rendered text/count alone is not a safe alternative map-ready signal. Exact initial Ready may also be replaced by user actions before an observer sees it. A missed initial readiness event must not be fabricated from numerical results.

Cable index.html contains the Ready status text before scripts. Its five scripts culminate in `ui.js` init/renderAll. The render function updates status before drawing formation, trench and bend canvases. Initial readiness should inspect actual named canvases, bounded pixel samples and visible dimensions. Repeated full-frame scans every200ms allocate unnecessary image data. Later input-bound drawing revision is separate N09 work; initial-load readiness must not pretend to track every subsequent edit.

A navigation observer needs a deadline even when iframe load never fires; a timeout started only by load misses that case. Clear stale timeout metadata when a new navigation starts or subsequently succeeds. Dispose timers/listeners when removed. Keep initial navigation, pending drawing, timeout, cross-origin/unavailable interface and unknown capability distinct. Negative controls should cover missing load event, reload after timeout, static Ready text with blank canvases, invalid/partial canvases and unchanged producer bytes.
