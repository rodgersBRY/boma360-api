import { PoolClient } from 'pg';
import { logger } from '../config/logger';
import { withTransaction } from '../config/db';

const TEST_COW_IDS = {
  daisy: '11111111-1111-4111-8111-111111111111',
  bella: '22222222-2222-4222-8222-222222222222',
  nala: '33333333-3333-4333-8333-333333333333',
  ruby: '44444444-4444-4444-8444-444444444444',
} as const;

const TEST_RECORD_IDS = {
  healthDaisyTreatment: 'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
  healthBellaVaccination: 'aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
  healthNalaDeworming: 'aaaaaaa3-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
  breedingBellaService: 'bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
  breedingBellaPregnancy: 'bbbbbbb2-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
  breedingRubyCalving: 'bbbbbbb3-bbbb-4bbb-8bbb-bbbbbbbbbbb3',
  milkDaisyToday: 'ccccccc1-cccc-4ccc-8ccc-ccccccccccc1',
  milkBellaYesterday: 'ccccccc2-cccc-4ccc-8ccc-ccccccccccc2',
  milkRubyThreeDaysAgo: 'ccccccc3-cccc-4ccc-8ccc-ccccccccccc3',
  expenseDaisyFeed: 'ddddddd1-dddd-4ddd-8ddd-ddddddddddd1',
  expenseBellaTreatment: 'ddddddd2-dddd-4ddd-8ddd-ddddddddddd2',
  expenseRubyMinerals: 'ddddddd3-dddd-4ddd-8ddd-ddddddddddd3',
  saleToday: 'eeeeeee1-eeee-4eee-8eee-eeeeeeeeeee1',
  saleTwoDaysAgo: 'eeeeeee2-eeee-4eee-8eee-eeeeeeeeeee2',
} as const;

const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const toDateOnly = (date: Date): string => date.toISOString().slice(0, 10);

const deleteSeedData = async (client: PoolClient): Promise<void> => {
  const cowIds = Object.values(TEST_COW_IDS);
  const recordIds = Object.values(TEST_RECORD_IDS);

  await client.query('DELETE FROM health_records WHERE id = ANY($1::uuid[])', [
    recordIds,
  ]);
  await client.query('DELETE FROM breeding_records WHERE id = ANY($1::uuid[])', [
    recordIds,
  ]);
  await client.query('DELETE FROM milk_logs WHERE id = ANY($1::uuid[])', [
    recordIds,
  ]);
  await client.query('DELETE FROM expense_logs WHERE id = ANY($1::uuid[])', [
    recordIds,
  ]);
  await client.query('DELETE FROM milk_sales WHERE id = ANY($1::uuid[])', [
    recordIds,
  ]);

  await client.query('DELETE FROM health_records WHERE cow_id = ANY($1::uuid[])', [
    cowIds,
  ]);
  await client.query(
    'DELETE FROM breeding_records WHERE cow_id = ANY($1::uuid[])',
    [cowIds],
  );
  await client.query('DELETE FROM milk_logs WHERE cow_id = ANY($1::uuid[])', [
    cowIds,
  ]);
  await client.query('DELETE FROM expense_logs WHERE cow_id = ANY($1::uuid[])', [
    cowIds,
  ]);
  await client.query('DELETE FROM cows WHERE id = ANY($1::uuid[])', [cowIds]);
};

const insertSeedData = async (client: PoolClient): Promise<void> => {
  const today = new Date();
  const eightMonthsAgo = addDays(today, -240);
  const fifteenMonthsAgo = addDays(today, -450);
  const threeYearsAgo = addDays(today, -1095);
  const fourYearsAgo = addDays(today, -1460);

  const cows = [
    {
      id: TEST_COW_IDS.daisy,
      tagNumber: 'CM-1001',
      breed: 'Friesian',
      dateOfBirth: toDateOnly(fourYearsAgo),
      source: 'bought',
      status: 'active',
    },
    {
      id: TEST_COW_IDS.bella,
      tagNumber: 'CM-1002',
      breed: 'Jersey',
      dateOfBirth: toDateOnly(threeYearsAgo),
      source: 'bought',
      status: 'active',
    },
    {
      id: TEST_COW_IDS.nala,
      tagNumber: 'CM-1003',
      breed: 'Ayrshire',
      dateOfBirth: toDateOnly(fifteenMonthsAgo),
      source: 'born',
      status: 'active',
    },
    {
      id: TEST_COW_IDS.ruby,
      tagNumber: 'CM-1004',
      breed: 'Friesian Cross',
      dateOfBirth: toDateOnly(eightMonthsAgo),
      source: 'born',
      status: 'active',
    },
  ] as const;

  for (const cow of cows) {
    await client.query(
      `
        INSERT INTO cows (id, tag_number, breed, date_of_birth, source, status)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        cow.id,
        cow.tagNumber,
        cow.breed,
        cow.dateOfBirth,
        cow.source,
        cow.status,
      ],
    );
  }

  await client.query(
    `
      INSERT INTO health_records
      (id, cow_id, type, description, drug_used, next_due_date, record_date, notes)
      VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8),
      ($9, $10, $11, $12, $13, $14, $15, $16),
      ($17, $18, $19, $20, $21, $22, $23, $24)
    `,
    [
      TEST_RECORD_IDS.healthDaisyTreatment,
      TEST_COW_IDS.daisy,
      'treatment',
      'Treated for mastitis',
      'Oxytetracycline',
      toDateOnly(addDays(today, 4)),
      toDateOnly(addDays(today, -2)),
      'Responding well to treatment.',
      TEST_RECORD_IDS.healthBellaVaccination,
      TEST_COW_IDS.bella,
      'vaccination',
      'Annual FMD vaccination',
      'FMD vaccine',
      toDateOnly(addDays(today, 28)),
      toDateOnly(addDays(today, -7)),
      'Booster due later this month.',
      TEST_RECORD_IDS.healthNalaDeworming,
      TEST_COW_IDS.nala,
      'deworming',
      'Routine deworming',
      'Albendazole',
      toDateOnly(addDays(today, 14)),
      toDateOnly(addDays(today, -1)),
      'Monitor weight gain over the next two weeks.',
    ],
  );

  await client.query(
    `
      INSERT INTO breeding_records
      (id, cow_id, event_type, event_date, expected_calving_date, notes)
      VALUES
      ($1, $2, $3, $4, $5, $6),
      ($7, $8, $9, $10, $11, $12),
      ($13, $14, $15, $16, $17, $18)
    `,
    [
      TEST_RECORD_IDS.breedingBellaService,
      TEST_COW_IDS.bella,
      'service',
      toDateOnly(addDays(today, -120)),
      toDateOnly(addDays(today, 160)),
      'Served by AI technician.',
      TEST_RECORD_IDS.breedingBellaPregnancy,
      TEST_COW_IDS.bella,
      'pregnancy_check',
      toDateOnly(addDays(today, -60)),
      toDateOnly(addDays(today, 25)),
      'Pregnancy confirmed.',
      TEST_RECORD_IDS.breedingRubyCalving,
      TEST_COW_IDS.ruby,
      'calving',
      toDateOnly(addDays(today, -210)),
      null,
      'Healthy calving recorded in past season.',
    ],
  );

  await client.query(
    `
      INSERT INTO milk_logs
      (id, cow_id, log_date, litres, period, notes)
      VALUES
      ($1, $2, $3, $4, $5, $6),
      ($7, $8, $9, $10, $11, $12),
      ($13, $14, $15, $16, $17, $18)
    `,
    [
      TEST_RECORD_IDS.milkDaisyToday,
      TEST_COW_IDS.daisy,
      toDateOnly(today),
      18.5,
      'morning',
      'Strong yield this morning.',
      TEST_RECORD_IDS.milkBellaYesterday,
      TEST_COW_IDS.bella,
      toDateOnly(addDays(today, -1)),
      15.25,
      'morning',
      'Skipped today to keep no-milk alert coverage.',
      TEST_RECORD_IDS.milkRubyThreeDaysAgo,
      TEST_COW_IDS.ruby,
      toDateOnly(addDays(today, -3)),
      9.75,
      'morning',
      'Starter production from young cow.',
    ],
  );

  await client.query(
    `
      INSERT INTO expense_logs
      (id, cow_id, category, amount, expense_date, notes)
      VALUES
      ($1, $2, $3, $4, $5, $6),
      ($7, $8, $9, $10, $11, $12),
      ($13, $14, $15, $16, $17, $18)
    `,
    [
      TEST_RECORD_IDS.expenseDaisyFeed,
      TEST_COW_IDS.daisy,
      'supplement',
      1800,
      toDateOnly(addDays(today, -2)),
      'Protein boost after treatment.',
      TEST_RECORD_IDS.expenseBellaTreatment,
      TEST_COW_IDS.bella,
      'treatment',
      950,
      toDateOnly(addDays(today, -5)),
      'Pregnancy follow-up exam.',
      TEST_RECORD_IDS.expenseRubyMinerals,
      TEST_COW_IDS.ruby,
      'drugs',
      620,
      toDateOnly(addDays(today, -9)),
      'Vitamin and mineral support.',
    ],
  );

  await client.query(
    `
      INSERT INTO milk_sales
      (id, sale_date, litres_sold, price_per_litre, total_amount, buyer, notes)
      VALUES
      ($1, $2, $3, $4, $5, $6, $7),
      ($8, $9, $10, $11, $12, $13, $14)
    `,
    [
      TEST_RECORD_IDS.saleToday,
      toDateOnly(today),
      32.0,
      58.0,
      1856.0,
      'Nyeri Dairy Cooperative',
      'Morning delivery.',
      TEST_RECORD_IDS.saleTwoDaysAgo,
      toDateOnly(addDays(today, -2)),
      28.5,
      57.5,
      1638.75,
      'Local milk bar',
      'Cash sale.',
    ],
  );
};

export const seedTestData = async (): Promise<void> => {
  await withTransaction(async (client) => {
    await deleteSeedData(client);
    await insertSeedData(client);
  });

  logger.info('test seed data initialized');
};

