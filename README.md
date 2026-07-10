# StadiumSense AI

**Enterprise-grade, GenAI-powered stadium operations command center for FIFA World Cup 2026**

Submitted for the hackathon challenge: **"Smart Stadiums & Tournament Operations"**

---

## Problem Statement

Managing 80,000+ fans at a FIFA World Cup stadium demands real-time situational awareness, multilingual communication, and split-second operational decisions. Traditional command centers rely on radio calls, manual checks, and siloed data. StadiumSense AI replaces that with a unified, AI-powered operations platform — giving every operator instant access to crowd intelligence, predictive analytics, and contextual guidance in any language, from a single interface.

---

## Challenge Evaluation Criteria — Feature Mapping

| Challenge Goal | StadiumSense AI Feature | Route |
|---|---|---|
| **Crowd Management** | Crowd Intelligence — real-time gate density heatmap, wait times, AI congestion predictions | `/crowd` |
| **Navigation** | Smart Navigation Assistant — natural-language wayfinding (exits, restrooms, medical, food) | `/navigation` |
| **Multilingual Assistance** | Multilingual AI Assistant — real-time fan question translation in 6 languages | `/multilingual` |
| **Accessibility** | Accessibility Center — high-contrast, font size, reduced-motion, keyboard nav | `/accessibility` |
| **Transportation** | Transportation & Sustainability — metro/bus/rideshare load + sustainability metrics | `/transportation` |
| **Operational Intelligence** | AI Operations Copilot — natural-language Q&A for stadium operations | `/copilot` |
| **Real-time Decision Support** | Incident Management — AI-prioritized emergency reporting with nearest-response recommendations | `/incidents` |
| **Sustainability** | Transportation & Sustainability panel — energy/water/waste vs. targets with AI action summary | `/transportation` |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    StadiumSense AI                          │
│                                                             │
│  Frontend (React + Vite)          Backend (Express 5)       │
│  ┌─────────────────────┐         ┌─────────────────────┐    │
│  │  Sidebar Navigation  │         │  /api/ai/*           │    │
│  │  8 Feature Modules   │ ←HTTP→ │  /api/crowd/gates    │    │
│  │  React Query hooks   │         │  /api/incidents      │    │
│  │  TypeScript strict   │         │  Rate limiting       │    │
│  └─────────────────────┘         └──────────┬──────────┘    │
│                                             │               │
│                                    ┌────────▼────────┐      │
│                                    │   Groq API       │      │
│                                    │ llama-3.3-70b    │      │
│                                    └────────┬────────┘      │
│                                             │               │
│                                    ┌────────▼────────┐      │
│                                    │  PostgreSQL      │      │
│                                    │ (Incidents DB)   │      │
│                                    └─────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

- **Contract-first API**: OpenAPI spec → codegen → typed React Query hooks. No hand-written API types.
- **Server-side AI only**: All Groq API calls go through the Express backend. The API key is never exposed to the client bundle.
- **Rate limiting**: AI endpoints are capped at 30 req/min per IP; incident submission at 10 req/min.
- **Simulated crowd data**: Gate density is deterministic-randomized per 30-second window — consistent within each refresh cycle, varied across cycles to simulate live conditions.
- **Feature-based folder structure**: Each module (`copilot/`, `crowd/`, `incidents/`, etc.) is self-contained with its own page component and supporting files.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 + Vite |
| Routing | Wouter |
| State / data fetching | TanStack React Query |
| UI components | shadcn/ui (Radix UI primitives) |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Charts/visualization | Recharts |
| Backend | Express 5 + Node.js 24 |
| AI model | Groq — llama-3.3-70b-versatile |
| Database | PostgreSQL + Drizzle ORM |
| Validation | Zod |
| API codegen | Orval (OpenAPI → React Query hooks) |
| Package manager | pnpm workspaces |
| Language | TypeScript throughout |
| Testing | Vitest |

---

## Setup & Installation

### Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- A Groq API key ([console.groq.com](https://console.groq.com))

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure the GROQ_API_KEY secret

The Groq API key must be set as a **server-side secret** — it is never exposed to the client bundle.

**On Replit:**
1. Open the Secrets panel (lock icon in the sidebar)
2. Add a secret with key `GROQ_API_KEY` and your Groq API key as the value

**Locally:**
```bash
export GROQ_API_KEY=your_groq_api_key_here
```

### 3. Set up the database

```bash
pnpm --filter @workspace/db run push
```

### 4. Regenerate API types (if modifying the spec)

```bash
pnpm --filter @workspace/api-spec run codegen
```

### 5. Start the development servers

```bash
# API server (port configured by workflow)
pnpm --filter @workspace/api-server run dev

# Frontend (port configured by workflow)
pnpm --filter @workspace/stadium-sense run dev
```

On Replit, both services start automatically via the configured workflows.

---

## Module Guide

### AI Operations Copilot (`/copilot`)

A full-height chat interface for stadium operators. Ask anything about crowd management, safety protocols, gate status, or operational procedures. Maintains conversation history for contextual follow-up questions.

**Example queries:**
- "What should I do if Gate N1 exceeds 90% capacity?"
- "Summarize half-time crowd distribution protocols"
- "Which gates should I open first for post-match egress?"

### Crowd Intelligence (`/crowd`)

Real-time gate-level crowd density heatmap with color-coded status indicators. Refreshes every 30 seconds. The AI Analysis panel calls Groq with current gate data to generate congestion predictions and ranked operator recommendations.

**Density thresholds:**
- Green < 45% — Normal flow
- Yellow 45–70% — Monitor
- Orange 70–90% — Congested (deploy stewards)
- Red ≥ 90% — Critical (immediate action)

### Smart Navigation Assistant (`/navigation`)

Natural-language wayfinding for fans and staff. Supports all 6 languages. Returns step-by-step directions and estimated walk times based on stadium layout knowledge.

### Multilingual AI Assistant (`/multilingual`)

Translate fan questions or announcements into English, Hindi, Spanish, French, Arabic, or Portuguese. Useful for frontline staff assisting international fans.

### Accessibility Center (`/accessibility`)

Functional accessibility settings persisted to localStorage:
- **High-contrast mode**: Applies increased contrast CSS class globally
- **Font size**: 4 levels (14px–20px) applied to the root element
- **Reduced motion**: Disables CSS transitions and animations
- **Keyboard navigation guide**: Lists all keyboard shortcuts and ARIA roles

### Transportation & Sustainability (`/transportation`)

Operational overview of transport mode load (metro, bus, rideshare, walking) and sustainability metrics (energy, water, waste) vs. targets. Groq generates a prioritized operator action summary.

### Incident Management (`/incidents`)

Two-panel interface: live incident log with severity badges and status tracking, plus a new incident reporting form. After submission, the AI Priority tool automatically assesses urgency (P1–P4) and recommends the nearest response resource.

---

## Testing

```bash
# Run unit tests
pnpm --filter @workspace/stadium-sense run test

# Run with coverage
pnpm --filter @workspace/stadium-sense run test -- --coverage
```

Test coverage includes:
- Crowd density classification and wait time computation
- Incident severity-to-priority mapping
- Language support validation
- Debounce utility function
- Accessibility settings validation
- Gate status determination logic

---

## Security

- **API key isolation**: `GROQ_API_KEY` is only accessed in the Express backend via `process.env`. It is never included in the frontend bundle, never logged, and never returned in API responses.
- **Input validation**: All request bodies are validated with Zod schemas generated from the OpenAPI spec before processing.
- **Rate limiting**: AI endpoints — 30 req/min per IP. Incident reporting — 10 req/min per IP.
- **No secrets in source**: No credentials, tokens, or keys are hardcoded anywhere in the codebase.
- **Structured logging**: pino with automatic redaction of `Authorization` and `Cookie` headers.

---

## Project Structure

```
.
├── artifacts/
│   ├── api-server/          # Express 5 API server
│   │   └── src/
│   │       ├── lib/
│   │       │   ├── groq.ts       # Groq client wrapper
│   │       │   ├── crowdData.ts  # Simulated gate crowd data
│   │       │   ├── rateLimiter.ts
│   │       │   └── logger.ts
│   │       └── routes/
│   │           ├── ai.ts         # All Groq AI endpoints
│   │           ├── crowd.ts      # Gate density endpoint
│   │           └── incidents.ts  # Incident CRUD
│   └── stadium-sense/       # React + Vite frontend
│       └── src/
│           ├── components/
│           │   └── layout/       # Sidebar, Header, Layout
│           ├── features/         # Feature modules
│           │   ├── copilot/
│           │   ├── crowd/
│           │   ├── navigation/
│           │   ├── multilingual/
│           │   ├── accessibility/
│           │   ├── transportation/
│           │   └── incidents/
│           ├── pages/            # Dashboard, 404
│           └── tests/            # Vitest unit tests
├── lib/
│   ├── api-spec/            # OpenAPI spec + Orval codegen config
│   ├── api-client-react/    # Generated React Query hooks
│   ├── api-zod/             # Generated Zod validation schemas
│   └── db/                  # Drizzle ORM schema + client
└── README.md
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/healthz` | Health check |
| GET | `/api/crowd/gates` | Real-time gate crowd data |
| GET | `/api/incidents` | List all incidents |
| POST | `/api/incidents` | Create new incident |
| PATCH | `/api/incidents/:id` | Update incident status |
| POST | `/api/ai/copilot` | AI Operations Copilot chat |
| POST | `/api/ai/crowd-analysis` | AI crowd intelligence analysis |
| POST | `/api/ai/navigation` | Smart navigation query |
| POST | `/api/ai/translate` | Multilingual translation |
| POST | `/api/ai/transportation-recommendation` | Transport & sustainability AI |
| POST | `/api/ai/incident-priority` | AI incident priority assessment |

---

## License

MIT
