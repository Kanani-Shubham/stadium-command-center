---
name: StadiumSense Audit Patterns
description: Engineering patterns established during the full audit — keep consistent in future changes
---

**Magic numbers → named constants:** All numeric thresholds in `crowdData.ts` and `rateLimiter.ts` are extracted as `const` with descriptive names (e.g. `DENSITY_CRITICAL`, `WAIT_HIGH_DENSITY_SCALE`). Continue this pattern.

**`safeParseJson<T>(raw, fallback)`** in `ai.ts` wraps every JSON.parse call. Never use bare `JSON.parse` in AI route handlers — always use this helper.

**`LANGUAGE_MAP`** is a shared constant at the top of `ai.ts` used by navigation, translation, and copilot routes. Don't duplicate it into individual handlers.

**`SEVERITY_PRIORITY_MAP`** maps severity string → P1–P4 priority code. Same file, same pattern.

**ErrorBoundary** (`src/components/ErrorBoundary.tsx`) wraps the entire Router in App.tsx. It's a class component (required for getDerivedStateFromError). Don't convert to a function component.

**`GateHeatmap` + `GateCard` are both `React.memo`-wrapped.** Helper functions (`getStatusColor`, `getWaitBarClass`, etc.) are defined outside the component at module scope — not inside render.

**`useAccessibilitySettings` exports `FontSize` type and `FONT_SIZES` array** — import these when building settings UI, don't redefine locally.

**Test files use in-test helper replicas** (not production imports) because vitest runs in `node` environment without DOM. Tests are deterministic: no Math.random(), no Date.now() without mocking.

**70 tests across 3 files:** `crowdData.test.ts` (24), `accessibility.test.ts` (24), `formatting.test.ts` (22).

**Why:** Consistent patterns let future agents extend the codebase without introducing regressions or type unsafety.
