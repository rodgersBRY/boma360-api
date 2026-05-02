import { Router } from "express";
import { validate } from "../../middleware/validate";
import {
  registerNotificationToken,
  sendTestNotification,
  unregisterNotificationToken,
} from "./notifications.controller";
import {
  registerNotificationTokenSchema,
  sendTestNotificationSchema,
  unregisterNotificationTokenSchema,
} from "./notifications.schema";

export const notificationsRouter = Router();

notificationsRouter
  .route("/tokens")
  .post(validate(registerNotificationTokenSchema), registerNotificationToken)
  .delete(
    validate(unregisterNotificationTokenSchema),
    unregisterNotificationToken,
  );

notificationsRouter.post(
  "/test",
  validate(sendTestNotificationSchema),
  sendTestNotification,
);
