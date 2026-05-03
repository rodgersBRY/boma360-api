import type { SupabaseClient } from "@supabase/supabase-js";
import {
  RegisterNotificationTokenInput,
  SendNotificationInput,
} from "./notifications.types";

export interface NotificationTokenRow {
  id: string;
  organization_id: string;
  user_id: string;
  token: string;
  platform: "android";
  device_id: string | null;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

interface NotificationsServiceDeps {
  getDb?: () => SupabaseClient;
  getOrgId?: () => string;
  now?: () => Date;
  messaging?: MessagingPort;
}

export interface SendNotificationOptions {
  organizationId?: string;
}

interface MessagingPort {
  sendEachForMulticast(message: {
    tokens: string[];
    notification: { title: string; body: string };
    data?: Record<string, string>;
    android: {
      priority: "high";
      notification: {
        channelId: string;
      };
    };
  }): Promise<{ successCount: number; failureCount: number }>;
}

export class NotificationsService {
  private readonly getDb: () => SupabaseClient;
  private readonly getOrganizationId: () => string;
  private readonly now: () => Date;
  private readonly messaging: MessagingPort;

  constructor(deps: NotificationsServiceDeps = {}) {
    this.getDb =
      deps.getDb ??
      (() => {
        const dbConfig =
          require("../../config/db") as typeof import("../../config/db");

        return dbConfig.createSupabaseAdminClient();
      });
    this.getOrganizationId =
      deps.getOrgId ??
      (() => {
        const dbConfig =
          require("../../config/db") as typeof import("../../config/db");

        return dbConfig.getOrgId();
      });
    this.now = deps.now ?? (() => new Date());
    this.messaging =
      deps.messaging ??
      ({
        sendEachForMulticast: async (message) => {
          const firebaseAdmin = require("../../config/firebase-admin")
            .default as typeof import("../../config/firebase-admin").default;

          return firebaseAdmin.messaging().sendEachForMulticast(message);
        },
      } satisfies MessagingPort);
  }

  async registerToken(
    userId: string,
    input: RegisterNotificationTokenInput,
  ): Promise<NotificationTokenRow> {
    const timestamp = this.now().toISOString();
    const { data, error } = await this.getDb()
      .from("notification_tokens")
      .upsert(
        {
          organization_id: this.getOrganizationId(),
          user_id: userId,
          token: input.token,
          platform: input.platform,
          device_id: input.device_id ?? null,
          last_seen_at: timestamp,
          updated_at: timestamp,
        },
        { onConflict: "token" },
      )
      .select("*")
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("Failed to register notification token");

    return data as NotificationTokenRow;
  }

  async unregisterToken(userId: string, token: string): Promise<void> {
    const { error } = await this.getDb()
      .from("notification_tokens")
      .delete()
      .eq("organization_id", this.getOrganizationId())
      .eq("user_id", userId)
      .eq("token", token);

    if (error) throw error;
  }

  async sendToUser(
    userId: string,
    input: SendNotificationInput,
    options: SendNotificationOptions = {},
  ): Promise<{ successCount: number; failureCount: number }> {
    const organizationId = options.organizationId ?? this.getOrganizationId();
    const { data, error } = await this.getDb()
      .from("notification_tokens")
      .select("token")
      .eq("organization_id", organizationId)
      .eq("user_id", userId)
      .eq("platform", "android")
      .order("last_seen_at", { ascending: false });

    if (error) throw error;

    const tokens = ((data ?? []) as Pick<NotificationTokenRow, "token">[]).map(
      (row) => row.token,
    );
    if (tokens.length === 0) {
      return { successCount: 0, failureCount: 0 };
    }

    const result = await this.messaging.sendEachForMulticast({
      tokens,
      notification: {
        title: input.title,
        body: input.body,
      },
      ...(input.data && { data: input.data }),
      android: {
        priority: "high",
        notification: {
          channelId: "high_importance_channel",
        },
      },
    });

    return {
      successCount: result.successCount,
      failureCount: result.failureCount,
    };
  }
}

export const notificationsService = new NotificationsService();
