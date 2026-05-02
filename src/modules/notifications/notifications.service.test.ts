import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  NotificationTokenRow,
  NotificationsService,
} from "./notifications.service";

class FakeNotificationTokenTable {
  rows: NotificationTokenRow[] = [];
  private pendingInsert: Partial<NotificationTokenRow> | null = null;
  private deleteFilters: Record<string, string> = {};
  private queryFilters: Record<string, string> = {};
  private mode: "idle" | "delete" | "query" = "idle";

  upsert(row: Partial<NotificationTokenRow>) {
    this.pendingInsert = row;
    return this;
  }

  select() {
    if (!this.pendingInsert) {
      this.mode = "query";
      this.queryFilters = {};
    }
    return this;
  }

  maybeSingle() {
    const row = this.pendingInsert;
    if (!row) {
      return { data: null, error: new Error("missing insert") };
    }

    const existingIndex = this.rows.findIndex(
      (existing) => existing.token === row.token,
    );
    const saved = {
      id:
        existingIndex >= 0
          ? this.rows[existingIndex].id
          : "11111111-1111-1111-1111-111111111111",
      organization_id: row.organization_id!,
      user_id: row.user_id!,
      token: row.token!,
      platform: row.platform!,
      device_id: row.device_id ?? null,
      last_seen_at: row.last_seen_at!,
      created_at:
        existingIndex >= 0
          ? this.rows[existingIndex].created_at
          : "2026-05-02T00:00:00.000Z",
      updated_at: row.updated_at!,
    };

    if (existingIndex >= 0) {
      this.rows[existingIndex] = saved;
    } else {
      this.rows.push(saved);
    }

    return { data: saved, error: null };
  }

  delete() {
    this.mode = "delete";
    this.deleteFilters = {};
    return this;
  }

  eq(column: string, value: string) {
    if (this.mode === "query") {
      this.queryFilters[column] = value;
    } else {
      this.deleteFilters[column] = value;
    }
    return this;
  }

  order() {
    return this;
  }

  private executeQuery() {
    const data = this.rows.filter((row) =>
      Object.entries(this.queryFilters).every(
        ([column, value]) =>
          row[column as keyof NotificationTokenRow] === value,
      ),
    );
    return { data, error: null };
  }

  async executeDelete() {
    const before = this.rows.length;
    this.rows = this.rows.filter((row) =>
      Object.entries(this.deleteFilters).some(
        ([column, value]) =>
          row[column as keyof NotificationTokenRow] !== value,
      ),
    );
    return { count: before - this.rows.length, error: null };
  }

  then<TResult1 = { count: number; error: null }, TResult2 = never>(
    onfulfilled?:
      | ((
          value:
            | { count: number; error: null }
            | { data: NotificationTokenRow[]; error: null },
        ) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    const result =
      this.mode === "query" ? this.executeQuery() : this.executeDelete();
    return Promise.resolve(result).then(onfulfilled, onrejected);
  }
}

class FakeDb {
  readonly tokenTable = new FakeNotificationTokenTable();

  from(table: string) {
    assert.equal(table, "notification_tokens");
    return this.tokenTable;
  }
}

describe("NotificationsService", () => {
  it("upserts the authenticated user's Android FCM token", async () => {
    const db = new FakeDb();
    const service = new NotificationsService({
      getDb: () => db as never,
      getOrgId: () => "22222222-2222-2222-2222-222222222222",
      now: () => new Date("2026-05-02T12:00:00.000Z"),
    });

    const first = await service.registerToken("user-1", {
      token: "android-token",
      platform: "android",
      device_id: "device-1",
    });
    const second = await service.registerToken("user-1", {
      token: "android-token",
      platform: "android",
      device_id: "device-1",
    });

    assert.equal(db.tokenTable.rows.length, 1);
    assert.equal(first.id, second.id);
    assert.deepEqual(second, {
      id: "11111111-1111-1111-1111-111111111111",
      organization_id: "22222222-2222-2222-2222-222222222222",
      user_id: "user-1",
      token: "android-token",
      platform: "android",
      device_id: "device-1",
      last_seen_at: "2026-05-02T12:00:00.000Z",
      created_at: "2026-05-02T00:00:00.000Z",
      updated_at: "2026-05-02T12:00:00.000Z",
    });
  });

  it("removes only the authenticated user's matching Android token", async () => {
    const db = new FakeDb();
    db.tokenTable.rows = [
      {
        id: "token-1",
        organization_id: "22222222-2222-2222-2222-222222222222",
        user_id: "user-1",
        token: "android-token",
        platform: "android",
        device_id: "device-1",
        last_seen_at: "2026-05-02T12:00:00.000Z",
        created_at: "2026-05-02T00:00:00.000Z",
        updated_at: "2026-05-02T12:00:00.000Z",
      },
      {
        id: "token-2",
        organization_id: "22222222-2222-2222-2222-222222222222",
        user_id: "user-2",
        token: "android-token",
        platform: "android",
        device_id: "device-2",
        last_seen_at: "2026-05-02T12:00:00.000Z",
        created_at: "2026-05-02T00:00:00.000Z",
        updated_at: "2026-05-02T12:00:00.000Z",
      },
    ];
    const service = new NotificationsService({
      getDb: () => db as never,
      getOrgId: () => "22222222-2222-2222-2222-222222222222",
      now: () => new Date("2026-05-02T12:00:00.000Z"),
    });

    await service.unregisterToken("user-1", "android-token");

    assert.deepEqual(
      db.tokenTable.rows.map((row) => row.id),
      ["token-2"],
    );
  });

  it("sends a multicast notification to the user's Android tokens", async () => {
    const db = new FakeDb();
    db.tokenTable.rows = [
      {
        id: "token-1",
        organization_id: "22222222-2222-2222-2222-222222222222",
        user_id: "user-1",
        token: "android-token-1",
        platform: "android",
        device_id: "device-1",
        last_seen_at: "2026-05-02T12:00:00.000Z",
        created_at: "2026-05-02T00:00:00.000Z",
        updated_at: "2026-05-02T12:00:00.000Z",
      },
      {
        id: "token-2",
        organization_id: "22222222-2222-2222-2222-222222222222",
        user_id: "user-1",
        token: "android-token-2",
        platform: "android",
        device_id: "device-2",
        last_seen_at: "2026-05-02T12:00:00.000Z",
        created_at: "2026-05-02T00:00:00.000Z",
        updated_at: "2026-05-02T12:00:00.000Z",
      },
    ];
    const sentMessages: unknown[] = [];
    const service = new NotificationsService({
      getDb: () => db as never,
      getOrgId: () => "22222222-2222-2222-2222-222222222222",
      messaging: {
        sendEachForMulticast: async (message: unknown) => {
          sentMessages.push(message);
          return { successCount: 2, failureCount: 0, responses: [] };
        },
      },
    });

    const result = await service.sendToUser("user-1", {
      title: "Health follow-up",
      body: "Cow A12 has a vaccine due today",
      data: { screen: "alerts" },
    });

    assert.deepEqual(result, { successCount: 2, failureCount: 0 });
    assert.deepEqual(sentMessages, [
      {
        tokens: ["android-token-1", "android-token-2"],
        notification: {
          title: "Health follow-up",
          body: "Cow A12 has a vaccine due today",
        },
        data: { screen: "alerts" },
        android: {
          priority: "high",
          notification: {
            channelId: "high_importance_channel",
          },
        },
      },
    ]);
  });
});
