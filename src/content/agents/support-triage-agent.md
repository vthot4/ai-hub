---
name: Support Triage Agent
summary: Classifies incoming support tickets, suggests priority and drafts a first reply for an agent to review.
icon: 🎫
status: experimental
category: Customer support
tech: [Node.js, Webhooks, LLM API]
version: "0.3.0"
owner: Customer Operations
repo: https://git.example.org/ai/support-triage-agent
updatedOn: 2026-09-18
tags: [support, classification]
---
## Overview

Receives new tickets through a webhook, adds labels (category, urgency, language) and drafts a reply. A human support agent always reviews and sends the answer.

> Experimental: only pilot teams approved by Customer Operations may use it, and it must not process Restricted data. Ticket content is masked for emails and phone numbers before it reaches the model.

## Install

1. Contact Customer Operations to join the pilot.
2. Deploy the container from the internal registry and point your ticketing webhook at it:

```bash
docker run -d --name triage -p 8080:8080 --env-file triage.env \
  registry.example.org/ai/support-triage-agent:0.3.0
```

3. Send a test ticket and check the labels appear.

## Use

- Review the suggested labels in the ticket sidebar and correct them if wrong.
- Edit the draft reply: never send it unchanged for sensitive cases.
- Use the thumbs-down button to report bad suggestions.

## Maintain

- Weekly: review the misclassification report sent to the owner.
- Update the label list in `labels.yml` when your taxonomy changes, then restart the container.
- Report incidents following the [incident reporting policy](/policies/incident-reporting/).
