---
name: Enterprise Chat Assistant
summary: General-purpose chat assistant under the corporate agreement, with data retention and training disabled.
icon: 💬
status: approved
category: Assistants
vendor: Example Vendor
url: https://chat.example.org
owner: AI Platform Team
reviewedOn: 2026-09-15
allowedUses:
  - Drafting and editing text, emails and documentation
  - Summarising internal documents up to "Internal" classification
  - Brainstorming, translation and explaining code
  - Generating test data that contains no real records
forbiddenData:
  - Customer personal data
  - Credentials, API keys and secrets
  - Documents classified "Confidential" or above
tags: [assistant, chat, writing]
---
The enterprise workspace is the default choice for day-to-day work. Sign in with your corporate account (SSO); personal accounts are **not** covered by the agreement.

## What is covered

- Prompts and outputs are not used to train vendor models.
- Conversations are retained for 30 days for abuse monitoring only.
- Access is managed through SSO groups; request access from the AI Platform Team.

## Tips

- Treat answers as a draft: you remain responsible for accuracy. See [human review policy](/policies/human-review/).
- Use the shared prompt templates in the [library](/library/prompt-template-structure/).
