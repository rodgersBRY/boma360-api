import { getDbClient } from "../../config/db";
import { CowNotFoundError } from "../../config/errors";
import {
  PaginationParams,
  PaginatedResult,
  paginate,
} from "../../lib/pagination";
import { CreateExpenseInput, ExpenseLog } from "./expenses.types";

export class ExpenseService {
  private get db() {
    return getDbClient();
  }

  private async ensureCowExists(cowId: string): Promise<void> {
    const { data, error } = await this.db
      .from("cows")
      .select("id")
      .eq("id", cowId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new CowNotFoundError();
  }

  async createExpense(
    cowId: string,
    input: CreateExpenseInput,
  ): Promise<ExpenseLog> {
    await this.ensureCowExists(cowId);

    const payload: Record<string, unknown> = {
      cow_id: cowId,
      category: input.category,
      amount: input.amount,
      notes: input.notes ?? null,
    };

    if (input.expense_date !== undefined) {
      payload["expense_date"] = input.expense_date;
    }

    const { data, error } = await this.db
      .from("expense_logs")
      .insert(payload)
      .select("*")
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("Failed to create expense");

    return data;
  }

  async getExpensesByCow(
    cowId: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<ExpenseLog>> {
    await this.ensureCowExists(cowId);

    const { data, error, count } = await this.db
      .from("expense_logs")
      .select("*", { count: "exact" })
      .eq("cow_id", cowId)
      .order("expense_date", { ascending: false })
      .order("created_at", { ascending: false })
      .range(pagination.offset, pagination.offset + pagination.limit - 1);

    if (error) throw error;

    return paginate(data ?? [], count ?? 0, pagination);
  }
}

export const expenseService = new ExpenseService();
