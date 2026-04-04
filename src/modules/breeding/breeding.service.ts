import { PoolClient } from 'pg';
import { pool, withTransaction } from '../../config/db';
import { CowNotFoundError, RecordNotFoundError } from '../../config/errors';
import { PaginationParams, PaginatedResult, paginate } from '../../lib/pagination';
import { BreedingRecord, CreateBreedingRecordInput, CreateBreedingRecordResult } from './breeding.types';
import { Cow } from '../cows/cows.types';

export class BreedingService {
  async createRecord(cowId: string, input: CreateBreedingRecordInput): Promise<CreateBreedingRecordResult> {
    const { rowCount } = await pool.query('SELECT 1 FROM cows WHERE id = $1', [cowId]);
    if (!rowCount) throw new CowNotFoundError();

    if (input.event_type === 'calving') {
      return withTransaction(async (client: PoolClient) => {
        const { rows: breedRows } = await client.query<BreedingRecord>(
          `INSERT INTO breeding_records (cow_id, event_type, event_date, expected_calving_date, notes)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [cowId, input.event_type, input.event_date, input.expected_calving_date ?? null, input.notes ?? null]
        );
        const { rows: calfRows } = await client.query<Cow>(
          `INSERT INTO cows (tag_number, breed, date_of_birth, source)
           VALUES ($1, $2, $3, 'born')
           RETURNING *`,
          [input.calf!.tag_number, input.calf!.breed, input.calf!.date_of_birth]
        );
        return { breeding_record: breedRows[0]!, calf: calfRows[0]! };
      });
    }

    const { rows } = await pool.query<BreedingRecord>(
      `INSERT INTO breeding_records (cow_id, event_type, event_date, expected_calving_date, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [cowId, input.event_type, input.event_date, input.expected_calving_date ?? null, input.notes ?? null]
    );
    return { breeding_record: rows[0]! };
  }

  async getRecordsByCow(cowId: string, pagination: PaginationParams): Promise<PaginatedResult<BreedingRecord>> {
    const { rowCount } = await pool.query('SELECT 1 FROM cows WHERE id = $1', [cowId]);
    if (!rowCount) throw new CowNotFoundError();

    const { rows: countRows } = await pool.query<{ count: string }>(
      'SELECT COUNT(*) AS count FROM breeding_records WHERE cow_id = $1',
      [cowId]
    );
    const total = parseInt(countRows[0]!.count, 10);

    const { rows } = await pool.query<BreedingRecord>(
      'SELECT * FROM breeding_records WHERE cow_id = $1 ORDER BY event_date DESC, created_at DESC LIMIT $2 OFFSET $3',
      [cowId, pagination.limit, pagination.offset]
    );
    return paginate(rows, total, pagination);
  }

  async getRecordById(cowId: string, id: string): Promise<BreedingRecord> {
    const { rows } = await pool.query<BreedingRecord>(
      'SELECT * FROM breeding_records WHERE id = $1 AND cow_id = $2',
      [id, cowId]
    );
    if (!rows[0]) throw new RecordNotFoundError('Breeding record');
    return rows[0];
  }
}

export const breedingService = new BreedingService();
