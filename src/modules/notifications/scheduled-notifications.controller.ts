import { NextFunction, Request, Response } from "express";
import { scheduledNotificationsService } from "./scheduled-notifications.service";

const isAuthorizedCronRequest = (req: Request): boolean => {
  const cronSecret = process.env["CRON_SECRET"];
  if (!cronSecret) return false;

  return req.headers.authorization === `Bearer ${cronSecret}`;
};

export const sendDailyFarmAlerts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!isAuthorizedCronRequest(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const summary = await scheduledNotificationsService.sendDailyFarmAlerts();

    res.json({ status: "ok", summary });
  } catch (err) {
    next(err);
  }
};
