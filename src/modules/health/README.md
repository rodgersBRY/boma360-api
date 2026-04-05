# Health Records Module

Tracks treatments, vaccinations, and deworming events per cow. Supports scheduling follow-up dates.

## Endpoints

| Method  | Path                                 | Description                   |
| ------- | ------------------------------------ | ----------------------------- |
| `GET`   | `/v1/cows/:cowId/health-records`     | List health records for a cow |
| `POST`  | `/v1/cows/:cowId/health-records`     | Create a health record        |
| `GET`   | `/v1/cows/:cowId/health-records/:id` | Get a single health record    |
| `PATCH` | `/v1/cows/:cowId/health-records/:id` | Update a health record        |

## Create a Health Record

`POST /v1/cows/:cowId/health-records`

```json
{
  "type": "treatment",
  "description": "Mastitis — left rear quarter",
  "drug_used": "Penicillin",
  "record_date": "2026-04-04",
  "next_due_date": "2026-04-11",
  "notes": "Recheck in one week"
}
```

| Field           | Type                                        | Required | Notes                                   |
| --------------- | ------------------------------------------- | -------- | --------------------------------------- |
| `type`          | `treatment` \| `vaccination` \| `deworming` | yes      |                                         |
| `description`   | string                                      | yes      |                                         |
| `drug_used`     | string                                      | no       |                                         |
| `record_date`   | date (YYYY-MM-DD)                           | yes      |                                         |
| `next_due_date` | date (YYYY-MM-DD)                           | no       | Used by alerts when follow-up is needed |
| `notes`         | string                                      | no       |                                         |

## Update a Health Record

`PATCH /v1/cows/:cowId/health-records/:id`

Updatable fields: `next_due_date`, `notes`.

## Alerts Integration

Records with `next_due_date <= today` on active cows appear in the `/v1/alerts` response under `health_due`. See [Alerts README](../alerts/README.md).

## Database Table

```sql
health_records (
  id            UUID PRIMARY KEY,
  cow_id        UUID NOT NULL REFERENCES cows(id) ON DELETE RESTRICT,
  type          VARCHAR(20) NOT NULL,   -- 'treatment' | 'vaccination' | 'deworming'
  description   TEXT NOT NULL,
  drug_used     VARCHAR(200),
  next_due_date DATE,
  record_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
)
```

Indexes on `cow_id` and `next_due_date`.
