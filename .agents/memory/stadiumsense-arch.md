---
name: StadiumSense Architecture
description: Key architectural decisions for the StadiumSense AI monorepo that must stay consistent across sessions
---

**Contract-first:** `lib/api-spec/openapi.yaml` is the single source of truth. Run `pnpm run codegen` after any spec change — never hand-write hooks or Zod schemas.

**Groq is server-side only:** All Groq calls live in `artifacts/api-server/src/lib/groq.ts`. Keys are never injected into the Vite client bundle. Frontend calls `/api/ai/*` HTTP endpoints only.

**Dual-key rotation:** `requireGroq()` round-robins between `GROQ_API_KEY` and `GROQ_API_KEY_2`. Both must be set as Replit Secrets. Model: `llama-3.3-70b-versatile`.

**Crowd data is simulated:** `getLiveCrowdData()` in `crowdData.ts` is deterministic from `Date.now()` rounded to 30 s windows — no DB writes needed for crowd.

**Incidents persist in PostgreSQL** via Drizzle ORM. Schema in `lib/db/src/schema/incidents.ts`. Run `pnpm run db:push` after schema changes.

**Why:** Eliminates client-server type drift; keeps AI keys secure; demo works without data population.

**How to apply:** Any new endpoint = add to openapi.yaml first, then `pnpm run codegen`, then implement route with Zod validation from `@workspace/api-zod`.
