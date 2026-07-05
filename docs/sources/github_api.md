# GitHub API Source Card

Document type: source-card

Source name: GitHub API

Publisher / owner: GitHub

Primary URL: https://docs.github.com/rest

Source-card status: draft

Last checked: unknown

Licence: study required

Attribution requirement: study required

Access method: REST API and GitHub Actions token

API key required: public reads may not require a token; authenticated reads and writes use `GITHUB_TOKEN` or a PAT secret

Rate or access limits: study required

Data type: repository metadata, git trees, file contents, workflow metadata, commits and issues

Update frequency: live platform API

Declared fields: repository metadata returned by GitHub for a requested repository or path

Derived-only fields: classifications inferred from file paths, code structure, dependency mentions or scanner joins

Known gaps: API limits, pagination, permission differences, unavailable private repos, rate limiting

Known failure modes: 404, 403, truncation, token permission failure, rate limit, branch ref drift

Allowed Spider use: observe repositories, fetch declared files, build derived inventory, record workflow and Pages metadata

Not-allowed Spider use: silent promotion of derived file-path inference into declared truth

Screening boundary: GitHub observations are evidence of repository state at the time of request, not certification of project truth

Notes: use source-specific receipts for any scanner that relies on GitHub API output.
