# API Documentation

Base URL: `/api`

All endpoints accept and return `application/json`. All request bodies are validated with Zod schemas generated from `lib/api-spec/openapi.yaml`.

---

## Health

### `GET /api/healthz`

Returns server health status.

**Response `200`**
```json
{ "status": "ok", "timestamp": "2026-07-10T06:00:00.000Z" }
```

---

## Crowd

### `GET /api/crowd/gates`

Returns live crowd density data for all 12 stadium gates. Data is simulated and refreshes every 30 seconds.

**Response `200`** — array of `GateCrowdData`
```json
[
  {
    "id": "G-N1",
    "name": "Gate North 1",
    "section": "North Stand",
    "density": 0.82,
    "currentCount": 2624,
    "capacity": 3200,
    "waitMinutes": 8,
    "flowRate": 188,
    "status": "congested",
    "trend": "increasing"
  }
]
```

---

## Incidents

### `GET /api/incidents`

List all incidents ordered newest first.

**Response `200`** — array of `Incident`
```json
[
  {
    "id": 1,
    "location": "South Stand, Row 22",
    "description": "Fan reported feeling faint",
    "severity": "critical",
    "status": "in-progress",
    "aiPriority": "P1",
    "aiRecommendation": "Deploy medical team immediately",
    "reportedBy": "Steward A12",
    "createdAt": "2026-07-10T06:20:00.000Z",
    "updatedAt": "2026-07-10T06:21:00.000Z"
  }
]
```

### `POST /api/incidents`

Create a new incident. Rate-limited: **10 requests/minute per IP**.

**Request body**
```json
{
  "location": "Gate East 1, Section E3",
  "description": "Large crowd buildup causing entry delays",
  "severity": "high",
  "reportedBy": "Gate Supervisor"
}
```

**Response `201`** — created `Incident`

### `PATCH /api/incidents/:id`

Update an incident's status or AI triage result.

**Request body** (all fields optional)
```json
{
  "status": "in-progress",
  "aiPriority": "P2",
  "aiRecommendation": "Deploy security rapid response within 5 minutes"
}
```

**Response `200`** — updated `Incident`

**Response `404`** — incident not found

---

## AI Endpoints

All AI endpoints are rate-limited: **30 requests/minute per IP**.

### `POST /api/ai/copilot`

Conversational operations assistant.

**Request**
```json
{
  "message": "What should I do about Gate N1 at 85% capacity?",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**Response `200`**
```json
{
  "reply": "Immediate action: open Gate N2 overflow lane...",
  "tokensUsed": 312
}
```

---

### `POST /api/ai/crowd-analysis`

Predictive crowd flow analysis with AI risk assessment.

**Request**
```json
{
  "matchPhase": "pre-match",
  "gates": [
    { "gateId": "G-N1", "density": 0.82, "flowRate": 188, "waitMinutes": 8 }
  ]
}
```

**Response `200`**
```json
{
  "prediction": "North Stand will reach critical density within 12 minutes...",
  "recommendations": ["Open overflow lane at Gate N2", "Deploy 4 stewards to Gate N1"],
  "riskLevel": "high",
  "summary": "North Stand requires immediate attention."
}
```

---

### `POST /api/ai/navigation`

Multilingual fan wayfinding assistant.

**Request**
```json
{
  "query": "Where is the nearest restroom?",
  "currentLocation": "Section N5",
  "language": "es"
}
```

**Response `200`**
```json
{
  "answer": "El baño más cercano está en la Sección N3...",
  "nearestLocation": "Restrooms N3-N8",
  "estimatedWalkMinutes": 2,
  "directions": ["Gire a la derecha en el pasillo principal", "Siga las señales azules"]
}
```

**Supported `language` values:** `en`, `hi`, `es`, `fr`, `ar`, `pt`

---

### `POST /api/ai/translate`

Real-time text translation for fan-facing communications.

**Request**
```json
{
  "text": "Emergency exit on your left",
  "targetLanguage": "ar",
  "sourceLanguage": "en"
}
```

**Response `200`**
```json
{
  "translatedText": "مخرج الطوارئ على يسارك",
  "detectedSourceLanguage": "en",
  "targetLanguage": "ar"
}
```

---

### `POST /api/ai/transportation-recommendation`

Transport load + sustainability analysis and recommendations.

**Request**
```json
{
  "attendanceCount": 85000,
  "matchPhase": "post-match",
  "transportModes": [
    { "mode": "Metro Line 1", "currentLoad": 3200, "capacity": 4000, "predictedPeakMinutes": 15 }
  ],
  "sustainabilityMetrics": [
    { "name": "Carbon Emissions", "value": 42, "unit": "tCO2", "target": 50 }
  ]
}
```

**Response `200`**
```json
{
  "recommendation": "Stagger fan exit by sections to reduce metro surge...",
  "urgentActions": ["Open Express Bus route B7", "Activate park-and-ride overflow"],
  "sustainabilitySummary": "Carbon target on track — 84% of goal achieved.",
  "overallStatus": "advisory"
}
```

---

### `POST /api/ai/incident-priority`

AI-assisted incident triage with P1–P4 priority assignment.

**Request**
```json
{
  "location": "South Stand, Row 22, Seat 14",
  "description": "Fan reported feeling faint — possible heat exhaustion",
  "severity": "critical"
}
```

**Response `200`**
```json
{
  "suggestedPriority": "P1",
  "priorityLabel": "Immediate Emergency Response",
  "nearestResponse": "Medical Emergency Team — Station M-South",
  "recommendation": "Deploy medical team immediately. Secure 3m perimeter...",
  "estimatedResponseMinutes": 3
}
```

**Priority scale:**

| Code | Label | Response Time | Resources |
|------|-------|---------------|-----------|
| P1 | Immediate | 2–3 min | Fire brigade, medical emergency team |
| P2 | Urgent | 5–8 min | Medical first aid, security rapid response |
| P3 | Standard | 10–15 min | Steward response, maintenance |
| P4 | Routine | 20+ min | Customer service, information desk |

---

## Error Responses

All errors follow a consistent envelope:

```json
{ "error": "Human-readable error message" }
```

| Status | Meaning |
|--------|---------|
| `400` | Invalid request body — Zod validation failed |
| `404` | Resource not found |
| `429` | Rate limit exceeded |
| `500` | Internal server error (Groq timeout, DB failure) |
