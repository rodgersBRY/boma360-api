export type NotificationPlatform = "android";

export interface RegisterNotificationTokenInput {
  token: string;
  platform: NotificationPlatform;
  device_id?: string | null;
}

export interface SendNotificationInput {
  title: string;
  body: string;
  data?: Record<string, string>;
}
