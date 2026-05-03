import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CalvingDueEvent,
  HealthFollowUpDueEvent,
  MissingMilkLogsEvent,
} from "./notification-events.service";
import {
  ScheduledNotificationEvents,
  ScheduledNotificationsService,
} from "./scheduled-notifications.service";
import { SendNotificationOptions } from "./notifications.service";

class FakeEvents implements ScheduledNotificationEvents {
  calls: Array<{
    name: string;
    userId: string;
    event: Record<string, unknown>;
    organizationId?: string;
  }> = [];

  async notifyHealthFollowUpDue(
    userId: string,
    event: HealthFollowUpDueEvent,
    options?: SendNotificationOptions,
  ): Promise<null> {
    this.calls.push({
      name: "health",
      userId,
      event: { ...event },
      organizationId: options?.organizationId,
    });
    return null;
  }

  async notifyCalvingDue(
    userId: string,
    event: CalvingDueEvent,
    options?: SendNotificationOptions,
  ): Promise<null> {
    this.calls.push({
      name: "calving",
      userId,
      event: { ...event },
      organizationId: options?.organizationId,
    });
    return null;
  }

  async notifyMissingMilkLogs(
    userId: string,
    event: MissingMilkLogsEvent,
    options?: SendNotificationOptions,
  ): Promise<null> {
    this.calls.push({
      name: "missing_milk",
      userId,
      event: { ...event },
      organizationId: options?.organizationId,
    });
    return null;
  }
}

describe("ScheduledNotificationsService", () => {
  it("sends daily farm alerts to each Android token recipient", async () => {
    const events = new FakeEvents();
    const service = new ScheduledNotificationsService({
      events,
      today: () => "2026-05-03",
      getRecipients: async () => [
        { userId: "user-1", organizationId: "org-1" },
        { userId: "user-1", organizationId: "org-1" },
      ],
      getAlerts: async () => ({
        health_due: [
          {
            cow_id: "cow-1",
            tag_number: "A12",
            breed: "Friesian",
            record_id: "record-1",
            type: "vaccination",
            next_due_date: "2026-05-03",
            description: "Vaccination booster",
          },
        ],
        calving_due: [
          {
            cow_id: "cow-2",
            tag_number: "B7",
            breed: "Jersey",
            breeding_record_id: "breeding-1",
            expected_calving_date: "2026-05-03",
          },
        ],
        no_milk_today: [
          { cow_id: "cow-1", tag_number: "A12", breed: "Friesian" },
          { cow_id: "cow-2", tag_number: "B7", breed: "Jersey" },
        ],
        recently_treated: [],
      }),
    });

    const summary = await service.sendDailyFarmAlerts();

    assert.deepEqual(summary, {
      recipients: 1,
      healthFollowUps: 1,
      calvingDue: 1,
      missingMilkLogs: 1,
    });
    assert.deepEqual(events.calls, [
      {
        name: "health",
        userId: "user-1",
        organizationId: "org-1",
        event: {
          cowId: "cow-1",
          tagNumber: "A12",
          recordId: "record-1",
          description: "Vaccination booster",
          nextDueDate: "2026-05-03",
        },
      },
      {
        name: "calving",
        userId: "user-1",
        organizationId: "org-1",
        event: {
          cowId: "cow-2",
          tagNumber: "B7",
          breedingRecordId: "breeding-1",
          expectedCalvingDate: "2026-05-03",
        },
      },
      {
        name: "missing_milk",
        userId: "user-1",
        organizationId: "org-1",
        event: {
          count: 2,
          date: "2026-05-03",
        },
      },
    ]);
  });
});
