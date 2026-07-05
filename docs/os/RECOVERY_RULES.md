# Recovery Rules

Document type: doctrine

Status: draft operating rule

## Purpose

Recovery rules make sure a working Spider surface can be restored from committed source rather than reconstructed from memory.

## Recovery copy requirement

Every major working surface needs a recovery copy.

Recovery copies should be made before major UI changes, species ports or scanner-driven page rewrites.

## Required recovery metadata

```text
source path
destination path
commit SHA
file hash
date
reason
known-good status
```

## Recommended recovery locations

```text
site_versions/
species/<species-name>/versions/
recovery/
spider_maya/vN/recovery/
```

## Rules

A working page should be recoverable from a committed file.

Do not reconstruct working HTML from memory.

Do not treat a screenshot as a recovery copy.

A screenshot is evidence of behaviour, not source recovery.

A recovery page is an anchor, not an invitation to redesign.

## Current known-good specimen

The working Federation Spider specimen currently hibernates in the federation repo at:

```text
dashboard/sandbox/spider_full_po_test.html
```

It should remain protected while species versions evolve additively in the spiders repo.
