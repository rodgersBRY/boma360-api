import { z } from 'zod';

const litres = z.number().positive().max(999.99);

export const createMilkLogSchema = z.object({
  morning_litres: litres,
  evening_litres: litres,
  log_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  notes: z.string().optional(),
});

export const updateMilkLogSchema = z
  .object({
    morning_litres: litres.optional(),
    evening_litres: litres.optional(),
    notes: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field required' });
