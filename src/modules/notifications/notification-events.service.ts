import { logger } from "../../config/logger";
import {
  notificationsService,
  SendNotificationOptions,
} from "./notifications.service";
import { SendNotificationInput } from "./notifications.types";

export interface NotificationSender {
  sendToUser(
    userId: string,
    input: SendNotificationInput,
    options?: SendNotificationOptions,
  ): Promise<{ successCount: number; failureCount: number }>;
}

export interface HealthFollowUpDueEvent {
  cowId: string;
  tagNumber: string;
  recordId: string;
  description: string;
  nextDueDate: string;
}

export interface CalvingDueEvent {
  cowId: string;
  tagNumber: string;
  breedingRecordId: string;
  expectedCalvingDate: string;
}

export interface MissingMilkLogsEvent {
  count: number;
  date: string;
}

export interface MilkSaleRecordedEvent {
  saleId: string;
  litresSold: string;
  totalAmount: string;
}

type NotificationResult = { successCount: number; failureCount: number };

interface NotificationEventsServiceDeps {
  sender?: NotificationSender;
  onError?: (error: unknown, eventName: string) => void;
}

export class NotificationEventsService {
  private readonly sender: NotificationSender;
  private readonly onError: (error: unknown, eventName: string) => void;

  constructor(deps: NotificationEventsServiceDeps = {}) {
    this.sender = deps.sender ?? notificationsService;
    this.onError =
      deps.onError ??
      ((error, eventName) => {
        logger.warn(
          "failed to send notification event %s: %o",
          eventName,
          error,
        );
      });
  }

  notifyHealthFollowUpDue(
    userId: string,
    event: HealthFollowUpDueEvent,
    options?: SendNotificationOptions,
  ): Promise<NotificationResult | null> {
    return this.sendBestEffort(
      userId,
      "health_follow_up_due",
      {
        title: "Health follow-up due",
        body: `${event.tagNumber} needs ${event.description} today.`,
        data: {
          event: "health_follow_up_due",
          screen: "cow_profile",
          cowId: event.cowId,
          recordId: event.recordId,
          nextDueDate: event.nextDueDate,
        },
      },
      options,
    );
  }

  notifyCalvingDue(
    userId: string,
    event: CalvingDueEvent,
    options?: SendNotificationOptions,
  ): Promise<NotificationResult | null> {
    return this.sendBestEffort(
      userId,
      "calving_due",
      {
        title: "Calving due",
        body: `${event.tagNumber} is expected to calve today.`,
        data: {
          event: "calving_due",
          screen: "cow_profile",
          cowId: event.cowId,
          breedingRecordId: event.breedingRecordId,
          expectedCalvingDate: event.expectedCalvingDate,
        },
      },
      options,
    );
  }

  notifyMissingMilkLogs(
    userId: string,
    event: MissingMilkLogsEvent,
    options?: SendNotificationOptions,
  ): Promise<NotificationResult | null> {
    const cowLabel = event.count === 1 ? "cow" : "cows";

    return this.sendBestEffort(
      userId,
      "missing_milk_logs",
      {
        title: "Missing milk logs",
        body: `${event.count} ${cowLabel} still need milk logs for today.`,
        data: {
          event: "missing_milk_logs",
          screen: "milk",
          date: event.date,
          count: String(event.count),
        },
      },
      options,
    );
  }

  notifyMilkSaleRecorded(
    userId: string,
    event: MilkSaleRecordedEvent,
    options?: SendNotificationOptions,
  ): Promise<NotificationResult | null> {
    return this.sendBestEffort(
      userId,
      "milk_sale_recorded",
      {
        title: "Milk sale recorded",
        body: `${event.litresSold} litres sold for ${event.totalAmount}.`,
        data: {
          event: "milk_sale_recorded",
          screen: "sales",
          saleId: event.saleId,
        },
      },
      options,
    );
  }

  private async sendBestEffort(
    userId: string,
    eventName: string,
    input: SendNotificationInput,
    options?: SendNotificationOptions,
  ): Promise<NotificationResult | null> {
    try {
      return await this.sender.sendToUser(userId, input, options);
    } catch (error) {
      this.onError(error, eventName);

      return null;
    }
  }
}

export const notificationEventsService = new NotificationEventsService();
