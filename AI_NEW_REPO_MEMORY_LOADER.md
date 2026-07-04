# AI New Repo Memory Loader

Read this before creating or modifying a new Ventus or GlobalGrid2050 repository.

This file exists because new repos repeatedly lose project memory. The mature repositories already know how to work: GitHub Actions can execute controlled work, humans trigger workflows, reports create evidence, and the principal decides what becomes live.

## Core identity

Ventus and GlobalGrid2050 repositories are not casual website folders. They are parts of a founder-controlled grid intelligence system.

GlobalGrid2050 is the large historical body of working apps, maps, data experiments, explainers and public pages.

The federation repo is the source-of-truth map and hibernation chamber for the first Spider.

The spiders repo is the species lab where Spider views can evolve.

Future specialist repos should start with a small memory loader like this before code is added.

## Operating law

AI proposes or commits controlled assets.

The principal triggers workflows manually.

GitHub Actions records evidence.

The principal approves what becomes live.

Do not expose secrets in chat.

Use repository secrets only inside GitHub Actions when needed.

Prefer workflow_dispatch for controlled execution.

## New repo checklist

Create README.md first.

Create AI_NEW_REPO_MEMORY_LOADER.md early.

Create .nojekyll if the repo will serve static Pages.

Enable Pages only after there is a stable index.html.

Use GITHUB_TOKEN for commits inside the same repo.

Use a PAT secret only for cross-repo writes or permissions the default token cannot perform.

Name the PAT secret clearly, for example SPIDERS_PAT or GRIDBOT_PAT.

## Data and UI law

Do not mix source data, generated proof stores and UI surfaces without declaring which is which.

A renderer must not invent truth.

A dashboard should read committed data, manifests or cartridges.

Unknown is a real state.

Grey is better than fake green.

Screening output is not certification.

## Workflow law

Start with one manual workflow.

Make it small.

Make it idempotent where possible.

Write reports or receipts when the workflow changes files.

Commit only declared output paths.

Do not create broad automation before the repo can observe what it is changing.

## Recovery law

Every major working page should have a recovery copy.

Do not rely on memory to reconstruct working HTML.

Keep versioned recovery files for important Spider species and dashboard surfaces.

## Spider law

The federation repo hibernates and recovers the first Spider.

The spiders repo evolves species.

A species can be a federation spider, grid spider, market spider, source spider or seer spider.

The Seer Spider is the future top species that can see and route between other Spider species.

## First commands for a new AI session

Read README.md.

Read AI_NEW_REPO_MEMORY_LOADER.md.

Inspect recent commits.

Inspect available workflows.

Inspect Pages state if the repo serves a site.

Before proposing direct edits, ask whether this repo follows audit-first, workflow-first or direct-commit mode.

If unsure, choose the safest small workflow path.
