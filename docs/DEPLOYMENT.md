# Deployment

## Replit Deployment (Recommended)

StadiumSense AI is designed for one-click deployment on Replit.

### Steps

1. Open the project in Replit
2. Ensure all secrets are set in **Replit Secrets**:
   - `GROQ_API_KEY` — primary Groq key
   - `GROQ_API_KEY_2` — secondary Groq key (for rotation)
   - `SESSION_SECRET` — random 64-character string
   - `DATABASE_URL` — auto-set by Replit PostgreSQL
3. Click **Deploy** in the Replit UI
4. Replit builds both the API server and frontend and provisions HTTPS

### Environment Differences

| Variable | Development | Production |
|----------|-------------|------------|
| `NODE_ENV` | `development` | `production` |
| `PORT` | Set by Replit | Set by Replit |
| `DATABASE_URL` | Replit dev DB | Replit prod DB |
| CORS | `localhost` + `*.replit.dev` | `*.replit.dev` only |

---

## Manual Deployment

### Prerequisites

- Node.js 20+
- pnpm 10+
- PostgreSQL 15+
- Groq API key

### Build

```bash
# Install
pnpm install

# Build shared libs
pnpm run typecheck:libs

# Build API server
pnpm --filter @workspace/api-server run build

# Build frontend
pnpm --filter @workspace/stadium-sense run build
```

### Database

```bash
pnpm run db:push    # apply Drizzle schema
pnpm run db:seed    # seed sample incidents
```

### Start

```bash
# API server (binds to $PORT)
PORT=8080 node artifacts/api-server/dist/index.mjs

# Frontend (served as static files by any HTTP server)
# Point your reverse proxy to artifacts/stadium-sense/dist/
```

### Reverse Proxy (nginx example)

```nginx
server {
  listen 80;
  server_name your-domain.com;

  # API
  location /api/ {
    proxy_pass http://localhost:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  # Frontend
  location / {
    root /path/to/artifacts/stadium-sense/dist;
    try_files $uri $uri/ /index.html;
  }
}
```

---

## Health Check

`GET /api/healthz` — returns `200 { "status": "ok" }`. Use this as the load-balancer health check endpoint.

---

## Secrets Management

- Never hard-code secrets in source code
- In production, use your platform's secret management (Replit Secrets, AWS Secrets Manager, etc.)
- Rotate Groq API keys periodically and whenever they are accidentally exposed
