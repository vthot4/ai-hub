# AI Hub

Internal hub for an organization's AI adoption:

| Section | What it holds | Where the data lives |
| --- | --- | --- |
| **Tools** | Approved / restricted / prohibited tools, allowed uses, data that must never be entered | `src/content/tools/*.md` |
| **Policies** | Versioned rules (acceptable use, data, review, incidents…) | `src/content/policies/*.md` |
| **Agents** | Catalogue with *Overview / Install / Use / Maintain* tabs per agent | `src/content/agents/*.md` |
| **Library** | Guides, templates and best practices | `src/content/library/*.md` |
| **Flows** | Step-by-step processes and reusable automation flows, with Mermaid diagrams | `src/content/flows/*.md` |
| **Start here** | First-week onboarding path per role | `src/content/onboarding/*.md` |
| **Challenges** | Board to request tools/agents/features, vote and comment | SQLite (`DATABASE_PATH`) |
| **Training** | Courses, workshops and paths with upcoming sessions (server-rendered, so dates are always current) | `src/content/training/*.md` |
| **FAQ** | "Can I use AI for…?" decision guide + questions | `src/content/decision-tree.json`, `src/content/faq/*.md` |
| **News** | Changelog of the hub, newest first | `src/content/news/*.md` |
| **Risks** | Anonymised incident and lessons-learned register | `src/content/risks/*.md` |
| **Metrics** | Adoption dashboard: active users, visits per section, challenge health | SQLite (`page_views`) |
| **Admin** | Change challenge status, moderate comments | `/admin/` (admin role only) |

> The Markdown content shipped in this repository is **sample content**. Replace it with your organization's real tools, policies and agents.

Stack: Astro 7 (Node adapter, content pages prerendered, `/api/*`, `/challenges/` and `/admin/` server-rendered), Preact islands, SQLite (`better-sqlite3`), Fuse.js search, Vitest.

## Develop

```bash
npm install
cp .env.example .env      # set ALLOW_DEV_USER=true for local work
npm run dev               # http://localhost:4321
npm run check             # type check
npm test                  # unit tests (data layer, auth, validation)
npm run build && npm start
```

## Edit content

Each entry is a Markdown file with front-matter validated by zod (`src/content.config.ts`); an invalid file fails the build with a precise message.

- **Tool**: `status` is `approved | restricted | prohibited`; list `allowedUses` and `forbiddenData`.
- **Agent**: write four `##` sections named **Overview**, **Install**, **Use**, **Maintain**. They become tabs (a plain page without JavaScript).
- **Flow**: `kind: process | automation`. Draw diagrams with a fenced ```` ```mermaid ```` block; they are rendered in the browser (and follow the light/dark theme). Automation flows also list `stack`, `inputs` and `outputs`.
- **Decision guide**: edit `src/content/decision-tree.json`. Each node is either a question with `options` (`next` = node id) or a `result` (`yes | conditions | no`). Tests check that every `next` exists, there are no cycles and no unreachable nodes.
- **Training**: `sessions` is a list of `YYYY-MM-DD` dates; past ones are struck through and only upcoming ones appear on `/training/`.
- Internal links are plain paths, e.g. `/policies/human-review/`; `npm test` fails if one points to a page that does not exist (including `/faq/#anchor`).

Open a pull request to change content; CI runs `check`, `test` and `build`.

## Authentication model

The hub does **not** implement login. Put it behind a proxy that authenticates users (oauth2-proxy, Cloudflare Access, Authelia, an ingress with SSO…) and forwards the user's email in a header.

| Variable | Meaning |
| --- | --- |
| `TRUST_PROXY_AUTH=true` | Trust the identity header. **Only enable if the app is unreachable except through the proxy**; otherwise anyone can forge the header and become admin. |
| `AUTH_EMAIL_HEADER` | Header carrying the email (default `x-forwarded-email`). |
| `ADMIN_EMAILS` | Comma-separated admin emails. |
| `ALLOW_DEV_USER=true` | Local development only: every request is `DEV_USER_EMAIL`. Never use on a reachable server. |

With neither option enabled, the challenge board and admin return `401` and the API rejects every call. Content pages are static and carry no user data; if they must be private too, enforce that at the proxy.

Security notes:
- Mutating API calls require `Content-Type: application/json` (or the `X-Requested-With: ai-hub` header for body-less calls), which forces a CORS preflight on cross-site requests (CSRF defence).
- Input is validated with zod; the UI renders text escaped; submissions are rate-limited per user **in memory**, so run a single instance (SQLite is single-writer anyway).
- Terminate TLS at the proxy.

## Usage metrics and privacy

Each page load sends a beacon to `/api/track/` (only for authenticated users) that increments a counter per day, section and user. The user is stored as a salted SHA-256 hash (salt generated once in the database), never as an email, so the dashboard can count distinct users without identifying anyone. Only the section is recorded, not the full URL. Delete the `page_views` table to reset the figures.

## Deploy with Docker

```bash
cp .env.example .env      # TRUST_PROXY_AUTH=true, ADMIN_EMAILS=you@example.org
docker compose up -d --build
```

The image listens on port `4321` and stores the database in the `hub-data` volume (`/data/hub.db`). Back it up with the usual volume tools, or copy the file while the app is idle (SQLite runs in WAL mode: copy `hub.db*`). Migrations run automatically at start-up (`src/lib/migrations.ts`, tracked with `PRAGMA user_version`; add new ones at the end, never edit published ones).

## Layout

```
src/content/        Markdown + front-matter (tools, policies, agents, library)
src/content.config.ts   zod schemas
src/pages/          routes; pages/api/* are the board's JSON API
src/islands/        Preact: CatalogBrowser, Search, DecisionTree, ChallengeBoard, AdminPanel
src/lib/            db, migrations, repo (challenges), metrics, auth, validation, rate limit
tests/              Vitest
```
