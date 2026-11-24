import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { pathToFileURL } from 'node:url';

const { routeGrid } = await import(pathToFileURL(resolve(process.argv[2])));
const size = 600;
const cells = size ** 2;
const start = 50 * size + 50;
const goal = 520 * size + 520;
const gate = 570 * size + 300;

function fixture(kind) {
  const grid = {
    width: size, height: size, cellMetres: 5,
    cost: new Float32Array(cells).fill(1),
    known: new Uint8Array(cells).fill(1),
    access: new Uint8Array(cells).fill(1),
    blocked: new Uint8Array(cells),
  };
  if (kind !== 'open') {
    for (let row = 0; row < size; row++) {
      grid.access[row * size + 300] = 0;
    }
  }
  if (kind === 'gate') grid.access[gate] = 1;
  return grid;
}

const results = [];
for (const kind of ['open', 'gate', 'disconnected']) {
  const grid = fixture(kind);
  const samples = [];
  let expanded;
  for (let run = 0; run < 24; run++) {
    const before = performance.now();
    const result = routeGrid(grid, start, goal);
    const elapsed = performance.now() - before;
    if (kind === 'disconnected') {
      assert.equal(result.status, 'no-route');
      assert.equal(result.reason, 'DISCONNECTED');
    } else {
      assert.equal(result.status, 'ok');
      assert.equal(result.cells[0], start);
      assert.equal(result.cells.at(-1), goal);
      assert.ok(result.cells.every(index => grid.access[index] === 1));
      if (kind === 'gate') assert.ok(result.cells.includes(gate));
      expanded = result.expanded;
    }
    if (run >= 4) samples.push(elapsed);
  }
  samples.sort((a, b) => a - b);
  results.push({
    kind, expanded, p50Ms: samples[9], p95Ms: samples[18], maxMs: samples.at(-1),
  });
}

console.log(JSON.stringify({
  scope: 'synthetic-core-only',
  node: process.version,
  platform: process.platform,
  cells,
  samplesPerCase: 20,
  inputArrayBytes: cells * 7,
  results,
}, null, 2));
