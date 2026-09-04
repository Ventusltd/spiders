#!/usr/bin/env node
/* estate-menu.proof.mjs
   ======================================================================
   Each check below is a plain-English sentence. Failures accumulate; the
   process exits non-zero if any failed. This mirrors the estate's own
   proof idiom (gridatlas/tools/proofs/run-current.mjs) rather than a
   generic test framework.

   PLAYWRIGHT RESOLUTION
   ----------------------
   This directory does not ship its own node_modules. The task that built
   this proof was told a specific, already-provisioned Playwright install
   to use:

     C:\Users\vikra\AppData\Local\Temp\claude\C--Users-vikra\
       82e00a22-a262-414e-b7f4-edfed1c86a66\scratchpad\node_modules

   That path is session-specific (it is a Claude Code scratchpad, not part
   of any repository) and WILL NOT exist in another environment. Two ways
   to point this proof at a real Playwright install elsewhere:

     1. Set PLAYWRIGHT_MODULE_PATH to the absolute path of a
        `playwright/index.mjs` (or any module exporting `chromium` and
        `webkit`) before running this file, e.g.:
          PLAYWRIGHT_MODULE_PATH=C:/path/to/node_modules/playwright/index.mjs node estate-menu.proof.mjs
     2. Otherwise this script falls back to the scratchpad path above,
        then to a plain `import('playwright')` (works if this directory,
        or an ancestor, ever gains its own node_modules).

   Screenshots and any other proof artefacts are written to the notes
   directory named in this task's brief, never into this repository:
     C:\Users\vikra\AppData\Local\Temp\claude\C--Users-vikra\
       82e00a22-a262-414e-b7f4-edfed1c86a66\scratchpad\genome\estate-menu\
   ====================================================================== */

import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCRATCHPAD_PLAYWRIGHT =
  'C:/Users/vikra/AppData/Local/Temp/claude/C--Users-vikra/82e00a22-a262-414e-b7f4-edfed1c86a66/scratchpad/node_modules/playwright/index.mjs';
const NOTES_DIR =
  'C:/Users/vikra/AppData/Local/Temp/claude/C--Users-vikra/82e00a22-a262-414e-b7f4-edfed1c86a66/scratchpad/genome/estate-menu';
const SCREENSHOT_DIR = path.join(NOTES_DIR, 'screenshots');
const TEST_COPIES_DIR = path.join(NOTES_DIR, 'test-copies');

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function loadPlaywright() {
  const candidates = [
    process.env.PLAYWRIGHT_MODULE_PATH,
    SCRATCHPAD_PLAYWRIGHT,
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      const mod = await import(pathToFileURL(candidate).href);
      if (mod.chromium && mod.webkit) return mod;
    }
  }
  // Last resort: an ordinary resolvable import, for an environment where
  // this directory (or an ancestor) has its own Playwright install.
  return import('playwright');
}

function fileUrl(p) { return pathToFileURL(p).href; }

const DEMO_HTML = fileUrl(path.join(HERE, 'demo.html'));
const DEMO_HOST_HTML = fileUrl(path.join(HERE, 'demo-with-host-bar.html'));
const FEDERATION_TEST_COPY = fileUrl(path.join(TEST_COPIES_DIR, 'federation-map/dashboard/sandbox/spider_full_po_test.html'));
const PIPELINE_TEST_COPY = fileUrl(path.join(TEST_COPIES_DIR, 'pipelinenews/index.html'));
const ESTATE_MENU_JS_SOURCE = fs.readFileSync(path.join(HERE, 'estate-menu.js'), 'utf8');
const MANIFEST = JSON.parse(fs.readFileSync(path.join(HERE, 'estate-menu-manifest.json'), 'utf8'));

const VIEWPORTS = [
  { name: '393x852', width: 393, height: 852 },
  { name: '1400x900', width: 1400, height: 900 },
];

const results = [];
function record(sentence, ok, detail) {
  results.push({ sentence, ok, detail: detail || null });
  const mark = ok ? 'PASS' : 'FAIL';
  console.log('[' + mark + '] ' + sentence + (detail ? '  (' + detail + ')' : ''));
}

function manifestUrlList() {
  const urls = [];
  const file = MANIFEST.menus.FILE.entries;
  file.forEach((e) => {
    if (e.current) urls.push(e.current);
    (e.superseded || []).forEach((u) => urls.push(u));
  });
  MANIFEST.menus.VIEW.surfaces.forEach((s) => urls.push(s.url));
  MANIFEST.menus.ABOUT.entries.forEach((e) => {
    if (/^https?:\/\//i.test(e.source || '')) urls.push(e.source);
  });
  return Array.from(new Set(urls));
}

async function withPage(browser, viewport, url, fn) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(150); // manifest fetch / fallback settle
    return await fn(page);
  } finally {
    await context.close();
  }
}

async function runStructuralChecks(browser, engineName, viewport) {
  const tag = engineName + '@' + viewport.name;

  await withPage(browser, viewport, DEMO_HTML, async (page) => {
    // Six titles, in order.
    const titleTexts = await page.$$eval('#ventus-estate-menu-bar .gm-title', (els) => els.map((e) => e.textContent.trim()));
    record(tag + ': the six menu titles read File, Edit, View, Scope, Grid, About, in that order',
      JSON.stringify(titleTexts) === JSON.stringify(['File', 'Edit', 'View', 'Scope', 'Grid', 'About']),
      JSON.stringify(titleTexts));

    // Brand slot carries the VENTUS wordmark.
    const brandText = await page.$eval('#ventus-estate-menu-bar .gm-brand-slot .ventus-main', (e) => e.textContent.trim()).catch(() => null);
    record(tag + ': the brand slot at the centre of the bar reads VENTUS', brandText === 'VENTUS', String(brandText));

    // Every manifest URL appears exactly once across the rendered panels.
    const hrefs = await page.$$eval('#ventus-estate-menu-bar a[href]', (els) => els.map((e) => e.getAttribute('href')));
    const wanted = manifestUrlList();
    const missing = [];
    const duplicated = [];
    wanted.forEach((u) => {
      const count = hrefs.filter((h) => h === u).length;
      if (count === 0) missing.push(u);
      else if (count > 1) duplicated.push(u + ' x' + count);
    });
    record(tag + ': every manifest URL renders exactly once in the bar',
      missing.length === 0 && duplicated.length === 0,
      'missing=' + missing.length + ' duplicated=' + duplicated.length +
        (missing.length ? ' e.g. ' + missing[0] : '') + (duplicated.length ? ' e.g. ' + duplicated[0] : ''));

    // Keyboard: Escape closes an open panel.
    await page.click('#ventus-estate-menu-bar .gm-title:has-text("File")');
    const openedExpanded = await page.$eval('#ventus-estate-menu-bar .gm-title:has-text("File")', (e) => e.getAttribute('aria-expanded'));
    await page.keyboard.press('Escape');
    const closedExpanded = await page.$eval('#ventus-estate-menu-bar .gm-title:has-text("File")', (e) => e.getAttribute('aria-expanded'));
    record(tag + ': clicking File opens its panel (aria-expanded=true) and Escape closes it again',
      openedExpanded === 'true' && closedExpanded === 'false',
      'opened=' + openedExpanded + ' afterEscape=' + closedExpanded);

    // Keyboard: ArrowRight moves focus across titles.
    await page.focus('#ventus-estate-menu-bar .gm-title:has-text("File")');
    await page.keyboard.press('ArrowRight');
    const focusedAfterArrow = await page.evaluate(() => document.activeElement && document.activeElement.textContent.trim());
    record(tag + ': ArrowRight from File moves focus to the next title, Edit',
      focusedAfterArrow === 'Edit', 'focused=' + focusedAfterArrow);

    // 44px touch targets on every clickable row, at this viewport.
    await page.click('#ventus-estate-menu-bar .gm-title:has-text("View")');
    const heights = await page.$$eval('#ventus-estate-menu-bar .gm-panel:not([hidden]) a, #ventus-estate-menu-bar .gm-panel:not([hidden]) button',
      (els) => els.map((e) => e.getBoundingClientRect().height));
    const short = heights.filter((h) => h < 43.5);
    record(tag + ': every clickable row in an open panel is at least 44px tall',
      heights.length > 0 && short.length === 0,
      'rows=' + heights.length + ' under44=' + short.length + (short.length ? ' min=' + Math.min(...short).toFixed(1) : ''));
  });

  // Refusal when a host bar is present.
  await withPage(browser, viewport, DEMO_HOST_HTML, async (page) => {
    const ourBar = await page.$('#ventus-estate-menu-bar');
    const mountResult = await page.evaluate(() => window.__VENTUS_ESTATE_MENU__ && window.__VENTUS_ESTATE_MENU__.mount());
    const contractPresent = await page.evaluate(() => !!(window.__VENTUS_ESTATE_MENU__ && window.__VENTUS_ESTATE_MENU__.schema));
    record(tag + ': on a page with #gridatlas-menu-bar already present, the contract is published but no second bar is rendered',
      contractPresent && ourBar === null, 'contractPresent=' + contractPresent + ' secondBarPresent=' + (ourBar !== null));
    record(tag + ': mount() on that page returns {mounted:false, reason:"host bar present"}',
      !!mountResult && mountResult.mounted === false && mountResult.reason === 'host bar present',
      JSON.stringify(mountResult));
  });
}

/* Same regex the module's own labelFromUrl() uses (estate-menu.js), copied
   here rather than imported so this proof has no dependency on the module's
   internals beyond the source text it already reads for other checks. */
function labelFromUrl(u) {
  let m = /\/v(\d[\w.]*)\/?$/.exec(u || '');
  if (m) return 'v' + m[1];
  m = /\/(\d{10,14})\/?$/.exec(u || '');
  if (m) return m[1];
  return u;
}

function isAlphabetical(labels) {
  const sorted = labels.slice().sort((a, b) => a.localeCompare(b, 'en-GB', { sensitivity: 'base' }));
  return JSON.stringify(sorted) === JSON.stringify(labels);
}

/* Checks added for the alphabetical-ordering task (2026-09-04):
     (1) every non-version group renders alphabetically
     (2) version groups (FILE) render current-first, superseded newest-first
     (3) the wordmark stays centred to the pixel, brand-slot centre == viewport centre
     (4) the sub-line reads exactly "Cables & Connectivity®" from source, uppercased by CSS
     (5) no visible text in the bar or its panels contains the word "estate" */
async function runOrderingAndBrandChecks(browser, engineName, viewport) {
  const tag = engineName + '@' + viewport.name;

  await withPage(browser, viewport, DEMO_HTML, async (page) => {
    // (1) Non-version groups: EDIT, VIEW (Surfaces, Proofs), ABOUT — each
    // panel's own group buckets, extracted in DOM order, must already be
    // alphabetical (case-insensitive, locale en-GB) without this proof
    // re-sorting anything itself.
    const buckets = await page.evaluate(() => {
      function panelForTitle(name) {
        const titles = Array.from(document.querySelectorAll('#ventus-estate-menu-bar .gm-title'));
        const title = titles.find((t) => t.textContent.trim() === name);
        if (!title) return null;
        return document.getElementById(title.getAttribute('aria-controls'));
      }
      function bucketsOf(panel) {
        const out = {};
        let group = '__root__';
        out[group] = [];
        if (!panel) return out;
        Array.from(panel.children).forEach((node) => {
          if (node.classList.contains('gm-group')) {
            group = node.textContent.trim();
            out[group] = out[group] || [];
            return;
          }
          if (node.tagName === 'A' || node.classList.contains('gm-row')) {
            const span = node.querySelector('span') || node;
            out[group].push(span.textContent.trim());
          }
        });
        return out;
      }
      return {
        Edit: bucketsOf(panelForTitle('Edit')),
        View: bucketsOf(panelForTitle('View')),
        About: bucketsOf(panelForTitle('About')),
      };
    });

    Object.keys(buckets).forEach((panelName) => {
      Object.keys(buckets[panelName]).forEach((groupName) => {
        const raw = buckets[panelName][groupName];
        if (!raw.length) return;
        // Strip the "— you are here" / " — current" render-time suffixes
        // before comparing, since those are appended after the real label.
        const labels = raw.map((s) => s.replace(/\s+—\s+(you are here|current)$/i, ''));
        record(tag + ': ' + panelName + ' → "' + groupName + '" renders its entries alphabetically (case-insensitive, en-GB): ' + JSON.stringify(labels),
          isAlphabetical(labels), JSON.stringify(labels));
      });
    });

    // (2) FILE stays newest-first, current leading — never alphabetised.
    const fileOrder = await page.evaluate(() => {
      const titles = Array.from(document.querySelectorAll('#ventus-estate-menu-bar .gm-title'));
      const title = titles.find((t) => t.textContent.trim() === 'File');
      const panel = document.getElementById(title.getAttribute('aria-controls'));
      const groups = [];
      let current = null;
      Array.from(panel.children).forEach((node) => {
        if (node.classList.contains('gm-group')) {
          current = { label: node.textContent.trim(), firstText: null, supersededLabels: [] };
          groups.push(current);
          return;
        }
        if (!current) return;
        if (current.firstText === null && (node.tagName === 'A' || node.classList.contains('gm-row'))) {
          current.firstText = node.textContent.trim();
          return;
        }
        if (node.tagName === 'DETAILS') {
          Array.from(node.querySelectorAll('a')).forEach((a) => current.supersededLabels.push(a.textContent.trim()));
        }
      });
      return groups;
    });
    const pipelineGroup = fileOrder.find((g) => g.label === 'Pipeline News versions');
    const expectedSuperseded = (MANIFEST.menus.FILE.entries.find((e) => e.label === 'Pipeline News versions').superseded || []).map(labelFromUrl);
    record(tag + ': FILE → each version group\'s first row names the current release ("— current"), never alphabetised',
      fileOrder.every((g) => /—\s*current/i.test(g.firstText || '')),
      JSON.stringify(fileOrder.map((g) => g.firstText)));
    record(tag + ': FILE → "Pipeline News versions" superseded disclosure stays newest-first, in the manifest\'s own order',
      JSON.stringify(pipelineGroup && pipelineGroup.supersededLabels) === JSON.stringify(expectedSuperseded),
      JSON.stringify(pipelineGroup && pipelineGroup.supersededLabels) + ' vs expected ' + JSON.stringify(expectedSuperseded));

    // (3) The wordmark's brand slot stays centred on the viewport, to the pixel.
    const brandCentre = await page.evaluate(() => {
      const slot = document.querySelector('#ventus-estate-menu-bar .gm-brand-slot');
      const rect = slot.getBoundingClientRect();
      return { centre: rect.left + rect.width / 2, viewport: window.innerWidth };
    });
    const offset = Math.abs(brandCentre.centre - brandCentre.viewport / 2);
    record(tag + ': the brand slot is centred to the pixel (viewport ' + brandCentre.viewport + 'px, slot centre ' + brandCentre.centre.toFixed(1) + 'px)',
      offset <= 1, 'offset=' + offset.toFixed(2) + 'px');

    // (4) The sub-line's SOURCE text, and that CSS (not the source string) uppercases it.
    const sub = await page.evaluate(() => {
      const el = document.querySelector('#ventus-estate-menu-bar .gm-brand-slot .ventus-sub');
      return { text: el.textContent, transform: getComputedStyle(el).textTransform };
    });
    record(tag + ': the sub-line reads exactly "Cables & Connectivity®" in source',
      sub.text === 'Cables & Connectivity®', JSON.stringify(sub.text));
    record(tag + ': the sub-line is uppercased by CSS (text-transform:uppercase), not by the source string',
      sub.transform === 'uppercase', sub.transform);

    // (5) No visible text anywhere in the bar or its panels says "estate".
    const barText = await page.$eval('#ventus-estate-menu-bar', (e) => e.textContent);
    const hasEstate = /estate/i.test(barText);
    record(tag + ': no visible text in the bar or its panels contains the word "estate"',
      !hasEstate, hasEstate ? 'found "estate" in bar text' : 'clean');
  });
}

async function runCurrentSurfaceCheck(browser, engineName) {
  const tag = engineName;
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();
  try {
    const targetUrl = 'https://ventusltd.github.io/spiders/'; // a manifest VIEW surface, verified 200
    const html = '<!doctype html><html><head><meta charset="utf-8">'
      + '<title>current-surface check</title></head><body>'
      + '<script>' + ESTATE_MENU_JS_SOURCE + '</script>'
      + '</body></html>';
    await page.route(targetUrl, (route) => route.fulfill({ status: 200, contentType: 'text/html', body: html }));
    await page.goto(targetUrl, { waitUntil: 'load' });
    await page.waitForTimeout(150);
    await page.click('#ventus-estate-menu-bar .gm-title:has-text("View")');
    const current = await page.$$eval('#ventus-estate-menu-bar .gm-panel:not([hidden]) a.gm-current',
      (els) => els.map((e) => ({ href: e.getAttribute('href'), ariaCurrent: e.getAttribute('aria-current') })));
    const ok = current.length === 1 && current[0].href === targetUrl && current[0].ariaCurrent === 'page';
    record(tag + ': loaded at a manifest-listed surface URL (' + targetUrl + '), that surface — and only that one — is marked current in the VIEW panel',
      ok, JSON.stringify(current));
  } finally {
    await context.close();
  }
}

async function runFederationOverlapCheck(browser, engineName, viewport) {
  const tag = engineName + '@' + viewport.name;
  await withPage(browser, viewport, FEDERATION_TEST_COPY, async (page) => {
    await page.waitForSelector('#ventus-estate-menu-bar', { timeout: 5000 }).catch(() => {});
    await page.waitForSelector('.top .bar', { timeout: 5000 }).catch(() => {});
    const rects = await page.evaluate(() => {
      const bar = document.getElementById('ventus-estate-menu-bar');
      const host = document.querySelector('.top .bar');
      const clear = getComputedStyle(document.documentElement).getPropertyValue('--gridatlas-menu-bar-clear');
      return {
        bar: bar ? bar.getBoundingClientRect().toJSON() : null,
        host: host ? host.getBoundingClientRect().toJSON() : null,
        clearVar: clear.trim(),
      };
    });
    const bothVisible = !!(rects.bar && rects.host && rects.bar.height > 0 && rects.host.height > 0);
    const noOverlap = bothVisible && rects.bar.bottom <= rects.host.top + 1; // 1px rounding tolerance
    const neitherClipped = bothVisible && rects.bar.top >= 0 && rects.host.bottom <= viewport.height + 1;
    record(tag + ': on the federation-map test copy, the estate bar and the page\'s own "The Spider Sandbox" header are both visible and do not overlap',
      bothVisible && noOverlap && neitherClipped,
      'clearVar=' + rects.clearVar + ' bar=' + JSON.stringify(rects.bar) + ' host=' + JSON.stringify(rects.host));

    const shotPath = path.join(SCREENSHOT_DIR, 'federation-map-' + engineName + '-' + viewport.name + '.png');
    await page.screenshot({ path: shotPath });
    console.log('  screenshot: ' + shotPath);
  });
}

async function screenshotDemoAndPipeline(browser, engineName, viewport) {
  await withPage(browser, viewport, DEMO_HTML, async (page) => {
    const shotPath = path.join(SCREENSHOT_DIR, 'demo-' + engineName + '-' + viewport.name + '.png');
    await page.screenshot({ path: shotPath });
    console.log('  screenshot: ' + shotPath);
  });
  await withPage(browser, viewport, PIPELINE_TEST_COPY, async (page) => {
    const rects = await page.evaluate(() => {
      const bar = document.getElementById('ventus-estate-menu-bar');
      const header = document.querySelector('.main .header');
      return {
        bar: bar ? bar.getBoundingClientRect().toJSON() : null,
        header: header ? header.getBoundingClientRect().toJSON() : null,
      };
    });
    const bothVisible = !!(rects.bar && rects.header && rects.bar.height > 0 && rects.header.height > 0);
    const noOverlap = bothVisible && rects.bar.bottom <= rects.header.top + 1;
    const vp = page.viewportSize();
    record(engineName + '@' + vp.width + 'x' + vp.height + ': on the Pipeline News v9.7 test copy, the estate bar does not overlap the page\'s own "UK RENEWABLES PIPELINE V9.7" header',
      bothVisible && noOverlap, JSON.stringify(rects));

    const shotPath = path.join(SCREENSHOT_DIR, 'pipelinenews-v97-' + engineName + '-' + viewport.name + '.png');
    await page.screenshot({ path: shotPath });
    console.log('  screenshot: ' + shotPath);
  });
}

async function main() {
  const pw = await loadPlaywright();
  const engines = [
    { name: 'chromium', launcher: pw.chromium },
    { name: 'webkit', launcher: pw.webkit },
  ];

  for (const engine of engines) {
    let browser;
    try {
      browser = await engine.launcher.launch();
    } catch (e) {
      record(engine.name + ': browser launched', false, String(e && e.message || e));
      continue;
    }
    try {
      for (const viewport of VIEWPORTS) {
        await runStructuralChecks(browser, engine.name, viewport);
        await runOrderingAndBrandChecks(browser, engine.name, viewport);
        await runFederationOverlapCheck(browser, engine.name, viewport);
        await screenshotDemoAndPipeline(browser, engine.name, viewport);
      }
      await runCurrentSurfaceCheck(browser, engine.name);
    } finally {
      await browser.close();
    }
  }

  const failed = results.filter((r) => !r.ok);
  console.log('');
  console.log(results.length + ' checks, ' + failed.length + ' failed.');
  if (failed.length) {
    console.log('Failures:');
    failed.forEach((f) => console.log('  - ' + f.sentence + (f.detail ? '  (' + f.detail + ')' : '')));
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e && e.stack || e);
  process.exitCode = 1;
});
