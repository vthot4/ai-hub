---
title: Meeting to Action Items Pipeline
summary: Automation flow that turns a transcript into minutes, tasks in your tracker and a channel summary.
icon: 🗒️
kind: automation
category: Productivity
owner: AI Platform Team
version: "0.6.0"
updatedOn: 2026-10-08
stack: [Meeting tool export, Meeting Notes Agent, Task tracker API, Chat webhook]
inputs:
  - Transcript file (.vtt or .txt) from the approved meeting tool
  - Team channel webhook URL
  - Task tracker project key
outputs:
  - Structured minutes posted to the channel
  - One task per action item with owner and due date
tags: [meetings, automation, tasks]
---
## Overview

Chains the [Meeting Notes Agent](/agents/meeting-notes-agent/) with your task tracker so action items do not live only in a chat message.

```mermaid
flowchart LR
  T[Transcript export] --> N[Meeting Notes Agent]
  N --> M[Minutes]
  N --> A[Action items]
  M --> C[Post to channel]
  A --> R{Human review}
  R -- approved --> K[Create tasks in tracker]
  R -- edited --> K
  R -- rejected --> X[Discard]
```

## Setup

1. Install the agent following its [Install tab](/agents/meeting-notes-agent/#install).
2. Create the webhook in your channel and export the variables:

```bash
export CHAT_WEBHOOK_URL="https://chat.example.org/hooks/xxxx"
export TRACKER_PROJECT="TEAM"
```

3. Run the pipeline after each meeting:

```bash
./meeting-to-actions.sh transcripts/standup.vtt
```

## Guardrails

- Tasks are created **only after a human approves** the list.
- Do not use it for HR, legal or customer-confidential meetings.
