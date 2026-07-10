# Performance

## Frontend

### Code Splitting

Every feature module is loaded with `React.lazy()` and wrapped in `<Suspense>`. Vite splits each lazy chunk at build time so users only download JavaScript for the page they are viewing.

```
Dashboard      ~18 KB (gzipped)
Copilot        ~12 KB
Crowd          ~14 KB
Incidents      ~16 KB
```

### Memoization

- `GateHeatmap` is wrapped with `React.memo` — it only re-renders when the `gates` prop reference changes
- `GateCard` (inside GateHeatmap) is also memoized — prevents re-rendering unchanged gates on partial data updates
- Helper functions (`getStatusColor`, `getWaitBarClass`) are defined outside the component tree to avoid re-creation on every render

### React Query Caching

- `staleTime: 10_000` — prevents redundant refetches if the user navigates between pages within 10 seconds
- `refetchOnWindowFocus: false` — prevents refetch storms when operators alt-tab between tools
- Crowd gates and incidents auto-refresh every 30 seconds via `refetchInterval`

### API Response Caching

The Express API uses HTTP `304 Not Modified` for unchanged crowd data (conditional GET via ETag). This reduces bandwidth during the 30-second refresh cycle.

---

## Backend

### Build

The API server is bundled with esbuild into a single `dist/index.mjs` file. Cold start is under 200 ms.

### Pino Structured Logging

Pino is the fastest Node.js logger. Log serialization happens asynchronously via worker threads (`pino-worker`), keeping the request path hot.

### Body Size Limits

Request bodies are capped at `100 KB` (`express.json({ limit: '100kb' })`). This prevents memory exhaustion from oversized payloads.

---

## Groq AI Latency

Groq LPU hardware delivers significantly lower latency than GPU-based inference:

| Endpoint | Typical response time |
|----------|-----------------------|
| Copilot | 400–800 ms |
| Crowd analysis | 600–1000 ms |
| Navigation | 400–700 ms |
| Translation | 300–600 ms |
| Transportation | 500–900 ms |
| Incident priority | 300–600 ms |

These are measured from the Express handler — including request parsing and JSON validation.

---

## Bundle Analysis

Run Vite's built-in bundle visualizer:

```bash
pnpm --filter @workspace/stadium-sense exec vite build --mode production
# Then open dist/stats.html (if rollup-plugin-visualizer is installed)
```

Key bundle rules:
- Radix UI components tree-shake cleanly — only imported primitives are bundled
- Lucide icons are individually imported — no full icon library included
- `date-fns` uses named exports — only used functions are bundled
