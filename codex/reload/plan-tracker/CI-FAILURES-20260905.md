# Testcode fleet failures observed 5 September 2026

The Testcode `offline` job fails at `Run the offline gates, fail closed` in all three recent tool-publication pushes: [b668730 / run33986148884](https://github.com/Ventusltd/testcode/actions/runs/33986148884), [6db4d17 / run33986071012](https://github.com/Ventusltd/testcode/actions/runs/33986071012), and [df9f873 / run33985879369](https://github.com/Ventusltd/testcode/actions/runs/33985879369). The earlier ab632e5 run33984231463 has the same outcomes. They are real failed fleet runs, separate from GlobalGrid Pages deployments and candidate-specific browser checks.

The latest immutable artifact9975207909 reports two passed gates, three failed gates and one required absent gate (four blockers):

| Gate | Actual outcome | Meaning |
|---|---|---|
| grid-engine | PASS,10 proofs155 checks | Checked sibling5fc984a05155bf89e3c36764ff21537b042b330e |
| gridatlas-composition | FAIL:substation438867 exceeds368640 | Actual sibling805b4b114766e3395437d96148d6d265a9a74f0d breaches its size boundary |
| cvaa | ABSENT,required | Workflow has no ../cvaa clone |
| menus | PASS,6/6 | This narrow gate passed; subsequent menu-map step is skipped after gate failure |
| link-targets | FAIL,6failed | Required portal/pipeline inputs are not checked out |
| repd-rows | FAIL,checked nothing | Required portal/pipeline inputs are not checked out |

The workflow checks out only Testcode, Ventus grid engine and GridAtlas. Its drivers also require cvaa, globalgrid2050, pipelinenews and spiders. Add explicit inputs and preflight checks, preserving every required gate and real product failure. Do not use continue-on-error, required:false, or cancellation to label this fleet green. Missing-input repair does not clear the genuine GridAtlas boundary failure or any additional existing link defects exposed by complete inputs. Pin exact sibling commits and retain full per-gate stdout/stderr in the next CI receipt.

Raw job logs, artifact ZIP and parsed testcode-run-b668730.json are retained under offline-screenshots/architecture-reload-20260905/five-version-campaign. They were read using existing Git credentials held in memory; no credential is written into these public documents. No rerun was dispatched during diagnosis.
