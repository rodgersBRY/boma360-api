# Auth Module

Authentication is powered by Supabase Auth.

## Endpoints

| Method | Path               | Description |
| ------ | ------------------ | ----------- |
| `POST` | `/v1/auth/sign-up` | Register a new user |
| `POST` | `/v1/auth/sign-in` | Login and get session tokens |
| `POST` | `/v1/auth/refresh` | Exchange refresh token for a new session |
| `GET`  | `/v1/auth/me`      | Get current authenticated user |

## Request Examples

### Sign Up

```json
{
  "email": "farmer@example.com",
  "password": "strong-password",
  "full_name": "Farm Owner"
}
```

### Sign In

```json
{
  "email": "farmer@example.com",
  "password": "strong-password"
}
```

### Refresh Session

```json
{
  "refresh_token": "<refresh-token>"
}
```

## Protected Routes

All non-auth `/v1/*` routes require:

```http
Authorization: Bearer <access_token>
```
