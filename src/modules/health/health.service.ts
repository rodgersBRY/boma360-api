import { pool } from '../../config/db';
import { CowNotFoundError, RecordNotFoundError } from '../../config/errors';
import { PaginationParams, PaginatedResult, paginate } from '../../lib/pagination';
import { HealthRecord, CreateHealthRecordInput, UpdateHealthRecordInput } from './health.types';

export class HealthService {
  async createRecord(cowId: string, input: CreateHealthRecordInput): Promise<HealthRecord> {
    const { rowCount } = await pool.query('SELECT 1 FROM cows WHERE id = $1', [cowId]);
    if (!rowCount) throw new CowNotFoundError();

    const { rows } = await pool.query<HealthRecord>(
      `INSERT INTO health_records (cow_id, type, description, drug_used, next_due_date, record_date, notes)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6::date, CURRENT_DATE), $7)
       RETURNING *`,
      [
        cowId,
        input.type,
        input.description,
        input.drug_used ?? null,
        input.next_due_date ?? null,
        input.record_date ?? null,
        input.notes ?? null,
      ]
    );
    return rows[0]!;
  }

  async getRecordsByCow(cowId: string, pagination: PaginationParams): Promise<PaginatedResult<HealthRecord>> {
    const { rowCount } = await pool.query('SELECT 1 FROM cows WHERE id = $1', [cowId]);
    if (!rowCount) throw new CowNotFoundError();

    const { rows: countRows } = await pool.query<{ count: string }>(
      'SELECT COUNT(*) AS count FROM health_records WHERE cow_id = $1',
      [cowId]
    );
    const total = parseInt(countRows[0]!.count, 10);

    const { rows } = await pool.query<HealthRecord>(
      'SELECT * FROM health_records WHERE cow_id = $1 ORDER BY record_date DESC, created_at DESC LIMIT $2 OFFSET $3',
      [cowId, pagination.limit, pagination.offset]
    );
    return paginate(rows, total, pagination);
  }

  async getRecordById(cowId: string, id: string): Promise<HealthRecord> {
    const { rows } = await pool.query<HealthRecord>(
      'SELECT * FROM health_records WHERE id = $1 AND cow_id = $2',
      [id, cowId]
    );
    if (!rows[0]) throw new RecordNotFoundError('Health record');
    return rows[0];
  }

  async updateRecord(cowId: string, id: string, input: UpdateHealthRecordInput): Promise<HealthRecord> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (input.type !== undefined) { fields.push(`type = $${idx++}`); values.push(input.type); }
    if (input.description !== undefined) { fields.push(`description = $${idx++}`); values.push(input.description); }
    if ('drug_used' in input) { fields.push(`drug_used = $${idx++}`); values.push(input.drug_used ?? null); }
    if ('next_due_date' in input) { fields.push(`next_due_date = $${idx++}`); values.push(input.next_due_date ?? null); }
    if (input.notes !== undefined) { fields.push(`notes = $${idx++}`); values.push(input.notes); }

    values.push(id, cowId);
    const { rows } = await pool.query<HealthRecord>(
      `UPDATE health_records SET ${fields.join(', ')} WHERE id = $${idx} AND cow_id = $${idx + 1} RETURNING *`,
      values
    );
    if (!rows[0]) throw new RecordNotFoundError('Health record');
    return rows[0];
  }
}

export const healthService = new HealthService();
