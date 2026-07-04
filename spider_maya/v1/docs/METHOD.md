# spider_maya v1 method

Stage 0 implements only the declared homepage menu provider.

It does not scan the git tree.

It does not probe live URLs.

It does not create derived claims.

It does not touch or rewrite the working Spider sandbox page.

## Provider

Source: `Ventusltd/globalgrid2050/index.html`

Symbol: `AREAS`

Default ref: `88894bebe6cc42a7bf766a2b104d609fd3a1f514`

The `AREAS` menu is treated as declared because it is hand-authored and committed in the source repository.

## Output

The scanner writes:

- `data/derived/nodes.json`
- `data/derived/edges.json`
- `audit/<run-id>.json`
- `audit/<run-id>.md`

The folder is named `derived` because it is an emitted graph artefact, but the rows inside the first v1 output are still marked `provenance=declared` because the input source is declared.

## Governance rule

A later provider may add derived git-tree rows, live-probe rows and orphan rows.

Those rows must remain `provenance=derived` until a human commits a declaration that promotes them.

## Determinism rule

Rows are sorted by `id` before emission.

The audit receipt records logical SHA-256 hashes of the sorted JSON payloads.

## Loved page rule

The working Spider page is a recovery anchor, not an editing target.

The recorded Git blob SHA is held in `config/sources.json`.

A future strict validator may also store and verify a SHA-256 of the exact HTML bytes.
