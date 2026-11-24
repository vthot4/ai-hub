---
name: Code Review Agent
summary: Comments on pull requests with potential bugs, missing tests and style issues before a human reviews.
icon: 🔍
status: stable
category: Engineering
tech: [GitHub Actions, Python, LLM API]
version: "1.3.0"
owner: Engineering Productivity
repo: https://git.example.org/ai/code-review-agent
updatedOn: 2026-10-20
tags: [code, pull-requests, ci]
---
## Overview

The agent runs on every pull request, reads the diff plus the touched files and posts a single summary comment with inline suggestions. It **never** approves or merges: it only reduces the work of the human reviewer.

**Good for:** catching obvious bugs, missing tests, risky patterns and inconsistent naming.
**Not for:** architecture decisions, security sign-off or reviewing generated code you have not read yourself.

| Item | Value |
| --- | --- |
| Data it sees | Diff and touched files of the PR |
| Data it stores | Nothing; comments live on the PR |
| Model access | Through the corporate gateway |

## Install

Requirements: a repository on the internal Git server and permission to add a workflow.

1. Add the workflow file `.github/workflows/ai-review.yml`:

```yaml
name: AI review
on: [pull_request]
jobs:
  review:
    runs-on: ubuntu-latest
    permissions: { pull-requests: write, contents: read }
    steps:
      - uses: actions/checkout@v4
      - uses: example-org/code-review-agent@v1
        with:
          gateway-url: ${{ vars.AI_GATEWAY_URL }}
          token: ${{ secrets.AI_GATEWAY_TOKEN }}
```

2. Ask the AI Platform Team for a gateway token for your repository and store it as the secret `AI_GATEWAY_TOKEN`.
3. Open a test pull request and confirm the agent comments within five minutes.

## Use

- Add a `.ai-review.yml` file at the repository root to set the focus:

```yaml
focus: [bugs, tests]
ignore: ["**/*.lock", "docs/**"]
max_comments: 10
```

- Reply `@ai-review explain` on any comment to get more detail.
- Mark a comment as resolved when it is wrong: the maintainers use these to tune the prompts.

## Maintain

- **Owner:** Engineering Productivity (`#eng-productivity`).
- **Versioning:** pin to a major version (`@v1`); minor releases are backwards compatible. Subscribe to the repository releases for changelogs.
- **Rotate the token** every 90 days; the gateway sends a reminder 14 days before expiry.
- **Monitoring:** the gateway dashboard shows request volume and failures per repository.
- **Troubleshooting:** if no comment appears, check the workflow run log; `403` means the token expired, `429` means rate limiting.
- **Retirement:** remove the workflow file and ask the platform team to revoke the token.
