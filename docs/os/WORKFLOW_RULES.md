# Workflow Rules

Document type: doctrine

Status: draft operating rule

## Purpose

Workflow rules define how GitHub Actions may execute Spider work without exposing secrets or mutating truth silently.

## Defaults

Use `workflow_dispatch` first.

Use `contents: read` by default.

Grant `contents: write` only to jobs that must commit declared output paths.

Do not enable scheduled workflows until manual runs are stable.

Do not use cross-repo writes without an explicit PAT secret.

Never expose a secret in chat.

## Same-repo writes

Use `GITHUB_TOKEN` where possible.

The repository must allow read and write workflow permissions if the workflow is expected to commit.

## Cross-repo writes

Use a named PAT secret only inside GitHub Actions.

Suggested names:

```text
SPIDERS_PAT
GRIDBOT_PAT
```

## Promotion rule

A workflow may produce evidence.

A workflow may commit derived outputs to declared derived folders.

A workflow may not promote derived findings into declared truth unless the workflow itself is executing a human-approved promotion scope.

## Safety rule

Broad automation must wait until the repo can observe what it changes.

A workflow that changes a surface must leave a recovery route.

A workflow that touches data truth must leave a receipt.
