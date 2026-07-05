# Build Sequence

Document type: doctrine

Status: draft operating rule

## Purpose

Future Spider work should move through a consistent sequence so studies, scans, UI and truth stores do not drift.

## Standard sequence

```text
study
source-card
scope
scan
distil
validate
render
visual test
receipt
promote if accepted
```

## Meaning

Study defines what is known and unknown.

Source-card records external source rights, fields and limits.

Scope states the exact build target.

Scan observes or derives.

Distil creates compact graph or renderer payloads.

Validate checks schema, provenance and consistency.

Render creates the visible surface.

Visual test confirms the page actually behaves as intended.

Receipt records evidence.

Promotion requires acceptance by a human principal.

## Stop rules

Do not jump from study directly to UI.

Do not jump from derived scan to declared truth.

Do not add a new external source without a source-card.

Do not change a working renderer without a recovery copy.

Do not enable scheduled automation before manual runs are stable.

## Current preferred mode

For reversible doctrine and OS documents, direct small commits are acceptable.

For scanners and UI, use workflow, branch or temp Pages testing before promotion.

For data truth stores, use audit-first discipline.
