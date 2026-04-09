import { getDbClient } from '../../config/db';

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

interface CowRef {
  id: string;
  tag_number: string;
  breed: string;
}

const todayDate = (): string => new Date().toISOString().slice(0, 10);
const dateDaysAgo = (days: number): string => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
};

const monthBounds = (month: string): { start: string; endExclusive: string } => {
  const [yearRaw, monthRaw] = month.split('-');
  const year = Number(yearRaw);
  const monthIndex = Number(monthRaw) - 1;
  const start = new Date(Date.UTC(year, monthIndex, 1));
  const end = new Date(Date.UTC(year, monthIndex + 1, 1));
  return {
    start: start.toISOString().slice(0, 10),
    endExclusive: end.toISOString().slice(0, 10),
  };
};

const asNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value) || 0;
  return 0;
};

const formatDecimal = (value: number): string => value.toFixed(2);

export class DashboardService {
  private get db() {
    return getDbClient();
  }

  async getSummary(month?: string): Promise<DashboardResult> {
    const targetMonth = month ?? new Date().toISOString().slice(0, 7);
    const today = todayDate();
    const recentThreshold = dateDaysAgo(7);
    const { start, endExclusive } = monthBounds(targetMonth);

    const activeCows = await this.getActiveCows();
    const activeCowById = new Map(activeCows.map((cow) => [cow.id, cow]));

    const [
      pregnantCows,
      cowsInMilk,
      todayTotalMilk,
      monthlyMilkTotal,
      monthlyExpenses,
      monthlyMilkIncome,
      milkPerCow,
      expensePerCow,
    ] = await Promise.all([
      this.getPregnantCows(today, activeCowById),
      this.getCowsInMilk(recentThreshold),
      this.getTodayTotalMilk(today),
      this.getMonthlyMilkTotal(start, endExclusive),
      this.getMonthlyExpenses(start, endExclusive),
      this.getMonthlyMilkIncome(start, endExclusive),
      this.getMilkPerCow(activeCows, activeCowById, start, endExclusive),
      this.getExpensePerCow(activeCows, activeCowById, start, endExclusive),
    ]);

    const profit = monthlyMilkIncome - monthlyExpenses;

    return {
      total_active_cows: activeCows.length,
      pregnant_cows: pregnantCows,
      cows_in_milk: cowsInMilk,
      today_total_milk: formatDecimal(todayTotalMilk),
      monthly_milk_total: formatDecimal(monthlyMilkTotal),
      monthly_expenses: formatDecimal(monthlyExpenses),
      monthly_milk_income: formatDecimal(monthlyMilkIncome),
      profit: formatDecimal(profit),
      milk_per_cow: milkPerCow,
      expense_per_cow: expensePerCow,
    };
  }

  private async getActiveCows(): Promise<CowRef[]> {
    const { data, error } = await this.db
      .from('cows')
      .select('id,tag_number,breed')
      .eq('status', 'active');

    if (error) throw error;
    return data ?? [];
  }

  private async getPregnantCows(
    today: string,
    activeCowById: Map<string, CowRef>,
  ): Promise<number> {
    const { data, error } = await this.db
      .from('breeding_records')
      .select('cow_id')
      .in('event_type', ['service', 'pregnancy_check'])
      .not('expected_calving_date', 'is', null)
      .gt('expected_calving_date', today);

    if (error) throw error;

    return new Set(
      (data ?? [])
        .map((row) => row.cow_id)
        .filter((cowId) => activeCowById.has(cowId)),
    ).size;
  }

  private async getCowsInMilk(recentThreshold: string): Promise<number> {
    const { data, error } = await this.db
      .from('milk_logs')
      .select('cow_id')
      .gte('log_date', recentThreshold);

    if (error) throw error;

    return new Set((data ?? []).map((row) => row.cow_id)).size;
  }

  private async getTodayTotalMilk(today: string): Promise<number> {
    const { data, error } = await this.db
      .from('milk_logs')
      .select('litres')
      .eq('log_date', today);

    if (error) throw error;

    return (data ?? []).reduce((sum, row) => sum + asNumber(row.litres), 0);
  }

  private async getMonthlyMilkTotal(
    start: string,
    endExclusive: string,
  ): Promise<number> {
    const { data, error } = await this.db
      .from('milk_logs')
      .select('litres')
      .gte('log_date', start)
      .lt('log_date', endExclusive);

    if (error) throw error;

    return (data ?? []).reduce((sum, row) => sum + asNumber(row.litres), 0);
  }

  private async getMonthlyExpenses(
    start: string,
    endExclusive: string,
  ): Promise<number> {
    const { data, error } = await this.db
      .from('expense_logs')
      .select('amount')
      .gte('expense_date', start)
      .lt('expense_date', endExclusive);

    if (error) throw error;

    return (data ?? []).reduce((sum, row) => sum + asNumber(row.amount), 0);
  }

  private async getMonthlyMilkIncome(
    start: string,
    endExclusive: string,
  ): Promise<number> {
    const { data, error } = await this.db
      .from('milk_sales')
      .select('total_amount')
      .gte('sale_date', start)
      .lt('sale_date', endExclusive);

    if (error) throw error;

    return (data ?? []).reduce((sum, row) => sum + asNumber(row.total_amount), 0);
  }

  private async getMilkPerCow(
    activeCows: CowRef[],
    activeCowById: Map<string, CowRef>,
    start: string,
    endExclusive: string,
  ): Promise<CowMilkStat[]> {
    const { data, error } = await this.db
      .from('milk_logs')
      .select('cow_id,litres')
      .gte('log_date', start)
      .lt('log_date', endExclusive);

    if (error) throw error;

    const totalsByCowId = new Map<string, number>(
      activeCows.map((cow) => [cow.id, 0]),
    );

    for (const row of data ?? []) {
      if (!activeCowById.has(row.cow_id)) continue;
      totalsByCowId.set(
        row.cow_id,
        (totalsByCowId.get(row.cow_id) ?? 0) + asNumber(row.litres),
      );
    }

    return activeCows
      .map((cow) => ({
        cow_id: cow.id,
        tag_number: cow.tag_number,
        breed: cow.breed,
        total_litres: formatDecimal(totalsByCowId.get(cow.id) ?? 0),
      }))
      .sort((a, b) => asNumber(b.total_litres) - asNumber(a.total_litres));
  }

  private async getExpensePerCow(
    activeCows: CowRef[],
    activeCowById: Map<string, CowRef>,
    start: string,
    endExclusive: string,
  ): Promise<CowExpenseStat[]> {
    const { data, error } = await this.db
      .from('expense_logs')
      .select('cow_id,amount')
      .gte('expense_date', start)
      .lt('expense_date', endExclusive);

    if (error) throw error;

    const totalsByCowId = new Map<string, number>(
      activeCows.map((cow) => [cow.id, 0]),
    );

    for (const row of data ?? []) {
      if (!activeCowById.has(row.cow_id)) continue;
      totalsByCowId.set(
        row.cow_id,
        (totalsByCowId.get(row.cow_id) ?? 0) + asNumber(row.amount),
      );
    }

    return activeCows
      .map((cow) => ({
        cow_id: cow.id,
        tag_number: cow.tag_number,
        breed: cow.breed,
        total_expenses: formatDecimal(totalsByCowId.get(cow.id) ?? 0),
      }))
      .sort((a, b) => asNumber(b.total_expenses) - asNumber(a.total_expenses));
  }
}

export const dashboardService = new DashboardService();
