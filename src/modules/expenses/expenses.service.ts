import { pool } from '../../config/db';
import { CowNotFoundError } from '../../config/errors';
import { ExpenseLog, CreateExpenseInput } from './expenses.types';

export class ExpenseService {
  async createExpense(cowId: string, input: CreateExpenseInput): Promise<ExpenseLog> {
    const { rowCount } = await pool.query('SELECT 1 FROM cows WHERE id = $1', [cowId]);
    if (!rowCount) throw new CowNotFoundError();

    const { rows } = await pool.query<ExpenseLog>(
      `INSERT INTO expense_logs (cow_id, category, amount, expense_date, notes)
       VALUES ($1, $2, $3, COALESCE($4::date, CURRENT_DATE), $5)
       RETURNING *`,
      [cowId, input.category, input.amount, input.expense_date ?? null, input.notes ?? null]
    );
    return rows[0]!;
  }

  async getExpensesByCow(cowId: string): Promise<ExpenseLog[]> {
    const { rowCount } = await pool.query('SELECT 1 FROM cows WHERE id = $1', [cowId]);
    if (!rowCount) throw new CowNotFoundError();

    const { rows } = await pool.query<ExpenseLog>(
      'SELECT * FROM expense_logs WHERE cow_id = $1 ORDER BY expense_date DESC, created_at DESC',
      [cowId]
    );
    return rows;
  }
}

export const expenseService = new ExpenseService();
