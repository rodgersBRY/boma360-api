# Alerts Module

Returns derived alerts based on current data. No separate table — all alerts are live queries run at request time.

## Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/v1/alerts` | Get all active alerts |

## Response

```json
{
  "health_due": [
    {
      "cowId": "...",
      "tagNumber": "COW-001",
      "breed": "Friesian",
      "recordId": "...",
      "type": "treatment",
      "nextDueDate": "2026-04-04",
      "description": "Mastitis treatment"
    }
  ],
  "calving_due": [
    {
      "cowId": "...",
      "tagNumber": "COW-002",
      "breed": "Jersey",
      "breedingRecordId": "...",
      "expectedCalvingDate": "2026-04-04"
    }
  ],
  "no_milk_today": [
    {
      "cowId": "...",
      "tagNumber": "COW-003",
      "breed": "Friesian"
    }
  ],
  "recently_treated": [
    {
      "cowId": "...",
      "tagNumber": "COW-001",
      "breed": "Friesian",
      "recordId": "...",
      "type": "treatment",
      "recordDate": "2026-03-28",
      "description": "Mastitis treatment"
    }
  ]
}
```

## Alert Types

| Key | Source | Condition |
|---|---|---|
| `health_due` | `health_records` | `next_due_date <= today` on active cows |
| `calving_due` | `breeding_records` | `expected_calving_date <= today` (service/pregnancy_check events) on active cows |
| `no_milk_today` | `milk_logs` | Active cows with no `milk_logs` entry for today |
| `recently_treated` | `health_records` | Treatment records from the last 7 days on active cows |

All four lists are always returned. An empty list means no alerts for that category.
