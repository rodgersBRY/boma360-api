# Config Folder

This folder contains core application wiring used across modules.

## Files

- `db.ts`: Supabase client setup, request-scoped DB client resolution, and startup connectivity check.
- `requestContext.ts`: Async request context store used to attach per-request Supabase client instances.
- `express.ts`: Express app composition (middleware order, route registration, auth guard placement, 404 handler).
- `firebase-admin.ts`: Firebase Admin SDK initialization for FCM sends.
- `errors.ts`: Shared custom error classes used by services and middleware.
- `logger.ts`: Winston logger configuration used for app and request logs.

## Notes

- Runtime database access should use `getDbClient()` from `db.ts` so bearer-token context is respected for RLS.
- Notification sends use `firebase-admin.ts` and require `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`.
- `connectDB()` is for startup health verification, not request-time auth logic.
