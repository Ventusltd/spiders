# Mobile SatNav readiness

## Programme evidence

The cartridge links the native GridAtlas sender candidate, immutable compass receiver, selected-line evidence and independent audit to Scope Revision 2. The review records each result and its scope. The source pins and desktop benchmark below are historical planning evidence for later route generation. [Neural Link review](https://github.com/Ventusltd/neural-link-between-agents/issues/84#issuecomment-7144575618)

Use Genome Spider to inspect selected files and dependency evidence. Stars provides function source and links to files and lines at indexed commits. [Genome Spider](https://ventusltd.github.io/ventus-grid-engine/?graph=genome-spider) · [Stars Code Report](https://ventusltd.github.io/stars/code.html)

## Benchmark baseline

GridAtlas generation 202611222343 exposes place lookup and map selection. The SatNav picker candidate confirms a signed WGS84 destination using fixtures, and the published P1 preview supplies straight-line bearing and distance. Electrical connectivity describes conductors and assets. Routing needs a different graph with traversable edges, verified entry points, restrictions and coverage for each mode.

## Maths and performance

Keep the canonical geodesy for bearing and distance. The existing router scores a grid edge by its metric length times the mean traversal multiplier of its endpoint cells. Its A* heuristic uses octile distance times the lowest passable multiplier. This lower bound preserves optimality under the current eight-neighbour cost model. The router requires both adjacent cardinal cells to pass before taking a diagonal.

The 600 × 600 synthetic fixture covers a 3 km square at 5 m resolution. Twenty measured core calls followed four warm-ups per case. The open grid expanded 470 cells and the gate detour 149,276. The three p95 figures in the cartridge exclude tile acquisition, worker transfer, GPS, rendering and route serialization. Input arrays occupy 2.52 MB, with additional memory for search state and the heap. The existing Python audit passed 242 grid assertions including 100 Dijkstra reference cases, 18 adapter assertions and 43 follower assertions.

Use a worker for bounded CPU search. Cache immutable graph and grid inputs. For a repeat-query field pilot, measure whether a connectivity index keyed by pack and permission version can reject disconnected endpoints early. Invalidate it when effective closures or permissions change. Treat CuPy as an optional offline tool for sufficiently large data-preparation batches after measuring transfer-inclusive throughput. The existing desktop timings do not justify a GPU dependency in the mobile runtime.

## Delivery sequence

1. Reuse the confirmed GridAtlas place or map selection and canonical destination link. Finish provider rights and coverage and measure the complete interaction on mobile.
2. Add observational following of a verified existing route with accuracy-aware GPS. Measure fix age, ambiguous positions and app resume independently of route generation.
3. Prove one road-to-field pilot with verified handoff points. Route on the licensed road graph to the handoff, then through a bounded field pack. Record data version, permission and coverage for each leg. Return explicit unavailable or no-route states when evidence or connectivity is missing. Include a road-only mode.
4. Keep drone survey planning in a separate workflow based on the approved operating envelope and operator review. A ground route and an asset coordinate provide no flight authority.

Compare cold and warm p50/p95 on physical Android and iOS across pack verification, worker readiness, route result and first rendered route. Include offline startup, cancellation, background and resume, stale GPS, long detours and missing coverage. Desktop timings are diagnostic. The CI fixture checks route behaviour and emits timings without setting a mobile latency threshold.

## Reproduce

Check out the router revision pinned in the cartridge, then run:

```powershell
node species/seer-spider/satnav/benchmark.mjs ../satnav/src/router/grid-search.mjs
```

The cartridge is a standalone evidence input for Spiders. Product implementations remain with SatNav and GridAtlas.
