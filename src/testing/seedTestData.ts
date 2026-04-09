import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '../config/db';
import { logger } from '../config/logger';

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

const throwIfError = (error: PostgrestError | null): void => {
  if (error) throw error;
};

const insertMilkSales = async (
  rows: Array<Record<string, unknown>>,
): Promise<void> => {
  const firstAttempt = await supabase.from('milk_sales').insert(rows);
  if (!firstAttempt.error) return;

  // Compatibility path for environments where total_amount is still generated.
  if (firstAttempt.error.code === '428C9') {
    const rowsWithoutTotal = rows.map(({ total_amount, ...rest }) => rest);
    const retry = await supabase.from('milk_sales').insert(rowsWithoutTotal);
    throwIfError(retry.error);
    return;
  }

  throw firstAttempt.error;
};

const deleteSeedData = async (): Promise<void> => {
  const cowIds = Object.values(TEST_COW_IDS);
  const recordIds = Object.values(TEST_RECORD_IDS);

  throwIfError(
    (await supabase.from('health_records').delete().in('id', recordIds)).error,
  );
  throwIfError(
    (await supabase.from('breeding_records').delete().in('id', recordIds)).error,
  );
  throwIfError(
    (await supabase.from('milk_logs').delete().in('id', recordIds)).error,
  );
  throwIfError(
    (await supabase.from('expense_logs').delete().in('id', recordIds)).error,
  );
  throwIfError(
    (await supabase.from('milk_sales').delete().in('id', recordIds)).error,
  );

  throwIfError(
    (await supabase.from('health_records').delete().in('cow_id', cowIds)).error,
  );
  throwIfError(
    (await supabase.from('breeding_records').delete().in('cow_id', cowIds)).error,
  );
  throwIfError(
    (await supabase.from('milk_logs').delete().in('cow_id', cowIds)).error,
  );
  throwIfError(
    (await supabase.from('expense_logs').delete().in('cow_id', cowIds)).error,
  );
  throwIfError((await supabase.from('cows').delete().in('id', cowIds)).error);
};

const insertSeedData = async (): Promise<void> => {
  const today = new Date();
  const eightMonthsAgo = addDays(today, -240);
  const fifteenMonthsAgo = addDays(today, -450);
  const threeYearsAgo = addDays(today, -1095);
  const fourYearsAgo = addDays(today, -1460);

  throwIfError(
    (
      await supabase.from('cows').insert([
        {
          id: TEST_COW_IDS.daisy,
          tag_number: 'CM-1001',
          breed: 'Friesian',
          date_of_birth: toDateOnly(fourYearsAgo),
          source: 'bought',
          status: 'active',
        },
        {
          id: TEST_COW_IDS.bella,
          tag_number: 'CM-1002',
          breed: 'Jersey',
          date_of_birth: toDateOnly(threeYearsAgo),
          source: 'bought',
          status: 'active',
        },
        {
          id: TEST_COW_IDS.nala,
          tag_number: 'CM-1003',
          breed: 'Ayrshire',
          date_of_birth: toDateOnly(fifteenMonthsAgo),
          source: 'born',
          status: 'active',
        },
        {
          id: TEST_COW_IDS.ruby,
          tag_number: 'CM-1004',
          breed: 'Friesian Cross',
          date_of_birth: toDateOnly(eightMonthsAgo),
          source: 'born',
          status: 'active',
        },
      ])
    ).error,
  );

  throwIfError(
    (
      await supabase.from('health_records').insert([
        {
          id: TEST_RECORD_IDS.healthDaisyTreatment,
          cow_id: TEST_COW_IDS.daisy,
          type: 'treatment',
          description: 'Treated for mastitis',
          drug_used: 'Oxytetracycline',
          next_due_date: toDateOnly(addDays(today, 4)),
          record_date: toDateOnly(addDays(today, -2)),
          notes: 'Responding well to treatment.',
        },
        {
          id: TEST_RECORD_IDS.healthBellaVaccination,
          cow_id: TEST_COW_IDS.bella,
          type: 'vaccination',
          description: 'Annual FMD vaccination',
          drug_used: 'FMD vaccine',
          next_due_date: toDateOnly(addDays(today, 28)),
          record_date: toDateOnly(addDays(today, -7)),
          notes: 'Booster due later this month.',
        },
        {
          id: TEST_RECORD_IDS.healthNalaDeworming,
          cow_id: TEST_COW_IDS.nala,
          type: 'deworming',
          description: 'Routine deworming',
          drug_used: 'Albendazole',
          next_due_date: toDateOnly(addDays(today, 14)),
          record_date: toDateOnly(addDays(today, -1)),
          notes: 'Monitor weight gain over the next two weeks.',
        },
      ])
    ).error,
  );

  throwIfError(
    (
      await supabase.from('breeding_records').insert([
        {
          id: TEST_RECORD_IDS.breedingBellaService,
          cow_id: TEST_COW_IDS.bella,
          event_type: 'service',
          event_date: toDateOnly(addDays(today, -120)),
          expected_calving_date: toDateOnly(addDays(today, 160)),
          notes: 'Served by AI technician.',
        },
        {
          id: TEST_RECORD_IDS.breedingBellaPregnancy,
          cow_id: TEST_COW_IDS.bella,
          event_type: 'pregnancy_check',
          event_date: toDateOnly(addDays(today, -60)),
          expected_calving_date: toDateOnly(addDays(today, 25)),
          notes: 'Pregnancy confirmed.',
        },
        {
          id: TEST_RECORD_IDS.breedingRubyCalving,
          cow_id: TEST_COW_IDS.ruby,
          event_type: 'calving',
          event_date: toDateOnly(addDays(today, -210)),
          expected_calving_date: null,
          notes: 'Healthy calving recorded in past season.',
        },
      ])
    ).error,
  );

  throwIfError(
    (
      await supabase.from('milk_logs').insert([
        {
          id: TEST_RECORD_IDS.milkDaisyToday,
          cow_id: TEST_COW_IDS.daisy,
          log_date: toDateOnly(today),
          litres: 18.5,
          period: 'morning',
          notes: 'Strong yield this morning.',
        },
        {
          id: TEST_RECORD_IDS.milkBellaYesterday,
          cow_id: TEST_COW_IDS.bella,
          log_date: toDateOnly(addDays(today, -1)),
          litres: 15.25,
          period: 'morning',
          notes: 'Skipped today to keep no-milk alert coverage.',
        },
        {
          id: TEST_RECORD_IDS.milkRubyThreeDaysAgo,
          cow_id: TEST_COW_IDS.ruby,
          log_date: toDateOnly(addDays(today, -3)),
          litres: 9.75,
          period: 'morning',
          notes: 'Starter production from young cow.',
        },
      ])
    ).error,
  );

  throwIfError(
    (
      await supabase.from('expense_logs').insert([
        {
          id: TEST_RECORD_IDS.expenseDaisyFeed,
          cow_id: TEST_COW_IDS.daisy,
          category: 'supplement',
          amount: 1800,
          expense_date: toDateOnly(addDays(today, -2)),
          notes: 'Protein boost after treatment.',
        },
        {
          id: TEST_RECORD_IDS.expenseBellaTreatment,
          cow_id: TEST_COW_IDS.bella,
          category: 'treatment',
          amount: 950,
          expense_date: toDateOnly(addDays(today, -5)),
          notes: 'Pregnancy follow-up exam.',
        },
        {
          id: TEST_RECORD_IDS.expenseRubyMinerals,
          cow_id: TEST_COW_IDS.ruby,
          category: 'drugs',
          amount: 620,
          expense_date: toDateOnly(addDays(today, -9)),
          notes: 'Vitamin and mineral support.',
        },
      ])
    ).error,
  );

  await insertMilkSales([
    {
      id: TEST_RECORD_IDS.saleToday,
      sale_date: toDateOnly(today),
      litres_sold: 32.0,
      price_per_litre: 58.0,
      total_amount: 1856.0,
      buyer: 'Nyeri Dairy Cooperative',
      notes: 'Morning delivery.',
    },
    {
      id: TEST_RECORD_IDS.saleTwoDaysAgo,
      sale_date: toDateOnly(addDays(today, -2)),
      litres_sold: 28.5,
      price_per_litre: 57.5,
      total_amount: 1638.75,
      buyer: 'Local milk bar',
      notes: 'Cash sale.',
    },
  ]);
};

export const seedTestData = async (): Promise<void> => {
  await deleteSeedData();
  await insertSeedData();
  logger.info('test seed data initialized');
};
