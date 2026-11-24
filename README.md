# AI Hub

Internal hub for an organization's AI adoption:

| Section | What it holds | Where the data lives |
| --- | --- | --- |
| **Tools** | Approved / restricted / prohibited tools, allowed uses, data that must never be entered | `src/content/tools/*.md` |
| **Policies** | Versioned rules (acceptable use, data, review, incidents…) | `src/content/policies/*.md` |
| **Agents** | Catalogue with *Overview / Install / Use / Maintain* tabs per agent | `src/content/agents/*.md` |
| **Library** | Guides, templates and best practices | `src/content/library/*.md` |
| **Challenges** | Board to request tools/agents/features, vote and comment | SQLite (`DATABASE_PATH`) |
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
- Internal links are plain paths, e.g. `/policies/human-review/`.

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
src/islands/        Preact: CatalogBrowser, Search, ChallengeBoard, AdminPanel
src/lib/            db, migrations, repo (queries), auth, validation, rate limit
tests/              Vitest
```
