# Environment Agency LiDAR Composite (Web Coverage Service) Source Card

Document type: source-card

Source name: Environment Agency LIDAR Composite, 1 m terrain (DTM) and first-return surface (DSM), 2022 release

Publisher / owner: Environment Agency (England)

Primary URL: https://environment.data.gov.uk/spatialdata/lidar-composite-digital-terrain-model-dtm-1m/wcs (terrain). The surface product's service address is still to be confirmed: one guessed address answered HTTP 404 on 27 September 2026.

Source-card status: draft, measured on 27 September 2026

Last checked: 2026-09-27

Licence: Open Government Licence v3.0

Attribution requirement: "© Environment Agency copyright and/or database right 2022. All rights reserved." It is shown wherever heights from this source, or anything derived from them, are displayed.

Access method: OGC Web Coverage Service 2.0.1 GetCoverage, with a subset box in British National Grid metres (EPSG:27700). The answer is a GeoTIFF of 32-bit floats in 1 m cells. The service allows cross-origin requests, so a browser can stream a tile directly.

API key required: no

Data type: gridded heights (terrain and surface) at 1 m, as a national composite of surveys flown in different years

Declared fields: height in metres per 1 m cell, and the nodata value

Derived-only fields:
- the slope;
- objects above ground (surface minus terrain);
- the wireframe;
- rows, tables and other structures found by scanning;
- tile receipts (the sha256 of the decoded cells).

Survey year: the composite does not return a survey year with each cell. It is read from the survey index before streaming. Where it is unknown, rows are not scanned (wireframe rule R5, rule 9).

Coverage: England. At a border, or at sea, the service may answer with exact zeros and no nodata tag. These are recorded as "no measured ground here", never 0 m. Outside its envelope it answers with an error.

Allowed Spider use: under wireframe rule R5, the site tile, only.
- Fixed 2,048 m lattice tiles under a place someone has arrived at.
- One request per product per tile per visit.
- At least 40 s between requests, and at most 16 per client per day.
- Streamed into memory, with only the derived wireframe and a receipt kept.

Not-allowed Spider use:
- bulk or national downloads;
- mirrors of raw heights;
- pre-fetching places nobody has arrived at;
- asking for the same ground in small pieces (the service refused a client after about ten requests in three minutes);
- any request from CI;
- treating a survey that predates an asset as a survey of the asset.

Measured behaviour (27 September 2026):
- One 2,048 m terrain tile: HTTP 200, 16,777,763 bytes, 4,194,304 cells, every cell valid.
- One 4,096 m terrain box: HTTP 200, 67,109,795 bytes, every cell valid. Its middle 2,048 m was identical to the tile, cell for cell.

Rule and code: https://github.com/Ventusltd/ventus-grid-engine/blob/main/docs/site-tile.md (the rule, signed by three witnesses) and engine/site-tile.js, with 40 proofs.

Screening boundary: heights are measured by the publisher. Everything derived from them is screening-grade and labelled with its receipt. It is not a topographic survey.
