import {
  BreedingRecord,
  CreateBreedingRecordResult,
} from "../breeding/breeding.types";
import { HealthRecord } from "../health/health.types";
import { MilkSale } from "../milk_sales/milk_sales.types";
import {
  notificationEventsService,
  CalvingDueEvent,
  HealthFollowUpDueEvent,
  MilkSaleRecordedEvent,
} from "./notification-events.service";

type NotificationResult = { successCount: number; failureCount: number } | null;

interface CowRef {
  id: string;
  tag_number: string;
}

export interface ModuleNotificationEvents {
  notifyHealthFollowUpDue(
    userId: string,
    event: HealthFollowUpDueEvent,
  ): Promise<NotificationResult>;
  notifyCalvingDue(
    userId: string,
    event: CalvingDueEvent,
  ): Promise<NotificationResult>;
  notifyMilkSaleRecorded(
    userId: string,
    event: MilkSaleRecordedEvent,
  ): Promise<NotificationResult>;
}

interface ModuleNotificationsServiceDeps {
  events?: ModuleNotificationEvents;
  getCow?: (cowId: string) => Promise<CowRef>;
  today?: () => string;
}

export class ModuleNotificationsService {
  private readonly events: ModuleNotificationEvents;
  private readonly getCow: (cowId: string) => Promise<CowRef>;
  private readonly today: () => string;

  constructor(deps: ModuleNotificationsServiceDeps = {}) {
    this.events = deps.events ?? notificationEventsService;
    this.getCow =
      deps.getCow ??
      ((cowId) => {
        const cowsModule =
          require("../cows/cows.service") as typeof import("../cows/cows.service");
        return cowsModule.cowService.getCowById(cowId);
      });
    this.today = deps.today ?? (() => new Date().toISOString().slice(0, 10));
  }

  async notifyHealthRecordSaved(
    userId: string,
    record: Pick<HealthRecord, "id" | "cow_id" | "description"> & {
      next_due_date?: string | null;
    },
  ): Promise<NotificationResult> {
    if (!record.next_due_date || record.next_due_date > this.today()) {
      return null;
    }

    const cow = await this.getCow(record.cow_id);
    return this.events.notifyHealthFollowUpDue(userId, {
      cowId: record.cow_id,
      tagNumber: cow.tag_number,
      recordId: record.id,
      description: record.description,
      nextDueDate: record.next_due_date,
    });
  }

  async notifyBreedingRecordSaved(
    userId: string,
    resultOrRecord:
      | CreateBreedingRecordResult
      | Pick<
          BreedingRecord,
          "id" | "cow_id" | "event_type" | "expected_calving_date"
        >,
  ): Promise<NotificationResult> {
    const record =
      "breeding_record" in resultOrRecord
        ? resultOrRecord.breeding_record
        : resultOrRecord;

    if (
      !record.expected_calving_date ||
      record.expected_calving_date > this.today()
    ) {
      return null;
    }

    const cow = await this.getCow(record.cow_id);
    return this.events.notifyCalvingDue(userId, {
      cowId: record.cow_id,
      tagNumber: cow.tag_number,
      breedingRecordId: record.id,
      expectedCalvingDate: record.expected_calving_date,
    });
  }

  notifyMilkSaleRecorded(
    userId: string,
    sale: Pick<MilkSale, "id" | "litres_sold" | "total_amount">,
  ): Promise<NotificationResult> {
    return this.events.notifyMilkSaleRecorded(userId, {
      saleId: sale.id,
      litresSold: String(sale.litres_sold),
      totalAmount: String(sale.total_amount),
    });
  }
}

export const moduleNotificationsService = new ModuleNotificationsService();
