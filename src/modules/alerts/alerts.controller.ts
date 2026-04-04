import { Request, Response, NextFunction } from "express";
import { alertsService } from "./alerts.service";

export const getAlerts = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const alerts = await alertsService.getAlerts();

    res.json(alerts);
  } catch (err) {
    next(err);
  }
};
