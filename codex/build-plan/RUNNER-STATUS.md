# Runner checkpoint ? 6 September 2026

Read CI-TRACKER.json for the exact observed commits, run IDs and outcomes. The canonical programme remains revision 202609052048: 50 Pipeline and 50 Atlas planned increments. All nine compiler tests passed and the audit found no canonical drift. This checkpoint does not mark planned products accepted.

## Priority completion update

The old hourly learning scheduler was stopped with its FINAL.json queue preserved. It completed 81 jobs; 27 remained. A finite cloud run regenerated models only from verified public commits, then executed those jobs. Run [34004616519](https://github.com/Ventusltd/gpu-drivers-for-global-grid/actions/runs/34004616519) completed all 23 public-source workload jobs, with no failures. Source fingerprints were checked against existing local baselines where applicable. All 24 artifacts were downloaded offline (about 1.66 MB compressed).

Four jobs remain local because public reproduction was unavailable. The serial finish controller waits for the original 3.2 GiB launch reserve, pauses/terminates work below 2.5 GiB, and retains a 192 MiB worker cap. It is scheduled until 06:00 BST. Read learning-drain-20260906/local-status.json and local-completion.json if present; do not infer completion from the controller being alive. The generic learning monitor still points at the historical stopped run; this transfer checkpoint is authoritative for this finite queue.

Total completed study executions: 104 (81 local + 23 cloud), not 104 unique repositories. Four remain. The separate CPU/GPU controller's 18 completed batches are a different count; its remaining hourly measurements still need local memory. The 96-step engineering review scheduler is also separate and does not perform unimplemented reviews automatically.

## Earlier runner outcomes (historical)

The Build context checkpoint and Bounded public estate survey were explicitly dispatched against Spiders dc76a933bb3a247651673e26e7d71ec781e06fa1. Both completed successfully, including all four survey shards and the reconciliation job. Runs: https://github.com/Ventusltd/spiders/actions/runs/34003002002 and https://github.com/Ventusltd/spiders/actions/runs/34003003228 . The survey uses four cloud shards; it does not consume this laptop's RAM or measure its GPU. These jobs restore useful continuity work while local studies wait for resources.

Local controllers remain alive. At takeover the learning study had 81 completed jobs, zero worker failures and 27 queued. The CPU/GPU review controller had 18 completed jobs and zero worker failures. Both were waiting for memory headroom. The learning launch threshold is 3.2 GiB; running work pauses below 2.5 GiB. CPU/GPU work pauses below 2 GiB and resumes above 2.6 GiB. Existing thresholds, deadlines and evidence remain intact. Monitor: http://127.0.0.1:8978/ .

## Next work in priority order

1. Finish the four retained local jobs when RAM reaches 3.2 GiB. The prior 27-job queue was transferred, not restarted. Preserve its history and avoid duplicate cloud or hourly work.
2. Keep GridAtlas PR #15 unaccepted until its exact composed menu-control and cartridge-size failures are resolved and tested. Its six legacy guard tests do not substitute for the broader proof. Follow ATLAS-09/10 control requirements and ATLAS-50 release evidence boundaries.
3. Under PIPELINE-48 continuity work, add tested crash recovery to the learning controller in gpu-drivers-for-global-grid. Current learning-night.py initializes its queue and counters in memory; it has no checkpoint resume option. Its resource-interrupted jobs are counted as failures and removed rather than requeued. Verify interrupted/restarted work is retained, finished work is not duplicated, receipts stay immutable and the original deadline survives. This is an observed code limitation, not a claim that tonight's 81 successful jobs were lost.
4. Keep Pipeline coverage reconciliation (PIPELINE-01 onward) and current Atlas print completion ahead of optional layers. The separate ChatGPT session owns the electrification paper/dashboard; reconcile its publication evidence when supplied.

Worker completion, lexical clusters and a green continuity workflow do not prove application correctness. Source review must preserve the distinctions in PRECISION-REVIEW.md: archived excerpts, parser false positives and reproduced repository defects are separate outcomes.
