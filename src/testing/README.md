# Test Seed Data

This folder contains the repeatable seed setup used for local testing and demo data.

## What It Seeds

The seed inserts a fixed set of records across the main API tables:

- `cows`
- `health_records`
- `breeding_records`
- `milk_logs`
- `expense_logs`
- `milk_sales`

The records are relationally linked so the dashboard, alerts, and detail endpoints have realistic data to work with.

## Behavior

The seeder is deterministic and rerunnable.

- It deletes only the known test records by their fixed UUIDs
- It recreates the same dataset on each run
- It does not wipe the whole database
- It is skipped automatically when `NODE_ENV=production` and startup seeding is enabled

## Run Manually

From the `api/` directory:

```bash
npm run seed:test
```

## Seed On Startup

You can also seed automatically when the API starts:

```bash
SEED_TEST_DATA_ON_STARTUP=true npm run dev
```

This is useful when you want a ready-to-test backend every time the local server boots.

## Files

- `seedTestData.ts`: builds and inserts the test dataset
- `../scripts/seedTestData.ts`: script entry point for `npm run seed:test`

## Notes

- Run migrations before seeding
- The seeded dates are relative to the current day, so alerts and dashboard summaries stay useful over time
