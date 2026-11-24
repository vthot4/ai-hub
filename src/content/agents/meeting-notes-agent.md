---
name: Meeting Notes Agent
summary: Turns a meeting transcript into minutes, decisions and an action list posted to your team channel.
icon: 📝
status: beta
category: Productivity
tech: [Python, Docker, Chat webhook]
version: "0.8.2"
owner: AI Platform Team
repo: https://git.example.org/ai/meeting-notes-agent
updatedOn: 2026-10-02
tags: [meetings, summaries, chat]
---
## Overview

Give the agent a transcript from the approved meeting tool and it produces structured minutes: summary, decisions, open questions and action items with owners.

**Good for:** recurring team meetings and workshops up to *Internal* classification.
**Not for:** HR, legal or customer-confidential meetings. Do not enable it where participants have not been told it is running.

## Install

Requirements: Docker 24+, access to the internal container registry and a chat webhook URL.

```bash
docker pull registry.example.org/ai/meeting-notes-agent:0.8.2
cp .env.example .env   # fill GATEWAY_URL, GATEWAY_TOKEN and CHAT_WEBHOOK_URL
docker run --rm --env-file .env -v "$PWD/transcripts:/in" \
  registry.example.org/ai/meeting-notes-agent:0.8.2 /in/standup.vtt
```

Request a gateway token from the AI Platform Team first.

## Use

1. Export the transcript (`.vtt` or `.txt`) after the meeting.
2. Run the container pointing to the file; minutes are posted to the configured channel.
3. Review the minutes and fix mistakes **before** sharing them beyond your team.

Useful flags: `--lang es` to force the output language, `--template short` for a five-line summary.

## Maintain

- **Updates:** `docker pull` a new tag and re-run; read the release notes because beta versions can change the output format.
- **Owner:** AI Platform Team (`#ai-platform`).
- **Privacy:** transcripts are processed in memory and deleted after the run; verify with `--dry-run` which fields are sent.
- **Known limits:** speaker attribution is poor with more than eight participants.
