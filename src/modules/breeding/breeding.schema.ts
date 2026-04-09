import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const dateField = z.string().regex(dateRegex, "Must be YYYY-MM-DD");

const calfSchema = z.object({
  tag_number: z.string().min(1).max(50),
  breed: z.string().min(1).max(100),
  date_of_birth: dateField,
});

const baseFields = {
  event_date: dateField,
  expected_calving_date: dateField.optional(),
  notes: z.string().optional(),
};

export const createBreedingRecordSchema = z.discriminatedUnion("event_type", [
  z.object({ event_type: z.literal("heat"), ...baseFields }),
  z.object({ event_type: z.literal("service"), ...baseFields }),
  z.object({ event_type: z.literal("pregnancy_check"), ...baseFields }),
  z.object({
    event_type: z.literal("calving"),
    ...baseFields,
    calf: calfSchema,
  }),
]);
