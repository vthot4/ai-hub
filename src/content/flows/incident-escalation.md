---
title: AI Incident Escalation
summary: What to do, and who gets involved, when an AI tool or agent leaks data or misbehaves.
icon: 🚨
kind: process
category: Security
owner: Information Security
version: "1.1"
updatedOn: 2026-09-20
tags: [incident, security, escalation]
---
## Overview

Early reports beat late ones, and reporting is blameless. Follow the [incident reporting policy](/policies/incident-reporting/) for the full rules.

```mermaid
sequenceDiagram
  participant U as You
  participant S as Information Security
  participant O as Tool/agent owner
  participant L as Legal
  U->>U: Stop using the tool for the task
  U->>S: Report within 24 h (tool, time, data)
  S->>S: Classify severity
  S->>O: Contain: revoke token or disable agent
  alt personal or customer data involved
    S->>L: Assess notification duties
  end
  S->>U: Confirm and ask for evidence
  S->>S: Post-incident review
  S-->>U: Lessons published (anonymised) in Risks
```

## Severity guide

| Severity | Examples | Target response |
| --- | --- | --- |
| High | Restricted data left the network, agent took destructive action | 1 hour |
| Medium | Confidential data in an unapproved tool | 1 working day |
| Low | Harmless wrong output, no data involved | 3 working days |
