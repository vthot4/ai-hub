---
title: Publish an Agent in the Catalogue
summary: Steps and quality gates for a team that wants its agent listed with install, usage and maintenance guides.
icon: 🤖
kind: process
category: Delivery
owner: AI Platform Team
version: "1.0"
updatedOn: 2026-10-01
tags: [agents, publishing, quality]
---
## Overview

An agent is listed once it has an owner, documentation and an evaluation. Use the [evaluation guide](/library/evaluating-agents/) before you start.

```mermaid
flowchart LR
  A[Build and test<br/>in your team] --> B[Evaluate<br/>20-50 real cases]
  B --> C{Meets<br/>criteria?}
  C -- No --> A
  C -- Yes --> D[Security check<br/>permissions, secrets, injection]
  D --> E[Write the entry<br/>Overview, Install, Use, Maintain]
  E --> F[Pull request to the hub]
  F --> G[Review by AI Platform Team]
  G --> H[Listed as Experimental or Beta]
  H --> I[Pilot with one team<br/>2 weeks]
  I --> J[Promote to Stable]
```

## Checklist before the pull request

- [ ] Named owner and support channel
- [ ] Evaluation results attached
- [ ] Least-privilege permissions documented
- [ ] Data it sees and stores described
- [ ] Rollback or retirement steps written
