# Architecture

## System Overview

StadiumSense AI is a full-stack enterprise SaaS application built as a pnpm monorepo. It follows a contract-first, layered architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Vite/React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐   │
│  │Dashboard │  │ Copilot  │  │  Crowd   │  │  Incidents    │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬────────┘   │
│       │              │              │               │            │
│  Generated React Query hooks (@workspace/api-client-react)       │
└───────┼──────────────┼──────────────┼───────────────┼───────────┘
        │              │              │               │
        ▼              ▼              ▼               ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Express API Server (/api/*)                      │
│  ┌────────────┐  ┌────────────────┐  ┌─────────────────────┐    │
│  │ AI Routes  │  │ Crowd Routes   │  │  Incident Routes    │    │
│  │ /ai/*      │  │ /crowd/gates   │  │  /incidents CRUD    │    │
│  └─────┬──────┘  └───────┬────────┘  └──────────┬──────────┘    │
│        │                 │                       │               │
│  ┌─────▼──────┐  ┌───────▼────────┐  ┌──────────▼──────────┐    │
│  │ Groq SDK   │  │ Crowd Sim      │  │   Drizzle ORM       │    │
│  │ (server)   │  │ (in-memory)    │  │   PostgreSQL        │    │
│  └────────────┘  └────────────────┘  └─────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Monorepo Structure

```
stadium-sense/
├── artifacts/
│   ├── api-server/              # Node.js Express backend
│   │   └── src/
│   │       ├── app.ts           # Express app (helmet, CORS, middleware)
│   │       ├── index.ts         # Server entry point + PORT binding
│   │       ├── lib/
│   │       │   ├── crowdData.ts # Deterministic crowd simulation
│   │       │   ├── groq.ts      # Groq client with key rotation
│   │       │   ├── logger.ts    # Pino structured logger
│   │       │   └── rateLimiter.ts
│   │       └── routes/
│   │           ├── ai.ts        # 6 AI endpoints
│   │           ├── crowd.ts     # Gate data endpoint
│   │           ├── health.ts    # Health check
│   │           ├── incidents.ts # CRUD incidents
│   │           └── index.ts     # Router composition
│   └── stadium-sense/           # React + Vite frontend
│       └── src/
│           ├── components/      # Shared UI components + ErrorBoundary
│           ├── features/        # Feature-sliced modules
│           │   ├── accessibility/
│           │   ├── copilot/
│           │   ├── crowd/
│           │   ├── incidents/
│           │   ├── multilingual/
│           │   ├── navigation/
│           │   └── transportation/
│           ├── hooks/           # Shared custom hooks
│           ├── lib/             # Utilities
│           ├── pages/           # Route-level components
│           └── tests/           # Vitest unit tests
├── lib/
│   ├── api-spec/                # OpenAPI 3.1 YAML (source of truth)
│   ├── api-client-react/        # Generated React Query hooks
│   ├── api-zod/                 # Generated Zod validation schemas
│   └── db/                      # Drizzle schema + PostgreSQL client
└── docs/                        # Extended documentation
```

## Key Design Decisions

### 1. Contract-First API Design

The OpenAPI spec (`lib/api-spec/openapi.yaml`) is the authoritative source of truth. Client hooks and Zod server schemas are generated from it via Orval/codegen — never hand-written. This eliminates client-server type drift.

### 2. AI on the Server Only

All Groq API calls are made exclusively from the Express backend. The API key is never injected into the Vite bundle. The frontend only knows about the `/api/ai/*` endpoints.

### 3. Dual-Key Rotation

Two Groq API keys (`GROQ_API_KEY` + `GROQ_API_KEY_2`) are supported. The `requireGroq()` function round-robins between them, effectively doubling the rate limit available to the application.

### 4. Simulated Crowd Data

Crowd density is computed deterministically from `Date.now()` rounded to 30-second windows. No database or WebSocket is required for live-feeling crowd data in development/demo. The formula introduces ±10% jitter per gate so figures update on each 30 s tick.

### 5. Feature-Sliced Frontend

Each domain (copilot, crowd, incidents, etc.) is a self-contained directory under `features/`. Pages under `pages/` are thin route shells that compose feature components. All code-split via `React.lazy`.

## Data Flow: AI Request

```
User action (e.g. "Run Crowd Analysis")
  → React Query mutation (generated hook)
  → POST /api/ai/crowd-analysis
  → Zod validation (AiCrowdAnalysisBody)
  → Rate limiter check (30 req/min)
  → chatCompletion() → Groq llama-3.3-70b-versatile
  → safeParseJson() → typed response
  → React state update → UI re-render
```

## Data Flow: Incident Lifecycle

```
Operator submits form
  → POST /api/incidents (rate-limited: 10/min)
  → Zod validation
  → INSERT into PostgreSQL via Drizzle
  → Operator clicks "AI Prioritize"
  → POST /api/ai/incident-priority
  → Groq suggests P1–P4 + recommendation
  → PATCH /api/incidents/:id (saves aiPriority + aiRecommendation)
  → React Query cache invalidated → list refreshes
```
