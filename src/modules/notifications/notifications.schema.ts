import { z } from "zod";

export const registerNotificationTokenSchema = z.object({
  token: z.string().min(1),
  platform: z.literal("android"),
  device_id: z.string().min(1).optional().nullable(),
});

export const unregisterNotificationTokenSchema = z.object({
  token: z.string().min(1),
});

export const sendTestNotificationSchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(500),
  data: z.record(z.string()).optional(),
});
