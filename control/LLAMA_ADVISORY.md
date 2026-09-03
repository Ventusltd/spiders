# Manual Llama advisory

Document type: contract

Status: branch candidate

Scope: advisory review of the committed 60-iteration program

Owner repo: spiders

Last reviewed: 2026-09-03 UTC

Manual dispatch is disabled by default. A path-scoped push to main after CEO
integration enables one run against the merged bytes. The job uses a standard
Ubuntu runner and a small CPU-capable model. It has no write, deployment,
schedule, secret, or GPU authority.

The runtime source is llama.cpp at exact commit
ff067f76dd8e9e05f0528056f1274adf01a54d70. The model is
Qwen/Qwen2.5-0.5B-Instruct-GGUF at exact revision
9217f5db79a29953eb74d5343926648285ec7e67, file
qwen2.5-0.5b-instruct-q4_k_m.gguf, SHA-256
74a4da8c9fdbcd15bd1f6d01d621410d31c6fc00986f5eb687824e7b93d7a9db.
Checkout and upload actions are pinned to full commits.

The deterministic validator runs before and after inference. The prompt is at
most 65,536 bytes, model output at most 32,768 bytes, generation is capped at
384 tokens, and inference is capped at 180 seconds. Prompt, output, and runtime
status are hashed into a receipt. The model result remains advisory and cannot
change the structural gate. A missing or malformed receipt fails; a supported
model finding remains informational.
