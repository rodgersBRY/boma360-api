# Expenses Module

Tracks per-cow expenses: treatments, drugs, supplements, and other costs. Used by the dashboard to calculate profit.

## Endpoints

| Method | Path                       | Description             |
| ------ | -------------------------- | ----------------------- |
| `GET`  | `/v1/cows/:cowId/expenses` | List expenses for a cow |
| `POST` | `/v1/cows/:cowId/expenses` | Log an expense          |

## Log an Expense

`POST /v1/cows/:cowId/expenses`

```json
{
  "category": "drugs",
  "amount": 1500.0,
  "expense_date": "2026-04-04",
  "notes": "Penicillin — 10 vials"
}
```

| Field          | Type                                              | Required | Notes                   |
| -------------- | ------------------------------------------------- | -------- | ----------------------- |
| `category`     | `treatment` \| `drugs` \| `supplement` \| `other` | yes      |                         |
| `amount`       | number                                            | yes      | Decimal, e.g. `1500.00` |
| `expense_date` | date (YYYY-MM-DD)                                 | yes      |                         |
| `notes`        | string                                            | no       |                         |

## Dashboard Integration

Expenses feed:

- `monthly_expenses` — total farm expenses for the month
- `expense_per_cow` — per-cow expense totals for the month
- `profit` — calculated as `monthly_milk_income - monthly_expenses`

See [Dashboard README](../dashboard/README.md).

## Database Table

```sql
expense_logs (
  id           UUID PRIMARY KEY,
  cow_id       UUID NOT NULL REFERENCES cows(id) ON DELETE RESTRICT,
  category     VARCHAR(20) NOT NULL,  -- 'treatment' | 'drugs' | 'supplement' | 'other'
  amount       DECIMAL(10,2) NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
)
```

Indexes on `cow_id` and `expense_date`.
