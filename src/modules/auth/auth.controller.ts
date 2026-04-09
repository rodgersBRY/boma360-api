import { NextFunction, Request, Response } from 'express';
import { authService } from './auth.service';

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await authService.signUp(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const signIn = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await authService.signIn(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const refreshSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await authService.refreshSession(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await authService.getMe(req.accessToken);
    res.json({ user });
  } catch (err) {
    next(err);
  }
};
