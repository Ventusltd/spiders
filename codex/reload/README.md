# Reload the GlobalGrid working context

This Codex-owned observer joins existing repository responsibilities. It does not replace
the federation registry, genome-spider, CVAA, Test Code, or an app release manifest.

Read [ARCHITECTURE.md](ARCHITECTURE.md) for the system and evidence boundaries.
Read [BUILD-PLAN.md](BUILD-PLAN.md) for release stages and cartridge boundaries.
Then refresh the local identities before deciding which code to touch:

```powershell
python C:\Users\vikra\OneDrive\Documents\GitHub\spiders\codex\reload\reload.py --evidence C:\Users\vikra\OneDrive\Desktop\offline-screenshots --out C:\Users\vikra\OneDrive\Desktop\offline-screenshots\architecture-reload-20260905\current
```

Read the generated `RELOAD.md`, then `delta.json`. Open relevant anchor files from
`snapshot.json`. `--with-ci` adds bounded read-only GitHub observations; it does not
execute tests, fetch branches, trigger workflows, or certify a deployment.

The owner registry declares 24 working copies explicitly. `--home` and `--owners`
support another machine. Missing repositories are errors; missing optional anchor
files are recorded individually. No fallback chooses a similarly named checkout.
Local working bytes are hashed for the small anchors on every scan, so an uncommitted
edit can invalidate context even when HEAD stays unchanged. Git and status are read
again at the end of each repository scan to expose obvious concurrent work; this is
not an atomic snapshot or a substitute for a frozen acceptance checkout.

Evidence is indexed by path, size and modification time. No file body is copied or
executed, no screenshot is staged, and no old report becomes a new pass. Large diagnostic
attachments and private conversation histories remain local. The observer does not
read account credentials, tool configuration, browser history or conversation logs.

Each run replaces `snapshot.json`, `delta.json` and `RELOAD.md` in the supplied offline
output directory. Preserve a separate dated copy if historical snapshots are needed.
The first run reports all checkouts changed; later runs report differences.

Proofs:

```powershell
python -B C:\Users\vikra\OneDrive\Documents\GitHub\spiders\codex\reload\test_reload.py
```

Six tests cover uncommitted drift, wrong repository/owner/host origin, missing checkouts, metadata-only
evidence, partial-handover changes and output-path refusal.

The evidence section of delta.json lists added, modified and removed files. Growing
handovers and new receipts are changes to inspect, not completion proofs. The completed
adjacent handover is handover-202609051831 under the offline root. Keep its retained
failed-50-run receipt distinct from Teleprinter's mutable fifty-prints-results.json.

The wider 40-repository historical inventory is in
`linux-for-the-power-grid/codex/REPOSITORY-COVERAGE.json`. It records entry-point
coverage, not a complete review of every repository. Newly created GPU work is
included explicitly here; old registry snapshots are not silently rewritten.


The active Build context checkpoint workflow runs the six reload fixtures alongside
the eight completion-proof and two campaign-proof fixtures on Linux. It validates
public context and retains only compact resume/CI observations. It does not scan a
user's private machine, upload raw evidence or certify application builds.
