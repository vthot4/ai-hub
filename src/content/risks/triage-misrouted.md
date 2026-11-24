---
title: Urgent tickets routed to the standard queue
summary: The pilot triage agent classified some outage reports as low urgency during a new product launch.
icon: 🎫
date: 2026-11-02
severity: medium
status: open
category: Reliability
tags: [agents, support]
---
## What happened

After a product launch, new wording in tickets confused the classifier and several outage reports reached the standard queue instead of the priority queue.

## Impact

Average first response for the affected tickets doubled for about six hours.

## Current actions

- Taxonomy and examples being updated (`labels.yml`).
- Support agents asked to flag misclassifications with the thumbs-down button.
- Decision pending: add a keyword override for outage terms.

## Lessons so far

Evaluate again after each launch or taxonomy change. See [evaluating agents](/library/evaluating-agents/).
