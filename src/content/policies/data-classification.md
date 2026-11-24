---
title: Data Classification for AI
summary: Which classes of data can be used with which categories of AI tool.
icon: 🗂️
category: Data
version: "1.4"
effectiveFrom: 2026-06-01
owner: Information Security
order: 2
tags: [data, classification]
---
| Classification | Approved cloud tools | Self-hosted models | Examples |
| --- | --- | --- | --- |
| Public | Yes | Yes | Published web content, press releases |
| Internal | Yes | Yes | Meeting notes, internal process docs |
| Confidential | No | With approval | Contracts, financial forecasts, source code under NDA |
| Restricted | No | No | Customer personal data, credentials, health data |

## Rules of thumb

- When unsure, treat the data as one level higher.
- Anonymise before use: removing a name is not anonymisation if the rest identifies the person.
- Never paste secrets into a prompt, even in an approved tool.
