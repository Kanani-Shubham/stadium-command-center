# StadiumSense AI

> **Enterprise-grade AI command center for FIFA World Cup 2026 stadium operations.**
> Built for the Hack2Skill "Smart Stadiums & Tournament Operations" challenge.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Groq](https://img.shields.io/badge/Groq-llama--3.3--70b-orange)](https://console.groq.com)
[![Vitest](https://img.shields.io/badge/Tests-24%20passing-brightgreen?logo=vitest)](https://vitest.dev)
[![WCAG](https://img.shields.io/badge/WCAG-2.1%20AA-blue)](https://www.w3.org/WAI/WCAG21/quickref/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Solution Overview](#solution-overview)
3. [Challenge Alignment](#challenge-alignment)
4. [Architecture](#architecture)
5. [AI Design](#ai-design)
6. [Technology Stack](#technology-stack)
7. [Features](#features)
8. [Folder Structure](#folder-structure)
9. [Getting Started](#getting-started)
10. [Environment Variables](#environment-variables)
11. [API Reference](#api-reference)
12. [Testing](#testing)
13. [Accessibility](#accessibility)
14. [Security](#security)
15. [Performance](#performance)
16. [Documentation](#documentation)
17. [Future Improvements](#future-improvements)

---

## Problem Statement

FIFA World Cup 2026 will host **104 matches across 16 venues** in the USA, Canada, and Mexico — attracting **5+ million fans**. Stadium operators face unprecedented operational complexity:

- **Crowd surges** at gates causing dangerous bottlenecks
- **Language barriers** with fans from 200+ countries
- **Transportation overload** during post-match egress
- **Incident response delays** due to manual triage processes
- **Sustainability targets** (FIFA's net-zero commitment)
- **Accessibility requirements** for 85,000+ capacity stadiums

Current tools are siloed, reactive, and language-limited. Operators need a **unified AI platform** that predicts problems before they occur, communicates in any language, and guides rapid response.

---

## Solution Overview

StadiumSense AI is a real-time operations dashboard that gives stadium command centers a single pane of glass across all critical domains:

```
Live Crowd Data → AI Analysis → Operator Decision → Action
```

Seven AI-powered modules, each backed by **Groq's llama-3.3-70b-versatile** (sub-second inference), replace six separate manual workflows with one unified platform.

---

## Challenge Alignment

| Challenge Criterion | How StadiumSense AI Addresses It |
|--------------------|---------------------------------|
| **Smart Navigation** | AI Copilot + Navigation module answer any wayfinding query in 6 languages with step-by-step directions and estimated walk times |
| **Crowd Management** | Live 12-gate density heatmap auto-refreshes every 30 s; AI crowd-analysis predicts congestion 15 min ahead and generates P1–P5 risk levels |
| **Accessibility** | WCAG 2.1 AA throughout; Accessibility Center with high-contrast mode, font scaling (14–20 px), reduced motion; full keyboard navigation; ARIA on all components |
| **Transportation** | Transportation module shows real-time modal load bars; AI recommends staggered egress, overflow routes, and sustainability actions |
| **Sustainability** | Sustainability metrics tracked against FIFA net-zero targets; AI generates per-match carbon summaries and efficiency scores |
| **Multilingual Assistance** | Translate module supports English, Hindi, Spanish, French, Arabic, Portuguese; Navigation responds in the fan's language |
| **Operational Intelligence** | AI Copilot provides conversational ops support; Incident Manager auto-assigns P1–P4 priority with nearest-response recommendations |
| **Real-Time Decision Support** | Dashboard aggregates live KPIs (occupancy, incidents, transport load, sustainability score); all data auto-refreshes |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Browser (React + Vite)                        │
│  Dashboard │ Copilot │ Crowd │ Navigation │ Incidents │ …        │
│            Generated React Query hooks                           │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTPS /api/*
┌───────────────────────────────▼─────────────────────────────────┐
│              Express API Server (Node.js / ESM)                  │
│  Helmet · CORS · Pino · Zod validation · Rate limiting           │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────────────────┐  │
│  │  AI Routes │  │ Crowd Routes │  │  Incident Routes (CRUD) │  │
│  │  /ai/*     │  │ /crowd/gates │  │  /incidents             │  │
│  └─────┬──────┘  └──────┬───────┘  └────────────┬────────────┘  │
│        │                │                        │               │
│  ┌─────▼──────┐  ┌──────▼───────┐  ┌────────────▼────────────┐  │
│  │ Groq SDK   │  │  Crowd Sim   │  │   Drizzle ORM           │  │
│  │ Key rotate │  │  (30 s seed) │  │   PostgreSQL            │  │
│  └────────────┘  └──────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Contract-first:** `lib/api-spec/openapi.yaml` is the single source of truth. Client hooks and Zod schemas are generated — never hand-written.

### Data Flow — AI Request

```
User action → React Query mutation → POST /api/ai/{endpoint}
  → Zod validate → Rate check → Groq llama-3.3-70b-versatile
  → safeParseJson() → typed JSON response → UI update
```

---

## AI Design

### Model
**Groq `llama-3.3-70b-versatile`** — chosen for sub-second inference latency critical in live stadium operations.

### Key Features
- **Dual-key rotation** — two API keys round-robin per request, doubling effective rate limit
- **Server-side only** — API keys never reach the client bundle
- **Structured JSON responses** — every endpoint requests pure JSON; `safeParseJson()` provides typed fallbacks on malformed output
- **Context-enriched prompts** — real operational data (gate densities, attendance, match phase) injected into every prompt to ground responses

### Endpoints

| Endpoint | Persona | Max Tokens |
|----------|---------|-----------|
| `POST /api/ai/copilot` | Senior ops commander | 800 |
| `POST /api/ai/crowd-analysis` | Crowd safety engineer | 600 |
| `POST /api/ai/navigation` | Multilingual fan guide | 500 |
| `POST /api/ai/translate` | Professional interpreter | 400 |
| `POST /api/ai/transportation-recommendation` | Mobility advisor | 500 |
| `POST /api/ai/incident-priority` | Emergency coordinator | 400 |

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 + Vite 7 | SPA with HMR |
| **UI Components** | Radix UI + shadcn/ui + Tailwind CSS | Accessible component primitives |
| **Routing** | Wouter | Lightweight client-side routing |
| **Data Fetching** | TanStack React Query v5 | Caching, refetch, mutations |
| **Backend** | Express 5 + Node.js 20 (ESM) | REST API |
| **AI** | Groq SDK — llama-3.3-70b-versatile | All AI features |
| **Validation** | Zod (generated from OpenAPI) | Request/response type safety |
| **ORM** | Drizzle ORM | Type-safe PostgreSQL queries |
| **Database** | PostgreSQL | Incident persistence |
| **Logging** | Pino + pino-http | Structured JSON logging |
| **Security** | Helmet + express-rate-limit | HTTP headers + rate limiting |
| **Testing** | Vitest + @vitest/coverage-v8 | Unit tests + coverage |
| **Build** | esbuild (API) + Vite (frontend) | Fast production builds |
| **Package manager** | pnpm workspaces | Monorepo management |
| **Language** | TypeScript 5 (strict) | End-to-end type safety |

---

## Features

### 🏟️ Operations Dashboard
Real-time KPI cards showing stadium occupancy, active incidents, transport load, and sustainability score. Pulls live data with 30-second auto-refresh.

### 🤖 AI Copilot
Conversational operations assistant with full chat history. Ask anything about crowd management, safety protocols, or logistics. Maintains up to 10 messages of context per session.

### 👥 Crowd Intelligence
Live density heatmap across 12 gates grouped by stadium section (North, South, East, West, VIP, Press, Accessibility, Staff). Each gate card shows:
- Density percentage with visual fill bar
- Wait time with color-coded progress bar
- Status indicator (open / congested / critical / closed)

One-click AI analysis generates a risk level (low / medium / high / critical), 15-minute crowd flow prediction, and 3–5 specific operator recommendations.

### 🗺️ Smart Navigation
Natural-language wayfinding in any supported language. Fans or operators describe what they're looking for; the AI returns step-by-step walking directions with estimated walk times.

### 🌍 Multilingual Assistant
Side-by-side translation panel supporting English, Hindi, Spanish, French, Arabic, and Portuguese. Detects source language automatically. Ideal for fan-facing information kiosks and announcements.

### ♿ Accessibility Center
Persistent user-controlled settings:
- **High Contrast Mode** — increases contrast for low-vision users
- **Font Size** — scales 14 px → 16 px → 18 px → 20 px
- **Reduce Motion** — disables CSS animations for motion-sensitive users
- **Keyboard shortcuts reference** card

### 🚌 Transportation & Sustainability
Transport modal load bars (Metro, Bus, Train) with predicted peak times. AI generates staggered-exit recommendations and sustainability efficiency summaries against FIFA net-zero targets.

### 🚨 Incident Management
Full CRUD incident workflow:
1. Report incident (location, description, severity)
2. AI auto-assigns priority P1–P4 with nearest-response-unit recommendation
3. Update status (open → in-progress → resolved)
4. Filter by severity, status, and AI priority

---

## Folder Structure

```
stadium-sense/
├── .github/
│   └── workflows/
│       └── ci.yml                 # TypeScript + test + format CI
├── .vscode/
│   ├── settings.json              # Editor configuration
│   └── extensions.json            # Recommended extensions
├── artifacts/
│   ├── api-server/                # Express + Groq backend
│   │   └── src/
│   │       ├── app.ts             # Express app (Helmet, CORS, middleware)
│   │       ├── index.ts           # Entry point + PORT binding
│   │       ├── lib/
│   │       │   ├── crowdData.ts   # Deterministic crowd simulation
│   │       │   ├── groq.ts        # Groq client with dual-key rotation
│   │       │   ├── logger.ts      # Pino structured logger
│   │       │   └── rateLimiter.ts # AI + incident rate limiters
│   │       └── routes/
│   │           ├── ai.ts          # 6 AI endpoints
│   │           ├── crowd.ts       # Gate data
│   │           ├── health.ts      # Health check
│   │           ├── incidents.ts   # CRUD
│   │           └── index.ts       # Router composition
│   └── stadium-sense/             # React + Vite frontend
│       └── src/
│           ├── components/
│           │   ├── ui/            # shadcn/ui primitives
│           │   ├── layout/        # Sidebar + Header + Layout
│           │   └── ErrorBoundary.tsx
│           ├── features/          # Domain-sliced feature modules
│           │   ├── accessibility/ # AccessibilityPage + useAccessibilitySettings
│           │   ├── copilot/       # CopilotPage
│           │   ├── crowd/         # CrowdPage + GateHeatmap
│           │   ├── incidents/     # IncidentsPage + IncidentForm + IncidentList
│           │   ├── multilingual/  # MultilingualPage
│           │   ├── navigation/    # NavigationPage
│           │   └── transportation/# TransportationPage
│           ├── pages/             # Route shells (DashboardPage, NotFound)
│           └── tests/             # Vitest unit tests
├── lib/
│   ├── api-spec/                  # OpenAPI 3.1 YAML (source of truth)
│   ├── api-client-react/          # Generated React Query hooks
│   ├── api-zod/                   # Generated Zod schemas
│   └── db/                        # Drizzle schema + PostgreSQL client
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── AI.md
│   ├── DATABASE.md
│   ├── DEPLOYMENT.md
│   ├── TESTING.md
│   ├── ACCESSIBILITY.md
│   └── PERFORMANCE.md
├── .editorconfig
├── .env.example
├── .prettierrc
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── README.md
└── SECURITY.md
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+ (`npm install -g pnpm`)
- A [Groq API key](https://console.groq.com) (free tier available)

### 1. Clone and install

```bash
git clone <repo-url>
cd stadium-sense
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env — set GROQ_API_KEY and SESSION_SECRET
```

### 3. Set up the database

```bash
pnpm run db:push   # apply schema
pnpm run db:seed   # insert sample incidents
```

### 4. Start development servers

```bash
# Terminal 1 — API (port 8080)
pnpm --filter @workspace/api-server run dev

# Terminal 2 — Frontend (Vite dev server)
pnpm --filter @workspace/stadium-sense run dev
```

Open [http://localhost:5173](http://localhost:5173) — the dashboard loads instantly.

### Replit (one-click)

If running on Replit, set `GROQ_API_KEY` and `GROQ_API_KEY_2` in **Replit Secrets** and click **Run**. Both workflow processes start automatically.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | ✅ Yes | Primary Groq API key |
| `GROQ_API_KEY_2` | Optional | Secondary key for rotation (doubles rate limit) |
| `SESSION_SECRET` | ✅ Yes | Express session secret (≥32 random chars) |
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string (auto-set on Replit) |
| `PORT` | Auto | Server port (auto-set by Replit) |

See `.env.example` for a full annotated template.

---

## API Reference

Quick reference — full docs in [`docs/API.md`](docs/API.md).

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/healthz` | Health check |
| `GET` | `/api/crowd/gates` | Live gate density data (12 gates) |
| `GET` | `/api/incidents` | List all incidents |
| `POST` | `/api/incidents` | Create incident (rate-limited) |
| `PATCH` | `/api/incidents/:id` | Update incident status / AI triage |
| `POST` | `/api/ai/copilot` | Conversational AI assistant |
| `POST` | `/api/ai/crowd-analysis` | Predictive crowd flow analysis |
| `POST` | `/api/ai/navigation` | Multilingual wayfinding |
| `POST` | `/api/ai/translate` | Real-time translation |
| `POST` | `/api/ai/transportation-recommendation` | Transport + sustainability advisor |
| `POST` | `/api/ai/incident-priority` | AI-assisted incident triage |

---

## Testing

```bash
pnpm --filter @workspace/stadium-sense run test           # run once
pnpm --filter @workspace/stadium-sense run test:watch     # watch mode
pnpm --filter @workspace/stadium-sense run test:coverage  # with coverage
```

**24 tests** covering: crowd density classification, wait-time formula boundaries, severity-to-priority mapping, language validation, debounce behavior, accessibility settings, font size validation, and gate status computation.

See [`docs/TESTING.md`](docs/TESTING.md) for strategy and coverage targets.

---

## Accessibility

WCAG 2.1 Level AA. Key implementations:

- Semantic HTML (`<main>`, `<nav>`, `<section>`, `<article>`)
- ARIA labels on all interactive elements and content regions
- `role="progressbar"` with `aria-valuenow` on wait-time bars
- `role="alert"` + `aria-live="assertive"` on error states
- Full keyboard navigation (Tab, Shift+Tab, Enter, Space)
- User-controlled high contrast, font size, and reduced motion settings

See [`docs/ACCESSIBILITY.md`](docs/ACCESSIBILITY.md) for full audit details.

---

## Security

- **Helmet** — CSP, HSTS, X-Content-Type-Options, X-Frame-Options
- **CORS** — restricted to `*.replit.dev` in production
- **Rate limiting** — 30 req/min (AI), 10 req/min (incident creation)
- **Zod validation** — all inputs validated against generated OpenAPI schemas
- **Body size limit** — 100 KB cap on all request bodies
- **Secret isolation** — Groq API keys server-side only; never in client bundle

See [`SECURITY.md`](SECURITY.md) for full OWASP Top 10 coverage.

---

## Performance

- **Code splitting** — every feature module loaded with `React.lazy()`
- **Memoization** — `GateHeatmap` and `GateCard` wrapped in `React.memo`
- **React Query caching** — `staleTime: 10s`, refetch-on-window-focus disabled
- **Groq LPU inference** — typically 300–1000 ms end-to-end per AI call
- **esbuild** — API server builds in ~500 ms

See [`docs/PERFORMANCE.md`](docs/PERFORMANCE.md) for detailed analysis.

---

## Documentation

| Document | Description |
|----------|-------------|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System design, data flows, monorepo structure |
| [`docs/API.md`](docs/API.md) | Full API reference with request/response examples |
| [`docs/AI.md`](docs/AI.md) | AI design, prompt engineering, model selection |
| [`docs/DATABASE.md`](docs/DATABASE.md) | Schema, Drizzle ORM, migration workflow |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Replit and manual deployment guides |
| [`docs/TESTING.md`](docs/TESTING.md) | Test strategy, coverage targets, CI |
| [`docs/ACCESSIBILITY.md`](docs/ACCESSIBILITY.md) | WCAG 2.1 AA audit and keyboard map |
| [`docs/PERFORMANCE.md`](docs/PERFORMANCE.md) | Bundle analysis, caching, memoization |
| [`SECURITY.md`](SECURITY.md) | Security architecture, OWASP coverage |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Development setup, code standards, PR checklist |
| [`CHANGELOG.md`](CHANGELOG.md) | Version history |

---

## Future Improvements

- **WebSocket push** — real-time gate updates without polling
- **Multi-venue support** — all 16 FIFA WC 2026 venues with per-stadium layouts
- **Operator alert thresholds** — configurable density/wait-time alarms with push notifications
- **Offline PWA mode** — service worker for poor-connectivity environments
- **Analytics dashboard** — post-match crowd flow replay and heatmap history
- **Role-based access control** — security commander vs. steward vs. medical vs. admin views
- **Real GTFS transport data** — live transit API integration per host city

---

## License

MIT © 2026 StadiumSense AI Team
