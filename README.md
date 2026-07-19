# StadiumSense AI

> **Enterprise-Grade AI Command Center for FIFA World Cup 2026 Stadium Operations.**
> Built for the Smart Stadiums & Tournament Operations challenge.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Groq](https://img.shields.io/badge/Groq-llama--3.3--70b-orange)](https://console.groq.com)
[![Vitest](https://img.shields.io/badge/Tests-83%20passing-brightgreen?logo=vitest)](https://vitest.dev)
[![Playwright](https://img.shields.io/badge/E2E-Playwright-2EAD33?logo=playwright)](https://playwright.dev)
[![WCAG](https://img.shields.io/badge/WCAG-2.1%20AA-blue)](https://www.w3.org/WAI/WCAG21/quickref/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 🔗 Live Showcase

### 🌐 Production URL

🔗 [StadiumSense AI Live Demo](https://stadiumsens-ai.netlify.app/)

### 💼 LinkedIn Showcase

🔗 [LinkedIn Project Presentation & Video](https://www.linkedin.com/in/kanani-shubham) _(Please update this placeholder with your post link when published)_

### 🐙 GitHub Repository

🔗 [GitHub Codebase](https://github.com/Kanani-Shubham/stadium-command-center)

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Solution Overview](#solution-overview)
3. [Key Features](#key-features)
4. [System Architecture](#system-architecture)
5. [AI Workflow & Design](#ai-workflow--design)
6. [Technology Stack](#technology-stack)
7. [Folder Structure](#folder-structure)
8. [Installation & Setup](#installation--setup)
9. [Running Locally](#running-locally)
10. [Testing Suite](#testing-suite)
11. [Accessibility (A11y)](#accessibility-a11y)
12. [Security Architecture](#security-architecture)
13. [Performance Metrics](#performance-metrics)
14. [Challenge Alignment](#challenge-alignment)
15. [License](#license)

---

## Problem Statement

The FIFA World Cup 2026 will bring unprecedented operational complexity: **104 matches across 16 venues** in the USA, Canada, and Mexico, attracting **5+ million fans**. Stadium operators face massive challenges:

- **Crowd surges** at check-in gates causing severe bottlenecks.
- **Language barriers** with international fans representing 200+ countries.
- **Transportation bottlenecks** during post-match egress.
- **Delayed emergency responses** due to manual triage bottlenecks.
- **Strict sustainability targets** aligned with FIFA's net-zero target.
- **Accessibility mandates** for fans with varying visual and physical needs.

---

## Solution Overview

**StadiumSense AI** is a unified, real-time command center dashboard that gives stadium operators a single pane of glass to predict crowd flows, orchestrate emergency response units, streamline multilingual wayfinding, and optimize transit operations.

It utilizes sub-second AI inferences via **Groq's Llama-3.3-70b-versatile** model to replace disjointed workflows with context-aware, automated operational intelligence.

---

## Key Features

### 🏟️ Real-Time Operations Dashboard

Visualizes core stadium status indicators, including live gate densities, transport modals, occupancy rates, active incidents, and net-zero sustainability indicators.
![Operations Dashboard](docs/screenshots/dashboard.png "Operations Dashboard")

### 🤖 AI Command Copilot

A conversational operations assistant that provides instant, contextual protocols for crowd handling, weather emergencies, and logistical queries.
![AI Copilot](docs/screenshots/ai-copilot.png "AI Command Copilot")

### 👥 Crowd Intelligence & Heatmaps

Presents gate capacity statuses, flow rates, and wait times across 12 stadium gates. Generates 15-minute crowd flow forecasts and operator recommendations with a single click.
![Crowd Intelligence Heatmap](docs/screenshots/crowd-intelligence.png "Crowd Intelligence Heatmap")

### 🗺️ Smart Wayfinding & Navigation

Multilingual direction engine. Fans and stewards input natural language queries (e.g., "closest ramp from Section 102") and receive step-by-step guidance.
![Smart Navigation](docs/screenshots/navigation.png "Smart Wayfinding")

### 🚨 Incident Management Center

Full CRUD workspace. AI evaluates reported incidents, assigns priority classes (P1 to P4), and recommends the closest responder team based on venue quadrants.
![Incident Manager](docs/screenshots/emergency-response.png "Incident Management")

### 🌍 Multilingual Kiosk Assistant

Real-time language translation center supporting English, Spanish, French, Portuguese, Arabic, and Hindi with automatic source language detection.
![Multilingual Translation](docs/screenshots/multilingual-ai.png "Multilingual Translation")

### ♿ Accessibility Control Center

Enables instant user settings: High Contrast mode, font size scaling (14px to 20px), and reduced motion toggles to comply with WCAG 2.1 AA.
![Accessibility Settings](docs/screenshots/accessibility.png "Accessibility Control Center")

### 🚌 Transit Hub & Sustainability Tracking

Monitors subway, train, and bus load levels. Provides recommendations for staggered egress and matches carbon efficiency metrics against target limits.
![Transit Hub](docs/screenshots/transportation.png "Transportation & Sustainability")

---

## System Architecture

StadiumSense AI is built as a contract-first monorepo using **pnpm workspaces**. The OpenAPI spec serves as the single source of truth from which types, frontend hooks, and request-response validation schemas are generated.

```mermaid
graph TD
    User([Browser Client]) -->|HTTP /api| API[Express API Server]
    API -->|Validation| Zod[Zod Schemas]
    API -->|ORM| Drizzle[Drizzle ORM]
    Drizzle -->|Read/Write| DB[(PostgreSQL Database)]
    API -->|Inference| Groq[Groq Llama-3.3-70b]

    subgraph Shared Libraries
        Spec[OpenAPI Spec] -->|codegen| ClientHooks[TanStack React Query Hooks]
        Spec -->|codegen| Zod
    end
    User -.->|Generated Hooks| ClientHooks
```

---

## AI Workflow & Design

Every query to the AI engine is enriched on the server with real-time stadium metrics before being passed to Groq's low-latency inference model.

```mermaid
sequenceDiagram
    autonumber
    Client->>API: POST /api/ai/endpoint (payload)
    API->>Zod: Validate Request Schema
    API->>DB: Fetch Active Incidents & Gate Status
    API->>API: Inject Current Context into Prompt Template
    API->>Groq: Request llama-3.3-70b-versatile (JSON Mode)
    Groq-->>API: JSON Output
    API->>API: Parse & Verify Schema Integrity
    API-->>Client: Typed JSON Response
```

---

## Technology Stack

- **Frontend**: React 19, Vite 7, Radix UI, Tailwind CSS, Wouter (Routing), TanStack React Query v5.
- **Backend**: Express 5, Node.js 22, Pino (Structured logging), Helmet & CORS (Security).
- **Database & validation**: PostgreSQL, Drizzle ORM, Zod, Orval (API Contract Codegen).
- **AI Engine**: Groq SDK (Llama-3.3-70b-versatile model).
- **Testing**: Vitest, React Testing Library, Playwright, axe-core.

---

## Folder Structure

```
stadium-command-center/
├── .vscode/               # VS Code workspace settings
├── docs/                  # Engineering documentation
│   ├── screenshots/       # PNG application screenshots
│   ├── architecture/      # Diagrams and flowcharts
│   ├── API.md             # Complete API contracts
│   ├── ARCHITECTURE.md    # System design details
│   ├── DATABASE.md        # DB Schema & migrations
│   ├── TESTING.md         # Testing strategy
│   ├── ACCESSIBILITY.md   # Accessibility compliance (WCAG)
│   └── PERFORMANCE.md     # Client-server performance analysis
├── tests/                 # Centralized testing suite
│   ├── unit/              # Pure unit tests
│   ├── integration/       # Subsystem integrations
│   ├── api/               # API route integration tests
│   ├── components/        # Component UI unit tests
│   ├── hooks/             # Custom hook tests
│   ├── utils/             # Utility function tests
│   ├── accessibility/     # Accessibility (Axe) tests
│   └── e2e/               # Playwright E2E browser tests
├── artifacts/             # Project workspaces
│   ├── api-server/        # Express API Server (Node.js)
│   ├── stadium-sense/     # Main React + Vite Client Application
│   └── mockup-sandbox/    # Component mockup workspace
├── lib/                   # Shared monorepo packages
│   ├── api-spec/          # OpenAPI yaml specifications
│   ├── api-client-react/  # Generated React Query hooks
│   ├── api-zod/           # Generated Zod validation schemas
│   └── db/                # Drizzle schema & PG pool client
├── package.json           # Monorepo root package configuration
└── pnpm-workspace.yaml    # Monorepo workspace settings
```

---

## Installation & Setup

### Prerequisites

- Node.js 20 or higher
- pnpm 10 or higher (`npm install -g pnpm`)
- PostgreSQL instance (or local connection string)
- [Groq API Key](https://console.groq.com)

### 1. Clone & Install

```bash
git clone https://github.com/Kanani-Shubham/stadium-command-center.git
cd stadium-command-center
pnpm install
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
PORT=8080
SESSION_SECRET=a_secure_random_string_at_least_32_chars
DATABASE_URL=postgresql://username:password@localhost:5432/stadiumsense
GROQ_API_KEY=gsk_your_primary_key_here
GROQ_API_KEY_2=gsk_your_optional_backup_key_for_rotation
```

---

## Running Locally

### Start Development Mode

Both the frontend Vite server (port `5173`) and the Express API server (port `8080`) are launched concurrently with a single command:

```bash
pnpm run dev
```

### Build for Production

To bundle the frontend assets and compile the API server:

```bash
pnpm run build
```

---

## Testing Suite

StadiumSense AI implements a comprehensive testing suite divided by scope to guarantee codebase stability.

### Commands

```bash
pnpm test          # Run all Vitest unit and integration suites
pnpm run test:watch # Run Vitest in hot-reload watch mode
pnpm run test:coverage # Generate a code coverage report
pnpm run test:e2e  # Execute Playwright E2E browser tests
```

### Test Classification

- **Unit Tests**: Coverage for isolated functions, formulas (like wait times and occupancy math), and schema validations.
- **Component Tests**: Verifies rendering states, UI alerts, and Error Boundaries using React Testing Library.
- **Hook Tests**: Verifies custom React hooks state loops (`useAccessibilitySettings`, `useDebounce`).
- **API Tests**: Validates JSON payloads, response codes, and CORS security headers using `supertest`.
- **E2E Tests**: Simulates full user journeys (form submissions, navigation clicks, theme changes) using Playwright.

---

## Accessibility (A11y)

The application complies with **WCAG 2.1 AA** guidelines:

- **ARIA Attributes**: Properly placed `aria-live`, `aria-busy`, and role attributes.
- **Keyboard-Navigable**: Fully operable via Tab, Enter, and Space keys.
- **Visual Options**: High Contrast Mode and text-size scaling from 14px to 20px.
- **Motion Controls**: Toggleable transition and animation settings for sensitive users.

---

## Security Architecture

- **CORS Allowlist**: Configurable dynamically via `ALLOWED_ORIGINS` to prevent cross-site request forgery.
- **Helmet Headers**: Configures strict Content Security Policies, Frame Protection, and MIME sniffing prevention.
- **Rate Limiters**: Restricts IP requests to 30 req/min for AI endpoints and 10 req/min for incident reports.
- **Credential Safety**: Groq API keys remain strictly server-side; dual-key round-robin rotation doubles effective API throughput.

---

## Performance Metrics

- **Bundle Splitting**: Code-splitting at the router layer loads page bundles lazily.
- **Memoization**: Heatmap components utilize `React.memo` to eliminate redundant redraw cycles.
- **React Query Cache**: Controls server fetching frequency with a default 10-second cache stale timer.

---

## Challenge Alignment

| official Requirements        | How StadiumSense AI Meets the Criteria                                                             |
| :--------------------------- | :------------------------------------------------------------------------------------------------- |
| **Smart Navigation**         | Smart Navigation page answers wayfinding requests in 6 languages, estimating steps and walk times. |
| **Crowd Management**         | 12-gate heatmap, 15-minute crowd projections, and automated safety recommendations.                |
| **Accessibility Options**    | WCAG 2.1 Level AA compliance, font resizing, high contrast, and reduced motion flags.              |
| **Transit Operations**       | Transportation load levels, staggered egress tips, and net-zero compliance tracking.               |
| **Sustainability Goals**     | carbon tracking indicators mapped against net-zero efficiency targets.                             |
| **Multilingual Engine**      | Real-time translation supporting 6 languages with automated source detection.                      |
| **Operational Intelligence** | AI Command Copilot and Incident Priority triage (P1-P4 classification).                            |
| **Real-time Diagnostics**    | Aggregated KPI cards with auto-refresh intervals every 30 seconds.                                 |

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
