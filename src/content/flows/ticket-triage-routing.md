---
title: Ticket Triage and Routing Flow
summary: Automation flow that labels incoming tickets, drafts a reply and routes to the right queue.
icon: 🎫
kind: automation
category: Customer support
owner: Customer Operations
version: "0.3.1"
updatedOn: 2026-09-25
stack: [Ticketing webhook, Support Triage Agent, Queue router]
inputs:
  - New-ticket webhook payload
  - Label taxonomy (labels.yml)
outputs:
  - Category, urgency and language labels
  - Draft reply for a support agent
  - Assignment to a queue
tags: [support, routing, classification]
---
## Overview

Experimental flow used by pilot teams only. It never sends a reply by itself.

```mermaid
flowchart TD
  W[Ticket created] --> M[Mask emails and phone numbers]
  M --> C[Triage Agent classifies]
  C --> U{Urgency high?}
  U -- Yes --> Q1[Priority queue + page on-call]
  U -- No --> Q2[Standard queue]
  C --> D[Draft reply]
  D --> H[Support agent reviews and sends]
  Q1 --> H
  Q2 --> H
```

## Notes

- Restricted data must not enter the flow; masking is a safety net, not a licence to send it.
- Review the weekly misclassification report and update `labels.yml`.
