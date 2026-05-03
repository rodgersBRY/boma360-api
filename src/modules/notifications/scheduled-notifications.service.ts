import {
  CalvingDueEvent,
  HealthFollowUpDueEvent,
  MissingMilkLogsEvent,
  notificationEventsService,
} from "./notification-events.service";
import { SendNotificationOptions } from "./notifications.service";

interface NotificationRecipient {
  userId: string;
  organizationId: string;
}

interface HealthDueAlert {
  cow_id: string;
  tag_number: string;
  breed: string;
  record_id: string;
  type: string;
  next_due_date: string;
  description: string;
}

interface CalvingDueAlert {
  cow_id: string;
  tag_number: string;
  breed: string;
  breeding_record_id: string;
  expected_calving_date: string;
}

interface NoMilkTodayAlert {
  cow_id: string;
  tag_number: string;
  breed: string;
}

interface ScheduledAlerts {
  health_due: HealthDueAlert[];
  calving_due: CalvingDueAlert[];
  no_milk_today: NoMilkTodayAlert[];
  recently_treated: unknown[];
}

export interface ScheduledNotificationEvents {
  notifyHealthFollowUpDue(
    userId: string,
    event: HealthFollowUpDueEvent,
    options?: SendNotificationOptions,
  ): Promise<unknown>;
  notifyCalvingDue(
    userId: string,
    event: CalvingDueEvent,
    options?: SendNotificationOptions,
  ): Promise<unknown>;
  notifyMissingMilkLogs(
    userId: string,
    event: MissingMilkLogsEvent,
    options?: SendNotificationOptions,
  ): Promise<unknown>;
}

export interface ScheduledNotificationSummary {
  recipients: number;
  healthFollowUps: number;
  calvingDue: number;
  missingMilkLogs: number;
}

interface ScheduledNotificationsServiceDeps {
  events?: ScheduledNotificationEvents;
  today?: () => string;
  getRecipients?: () => Promise<NotificationRecipient[]>;
  getAlerts?: (
    organizationId: string,
    today: string,
  ) => Promise<ScheduledAlerts>;
}

export class ScheduledNotificationsService {
  private readonly events: ScheduledNotificationEvents;
  private readonly today: () => string;
  private readonly getRecipients: () => Promise<NotificationRecipient[]>;
  private readonly getAlerts: (
    organizationId: string,
    today: string,
  ) => Promise<ScheduledAlerts>;

  constructor(deps: ScheduledNotificationsServiceDeps = {}) {
    this.events = deps.events ?? notificationEventsService;
    this.today = deps.today ?? (() => new Date().toISOString().slice(0, 10));
    this.getRecipients = deps.getRecipients ?? this.getDefaultRecipients;
    this.getAlerts = deps.getAlerts ?? this.getDefaultAlerts;
  }

  async sendDailyFarmAlerts(): Promise<ScheduledNotificationSummary> {
    const today = this.today();
    const recipients = this.uniqueRecipients(await this.getRecipients());
    const summary: ScheduledNotificationSummary = {
      recipients: recipients.length,
      healthFollowUps: 0,
      calvingDue: 0,
      missingMilkLogs: 0,
    };

    const alertsByOrg = new Map<string, ScheduledAlerts>();

    for (const recipient of recipients) {
      let alerts = alertsByOrg.get(recipient.organizationId);
      if (!alerts) {
        alerts = await this.getAlerts(recipient.organizationId, today);
        alertsByOrg.set(recipient.organizationId, alerts);
      }

      for (const alert of alerts.health_due) {
        await this.events.notifyHealthFollowUpDue(
          recipient.userId,
          {
            cowId: alert.cow_id,
            tagNumber: alert.tag_number,
            recordId: alert.record_id,
            description: alert.description,
            nextDueDate: alert.next_due_date,
          },
          { organizationId: recipient.organizationId },
        );
        summary.healthFollowUps += 1;
      }

      for (const alert of alerts.calving_due) {
        await this.events.notifyCalvingDue(
          recipient.userId,
          {
            cowId: alert.cow_id,
            tagNumber: alert.tag_number,
            breedingRecordId: alert.breeding_record_id,
            expectedCalvingDate: alert.expected_calving_date,
          },
          { organizationId: recipient.organizationId },
        );
        summary.calvingDue += 1;
      }

      if (alerts.no_milk_today.length > 0) {
        await this.events.notifyMissingMilkLogs(
          recipient.userId,
          {
            count: alerts.no_milk_today.length,
            date: today,
          },
          { organizationId: recipient.organizationId },
        );
        summary.missingMilkLogs += 1;
      }
    }

    return summary;
  }

  private uniqueRecipients(
    recipients: NotificationRecipient[],
  ): NotificationRecipient[] {
    const unique = new Map<string, NotificationRecipient>();
    for (const recipient of recipients) {
      unique.set(`${recipient.organizationId}:${recipient.userId}`, recipient);
    }

    return Array.from(unique.values());
  }

  private getDefaultRecipients = async (): Promise<NotificationRecipient[]> => {
    const dbConfig =
      require("../../config/db") as typeof import("../../config/db");
    const db = dbConfig.createSupabaseAdminClient();
    const { data, error } = await db
      .from("notification_tokens")
      .select("organization_id,user_id")
      .eq("platform", "android");

    if (error) throw error;

    return (data ?? []).map((row) => ({
      organizationId: row.organization_id,
      userId: row.user_id,
    }));
  };

  private getDefaultAlerts = async (
    organizationId: string,
    today: string,
  ): Promise<ScheduledAlerts> => {
    const dbConfig =
      require("../../config/db") as typeof import("../../config/db");
    const db = dbConfig.createSupabaseAdminClient();

    const { data: cows, error: cowsError } = await db
      .from("cows")
      .select("id,tag_number,breed,status")
      .eq("organization_id", organizationId);
    if (cowsError) throw cowsError;

    const activeCows = new Map(
      (cows ?? [])
        .filter((cow) => cow.status === "active")
        .map((cow) => [cow.id, cow]),
    );

    const [healthDue, calvingDue, milkLogged] = await Promise.all([
      db
        .from("health_records")
        .select("id,cow_id,type,next_due_date,description")
        .eq("organization_id", organizationId)
        .not("next_due_date", "is", null)
        .lte("next_due_date", today)
        .order("next_due_date", { ascending: true }),
      db
        .from("breeding_records")
        .select("id,cow_id,event_type,expected_calving_date")
        .eq("organization_id", organizationId)
        .in("event_type", ["service", "pregnancy_check"])
        .not("expected_calving_date", "is", null)
        .lte("expected_calving_date", today)
        .order("expected_calving_date", { ascending: true }),
      db
        .from("milk_logs")
        .select("cow_id")
        .eq("organization_id", organizationId)
        .eq("log_date", today),
    ]);

    if (healthDue.error) throw healthDue.error;
    if (calvingDue.error) throw calvingDue.error;
    if (milkLogged.error) throw milkLogged.error;

    const loggedToday = new Set(
      (milkLogged.data ?? []).map((row) => row.cow_id),
    );

    return {
      health_due: (healthDue.data ?? [])
        .filter((row) => activeCows.has(row.cow_id))
        .map((row) => {
          const cow = activeCows.get(row.cow_id)!;
          return {
            cow_id: row.cow_id,
            tag_number: cow.tag_number,
            breed: cow.breed,
            record_id: row.id,
            type: row.type,
            next_due_date: row.next_due_date!,
            description: row.description,
          };
        }),
      calving_due: (calvingDue.data ?? [])
        .filter((row) => activeCows.has(row.cow_id))
        .map((row) => {
          const cow = activeCows.get(row.cow_id)!;
          return {
            cow_id: row.cow_id,
            tag_number: cow.tag_number,
            breed: cow.breed,
            breeding_record_id: row.id,
            expected_calving_date: row.expected_calving_date!,
          };
        }),
      no_milk_today: Array.from(activeCows.values())
        .filter((cow) => !loggedToday.has(cow.id))
        .map((cow) => ({
          cow_id: cow.id,
          tag_number: cow.tag_number,
          breed: cow.breed,
        })),
      recently_treated: [],
    };
  };
}

export const scheduledNotificationsService =
  new ScheduledNotificationsService();
