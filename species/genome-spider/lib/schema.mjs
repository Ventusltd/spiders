// schema.mjs — shapes genome-spider's internal node/edge arrays into the
// exact data files the Spider Sandbox already knows how to load.
//
// The schema below is not invented here. It was read out of the running
// sandbox and its live data, with citations:
//
//   Loader (which files, what shape):
//     data-federation-map-for-globalgrid2050-all-repos/dashboard/sandbox/
//       spider_full_po_test.html:196-200 `loadRoot()` — fetches
//       "nodes.json" and "edges.json" from a sibling data/ directory.
//     spider_full_po_test.html:198 `reshapeNodes(fc)` — reads
//       `fc.features[].properties.{label, repo_type|scope_type,
//       rag|status, status_reason, child_manifest}`. geometry/coordinates
//       are present in the source data but NOT read by this function —
//       included here for shape-fidelity only, not load-bearing.
//     spider_full_po_test.html:200 — edges reshaped as
//       `(ef.edges||[]).map(e => [e[0], e[1], e[2]])`: an index-array,
//       i.e. edges reference *array position* in the nodes list, not id.
//
//   Confirmed against the live data files (byte-inspected):
//     data-federation-map-for-globalgrid2050-all-repos/live_sandbox/
//       federation_control_ledger/data/nodes.json — a GeoJSON
//       FeatureCollection matching the shape above.
//     .../data/edges.json:2 — `"edge_format": "index-array-v1"`, confirming
//       the index-array reading above is the declared contract, not an
//       accident of one file.
//     .../data/manifest.json — the cartridge manifest shape mirrored by
//       buildManifestDoc() below (schema_version, scope, counts, sources).

function coordFor(i, n) {
  // Cosmetic only — reshapeNodes() never reads geometry. Spread nodes on a
  // circle so the file is inspectable/plottable if someone opens it in a
  // GeoJSON viewer, without asserting any real geography.
  const angle = (2 * Math.PI * i) / Math.max(n, 1);
  const r = 60;
  return [Number((Math.cos(angle) * r).toFixed(2)), Number((Math.sin(angle) * r).toFixed(2))];
}

export function buildNodesDoc(genomeNodes) {
  const features = genomeNodes.map((n, i) => ({
    type: 'Feature',
    id: n.id,
    geometry: { type: 'Point', coordinates: coordFor(i, genomeNodes.length) },
    properties: {
      label: n.label,
      repo_type: n.kind,
      scope_type: n.kind,
      rag: n.rag,
      status: n.rag,
      status_reason: n.status_reason || '',
      importance_score: n.importance_score ?? 0.5,
      child_manifest: null,
    },
  }));
  return { type: 'FeatureCollection', features };
}

export function buildEdgesDoc(genomeNodes, genomeEdges) {
  const indexOf = new Map(genomeNodes.map((n, i) => [n.id, i]));
  const edges = [];
  const droppedUnresolved = [];
  for (const e of genomeEdges) {
    const f = indexOf.get(e.from);
    const t = indexOf.get(e.to);
    if (f === undefined || t === undefined) {
      droppedUnresolved.push(e);
      continue;
    }
    edges.push([f, t, e.type]);
  }
  return {
    doc: {
      edge_format: 'index-array-v1',
      status_note: 'Emitted by spiders/species/genome-spider/spider.mjs. Every edge above is also present, with its evidence citation, in genome.json#edges.',
      edges,
    },
    droppedUnresolved,
  };
}

export function buildManifestDoc({ generatedAt, nodeCount, edgeCount }) {
  return {
    schema_version: 'atlas-cartridge-v0.2',
    generated_utc: generatedAt,
    public_title: 'Ventus estate genome',
    public_strapline: 'Repositories, internal units and the dependencies genome-spider could evidence between them',
    scope: {
      id: 'estate-genome',
      label: 'Estate genome (genome-spider)',
      scope_type: 'repository_federation',
      parent_manifest: null,
    },
    counts: { nodes: nodeCount, edges: edgeCount, sectors: 0 },
    key_law_status: 'SCREENING_GRADE_NOT_CERTIFICATION',
    key_note: 'Every node carries real git history (first/last commit, commit count). Every edge carries a file+line or JSON-pointer citation. Genome markers (duplication, drift, dead code, re-doing, uncomposed) are listed separately in genome.json and are not folded into this cartridge\'s rag colouring beyond a coarse amber/red flag.',
    unresolved_findings: [],
    tier: 'geojson',
    sources: { nodes: 'nodes.json', edges: 'edges.json', layers: null, sectors: null },
  };
}
