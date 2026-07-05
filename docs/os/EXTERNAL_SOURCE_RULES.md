# External Source Rules

Document type: doctrine

Status: draft operating rule

## Purpose

External sources must be studied before the Spider uses them deeply.

A source can support evidence, feed a scan, or declare facts only within the limits of what the source actually states.

## Source-card requirement

Every external source needs a source-card before it becomes part of the Spider OS.

A source-card records:

```text
source name
publisher or owner
URL
licence
attribution requirement
access method
API key requirement
rate limit or access limit
data type
update frequency
field list
declared fields
derived-only fields
known gaps
known failure modes
allowed Spider use
not-allowed Spider use
screening boundary
last checked date
status
```

## Source-card statuses

```text
draft
studied
approved-for-derived-scan
approved-for-declared-reference
deprecated
blocked
```

## Declared and derived source use

If the source explicitly states a fact, the Spider may reference that fact as declared once the source-card permits it.

If the Spider calculates, joins, probes, classifies or infers from the source, that output is derived.

A live URL probe is derived health evidence, not declared operational truth.

A broken source must be shown as degraded, failed or unknown, not hidden.

## Licence rule

If licence or usage rights are unclear, the Spider may record the uncertainty but must not ingest the source as declared truth.

## Attribution rule

If a source requires attribution, the Spider output must carry attribution where the data is displayed or used.
