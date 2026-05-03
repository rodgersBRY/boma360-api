# Notifications Module

Android-only Firebase Cloud Messaging support for the mobile app.

## Endpoints

| Method   | Path                             | Description                                                                          |
| -------- | -------------------------------- | ------------------------------------------------------------------------------------ |
| `POST`   | `/v1/notifications/tokens`       | Register or refresh the authenticated user's Android FCM token                       |
| `DELETE` | `/v1/notifications/tokens`       | Remove the authenticated user's Android FCM token                                    |
| `POST`   | `/v1/notifications/test`         | Send a test push notification to the authenticated user's registered Android devices |
| `GET`    | `/v1/notifications/daily-alerts` | Cron-only endpoint that sends daily farm attention notifications                     |

Token and test endpoints are protected and require `Authorization: Bearer <access_token>`.

The daily alerts endpoint is protected by `Authorization: Bearer <CRON_SECRET>` because it is called by Vercel Cron rather than a signed-in user.

## Register Token

```http
POST /v1/notifications/tokens
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "token": "<fcm-token>",
  "platform": "android",
  "device_id": "optional-device-id"
}
```

Response:

```json
{
  "token": {
    "id": "uuid",
    "organization_id": "uuid",
    "user_id": "uuid",
    "token": "<fcm-token>",
    "platform": "android",
    "device_id": "optional-device-id",
    "last_seen_at": "2026-05-02T12:00:00.000Z",
    "created_at": "2026-05-02T12:00:00.000Z",
    "updated_at": "2026-05-02T12:00:00.000Z"
  }
}
```

## Unregister Token

```http
DELETE /v1/notifications/tokens
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "token": "<fcm-token>"
}
```

Response: `204 No Content`

## Send Test Notification

```http
POST /v1/notifications/test
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Health follow-up",
  "body": "Cow A12 has a vaccine due today",
  "data": {
    "screen": "alerts"
  }
}
```

Response:

```json
{
  "successCount": 1,
  "failureCount": 0
}
```

## Event Helper

Use `notificationEventsService` from other API modules so each module does not need to hand-build FCM titles, body text, or routing data.

```ts
import { notificationEventsService } from "../notifications/notification-events.service";
```

Example from a controller after the main write succeeds:

```ts
const record = await healthService.createHealthRecord(
  req.params.cowId,
  req.body,
);

await notificationEventsService.notifyHealthFollowUpDue(req.authUser!.id, {
  cowId: record.cow_id,
  tagNumber: cow.tag_number,
  recordId: record.id,
  description: record.description,
  nextDueDate: record.next_due_date!,
});

res.status(201).json(record);
```

The helper methods are best-effort: if Firebase sending fails, they log the error and return `null` rather than failing the primary module operation.

Available helpers:

- `notifyHealthFollowUpDue(userId, event)`
- `notifyCalvingDue(userId, event)`
- `notifyMissingMilkLogs(userId, event)`
- `notifyMilkSaleRecorded(userId, event)`

All helpers currently send to the authenticated user's registered Android devices through `notificationsService.sendToUser`.

## Module Triggers

The existing API modules call `moduleNotificationsService` after successful writes:

- Health records: sends `notifyHealthFollowUpDue` when `next_due_date` is today or overdue.
- Breeding records: sends `notifyCalvingDue` when `expected_calving_date` is today or overdue.
- Milk sales: sends `notifyMilkSaleRecorded` after a sale is created.

## Daily Scheduled Alerts

`scheduledNotificationsService.sendDailyFarmAlerts()` powers:

```http
GET /v1/notifications/daily-alerts
Authorization: Bearer <CRON_SECRET>
```

It finds users with registered Android tokens, computes due alerts per organization, and sends:

- Health follow-ups due.
- Calving due.
- A missing milk logs summary when active cows have no milk entry for the day.

`vercel.json` schedules this endpoint at `0 15 * * *` UTC, which is 18:00 in Africa/Nairobi.

## Database

The `notification_tokens` table is created by `migrations/004_notification_tokens.sql`.

Key fields:

- `organization_id`: Farm/account scope.
- `user_id`: Supabase auth user that owns the token.
- `token`: Unique FCM registration token.
- `platform`: Currently restricted to `android`.
- `device_id`: Optional client-provided device identifier.
- `last_seen_at`: Updated whenever the app registers or refreshes the token.

## Firebase Configuration

Notification sends require these environment variables:

```env
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
CRON_SECRET=generate-a-long-random-secret
```
