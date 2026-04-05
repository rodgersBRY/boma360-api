# Breeding Records Module

Tracks the full breeding cycle per cow: heat detection, AI/natural service, pregnancy checks, and calvings. When a calving is recorded, a new cow (calf) is automatically created in the same transaction.

## Endpoints

| Method | Path                                   | Description                     |
| ------ | -------------------------------------- | ------------------------------- |
| `GET`  | `/v1/cows/:cowId/breeding-records`     | List breeding records for a cow |
| `POST` | `/v1/cows/:cowId/breeding-records`     | Create a breeding record        |
| `GET`  | `/v1/cows/:cowId/breeding-records/:id` | Get a single breeding record    |

## Create a Breeding Record

`POST /v1/cows/:cowId/breeding-records`

### Heat / Service / Pregnancy Check

```json
{
  "event_type": "service",
  "event_date": "2026-04-05",
  "expected_calving_date": "2027-01-10",
  "notes": "AI — Friesian semen"
}
```

### Calving (auto-creates calf)

When `event_type` is `calving`, include a `calf` object. The calf is created as a new cow in the same database transaction.

```json
{
  "event_type": "calving",
  "event_date": "2027-01-10",
  "notes": "Normal birth, heifer",
  "calf": {
    "tag_number": "CALF-042",
    "breed": "Friesian",
    "date_of_birth": "2027-01-10"
  }
}
```

| Field                   | Type                                                  | Required                       | Notes                                 |
| ----------------------- | ----------------------------------------------------- | ------------------------------ | ------------------------------------- |
| `event_type`            | `heat` \| `service` \| `pregnancy_check` \| `calving` | yes                            |                                       |
| `event_date`            | date (YYYY-MM-DD)                                     | yes                            |                                       |
| `expected_calving_date` | date (YYYY-MM-DD)                                     | no                             | Set on service/pregnancy_check events |
| `notes`                 | string                                                | no                             |                                       |
| `calf`                  | object                                                | only when `event_type=calving` | See calf fields below                 |
| `calf.tag_number`       | string                                                | yes (for calving)              | Must be unique                        |
| `calf.breed`            | string                                                | yes (for calving)              |                                       |
| `calf.date_of_birth`    | date                                                  | yes (for calving)              |                                       |

### Calving Response

Returns both the breeding record and the newly created calf:

```json
{
  "breedingRecord": { ... },
  "calf": {
    "id": "...",
    "tag_number": "CALF-042",
    "breed": "Friesian",
    "date_of_birth": "2027-01-10",
    "source": "born",
    "status": "active"
  }
}
```

## Alerts Integration

Cows with `expected_calving_date <= today` on `service` or `pregnancy_check` records appear in `/v1/alerts` under `calving_due`. See [Alerts README](../alerts/README.md).

## Database Table

```sql
breeding_records (
  id                    UUID PRIMARY KEY,
  cow_id                UUID NOT NULL REFERENCES cows(id) ON DELETE RESTRICT,
  event_type            VARCHAR(20) NOT NULL,  -- 'heat' | 'service' | 'pregnancy_check' | 'calving'
  event_date            DATE NOT NULL,
  expected_calving_date DATE,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
)
```

Indexes on `cow_id`, `expected_calving_date`, and `event_type`.
