import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  NotificationEventsService,
  NotificationSender,
} from "./notification-events.service";

class FakeSender implements NotificationSender {
  sent: Array<{
    userId: string;
    input: {
      title: string;
      body: string;
      data?: Record<string, string>;
    };
  }> = [];

  async sendToUser(
    userId: string,
    input: {
      title: string;
      body: string;
      data?: Record<string, string>;
    },
  ): Promise<{ successCount: number; failureCount: number }> {
    this.sent.push({ userId, input });

    return { successCount: 1, failureCount: 0 };
  }
}

describe("NotificationEventsService", () => {
  it("sends a health follow-up notification payload", async () => {
    const sender = new FakeSender();
    const events = new NotificationEventsService({ sender });

    const result = await events.notifyHealthFollowUpDue("user-1", {
      cowId: "cow-1",
      tagNumber: "A12",
      recordId: "record-1",
      description: "Vaccination booster",
      nextDueDate: "2026-05-02",
    });

    assert.deepEqual(result, { successCount: 1, failureCount: 0 });
    assert.deepEqual(sender.sent, [
      {
        userId: "user-1",
        input: {
          title: "Health follow-up due",
          body: "A12 needs Vaccination booster today.",
          data: {
            event: "health_follow_up_due",
            screen: "alerts",
            cowId: "cow-1",
            recordId: "record-1",
            nextDueDate: "2026-05-02",
          },
        },
      },
    ]);
  });

  it("sends a calving due notification payload", async () => {
    const sender = new FakeSender();
    const events = new NotificationEventsService({ sender });

    await events.notifyCalvingDue("user-1", {
      cowId: "cow-1",
      tagNumber: "A12",
      breedingRecordId: "breeding-1",
      expectedCalvingDate: "2026-05-02",
    });

    assert.deepEqual(sender.sent[0], {
      userId: "user-1",
      input: {
        title: "Calving due",
        body: "A12 is expected to calve today.",
        data: {
          event: "calving_due",
          screen: "alerts",
          cowId: "cow-1",
          breedingRecordId: "breeding-1",
          expectedCalvingDate: "2026-05-02",
        },
      },
    });
  });

  it("sends a missing milk logs notification payload", async () => {
    const sender = new FakeSender();
    const events = new NotificationEventsService({ sender });

    await events.notifyMissingMilkLogs("user-1", {
      count: 3,
      date: "2026-05-02",
    });

    assert.deepEqual(sender.sent[0], {
      userId: "user-1",
      input: {
        title: "Missing milk logs",
        body: "3 cows still need milk logs for today.",
        data: {
          event: "missing_milk_logs",
          screen: "alerts",
          date: "2026-05-02",
          count: "3",
        },
      },
    });
  });

  it("returns null when best-effort delivery fails", async () => {
    const events = new NotificationEventsService({
      sender: {
        sendToUser: async () => {
          throw new Error("FCM unavailable");
        },
      },
      onError: () => undefined,
    });

    const result = await events.notifyMilkSaleRecorded("user-1", {
      saleId: "sale-1",
      litresSold: "12.50",
      totalAmount: "625.00",
    });

    assert.equal(result, null);
  });
});
