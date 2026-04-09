import { z } from 'zod';

export const createMilkSaleSchema = z.object({
  sale_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  litres_sold: z.number().positive().max(99999.99),
  price_per_litre: z.number().positive().max(99999.99),
  buyer: z.string().max(200).optional(),
  notes: z.string().optional(),
});
