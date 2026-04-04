import { pool } from '../../config/db';
import { CowNotFoundError } from '../../config/errors';
import { PaginationParams, PaginatedResult, paginate } from '../../lib/pagination';
import { Cow, CowStatus, CreateCowInput, UpdateCowInput } from './cows.types';

export class CowService {
  async createCow(input: CreateCowInput): Promise<Cow> {
    const { rows } = await pool.query<Cow>(
      `INSERT INTO cows (tag_number, breed, date_of_birth, source)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [input.tag_number, input.breed, input.date_of_birth, input.source]
    );
    return rows[0]!;
  }

  async getAllCows(filters: { status?: CowStatus }, pagination: PaginationParams): Promise<PaginatedResult<Cow>> {
    const conditions = filters.status ? `WHERE status = $1` : '';
    const params = filters.status ? [filters.status] : [];

    const countIdx = params.length + 1;
    const { rows: countRows } = await pool.query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM cows ${conditions}`,
      params
    );
    const total = parseInt(countRows[0]!.count, 10);

    const { rows } = await pool.query<Cow>(
      `SELECT * FROM cows ${conditions} ORDER BY created_at DESC LIMIT $${countIdx} OFFSET $${countIdx + 1}`,
      [...params, pagination.limit, pagination.offset]
    );
    return paginate(rows, total, pagination);
  }

  async getCowById(id: string): Promise<Cow> {
    const { rows } = await pool.query<Cow>(
      `SELECT * FROM cows WHERE id = $1`,
      [id]
    );
    if (!rows[0]) throw new CowNotFoundError();
    return rows[0];
  }

  async updateCow(id: string, input: UpdateCowInput): Promise<Cow> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (input.breed !== undefined) {
      fields.push(`breed = $${idx++}`);
      values.push(input.breed);
    }
    if (input.status !== undefined) {
      fields.push(`status = $${idx++}`);
      values.push(input.status);
    }

    values.push(id);
    const { rows } = await pool.query<Cow>(
      `UPDATE cows SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    if (!rows[0]) throw new CowNotFoundError();
    return rows[0];
  }
}

export const cowService = new CowService();
