# Deployment Guide

This guide details the procedures for building and deploying StadiumSense AI in a production environment.

---

## Production Environments

StadiumSense AI can be deployed to any platform supporting Node.js or Docker container virtualization.

### Recommended Providers

- **Render / Railway / Fly.io**: Ideal for hosting the Node.js API server and PostgreSQL database.
- **Vercel / Netlify**: Ideal for static hosting of the built frontend client assets.
- **Self-Hosted Nginx / Docker**: Best for full control over virtualization and ingress proxying.

---

## Docker Deployment (Recommended)

A `Dockerfile` or `docker-compose.yml` can build and containerize the monorepo workspaces.

### 1. Build and Run Container

```bash
docker build -t stadiumsense-app .
docker run -p 8080:8080 --env-file .env stadiumsense-app
```

### 2. Example `docker-compose.yml`

```yaml
version: "3.8"

services:
  database:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secure_password
      POSTGRES_DB: stadiumsense
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  api:
    image: stadiumsense-app
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - PORT=8080
      - DATABASE_URL=postgresql://postgres:secure_password@database:5432/stadiumsense
      - SESSION_SECRET=production_secret_key_64_characters_long
      - GROQ_API_KEY=gsk_your_groq_key
    depends_on:
      - database

volumes:
  pgdata:
```

---

## Render Deployment (PaaS Example)

### Step 1: Deploy PostgreSQL Database

1. Create a new **PostgreSQL** database on Render.
2. Note the internal or external Connection String.

### Step 2: Deploy the API Web Service

1. Create a new **Web Service** on Render connected to your repository.
2. Select **Node** runtime.
3. Configure the build and start scripts:
   - **Build Command**: `pnpm install && pnpm run build`
   - **Start Command**: `node artifacts/api-server/dist/index.mjs`
4. Set the following **Environment Variables**:
   - `NODE_ENV` = `production`
   - `PORT` = `8080`
   - `DATABASE_URL` = _(Your Render database connection string)_
   - `SESSION_SECRET` = _(Generate using `openssl rand -hex 32`)_
   - `GROQ_API_KEY` = _(Your Groq API Key)_
   - `ALLOWED_ORIGINS` = `https://your-frontend.com`

---

## Static Hosting & Reverse Proxy (Nginx)

In a self-hosted environment, Nginx acts as both the static file server for the React client and the reverse proxy for API routes.

### Nginx Configuration File (`/etc/nginx/sites-available/stadiumsense`)

```nginx
server {
    listen 80;
    server_name stadium.example.com;

    # ── Security Headers ──
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://api.groq.com;" always;

    # ── Static React Client Assets ──
    location / {
        root /var/www/stadiumsense/artifacts/stadium-sense/dist/public;
        try_files $uri $uri/ /index.html;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # ── Express API Server Ingress Proxy ──
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Environment Variable Schema

| Variable Name     | Description                       | Default       | Allowed Values              |
| :---------------- | :-------------------------------- | :------------ | :-------------------------- |
| `NODE_ENV`        | Running mode context              | `development` | `development`, `production` |
| `PORT`            | Listening port for the API server | `8080`        | Any valid open port         |
| `DATABASE_URL`    | PG Database connection URI        | _(Required)_  | `postgresql://...`          |
| `SESSION_SECRET`  | Express session crypt key         | _(Required)_  | String (>= 32 chars)        |
| `GROQ_API_KEY`    | Primary inference access token    | _(Required)_  | `gsk_...`                   |
| `GROQ_API_KEY_2`  | Backup key for token rotation     | `None`        | `gsk_...`                   |
| `ALLOWED_ORIGINS` | CORS allowed origins array        | `*`           | Comma-separated list        |

---

## Health Check and Diagnostics

- **Endpoint**: `GET /api/healthz`
- **Response**: `200 OK`
  ```json
  { "status": "ok" }
  ```
- **Usage**: Bind this endpoint to Docker container healthcheck declarations, AWS Target Group checks, or Nginx health status monitoring tools.

---

## Secrets Management Policy

- **Never commit `.env` files** to Git repository branches.
- Use platform secret managers (Render Secrets, AWS Secrets Manager, GitHub Actions Secret vaults) to securely inject keys into the production context.
- Implement monthly rotation cycles for API keys and database credentials to maintain enterprise compliance.
