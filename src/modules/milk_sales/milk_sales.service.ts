import { pool } from '../../config/db';
import { PaginationParams, PaginatedResult, paginate } from '../../lib/pagination';
import { MilkSale, CreateMilkSaleInput } from './milk_sales.types';

export class MilkSalesService {
  async createSale(input: CreateMilkSaleInput): Promise<MilkSale> {
    const { rows } = await pool.query<MilkSale>(
      `INSERT INTO milk_sales (sale_date, litres_sold, price_per_litre, buyer, notes)
       VALUES (COALESCE($1::date, CURRENT_DATE), $2, $3, $4, $5)
       RETURNING *`,
      [input.sale_date ?? null, input.litres_sold, input.price_per_litre, input.buyer ?? null, input.notes ?? null]
    );
    return rows[0]!;
  }

  async getSales(pagination: PaginationParams, month?: string): Promise<PaginatedResult<MilkSale>> {
    const conditions = month ? `WHERE to_char(sale_date, 'YYYY-MM') = $1` : '';
    const baseParams = month ? [month] : [];

    const { rows: countRows } = await pool.query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM milk_sales ${conditions}`,
      baseParams
    );
    const total = parseInt(countRows[0]!.count, 10);

    const limitIdx = baseParams.length + 1;
    const { rows } = await pool.query<MilkSale>(
      `SELECT * FROM milk_sales ${conditions} ORDER BY sale_date DESC LIMIT $${limitIdx} OFFSET $${limitIdx + 1}`,
      [...baseParams, pagination.limit, pagination.offset]
    );
    return paginate(rows, total, pagination);
  }
}

export const milkSalesService = new MilkSalesService();
