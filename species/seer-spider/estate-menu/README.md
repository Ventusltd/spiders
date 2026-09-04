# Estate Menu

One self-contained JavaScript module — `estate-menu.js` — that renders the
shared FILE / EDIT / VIEW / SCOPE / GRID / ABOUT menu bar so a human, an AI
or a developer can navigate the whole GlobalGrid2050 estate from any page:
the homepage, Pipeline News, GridAtlas, the federation map, the grid engine
receiver, or the spider species lab. The architect's own words: "we need to
seamlessly navigate the entire estate from globalgrid2050.com to
pipelinenews versions, gridatlas, federation map ... providing a clear
natural architecture for AI, humans and developers like me" — and,
separately, "eventually the site becomes a user workspace and not cluttered
with version controls," which is what the FILE menu's version disclosures
are for: current release visible, superseded ones folded, off the reader's
face.

## Why this lives under `spiders/species/seer-spider/`

The spiders repository's own README reserves `seer-spider` as "the top-level
Spider that can discover and route between Spider species" — "reserved
future top-level Spider that can discover and route between Spider species"
(`spiders/species/seer-spider/index.html`). Routing between every surface of
the estate — including every spider species page — is exactly what this
menu does: its VIEW panel links the spider species lab, the federation map
and the grid engine receiver alongside the homepage, Pipeline News and
GridAtlas, from one shared control. Placing it here rather than inventing a
new top-level location was a judgement call, not a governance decision this
module is entitled to make — **the directory name and its placement here are
the architect's to confirm**, not settled by this session. Nothing about the
module's own code depends on this location: it is plain, dependency-free
JavaScript, and moving the directory later costs only updating the
`<script src>` paths named in `INTEGRATION.md`.

## What is here

- `estate-menu.js` — the module. Zero dependencies. Works as a classic
  `<script src="…/estate-menu.js" defer></script>`, from `file://`, from
  GitHub Pages, and at a 393px phone width. No inline event handlers, no
  `eval`, nothing a strict CSP would reject.
- `estate-menu-manifest.json` — a verbatim copy of the estate-menu manifest
  this module was built against (every URL in it answered HTTP 200 on
  2026-09-04). The module fetches this file at runtime, relative to its own
  script tag; if the fetch fails (`file://`, offline, CSP), it falls back to
  an identical copy of the same content baked into `estate-menu.js` itself,
  so the bar still renders.
- `demo.html` — mounts the bar on a blank page (no host bar present).
- `demo-with-host-bar.html` — fakes a `#gridatlas-menu-bar` element and
  proves `mount()` refuses to render a second bar.
- `estate-menu.proof.mjs` — the automated proof. Each check is a
  plain-English sentence; failures accumulate; the process exits non-zero
  if any failed.
- `INTEGRATION.md` — the exact one-line addition each surface would need,
  and the governance that applies to each. Snippets only: **this task never
  applied any of them.** No file outside this directory was modified,
  committed, or pushed by this work.

## The contract

```js
window.__VENTUS_ESTATE_MENU__ = {
  schema: 'ventus.estate-menu.v1',
  manifest,          // the loaded manifest (fetched, or the inline fallback)
  entries(menuName),  // normalised entries for 'File' | 'Edit' | 'View' | 'Scope' | 'Grid' | 'About'
  mount(target),       // renders the bar; refuses if #gridatlas-menu-bar already exists
  version
};
```

`entries(menuName)` is the surface gridatlas's own menu bar
(`gridatlas/atlas/modules/202609031958-menu-bar.js`) can later consume into
its existing panels instead of a second bar ever being rendered — see
`INTEGRATION.md` for exactly where in that file that would happen.

On a page that already has `#gridatlas-menu-bar` (the id GridAtlas's own
module installs), `mount()` renders nothing and returns
`{mounted:false, reason:'host bar present'}`. Two bars on one page is the
fault this module must never cause; `estate-menu.proof.mjs` and
`demo-with-host-bar.html` both check for it directly.

## The idiom this module copies, not designs

The bar's look and behaviour are read from
`gridatlas/atlas/modules/202609031958-menu-bar.js` (v9.115, generation
202609041957) — the module already live on GridAtlas. This module cannot
import that file (it is composed into GridAtlas as a cartridge, not
distributed as a script), so every CSS rule it reproduces is re-stated
verbatim in `estate-menu.js`'s own injected stylesheet, each one carrying a
comment citing the exact line range in the source file it was read from.

Entries that lead to graph views (the federation map, the grid engine
receiver) point at the existing Spider Sandbox pages verbatim — this module
draws no graph of its own and does not restyle the 🕷 pill.

Every entry in every panel is a page the architect — a grid specialist, not
a coder — can open and read. Nothing here is a command: where the manifest
names a local tool or script path rather than a verified URL (the EDIT
panel's spiders, the VIEW panel's proof scripts, an ABOUT genome entry not
yet published), this module prints it as plain text, never as a link or
button.
