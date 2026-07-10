# Contributing to StadiumSense AI

Thank you for your interest in contributing! This document describes the development workflow.

---

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org) 20+
- [pnpm](https://pnpm.io) 10+ (`npm install -g pnpm`)
- PostgreSQL (or use the Replit-managed database)
- A [Groq API key](https://console.groq.com) for AI features

### 1. Clone & Install

```bash
git clone <repo-url>
cd stadium-sense
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Fill in GROQ_API_KEY and SESSION_SECRET
```

### 3. Set up the database

```bash
pnpm run db:push    # apply schema
pnpm run db:seed    # insert sample data
```

### 4. Start development servers

```bash
# Terminal 1 — API server
pnpm --filter @workspace/api-server run dev

# Terminal 2 — Frontend
pnpm --filter @workspace/stadium-sense run dev
```

---

## Project Structure

```
├── artifacts/
│   ├── api-server/          # Express + Groq backend
│   └── stadium-sense/       # React + Vite frontend
├── lib/
│   ├── api-spec/            # OpenAPI 3.1 specification (source of truth)
│   ├── api-client-react/    # Generated React Query hooks (DO NOT EDIT)
│   ├── api-zod/             # Generated Zod schemas (DO NOT EDIT)
│   └── db/                  # Drizzle ORM schema + client
└── docs/                    # Extended documentation
```

---

## Code Standards

### TypeScript

- Strict mode is enforced via `tsconfig.base.json`
- No `any` types — use `unknown` and narrow with guards
- Run `pnpm --filter @workspace/<pkg> run typecheck` before committing

### Adding an API Endpoint

1. Add the path + schema to `lib/api-spec/openapi.yaml`
2. Run `pnpm run codegen` to regenerate client hooks and Zod schemas
3. Implement the route in `artifacts/api-server/src/routes/`
4. Consume the generated hook in the frontend — never write manual fetch calls

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org):

```
feat: add gate alert threshold configuration
fix: correct wait-time calculation at density boundary
docs: update API endpoint table in README
chore: bump groq-sdk to 1.4.0
test: add unit tests for crowd density classifier
```

---

## Pull Request Checklist

- [ ] `pnpm run typecheck:libs` passes
- [ ] `pnpm --filter @workspace/api-server run typecheck` passes
- [ ] `pnpm --filter @workspace/stadium-sense run typecheck` passes
- [ ] `pnpm --filter @workspace/stadium-sense run test` passes
- [ ] No `any` types introduced
- [ ] New API endpoints have OpenAPI spec + Zod validation
- [ ] New UI components have ARIA labels and keyboard support
- [ ] README updated if behavior changed

---

## Testing

```bash
# Run all frontend tests
pnpm --filter @workspace/stadium-sense run test

# Watch mode
pnpm --filter @workspace/stadium-sense run test:watch

# Coverage report
pnpm --filter @workspace/stadium-sense run test:coverage
```

Tests live in `artifacts/stadium-sense/src/tests/`.

---

## License

By contributing, you agree your contributions will be licensed under the project's MIT License.
