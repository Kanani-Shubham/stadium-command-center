# Database

## Technology

StadiumSense AI uses **PostgreSQL** via **Drizzle ORM** with a type-safe schema.

## Schema

### `incidents` table

```sql
CREATE TABLE incidents (
  id            SERIAL PRIMARY KEY,
  location      TEXT NOT NULL,
  description   TEXT NOT NULL,
  severity      TEXT NOT NULL CHECK (severity IN ('low','medium','high','critical')),
  status        TEXT NOT NULL DEFAULT 'open'
                  CHECK (status IN ('open','in-progress','resolved')),
  ai_priority   TEXT CHECK (ai_priority IN ('P1','P2','P3','P4')),
  ai_recommendation TEXT,
  reported_by   TEXT,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

### Drizzle Schema Definition

See `lib/db/src/schema/incidents.ts` for the Drizzle schema. The schema uses `pgEnum` for `severity`, `status`, and `ai_priority` to enforce valid values at the ORM layer.

## Commands

```bash
# Apply schema changes to the connected database
pnpm run db:push

# Seed the database with sample incidents
pnpm run db:seed

# Open Drizzle Studio (visual database browser)
pnpm run db:studio
```

## Crowd Data

**Crowd density is not stored in the database.** It is simulated deterministically in `lib/crowdData.ts` and recomputed on every `GET /api/crowd/gates` request. The simulation seed rotates every 30 seconds, producing realistic variation without persistence overhead.

This design choice:

- Eliminates a write-heavy timeseries table for demo purposes
- Keeps the database focused on durable operational data (incidents)
- Allows the app to work identically in any environment without data population

## Connection

The database URL is provided via the `DATABASE_URL` environment variable. Drizzle connects via `node-postgres` (`pg` library) using the standard connection string format:

```
postgresql://user:password@host:5432/dbname
```

## Migrations

Schema changes follow Drizzle's push-based workflow for development. For production migrations, use `drizzle-kit generate` + `drizzle-kit migrate` to produce and apply SQL migration files.
