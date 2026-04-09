export interface MilkLog {
  id: string;
  cow_id: string;
  log_date: string;
  litres: string;
  period: "morning" | "afternoon" | "evening";
  notes: string | null;
  created_at: string;
}

export interface CreateMilkLogInput {
  litres: number;
  period: "morning" | "afternoon" | "evening";
  log_date?: string;
  notes?: string;
}

export interface UpdateMilkLogInput {
  litres?: number;
  period?: "morning" | "afternoon" | "evening";
  notes?: string;
}
