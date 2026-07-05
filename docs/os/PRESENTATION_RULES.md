# Presentation Rules

Document type: doctrine

Status: draft operating rule

## Purpose

Presentation rules define what the renderer may show and what it must not invent.

## Renderer law

The renderer reads graph data.

The renderer does not author graph truth.

The renderer displays provenance, uncertainty and degraded states.

The renderer does not certify.

The renderer does not invent child scopes.

The renderer does not silently fall back to hidden hard-coded truth.

## Allowed display states

```text
declared
derived
unknown
degraded
failed
orphan
external
source
surface
eye
sense
recovery
```

## State meanings

Declared means the displayed fact is stated by a source or committed declaration.

Derived means it was inferred by a scanner, workflow or analysis.

Unknown means not enough evidence exists.

Degraded means a surface or source partly failed.

Failed means the source or surface could not be reached or parsed.

Orphan means a node was found but is no longer reachable from a declared root.

External means outside the repository estate.

Source means a feed, dataset, registry or portal.

Surface means a human-openable page.

Eye means a spatial or topology rendering surface.

Sense means a time-series, market or signal surface.

Recovery means a known-good copy or restore anchor.

## Colour intent

```text
green = verified healthy or declared healthy
grey = unknown
amber = degraded
red = failed
cyan = data, dependency or graph relation
purple = governance
blue = external or source
gold = Spider identity or control
```

Colour is presentation, not proof.

The graph payload must carry the state behind the colour.
