# Changelog

All notable changes to StadiumSense AI are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versions follow [Semantic Versioning](https://semver.org/).

---

## [1.0.0] — 2026-07-10

### Added

**Core Platform**

- Full-stack enterprise dashboard for FIFA World Cup 2026 stadium operations
- Express API server with Groq AI integration (`llama-3.3-70b-versatile`)
- React + Vite frontend with code-splitting and lazy-loaded modules
- PostgreSQL persistence for incidents via Drizzle ORM
- OpenAPI 3.1 contract-first design with generated React Query hooks and Zod schemas

**AI Features (7 endpoints)**

- `POST /api/ai/copilot` — conversational operations assistant with chat history
- `POST /api/ai/crowd-analysis` — predictive crowd flow analysis with risk level
- `POST /api/ai/navigation` — multilingual wayfinding (6 languages)
- `POST /api/ai/translate` — real-time fan-facing translation
- `POST /api/ai/transportation-recommendation` — transport + sustainability advisor
- `POST /api/ai/incident-priority` — emergency response prioritization (P1–P4)
- Dual Groq API key rotation for increased throughput

**Frontend Modules**

- Dashboard — KPI overview with real-time incident + crowd data
- AI Copilot — full chat UI with conversation history
- Crowd Intelligence — 12-gate live density heatmap (auto-refreshes every 30 s)
- Smart Navigation — multilingual wayfinding assistant
- Multilingual Assistant — 6-language translation panel
- Accessibility Center — high contrast, font size, reduced motion (persisted to localStorage)
- Transportation & Sustainability — load bars + AI recommendation panel
- Incident Management — create, triage, and update incidents with AI priority

**Security**

- Helmet with CSP, HSTS, and X-Content-Type-Options
- CORS restricted to `*.replit.dev` in production
- Rate limiting: 30 req/min (AI), 10 req/min (incident creation)
- All inputs validated with Zod; body size limited to 100 KB

**Developer Experience**

- `.editorconfig`, `.prettierrc`, `.vscode/settings.json`
- GitHub Actions CI: typecheck + test + format check
- `.env.example` with annotated variables
- `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`
- Full `docs/` directory: ARCHITECTURE, API, AI, DATABASE, DEPLOYMENT, TESTING, ACCESSIBILITY, PERFORMANCE

**Testing**

- 24 unit tests covering crowd logic, severity mapping, language validation, debounce, accessibility utilities
- Vitest with coverage via `@vitest/coverage-v8`

## [1.1.0] — 2026-07-19

### Added

- **Volunteer Coordination**: Deployed a dedicated volunteer/steward coordination layout card on the main dashboard showing assignment states, active coverage meters, and AI-driven steward reallocations.
- **Robust Database Fallback**: Implemented a connection interceptor that automatically redirects incident queries to an in-memory mock store if the PostgreSQL database is unreachable or offline, ensuring error-free execution.
- **E2E Testing Suite**: Added browser automation testing using Playwright with fully responsive dashboard checks.
- **Root Testing Directory**: Organized and centralized all test files under `/tests` in Unit, Hooks, Components, API, Accessibility, and E2E subdirectories.
- **Vite Development Proxies**: Added local API proxies for seamless monorepo front-to-back communication in development.
- **Prettier Format Audit**: Formatted the entire codebase with Prettier rules.

### Removed

- **Replit Dependencies**: Completely removed `.replit`, `replit.md`, `.replitignore`, and Replit-artifact metadata configs.
- **Replit Branding**: Cleaned out all platform-specific mentions in source code templates, `index.html`, and README files.

---

## [Unreleased]

### Planned

- Real-time WebSocket push for gate density updates
- Multi-stadium support (all 16 FIFA WC 2026 venues)
- Operator alert thresholds with push notifications
- Offline PWA mode for poor-connectivity environments
