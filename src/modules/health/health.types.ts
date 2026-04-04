export type HealthRecordType = 'treatment' | 'vaccination' | 'deworming';

export interface HealthRecord {
  id: string;
  cow_id: string;
  type: HealthRecordType;
  description: string;
  drug_used: string | null;
  next_due_date: string | null;
  record_date: string;
  notes: string | null;
  created_at: string;
}

export interface CreateHealthRecordInput {
  type: HealthRecordType;
  description: string;
  drug_used?: string;
  next_due_date?: string;
  record_date?: string;
  notes?: string;
}

export interface UpdateHealthRecordInput {
  type?: HealthRecordType;
  description?: string;
  drug_used?: string | null;
  next_due_date?: string | null;
  notes?: string;
}
