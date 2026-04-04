export type ExpenseCategory = 'treatment' | 'drugs' | 'supplement' | 'other';

export interface ExpenseLog {
  id: string;
  cow_id: string;
  category: ExpenseCategory;
  amount: string;
  expense_date: string;
  notes: string | null;
  created_at: string;
}

export interface CreateExpenseInput {
  category: ExpenseCategory;
  amount: number;
  expense_date?: string;
  notes?: string;
}
