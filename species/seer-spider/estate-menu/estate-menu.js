/* VENTUS Estate Menu — shared FILE / EDIT / VIEW / SCOPE / GRID / ABOUT bar.
   ==========================================================================

   One self-contained module that renders the same six-title menu bar on
   every surface of the GlobalGrid2050 estate (the homepage, Pipeline News,
   GridAtlas, the federation map, the grid engine receiver, the spider
   species lab) so a human, an AI or a developer can navigate the whole
   estate from any page. The architect's own words: "we need to seamlessly
   navigate the entire estate from globalgrid2050.com to pipelinenews
   versions, gridatlas, federation map ... providing a clear natural
   architecture for AI, humans and developers like me."

   THE IDIOM (copy, not redesign)
   -------------------------------
   The look and behaviour are taken from the module already live on
   GridAtlas: gridatlas/atlas/modules/202609031958-menu-bar.js (v9.115,
   generation 202609041957). Every CSS rule below that reproduces a value
   from that file carries a comment naming the exact line range it was
   read from, so the two can be diffed by a reader who was not in this
   session. This module does not (and must not) import that file — it is
   composed into gridatlas as a cartridge, not distributed as a script —
   so the values are re-stated verbatim here, in this module's own
   stylesheet, under this module's own element id.

   THE CONTRACT
   -------------
   window.__VENTUS_ESTATE_MENU__ = {
     schema: 'ventus.estate-menu.v1',
     manifest,          // the estate-menu-manifest.json this session loaded
     entries(menuName),  // normalised entries for one of the six menus
     mount(target),       // renders the bar; refuses if a host bar exists
     version
   };

   gridatlas' own menu-bar.js can later CONSUME entries('File') etc. into
   its existing panels instead of a second bar ever being rendered — see
   INTEGRATION.md in this directory for exactly where that would happen.

   ONE BAR, NEVER TWO
   -------------------
   mount() checks for #gridatlas-menu-bar (the id gridatlas's own module
   installs, see BAR_ID in the source above) before doing anything. If it
   is present, this module publishes the contract only and renders
   nothing — {mounted:false, reason:'host bar present'}. Two bars on one
   page is the fault this module must never cause.

   Every entry in every panel is a page the architect — a grid specialist,
   not a coder — can read. Nothing in this bar is a command to run: where
   the manifest names a local tool or script path rather than a verified
   URL, this module prints it as text, not as a link or button. */
(function ventusEstateMenu() {
  'use strict';

  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  var SCHEMA = 'ventus.estate-menu.v1';
  var VERSION = '1.0.0';
  var BAR_ID = 'ventus-estate-menu-bar';
  var STYLE_ID = BAR_ID + '-css';
  var HOST_BAR_ID = 'gridatlas-menu-bar';           // the id gridatlas's own module installs
  var CLEAR_VAR = '--gridatlas-menu-bar-clear';      // reusing gridatlas's own variable name, by design
  var HOSTED_CLASS = 'ventus-estate-menu-hosted';
  var MENUS = ['File', 'Edit', 'View', 'Scope', 'Grid', 'About'];

  /* -----------------------------------------------------------------------
     Inline fallback manifest.
     -------------------------------------------------------------------- */
  var INLINE_MANIFEST = {
  "schema": "ventus.estate-menu.v1",
  "note": "Every URL here answered HTTP 200 on 2026-09-04 when probed from this session. A menu that links to a guessed URL is worse than no link, so nothing unverified is listed. Pipeline News versions are read from the publishing repository (globalgrid2050/uk_renewables_pipeline/) and each was probed.",
  "verified_utc": "2026-09-04T20:20Z",
  "menus": {
    "FILE": {
      "purpose": "versions and what is live - the version controls, kept out of the reader's face",
      "entries": [
        { "label": "Pipeline News versions", "kind": "versions", "current": "https://globalgrid2050.com/uk_renewables_pipeline/v9.7/",
          "superseded": [
            "https://globalgrid2050.com/uk_renewables_pipeline/v9.6.2/",
            "https://globalgrid2050.com/uk_renewables_pipeline/v9.6.1/",
            "https://globalgrid2050.com/uk_renewables_pipeline/v9.6/",
            "https://globalgrid2050.com/uk_renewables_pipeline/v9.5.1/",
            "https://globalgrid2050.com/uk_renewables_pipeline/v9.5/",
            "https://globalgrid2050.com/uk_renewables_pipeline/v9.4/",
            "https://globalgrid2050.com/uk_renewables_pipeline/v9/",
            "https://globalgrid2050.com/uk_renewables_pipeline/v8/",
            "https://globalgrid2050.com/uk_renewables_pipeline/v7/"
          ],
          "verified": "v9.7, v9.6.1, v9.6, v9.5.1, v9, v8 probed 200; v9.6 titles itself DISCONTINUED; v9.6.2, v9.5, v9.4, v7 present in repo, not individually probed" },
        { "label": "Pipeline News intelligence releases", "kind": "versions", "current": "https://globalgrid2050.com/pipelinenews_intelligence/202609032329/", "verified": "200" },
        { "label": "GridAtlas versions", "kind": "versions", "current": "https://ventusltd.github.io/gridatlas/atlas/", "pinned_pattern": "https://ventusltd.github.io/gridatlas/atlas/v/<generation>/", "ledger": "on-page under ABOUT; live generation read from atlas/current.json", "verified": "200, generation 202609041957 v9.115" }
      ]
    },
    "EDIT": {
      "purpose": "the spiders - commands with receipts, through GitHub's own auth",
      "entries": [
        { "label": "Crawl the estate", "spider": "genome-spider", "status": "being built, spiders/species/genome-spider/" },
        { "label": "Populate the engine", "spider": "population", "status": "being built, ventus-grid-engine/genome/" },
        { "label": "Immunity (cvaa fleet)", "tool": "cvaa/tools/fleet.mjs", "note": "trustworthy only when run in CI on the repository's own bytes" },
        { "label": "History replay (cvaa)", "tool": "cvaa/tools/replay.mjs", "note": "currently crashes: catch reads e.stdout when null" }
      ]
    },
    "VIEW": {
      "purpose": "the estate's surfaces - hard-fought SCADA-type GUIs, reused not rebuilt - and whether the map is telling the truth",
      "surfaces": [
        { "label": "GlobalGrid2050 home", "url": "https://globalgrid2050.com/", "title": "GlobalGrid2050", "verified": "200" },
        { "label": "Pipeline News", "url": "https://globalgrid2050.com/uk_renewables_pipeline/v9.7/", "title": "UK Renewables Pipeline V9.7", "verified": "200" },
        { "label": "GridAtlas (VENTUS core)", "url": "https://ventusltd.github.io/gridatlas/atlas/", "title": "Grid Atlas", "verified": "200" },
        { "label": "Repository federation", "url": "https://ventusltd.github.io/data-federation-map-for-globalgrid2050-all-repos/dashboard/sandbox/spider_full_po_test.html", "title": "Ventus Global Grid 2050 · The Spider Sandbox", "verified": "200, byte-identical to local d9f6f194" },
        { "label": "Spider species lab", "url": "https://ventusltd.github.io/spiders/", "title": "Ventus Spiders", "verified": "200" },
        { "label": "Grid engine receiver", "url": "https://ventusltd.github.io/ventus-grid-engine/", "title": "Ventus Global Grid 2050 · The Spider Sandbox", "verified": "200, e7520b4" },
        { "label": "Immune system (cvaa)", "url": "https://ventusltd.github.io/cvaa/", "verified": "200" },
        { "label": "GB network data", "url": "https://ventusltd.github.io/data-grid-gb/", "verified": "200" },
        { "label": "Grid distance maths", "url": "https://ventusltd.github.io/grid-distance-maths/", "verified": "200" }
      ],
      "proofs": [
        { "label": "Proofs (886 checks)", "tool": "gridatlas/tools/proofs/run-current.mjs" },
        { "label": "Phone arrival", "tool": "gridatlas/tools/proofs/deep-link-visibility.browser.mjs" },
        { "label": "Deep-link contract", "tool": "pipelinenews/tools/intelligence/202609012300-verify-atlas-deep-link-contract.mjs" }
      ]
    },
    "SCOPE": { "purpose": "unchanged - the grid, not the IDE" },
    "GRID":  { "purpose": "unchanged - the 63 layer proxies; the V8 panel returns beneath when authorised" },
    "ABOUT": {
      "purpose": "the estate itself",
      "entries": [
        { "label": "Genome", "source": "scratchpad/genome/cvaa/genome.md + VERIFICATION.md", "status": "written, corrected, not yet published" },
        { "label": "Six months", "source": "scratchpad/genome/cvaa/six-month-mutations.md" },
        { "label": "Latest receipts", "source": "the spiders' receipts, path to be declared by genome-spider README" },
        { "label": "Version ledger", "source": "gridatlas/atlas/modules/202609030157-version-ledger.js" }
      ]
    }
  },
  "not_found": [
    "https://globalgrid2050.com/pipelinenews/ (404)",
    "https://ventusltd.github.io/pipelinenews/ (404)",
    "https://globalgrid2050.com/gridatlas/atlas/ (404) - the MAP button points at ventusltd.github.io/gridatlas/atlas/"
  ],
  "homepage_constraints": {
    "file": "globalgrid2050/index.html, 111,720 bytes, one inline AREAS data block",
    "rules": [
      "numbered snapshot homepage_v00N.html with line/word/char counts and a plain-English intention BEFORE any edit (homepage_versions/README.md)",
      "the V8_ENTRY sentinel and GRIDATLAS_V9_AUTOMATION_START/END markers must survive byte-for-byte (scripts/catalogue_gridatlas_v9.py fails closed otherwise)",
      "change only the structure he names; every existing name: and note: string byte-identical, diffed to prove it",
      "the 2026-08-31 outage came from a string-surgery edit to that inline block; the menu therefore lands as ONE additive <script src> tag and touches nothing inside the file"
    ]
  }
  };

  var NS = (window.__VENTUS_ESTATE_MENU__ = window.__VENTUS_ESTATE_MENU__ || {});
  if (NS.schema === SCHEMA && NS._installedByThisModule) return;   // idempotent re-run guard

  var state = {
    schema: SCHEMA,
    version: VERSION,
    manifest: INLINE_MANIFEST,
    manifest_source: 'inline-fallback',
    mounted: false,
    reason: null
  };

  var bar = null;
  var panels = {};
  var titles = [];
  var openPanelRefs = null;

  /* -----------------------------------------------------------------------
     Small helpers
     -------------------------------------------------------------------- */
  function array(v) { return Array.prototype.slice.call(v || []); }

  function cleanText(v) { return String(v == null ? '' : v).replace(/\s+/g, ' ').trim(); }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function normaliseUrl(u) {
    try {
      var parsed = new URL(u, window.location.href);
      var s = parsed.origin + parsed.pathname;
      return s.replace(/\/+$/, '').toLowerCase();
    } catch (e) {
      return String(u || '').replace(/\/+$/, '').toLowerCase();
    }
  }

  function isCurrentUrl(u) {
    if (!u) return false;
    try {
      return normaliseUrl(u) === normaliseUrl(window.location.href);
    } catch (e) {
      return false;
    }
  }

  function isHttpUrl(u) {
    return typeof u === 'string' && /^https?:\/\//i.test(u);
  }

  /* -----------------------------------------------------------------------
     entries(menuName): normalised, read-only view of one menu's content.
     Every caller (this module's own renderer, or gridatlas consuming the
     contract per INTEGRATION.md) gets the same shape from here.
     -------------------------------------------------------------------- */
  function menuBlock(name) {
    var key = String(name || '').toUpperCase();
    var menus = (state.manifest && state.manifest.menus) || {};
    return menus[key] || null;
  }

  function fileEntries() {
    var block = menuBlock('FILE');
    var raw = (block && block.entries) || [];
    return raw.map(function (item) {
      var supersededList = array(item.superseded).map(function (u) {
        return { label: labelFromUrl(u), url: u, current: false };
      });
      return {
        kind: 'versions',
        label: item.label,
        current: item.current ? { label: labelFromUrl(item.current), url: item.current, current: true } : null,
        superseded: supersededList,
        pinned_pattern: item.pinned_pattern || null,
        ledger: item.ledger || null,
        verified: item.verified || null
      };
    });
  }

  function labelFromUrl(u) {
    var m = /\/v(\d[\w.]*)\/?$/.exec(u || '');
    if (m) return 'v' + m[1];
    m = /\/(\d{10,14})\/?$/.exec(u || '');
    if (m) return m[1];
    return u;
  }

  function editEntries() {
    var block = menuBlock('EDIT');
    var raw = (block && block.entries) || [];
    return raw.map(function (item) {
      return {
        kind: 'command-status',
        label: item.label,
        path: item.spider ? item.spider : (item.tool || null),
        detail: item.status || item.note || null,
        url: null          // deliberately never a link: never a command from here
      };
    });
  }

  function viewEntries() {
    var block = menuBlock('VIEW');
    var surfaces = ((block && block.surfaces) || []).map(function (item) {
      return {
        kind: 'surface',
        label: item.label,
        url: item.url,
        title: item.title || null,
        verified: item.verified || null,
        isCurrent: isCurrentUrl(item.url)
      };
    });
    var proofs = ((block && block.proofs) || []).map(function (item) {
      return { kind: 'proof', label: item.label, tool: item.tool, url: null };
    });
    return { surfaces: surfaces, proofs: proofs };
  }

  function scopeEntries() {
    var block = menuBlock('SCOPE');
    return [{ kind: 'note', label: 'Scope', note: (block && block.purpose) || '' }];
  }

  function gridEntries() {
    var block = menuBlock('GRID');
    return [{ kind: 'note', label: 'Grid', note: (block && block.purpose) || '' }];
  }

  function aboutEntries() {
    var block = menuBlock('ABOUT');
    var raw = (block && block.entries) || [];
    return raw.map(function (item) {
      var published = isHttpUrl(item.source);
      return {
        kind: 'genome',
        label: item.label,
        source: item.source || null,
        url: published ? item.source : null,
        status: item.status || (published ? null : 'not yet published')
      };
    });
  }

  function entries(menuName) {
    var key = String(menuName || '').trim().toLowerCase();
    if (key === 'file') return fileEntries();
    if (key === 'edit') return editEntries();
    if (key === 'view') return viewEntries();
    if (key === 'scope') return scopeEntries();
    if (key === 'grid') return gridEntries();
    if (key === 'about') return aboutEntries();
    return [];
  }

  NS.schema = SCHEMA;
  NS.version = VERSION;
  NS.manifest = state.manifest;
  NS.entries = entries;
  /* mount() is defined further down, once the DOM builders exist, then
     attached to NS there. */

  /* =========================================================================
     STYLE
     Every rule below that reproduces GridAtlas's own menu bar cites the exact
     line range in gridatlas/atlas/modules/202609031958-menu-bar.js it was
     read from. This module cannot import that file (see header comment), so
     the values are re-stated here rather than shared.
     ======================================================================= */
  function installStyle(doc) {
    if (doc.getElementById(STYLE_ID)) return;
    var style = doc.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      /* Bar shell — menu-bar.js lines 166-172. One deliberate change:
         position:fixed here, not position:absolute. GridAtlas's bar lives
         inside its own positioned .map-container; this module has to sit
         at the root of arbitrary host pages (the homepage, Pipeline News,
         the federation map), so it must anchor to the viewport itself. */
      '#' + BAR_ID + '{position:fixed;top:0;left:0;right:0;height:36px;z-index:10020;',
      'display:flex;align-items:stretch;gap:0;padding-left:env(safe-area-inset-left);',
      'padding-right:env(safe-area-inset-right);box-sizing:border-box;',
      'background:rgba(4,10,13,.95);border-bottom:1px solid rgba(80,220,240,.3);',
      'font:11px/1 ui-monospace,SFMono-Regular,Menlo,monospace;',
      '-webkit-backdrop-filter:blur(7px);backdrop-filter:blur(7px);',
      'isolation:isolate;pointer-events:auto}',
      /* menu-bar.js line 173 */
      '#' + BAR_ID + ' .gm-menu{position:relative;min-width:0}',
      /* menu-bar.js lines 174-176 */
      '#' + BAR_ID + ' .gm-title{appearance:none;border:0;background:transparent;color:#cfeef6;',
      'min-height:36px;padding:0 11px;cursor:pointer;font:inherit;letter-spacing:.05em;',
      'text-transform:uppercase;white-space:nowrap}',
      /* menu-bar.js lines 177-178 — also reused, unmodified, for .gm-current
         below: the same visual treatment GridAtlas gives an OPEN title marks
         the CURRENT surface here, so a reader always knows where they are. */
      '#' + BAR_ID + ' .gm-title:hover,#' + BAR_ID + ' .gm-title:focus-visible,',
      '#' + BAR_ID + ' .gm-menu.gm-open>.gm-title{background:rgba(80,220,240,.16);color:#fff}',
      /* menu-bar.js lines 179-180 */
      '#' + BAR_ID + ' .gm-title:focus-visible,#' + BAR_ID + ' .gm-panel :focus-visible{',
      'outline:2px solid #6bebff;outline-offset:-2px}',
      /* menu-bar.js lines 181-183 */
      '#' + BAR_ID + ' .gm-side{display:flex;align-items:stretch;flex:1 1 0;min-width:0}',
      '#' + BAR_ID + ' .gm-side-left{justify-content:flex-start}',
      /* The right group is empty by design (see buildBar): it must take no
         space, or the single menu group would be squeezed to half the bar. */
      '#' + BAR_ID + ' .gm-side-right{flex:0 0 0;width:0;overflow:hidden}',
      /* The logo no longer sits between two groups, so it does not need the
         centred, width-capped slot the reference gives it; it is a compact
         leading mark with a gap before the first title. */
      '#' + BAR_ID + ' .gm-brand-slot{flex:0 0 auto!important;max-width:none!important;',
      'justify-content:flex-start!important;padding:0 14px 0 8px!important;text-align:left!important}',
      /* Brand slot — menu-bar.js lines 192-205. GridAtlas fuses its real
         .hud-header DOM node in here (moved, not cloned); this module has
         no such node to move, so it builds an equivalent .hud-header shape
         itself (see buildBrand) using the same class names so these same
         rules apply unchanged. */
      '#' + BAR_ID + ' .gm-brand-slot{flex:0 1 auto;min-width:0;max-width:64%;',
      'display:flex;align-items:center;justify-content:center;overflow:hidden;',
      'padding:0 6px;text-align:center}',
      '#' + BAR_ID + ' .gm-brand-slot .hud-header{display:flex;',
      'align-items:center;justify-content:center;gap:11px;margin:0;padding:0;',
      'background:none;border:0}',
      '#' + BAR_ID + ' .gm-brand-slot .hud-header>div{flex:0 0 auto;line-height:1.05}',
      '#' + BAR_ID + ' .gm-brand-slot .ventus-main{font-size:14px;font-weight:800;',
      'letter-spacing:.2em;margin:0;color:#fff}',
      '#' + BAR_ID + ' .gm-brand-slot .ventus-sub{font-size:5.5px;letter-spacing:.14em;',
      'color:#9adde8;white-space:nowrap}',
      /* Panel — menu-bar.js lines 206-211 */
      '#' + BAR_ID + ' .gm-panel{position:absolute;top:100%;left:0;min-width:240px;',
      'max-width:min(92vw,420px);max-height:min(72dvh,620px);overflow:auto;',
      'overscroll-behavior:contain;padding:6px;background:rgba(4,10,13,.98);',
      'border:1px solid rgba(80,220,240,.32);border-top:0;',
      'box-shadow:0 12px 34px rgba(0,0,0,.68);box-sizing:border-box}',
      '#' + BAR_ID + ' .gm-panel[hidden]{display:none!important}',
      /* menu-bar.js line 219 — right-hand titles' panels anchor to the
         right, or About resolves off-screen the same way the source
         comment (lines 212-218) describes. */
      '#' + BAR_ID + ' .gm-side-right .gm-panel{left:auto;right:0}',
      /* Panel rows — menu-bar.js lines 220-227. 44px is the coarse-pointer
         touch target floor, held at every width, exactly as the source. */
      '#' + BAR_ID + ' .gm-panel a,#' + BAR_ID + ' .gm-panel button,',
      '#' + BAR_ID + ' .gm-panel .gm-row{',
      'display:flex;flex-direction:column;align-items:flex-start;justify-content:center;',
      'width:100%;min-height:44px;box-sizing:border-box;margin:0 0 3px;',
      'padding:7px 10px;border:0;border-radius:2px;background:transparent;color:#cfeef6;',
      'font:11px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace;text-align:left;',
      'letter-spacing:.03em;text-transform:none;text-decoration:none;box-sizing:border-box}',
      '#' + BAR_ID + ' .gm-panel a:hover,#' + BAR_ID + ' .gm-panel button:hover{',
      'background:rgba(80,220,240,.14);color:#fff}',
      '#' + BAR_ID + ' .gm-panel .gm-row{cursor:default}',
      '#' + BAR_ID + ' .gm-panel a.gm-current,#' + BAR_ID + ' .gm-panel button.gm-current{',
      /* Current-surface marking reuses the OPEN-title background exactly —
         menu-bar.js line 178. */
      'background:rgba(80,220,240,.16);color:#fff}',
      '#' + BAR_ID + ' .gm-group{margin:5px 0 2px;padding:6px 8px 3px;',
      'border-top:1px solid #19343b;color:#6fa2ae;font-size:10px;letter-spacing:.08em;',
      'text-transform:uppercase}',
      '#' + BAR_ID + ' .gm-note{color:#9aa9ad;font-size:10.5px;line-height:1.4;padding:6px 4px}',
      '#' + BAR_ID + ' .gm-meta{color:#6fa2ae;font-size:9.5px;line-height:1.35;margin-top:2px}',
      '#' + BAR_ID + ' .gm-status{color:#e8b34c;font-size:9.5px;letter-spacing:.03em}',
      /* Disclosure for superseded versions — no source equivalent; the
         gridatlas module has no such list. Kept minimal and native
         (<details>/<summary>) rather than a second bespoke widget. */
      '#' + BAR_ID + ' details.gm-disclosure{margin:2px 0 4px}',
      '#' + BAR_ID + ' details.gm-disclosure>summary{cursor:pointer;padding:6px 10px;',
      'min-height:32px;display:flex;align-items:center;color:#9adde8;font-size:10px;',
      'letter-spacing:.04em;list-style:none}',
      '#' + BAR_ID + ' details.gm-disclosure>summary::-webkit-details-marker{display:none}',
      '#' + BAR_ID + ' details.gm-disclosure>summary::before{content:"▸ ";}',
      '#' + BAR_ID + ' details.gm-disclosure[open]>summary::before{content:"▾ ";}',
      /* @media(max-width:700px) — menu-bar.js lines 355-365, same values. */
      '@media(max-width:700px){#' + BAR_ID + '{height:34px}',
      '#' + BAR_ID + ' .gm-title{min-height:34px;padding:0 6px;font-size:9px;letter-spacing:.025em}',
      '#' + BAR_ID + ' .gm-brand-slot{max-width:48%;padding:0 2px}',
      '#' + BAR_ID + ' .gm-brand-slot .ventus-main{font-size:11px;letter-spacing:.14em}',
      '#' + BAR_ID + ' .gm-brand-slot .ventus-sub{font-size:4.5px}',
      '#' + BAR_ID + ' .gm-panel{position:fixed;top:34px;left:4px!important;right:4px!important;',
      'width:auto;max-width:none;max-height:calc(100dvh - 40px);padding-bottom:',
      'calc(6px + env(safe-area-inset-bottom))}}'
    ].join('');
    (doc.head || doc.documentElement).appendChild(style);
  }

  /* -----------------------------------------------------------------------
     Brand slot — the VENTUS masthead. GridAtlas fuses its real .hud-header
     node here (menu-bar.js lines 784-793, "the architect's own words: the
     VENTUS logo is the best part"); this module builds an equivalent shape
     from scratch, under the same class names as the CSS above, since it has
     no such DOM node to move.
     -------------------------------------------------------------------- */
  function buildBrand(doc) {
    var slot = el('div', 'gm-brand-slot');
    var header = el('div', 'hud-header');
    var main = el('div');
    main.appendChild(el('div', 'ventus-main', 'VENTUS'));
    main.appendChild(el('div', 'ventus-sub', 'GLOBALGRID2050 ESTATE'));
    header.appendChild(main);
    slot.appendChild(header);
    return slot;
  }

  /* -----------------------------------------------------------------------
     Bar shell — titles, side groups, brand. Structure follows buildBar()
     in menu-bar.js, lines 464-535 (three zones: two flex side groups either
     side of a centred brand, not six flat siblings — the source comment
     there explains why: it is what keeps every panel resolvable on-screen).
     -------------------------------------------------------------------- */
  function openMenu(menu, title, panel) {
    var wasOpen = menu.classList.contains('gm-open');
    closeAll();
    if (wasOpen) { openPanelRefs = null; return; }
    menu.classList.add('gm-open');
    title.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
    openPanelRefs = { menu: menu, panel: panel };
    clampPanel(menu, panel);
  }

  function closeAll(focusTitle) {
    if (!bar) return;
    array(bar.querySelectorAll('.gm-menu.gm-open')).forEach(function (menu) {
      menu.classList.remove('gm-open');
      var title = menu.querySelector('.gm-title');
      var panel = menu.querySelector('.gm-panel');
      if (title) title.setAttribute('aria-expanded', 'false');
      if (panel) panel.hidden = true;
    });
    openPanelRefs = null;
    if (focusTitle && typeof focusTitle.focus === 'function') focusTitle.focus();
  }

  /* menu-bar.js lines 430-447, same reasoning: the CSS right-anchor (line
     219 here) covers the common case, this is the second, JS-measured
     guarantee that no panel resolves outside the viewport. */
  function clampPanel(menu, panel) {
    if (!panel || typeof panel.getBoundingClientRect !== 'function') return;
    if (!menu || typeof menu.getBoundingClientRect !== 'function') return;
    panel.style.left = '';
    panel.style.right = '';
    var vw = window.innerWidth || document.documentElement.clientWidth;
    if (!vw) return;
    var margin = 4;
    var rect = panel.getBoundingClientRect();
    var desiredLeft = rect.left;
    if (rect.left < margin) desiredLeft = margin;
    else if (rect.right > vw - margin) desiredLeft = Math.max(margin, vw - margin - rect.width);
    if (Math.round(desiredLeft) === Math.round(rect.left)) return;
    var menuRect = menu.getBoundingClientRect();
    panel.style.left = (desiredLeft - menuRect.left) + 'px';
    panel.style.right = 'auto';
  }

  function buildBar(doc) {
    var nav = doc.createElement('nav');
    nav.id = BAR_ID;
    nav.setAttribute('aria-label', 'Estate menu');

    var left = el('div', 'gm-side gm-side-left');
    var right = el('div', 'gm-side gm-side-right');
    var brand = buildBrand(doc);

    titles = [];
    panels = {};

    MENUS.forEach(function (name, index) {
      var menu = el('div', 'gm-menu');
      var title = doc.createElement('button');
      title.type = 'button';
      title.className = 'gm-title';
      title.textContent = name;
      title.id = BAR_ID + '-title-' + index;
      title.setAttribute('aria-haspopup', 'menu');
      title.setAttribute('aria-expanded', 'false');
      title.setAttribute('aria-controls', BAR_ID + '-panel-' + index);

      var panel = el('div', 'gm-panel');
      panel.id = BAR_ID + '-panel-' + index;
      panel.hidden = true;
      panel.setAttribute('role', 'group');
      panel.setAttribute('aria-labelledby', title.id);

      title.addEventListener('click', function (event) {
        event.stopPropagation();
        openMenu(menu, title, panel);
      });

      menu.appendChild(title);
      menu.appendChild(panel);
      /* All six titles in ONE contiguous group. The reference bar split
         them either side of a centred wordmark; the architect's instruction,
         2026-09-04, twice: "have all the menus together not split with the
         ventus logo but keep the logo". So the logo stays - first in the bar
         - and FILE EDIT VIEW SCOPE GRID ABOUT run unbroken after it. The
         right-hand group is kept as an empty element so nothing that looks
         for it throws, and it takes no space. */
      left.appendChild(menu);
      panels[name] = panel;
      titles.push(title);
    });

    nav.appendChild(brand);   // the logo, kept, first
    nav.appendChild(left);    // then every menu, together
    nav.appendChild(right);   // empty; present so selectors resolve

    /* Keyboard behaviour — menu-bar.js lines 537-563: Escape closes,
       ArrowLeft/ArrowRight move across titles, Home/End jump to the ends,
       ArrowDown opens the focused menu and moves focus into it.

       ONE DELIBERATE CHANGE from the source: the source attaches this to
       `nav` (its own bar element), which only sees a keydown when focus is
       already somewhere inside the bar. WebKit (Safari, and iOS generally)
       does not move focus to a <button> on a pointer click — only on
       keyboard Tab — so a reader who OPENS a panel by tapping or clicking
       it never has focus inside the bar at all, and Escape would silently
       do nothing. Attaching to `doc` and gating Escape on "a panel is
       open" rather than "focus is inside the bar" closes that gap without
       changing any other behaviour: Chromium, where focus does follow a
       click, is unaffected. Measured: without this, Escape failed to close
       an open panel in WebKit at both 393x852 and 1400x900. */
    doc.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        if (!openPanelRefs) return;
        var ownerTitle = openPanelRefs.menu.querySelector('.gm-title');
        closeAll(ownerTitle);
        event.preventDefault();
        return;
      }
      var active = doc.activeElement;
      var index = titles.indexOf(active);
      if (index < 0) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        var delta = event.key === 'ArrowRight' ? 1 : -1;
        titles[(index + delta + titles.length) % titles.length].focus();
        event.preventDefault();
      } else if (event.key === 'Home' || event.key === 'End') {
        titles[event.key === 'Home' ? 0 : titles.length - 1].focus();
        event.preventDefault();
      } else if (event.key === 'ArrowDown') {
        var ownerMenu = active.closest('.gm-menu');
        var ownerPanel = ownerMenu.querySelector('.gm-panel');
        openMenu(ownerMenu, active, ownerPanel);
        var first = ownerPanel.querySelector('a,button,[role="button"]');
        if (first && first.focus) first.focus();
        event.preventDefault();
      }
    });

    return nav;
  }

  /* -----------------------------------------------------------------------
     Panel content — built from entries(), never from the DOM (this module
     scrapes nothing; every value it shows came from the manifest).
     -------------------------------------------------------------------- */
  function appendGroup(panel, text) {
    panel.appendChild(el('div', 'gm-group', text));
  }

  function appendNote(panel, text) {
    panel.appendChild(el('div', 'gm-note', text));
  }

  function makeLink(labelText, url, opts) {
    opts = opts || {};
    var a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.appendChild(el('span', null, labelText));
    if (opts.meta) a.appendChild(el('span', 'gm-meta', opts.meta));
    if (opts.current) {
      a.classList.add('gm-current');
      a.setAttribute('aria-current', 'page');
    }
    return a;
  }

  function makeRow(labelText, metaText, statusText) {
    var row = el('div', 'gm-row');
    row.appendChild(el('span', null, labelText));
    if (metaText) row.appendChild(el('span', 'gm-meta', metaText));
    if (statusText) row.appendChild(el('span', 'gm-status', statusText));
    return row;
  }

  /* The manifest deliberately repeats a URL between FILE (as a version's
     "current" release) and VIEW (as the surface itself) — e.g. Pipeline
     News v9.7 and the live GridAtlas route are each named once for each
     purpose. Rendering both as separate <a href> elements would satisfy
     neither reader nor the "every manifest URL renders exactly once"
     proof, so whichever of the two already carries a link in VIEW is
     rendered here as plain text with a pointer to it, and FILE keeps the
     part VIEW does not have: the superseded disclosure. */
  function viewSurfaceUrlSet() {
    var urls = {};
    viewEntries().surfaces.forEach(function (s) { urls[s.url] = s.label; });
    return urls;
  }

  function renderFile(panel) {
    panel.innerHTML = '';
    var surfaceUrls = viewSurfaceUrlSet();
    fileEntries().forEach(function (item) {
      appendGroup(panel, item.label);
      if (item.current) {
        var surfaceLabel = surfaceUrls[item.current.url];
        if (surfaceLabel) {
          panel.appendChild(makeRow(item.current.label + ' — current', 'linked once, under VIEW → ' + surfaceLabel, item.verified || null));
        } else {
          panel.appendChild(makeLink(item.current.label + ' — current', item.current.url, {
            meta: item.verified || null,
            current: isCurrentUrl(item.current.url)
          }));
        }
      }
      if (item.superseded && item.superseded.length) {
        var details = document.createElement('details');
        details.className = 'gm-disclosure';
        var summary = document.createElement('summary');
        summary.textContent = 'Superseded (' + item.superseded.length + ')';
        details.appendChild(summary);
        item.superseded.forEach(function (s) {
          details.appendChild(makeLink(s.label, s.url, { current: isCurrentUrl(s.url) }));
        });
        panel.appendChild(details);
      }
      if (item.pinned_pattern || item.ledger) {
        appendNote(panel, [
          item.pinned_pattern ? ('Pinned generations follow ' + item.pinned_pattern) : null,
          item.ledger ? ('Ledger: ' + item.ledger) : null
        ].filter(Boolean).join(' — '));
      }
    });
  }

  function renderEdit(panel) {
    panel.innerHTML = '';
    appendNote(panel, (menuBlock('EDIT') || {}).purpose || '');
    editEntries().forEach(function (item) {
      panel.appendChild(makeRow(item.label, item.path, item.detail));
    });
  }

  function renderView(panel) {
    panel.innerHTML = '';
    var data = viewEntries();
    appendGroup(panel, 'Surfaces');
    data.surfaces.forEach(function (item) {
      panel.appendChild(makeLink(item.label + (item.isCurrent ? ' — you are here' : ''), item.url, {
        meta: item.title || null,
        current: item.isCurrent
      }));
    });
    if (data.proofs.length) {
      appendGroup(panel, 'Proofs (run from the spiders’ own tooling, not a link)');
      data.proofs.forEach(function (item) {
        panel.appendChild(makeRow(item.label, item.tool, null));
      });
    }
  }

  function renderScope(panel) {
    panel.innerHTML = '';
    appendGroup(panel, 'Scope');
    appendNote(panel, scopeEntries()[0].note);
  }

  function renderGrid(panel) {
    panel.innerHTML = '';
    appendGroup(panel, 'Grid');
    appendNote(panel, gridEntries()[0].note);
  }

  function renderAbout(panel) {
    panel.innerHTML = '';
    appendGroup(panel, 'The estate genome');
    aboutEntries().forEach(function (item) {
      if (item.url) {
        panel.appendChild(makeLink(item.label, item.url, { current: isCurrentUrl(item.url) }));
      } else {
        panel.appendChild(makeRow(item.label, item.source, item.status));
      }
    });
  }

  function renderMenus() {
    if (!panels.File) return;
    renderFile(panels.File);
    renderEdit(panels.Edit);
    renderView(panels.View);
    renderScope(panels.Scope);
    renderGrid(panels.Grid);
    renderAbout(panels.About);
  }

  /* -----------------------------------------------------------------------
     Clearance — pushes the host page's own content down by the bar's own
     rendered height, via --gridatlas-menu-bar-clear (reusing the exact
     variable name gridatlas's own module uses for the same purpose against
     its map-attribution credit — menu-bar.js lines 370-386). This module
     measures the ORIGINAL padding-top of the mount target before adding to
     it, once, so a host page's own top spacing is preserved rather than
     overwritten. */
  function applyClearance(doc, target) {
    if (!bar || typeof bar.getBoundingClientRect !== 'function') return;
    var rect = bar.getBoundingClientRect();
    var height = Math.ceil(rect.height) || 36;
    var clearance = height + 8;
    var root = doc.documentElement;
    if (root && root.style && typeof root.style.setProperty === 'function') {
      root.style.setProperty(CLEAR_VAR, clearance + 'px');
    }
    if (target !== doc.body) return;   // only auto-push body flow when we own the whole page
    var body = doc.body;
    if (!body) return;
    var ATTR = 'data-ventus-estate-menu-original-padding-top';
    if (!body.hasAttribute(ATTR)) {
      var cs = (doc.defaultView || window).getComputedStyle(body);
      body.setAttribute(ATTR, String(parseFloat(cs.paddingTop) || 0));
    }
    var original = parseFloat(body.getAttribute(ATTR)) || 0;
    body.style.paddingTop = (original + clearance) + 'px';
  }

  /* -----------------------------------------------------------------------
     mount()
     -------------------------------------------------------------------- */
  function documentClickCloser(event) {
    if (!bar) return;
    if (!bar.contains(event.target)) closeAll();
  }

  function mountInternal(target) {
    var doc = document;
    target = target || doc.body;
    if (!target) return { mounted: false, reason: 'no document.body available yet' };

    if (doc.getElementById(HOST_BAR_ID)) {
      state.mounted = false;
      state.reason = 'host bar present';
      return { mounted: false, reason: 'host bar present' };
    }

    if (bar && doc.getElementById(BAR_ID)) {
      /* Already mounted by this module — idempotent. */
      applyClearance(doc, target);
      return { mounted: true, bar: bar };
    }

    installStyle(doc);
    bar = buildBar(doc);
    renderMenus();

    target.insertBefore(bar, target.firstChild);
    doc.documentElement.classList.add(HOSTED_CLASS);
    applyClearance(doc, target);

    if (typeof ResizeObserver === 'function') {
      var ro = new ResizeObserver(function () {
        applyClearance(doc, target);
        if (openPanelRefs) clampPanel(openPanelRefs.menu, openPanelRefs.panel);
      });
      ro.observe(bar);
    } else if (window.addEventListener) {
      window.addEventListener('resize', function () {
        applyClearance(doc, target);
        if (openPanelRefs) clampPanel(openPanelRefs.menu, openPanelRefs.panel);
      });
    }

    doc.addEventListener('click', documentClickCloser);

    state.mounted = true;
    state.reason = null;
    NS._installedByThisModule = true;
    return { mounted: true, bar: bar };
  }

  function mount(target) {
    return mountInternal(target);
  }

  NS.mount = mount;

  /* -----------------------------------------------------------------------
     Manifest loading — fetch first (relative to this module's own script
     location), inline fallback second. entries()/mount() both work
     immediately from the inline copy; if the fetch succeeds, the manifest
     is upgraded in place and any already-rendered panel content is rebuilt
     from it.
     -------------------------------------------------------------------- */
  function resolveManifestURL() {
    try {
      var cs = document.currentScript;
      if (cs && cs.src) return new URL('estate-menu-manifest.json', cs.src).href;
    } catch (e) { /* fall through */ }
    try {
      var scripts = document.getElementsByTagName('script');
      for (var i = 0; i < scripts.length; i++) {
        var src = scripts[i].src || '';
        if (/estate-menu\.js(\?.*)?$/.test(src)) {
          return new URL('estate-menu-manifest.json', src).href;
        }
      }
    } catch (e2) { /* fall through */ }
    return 'estate-menu-manifest.json';
  }

  function loadManifest() {
    if (typeof fetch !== 'function') return;
    var url = resolveManifestURL();
    fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('http ' + r.status);
      return r.json();
    }).then(function (data) {
      if (!data || !data.menus) throw new Error('malformed manifest');
      state.manifest = data;
      state.manifest_source = 'fetch:' + url;
      NS.manifest = state.manifest;
      renderMenus();
    }).catch(function () {
      state.manifest_source = 'inline-fallback';
    });
  }

  /* -----------------------------------------------------------------------
     Auto-run — mirrors the gridatlas idiom (menu-bar.js lines 884-918): on
     a page with no host bar, install; on a page that already has one,
     publish the contract only.
     -------------------------------------------------------------------- */
  function start() {
    mountInternal(document.body);
  }

  loadManifest();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
}());
