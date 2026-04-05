# Cows Module

Manages the cow registry. Every other module references a cow via `cowId`.

## Endpoints

| Method  | Path           | Description        |
| ------- | -------------- | ------------------ |
| `GET`   | `/v1/cows`     | List all cows      |
| `POST`  | `/v1/cows`     | Register a new cow |
| `GET`   | `/v1/cows/:id` | Get a single cow   |
| `PATCH` | `/v1/cows/:id` | Update a cow       |

## Register a Cow

`POST /v1/cows`

```json
{
  "tag_number": "COW-001",
  "breed": "Friesian",
  "date_of_birth": "2020-03-15",
  "source": "bought"
}
```

| Field           | Type               | Required | Notes                          |
| --------------- | ------------------ | -------- | ------------------------------ |
| `tag_number`    | string             | yes      | Must be unique across all cows |
| `breed`         | string             | yes      |                                |
| `date_of_birth` | date (YYYY-MM-DD)  | yes      |                                |
| `source`        | `bought` \| `born` | yes      |                                |

## List Cows

`GET /v1/cows`

Optional query params:

| Param    | Description                           | Default |
| -------- | ------------------------------------- | ------- |
| `status` | Filter by `active`, `sold`, or `dead` | all     |
| `page`   | Page number                           | 1       |
| `limit`  | Results per page                      | 20      |

## Update a Cow

`PATCH /v1/cows/:id`

```json
{
  "breed": "Jersey",
  "status": "sold"
}
```

All fields are optional. Valid `status` values: `active`, `sold`, `dead`.

Cows are never hard-deleted. To retire a cow, set `status` to `sold` or `dead`.

## Database Table

```sql
cows (
  id            UUID PRIMARY KEY,
  tag_number    VARCHAR(50) UNIQUE NOT NULL,
  breed         VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  source        VARCHAR(10) NOT NULL,   -- 'bought' | 'born'
  status        VARCHAR(10) NOT NULL DEFAULT 'active',  -- 'active' | 'sold' | 'dead'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
)
```

Indexes on `status` and `tag_number`.
