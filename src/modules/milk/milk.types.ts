export interface MilkLog {
  id: string;
  cow_id: string;
  log_date: string;
  morning_litres: string;
  evening_litres: string;
  total_litres: string;
  notes: string | null;
  created_at: string;
}

export interface CreateMilkLogInput {
  morning_litres: number;
  evening_litres: number;
  log_date?: string;
  notes?: string;
}

export interface UpdateMilkLogInput {
  morning_litres?: number;
  evening_litres?: number;
  notes?: string;
}
