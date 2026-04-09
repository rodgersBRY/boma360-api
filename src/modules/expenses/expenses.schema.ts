import { z } from "zod";

export const createExpenseSchema = z.object({
  category: z.enum(["treatment", "drugs", "supplement", "other"]),
  amount: z.number().positive().max(99999999.99),
  expense_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD")
    .optional(),
  notes: z.string().optional(),
});
