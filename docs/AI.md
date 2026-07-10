# AI Design

## Model

StadiumSense AI uses **Groq's `llama-3.3-70b-versatile`** model for all AI features. Groq's inference hardware (LPU™) provides sub-second latency — critical for real-time stadium operations where operators need instant answers.

## Architecture Principles

### 1. Server-Side Only

All Groq calls are made from the Express backend. The API key is never in the client bundle. The frontend calls typed HTTP endpoints, which proxy to Groq.

### 2. Dual-Key Rotation

Two Groq API keys are supported. The `requireGroq()` function round-robins between them on every call, effectively doubling the available rate limit.

```
Key 1 → Request 1 → Request 3 → Request 5 ...
Key 2 → Request 2 → Request 4 → Request 6 ...
```

### 3. Structured JSON Responses

Every AI endpoint instructs the model to respond with **valid JSON only** — no markdown, no prose wrappers. A `safeParseJson()` helper provides deterministic fallbacks if the model returns malformed output, so the API never crashes on a bad LLM response.

### 4. System Prompt Specialization

Each endpoint has a distinct, focused system prompt:

| Endpoint | Persona |
|----------|---------|
| `/ai/copilot` | Senior stadium operations commander |
| `/ai/crowd-analysis` | Crowd safety engineer |
| `/ai/navigation` | Multilingual fan guide |
| `/ai/translate` | Professional interpreter |
| `/ai/transportation-recommendation` | Mobility and sustainability advisor |
| `/ai/incident-priority` | Emergency response coordinator |

### 5. Context Injection

Every AI prompt is enriched with real operational context before the LLM sees it:

- **Crowd analysis**: Gate densities, wait times, critical gates, match phase
- **Navigation**: Stadium layout map, nearest facilities, fan language
- **Transportation**: Live transport load percentages, sustainability deltas, attendance count
- **Incident priority**: Location, description, severity, and the full P1–P4 response resource table

This grounding prevents hallucinations and ensures recommendations are actionable for FIFA World Cup operations.

## Prompt Engineering

### Crowd Analysis

```
Match phase: {matchPhase}
Gate conditions: {gatesSummary}       ← all 12 gates with density + wait
Critical gates (>85%): {list}
Average density: {n}%
Maximum wait time: {n} minutes

→ JSON: { prediction, recommendations[], riskLevel, summary }
```

### Incident Priority

```
Location: {location}
Description: {description}
Reported severity: {severity}

Stadium resources:
- P1 (Immediate): Fire brigade... response in 2-3 min
- P2 (Urgent): Medical first aid... response in 5-8 min
...

→ JSON: { suggestedPriority, priorityLabel, nearestResponse,
           recommendation, estimatedResponseMinutes }
```

## Rate Limiting

| Endpoint | Limit | Rationale |
|----------|-------|-----------|
| All `/ai/*` | 30 req/min per IP | Prevents abuse + Groq quota protection |
| `/incidents` POST | 10 req/min per IP | Incident flood prevention |

## Fallback Strategy

When `JSON.parse()` fails on a Groq response, `safeParseJson()` returns a typed fallback:

```typescript
const result = safeParseJson<CrowdAnalysisResult>(raw, {
  prediction: raw.slice(0, 300),          // best-effort: use raw text
  recommendations: ["Monitor gate conditions closely"],
  riskLevel: resolveRiskLevel(avgDensity), // computed from real data
  summary: "AI analysis complete — review gate conditions.",
});
```

This ensures the API always returns a valid response shape even under LLM failure modes.

## Token Budgets

| Endpoint | `max_tokens` | Reasoning |
|----------|-------------|-----------|
| Copilot | 800 | Conversational — needs room for detailed answers |
| Crowd analysis | 600 | JSON with 5 fields + arrays |
| Navigation | 500 | Step-by-step directions + multilingual |
| Translation | 400 | Text + metadata only |
| Transportation | 500 | JSON with arrays |
| Incident priority | 400 | Structured JSON — concise by design |
