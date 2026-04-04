import { z } from 'zod';

export const createCowSchema = z.object({
  tag_number: z.string().min(1).max(50),
  breed: z.string().min(1).max(100),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  source: z.enum(['bought', 'born']),
});

export const updateCowSchema = z
  .object({
    breed: z.string().min(1).max(100).optional(),
    status: z.enum(['active', 'sold', 'dead']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field required',
  });

export const cowParamsSchema = z.object({
  id: z.string().uuid(),
});
