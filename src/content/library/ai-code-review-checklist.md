---
title: AI-assisted Code Review Checklist
summary: What to verify before merging code that was generated or suggested by an assistant.
icon: ☑️
type: best-practice
category: Engineering
author: Engineering Productivity
publishedOn: 2026-09-05
tags: [code, review, quality]
---
Before approving a change that includes AI-generated code, confirm that:

- [ ] The author can explain every line.
- [ ] Tests exist, fail without the change and pass with it.
- [ ] Dependencies suggested by the assistant exist, are maintained and are licence-compatible.
- [ ] No secrets, internal URLs or customer data appear in code, tests or comments.
- [ ] Error handling and edge cases are real, not placeholder.
- [ ] The change follows the project conventions instead of a generic pattern.

> Assistants confidently suggest APIs that do not exist. If the code calls something you do not recognise, look it up.
