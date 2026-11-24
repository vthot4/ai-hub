---
title: How to Evaluate an Agent Before Rollout
summary: A lightweight evaluation routine to measure quality, cost and failure modes.
icon: 📊
type: guide
category: Evaluation
author: AI Platform Team
publishedOn: 2026-09-28
tags: [evaluation, agents, testing]
---
## 1. Build a small test set

Collect 20–50 real, anonymised inputs with the answer you would accept. Include hard and adversarial cases.

## 2. Define pass criteria

Choose measurable criteria: correct label, no hallucinated fact, response under *N* seconds, cost per task below a budget.

## 3. Run, compare, record

Run the agent on the full set every time you change the prompt, model or tools. Keep results in a table so regressions are visible.

## 4. Pilot before rollout

Release to one team, collect feedback for two weeks and review the failure reports before widening access.

## 5. Monitor

Track usage, error rate and user corrections after launch. A rising correction rate means drift.
