import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CalvingDueEvent,
  HealthFollowUpDueEvent,
  MilkSaleRecordedEvent,
} from "./notification-events.service";
import {
  ModuleNotificationEvents,
  ModuleNotificationsService,
} from "./module-notifications.service";

class FakeEvents implements ModuleNotificationEvents {
  calls: Array<{ name: string; userId: string; event: Record<string, unknown> }> =
    [];

  async notifyHealthFollowUpDue(
    userId: string,
    event: HealthFollowUpDueEvent,
  ): Promise<null> {
    this.calls.push({ name: "health", userId, event: { ...event } });
    return null;
  }

  async notifyCalvingDue(
    userId: string,
    event: CalvingDueEvent,
  ): Promise<null> {
    this.calls.push({ name: "calving", userId, event: { ...event } });
    return null;
  }

  async notifyMilkSaleRecorded(
    userId: string,
    event: MilkSaleRecordedEvent,
  ): Promise<null> {
    this.calls.push({ name: "sale", userId, event: { ...event } });
    return null;
  }
}

describe("ModuleNotificationsService", () => {
  it("notifies when a health follow-up is due today", async () => {
    const events = new FakeEvents();
    const service = new ModuleNotificationsService({
      events,
      today: () => "2026-05-03",
      getCow: async () => ({ id: "cow-1", tag_number: "A12" }),
    });

    await service.notifyHealthRecordSaved("user-1", {
      id: "record-1",
      cow_id: "cow-1",
      description: "Vaccination booster",
      next_due_date: "2026-05-03",
    });

    assert.deepEqual(events.calls, [
      {
        name: "health",
        userId: "user-1",
        event: {
          cowId: "cow-1",
          tagNumber: "A12",
          recordId: "record-1",
          description: "Vaccination booster",
          nextDueDate: "2026-05-03",
        },
      },
    ]);
  });

  it("skips health follow-ups with future due dates", async () => {
    const events = new FakeEvents();
    const service = new ModuleNotificationsService({
      events,
      today: () => "2026-05-03",
      getCow: async () => ({ id: "cow-1", tag_number: "A12" }),
    });

    await service.notifyHealthRecordSaved("user-1", {
      id: "record-1",
      cow_id: "cow-1",
      description: "Vaccination booster",
      next_due_date: "2026-05-04",
    });

    assert.deepEqual(events.calls, []);
  });

  it("notifies when a breeding record has calving due today", async () => {
    const events = new FakeEvents();
    const service = new ModuleNotificationsService({
      events,
      today: () => "2026-05-03",
      getCow: async () => ({ id: "cow-1", tag_number: "A12" }),
    });

    await service.notifyBreedingRecordSaved("user-1", {
      id: "breeding-1",
      cow_id: "cow-1",
      event_type: "service",
      expected_calving_date: "2026-05-03",
    });

    assert.deepEqual(events.calls, [
      {
        name: "calving",
        userId: "user-1",
        event: {
          cowId: "cow-1",
          tagNumber: "A12",
          breedingRecordId: "breeding-1",
          expectedCalvingDate: "2026-05-03",
        },
      },
    ]);
  });

  it("notifies when a milk sale is recorded", async () => {
    const events = new FakeEvents();
    const service = new ModuleNotificationsService({
      events,
      today: () => "2026-05-03",
      getCow: async () => ({ id: "cow-1", tag_number: "A12" }),
    });

    await service.notifyMilkSaleRecorded("user-1", {
      id: "sale-1",
      litres_sold: "12.5",
      total_amount: "625",
    });

    assert.deepEqual(events.calls, [
      {
        name: "sale",
        userId: "user-1",
        event: {
          saleId: "sale-1",
          litresSold: "12.5",
          totalAmount: "625",
        },
      },
    ]);
  });
});
