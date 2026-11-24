---
title: Suggested dependency did not exist (typosquat risk)
summary: An assistant proposed a package name that is not published; a lookalike with that name existed.
icon: 📦
date: 2026-10-03
severity: low
status: mitigated
category: Supply chain
tags: [code, dependencies]
---
## What happened

Generated code imported a package that does not exist under that name. A reviewer noticed a lookalike package with the same name on the public registry before it was installed.

## What we changed

- Added "verify new dependencies" to the [AI code review checklist](/library/ai-code-review-checklist/).
- CI now blocks packages not on the internal allow-list.

## Lessons

Assistants confidently suggest APIs and packages that do not exist. A human must check every new dependency.
