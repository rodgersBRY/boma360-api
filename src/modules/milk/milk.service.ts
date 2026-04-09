import { getDbClient } from "../../config/db";
import { CowNotFoundError, RecordNotFoundError } from "../../config/errors";
import {
  PaginationParams,
  PaginatedResult,
  paginate,
} from "../../lib/pagination";
import { CreateMilkLogInput, MilkLog, UpdateMilkLogInput } from "./milk.types";

export class MilkService {
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

  async createLog(cowId: string, input: CreateMilkLogInput): Promise<MilkLog> {
    await this.ensureCowExists(cowId);

    const payload: Record<string, unknown> = {
      cow_id: cowId,
      litres: input.litres,
      period: input.period,
      notes: input.notes ?? null,
    };

    if (input.log_date !== undefined) {
      payload["log_date"] = input.log_date;
    }

    const { data, error } = await this.db
      .from("milk_logs")
      .insert(payload)
      .select("*")
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("Failed to create milk log");

    return data;
  }

  async getLogsByCow(
    cowId: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<MilkLog>> {
    await this.ensureCowExists(cowId);

    const { data, error, count } = await this.db
      .from("milk_logs")
      .select("*", { count: "exact" })
      .eq("cow_id", cowId)
      .order("log_date", { ascending: false })
      .range(pagination.offset, pagination.offset + pagination.limit - 1);

    if (error) throw error;

    return paginate(data ?? [], count ?? 0, pagination);
  }

  async updateLog(
    cowId: string,
    id: string,
    input: UpdateMilkLogInput,
  ): Promise<MilkLog> {
    const updates: Partial<MilkLog> = {};

    if (input.litres !== undefined) updates.litres = String(input.litres);
    if (input.period !== undefined) updates.period = input.period;
    if (input.notes !== undefined) updates.notes = input.notes;

    const { data, error } = await this.db
      .from("milk_logs")
      .update(updates)
      .eq("id", id)
      .eq("cow_id", cowId)
      .select("*")
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new RecordNotFoundError("Milk log");

    return data;
  }
}

export const milkService = new MilkService();
