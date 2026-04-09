# Middleware Folder

This folder contains HTTP request/response middleware used by the API pipeline.

## Files

- `auth.ts`: Bearer token extraction, request-scoped Supabase context setup, and route protection (`requireAuth`).
- `validate.ts`: Zod-based request body and params validation.
- `normalizeBodyKeys.ts`: Converts incoming camelCase payload keys to snake_case.
- `camelCase.ts`: Converts outgoing response keys from snake_case to camelCase.
- `requestResponseLogger.ts`: Structured request/response logging hooks.
- `errorHandler.ts`: Central error mapping (custom errors + Supabase/Postgres-style errors) to API responses.

## Order Expectations

The middleware stack order in `config/express.ts` is intentional:
1. Request preprocessing (`normalizeBodyKeys`, auth context).
2. Route handlers and validation.
3. Error handling (`errorHandler`) as the terminal middleware.
