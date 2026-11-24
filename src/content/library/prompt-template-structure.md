---
title: A Reusable Prompt Template
summary: A simple structure that makes prompts predictable and easy to share across the team.
icon: 🧩
type: template
category: Prompting
author: AI Platform Team
publishedOn: 2026-08-12
tags: [prompting, template]
---
Good prompts state **role, context, task, constraints and output format**. Copy and adapt:

```text
Role: You are a technical writer for {audience}.
Context: {paste the relevant, non-sensitive context}
Task: {what you want, in one sentence}
Constraints:
- Max {n} words, plain language
- Do not invent facts; say "unknown" when unsure
Output format: {bullet list | table | JSON schema}
```

## Tips

- Give one example of the output you want; it beats a paragraph of description.
- Ask the model to list its assumptions.
- Iterate: change one thing at a time and keep the versions that work.
- Never include data above the allowed classification: see [data classification](/policies/data-classification/).
