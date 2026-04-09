# Cattle Manager API

A REST API for daily dairy cattle farm management. Built with Node.js, TypeScript, Express, and Supabase-managed PostgreSQL.

## Overview

The API covers the full lifecycle of a dairy operation:

- Cow registry
- Health records (treatments, vaccinations, deworming)
- Breeding records (heat, service, pregnancy checks, calvings)
- Daily milk production logs
- Per-cow expense tracking
- Farm-level milk sales
- Real-time alerts and dashboard metrics

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Language | TypeScript 5.8 |
| Framework | Express 4 |
| Database | Supabase Postgres |
| Schema/Migrations | Prisma 6 |
| Validation | Zod |
| Logging | Winston |

## Project Structure

```
api/
├── src/
│   ├── app.ts                  # Entry point
│   ├── config/
│   │   ├── db.ts               # Supabase/Postgres pool and transaction helper
│   │   ├── express.ts          # Express setup, middleware, route mounting
│   │   ├── logger.ts           # Winston logger
│   │   └── errors.ts           # Custom error classes
│   ├── env/                    # Environment variable loaders
│   ├── lib/
│   │   └── pagination.ts       # Offset-based pagination utility
│   ├── middleware/
│   │   ├── camelCase.ts        # snake_case → camelCase response transformer
│   │   ├── errorHandler.ts     # Global error handler
│   │   ├── normalizeBodyKeys.ts # camelCase request body → snake_case normalizer
│   │   ├── requestResponseLogger.ts # Structured request/response logging
│   │   └── validate.ts         # Zod request validation
│   ├── scripts/                # CLI helpers like test seeding
│   └── testing/                # Repeatable local/test data setup
│   └── modules/
│       ├── cows/               # Cow registry
│       ├── health/             # Health records
│       ├── breeding/           # Breeding records
│       ├── milk/               # Milk production logs
│       ├── expenses/           # Per-cow expenses
│       ├── milk_sales/         # Farm-level milk sales
│       ├── alerts/             # Alert queries
│       └── dashboard/          # Dashboard metrics
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # SQL migration files
├── api.http                    # HTTP test file (all endpoints)
└── .env.example                # Environment template
```

Each module follows the same internal structure:

```
modules/{name}/
├── {name}.router.ts      # Route definitions
├── {name}.controller.ts  # Request/response handling
├── {name}.service.ts     # Business logic and SQL
├── {name}.schema.ts      # Zod validation schemas
└── {name}.types.ts       # TypeScript types
```

## API Versioning

All routes are prefixed with `/v1/`.

## Endpoints Summary

| Module | Base Path | Docs |
|---|---|---|
| Cows | `/v1/cows` | [README](src/modules/cows/README.md) |
| Health Records | `/v1/cows/:cowId/health-records` | [README](src/modules/health/README.md) |
| Breeding Records | `/v1/cows/:cowId/breeding-records` | [README](src/modules/breeding/README.md) |
| Milk Logs | `/v1/cows/:cowId/milk-logs` | [README](src/modules/milk/README.md) |
| Expenses | `/v1/cows/:cowId/expenses` | [README](src/modules/expenses/README.md) |
| Milk Sales | `/v1/milk-sales` | [README](src/modules/milk_sales/README.md) |
| Alerts | `/v1/alerts` | [README](src/modules/alerts/README.md) |
| Dashboard | `/v1/dashboard` | [README](src/modules/dashboard/README.md) |

## Setup

### Requirements

- Node.js 18+
- A Supabase project with Postgres enabled

### Install

```bash
npm install
```

### Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```env
NODE_ENV=development
PORT=3001
SUPABASE_PROJECT_REF=your-project-ref
DATABASE_URL=postgresql://postgres.your-project-ref:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres:password@db.your-project-ref.supabase.co:5432/postgres
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
```

### Run Migrations

```bash
npm run migrate:deploy
```

### Start Server

```bash
# Development (auto-reload)
npm run dev

# Production
npm run build && npm start
```

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with nodemon |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled build |
| `npm run seed:test` | Insert repeatable local test data |
| `npm run migrate` | Create and apply a new migration |
| `npm run migrate:deploy` | Apply pending migrations (production) |

## Test Seed Data

The API includes a repeatable test seed for local development and manual QA.

- Manual seed: `npm run seed:test`
- Seed during startup: `SEED_TEST_DATA_ON_STARTUP=true npm run dev`
- Production safety: startup seeding is skipped when `NODE_ENV=production`

The seed creates linked cows, health records, breeding records, milk logs, expense logs, and milk sales so the client has realistic data for lists, alerts, and dashboard screens.

More detail: [src/testing/README.md](src/testing/README.md)

## Database Design

Supabase runs PostgreSQL under the hood, so Prisma still uses the `postgresql` provider. The schema only declares the provider, while `prisma.config.ts` supplies the Migrate connection. `DATABASE_URL` is intended for the pooled application connection, while `DIRECT_URL` is used for direct Prisma migration access. If `DIRECT_URL` is not set, the config falls back to `DATABASE_URL` so local development does not break.

All tables use UUID primary keys. Cows are never hard-deleted — use `status` (`active`, `sold`, `dead`). Foreign keys use `ON DELETE RESTRICT` to prevent orphaned records.

See individual module READMEs for table schemas.

## Response Format

All responses use camelCase keys regardless of database column naming.

**List endpoints** return paginated responses:

```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "total_pages": 3,
    "has_next": true,
    "has_prev": false
  }
}
```

**Query params for pagination:** `?page=1&limit=20`

## Error Handling

Errors return consistent JSON:

```json
{
  "error": "Description of what went wrong"
}
```

Common HTTP status codes:

| Code | Meaning |
|---|---|
| 400 | Validation error |
| 404 | Resource not found |
| 409 | Unique constraint violation |
| 422 | Foreign key or check constraint violation |
| 500 | Internal server error |

## Testing

Use `api.http` with the [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) VS Code extension or any HTTP client that supports `.http` files (e.g., JetBrains HTTP Client).
