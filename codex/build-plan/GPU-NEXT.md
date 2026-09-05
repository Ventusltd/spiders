# GPU runner development checkpoint

User handover received 2026-09-05 after overnight audit activation. Resume deliberately; no hardware benchmark was run by this documentation step.

Local checkout inspected: `gpu-drivers-for-global-grid`, clean at `bc50c57637aaecf8af97f4213fb4b05cfbf9e9b6`, remote `https://github.com/Ventusltd/gpu-drivers-for-global-grid.git`. Its `claude-bench.yml` currently filters push branches to `claude/**`; `main` is absent. Read the current remote and lane instructions before changing it.

Read Claude's attributed session record first: `claude/sessions/202609051807-measure-teleprinter-lane-and-gpu/00-LOG.md`, then its current CARRY-ON.md. Reported figures (not independently remeasured here) show a one-pass GPU loss and resident repeated-pass gains. Byte-histogram similarity only selects candidates for exact comparison; it does not prove duplicate code. Preserve all raw measured vendor/adapter identities.

Next bounded work:

1. Independently reproduce the reported GridAtlas verify-live.yml composition risk: compare its assertions with the pinned current cartridge manifest. Add a missing-cartridge negative fixture before any release change. The user reports substation-intelligence and sld-sandbox can be dropped while old assertions pass; verify current code before treating that as a present defect.
2. Enable the GPU lane's relevant-path push-to-main verification as a separate reviewed change. CPU-only smoke tests must state GPU untested, never imply a hardware pass.
3. Add a runner capability receipt: adapter, driver/runtime, available memory, CPU baseline, input SHA-256, commit and actual execution mode. Use an explicitly configured local/self-hosted GPU runner for real GPU work; do not assume the estate audit's Ubuntu jobs have one. Do not register/expose a new self-hosted machine implicitly.
4. Benchmark realistic bounded offline workloads with cold upload, resident repeated work, download and verification costs separately and end-to-end. Keep CPU fallback; choose GPU only from measured crossover. Compare exact host hashes and output semantics, not histogram similarity.
5. Preserve independent lanes. Keep raw evidence offline, cap memory and runtime, use keyed Parquet/DuckDB-readable products for large future tabular results following data-gb-electricity discipline. Do not fill Git with benchmark payloads.

Each implementation is its own timestamped increment and must link to the canonical GeoJSON plan rather than silently renumbering its 100 planned app builds. These are pending acceptance tasks, not completed GPU acceleration.

Permission denials must be reported. Never route the same rejected write through the Git Data API or another transport to evade a control. The user-provided historical account is retained as a warning, not evidence that a denial occurred in this audit run.
