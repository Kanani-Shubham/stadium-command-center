# Testing

## Test Strategy

StadiumSense AI uses **Vitest** for unit testing. Tests focus on business logic, utility functions, and domain rules — not implementation details.

## Running Tests

```bash
# Run all tests once
pnpm --filter @workspace/stadium-sense run test

# Watch mode (re-runs on file save)
pnpm --filter @workspace/stadium-sense run test:watch

# Coverage report (HTML + text summary)
pnpm --filter @workspace/stadium-sense run test:coverage
```

## Test Location

```
artifacts/stadium-sense/src/tests/
├── crowdData.test.ts        # Crowd density + wait-time logic (24 tests)
├── accessibility.test.ts    # Font-size validation, settings helpers
└── formatting.test.ts       # Number formatting, date utilities
```

## Coverage Targets

| Area | Target |
|------|--------|
| Business logic utilities | > 90% |
| Crowd simulation helpers | > 90% |
| Accessibility settings | > 80% |
| Language/translation | > 80% |

Run `pnpm --filter @workspace/stadium-sense run test:coverage` and open `artifacts/stadium-sense/coverage/index.html`.

## What is Tested

### Crowd Logic (`crowdData.test.ts`)

- `classifyDensity()` — all four density buckets (low / medium / high / critical)
- `computeWaitMinutes()` — piecewise formula at boundaries (0, 0.2, 0.5, 1.0)
- `severityToPriority` mapping — P1–P4 coverage
- `supportedLanguages` — all 6 required languages present with display names
- `debounce()` — delay behavior + multiple rapid invocations
- `isValidFontSize()` — valid and invalid inputs
- `FONT_SIZE_MAP` — pixel values in ascending order
- `computeGateStatus()` — closed, critical, congested, open transitions

### Test Design Rules

1. **Deterministic** — no `Math.random()`, no `Date.now()` without mocking
2. **Isolated** — tests do not depend on running services (DB, Groq, DOM)
3. **Fast** — full suite runs in < 500 ms
4. **Readable** — test descriptions read as specifications

## CI

Tests run automatically on every push and pull request via GitHub Actions (`.github/workflows/ci.yml`).
Coverage artifacts are uploaded on every CI run.
