# Bounded public-estate survey

This observer compares four cloud shards against one immutable local registry
receipt. The registry is the checked-in file
`20260904-estate-survey-registry.json`; workflow discovery never silently adds
or removes a repository.

The scope is the 33 public repositories owned by `Ventusltd` at the recorded
capture time. The two known private repositories are intentionally excluded:
the token issued to this public repository is not granted cross-repository
private-data authority.

Each shard handles a deterministic subset selected from the SHA-256 of
`owner/name`. At most four shard jobs run concurrently, and requests inside a
shard are serial. Each repository receives three bounded, read-only API reads:
metadata, its declared default-branch head, and workflow inventory.

Head drift, a changed default branch, archival, disablement, or a missing
repository is an informational finding. Those facts belong to the repository
owner and do not make this observer red. Invalid registry bytes, malformed API
responses, transport or rate-limit failure, a missing shard, an altered shard
receipt, or incomplete aggregation are observer failures and exit non-zero.

The aggregate receipt names and hashes the local registry receipt and all four
cloud shard receipts. It also reconstructs the local receipt from the checked-in
registry and fails if the downloaded local artifact differs. It is a comparison,
not certification and not a command channel. The workflow has no schedule,
write permission, deployment, target code execution, or model step.

Local deterministic gate:

```text
node tools/test-estate-survey.mjs
node tools/test-cloud-workflows.mjs
node tools/estate-survey.mjs registry --registry control/20260904-estate-survey-registry.json --out artifacts/estate-survey-local.json
```
