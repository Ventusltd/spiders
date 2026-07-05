# GitHub Pages Source Card

Document type: source-card

Source name: GitHub Pages

Publisher / owner: GitHub

Primary URL: https://docs.github.com/pages

Source-card status: draft

Last checked: unknown

Licence: study required

Attribution requirement: study required

Access method: public HTTPS pages and repository Pages settings

API key required: no for public page reads; yes only for settings or repo writes

Rate or access limits: study required

Data type: static served HTML, CSS, JavaScript, JSON and assets

Update frequency: redeploys after repository changes

Declared fields: committed files served from the configured Pages source

Derived-only fields: health, latency, redirect behaviour, cache state and live status inferred by probing

Known gaps: deploy lag, cache, custom domain differences, 404 during rollout, relative path mistakes

Known failure modes: 404, stale page, wrong branch, wrong root folder, Jekyll rendering README instead of index, missing `.nojekyll`

Allowed Spider use: check whether public surfaces load, record served paths, distinguish live versus missing surfaces

Not-allowed Spider use: treating a 200 response as certification that the content is correct or current

Screening boundary: GitHub Pages probes are surface-health evidence only

Notes: use `.nojekyll` for static species pages where README rendering would interfere with index files.
