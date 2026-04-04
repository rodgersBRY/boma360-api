# Milk Logs Module

Records daily milk production per cow. One entry per cow per day (enforced by a unique constraint). Supports multiple milking periods per day (morning, afternoon, evening).

## Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/v1/cows/:cowId/milk-logs` | List milk logs for a cow |
| `POST` | `/v1/cows/:cowId/milk-logs` | Log milk production |
| `PATCH` | `/v1/cows/:cowId/milk-logs/:id` | Update a milk log |

## Log Milk Production

`POST /v1/cows/:cowId/milk-logs`

```json
{
  "litres": 8.5,
  "period": "morning",
  "log_date": "2026-04-04",
  "notes": "Normal"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `litres` | number | yes | Decimal, e.g. `8.5` |
| `period` | `morning` \| `afternoon` \| `evening` | yes | |
| `log_date` | date (YYYY-MM-DD) | yes | |
| `notes` | string | no | |

A `409 Conflict` is returned if a log already exists for that cow on that date.

## Update a Milk Log

`PATCH /v1/cows/:cowId/milk-logs/:id`

Updatable fields: `litres`, `notes`.

## Alerts Integration

Active cows with no milk log for today appear in `/v1/alerts` under `no_milk_today`. See [Alerts README](../alerts/README.md).

## Dashboard Integration

Milk logs feed:
- `today_total_milk` — sum of all logs for today
- `monthly_milk_total` — sum for the selected month
- `milk_per_cow` — per-cow totals for the month

See [Dashboard README](../dashboard/README.md).

## Database Table

```sql
milk_logs (
  id         UUID PRIMARY KEY,
  cow_id     UUID NOT NULL REFERENCES cows(id) ON DELETE RESTRICT,
  log_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  litres     DECIMAL(6,2) NOT NULL,
  period     VARCHAR(10) NOT NULL,   -- 'morning' | 'afternoon' | 'evening'
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (cow_id, log_date)
)
```

Indexes on `cow_id` and `log_date`.
