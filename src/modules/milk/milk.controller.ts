import { Request, Response, NextFunction } from 'express';
import { milkService } from './milk.service';

export const createMilkLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const log = await milkService.createLog(req.params['cowId'] as string, req.body);
    res.status(201).json(log);
  } catch (err) { next(err); }
};

export const listMilkLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const logs = await milkService.getLogsByCow(req.params['cowId'] as string);
    res.json(logs);
  } catch (err) { next(err); }
};

export const updateMilkLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const log = await milkService.updateLog(req.params['cowId'] as string, req.params['id'] as string, req.body);
    res.json(log);
  } catch (err) { next(err); }
};
