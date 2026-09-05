# Estate audit and restart

`estate-audit.py` is the same read-only runner on a local machine and GitHub Actions. It discovers API-visible public Ventusltd repositories, pins each default-branch head, records bounded workflow/repository/script references, samples recent CI results, and reads up to 300 commits per repository from the preceding 153 days. Truncation is explicit. It never executes observed source, collects electricity data, changes owner repositories, or approves releases.

The manually dispatchable `estate-audit.yml` also runs Sundays at 02:35 UTC. Three parallel shards each have a 90-minute Actions limit and an 80-minute scan budget. They finish early when done; runtime is not padded. The existing genome-spider remains the executable, configured federation graph builder. These broader survey artifacts supplement it and must be reviewed before their references are adopted into that graph.

Storage follows the bounded, keyed-product principles in data-gb-electricity and the Data Discipline Manual. One report partition per repository, maximum 8 MB before write, includes its pinned identity; manifests declare SHA-256 hashes and omissions. No report can reach 50 MB. Large future tabular extensions require explicitly keyed, bounded Parquet partitions readable with DuckDB, with duplicate/null-key and round-trip checks before publication. Do not quietly raise the JSON limit. Do not duplicate electricity archives into Spiders.

Each shard is capped at 1,200 API requests (3,600 total), with a deadline checked before every request. API rejection or missing coverage is retained as an error, not converted into a pass. Other workflows sharing the token can still reduce available quota.

CI evidence is an artifact retained for 14 days, never committed as bulk Git data. Download it to `C:/Users/vikra/OneDrive/Desktop/offline-screenshots` during the next review. Local invocation writes directly there:

```powershell
python codex/build-plan/estate-audit.py --out C:/Users/vikra/OneDrive/Desktop/offline-screenshots/estate-audit-local
```

Review every shard manifest, verify hashes and coverage, examine failed CI by exact head, then reconcile observed references with the planned GeoJSON. An incomplete source sample is not the entire estate's runtime logic. Owner documentation rollout remains separately tracked; preparing worktrees is not publication.
