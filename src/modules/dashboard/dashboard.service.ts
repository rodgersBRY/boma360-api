import { pool } from '../../config/db';

export interface CowMilkStat {
  cow_id: string;
  tag_number: string;
  breed: string;
  total_litres: string;
}

export interface CowExpenseStat {
  cow_id: string;
  tag_number: string;
  breed: string;
  total_expenses: string;
}

export interface DashboardResult {
  total_active_cows: number;
  pregnant_cows: number;
  cows_in_milk: number;
  today_total_milk: string;
  monthly_milk_total: string;
  monthly_expenses: string;
  monthly_milk_income: string;
  profit: string;
  milk_per_cow: CowMilkStat[];
  expense_per_cow: CowExpenseStat[];
}

export class DashboardService {
  async getSummary(month?: string): Promise<DashboardResult> {
    // Default to current month if not provided
    const targetMonth = month ?? new Date().toISOString().slice(0, 7); // YYYY-MM

    const [
      activeCows,
      pregnantCows,
      cowsInMilk,
      todayMilk,
      monthlyMilk,
      monthlyExpenses,
      monthlyIncome,
      milkPerCow,
      expensePerCow,
    ] = await Promise.all([
      this.getTotalActiveCows(),
      this.getPregnantCows(),
      this.getCowsInMilk(),
      this.getTodayTotalMilk(),
      this.getMonthlyMilkTotal(targetMonth),
      this.getMonthlyExpenses(targetMonth),
      this.getMonthlyMilkIncome(targetMonth),
      this.getMilkPerCow(targetMonth),
      this.getExpensePerCow(targetMonth),
    ]);

    const profit = (parseFloat(monthlyIncome) - parseFloat(monthlyExpenses)).toFixed(2);

    return {
      total_active_cows: activeCows,
      pregnant_cows: pregnantCows,
      cows_in_milk: cowsInMilk,
      today_total_milk: todayMilk,
      monthly_milk_total: monthlyMilk,
      monthly_expenses: monthlyExpenses,
      monthly_milk_income: monthlyIncome,
      profit,
      milk_per_cow: milkPerCow,
      expense_per_cow: expensePerCow,
    };
  }

  private async getTotalActiveCows(): Promise<number> {
    const { rows } = await pool.query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM cows WHERE status = 'active'`
    );
    return parseInt(rows[0]!.count, 10);
  }

  private async getPregnantCows(): Promise<number> {
    const { rows } = await pool.query<{ count: string }>(
      `SELECT COUNT(DISTINCT b.cow_id) AS count
       FROM breeding_records b
       JOIN cows c ON c.id = b.cow_id
       WHERE b.event_type IN ('service', 'pregnancy_check')
         AND b.expected_calving_date > CURRENT_DATE
         AND c.status = 'active'`
    );
    return parseInt(rows[0]!.count, 10);
  }

  private async getCowsInMilk(): Promise<number> {
    const { rows } = await pool.query<{ count: string }>(
      `SELECT COUNT(DISTINCT cow_id) AS count
       FROM milk_logs
       WHERE log_date >= CURRENT_DATE - INTERVAL '7 days'`
    );
    return parseInt(rows[0]!.count, 10);
  }

  private async getTodayTotalMilk(): Promise<string> {
    const { rows } = await pool.query<{ total: string }>(
      `SELECT COALESCE(SUM(total_litres), 0)::text AS total
       FROM milk_logs
       WHERE log_date = CURRENT_DATE`
    );
    return rows[0]!.total;
  }

  private async getMonthlyMilkTotal(month: string): Promise<string> {
    const { rows } = await pool.query<{ total: string }>(
      `SELECT COALESCE(SUM(total_litres), 0)::text AS total
       FROM milk_logs
       WHERE to_char(log_date, 'YYYY-MM') = $1`,
      [month]
    );
    return rows[0]!.total;
  }

  private async getMonthlyExpenses(month: string): Promise<string> {
    const { rows } = await pool.query<{ total: string }>(
      `SELECT COALESCE(SUM(amount), 0)::text AS total
       FROM expense_logs
       WHERE to_char(expense_date, 'YYYY-MM') = $1`,
      [month]
    );
    return rows[0]!.total;
  }

  private async getMonthlyMilkIncome(month: string): Promise<string> {
    const { rows } = await pool.query<{ total: string }>(
      `SELECT COALESCE(SUM(total_amount), 0)::text AS total
       FROM milk_sales
       WHERE to_char(sale_date, 'YYYY-MM') = $1`,
      [month]
    );
    return rows[0]!.total;
  }

  private async getMilkPerCow(month: string): Promise<CowMilkStat[]> {
    const { rows } = await pool.query<CowMilkStat>(
      `SELECT c.id AS cow_id, c.tag_number, c.breed,
              COALESCE(SUM(m.total_litres), 0)::text AS total_litres
       FROM cows c
       LEFT JOIN milk_logs m ON m.cow_id = c.id AND to_char(m.log_date, 'YYYY-MM') = $1
       WHERE c.status = 'active'
       GROUP BY c.id, c.tag_number, c.breed
       ORDER BY total_litres DESC`,
      [month]
    );
    return rows;
  }

  private async getExpensePerCow(month: string): Promise<CowExpenseStat[]> {
    const { rows } = await pool.query<CowExpenseStat>(
      `SELECT c.id AS cow_id, c.tag_number, c.breed,
              COALESCE(SUM(e.amount), 0)::text AS total_expenses
       FROM cows c
       LEFT JOIN expense_logs e ON e.cow_id = c.id AND to_char(e.expense_date, 'YYYY-MM') = $1
       WHERE c.status = 'active'
       GROUP BY c.id, c.tag_number, c.breed
       ORDER BY total_expenses DESC`,
      [month]
    );
    return rows;
  }
}

export const dashboardService = new DashboardService();
