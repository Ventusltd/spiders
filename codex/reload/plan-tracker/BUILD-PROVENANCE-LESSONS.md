# Build byte provenance: retained failure and next regression

The 1940 candidate finish guard refused a builder-owned readiness.js whose Windows working copy used CRLF while the pinned committed blob used LF. Parent retained `architecture-reload-20260905/next-fifty/1940-finish-refusal.json`. The refusal is evidence that the byte guard fired; it is not a published candidate failure or an acceptance receipt.

The parent restored only the unpublished candidate file from pinned source commit `2ac33167952f6c97313c6fb5b9257bbdb3ab0df5`, then reran finish. No source producer baseline was rewritten. Subsequent builder-owned source copies should have one declared LF policy, applied before build identities are computed. Immutable producer runtime bytes remain byte-for-byte copies of their committed baseline; do not normalize them indiscriminately.

Proposed CVAA regression: distinguish builder-owned text from immutable producer bytes; reject changed bytes after pinning; reproduce CRLF working-copy versus LF committed-source mismatch; prove the declared builder policy yields the pinned bytes; prove binary/original producer files are unchanged. Keep both refused and corrected run receipts. This vaccine is planned, not implemented by this document.
