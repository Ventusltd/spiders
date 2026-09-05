# Baseline navigation and resolved consumer ownership

An original producer manifest records the sibling provenance known when that baseline was imported. A derived producer may preserve those links byte-for-byte. That is distinct from the owner version actually served at the sibling route in a newer composed consumer.

For example, Cable2001 retains Module/DC navigation declarations from its baseline: layout-tool e201075e052bfc71e7fef01f1360f319808cb78f and manifest bb6d0a5cf4cf63d68b3d5cb02e55c27f1ccc0646135d7e39cdedbbe3da262796. Consumer1958 serves a newer derived Module at the same relative route. The old link declaration must not be presented as the exact runtime identity of that newer destination.

N11 should add a composition resolution record per cross-owner link: source producer commit/manifest, original relative URL, resolved consumer path, actual destination producer commit/manifest, and whether the baseline declaration was preserved or intentionally overridden. Verification must inspect the composed target bytes and owner mapping, reject absent or ambiguous targets, and retain original declarations. A source-level navigation contract update is appropriate only when a new required sibling interface is intentionally declared; do not rewrite immutable baseline provenance to disguise a consumer override.

Current producer checks verify pinned declarations and dependency presence. They do not independently prove every cross-owner target is the same runtime revision as a historical navigation pin. The consumer owner manifest is the authority for actual shipped destination identity. This document records a pending N11 verification boundary, not an implemented resolver or a reason to claim all current sibling links fail.
