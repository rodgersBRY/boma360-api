import { getDbClient, getOrgId } from "../../config/db";
import { CowNotFoundError, RecordNotFoundError } from "../../config/errors";
import {
  PaginationParams,
  PaginatedResult,
  paginate,
} from "../../lib/pagination";
import {
  CreateHealthRecordInput,
  HealthRecord,
  UpdateHealthRecordInput,
} from "./health.types";

export class HealthService {
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

  async createRecord(
    cowId: string,
    input: CreateHealthRecordInput,
  ): Promise<HealthRecord> {
    await this.ensureCowExists(cowId);

    const payload: Record<string, unknown> = {
      organization_id: getOrgId(),
      cow_id: cowId,
      type: input.type,
      description: input.description,
      drug_used: input.drug_used ?? null,
      notes: input.notes ?? null,
    };

    if (input.next_due_date !== undefined) {
      payload["next_due_date"] = input.next_due_date;
    }

    if (input.record_date !== undefined) {
      payload["record_date"] = input.record_date;
    }

    const { data, error } = await this.db
      .from("health_records")
      .insert(payload)
      .select("*")
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("Failed to create health record");

    return data;
  }

  async getRecordsByCow(
    cowId: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<HealthRecord>> {
    await this.ensureCowExists(cowId);

    const { data, error, count } = await this.db
      .from("health_records")
      .select("*", { count: "exact" })
      .eq("cow_id", cowId)
      .order("record_date", { ascending: false })
      .order("created_at", { ascending: false })
      .range(pagination.offset, pagination.offset + pagination.limit - 1);

    if (error) throw error;

    return paginate(data ?? [], count ?? 0, pagination);
  }

  async getRecordById(cowId: string, id: string): Promise<HealthRecord> {
    const { data, error } = await this.db
      .from("health_records")
      .select("*")
      .eq("id", id)
      .eq("cow_id", cowId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new RecordNotFoundError("Health record");

    return data;
  }

  async updateRecord(
    cowId: string,
    id: string,
    input: UpdateHealthRecordInput,
  ): Promise<HealthRecord> {
    const updates: Partial<HealthRecord> = {};

    if (input.type !== undefined) updates.type = input.type;

    if (input.description !== undefined)
      updates.description = input.description;

    if ("drug_used" in input) updates.drug_used = input.drug_used ?? null;

    if ("next_due_date" in input)
      updates.next_due_date = input.next_due_date ?? null;
    
    if (input.notes !== undefined) updates.notes = input.notes;

    const { data, error } = await this.db
      .from("health_records")
      .update(updates)
      .eq("id", id)
      .eq("cow_id", cowId)
      .select("*")
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new RecordNotFoundError("Health record");

    return data;
  }
}

export const healthService = new HealthService();
