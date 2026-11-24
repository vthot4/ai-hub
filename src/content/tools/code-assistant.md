---
name: Code Assistant (IDE)
summary: Inline completion and chat in the IDE, licensed for all engineering staff.
icon: 👩‍💻
status: approved
category: Developer tools
vendor: Example Vendor
url: https://code-assistant.example.org
owner: Engineering Productivity
reviewedOn: 2026-08-30
allowedUses:
  - Code completion, refactoring and test generation in company repositories
  - Explaining unfamiliar code and generating documentation
  - Drafting commit messages and pull request descriptions
forbiddenData:
  - Secrets or production data pasted into the chat
  - Code from repositories under customer NDA unless the project lead approved it
tags: [ide, code, productivity]
---
Install the IDE extension from the internal software portal and sign in with SSO.

## Required settings

- Public-code matching filter: **on**.
- Telemetry sharing for model improvement: **off** (enforced by policy on managed laptops).

## Reviewing generated code

Generated code goes through the same review and CI as any other change. See [AI-assisted code review checklist](/library/ai-code-review-checklist/).
