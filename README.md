# Snips AI Assignment

Full-stack application (backend in **Node.js + Express + TypeScript**, frontend in **Next.js + Tailwind**).
It fetches news from RSS/JSON feeds, enriches them with AI (OpenAI), and shows enriched news in the UI.

---

## Features

* **Backend**

    * Express 5 + TypeScript
    * Clean layered architecture with **Dependency Injection**
    * **Strategy pattern** for supporting multiple news sources (RSS, JSON Feed, extendable)
    * AI enrichment via OpenAI (pluggable, can be mocked in tests)
    * Caching layer for enrichment results
    * Graceful shutdown hooks
    * Logging via Winston
    * E2E tests with Vitest + Supertest + Nock

* **Frontend**

    * Next.js (React 18, App Router) + TailwindCSS
    * Professional UI for browsing news items
    * Filters, metadata, loading states
    * Responsive layout

---

## Project structure

```
snips-ai-assignment/
├── apps/
│   ├── backend/         # Express + TS backend
│   │   ├── src/
│   │   │   ├── api/     # controllers, routes
│   │   │   ├── services/
│   │   │   ├── domain/  # entities, ports, types
│   │   │   ├── infra/   # integrations (rss, json, cache, openai)
│   │   │   └── di/      # container, tokens
│   │   └── tests/       # e2e tests (Vitest + Supertest + Nock)
│   └── web/             # Next.js frontend
│       └── src/
├── docker-compose.yml   # run backend + frontend together
└── package.json         # root (npm workspaces)
```

---

## Local development

### Requirements

* Node.js 22+
* npm 10+

### Install dependencies

```
npm ci
```

### Run backend

```
npm run dev -w apps/backend
```

Backend is available at `http://localhost:3000`

### Run frontend

```
npm run dev -w apps/web
```

Frontend is available at `http://localhost:3001`

---

## Environment variables

Create `.env` in `apps/backend`:

```
PORT=3000
OPENAI_API_KEY=your-openai-key
```

Create `.env` in `apps/web`:

```
NEXT_PUBLIC_API_BASE=http://localhost:3000
```

---

## Run with Docker

### Build and run both services

```
docker compose up --build
```

* Backend: `http://localhost:3000`
* Frontend: `http://localhost:3001`

### Stop services

```
docker compose down
```

---

## Testing

Run e2e tests against the real backend app (external HTTP mocked):

```
npm run test:e2e
```

* **Supertest** makes requests to Express app
* **Nock** mocks external RSS/JSON feeds and OpenAI API

---

## Architecture notes

### Dependency Injection

* A simple DI container (`Container` in `src/di/container.ts`).
* All services/controllers are registered under tokens (`TOKENS`).
* Allows swapping implementations (e.g., `OpenAiEnrichment` → `NoopEnrichment` in tests).

### Strategy pattern

* For fetching news from different formats:

    * `RssSourceStrategyImpl` handles RSS/XML feeds
    * `JsonFeedSourceStrategyImpl` handles JSON Feed
* Both implement a common interface `NewsSourceStrategy`.
* `SourceResolver` picks the right strategy at runtime based on URL/content type.
* Adding a new feed type = just implement a new strategy.

### SOLID

* **S (Single Responsibility)**: each class has one clear job (e.g., `NewsService` orchestrates logic, `RssSourceStrategyImpl` only parses RSS).
* **O (Open/Closed)**: adding new feed formats does not require changes in `NewsService` (thanks to Strategy).
* **L (Liskov Substitution)**: all strategies implement the same interface → interchangeable.
* **I (Interface Segregation)**: ports are small and focused (`EnrichmentPort`, `CachePort`, etc.).
* **D (Dependency Inversion)**: high-level logic (`NewsService`) depends on abstractions (`NewsSourceStrategy`, `EnrichmentPort`) not on concrete classes.

---

## Development tips

* Backend logs every enrichment (cache hit/miss)
* Graceful shutdown closes HTTP server and disposes resources
* Frontend styles live in `globals.css` and Tailwind components
* Extend strategies easily (e.g., add `TwitterFeedSourceStrategyImpl`).

---

## Useful commands

```
# Lint backend
npm run lint -w apps/backend

# Format backend
npm run format -w apps/backend

# Build backend
npm run build -w apps/backend

# Build frontend
npm run build -w apps/web
```
