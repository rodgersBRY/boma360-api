# Milk Sales Module

Records farm-level milk sales. Not tied to individual cows. `total_amount` is computed in API business logic as `litres_sold * price_per_litre`.

## Endpoints

| Method | Path             | Description         |
| ------ | ---------------- | ------------------- |
| `GET`  | `/v1/milk-sales` | List all milk sales |
| `POST` | `/v1/milk-sales` | Log a milk sale     |

## Log a Sale

`POST /v1/milk-sales`

```json
{
  "sale_date": "2026-04-04",
  "litres_sold": 100.0,
  "price_per_litre": 50.0,
  "buyer": "Dairy Cooperative",
  "notes": "Grade A milk"
}
```

| Field             | Type              | Required | Notes |
| ----------------- | ----------------- | -------- | ----- |
| `sale_date`       | date (YYYY-MM-DD) | yes      |       |
| `litres_sold`     | number            | yes      |       |
| `price_per_litre` | number            | yes      |       |
| `buyer`           | string            | no       |       |
| `notes`           | string            | no       |       |

`total_amount` is not accepted in the request — it is always calculated by the API service.

## Dashboard Integration

Milk sales feed:

- `monthly_milk_income` — sum of `total_amount` for the selected month
- `profit` — calculated as `monthly_milk_income - monthly_expenses`

See [Dashboard README](../dashboard/README.md).

## Database Table

```sql
milk_sales (
  id              UUID PRIMARY KEY,
  sale_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  litres_sold     DECIMAL(8,2) NOT NULL,
  price_per_litre DECIMAL(8,2) NOT NULL,
  total_amount    DECIMAL(12,2) NOT NULL,
  buyer           VARCHAR(200),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
)
```

Index on `sale_date`.
