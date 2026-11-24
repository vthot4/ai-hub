---
title: Security Basics for Agents
summary: Least privilege, prompt injection and secret handling for anything that takes actions.
icon: 🔐
type: guide
category: Security
author: Information Security
publishedOn: 2026-10-10
tags: [security, agents, prompt-injection]
---
## Least privilege

Give an agent the narrowest permissions that work: read-only by default, scoped tokens, no production write access unless a human confirms each action.

## Prompt injection

Any text the agent reads (web pages, emails, tickets) can contain instructions. Treat it as untrusted input:

- Never let retrieved text change which tools the agent may call.
- Require human confirmation for sending, deleting or paying.
- Log every tool call with its arguments.

## Secrets

Keep keys in a secret manager, rotate them, and never put them in prompts or repositories.

## Report

Unexpected behaviour is an incident: follow the [incident reporting policy](/policies/incident-reporting/).
