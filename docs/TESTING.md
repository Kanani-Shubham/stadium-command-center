# Testing Manual

This document details the testing architecture, test classification, and execution guidelines for StadiumSense AI.

---

## Testing Strategy

StadiumSense AI implements a multi-tier testing strategy ensuring that pure business math, React components, server routers, and full user browser sessions are verified under automation.

```
┌─────────────────────────────────────────────────────────┐
│                    E2E Browser Tests                    │  ◄── Playwright (Full flows)
├─────────────────────────────────────────────────────────┤
│                API Router Integration                   │  ◄── Vitest + Supertest (HTTP)
├─────────────────────────┬───────────────────────────────┤
│    Component UI Units   │      Accessibility/Axe        │  ◄── React Testing Library & Axe
├─────────────────────────┴───────────────────────────────┤
│               Pure Unit & Hook Logic                    │  ◄── Vitest (Math & State loops)
└─────────────────────────────────────────────────────────┘
```

---

## Directory Structure

All test suites are centralized in the root `tests/` directory:

```
tests/
├── accessibility/     # Axe accessibility standard compliance tests
├── api/               # Express routing request/response tests
├── components/        # Component UI rendering & boundaries tests
├── e2e/               # Playwright E2E browser flows
├── hooks/             # Custom hook state & lifecycle tests
├── unit/              # Pure business logic unit tests
└── utils/             # String formatters and mapping unit tests
```

---

## Running Tests

Execute commands from the workspace root directory:

### 1. Vitest Unit & Integration Suites
```bash
pnpm test              # Run all unit/integration/API suites once
pnpm run test:watch    # Watch mode for real-time development
pnpm run test:coverage # Generate HTML code coverage reports
```

### 2. Playwright E2E Browser Suites
Ensure the development servers are active (`pnpm run dev`) before launching:
```bash
pnpm run test:e2e      # Execute all Playwright E2E tests
npx playwright show-report # View E2E test report interface
```

---

## Test Classification

### 1. Unit Tests (`tests/unit/`, `tests/utils/`)
Focuses on pure mathematical formulas and data transformations:
- **Heatmap Densities**: Verifies gate status classifications (open, congested, critical).
- **Wait Time Calculations**: Verifies piecewise linear time algorithms at boundaries.
- **Incident Prioritization**: Mapped lookup constants (critical to P1, low to P4).
- **Wayfinding Mappings**: Map data nodes and language dictionaries.

### 2. React Hooks (`tests/hooks/`)
Verifies isolated state management logic:
- `useAccessibilitySettings.test.tsx`: Toggles High Contrast, FontSize scaling, and Reduced Motion. Validates document element CSS injection and LocalStorage persistence.
- `useDebounce.test.ts`: Verifies search inputs values delay correctly over standard timeouts.

### 3. Component UI (`tests/components/`)
Verifies visual components rendering:
- `ErrorBoundary.test.tsx`: Ensures the React component tree does not crash under uncaught exceptions, rendering a fallback visual alert instead.

### 4. API Endpoints (`tests/api/`)
Verifies backend request validation and response schemas:
- `api.test.ts`: Utilizes `supertest` to fetch `/api/healthz`, `/api/crowd/gates` (with mock fallback handling), and evaluates status codes, headers, and CORS allowances.

### 5. Accessibility (`tests/accessibility/`)
Verifies element layout structure:
- `accessibility.test.ts`: Analyzes text containers, contrast variables, and accessibility tags (ARIA-live, target labels) to align with WCAG Level AA guidelines.

### 6. E2E Browser flows (`tests/e2e/`)
Automates real browser interaction:
- `dashboard.spec.ts`: Spawns headless browser, visits the dashboard page, navigates the side panel links, modifies accessibility selectors, and verifies responsive layouts.

---

## Coverage Targets

| Domain | Target Coverage | Tool |
| :--- | :--- | :--- |
| Core Business Math | `> 95%` | Vitest |
| Custom Hooks | `> 90%` | Vitest |
| API Layer Route | `> 85%` | Supertest |
| Global UI Components | `> 80%` | React Testing Library |

---

## Test Design Guidelines

1. **Isolation**: Tests must remain stateless. Mock all network requests and filesystem modifications.
2. **Determinism**: Never use random variables or dynamic time calls. Freeze date stamps using `vi.useFakeTimers()`.
3. **Speed**: Unit and component tests must finish in less than `1.5s` combined.
