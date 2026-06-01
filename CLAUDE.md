# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog/portfolio (SJ's Blog) — a full-stack app with a **FastAPI backend** (Python 3.11+) and a **Next.js 16 frontend** (TypeScript, App Router), backed by **PostgreSQL 16** and **Redis 7**.

## Development Commands

### Infrastructure (Docker)
```bash
docker-compose up -d          # Start PostgreSQL & Redis
docker-compose down           # Stop infrastructure
```

### Backend (`backend/`)
```bash
cd backend
uv pip install -r pyproject.toml   # Install Python deps (or: pip install -e .)
uvicorn main:app --reload          # Dev server on :8000
uvicorn main:app --host 0.0.0.0 --port 8000  # Production
alembic upgrade head               # Run migrations
```

### Frontend (`frontend/`)
```bash
cd frontend
npm install                   # Install dependencies
npm run dev                   # Dev server on :3000
npm run build                 # Production build
npm run start                 # Start production server
npm run lint                  # ESLint
```

### Content Sync
```bash
cd scripts
python sync_posts.py           # Sync Markdown → API (real run)
python sync_posts.py --dry-run # Preview only, no writes
```

## Architecture

```
Markdown (E:/backend_database) ──sync_posts.py──▶ FastAPI :8000 ──REST──▶ Next.js :3000
                                                    │                        │
                                              PostgreSQL 16            Bilibili API
                                                   Redis 7             GitHub API
```

### Backend: 3-layer REST API

| Layer | Location | Purpose |
|---|---|---|
| **Routers** | `backend/routers/` | HTTP handlers, route registration |
| **Schemas** | `backend/schemas/` | Pydantic request/response validation |
| **Models** | `backend/models/` | SQLAlchemy ORM models (declarative `Base`) |

- **`backend/main.py`** — FastAPI app entry, CORS middleware, route registration
- **`backend/core/config.py`** — `pydantic-settings` reads `.env` (DATABASE_URL, SECRET_KEY, etc.)
- **`backend/core/database.py`** — SQLAlchemy engine, `SessionLocal`, `Base`, `get_db` generator
- **`backend/core/security.py`** — bcrypt password hashing, dual JWT token creation (access 30min + refresh 7day)
- **`backend/core/deps.py`** — FastAPI dependency injection: `get_current_user` (reads HttpOnly cookie → decodes JWT → queries DB), `get_current_admin` (extends with `is_admin` check)

**API endpoints:**

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | — | Health check |
| GET | `/posts/` | — | List published posts |
| GET | `/posts/{slug}` | — | Get post by slug |
| POST | `/posts/` | Admin | Create post |
| PUT | `/posts/{slug}` | Admin | Partial update post |
| DELETE | `/posts/{slug}` | Admin | Delete post |
| POST | `/auth/register` | — | Register user |
| POST | `/auth/login` | — | Login → sets dual HttpOnly cookies |
| POST | `/auth/refresh` | — | Rotate access_token from refresh_token cookie |
| GET | `/auth/me` | User | Get current user info |

### Frontend: Next.js 16 App Router

- **Server Components by default** — pages are async functions that fetch data server-side
- **Client Components** where interactivity needed (animations via Framer Motion, interactive grids, typewriter effects)
- **`frontend/src/lib/api.ts`** — server-to-server fetch to FastAPI backend (hardcoded to `localhost:8000`); uses `cache: "no-store"` for fresh data
- **`frontend/src/lib/bilibili.ts`** — fetches video stats from Bilibili public API for hardcoded BVIDs
- **`frontend/src/lib/github.ts`** — fetches repos from GitHub API for user `sjyinzju`
- **`frontend/src/lib/config.ts`** — bidirectional tag↔route mapping (e.g., `"笔记"` ↔ `"notes"`, `"视频"` ↔ `"videos"`)

**Routing:**
- `/` — Homepage (hero + post list)
- `/[category]` — Category listing page (notes, thoughts, videos, projects, inspiration, resources, about)
- `/[category]/[slug]` — Article detail page (dynamic route, `force-dynamic`)

### Content Workflow (Local-First CMS)

Content lives as Markdown files with YAML frontmatter in `E:/backend_database/<category>/`. The `scripts/sync_posts.py` script:
1. Reads all `.md` files from category subfolders
2. Parses YAML frontmatter (title, slug, summary, tags, date, is_published)
3. Authenticates as admin via `POST /auth/login`
4. Uploads new posts via `POST /posts/` (skips posts whose slug already exists)
5. Automatically injects a category tag based on the parent folder name

### Database

Two tables managed by Alembic migrations (`backend/alembic/versions/`):
- **`posts`** — id, title, slug (unique), content (markdown), summary, tags (PostgreSQL ARRAY), is_published, created_at
- **`users`** — id, email (unique), username (unique), hashed_password (bcrypt), avatar, bio, website, created_at, last_login_at, is_admin, is_active

## Key Conventions

- **⚠️ Next.js 16** — this version has breaking changes from earlier Next.js. Read `frontend/node_modules/next/dist/docs/` before writing page/route code. Heed deprecation notices.
- **TypeScript strict mode** — no `any` types. Define interfaces for all API data shapes.
- **Server-first data fetching** — pages fetch data at the server level (async components), not via client-side `useEffect`.
- **CSS: Tailwind v4** — uses `@tailwindcss/postcss` plugin (not the v3 PostCSS config style). The `@tailwindcss/typography` plugin provides `.prose` classes for article content.
- **Styling approach** — semantic HTML, Flex/Grid layouts, Tailwind utilities. Framer Motion only for micro-interactions — keep it restrained.
- **Auth flow** — dual JWT in HttpOnly cookies (not localStorage). Backend sets cookies; frontend doesn't manage auth tokens directly. Admin-only write endpoints use `get_current_admin` dependency.
- **Backend uses `uv`** for Python package management (has `uv.lock`). New deps should be added with `uv add` or manually in `pyproject.toml`.
- **No test suite exists** — neither frontend nor backend has tests yet.
- **No CI/CD** — deployment is manual. Infrastructure (DB, Redis) is Dockerized but the apps run on bare metal / VPS.
