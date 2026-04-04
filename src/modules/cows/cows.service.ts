import { pool } from '../../config/db';
import { CowNotFoundError } from '../../config/errors';
import { Cow, CowStatus, CreateCowInput, UpdateCowInput } from './cows.types';

export class CowService {
  async createCow(input: CreateCowInput): Promise<Cow> {
    const { rows } = await pool.query<Cow>(
      `INSERT INTO cows (tag_number, breed, date_of_birth, source)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [input.tag_number, input.breed, input.date_of_birth, input.source]
    );
    return rows[0];
  }

  async getAllCows(filters: { status?: CowStatus } = {}): Promise<Cow[]> {
    if (filters.status) {
      const { rows } = await pool.query<Cow>(
        `SELECT * FROM cows WHERE status = $1 ORDER BY created_at DESC`,
        [filters.status]
      );
      return rows;
    }
    const { rows } = await pool.query<Cow>(
      `SELECT * FROM cows ORDER BY created_at DESC`
    );
    return rows;
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
