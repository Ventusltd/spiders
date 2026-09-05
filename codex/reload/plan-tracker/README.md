# Build plan tracker

This is the machine-readable companion to [BUILD-PLAN.md](../BUILD-PLAN.md). It keeps P0–P6, prerequisites, blockers, next actions and required proof categories explicit. It observes CI; it never upgrades a task automatically because a workflow is green. Generation 202609051820 remains an unaccepted baseline. Assign the next timestamp only when preparing a new immutable candidate.

The tracker is code, not a permanently running agent. An agent resumes by running the commands below, reading RESUME.md and delta.json from the wider reload instrument, then opening only the changed code and relevant evidence. Long coding blocks should end with a checkpoint update and immutable receipts before the next block begins.

## Local checkpoint

From the Spiders checkout:

```powershell
python -B codex/reload/plan-tracker/test_validate.py
python -B codex/reload/plan-tracker/validate.py --evidence-root C:/Users/vikra/OneDrive/Desktop/offline-screenshots --out C:/Users/vikra/OneDrive/Desktop/offline-screenshots/architecture-reload-20260905/plan-tracker
python -B codex/reload/plan-tracker/observe_ci.py --out C:/Users/vikra/OneDrive/Desktop/offline-screenshots/architecture-reload-20260905/plan-tracker
```

Use a new timestamped output directory for checkpoints that must be immutable. The path above is a convenience current view, not an append-only journal. Plan references point to hashed retained evidence, never mutable driver convenience receipts. The handover hashes are checked when an evidence root is provided; its statements remain inspected records, not independently rerun product tests.

Eight focused tests exercise missing proofs, wrong release, wrong owning commit, wrong environment, underlying artifact tampering, recorded claims, incomplete prerequisites, dependency cycles, path escape and completion without evidence. The actual eight-task plan validates with its current unfinished statuses; this says nothing about product acceptance.

## Completion contract

A completed task must name `targetRelease` (generation, sourceCommit, engineCommit, buildSha256) and `targetCommits` (exact full SHA for every owning repository). Every prerequisite must be completed. `targetEnvironments` maps each required proof category to an explicit environment identity (a structured object can bind browser, viewport/DPR, server profile and emulation/physical class); the receipt must match it exactly. Each required proof category must have a SHA-256-bound JSON receipt below the supplied evidence root:

```json
{
  "schema": "spiders.build-proof.v1",
  "taskId": "P2",
  "kind": "app-pdf-fidelity",
  "result": "pass",
  "verification": "measured",
  "checkedAt": "timestamp from the actual run",
  "environment": "actual browser, viewport, DPR and server profile",
  "release": {
    "generation": "exact 12-digit generation",
    "sourceCommit": "full SHA",
    "engineCommit": "full SHA",
    "buildSha256": "full SHA-256"
  },
  "commits": {"teleprinter": "full SHA"},
  "artifacts": [{"path": "immutable-run/report.json", "sha256": "full SHA-256"}]
}
```

The example is deliberately not a passing fixture. A proof wrapper must be produced from actual measured results; setting `verification: measured` by hand does not make an unmeasured claim true. This generic validator verifies identity, prerequisite and artifact integrity. Domain validators still own checks such as 50 actual visits, zero forbidden capture calls, complete source bodies, entity transitions and visual fidelity. Add their measured results to the wrapper without translating unrelated passes into missing proofs. A hash establishes unchanged bytes, not the truth of the report.

An offline completion is intentionally not accepted by the default cloud run because the runner cannot see this machine's evidence. Before using cloud validation for completed tasks, provide an explicitly reviewed public proof bundle with compact measured JSON only, update its relative references, and run the validator with that bundle as its evidence root. Do not upload the offline folder to make the cloud green.

## CI/CD runner use

`context-checkpoint.workflow.yml` is the source template for `.github/workflows/20260905-build-context.yml`, activated under the user's instruction to use Git/CI for session continuity. It runs on tracker changes and can be dispatched manually. It follows the repository's existing pinned checkout/upload action revisions, read-only permissions, timeout and retained artifact conventions. Each run will test the validator, produce RESUME.md and validation.json, and observe the exact existing GitHub run IDs in `plan.json`. The artifact name binds the context to the Spiders commit, run ID and attempt. Thirty-day artifact retention is not permanent memory; the committed plan and code remain the durable index.

`observe_ci.py` uses public read-only GitHub REST. It checks the requested run's SHA and records every returned job/step state. More than 100 jobs fails the observer as incomplete rather than silently declaring coverage. No logs, authentication environment, repository secrets, raw transcripts, screenshots, PDFs or captured source exports are copied. The observer's exit code reflects observation errors; product failures stay explicitly recorded in `ci-context.json` and do not turn into a product pass. Reading a previous run is not running a new test. Update run IDs and expected SHAs together when new code is tested.

Fresh observations on 5 September 2026:

| Owner and exact scope | Commit | Run | Finding |
|---|---|---|---|
| Testcode offline gate | ab632e5841def44f5023206315b4a13876c868ae | [33984231463](https://github.com/Ventusltd/testcode/actions/runs/33984231463) | Offline gate failed; menu mapping skipped despite endpoint fix |
| CVAA selftest + fleet audit | a1fae46a1cb3685ce1214ecd930363ca2c6eba39 | [33984247747](https://github.com/Ventusltd/cvaa/actions/runs/33984247747) | Both jobs passed; not a PDF fidelity test |
| GridAtlas composed cartridge proof | 0ea9ba16882899a755a88d34caedc11d390c3f94 | [33977790282](https://github.com/Ventusltd/gridatlas/actions/runs/33977790282) | Composed proof failed; later mobile and STATE checks skipped |
| GPU repository CPU/RAM ladder | 676715abad48773d45a401e91ac4c260a72548a5 | [33978552699](https://github.com/Ventusltd/gpu-drivers-for-global-grid/actions/runs/33978552699) | CPU runner passed; job explicitly says no GPU |
| Grid engine verify | f9531a7a36ff1b2557362bf2a61949066f393821 | [33969419919](https://github.com/Ventusltd/ventus-grid-engine/actions/runs/33969419919) | Verification passed for that commit; not every browser selection |

The compact `ci-observation-20260905.json` records the discovery snapshot. Detailed fresh job/step receipts are offline under the architecture review's plan-tracker directory. Observe again before relying on an old conclusion.
