# Integration snippets

These are snippets to apply later, per surface, under that surface's own
governance. **None of them has been applied.** This task's mandate was to
write new files only under `spiders/species/seer-spider/estate-menu/`; no
existing file in any repository was modified, and nothing was committed or
pushed.

---

## GridAtlas — NOT a script tag

GridAtlas already has a menu bar
(`gridatlas/atlas/modules/202609031958-menu-bar.js`, id
`gridatlas-menu-bar`). Adding `estate-menu.js` there as a second script
would trip this module's own refusal (`mount()` sees `#gridatlas-menu-bar`
and renders nothing) — which is correct, but pointless: GridAtlas does not
need a second bar, it needs its *existing* bar to carry the estate's other
surfaces.

The integration is GridAtlas's own module reading
`window.__VENTUS_ESTATE_MENU__.entries(name)` and appending the result into
the panels it already builds, inside `install(doc)` in
`202609031958-menu-bar.js`:

- **Where**: immediately after `buildLayerControls(ready.found);` (line 774)
  and before the block of `move(panels.File, ready.nodes.search); …` calls
  that begins at line 776. At that point `panels.File`, `panels.Edit`,
  `panels.View` and `panels.About` already exist as real DOM nodes (built by
  `buildBar`, lines 489–531) and are still empty of content, so appending to
  them here costs nothing to the control-moving logic that follows.
- **What it would do**: for each of `'File'`, `'Edit'`, `'View'`, `'About'`
  — deliberately *not* `'Scope'` or `'Grid'`, which stay GridAtlas's own
  real controls, never duplicated — read
  `window.__VENTUS_ESTATE_MENU__.entries(name)` if the global exists, build
  the same row/link shapes `estate-menu.js` builds internally (see
  `makeLink`/`makeRow`/`appendGroup` in this directory's `estate-menu.js`
  for the exact DOM shape and class names — they already match GridAtlas's
  own `.gm-panel a/button` styling, since both were read from the same
  source file), and append them into the corresponding `panels[name]`
  **after** the moved GridAtlas-native controls, under a group heading such
  as `Estate` so they read as an addition, not a replacement.
- **Guard**: only call this when
  `typeof window.__VENTUS_ESTATE_MENU__ === 'object'` — GridAtlas must keep
  working, unchanged, on a page where this module never loaded.
- **Governance**: `gridatlas/CLAUDE.md` — "Read and follow `AGENTS.md`. The
  generated `STATE.md` and `atlas/current.json` are the current facts" — so
  this change belongs to a GridAtlas composition cycle (a new cartridge
  generation, proved by `gridatlas/tools/proofs/run-current.mjs`), not an
  ad-hoc edit to the shipped module file.

---

## GlobalGrid2050 homepage

File: `globalgrid2050/index.html` (111,720 bytes, one inline `AREAS` data
block).

```html
<script src="https://ventusltd.github.io/spiders/species/seer-spider/estate-menu/estate-menu.js" defer></script>
```

**Where**: as the last line inside `<head>…</head>`, immediately before the
closing `</head>` tag (line 44 in the copy read for this task). Placed in
`<head>` with `defer`, it does not block parsing, and it runs after the
inline `AREAS` script (which is a normal, non-deferred `<script>` at line 66
and executes synchronously during parsing) without depending on it — the
menu module touches nothing inside that block.

**Governance — repeated verbatim from `estate-menu-manifest.json`'s
`homepage_constraints`**:

- numbered snapshot `homepage_v00N.html` with line/word/char counts and a
  plain-English intention BEFORE any edit (`homepage_versions/README.md`)
- the `V8_ENTRY` sentinel and `GRIDATLAS_V9_AUTOMATION_START`/`_END` markers
  must survive byte-for-byte (`scripts/catalogue_gridatlas_v9.py` fails
  closed otherwise)
- change only the structure he names; every existing `name:` and `note:`
  string byte-identical, diffed to prove it
- the 2026-08-31 outage came from a string-surgery edit to that inline
  block; the menu therefore lands as ONE additive `<script src>` tag and
  touches nothing inside the file

This task did not touch `globalgrid2050/index.html`. No snapshot was taken,
because no edit was made.

---

## Pipeline News (`globalgrid2050/uk_renewables_pipeline/v9.7/index.html`)

```html
<script src="https://ventusltd.github.io/spiders/species/seer-spider/estate-menu/estate-menu.js" defer></script>
```

**Where**: as the last line inside `<head>…</head>`, after the existing
`<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>` (line 13 in
the copy read for this task) and before `</head>` (line 14).

**The page's own header, checked**: `body{display:flex;height:100vh;
overflow:hidden}` (`styles/v7.css`) — a horizontal flex row of `.sidebar`
(fixed 250px) and `.main` (`flex:1`, its own `.header` div holding the
`<h1>UK RENEWABLES PIPELINE V9.7</h1>` sits in normal flow inside `.main`,
not fixed or sticky). `estate-menu.js` mounts itself as `position:fixed` at
`top:0`, so it does not push the page's flex row on its own; instead
`mount()` (see `applyClearance()` in `estate-menu.js`) measures its own
rendered height and adds that to `document.body`'s **existing**
`padding-top` (read once via `getComputedStyle`, not overwritten), so
`.sidebar` and `.main` — and the `.header` inside `.main` — are both pushed
down by exactly the bar's height, never covered by it.

**`--gridatlas-menu-bar-clear` value this page needs**: the bar renders at
36px tall above 700px width and 34px at or below it (same breakpoint as
GridAtlas's own bar — see `estate-menu.js`'s `@media(max-width:700px)`
rule). `applyClearance()` sets the variable to the bar's *measured* height
+ 8px, so **44px at desktop widths, 42px at and below 700px** — matching
the pre-JS fallback GridAtlas's own module documents for the same variable
(comment at `202609031958-menu-bar.js` line 332: "44px is only the pre-JS
fallback"). Because `*{box-sizing:border-box}` is already set on this page
(`styles/v7.css` line 1), the added `padding-top` is absorbed inside the
existing `height:100vh`, so nothing is clipped at the bottom of `.paper`'s
own scroll area — verified by mounting a test copy of this exact file with
the tag injected (never the original) and measuring the rendered layout;
see `estate-menu.proof.mjs` and the screenshots this task produced.

**Governance**: none is stated for this file beyond "one tag" in the task
brief; this is Pipeline News's own publishing repository
(`globalgrid2050/uk_renewables_pipeline/`), and the version list inside its
own `.nav` sidebar is exactly what the estate menu's FILE panel is meant to
take off the reader's face over time — a later, separate decision, not made
here.

---

## The federation map
(`data-federation-map-for-globalgrid2050-all-repos/dashboard/sandbox/spider_full_po_test.html`)

```html
<script src="https://ventusltd.github.io/spiders/species/seer-spider/estate-menu/estate-menu.js" defer></script>
```

**Where**: as the last line inside `<head>…</head>`, immediately before
`</head>` (line 85 in the 208-line file read for this task) — after the
page's own `<style>` block and its `<link rel="stylesheet"
href="../federation_radial.css" />`.

This page's own header — `.top` > `.bar`, carrying "VENTUS · GLOBAL GRID
2050 / The Spider Sandbox" — sits in normal flow, not fixed, inside a
`body{display:flex;flex-direction:column;height:100dvh;overflow:hidden}`
column. The estate bar goes **above** it, pushed down by the same
`applyClearance()` padding-top mechanism described for Pipeline News above;
here it costs nothing to `.stage` (`flex:1`), which simply gets a
proportionally smaller share of the fixed `100dvh` column — no clipping,
because every child of `body` is a flex item that shares the reduced
remaining height rather than a fixed-size box that could overflow it.

A screenshot proving both bars are visible and neither is clipped, taken
against a test copy of this exact file with the tag injected (never the
original), is in this task's notes directory — see
`estate-menu.proof.mjs`'s federation-map check and the
`federation-map-*.png` screenshots.

**Governance**: `spiders/README.md` — "The federation repo hibernates and
recovers the first Spider… No species should pretend to certify engineering
truth." This file lives in the federation repository, which the spiders
README describes as the Federation Spider's "hibernation chamber and
recovery source," not a repository this task is licensed to edit; the tag
above is a snippet only.

---

## The grid engine receiver (`ventus-grid-engine/index.html`)

Read directly for this task (258 lines): the same Spider Sandbox shell as
the federation map above, same `<title>Ventus Global Grid 2050 · The Spider
Sandbox</title>`, same `.top`/`.bar` header markup and the same
`body{display:flex;flex-direction:column;height:100dvh;overflow:hidden}`
column layout — the manifest's own entry for this surface records the
identical title, verified 200, commit `e7520b4`.

```html
<script src="https://ventusltd.github.io/spiders/species/seer-spider/estate-menu/estate-menu.js" defer></script>
```

**Where**: as the last line inside `<head>…</head>`, immediately before
`</head>` (line 85 in the copy read for this task).

**Overlap**: identical case to the federation map — the estate bar goes
above the page's own `.top` header, pushed down by the same
`applyClearance()` padding-top mechanism, absorbed by the `flex-direction:
column` body with no fixed-height child to clip.

**Governance**: this task did not open a CLAUDE.md or AGENTS.md specific to
`ventus-grid-engine` (none was found at its root alongside `index.html`);
any governance that repository states for itself applies and was not
overridden by anything here.
