# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| latest  | ✅ Yes    |

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

To report a security issue, email the maintainers directly or use GitHub's private security advisory feature:

1. Go to the **Security** tab of this repository
2. Click **Report a vulnerability**
3. Fill in the details

We will acknowledge your report within 48 hours and aim to release a fix within 7 days for critical issues.

---

## Security Architecture

### API Key Protection

- `GROQ_API_KEY` and `GROQ_API_KEY_2` are stored exclusively as server-side environment secrets
- Keys are **never** injected into client bundles, never logged, and never returned in API responses
- The API client is generated from the OpenAPI spec and calls the Express backend — not Groq directly

### HTTP Security Headers (Helmet)

The API server applies `helmet` with the following policies:

| Header                      | Value                                   |
| --------------------------- | --------------------------------------- |
| `Content-Security-Policy`   | `default-src 'self'; script-src 'self'` |
| `X-Frame-Options`           | `SAMEORIGIN`                            |
| `X-Content-Type-Options`    | `nosniff`                               |
| `Referrer-Policy`           | `no-referrer`                           |
| `Strict-Transport-Security` | Enforced in production                  |

### CORS

- Restricted to allowed origins configured via the `ALLOWED_ORIGINS` environment variable in production
- `localhost` and `127.0.0.1` allowed in non-production environments for local testing and development

### Input Validation

- All API request bodies are validated with **Zod schemas** generated from the OpenAPI specification
- Invalid inputs return `400 Bad Request` with no internal stack traces exposed
- Request body size is limited to `100kb`

### Rate Limiting

| Endpoint group                            | Limit             |
| ----------------------------------------- | ----------------- |
| AI endpoints (`/api/ai/*`)                | 30 req/min per IP |
| Incident creation (`POST /api/incidents`) | 10 req/min per IP |

### Dependency Audit

Run `pnpm audit` to check for known vulnerabilities in dependencies.

### Environment Variables

- Copy `.env.example` to `.env` for local development
- **Never** commit `.env` to version control
- Rotate API keys immediately if they are ever exposed in code, logs, or chat

### OWASP Top 10 Coverage

| Risk                          | Mitigation                                                         |
| ----------------------------- | ------------------------------------------------------------------ |
| A01 Broken Access Control     | Role-based middleware; no unauthenticated write without rate-limit |
| A02 Cryptographic Failures    | No sensitive data stored client-side; HTTPS enforced via HSTS      |
| A03 Injection                 | Zod validation on all inputs; Drizzle parameterized queries        |
| A04 Insecure Design           | OpenAPI-first contract prevents design drift                       |
| A05 Security Misconfiguration | Helmet defaults; CORS allowlist; body size limits                  |
| A06 Vulnerable Components     | `pnpm audit` in CI; Dependabot recommended                         |
| A07 Auth Failures             | Session secret from env; rate limiting on all write endpoints      |
| A08 Data Integrity            | Zod schema validation on every response                            |
| A09 Logging Failures          | Pino structured logging; no PII in logs                            |
| A10 SSRF                      | No server-side URL fetching from user input                        |
