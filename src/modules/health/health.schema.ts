import { z } from "zod";

export const createHealthRecordSchema = z.object({
  type: z.enum(["treatment", "vaccination", "deworming"]),
  description: z.string().min(1),
  drug_used: z.string().max(200).optional(),
  next_due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD")
    .optional(),
  record_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD")
    .optional(),
  notes: z.string().optional(),
});

export const updateHealthRecordSchema = z
  .object({
    type: z.enum(["treatment", "vaccination", "deworming"]).optional(),
    description: z.string().min(1).optional(),
    drug_used: z.string().max(200).nullable().optional(),
    next_due_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD")
      .nullable()
      .optional(),
    notes: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field required",
  });
