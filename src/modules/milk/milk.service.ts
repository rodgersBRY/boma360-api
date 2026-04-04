import { pool } from "../../config/db";
import { CowNotFoundError, RecordNotFoundError } from "../../config/errors";
import { MilkLog, CreateMilkLogInput, UpdateMilkLogInput } from "./milk.types";

export class MilkService {
  async createLog(cowId: string, input: CreateMilkLogInput): Promise<MilkLog> {
    const { rowCount } = await pool.query("SELECT 1 FROM cows WHERE id = $1", [
      cowId,
    ]);
    if (!rowCount) throw new CowNotFoundError();

    const { rows } = await pool.query<MilkLog>(
      `INSERT INTO milk_logs (cow_id, morning_litres, evening_litres, log_date, notes)
       VALUES ($1, $2, $3, COALESCE($4::date, CURRENT_DATE), $5)
       RETURNING *`,
      [
        cowId,
        input.morning_litres,
        input.evening_litres,
        input.log_date ?? null,
        input.notes ?? null,
      ],
    );
    return rows[0]!;
  }

  async getLogsByCow(cowId: string): Promise<MilkLog[]> {
    const { rowCount } = await pool.query("SELECT 1 FROM cows WHERE id = $1", [
      cowId,
    ]);
    if (!rowCount) throw new CowNotFoundError();

    const { rows } = await pool.query<MilkLog>(
      "SELECT * FROM milk_logs WHERE cow_id = $1 ORDER BY log_date DESC",
      [cowId],
    );
    return rows;
  }

  async updateLog(
    cowId: string,
    id: string,
    input: UpdateMilkLogInput,
  ): Promise<MilkLog> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (input.morning_litres !== undefined) {
      fields.push(`morning_litres = $${idx++}`);
      values.push(input.morning_litres);
    }
    if (input.evening_litres !== undefined) {
      fields.push(`evening_litres = $${idx++}`);
      values.push(input.evening_litres);
    }
    if (input.notes !== undefined) {
      fields.push(`notes = $${idx++}`);
      values.push(input.notes);
    }

    values.push(id, cowId);
    const { rows } = await pool.query<MilkLog>(
      `UPDATE milk_logs SET ${fields.join(", ")} WHERE id = $${idx} AND cow_id = $${idx + 1} RETURNING *`,
      values,
    );
    if (!rows[0]) throw new RecordNotFoundError("Milk log");
    return rows[0];
  }
}

export const milkService = new MilkService();
