---
title: API key pasted into an assistant prompt
summary: A developer pasted a configuration file containing a production key while debugging.
icon: 🔑
date: 2026-09-14
severity: medium
status: closed
category: Data leakage
tags: [secrets, prompts]
---
## What happened

While debugging a deployment, a developer pasted a configuration file into the enterprise assistant. The file contained a production API key.

## Impact

The key was inside the approved tool, where data is not used for training, but it left the secret manager. No misuse detected.

## What we changed

- Key rotated within one hour of the report.
- Added a secret-scanning pre-commit hook and a paste warning in the IDE extension.
- New line in the [Code Assistant page](/tools/code-assistant/): never paste secrets.

## Lessons

- Reporting quickly made rotation trivial. See [incident escalation](/flows/incident-escalation/).
- Make the safe path the easy path: tooling beats reminders.
