import { NextFunction, Request, Response } from "express";
import { notificationsService } from "./notifications.service";

export const registerNotificationToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = await notificationsService.registerToken(
      req.authUser!.id,
      req.body,
    );

    res.status(201).json({ token });
  } catch (err) {
    next(err);
  }
};

export const unregisterNotificationToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await notificationsService.unregisterToken(req.authUser!.id, req.body.token);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const sendTestNotification = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await notificationsService.sendToUser(
      req.authUser!.id,
      req.body,
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
};
