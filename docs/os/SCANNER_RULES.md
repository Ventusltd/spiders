# Scanner Rules

Document type: doctrine

Status: draft operating rule

## Purpose

A scanner must declare what it is allowed to do before it runs.

## Scanner modes

```text
observe
derive
distil
render
apply
```

Observe means read only.

Derive means infer findings from observed material.

Distil means create compact graph or data payloads from larger observations.

Render means create view payloads or static pages.

Apply means write accepted outputs to declared paths.

## Permission rules

Scheduled scanners may observe and derive.

Manual workflows may observe, derive, distil and render.

Apply mode requires explicit declared output paths.

Promotion from derived to declared requires human dispatch.

## Prohibited scanner behaviour

A scanner must not silently overwrite declared truth.

A scanner must not certify engineering truth.

A scanner must not hide degraded or failed observations.

A scanner must not promote its own inference.

A scanner must not rewrite a loved working page.

## Required scanner receipt fields

```text
run id
timestamp
source list
method state
schema version
declared row count
derived row count
unknown count
degraded count
orphan count
output paths
logical hash
receipt path
```

## Current spider_maya rule

`spider_maya/v1` reads the declared GlobalGrid2050 AREAS menu and emits declared graph rows.

Later providers may emit derived rows, but must mark them derived.
