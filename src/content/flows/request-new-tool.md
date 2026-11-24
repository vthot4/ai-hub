---
title: Request a New AI Tool
summary: How a tool goes from a request to an approved, restricted or prohibited entry in the catalogue.
icon: 🧰
kind: process
category: Governance
owner: AI Platform Team
version: "1.2"
updatedOn: 2026-10-14
tags: [approval, tools, governance]
---
## Overview

Anyone can propose a tool. The AI Platform Team coordinates the review with Information Security and Legal. The target is a decision within **15 working days**.

```mermaid
flowchart TD
  A[Employee opens a Tool request<br/>on the challenge board] --> B{Already in<br/>the catalogue?}
  B -- Yes --> C[Point to the existing entry<br/>and close the request]
  B -- No --> D[AI Platform Team triages]
  D --> E[Security review<br/>data flows, retention, training]
  D --> F[Legal review<br/>contract, IP, location of data]
  E --> G{Both pass?}
  F --> G
  G -- No --> H[Status: Prohibited<br/>reasons published]
  G -- With limits --> I[Status: Restricted<br/>conditions and owner]
  G -- Yes --> J[Status: Approved<br/>licences and onboarding]
  H --> K[Requester notified]
  I --> K
  J --> K
```

## Who does what

| Step | Owner | Output |
| --- | --- | --- |
| Submit request | Requester | Use case, data involved, expected users |
| Triage | AI Platform Team | Duplicate check, priority |
| Security review | Information Security | Data-flow assessment |
| Legal review | Legal | Contract and licence terms |
| Publish | AI Platform Team | Catalogue entry and news item |

## Tips for a fast decision

- State the **data classification** you expect to use ([data classification](/policies/data-classification/)).
- Describe the problem, not only the product.
- Rally votes: the board orders requests by votes.
