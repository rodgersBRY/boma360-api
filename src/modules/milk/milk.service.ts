import { pool } from "../../config/db";
import { CowNotFoundError, RecordNotFoundError } from "../../config/errors";
import { PaginationParams, PaginatedResult, paginate } from "../../lib/pagination";
import { MilkLog, CreateMilkLogInput, UpdateMilkLogInput } from "./milk.types";

export class MilkService {
  async createLog(cowId: string, input: CreateMilkLogInput): Promise<MilkLog> {
    const { rowCount } = await pool.query("SELECT 1 FROM cows WHERE id = $1", [cowId]);
    if (!rowCount) throw new CowNotFoundError();

    const { rows } = await pool.query<MilkLog>(
      `INSERT INTO milk_logs (cow_id, litres, period, log_date, notes)
       VALUES ($1, $2, $3, COALESCE($4::date, CURRENT_DATE), $5)
       RETURNING *`,
      [cowId, input.litres, input.period, input.log_date ?? null, input.notes ?? null]
    );
    return rows[0]!;
  }

  async getLogsByCow(cowId: string, pagination: PaginationParams): Promise<PaginatedResult<MilkLog>> {
    const { rowCount } = await pool.query("SELECT 1 FROM cows WHERE id = $1", [cowId]);
    if (!rowCount) throw new CowNotFoundError();

    const { rows: countRows } = await pool.query<{ count: string }>(
      "SELECT COUNT(*) AS count FROM milk_logs WHERE cow_id = $1",
      [cowId]
    );
    const total = parseInt(countRows[0]!.count, 10);

    const { rows } = await pool.query<MilkLog>(
      "SELECT * FROM milk_logs WHERE cow_id = $1 ORDER BY log_date DESC LIMIT $2 OFFSET $3",
      [cowId, pagination.limit, pagination.offset]
    );
    return paginate(rows, total, pagination);
  }

  async updateLog(cowId: string, id: string, input: UpdateMilkLogInput): Promise<MilkLog> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (input.litres !== undefined) { fields.push(`litres = $${idx++}`); values.push(input.litres); }
    if (input.period !== undefined) { fields.push(`period = $${idx++}`); values.push(input.period); }
    if (input.notes !== undefined) { fields.push(`notes = $${idx++}`); values.push(input.notes); }

    values.push(id, cowId);
    const { rows } = await pool.query<MilkLog>(
      `UPDATE milk_logs SET ${fields.join(", ")} WHERE id = $${idx} AND cow_id = $${idx + 1} RETURNING *`,
      values
    );
    if (!rows[0]) throw new RecordNotFoundError("Milk log");
    return rows[0];
  }
}

export const milkService = new MilkService();
