# Two-lane 60-iteration control

Document type: contract

Status: branch candidate

Scope: Pipeline News and GridAtlas isolated build branches

Owner repo: spiders

Last reviewed: 2026-09-03 UTC

The file 20260904-60x-program.json is a data-only provenance graph and serial
queue. It contains 30 Pipeline slots backed by passing per-commit receipts and
30 Grid slots backed by exact commits whose cumulative proof still requires
independent review. Authored or failed work remains visible but does not count
as passed.

Every slot follows discovery, author, serial-cutter. The cutter rejects an
unchanged input, returns the same release for the same input, and rejects reuse
of an identity for divergent input. Candidate branches cannot promote. The CEO
alone may review and promote to main.

The state-delivery rule is general: emitting an identity is insufficient.
Delivery requires receiver acceptance of the canonical fields and read-back of
the intended state. A fallback arrival is evidence of fallback, not evidence
that the canonical state was delivered.

Run:

    node tools/validate-60x-program.mjs --receipt artifacts/60x-program-receipt.json

Structural corruption fails the command. Pending review is reported as an
informational finding and stays green, preventing a notification storm while
preserving the incomplete state in the receipt.

This is a structural observer: it validates the graph and its declared receipt
references but does not execute another repository's tests or treat embedded
`result: pass` fields as independently replayed evidence.

The workflow candidate is limited to manual dispatch and path-scoped pull
requests. It has a read-only token, cancels superseded runs, performs no deploy
or model execution, and uploads the deterministic receipt.
