import { Router } from "express";
import { sendDailyFarmAlerts } from "./scheduled-notifications.controller";

export const scheduledNotificationsRouter = Router();

scheduledNotificationsRouter.get("/daily-alerts", sendDailyFarmAlerts);
