import { pool } from '../../config/db';
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

  async getSales(month?: string): Promise<MilkSale[]> {
    if (month) {
      // month format: YYYY-MM
      const { rows } = await pool.query<MilkSale>(
        `SELECT * FROM milk_sales
         WHERE to_char(sale_date, 'YYYY-MM') = $1
         ORDER BY sale_date DESC`,
        [month]
      );
      return rows;
    }
    const { rows } = await pool.query<MilkSale>(
      'SELECT * FROM milk_sales ORDER BY sale_date DESC'
    );
    return rows;
  }
}

export const milkSalesService = new MilkSalesService();
