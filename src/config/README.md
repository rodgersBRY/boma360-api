# Config Folder

This folder contains core application wiring used across modules.

## Files

- `db.ts`: Supabase client setup, request-scoped DB client resolution, and startup connectivity check.
- `requestContext.ts`: Async request context store used to attach per-request Supabase client instances.
- `express.ts`: Express app composition (middleware order, route registration, auth guard placement, 404 handler).
- `errors.ts`: Shared custom error classes used by services and middleware.
- `logger.ts`: Winston logger configuration used for app and request logs.

## Notes

- Runtime database access should use `getDbClient()` from `db.ts` so bearer-token context is respected for RLS.
- `connectDB()` is for startup health verification, not request-time auth logic.
